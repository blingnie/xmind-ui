<template>
  <div ref="containerRef">
    <div
      v-if="$slots['trigger']"
      ref="triggerRef"
      class="inline-flex"
      @click="togglePopover"
    >
      <slot name="trigger" :is-active="isPopoverOpen"></slot>
    </div>
    <teleport :to="teleportTarget">
      <div
        v-if="isPopoverOpen && closeOnClickOutside"
        class="fixed inset-0 z-[9998]"
        @click.stop="closePopover"
      ></div>
      <transition name="popover">
        <div
          v-if="isPopoverOpen"
          ref="popoverRef"
          :style="{
            top: popoverStyle.top + 'px',
            left: popoverStyle.left + 'px',
            width: popoverStyle.width || 'auto',
          }"
          class="fixed z-[9999]"
        >
          <div class="popover-container">
            <slot name="content"></slot>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onBeforeUnmount, computed } from 'vue'

type Position = 'bottom-left' | 'bottom-center' | 'bottom-right' | 'top-left' | 'top-center' | 'top-right'

const props = withDefaults(defineProps<{
  offsetY?: number
  offsetX?: number
  closeOnClickOutside?: boolean
  closeOnClickInsideSelector?: string
  position?: Position
  popoverWidthMatchTrigger?: boolean
  teleportTarget?: string
  isFollowTrigger?: boolean
  closeOnEsc?: boolean
}>(), {
  offsetY: 8,
  offsetX: 0,
  closeOnClickOutside: true,
  closeOnClickInsideSelector: '',
  position: 'bottom-right',
  popoverWidthMatchTrigger: false,
  teleportTarget: 'body',
  isFollowTrigger: false,
  closeOnEsc: false,
})

const isPopoverOpen = defineModel<boolean>({ default: false })
const popoverRef = ref<HTMLElement>()
const triggerRef = ref<HTMLElement>()
const containerRef = ref<HTMLElement>()

const popoverStyle = ref<{ top: number; left: number; width: string | number }>({
  top: 0,
  left: 0,
  width: 'auto',
})

const closePopover = () => {
  isPopoverOpen.value = false
}

const togglePopover = () => {
  isPopoverOpen.value = !isPopoverOpen.value
}

const updatePosition = () => {
  if (!isPopoverOpen.value || !triggerRef.value || !popoverRef.value) return

  const triggerRect = triggerRef.value.getBoundingClientRect()
  const popoverRect = popoverRef.value.getBoundingClientRect()

  let top = 0
  let left = 0

  // Calculate position based on props.position
  if (props.position === 'bottom-left') {
    top = triggerRect.bottom + props.offsetY
    left = triggerRect.left + props.offsetX
  } else if (props.position === 'bottom-center') {
    top = triggerRect.bottom + props.offsetY
    left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2 + props.offsetX
  } else if (props.position === 'bottom-right') {
    top = triggerRect.bottom + props.offsetY
    left = triggerRect.right - popoverRect.width + props.offsetX
  } else if (props.position === 'top-left') {
    top = triggerRect.top - popoverRect.height + props.offsetY
    left = triggerRect.left + props.offsetX
  } else if (props.position === 'top-center') {
    top = triggerRect.top - popoverRect.height + props.offsetY
    left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2 + props.offsetX
  } else if (props.position === 'top-right') {
    top = triggerRect.top - popoverRect.height + props.offsetY
    left = triggerRect.right - popoverRect.width + props.offsetX
  }

  // Ensure popover stays within viewport
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const padding = 8

  if (left < padding) left = padding
  if (left + popoverRect.width > viewportWidth - padding) {
    left = viewportWidth - popoverRect.width - padding
  }
  if (top < padding) top = padding
  if (top + popoverRect.height > viewportHeight - padding) {
    top = viewportHeight - popoverRect.height - padding
  }

  popoverStyle.value = {
    top,
    left,
    width: props.popoverWidthMatchTrigger ? `${triggerRect.width}px` : 'auto',
  }
}

const checkClickInside = (event: Event) => {
  if (!props.closeOnClickInsideSelector || !popoverRef.value) return

  const target = event.target as HTMLElement
  const clickableElements = popoverRef.value.querySelectorAll(props.closeOnClickInsideSelector)

  for (const element of clickableElements) {
    if (element.contains(target)) {
      closePopover()
      break
    }
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isPopoverOpen.value && props.closeOnEsc) {
    closePopover()
  }
}

const handleScroll = () => {
  if (isPopoverOpen.value) {
    updatePosition()
  }
}

watch(isPopoverOpen, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    await nextTick() // Wait for render
    updatePosition()

    if (props.closeOnClickInsideSelector) {
      popoverRef.value?.addEventListener('click', checkClickInside)
    }
    if (props.closeOnEsc) {
      document.addEventListener('keydown', handleKeydown)
    }
    window.addEventListener('scroll', handleScroll, true)
  } else {
    popoverRef.value?.removeEventListener('click', checkClickInside)
    document.removeEventListener('keydown', handleKeydown)
    window.removeEventListener('scroll', handleScroll, true)
  }
})

onBeforeUnmount(() => {
  popoverRef.value?.removeEventListener('click', checkClickInside)
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('scroll', handleScroll, true)
})

defineExpose({
  closePopover,
  togglePopover,
  isPopoverOpen,
})
</script>

<style scoped>
.popover-container {
  height: 100%;
  border-radius: var(--radius-l-16);
  border: 1px solid var(--color-border-panel);
  background-color: var(--color-material-acrylic);
  box-shadow: 0.3px 0.5px 0 0 rgba(255, 255, 255, 0.20) inset, -0.3px -0.5px 0 0 rgba(255, 255, 255, 0.10) inset, 0 8px 100px 0 rgba(0, 0, 0, 0.25), 0 4px 32px 0 rgba(0, 0, 0, 0.10);
  backdrop-filter: blur(12px);
}

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
