# 前端开发 agent prompts

本目录给日常开发、修复和上游移植提供当前上下文。所有约束均应与实际 HEAD/工作树核对；文件本身不授权提交、部署或修改生产配置。

README 只作项目入口。长期工程规则见[前端开发指南](../../docs/zh/guide/frontend-development.md)（[English](../../docs/guide/frontend-development.md)）；任务过程和验证记录放到同步台账，agent 约束放在 prompts，不再追加回 README。

## 使用顺序

1. [current-customizations.md](./current-customizations.md)：日常开发与修复先读，保护当前 App Router/HeroUI、SSR、API 和业务契约。
2. [当前定制台账](../sync-diffs/v1.23.0-local-2026-11-19.md)及[Markdown 逐文件改动索引](../sync-diffs/v1.23.0-local-2026-11-19.files.md)：精确版本、具体行为、功能分组、测试入口与覆盖证据。差异记录与 prompts 只保存为 .md。
3. [sync-upstream.md](./sync-upstream.md)：只在明确要求同步官方版本时使用；替换目标 `<TAG>`，不把本地最高 tag 当官方基线。
4. 涉及接口时同时读[后端当前 prompt](../../../backend/.ai/prompts/current-customizations.md)。

修改具体 app 前还要读取 [user AGENTS](../../apps/user/AGENTS.md)、[admin AGENTS](../../apps/admin/AGENTS.md)或[payment AGENTS](../../apps/payment-portal/AGENTS.md)。Next 文档以安装版本自带文档为准；HeroUI v3 API 以对应版本官方文档为准，不能照搬 v2 或旧 Radix 示例。

## 已确认快照

- 官方 v1.23.0：`108d192634e56a3936530bff0fdd10164dd5bf1c`。
- 本地同步落点：`cd1ab07f14063e72375ed07951ec20a54454a5b0`。
- 原始快照：`12881af4835f74de979e5977300971e6679dd9c3`（10 个提交、772 路径），保留其 W01 历史工作树和验证边界。
- 最新补账：`baf7177b478b46f5d97a89724e23907118307cdb`，见[第 8 节 F13–F19](../sync-diffs/v1.23.0-local-2026-11-19.md#8-截止后增量至-baf7177)。新增 2 次提交、94 个路径；自同步落点累计 12 个非 merge 提交、817 个路径，不能直接相加两期文件数。
- 新增保护项：请求语言 SSR / 独立 i18n、并行会话初始化、局部延迟加载、整数分提现、受控用户启停、统计空态、地球语义色/低弧线、翻译提取排除测试、README 归档。
- 旧 W01 提现/统计/地球等业务已随 `73a3172` 提交；W02 保留 22:51 生成目录采样，W03 记录 23:17 截止的新并行状态：统计月/全部恢复按列表判空、首帧 transform-only/E2E 及可访问性依赖。固定 F16 与工作树语义不同，接手前核对，不能自动撤销。本文不保证后续 HEAD/工作树不变，不清理产物，不声称业务测试或生产 LCP 已通过。

不要从旧 [迁移配方](../../docs/MIGRATION-NEXT-HEROUI.md)重复执行删除/替换操作；它记录的是迁移过程，部分说明已被后续 API 直连、SSR 和 OAuth 修复替代。新功能完成后更新相关台账和 prompt，不复用旧测试数字作为新的验收结果。
