<template>
  <a
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    class="platform-link"
  >
    <span v-if="icon" class="platform-link__icon" v-html="icon"></span>
    <span class="platform-link__label">{{ label }}</span>
  </a>
</template>

<script setup lang="ts">
defineProps<{
  href: string
  label: string
  icon?: string
}>()
</script>

<style scoped>
.platform-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-size-xs-8);
  padding: var(--spacing-margin-margin-xxs-4) var(--spacing-margin-margin-s-12);
  margin-top: var(--spacing-margin-margin-m-16);
  margin-bottom: var(--spacing-margin-margin-l-24);
  border-radius: var(--radius-infinite-300);
  background-color: var(--color-mask-overlays);
  color: var(--color-text-primary);
  text-decoration: none;
  font-size: var(--typo-interface-desktop-body-body-large-size);
  line-height: var(--typo-interface-desktop-body-body-large-lh);
  font-weight: var(--typo-interface-desktop-body-body-large-weight);
  letter-spacing: var(--typo-interface-desktop-body-body-large-ls);
  transition: all 150ms ease;
}

.platform-link:hover {
  background-color: var(--color-mask-overlaym);
}

.platform-link__icon {
  display: inline-flex;
  flex-shrink: 0;
}

.platform-link__icon :deep(svg) {
  display: block;
}

.platform-link__label {
  white-space: nowrap;
}
</style>
