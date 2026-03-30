<script setup lang="ts">
const props = defineProps<{
  tabs: string[]
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

function selectTab(tab: string) {
  emit('update:modelValue', tab)
}
</script>

<template>
  <div class="border-b border-[var(--color-border-translucent)]">
    <div class="flex gap-1 flex-wrap -mb-px">
      <button
        v-for="tab in tabs"
        :key="tab"
        class="px-4 py-2 text-sm font-medium transition-all relative"
        :class="modelValue === tab
          ? 'text-[var(--color-fill-accent-normal)] border-b-2 border-[var(--color-fill-accent-normal)]'
          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border-b-2 border-transparent'"
        @click="selectTab(tab)"
      >
        {{ tab }}
      </button>
    </div>
  </div>
</template>
