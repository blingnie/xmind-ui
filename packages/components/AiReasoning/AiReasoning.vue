<template>
  <div class="ai-reasoning">
    <!-- Trigger Title Row -->
    <div
      class="ai-reasoning__trigger"
      @click="toggle"
    >
      <!-- Text: reasoning=gradient, done=normal -->
      <span :class="triggerTextClasses">Show AI reasoning</span>

      <!-- Chevron: expanded=upward, collapsed=downward -->
      <span
        class="ai-reasoning__chevron"
        :class="{ 'ai-reasoning__chevron--expanded': isExpanded }"
        v-html="ChevronDownIcon"
      />
    </div>

    <!-- Content Area: grid animation -->
    <div
      :class="['ai-reasoning__panel', isExpanded && 'ai-reasoning__panel--expanded']"
    >
      <div class="ai-reasoning__inner">
        <!-- Steps type -->
        <AiChainOfThought
          v-if="props.content.type === 'steps'"
          :steps="props.content.steps"
        />

        <!-- Text type -->
        <div
          v-else-if="props.content.type === 'text'"
          class="ai-reasoning__text-container"
        >
          <div class="ai-reasoning__text-line" />
          <div class="ai-reasoning__text">
            {{ props.content.content }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import AiChainOfThought from '../AiChainOfThought/AiChainOfThought.vue'
import type { ChainOfThoughtStep } from '../AiChainOfThought/AiChainOfThought.vue'
import ChevronDownIcon from '~/components/icon/fw-icons/chevron-downward.svg?raw'

export type ReasoningContentType = 'steps' | 'text'

export type ReasoningContent =
  | { type: 'steps'; steps: ChainOfThoughtStep[] }
  | { type: 'text'; content: string }

interface AiReasoningProps {
  reasoning: boolean        // true=thinking (title gradient animation), false=done (normal text)
  content: ReasoningContent // content: full steps or plain text
  defaultExpanded?: boolean // default expanded, defaults to false
}

const props = withDefaults(defineProps<AiReasoningProps>(), {
  defaultExpanded: false,
})

// defaultExpanded 只用于初始值，不响应后续变化
const isExpanded = ref(props.defaultExpanded)

// 自动响应 reasoning 状态变化
watch(() => props.reasoning, (newReasoning, oldReasoning) => {
  if (newReasoning && !oldReasoning) {
    // 开始思考 → 自动展开
    isExpanded.value = true
  } else if (!newReasoning && oldReasoning) {
    // 思考结束 → 自动收起
    isExpanded.value = false
  }
})

const toggle = () => {
  isExpanded.value = !isExpanded.value
}

const triggerTextClasses = computed(() => [
  'ai-reasoning__title',
  props.reasoning ? 'ai-reasoning__title--reasoning' : 'ai-reasoning__title--done',
])
</script>

<style scoped>
/* Container */
.ai-reasoning {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-size-s-8);
  width: 100%;
}

/* Trigger Title Row */
.ai-reasoning__trigger {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-size-s-8);
  padding: 2px var(--spacing-padding-xs-4); /* vertical 2px no token */
  border-radius: var(--radius-s-8);
  cursor: pointer;
  user-select: none;
  width: fit-content;
}

.ai-reasoning__trigger:hover {
  background-color: var(--color-mask-overlays);
}

/* Title Text - Done: normal text */
.ai-reasoning__title {
  font-size: var(--typo-markdown-paragraph-default-size);
  line-height: var(--typo-markdown-paragraph-default-lh);
  letter-spacing: var(--typo-markdown-paragraph-default-ls);
  flex-shrink: 0;
}

.ai-reasoning__title--done {
  color: var(--color-text-secondary);
}

/* Title Text - Reasoning: gradient animation */
.ai-reasoning__title--reasoning {
  background: linear-gradient(
    90deg,
    var(--color-text-tertiary) 25%,
    var(--color-text-primary) 50%,
    var(--color-text-tertiary) 75%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: reasoning-shimmer 2.5s linear infinite;
}

@keyframes reasoning-shimmer {
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
}

/* Chevron Icon */
.ai-reasoning__chevron {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 26px;
  flex-shrink: 0;
  color: var(--color-icon-secondary);
  transition: transform 280ms cubic-bezier(0.4, 0, 0.2, 1);
}

.ai-reasoning__chevron--expanded {
  transform: rotate(180deg);
}

.ai-reasoning__chevron :deep(svg) {
  width: 16px;
  height: 16px;
}

/* Content Area Expand Animation (reuse AiChainOfThought grid pattern) */
.ai-reasoning__panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 280ms cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.ai-reasoning__panel--expanded {
  grid-template-rows: 1fr;
}

.ai-reasoning__inner {
  min-height: 0;
}

/* Text type container: vertical line + text */
.ai-reasoning__text-container {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-size-m-16);
  padding-left: var(--spacing-padding-m-12);
}

/* Vertical line */
.ai-reasoning__text-line {
  width: 1px;
  align-self: stretch;
  flex-shrink: 0;
  border-radius: 2px; /* no token */
  background: var(--color-border-translucent);
}

/* Text content (removed padding-left, controlled by container gap) */
.ai-reasoning__text {
  padding-top: var(--spacing-padding-s-8);
  padding-bottom: var(--spacing-padding-l-16);
  padding-left: 0; /* removed, controlled by container gap */
  font-size: var(--typo-markdown-caption-default-size);
  line-height: var(--typo-markdown-caption-default-lh);
  letter-spacing: var(--typo-markdown-caption-default-ls);
  color: var(--color-text-tertiary);
  white-space: pre-wrap;
  word-break: break-word;
  flex: 1;
  min-width: 0;
}
</style>
