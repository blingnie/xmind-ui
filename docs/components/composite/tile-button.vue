<template>
  <button
    :class="
      twMerge(
        'rounded bg-transparent  transition-colors disabled:bg-transparent disabled:opacity-30 [&.pressed]:bg-mask-overlay-m-light dark:[&.pressed]:bg-mask-overlay-m-dark',
        !isPhoneSizeViewportWidth && 'hover:bg-mask-overlay-s-light dark:hover:bg-mask-overlay-s-dark',
        size === 'large' && 'p-1',
        size === 'xlarge' && 'p-2',
        size === 'small' && 'p-[6px]',
        active && 'active',
        disabled && 'pointer-events-none',
        !disabled && 'cursor-pointer',
        props.class,
      )
    "
    :disabled="debounceDisableStatus ? disabledDebounced : disabled"
    @click="handleClick"
  >
    <slot>
      <icon :name="iconName" :width="iconSize" :height="iconSize" :class="customClass" class="pointer-events-none" />
    </slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { refDebounced } from '@vueuse/core'
import type { IconName } from '../icon/icons'
import icon from '../icon/icon.vue'
import { useWindowResize } from 'client/composables/window-resize'

const { isPhoneSizeViewportWidth } = useWindowResize()

const props = withDefaults(
  defineProps<{
    iconName?: IconName
    disabled?: boolean
    active?: boolean
    customClass?: string
    class?: VueClass
    size?: 'large' | 'small' | 'xlarge'
    debounceDisableStatus?: boolean
  }>(),
  {
    iconName: undefined,
    disabled: false,
    customClass: '',
    active: false,
    size: 'small',
    debounceDisableStatus: false,
    class: '',
  },
)

const emits = defineEmits(['click'])

const disabledDebounced = refDebounced(
  computed(() => props.disabled),
  60,
)

const iconSize = computed(() => (props.size === 'small' ? 20 : 24))

const handleClick = (event: Event) => {
  if (!props.disabled) {
    emits('click', event)
  }
}
</script>

<style scoped>
:active {
  @apply bg-mask-overlay-m-light dark:bg-mask-overlay-m-dark;
}

.active {
  @apply bg-mask-overlay-m-light dark:bg-mask-overlay-m-dark;
}
</style>
