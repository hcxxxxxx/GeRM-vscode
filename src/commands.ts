import * as vscode from 'vscode';
import * as path from 'path';
import { TextEncoder } from 'util';
import { CodeAnalyzer } from './core/codeAnalyzer';
import { ReadmeGenerator } from './core/readmeGenerator';

export function registerCommands(context: vscode.ExtensionContext) {
  // 注册生成README命令
  const generateReadmeCommand = vscode.commands.registerCommand('germ.generateReadme', async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showErrorMessage('请先打开一个项目文件夹');
      return;
    }
    
    // 获取当前工作区路径
    const workspacePath = workspaceFolders[0].uri.fsPath;
    
    try {
      vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "GeRM: 正在生成README",
        cancellable: false
      }, async (progress) => {
        progress.report({ message: "分析代码仓库..." });
        
        // 分析代码仓库
        const codeAnalyzer = new CodeAnalyzer(workspacePath);
        const repoAnalysis = await codeAnalyzer.analyze();
        
        progress.report({ message: "生成README内容...", increment: 33 });
        
        // 生成README
        const readmeGenerator = new ReadmeGenerator();
        const readmeContent = await readmeGenerator.generate(repoAnalysis);
        
        progress.report({ message: "保存README文件...", increment: 33 });
        
        // 创建或更新README.md文件
        const readmePath = path.join(workspacePath, 'README.md');
        const readmeUri = vscode.Uri.file(readmePath);
        
        try {
          await vscode.workspace.fs.stat(readmeUri);
          // 如果README存在，询问是否覆盖
          const answer = await vscode.window.showWarningMessage(
            'README.md已存在，是否覆盖?', 
            { modal: true },
            '覆盖', '取消'
          );
          
          if (answer !== '覆盖') {
            vscode.window.showInformationMessage('README生成已取消');
            return;
          }
        } catch (err) {
          // README不存在，继续创建
        }
        
        // 写入README文件
        const encoder = new TextEncoder();
        await vscode.workspace.fs.writeFile(readmeUri, encoder.encode(readmeContent));
        
        // 打开README文件
        const document = await vscode.workspace.openTextDocument(readmeUri);
        await vscode.window.showTextDocument(document);
        
        vscode.window.showInformationMessage('README生成成功!');
      });
    } catch (err) {
      vscode.window.showErrorMessage(`README生成失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  });
  
  context.subscriptions.push(generateReadmeCommand);
}