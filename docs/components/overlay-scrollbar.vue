<template>
  <overlay-scrollbars-component
    ref="overlayScrollbar"
    class="overlay-scrollbar"
    :defer="true"
    :options="{ overflow: { x: 'hidden' }, scrollbars: { theme: 'overlay-scrollbar-custom-theme', autoHide: 'leave', autoHideDelay: 0 } }"
    @os-initialized="initializedHanlder"
    @os-destroyed="destryoedHandler"
  >
    <slot></slot>
  </overlay-scrollbars-component>
</template>

<script setup lang="ts">
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
import 'overlayscrollbars/overlayscrollbars.css'
import { ref } from 'vue'

const props = defineProps({
  emitsHasScrollbarSignal: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits<{
  (e: 'update:has-scrollbar', hasScrollbar: boolean): void
}>()

const overlayScrollbar = ref(null)

const observer = new MutationObserver(mutationList => {
  let hasScrollbar: boolean
  for (const mutation of mutationList) {
    if ((mutation.target as HTMLElement)?.classList.contains('os-scrollbar-unusable')) {
      hasScrollbar = false
    } else {
      hasScrollbar = true
    }
  }
  emits('update:has-scrollbar', hasScrollbar)
})

const initializedHanlder = () => {
  if (props.emitsHasScrollbarSignal) {
    const rootElement = overlayScrollbar.value?.getElement() as HTMLElement
    const verticalScrollbarElement = rootElement.querySelector('.os-scrollbar.os-scrollbar-vertical')
    observer.observe(verticalScrollbarElement, { attributes: true, attributeFilter: ['class'] })
  }
}

const destryoedHandler = () => {
  observer.disconnect()
  emits('update:has-scrollbar', false)
}
</script>

<style lang="less" scoped>
.overlay-scrollbar {
  &:deep(.overlay-scrollbar-custom-theme) {
    box-sizing: border-box;
    --os-size: 16px;
    --os-padding-perpendicular: 4px;
    --os-padding-axis: 8px;
    --os-handle-border-radius: 8px;

    --os-handle-bg: var(--fw-scrollbar-thumb-bg-color);
    --os-handle-bg-hover: var(--fw-scrollbar-thumb-bg-color);
    --os-handle-bg-active: var(--fw-scrollbar-thumb-bg-color);
  }

  &:deep([data-overlayscrollbars-viewport]) {
    z-index: initial;
  }
}
</style>
