<template>
  <button :class="twMerge(classString, props.class)" :disabled="disabled" @click="handleClick">
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BaseButtonSize } from '../types'
import clsx from 'clsx'

type AiButtonTheme = 'default' | 'secondary' | 'outline' | 'muted'

const props = withDefaults(
  defineProps<{
    size?: BaseButtonSize
    theme?: AiButtonTheme
    disabled?: boolean
    class?: VueClass
  }>(),
  {
    size: 'medium',
    theme: 'default',
    disabled: false,
    class: '',
  },
)

const emits = defineEmits(['click'])

const classString = computed(() => {
  return clsx([
    'ai-button',
    `ai-button-${props.size}`,
    props.theme ? `ai-button-${props.theme}` : '',
    !props.disabled && 'cursor-pointer',
    props.disabled && 'pointer-events-none',
  ])
})

const handleClick = (event: Event) => {
  if (!props.disabled) {
    emits('click', event)
  }
}
</script>

<style scoped>
.ai-button {
  @apply inline-flex shrink-0 items-center justify-center duration-short-2 ease-expressive-standard;
}

.ai-button-default {
  @apply bg-ai-button-bg-default-normal-light  text-button-content-oncolor-default-light shadow-elevation-l1-light hover:bg-ai-button-bg-default-hover-light active:bg-ai-button-bg-default-pressed disabled:bg-ai-button-bg-default-disable-light disabled:text-text-onColor-disable-light dark:bg-ai-button-bg-default-normal-dark dark:text-button-content-oncolor-default-dark  dark:shadow-elevation-l1-dark dark:hover:bg-ai-button-bg-default-hover-dark dark:active:bg-ai-button-bg-default-pressed-dark
  dark:disabled:bg-ai-button-bg-default-disable-dark dark:disabled:text-text-onColor-disable-dark;
}

.ai-button-secondary {
  @apply border
  border-ai-button-border-secondary-normal-light bg-ai-button-bg-secondary-normal-light text-ai-button-content-default-normal-light shadow-elevation-l1-light
  hover:border-ai-button-border-secondary-hover-light hover:bg-ai-button-bg-secondary-hover-light hover:text-ai-button-content-default-hover-light
  active:border-ai-button-border-secondary-pressed-light active:bg-ai-button-bg-secondary-pressed-light active:text-ai-button-content-default-pressed-light
  disabled:border-ai-button-border-secondary-disable-light disabled:bg-ai-button-bg-secondary-disable-light disabled:text-ai-button-content-default-disable-light
  dark:border-ai-button-border-secondary-normal-dark dark:bg-ai-button-bg-secondary-normal-dark dark:text-ai-button-content-default-normal-dark dark:shadow-elevation-l1-dark
  dark:hover:border-ai-button-border-secondary-hover-dark dark:hover:bg-ai-button-bg-secondary-hover-dark dark:hover:text-ai-button-content-default-hover-dark
  dark:active:border-ai-button-border-secondary-pressed-dark dark:active:bg-ai-button-bg-secondary-pressed-dark dark:active:text-ai-button-content-default-pressed-dark
  dark:disabled:border-ai-button-border-secondary-disable-dark dark:disabled:bg-ai-button-bg-secondary-disable-dark dark:disabled:text-ai-button-content-default-disable-dark;
}

.ai-button-outline {
  @apply border
  border-ai-button-border-outline-normal-light bg-ai-button-bg-outline-normal-light text-ai-button-content-default-normal-light
  hover:border-ai-button-border-outline-hover-light hover:bg-ai-button-bg-outline-hover-light hover:text-ai-button-content-default-hover-light
  active:border-ai-button-border-outline-pressed-light active:bg-ai-button-bg-outline-pressed-light active:text-ai-button-content-default-pressed-light
  disabled:border-ai-button-border-outline-disable-light disabled:bg-ai-button-bg-outline-disable-light disabled:text-ai-button-content-default-disable-light
  dark:border-ai-button-border-outline-normal-dark dark:bg-ai-button-bg-outline-normal-dark dark:text-ai-button-content-default-normal-dark
  dark:hover:border-ai-button-border-outline-hover-dark dark:hover:bg-ai-button-bg-outline-hover-dark dark:hover:text-ai-button-content-default-hover-dark
  dark:active:border-ai-button-border-outline-pressed-dark dark:active:bg-ai-button-bg-outline-pressed-dark dark:active:text-ai-button-content-default-pressed-dark
  dark:disabled:border-ai-button-border-outline-disable-dark dark:disabled:bg-ai-button-bg-outline-disable-dark dark:disabled:text-ai-button-content-default-disable-dark;
}

.ai-button-muted {
  @apply bg-ai-button-bg-outline-normal-light text-ai-button-content-default-normal-light
  hover:bg-ai-button-bg-outline-hover-light hover:text-ai-button-content-default-hover-light
  active:bg-ai-button-bg-outline-pressed-light active:text-ai-button-content-default-pressed-light
  disabled:bg-ai-button-bg-outline-disable-light disabled:text-ai-button-content-default-disable-light
  dark:bg-ai-button-bg-outline-normal-dark dark:text-ai-button-content-default-normal-dark
  dark:hover:bg-ai-button-bg-outline-hover-dark dark:hover:text-ai-button-content-default-hover-dark
  dark:active:bg-ai-button-bg-outline-pressed-dark dark:active:text-ai-button-content-default-pressed-dark
  dark:disabled:bg-ai-button-bg-outline-disable-dark dark:disabled:text-ai-button-content-default-disable-dark;
}

.ai-button-small {
  @apply h-7 rounded-[8px] px-[8px] text-desktop-body-medium;
}

.ai-button-medium {
  @apply h-8 rounded-[8px] px-[12px] text-desktop-body-large;
}

.ai-button-large {
  @apply h-10 rounded-[12px] px-[16px] text-mobile-body-large;
}
</style>
