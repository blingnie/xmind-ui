<template>
  <div
    :class="referenceClasses"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <span v-if="$slots.icon" class="ai-reference__icon">
      <slot name="icon" />
    </span>
    <span class="ai-reference__text">
      <slot />
    </span>
    <button
      v-if="closable"
      :class="closeClasses"
      @click.stop="handleClose"
      @mouseenter="closeHovered = true"
      @mouseleave="closeHovered = false"
    >
      <span class="ai-reference__close-icon" v-html="CloseIcon" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useSlots } from 'vue'
import CloseIcon from './close.svg?raw'

interface AiReferenceProps {
  closable?: boolean
}

const props = withDefaults(defineProps<AiReferenceProps>(), {
  closable: true,
})

const emit = defineEmits<{
  close: [event: MouseEvent]
}>()

const slots = useSlots()
const hovered = ref(false)
const closeHovered = ref(false)

const referenceClasses = computed(() => {
  return [
    'ai-reference',
    !slots.icon && 'ai-reference--no-icon',
    !props.closable && 'ai-reference--no-close',
    hovered.value && 'ai-reference--hover',
  ].filter(Boolean).join(' ')
})

const closeClasses = computed(() => {
  return [
    'ai-reference__close',
    closeHovered.value && 'ai-reference__close--hover',
  ].filter(Boolean).join(' ')
})

const handleClose = (event: MouseEvent) => {
  emit('close', event)
}
</script>

<style scoped>
.ai-reference {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-padding-xs-4);
  padding: var(--spacing-padding-xs-4) var(--spacing-padding-xs-4) var(--spacing-padding-xs-4) var(--spacing-padding-s-8);
  background-color: var(--color-fill-surfacebright);
  border: 1px solid var(--color-border-translucent);
  border-radius: var(--radius-infinite-300);
  width: 180px;
  box-sizing: border-box;
  cursor: default;
  transition: background-color 150ms ease;
}

.ai-reference--no-icon {
  padding-left: var(--spacing-padding-m-12);
}

.ai-reference--no-close {
  padding-right: var(--spacing-padding-s-8);
}

.ai-reference--no-icon.ai-reference--no-close {
  padding-right: var(--spacing-padding-m-12);
}

/* ── Icon ── */
.ai-reference__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  color: var(--color-text-tertiary);
}

.ai-reference__icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

/* ── Text ── */
.ai-reference__text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--typo-markdown-caption-default-size);
  line-height: var(--typo-markdown-caption-default-lh);
  font-weight: var(--typo-markdown-caption-default-weight);
  letter-spacing: var(--typo-markdown-caption-default-ls);
  color: var(--color-text-tertiary);
}

/* ── Close button ── */
.ai-reference__close {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  padding: 2px;
  border: none;
  outline: none;
  border-radius: var(--radius-infinite-300);
  background-color: var(--color-mask-overlays);
  cursor: pointer;
  opacity: 0;
  transition: background-color 150ms ease, opacity 150ms ease;
  box-sizing: border-box;
}

.ai-reference--hover .ai-reference__close {
  opacity: 1;
}

.ai-reference__close--hover {
  background-color: var(--color-mask-overlaym);
}

.ai-reference__close-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  color: var(--color-text-tertiary);
}

.ai-reference__close-icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
