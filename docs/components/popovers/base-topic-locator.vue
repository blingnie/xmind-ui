<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import AppPopoverWrapper from 'client/components/base-popover.vue'
import { createAsyncQueue } from 'utils/misc'
import { WorkbookManager } from 'client/library/workbook-next/workbook-manager'
import { useWorkspaceStore } from 'app/services/pinia'
import { useContextStore } from 'client/store/context-store'
import { useWindowResize } from 'client/composables/window-resize'
import { useAnimationFrameThrottle } from 'client/composables/animation-frame-throttle'

interface PopoverCoordinate {
  x: number
  y: number
}

interface Size {
  width: number
  height: number
}

interface Padding {
  top: number
  bottom: number
  left: number
  right: number
}

// 常量定义
const POPOVER_ARROW_MARGIN_TOP = 0

// Props 定义
defineOptions({
  name: 'AppBaseTopicLocatorPopover',
})

const props = defineProps({
  workbookId: {
    type: String,
    required: true,
  },
  value: {
    type: Boolean,
    required: true,
  },
  height: {
    type: Number,
    default: null,
  },
  width: {
    type: Number,
    required: true,
  },
  paddingTop: {
    type: Number,
    default: 0,
  },
  paddingLeft: {
    type: Number,
    default: 0,
  },
  paddingBottom: {
    type: Number,
    default: 0,
  },
  paddingRight: {
    type: Number,
    default: 0,
  },
  popoverBackgroundClass: {
    type: String,
    default: '',
  },
  showArrow: {
    type: Boolean,
    default: true,
  },
})

// Emits 定义
const emit = defineEmits(['input', 'show', 'hide'])

// 响应式状态
const workbook = computed(() => props.workbookId && WorkbookManager.find(props.workbookId))
const coordinate = ref<PopoverCoordinate>({
  x: 0,
  y: 0,
})
const proxyExternalValue = ref<boolean>(false)
const { windowHeight, windowWidth } = useWindowResize()
const { throttle, cancel } = useAnimationFrameThrottle()

// 计算属性
const computedPadding = computed<Padding>(() => {
  const basePadding = 16
  return {
    top: props.paddingTop + basePadding,
    left: props.paddingLeft + basePadding,
    right: props.paddingRight + basePadding,
    bottom: props.paddingBottom + basePadding,
  }
})

// 工具函数
const getPopoverLocation = (popoverBounds: { width: number; height: number; x: number; y: number }, viewport: Size) => {
  // use the popover's arrow as alignment center
  const overflowTop = Math.min(0, popoverBounds.y)
  const overflowBottom = Math.min(0, viewport.height - popoverBounds.y - popoverBounds.height)
  const overflowLeft = Math.min(0, popoverBounds.x - popoverBounds.width / 2)
  const overflowRight = Math.min(0, viewport.width - popoverBounds.x - popoverBounds.width / 2)

  return {
    overflowTop,
    overflowBottom,
    overflowRight,
    overflowLeft,
  }
}

// 视图移动函数
const moveViewport = () => {
  if (!workbook.value) return
  const { domRectForSelection, currentZoomScale, moveViewport, activeSheetViewportMetrics } = workbook.value.workbookEditor
  const viewportSize = activeSheetViewportMetrics.value?.viewportSize
  if (!domRectForSelection.value || !viewportSize) {
    return
  }

  // minus transparent the padding value firstly
  const bounds = {
    x: domRectForSelection.value.x - computedPadding.value.left,
    y: domRectForSelection.value.y - computedPadding.value.top,
    width: domRectForSelection.value.width,
    height: domRectForSelection.value.height,
  }

  const permitViewportAreaSize = {
    width: viewportSize.width - (computedPadding.value.left + computedPadding.value.right),
    height: viewportSize.height - (computedPadding.value.top + computedPadding.value.bottom),
  }

  const popoverBounds = {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height,
    width: props.width,
    height: props.height,
  }

  const { overflowTop, overflowBottom, overflowRight, overflowLeft } = getPopoverLocation(popoverBounds, viewportSize)
  let deltaX = 0
  let deltaY = 0

  // trigger and move the viewport, center it
  if (overflowBottom < 0) {
    deltaY = popoverBounds.y - permitViewportAreaSize.height / 2
  }

  if (overflowTop < 0) {
    deltaY = popoverBounds.y - permitViewportAreaSize.height / 2
  }

  if (overflowRight < 0) {
    deltaX = popoverBounds.x - permitViewportAreaSize.width / 2
  }

  if (overflowLeft < 0) {
    deltaX = popoverBounds.x - permitViewportAreaSize.width / 2
  }

  if (deltaY || deltaX) {
    if (!workbook.value) return
    const scale = currentZoomScale.value ?? 1
    moveViewport(deltaX / scale, deltaY / scale)
  }
}

// 更新弹出框和滚动位置
const updatePopoverAndScrollPosition = async () => {
  moveViewport()
  await new Promise(resolve => setTimeout(resolve, 20))
  if (!workbook.value) return

  const bounds = workbook.value.workbookEditor.domRectForSelection.value
  const editorRect = useWorkspaceStore().editorRect
  if (!bounds) {
    proxyExternalValue.value = false
    return
  }
  const newBounds = {
    ...bounds,
    x: bounds.x + (editorRect?.x ?? 0),
    y: bounds.y + (editorRect?.y ?? 0),
  }
  coordinate.value = {
    x: newBounds.x + newBounds.width / 2,
    y: newBounds.y + newBounds.height + POPOVER_ARROW_MARGIN_TOP,
  }
}

const scheduleUpdatePopoverPosition = () => {
  throttle(() => scheduleExecutor(updatePopoverAndScrollPosition))
}

// 确保短时间内多次调用打开/关闭弹出框将按顺序运行
const scheduleExecutor = createAsyncQueue()
const contextStore = useContextStore()

// 代理外部的 'value' 变更以按顺序调用 'moveViewport' 和 'showPopover'
const changePopoverVisibility = async (isOpened: boolean) => {
  if (isOpened) {
    contextStore.setContext('isShowingTopicLocatorPopover', true)
    scheduleUpdatePopoverPosition()
    proxyExternalValue.value = true
    emit('show')
  } else {
    contextStore.setContext('isShowingTopicLocatorPopover', false)
    proxyExternalValue.value = false
    emit('hide')
  }
}

onBeforeUnmount(() => {
  contextStore.setContext('isShowingTopicLocatorPopover', false)
  cancel()
})

// 监听值变化
watch(
  () => props.value,
  async isOpened => scheduleExecutor(() => changePopoverVisibility(isOpened)),
  { immediate: true },
)

watch(
  () => props.width || props.height,
  () => scheduleUpdatePopoverPosition(),
  { immediate: true },
)

watch(
  () => [windowWidth.value, windowHeight.value],
  () => {
    if (!proxyExternalValue.value) return
    scheduleUpdatePopoverPosition()
  },
)
</script>

<template>
  <div>
    <app-popover-wrapper
      :x="coordinate.x"
      :y="coordinate.y"
      :height="props.height"
      :width="props.width"
      :popover-background-class="props.popoverBackgroundClass"
      :show-arrow="props.showArrow"
      :value="proxyExternalValue"
      @input="emit('input', $event)"
    >
      <slot></slot>
    </app-popover-wrapper>
  </div>
</template>
