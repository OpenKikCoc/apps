# Binacs Apps

基于 Cloudflare Pages (Functions) + D1 的 Monorepo 应用集。

*   💊 **Medician**: 家庭药箱管理
*   📝 **Pastebin**: 代码/笔记剪贴板

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
2.  **Domain**: 填入计划使用的完整域名 (如 `apps.binacs.space`)。
3.  **Policy**: 设置鉴权规则 (如 Email Allow)。
4.  **Save**。*(此时拦截已生效)*

### 2. ⚡️ Pages 初始化
1.  **Cloudflare Dashboard** -> **Pages** -> **Connect to Git** (`binacs-apps`)。
2.  **Build output**: `public`。
3.  **Environment variables**: 添加 `AI_API_KEY` (Gemini API Key)。
4.  **Save and Deploy**。

### 3. 🗄️ 数据库绑定
1.  **创建**: `npx wrangler d1 create apps-db` -> 复制 UUID 到 `wrangler.toml`。
2.  **绑定**: Pages Settings -> **Functions/Bindings** -> Add binding (`DB` -> `apps-db`)。
3.  **初始化**: `npx wrangler d1 execute apps-db --remote --file=schema.sql`。
4.  **重试部署**: Deployments -> **Retry deployment** (使绑定生效)。

### 4. 🌐 域名上线
1.  Pages Settings -> **Custom domains** -> 绑定 `apps.binacs.space`。
2.  **验证**: 访问域名应直接跳转 Access 登录页。
