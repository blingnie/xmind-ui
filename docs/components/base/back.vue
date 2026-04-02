<template>
  <div
    v-if="computedType === 'rounded'"
    :class="
      twMerge(
        'flex items-center justify-center rounded-full bg-mask-overlay-m-light p-1 text-icon-secondary-light transition-opacity duration-short-2 ease-expressive-standard dark:bg-mask-overlay-m-dark dark:text-icon-secondary-dark',
        disabled ? 'cursor-not-allowed opacity-50' : '',
        props.class,
      )
    "
    role="button"
    @click="emitBack"
  >
    <Icon
      class="shrink-0"
      :width="iconSize"
      :height="iconSize"
      :class="forceLightMode ? 'text-icon-secondary-light' : 'text-icon-secondary-light dark:text-icon-secondary-dark'"
      name="arrow-leftward"
    />
  </div>
  <fw-tile-button
    v-else
    :class="clsx(props.class)"
    :custom-class="forceLightMode ? 'text-text-primary-light' : 'text-text-primary-light dark:text-text-primary-dark'"
    :disabled="disabled"
    :active="false"
    @click="emitBack"
  >
    <Icon
      class="shrink-0"
      :width="iconSize"
      :height="iconSize"
      :class="forceLightMode ? 'text-text-primary-light' : 'text-text-primary-light dark:text-text-primary-dark'"
      name="arrow-leftward"
    />
  </fw-tile-button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Icon from 'client/components/icon/icon.vue'
import { useWindowResize } from 'client/composables/window-resize'

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    forceLightMode?: boolean
    type?: 'rounded' | 'tile'
    class?: VueClass
    iconSize?: number
  }>(),
  {
    disabled: false,
    class: '',
    iconSize: 20,
  },
)

const emit = defineEmits<{
  (e: 'back'): void
}>()

const { isPhoneSizeViewportWidth } = useWindowResize()

const computedType = computed(() => {
  if (props.type) {
    return props.type
  }

  return isPhoneSizeViewportWidth.value ? 'rounded' : 'tile'
})

const emitBack = () => {
  if (props.disabled) {
    return
  }

  emit('back')
}
</script>
