"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeAnalyzer = void 0;
const path = require("path");
const fs = require("fs");
const agent_1 = require("./agent");
const codeParser_1 = require("../utils/codeParser");
const fileHandler_1 = require("../utils/fileHandler");
class CodeAnalyzer {
    constructor(repoPath) {
        this.repoPath = repoPath;
        this.agent = new agent_1.ReadmeAgent();
    }
    async analyze() {
        console.log(`开始分析仓库: ${this.repoPath}`);
        // 收集仓库信息
        const analysisResult = {
            repo_name: path.basename(this.repoPath),
            repo_path: this.repoPath,
            languages: new Set(),
            structure: fileHandler_1.FileHandler.getRepoStructure(this.repoPath, codeParser_1.CodeParser.shouldIgnore),
            key_files: {},
            files_analysis: {},
            dependencies: {}
        };
        // 获取所有文件
        const allFiles = fileHandler_1.FileHandler.listFiles(this.repoPath, codeParser_1.CodeParser.shouldIgnore);
        // 分析关键文件
        await this._analyzeKeyFiles(allFiles, analysisResult);
        // 分析代表性文件
        await this._analyzeRepresentativeFiles(allFiles, analysisResult);
        // 识别依赖
        analysisResult.dependencies = codeParser_1.CodeParser.identifyDependencies(this.repoPath);
        // 将语言集合转换为数组
        analysisResult.languages = Array.from(analysisResult.languages);
        return analysisResult;
    }
    async _analyzeKeyFiles(allFiles, analysisResult) {
        // 查找和分析关键文件
        for (const filePath of allFiles) {
            const fileName = path.basename(filePath);
            if (CodeAnalyzer.KEY_FILES.has(fileName)) {
                try {
                    // 读取文件内容
                    const content = await fileHandler_1.FileHandler.readFile(filePath);
                    // 将关键文件内容存储到分析结果中
                    analysisResult.key_files[fileName] = content;
                    // 如果不是二进制文件，进行内容分析
                    if (content && !content.startsWith('[无法读取文件内容')) {
                        const language = codeParser_1.CodeParser.identifyLanguage(filePath);
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
                }
                catch (error) {
                    console.error(`分析关键文件 ${filePath} 失败:`, error);
                }
            }
        }
    }
    async _analyzeRepresentativeFiles(allFiles, analysisResult) {
        // 收集每种语言的文件
        const filesByLanguage = new Map();
        for (const filePath of allFiles) {
            // 跳过已分析的关键文件
            if (analysisResult.files_analysis[filePath]) {
                continue;
            }
            const language = codeParser_1.CodeParser.identifyLanguage(filePath);
            if (language !== 'Unknown') {
                analysisResult.languages.add(language);
                if (!filesByLanguage.has(language)) {
                    filesByLanguage.set(language, []);
                }
                filesByLanguage.get(language).push(filePath);
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
                if (filesRemaining <= 0)
                    break;
                try {
                    const content = await fileHandler_1.FileHandler.readFile(filePath);
                    if (content && !content.startsWith('[无法读取文件内容')) {
                        analysisResult.files_analysis[filePath] = {
                            language: language,
                            size: fs.statSync(filePath).size,
                            analysis: await this.agent.analyzeCodeFile(filePath, content)
                        };
                        filesRemaining--;
                    }
                }
                catch (error) {
                    console.error(`分析文件 ${filePath} 失败:`, error);
                }
                if (filesRemaining <= 0)
                    break;
            }
        }
    }
}
exports.CodeAnalyzer = CodeAnalyzer;
// 关键文件名，用于优先分析
CodeAnalyzer.KEY_FILES = new Set([
    'README.md', 'package.json', 'setup.py', 'requirements.txt',
    'Pipfile', 'pyproject.toml', 'Makefile', 'Dockerfile',
    'docker-compose.yml', '.gitignore', 'LICENSE', 'CONTRIBUTING.md'
]);
// 分析的最大文件数
CodeAnalyzer.MAX_FILES_TO_ANALYZE = 20;
//# sourceMappingURL=codeAnalyzer.js.map