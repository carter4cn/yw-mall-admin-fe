# yw-mall-admin-fe

yw-mall 后台前端工程，包含两个独立的 SPA。

## 目录结构

```
yw-mall-admin-fe/
  admin/      平台管理员后台（Vue 3 + TS + Vite + Element Plus）
  merchant/   店家后台（占位，后续实现）
```

## admin/ 启动

```bash
cd admin
pnpm install
pnpm run dev        # http://localhost:5174
pnpm run build      # 输出到 admin/dist
```

开发环境通过 Vite proxy 把 `/admin/v1` 转发到 `http://localhost:18999`（后端 API gateway）。

## merchant/ 启动

待实现。计划复制 admin/ 脚手架后改造。
