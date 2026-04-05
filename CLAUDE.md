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


| 遮罩背景（浅） | `--color-mask-overlays` |
| 遮罩背景（中） | `--color-mask-overlaym` |
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

`docs/components/ui/` 下的组件文件是从项目直接拿来的，不要修改，只生成文档页引用或是参考它。

### 新建文件的位置

| 类型 | 位置 |
|---|---|
| UI 组件 | `packages/components/[ComponentName]/` |
| 文档专用组件 | `docs/components/` |
| 文档页 | `docs/pages/components/[name].vue` |
| Token 页 | `docs/pages/tokens/[name].vue` |
| Composables | `docs/composables/` |

### 引用路径

```ts
// UI 组件引用（从 packages 直接引用）
import Button from '../../../packages/components/Button/Button.vue'

// 文档专用组件
import SimpleCodeBlock from '~/components/SimpleCodeBlock.vue'
import Playground from '~/components/Playground.vue'
import DocTableOfContents from '~/components/DocTableOfContents.vue'
import PlatformLink from '~/components/PlatformLink.vue'

// Token 数据
import { useTokens } from '~/composables/useTokens'

// SVG 图标（raw 方式引入，用 v-html 渲染）
import SomeIcon from '~/components/icon/fw-icons/some-icon.svg?raw'
```

---

## 组件开发标准

> 以 `packages/components/Button/` 为标准参考。

### 文件结构

每个组件目录包含：
```
packages/components/[ComponentName]/
  [ComponentName].vue   # 组件主文件
  [asset].svg           # 如有内嵌 SVG 资源（如 spinner）
```

### 组件代码规范

**Props 定义：** 用 TypeScript interface + `withDefaults`，类型单独 export。

```ts
export type ComponentVariant = 'default' | 'primary'
export type ComponentSize = 'small' | 'medium' | 'large'

interface ComponentProps {
  variant?: ComponentVariant
  size?: ComponentSize
  disabled?: boolean
}

const props = withDefaults(defineProps<ComponentProps>(), {
  variant: 'default',
  size: 'medium',
  disabled: false,
})
```

**class 生成：** 统一用 computed 数组 + filter(Boolean).join(' ')。

```ts
const componentClasses = computed(() => {
  return [
    'component',
    `component--${props.variant}`,
    `component--${props.size}`,
    props.disabled && 'component--disabled',
  ].filter(Boolean).join(' ')
})
```

**CSS 命名：** BEM 风格，以组件名为 block。

```css
.button { }
.button--primary { }
.button--disabled { }
.button__icon { }
.button__icon--left { }
```

**所有样式值必须使用 token**，禁止硬编码。

---

### Emits 规范

统一用 TypeScript 泛型写法，不用字符串数组形式。

```ts
// ✅ 正确
const emit = defineEmits<{
  click: [event: MouseEvent]
  change: [value: string]
}>()

// ❌ 禁止
const emit = defineEmits(['click', 'change'])
```

**命名规范：**
- 用动词原形，不加 `on` 前缀：`click`、`change`、`close`、`open`
- 多词用 kebab-case：`visibility-change`
- 有值变更统一用 `update:modelValue`（配合 `defineModel`）

---

### Slots 规范

**什么时候用 slot：**
- 内容不固定、调用方需要自定义的地方用 slot
- 纯文字内容用 prop，复杂结构用 slot

**命名规范：**
- 默认内容用 `default`（不命名）
- 左侧图标用 `icon-left`，右侧图标用 `icon-right`
- 触发器用 `trigger`，弹出内容用 `content`
- 多词用 kebab-case

**Fallback：** slot 有合理默认值时提供 fallback，没有时不写。

---

### 状态处理规范

**disabled：**
- 通过 CSS class `component--disabled` 控制样式
- 通过 `:disabled` attribute 控制原生表单元素
- disabled 状态下阻止 emit，不在模板里用 `v-if` 切换结构

**loading：**
- loading 自动 implies disabled：`const isDisabled = computed(() => props.disabled || props.loading)`
- loading 时渲染 spinner，不隐藏原有内容（保持宽度稳定）
- spinner 用 `aria-hidden="true"`

**状态优先级：** `disabled` > `loading` > `hover` > `normal`

```ts
// ✅ 标准模式
const isDisabled = computed(() => props.disabled || props.loading)

const componentClasses = computed(() => [
  'component',
  props.loading && 'component--loading',
  isDisabled.value && 'component--disabled',
].filter(Boolean).join(' '))
```

---

### SVG 资源规范

**用 `?raw` + `v-html`：** 图标需要跟随 `currentColor` 变色时。

```ts
import TrashIcon from '~/components/icon/fw-icons/trash.svg?raw'
```
```vue
<div style="width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;" v-html="TrashIcon" />
```

**组件内部固定 SVG（如 spinner）：** 同样用 `?raw` + `v-html`，SVG 单独建文件放在组件目录下。

```ts
import SpinnerSvg from './spinner.svg?raw'
```
```vue
<span v-html="SpinnerSvg" />
```

**禁止：**
- ❌ 把 SVG 路径字符串硬写在 `.vue` 文件里
- ❌ 用 `<img src="...svg">` 引入需要变色的图标
- ❌ 复杂 SVG（超过 3 行路径）直接内联在模板里，必须单独建文件

---

### 组件 token 命名规范

组件级 token 遵循以下层级结构：

```
--[component]-[part]-[variant]-[state]
```

| 层级 | 说明 | 示例值 |
|---|---|---|
| component | 组件名 | `button`、`input`、`checkbox` |
| part | 组件部位 | `bg`、`content`、`border`、`icon` |
| variant | 变体 | `default`、`primary`、`danger` |
| state | 状态 | `normal`、`hover`、`pressed`、`disable` |

```css
/* ✅ 标准命名示例 */
var(--button-bg-default-normal)
var(--button-bg-primary-hover)
var(--button-content-default-disable)
var(--button-border-default-normal)
```

不确定 token 名称时，先读 `packages/tokens/dist/tokens.css` 查找，不要猜测。

---

### 表单类组件规范

有值交互的组件（Input、Checkbox、Textarea、Switch 等）额外遵守：

**1. 必须用 `defineModel`：**

```ts
// ✅ 正确
const value = defineModel<string>({ required: true })
const checked = defineModel<boolean>({ default: false, required: true })

// ❌ 禁止手动写 modelValue prop + update:modelValue emit
```

**2. 必须 `defineExpose` 原生方法：**

```ts
const inputElement = ref<HTMLInputElement>()

defineExpose({
  focus: () => inputElement.value?.focus(),
  blur: () => inputElement.value?.blur(),
  select: () => inputElement.value?.select(),
  inputElement,
})
```

**3. 禁止引入 `twMerge` / `clsx`：**

UI Kit 组件不依赖这两个库，class 合并统一用原生数组方式：

```ts
// ✅ 正确
const classes = computed(() => [
  'input',
  `input--${props.size}`,
  props.disabled && 'input--disabled',
].filter(Boolean).join(' '))

// ❌ 禁止
import { twMerge } from 'tailwind-merge'
import clsx from 'clsx'
```

---

## 文档页开发标准

> 以 `docs/pages/components/button.vue` 为标准参考。

### 页面整体结构

```vue
<template>
  <div class="doc-page-layout">
    <!-- 左侧主内容 -->
    <div class="doc-page-content">
      <h1 class="text-xl">组件名</h1>
      <p class="text-sm text-[var(--color-text-tertiary)]">描述文字</p>

      <!-- Figma 链接 -->
      <PlatformLink href="..." label="Figma" :icon="FigmaIcon" />

      <!-- 1. 默认预览 -->
      <section id="preview" class="doc-section">...</section>

      <!-- 2. Playground -->
      <section id="playground" class="doc-section">...</section>

      <!-- 3. API Reference -->
      <section id="api" class="doc-section">...</section>

      <!-- 4. Examples -->
      <section id="examples" class="doc-section">...</section>
    </div>

    <!-- 右侧锚点导航（xl 及以上显示） -->
    <DocTableOfContents :items="tocItems" class="hidden xl:block" />
  </div>
</template>
```

### 默认预览区（#preview）

```vue
<section id="preview" class="doc-section">
  <div class="preview-card">
    <div class="preview-area">
      <!-- 放一个最典型的默认用法 -->
      <ComponentName variant="secondary" size="medium">文字</ComponentName>
    </div>
    <div class="pt-2 px-4 pb-4 border-t border-[var(--color-border-translucent)]">
      <Tabs v-model="activeTab" :tabs="['Usage', 'Source']" />
      <SimpleCodeBlock :code="activeTab === 'Usage' ? defaultUsage : componentSource" language="vue" height="280px" />
    </div>
  </div>
</section>
```

### Playground 区（#playground）

```vue
<section id="playground" class="doc-section">
  <h2>Playground</h2>
  <Playground :config="playgroundConfig">
    <template #default="{ props, slots }">
      <ComponentName v-bind="props">{{ slots.default }}</ComponentName>
    </template>
  </Playground>
</section>
```

**playgroundConfig 结构：**

```ts
const playgroundConfig = {
  name: 'ComponentName',
  props: {
    variant: {
      label: 'Variant',
      type: 'select' as const,
      defaultValue: 'default',
      options: [
        { label: 'Default', value: 'default' },
      ]
    },
    disabled: {
      label: 'Disabled',
      type: 'boolean' as const,
      defaultValue: false
    },
  },
  slots: {
    default: {
      label: 'Text',
      defaultValue: '默认文字'
    }
  }
}
```

prop 类型只有三种：`'select'`、`'boolean'`、`'text'`，必须加 `as const`。

### API 表格区（#api）

三种表格列数规范，CSS class 对应：

| 用途 | Class |
|---|---|
| Props（4列：Name / Type / Default / Description） | `api-table` |
| Events（3列：Name / Payload / Description） | `api-table api-table--3-cols` |
| Slots（2列：Name / Description） | `api-table api-table--2-cols` |

每行 span 必须带 `data-label` 属性（供移动端显示列标题用）：

```vue
<div class="api-table__row">
  <span data-label="Name"><code>variant</code></span>
  <span data-label="Type"><code>ButtonVariant</code></span>
  <span data-label="Default"><code>'default'</code></span>
  <span data-label="Description">描述</span>
</div>
```

### Examples 区（#examples）

每个 example block 结构：

```vue
<div id="example-[name]" class="example-block">
  <h3>示例标题</h3>
  <div class="preview-card">
    <div class="preview-area">
      <!-- 示例组件 -->
    </div>
    <div class="p-4 border-t border-[var(--color-border-translucent)]">
      <SimpleCodeBlock :code="xxxUsage" language="vue" />
    </div>
  </div>
</div>
```

### tocItems 规范

```ts
const tocItems = ref([
  { id: 'playground', text: 'Playground', level: 2 },
  { id: 'api', text: 'API', level: 2 },
  { id: 'props', text: 'Props', level: 3 },
  { id: 'events', text: 'Events', level: 3 },
  { id: 'slots', text: 'Slots', level: 3 },
  { id: 'examples', text: 'Examples', level: 2 },
  { id: 'example-variants', text: 'Variants', level: 3 },
  // ...每个 example block 对应一项
])
```

### 页面级 CSS 规范

文档页 `<style scoped>` 中只写页面布局相关的样式，所有通用结构（`.doc-page-layout`、`.doc-section`、`.preview-card`、`.preview-area`、`.example-block`、`.api-table` 系列）**必须从 button.vue 的样式中完整复制**，不要修改，不要简化。

---

## 添加新组件的标准流程

每次新增一个组件，按以下顺序操作：

```
1. 在 packages/components/[Name]/ 下创建组件文件
2. 在 docs/pages/components/[name].vue 下创建文档页
3. 在文档站的导航配置中注册路由和菜单项
```

**第 1 步和第 2 步分开确认**，不要一次性全部写完再提交。先写组件，确认没问题后再写文档页。

文档页必须包含的内容（缺一不可）：
- [ ] 组件名 + 描述（含 Usage Guidelines）
- [ ] Figma 链接（PlatformLink）
- [ ] 默认预览（Usage / Source tab）
- [ ] Playground
- [ ] API 表格（Props / Events / Slots）
- [ ] 至少 3 个 Example block
- [ ] tocItems（与页面 section id 完全对应）

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
- ❌ 跳过确认步骤直接写代码
- ❌ 组件和文档页一次性全写完再提交，必须分步确认

---

## 遇到问题时

### 组件有外部业务依赖
列出依赖项，询问处理方式，不要自行决定删除或替换。

### 不知道用哪个 token
先读取 `packages/tokens/dist/tokens.css`，列出候选 token，询问后再使用。

### 要修改的范围超出预期
停下来，说明情况，等确认后再继续。

### 对答
全程用中文回答问题
