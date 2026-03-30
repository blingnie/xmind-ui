<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { getElevations } = useTokens()
const elevations = getElevations()
const { theme } = inject('theme') as any
const activeMode = computed(() => theme.value === 'light' ? 'Light' : 'Dark')
const copied = ref('')
async function copy(text: string) {
  await navigator.clipboard.writeText(text)
  copied.value = text
  setTimeout(() => { copied.value = '' }, 1200)
}
</script>
<template>
  <div class="px-10 py-8 max-w-5xl">
    <h1 class="text-xl font-semibold mb-1">Elevation</h1>
    <p class="text-sm text-[var(--color-text-tertiary)] mb-6">Elevation tokens define shadow and blur effects to create depth hierarchy across UI layers. Each level corresponds to specific component types and interaction states.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div v-for="elevation in elevations" :key="elevation.level" class="rounded-xl border border-[var(--color-border-translucent)] overflow-hidden hover:shadow-[var(--shadow-l2)] transition-shadow">
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
            class="w-28 h-28 rounded-lg bg-[var(--color-fill-surfacebright)]"
            :style="{
              boxShadow: activeMode === 'Light' ? elevation.light.boxShadow : elevation.dark.boxShadow,
              backdropFilter: activeMode === 'Light' ? elevation.light.backdropFilter : elevation.dark.backdropFilter
            }"
          />
        </div>

        <!-- Properties -->
        <div class="p-4 space-y-2">
          <button
            class="w-full text-left text-xs font-mono text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors break-all leading-relaxed"
            @click="copy(activeMode === 'Light' ? elevation.light.boxShadow : elevation.dark.boxShadow)"
            :title="'Click to copy box-shadow'"
          >
            {{ copied === (activeMode === 'Light' ? elevation.light.boxShadow : elevation.dark.boxShadow) ? '✓ Copied!' : (activeMode === 'Light' ? elevation.light.boxShadow : elevation.dark.boxShadow) }}
          </button>
          <button
            v-if="(activeMode === 'Light' ? elevation.light.backdropFilter : elevation.dark.backdropFilter)"
            class="w-full text-left text-xs font-mono text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            @click="copy(activeMode === 'Light' ? elevation.light.backdropFilter : elevation.dark.backdropFilter)"
            :title="'Click to copy backdrop-filter'"
          >
            {{ copied === (activeMode === 'Light' ? elevation.light.backdropFilter : elevation.dark.backdropFilter) ? '✓ Copied!' : (activeMode === 'Light' ? elevation.light.backdropFilter : elevation.dark.backdropFilter) }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
