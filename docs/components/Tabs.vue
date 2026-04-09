<script setup lang="ts">
interface Props {
  tabs: string[]
}

const props = defineProps<Props>()
const modelValue = defineModel<string>()
</script>

<template>
  <div class="flex gap-1 border-b border-[var(--color-border-translucent)] mb-6">
    <button
      v-for="tab in tabs"
      :key="tab"
      class="px-4 pt-3 pb-2 text-sm font-medium transition-colors relative"
      :class="modelValue === tab
        ? 'text-[var(--color-text-primary)]'
        : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'"
      @click="modelValue = tab"
    >
      {{ tab }}
      <div
        v-if="modelValue === tab"
        class="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-fill-accent-normal)]"
      />
    </button>
  </div>
</template>
