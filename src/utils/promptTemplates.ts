export class PromptTemplates {
    static getReadmeGenerationPrompt(repoAnalysis: any): string {
      // 将仓库分析结果转换为JSON字符串
      const repoJson = JSON.stringify(repoAnalysis, null, 2);
      
      return `请根据以下代码仓库的分析结果，生成一个专业的README.md文件。
  
  仓库分析结果:
  \`\`\`json
  ${repoJson}
  \`\`\`
  
  生成README时，请考虑以下要点:
  - 开始用一个简短清晰的项目描述
  - 列出主要特性和功能
  - 包含安装说明
  - 提供使用示例和API文档（如果适用）
  - 解释项目架构和主要组件
  - 包含技术栈信息
  - 添加贡献指南（如果适用）
  - 添加许可证信息（如果找到）
  - 使用Markdown格式，包括标题、列表、代码块等
  - 确保README清晰、专业、易于阅读
  
  请直接生成完整的README.md内容，使用Markdown格式，不需要额外的解释。`;
    }
    
    static getFileAnalysisPrompt(filePath: string, fileContent: string): string {
      // 限制内容长度
      const limitedContent = fileContent.length > 10000 
        ? fileContent.substring(0, 10000) + "..." 
        : fileContent;
      
      return `请分析以下代码文件，提取关键信息并以JSON格式返回结果：
      
  文件路径: ${filePath}
  
  文件内容:
  \`\`\`
  ${limitedContent}
  \`\`\`
  
  请提取以下信息并以JSON格式返回：
  - 文件的主要目的和功能
  - 主要类、函数或组件
  - 依赖关系
  - 核心逻辑
  - 配置信息（如果有）
  - 代码质量评估
  
  JSON格式示例:
  \`\`\`json
  {
      "purpose": "文件的主要目的",
      "components": ["主要类或函数1", "主要类或函数2"],
      "dependencies": ["依赖1", "依赖2"],
      "logic": "核心逻辑概述",
      "configuration": "配置信息",
      "quality": "代码质量评估"
  }
  \`\`\`
  
  请确保返回有效的JSON格式。`;
    }
  }