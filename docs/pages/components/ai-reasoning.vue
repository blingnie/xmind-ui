<template>
  <div class="doc-page-layout">
    <!-- Main Content -->
    <div class="doc-page-content">
      <h1 class="text-xl">Reasoning</h1>
      <p class="text-sm text-[var(--color-text-tertiary)]" style="margin-bottom: 0;">A collapsible container that displays AI thinking process, supporting both full step lists (via Chain of Thought) and plain text content. The title shows gradient animation during reasoning and normal text when completed.</p>

      <!-- Figma Link -->
      <PlatformLink
        href="https://www.figma.com/design/1Zb3WXCH66yxr6O4i7DFDg/xmind-UI-Components?node-id=16307-9312"
        label="Figma"
        :icon="FigmaIcon"
      />

      <!-- With Steps -->
      <section id="with-steps" class="doc-section">
        <h2>With Steps</h2>
        <div class="preview-card">
          <PreviewArea align="left" with-action class="preview-area--chain">
            <div class="action-buttons">
              <Button
                variant="default"
                size="small"
                :loading="isStepsGenerating"
                @click="generateSteps"
              >
                Generate
              </Button>
              <Button
                variant="default"
                size="small"
                icon-only
                :disabled="isStepsGenerating"
                @click="resetSteps"
              >
                <span v-html="RefreshIcon" />
              </Button>
            </div>
            <AiReasoning
              :reasoning="isStepsGenerating"
              :content="stepsContent"
            />
          </PreviewArea>
          <div class="pt-2 px-4 pb-4 border-t border-[var(--color-border-translucent)]">
            <Tabs v-model="stepsTab" :tabs="['Usage', 'Source']" />
            <SimpleCodeBlock :code="stepsTab === 'Usage' ? stepsUsage : componentSource" language="vue" height="280px" />
          </div>
        </div>
      </section>

      <!-- With Text -->
      <section id="with-text" class="doc-section">
        <h2>With Text</h2>
        <div class="preview-card">
          <PreviewArea align="left" with-action class="preview-area--chain">
            <div class="action-buttons">
              <Button
                variant="default"
                size="small"
                :loading="isTextGenerating"
                @click="generateText"
              >
                Generate
              </Button>
              <Button
                variant="default"
                size="small"
                icon-only
                :disabled="isTextGenerating"
                @click="resetText"
              >
                <span v-html="RefreshIcon" />
              </Button>
            </div>
            <AiReasoning
              :reasoning="isTextGenerating"
              :content="textContent"
            />
          </PreviewArea>
          <div class="pt-2 px-4 pb-4 border-t border-[var(--color-border-translucent)]">
            <Tabs v-model="textTab" :tabs="['Usage', 'Source']" />
            <SimpleCodeBlock :code="textTab === 'Usage' ? textUsage : componentSource" language="vue" height="280px" />
          </div>
        </div>
      </section>

      <!-- API Reference -->
      <section id="api" class="doc-section">
        <h2>API</h2>

        <!-- Props -->
        <h3 id="props">Props</h3>
        <div class="api-table">
          <div class="api-table__header">
            <span>Name</span>
            <span>Type</span>
            <span>Default</span>
            <span>Description</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>reasoning</code></span>
            <span data-label="Type"><code>boolean</code></span>
            <span data-label="Default">—</span>
            <span data-label="Description"><code>true</code> indicates thinking (title gradient animation), <code>false</code> indicates done (normal text)</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>content</code></span>
            <span data-label="Type"><code>ReasoningContent</code></span>
            <span data-label="Default">—</span>
            <span data-label="Description">Content configuration, supports full step list (<code>type: 'steps'</code>) or plain text (<code>type: 'text'</code>)</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>defaultExpanded</code></span>
            <span data-label="Type"><code>boolean</code></span>
            <span data-label="Default"><code>false</code></span>
            <span data-label="Description">Initial expanded state</span>
          </div>
        </div>

        <!-- Types -->
        <h3 id="types">Types</h3>

        <h4 class="type-heading">ReasoningContent</h4>
        <div class="api-table api-table--2-cols">
          <div class="api-table__header">
            <span>Value</span>
            <span>Description</span>
          </div>
          <div class="api-table__row">
            <span data-label="Value"><code>{ type: 'steps'; steps: ChainOfThoughtStep[] }</code></span>
            <span data-label="Description">Full step list, internally renders AiChainOfThought component</span>
          </div>
          <div class="api-table__row">
            <span data-label="Value"><code>{ type: 'text'; content: string }</code></span>
            <span data-label="Description">Plain text content, displayed with left vertical line</span>
          </div>
        </div>
      </section>
    </div>

    <!-- Table of Contents -->
    <DocTableOfContents :items="tocItems" class="hidden xl:block" />
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import AiReasoning from '../../../packages/components/AiReasoning/AiReasoning.vue'
import type { ReasoningContent } from '../../../packages/components/AiReasoning/AiReasoning.vue'
import type { ChainOfThoughtStep } from '../../../packages/components/AiChainOfThought/AiChainOfThought.vue'
import Button from '../../../packages/components/Button/Button.vue'
import SimpleCodeBlock from '~/components/SimpleCodeBlock.vue'
import Tabs from '~/components/Tabs.vue'
import DocTableOfContents from '~/components/DocTableOfContents.vue'
import PlatformLink from '~/components/PlatformLink.vue'
import PreviewArea from '~/components/PreviewArea.vue'

// Import icons
import SearchIcon from '~/components/icon/fw-icons/search.svg?raw'
import RefreshIcon from '~/components/icon/fw-icons/refresh.svg?raw'

// Figma icon
const FigmaIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M6.66667 18.3334C8.13943 18.3334 9.33333 17.1395 9.33333 15.6667V13.0001H6.66667C5.19391 13.0001 4 14.194 4 15.6667C4 17.1395 5.19391 18.3334 6.66667 18.3334Z" fill="#0ACF83"/>
  <path d="M4 10.0001C4 8.52728 5.19391 7.33337 6.66667 7.33337H9.33333V12.6667H6.66667C5.19391 12.6667 4 11.4728 4 10.0001Z" fill="#A259FF"/>
  <path d="M4.00001 4.66671C4.00001 3.19395 5.19392 2.00004 6.66668 2.00004H9.33334V7.33337H6.66668C5.19392 7.33337 4.00001 6.13947 4.00001 4.66671Z" fill="#F24E1E"/>
  <path d="M9.33334 2.00004H12C13.4728 2.00004 14.6667 3.19395 14.6667 4.66671C14.6667 6.13947 13.4728 7.33337 12 7.33337H9.33334V2.00004Z" fill="#FF7262"/>
  <path d="M14.6667 10.0001C14.6667 11.4728 13.4728 12.6667 12 12.6667C10.5272 12.6667 9.33334 11.4728 9.33334 10.0001C9.33334 8.52728 10.5272 7.33337 12 7.33337C13.4728 7.33337 14.6667 8.52728 14.6667 10.0001Z" fill="#1ABCFE"/>
</svg>`

definePageMeta({ layout: 'default' })

const stepsTab = ref('Usage')
const textTab = ref('Usage')

// Table of Contents items
const tocItems = ref([
  { id: 'with-steps', text: 'With Steps', level: 2 },
  { id: 'with-text', text: 'With Text', level: 2 },
  { id: 'api', text: 'API', level: 2 },
  { id: 'props', text: 'Props', level: 3 },
  { id: 'types', text: 'Types', level: 3 },
])

// With Steps - streaming simulation
const isStepsGenerating = ref(false)
const stepsArray = ref<ChainOfThoughtStep[]>([])

// stepsContent 改为 computed，自动跟随 stepsArray
const stepsContent = computed<ReasoningContent>(() => ({
  type: 'steps',
  steps: stepsArray.value,
}))

const fullStepsData: ChainOfThoughtStep[] = [
  {
    id: 'step-search',
    iconType: 'advanced',
    icon: SearchIcon,
    label: 'Conduct a web search online',
    status: 'completed',
    detail: {
      type: 'content',
      content: 'Searching files in repo...\nFound 12 files (src, docs)\nParsing markdown and code blocks\nSelecting tool: summarize\nRunning summarize(tool) with top 5 files\nSummary generated',
    },
  },
  {
    id: 'step-done',
    iconType: 'basic',
    label: 'Done',
    status: 'done',
  },
]

let stepsTimer: ReturnType<typeof setTimeout> | null = null
let stepsDetailTimer: ReturnType<typeof setInterval> | null = null

const resetSteps = () => {
  if (stepsTimer) clearTimeout(stepsTimer)
  if (stepsDetailTimer) clearInterval(stepsDetailTimer)
  isStepsGenerating.value = false
  stepsArray.value = []
}

const generateSteps = () => {
  if (stepsTimer) clearTimeout(stepsTimer)
  if (stepsDetailTimer) clearInterval(stepsDetailTimer)
  isStepsGenerating.value = true
  stepsArray.value = []

  // Simulate streaming: add steps progressively
  // Step 1: Show first step as 'processing' with empty detail
  setTimeout(() => {
    stepsArray.value = [{
      ...fullStepsData[0],
      status: 'processing',
      detail: {
        type: 'content',
        content: '',
      },
    }]

    // Start streaming detail content
    const fullDetailContent = fullStepsData[0].detail?.content || ''
    let detailIndex = 0
    stepsDetailTimer = setInterval(() => {
      if (detailIndex < fullDetailContent.length) {
        const currentContent = fullDetailContent.substring(0, detailIndex + 1)
        stepsArray.value[0] = {
          ...fullStepsData[0],
          status: 'processing',
          detail: {
            type: 'content',
            content: currentContent,
          },
        }
        detailIndex++
      } else {
        clearInterval(stepsDetailTimer!)
      }
    }, 30)
  }, 500)

  // Step 2: Complete detail streaming and change to completed status (triggers collapse)
  setTimeout(() => {
    if (stepsDetailTimer) clearInterval(stepsDetailTimer)
    // Change status to completed - this will trigger collapse because processing auto-expands, completed doesn't
    stepsArray.value[0] = {
      ...fullStepsData[0],
      status: 'completed',
      detail: {
        type: 'content',
        content: fullStepsData[0].detail?.content || '',
      },
    }
  }, 3500)

  // Step 3: Add 'Done' step with animation (wait for collapse to finish, ~450ms)
  setTimeout(() => {
    stepsArray.value = [
      { ...fullStepsData[0], status: 'completed' },
      { ...fullStepsData[1] },
    ]
  }, 4200)

  // Step 4: Finish
  stepsTimer = setTimeout(() => {
    isStepsGenerating.value = false
  }, 4700)
}

// With Text - streaming simulation
const isTextGenerating = ref(false)
const textContent = ref<ReasoningContent>({
  type: 'text',
  content: '',
})

const fullTextContent = 'Searching files in repo...\nFound 12 files (src, docs)\nParsing markdown and code blocks\nSelecting tool: summarize\nRunning summarize(tool) with top 5 files\nSummary generated...'

let textTimer: ReturnType<typeof setInterval> | null = null

const resetText = () => {
  if (textTimer) clearInterval(textTimer)
  isTextGenerating.value = false
  textContent.value = { type: 'text', content: '' }
}

const generateText = () => {
  if (textTimer) clearInterval(textTimer)
  isTextGenerating.value = true
  textContent.value = { type: 'text', content: '' }

  let i = 0
  textTimer = setInterval(() => {
    if (i < fullTextContent.length) {
      textContent.value = {
        type: 'text',
        content: textContent.value.content + fullTextContent[i],
      }
      i++
    } else {
      clearInterval(textTimer!)
      isTextGenerating.value = false
    }
  }, 30)
}

onBeforeUnmount(() => {
  if (stepsTimer) clearTimeout(stepsTimer)
  if (stepsDetailTimer) clearInterval(stepsDetailTimer)
  if (textTimer) clearInterval(textTimer)
})

// Component source code
const componentSource = `<template>
  <div class="ai-reasoning">
    <!-- Trigger Title Row -->
    <div class="ai-reasoning__trigger" @click="toggle">
      <span :class="triggerTextClasses">Show AI reasoning</span>
      <span class="ai-reasoning__chevron" :class="{ 'ai-reasoning__chevron--expanded': isExpanded }" v-html="ChevronDownIcon" />
    </div>

    <!-- Content Area: grid animation -->
    <div :class="['ai-reasoning__panel', isExpanded && 'ai-reasoning__panel--expanded']">
      <div class="ai-reasoning__inner">
        <!-- Steps type -->
        <AiChainOfThought v-if="props.content.type === 'steps'" :steps="props.content.steps" />

        <!-- Text type -->
        <div v-else-if="props.content.type === 'text'" class="ai-reasoning__text-container">
          <div class="ai-reasoning__text-line" />
          <div class="ai-reasoning__text">{{ props.content.content }}</div>
        </div>
      </div>
    </div>
  </div>
</template>`

// Usage examples
const stepsUsage = `<script setup>
import SearchIcon from '~/components/icon/fw-icons/search.svg?raw'
<\/script>

<template>
  <AiReasoning
    :reasoning="false"
    :content="{
      type: 'steps',
      steps: [
        {
          iconType: 'advanced',
          icon: SearchIcon,
          label: 'Conduct a web search online',
          status: 'completed',
          detail: {
            type: 'content',
            content: 'Searching files in repo...\\nFound 12 files (src, docs)\\nParsing markdown and code blocks\\nSelecting tool: summarize\\nRunning summarize(tool) with top 5 files\\nSummary generated'
          }
        },
        {
          iconType: 'basic',
          label: 'Done',
          status: 'done'
        }
      ]
    }"
    :default-expanded="true"
  />
</template>`

const textUsage = `<AiReasoning
  :reasoning="true"
  :content="{
    type: 'text',
    content: 'Searching files in repo...\\nFound 12 files (src, docs)\\nParsing markdown and code blocks\\nSelecting tool: summarize\\nRunning summarize(tool) with top 5 files\\nSummary generated...'
  }"
  :default-expanded="true"
/>`
</script>

<style scoped>
/* ========== Page-specific styles ========== */

/* preview-area 上下 padding 收小，适配组件高度 */
.preview-area--chain {
  padding: var(--spacing-padding-3xl-32) var(--spacing-padding-6xl-48);
}

/* preview-area with action button (Generate/Replay) */
.preview-area--with-action :deep(.action-buttons) {
  position: absolute;
  top: var(--spacing-padding-m-12);
  right: var(--spacing-padding-m-12);
  display: flex;
  gap: var(--spacing-size-s-8);
}

/* type-heading：Types 区域小标题 */
.type-heading {
  margin-top: var(--spacing-margin-margin-m-16);
  margin-bottom: var(--spacing-margin-margin-s-12);
  font-size: var(--typo-interface-desktop-body-body-large-size);
  line-height: var(--typo-interface-desktop-body-body-large-lh);
  font-weight: 600;
  color: var(--color-text-primary);
}
</style>
