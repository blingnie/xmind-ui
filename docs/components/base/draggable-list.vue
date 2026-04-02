<template>
  <div ref="container" class="draggable-list-container">
    <div
      v-for="(item, index) in list"
      :key="item[itemKey]"
      class="draggable-item"
      :draggable="isTouchDevice ? false : !props.disabled"
      @dragstart="handleDragStart"
      @drag="handleDragging"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDragDrop"
      @dragend="handleDragEnd"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <slot name="item" :element="item" :index="index"></slot>
    </div>
    <div ref="movingElementContainer" class="moving-element-container"></div>
  </div>
</template>

<script lang="ts" setup generic="T">
import { isMobileDevice } from 'utils/detectDevice'
import { nextTick, onBeforeUnmount, onMounted, ref, watchEffect } from 'vue'

const emits = defineEmits<{
  (e: 'drag-start'): void
  (e: 'drag-end', args: { list: any[]; startIndex: number; endIndex: number }): void
}>()

const props = withDefaults(
  defineProps<{
    itemKey: string
    inputList: T[]
    touchStartThreshold?: number
    disabled?: boolean
  }>(),
  {
    touchStartThreshold: 300,
    disabled: false,
  },
)

const isTouchDevice = isMobileDevice()

const list = ref([])
const container = ref<HTMLElement>()
const movingElementContainer = ref<HTMLElement>()

let startingIndex = -1
let futureIndex = -1
let onDragging = false
let movingElement: HTMLElement
let touchStartTimestamp: number
let touchDragCanceled: boolean
let touchPointMoved = false

watchEffect(
  () => {
    list.value = props.inputList
    nextTick(setupMouseEventListener)
  },
  {
    flush: 'post',
  },
)

onMounted(() => {
  setupMouseEventListener()
})

onBeforeUnmount(() => {
  disposeMouseEventListener()
})

/**
 * Mouse
 */
const setupMouseEventListener = () => {
  if (isTouchDevice || props.disabled) return
  for (let i = 0; i < props.inputList.length; i++) {
    const element = container.value?.children[i]
    element?.removeEventListener('mouseenter', handleMouseEnter)
    element?.removeEventListener('mouseleave', handleMouseLeave)

    element?.addEventListener('mouseenter', handleMouseEnter)
    element?.addEventListener('mouseleave', handleMouseLeave)
  }
}

const disposeMouseEventListener = () => {
  if (isTouchDevice || props.disabled) return
  for (let i = 0; i < props.inputList.length; i++) {
    const element = container.value?.children[i]
    element?.removeEventListener('mouseenter', handleMouseEnter)
    element?.removeEventListener('mouseleave', handleMouseLeave)
  }
}

const handleMouseEnter = (event: MouseEvent) => {
  if (onDragging) return
  const element = event.currentTarget as HTMLElement
  element.children[0]?.classList.add('hover')
  element.children[0]?.classList.remove('actived')
}

const handleMouseLeave = (event: MouseEvent) => {
  const element = event.currentTarget as HTMLElement
  element.children[0]?.classList.remove('hover')
  if (!onDragging) {
    element.children[0]?.classList.remove('actived')
  }
}

/**
 * Drag
 */
const handleDragStart = (event: DragEvent) => {
  if (props.disabled) return
  const startingElement = dragStartHandler(event)
  startingElement.children[0]?.classList.add('actived')
  startingElement.children[0]?.classList.add('ghost')
}

const handleDragging = (event: DragEvent) => {
  const startingElement = container.value.children.item(startingIndex) as HTMLElement
  startingElement.children[0]?.classList.remove('ghost')

  const element = document.elementFromPoint(event.clientX, event.clientY)
  const insideContainer = container.value.contains(element)
  if (!insideContainer) {
    futureIndex = startingIndex
  }
}

const handleDragOver = (event: DragEvent) => {
  futureIndex = findDragItemIndex(event.target as HTMLElement)
  dragOverHandler(futureIndex)
  event.dataTransfer.dropEffect = 'move'
  event.preventDefault()
}

const handleDragLeave = (event: DragEvent) => {
  const leavingIndex = findDragItemIndex(event.target as HTMLElement)
  const leavingElement = container.value.children.item(leavingIndex) as HTMLElement
  leavingElement?.classList.remove('drop-before', 'drop-after')
}

const handleDragDrop = () => {
  dragDropHandler()
  const targetIndex = futureIndex
  nextTick(() => {
    const targetElement = container.value.children.item(targetIndex) as HTMLElement
    targetElement.children[0]?.classList.remove('actived')
  })
}

const handleDragEnd = () => {
  dragEndHandler()
}

/**
 * Touch
 */
const documentTouchMoveHandler = (event: TouchEvent) => {
  event.preventDefault()
}

const handleTouchStart = (event: TouchEvent) => {
  if (props.disabled) return
  touchStartTimestamp = Date.now()
  touchDragCanceled = false

  const startingElement = dragStartHandler(event)

  // setup the element that moves along with the touch point
  movingElement = document.importNode(startingElement, true)
  movingElement.style.width = window.getComputedStyle(movingElementContainer.value).width
  document.body.addEventListener('touchmove', documentTouchMoveHandler, { passive: false })
}

const handleTouchMove = (event: TouchEvent) => {
  if (props.disabled || touchDragCanceled) return
  if (Date.now() - touchStartTimestamp < props.touchStartThreshold) {
    touchDragCancelHandler()
    return
  }

  movingElement.children[0]?.classList.add('actived')
  touchPointMoved = true
  movingElementContainer.value.appendChild(movingElement)

  // sync the position of the movingElement with the touch point
  const eventLocation = event.targetTouches[0]
  const x = eventLocation.pageX - movingElement.offsetWidth / 2
  const y = eventLocation.pageY - movingElement.offsetHeight / 2
  movingElement.style.willChange = 'transform'
  movingElement.style.transform = `translate(${x}px, ${y}px)`
  movingElement.style.visibility = 'visible'
  movingElement.style.opacity = '0.4'

  // find the underlying drag item of the touch point if there's any
  let indexFromPoint = -1
  const elementsFromPoint = document.elementsFromPoint(eventLocation.pageX, eventLocation.pageY)
  const children = container.value.children
  for (let i = 0; i < children.length; i++) {
    const element = children.item(i)
    if (elementsFromPoint.includes(element)) {
      indexFromPoint = i
      break
    }
  }

  // touch point leaves the entire draggable list or leaves the previous draggable item
  if (indexFromPoint < 0 || indexFromPoint !== futureIndex) {
    const leavingIndex = futureIndex
    const leavingElement = container.value.children.item(leavingIndex) as HTMLElement
    leavingElement?.classList.remove('drop-before', 'drop-after')
  }
  if (indexFromPoint < 0) {
    futureIndex = startingIndex
    return
  }

  // Add the separator line
  futureIndex = indexFromPoint
  dragOverHandler(futureIndex)
  event.preventDefault()
}

const handleTouchEnd = () => {
  if (props.disabled || touchDragCanceled) return
  if (!touchPointMoved) {
    touchDragCancelHandler(false)
    touchPointMoved = false
    return
  }
  touchPointMoved = false

  dragDropHandler()
  const targetIndex = futureIndex
  nextTick(() => {
    const targetElement = container.value.children.item(targetIndex) as HTMLElement
    targetElement.children[0]?.classList.remove('actived')
  })

  dragEndHandler()

  if (movingElementContainer.value.contains(movingElement)) movingElementContainer.value.removeChild(movingElement)
  movingElement = null
  document.body.removeEventListener('touchmove', documentTouchMoveHandler)
}

const touchDragCancelHandler = (dragEndAsyncEmits = true) => {
  document.body.removeEventListener('touchmove', documentTouchMoveHandler)
  if (movingElementContainer.value.contains(movingElement)) movingElementContainer.value.removeChild(movingElement)
  movingElement = null
  touchStartTimestamp = null
  touchDragCanceled = true

  dragEndHandler(dragEndAsyncEmits)
}

/**
 * Common
 */
const findDragItemIndex = (target: HTMLElement) => {
  const children = container.value.children
  if (!children) return -1

  for (let i = 0; i < children.length; i++) {
    const element = children.item(i)
    if (element.contains(target)) {
      return i
    }
  }
  return -1
}

const dragStartHandler = (event: TouchEvent | DragEvent) => {
  onDragging = true
  startingIndex = findDragItemIndex(event.target as HTMLElement)

  const startingElement = container.value.children.item(startingIndex) as HTMLElement
  startingElement.children[0]?.classList.remove('hover')

  emits('drag-start')
  disposeMouseEventListener()

  return startingElement
}

const dragOverHandler = (targetIndex: number) => {
  if (startingIndex < 0) return

  const targetFutureElement = container.value.children.item(targetIndex)
  if (targetIndex < startingIndex) {
    targetFutureElement?.classList.add('drop-before')
  } else if (targetIndex > startingIndex) {
    targetFutureElement?.classList.add('drop-after')
  }
}

const dragDropHandler = () => {
  const futureElement = container.value.children.item(futureIndex) as HTMLElement
  futureElement?.classList.remove('drop-before', 'drop-after')

  if (startingIndex < 0) return
  const deleted = list.value.splice(startingIndex, 1)
  deleted[0] && list.value.splice(futureIndex, 0, deleted[0])
}

const dragEndHandler = (asyncEmit = true) => {
  const startingElement = container.value.children.item(startingIndex) as HTMLElement
  startingElement.children[0]?.classList.remove('actived')

  setupMouseEventListener()

  const [startIndex, endIndex] = [startingIndex, futureIndex]
  const asyncCallback = () => {
    emits('drag-end', { list: list.value, startIndex, endIndex })
    onDragging = false
  }
  if (asyncEmit) {
    setTimeout(asyncCallback, 500)
  } else {
    asyncCallback()
  }

  startingIndex = -1
  futureIndex = -1
}
defineExpose({
  container,
})
</script>

<style scoped>
.draggable-list-container {
  display: flex;
  flex-direction: column;
  padding: 4px 0 4px;
}

.draggable-list-container .draggable-item.drop-before {
  box-shadow: 0px -2px 0px var(--button-tile-bg-color-hover);
}

.draggable-list-container .draggable-item.drop-after {
  box-shadow: 0px 2px 0px var(--button-tile-bg-color-hover);
}

/* Hide the default box-shadow for the dragging element */
.draggable-list-container .draggable-item:has(> .ghost) {
  transform: translate(0, 0);
}

.draggable-list-container .moving-element-container > div {
  position: fixed;
  left: 0px;
  top: 0px;
  visibility: hidden;
}
</style>
