<template>
  <div :class="containerClass">
    <slot>
      <icon class="shrink-0" :class="iconClasses" :width="size === 'default' ? 16 : 20" :height="size === 'default' ? 16 : 20" :name="iconName" />
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ClassNameValue, twMerge } from 'tailwind-merge'
import Icon from 'client/components/icon/icon.vue'
import type { IconName } from 'client/components/icon/icons'

const props = defineProps<{
  disabled?: boolean
  type: 'default' | 'muted' | 'secondary'
  size: 'default' | 'big'
  iconName: IconName
  class?: VueClass | ClassNameValue
  iconClass?: VueClass | ClassNameValue
}>()

const containerClass = computed(() => {
  const baseClass = 'flex items-center justify-center rounded-full'
  const sizeClass = props.size === 'big' ? 'size-6' : 'size-5'
  const isMuted = props.type === 'muted'
  const normalClass = isMuted
    ? 'bg-transparent'
    : 'bg-button-bg-default-normal-light shadow-elevation-l1-light dark:bg-button-bg-default-normal-dark dark:shadow-elevation-l1-dark'
  const stateClass = props.disabled
    ? isMuted
      ? 'pointer-events-none bg-button-bg-noContainer-disable-light dark:bg-button-bg-noContainer-disable-dark'
      : 'pointer-events-none border border-button-border-default-disable-light bg-button-bg-default-disable-light dark:border-button-border-default-disable-dark dark:bg-button-bg-default-disable-dark'
    : isMuted
      ? 'cursor-pointer hover:bg-button-bg-noContainer-hover-light dark:hover:bg-button-bg-noContainer-hover-dark active:bg-button-bg-noContainer-pressed-light dark:active:bg-button-bg-noContainer-pressed-dark'
      : 'cursor-pointer hover:border hover:border-button-border-default-hover-light hover:bg-button-bg-default-hover-light dark:hover:border-button-border-default-hover-dark dark:hover:bg-button-bg-default-hover-dark active:border active:border-button-border-default-pressed-light active:bg-button-bg-default-pressed-light dark:active:border-button-border-default-pressed-dark dark:active:bg-button-bg-default-pressed-dark'

  return twMerge(baseClass, normalClass, stateClass, sizeClass, props.class as ClassNameValue)
})

const iconClasses = computed(() => {
  return twMerge(
    'text-icon-secondary-light dark:text-icon-secondary-dark',
    props.disabled ? 'text-button-content-default-disable-light opacity-50 dark:text-button-content-default-disable-dark' : '',
    props.iconClass as ClassNameValue,
  )
})
</script>
