<template>
  <div
    v-if="computedType === 'rounded'"
    :class="
      twMerge(
        'flex items-center rounded-full bg-mask-overlay-m-light p-1 dark:bg-mask-overlay-m-dark',
        forceLightMode && 'dark:hover:bg-mask-overlay-s-light',
        !disabled && 'cursor-pointer',
        props.class,
      )
    "
    @click="$emit('close')"
  >
    <icon
      :width="iconSize"
      :height="iconSize"
      :class="
        twMerge(
          'shrink-0',
          iconClass || (forceLightMode ? 'text-icon-secondary-light' : 'text-icon-secondary-light dark:text-icon-secondary-dark'),
          disabled && 'opacity-50',
        )
      "
      name="close"
    />
  </div>
  <fw-tile-button
    v-else
    icon-name="close"
    :class="clsx(props.class, forceLightMode && 'dark:hover:bg-mask-overlay-s-light')"
    :custom-class="twMerge(iconClass || (forceLightMode ? 'text-icon-secondary-light' : 'text-icon-secondary-light dark:text-icon-secondary-dark'))"
    @click="$emit('close')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Icon from 'client/components/icon/icon.vue'
import { useWindowResize } from 'client/composables/window-resize'

const props = defineProps<{
  disabled?: boolean
  forceLightMode?: boolean
  type?: 'rounded' | 'tile'
  class?: VueClass
  iconClass?: VueClass
  iconSize?: number
}>()

defineEmits<{
  (e: 'close'): void
}>()

const { isPhoneSizeViewportWidth } = useWindowResize()

const computedType = computed(() => {
  if (props.type) {
    return props.type
  }
  return isPhoneSizeViewportWidth.value ? 'rounded' : 'tile'
})
</script>
