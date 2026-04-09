<template>
  <div class="chain-of-thought">
    <TransitionGroup name="step-fade">
      <div v-for="(step, index) in props.steps" :key="step.id || index" class="cot-step">
        <div
          :class="cotTitleClasses(step, index)"
          @click="toggleExpand(step, index)"
          @mouseenter="hoveredId = getStepKey(step, index)"
          @mouseleave="hoveredId = null"
        >
          <div :class="cotIconClasses(step, index)">
            <!-- basic bullet -->
            <span
              v-if="step.iconType === 'basic' && !['done', 'failed'].includes(step.status)"
              class="cot-title__bullet"
            />

            <!-- done / failed：固定图标，不旋转 -->
            <span
              v-else-if="['done', 'failed'].includes(step.status)"
              class="cot-title__icon"
              v-html="step.status === 'done' ? CheckmarkCircleFillIcon : XmarkFillIcon"
            />

            <!-- processing：自定义图标，不旋转 -->
            <span
              v-else-if="step.status === 'processing'"
              class="cot-title__icon"
              v-html="step.icon || ''"
            />

            <!-- expandable advanced：hover 或展开时切换为 chevron + 旋转动画 -->
            <template v-else>
              <!-- Normal 态：自定义 icon，无动画，直接显示 -->
              <span
                v-if="!isShowingChevron(step, index)"
                class="cot-title__icon"
                v-html="step.icon || ''"
              />
              <!-- Hover / 展开 / 折叠中：chevron，有旋转动画 -->
              <span
                v-else
                class="cot-title__icon cot-title__icon--chevron"
                :style="{ transform: isExpanded(step, index) ? 'rotate(180deg)' : 'rotate(0deg)' }"
                v-html="ChevronDownIcon"
              />
            </template>
          </div>

          <span :class="cotTextClasses(step, index)">
            {{ step.status === 'done' ? 'Done' : step.label }}
          </span>

          <span
            v-if="step.iconType === 'basic' && isExpandable(step)"
            class="cot-title__chevron"
            :style="{ transform: isExpanded(step, index) ? 'rotate(180deg)' : 'rotate(0deg)' }"
            v-html="ChevronDownIcon"
          />

          <div class="cot-label__wrap">
            <div :class="cotLabelClasses(step)">
              <span v-if="step.status === 'processing'" class="cot-label__dot" />
              <span class="cot-label__text">{{ labelText(step.status) }}</span>
            </div>
          </div>
        </div>

        <div v-if="index < props.steps.length - 1 || step.detail" class="cot-detail">
        <div class="cot-detail__rail" aria-hidden="true">
          <div class="cot-detail__line" />
        </div>

        <div class="cot-detail__body">
          <!-- No detail: just show a short spacer for the connecting line -->
          <template v-if="!step.detail">
            <div class="cot-detail__collapse-panel">
              <div class="cot-detail__collapse-inner">
                <div class="cot-detail__spacer" />
              </div>
            </div>
          </template>

          <template v-else>
            <!-- Collapse panel: shrinks when expanding (grid 1fr → 0fr) -->
            <div
              :class="[
                'cot-detail__collapse-panel',
                isExpanded(step, index) && 'cot-detail__collapse-panel--hidden'
              ]"
            >
              <div class="cot-detail__collapse-inner">
                <div
                  v-if="step.detail.type === 'code'"
                  class="cot-code-shell cot-code-shell--collapsed"
                  @click.stop="toggleExpand(step, index)"
                >
                  <span class="cot-code-shell__label">Script</span>
                </div>
                <div v-else class="cot-detail__spacer" />
              </div>
            </div>

            <!-- Expand panel: grows when expanding (grid 0fr → 1fr) -->
            <div
              :class="[
                'cot-detail__expand-panel',
                isExpanded(step, index) && 'cot-detail__expand-panel--visible'
              ]"
            >
              <div class="cot-detail__expand-inner">
                <div
                  v-if="step.detail.type === 'content'"
                  class="cot-detail__content"
                >
                  {{ step.detail?.content || '' }}
                </div>

                <div
                  v-else-if="step.detail.type === 'code'"
                  class="cot-code-shell cot-code-shell--expanded"
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
                        @vue:mounted="(el: Element) => handleCodeScroll({ target: el } as Event)"
                      >{{ block.code }}</pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
      </div>
    </TransitionGroup>
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
  id?: string // 可选唯一标识，有 id 时用 id 作为展开状态的 key，否则用 index
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

const expandedMap = shallowRef<Map<string, boolean>>(new Map())
const hoveredId = ref<string | null>(null)

const getStepKey = (step: ChainOfThoughtStep, index: number): string => step.id || String(index)

const isExpandable = (step: ChainOfThoughtStep): boolean => {
  return !['processing', 'done', 'failed'].includes(step.status) && !!step.detail
}

const isExpanded = (step: ChainOfThoughtStep, index: number): boolean => {
  if (!step.detail) return false
  if (step.status === 'processing') return true
  const key = getStepKey(step, index)
  if (expandedMap.value.has(key)) return expandedMap.value.get(key)!
  return false
}

const toggleExpand = (step: ChainOfThoughtStep, index: number) => {
  if (!isExpandable(step)) return
  const key = getStepKey(step, index)
  expandedMap.value.set(key, !isExpanded(step, index))
  triggerRef(expandedMap)
}

const isShowingChevron = (step: ChainOfThoughtStep, index: number): boolean => {
  if (!isExpandable(step)) return false
  const key = getStepKey(step, index)
  return isExpanded(step, index) || hoveredId.value === key
}

const cotTitleClasses = (step: ChainOfThoughtStep, index: number) => {
  const key = getStepKey(step, index)
  return [
    'cot-title',
    isExpandable(step) && 'cot-title--expandable',
    hoveredId.value === key && isExpandable(step) && 'cot-title--hover',
  ].filter(Boolean).join(' ')
}

const cotIconClasses = (step: ChainOfThoughtStep, index: number) => {
  const key = getStepKey(step, index)
  return [
    'cot-title__icon-wrap',
    hoveredId.value === key && isExpandable(step) ? 'cot-title__icon-wrap--hover'
      : ['error', 'failed'].includes(step.status) ? 'cot-title__icon-wrap--error'
      : 'cot-title__icon-wrap--normal',
  ].filter(Boolean).join(' ')
}

const cotTextClasses = (step: ChainOfThoughtStep, index: number) => {
  const key = getStepKey(step, index)
  return [
    'cot-title__text',
    step.status === 'processing' && 'cot-title__text--processing',
    ['error', 'failed'].includes(step.status) && 'cot-title__text--error',
    hoveredId.value === key && isExpandable(step) && 'cot-title__text--hover',
  ].filter(Boolean).join(' ')
}

const cotLabelClasses = (step: ChainOfThoughtStep) => {
  const labelStatus = step.status === 'done' ? 'completed'
    : step.status === 'failed' ? 'error'
    : step.status
  return ['cot-label', `cot-label--${labelStatus}`].filter(Boolean).join(' ')
}

const labelText = (status: StepStatus) => {
  if (status === 'completed' || status === 'done') return 'Completed'
  if (status === 'processing') return 'Processing'
  if (status === 'error' || status === 'failed') return 'Error'
  return ''
}

const handleCodeScroll = (event: Event) => {
  const el = event.target as HTMLElement
  const wrapper = el.parentElement
  if (!wrapper) return

  const { scrollTop, scrollHeight, clientHeight } = el
  const isScrolledFromTop = scrollTop > 0
  const isScrolledFromBottom = scrollTop < scrollHeight - clientHeight - 1

  wrapper.classList.toggle('scrolled-from-top', isScrolledFromTop)
  wrapper.classList.toggle('scrolled-from-bottom', isScrolledFromBottom)
}
</script>

<style scoped>
.chain-of-thought {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
}

.cot-step {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* TransitionGroup fade animation */
.step-fade-enter-active {
  transition: opacity 300ms ease, transform 300ms ease;
}

.step-fade-leave-active {
  transition: opacity 200ms ease;
}

.step-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.step-fade-leave-to {
  opacity: 0;
}

.cot-title {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-size-s-8);
  padding: 2px var(--spacing-padding-xs-4);
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
}

/* 只有 chevron 状态加 transition */
.cot-title__icon--chevron {
  transition: transform 280ms cubic-bezier(0.4, 0, 0.2, 1);
}

.cot-title__icon :deep(svg) {
  width: 100%;
  height: 100%;
  color: currentColor;
  transition: opacity 200ms ease;
}

.cot-title__text {
  font-size: var(--typo-markdown-paragraph-default-size);
  line-height: var(--typo-markdown-paragraph-default-lh);
  letter-spacing: var(--typo-markdown-paragraph-default-ls);
  color: var(--color-text-tertiary);
  transition: opacity 200ms ease;
}

.cot-title__chevron {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 26px;
  flex-shrink: 0;
  color: var(--color-icon-tertiary);
  transition: transform 280ms cubic-bezier(0.4, 0, 0.2, 1);
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

.cot-label__wrap {
  display: flex;
  align-items: center;
  height: 26px;
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
  border: 1.5px solid var(--color-text-tertiary);
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
  transition: color 200ms ease, opacity 200ms ease;
}

.cot-detail {
  display: flex;
  align-items: stretch;
  gap: var(--spacing-size-m-16);
  padding-left: var(--spacing-padding-m-12);
}

.cot-detail__rail {
  width: 1px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.cot-detail__line {
  width: 1px;
  flex: 1 1 auto;
  min-height: 0;
  border-radius: 2px;
  background: var(--color-border-translucent);
}

.cot-detail__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

/* ── Collapse panel: reverse grid, 1fr → 0fr ── */
.cot-detail__collapse-panel {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 380ms cubic-bezier(0.22, 1, 0.36, 1);
}

.cot-detail__collapse-panel--hidden {
  grid-template-rows: 0fr;
}

.cot-detail__collapse-inner {
  overflow: hidden;
  min-height: 0;
  opacity: 1;
  transition: opacity 200ms ease 60ms;
}

.cot-detail__collapse-panel--hidden .cot-detail__collapse-inner {
  opacity: 0;
  transition: opacity 120ms ease;
}

.cot-detail__spacer {
  height: 12px;
}

/* ── Expand panel: grid 0fr → 1fr ── */
.cot-detail__expand-panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 380ms cubic-bezier(0.22, 1, 0.36, 1);
}

.cot-detail__expand-panel--visible {
  grid-template-rows: 1fr;
}

.cot-detail__expand-inner {
  overflow: hidden;
  min-height: 0;
  opacity: 0;
  transition: opacity 120ms ease;
}

.cot-detail__expand-panel--visible .cot-detail__expand-inner {
  opacity: 1;
  transition: opacity 250ms ease 80ms;
}

.cot-detail__content {
  padding-top: var(--spacing-padding-s-8);
  padding-bottom: var(--spacing-padding-l-16);
  font-size: var(--typo-markdown-caption-default-size);
  line-height: var(--typo-markdown-caption-default-lh);
  letter-spacing: var(--typo-markdown-caption-default-ls);
  color: var(--color-text-tertiary);
  white-space: pre-wrap;
  word-break: break-word;
}

.cot-code-shell {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.cot-code-shell--collapsed {
  display: inline-flex;
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

.cot-code-shell__scroll-wrapper {
  position: relative;
}

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

.cot-code-shell__scroll-wrapper.scrolled-from-top::before {
  opacity: 1;
}

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
  max-height: 200px;
  overflow-y: auto;
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
