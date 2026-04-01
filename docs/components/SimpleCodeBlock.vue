<template>
  <div class="relative group rounded-lg overflow-hidden">
    <pre
      class="simple-code-block text-xs font-mono bg-[var(--color-mask-overlays)] p-3 pr-12 leading-relaxed whitespace-pre-wrap break-all overflow-y-auto"
      :style="{ height }"
      v-html="displayCode"
    />
    <button
      @click="copy"
      class="absolute top-3 right-3 p-1.5 rounded hover:bg-[var(--color-mask-overlays)] transition-colors"
      :title="'Copy code'"
    >
      <svg v-if="!copied" class="w-4 h-4 text-[var(--color-text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      <svg v-else class="w-4 h-4 text-[var(--color-icon-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  code: string
  language?: 'vue' | 'css' | 'plain'
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  language: 'plain',
  height: '128px'
})

const copied = ref(false)

function escapeHtml(text: string) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function highlightVue(code: string) {
  const escaped = escapeHtml(code)
  return escaped
    // 标签名
    .replace(/&lt;(\/?)(Button|template|script|style|div|span|button|input|select)(\s|&gt;)/g, '&lt;<span class="syntax-property">$1$2</span>$3')
    // 属性名
    .replace(/\s(variant|size|disabled|text|type|class|id|v-bind|v-model|@click|:)=/g, ' <span class="syntax-function">$1</span>=')
    // 属性值
    .replace(/="([^"]*)"/g, '=<span class="syntax-punctuation">"</span><span class="syntax-number">$1</span><span class="syntax-punctuation">"</span>')
    // 标签符号
    .replace(/(&lt;|&gt;|\/&gt;)/g, '<span class="syntax-punctuation">$1</span>')
}

function highlightCss(code: string) {
  return code
    // Property names
    .replace(/(box-shadow|backdrop-filter):/g, '<span class="syntax-property">$1</span><span class="syntax-punctuation">:</span>')
    // Functions (rgba, blur)
    .replace(/\b(rgba|blur)\(/g, '<span class="syntax-function">$1</span><span class="syntax-punctuation">(</span>')
    // Numbers with units
    .replace(/(\d+(?:\.\d+)?)(px|%)?/g, '<span class="syntax-number">$1</span><span class="syntax-unit">$2</span>')
    // Punctuation
    .replace(/([;,\)])/g, '<span class="syntax-punctuation">$1</span>')
}

const displayCode = computed(() => {
  if (props.language === 'vue') {
    return highlightVue(props.code)
  } else if (props.language === 'css') {
    return highlightCss(props.code)
  } else {
    return escapeHtml(props.code)
  }
})

async function copy() {
  await navigator.clipboard.writeText(props.code)
  copied.value = true
  setTimeout(() => { copied.value = false }, 1200)
}
</script>

<style scoped>
.simple-code-block {
  color: var(--color-text-secondary);
}

/* 属性名 - 柔和的蓝色 */
.simple-code-block :deep(.syntax-property) {
  color: #5b8fc7;
}

:global([data-theme="dark"]) .simple-code-block :deep(.syntax-property) {
  color: #7ca9d8;
}

/* 函数名 - 柔和的紫色 */
.simple-code-block :deep(.syntax-function) {
  color: #9d7cb3;
}

:global([data-theme="dark"]) .simple-code-block :deep(.syntax-function) {
  color: #b99bcf;
}

/* 数值 - 柔和的橙色 */
.simple-code-block :deep(.syntax-number) {
  color: #c88955;
}

:global([data-theme="dark"]) .simple-code-block :deep(.syntax-number) {
  color: #d9a673;
}

/* 单位 - 次要文本色 */
.simple-code-block :deep(.syntax-unit) {
  color: var(--color-text-tertiary);
}

/* 标点符号 - 最弱化 */
.simple-code-block :deep(.syntax-punctuation) {
  color: var(--color-text-tertiary);
  opacity: 0.5;
}
</style>
