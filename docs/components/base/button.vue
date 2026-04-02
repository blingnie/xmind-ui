<template>
  <button :class="twMerge(classString, props.class)" :disabled="disabled" @click="handleClick">
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BaseButtonSize, BaseButtonTheme } from '../types'
import clsx from 'clsx'

const props = defineProps<{
  size: BaseButtonSize
  theme?: BaseButtonTheme
  disabled?: boolean
  textButton?: boolean
  class?: VueClass
}>()

const emits = defineEmits(['click'])

const classString = computed(() => {
  return clsx([
    'base-button',
    `base-button-${props.size}`,
    props.theme ? `base-button-${props.theme}` : '',
    props.textButton ? 'text-button' : '',
    !props.disabled && 'cursor-pointer',
  ])
})

const handleClick = (event: Event) => {
  if (!props.disabled) {
    emits('click', event)
  }
}
</script>

<style scoped>
.base-button {
  @apply inline-flex shrink-0 items-center justify-center duration-short-2 ease-expressive-standard;
}

.base-button-danger {
  @apply border border-red-500 text-red-500 hover:border-red-300 hover:text-red-300 active:border-red-600 active:text-red-600 disabled:border-red-200 disabled:text-red-200 dark:hover:border-red-300 dark:hover:text-red-400 dark:disabled:border-red-700 dark:disabled:text-red-700;
}

.base-button-ai {
  @apply bg-purple-500 text-light-grey-1 hover:bg-purple-400 active:bg-purple-600 disabled:bg-purple-200 disabled:text-transparent-white-8 dark:disabled:bg-purple-700;
}

.base-button-primary {
  @apply bg-xred-500 text-light-grey-1 hover:bg-xred-400 active:bg-xred-600 disabled:bg-xred-200 disabled:text-transparent-white-8 dark:disabled:bg-xred-800;
}

.base-button-secondary {
  @apply bg-grey-700 text-grey-100 hover:bg-grey-600 active:bg-grey-750 disabled:bg-grey-300 disabled:text-grey-200 dark:bg-grey-200 dark:text-grey-700 dark:hover:bg-grey-100 dark:active:bg-grey-300 dark:disabled:bg-grey-450 dark:disabled:text-grey-650;
}

.base-button-default {
  @apply border border-border-panel-light bg-grey-25 text-text-primary-light shadow-button-default-light hover:border-grey-300 hover:bg-grey-25 hover:text-text-secondary-light active:border-grey-300 active:bg-grey-200 active:text-grey-800 disabled:border-grey-200 disabled:bg-grey-25 disabled:text-transparent-dark-6 dark:border-border-panel-dark dark:bg-grey-700 dark:text-text-primary-dark dark:hover:border-grey-500 dark:hover:bg-grey-700 dark:hover:text-text-secondary-dark dark:active:border-grey-500 dark:active:bg-grey-800 dark:active:text-grey-200 dark:disabled:border-grey-700 dark:disabled:bg-grey-700 dark:disabled:text-transparent-white-5;
}

.base-button-link {
  @apply text-blue-500 hover:bg-mask-overlay-s-light hover:text-blue-400 active:bg-mask-overlay-m-light active:text-blue-600 disabled:text-blue-100 dark:hover:bg-mask-overlay-s-dark dark:active:bg-mask-overlay-m-dark dark:disabled:text-blue-900;
}

.base-button-small {
  @apply h-7 rounded px-[12px] text-desktop-subhead-mini;
}

.base-button-medium {
  @apply h-8 rounded px-[16px] text-desktop-subhead-small;
}

.base-button-large {
  @apply h-10 rounded-lg px-[20px] text-desktop-subhead-medium;
}

.base-button-link.base-button-small {
  @apply h-4 px-0.5 text-desktop-body-small;
}

.base-button-link.base-button-medium {
  @apply h-5 px-1 text-desktop-subhead-mini;
}

.base-button-link.base-button-large {
  @apply h-6 px-1 text-desktop-subhead-small;
}

.base-button-primary.text-button {
  @apply rounded-none bg-transparent p-0 text-xred-500 hover:text-xred-400 active:text-xred-600 disabled:text-xred-200 dark:bg-transparent dark:disabled:text-xred-800;
}
.base-button-secondary.base-button.text-button {
  @apply rounded-none bg-transparent p-0 text-grey-800 hover:text-grey-600 active:text-grey-850 disabled:text-grey-300 dark:bg-transparent dark:text-grey-200 dark:hover:text-grey-100 dark:active:text-grey-300 dark:disabled:text-grey-450;
}
</style>
