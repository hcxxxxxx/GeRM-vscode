import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ReadmeAgent } from './agent';
import { CodeParser } from '../utils/codeParser';
import { FileHandler } from '../utils/fileHandler';

export class CodeAnalyzer {
  private repoPath: string;
  private agent: ReadmeAgent;
  
  // 关键文件名，用于优先分析
  private static KEY_FILES = new Set([
    'README.md', 'package.json', 'setup.py', 'requirements.txt',
    'Pipfile', 'pyproject.toml', 'Makefile', 'Dockerfile',
    'docker-compose.yml', '.gitignore', 'LICENSE', 'CONTRIBUTING.md'
  ]);
  
  // 分析的最大文件数
  private static MAX_FILES_TO_ANALYZE = 20;
  
  constructor(repoPath: string) {
    this.repoPath = repoPath;
    this.agent = new ReadmeAgent();
  }
  
  async analyze(): Promise<any> {
    console.log(`开始分析仓库: ${this.repoPath}`);
    
    // 收集仓库信息
    const analysisResult: any = {
      repo_name: path.basename(this.repoPath),
      repo_path: this.repoPath,
      languages: new Set<string>(),
      structure: FileHandler.getRepoStructure(this.repoPath, CodeParser.shouldIgnore),
      key_files: {},
      files_analysis: {},
      dependencies: {}
    };
    
    // 获取所有文件
    const allFiles = FileHandler.listFiles(this.repoPath, CodeParser.shouldIgnore);
    
    // 分析关键文件
    await this._analyzeKeyFiles(allFiles, analysisResult);
    
    // 分析代表性文件
    await this._analyzeRepresentativeFiles(allFiles, analysisResult);
    
    // 识别依赖
    analysisResult.dependencies = CodeParser.identifyDependencies(this.repoPath);
    
    // 将语言集合转换为数组
    analysisResult.languages = Array.from(analysisResult.languages);
    
    return analysisResult;
  }
  
  private async _analyzeKeyFiles(allFiles: string[], analysisResult: any): Promise<void> {
    // 查找和分析关键文件
    for (const filePath of allFiles) {
      const fileName = path.basename(filePath);
      
      if (CodeAnalyzer.KEY_FILES.has(fileName)) {
        try {
          // 读取文件内容
          const content = await FileHandler.readFile(filePath);
          
          // 将关键文件内容存储到分析结果中
          analysisResult.key_files[fileName] = content;
          
          // 如果不是二进制文件，进行内容分析
          if (content && !content.startsWith('[无法读取文件内容')) {
            const language = CodeParser.identifyLanguage(filePath);
            if (language !== 'Unknown') {
              analysisResult.languages.add(language);
            }
            
            // 添加文件分析
            analysisResult.files_analysis[filePath] = {
              language: language,
              size: fs.statSync(filePath).size,
              analysis: await this.agent.analyzeCodeFile(filePath, content)
            };
          }
        } catch (error) {
          console.error(`分析关键文件 ${filePath} 失败:`, error);
        }
      }
    }
  }
  
  private async _analyzeRepresentativeFiles(allFiles: string[], analysisResult: any): Promise<void> {
    // 收集每种语言的文件
    const filesByLanguage: Map<string, string[]> = new Map();
    
    for (const filePath of allFiles) {
      // 跳过已分析的关键文件
      if (analysisResult.files_analysis[filePath]) {
        continue;
      }
      
      const language = CodeParser.identifyLanguage(filePath);
      if (language !== 'Unknown') {
        analysisResult.languages.add(language);
        
        if (!filesByLanguage.has(language)) {
          filesByLanguage.set(language, []);
        }
        filesByLanguage.get(language)!.push(filePath);
      }
    }
    // 从每种语言中选择代表性文件进行分析
    let filesRemaining = CodeAnalyzer.MAX_FILES_TO_ANALYZE - Object.keys(analysisResult.files_analysis).length;
    
    for (const [language, files] of filesByLanguage.entries()) {
      // 按文件大小排序，选择中等大小的文件（可能更具代表性）
      files.sort((a, b) => fs.statSync(a).size - fs.statSync(b).size);
      
      // 从每种语言中选择一个或多个文件
      const filesToAnalyze = files.length > 3 
        ? [files[Math.floor(files.length / 3)], files[Math.floor(2 * files.length / 3)]]
        : [files[0]];
      
      for (const filePath of filesToAnalyze) {
        if (filesRemaining <= 0) break;
        
        try {
          const content = await FileHandler.readFile(filePath);
          if (content && !content.startsWith('[无法读取文件内容')) {
            analysisResult.files_analysis[filePath] = {
              language: language,
              size: fs.statSync(filePath).size,
              analysis: await this.agent.analyzeCodeFile(filePath, content)
            };
            filesRemaining--;
          }
        } catch (error) {
          console.error(`分析文件 ${filePath} 失败:`, error);
        }
        
        if (filesRemaining <= 0) break;
      }
    }
  }
}