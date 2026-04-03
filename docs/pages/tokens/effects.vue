<script setup lang="ts">
import SimpleCodeBlock from '~/components/SimpleCodeBlock.vue'

definePageMeta({ layout: 'default' })
const { getElevations } = useTokens()
const elevations = getElevations()
const { theme } = inject('theme') as any
const activeMode = computed(() => theme.value === 'light' ? 'Light' : 'Dark')

function formatCssCode(elevation: any) {
  const mode = activeMode.value === 'Light' ? elevation.light : elevation.dark
  let code = `box-shadow:\n  ${mode.boxShadow};`
  if (mode.backdropFilter) {
    code += `\n\nbackdrop-filter: ${mode.backdropFilter};`
  }
  return code
}

function getVarName(level: string) {
  return `--elevation-${level.toLowerCase()}`
}

const copied = ref('')

async function copyToken(varName: string) {
  await navigator.clipboard.writeText(varName)
  copied.value = varName
  setTimeout(() => {
    copied.value = ''
  }, 1200)
}
</script>
<template>
  <div>
    <h1 class="text-xl font-semibold">Elevation</h1>
    <p class="text-sm text-[var(--color-text-tertiary)]">Elevation tokens define shadow and blur effects to create depth hierarchy across UI layers. Each level corresponds to specific component types and interaction states.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div v-for="elevation in elevations" :key="elevation.level" class="rounded-xl border border-[var(--color-border-translucent)] bg-[var(--color-fill-surfacebright)] overflow-hidden">
        <!-- Header -->
        <div class="px-4 py-2.5 border-b border-[var(--color-border-translucent)]">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold font-mono">{{ elevation.level }}</span>
              <span class="text-xs text-[var(--color-text-tertiary)]">{{ elevation.description }}</span>
            </div>
            <button
              @click="copyToken(getVarName(elevation.level))"
              class="text-xs font-mono text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              {{ copied === getVarName(elevation.level) ? '✓ copied' : getVarName(elevation.level) }}
            </button>
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
          <SimpleCodeBlock :code="formatCssCode(elevation)" language="css" />
        </div>
      </div>
    </div>
  </div>
</template>
