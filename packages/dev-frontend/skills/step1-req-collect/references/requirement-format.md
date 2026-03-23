# 结构化需求文档格式

`.ai/missions/{module}/reqDoc/req.md` 的模板。

## 完整模板

```markdown
# Module: {module-name}

## Summary
{1-2 句话概述该模块的功能}

---

### REQ-001: {需求标题}
- **Priority:** P0 / P1 / P2 / P3
- **Description:** {清晰、单一职责的描述。最多一段话。}
- **Source Files:** {来源文件路径，使用相对 `{source-folder}` 的路径；多文件用逗号分隔}
- **Source Notes (optional):** {关键段落、标题或上下文摘要，便于追溯}
- **Acceptance Criteria:**
  - [ ] AC-001: {可测试的条件 — 必须能用是/否来验证}
  - [ ] AC-002: {可测试的条件}
  - [ ] AC-003: {可测试的条件}
- **UI Reference:** {该需求涉及哪个页面/界面/组件}
- **API Dependency:** {需要哪个 API 端点（如已知）}
- **Status:** CLEAR | NEEDS_CLARIFICATION
- **Questions (if NEEDS_CLARIFICATION):**
  - Q1: {关于该需求的具体问题}
  - Q2: {另一个具体问题}

---

### REQ-002: {下一条需求标题}
...
```

## 来源追溯规则

1. 每条 REQ 必须填写 `Source Files`，至少包含 1 个来源。
2. 文件路径使用相对 `{source-folder}` 的相对路径，禁止写绝对路径。
3. 若需求来自多个文件，按主次顺序列出所有来源文件。
4. 若需求仅来自用户补充输入，填写 `Source Files: USER_INPUT`，并在 `Source Notes` 中写明上下文。

## 优先级定义

| 优先级 | 含义 | 示例 |
|--------|------|------|
| P0 | 必须有 — 阻塞发布 | 核心增删改查功能 |
| P1 | 应该有 — 重要但不阻塞 | 搜索/筛选功能 |
| P2 | 锦上添花 — 提升用户体验 | 键盘快捷键、动画效果 |
| P3 | 未来考虑 — 不在当前版本范围内 | 高级数据分析 |

## 验收标准编写规则

好的验收标准：
- "用户可以看到包含以下列的表格：名称、状态、日期、操作"
- "点击删除按钮后，先显示确认弹窗再执行删除"
- "空状态显示'暂无数据'文案和插图"

差的验收标准：
- "页面正常运行"（不可测试）
- "用户体验良好"（主观判断）
- "数据加载速度快"（没有量化阈值，无法衡量）

每条验收标准必须：
1. 描述一个具体的、可观察的行为
2. 能用是/否来验证
3. 包含执行者（用户/系统）和操作动作
4. 明确预期结果

## 问题文档格式

`.ai/missions/{module}/reqDoc/issues.md` 的模板：

```markdown
# Requirement Issues: {module-name}

## Date: {YYYY-MM-DD}
## Status: OPEN | PARTIALLY_RESOLVED | RESOLVED

---

### REQ-001: {需求标题}

**Q1:** {具体问题}
- **Context:** {为什么这里不清晰}
- **Options:** A) {解读方式 1} B) {解读方式 2}
- **Answer:** {解决后填写}

**Q2:** {另一个问题}
- **Context:** {为什么这里不清晰}
- **Answer:** {解决后填写}

---

### REQ-003: {另一条需求}
...
```

## 合并规则

对已有模块重新运行需求收集时：
1. 先读取已有的 `.ai/missions/{module}/reqDoc/req.md`
2. 新需求使用下一个可用的 REQ-ID（不要复用已删除的 ID）
3. 更新的需求保留原始 REQ-ID，附加 "Updated: {date}" 备注
4. 删除的需求标记为 `**Status:** REMOVED`（不要删除该段落）
