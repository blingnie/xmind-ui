<script lang="ts">
import { defineComponent, onBeforeUnmount, ref, watch } from 'vue'
export default defineComponent({
  name: 'BaseOverlay',
  props: {
    isActivated: {
      type: Boolean,
      default: false,
    },
    escClose: {
      type: Boolean,
      default: true,
    },
    zIndex: {
      type: Number,
      default: 2001,
    },
  },
  emits: ['overlay-close'],
  setup(props, ctx) {
    const overlay = ref<HTMLElement>(null)
    const containerStyle = ref({
      zIndex: props.zIndex.toString(),
    })

    const emitClose = () => {
      ctx.emit('overlay-close')
    }

    const handleEscapeClose = (e: KeyboardEvent) => {
      if (e.defaultPrevented) {
        return
      }
      if (e?.key?.toLowerCase() === 'escape' && props.escClose) {
        emitClose()
        e.preventDefault()
      }
    }

    onBeforeUnmount(() => {
      removeDialogOverlay()
      deregisterEventListening()
    })

    const addDialogOverlay = () => {
      removeDialogOverlay()

      overlay.value = document.createElement('div')
      overlay.value.classList.add('overlay')
      overlay.value.style.position = 'fixed'
      overlay.value.style.width = '100vw'
      overlay.value.style.height = '100vh'
      overlay.value.style.left = '0'
      overlay.value.style.top = '0'
      overlay.value.style.zIndex = (props.zIndex - 1).toString()
      overlay.value.style.backgroundColor = 'transparent'
      overlay.value.addEventListener('click', emitClose)

      containerStyle.value.zIndex = props.zIndex.toString()

      document.body.appendChild(overlay.value)
    }

    const removeDialogOverlay = () => {
      if (!overlay.value) return
      document.body.removeChild(overlay.value)
      overlay.value = null
    }

    const registerEventListening = () => {
      document.addEventListener('keydown', handleEscapeClose)
    }

    const deregisterEventListening = () => {
      document.removeEventListener('keydown', handleEscapeClose)
    }

    watch(
      () => props.isActivated,
      isActivated => {
        if (isActivated) {
          addDialogOverlay()
          registerEventListening()
        } else {
          removeDialogOverlay()
          deregisterEventListening()
        }
      },
    )

    return {
      containerStyle,
      emitClose,
    }
  },
})
</script>

<template>
  <div style="position: fixed; left: 0; top: 0" :style="containerStyle" @keydown.esc.stop.prevent="emitClose">
    <slot></slot>
  </div>
</template>
