<template>
  <div :class="messageClasses">
    <div v-if="$slots.attachments" class="user-message__attachments">
      <slot name="attachments" />
    </div>
    <div class="user-message__bubble">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const messageClasses = computed(() => {
  return [
    'user-message',
  ].filter(Boolean).join(' ')
})
</script>

<style scoped>
.user-message {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--spacing-padding-s-8);
  padding-left: var(--spacing-margin-margin-m-16);
}

.user-message__attachments {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-padding-s-8);
  justify-content: flex-end;
}

.user-message__bubble {
  padding: var(--spacing-margin-margin-s-12) var(--spacing-margin-margin-m-16);
  background-color: var(--color-mask-overlays);
  border-radius: var(--radius-l-16) var(--radius-l-16) var(--radius-s-8) var(--radius-l-16);
  font-size: var(--typo-markdown-paragraph-default-size);
  line-height: var(--typo-markdown-paragraph-default-lh);
  font-weight: var(--typo-markdown-paragraph-default-weight);
  letter-spacing: var(--typo-markdown-paragraph-default-ls);
  color: var(--color-text-primary);
  word-break: break-word;
}
</style>
