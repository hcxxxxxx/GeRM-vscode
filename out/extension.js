"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const sidebar_1 = require("./ui/sidebar");
const statusBar_1 = require("./ui/statusBar");
const commands_1 = require("./commands");
function activate(context) {
    console.log('GeRM 扩展已激活');
    // 初始化UI组件
    (0, sidebar_1.activate)(context);
    (0, statusBar_1.activate)(context);
    // 注册命令
    (0, commands_1.registerCommands)(context);
}
exports.activate = activate;
function deactivate() {
    console.log('GeRM 扩展已停用');
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map