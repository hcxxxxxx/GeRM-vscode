import * as vscode from 'vscode';
import axios from 'axios';

export class OpenAIClient {
  private apiKey: string;
  private model: string;
  private maxTokens: number;
  private temperature: number;
  
  constructor() {
    // 从VS Code配置中获取设置
    const config = vscode.workspace.getConfiguration('germ');
    this.apiKey = config.get('openaiApiKey') || process.env.OPENAI_API_KEY || '';
    this.model = config.get('openaiModel') || 'gpt-4o-mini';
    this.maxTokens = config.get('maxTokens') || 4096;
    this.temperature = config.get('temperature') || 0.7;
    
    if (!this.apiKey) {
      throw new Error('未配置OpenAI API密钥');
    }
  }
  
  async chatCompletion(
    systemPrompt: string, 
    userPrompt: string, 
    temperature?: number,
    maxTokens?: number
  ): Promise<string> {
    try {
      const response = await axios.post(
        'https://api.gptsapi.net/v1/chat/completions',
        {
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: temperature || this.temperature,
          max_tokens: maxTokens || this.maxTokens
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
      
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API调用失败:', error);
      throw new Error(`OpenAI API调用失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}