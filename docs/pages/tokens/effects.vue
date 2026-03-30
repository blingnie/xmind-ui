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

    <div class="space-y-6">
      <div v-for="elevation in elevations" :key="elevation.level" class="rounded-xl border border-[var(--color-border-translucent)] overflow-hidden">
        <!-- Header -->
        <div class="bg-[var(--color-fill-secondary)] px-4 py-3 border-b border-[var(--color-border-translucent)]">
          <div class="flex items-center gap-3">
            <span class="text-sm font-semibold font-mono">{{ elevation.level }}</span>
            <span class="text-xs text-[var(--color-text-tertiary)]">{{ elevation.description }}</span>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6 space-y-4">
          <!-- Preview -->
          <div class="flex items-center justify-center p-8 rounded-lg bg-[var(--color-fill-tertiary)]">
            <div
              class="w-32 h-32 rounded-lg bg-[var(--color-fill-primary)]"
              :style="{
                boxShadow: activeMode === 'Light' ? elevation.light.boxShadow : elevation.dark.boxShadow,
                backdropFilter: activeMode === 'Light' ? elevation.light.backdropFilter : elevation.dark.backdropFilter
              }"
            />
          </div>

          <!-- Properties -->
          <div class="space-y-2">
            <div class="flex items-start gap-4">
              <span class="text-xs font-medium text-[var(--color-text-tertiary)] w-32 shrink-0 pt-1">box-shadow:</span>
              <button
                class="flex-1 text-xs font-mono text-left text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors break-all"
                @click="copy(activeMode === 'Light' ? elevation.light.boxShadow : elevation.dark.boxShadow)"
              >
                {{ copied === (activeMode === 'Light' ? elevation.light.boxShadow : elevation.dark.boxShadow) ? '✓ copied' : (activeMode === 'Light' ? elevation.light.boxShadow : elevation.dark.boxShadow) }}
              </button>
            </div>
            <div v-if="(activeMode === 'Light' ? elevation.light.backdropFilter : elevation.dark.backdropFilter)" class="flex items-start gap-4">
              <span class="text-xs font-medium text-[var(--color-text-tertiary)] w-32 shrink-0 pt-1">backdrop-filter:</span>
              <button
                class="flex-1 text-xs font-mono text-left text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                @click="copy(activeMode === 'Light' ? elevation.light.backdropFilter : elevation.dark.backdropFilter)"
              >
                {{ copied === (activeMode === 'Light' ? elevation.light.backdropFilter : elevation.dark.backdropFilter) ? '✓ copied' : (activeMode === 'Light' ? elevation.light.backdropFilter : elevation.dark.backdropFilter) }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
