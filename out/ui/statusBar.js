"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = require("vscode");
let statusBarItem;
function activate(context) {
    // 创建状态栏项
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = "$(markdown) GeRM";
    statusBarItem.tooltip = "使用GeRM生成README";
    statusBarItem.command = "germ.generateReadme";
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
}
exports.activate = activate;
//# sourceMappingURL=statusBar.js.map