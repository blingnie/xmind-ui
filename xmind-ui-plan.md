# Xmind UI Kit — 产品规划

> 一个面向 Xmind 内部的「设计系统枢纽」——产品用它对齐视觉语言，开发用它取用组件，设计用它管理 token，三端共享同一份真相。

---

## 产品定位

- **不是「组件库的说明书」，而是「Xmind 的用法规范」**
- 文档网站展示的是 Xmind 产品里组件应该怎么用、对应哪些 token、如何直接取用
- Reka UI 本身的 API 文档不重复，直接外链

---

## 架构总览

```
唯一真相层
└── JSON（foundation.json + component.json）← 所有人改这里
    ├── → 构建为 CSS 变量（开发用）
    └── → 未来可导出 Figma token（设计用）

组件库（packages/components）
└── 基于 Reka UI + Tailwind 封装的 Vue 3 组件
    └── 每个组件配套 .config.ts（驱动 Playground）

文档网站（docs/，Nuxt 3）
├── Token 展示页（自动从 JSON 构建）
├── 组件页（Playground + 代码面板 + Props 表）
├── 模板页（常见页面组合，面向产品经理）
├── Changelog
└── ⌘K 全局搜索
```

---

## 五大模块

### 1. Design Tokens 中心

Token 的唯一来源，驱动一切。

| 页面 | 内容 |
|---|---|
| Colors | 语义色（随 Light/Dark 切换）+ 原始色板，点击复制变量名 |
| Typography | 按分组预览字体规格，含字号、行高、字重、字间距 |
| Spacing | 可视化 bar 展示间距值，点击复制 |
| Radius | 实时圆角预览，点击复制 |
| Effects | 阴影颜色、模糊值，Light/Dark 切换查看 |

**变量命名规则**

| 前缀 | 含义 | 示例 |
|---|---|---|
| `--palette-*` | 原始色板，不直接在组件中使用 | `--palette-gray-800` |
| `--color-*` | 语义色，随主题切换 | `--color-text-primary` |
| `--spacing-*` | 间距 | `--spacing-padding-xxl-24` |
| `--radius-*` | 圆角 | `--radius-m-12` |
| `--typo-*` | 字体规格 | `--typo-interface-desktop-headline-large-size` |
| `--effect-*` | 阴影、模糊参数 | `--effect-drop-shadow-b1-01` |

---

### 2. 组件库（核心）

每个组件页包含：

- **Playground**：实时调整 props（variant / size / disabled / slot 内容等），即时渲染
- **代码面板**：展示当前 Playground 状态对应的完整 Vue 代码，一键复制
- **Props 文档表**：类型、默认值、说明
- **Figma 跳转链接**：直接定位到对应 Figma 组件

**Playground 控件自动映射**

| Prop 类型 | 控件 |
|---|---|
| `boolean` | Toggle |
| `string enum` | SegmentedControl |
| `string` | Input |
| `number` | Slider / Input |
| `slot` | Textarea（注入内容） |

**Phase 2 优先实现的 10 个高频组件**

Button / Input / Select / Dialog / Badge / Toast / Tabs / Checkbox / Switch / Tooltip

---

### 3. 模板页（面向产品经理）

提供若干完整页面组合示例，例如：
- 弹窗流程
- 表单页
- 空状态页

每个模板标注使用了哪些组件 + token，支持「在 Playground 中打开」。

产品经理的使用路径：

```
搜索组件名
    ↓
看视觉预览 + 交互说明（非技术语言）
    ↓
复制 Figma 跳转链接 → 直接在 Figma 里用
    ↓
需要开发实现时 → 把组件页链接甩给开发
```

---

### 4. Changelog

- 按版本号列出组件变更
- 标记 breaking change / 新增 / 废弃
- 文档版本永远对应组件库最新 stable 版本，不做多版本文档

---

### 5. 全局搜索（⌘K）

- 索引：组件名、token 名、props 名
- 结果直达对应锚点

---

## 技术方案

| 层 | 方案 |
|---|---|
| 框架 | Nuxt 3 + Vue 3 |
| 组件行为层 | Reka UI（无障碍、键盘交互开箱即用） |
| 样式层 | Tailwind CSS + CSS 变量（来自 token） |
| Token 构建 | `build.mjs`：JSON → CSS 变量，`pnpm build:tokens` 触发 |
| 代码高亮 | Shiki |
| 搜索 | Fuse.js（本地） |
| 部署 | GitHub Pages + GitHub Actions |

---

## 可维护性设计

| 维护任务 | 方式 | 难度 |
|---|---|---|
| 更新 token | 替换 JSON 文件 → `pnpm build:tokens` | 极低 |
| 新增组件 | 在 `packages/components/` 建文件夹，参考 Button 结构 | 低（vibe coding） |
| 新增文档页 | 在 `docs/pages/components/` 建 `.vue` 文件，参考 button.vue | 低 |
| 修改导航 | 编辑 `docs/layouts/default.vue` 里的 `nav` 数组 | 极低 |
| 部署 | Push 到 main 分支，自动触发 | 零操作 |

**核心原则：组件样式层由 vibe coding 生成，行为层由 Reka UI 保障，文档框架一次搭好后几乎不需要动。**

---

## 交付节奏

### Phase 1 — 地基（已完成）
- ✅ Monorepo 结构搭建
- ✅ Token 构建管道（JSON → CSS 变量）
- ✅ Nuxt 3 文档站框架
- ✅ 侧边导航 + Dark mode
- ✅ Colors / Typography / Spacing / Radius / Effects 展示页
- ✅ GitHub Pages 部署配置

### Phase 2 — Playground MVP
- Button 组件接入 Playground
- 代码面板联动
- 再接入 3～5 个高频组件

### Phase 3 — 产品侧价值
- 模板页
- Changelog
- ⌘K 全局搜索
- Figma token 自动同步管道

---

## 仓库结构

```
xmind-ui/
├── packages/
│   ├── tokens/
│   │   ├── foundation.json      原始色板、spacing、radius、typography
│   │   ├── component.json       语义色、Effects，含 Light/Dark
│   │   ├── build.mjs            构建脚本
│   │   └── dist/tokens.css      构建产物（自动生成）
│   └── components/
│       ├── types/component-config.ts
│       └── Button/
│           ├── Button.vue
│           └── Button.config.ts
└── docs/
    ├── nuxt.config.ts
    ├── composables/useTokens.ts
    ├── components/Playground.vue
    ├── layouts/default.vue
    └── pages/
        ├── index.vue
        ├── tokens/
        │   ├── colors.vue
        │   ├── typography.vue
        │   ├── spacing.vue
        │   ├── radius.vue
        │   └── effects.vue
        └── components/
            └── button.vue
```
