<template>
  <div class="code-block">
    <!-- Tabs -->
    <div class="code-block__tabs">
      <button
        v-for="tab in tabs"
        :key="tab"
        class="code-block__tab"
        :class="{ 'code-block__tab--active': activeTab === tab }"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>

      <!-- Copy Button -->
      <button
        class="code-block__copy"
        :class="{ 'code-block__copy--copied': copied }"
        @click="copyCode"
        :title="copied ? '已复制' : '复制代码'"
      >
        <svg v-if="!copied" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 4V2.5C4 1.67 4.67 1 5.5 1H13.5C14.33 1 15 1.67 15 2.5V10.5C15 11.33 14.33 12 13.5 12H12" stroke="currentColor" stroke-width="1.5"/>
          <rect x="1" y="4" width="11" height="11" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M13.5 4L6 11.5L2.5 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <!-- Code Content -->
    <div class="code-block__content">
      <pre v-if="activeTab === 'Usage'" class="code-block__pre"><code class="code-block__code">{{ usage }}</code></pre>
      <pre v-else class="code-block__pre"><code class="code-block__code">{{ source }}</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  usage: string
  source: string
}

const props = defineProps<Props>()

const tabs = ['Usage', 'Source']
const activeTab = ref('Usage')
const copied = ref(false)

const currentCode = computed(() => {
  return activeTab.value === 'Usage' ? props.usage : props.source
})

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(currentCode.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy code:', err)
  }
}
</script>

<style scoped>
.code-block {
  border-radius: var(--radius-l);
  border: 1px solid var(--color-border-translucent);
  background: var(--color-fill-surfacebright);
  overflow: hidden;
  margin: var(--spacing-margin-margin-m-16) 0;
}

.code-block__tabs {
  display: flex;
  align-items: center;
  gap: var(--spacing-padding-xxs-2);
  padding: var(--spacing-padding-xs-4) var(--spacing-padding-m-12);
  border-bottom: 1px solid var(--color-border-translucent);
  background: var(--color-fill-surfacebright);
}

.code-block__tab {
  padding: var(--spacing-padding-xxs-2) var(--spacing-padding-s-8);
  border: none;
  background: transparent;
  color: var(--color-text-tertiary);
  font-size: var(--typo-interface-desktop-caption-caption-medium-size);
  font-weight: 600;
  cursor: pointer;
  border-radius: var(--radius-xs);
  transition: all 150ms ease;
  font-family: 'Fira Code', monospace;
}

.code-block__tab:hover {
  color: var(--color-text-secondary);
  background: var(--color-mask-overlays);
}

.code-block__tab--active {
  color: var(--color-text-primary);
  background: var(--color-mask-overlaym);
}

.code-block__copy {
  margin-left: auto;
  padding: var(--spacing-padding-xxs-2);
  border: none;
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  border-radius: var(--radius-xs);
  transition: all 150ms ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.code-block__copy:hover {
  color: var(--color-text-secondary);
  background: var(--color-mask-overlays);
}

.code-block__copy--copied {
  color: var(--color-fill-accent-normal);
}

.code-block__content {
  overflow-x: auto;
  background: var(--color-mask-overlays);
  border-radius: var(--radius-m);
  margin: var(--spacing-padding-m-12);
}

.code-block__pre {
  margin: 0;
  padding: var(--spacing-padding-m-12);
  overflow-x: auto;
  background: transparent;
}

.code-block__code {
  font-family: 'Fira Code', 'Monaco', 'Courier New', monospace;
  font-size: var(--typo-interface-desktop-caption-caption-small-size);
  line-height: var(--typo-interface-desktop-caption-caption-small-lh);
  color: var(--color-text-secondary);
  display: block;
  white-space: pre;
}

/* 滚动条样式 */
.code-block__content::-webkit-scrollbar,
.code-block__pre::-webkit-scrollbar {
  height: 8px;
}

.code-block__content::-webkit-scrollbar-track,
.code-block__pre::-webkit-scrollbar-track {
  background: transparent;
}

.code-block__content::-webkit-scrollbar-thumb,
.code-block__pre::-webkit-scrollbar-thumb {
  background: var(--color-border-translucent);
  border-radius: 4px;
}

.code-block__content::-webkit-scrollbar-thumb:hover,
.code-block__pre::-webkit-scrollbar-thumb:hover {
  background: var(--color-border-default);
}
</style>
