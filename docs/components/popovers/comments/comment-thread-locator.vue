<template>
  <div v-show="value">
    <app-base-overlay :is-activated="isActivated" :style="containerStyles" class="fixed" @overlay-close="emit('input', false)">
      <div
        class="h-full w-full overflow-hidden rounded-[12px] bg-fill-surface-light shadow-elevation-l3-light dark:bg-fill-surface-dark dark:shadow-elevation-l3-dark"
      >
        <slot />
      </div>
    </app-base-overlay>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch, withDefaults } from 'vue'
import AppBaseOverlay from 'client/components/new-base-overlay.vue'
import { createAsyncQueue } from 'utils/misc'

const props = withDefaults(
  defineProps<{
    workbookId: string
    value: boolean
    x: number
    y: number
    width: number
    height?: number | null
    isActivated?: boolean
  }>(),
  {
    height: null,
    isActivated: false,
  },
)

const emit = defineEmits<{
  (e: 'input', value: boolean): void
  (e: 'show'): void
  (e: 'hide'): void
}>()

const containerStyles = computed(() => {
  const normalize = (num: number | void) => (typeof num === 'number' ? num + 'px' : 'auto')
  return {
    left: props.x + 'px',
    top: props.y + 'px',
    'max-width': props.width || 'auto',
    'max-height': normalize(props.height),
    'min-height': normalize(props.height),
    height: normalize(props.height),
    width: normalize(props.width),
  }
})

const proxyExternalValue = ref<boolean>(false)

// Ensure multiple call open/close popover in short time will run in sequence
const scheduleExecutor = createAsyncQueue()

const changePopoverVisibility = async (isOpened: boolean) => {
  proxyExternalValue.value = isOpened
  if (isOpened) {
    emit('show')
  } else {
    emit('hide')
  }
}

watch(
  () => props.value,
  async isOpened => scheduleExecutor(() => changePopoverVisibility(isOpened)),
  { immediate: true },
)
</script>
