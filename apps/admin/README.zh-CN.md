<a name="readme-top"></a>

<div align="center">

<img width="160" src="https://raw.githubusercontent.com/perfect-panel/ppanel-assets/refs/heads/main/logo.svg">

<h1>PPanel 管理后台</h1>

这是由 PPanel 提供支持的 PPanel 管理后台

[英文](./README.md)
·
中文
·
[更新日志](../../CHANGELOG.md)
·
[报告问题][issues-link]
·
[请求功能][issues-link]

<!-- SHIELD GROUP -->

[![][github-release-shield]][github-release-link]
[![][github-releasedate-shield]][github-releasedate-link]
[![][github-action-release-shield]][github-action-release-link]<br/>
[![][github-contributors-shield]][github-contributors-link]
[![][github-forks-shield]][github-forks-link]
[![][github-stars-shield]][github-stars-link]
[![][github-issues-shield]][github-issues-link]
[![][github-license-shield]][github-license-link]

![](https://urlscan.io/liveshot/?width=1920&height=1080&url=https://admin.ppanel.dev)

</div>

<details>
<summary><kbd>目录</kbd></summary>

#### 目录

- [⌨️ 本地开发](#️-本地开发)
- [抽屉布局约定](#抽屉布局约定)
- [🚀 在 Vercel 上部署](#-在-vercel-上部署)
- [🤝 贡献](#-贡献)
- [📝 许可证](#-许可证)

####

</details>

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

# 运行开发服务器
cd apps/admin
bun dev
```

在浏览器中打开 <http://localhost:3000> 查看结果。

## 抽屉布局约定

管理端业务抽屉的统一样式位于 [app/drawers.css](./app/drawers.css)，仅由管理端根布局加载：

- 桌面端宽度上限为 **60rem（960px）**，保留少量视口边距；小于 40rem 的手机视口使用全宽。移动导航单独将外层 `Sheet.Content` 限制为 **18rem（288px）**，并至少留出 2rem 遮罩空间；内部侧栏填满该宽度，不套用业务抽屉规则。
- 宽度应设置在 `Sheet.Content`，而不只是 `Sheet.Dialog`，避免被 HeroUI 外层默认宽度限制；新表单不要再单独写固定抽屉宽度。
- 标题与底部操作区放在滚动内容外。正文使用直接位于对话框下的 `ScrollArea`，表格或编辑器可用 `admin-drawer-body`，不再依赖硬编码的页头/页脚高度相减。
- 短字段可用 `admin-drawer-form` 两列排布，长内容用 `admin-drawer-wide` 独占一行。网格按照抽屉实际宽度切换为单列，重复输入组自动换行，保留可用的输入宽度和增删按钮。
- 长标签、说明、工单消息自动换行；下拉框已选值可省略显示但不改变原值。工单正文独立滚动，回复栏保持可见。

[抽屉浏览器回归测试](./tests/e2e/drawers.spec.ts) 覆盖桌面/手机布局、嵌套抽屉、长内容及原有表单提交数据。从仓库根目录运行：

```bash
bun x playwright test --config apps/admin/playwright.config.ts drawers.spec.ts
```

## 页头面包屑

[页头](./src/layout/header.tsx) 的面包屑保持单行，空间不足时可横向滚动查看完整路径。左侧区域允许收缩，右侧语言、时区、主题和账户按钮保持可见。[布局回归测试](./tests/e2e/layout.spec.ts) 中的 `breadcrumbs scroll` 用例覆盖中英文、320–1280px 宽度、滚动和上级链接导航。

## 设置入口交互

系统设置、认证控制、营销的各个入口，以及订阅配置入口和服务器管理顶部的两个入口，统一使用整卡片式的 `settings-option` 触发：整张卡片就是一个可点击按钮，样式与 HeroUI 卡片一致（表面背景、`shadow-surface` 阴影、圆角，浅色模式下带一条细边），并沿用 HeroUI 原生悬浮、按下缩放和键盘焦点反馈。每个入口点击后打开对应配置抽屉；入口之间用间距（`space-y-3`）堆叠，而不是放进列表容器。共同的尺寸和文字布局位于 [共享样式](../../packages/ui/src/styles/globals.css)。入口内容采用“图标 + 可收缩的文字容器 + 箭头”结构，长文字自动换行，图标和箭头保持尺寸；服务器列表工具栏在窄屏下自动换行，避免横向溢出。

[布局回归测试](./tests/e2e/layout.spec.ts) 覆盖中英文、明暗主题、320–1280px 宽度及点击打开抽屉：

```bash
bun x playwright test --config apps/admin/playwright.config.ts layout.spec.ts --grep "settings options wrap|settings lists open"
```

## 🚀 在 Vercel 上部署

[![使用 Vercel 部署](https://vercel.com/button)](https://vercel.com/new/clone?demo-description=PPanel%20is%20a%20pure%2C%20professional%2C%20and%20perfect%20open-source%20proxy%20panel%20tool%2C%20designed%20to%20be%20your%20ideal%20choice%20for%20learning%20and%20practical%20use&demo-image=https%3A%2F%2Furlscan.io%2Fliveshot%2F%3Fwidth%3D1920%26height%3D1080%26url%3Dhttps%3A%2F%2Fadmin.ppanel.dev&demo-title=PPanel%20Admin%20Web&demo-url=https%3A%2F%2Fadmin.ppanel.dev%2F&from=.&project-name=ppanel-admin-web&repository-name=ppanel-web&repository-url=https%3A%2F%2Fgithub.com%2Fperfect-panel%2Fppanel-web&root-directory=apps%2Fadmin&skippable-integrations=1)

部署 Next.js 应用的最简单方式是使用
[ Vercel 平台](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)
由 Next.js 的创建者提供支持。

查看我们的
[Next.js 部署文档](https://nextjs.org/docs/deployment)
获取更多详情。

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
[codespaces-link]: https://codespaces.new/perfect-panel/frontend
[codespaces-shield]: https://github.com/codespaces/badge.svg
[contributors-contrib]: https://contrib.rocks/image?repo=perfect-panel/frontend
[contributors-url]: https://github.com/perfect-panel/frontend/graphs/contributors
[github-action-release-link]: https://github.com/perfect-panel/frontend/actions/workflows/release.yml
[github-action-release-shield]: https://img.shields.io/github/actions/workflow/status/perfect-panel/frontend/release.yml?label=release&labelColor=black&logo=githubactions&logoColor=white&style=flat-square
[github-contributors-link]: https://github.com/perfect-panel/frontend/graphs/contributors
[github-contributors-shield]: https://img.shields.io/github/contributors/perfect-panel/frontend?color=c4f042&labelColor=black&style=flat-square
[github-forks-link]: https://github.com/perfect-panel/frontend/network/members
[github-forks-shield]: https://img.shields.io/github/forks/perfect-panel/frontend?color=8ae8ff&labelColor=black&style=flat-square
[github-issues-link]: https://github.com/perfect-panel/frontend/issues
[github-issues-shield]: https://img.shields.io/github/issues/perfect-panel/frontend?color=ff80eb&labelColor=black&style=flat-square
[github-license-link]: https://github.com/perfect-panel/frontend/blob/main/LICENSE
[github-license-shield]: https://img.shields.io/github/license/perfect-panel/frontend?color=white&labelColor=black&style=flat-square
[github-release-link]: https://github.com/perfect-panel/frontend/releases
[github-release-shield]: https://img.shields.io/github/v/release/perfect-panel/frontend?style=flat-square&sort=semver&logo=github
[github-releasedate-link]: https://github.com/perfect-panel/frontend/releases
[github-releasedate-shield]: https://img.shields.io/github/release-date/perfect-panel/frontend?labelColor=black&style=flat-square
[github-stars-link]: https://github.com/perfect-panel/frontend/network/stargazers
[github-stars-shield]: https://img.shields.io/github/stars/perfect-panel/frontend?color=ffcb47&labelColor=black&style=flat-square
[gitpod-link]: https://gitpod.io/#https://github.com/perfect-panel/frontend
[issues-link]: https://github.com/perfect-panel/frontend/issues/new/choose
[pr-welcome-link]: https://github.com/perfect-panel/frontend/pulls
[pr-welcome-shield]: https://img.shields.io/badge/🤯_pr_welcome-%E2%86%92-ffcb47?labelColor=black&style=for-the-badge
[profile-link]: https://github.com/perfect-panel
