# Claude Code 协作规范

## 核心原则

**没有被要求修改的东西，一律不动。**

---

## 样式规范

### 必须使用 Design Token

所有颜色、间距、圆角、字体、阴影，必须使用项目的 CSS 变量，禁止硬编码。

**修改任何样式之前，必须先执行以下步骤：**

1. 读取 `packages/tokens/dist/tokens.css`，查找对应的 token 变量名
2. 确认变量名存在后再使用
3. 不确定用哪个 token 时，列出候选项后询问，不要自行决定

**禁止出现的写法：**
```css
/* ❌ 硬编码颜色 */
color: #333333;
background: rgb(255, 255, 255);
border-color: gray;

/* ❌ Tailwind 内置颜色 */
bg-gray-500
text-zinc-700
border-slate-200

/* ❌ 硬编码数值 */
border-radius: 8px;
font-size: 14px;
padding: 12px 16px;
```

**正确的写法：**
```css
/* ✅ CSS 变量 */
color: var(--color-text-primary);
background: var(--color-bg-primary);
border-color: var(--color-border-default);
border-radius: var(--radius-m-12);
```

**常用 token 速查：**

| 用途 | Token |
|---|---|
| 主要文字 | `--color-text-primary` |
| 次要文字 | `--color-text-secondary` |
| 三级文字 | `--color-text-tertiary` |
| 反色文字 | `--color-text-invert` |
| 主色填充 | `--color-fill-brand` |
| 次级填充 | `--color-fill-secondary` |
| 三级填充 | `--color-fill-tertiary` |
| 主背景 | `--color-bg-primary` |
| 次级背景 | `--color-bg-secondary` |
| 默认边框 | `--color-border-default` |
| 半透明边框 | `--color-border-translucent` |
| 小圆角 | `--radius-xs-6` |
| 中圆角 | `--radius-m-12` |
| 大圆角 | `--radius-l-16` |
| 超大圆角 | `--radius-xl-24` |

---

## 修改规范

### 改之前必须确认范围

收到修改请求后，先列出「将要修改的文件和内容」，等确认后再动手。

```
我将修改以下内容：
- docs/components/Playground.vue：控件区布局调整
- 不涉及其他文件

确认后开始修改。
```

### 只改被要求的部分

- 要求改布局，不要顺手改颜色
- 要求改颜色，不要顺手改间距
- 要求修复 bug，不要顺手重构逻辑
- **没有提到的文件，不要打开，不要修改**

### 修改后必须自检

每次修改完成后，检查以下内容：

- [ ] 是否有新增硬编码颜色？
- [ ] 是否有修改未被要求的样式？
- [ ] 是否有修改未被要求的文件？
- [ ] Dark mode 是否仍然正常？
- [ ] 是否破坏了原有的交互逻辑？

---

## 组件规范

### 不要修改组件源码

`docs/components/ui/` 下的组件文件是从项目直接拿来的，不要修改，只生成文档页引用它。

### 新建文件的位置

| 类型 | 位置 |
|---|---|
| UI 组件 | `docs/components/ui/` |
| 文档专用组件 | `docs/components/` |
| 文档页 | `docs/pages/components/[name].vue` |
| Token 页 | `docs/pages/tokens/[name].vue` |
| Composables | `docs/composables/` |

### 引用路径

```ts
// 组件引用
import Button from '~/components/ui/Button.vue'

// Token 数据
import { useTokens } from '~/composables/useTokens'
```

---

## 代码块规范

### 不要自己实现语法高亮

如果项目没有安装 shiki 或 highlight.js，用纯文本展示，不要手写高亮逻辑。

```vue
<!-- ✅ 简单可靠 -->
<pre class="code-block"><code>{{ codeString }}</code></pre>
```

### 代码内容必须真实

Usage tab 的代码必须反映当前 Playground 的真实 props 状态，不能是写死的字符串。

---

## 禁止行为清单

- ❌ 硬编码任何颜色、间距、圆角值
- ❌ 修改没有被要求修改的文件
- ❌ 修改 `docs/components/ui/` 下的组件源码
- ❌ 自行决定使用哪个 token，不确定时先问
- ❌ 顺手重构、顺手优化未被提及的代码
- ❌ 删除现有功能或交互
- ❌ 把任何 Tailwind 内置颜色当 token 使用（如 `bg-gray-*`、`text-zinc-*`）

---

## 遇到问题时

### 组件有外部业务依赖
列出依赖项，询问处理方式，不要自行决定删除或替换。

### 不知道用哪个 token
先读取 `packages/tokens/dist/tokens.css`，列出候选 token，询问后再使用。

### 要修改的范围超出预期
停下来，说明情况，等确认后再继续。
