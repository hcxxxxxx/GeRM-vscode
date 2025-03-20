import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

class GeRMViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'germSidebar';
  
  constructor(private readonly _extensionUri: vscode.Uri) {}
  
  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };
    
    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    
    // 处理来自Webview的消息
    webviewView.webview.onDidReceiveMessage(async message => {
      if (message.command === 'generateReadme') {
        vscode.commands.executeCommand('germ.generateReadme');
      }
    });
  }
  
  private _getHtmlForWebview(webview: vscode.Webview): string {
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'sidebar.css')
    );
    
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'sidebar.js')
    );
    
    const logoUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'logo.svg')
    );
    
    return `<!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="${styleUri}">
      <title>GeRM</title>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <img src="${logoUri}" alt="GeRM Logo">
          <h2>GeRM</h2>
        </div>
        <p class="description">使用LLM Agent自动生成高质量README文档</p>
        
        <button class="button generate-button" id="generateBtn">
          <span class="button-icon">📝</span>
          生成README
        </button>
        
        <div class="section">
          <h3>主要功能</h3>
          <ul>
            <li>自动解析代码仓库结构</li>
            <li>提取关键文件和依赖</li>
            <li>生成专业的README文档</li>
            <li>支持自定义设置</li>
          </ul>
        </div>
        
        <div class="footer">
          <a href="https://github.com/hcxxxxxx/GeRM" class="link">GitHub仓库</a>
        </div>
      </div>
      
      <script src="${scriptUri}"></script>
    </body>
    </html>`;
  }
}

export function activate(context: vscode.ExtensionContext) {
  const provider = new GeRMViewProvider(context.extensionUri);
  
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      GeRMViewProvider.viewType, 
      provider, 
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );
}