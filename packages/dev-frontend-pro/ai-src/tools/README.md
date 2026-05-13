# dev-frontend-pro Tools

工具脚本源文件随 npm 包发布，目标项目通过包路径调用。

常用命令：

```sh
node packages/dev-frontend-pro/scripts/install-to-project.mjs --project-root /abs/project
node packages/dev-frontend-pro/scripts/init-mission.mjs --project-root /abs/project --mission-id 20260509-120000
node packages/dev-frontend-pro/scripts/validate-mission.mjs --project-root /abs/project --mission-id 20260509-120000 --stage ui-dev
node packages/dev-frontend-pro/scripts/build-project-index.mjs --project-root /abs/project
```

如果 `dev-frontend-pro` 通过软链接安装到目标项目，可把上面的 `packages/dev-frontend-pro` 替换成实际链接路径。

脚本输出统一为 JSON，供 agent 读取。
