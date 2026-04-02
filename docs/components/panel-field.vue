<template>
  <div class="flex flex-col gap-1">
    <label class="text-desktop-caption-small text-text-tertiary-light dark:text-text-tertiary-dark">{{ label }}</label>
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    label?: string
  }>(),
  {
    label: '',
  },
)
</script>
