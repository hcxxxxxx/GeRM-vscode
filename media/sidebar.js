// 获取与VS Code通讯的对象
const vscode = acquireVsCodeApi();

document.addEventListener('DOMContentLoaded', () => {
  // 为生成按钮添加点击事件
  const generateBtn = document.getElementById('generateBtn');
  if (generateBtn) {
    generateBtn.addEventListener('click', () => {
      vscode.postMessage({
        command: 'generateReadme'
      });
    });
  }
});