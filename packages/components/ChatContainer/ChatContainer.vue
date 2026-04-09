<template>
  <div
    ref="containerRef"
    :class="containerClasses"
    @scroll="handleScroll"
  >
    <div class="chat-container__content">
      <slot />
    </div>
    <div ref="anchorRef" class="chat-container__anchor" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

interface ChatContainerProps {
  autoScroll?: boolean
}

const props = withDefaults(defineProps<ChatContainerProps>(), {
  autoScroll: true,
})

const containerRef = ref<HTMLElement>()
const anchorRef = ref<HTMLElement>()
const stickToBottom = ref(true)

const THRESHOLD = 50

let isProgrammaticScroll = false
let scrollTimer: ReturnType<typeof setTimeout> | null = null

const containerClasses = computed(() => {
  return [
    'chat-container',
  ].filter(Boolean).join(' ')
})

const checkIfAtBottom = () => {
  const el = containerRef.value
  if (!el) return
  stickToBottom.value = el.scrollHeight - el.scrollTop - el.clientHeight < THRESHOLD
}

const handleScroll = () => {
  if (isProgrammaticScroll) return
  checkIfAtBottom()
}

const scrollToBottom = (smooth = true) => {
  const el = containerRef.value
  if (!el) return

  if (scrollTimer) clearTimeout(scrollTimer)
  isProgrammaticScroll = true

  el.scrollTo({
    top: el.scrollHeight,
    behavior: smooth ? 'smooth' : 'auto',
  })

  scrollTimer = setTimeout(() => {
    isProgrammaticScroll = false
    stickToBottom.value = true
  }, smooth ? 300 : 50)
}

let mutationObserver: MutationObserver | null = null
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  const el = containerRef.value
  if (!el) return

  // Scroll to bottom on mount
  scrollToBottom(false)

  // Watch for new content
  mutationObserver = new MutationObserver(() => {
    if (props.autoScroll && stickToBottom.value) {
      nextTick(() => scrollToBottom())
    }
  })
  mutationObserver.observe(el, { childList: true, subtree: true, characterData: true })

  // Watch for content resizing (e.g. images loading, streaming text)
  resizeObserver = new ResizeObserver(() => {
    if (props.autoScroll && stickToBottom.value) {
      nextTick(() => scrollToBottom())
    }
  })
  resizeObserver.observe(el)
})

onBeforeUnmount(() => {
  mutationObserver?.disconnect()
  resizeObserver?.disconnect()
})

defineExpose({
  scrollToBottom,
  isAtBottom: stickToBottom,
  containerRef,
})
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
  scroll-behavior: smooth;
}

.chat-container__content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-padding-6xl-48);
  padding: var(--spacing-padding-xxl-24);
  flex: 1;
}

.chat-container__anchor {
  flex-shrink: 0;
  height: 1px;
}
</style>
