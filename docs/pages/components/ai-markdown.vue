<template>
  <div class="doc-page-layout">
    <!-- Main Content -->
    <div class="doc-page-content">
      <h1 class="text-xl">Markdown</h1>
      <p class="text-sm text-[var(--color-text-tertiary)]" style="margin-bottom: 0;">A Markdown renderer component that parses Markdown syntax and displays formatted content with proper styling. Supports headings, paragraphs, lists, code blocks, tables, blockquotes, horizontal rules, and links.</p>

      <!-- Figma Link -->
      <PlatformLink
        href="https://www.figma.com/design/1Zb3WXCH66yxr6O4i7DFDg/xmind-UI-Components?node-id=16299-12638"
        label="Figma"
        :icon="FigmaIcon"
      />

      <!-- Default preview -->
      <section id="default" class="doc-section">
        <h2>Default</h2>
        <div class="preview-card">
          <PreviewArea align="left" class="preview-area--markdown">
            <AiMarkdown :content="defaultContent" />
          </PreviewArea>
          <div class="pt-2 px-4 pb-4 border-t border-[var(--color-border-translucent)]">
            <Tabs v-model="activeTab" :tabs="['Usage', 'Source']" />
            <SimpleCodeBlock :code="activeTab === 'Usage' ? defaultUsage : componentSource" language="vue" height="280px" />
          </div>
        </div>
      </section>

      <!-- Elements -->
      <section id="elements" class="doc-section">
        <h2>Elements</h2>

        <!-- Headings -->
        <div id="headings" class="example-block">
          <h3>Headings</h3>
          <p class="text-sm text-[var(--color-text-tertiary)]" style="margin-top: var(--spacing-margin-margin-xs-8); margin-bottom: var(--spacing-margin-margin-m-16);">Heading levels are shifted down by one: # renders as H2 style (22px), ## as H3 style (18px), ### as H4 style (16px), and #### and below as Strong style (15px Bold).</p>
          <div class="preview-card">
            <PreviewArea align="left" class="preview-area--markdown">
              <AiMarkdown :content="headingsContent" />
            </PreviewArea>
          </div>
        </div>

        <!-- Paragraph -->
        <div id="paragraph" class="example-block">
          <h3>Paragraph</h3>
          <div class="preview-card">
            <PreviewArea align="left" class="preview-area--markdown">
              <AiMarkdown :content="paragraphContent" />
            </PreviewArea>
          </div>
        </div>

        <!-- Lists -->
        <div id="lists" class="example-block">
          <h3>Lists</h3>
          <div class="preview-card">
            <PreviewArea align="left" class="preview-area--markdown">
              <AiMarkdown :content="listsContent" />
            </PreviewArea>
          </div>
        </div>

        <!-- Blockquote -->
        <div id="blockquote" class="example-block">
          <h3>Blockquote</h3>
          <div class="preview-card">
            <PreviewArea align="left" class="preview-area--markdown">
              <AiMarkdown :content="blockquoteContent" />
            </PreviewArea>
          </div>
        </div>

        <!-- Code -->
        <div id="code" class="example-block">
          <h3>Code</h3>
          <div class="preview-card">
            <PreviewArea align="left" class="preview-area--markdown">
              <AiMarkdown :content="codeContent" />
            </PreviewArea>
          </div>
        </div>

        <!-- Table -->
        <div id="table" class="example-block">
          <h3>Table</h3>
          <div class="preview-card">
            <PreviewArea align="left" class="preview-area--markdown">
              <AiMarkdown :content="tableContent" />
            </PreviewArea>
          </div>
        </div>

        <!-- Horizontal Rule -->
        <div id="horizontal-rule" class="example-block">
          <h3>Horizontal Rule</h3>
          <div class="preview-card">
            <PreviewArea align="left" class="preview-area--markdown">
              <AiMarkdown :content="hrContent" />
            </PreviewArea>
          </div>
        </div>

        <!-- Links -->
        <div id="links" class="example-block">
          <h3>Links</h3>
          <div class="preview-card">
            <PreviewArea align="left" class="preview-area--markdown">
              <AiMarkdown :content="linksContent" />
            </PreviewArea>
          </div>
        </div>
      </section>

      <!-- API Reference -->
      <section id="api" class="doc-section">
        <h2>API</h2>

        <!-- Props -->
        <h3 id="props">Props</h3>
        <div class="api-table">
          <div class="api-table__header">
            <span>Name</span>
            <span>Type</span>
            <span>Default</span>
            <span>Description</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>content</code></span>
            <span data-label="Type"><code>string</code></span>
            <span data-label="Default"><code>—</code></span>
            <span data-label="Description">Markdown string to parse and render</span>
          </div>
        </div>
      </section>
    </div>

    <!-- Table of Contents: 只在xl及以上显示 -->
    <DocTableOfContents :items="tocItems" class="hidden xl:block" />
  </div>
</template>

<script setup lang="ts">
import AiMarkdown from '../../../packages/components/AiMarkdown/AiMarkdown.vue'
import SimpleCodeBlock from '~/components/SimpleCodeBlock.vue'
import Tabs from '~/components/Tabs.vue'
import DocTableOfContents from '~/components/DocTableOfContents.vue'
import PlatformLink from '~/components/PlatformLink.vue'
import PreviewArea from '~/components/PreviewArea.vue'

// Figma icon
const FigmaIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M6.66667 18.3334C8.13943 18.3334 9.33333 17.1395 9.33333 15.6667V13.0001H6.66667C5.19391 13.0001 4 14.194 4 15.6667C4 17.1395 5.19391 18.3334 6.66667 18.3334Z" fill="#0ACF83"/>
  <path d="M4 10.0001C4 8.52728 5.19391 7.33337 6.66667 7.33337H9.33333V12.6667H6.66667C5.19391 12.6667 4 11.4728 4 10.0001Z" fill="#A259FF"/>
  <path d="M4.00001 4.66671C4.00001 3.19395 5.19392 2.00004 6.66668 2.00004H9.33334V7.33337H6.66668C5.19392 7.33337 4.00001 6.13947 4.00001 4.66671Z" fill="#F24E1E"/>
  <path d="M9.33334 2.00004H12C13.4728 2.00004 14.6667 3.19395 14.6667 4.66671C14.6667 6.13947 13.4728 7.33337 12 7.33337H9.33334V2.00004Z" fill="#FF7262"/>
  <path d="M14.6667 10.0001C14.6667 11.4728 13.4728 12.6667 12 12.6667C10.5272 12.6667 9.33334 11.4728 9.33334 10.0001C9.33334 8.52728 10.5272 7.33337 12 7.33337C13.4728 7.33337 14.6667 8.52728 14.6667 10.0001Z" fill="#1ABCFE"/>
</svg>`

definePageMeta({ layout: 'default' })

const activeTab = ref('Usage')

// Table of Contents items
const tocItems = ref([
  { id: 'default', text: 'Default', level: 2 },
  { id: 'elements', text: 'Elements', level: 2 },
  { id: 'headings', text: 'Headings', level: 3 },
  { id: 'paragraph', text: 'Paragraph', level: 3 },
  { id: 'lists', text: 'Lists', level: 3 },
  { id: 'blockquote', text: 'Blockquote', level: 3 },
  { id: 'code', text: 'Code', level: 3 },
  { id: 'table', text: 'Table', level: 3 },
  { id: 'horizontal-rule', text: 'Horizontal Rule', level: 3 },
  { id: 'links', text: 'Links', level: 3 },
  { id: 'api', text: 'API', level: 2 },
  { id: 'props', text: 'Props', level: 3 },
])

// Default content - comprehensive example
const defaultContent = `# Markdown Example

I can help with a variety of tasks: answering questions, providing information, assisting with coding, and generating creative content.

**This is bold text.** *This is italic text.* ~~This is strikethrough.~~

## Unordered List

- Item 1
- Item 2
- Item 3
- Item 4

## Ordered List

1. Item 1
2. Item 2
3. Item 3

## Inline Code

Use \`console.log()\` to print output.

## Code Block

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`
}
\`\`\`

## Blockquote

> Example of quoted content.
> Wow, that's amazing. Good work!

## Table

| Name | Type | Default | Description |
|------|------|---------|-------------|
| content | string | — | Markdown string to render |

---

[Visit Xmind](https://xmind.app)
`

// Elements examples
const headingsContent = `# Heading 1 (renders as H2 style)

## Heading 2 (renders as H3 style)

### Heading 3 (renders as H4 style)

#### Heading 4+ (renders as Strong style)
`

const paragraphContent = `I can help with a variety of tasks: answering questions, providing information, assisting with coding, generating creative content. What would you like help with today?

**This is bold text.** *This is italic text.* ~~This is strikethrough.~~
`

const listsContent = `**Unordered List**

- Item 1
- Item 2
- Item 3
  - Nested Item 1
  - Nested Item 2
- Item 4

**Ordered List**

1. Item 1
2. Item 2
3. Item 3
`

const blockquoteContent = `> Example of quoted content.
> Wow, that's amazing. Good work!
`

const codeContent = `Inline code: \`console.log('hello')\`

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`
}
\`\`\`

\`\`\`javascript Button.vue
export default {
  name: 'Button',
  props: ['label']
}
\`\`\`

\`\`\`
{
  "name": "example",
  "version": "1.0.0"
}
\`\`\`
`

const tableContent = `**2 Columns**

| Name | Description |
|------|-------------|
| content | Markdown string to render |
| loading | Show loading state |

**3 Columns**

| Name | Type | Default |
|------|------|---------|
| content | string | — |
| loading | boolean | false |

**4 Columns**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| content | string | — | Markdown string to render |
| loading | boolean | false | Show loading state |
`

const hrContent = `Content above the rule.

---

Content below the rule.
`

const linksContent = `[Visit Xmind](https://xmind.app)

[Figma Design](https://figma.com) — open in new tab.
`

// Usage examples
const defaultUsage = `<AiMarkdown :content="content" />`

// Full source code
const componentSource = `<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { marked, Renderer } from 'marked'

interface AiMarkdownProps {
  content: string
}

const props = defineProps<AiMarkdownProps>()

// 配置自定义 renderer
const renderer = new Renderer()
// baseRenderer 用于复用 marked 默认的 table 渲染逻辑，避免手写完整 table HTML
const baseRenderer = new Renderer()

// h1 → h2 标签（降级标题）
renderer.heading = ({ text, depth }) => {
  const visualLevel = Math.min(depth + 1, 4) // h1→h2, h2→h3, h3→h4, h4+→h4
  return \`<h\${visualLevel}>\${text}</h\${visualLevel}>\`
}

// code block：注入复制按钮
renderer.code = ({ text, lang }) => {
  const langLabel = lang ? \`<span class="md-code-block__lang">\${lang}</span>\` : ''
  const encodedCode = text.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return \`
    <div class="md-code-block">
      \${langLabel ? \`<div class="md-code-block__header">\${langLabel}<button class="md-code-block__copy" data-code="\${encodeURIComponent(text)}" aria-label="Copy code"><span class="md-copy-icon"></span></button></div>\` : \`<button class="md-code-block__copy md-code-block__copy--no-header" data-code="\${encodeURIComponent(text)}" aria-label="Copy code"><span class="md-copy-icon"></span></button>\`}
      <pre class="md-code-block__pre"><code class="md-code-block__code">\${encodedCode}</code></pre>
    </div>
  \`
}

// table：包一层 wrapper 用于 border-radius
renderer.table = (token) => {
  const defaultTable = baseRenderer.table(token)
  return \`<div class="md-table-wrap">\${defaultTable}</div>\`
}

// hr：用破折号字符替换
renderer.hr = () => {
  return \`<div class="md-hr">────────────────────────────────────────</div>\`
}

// 解析 Markdown
const parsedHtml = computed(() => {
  if (!props.content) return ''
  return marked.parse(props.content, { renderer }) as string
})

// 复制按钮事件委托
const containerRef = ref<HTMLElement | null>(null)

const handleClick = (e: MouseEvent) => {
  const btn = (e.target as HTMLElement).closest('[data-code]') as HTMLElement | null
  if (!btn) return
  const code = decodeURIComponent(btn.dataset.code || '')
  navigator.clipboard.writeText(code).then(() => {
    btn.classList.add('md-code-block__copy--copied')
    setTimeout(() => btn.classList.remove('md-code-block__copy--copied'), 1500)
  })
}

onMounted(() => {
  containerRef.value?.addEventListener('click', handleClick)
})

onBeforeUnmount(() => {
  containerRef.value?.removeEventListener('click', handleClick)
})
<\/script>

<template>
  <div
    ref="containerRef"
    class="ai-markdown"
    v-html="parsedHtml"
  />
</template>

<style scoped>
/* 组件样式见源文件 */
</style>`
</script>

<style scoped>
/* ===== 页面专用样式 ===== */
/* Preview Area 修饰符：Markdown 内容需要更大的 padding */
.preview-area--markdown {
  padding: var(--spacing-padding-3xl-32) var(--spacing-padding-6xl-48);
}

@media (max-width: 768px) {
  .preview-area--markdown {
    padding: var(--spacing-padding-l-16);
  }
}
</style>
