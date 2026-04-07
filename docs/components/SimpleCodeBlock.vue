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
      class="copy-button"
      :class="{ 'copy-button--copied': copied }"
      :title="'Copy code'"
    >
      <span class="copy-icon" v-html="CopyTextIcon"></span>
      <span class="tick-icon" v-html="TickIcon"></span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useShiki } from '~/composables/useShiki'
import CopyTextIcon from '~/components/icon/fw-icons/copy-text.svg?raw'
import TickIcon from '~/components/icon/fw-icons/tick.svg?raw'

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

/* 复制按钮 */
.copy-button {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-s-8);
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--color-icon-tertiary);
  flex-shrink: 0;
  transition: background-color 150ms ease, color 150ms ease;
}

.copy-button:hover {
  background: var(--color-mask-overlays);
  color: var(--color-icon-secondary);
}

.copy-button--copied {
  color: var(--color-icon-secondary);
}

/* 图标容器 */
.copy-icon,
.tick-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: currentColor;
}

.copy-icon :deep(svg),
.tick-icon :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}

/* 默认状态：显示 copy icon，隐藏 tick icon */
.copy-icon {
  display: flex;
}

.tick-icon {
  display: none;
}

/* 复制成功状态：隐藏 copy icon，显示 tick icon */
.copy-button--copied .copy-icon {
  display: none;
}

.copy-button--copied .tick-icon {
  display: flex;
}
</style>
