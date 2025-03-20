// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { activate as activateSidebar } from './ui/sidebar';
import { activate as activateStatusBar } from './ui/statusBar';
import { registerCommands } from './commands';

export function activate(context: vscode.ExtensionContext) {
  console.log('GeRM 扩展已激活');

  // 初始化UI组件
  activateSidebar(context);
  activateStatusBar(context);
  
  // 注册命令
  registerCommands(context);
}

export function deactivate() {
  console.log('GeRM 扩展已停用');
}
