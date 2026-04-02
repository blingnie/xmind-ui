<template>
  <div v-if="config.tokens" class="tokens-table">
    <h2 class="text-base font-semibold mb-4">Design Tokens Used</h2>
    <div class="rounded-xl border border-[var(--color-border-translucent)] overflow-hidden">
      <div class="grid grid-cols-[1fr_2fr] gap-4 px-4 py-2 bg-[var(--color-fill-secondary)] text-xs text-[var(--color-text-tertiary)] font-medium">
        <span>Category</span>
        <span>Tokens</span>
      </div>
      <div class="divide-y divide-[var(--color-border-translucent)]">
        <div
          v-if="config.tokens.colors && config.tokens.colors.length > 0"
          class="grid grid-cols-[1fr_2fr] gap-4 px-4 py-3"
        >
          <span class="text-sm font-medium">Colors</span>
          <div class="text-sm font-mono text-[var(--color-text-tertiary)] space-y-1">
            <div v-for="token in config.tokens.colors" :key="token">{{ token }}</div>
          </div>
        </div>

        <div
          v-if="config.tokens.spacing && config.tokens.spacing.length > 0"
          class="grid grid-cols-[1fr_2fr] gap-4 px-4 py-3"
        >
          <span class="text-sm font-medium">Spacing</span>
          <div class="text-sm font-mono text-[var(--color-text-tertiary)] space-y-1">
            <div v-for="token in config.tokens.spacing" :key="token">{{ token }}</div>
          </div>
        </div>

        <div
          v-if="config.tokens.typography && config.tokens.typography.length > 0"
          class="grid grid-cols-[1fr_2fr] gap-4 px-4 py-3"
        >
          <span class="text-sm font-medium">Typography</span>
          <div class="text-sm font-mono text-[var(--color-text-tertiary)] space-y-1">
            <div v-for="token in config.tokens.typography" :key="token">{{ token }}</div>
          </div>
        </div>

        <div
          v-if="config.tokens.radius && config.tokens.radius.length > 0"
          class="grid grid-cols-[1fr_2fr] gap-4 px-4 py-3"
        >
          <span class="text-sm font-medium">Radius</span>
          <div class="text-sm font-mono text-[var(--color-text-tertiary)] space-y-1">
            <div v-for="token in config.tokens.radius" :key="token">{{ token }}</div>
          </div>
        </div>

        <div
          v-if="config.tokens.effects && config.tokens.effects.length > 0"
          class="grid grid-cols-[1fr_2fr] gap-4 px-4 py-3"
        >
          <span class="text-sm font-medium">Effects</span>
          <div class="text-sm font-mono text-[var(--color-text-tertiary)] space-y-1">
            <div v-for="token in config.tokens.effects" :key="token">{{ token }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComponentConfig } from '../../packages/components/types/component-config'

defineProps<{
  config: ComponentConfig
}>()
</script>

<style scoped>
.tokens-table {
  margin-top: 2rem;
}
</style>
