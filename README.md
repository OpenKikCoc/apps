# Binacs Apps

基于 Cloudflare Pages (Functions) + D1 的 Monorepo 应用集。

---

## 🚀 本地开发 (Docker)

```bash
# 1. 启动
docker-compose up -d --build

# 2. 初始化数据库 (首次)
docker-compose exec apps npm run db:init
```
访问: `http://localhost:8788`

---

## ☁️ 部署指南 (Zero Trust)

为防止部署间隙的公开访问，请**严格按序操作**：

### 1. 🛡️ 预设安全策略 (Pre-flight)
**先锁门，再上线。**
1.  **Cloudflare Zero Trust** -> **Access** -> **Applications** -> **Add Self-hosted**。
2.  **Application domain** (添加两个域名以防绕过):
    *   **Primary**: 计划使用的自定义域名 (如 `apps.binacs.space`)。
    *   **Secondary**: Pages 的默认域名 (如 prod `apps-xxx.pages.dev`, preview `*.apps-xxx.pages.dev`)。
3.  **Policy**: 设置鉴权规则 (如 Email Allow)。

### 2. ⚡️ Pages 初始化
**注意：请务必创建 Pages 项目，不要误选 Workers。**

1.  **Cloudflare Dashboard** -> **Workers & Pages** -> **Create application** -> **Pages** (标签页)**。
2.  选择本仓库。
3.  **Build settings** (关键配置):
    *   **Framework preset**: `None`
    *   **Build command**: `npm run build` (by default 可以不写)
    *   **Build output directory**: `public` (by default 可以不写)
    *   **Root directory**: `/` (默认)
    *   *(如果看到 "Deploy command" 选项，说明选错了项目类型，请重新创建 Pages 项目)*
4.  **Environment variables**: 添加 `AI_API_KEY` / `AI_MODEL`。
5.  **Save and Deploy**。

### 3. 🗄️ 数据库绑定
1.  **创建**: `npx wrangler d1 create apps-db` -> 复制 UUID 到 `wrangler.toml`。
2.  **绑定**: Pages Settings -> **Functions/Bindings** -> Add binding (`DB` -> `apps-db`)。
3.  **初始化**: `npx wrangler d1 execute apps-db --remote --file=schema.sql`。
4.  **重试部署**。

### 4. 🌐 域名上线
1.  Pages Settings -> **Custom domains** -> 绑定 `apps.binacs.space`。
2.  **验证**: 访问自定义域名和 Pages 默认域名，均应跳转 Access 登录页。

---

## 🛠️ 后续运维 (Operations)

### 1. 数据库变更
**新增表**: 修改 `schema.sql` 后执行:
```bash
# 本地
docker-compose exec apps npm run db:init
# 生产
npx wrangler d1 execute apps-db --remote --file=schema.sql
```

**修改表**: 创建迁移文件 `migrations/xxxx.sql` 后执行:
```bash
# 本地
docker-compose exec apps npx wrangler d1 execute apps-db --local --file=migrations/xxxx.sql
# 生产
npx wrangler d1 execute apps-db --remote --file=migrations/xxxx.sql
```

### 2. 新增模块
*   **前端**: `public/<module>/index.html`
*   **后端**: `functions/<module>/api/<logic>.js` (路由: `/<module>/api/<logic>`)
