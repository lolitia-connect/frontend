# 前端上游同步 prompt

目标：将官方明确指定的 `<TAG>` 的业务增量移植到本 fork，同时保留全部当前定制。此 prompt 不是直接执行 merge/rebase/reset 的授权。

## 0. 必须先读

- [current-customizations.md](./current-customizations.md)。
- [当前台账 F01–F19](../sync-diffs/v1.23.0-local-2026-11-19.md)，尤其[固定至 baf7177 的补账](../sync-diffs/v1.23.0-local-2026-11-19.md#8-截止后增量至-baf7177)，以及[Markdown 逐文件改动索引](../sync-diffs/v1.23.0-local-2026-11-19.files.md)。原 W01 业务已入 `73a3172`，不得按旧快照重复实现。后续同步说明、索引和 prompts 只保存为 .md，按行为写清具体更改，不另建结构化清单。
- [上次官方同步](../sync-diffs/v1.22.0-to-v1.23.0.md)作为历史证据，不照搬其中已被替代的 Vite/静态 callback/pending-route 配方。
- 兄弟[后端台账](../../../backend/.ai/sync-diffs/v1.21.7-local-2026-11-19.md)和各 app 的 AGENTS。

## 1. 分开官方范围、本地增量与工作树

最后确认的官方版本 v1.23.0 是 `108d192634e56a3936530bff0fdd10164dd5bf1c`；本地落点 `cd1ab07f14063e72375ed07951ec20a54454a5b0`。不要用同名本地 tag、浮动 remote HEAD 或最高版本标签推断同步范围；历史已经发生过官方/本地标签历史不同的情况。

在前端仓库目录运行只读检查；仅在任务确实授权同步/拉取时执行 fetch：

```powershell
git --no-pager status --short
# Only expand relevant untracked directories when needed; do not dump generated build trees.
git --no-pager log -5 --oneline
$LastOfficial = '108d192634e56a3936530bff0fdd10164dd5bf1c'
$TargetTag = '<TAG>'
$TargetRef = "refs/upstream-tags/offical-upstream/$TargetTag"
git fetch offical-upstream "refs/tags/${TargetTag}:${TargetRef}"
$TargetCommit = git rev-parse "$TargetRef^{commit}"
git --no-pager log --no-merges --oneline "$LastOfficial..$TargetCommit"
git --no-pager diff --name-status $LastOfficial $TargetCommit
```

固定目标 SHA，分别列出官方待移植变化、本地同步后变化与未提交内容。不覆盖用户/其他任务的未提交工作；不强制覆盖本地 tag。

## 2. 建立逐功能移植矩阵

对每个上游功能标为“已等价存在 / 需适配 / 保留本地差异 / 不适用 / 阻塞”，写清证据与目标文件。不要用整树 diff 的噪声替代分析，也不要按提交标题推断功能落地。

优先顺序：后端接口契约 → App Router 入口/初始化 → HeroUI 交互 → i18n/主题/响应式 → 测试/生成产物。跨端字段不完整时明确阻塞，不能重新添加 pending-route 白名单让检查假绿。

## 3. 迁移时不可回退

- 本地是 Next 16 + React 19 + HeroUI v3/Tailwind4，不恢复 Vite、旧 routeTree/hash history 或 Radix 组件。
- 页面 SSR 与浏览器请求可以共存；user/admin 直连不恢复 SSR 本地代理，payment portal 的已有 rewrite 要单独对待。
- OAuth/bind 是真实 App Router 路由；Telegram 同步预开 popup、opener relay、payload 兼容、双阶段邀请注册全部保留。
- V2 订单能力票据/大整数/幂等/事件版本、真实 return_url、协议实例字符串 id/name、无限流量、到期组和本地节点能力门槛全部保留。
- 主题/语言偏好、五种用户语言、动态品牌标题、本地字体/OFL 与窄屏可用性全部保留。user/admin 的请求语言、独立 SSR i18n、词典/水合初值与挂载后显式偏好恢复不可回退；payment 保持原初始化，不擅自统一。
- 保留公共配置与用户恢复并行、整页直接导入 section、地球 idle/图表视口触发的局部延迟，避免恢复全页 client-only 或急加载；未测量的生产性能不写成收益。
- 保留整数分提现/全额只填充、受控用户启停的显式资料载荷、地球语义色与低弧大圆端点处理。统计空态按 F16 固定提交与 W03 工作树分开比较：月/全部按列表判空的并行调整不能未经核对自动撤销。首帧 transform-only、E2E 与新增依赖也只按采样状态记录，不冒充已验收功能。
- 三端翻译提取继续排除本地及跨父目录共享 UI 测试，词典命名空间键保持原连字符；不为测试键补生产翻译。
- 不恢复已经删除的 UI/静态桥接/Vite 代理资产；保留仍被使用的 router/button/form 等兼容实现及测试。

Next/HeroUI API 以项目实际安装版本文档为准。上游若仍用另一套 UI/路由，翻译业务意图而不是复制实现。

## 4. 接口和生成文件

从兄弟后端 AST 导出真实契约，核对请求字段、string ID 和 response envelope。后端 `57973bf2` 已修复请求绑定/验证及 GET query；保留 HTTP 200 + body.code 判断，不能把绑定失败后的成功 UI 当兼容方式。按需运行 `bun run api:refresh`，检查 `api:check` / `api:verify`；服务生成目录与手工 common/admin/user 类型不能互相冒充。现有快照的 backendDirty 元数据必须解释，不可去掉标记伪装干净版本。

## 5. 验证与交付

- 首先运行覆盖改动的现有 Vitest selector；页面/SSR/路由变动执行对应 app typecheck/build；视觉/交互用对应 app E2E，而不是直接全仓全量。
- 三端单独 build/publish，不能把 docs 输出当作应用输出。浏览器检查避开共享端口、构建目录与测试产物。
- mock 测试、静态检查、真实 OAuth/支付/后端联调分别记录；不宣称历史测试是当前结果。文档-only 不需启动服务。
- 新官方同步才新建 `.ai/sync-diffs/<last-tag>-to-<new-tag>.md`，记录固定官方范围、功能矩阵、保留项、文件清单、执行结果与未验证项；本地同日后续提交追加独立范围/时间，保留旧哈希与验证。同步更新定制台账、`.ai/sync-diffs/README.md`、`.ai/prompts/README.md` 与 current-customizations，不把工作日志追加到项目 README。
- README 仅保留入口；长期工程规则更新[双语开发指南](../../docs/zh/guide/frontend-development.md)，修复移动章节的旧链接及文档站导航。保留旧记录与并行生成目录。未经明确要求不提交、不推送、不部署，不读写真实密钥或客户数据。
