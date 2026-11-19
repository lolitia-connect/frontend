<a name="readme-top"></a>

<div align="center">

<img width="160" src="https://raw.githubusercontent.com/perfect-panel/ppanel-assets/refs/heads/main/logo.svg">

<h1>PPanel 用户端</h1>

这是由 PPanel 提供支持的 PPanel 用户端

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

![](https://urlscan.io/liveshot/?width=1920&height=1080&url=https://user.ppanel.dev)

</div>

<details>
<summary><kbd>目录</kbd></summary>

#### 目录

- [⌨️ 本地开发](#️-本地开发)
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
cd apps/user
bun dev
```

在浏览器中打开 <http://localhost:3000> 查看结果。

### 首页组件风格

首页沿用用户主界面的 HeroUI `Card`、`Card.Title`、`Card.Description`、`Chip` 和共享按钮封装，
使用主题默认的背景、表面色、圆角和交互状态。首页服务介绍和套餐卡片不单独覆盖玻璃背景、
阴影或悬浮位移动效；首屏的 WebGL 地球动画保持独立。

### 主内容区空状态

页面级空状态使用 [MainEmpty](./src/components/main-empty.tsx)，采用与工单支持列表一致的
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

## 🚀 在 Vercel 上部署

[![使用 Vercel 部署](https://vercel.com/button)](https://vercel.com/new/clone?demo-description=PPanel%20is%20a%20pure%2C%20professional%2C%20and%20perfect%20open-source%20proxy%20panel%20tool%2C%20designed%20to%20be%20your%20ideal%20choice%20for%20learning%20and%20practical%20use&demo-image=https%3A%2F%2Furlscan.io%2Fliveshot%2F%3Fwidth%3D1920%26height%3D1080%26url%3Dhttps%3A%2F%2Fuser.ppanel.dev&demo-title=PPanel%20User%20Web&demo-url=https%3A%2F%2Fuser.ppanel.dev%2F&from=.&project-name=ppanel-user-web&repository-name=ppanel-web&repository-url=https%3A%2F%2Fgithub.com%2Fperfect-panel%2Fppanel-web&root-directory=apps%2Fuser&skippable-integrations=1)

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
