# M9 业务模块模板

这是 `@gai/dev-frontend` 内置的 M9 业务模块模板。

使用方式：

1. 按当前 mission 的 `moduleTemplate.id/root` 定位到本模板目录。
2. 读取 `template.json` 获取 `targetPath` 和 `requiredFiles`。
3. 新建模块时，将本目录除 `template.json`、`README.md` 之外的完整代码树复制到目标模块路径。
4. 复制后替换模块名，并清理示例组件、示例接口和示例数据。

本目录是可复制的代码模板，不是文档模板。
