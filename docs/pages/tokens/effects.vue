<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { getElevations } = useTokens()
const elevations = getElevations()
const { theme } = inject('theme') as any
const activeMode = computed(() => theme.value === 'light' ? 'Light' : 'Dark')
const copiedLevel = ref('')

function formatCssCode(elevation: any) {
  const mode = activeMode.value === 'Light' ? elevation.light : elevation.dark
  let code = `box-shadow:\n  ${mode.boxShadow};`
  if (mode.backdropFilter) {
    code += `\n\nbackdrop-filter: ${mode.backdropFilter};`
  }
  return code
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

async function copy(level: string, elevation: any) {
  const code = formatCssCode(elevation)
  await navigator.clipboard.writeText(code)
  copiedLevel.value = level
  setTimeout(() => { copiedLevel.value = '' }, 1200)
}
</script>
<template>
  <div class="px-10 py-8 max-w-5xl">
    <h1 class="text-xl font-semibold mb-1">Elevation</h1>
    <p class="text-sm text-[var(--color-text-tertiary)] mb-6">Elevation tokens define shadow and blur effects to create depth hierarchy across UI layers. Each level corresponds to specific component types and interaction states.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div v-for="elevation in elevations" :key="elevation.level" class="rounded-xl border border-[var(--color-border-translucent)] bg-[var(--color-fill-surfacebright)] overflow-hidden">
        <!-- Header -->
        <div class="px-4 py-2.5 border-b border-[var(--color-border-translucent)]">
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold font-mono">{{ elevation.level }}</span>
            <span class="text-xs text-[var(--color-text-tertiary)]">{{ elevation.description }}</span>
          </div>
        </div>

        <!-- Preview -->
        <div class="flex items-center justify-center p-12">
          <div
            class="w-28 h-28 rounded-lg bg-[var(--color-fill-surface-desktop)]"
            :style="{
              boxShadow: activeMode === 'Light' ? elevation.light.boxShadow : elevation.dark.boxShadow,
              backdropFilter: activeMode === 'Light' ? elevation.light.backdropFilter : elevation.dark.backdropFilter
            }"
          />
        </div>

        <!-- Code Block -->
        <div class="p-4">
          <div class="relative group rounded-lg overflow-hidden">
            <pre class="code-block text-xs font-mono bg-[var(--color-mask-overlays)] p-3 pr-12 leading-relaxed whitespace-pre-wrap break-all h-32 overflow-y-auto" v-html="highlightCss(formatCssCode(elevation))" />
            <button
              @click="copy(elevation.level, elevation)"
              class="absolute top-3 right-3 p-1.5 rounded hover:bg-[var(--color-mask-overlays)] transition-colors"
              :title="'Copy CSS code'"
            >
              <svg v-if="copiedLevel !== elevation.level" class="w-4 h-4 text-[var(--color-text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <svg v-else class="w-4 h-4 text-[var(--color-icon-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.code-block {
  color: var(--color-text-secondary);
}

/* 属性名 - 柔和的蓝色 */
.code-block :deep(.syntax-property) {
  color: #5b8fc7;
}

:global([data-theme="dark"]) .code-block :deep(.syntax-property) {
  color: #7ca9d8;
}

/* 函数名 - 柔和的紫色 */
.code-block :deep(.syntax-function) {
  color: #9d7cb3;
}

:global([data-theme="dark"]) .code-block :deep(.syntax-function) {
  color: #b99bcf;
}

/* 数值 - 柔和的橙色 */
.code-block :deep(.syntax-number) {
  color: #c88955;
}

:global([data-theme="dark"]) .code-block :deep(.syntax-number) {
  color: #d9a673;
}

/* 单位 - 次要文本色 */
.code-block :deep(.syntax-unit) {
  color: var(--color-text-tertiary);
}

/* 标点符号 - 最弱化 */
.code-block :deep(.syntax-punctuation) {
  color: var(--color-text-tertiary);
  opacity: 0.5;
}
</style>
