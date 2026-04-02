<template>
  <div :id="'popover-' + popoverId" ref="containerRef">
    <div
      v-if="$slots['trigger']"
      ref="triggerRef"
      class="flex h-auto w-auto"
      @click="togglePopover"
      @mouseenter="isMouseOverTrigger = true"
      @mouseover="isMouseOverTrigger = true"
      @mouseleave="isMouseOverTrigger = false"
    >
      <slot name="trigger" :is-active="isPopoverOpen" :popover-id="popoverId"></slot>
    </div>
    <teleport :to="teleportTarget">
      <!-- popover body slot, for customize -->
      <slot name="popover-body">
        <transition name="fade">
          <div
            v-if="!disableBottomDrawerMask && isBottomDrawer && isRootPopover && isPopoverOpen && !isDisabled"
            class="fixed bottom-0 left-0 right-0 top-0 z-common-popover bg-mask-background-default-light dark:bg-mask-background-default-dark"
            @click.stop.prevent="closeAllPopovers"
          ></div
        ></transition>

        <div
          v-if="isPopoverOpen && popoverCloseMask && !isBottomDrawer && isPopoverPositionUpdated"
          class="fixed bottom-0 left-0 right-0 top-0 z-common-popover"
          @click.stop.prevent="closeAllPopovers"
        ></div>
        <transition :name="isBottomDrawer ? drawerAnimation : 'popover'">
          <div
            v-if="isPopoverOpen && !isDisabled"
            ref="popoverRef"
            :style="
              isBottomDrawer
                ? null
                : {
                    top: popoverBoundsStyle.top + 'px',
                    left: popoverBoundsStyle.left + 'px',
                    width: popoverBoundsStyle.width || 'auto',
                    height: popoverBoundsStyle.height || 'auto',
                  }
            "
            class="fixed z-common-popover"
            :class="twMerge(!isPopoverPositionUpdated && '!z-[-1]', isBottomDrawer && 'bottom-0')"
          >
            <template v-if="position !== 'bottom-drawer'">
              <div
                :class="
                  twMerge(
                    'h-full rounded-lg border border-border-panel-light bg-material-acrylic-light shadow-elevation-l4-light backdrop-blur-md dark:border-border-panel-dark dark:bg-material-acrylic-dark dark:shadow-elevation-l4-dark',
                    popoverContainerClass,
                  )
                "
                @mouseenter="isMouseOverPopover = true"
                @mouseover="isMouseOverPopover = true"
                @mouseleave="isMouseOverPopover = false"
              >
                <arrow
                  v-if="arrow"
                  :class="
                    twMerge(
                      'absolute origin-center text-[#F5F6F7] dark:text-[#1F2326]',
                      arrowDirection === 'bottom' && 'rotate-[180deg]',
                      arrowDirection === 'left' && 'rotate-[270deg]',
                      arrowDirection === 'right' && 'rotate-90',
                    )
                  "
                  :style="{
                    top: popoverArrowStyle.top + 'px',
                    left: popoverArrowStyle.left + 'px',
                  }"
                />
                <slot name="content" :is-root="isRootPopover"></slot>
              </div>
            </template>
            <template v-else>
              <slot name="drawer-container" :is-root="isRootPopover" :is-drawer-active="isDrawerActive">
                <bottom-drawer>
                  <slot name="content" :is-root="isRootPopover" :is-drawer-active="isDrawerActive"></slot>
                </bottom-drawer>
              </slot>
            </template>
          </div>
        </transition>
      </slot>
    </teleport>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, ref, watch, reactive, onMounted, onBeforeUnmount, computed, onBeforeMount } from 'vue'
import { outDistance, DOMrectToRect, type Rect, expandRect } from 'utils/metrics'
import { debounce } from 'utils/misc'
import { generateShortUUID } from 'utils/shortUUID'
import { usePopoverChain } from 'client/store/popover-chain'
import Arrow from 'client/assets/import-files/images/popover-arrow.svg'
import BottomDrawer from 'client/components/base/bottom-drawer.vue'
import type { PopoverPosition } from '../types'
import { until, useResizeObserver, useElementBounding } from '@vueuse/core'
import { useAnimationFrameThrottle } from 'client/composables/animation-frame-throttle'

export interface PopoverProps {
  popoverId?: string // unique id for the popover, used for chain popover
  parentId?: string // id of the parent popover, used for chain popover
  offsetY?: number
  offsetX?: number
  closeOnClickOutside?: boolean
  position: PopoverPosition
  triggerRect?: Rect // used when trigger element is not used, like in context menu
  containerBounding?: Rect
  isDisabled?: boolean
  arrow?: boolean | 'top' | 'bottom' | 'left' | 'right'
  /** @deprecated should use exposed method to control and close popover from outside */
  closeOnClickInsideSelector?: string
  scrollableParentContainerSelector?: string
  popoverWidthMatchTrigger?: boolean
  isHoverTrigger?: boolean
  drawerAnimation?: 'slide-in-out' | 'right-slide-in-out'
  nameSpace?: string // use for chain popover and sub-popover, like 'file-menu', 'file-menu-item', must be unique in the page
  disableBottomDrawerMask?: boolean // if true, the bottom drawer mask will not be rendered
  minPopoverHeight?: number // minimum height of the popover, used for calculating bounds of the popover
  teleportTarget?: string | Element // teleport target, default to body
  popoverCloseMask?: boolean
  popoverContainerClass?: string // class for the popover container
  hoverLeaveBehavior?: 'close' | 'keep'
  isFollowTrigger?: boolean
  closeOnEsc?: boolean
}

const props = withDefaults(defineProps<PopoverProps>(), {
  offsetY: 0,
  offsetX: 0,
  closeOnClickOutside: true,
  containerBounding: null,
  isDisabled: false,
  arrow: false,
  closeOnClickInsideSelector: '',
  scrollableParentContainerSelector: '',
  popoverWidthMatchTrigger: false,
  isHoverTrigger: false,
  nameSpace: '',
  triggerRect: null,
  drawerAnimation: 'slide-in-out',
  disableBottomDrawerMask: false,
  minPopoverHeight: null,
  teleportTarget: 'body',
  popoverCloseMask: false,
  popoverContainerClass: '',
  hoverLeaveBehavior: 'close',
  isFollowTrigger: false,
  closeOnEsc: false,
})

const emit = defineEmits<{
  (e: 'visibility-change', value: boolean): void
}>()
const { throttle: animationFrameThrottle } = useAnimationFrameThrottle()

const { setPopoverOpenedStatus, removePopoverOpenedStatus, addPopoverToChain, getChain, removePopoverFromChain, closeAll } = usePopoverChain()

const unWatchers: (() => void)[] = []
const popoverId = props.popoverId || generateShortUUID(12)
const isPopoverOpen = defineModel<boolean>({
  default: false,
  type: Boolean,
})
const isPopoverPositionUpdated = ref(false)
const isDrawerActive = ref(true) // used to hide popover without closing it, for example, when the popover is in a chain and another popover is opened
const popoverRef = ref<HTMLElement>()
const triggerRef = ref<HTMLElement>()
const containerRef = ref<HTMLElement>()
const scrollableParentContainer = ref<HTMLElement>()
const isMouseOverPopover = ref(false)
const isMouseOverTrigger = ref(false)
const triggerBounding = useElementBounding(triggerRef)
const popoverBounding = ref<Rect>({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
})

const isEnableHover = computed(() => props.isHoverTrigger && props.position !== 'bottom-drawer')

const isBottomDrawer = computed(() => props.position === 'bottom-drawer')

const isRootPopover = computed(() => {
  if (!props.nameSpace) return true
  const chain = usePopoverChain().getChain(props.nameSpace)
  return chain[0]?.id === popoverId
})

const arrowDirection = computed(() => {
  if (!props.arrow) return null

  if (typeof props.arrow === 'string') {
    return props.arrow
  }

  // Calculate arrow direction based on position
  switch (props.position) {
    case 'bottom-left':
    case 'bottom-center':
    case 'bottom-right':
      return 'top' // arrow points up when popover is below trigger
    case 'top-left':
    case 'top-center':
    case 'top-right':
      return 'bottom' // arrow points down when popover is above trigger
    case 'right-top':
    case 'right-center':
    case 'right-bottom':
      return 'left' // arrow points left when popover is to the right of trigger
    case 'left-top':
    case 'left-center':
    case 'left-bottom':
      return 'right' // arrow points right when popover is to the left of trigger
    default:
      return 'top'
  }
})

const setDrawerActive = (value: boolean) => {
  isDrawerActive.value = value
}

const openPopover = () => {
  if (props.isDisabled) return
  isPopoverOpen.value = true
}

const closePopover = async () => {
  isPopoverOpen.value = false
}

watch(isPopoverOpen, isOpen => {
  if (isOpen) {
    setDrawerActive(true) // reset drawer active state when opening popover
    props.nameSpace && setPopoverOpenedStatus(props.nameSpace, popoverId)
  } else {
    props.nameSpace && removePopoverOpenedStatus(props.nameSpace, popoverId)
  }
})

const togglePopover = () => {
  if (isPopoverOpen.value) {
    closePopover()
  } else {
    openPopover()
  }
}

const closeAllPopovers = () => {
  if (props.nameSpace) {
    closeAll(props.nameSpace)
  } else {
    closePopover()
  }
}

const closePopoverOnMouseLeave = debounce(() => {
  if (!isEnableHover.value || !isPopoverOpen.value || !popoverRef.value || !triggerRef.value) {
    return
  }

  if (props.hoverLeaveBehavior === 'keep') {
    return
  }

  if (!isMouseOverPopover.value && !isMouseOverTrigger.value) {
    closePopover()
  }
}, 50)

const popoverBoundsStyle = reactive<{ top: number; left: number; width: number | string; height: number | string }>({
  top: 0,
  left: 0,
  width: 'auto',
  height: 'auto',
})

const popoverArrowStyle = reactive<{ top: number; left: number }>({
  top: 0,
  left: 0,
})

watch([isMouseOverPopover, isMouseOverTrigger], () => {
  if (!isEnableHover.value) return
  if (isMouseOverPopover.value || isMouseOverTrigger.value) {
    openPopover()
  } else {
    closePopoverOnMouseLeave()
  }
})

const checkClickOutside = (event: Event) => {
  if (!isPopoverPositionUpdated.value) {
    return
  }

  if (isBottomDrawer.value) return
  const target = event.target as HTMLElement
  const popoverChain = props.nameSpace ? getChain(props.nameSpace) : []
  if (popoverRef.value === target || popoverRef.value?.contains(target) || containerRef.value?.contains(target)) {
    return
  }
  if (
    popoverChain.some(
      item => item?.popoverRef?.value === target || item?.popoverRef.value?.contains(target) || item?.containerRef.value?.contains(target),
    )
  ) {
    return
  }
  closePopover()
}

const checkScrollOutside = () => {
  if (!isPopoverPositionUpdated.value) {
    return
  }
  closePopover()
}

const checkClickInside = (event: Event) => {
  if (!props.closeOnClickInsideSelector) {
    return
  }

  const target = event.target as HTMLElement

  const clickableElements = popoverRef.value?.querySelectorAll(props.closeOnClickInsideSelector)
  for (const element of clickableElements) {
    if (element.contains(target)) {
      closePopover()
      break
    }
  }
}

const waitRenderElement = async () => {
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
}

const updatePopoverPosition = () => {
  if (!isPopoverOpen.value || isBottomDrawer.value) {
    return
  }

  const triggerRect = triggerRef.value?.getBoundingClientRect?.() || props.triggerRect
  if (!triggerRect) {
    return
  }
  const triggerBounds = DOMrectToRect(triggerRect)
  if (props.popoverWidthMatchTrigger) {
    popoverBoundsStyle.width = `${triggerBounds.width}px`
  }

  const popoverBounds = popoverBounding.value

  const newPopoverBounds = {
    ...popoverBounds,
  }

  if (props.position === 'bottom-center') {
    newPopoverBounds.x = triggerBounds.x + (triggerBounds.width - popoverBounds.width) / 2 + props.offsetX
    newPopoverBounds.y = triggerBounds.y + triggerBounds.height + props.offsetY
  } else if (props.position === 'bottom-left') {
    newPopoverBounds.x = triggerBounds.x + props.offsetX
    newPopoverBounds.y = triggerBounds.y + triggerBounds.height + props.offsetY
  } else if (props.position === 'bottom-right') {
    newPopoverBounds.x = triggerBounds.x + triggerBounds.width - popoverBounds.width + props.offsetX
    newPopoverBounds.y = triggerBounds.y + triggerBounds.height + props.offsetY
  } else if (props.position === 'right-top' || props.position === 'top-right') {
    newPopoverBounds.x = triggerBounds.x + triggerBounds.width + props.offsetX
    newPopoverBounds.y = triggerBounds.y + props.offsetY
  } else if (props.position === 'right-center') {
    newPopoverBounds.x = triggerBounds.x + triggerBounds.width + props.offsetX
    newPopoverBounds.y = triggerBounds.y + (triggerBounds.height - popoverBounds.height) / 2 + props.offsetY
  } else if (props.position === 'right-bottom') {
    newPopoverBounds.x = triggerBounds.x + triggerBounds.width + props.offsetX
    newPopoverBounds.y = triggerBounds.y + triggerBounds.height - popoverBounds.height + props.offsetY
  } else if (props.position === 'left-top') {
    newPopoverBounds.x = triggerBounds.x - popoverBounds.width + props.offsetX
    newPopoverBounds.y = triggerBounds.y + props.offsetY
  } else if (props.position === 'left-center') {
    newPopoverBounds.x = triggerBounds.x - popoverBounds.width + props.offsetX
    newPopoverBounds.y = triggerBounds.y + (triggerBounds.height - popoverBounds.height) / 2 + props.offsetY
  } else if (props.position === 'left-bottom') {
    newPopoverBounds.x = triggerBounds.x - popoverBounds.width + props.offsetX
    newPopoverBounds.y = triggerBounds.y + triggerBounds.height - popoverBounds.height + props.offsetY
  } else if (props.position === 'top-left') {
    newPopoverBounds.x = triggerBounds.x + props.offsetX
    newPopoverBounds.y = triggerBounds.y - popoverBounds.height + props.offsetY
  } else if (props.position === 'top-center') {
    newPopoverBounds.x = triggerBounds.x + (triggerBounds.width - popoverBounds.width) / 2 + props.offsetX
    newPopoverBounds.y = triggerBounds.y - popoverBounds.height + props.offsetY
  }

  // adjust position to fit in viewport
  const containerBounding = props.containerBounding ?? {
    x: 0,
    y: 0,
    width: window.innerWidth,
    height: window.innerHeight,
  }

  const PADDING_TO_CONTAINER = 8 // padding to container bounds

  const outDist = outDistance(newPopoverBounds, expandRect(containerBounding, -PADDING_TO_CONTAINER))

  if (outDist.left < 0) {
    newPopoverBounds.x += -outDist.left
  }
  if (outDist.right < 0) {
    newPopoverBounds.x += outDist.right
  }
  if (outDist.top < 0) {
    newPopoverBounds.y += -outDist.top
  }
  if (outDist.bottom < 0) {
    const targetHeight = containerBounding.height - newPopoverBounds.y - PADDING_TO_CONTAINER
    const minPopoverHeight = Math.min(props.minPopoverHeight || 0, newPopoverBounds.height)
    if (minPopoverHeight && targetHeight < minPopoverHeight) {
      const heightDiff = minPopoverHeight - targetHeight
      newPopoverBounds.y -= heightDiff
      popoverBoundsStyle.height = `${minPopoverHeight}px`
    } else {
      popoverBoundsStyle.height = `${targetHeight}px`
    }
  }

  const arrowWidth = 48 // width of the arrow
  const arrowHeight = 12 // height of the arrow

  if (arrowDirection.value === 'top') {
    popoverArrowStyle.top = -arrowHeight + 1
    popoverArrowStyle.left = triggerBounds.x - newPopoverBounds.x + triggerBounds.width / 2 - arrowWidth / 2
  }
  if (arrowDirection.value === 'bottom') {
    popoverArrowStyle.top = popoverBounds.height - 1
    popoverArrowStyle.left = triggerBounds.x - newPopoverBounds.x + triggerBounds.width / 2 - arrowWidth / 2
  }
  if (arrowDirection.value === 'left') {
    popoverArrowStyle.top = triggerBounds.y - newPopoverBounds.y + triggerBounds.height / 2 - arrowWidth / 2
    popoverArrowStyle.left = -arrowHeight + 1
  }
  if (arrowDirection.value === 'right') {
    popoverArrowStyle.top = triggerBounds.y - newPopoverBounds.y + triggerBounds.height / 2 - arrowHeight / 2
    popoverArrowStyle.left = popoverBounds.width - arrowWidth / 2 + 5
  }

  popoverBoundsStyle.top = newPopoverBounds.y
  popoverBoundsStyle.left = newPopoverBounds.x
}

const throttledUpdatePopoverPosition = () => animationFrameThrottle(updatePopoverPosition)

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'Escape' || !isPopoverOpen.value) return
  closeAllPopovers()
}

watch(
  () => [triggerBounding.x.value, triggerBounding.y.value, triggerBounding.width.value, triggerBounding.height.value],
  () => {
    if (!isPopoverOpen.value || !isPopoverPositionUpdated.value || isBottomDrawer.value) {
      return
    }
    if (props.isFollowTrigger) {
      throttledUpdatePopoverPosition()
    }
  },
)

onBeforeMount(() => {
  if (props.nameSpace) {
    addPopoverToChain(props.nameSpace, {
      id: popoverId,
      parentId: props.parentId || null,
      popoverRef,
      triggerRef,
      containerRef,
      closePopover,
      openPopover,
    })
  }
})

onMounted(() => {
  scrollableParentContainer.value = props.scrollableParentContainerSelector ? document.querySelector(props.scrollableParentContainerSelector) : null
  if (props.nameSpace) {
    unWatchers.push(
      watch(
        () => usePopoverChain().getOpenedStatus(props.nameSpace),
        () => {
          if (!isBottomDrawer.value) return
          const openedStatus = [...usePopoverChain().getOpenedStatus(props.nameSpace)]
          if (openedStatus.slice(0, -1).includes(popoverId)) {
            // if this popover is not the last one, then its not active
            setDrawerActive(false)
          } else if (openedStatus.includes(popoverId)) {
            // if this popover is the last one, its active
            setDrawerActive(true)
          }
        },
      ),
    )
  }
})

onBeforeUnmount(() => {
  props.closeOnClickOutside && document.removeEventListener('click', checkClickOutside)
  scrollableParentContainer.value?.removeEventListener('scroll', checkScrollOutside)
  document.removeEventListener('keydown', handleKeydown)
  props.nameSpace && removePopoverFromChain(props.nameSpace, popoverId)
  unWatchers.forEach(unwatch => unwatch())
  unWatchers.length = 0 // clear unwatchers
})

useResizeObserver([popoverRef, document.body], entry => {
  const popoverEntry = entry.find(e => e.target === popoverRef.value)
  if (popoverEntry) {
    popoverBounding.value = DOMrectToRect(popoverEntry.contentRect)
  }
  if (!isPopoverPositionUpdated.value) return
  throttledUpdatePopoverPosition()
})

watch(isPopoverOpen, async isOpen => {
  if (!isOpen) {
    isPopoverPositionUpdated.value = false
    popoverBoundsStyle.top = 0
    popoverBoundsStyle.left = 0
    popoverBoundsStyle.width = 'auto'
    popoverBoundsStyle.height = 'auto'
    props.closeOnClickOutside && document.removeEventListener('click', checkClickOutside)
    scrollableParentContainer.value?.removeEventListener('scroll', checkScrollOutside)
    triggerRef.value?.children[0]?.classList.remove('active')
    props.closeOnEsc && document.removeEventListener('keydown', handleKeydown)
    emit('visibility-change', false)
    popoverBounding.value = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    }
    return
  }

  await nextTick()
  await until(() => popoverBounding.value?.width > 0).toBe(true)
  throttledUpdatePopoverPosition()
  await waitRenderElement()
  isPopoverPositionUpdated.value = true

  await nextTick()
  props.closeOnClickOutside && document.addEventListener('click', checkClickOutside)
  popoverRef.value?.removeEventListener('click', checkClickInside)
  popoverRef.value?.addEventListener('click', checkClickInside)
  scrollableParentContainer.value?.addEventListener('scroll', checkScrollOutside)
  props.closeOnEsc && document.addEventListener('keydown', handleKeydown)
  // add active to trigger ref's child
  triggerRef.value?.children[0]?.classList.add('active')

  emit('visibility-change', true)
})

defineExpose({
  openPopover,
  togglePopover,
  closePopover,
  isPopoverOpen,
})
</script>

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
