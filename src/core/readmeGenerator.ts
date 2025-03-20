import { ReadmeAgent } from './agent';

export class ReadmeGenerator {
  private agent: ReadmeAgent;
  
  constructor() {
    this.agent = new ReadmeAgent();
  }
  
  async generate(repoAnalysis: any): Promise<string> {
    console.log('开始生成README内容');
    
    try {
      // 预处理分析结果
      const processedAnalysis = this._preprocessAnalysis(repoAnalysis);
      
      // 使用Agent生成README
      const readmeContent = await this.agent.generateReadme(processedAnalysis);
      
      console.log('README生成成功');
      return readmeContent;
    } catch (error) {
      console.error('生成README失败:', error);
      throw new Error(`生成README失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  private _preprocessAnalysis(repoAnalysis: any): any {
    const processed = { ...repoAnalysis };
    
    // 如果languages是集合，转换为列表
    if (processed.languages instanceof Set) {
      processed.languages = Array.from(processed.languages);
    }
    
    // 提取最重要的文件分析结果
    if (processed.files_analysis) {
      const importantFiles: Record<string, any> = {};
      for (const [path, analysis] of Object.entries<any>(processed.files_analysis)) {
        // 只保留分析结果，不包含文件内容
        importantFiles[path] = {
          language: analysis.language || 'Unknown',
          summary: analysis.analysis?.purpose || ''
        };
      }
      processed.important_files = importantFiles;
    }
    
    // 确保仓库名称存在
    if (!processed.repo_name) {
      processed.repo_name = 'Unknown Project';
    }
    
    return processed;
  }
}