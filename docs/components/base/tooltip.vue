<template>
  <div
    ref="tooltipWrapper"
    :class="twMerge('relative', { inactive: isInactive }, props.class)"
    @mouseenter="handleMouseEnter()"
    @mouseleave="handleMouseLeave()"
    @mouseover="handleMouseEnter()"
    @mouseup="handleMouseLeave()"
  >
    <div
      ref="tooltipTrigger"
      :class="twMerge('app-tooltip-content', props.triggerClass)"
      @click="onClickTrigger"
      @touchstart="handleTouchstart"
      @touchend="handleTouchend"
    >
      <slot></slot>
      <slot name="trigger"></slot>
    </div>
    <teleport to="body">
      <Transition enter-active-class="animate-tooltip-enter" leave-active-class="animate-tooltip-exit" appear>
        <div
          v-show="!isInactive"
          ref="tooltipElement"
          class="app-tooltip-tips fixed left-0 top-0 z-common-popover h-fit whitespace-nowrap text-white"
          :class="[`align-${align}`, disabled ? '!hidden' : '']"
          :style="{ ...tipPadding, ...contentStyle }"
        >
          <div class="uk-box-shadow-floating relative w-fit rounded bg-dark-grey-6 px-[12px] py-[8px] text-xs dark:bg-dark-grey-5">
            <slot name="tooltip"></slot>
            <div class="app-tooltip-tips-arrow"></div>
          </div>
        </div>
      </Transition>
    </teleport>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount, ref, watch, nextTick, computed } from 'vue'
import { isTouchDevice as checkIsTouchDevice } from 'utils/is-touch-device'
import { useAppStore } from 'client/store'

const intersectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    const maxWidth = window.innerWidth
    const target = entry.target as HTMLElement
    const bounds = entry.boundingClientRect
    const tooltipBody = target.querySelector('.app-tooltip-tips-body')
    if (!tooltipBody) {
      return
    }
    if (entry.isIntersecting) {
      const isOverflowLeft = bounds.left < 0
      const isOverflowRight = bounds.right > maxWidth
      let offset = 0

      if (isOverflowLeft) {
        offset = -bounds.left + 8
      }
      if (isOverflowRight) {
        offset = maxWidth - (bounds.left + bounds.width) - 8
      }
      if (offset) {
        const arrow = target.querySelector('.app-tooltip-tips-arrow') as HTMLElement
        if (target && arrow) {
          target.style.setProperty('margin-left', `${offset}px`)
          arrow.style.setProperty('margin-left', `${-offset}px`)
        }
      }
    } else {
      tooltipBody.setAttribute('style', '')
    }
  })
})

const props = withDefaults(
  defineProps<{
    align?: 'top' | 'bottom' | 'left' | 'right'
    alignOffset?: number
    contentStyle?: { [k: string]: string }
    allowClick?: boolean
    disabled?: boolean
    delay?: number
    class?: VueClass
    triggerClass?: VueClass
    triggerOnClick?: boolean
  }>(),
  {
    align: 'bottom',
    alignOffset: 4,
    contentStyle: undefined,
    allowClick: false,
    disabled: false,
    delay: 400,
    class: '',
    triggerClass: '',
    triggerOnClick: false,
  },
)

const tipArrowSize = 4
const tooltipElement = ref<HTMLElement | null>(null)
const tooltipTrigger = ref<HTMLElement>()
const tooltipWrapper = ref<HTMLElement>()
const isInactive = ref(true)

const tipPadding = computed(() => ({
  paddingLeft: props.align === 'right' ? `${tipArrowSize + props.alignOffset}px` : '0px',
  paddingRight: props.align === 'left' ? `${tipArrowSize + props.alignOffset}px` : '0px',
  paddingTop: props.align === 'bottom' ? `${tipArrowSize + props.alignOffset}px` : '0px',
  paddingBottom: props.align === 'top' ? `${tipArrowSize + props.alignOffset}px` : '0px',
}))

let delayShowTimer: number
let timer: number | null = null
let isLongTouch = false

const handleTouchstart = () => {
  if (!checkIsTouchDevice()) return

  if (timer) {
    window.clearTimeout(timer)
  }

  isLongTouch = false
  timer = window.setTimeout(() => {
    isLongTouch = true
  }, 700)
}

const handleTouchend = (event: TouchEvent) => {
  if (isLongTouch && checkIsTouchDevice()) {
    event.stopPropagation()
    event.preventDefault()

    isInactive.value = false
  }
  isLongTouch = false
}

const handleTouchOutside = () => {
  isInactive.value = true
}

const onClickTrigger = (event: MouseEvent) => {
  if (props.triggerOnClick) {
    event.stopPropagation()
    isInactive.value = !isInactive.value
    return
  }
  if (!props.allowClick) return
  isInactive.value = false
}

const handleMouseEnter = () => {
  if (props.triggerOnClick) return
  if (delayShowTimer) window.clearTimeout(delayShowTimer)

  delayShowTimer = window.setTimeout(() => {
    isInactive.value = false
  }, props.delay)
}

const handleMouseLeave = () => {
  if (props.triggerOnClick) return
  window.clearTimeout(delayShowTimer)
  delayShowTimer = null
  isInactive.value = true
}

const handleClickOutside = (event: MouseEvent) => {
  if (!props.triggerOnClick || isInactive.value) return
  const target = event.target as Node
  if (tooltipWrapper.value?.contains(target) || tooltipElement.value?.contains(target)) {
    return
  }
  isInactive.value = true
}

onMounted(() => {
  if (tooltipElement.value) {
    intersectionObserver.observe(tooltipElement.value)
  }
  if (checkIsTouchDevice()) {
    document?.addEventListener('touchstart', handleTouchOutside)
  }
  if (props.triggerOnClick) {
    document?.addEventListener('click', handleClickOutside)
  }
})
onBeforeUnmount(() => {
  if (tooltipElement.value) {
    intersectionObserver.unobserve(tooltipElement.value)
  }
  if (checkIsTouchDevice()) {
    document?.removeEventListener('touchstart', handleTouchOutside)
  }
  if (props.triggerOnClick) {
    document?.removeEventListener('click', handleClickOutside)
  }
  if (timer) clearTimeout(timer)
})

watch(
  () => useAppStore().forceTooltipCloseGlobalTrigger,
  () => (isInactive.value = true),
)

watch(isInactive, async val => {
  if (!val && tooltipTrigger.value && tooltipElement.value) {
    await nextTick()
    const triggerBounds = tooltipTrigger.value?.getBoundingClientRect()
    const tipContentBounds = tooltipElement.value?.getBoundingClientRect()
    let translateX = 0
    let translateY = 0
    switch (props.align) {
      case 'bottom':
        translateX = triggerBounds.left - (tipContentBounds.width - triggerBounds.width) / 2
        translateY = triggerBounds.bottom
        break
      case 'top':
        translateX = triggerBounds.left - (tipContentBounds.width - triggerBounds.width) / 2
        translateY = triggerBounds.top - tipContentBounds.height
        break
      case 'left':
        translateX = triggerBounds.left - tipContentBounds.width
        translateY = triggerBounds.top - (tipContentBounds.height - triggerBounds.height) / 2
        break
      case 'right':
        translateX = triggerBounds.right
        translateY = triggerBounds.top - (tipContentBounds.height - triggerBounds.height) / 2
        break
    }

    tooltipElement.value.style.transform = `translate(${translateX}px,${translateY}px)`
  }
})
</script>

<style scoped>
.app-tooltip-content {
  -webkit-tap-highlight-color: transparent;
}

.app-tooltip-tips-arrow {
  @apply absolute bottom-0 left-1/2 z-[-1] h-full w-4 -translate-x-2;
}

.app-tooltip-tips.align-top .app-tooltip-tips-arrow::after {
  content: ' ';
  @apply absolute -bottom-2 left-1/2 block h-0 w-0 -translate-x-1/2 border-4 border-transparent border-t-gray-800 dark:border-t-gray-600;
}

.app-tooltip-tips.align-bottom .app-tooltip-tips-arrow::after {
  content: ' ';
  @apply absolute -top-2 left-1/2 block h-0 w-0 -translate-x-1/2 border-4 border-transparent border-b-gray-800 dark:border-b-gray-600;
}

.app-tooltip-tips.align-left .app-tooltip-tips-arrow {
  @apply left-full;
}
.app-tooltip-tips.align-left .app-tooltip-tips-arrow::after {
  content: ' ';
  @apply absolute -right-2 top-1/2 block h-0 w-0 -translate-y-1/2 border-4 border-transparent border-l-gray-800 dark:border-l-gray-600;
}

.app-tooltip-tips.align-right .app-tooltip-tips-arrow {
  @apply left-0;
}
.app-tooltip-tips.align-right .app-tooltip-tips-arrow::after {
  content: ' ';
  @apply absolute left-0 top-1/2 block h-0 w-0 -translate-y-1/2 border-4 border-transparent border-r-gray-800 dark:border-r-gray-600;
}
</style>
