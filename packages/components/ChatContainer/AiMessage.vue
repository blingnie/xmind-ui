<template>
  <div :class="messageClasses">
    <div class="ai-message__content">
      <slot />
    </div>
    <div v-if="$slots.actions" class="ai-message__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const messageClasses = computed(() => {
  return [
    'ai-message',
  ].filter(Boolean).join(' ')
})
</script>

<style scoped>
.ai-message {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-padding-l-16);
  align-items: flex-start;
}

.ai-message__content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-padding-l-16);
  width: 100%;
  font-size: var(--typo-markdown-paragraph-default-size);
  line-height: var(--typo-markdown-paragraph-default-lh);
  font-weight: var(--typo-markdown-paragraph-default-weight);
  letter-spacing: var(--typo-markdown-paragraph-default-ls);
  color: var(--color-text-primary);
  word-break: break-word;
}

.ai-message__actions {
  display: flex;
  gap: var(--spacing-padding-xs-4);
  align-items: center;
}
</style>
