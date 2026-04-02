<template>
  <div :class="twMerge('group/carousel relative w-full', props.class)">
    <div ref="trackRef" :class="twMerge('no-scrollbar relative flex w-full overflow-x-auto', props.trackClass)">
      <span ref="leftIndicator" class="w-0"></span>
      <slot></slot>
      <span ref="rightIndicator" class="w-0"></span>
    </div>

    <template v-if="props.controlsVisibility !== 'hidden' && showLeftControl">
      <div :class="twMerge(baseLeftControlClass, props.leftControlClass)"></div>
      <slot name="left-control">
        <fw-micro-icon
          :type="props.controlIconType"
          :size="props.controlIconSize"
          :icon-name="props.leftIconName"
          @click="scroll('left')"
          :class="
            twMerge(
              'absolute left-1 top-[50%] -translate-y-[50%]',
              props.controlsVisibility === 'hover' ? 'opacity-0 transition-opacity group-hover/carousel:opacity-100' : '',
              props.controlIconClass,
            )
          "
        />
      </slot>
    </template>

    <template v-if="props.controlsVisibility !== 'hidden' && showRightControl">
      <div :class="twMerge(baseRightControlClass, props.rightControlClass)"></div>
      <slot name="right-control">
        <fw-micro-icon
          :type="props.controlIconType"
          :size="props.controlIconSize"
          :icon-name="props.rightIconName"
          @click="scroll('right')"
          :class="
            twMerge(
              'absolute right-1 top-[50%] -translate-y-[50%]',
              props.controlsVisibility === 'hover' ? 'opacity-0 transition-opacity group-hover/carousel:opacity-100' : '',
              props.controlIconClass,
            )
          "
        />
      </slot>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useElementVisibility } from '@vueuse/core'
import type { IconName } from 'client/components/icon/icons'
import clsx from 'clsx'

const props = withDefaults(
  defineProps<{
    class?: VueClass
    trackClass?: VueClass
    scrollAmount?: number
    scrollBehavior?: 'auto' | 'instant' | 'smooth'
    activeItem?: HTMLElement | null
    autoScrollIntoView?: boolean
    scrollIntoViewPadding?: number
    controlsVisibility?: 'always' | 'hover' | 'hidden'
    leftControlClass?: VueClass
    rightControlClass?: VueClass
    controlIconClass?: VueClass
    controlIconType?: 'default' | 'muted' | 'secondary'
    controlIconSize?: 'default' | 'big'
    leftIconName?: IconName
    rightIconName?: IconName
  }>(),
  {
    class: '',
    trackClass: '',
    scrollAmount: 150,
    scrollBehavior: 'smooth',
    activeItem: null,
    autoScrollIntoView: true,
    scrollIntoViewPadding: 8,
    controlsVisibility: 'always',
    leftControlClass: '',
    rightControlClass: '',
    controlIconClass: '',
    controlIconType: 'default',
    controlIconSize: 'default',
    leftIconName: 'chevron-backward',
    rightIconName: 'chevron-forward',
  },
)

const trackRef = ref<HTMLDivElement | null>(null)
const leftIndicator = ref<HTMLElement | null>(null)
const rightIndicator = ref<HTMLElement | null>(null)

const isLeftIndicatorVisible = useElementVisibility(leftIndicator)
const isRightIndicatorVisible = useElementVisibility(rightIndicator)

const showLeftControl = computed(() => !isLeftIndicatorVisible.value)
const showRightControl = computed(() => !isRightIndicatorVisible.value)
const baseLeftControlClass = clsx(
  'absolute left-0 top-0 pointer-events-none flex h-full w-[50px] justify-start bg-gradient-to-r from-fill-surfaceBright-light via-fill-surfaceBright-light/50 to-transparent pl-1 pt-6 dark:from-fill-surfaceBright-dark dark:via-fill-surfaceBright-dark/50',
)
const baseRightControlClass = clsx(
  'absolute right-0 top-0 flex h-full w-[50px] justify-end bg-gradient-to-l from-fill-surfaceBright-light via-fill-surfaceBright-light/50 to-transparent pr-1 pt-6 dark:from-fill-surfaceBright-dark dark:via-fill-surfaceBright-dark/50',
)

const scroll = (direction: 'left' | 'right', amount = props.scrollAmount) => {
  const container = trackRef.value
  if (!container) return
  const delta = direction === 'left' ? -amount : amount
  container.scrollBy({ left: delta, behavior: props.scrollBehavior })
}

const scrollItemIntoView = (item?: HTMLElement | null) => {
  const offset = 8
  const container = trackRef.value
  if (!container || !item) return
  const containerRect = container.getBoundingClientRect()
  const itemRect = item.getBoundingClientRect()
  const leftOverflow = itemRect.left - containerRect.left
  const rightOverflow = itemRect.right - containerRect.right
  if (leftOverflow < 0) {
    container.scrollBy({ left: leftOverflow - props.scrollIntoViewPadding - offset, behavior: props.scrollBehavior })
  } else if (rightOverflow > 0) {
    container.scrollBy({ left: rightOverflow + props.scrollIntoViewPadding + offset, behavior: props.scrollBehavior })
  }
}

watch(
  () => props.activeItem,
  async item => {
    if (!props.autoScrollIntoView) return
    await nextTick()
    scrollItemIntoView(item)
  },
  { flush: 'post' },
)

defineExpose({
  containerEl: trackRef,
  scrollToActive: () => scrollItemIntoView(props.activeItem),
})
</script>
