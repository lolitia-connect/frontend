# 当前前端定制保护 prompt

将 `<任务>` 替换为本次需求。适用于日常开发和修复，不要求重新迁移框架；未明确授权时不提交、不推送、不部署。

## 开始前

1. 阅读[当前定制台账 F01–F19](../sync-diffs/v1.23.0-local-2026-11-19.md)，优先看[截止后增量 F13–F19](../sync-diffs/v1.23.0-local-2026-11-19.md#8-截止后增量至-baf7177)、[Markdown 逐文件改动索引](../sync-diffs/v1.23.0-local-2026-11-19.files.md)和目标 app 的 AGENTS。后续差异记录与 prompts 只保存为 .md，必须说明具体行为变化，不另写结构化清单。
2. `git status --short`、`git log` 确认实际版本，区分本次工作与他人未提交内容。官方基线仍为 v1.23.0，本地落点 `cd1ab07`；最新补账固定到 `baf7177b478b46f5d97a89724e23907118307cdb`，累计 12 个非 merge 提交、817 个路径。原 `12881af` / W01 是历史快照，提现/空态/地球等已在 `73a3172` 提交，不再当成未提交待办。
3. 22:51 的 W02 记录 `next-env.d.ts` 和 `.next-audit-95f8`；[23:17 截止的 W03](../sync-diffs/v1.23.0-local-2026-11-19.md#w03-截止后的并行工作树观察)又出现统计空态语义调整、首帧动画/E2E、可访问性开发依赖。先按目录检查，必要时展开；不能清理产物或按旧约束自动撤销并行修改。已提交、工作树、已执行验证和实际部署分开记录。
4. 涉及 API/OAuth/订单/协议时，读取[后端当前约束](../../../backend/.ai/prompts/current-customizations.md)。后端新快照 `57973bf2` 包含已提交的 UTC/02170、账号头像及接口修复；入库不代表真实数据库已迁移或接口已联调。
5. 实现 `<任务>` 前说明对应 F 编号、将保留的行为和最小验证选择。

## 文档归属

- README 只保留项目介绍、必要快速开始、部署警告和文档入口。不要追加任务进度、修复经过、测试输出、临时状态或逐组件实现约束。
- 长期工程说明维护在[前端开发指南](../../docs/zh/guide/frontend-development.md)及其[英文版](../../docs/guide/frontend-development.md)：字体、测试归属/命令、布局约定、请求语言 SSR、首屏按需加载、OAuth 与支付门户。面向用户的业务说明放到对应功能文档；公开指南的源码链接用仓库 URL，不用跳出 docs 的相对链接。
- 具体改动、同步范围、排障结论和带版本的验证结果写入已有 `.ai/sync-diffs` 台账；同日新提交可追加独立范围/时间/行为编号，只在确需新版本记录时新建 Markdown。保留旧计数与哈希，新增累计数用 Git 重算，不能简单相加路径数或把工作树改成“已完成”。
- Agent 可复用约束放在本目录 prompts；只保存 .md。修改文档时保持中英文入口和链接一致，保留他人正在维护的内容。

## 架构边界

- 三端已是 Next.js 16 App Router + React 19 + HeroUI v3/Tailwind v4。新路由写入 app，业务 section 维持当前分层；不要恢复 Vite entry、TanStack route tree 或旧静态桥接页。
- [router-compat](../../packages/ui/src/lib/router-compat.tsx)底层是真实 Next navigation，仍有生产调用。TanStack Query/Table/Form 也仍有用，不应整包清理。
- 页面结构可 SSR；API bootstrap、cookie/storage 恢复和 WebGL 副作用在适当客户端边界运行。admin 页面直接导入 section，不再对整个可见页面额外动态导入。不要把整页改成 `ssr:false`；导航进度、装饰性地球和视口触发图表是明确的局部 client-only 例外。
- user/admin 公共配置与会话恢复并行；配置缓慢/失败不阻塞用户鉴权或访客识别，保留 StrictMode 用户请求去重、卸载保护和提前注册的 `window.logout`。
- 地球等待配置/用户识别结束、绘制与 idle 后加载，并清理调度；管理端摘要立即显示，图表临近视口才挂载且首次显示后保持状态。保留图表占位、无 IntersectionObserver 降级、流量卡稳定组件与共享日期；不要恢复急加载所有图表/详情，也不要延迟所有摘要请求。
- payment portal 使用服务端 cookie 初始值保持 hydration 一致，cookie 存在不等于鉴权成功。修改 SSR 时需要 Next build，而非只跑 tsc。
- 共享 wrappers 只保留真实兼容需求；优先当前 HeroUI v3 compound API。按钮替换必须核对 type=submit、loading/disabled、asChild 的语义/事件及长文本，不能假设原生组件默认行为相同。

## API 与部署

- 实际 base URL 是 `NEXT_PUBLIC_API_BASE_URL`，路径前缀是 `NEXT_PUBLIC_API_PREFIX`，不是 `NEXT_PUBLIC_BASE_URL`。
- user/admin 浏览器直连后端，没有 Next rewrite/127.0.0.1 SSR fallback；prefix 不再自动剥离，CORS 由后端配合。
- payment portal **仍有** `/api/:path*` rewrite；没有需求时不要把它误删或把三端描述成一致。独立 Cloudflare Pages functions 也仍保留。
- 三端各自 build/filter 与 apps/<app>/.next 发布；根 Netlify 配置属于 docs，不能拿它部署 app。公共 env 会进浏览器包，禁止真实私钥、token 或生产默认登录凭据。
- 后端业务错误可 HTTP 200，保持 response body.code 判断、错误提示和 `window.logout` 注册，不能仅靠 HTTP 状态判定成功。

## 关键业务不变量

### OAuth/Telegram

- 发起提供方回跳 URI 保留末尾 `/`，回调落到真实 `/oauth/[platform]` / `/bind/[platform]`，不要恢复 hash 路由或静态 index.html 桥接。
- Telegram 在点击时同步预开 popup；解析 native auth_result、query/hash/Base64 回调，popup 先 relay 给 opener，主窗口才换 token/绑定。保留窗口关闭、/auth/get fallback、整页降级与 listener/timer 清理；不得放宽发送方检查。
- 强制邀请是新账号注册政策，不拦截老用户 OAuth 登录。
- `/login/token` 返回 `invite_required:true` + `oauth_token` 时，仅显示邀请码 UI，不设置 Authorization、不刷新为已登录；POST `/v1/auth/oauth/register` `{oauth_token,invite}` 成功拿到真实 token 才完成登录。
- 错误邀请码可重试，取消返回 auth；待注册身份由后端缓存，不能让前端先建用户。验证码的前端展示/携带不代表后端 OAuth 已验证全部字段，核对实际请求类型。

### 订单、协议与金额

- 保留 V2 幂等键、lossless ID、guest capability、事件 `state_version`、过期票据刷新/轮询回退、session exchange。
- 网关回跳用真实 `/payment` 或 `/purchasing/order`；回跳不等于支付成功，不能让浏览器自行写已付款。
- 协议按 `type:id` 区分，公共字段 id/name 是字符串；保留 NW3/本地节点能力、无限流量和到期组等业务字段。
- 充值门户配置预设按展示单位处理，旧 >=10000 cents 只归一化一次；提交金额不要重复换算。
- 提现输入按展示单位、请求按安全整数 cents；最多两位小数且不超过可提现佣金。“Withdraw All”只填充不提交，零余额/提交中禁用；不能直接发送小数或重复换算。

### 管理用户与统计

- 启停开关由保存的 `user.enable` 控制，提交禁用、成功刷新、失败保留状态。请求显式传基本资料字段，禁止把列表对象整体 spread，也不能擅改为 enable-only PATCH；后端仅对变化的非空头像检查图片数据，原 OAuth 头像 URL 可保留。
- 固定提交 baf7177 的 F16 在收入/用户统计月/全部页缺失、空列表或全零时显示 Empty；**W03 并行工作树已恢复月/全部按列表非空画图（全零也显示），today 仍按指标判空**。先核对原任务意图与 diff，不按历史 prompt 自动恢复全零判空；保留完整日期/汇总，不扩为所有图表规则。

## 视觉、语言与存储

- 保留粉色 light/dark tokens、可读边框、reduced-motion、局部滚动与移动端按钮/长文本换行。不要靠 overflow-x-hidden 掩盖越界。
- 保留本地 Swei Gothic SC/TC/JP 和 OFL，Latin 字体不被 CJK 替代；lang 变化必须正确选择字体。
- user/admin 用 `Accept-Language` 选首屏语言与词典、SSR 每次创建独立 i18next，Provider 的初值与 `<html lang>` 一致；挂载后才恢复显式偏好。不要用全局可变实例或无语言缓存键的 HTML 缓存。payment 保留原初始化；不能再把三端都描述成固定英文首屏。自动检测不写显式选择，保留“跟随系统”。
- `auth-control` 等命名空间保留原词典键；生成变量名允许下划线，但资源对象键不能跟着改名。三端 i18next 提取排除测试/spec/`__tests__`，共享 UI 必须有显式父目录 ignore；测试键不进生产词典。
- 地球配色由局部 `--globe-*` 转 sRGB，保留黄绿蓝航线和现有节点；大圆路线端点精确、抬升上限 4，支持重合/对跖端点。不要恢复固定粉色 ramp、旧高弧线或改变地球布局来掩盖问题。
- API 品牌/页标题/描述/logo/canonical 必须在客户端导航后保持；默认名 User Portal/Admin Portal/Payment Portal，不让 Next 静态 metadata 再覆盖运营标题。

## 生成与验证

- 改接口先核对本地后端，按需 `api:refresh`，再 `api:check` / `api:verify`；当前不再支持 backend-pending 白名单，缺失的在用路由应失败。手工 common/admin/user 类型与隔离生成层分别核对，不覆盖上游 Swagger。
- i18n 维护原 locale 文件，必要时运行现有 locale resource 生成脚本；改提取范围用根 `test:shared tests/contract/i18n-extraction.test.ts` 与 `i18n:status`，不要借测试排除规则屏蔽真实生产缺失键。
- 选择现有同位 Vitest 或 app E2E；原行为见[历史验证入口](../sync-diffs/v1.23.0-local-2026-11-19.md#6-验证入口与本轮证据)，SSR/延迟加载/提现/启停/提取规则见[增量覆盖及最小选择器](../sync-diffs/v1.23.0-local-2026-11-19.md#w02-当前工作树与验证边界)。这些是建议命令，不是当前通过记录；仅在范围要求时升级全仓测试。
- 浏览器验证使用独立端口/NEXT_DIST_DIR/输出目录，不抢占共享开发服务；真实 OAuth/付款与 mock E2E 分开报告。
- 文档-only 不需要跑应用 build/test；核对清单、链接和 diff 即可。禁止把旧交付日志的通过数字当作本轮证据。

交付时说明行为变化、保留的不变量、真实执行的检查和仍需联调的边界；同步更新相关台账/prompt，避免未来 agent 再走已淘汰的 Vite、代理或 OAuth 路径。
