<template>
  <div class="relative group rounded-lg overflow-hidden">
    <!-- Loading state -->
    <pre
      v-if="isLoading"
      class="simple-code-block text-xs font-mono bg-[var(--color-mask-overlays)] p-3 pr-12 leading-relaxed overflow-y-auto text-[var(--color-text-secondary)]"
      :style="{ height }"
    >{{ code }}</pre>

    <!-- Highlighted code -->
    <div
      v-else
      class="simple-code-block overflow-y-auto"
      :style="{ height }"
      v-html="highlightedCode"
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
import { ref, computed, watch } from 'vue'
import { useShiki } from '~/composables/useShiki'

interface Props {
  code: string
  language?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  language: 'vue',
  height: '128px'
})

const copied = ref(false)
const { isLoading, highlight, currentTheme } = useShiki()

const highlightedCode = computed(() => {
  return highlight(props.code, props.language)
})

// 主题变化时重新高亮
watch(currentTheme, () => {
  // Computed 会自动重新计算
})

async function copy() {
  await navigator.clipboard.writeText(props.code)
  copied.value = true
  setTimeout(() => { copied.value = false }, 1200)
}
</script>

<style scoped>
.simple-code-block {
  font-size: 13px;
  line-height: 1.6;
  background-color: var(--color-mask-overlays);
  border-radius: 8px;
  height: 100%;
}

/* 覆盖 shiki 输出的所有尺寸相关样式 */
.simple-code-block :deep(pre) {
  background-color: transparent !important;
  margin: 0 !important;
  padding: 16px !important;
  height: 100% !important;
  overflow: visible !important;
  white-space: pre-wrap !important;
  word-break: break-all !important;
}

.simple-code-block :deep(code) {
  font-family: 'Fira Code', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  background-color: transparent;
  white-space: pre-wrap !important;
  word-break: break-all !important;
}
</style>
