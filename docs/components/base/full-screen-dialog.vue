<template>
  <app-base-overlay
    v-show="isOpened"
    :is-activated="isOpened"
    :class="twMerge('h-full w-full bg-fill-container-light dark:bg-fill-container-dark sm:p-[12px]', overlayClass)"
    @overlay-close="emitClose"
  >
    <overlay-scrollbar
      :class="
        twMerge(
          'relative h-full w-full  bg-fill-surface-light shadow-elevation-g-light dark:bg-fill-surface-dark dark:shadow-elevation-g-dark sm:rounded-xl',
          dialogBodyClass,
        )
      "
    >
      <div :class="twMerge('pt-6 sm:pt-12', dialogContentClass)">
        <back v-if="isBackable" class="absolute left-6 top-6" @back="emitBack" />
        <close v-if="isClosable" class="absolute right-6 top-6" @close="emitClose" />

        <slot></slot>
      </div>
    </overlay-scrollbar>
  </app-base-overlay>
</template>

<script setup lang="ts">
import OverlayScrollbar from '../overlay-scrollbar.vue'
import AppBaseOverlay from 'client/components/new-base-overlay.vue'
import Close from './close.vue'
import Back from './back.vue'
const props = withDefaults(
  defineProps<{
    isOpened: boolean
    isClosable?: boolean
    isBackable?: boolean
    dialogBodyClass?: VueClass
    dialogContentClass?: VueClass
    overlayClass?: VueClass
  }>(),
  { isClosable: true, dialogBodyClass: '', dialogContentClass: '' },
)

const emit = defineEmits<{
  (e: 'modal-dialog-close'): void
  (e: 'modal-dialog-back'): void
}>()

const emitClose = () => {
  props.isClosable && emit('modal-dialog-close')
}
const emitBack = () => {
  props.isBackable && emit('modal-dialog-back')
}
</script>
