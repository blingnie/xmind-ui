<template>
  <button
    type="button"
    :class="
      twMerge(
        'flex cursor-default items-center gap-2 rounded px-2 py-1 transition-colors',
        classes,
        disabled && 'pointer-events-none cursor-not-allowed text-transparent-dark-6 dark:text-transparent-white-5',
        !disabled && 'cursor-pointer',
        props.class,
      )
    "
    :disabled="disabled"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWindowResize } from 'client/composables/window-resize'
import clsx from 'clsx'

const { isPhoneSizeViewportWidth } = useWindowResize()

const props = withDefaults(
  defineProps<{
    active?: boolean
    customActiveClass?: VueClass
    customInactiveClass?: VueClass
    class?: VueClass
    disabled?: boolean
  }>(),
  {
    active: false,
    customActiveClass: '',
    customInactiveClass: '',
    class: '',
    disabled: false,
  },
)

const classes = computed(() => {
  if (props.disabled) {
    return null
  }
  return clsx([
    props.active
      ? props.customActiveClass || 'bg-mask-overlay-deep-light dark:bg-mask-overlay-deep-dark'
      : props.customInactiveClass || [
          !isPhoneSizeViewportWidth.value && 'hover:bg-mask-overlay-s-light',
          !isPhoneSizeViewportWidth.value && 'dark:hover:bg-mask-overlay-s-dark',
          'active:bg-mask-overlay-deep-light',
          'dark:active:bg-mask-overlay-deep-dark',
        ],
  ])
})
</script>

<style scoped></style>
