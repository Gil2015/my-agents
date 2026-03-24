# 使用说明

## 快速命令

默认直接读取同级的 `references/config.json`，一般只需要改这个文件。

```bash
vim references/config.json
```

入口脚本是 `bash scripts/init-config.sh`，虽然名字叫 `init-config`，但它同时负责读取配置、生成清单和执行 apply。

| 操作 | 命令 |
| --- | --- |
| 生成提交清单并预览 STORY 分组 | `bash scripts/init-config.sh collect` |
| 按配置执行 cherry-pick | `bash scripts/init-config.sh apply` |
| 冲突解决后恢复执行 | `bash scripts/init-config.sh apply --resume` |

## 配置方式

配置文件使用 JSON。

默认配置文件就是 [config.json](config.json)。一般每次任务前直接改这一个文件。

如果你确实需要换配置文件，也可以用 `--config /abs/path/to/other.json` 显式指定。

## 配置字段

- `repo_path`: 仓库绝对路径。不填时默认使用当前工作目录。
- `source_branch`: 需要扫描的源分支。
- `start_commit`: 起始提交。默认不包含这个提交本身。
- `author`: 传给 `git log --author` 的作者过滤条件。

## 可选高级字段

以下字段默认不需要写进 `config.json`，只有特殊场景才补充：

- `include_start_commit`: 设为 `true` 时，起始提交本身也会纳入范围。
- `output_markdown`: 自定义清单文件路径。默认是 `commits-[YYYYMMDD].md`。
- `default_branch_name`: 自定义清单里默认显示的分支名，默认跟 `source_branch` 一致。
- `branch_overrides`: 用于覆盖个别提交在清单里的分支名，格式是 JSON 对象。
- `story_pattern`: 自定义 STORY 识别正则。
- `bug_pattern`: 自定义 bug 识别正则。
- `story_commit_type`: 自定义 STORY 合并提交的类型，默认是 `feat`。
- `story_title_template`: 自定义 STORY 合并标题模板。
- `fallback_story_content`: 找不到需求内容时的回退文案。
- `commit_body_bullet_prefix`: 合并提交说明里每条原始标题的前缀。
- `allowed_dirty_paths`: 允许在执行前处于脏状态的路径。
- `exclude_paths_from_commit`: 最终提交里需要排除的路径。
- `skip_existing_on_target`: 已经在目标分支上的提交是否跳过。

## 行为说明

- 同一个 STORY 的提交会被并到同一组，组内顺序保持从旧到新。
- 同一个 STORY 如果在时间线上多次出现，脚本会按第一次出现的位置建组，后面的同 STORY 提交继续并入这个组。
- STORY 组的提交标题固定走模板，通常是 `feat: [STORY#需求号]需求内容`。
- 需求内容默认取该 STORY 组里第一条“带 STORY 且不是 bug 修复”的标题正文。
- 如果没有找到可用需求内容，则自动回退为 `往期需求缺陷修复`。
- 没有 STORY 号的提交会保持独立，默认沿用原始 commit message。
- 如果出现冲突，脚本会直接停止，等待开发人员人工处理；不会自动替你做代码取舍。

## 常见场景

- 先确认 `references/config.json` 中的 `source_branch`、`start_commit`、`author` 都已经更新到本次任务。
- 如果部分提交在清单里应该显示成其他来源分支，先写入 `branch_overrides`，再重新执行 `collect`。
- 遇到冲突时先人工判断并执行 `git cherry-pick --continue`，再运行 `bash scripts/init-config.sh apply --resume` 恢复流程。

## 预期输出

- 一份 `commits-[YYYYMMDD].md` 风格的提交清单，包含提交号、分支名、作者、时间、标题。
- 一份 STORY 分组预览，方便在真正 apply 前确认分组是否合理。
- 一串按 STORY 分组后的提交，以及若干保留原始 message 的独立提交。
