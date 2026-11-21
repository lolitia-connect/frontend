# 前端分离部署

本指南将帮助您独立部署 PPanel 前端应用，连接到已部署的后端服务。

## 概述

前端分离部署允许您将 PPanel 前端应用部署在独立的服务器或 CDN 上，通过 API 与后端服务通信。

PPanel 前端包含两个独立应用：
- **用户端** (`ppanel-user-web`): 面向最终用户的界面
- **管理端** (`ppanel-admin-web`): 面向管理员的后台管理界面

### 优势

- 🚀 利用 CDN 加速静态资源访问
- 🌍 支持多地域分发
- 📦 前端独立部署，不影响后端服务
- 🔄 便于前端快速迭代和更新
- 🎨 使用现代技术栈 (React 19, TypeScript, TailwindCSS 4)

## 前提条件

- 已完成[后端部署](./backend.md)
- 后端 API 地址（如 `https://api.your-domain.com`）
- 前端域名：
  - 用户端：`https://user.your-domain.com`
  - 管理端：`https://admin.your-domain.com`

## 技术栈

- **运行时**: Bun (推荐) / Node.js 20+
- **构建工具**: Vite 6
- **框架**: React 19 + TypeScript
- **路由**: TanStack Router
- **样式**: TailwindCSS 4
- **状态管理**: Zustand
- **国际化**: i18next
- **Monorepo**: Turborepo

## 部署方式

### 方式一：从源码构建（推荐）

#### 1. 环境准备

安装 Bun（推荐）：

```bash
# Linux/macOS
curl -fsSL https://bun.sh/install | bash

# Windows (WSL2)
curl -fsSL https://bun.sh/install | bash

# 验证安装
bun --version
```

或使用 Node.js (需要 20+)：

```bash
# 检查 Node.js 版本
node --version  # 应该是 v20 或更高
```

#### 2. 克隆代码仓库

```bash
git clone https://github.com/perfect-panel/frontend.git
cd frontend
```

#### 3. 安装依赖

```bash
# 使用 Bun（推荐，更快）
bun install

# 或使用 npm
npm install

# 或使用 pnpm
pnpm install
```

#### 4. 配置环境变量

在应用目录下创建环境配置文件。

**管理端配置** (`apps/admin/.env.production`)：

```bash
# 后端 API 地址（必需）
VITE_API_BASE_URL=https://api.your-domain.com

# CDN 地址（可选，用于加速静态资源）
VITE_CDN_URL=https://cdn.jsdmirror.com

# 启用教程文档（可选）
VITE_TUTORIAL_DOCUMENT=true

# 开发环境默认登录凭证（生产环境请留空）
VITE_USER_EMAIL=
VITE_USER_PASSWORD=
```

**用户端配置** (`apps/user/.env.production`)：

```bash
# 后端 API 地址（必需）
VITE_API_BASE_URL=https://api.your-domain.com

# CDN 地址（可选）
VITE_CDN_URL=https://cdn.jsdmirror.com

# 启用教程文档（可选）
VITE_TUTORIAL_DOCUMENT=true

# 显示落地页（可选，设为 false 则直接跳转登录页）
VITE_SHOW_LANDING_PAGE=true

# 开发环境默认登录凭证（生产环境请留空）
VITE_USER_EMAIL=
VITE_USER_PASSWORD=
```

#### 5. 构建应用

构建所有应用：

```bash
# 使用 Bun
bun run build

# 或使用 npm
npm run build
```

构建特定应用：

```bash
# 进入应用目录
cd apps/admin  # 或 apps/user

# 构建
bun run build  # 或 npm run build
```

构建完成后，静态文件将输出到：
- 管理端：`apps/admin/dist/`
- 用户端：`apps/user/dist/`

#### 6. 预览构建结果

```bash
# 在应用目录下
bun run serve  # 或 npm run serve

# 默认访问地址：
# 管理端：http://localhost:4173
# 用户端：http://localhost:4173
```

### 方式二：使用 Vercel 一键部署

#### 管理端部署

点击下方按钮一键部署到 Vercel：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?demo-description=PPanel%20is%20a%20pure%2C%20professional%2C%20and%20perfect%20open-source%20proxy%20panel%20tool&demo-image=https%3A%2F%2Furlscan.io%2Fliveshot%2F%3Fwidth%3D1920%26height%3D1080%26url%3Dhttps%3A%2F%2Fadmin.ppanel.dev&demo-title=PPanel%20Admin%20Web&repository-url=https%3A%2F%2Fgithub.com%2Fperfect-panel%2Ffrontend&root-directory=apps%2Fadmin)

#### 用户端部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?demo-description=PPanel%20is%20a%20pure%2C%20professional%2C%20and%20perfect%20open-source%20proxy%20panel%20tool&demo-image=https%3A%2F%2Furlscan.io%2Fliveshot%2F%3Fwidth%3D1920%26height%3D1080%26url%3Dhttps%3A%2F%2Fuser.ppanel.dev&demo-title=PPanel%20User%20Web&repository-url=https%3A%2F%2Fgithub.com%2Fperfect-panel%2Ffrontend&root-directory=apps%2Fuser)

部署后在 Vercel 控制台配置环境变量：
- `VITE_API_BASE_URL`: 你的后端 API 地址
- `VITE_CDN_URL`: CDN 地址（可选）

### 方式三：使用 Netlify 部署

用户端和管理端的 Git 部署已在各自的配置中启用 [Next.js 部署版本保护](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/#skew-protection)。发布新版本期间，Netlify 可以把受支持的资源和导航请求路由到浏览器正在使用的部署版本。Turborepo 会传递 Netlify 适配器设置的部署 ID，并将其纳入构建缓存键。Git 部署后，可在构建日志中查看 `Setting up Next.js Skew Protection`，并检查 Next.js 静态资源请求是否带有 `?dpl=`。

#### 1. 安装 Netlify CLI

```bash
npm install -g netlify-cli
```

#### 2. 登录 Netlify

```bash
netlify login
```

#### 3. 部署应用

```bash
# 管理端
cd apps/admin
bun run build
netlify deploy --prod --dir=dist

# 用户端
cd apps/user
bun run build
netlify deploy --prod --dir=dist
```

#### 4. 配置环境变量

在 Netlify 控制台的 Site settings → Build & deploy → Environment 中添加：
- `VITE_API_BASE_URL`
- `VITE_CDN_URL`

### 方式四：使用 Cloudflare Pages

#### 1. 连接 GitHub 仓库

登录 Cloudflare Dashboard → Workers & Pages → Create application → Pages → Connect to Git

#### 2. 配置构建设置

**管理端**：
- **Framework preset**: None
- **Build command**: `cd .. && bun install && cd apps/admin && bun run build`
- **Build output directory**: `apps/admin/dist`
- **Root directory**: `apps/admin`

**用户端**：
- **Framework preset**: None
- **Build command**: `cd .. && bun install && cd apps/user && bun run build`
- **Build output directory**: `apps/user/dist`
- **Root directory**: `apps/user`

#### 3. 配置环境变量

在 Settings → Environment variables 中添加：
- `VITE_API_BASE_URL`
- `VITE_CDN_URL`

## 自建服务器部署

### 使用 Nginx

#### 1. 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx -y

# CentOS/RHEL
sudo yum install nginx -y
```

#### 2. 上传构建文件

```bash
# 创建目录
sudo mkdir -p /var/www/ppanel/{admin,user}

# 上传构建文件
sudo cp -r apps/admin/dist/* /var/www/ppanel/admin/
sudo cp -r apps/user/dist/* /var/www/ppanel/user/

# 设置权限
sudo chown -R www-data:www-data /var/www/ppanel
```

#### 3. 配置 Nginx

**管理端配置** (`/etc/nginx/sites-available/ppanel-admin`)：

```nginx
server {
    listen 80;
    server_name admin.your-domain.com;

    root /var/www/ppanel/admin;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_vary on;
    gzip_min_length 1024;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

**用户端配置** (`/etc/nginx/sites-available/ppanel-user`)：

```nginx
server {
    listen 80;
    server_name user.your-domain.com;

    root /var/www/ppanel/user;
    index index.html;

    # 其他配置同管理端
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

#### 4. 启用站点

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/ppanel-admin /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/ppanel-user /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

#### 5. 配置 HTTPS（推荐）

使用 Certbot 自动配置 SSL 证书：

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书
sudo certbot --nginx -d admin.your-domain.com
sudo certbot --nginx -d user.your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

### 使用 Caddy

Caddy 自动处理 HTTPS，配置更简单。

#### 1. 安装 Caddy

```bash
# Ubuntu/Debian
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

#### 2. 配置 Caddyfile

创建 `/etc/caddy/Caddyfile`：

```caddy
admin.your-domain.com {
    root * /var/www/ppanel/admin
    encode gzip
    file_server

    try_files {path} /index.html

    @static {
        path *.js *.css *.png *.jpg *.jpeg *.gif *.ico *.svg *.woff *.woff2 *.ttf *.eot
    }
    header @static Cache-Control "public, max-age=31536000, immutable"

    header {
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff"
        X-XSS-Protection "1; mode=block"
    }
}

user.your-domain.com {
    root * /var/www/ppanel/user
    encode gzip
    file_server

    try_files {path} /index.html

    @static {
        path *.js *.css *.png *.jpg *.jpeg *.gif *.ico *.svg *.woff *.woff2 *.ttf *.eot
    }
    header @static Cache-Control "public, max-age=31536000, immutable"

    header {
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff"
        X-XSS-Protection "1; mode=block"
    }
}
```

#### 3. 启动 Caddy

```bash
sudo systemctl restart caddy
sudo systemctl enable caddy
```

## 配置 CDN

### Cloudflare 配置

1. 添加域名到 Cloudflare
2. 配置 DNS 记录指向源服务器
3. 启用以下优化选项：
   - **Auto Minify**: 启用 JavaScript、CSS、HTML 压缩
   - **Brotli**: 启用 Brotli 压缩
   - **Rocket Loader**: 启用 JS 异步加载（可选）
   - **Caching Level**: 设置为 Standard

4. 配置页面规则：
   ```
   *your-domain.com/*
   - Cache Level: Cache Everything
   - Edge Cache TTL: 1 month
   - Browser Cache TTL: Respect Existing Headers
   ```

### 阿里云 CDN

1. 创建 CDN 加速域名
2. 配置源站：指向前端服务器
3. 配置缓存规则：
   - 静态文件（js, css, 图片）：缓存 1 年
   - HTML 文件：缓存 5 分钟或不缓存
4. 启用 HTTPS 和 HTTP/2

## 环境变量说明

| 变量名 | 说明 | 必需 | 默认值 | 示例 |
|--------|------|------|--------|------|
| `VITE_API_BASE_URL` | 后端 API 地址 | ✅ | - | `https://api.your-domain.com` |
| `VITE_CDN_URL` | CDN 地址 | ❌ | `https://cdn.jsdmirror.com` | `https://cdn.your-domain.com` |
| `VITE_TUTORIAL_DOCUMENT` | 启用教程文档 | ❌ | `true` | `true` / `false` |
| `VITE_SHOW_LANDING_PAGE` | 显示落地页 | ❌ | `true` | `true` / `false` |
| `VITE_USER_EMAIL` | 默认登录邮箱（仅开发） | ❌ | - | - |
| `VITE_USER_PASSWORD` | 默认登录密码（仅开发） | ❌ | - | - |

## 验证部署

### 检查前端服务

```bash
# 访问前端地址
curl -I https://admin.your-domain.com
curl -I https://user.your-domain.com

# 预期输出
# HTTP/2 200
# content-type: text/html
```

### 检查 API 连接

在浏览器中打开前端地址，打开开发者工具：

1. 查看 Network 标签
2. 检查到 API 的请求是否成功
3. 确认请求地址正确（`https://api.your-domain.com`）
4. 查看响应数据是否正常

### 检查构建版本

访问 `/version.lock` 文件查看当前部署的版本：

```bash
curl https://admin.your-domain.com/version.lock
# 输出示例: 1.2.0
```

## 性能优化

### 1. 启用 HTTP/2

在 Nginx 中：

```nginx
listen 443 ssl http2;
```

### 2. 启用 Brotli 压缩

```bash
# 安装 Nginx Brotli 模块
sudo apt install libnginx-mod-http-brotli-filter libnginx-mod-http-brotli-static -y
```

在 Nginx 配置中：

```nginx
brotli on;
brotli_types text/plain text/css application/json application/javascript text/xml application/xml;
brotli_comp_level 6;
```

### 3. 预加载关键资源

构建时 Vite 已自动处理，会在 `index.html` 中添加 `<link rel="modulepreload">`。

### 4. 启用 Service Worker

前端已内置 PWA 支持，构建后自动启用 Service Worker 缓存。

### 5. 使用 CDN 加速

配置 `VITE_CDN_URL` 环境变量，将静态资源加载从 CDN 获取。

## 故障排查

### API 请求失败

**问题**: 前端无法连接到后端 API

**解决方案**:
1. 检查 `VITE_API_BASE_URL` 是否正确配置
2. 检查后端 CORS 配置是否允许前端域名
3. 打开浏览器控制台查看具体错误信息
4. 使用 `curl` 测试后端 API 是否可访问

```bash
curl https://api.your-domain.com/api/health
```

### 页面路由 404

**问题**: 刷新页面或直接访问子路由返回 404

**解决方案**: 确保 Web 服务器配置了 SPA 回退

```nginx
# Nginx
try_files $uri $uri/ /index.html;

# Apache (.htaccess)
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### 静态资源加载失败

**问题**: JS/CSS 文件 404 或无法加载

**解决方案**:
1. 检查文件权限
2. 检查 Nginx `root` 路径是否正确
3. 清除浏览器缓存
4. 检查 CDN 配置

### 构建失败

**问题**: `bun run build` 或 `npm run build` 失败

**解决方案**:
1. 确保 Node.js 版本 >= 20
2. 删除 `node_modules` 和锁文件，重新安装
   ```bash
   rm -rf node_modules bun.lockb
   bun install
   ```
3. 检查是否有语法错误或类型错误
   ```bash
   bun run check
   ```

## 更新部署

### 从源码更新

```bash
# 拉取最新代码
git pull origin main

# 重新安装依赖
bun install

# 重新构建
bun run build

# 更新文件
sudo rm -rf /var/www/ppanel/admin
sudo rm -rf /var/www/ppanel/user
sudo cp -r apps/admin/dist /var/www/ppanel/admin
sudo cp -r apps/user/dist /var/www/ppanel/user

# 清除 CDN 缓存（如使用 CDN）
```

### Vercel 更新

Vercel 会自动监听 GitHub 仓库变动并自动部署。也可以手动触发：

```bash
vercel --prod
```

### Netlify 更新

```bash
cd apps/admin  # 或 apps/user
bun run build
netlify deploy --prod
```

## 安全建议

1. **启用 HTTPS**: 必须使用 SSL/TLS 证书
2. **配置 CSP**: 内容安全策略
   ```nginx
   add_header Content-Security-Policy "default-src 'self'; connect-src 'self' https://api.your-domain.com; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval';";
   ```
3. **设置安全头**: 已在 Nginx 配置中包含
4. **禁用目录浏览**: `Options -Indexes` (Apache) 或 `autoindex off;` (Nginx)
5. **限制文件上传大小**:
   ```nginx
   client_max_body_size 10M;
   ```

## 监控和分析

### 添加网站分析

支持 Google Analytics、Umami、Plausible 等。

配置方式：在 `index.html` 中添加追踪代码，或使用环境变量配置。

### 错误追踪

三个 Next.js 应用均可选用 Sentry 监控。开发模式（`next dev`）和测试不会向 Sentry 发送数据，即使本地 `.env` 中已配置 DSN。在 Netlify 中，为每个已部署的站点设置 `NEXT_PUBLIC_SENTRY_DSN`，值为对应 Sentry 项目的公开 DSN，环境选 **Production**，作用范围选 **Builds**。不要在 Deploy Preview 或 Branch Deploy 中设置 DSN，因为这些环境也使用 Next.js 生产构建。只有生产构建且 DSN 非空时才会上报。可选在构建时设置 `NEXT_PUBLIC_SENTRY_RELEASE`，值为部署对应的提交 SHA 或发布标识。生产环境链路采样率为 10%。不要提交本地环境文件，也不要把认证令牌放进任何 `NEXT_PUBLIC_*` 变量。

集成会发送已脱敏的错误和链路数据，不在错误事件中发送请求体、请求头、Cookie、URL 查询参数值或堆栈源码片段。显式发送到 Sentry 的日志只保留通用消息和级别。

三个浏览器应用均使用同一个生产 DSN 条件来启用 Session Replay。发生错误时会保存缓冲的回放。页面文字和输入值会脱敏，媒体、原始 URL、控制台输出、网络详情和录制的样式表会被过滤。可在 Sentry 的错误详情里打开关联回放，查看页面结构和操作。

当无头 Chrome 加载 Netlify 部署专属地址时，浏览器上报会过滤 React 水合错误 `#418`。这个规则针对 Netlify 截图服务使用的访问模式。[Netlify 截图服务说明](https://answers.netlify.com/t/user-agent-for-netlify-bots/21577)

要将生产堆栈还原到原始文件、行号和列号，请创建 [Sentry 组织 CI 令牌](https://docs.sentry.io/account/auth-tokens/)，并在每个已部署的 Netlify 站点中将 `SENTRY_AUTH_TOKEN` 设为 **Production → Builds** 的秘密变量。不要加 `NEXT_PUBLIC_` 前缀，也不要提交令牌。生产环境请留空开发默认登录变量 `NEXT_PUBLIC_USER_EMAIL` 和 `NEXT_PUBLIC_USER_PASSWORD`。构建使用应用对应的 Sentry 项目，并默认以部署的提交 SHA 作为版本标识，可用 `NEXT_PUBLIC_SENTRY_RELEASE` 覆盖。SDK 通过 Debug ID 将新事件与上传的构建产物关联，部署前会移除浏览器映射文件；开发和预览构建不会上传。上传的构建产物存储在 Sentry，可包含映射中的源码片段。映射只对部署后收到的新错误生效。

## 开发和生产环境

### 本地开发

```bash
# 使用开发服务器
cd apps/admin  # 或 apps/user
bun run dev

# 管理端默认运行在 http://localhost:3001
# 用户端默认运行在 http://localhost:3000
```

开发环境会使用 Vite 的代理功能，将 API 请求代理到后端。

### 预览生产构建

```bash
# 构建后预览
bun run build
bun run serve
```

## 下一步

- [后端分离部署](./backend.md) - 如果还未部署后端
- [节点端安装](../node/installation.md) - 部署节点服务
- [功能文档](/zh/admin/dashboard) - 了解功能使用
