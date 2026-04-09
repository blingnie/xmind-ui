<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { marked, Renderer } from 'marked'

interface AiMarkdownProps {
  content: string
}

const props = defineProps<AiMarkdownProps>()

// 内联 SVG 图标
const CopyTextIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.4993 9.2002C16.4993 8.75844 16.1412 8.39952 15.6995 8.39941H9.39966C8.95783 8.39941 8.59888 8.75837 8.59888 9.2002V15.5C8.59899 15.9417 8.9579 16.2998 9.39966 16.2998H15.6995C16.1411 16.2997 16.4992 15.9417 16.4993 15.5V9.2002ZM17.6995 15.5C17.6994 16.6044 16.8039 17.4999 15.6995 17.5H9.39966C8.29516 17.5 7.39977 16.6045 7.39966 15.5V9.2002C7.39966 8.09563 8.29509 7.2002 9.39966 7.2002H15.6995C16.8039 7.20031 17.6995 8.0957 17.6995 9.2002V15.5Z" fill="currentColor"/><path d="M11.5996 4.99939V4.30017C11.5996 4.088 11.5153 3.88379 11.3652 3.73376C11.2153 3.5839 11.0118 3.49944 10.7998 3.49939H4.5C4.28783 3.49939 4.08362 3.58374 3.93359 3.73376C3.78357 3.88379 3.69922 4.088 3.69922 4.30017V10.6C3.69927 10.812 3.78373 11.0154 3.93359 11.1654C4.08362 11.3154 4.28783 11.3998 4.5 11.3998H5.19922C5.53046 11.3998 5.7996 11.6682 5.7998 11.9994C5.7998 12.3308 5.53059 12.6 5.19922 12.6H4.5C3.96957 12.6 3.46003 12.3891 3.08496 12.014C2.71006 11.639 2.50005 11.1302 2.5 10.6V4.30017C2.5 3.76974 2.70989 3.2602 3.08496 2.88513C3.46003 2.51006 3.96957 2.30017 4.5 2.30017H10.7998C11.3301 2.30023 11.8389 2.51023 12.2139 2.88513C12.5889 3.2602 12.7998 3.76974 12.7998 4.30017V4.99939C12.7998 5.33076 12.5306 5.59998 12.1992 5.59998C11.868 5.59977 11.5996 5.33063 11.5996 4.99939Z" fill="currentColor"/></svg>`

const TickIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M15.5691 3.24084C15.4351 3.24084 15.3081 3.28024 15.1896 3.35564L14.9144 3.67593L8.96488 14.6967C8.88758 14.8338 8.81522 14.8717 8.75494 14.8717C8.69893 14.8717 8.62442 14.8408 8.53004 14.747L4.99181 10.7984C4.85093 10.626 4.66752 10.5367 4.44827 10.5367C4.25186 10.5367 4.07722 10.6084 3.92798 10.7466C3.75877 10.8951 3.66827 11.0769 3.66827 11.2883C3.66827 11.479 3.74758 11.6491 3.89402 11.7963L7.51943 15.8183C7.92804 16.2658 8.36847 16.5025 8.83994 16.5025C9.11867 16.5025 9.37992 16.4092 9.62165 16.2281C9.87267 16.0471 10.0895 15.7836 10.2739 15.4439L16.2238 4.35171C16.2872 4.23531 16.3208 4.11522 16.3208 3.99251C16.3208 3.74036 16.208 3.5357 15.9944 3.38613C15.8585 3.29209 15.7163 3.24084 15.5691 3.24084Z" fill="currentColor"/></svg>`

// 配置自定义 renderer
const renderer = new Renderer()

// h1 → h2 标签（降级标题）
// 必须用 function() 而非箭头函数，以获取 this.parser
renderer.heading = function ({ tokens, depth }) {
  const visualLevel = Math.min(depth + 1, 4) // h1→h2, h2→h3, h3→h4, h4+→h4
  const text = this.parser.parseInline(tokens)
  return `<h${visualLevel}>${text}</h${visualLevel}>`
}

// code block：注入复制按钮
renderer.code = ({ text, lang }) => {
  const encodedCode = text.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const encodedData = encodeURIComponent(text)

  // 解析语言名和文件名（格式：javascript 或 javascript example.js）
  const parts = (lang || '').trim().split(/\s+/)
  const langName = parts[0] || ''
  const fileName = parts[1] || ''

  if (langName) {
    // 有 title：header 行 + code 行
    return `
      <div class="md-code-block md-code-block--with-title">
        <div class="md-code-block__header">
          <div class="md-code-block__file-info">
            <span class="md-code-block__lang-name">${langName}</span>
            ${fileName ? `<span class="md-code-block__file-name">${fileName}</span>` : ''}
          </div>
          <button class="md-code-block__copy" data-code="${encodedData}" aria-label="Copy code">
            <span class="md-copy-icon">${CopyTextIcon}</span><span class="md-tick-icon">${TickIcon}</span>
          </button>
        </div>
        <div class="md-code-block__body">
          <pre class="md-code-block__pre"><code class="md-code-block__code">${encodedCode}</code></pre>
        </div>
      </div>
    `
  } else {
    // 无 title：保持现有结构不变
    return `
      <div class="md-code-block md-code-block--no-title">
        <button class="md-code-block__copy md-code-block__copy--no-header" data-code="${encodedData}" aria-label="Copy code">
          <span class="md-copy-icon">${CopyTextIcon}</span><span class="md-tick-icon">${TickIcon}</span>
        </button>
        <pre class="md-code-block__pre"><code class="md-code-block__code">${encodedCode}</code></pre>
      </div>
    `
  }
}

// table：包一层 wrapper 用于 border-radius
renderer.table = function(token) {
  const defaultTable = Renderer.prototype.table.call(this, token)
  return `<div class="md-table-wrap">${defaultTable}</div>`
}

// hr：用破折号字符替换
renderer.hr = () => {
  return `<div class="md-hr">────────────────────────────────────────</div>`
}

// 列表使用浏览器原生 ::marker 渲染，不需要自定义 renderer

// 预处理：修复 LLM 输出的常见 markdown 格式问题
const normalizeMarkdown = (raw: string): string => {
  return raw
    // 修复行内出现的标题标记：在非行首的 #{1,6} 前插入换行
    .replace(/([^\n])(#{1,6})(\s)/g, '$1\n$2$3')
    .replace(/([^\n])(#{1,6})([^\s#])/g, '$1\n$2 $3')
    // 修复标题标记后缺少空格：###Title → ### Title
    .replace(/^(#{1,6})([^\s#])/gm, '$1 $2')
    // 修复标题末尾多余的 **：### Title** → ### Title
    .replace(/^(#{1,6}\s+.*?)\*{2,}\s*$/gm, '$1')
    // 修复行首多余的 **（未闭合的粗体标记开头）：**Title → **Title**
    .replace(/^(\*{2})([^*\n]+)$/gm, (match, stars, text) => {
      if (!text.includes('**')) return `${stars}${text}${stars}`
      return match
    })
}

// 解析 Markdown
const parsedHtml = computed(() => {
  if (!props.content) return ''
  const normalized = normalizeMarkdown(props.content)
  return marked.parse(normalized, { renderer }) as string
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
</script>

<template>
  <div
    ref="containerRef"
    class="ai-markdown"
    v-html="parsedHtml"
  />
</template>

<style scoped>
/* ===== 容器 ===== */
.ai-markdown {
  width: 100%;
  color: var(--color-text-primary);
}


/* ===== 标题 ===== */
/* h2（md h1 降级）：22px Bold */
.ai-markdown :deep(h2) {
  margin-top: var(--spacing-padding-xxl-24) !important;
  margin-bottom: var(--spacing-padding-m-12) !important;
  font-size: var(--typo-markdown-h2-default-size);
  line-height: var(--typo-markdown-h2-default-lh);
  font-weight: var(--typo-markdown-h2-default-weight);
  letter-spacing: var(--typo-markdown-h2-default-ls);
  color: var(--color-text-primary);
}

/* h3（md h2 降级）：18px Bold */
.ai-markdown :deep(h3) {
  margin-top: var(--spacing-padding-xxl-24) !important;
  margin-bottom: var(--spacing-padding-m-12) !important;
  font-size: var(--typo-markdown-h3-default-size);
  line-height: var(--typo-markdown-h3-default-lh);
  font-weight: var(--typo-markdown-h3-default-weight);
  letter-spacing: var(--typo-markdown-h3-default-ls);
  color: var(--color-text-primary);
}

/* h4（md h3 降级）：16px Bold */
.ai-markdown :deep(h4) {
  margin-top: var(--spacing-padding-xxl-24) !important;
  margin-bottom: var(--spacing-padding-m-12) !important;
  font-size: var(--typo-markdown-h4-default-size);
  line-height: var(--typo-markdown-h4-default-lh);
  font-weight: var(--typo-markdown-h4-default-weight);
  letter-spacing: var(--typo-markdown-h4-default-ls);
  color: var(--color-text-primary);
}

/* h5, h6（md h4+ 降级）：15px Bold */
.ai-markdown :deep(h5),
.ai-markdown :deep(h6) {
  margin-top: var(--spacing-padding-xxl-24) !important;
  margin-bottom: var(--spacing-padding-m-12) !important;
  font-size: var(--typo-markdown-paragraph-default-size);
  line-height: var(--typo-markdown-paragraph-default-lh);
  font-weight: var(--typo-markdown-strong-default-weight);
  letter-spacing: var(--typo-markdown-paragraph-default-ls);
  color: var(--color-text-primary);
}

/* ===== 段落 ===== */
.ai-markdown :deep(p) {
  margin-top: 0 !important;
  margin-bottom: var(--spacing-padding-s-8) !important;
  font-size: var(--typo-markdown-paragraph-default-size);
  line-height: var(--typo-markdown-paragraph-default-lh);
  font-weight: var(--typo-markdown-paragraph-default-weight);
  letter-spacing: var(--typo-markdown-paragraph-default-ls);
  color: var(--color-text-primary);
}

/* ===== 粗体 / 斜体 ===== */
.ai-markdown :deep(strong),
.ai-markdown :deep(b) {
  font-weight: var(--typo-markdown-strong-default-weight);
}

.ai-markdown :deep(em),
.ai-markdown :deep(i) {
  font-style: italic;
}

/* ===== 删除线 ===== */
.ai-markdown :deep(del),
.ai-markdown :deep(s) {
  text-decoration: line-through;
  color: var(--color-text-tertiary);
}

/* ===== 链接 ===== */
.ai-markdown :deep(a) {
  color: var(--color-text-primary);
  text-decoration: underline;
  text-underline-offset: 2px; /* no token */
  transition: color 150ms ease;
}

.ai-markdown :deep(a:hover) {
  color: var(--color-text-secondary);
}

.ai-markdown :deep(a:visited) {
  color: var(--color-text-tertiary);
}

/* ===== inline code ===== */
.ai-markdown :deep(code) {
  display: inline;
  padding: 2px var(--spacing-padding-s-8); /* 垂直 2px no token */
  background: var(--color-mask-overlays);
  border-radius: var(--radius-xxs-4);
  font-family: 'Fira Code', monospace;
  font-size: var(--typo-markdown-caption-default-size);
  line-height: var(--typo-markdown-caption-default-lh);
  font-weight: var(--typo-markdown-code-block-default-weight);
  letter-spacing: var(--typo-markdown-code-block-default-ls);
  color: var(--color-text-secondary);
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
  white-space: normal;
  overflow-wrap: anywhere;
}

/* pre 里的 code 不用 inline 样式 */
.ai-markdown :deep(pre code) {
  display: block;
  padding: 0;
  background: none;
  border-radius: 0;
  font-size: inherit;
  color: inherit;
  white-space: pre-wrap;
  word-break: break-word;
}

/* ===== 无序列表 ===== */
.ai-markdown :deep(ul) {
  padding-left: 0;
  margin-top: 0 !important;
  margin-bottom: var(--spacing-padding-l-16) !important;
  list-style: none;
}

/* 段内元素后接列表，补充 8px 使总间距达到 16px */
.ai-markdown :deep(h2 + ul),
.ai-markdown :deep(h3 + ul),
.ai-markdown :deep(h4 + ul),
.ai-markdown :deep(h5 + ul),
.ai-markdown :deep(h6 + ul),
.ai-markdown :deep(p + ul) {
  margin-top: var(--spacing-padding-s-8) !important;
}

.ai-markdown :deep(ul li) {
  position: relative;
  padding-left: var(--spacing-padding-3xl-32);
  margin-bottom: var(--spacing-size-xs-4);
  font-size: var(--typo-markdown-paragraph-default-size);
  line-height: var(--typo-markdown-paragraph-default-lh);
  letter-spacing: var(--typo-markdown-paragraph-default-ls);
  color: var(--color-text-primary);
}

.ai-markdown :deep(ul li:last-child) {
  margin-bottom: 0;
}

/* 圆点：absolute 定位 */
.ai-markdown :deep(ul li::before) {
  content: '';
  position: absolute;
  left: var(--spacing-padding-m-12);
  top: 11px; /* no token */
  width: 4px;  /* no token */
  height: 4px; /* no token */
  border-radius: 50%;
  background: var(--color-icon-quaternary);
}

/* ===== 有序列表 ===== */
.ai-markdown :deep(ol) {
  padding-left: 32px; /* no token */
  margin-top: 0 !important;
  margin-bottom: var(--spacing-padding-l-16) !important;
  list-style: decimal;
}

/* 段内元素后接列表，补充 8px 使总间距达到 16px */
.ai-markdown :deep(h2 + ol),
.ai-markdown :deep(h3 + ol),
.ai-markdown :deep(h4 + ol),
.ai-markdown :deep(h5 + ol),
.ai-markdown :deep(h6 + ol),
.ai-markdown :deep(p + ol) {
  margin-top: var(--spacing-padding-s-8) !important;
}

.ai-markdown :deep(ol li) {
  margin-bottom: var(--spacing-size-xs-4);
  font-size: var(--typo-markdown-paragraph-default-size);
  line-height: var(--typo-markdown-paragraph-default-lh);
  letter-spacing: var(--typo-markdown-paragraph-default-ls);
  color: var(--color-text-primary);
}

.ai-markdown :deep(ol li:last-child) {
  margin-bottom: 0;
}

/* ::marker 控制数字颜色和字体 */
.ai-markdown :deep(ol li::marker) {
  font-family: 'Fira Code', monospace;
  font-size: var(--typo-markdown-caption-default-size);
  font-weight: var(--typo-markdown-code-block-default-weight);
  color: var(--color-text-tertiary);
}

/* ===== 嵌套列表 ===== */
.ai-markdown :deep(li > ul),
.ai-markdown :deep(li > ol) {
  margin-top: var(--spacing-padding-s-8) !important;
  margin-bottom: var(--spacing-padding-m-12) !important; /* 覆盖外层 ul/ol 的 margin-bottom */
  margin-left: -12px; /* no token */
}

/* ===== Blockquote ===== */
.ai-markdown :deep(blockquote) {
  display: flex;
  gap: 12px; /* no token，设计稿精确值 */
  padding: 0;
  margin-top: 0 !important;
  margin-bottom: var(--spacing-padding-l-16) !important;
  overflow: hidden;
}

/* 段内元素后接引用，补充 8px 使总间距达到 16px */
.ai-markdown :deep(h2 + blockquote),
.ai-markdown :deep(h3 + blockquote),
.ai-markdown :deep(h4 + blockquote),
.ai-markdown :deep(h5 + blockquote),
.ai-markdown :deep(h6 + blockquote),
.ai-markdown :deep(p + blockquote) {
  margin-top: var(--spacing-padding-s-8) !important;
}

.ai-markdown :deep(blockquote::before) {
  content: '';
  width: 2px; /* no token */
  border-radius: 2px; /* no token */
  background: var(--color-mask-overlaym);
  align-self: stretch;
  flex-shrink: 0;
}

.ai-markdown :deep(blockquote p) {
  color: var(--color-text-secondary);
  margin: 0 !important; /* blockquote 内部段落不需要额外间距 */
}

/* ===== Horizontal Rule ===== */
.ai-markdown :deep(.md-hr) {
  margin-top: 0 !important;
  margin-bottom: var(--spacing-padding-l-16) !important;
  font-size: var(--typo-markdown-caption-default-size);
  line-height: 1.5;
  color: var(--color-text-quaternary);
  letter-spacing: 0;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
}

/* 段内元素后接分隔线，补充 8px 使总间距达到 16px */
.ai-markdown :deep(h2 + .md-hr),
.ai-markdown :deep(h3 + .md-hr),
.ai-markdown :deep(h4 + .md-hr),
.ai-markdown :deep(h5 + .md-hr),
.ai-markdown :deep(h6 + .md-hr),
.ai-markdown :deep(p + .md-hr) {
  margin-top: var(--spacing-padding-s-8) !important;
}

/* ===== Code Block ===== */
.ai-markdown :deep(.md-code-block) {
  position: relative;
  margin-top: 0 !important;
  margin-bottom: var(--spacing-padding-l-16) !important;
  background: var(--color-mask-overlays);
  border-radius: var(--radius-m-12);
  overflow: hidden;
}

/* 段内元素后接代码块，补充 8px 使总间距达到 16px */
.ai-markdown :deep(h2 + .md-code-block),
.ai-markdown :deep(h3 + .md-code-block),
.ai-markdown :deep(h4 + .md-code-block),
.ai-markdown :deep(h5 + .md-code-block),
.ai-markdown :deep(h6 + .md-code-block),
.ai-markdown :deep(p + .md-code-block) {
  margin-top: var(--spacing-padding-s-8) !important;
}

.ai-markdown :deep(.md-code-block__pre) {
  padding: 0;
  background: transparent;
  overflow-x: auto;
}

.ai-markdown :deep(.md-code-block__code) {
  font-family: 'Fira Code', monospace;
  font-size: var(--typo-markdown-code-block-default-size);
  line-height: var(--typo-markdown-code-block-default-lh);
  font-weight: var(--typo-markdown-code-block-default-weight);
  letter-spacing: var(--typo-markdown-code-block-default-ls);
  color: var(--color-text-secondary);
  white-space: pre-wrap;
  word-break: break-word;
}

/* 有 title 的 code block */
.ai-markdown :deep(.md-code-block--with-title) {
  display: flex;
  flex-direction: column;
  padding: 0;
}

/* 无 title 的 code block（保持现有 padding） */
.ai-markdown :deep(.md-code-block--no-title) {
  padding: var(--spacing-padding-l-16);
}

/* Header 行 */
.ai-markdown :deep(.md-code-block--with-title .md-code-block__header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-padding-m-12) var(--spacing-padding-m-12) var(--spacing-padding-m-12) var(--spacing-padding-l-16);
  border-bottom: 1px solid var(--color-border-translucent);
}

/* 语言名 + 文件名容器 */
.ai-markdown :deep(.md-code-block__file-info) {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-padding-m-12);
}

/* 语言名：15px Regular primary */
.ai-markdown :deep(.md-code-block__lang-name) {
  font-size: var(--typo-markdown-paragraph-default-size);
  line-height: var(--typo-markdown-paragraph-default-lh);
  font-weight: var(--typo-markdown-paragraph-default-weight);
  letter-spacing: var(--typo-markdown-paragraph-default-ls);
  color: var(--color-text-primary);
}

/* 文件名：13px secondary */
.ai-markdown :deep(.md-code-block__file-name) {
  font-size: var(--typo-markdown-caption-default-size);
  line-height: var(--typo-markdown-caption-default-lh);
  letter-spacing: var(--typo-markdown-caption-default-ls);
  color: var(--color-text-secondary);
}

/* Code 内容区（with-title 时） */
.ai-markdown :deep(.md-code-block__body) {
  padding: var(--spacing-padding-l-16);
}

/* 复制按钮 */
.ai-markdown :deep(.md-code-block__copy) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px; /* no token */
  height: 32px; /* no token */
  border-radius: var(--radius-s-8);
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--color-icon-tertiary);
  flex-shrink: 0;
  transition: background-color 150ms ease, color 150ms ease;
}

.ai-markdown :deep(.md-code-block__copy:hover) {
  background: var(--color-mask-overlays);
  color: var(--color-icon-secondary);
}

/* 无 header 时，复制按钮绝对定位到右上角 */
.ai-markdown :deep(.md-code-block__copy--no-header) {
  position: absolute;
  top: var(--spacing-padding-s-8);
  right: var(--spacing-padding-s-8);
}

/* 复制成功状态 */
.ai-markdown :deep(.md-code-block__copy--copied) {
  color: var(--color-icon-secondary);
}

/* 图标容器 */
.ai-markdown :deep(.md-copy-icon),
.ai-markdown :deep(.md-tick-icon) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px; /* no token */
  height: 16px; /* no token */
  color: currentColor;
}

.ai-markdown :deep(.md-copy-icon svg),
.ai-markdown :deep(.md-tick-icon svg) {
  width: 100%;
  height: 100%;
  display: block;
}

/* 默认状态：显示 copy icon，隐藏 tick icon */
.ai-markdown :deep(.md-copy-icon) {
  display: flex;
}

.ai-markdown :deep(.md-tick-icon) {
  display: none;
}

/* 复制成功状态：隐藏 copy icon，显示 tick icon */
.ai-markdown :deep(.md-code-block__copy--copied .md-copy-icon) {
  display: none;
}

.ai-markdown :deep(.md-code-block__copy--copied .md-tick-icon) {
  display: flex;
}

/* ===== 表格 ===== */
.ai-markdown :deep(.md-table-wrap) {
  margin-top: 0 !important;
  margin-bottom: var(--spacing-padding-l-16) !important;
}

/* 段内元素后接表格，补充 8px 使总间距达到 16px */
.ai-markdown :deep(h2 + .md-table-wrap),
.ai-markdown :deep(h3 + .md-table-wrap),
.ai-markdown :deep(h4 + .md-table-wrap),
.ai-markdown :deep(h5 + .md-table-wrap),
.ai-markdown :deep(h6 + .md-table-wrap),
.ai-markdown :deep(p + .md-table-wrap) {
  margin-top: var(--spacing-padding-s-8) !important;
}

.ai-markdown :deep(table) {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: var(--typo-markdown-caption-default-size);
  line-height: var(--typo-markdown-caption-default-lh);
  font-weight: var(--typo-markdown-caption-default-weight);
  letter-spacing: var(--typo-markdown-caption-default-ls);
  border: 1px solid var(--color-border-translucent);
  border-radius: var(--radius-m-12);
}

.ai-markdown :deep(thead) {
  background: var(--color-mask-overlays);
}

.ai-markdown :deep(th) {
  padding: var(--spacing-padding-m-12) var(--spacing-padding-l-16);
  text-align: left;
  font-size: var(--typo-markdown-caption-default-size);
  line-height: var(--typo-markdown-caption-default-lh);
  font-weight: var(--typo-markdown-strong-default-weight);
  letter-spacing: var(--typo-markdown-caption-default-ls);
  color: var(--color-text-tertiary);
  border-bottom: 1px solid var(--color-border-translucent);
}

.ai-markdown :deep(tbody) {
  background: var(--color-fill-surface-desktop);
}

.ai-markdown :deep(td) {
  padding: var(--spacing-padding-m-12) var(--spacing-padding-l-16);
  font-size: var(--typo-markdown-caption-default-size);
  line-height: var(--typo-markdown-caption-default-lh);
  font-weight: var(--typo-markdown-caption-default-weight);
  letter-spacing: var(--typo-markdown-caption-default-ls);
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border-translucent);
}

.ai-markdown :deep(tbody tr:last-child td) {
  border-bottom: none;
}

/* ===== 图片（兜底） ===== */
.ai-markdown :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-s-8);
  display: block;
}

/* ===== 第一个元素不需要 margin-top ===== */
.ai-markdown :deep(> *:first-child) {
  margin-top: 0 !important;
}

/* ===== 最后一个元素不需要 margin-bottom ===== */
.ai-markdown :deep(> *:last-child) {
  margin-bottom: 0 !important;
}
</style>
