<a name="readme-top"></a>

<div align="center">

<img width="160" src="https://raw.githubusercontent.com/perfect-panel/ppanel-assets/refs/heads/main/logo.svg">

<h1>PPanel 前端</h1>

这是由 PPanel 提供支持的前端

[英文](./README.md)
·
中文
·
[更新日志](./CHANGELOG.md)
·
[报告问题][issues-link]
·
[请求功能][issues-link]

<!-- SHIELD GROUP -->

[![][github-release-shield]][github-release-link]
[![][github-releasedate-shield]][github-releasedate-link]
[![][github-action-test-shield]][github-action-test-link]
[![][github-action-release-shield]][github-action-release-link]<br/>
[![][github-contributors-shield]][github-contributors-link]
[![][github-forks-shield]][github-forks-link]
[![][github-stars-shield]][github-stars-link]
[![][github-issues-shield]][github-issues-link]
[![][github-license-shield]][github-license-link]

![][split]

</div>

> **第一条**
> 人人生而自由，在尊严与权利上一律平等。
> 他们赋有理性与良知，应当以兄弟般的精神彼此相待。
>
> **第十二条**
> 任何人的隐私、家庭、住宅和通信不得任意干涉，其名誉与荣誉不得加以攻击。
> 人人有权受到法律的保护，以免遭受这种干涉或攻击。
>
> **第十九条**
> 人人有思想与表达的自由；此项自由包括持有主张而不受干预，以及通过任何媒介、无论国界，自由寻求、接受和传播信息与思想。
>
> _来源： [United Nations – Universal Declaration of Human Rights (UN.org)](https://www.un.org/sites/un2.un.org/files/2021/03/udhr.pdf)_

## 📦 Application List

| 📦 Application                                                                                                                                                                                                                                                                                                                                | 🖼️ Preview                                                     |
| :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------- |
| [**PPanel User Web**][ppanel-user-web-github]<br/>Developed with modern frontend technologies (Next.js, TypeScript, TailwindCSS), providing basic user features with support for multiple languages and themes.<br/>[![One-Click Deploy](https://img.shields.io/badge/Deploy%20with-Vercel-blue?style=for-the-badge)][ppanel-user-web-deploy] | [![Preview][ppanel-user-web-cover]][ppanel-user-web-github]    |
| [**PPanel Admin Web**][ppanel-admin-web-github]<br/>Developed with modern frontend technologies, this admin web provides basic data management features with support for multiple languages and themes.<br/>[![One-Click Deploy](https://img.shields.io/badge/Deploy%20with-Vercel-blue?style=for-the-badge)][ppanel-admin-web-deploy]        | [![Preview][ppanel-admin-web-cover]][ppanel-admin-web-preview] |

## ⌨️ 本地开发

您可以使用 Github Codespaces 进行在线开发：

[![][codespaces-shield]][codespaces-link]

您可以使用 Gitpod 进行在线开发：

[![在 Gitpod 中打开](https://gitpod.io/button/open-in-gitpod.svg)][gitpod-link]

或者克隆项目进行本地开发：

```bash
git clone https://github.com/perfect-panel/frontend.git
cd frontend

# 安装依赖
bun install
```

## 🔤 字体

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
[SIL Open Font License 1.1](./packages/ui/src/styles/fonts/swei-gothic/OFL.txt)。

## 🧪 测试与文件归属

- 应用单元/组件测试：`apps/{user,admin,payment-portal}/src/**/*.test.{ts,tsx}`，与被测源码相邻，由各 app 的 `vitest.config.ts` 执行。
- 应用浏览器测试：`apps/{user,admin,payment-portal}/tests/e2e/*.spec.ts`，各 app 自己维护 `playwright.config.ts`、预热逻辑和专用 fixtures。
- 共享 UI 测试：`packages/ui/src/**/*.test.{ts,tsx}`，不归入某个 app。
- 跨应用契约/代理测试：保留在根目录 `tests/contract` 和 `tests/functions`，统一由根 Vitest 配置执行；`tests/e2e` 只保留多个 app 共用的辅助代码。
- `tests/vitest` 保存共享测试运行辅助代码；所有 Vitest 配置在 worker 启动前初始化各自工作区的 `.tmp-vitest/`，无需手动设置临时目录环境变量。Turbo 将这些辅助代码纳入测试缓存输入。
- 文件使用 kebab-case，Vitest 用 `*.test.ts(x)`，E2E 用 `*.spec.ts`，fixture 用 `*.fixtures.ts`。已有同位单元测试不再重复搬动。
- `scripts` 仅保留持续使用的生成工具：后端契约/OpenAPI（`backend-contract.mjs` 及其 Go 提取器）、语言资源和版本信息。可重复检查归入 Vitest / E2E；一次性迁移、死代码推断和迁移进度脚本已删除，不再新增独立检查脚本。CI triage 工具归入 `.github/automation`。API 重写由各 app 的 `next.config.ts` 维护；`tests/functions` 测试独立的 Cloudflare Pages 代理，旧 Vite 代理及其测试已删除。

测试是否过时以生产入口和调用关系为准：管理端已不再引用旧赞助卡片，对应测试已删除。路由适配层实际调用 `next/navigation`，UI 适配层实际渲染 HeroUI，仍有生产调用；这些测试不能仅因名称包含 `compat` 或 `legacy` 而删除。

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

## 🤝 贡献

欢迎各种类型的贡献，
如果您有兴趣贡献代码，请随时查看我们的 GitHub
[问题][github-issues-link] 来展示您的能力。

[![][pr-welcome-shield]][pr-welcome-link]

[![][contributors-contrib]][contributors-url]

<div align="right">

[![][back-to-top]](#readme-top)

</div>

---

## 📝 许可证

版权所有 © 2024 [PPanel][profile-link]。<br />
本项目使用 [GNU](./LICENSE) 许可证。

<!-- LINK GROUP -->

[back-to-top]: https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square
[codespaces-link]: https://codespaces.new/perfect-panel/ppanel-web
[codespaces-shield]: https://github.com/codespaces/badge.svg
[contributors-contrib]: https://contrib.rocks/image?repo=perfect-panel/ppanel-web
[contributors-url]: https://github.com/perfect-panel/frontend/graphs/contributors
[github-action-release-link]: https://github.com/perfect-panel/frontend/actions/workflows/release.yml
[github-action-release-shield]: https://img.shields.io/github/actions/workflow/status/perfect-panel/ppanel-web/release.yml?label=release&labelColor=black&logo=githubactions&logoColor=white&style=flat-square
[github-action-test-link]: https://github.com/perfect-panel/frontend/actions/workflows/test.yml
[github-action-test-shield]: https://img.shields.io/github/actions/workflow/status/perfect-panel/ppanel-web/test.yml?label=test&labelColor=black&logo=githubactions&logoColor=white&style=flat-square
[github-contributors-link]: https://github.com/perfect-panel/frontend/graphs/contributors
[github-contributors-shield]: https://img.shields.io/github/contributors/perfect-panel/ppanel-web?color=c4f042&labelColor=black&style=flat-square
[github-forks-link]: https://github.com/perfect-panel/frontend/network/members
[github-forks-shield]: https://img.shields.io/github/forks/perfect-panel/ppanel-web?color=8ae8ff&labelColor=black&style=flat-square
[github-issues-link]: https://github.com/perfect-panel/frontend/issues
[github-issues-shield]: https://img.shields.io/github/issues/perfect-panel/ppanel-web?color=ff80eb&labelColor=black&style=flat-square
[github-license-link]: https://github.com/perfect-panel/frontend/blob/master/LICENSE
[github-license-shield]: https://img.shields.io/github/license/perfect-panel/ppanel-web?color=white&labelColor=black&style=flat-square
[github-release-link]: https://github.com/perfect-panel/frontend/releases
[github-release-shield]: https://img.shields.io/github/v/release/perfect-panel/ppanel-web?style=flat-square&sort=semver&logo=github
[github-releasedate-link]: https://github.com/perfect-panel/frontend/releases
[github-releasedate-shield]: https://img.shields.io/github/release-date/perfect-panel/ppanel-web?labelColor=black&style=flat-square
[github-stars-link]: https://github.com/perfect-panel/frontend/network/stargazers
[github-stars-shield]: https://img.shields.io/github/stars/perfect-panel/ppanel-web?color=ffcb47&labelColor=black&style=flat-square
[gitpod-link]: https://gitpod.io/#https://github.com/perfect-panel/frontend
[issues-link]: https://github.com/perfect-panel/frontend/issues/new/choose
[pr-welcome-link]: https://github.com/perfect-panel/frontend/pulls
[pr-welcome-shield]: https://img.shields.io/badge/🤯_pr_welcome-%E2%86%92-ffcb47?labelColor=black&style=for-the-badge
[profile-link]: https://github.com/perfect-panel
[split]: https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png
[ppanel-user-web-github]: https://github.com/perfect-panel/frontend/tree/main/apps/user
[ppanel-user-web-cover]: https://urlscan.io/liveshot/?width=1920&height=1080&url=https://user.ppanel.dev
[ppanel-user-web-preview]: https://user.ppanel.dev
[ppanel-user-web-deploy]: https://vercel.com/new/clone?demo-description=PPanel%20is%20a%20pure%2C%20professional%2C%20and%20perfect%20open-source%20proxy%20panel%20tool%2C%20designed%20to%20be%20your%20ideal%20choice%20for%20learning%20and%20practical%20use&demo-image=https%3A%2F%2Furlscan.io%2Fliveshot%2F%3Fwidth%3D1920%26height%3D1080%26url%3Dhttps%3A%2F%2Fuser.ppanel.dev&demo-title=PPanel%20User%20Web&demo-url=https%3A%2F%2Fuser.ppanel.dev%2F&from=.&project-name=ppanel-user-web&repository-name=ppanel-web&repository-url=https%3A%2F%2Fgithub.com%2Fperfect-panel%2Fppanel-web&root-directory=apps%2Fuser&skippable-integrations=1
[ppanel-admin-web-github]: https://github.com/perfect-panel/frontend/tree/main/apps/admin
[ppanel-admin-web-cover]: https://urlscan.io/liveshot/?width=1920&height=1080&url=https://admin.ppanel.dev
[ppanel-admin-web-preview]: https://admin.ppanel.dev
[ppanel-admin-web-deploy]: https://vercel.com/new/clone?demo-description=PPanel%20is%20a%20pure%2C%20professional%2C%20and%20perfect%20open-source%20proxy%20panel%20tool%2C%20designed%20to%20be%20your%20ideal%20choice%20for%20learning%20and%20practical%20use&demo-image=https%3A%2F%2Furlscan.io%2Fliveshot%2F%3Fwidth%3D1920%26height%3D1080%26url%3Dhttps%3A%2F%2Fadmin.ppanel.dev&demo-title=PPanel%20Admin%20Web&demo-url=https%3A%2F%2Fadmin.ppanel.dev%2F&from=.&project-name=ppanel-admin-web&repository-name=ppanel-web&repository-url=https%3A%2F%2Fgithub.com%2Fperfect-panel%2Fppanel-web&root-directory=apps%2Fadmin&skippable-integrations=1
