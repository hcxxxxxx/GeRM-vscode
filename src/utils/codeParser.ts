import * as path from 'path';
import * as fs from 'fs';

export class CodeParser {
  // 支持的文件类型及其对应的语言
  private static SUPPORTED_EXTENSIONS: Record<string, string> = {
    '.py': 'Python',
    '.js': 'JavaScript',
    '.ts': 'TypeScript',
    '.jsx': 'React',
    '.tsx': 'React TypeScript',
    '.html': 'HTML',
    '.css': 'CSS',
    '.scss': 'SCSS',
    '.java': 'Java',
    '.kt': 'Kotlin',
    '.cpp': 'C++',
    '.c': 'C',
    '.h': 'C/C++ Header',
    '.go': 'Go',
    '.rs': 'Rust',
    '.rb': 'Ruby',
    '.php': 'PHP',
    '.swift': 'Swift',
    '.m': 'Objective-C',
    '.cs': 'C#',
    '.sh': 'Shell',
    '.md': 'Markdown',
    '.json': 'JSON',
    '.yaml': 'YAML',
    '.yml': 'YAML',
    '.xml': 'XML',
    '.sql': 'SQL',
  };
  
  // 需要忽略的目录
  private static IGNORED_DIRS: Set<string> = new Set([
    'node_modules', 'venv', '.git', '.github', '__pycache__',
    'build', 'dist', '.idea', '.vscode', 'target', 'bin'
  ]);
  
  // 需要忽略的文件
  private static IGNORED_FILES: Set<string> = new Set([
    '.DS_Store', '.gitignore', '.env', '.gitattributes'
  ]);
  
  static identifyLanguage(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    return this.SUPPORTED_EXTENSIONS[ext] || 'Unknown';
  }
  
  static shouldIgnore(filePath: string): boolean {
    const parts = filePath.split(path.sep);
    const filename = path.basename(filePath);
    
    // 检查是否在忽略的目录中
    for (const part of parts) {
      if (this.IGNORED_DIRS.has(part)) {
        return true;
      }
    }
    
    // 检查是否是忽略的文件
    if (this.IGNORED_FILES.has(filename)) {
      return true;
    }
    
    return false;
  }
  
  static parseImports(content: string, language: string): string[] {
    const imports: string[] = [];
    
    // 根据不同语言解析导入
    if (language === 'Python') {
      // 简单的Python导入解析
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('import ') || trimmedLine.startsWith('from ')) {
          imports.push(trimmedLine);
        }
      }
    }
    // 可以添加其他语言的导入解析...
    
    return imports;
  }
  
  static extractComments(content: string, language: string): string[] {
    const comments: string[] = [];
    
    // 根据不同语言提取注释
    if (language === 'Python') {
      // 简单的Python注释提取
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('#')) {
          comments.push(trimmedLine);
        }
      }
    }
    // 可以添加其他语言的注释提取...
    
    return comments;
  }
  
  static identifyDependencies(repoPath: string): Record<string, any> {
    const dependencies: Record<string, any> = {};
    
    // 检查Python依赖
    const reqFiles = ['requirements.txt', 'Pipfile', 'pyproject.toml'];
    for (const reqFile of reqFiles) {
      const reqPath = path.join(repoPath, reqFile);
      if (fs.existsSync(reqPath)) {
        dependencies[reqFile] = fs.readFileSync(reqPath, 'utf-8');
      }
    }
    
    // 检查JavaScript依赖
    const packageJsonPath = path.join(repoPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        if (packageData.dependencies) {
          dependencies['package.json:dependencies'] = packageData.dependencies;
        }
        if (packageData.devDependencies) {
          dependencies['package.json:devDependencies'] = packageData.devDependencies;
        }
      } catch (error) {
        console.error('解析package.json失败:', error);
      }
    }
    
    return dependencies;
  }
}