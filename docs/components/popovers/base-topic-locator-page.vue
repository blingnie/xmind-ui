<script lang="ts">
import { computed, defineComponent, onBeforeUnmount } from 'vue'
import AppBaseOverlay from '../base-overlay.vue'
import { isMobileDevice } from 'utils/detectDevice'

const isTouchDevice = isMobileDevice()

export default defineComponent({
  name: 'AppBaseTopicLocatorPage',
  components: {
    AppBaseOverlay,
  },
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
    contentClass: {
      type: String,
      default: '',
    },
  },
  emits: ['input', 'close'],
  setup(props, ctx) {
    const emitNewValue = (val: boolean) => {
      ctx.emit('input', val)
    }
    const emitClosePage = () => {
      ctx.emit('close', true)
    }
    const isShow = computed(() => {
      return props.value
    })

    onBeforeUnmount(() => {
      emitClosePage()
    })

    return {
      isShow,
      emitNewValue,
      emitClosePage,
    }
  },
  methods: {
    handleTouchstart(e) {
      if (!isTouchDevice) return
      const edgeWidth = 12
      const target = e.touches[0] ?? e
      const offsetX = target.clientX ?? target.pageX
      // prevent swipe to navigate gesture
      if (offsetX > edgeWidth && offsetX < window.innerWidth - edgeWidth) return
      e.preventDefault()
    },
  },
})
</script>

<template>
  <div v-show="isShow" @touchstart="handleTouchstart">
    <app-base-overlay :is-activated="isShow" style="right: 0; bottom: 0" class="popover-body uk-position-fixed" @overlay-close="emitNewValue(false)">
      <div class="uk-flex uk-flex-column uk-background-default uk-height-1-1 uk-width-1-1">
        <div class="locator-page-top-bar uk-flex uk-flex-between">
          <span class="fw-text-heading03" style="font-weight: 400" @click="emitClosePage">{{ $T('Cancel') }}</span>
          <span class="fw-text-heading03" style="font-weight: 500">{{ title }}</span>
          <span class="fw-text-heading03" @click="emitNewValue(false)">{{ $T('Done') }}</span>
        </div>
        <div class="locator-page-content uk-height-expand uk-width-1-1" :class="contentClass">
          <slot></slot>
        </div>
      </div>
    </app-base-overlay>
  </div>
</template>

<style lang="less" scoped>
.locator-page-top-bar {
  padding: 28px 24px;
}
.locator-page-content {
  padding: 9px 16px;
}
</style>
