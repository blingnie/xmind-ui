<template>
  <div class="relative flex h-full items-center justify-center gap-2" :class="[vertical ? 'flex-col' : 'flex-row']">
    <icon v-if="isShowSign" :name="vertical ? 'add' : 'minus'" :width="16" :height="16" class="text-gray-400" />

    <div
      ref="sliderRef"
      class="relative bg-mask-overlay-m-light shadow-elevation-b1-light dark:bg-mask-overlay-m-dark dark:shadow-elevation-b1-dark"
      :style="{
        width: vertical ? `${thick}px` : '100%',
        height: vertical ? '100%' : `${thick}px`,
        borderRadius: thick / 2 + 'px',
      }"
      @click="onSlideClick"
    >
      <!-- bar -->
      <span
        class="absolute left-0 block"
        :class="[vertical ? 'bottom-0' : 'top-0', barClass || 'bg-text-accent']"
        :style="{
          width: vertical ? '100%' : `${inputValue}%`,
          height: vertical ? `${inputValue}%` : '100%',
          borderRadius: thick / 2 + 'px',
        }"
      ></span>

      <!-- knob -->
      <span
        ref="knobRef"
        class="knob absolute flex touch-none items-center justify-center"
        :style="{
          width: knobAreaSize + 'px',
          height: knobAreaSize + 'px',
          left: vertical ? `-${knobAreaSize / 2 - thick / 2}px` : `calc(${inputValue}% - ${knobAreaSize / 2}px)`,
          bottom: vertical ? `calc(${inputValue}% - ${knobAreaSize / 2}px)` : `-${knobAreaSize / 2 - thick / 2}px`,
        }"
      >
        <span
          class="knob-ele block touch-none border-[1px] border-solid border-border-muted-light bg-white dark:border-border-muted-dark"
          :class="[disabled ? 'disabled cursor-not-allowed !shadow-none' : '']"
          :style="{
            width: `${props.knobSize}px`,
            height: `${props.knobSize}px`,
            borderRadius: props.knobSize / 2 + 'px',
          }"
        ></span>
      </span>
    </div>
    <icon v-if="isShowSign" :name="vertical ? 'minus' : 'add'" :width="16" :height="16" class="text-gray-400" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useDraggable } from '@vueuse/core'
import Icon from 'client/components/icon/icon.vue'
import { throttle } from 'utils/misc'

const props = withDefaults(
  defineProps<{
    vertical?: boolean
    thick?: number
    isShowSign?: boolean
    knobSize?: number
    knobAreaPadding?: number // the size of the area that can be clicked to move the knob
    disabled?: boolean
    barClass?: string
  }>(),
  {
    vertical: false,
    thick: 4,
    isShowSign: false,
    knobAreaPadding: 2,
    knobSize: 16,
    disabled: false,
    barClass: '',
  },
)

const inputValue = defineModel<number>({
  default: 50,
  required: true,
})

const knobRef = ref<HTMLElement | null>(null)
const sliderRef = ref<HTMLElement | null>(null)

const knobAreaSize = computed(() => props.knobSize + props.knobAreaPadding * 2)

const onKnobMove = throttle(
  (position: { x: number; y: number }) => {
    const parentRect = knobRef.value?.parentElement?.getBoundingClientRect()
    if (!parentRect) return

    let newValue: number
    if (props.vertical) {
      newValue = ((parentRect.height - (position.y + knobAreaSize.value / 2 - parentRect.top)) / parentRect.height) * 100
    } else {
      newValue = ((position.x + knobAreaSize.value / 2 - parentRect.left) / parentRect.width) * 100
    }

    requestAnimationFrame(() => {
      inputValue.value = Math.max(0, Math.min(100, newValue))
    })
  },
  2,
  { leading: true, trailing: false },
)

useDraggable(knobRef, {
  preventDefault: true,
  stopPropagation: true,
  axis: props.vertical ? 'y' : 'x',
  onMove: position => {
    if (props.disabled) return
    onKnobMove(position)
  },
})

const onSlideClick = (event: MouseEvent) => {
  if (props.disabled) return

  const parentRect = sliderRef.value?.getBoundingClientRect()
  if (!parentRect) return

  let newValue: number
  if (props.vertical) {
    newValue = ((parentRect.height - (event.clientY - parentRect.top)) / parentRect.height) * 100
  } else {
    newValue = ((event.clientX - parentRect.left) / parentRect.width) * 100
  }

  requestAnimationFrame(() => {
    inputValue.value = Math.max(0, Math.min(100, newValue))
  })
}
</script>

<style scoped>
.knob > knob-ele {
  @apply shadow-elevation-l1-light dark:bg-mask-overlay-m-dark dark:shadow-elevation-l1-dark;
}

.knob:hover:not(.disabled) > knob-ele {
  @apply bg-gray-100;
}
</style>
