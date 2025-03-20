# Germ

GeRM是一个Visual Studio Code扩展，旨在使用大型语言模型（LLM）自动生成README.md文件。通过简化文档编写流程，GeRM帮助开发者快速创建高质量的项目文档。

## 特性

- **自动生成README**: 利用大模型API，GeRM可以自动生成符合Markdown语法的README文件。
- **自定义设置**: 允许用户配置API密钥、使用的模型、最大token数和生成温度。
- **状态栏集成**: 在VS Code状态栏中添加一个按钮，便于用户快速生成README文件。
- **侧边栏视图**: 提供一个可视化的侧边栏界面，增强用户体验。


## 项目架构

- **src**: 源代码目录，包括扩展的主要逻辑和UI组件。
  - **commands.ts**: 定义扩展的命令。
  - **core**: 包含核心功能模块，如API客户端和README生成器。
  - **ui**: 包含用户界面相关的代码，例如状态栏和侧边栏。
  - **utils**: 实用工具函数。
- **out**: 编译后的输出目录。
- **media**: 包含扩展使用的媒体文件，如图标和样式表。
- **tests**: 包含单元测试文件，确保扩展功能的正常运行。

## 技术栈

- **语言**: TypeScript, JavaScript, CSS, JSON, Markdown
- **依赖管理**: npm
- **测试框架**: Mocha
- **Lint工具**: ESLint

## 贡献指南

欢迎任何形式的贡献！


## 许可证

本项目根据MIT许可证进行许可。有关详细信息，请查看 [LICENSE](LICENSE) 文件。

---

确保遵循 [VS Code扩展开发的最佳实践](https://code.visualstudio.com/api/references/extension-guidelines)。

**享受使用GeRM！**