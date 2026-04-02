<script lang="ts">
import { defineComponent, watch, computed } from 'vue'
import AppBaseOverlay from './base-overlay.vue'
import Arrow from 'client/assets/import-files/images/popover-arrow.svg?component'
export default defineComponent({
  name: 'PopoverWrapper',
  components: {
    AppBaseOverlay,
    Arrow,
  },
  props: {
    width: {
      type: Number,
      default: 0,
    },
    height: {
      type: Number,
      default: null,
    },
    maxHeight: {
      type: Number,
      default: null,
    },
    minHeight: {
      type: Number,
      default: null,
    },
    x: {
      type: Number,
      default: 0,
    },
    y: {
      type: Number,
      default: 0,
    },
    // Using v-model external to ensure syncing of popover visible state.
    value: {
      type: Boolean,
      default: false,
    },
    popoverBackgroundClass: {
      type: String,
      default: '',
    },
    showArrow: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['input'],
  setup(props, ctx) {
    watch(
      () => props.value,
      async (newVal, oldVal) => {
        if (newVal === oldVal) {
          return
        }
      },
      { immediate: true },
    )

    const containerStyles = computed(() => {
      const normalize = (num: number | void) => (typeof num === 'number' ? num + 'px' : 'auto')
      return {
        left: props.x + 'px',
        top: props.y + 'px',
        'max-width': props.width || 'auto',
        'max-height': normalize(props.height ? props.height : props.maxHeight),
        'min-height': normalize(props.height ? props.height : props.minHeight),
        height: normalize(props.height),
        width: normalize(props.width),
      }
    })

    const emitNewValue = (val: boolean) => {
      ctx.emit('input', val)
    }

    return {
      emitNewValue,
      containerStyles,
    }
  },
})
</script>

<template>
  <app-base-overlay
    v-show="value"
    :is-activated="value"
    :style="containerStyles"
    class="fixed z-common-popover mt-2.5 translate-x-[-50%]"
    @overlay-close="emitNewValue(false)"
  >
    <transition name="popover" appear>
      <div
        v-show="value"
        class="h-full w-full rounded-xl bg-material-acrylic-light shadow-elevation-l4-light backdrop-blur-md dark:bg-material-acrylic-dark dark:shadow-elevation-l4-dark"
        :class="popoverBackgroundClass"
      >
        <arrow
          v-if="value && showArrow"
          class="fixed left-[50%] top-[-10px] z-common-popover h-2.5 w-12 translate-x-[-50%] text-[#F6F7F8] dark:text-[#1F2326]"
        />
        <slot></slot>
      </div>
    </transition>
  </app-base-overlay>
</template>
<style scoped>
.popover-enter-active {
  transition:
    opacity 0.2s cubic-bezier(0.2, 0.9, 0.5, 1.1),
    transform 0.25s cubic-bezier(0.2, 0.9, 0.5, 1.1);
}
.popover-leave-active {
  transition: unset;
}
.popover-enter-from,
.popover-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
