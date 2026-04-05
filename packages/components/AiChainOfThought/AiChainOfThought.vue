<template>
  <div class="chain-of-thought">
    <template v-for="(step, index) in props.steps" :key="index">
      <!-- Title 行 -->
      <div
        :class="cotTitleClasses(step, index)"
        @click="toggleExpand(step, index)"
        @mouseenter="hoveredIndex = index"
        @mouseleave="hoveredIndex = null"
      >
        <!-- 图标区 -->
        <div :class="cotIconClasses(step, index)">
          <span
            v-if="step.iconType === 'basic' && !['done','failed'].includes(step.status)"
            class="cot-title__bullet"
          />
          <span
            v-else
            :class="['cot-title__icon', isExpanded(step, index) && isExpandable(step) && 'cot-title__icon--expanded']"
            v-html="getAdvancedIcon(step, index)"
          />
        </div>

        <!-- 文字 -->
        <span :class="cotTextClasses(step, index)">
          {{ step.status === 'done' ? 'Done' : step.label }}
        </span>

        <!-- chevron（basic 类型，紧跟文字） -->
        <span
          v-if="step.iconType === 'basic' && isExpandable(step)"
          :class="['cot-title__chevron', isExpanded(step, index) && 'cot-title__chevron--expanded']"
          v-html="ChevronDownIcon"
        />

        <!-- Label -->
        <div class="cot-label__wrap">
          <div :class="cotLabelClasses(step)">
            <span v-if="step.status === 'processing'" class="cot-label__dot" />
            <span class="cot-label__text">{{ labelText(step.status) }}</span>
          </div>
        </div>
      </div>

      <!-- Detail 区 -->
      <div v-if="step.detail" class="cot-detail">
        <div :class="cotDetailLineClasses(step, index)" />

        <!-- content 类型 -->
        <template v-if="step.detail.type === 'content'">
          <Transition
            :css="false"
            @enter="onEnter"
            @after-enter="onAfterEnter"
            @leave="onLeave"
            @after-leave="onAfterLeave"
          >
            <div v-if="isExpanded(step, index)" class="cot-detail__body">
              <div class="cot-detail__content">
                {{ step.detail?.content || '' }}
              </div>
            </div>
          </Transition>
        </template>

        <!-- code 类型 -->
        <template v-else-if="step.detail.type === 'code'">
          <!-- expanded 时显示代码块 -->
          <div
            v-if="isExpanded(step, index)"
            :class="['cot-code-shell', 'cot-code-shell--expanded']"
          >
            <div
              v-for="(block, bi) in step.detail.blocks"
              :key="bi"
              class="cot-code-shell__block"
            >
              <span class="cot-code-shell__lang">{{ block.lang }}</span>
              <div class="cot-code-shell__scroll-wrapper">
                <pre
                  class="cot-code-shell__body"
                  @scroll="handleCodeScroll"
                  @vue:mounted="(e) => handleCodeScroll({ target: e } as unknown as Event)"
                >{{ block.code }}</pre>
              </div>
            </div>
          </div>

          <!-- collapsed 时显示 Script 胶囊 -->
          <div
            v-else
            :class="['cot-code-shell', 'cot-code-shell--collapsed']"
            @click="toggleExpand(step, index)"
          >
            <span class="cot-code-shell__label">Script</span>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, triggerRef } from 'vue'
import ChevronDownIcon from '~/components/icon/fw-icons/chevron-downward.svg?raw'
import CheckmarkCircleFillIcon from '~/components/icon/fw-icons/checkmark-circle-fill.svg?raw'
import XmarkFillIcon from '~/components/icon/fw-icons/xmark-fill.svg?raw'

export type StepStatus = 'processing' | 'completed' | 'error' | 'done' | 'failed'
export type StepIconType = 'basic' | 'advanced'
export type DetailType = 'content' | 'code'

export interface CodeBlock {
  lang: string
  code: string
}

export interface ChainOfThoughtStep {
  iconType: StepIconType
  icon?: string
  label: string
  status: StepStatus
  detail?: {
    type: DetailType
    content?: string
    blocks?: CodeBlock[]
  }
}

interface ChainOfThoughtProps {
  steps: ChainOfThoughtStep[]
}

const props = withDefaults(defineProps<ChainOfThoughtProps>(), {
  steps: () => [],
})

// 展开状态管理
const expandedMap = shallowRef<Map<number, boolean>>(new Map())
const hoveredIndex = ref<number | null>(null)

const isExpandable = (step: ChainOfThoughtStep): boolean => {
  return !['processing', 'done', 'failed'].includes(step.status) && !!step.detail
}

const isExpanded = (step: ChainOfThoughtStep, index: number): boolean => {
  if (!step.detail) return false
  if (step.status === 'processing') return true
  if (expandedMap.value.has(index)) return expandedMap.value.get(index)!
  return false
}

const toggleExpand = (step: ChainOfThoughtStep, index: number) => {
  if (!isExpandable(step)) return
  const current = isExpanded(step, index)
  expandedMap.value.set(index, !current)
  triggerRef(expandedMap)
}

// Transition hooks
const onEnter = (el: Element, done: () => void) => {
  const h = el as HTMLElement
  h.style.overflow = 'hidden'
  h.style.height = '0'
  requestAnimationFrame(() => {
    h.style.transition = 'height 280ms cubic-bezier(0.4, 0, 0.2, 1)'
    h.style.height = h.scrollHeight + 'px'
    h.addEventListener('transitionend', () => { done() }, { once: true })
  })
}

const onAfterEnter = (el: Element) => {
  const h = el as HTMLElement
  h.style.height = ''
  h.style.overflow = ''
  h.style.transition = ''

  // 初始化代码块滚动状态
  const codeBlocks = h.querySelectorAll('.cot-code-shell__body')
  codeBlocks.forEach((codeBlock) => {
    const event = new Event('scroll')
    codeBlock.dispatchEvent(event)
  })
}

const onLeave = (el: Element, done: () => void) => {
  const h = el as HTMLElement
  h.style.height = h.scrollHeight + 'px'
  h.style.overflow = 'hidden'

  requestAnimationFrame(() => {
    h.style.transition = 'height 280ms cubic-bezier(0.4, 0, 0.2, 1)'
    h.style.height = '0'

    h.addEventListener('transitionend', () => {
      done()
    }, { once: true })
  })
}

const onAfterLeave = (el: Element) => {
  const h = el as HTMLElement
  h.style.height = ''
  h.style.overflow = ''
  h.style.transition = ''
}

// 图标显示逻辑
const getAdvancedIcon = (step: ChainOfThoughtStep, index: number): string => {
  if (step.status === 'done') return CheckmarkCircleFillIcon
  if (step.status === 'failed') return XmarkFillIcon
  if (step.status === 'processing') return step.icon || ''
  if (isExpanded(step, index) || (hoveredIndex.value === index && isExpandable(step))) {
    return ChevronDownIcon
  }
  return step.icon || ''
}

// Class 计算函数
const cotTitleClasses = (step: ChainOfThoughtStep, index: number) => {
  return [
    'cot-title',
    isExpandable(step) && 'cot-title--expandable',
    hoveredIndex.value === index && isExpandable(step) && 'cot-title--hover',
  ].filter(Boolean).join(' ')
}

const cotIconClasses = (step: ChainOfThoughtStep, index: number) => {
  return [
    'cot-title__icon-wrap',
    hoveredIndex.value === index && isExpandable(step) ? 'cot-title__icon-wrap--hover'
      : ['error', 'failed'].includes(step.status) ? 'cot-title__icon-wrap--error'
      : 'cot-title__icon-wrap--normal',
  ].filter(Boolean).join(' ')
}

const cotTextClasses = (step: ChainOfThoughtStep, index: number) => {
  return [
    'cot-title__text',
    step.status === 'processing' && 'cot-title__text--processing',
    ['error', 'failed'].includes(step.status) && 'cot-title__text--error',
    hoveredIndex.value === index && isExpandable(step) && 'cot-title__text--hover',
  ].filter(Boolean).join(' ')
}

const cotLabelClasses = (step: ChainOfThoughtStep) => {
  const labelStatus = step.status === 'done' ? 'completed'
    : step.status === 'failed' ? 'error'
    : step.status
  return ['cot-label', `cot-label--${labelStatus}`].filter(Boolean).join(' ')
}

const cotDetailLineClasses = (step: ChainOfThoughtStep, index: number) => {
  return [
    'cot-detail__line',
    !isExpanded(step, index) && step.detail?.type === 'content' && 'cot-detail__line--short',
  ].filter(Boolean).join(' ')
}

// Label 文字
const labelText = (status: StepStatus) => {
  if (status === 'completed' || status === 'done') return 'Completed'
  if (status === 'processing') return 'Processing'
  if (status === 'error' || status === 'failed') return 'Error'
  return ''
}

// 处理代码块滚动
const handleCodeScroll = (event: Event) => {
  const el = event.target as HTMLElement
  const wrapper = el.parentElement
  if (!wrapper) return

  const { scrollTop, scrollHeight, clientHeight } = el
  const isScrolledFromTop = scrollTop > 0
  const isScrolledFromBottom = scrollTop < scrollHeight - clientHeight - 1

  if (isScrolledFromTop) {
    wrapper.classList.add('scrolled-from-top')
  } else {
    wrapper.classList.remove('scrolled-from-top')
  }

  if (isScrolledFromBottom) {
    wrapper.classList.add('scrolled-from-bottom')
  } else {
    wrapper.classList.remove('scrolled-from-bottom')
  }
}

</script>

<style scoped>
/* 整体容器 */
.chain-of-thought {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
}

/* Title 行 */
.cot-title {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-size-s-8);
  padding: 2px var(--spacing-padding-xs-4); /* 2px no token */
  border-radius: var(--radius-s-8);
  transition: background-color 150ms ease, opacity 200ms ease;
  user-select: none;
}

.cot-title--expandable {
  cursor: pointer;
}

.cot-title--hover {
  background-color: var(--color-mask-overlays);
}

/* 图标区 */
.cot-title__icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 26px;
  flex-shrink: 0;
}

.cot-title__icon-wrap--normal {
  color: var(--color-icon-tertiary);
}

.cot-title__icon-wrap--hover {
  color: var(--color-icon-secondary);
}

.cot-title__icon-wrap--error {
  color: var(--color-icon-quaternary);
}

.cot-title__bullet {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.cot-title__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  transition: transform 200ms ease;
}

.cot-title__icon--expanded {
  transform: rotate(180deg);
}

.cot-title__icon :deep(svg) {
  width: 100%;
  height: 100%;
  color: currentColor;
}

/* 文字 */
.cot-title__text {
  font-size: var(--typo-markdown-paragraph-default-size);
  line-height: var(--typo-markdown-paragraph-default-lh);
  letter-spacing: var(--typo-markdown-paragraph-default-ls);
  color: var(--color-text-tertiary);
}

/* Chevron（basic 类型折叠图标） */
.cot-title__chevron {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 26px;
  flex-shrink: 0;
  color: var(--color-icon-tertiary);
  transition: transform 200ms ease;
}

.cot-title__chevron--expanded {
  transform: rotate(180deg);
}

.cot-title__chevron :deep(svg) {
  width: 16px;
  height: 16px;
}

.cot-title__text--processing {
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
  animation: cot-shimmer 2.5s linear infinite;
}

.cot-title__text--error {
  color: var(--color-text-quaternary);
}

.cot-title__text--hover {
  color: var(--color-text-secondary);
}

.cot-title__text:not(.cot-title__text--processing) {
  transition: color 200ms ease;
}

@keyframes cot-shimmer {
  0% {
    background-position: 200% center;
  }
  100% {
    background-position: -200% center;
  }
}

/* Label 标签 */
.cot-label__wrap {
  display: flex;
  align-items: center;
  height: 26px; /* 与 icon-wrap 行高一致，no token */
  flex-shrink: 0;
}

.cot-label {
  display: flex;
  align-items: center;
  height: 20px;
  padding: 0 var(--spacing-padding-s-8);
  border-radius: 9999px;
  flex-shrink: 0;
  transition: background-color 200ms ease;
}

.cot-label--completed {
  background: var(--color-mask-overlays);
}

.cot-label--completed .cot-label__text {
  color: var(--color-text-tertiary);
}

.cot-label--error {
  background: rgba(238, 118, 118, 0.2);
}

.cot-label--error .cot-label__text {
  color: var(--palette-red-400);
}

.cot-label--processing {
  background: var(--color-mask-overlays);
  gap: var(--spacing-padding-xs-4);
}

.cot-label--processing .cot-label__text {
  color: var(--color-text-tertiary);
}

.cot-label__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1.5px solid var(--color-text-tertiary); /* no token */
  border-top-color: transparent;
  animation: cot-dot-spin 0.8s linear infinite;
}

@keyframes cot-dot-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.cot-label__text {
  font-size: var(--typo-markdown-caption-default-size);
  line-height: var(--typo-markdown-caption-default-lh);
  font-weight: var(--typo-markdown-caption-default-weight);
  letter-spacing: var(--typo-markdown-caption-default-ls);
  transition: color 200ms ease;
}

/* Detail 区 */
.cot-detail {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-size-m-16);
  padding-left: var(--spacing-padding-m-12);
}

.cot-detail__line {
  width: 1px;
  border-radius: 2px;
  background: var(--color-border-translucent);
  align-self: stretch;
  flex-shrink: 0;
}

.cot-detail__line--short {
  height: 12px; /* no token */
  align-self: auto;
  transition: height 280ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Content 类型 */
.cot-detail__content {
  flex: 1;
  padding-top: var(--spacing-padding-s-8);
  padding-bottom: var(--spacing-padding-l-16);
  font-size: var(--typo-markdown-caption-default-size);
  line-height: var(--typo-markdown-caption-default-lh);
  letter-spacing: var(--typo-markdown-caption-default-ls);
  color: var(--color-text-tertiary);
  white-space: pre-wrap;
  word-break: break-word;
}

/* ========== Detail body ========== */
.cot-detail__body {
  flex: 1;
  min-width: 0;
}

/* ========== Code 类型单容器 ========== */
.cot-code-shell {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

/* collapsed 状态 - Script 胶囊样式 */
.cot-code-shell--collapsed {
  align-self: flex-start;
  padding-top: var(--spacing-padding-s-8);
  padding-bottom: var(--spacing-padding-l-16);
  cursor: pointer;
}

.cot-code-shell__label {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-padding-xs-4) var(--spacing-padding-s-8);
  background: var(--color-mask-overlays);
  border-radius: var(--radius-xs-6);
  font-size: var(--typo-markdown-caption-default-size);
  line-height: var(--typo-markdown-caption-default-lh);
  font-weight: var(--typo-markdown-caption-default-weight);
  letter-spacing: var(--typo-markdown-caption-default-ls);
  color: var(--color-text-tertiary);
}

/* expanded 状态 - 代码块样式 */
.cot-code-shell--expanded {
  flex: 1;
  gap: var(--spacing-size-s-8);
  padding: var(--spacing-padding-s-8);
  margin-top: var(--spacing-padding-s-8);
  margin-bottom: var(--spacing-padding-l-16);
  background: var(--color-fill-surfacedark);
  border-radius: var(--radius-m-12);
}

.cot-code-shell__block {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-size-s-8);
  padding: var(--spacing-padding-m-12);
  background: var(--color-fill-surfacedim);
  border-radius: var(--radius-xs-6);
}

.cot-code-shell__lang {
  font-size: var(--typo-markdown-caption-default-size);
  line-height: var(--typo-markdown-caption-default-lh);
  font-weight: var(--typo-markdown-caption-default-weight);
  letter-spacing: var(--typo-markdown-caption-default-ls);
  color: var(--color-text-tertiary);
}

/* 代码滚动容器 */
.cot-code-shell__scroll-wrapper {
  position: relative;
}

/* 顶部渐变遮罩 - 默认隐藏 */
.cot-code-shell__scroll-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 20px;
  background: linear-gradient(to bottom, var(--color-fill-surfacedim), transparent);
  pointer-events: none;
  z-index: 1;
  opacity: 0;
  transition: opacity 150ms ease;
}

/* 底部渐变遮罩 - 默认隐藏 */
.cot-code-shell__scroll-wrapper::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 20px;
  background: linear-gradient(to top, var(--color-fill-surfacedim), transparent);
  pointer-events: none;
  z-index: 1;
  opacity: 0;
  transition: opacity 150ms ease;
}

/* 从顶部滚动后显示顶部渐变 */
.cot-code-shell__scroll-wrapper.scrolled-from-top::before {
  opacity: 1;
}

/* 还有内容可滚动时显示底部渐变 */
.cot-code-shell__scroll-wrapper.scrolled-from-bottom::after {
  opacity: 1;
}

.cot-code-shell__body {
  position: relative;
  margin: 0;
  padding: 0;
  font-family: 'Fira Code', monospace;
  font-size: var(--typo-markdown-code-block-default-size);
  line-height: var(--typo-markdown-code-block-default-lh);
  font-weight: var(--typo-markdown-code-block-default-weight);
  letter-spacing: var(--typo-markdown-code-block-default-ls);
  color: var(--color-text-secondary);
  white-space: pre-wrap;
  word-break: break-word;
  background: transparent;
  /* 最大高度 + 滚动 */
  max-height: 200px; /* no token，可根据实际调整 */
  overflow-y: auto;
  /* 滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: var(--color-border-default) transparent;
}

.cot-code-shell__body::-webkit-scrollbar {
  width: 4px;
}

.cot-code-shell__body::-webkit-scrollbar-track {
  background: transparent;
}

.cot-code-shell__body::-webkit-scrollbar-thumb {
  background: var(--color-border-default);
  border-radius: 2px;
}
</style>
