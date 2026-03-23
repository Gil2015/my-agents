# 内置基线数据

该目录用于保存 `module-audit` skill 的可移植参考基线，避免依赖仓库外层路径。

## 目录

- `module-template/`：业务模块模板基线
- `module-examples/`：业务模块案例基线

## 使用规则

`module-audit` 执行时应按以下优先级读取基线：

1. `skills/module-audit/baselines/`（本目录，默认）
2. 如果本目录缺失，再回退到外部路径（如 `other-projects/`）

## 维护方式

当模板或案例规范变更时，同步更新本目录内容，保证 skill 在跨项目使用时仍可独立运行。
