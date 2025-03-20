import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
  // 创建状态栏项
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.text = "$(markdown) GeRM";
  statusBarItem.tooltip = "使用GeRM生成README";
  statusBarItem.command = "germ.generateReadme";
  statusBarItem.show();
  
  context.subscriptions.push(statusBarItem);
}