"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileHandler = void 0;
const fs = require("fs");
const path = require("path");
class FileHandler {
    static async readFile(filePath, encoding = 'utf-8') {
        try {
            const content = await fs.promises.readFile(filePath, { encoding: encoding });
            return content;
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('Unexpected token')) {
                // 可能是二进制文件
                try {
                    const content = await fs.promises.readFile(filePath, { encoding: 'latin1' });
                    return content;
                }
                catch (e) {
                    console.warn(`无法读取文件 ${filePath}:`, e);
                    return `[无法读取文件内容: ${e instanceof Error ? e.message : String(e)}]`;
                }
            }
            console.warn(`读取文件 ${filePath} 失败:`, error);
            return `[读取文件失败: ${error instanceof Error ? error.message : String(error)}]`;
        }
    }
    static async writeFile(filePath, content, encoding = 'utf-8') {
        try {
            // 确保目录存在
            await fs.promises.mkdir(path.dirname(path.resolve(filePath)), { recursive: true });
            // 写入文件
            await fs.promises.writeFile(filePath, content, { encoding: encoding });
            return true;
        }
        catch (error) {
            console.error(`写入文件 ${filePath} 失败:`, error);
            return false;
        }
    }
    static listFiles(dirPath, ignoreFunc) {
        const fileList = [];
        function traverseDir(currentPath) {
            const files = fs.readdirSync(currentPath);
            for (const file of files) {
                const filePath = path.join(currentPath, file);
                // 检查是否应该忽略
                if (ignoreFunc && ignoreFunc(filePath)) {
                    continue;
                }
                if (fs.statSync(filePath).isDirectory()) {
                    // 递归遍历子目录
                    traverseDir(filePath);
                }
                else {
                    // 添加文件到列表
                    fileList.push(filePath);
                }
            }
        }
        try {
            traverseDir(dirPath);
        }
        catch (error) {
            console.error(`列出目录 ${dirPath} 中的文件失败:`, error);
        }
        return fileList;
    }
    static getRepoStructure(repoPath, ignoreFunc) {
        try {
            const structure = {
                name: path.basename(repoPath),
                type: 'directory',
                children: []
            };
            function buildStructure(currentPath, parent) {
                try {
                    const items = fs.readdirSync(currentPath);
                    for (const item of items.sort()) {
                        const itemPath = path.join(currentPath, item);
                        // 检查是否应该忽略
                        if (ignoreFunc && ignoreFunc(itemPath)) {
                            continue;
                        }
                        if (fs.statSync(itemPath).isDirectory()) {
                            // 目录
                            const dirNode = { name: item, type: 'directory', children: [] };
                            parent.children.push(dirNode);
                            buildStructure(itemPath, dirNode);
                        }
                        else {
                            // 文件
                            parent.children.push({ name: item, type: 'file' });
                        }
                    }
                }
                catch (error) {
                    console.warn(`构建 ${currentPath} 的结构失败:`, error);
                }
            }
            buildStructure(repoPath, structure);
            return structure;
        }
        catch (error) {
            console.error(`获取仓库 ${repoPath} 结构失败:`, error);
            return {
                name: path.basename(repoPath),
                type: 'directory',
                children: [],
                error: String(error)
            };
        }
    }
}
exports.FileHandler = FileHandler;
//# sourceMappingURL=fileHandler.js.map