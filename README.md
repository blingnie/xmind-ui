# Xmind UI Kit

Xmind 设计系统文档站。产品、设计、开发共享同一份 token 真相。

## 目录结构

```
xmind-ui/
├── packages/
│   ├── tokens/        # Design token（foundation.json + variables.json → CSS 变量）
│   └── components/    # Vue 3 组件（基于 Reka UI + Tailwind）
└── docs/              # 文档网站（Nuxt 3）
```

## 本地启动

**前置要求：** Node.js 20+、pnpm 9+

```bash
# 1. 安装依赖
pnpm install

# 2. 构建 token（首次必须执行，之后 token 有变更时再执行）
pnpm build:tokens

# 3. 启动文档网站
pnpm dev
```

浏览器访问 http://localhost:3000

## 更新 Token

1. 从 Figma 导出新的 `foundation.json` / `variables.json`
2. 覆盖 `packages/tokens/` 下的同名文件
3. 执行 `pnpm build:tokens`
4. 提交到 `main` 分支，CI 自动部署

## 新增组件

在 `packages/components/` 下新建文件夹，参考 `Button/` 的结构：

```
ComponentName/
├── ComponentName.vue        # 组件本体
└── ComponentName.config.ts  # props schema（驱动 Playground）
```

然后在 `docs/pages/components/` 下新建对应文档页，参考 `button.vue`。

## 部署

Push 到 `main` 分支后，GitHub Actions 自动构建并发布到 GitHub Pages。

> 首次部署前，在 `.github/workflows/deploy.yml` 中将 `NUXT_APP_BASE_URL` 改为你的实际仓库名。
