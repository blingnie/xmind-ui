<template>
  <div class="doc-page-layout">
    <!-- Main Content -->
    <div class="doc-page-content">
      <h1 class="text-xl">Chain of Thought</h1>
      <p class="text-sm text-[var(--color-text-tertiary)]" style="margin-bottom: 0;">A visual representation of AI thinking processes, displaying sequential steps with their current state, optional details, and status indicators. Used to provide transparency and feedback during multi-step AI operations.</p>

      <!-- Figma Link -->
      <PlatformLink
        href="https://www.figma.com/design/1Zb3WXCH66yxr6O4i7DFDg/xmind-UI-Components?node-id=16301-7870"
        label="Figma"
        :icon="FigmaIcon"
      />

      <!-- Basic chain of thought -->
      <section id="basic" class="doc-section">
        <h2>Basic chain of thought</h2>
        <div class="preview-card">
          <PreviewArea align="left">
            <AiChainOfThought :steps="basicSteps" />
          </PreviewArea>
          <div class="pt-2 px-4 pb-4 border-t border-[var(--color-border-translucent)]">
            <Tabs v-model="basicTab" :tabs="['Usage', 'Source']" />
            <SimpleCodeBlock :code="basicTab === 'Usage' ? basicUsage : componentSource" language="vue" height="280px" />
          </div>
        </div>
      </section>

      <!-- Advanced reasoning steps -->
      <section id="advanced" class="doc-section">
        <h2>Advanced reasoning steps</h2>
        <div class="preview-card">
          <PreviewArea align="left">
            <AiChainOfThought :steps="advancedSteps" />
          </PreviewArea>
          <div class="pt-2 px-4 pb-4 border-t border-[var(--color-border-translucent)]">
            <Tabs v-model="advancedTab" :tabs="['Usage', 'Source']" />
            <SimpleCodeBlock :code="advancedTab === 'Usage' ? advancedUsage : componentSource" language="vue" height="280px" />
          </div>
        </div>
      </section>

      <!-- States -->
      <section id="states" class="doc-section">
        <h2>States</h2>

        <div class="states-grid">
          <!-- Processing -->
          <div id="state-processing">
            <h3>Processing</h3>
            <div class="preview-card">
              <PreviewArea align="left">
                <AiChainOfThought :steps="processingSteps" />
              </PreviewArea>
              <div class="p-4 border-t border-[var(--color-border-translucent)]">
                <SimpleCodeBlock :code="processingUsage" language="vue" />
              </div>
            </div>
            <p class="text-sm text-[var(--color-text-tertiary)]" style="margin-top: var(--spacing-margin-margin-s-12);">Label displays rotating dot animation, title text displays shimmer gradient animation, detail text displays typewriter animation.</p>
          </div>

          <!-- Completed -->
          <div id="state-completed">
            <h3>Completed</h3>
            <div class="preview-card">
              <PreviewArea align="left">
                <AiChainOfThought :steps="completedSteps" />
              </PreviewArea>
              <div class="p-4 border-t border-[var(--color-border-translucent)]">
                <SimpleCodeBlock :code="completedUsage" language="vue" />
              </div>
            </div>
          </div>

          <!-- Error -->
          <div id="state-error">
            <h3>Error</h3>
            <div class="preview-card">
              <PreviewArea align="left">
                <AiChainOfThought :steps="errorSteps" />
              </PreviewArea>
              <div class="p-4 border-t border-[var(--color-border-translucent)]">
                <SimpleCodeBlock :code="errorUsage" language="vue" />
              </div>
            </div>
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
            <span data-label="Name"><code>steps</code></span>
            <span data-label="Type"><code>ChainOfThoughtStep[]</code></span>
            <span data-label="Default"><code>[]</code></span>
            <span data-label="Description">Array of steps, each containing icon type, title, status, and optional detail content</span>
          </div>
        </div>

        <!-- Types -->
        <h3 id="types">Types</h3>

        <h4>StepStatus</h4>
        <div class="api-table api-table--2-cols">
          <div class="api-table__header">
            <span>Value</span>
            <span>Description</span>
          </div>
          <div class="api-table__row">
            <span data-label="Value"><code>'processing'</code></span>
            <span data-label="Description">Step is currently in progress with animations</span>
          </div>
          <div class="api-table__row">
            <span data-label="Value"><code>'completed'</code></span>
            <span data-label="Description">Step has finished successfully</span>
          </div>
          <div class="api-table__row">
            <span data-label="Value"><code>'error'</code></span>
            <span data-label="Description">Step encountered an error</span>
          </div>
        </div>

        <h4>StepIconType</h4>
        <div class="api-table api-table--2-cols">
          <div class="api-table__header">
            <span>Value</span>
            <span>Description</span>
          </div>
          <div class="api-table__row">
            <span data-label="Value"><code>'basic'</code></span>
            <span data-label="Description">Bullet point icon (6px circle)</span>
          </div>
          <div class="api-table__row">
            <span data-label="Value"><code>'advanced'</code></span>
            <span data-label="Description">Custom SVG icon (passed via <code>icon</code> prop as raw SVG string)</span>
          </div>
        </div>

        <h4>DetailType</h4>
        <div class="api-table api-table--2-cols">
          <div class="api-table__header">
            <span>Value</span>
            <span>Description</span>
          </div>
          <div class="api-table__row">
            <span data-label="Value"><code>'content'</code></span>
            <span data-label="Description">Plain text content (supports typewriter animation when processing)</span>
          </div>
          <div class="api-table__row">
            <span data-label="Value"><code>'code'</code></span>
            <span data-label="Description">Code blocks with language labels (supports multiple blocks)</span>
          </div>
        </div>

        <h4>ChainOfThoughtStep</h4>
        <div class="api-table">
          <div class="api-table__header">
            <span>Name</span>
            <span>Type</span>
            <span>Default</span>
            <span>Description</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>id</code></span>
            <span data-label="Type"><code>string</code></span>
            <span data-label="Default"><code>undefined</code></span>
            <span data-label="Description">Optional unique identifier. When provided, used as the key for expand state tracking; otherwise falls back to index</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>iconType</code></span>
            <span data-label="Type"><code>StepIconType</code></span>
            <span data-label="Default">—</span>
            <span data-label="Description">Icon display type: <code>'basic'</code> for bullet point, <code>'advanced'</code> for custom icon</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>icon</code></span>
            <span data-label="Type"><code>string</code></span>
            <span data-label="Default"><code>undefined</code></span>
            <span data-label="Description">SVG raw string, required when <code>iconType='advanced'</code></span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>label</code></span>
            <span data-label="Type"><code>string</code></span>
            <span data-label="Default">—</span>
            <span data-label="Description">Step title text</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>status</code></span>
            <span data-label="Type"><code>StepStatus</code></span>
            <span data-label="Default">—</span>
            <span data-label="Description">Current step status</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>detail</code></span>
            <span data-label="Type"><code>StepDetail</code></span>
            <span data-label="Default"><code>undefined</code></span>
            <span data-label="Description">Optional detail content</span>
          </div>
        </div>

        <h4>StepDetail</h4>
        <div class="api-table">
          <div class="api-table__header">
            <span>Name</span>
            <span>Type</span>
            <span>Default</span>
            <span>Description</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>type</code></span>
            <span data-label="Type"><code>DetailType</code></span>
            <span data-label="Default">—</span>
            <span data-label="Description">Detail content type</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>content</code></span>
            <span data-label="Type"><code>string</code></span>
            <span data-label="Default"><code>undefined</code></span>
            <span data-label="Description">Text content, used when <code>type='content'</code>, supports typewriter animation during processing</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>blocks</code></span>
            <span data-label="Type"><code>CodeBlock[]</code></span>
            <span data-label="Default"><code>undefined</code></span>
            <span data-label="Description">Code block list, used when <code>type='code'</code></span>
          </div>
        </div>

        <h4>CodeBlock</h4>
        <div class="api-table">
          <div class="api-table__header">
            <span>Name</span>
            <span>Type</span>
            <span>Default</span>
            <span>Description</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>lang</code></span>
            <span data-label="Type"><code>string</code></span>
            <span data-label="Default">—</span>
            <span data-label="Description">Language label for the code block, e.g., <code>'bash'</code>, <code>'output'</code></span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>code</code></span>
            <span data-label="Type"><code>string</code></span>
            <span data-label="Default">—</span>
            <span data-label="Description">Code content</span>
          </div>
        </div>
      </section>

      <!-- Usage Examples -->
      <section id="examples" class="doc-section">
        <h2>Examples</h2>

        <!-- Typewriter Animation -->
        <div id="example-typewriter" class="example-block">
          <h3>Typewriter Animation</h3>
          <div class="preview-card">
            <PreviewArea align="left" with-action>
              <Button variant="default" size="small" @click="replayTypewriter">
                <template #icon-left>
                  <span v-html="RefreshIcon" />
                </template>
                Replay
              </Button>
              <AiChainOfThought :steps="typewriterSteps" />
            </PreviewArea>
            <div class="p-4 border-t border-[var(--color-border-translucent)]">
              <SimpleCodeBlock :code="typewriterUsage" language="vue" />
            </div>
          </div>
        </div>

        <!-- Content Detail -->
        <div id="example-content-detail" class="example-block">
          <h3>Content Detail</h3>
          <div class="preview-card">
            <PreviewArea align="left">
              <AiChainOfThought :steps="contentDetailSteps" />
            </PreviewArea>
            <div class="p-4 border-t border-[var(--color-border-translucent)]">
              <SimpleCodeBlock :code="contentDetailUsage" language="vue" />
            </div>
          </div>
        </div>

        <!-- Code Detail -->
        <div id="example-code-detail" class="example-block">
          <h3>Code Detail</h3>
          <div class="preview-card">
            <PreviewArea align="left">
              <AiChainOfThought :steps="codeDetailSteps" />
            </PreviewArea>
            <div class="p-4 border-t border-[var(--color-border-translucent)]">
              <SimpleCodeBlock :code="codeDetailUsage" language="vue" />
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Table of Contents -->
    <DocTableOfContents :items="tocItems" class="hidden xl:block" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import AiChainOfThought from '../../../packages/components/AiChainOfThought/AiChainOfThought.vue'
import type { ChainOfThoughtStep } from '../../../packages/components/AiChainOfThought/AiChainOfThought.vue'
import Button from '../../../packages/components/Button/Button.vue'
import SimpleCodeBlock from '~/components/SimpleCodeBlock.vue'
import Tabs from '~/components/Tabs.vue'
import DocTableOfContents from '~/components/DocTableOfContents.vue'
import PlatformLink from '~/components/PlatformLink.vue'
import PreviewArea from '~/components/PreviewArea.vue'

// Import icons
import SearchIcon from '~/components/icon/fw-icons/search.svg?raw'
import GlobalIcon from '~/components/icon/fw-icons/global.svg?raw'
import RenameIcon from '~/components/icon/fw-icons/rename.svg?raw'
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

const basicTab = ref('Usage')
const advancedTab = ref('Usage')

// Table of Contents items
const tocItems = ref([
  { id: 'basic', text: 'Basic chain of thought', level: 2 },
  { id: 'advanced', text: 'Advanced reasoning steps', level: 2 },
  { id: 'states', text: 'States', level: 2 },
  { id: 'state-processing', text: 'Processing', level: 3 },
  { id: 'state-completed', text: 'Completed', level: 3 },
  { id: 'state-error', text: 'Error', level: 3 },
  { id: 'api', text: 'API', level: 2 },
  { id: 'props', text: 'Props', level: 3 },
  { id: 'types', text: 'Types', level: 3 },
  { id: 'examples', text: 'Examples', level: 2 },
  { id: 'example-typewriter', text: 'Typewriter Animation', level: 3 },
  { id: 'example-content-detail', text: 'Content Detail', level: 3 },
  { id: 'example-code-detail', text: 'Code Detail', level: 3 },
])

// Basic chain of thought steps
const basicSteps: ChainOfThoughtStep[] = [
  {
    iconType: 'basic',
    label: 'Analyzing the user\'s request',
    status: 'completed',
    detail: {
      type: 'content',
      content: 'Breaking down the problem to understand the core requirements and constraints of the task.',
    },
  },
  {
    iconType: 'basic',
    label: 'Considering implementation options',
    status: 'completed',
    detail: {
      type: 'content',
      content: 'Evaluating different approaches and weighing their trade-offs in terms of performance and maintainability.',
    },
  },
  {
    iconType: 'basic',
    label: 'Selecting the best approach',
    status: 'completed',
    detail: {
      type: 'content',
      content: 'Decided to use an indexed query strategy based on the analysis of query patterns and data distribution.',
    },
  },
  // 新增终止状态
  {
    iconType: 'basic',
    label: 'Done',
    status: 'done',
  },
]

// Advanced reasoning steps
const advancedSteps: ChainOfThoughtStep[] = [
  {
    iconType: 'advanced',
    icon: SearchIcon,
    label: 'Research phase: Understanding the problem space',
    status: 'completed',
    detail: {
      type: 'content',
      content: 'Searched for relevant documentation on PostgreSQL query optimization and indexing strategies.',
    },
  },
  {
    iconType: 'advanced',
    icon: GlobalIcon,
    label: 'Analysis: Identifying optimization opportunities',
    status: 'completed',
    detail: {
      type: 'content',
      content: 'Identified three main bottlenecks: missing indexes on foreign keys, N+1 query patterns, and unoptimized joins.',
    },
  },
  {
    iconType: 'advanced',
    icon: RenameIcon,
    label: 'Implementation: Applying the solution',
    status: 'completed',
    detail: {
      type: 'content',
      content: 'Applied composite indexes and rewrote the join queries. Query time improved from 2.3s to 0.04s.',
    },
  },
  // 新增终止状态
  {
    iconType: 'advanced',
    label: 'Failed to modify the file',
    status: 'failed',
  },
]

// State examples
const processingSteps: ChainOfThoughtStep[] = [
  {
    iconType: 'basic',
    label: 'Analyzing the request',
    status: 'processing',
    detail: {
      type: 'content',
      content: 'Breaking down the problem to understand the core requirements and constraints...',
    },
  },
]

const completedSteps: ChainOfThoughtStep[] = [
  {
    iconType: 'basic',
    label: 'Research phase complete',
    status: 'completed',
    detail: {
      type: 'content',
      content: 'Successfully gathered all necessary information to proceed with the solution.',
    },
  },
]

const errorSteps: ChainOfThoughtStep[] = [
  {
    iconType: 'basic',
    label: 'Failed to retrieve data',
    status: 'error',
  },
]

// Typewriter Animation
const fullTypewriterContent = 'The system is analyzing your input and formulating a comprehensive response. This involves understanding the context, retrieving relevant information, and constructing a coherent and helpful answer based on your specific needs...'

const typewriterContent = ref('')
let typewriterTimer: ReturnType<typeof setInterval> | null = null

const typewriterSteps = computed(() => [{
  iconType: 'basic' as const,
  label: 'Generating response',
  status: 'processing' as const,
  detail: {
    type: 'content' as const,
    content: typewriterContent.value,
  },
}])

const startTypewriter = () => {
  if (typewriterTimer) clearInterval(typewriterTimer)
  typewriterContent.value = ''
  let i = 0
  typewriterTimer = setInterval(() => {
    if (i < fullTypewriterContent.length) {
      typewriterContent.value += fullTypewriterContent[i]
      i++
    } else {
      clearInterval(typewriterTimer!)
    }
  }, 30)
}

const replayTypewriter = () => {
  startTypewriter()
}

// 页面挂载时自动开始
onMounted(() => {
  startTypewriter()
})

onBeforeUnmount(() => {
  if (typewriterTimer) clearInterval(typewriterTimer)
})

// Example: Content Detail
const contentDetailSteps: ChainOfThoughtStep[] = [
  {
    iconType: 'basic',
    label: 'Research phase',
    status: 'completed',
    detail: {
      type: 'content',
      content: 'The problem involves optimizing database queries for a high-traffic e-commerce platform.\nCurrent bottlenecks: slow product search, category filtering delays.',
    },
  },
]

// Example: Code Detail
const codeDetailSteps: ChainOfThoughtStep[] = [
  {
    iconType: 'basic',
    label: 'Execute script',
    status: 'completed',
    detail: {
      type: 'code',
      blocks: [
        {
          lang: 'bash',
          code: `SELECT
  p.id,
  p.name,
  p.description,
  p.price,
  p.stock_quantity,
  p.category_id,
  p.created_at,
  p.updated_at,
  c.name as category_name,
  c.slug as category_slug,
  v.name as vendor_name,
  v.email as vendor_email,
  COUNT(r.id) as review_count,
  AVG(r.rating) as avg_rating
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN vendors v ON p.vendor_id = v.id
LEFT JOIN reviews r ON p.id = r.product_id
WHERE p.category_id = $1
  AND p.stock_quantity > 0
  AND p.status = 'active'
  AND p.deleted_at IS NULL
GROUP BY p.id, c.name, c.slug, v.name, v.email
HAVING AVG(r.rating) >= 4.0
ORDER BY p.created_at DESC, p.name ASC
LIMIT 20
OFFSET 0;`,
        },
        {
          lang: 'output',
          code: '20 rows returned\nQuery time: 0.043s',
        },
      ],
    },
  },
]

// Component source code
const componentSource = `<template>
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

        <div v-if="step.detail" class="cot-detail">
          <div class="cot-detail__rail" aria-hidden="true">
            <div
              :class="[
                'cot-detail__line',
                !isExpanded(step, index) && step.detail?.type === 'content' && 'cot-detail__line--short',
                !isExpanded(step, index) && step.detail?.type === 'code' && 'cot-detail__line--medium'
              ]"
            />
          </div>

          <div class="cot-detail__body">
            <div
              v-if="!isExpanded(step, index)"
              :class="[
                'cot-detail__summary',
                step.detail?.type === 'code' && 'cot-detail__summary--code'
              ]"
            >
              <div
                v-if="step.detail.type === 'code'"
                class="cot-code-shell cot-code-shell--collapsed"
                @click.stop="toggleExpand(step, index)"
              >
                <span class="cot-code-shell__label">Script</span>
              </div>
            </div>

            <div
              :class="[
                'cot-detail__panel',
                isExpanded(step, index) && 'cot-detail__panel--expanded'
              ]"
            >
              <div class="cot-detail__inner">
                <template v-if="isExpanded(step, index)">
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
                        <pre class="cot-code-shell__body" @scroll="handleCodeScroll">{{ block.code }}</pre>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>`

// Usage examples
const basicUsage = `<AiChainOfThought :steps="[
  {
    iconType: 'basic',
    label: 'Analyzing the user\\'s request',
    status: 'completed',
    detail: {
      type: 'content',
      content: 'Breaking down the problem to understand the core requirements and constraints of the task.'
    }
  },
  {
    iconType: 'basic',
    label: 'Considering implementation options',
    status: 'completed',
    detail: {
      type: 'content',
      content: 'Evaluating different approaches and weighing their trade-offs in terms of performance and maintainability.'
    }
  },
  {
    iconType: 'basic',
    label: 'Selecting the best approach',
    status: 'completed',
    detail: {
      type: 'content',
      content: 'Decided to use an indexed query strategy based on the analysis of query patterns and data distribution.'
    }
  },
  {
    iconType: 'basic',
    label: 'Done',
    status: 'done'
  }
]" />`

const advancedUsage = `<script setup>
import SearchIcon from '~/components/icon/fw-icons/search.svg?raw'
import GlobalIcon from '~/components/icon/fw-icons/global.svg?raw'
import RenameIcon from '~/components/icon/fw-icons/rename.svg?raw'
<\/script>

<template>
  <AiChainOfThought :steps="[
    {
      iconType: 'advanced',
      icon: SearchIcon,
      label: 'Research phase: Understanding the problem space',
      status: 'completed',
      detail: {
        type: 'content',
        content: 'Searched for relevant documentation on PostgreSQL query optimization and indexing strategies.'
      }
    },
    {
      iconType: 'advanced',
      icon: GlobalIcon,
      label: 'Analysis: Identifying optimization opportunities',
      status: 'completed',
      detail: {
        type: 'content',
        content: 'Identified three main bottlenecks: missing indexes on foreign keys, N+1 query patterns, and unoptimized joins.'
      }
    },
    {
      iconType: 'advanced',
      icon: RenameIcon,
      label: 'Implementation: Applying the solution',
      status: 'completed',
      detail: {
        type: 'content',
        content: 'Applied composite indexes and rewrote the join queries. Query time improved from 2.3s to 0.04s.'
      }
    },
    {
      iconType: 'advanced',
      label: 'Failed to modify the file',
      status: 'failed'
    }
  ]" />
</template>`

const processingUsage = `<AiChainOfThought :steps="[
  {
    iconType: 'basic',
    label: 'Analyzing the request',
    status: 'processing',
    detail: {
      type: 'content',
      content: 'Breaking down the problem to understand the core requirements and constraints...'
    }
  }
]" />`

const completedUsage = `<AiChainOfThought :steps="[
  {
    iconType: 'basic',
    label: 'Research phase complete',
    status: 'completed',
    detail: {
      type: 'content',
      content: 'Successfully gathered all necessary information to proceed with the solution.'
    }
  }
]" />`

const errorUsage = `<AiChainOfThought :steps="[
  {
    iconType: 'basic',
    label: 'Failed to retrieve data',
    status: 'error'
  }
]" />`

const typewriterUsage = `<AiChainOfThought :steps="[
  {
    iconType: 'basic',
    label: 'Generating response',
    status: 'processing',
    detail: {
      type: 'content',
      content: 'The system is analyzing your input...'
    }
  }
]" />`

const contentDetailUsage = `<AiChainOfThought :steps="[
  {
    iconType: 'basic',
    label: 'Research phase',
    status: 'completed',
    detail: {
      type: 'content',
      content: 'The problem involves optimizing database queries...'
    }
  }
]" />`

const codeDetailUsage = `<AiChainOfThought :steps="[
  {
    iconType: 'basic',
    label: 'Execute script',
    status: 'completed',
    detail: {
      type: 'code',
      blocks: [
        { lang: 'bash', code: 'SELECT * FROM products...' },
        { lang: 'output', code: '20 rows returned' }
      ]
    }
  }
]" />`
</script>

<style scoped>
/* ========== Replay Button ========== */
.preview-area--with-action :deep(.button) {
  position: absolute;
  top: var(--spacing-padding-m-12);
  right: var(--spacing-padding-m-12);
}

/* ========== States Grid ========== */
.states-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-margin-margin-l-24);
}
</style>
