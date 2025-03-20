"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadmeAgent = void 0;
const openaiClient_1 = require("./openaiClient");
const promptTemplates_1 = require("../utils/promptTemplates");
class ReadmeAgent {
    constructor() {
        this.openaiClient = new openaiClient_1.OpenAIClient();
        this.systemPrompt = "你是一个专业的README文档生成器。你的任务是分析代码仓库，并生成一个全面、专业的README.md文件。关注项目的主要功能、安装步骤、使用方法、技术栈和架构。确保README清晰、结构良好并提供足够的细节帮助用户理解和使用项目。";
    }
    async generateReadme(repoAnalysis) {
        console.log('开始生成README内容');
        // 构建用户提示词
        const userPrompt = promptTemplates_1.PromptTemplates.getReadmeGenerationPrompt(repoAnalysis);
        try {
            // 调用OpenAI API生成README
            const readmeContent = await this.openaiClient.chatCompletion(this.systemPrompt, userPrompt);
            // 处理返回的Markdown格式
            return this.formatMarkdown(readmeContent);
        }
        catch (error) {
            console.error('生成README内容失败:', error);
            throw new Error(`生成README内容失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async analyzeCodeFile(filePath, fileContent) {
        console.log(`分析代码文件: ${filePath}`);
        // 构建文件分析提示词
        const userPrompt = promptTemplates_1.PromptTemplates.getFileAnalysisPrompt(filePath, fileContent);
        try {
            // 调用OpenAI API分析文件
            const analysisResult = await this.openaiClient.chatCompletion("你是一个代码分析专家，请分析以下代码文件并提取关键信息。", userPrompt, 0.3 // 降低温度以获得更精确的分析
            );
            // 解析JSON结果
            try {
                return JSON.parse(analysisResult);
            }
            catch (e) {
                // 如果不是有效的JSON，返回纯文本摘要
                return { summary: analysisResult };
            }
        }
        catch (error) {
            console.error('分析代码文件失败:', error);
            return { error: String(error) };
        }
    }
    formatMarkdown(content) {
        // 去掉可能的```markdown和```标记
        let formatted = content;
        if (formatted.startsWith("```markdown")) {
            formatted = formatted.replace("```markdown", "").trim();
        }
        else if (formatted.startsWith("```")) {
            formatted = formatted.replace("```", "").trim();
        }
        if (formatted.endsWith("```")) {
            formatted = formatted.substring(0, formatted.lastIndexOf("```")).trim();
        }
        return formatted;
    }
}
exports.ReadmeAgent = ReadmeAgent;
//# sourceMappingURL=agent.js.map