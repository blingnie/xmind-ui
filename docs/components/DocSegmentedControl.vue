<template>
  <div class="doc-segmented-control">
    <button
      v-for="option in options"
      :key="option.key"
      type="button"
      class="doc-segmented-control__item"
      :class="{ 'doc-segmented-control__item--active': option.key === selectedKey }"
      @click="handleSelect(option.key)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts" generic="T extends { key: string; label: string }">
const props = defineProps<{
  selectedKey: T['key']
  options: T[]
}>()

const emit = defineEmits<{
  (e: 'select', key: T['key']): void
}>()

const handleSelect = (key: T['key']) => {
  emit('select', key)
}
</script>

<style scoped>
.doc-segmented-control {
  display: flex;
  gap: var(--spacing-padding-xs-4);
  padding: var(--spacing-padding-xs-4);
  border-radius: var(--radius-s-8);
  background-color: var(--color-mask-overlays);
}

.doc-segmented-control__item {
  flex: 1;
  height: var(--spacing-size-xl-24);
  padding: var(--spacing-padding-xs-4) var(--spacing-padding-s-8);
  border: none;
  border-radius: var(--radius-xs-6);
  background-color: transparent;
  color: var(--color-text-primary);
  font-size: var(--typo-interface-desktop-body-body-medium-size);
  line-height: var(--typo-interface-desktop-body-body-medium-lh);
  font-weight: var(--typo-interface-desktop-body-body-medium-weight);
  letter-spacing: var(--typo-interface-desktop-body-body-medium-ls);
  cursor: pointer;
  transition: background-color 150ms ease;
}

.doc-segmented-control__item:hover:not(.doc-segmented-control__item--active) {
  background-color: var(--color-mask-overlays);
}

.doc-segmented-control__item:active:not(.doc-segmented-control__item--active) {
  background-color: var(--color-mask-overlay-deep);
}

.doc-segmented-control__item--active {
  background-color: var(--color-fill-surfacebright);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px 0 rgba(0, 0, 0, 0.10);
}

.doc-segmented-control__item--active:hover {
  background-color: var(--color-fill-surfacebright);
}

.doc-segmented-control__item--active:active {
  background-color: var(--color-fill-surfacebright);
}
</style>
