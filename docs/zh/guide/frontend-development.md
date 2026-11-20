# 前端开发指南

本文记录三端与共享包的长期维护约定，不作为任务日志或验收报告。项目介绍与快速启动保留在各 README；具体变更及阶段性验证见仓库的 .ai/sync-diffs，agent 工作约束见 .ai/prompts。

[English](../../guide/frontend-development.md)

## 字体

三个应用共用 `packages/ui/src/styles/` 中的 CJK 字体配置。用户端和管理端的英文保留现有
Fredoka / Sen 字体栈，支付门户的英文保留其原有系统字体栈；CJK 使用本地托管的
[Swei Gothic（獅尾圓體）](https://github.com/max32002/swei-gothic)
WOFF2 字体，按页面或元素的 `lang` 选择版本：`ja` / `ja-JP` 使用 JP，
`zh-CN` / `zh-Hans` 使用 SC，`zh-TW` / `zh-HK` / `zh-MO` / `zh-Hant` 使用 TC。
未标注语言的 CJK 文本默认使用 SC。语言切换、已保存的偏好、语言菜单中的母语名称以及
显式的 `font-sans` 样式均遵循此映射。

CJK 字体通过 Unicode 范围限制，不会替换英文字母和 ASCII 数字；即使原有英文网络字体
未能加载，也不会改用 Swei Gothic 显示英文。包含 Regular（400）、Medium（500）、
Bold（700）、Black（900），中间字重按 CSS 规则选择最接近的字体。字体文件未经修改，
来自上游提交
[`c363a1d`](https://github.com/max32002/swei-gothic/tree/c363a1d845aa782a71b7a068b5db0aff3f83ee86/WebFont)，
随应用构建分发，运行时不依赖 CJK 字体 CDN。再分发时须保留
[SIL Open Font License 1.1](https://github.com/lolitia-connect/frontend/blob/main/packages/ui/src/styles/fonts/swei-gothic/OFL.txt)。

## 路由进度反馈

用户端与管理端共用[路由适配层](../../../packages/ui/src/lib/router-compat.tsx)。
`Link` 在 Next.js `onNavigate` 触发时启动顶部进度条，`navigate` / `push` / `replace`
在调用路由前启动；路径或查询参数更新只负责结束，不能在页面加载后才闪现进度条。
同页、仅锚点变化、被取消的点击、下载、外链和新标签页点击不启动进度条，首次渲染保持空闲。

客户端进度条组件尚未加载时保留导航意图；新导航替换上一条进度及其超时任务。
导航失败或一直没有提交时，30 秒兜底结束以避免卡住。这是路由加载提示，不跟踪后台 API
请求；直接调用 Next 原生 router 或浏览器历史导航不发送适配层的开始信号。

共享路由测试覆盖触发时机和排除场景；管理端 layout E2E 阻塞 sidebar 目标路由响应，
确认旧页面仍显示时进度条已启动，再释放响应并确认进度条结束。

## 测试与文件归属

- 应用单元/组件测试：`apps/{user,admin,payment-portal}/src/**/*.test.{ts,tsx}`，与被测源码相邻，由各 app 的 `vitest.config.ts` 执行。
- 应用浏览器测试：`apps/{user,admin,payment-portal}/tests/e2e/*.spec.ts`，各 app 自己维护 `playwright.config.ts`、预热逻辑和专用 fixtures。
- 共享 UI 测试：`packages/ui/src/**/*.test.{ts,tsx}`，不归入某个 app。
- 跨应用契约/代理测试：保留在根目录 `tests/contract` 和 `tests/functions`，统一由根 Vitest 配置执行；`tests/e2e` 只保留多个 app 共用的辅助代码。
- `tests/vitest` 保存共享测试运行辅助代码；所有 Vitest 配置在 worker 启动前初始化各自工作区的 `.tmp-vitest/`，无需手动设置临时目录环境变量。Turbo 将这些辅助代码纳入测试缓存输入。
- 文件使用 kebab-case，Vitest 用 `*.test.ts(x)`，E2E 用 `*.spec.ts`，fixture 用 `*.fixtures.ts`。已有同位单元测试不再重复搬动。
- `scripts` 保留持续维护的生成工具：后端契约/OpenAPI（`backend-contract.mjs` 及 Go 提取器）、语言资源和版本信息。可重复检查归入 Vitest / E2E，不新增独立进度或死代码推断脚本。CI triage 工具归入 `.github/automation`。
- user/admin 通过 `NEXT_PUBLIC_API_BASE_URL` 直连后端，不配置 Next API rewrite；payment portal 仍保留 `/api` rewrite。`tests/functions` 覆盖独立 Cloudflare Pages 代理，不是 Vite 开发代理。

测试以仍在使用的生产行为为准，包括 Next 路由适配层和 HeroUI UI 适配层；不能仅凭 `compat` 或 `legacy` 命名删除。移除生产入口时再清理对应测试，具体迁移删除记录保留在同步台账。

按改动范围选择下列最小测试入口。列出命令不代表验证已通过；实际结果应另记在带版本的同步台账。

```bash
# 所有工作区单元/组件测试及共享检查
bun run test
# 仅共享测试，也可以使用 test:contract / test:proxy
bun run test:shared
# 三个 app 的全部 E2E；test:e2e:all 为兼容别名
bun run test:e2e
# 按 app 执行，可继续传 Playwright 文件过滤、--grep、--list 等参数
bun run test:e2e:user
bun run test:e2e:admin drawers.spec.ts
bun run test:e2e:payment-portal --list
# 管理端布局/抽屉与用户端布局
bun run test:e2e:layout
# app 内也有相同入口；报告保存在各 app 内
bun run --cwd apps/payment-portal test:e2e
bun run --cwd apps/payment-portal test:e2e:report
```

契约测试会运行 Go 提取器，需要 `PATH` 中有 Go，或设置 `GO_BINARY`。
根 `bun run test` 包含这些共享检查；app 内的 `test` 只运行该 app 的 Vitest 测试。
首次运行浏览器测试可用 `bun x playwright install chromium` 安装 Chromium。
测试使用独立服务器，不复用开发端口 3000–3002：用户端默认 3010（`E2E_PORT`）、
管理端 3014（`ADMIN_E2E_PORT`）、支付门户 3013（`PAYMENT_PORTAL_E2E_PORT`）。
并发运行时还需通过 `NEXT_DIST_DIR` 指定不同构建目录。
`test-results/`、`playwright-report/`、`.tmp-e2e/` 均归各 app 所有。
Bun 命令在载入配置前设置 `PLAYWRIGHT_TRANSFORM_CACHE_DIR`，避免 Windows 系统临时目录权限问题，无需额外脚本。

## 响应式布局回归

以 320px、375px 手机宽度、768px 平板及桌面视口检查布局。卡片和表单的 flex/grid 子项应允许收缩，长订单号、支付名称和文档标题应换行；手机账单优先单列，操作按钮允许换行。宽 Markdown 表格与代码块使用局部横向滚动，不能依赖整页 `overflow-x-hidden` 裁掉内容。

用户端 `layout.spec.ts` 覆盖账户卡片、长文档和支付账单；管理端 `drawers.spec.ts` 覆盖创建抽屉的 320px/375px 布局；支付门户 `recharge.spec.ts` 覆盖长支付名称的确认弹窗与二维码。测试使用模拟 API，不产生真实业务订单。并发测试除端口和构建目录外，还应使用不同的 Playwright `--output` 目录，避免测试产物互相覆盖。

## 支付门户维护

支付门户直接使用 HeroUI v3，独立样式导入 Tailwind v4、HeroUI 和共享语义主题；三端共享 accent、surface、field、圆角与明暗 token。[共享认证壳](https://github.com/lolitia-connect/frontend/blob/main/packages/ui/src/composed/auth-shell.tsx)统一登录面板宽度和响应式间距。门户不导入共享组件的覆盖样式，语言/主题持久化和后端服务仍共享，API 错误提示使用 HeroUI。

- `NEXT_PUBLIC_PAYMENT_PORTAL_AMOUNTS` 中小于 `10000` 的预设按主要货币单位解释，旧式 `>=10000` 预设按分归一化一次；UI 使用主要单位，向后端提交时避免重复换算。
- `NEXT_PUBLIC_PAYMENT_PORTAL_MIN_CUSTOM_AMOUNT` 是自定义输入下限，默认 1，配置不能低于 1；输入步进 0.01，可清空，非空值小于下限时立即抬升。预设金额不受自定义输入下限限制。
- 确认弹窗展示后端返回的金额、手续费和总额，仅点击 Pay Now 时发起 checkout。取消只关闭确认框，不关闭已经创建的后端订单。
- 刷新/提交期间仍可编辑选择，但同一待提交金额和支付方式不能重复提交；刷新失败保留当前订单，checkout 失败可直接重试。
- 浏览器测试使用独立 `.next-playwright` 与 3013 端口（`PAYMENT_PORTAL_E2E_PORT` 可覆盖），临时文件位于该 app 的 `.tmp-e2e`。API 均为模拟，不产生真实付款；覆盖认证、键盘选择、确认/checkout/状态刷新、验证码、移动主题和语言。

按需运行 `bun run --cwd apps/payment-portal typecheck`、`bun run --cwd apps/payment-portal lint` 或该 app 的测试选择器。

## 请求语言与 SSR

用户端与管理端根布局读取标准请求头 `Accept-Language`，按 `q` 权重匹配各自支持的语言，
并处理区域语言回退（包括简繁中文）。请求头缺失、无效或无支持语言时使用应用默认语言。
选中的语言同时用于 `<html lang>` 与服务端翻译正文。

SSR 每次渲染使用独立 i18next 实例，不能跨请求共享可变的翻译实例。服务端读取所选语言的
已有词典，将词典与初始语言一起传给客户端，保证水合一致；不会将其他语言全部打入客户端
入口。水合后仍恢复浏览器中明确保存的语言偏好，自动检测不得把请求语言保存成手动选择。

由于使用 `headers()`，这些路由按请求渲染，不再静态预渲染；不得在没有按语言区分缓存键的
情况下跨请求缓存翻译后的 HTML。支付门户保留原有初始化方式。两端的 `i18n-ssr.spec.ts`
覆盖并发请求的语言隔离，以及请求语言与保存偏好不一致时的水合。

三端的翻译提取与状态检查均排除 `*.test.*`、`*.spec.*` 和 `__tests__` 目录，包括共享 UI
源码中的测试。测试专用翻译键应放在测试数据中，不应加入生产词典。推送前运行
`bun run i18n:status` 检查生产代码的翻译完整性。

## 用户端与管理端首屏性能

站点配置与登录态恢复并行执行：公共配置变慢或失败不应阻塞鉴权或访客识别。管理端根据当前
路径选择初始语言命名空间，其他页面的翻译在组件使用时加载；保留内置回退语言，确保初始
HTML 一致。页面依赖 Next.js 的路由拆包，不对整个可见页面额外动态导入，避免延迟水合
与语言检测发生竞争。

用户端首屏标题保留在初始 HTML 中。装饰性地球独立拆包，在配置与登录态检测结束、浏览器
获得绘制机会后利用空闲回调初始化，并保留超时与不支持空闲回调时的兼容路径。套餐卡片
代码只在获取到套餐数据后加载。

管理端摘要卡片立即显示，图表代码和图表专用请求在预留占位接近视口时加载；显示后保持
挂载，以保留选项卡状态。流量卡片使用稳定的组件定义并共享日期选项，悬浮用户详情按需
加载。针对性的浏览器测试位于
[performance.spec.ts](https://github.com/lolitia-connect/frontend/blob/main/apps/admin/tests/e2e/performance.spec.ts)。

这些约定只调整代码加载和执行时机，不修改图片、字体、基础设施或部署配置。LCP 应使用
生产构建测量，开发环境编译耗时不能作为线上性能结果。

页面入场动画的首帧必须保持不透明：整页从透明开始会让已经 SSR 输出的文字等待主线程
空闲后才显示。共享主题脚本在文档头部应用保存或系统主题，不要使用依赖水合才能消失的
全屏遮罩。两端 SSR 浏览器回归会禁用 JavaScript、暂停入场动画，并检查正文未被遮挡。
用户端仪表盘切换设备类型时，仅设备相关的平台应用列表使用内容淡入动效，并遵守
`prefers-reduced-motion`。列表更新不应重新挂载订阅折叠面板，避免影响展开状态。

## 无障碍检查

三端的 `accessibility.spec.ts` 使用仅开发依赖 `@axe-core/playwright` 和模拟 API。
运行 `bun run --cwd apps/<app> test:e2e accessibility.spec.ts`，其中 `<app>` 为
`user`、`admin` 或 `payment-portal`。覆盖浅色/深色主题、控件名称、页面地标、标题层级、
对比度、跳到正文的焦点，以及账户标签页、折叠导航和支付弹窗的键盘操作。
自动检查不能替代真实读屏器与人工键盘检查。

共享跳转链接需要可聚焦的 `main-content` 目标。导航分组保持合法列表结构，可交互导航
浮层使用管理焦点的 Popover，而不是在 Tooltip 中放链接。表单输入后仍保留可访问名称，
错误消息应可被播报；修改主题时同时检查文字与焦点标记的对比度。

## 用户端维护

### 首页组件风格

首页沿用用户主界面的 HeroUI `Card`、`Card.Title`、`Card.Description`、`Chip` 和共享按钮封装，
使用主题默认的背景、表面色、圆角和交互状态。首页服务介绍和套餐卡片不单独覆盖玻璃背景、
阴影或悬浮位移动效；首屏的 WebGL 地球动画保持独立。地球配色集中在
[`global-map.css`](https://github.com/lolitia-connect/frontend/blob/main/apps/user/src/sections/main/global-map.css) 的 `--globe-*` 变量中，
球体颜色由 HeroUI 的 `accent`、`surface`、`muted` 等语义色派生；航线按鲜明的黄、绿、蓝
三色循环，分别由 `--globe-route-yellow`、`--globe-route-green`、`--globe-route-blue` 控制。
香港枢纽除原有目的地外，也连接索菲亚、新加坡、马尼拉和彰化。
初始化和切换主题时将 CSS 颜色转换为 WebGL 可用的 sRGB 颜色，不改变地球布局或动画。
航线沿最短大圆路径绕行，最多在节点高度上抬升 4 个单位（地球半径为 100），
让洲际长线贴近地表，同时保留短距离线路原有的小弧度。

### 主内容区空状态

页面级空状态使用 [MainEmpty](https://github.com/lolitia-connect/frontend/blob/main/apps/user/src/components/main-empty.tsx)，采用与工单支持列表一致的
`py-24` 上下留白。该组件仅用于主内容区域，不修改共享空状态的默认样式，也不用于
侧栏、弹窗或图表内部的局部占位。包裹主区域空状态的卡片不应额外增加上下内边距。


### OAuth 回调

登录和账号绑定回调分别由 Next.js App Router 的 `/oauth/[platform]` 和
`/bind/[platform]` 路由处理。服务商已注册的回调地址继续使用
`<origin>/oauth/<provider>/` 和 `<origin>/bind/<provider>/`，保留尾部斜杠。
Next.js 会规范化尾部斜杠并保留查询参数，无需静态 HTML 桥接页或静态托管回退规则。

Telegram 回调支持查询参数、URL 片段（`#tgAuthResult=...`）以及独立的签名字段。
弹窗回调将结果转发给打开它的窗口；整页回调直接完成登录或绑定。
两条路径均使用现有后端的 `tgAuthResult` 数据格式。部署时需使用 Next.js 运行环境。

## 管理端维护

### 抽屉布局约定

管理端业务抽屉的统一样式位于 [app/drawers.css](https://github.com/lolitia-connect/frontend/blob/main/apps/admin/app/drawers.css)，仅由管理端根布局加载：

- 桌面端宽度上限为 **60rem（960px）**，保留少量视口边距；小于 40rem 的手机视口使用全宽。移动导航单独将外层 `Sheet.Content` 限制为 **18rem（288px）**，并至少留出 2rem 遮罩空间；内部侧栏填满该宽度，不套用业务抽屉规则。
- 宽度应设置在 `Sheet.Content`，而不只是 `Sheet.Dialog`，避免被 HeroUI 外层默认宽度限制；新表单不要再单独写固定抽屉宽度。
- 标题与底部操作区放在滚动内容外。正文使用直接位于对话框下的 `ScrollArea`，表格或编辑器可用 `admin-drawer-body`，不再依赖硬编码的页头/页脚高度相减。
- 短字段可用 `admin-drawer-form` 两列排布，长内容用 `admin-drawer-wide` 独占一行。网格按照抽屉实际宽度切换为单列，重复输入组自动换行，保留可用的输入宽度和增删按钮。
- 长标签、说明、工单消息自动换行；下拉框已选值可省略显示但不改变原值。工单正文独立滚动，回复栏保持可见。

[抽屉浏览器回归测试](https://github.com/lolitia-connect/frontend/blob/main/apps/admin/tests/e2e/drawers.spec.ts) 覆盖桌面/手机布局、嵌套抽屉、长内容及原有表单提交数据。从仓库根目录运行：

```bash
bun run test:e2e:admin drawers.spec.ts
```

### 页头面包屑

[页头](https://github.com/lolitia-connect/frontend/blob/main/apps/admin/src/layout/header.tsx) 的面包屑保持单行，空间不足时可横向滚动查看完整路径。左侧区域允许收缩，右侧语言、时区、主题和账户按钮保持可见。[布局回归测试](https://github.com/lolitia-connect/frontend/blob/main/apps/admin/tests/e2e/layout.spec.ts) 中的 `breadcrumbs scroll` 用例覆盖中英文、320–1280px 宽度、滚动和上级链接导航。

### 设置入口交互

系统设置、认证控制、营销的各个入口，以及订阅配置入口和服务器管理顶部的两个入口，统一使用整卡片式的 `settings-option` 触发：整张卡片就是一个可点击按钮，样式与 HeroUI 卡片一致（表面背景、`shadow-surface` 阴影、圆角，浅色模式下带一条细边），并沿用 HeroUI 原生悬浮、按下缩放和键盘焦点反馈。每个入口点击后打开对应配置抽屉；入口之间用间距（`space-y-3`）堆叠，而不是放进列表容器。共同的尺寸和文字布局位于 [共享样式](https://github.com/lolitia-connect/frontend/blob/main/packages/ui/src/styles/globals.css)。入口内容采用“图标 + 可收缩的文字容器 + 箭头”结构，长文字自动换行，图标和箭头保持尺寸；服务器列表工具栏在窄屏下自动换行，避免横向溢出。

[布局回归测试](https://github.com/lolitia-connect/frontend/blob/main/apps/admin/tests/e2e/layout.spec.ts) 覆盖中英文、明暗主题、320–1280px 宽度及点击打开抽屉：

```bash
bun run test:e2e:admin layout.spec.ts --grep "settings options wrap|settings lists open"
```
