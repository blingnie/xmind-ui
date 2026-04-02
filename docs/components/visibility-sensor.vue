<template>
  <div ref="entryContainer">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue'

export default defineComponent({
  name: 'VisibilitySensor',

  props: {
    options: {
      type: Object,
      default() {
        return {}
      },
    },
    onVisibleChange: {
      type: Function,
      default: () => {
        return
      },
    },
  },
  emits: ['onVisibleChange'],
  setup(props, ctx) {
    const entryContainer = ref<HTMLElement>(null)

    let io = null
    onMounted(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
      if (!entryContainer.value) {
        return
      }
      io = new IntersectionObserver(
        ([entry]) => {
          ctx.emit('onVisibleChange', entry.isIntersecting)
        },
        {
          root: entryContainer.value.parentElement,
          ...props.options,
        },
      )
      io.observe(entryContainer.value)
    })
    onBeforeUnmount(() => {
      io && io.disconnect()
    })

    return {
      entryContainer,
    }
  },
})
</script>
