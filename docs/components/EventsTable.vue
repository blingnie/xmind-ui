<template>
  <div v-if="config.events && config.events.length > 0" class="events-table">
    <h2 class="text-base font-semibold mb-4">Events</h2>
    <div class="rounded-xl border border-[var(--color-border-translucent)] overflow-hidden">
      <div class="grid grid-cols-[1fr_1fr_2fr] gap-4 px-4 py-2 bg-[var(--color-fill-secondary)] text-xs text-[var(--color-text-tertiary)] font-medium">
        <span>Name</span>
        <span>Payload</span>
        <span>Description</span>
      </div>
      <div class="divide-y divide-[var(--color-border-translucent)]">
        <div
          v-for="event in config.events"
          :key="event.name"
          class="grid grid-cols-[1fr_1fr_2fr] gap-4 px-4 py-3 items-center"
        >
          <span class="text-sm font-mono">{{ event.name }}</span>
          <span class="text-sm font-mono text-[var(--color-text-tertiary)]">{{ event.payload }}</span>
          <span class="text-sm">{{ event.description }}</span>
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
.events-table {
  margin-top: 2rem;
}
</style>
