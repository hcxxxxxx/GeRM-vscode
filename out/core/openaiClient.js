"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIClient = void 0;
const vscode = require("vscode");
const axios_1 = require("axios");
class OpenAIClient {
    constructor() {
        // 从VS Code配置中获取设置
        const config = vscode.workspace.getConfiguration('germ');
        this.apiKey = config.get('openaiApiKey') || process.env.OPENAI_API_KEY || '';
        this.model = config.get('openaiModel') || 'gpt-4o-mini';
        this.maxTokens = config.get('maxTokens') || 4096;
        this.temperature = config.get('temperature') || 0.7;
        this.baseUrl = config.get('base_url') || 'https://api.openai.com';
        if (!this.apiKey) {
            throw new Error('未配置OpenAI API密钥');
        }
    }
    async chatCompletion(systemPrompt, userPrompt, temperature, maxTokens) {
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/v1/chat/completions`, {
                model: this.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: temperature || this.temperature,
                max_tokens: maxTokens || this.maxTokens
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            return response.data.choices[0].message.content;
        }
        catch (error) {
            console.error('OpenAI API调用失败:', error);
            throw new Error(`OpenAI API调用失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
exports.OpenAIClient = OpenAIClient;
//# sourceMappingURL=openaiClient.js.map