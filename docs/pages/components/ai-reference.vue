<template>
  <div class="doc-page-layout">
    <!-- Main Content -->
    <div class="doc-page-content">
      <h1 class="text-xl">Reference</h1>
      <p class="text-sm text-[var(--color-text-tertiary)]" style="margin-bottom: 0;">A compact tag that represents a selected topic from a mind map. Typically used in AI prompt inputs to show which topic the user is referencing. Displays an icon, truncated label text, and an optional close button on hover.</p>

      <!-- Figma Link -->
      <PlatformLink
        href="https://www.figma.com/design/1Zb3WXCH66yxr6O4i7DFDg/xmind-UI-Components?node-id=16338-36481"
        label="Figma"
        :icon="FigmaIcon"
      />

      <!-- Default preview -->
      <section id="preview" class="doc-section">
        <div class="preview-card">
          <PreviewArea>
            <AiReference>
              <template #icon>
                <span v-html="TopicLinkIcon" />
              </template>
              Project Planning
            </AiReference>
          </PreviewArea>
          <div class="pt-2 px-4 pb-4 border-t border-[var(--color-border-translucent)]">
            <Tabs v-model="activeTab" :tabs="['Usage', 'Source']" />
            <SimpleCodeBlock :code="activeTab === 'Usage' ? defaultUsage : componentSource" language="vue" height="280px" />
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
            <span data-label="Name"><code>closable</code></span>
            <span data-label="Type"><code>boolean</code></span>
            <span data-label="Default"><code>true</code></span>
            <span data-label="Description">Whether the close button appears on hover</span>
          </div>
        </div>

        <!-- Events -->
        <h3 id="events">Events</h3>
        <div class="api-table api-table--3-cols">
          <div class="api-table__header">
            <span>Name</span>
            <span>Payload</span>
            <span>Description</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>close</code></span>
            <span data-label="Payload"><code>MouseEvent</code></span>
            <span data-label="Description">Emitted when the close button is clicked</span>
          </div>
        </div>

        <!-- Slots -->
        <h3 id="slots">Slots</h3>
        <div class="api-table api-table--2-cols">
          <div class="api-table__header">
            <span>Name</span>
            <span>Description</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>default</code></span>
            <span data-label="Description">Reference label text</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>icon</code></span>
            <span data-label="Description">Leading icon (20x20), rendered with <code>currentColor</code></span>
          </div>
        </div>
      </section>

      <!-- Examples -->
      <section id="examples" class="doc-section">
        <h2>Examples</h2>

        <!-- With Different Icons -->
        <div id="example-icons" class="example-block">
          <h3>With Different Icons</h3>
          <div class="preview-card">
            <PreviewArea>
              <div style="display: flex; flex-wrap: wrap; gap: var(--spacing-size-s-8);">
                <AiReference>
                  <template #icon>
                    <span v-html="TopicLinkIcon" />
                  </template>
                  Project Planning
                </AiReference>
                <AiReference>
                  <template #icon>
                    <span v-html="FileTextIcon" />
                  </template>
                  Project Requirements.md
                </AiReference>
                <AiReference>
                  <template #icon>
                    <span v-html="MindmapsIcon" />
                  </template>
                  Product Roadmap 2026
                </AiReference>
              </div>
            </PreviewArea>
            <div class="p-4 border-t border-[var(--color-border-translucent)]">
              <SimpleCodeBlock :code="iconsUsage" language="vue" />
            </div>
          </div>
        </div>

        <!-- Text Truncation -->
        <div id="example-truncation" class="example-block">
          <h3>Text Truncation</h3>
          <div class="preview-card">
            <PreviewArea>
              <div style="max-width: 200px;">
                <AiReference>
                  <template #icon>
                    <span v-html="TopicLinkIcon" />
                  </template>
                  This is a very long reference label that should be truncated
                </AiReference>
              </div>
            </PreviewArea>
            <div class="p-4 border-t border-[var(--color-border-translucent)]">
              <SimpleCodeBlock :code="truncationUsage" language="vue" />
            </div>
          </div>
        </div>

        <!-- Not Closable -->
        <div id="example-not-closable" class="example-block">
          <h3>Not Closable</h3>
          <div class="preview-card">
            <PreviewArea>
              <AiReference :closable="false">
                <template #icon>
                  <span v-html="TopicLinkIcon" />
                </template>
                Read-only Reference
              </AiReference>
            </PreviewArea>
            <div class="p-4 border-t border-[var(--color-border-translucent)]">
              <SimpleCodeBlock :code="notClosableUsage" language="vue" />
            </div>
          </div>
        </div>

        <!-- Without Icon -->
        <div id="example-no-icon" class="example-block">
          <h3>Without Icon</h3>
          <div class="preview-card">
            <PreviewArea>
              <AiReference>
                Plain text reference
              </AiReference>
            </PreviewArea>
            <div class="p-4 border-t border-[var(--color-border-translucent)]">
              <SimpleCodeBlock :code="noIconUsage" language="vue" />
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
import { ref } from 'vue'
import AiReference from '../../../packages/components/AiReference/AiReference.vue'
import SimpleCodeBlock from '~/components/SimpleCodeBlock.vue'
import Tabs from '~/components/Tabs.vue'
import DocTableOfContents from '~/components/DocTableOfContents.vue'
import PlatformLink from '~/components/PlatformLink.vue'
import PreviewArea from '~/components/PreviewArea.vue'

// Import icons
import TopicLinkIcon from '~/components/icon/fw-icons/topiclink.svg?raw'
import FileTextIcon from '~/components/icon/fw-icons/file-text.svg?raw'
import MindmapsIcon from '~/components/icon/fw-icons/mindmaps.svg?raw'

// Figma icon
const FigmaIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M6.66667 18.3334C8.13943 18.3334 9.33333 17.1395 9.33333 15.6667V13.0001H6.66667C5.19391 13.0001 4 14.194 4 15.6667C4 17.1395 5.19391 18.3334 6.66667 18.3334Z" fill="#0ACF83"/>
  <path d="M4 10.0001C4 8.52728 5.19391 7.33337 6.66667 7.33337H9.33333V12.6667H6.66667C5.19391 12.6667 4 11.4728 4 10.0001Z" fill="#A259FF"/>
  <path d="M4.00001 4.66671C4.00001 3.19395 5.19392 2.00004 6.66668 2.00004H9.33334V7.33337H6.66668C5.19392 7.33337 4.00001 6.13947 4.00001 4.66671Z" fill="#F24E1E"/>
  <path d="M9.33334 2.00004H12C13.4728 2.00004 14.6667 3.19395 14.6667 4.66671C14.6667 6.13947 13.4728 7.33337 12 7.33337H9.33334V2.00004Z" fill="#FF7262"/>
  <path d="M14.6667 10.0001C14.6667 11.4728 13.4728 12.6667 12 12.6667C10.5272 12.6667 9.33334 11.4728 9.33334 10.0001C9.33334 8.52728 10.5272 7.33337 12 7.33337C13.4728 7.33337 14.6667 8.52728 14.6667 10.0001Z" fill="#1ABCFE"/>
</svg>`

definePageMeta({ layout: 'default' })

const activeTab = ref('Usage')

// Table of Contents items
const tocItems = ref([
  { id: 'preview', text: 'Preview', level: 2 },
  { id: 'api', text: 'API', level: 2 },
  { id: 'props', text: 'Props', level: 3 },
  { id: 'events', text: 'Events', level: 3 },
  { id: 'slots', text: 'Slots', level: 3 },
  { id: 'examples', text: 'Examples', level: 2 },
  { id: 'example-icons', text: 'With Different Icons', level: 3 },
  { id: 'example-truncation', text: 'Text Truncation', level: 3 },
  { id: 'example-not-closable', text: 'Not Closable', level: 3 },
  { id: 'example-no-icon', text: 'Without Icon', level: 3 },
])

// Code examples
const defaultUsage = `<AiReference @close="handleClose">
  <template #icon>
    <span v-html="TopicLinkIcon" />
  </template>
  Project Planning
</AiReference>`

const componentSource = `<template>
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
</template>`

const iconsUsage = `<script setup>
import TopicLinkIcon from '~/components/icon/fw-icons/topiclink.svg?raw'
import FileTextIcon from '~/components/icon/fw-icons/file-text.svg?raw'
import MindmapsIcon from '~/components/icon/fw-icons/mindmaps.svg?raw'
<\/script>

<template>
  <AiReference>
    <template #icon>
      <span v-html="TopicLinkIcon" />
    </template>
    Project Planning
  </AiReference>

  <AiReference>
    <template #icon>
      <span v-html="FileTextIcon" />
    </template>
    Project Requirements.md
  </AiReference>

  <AiReference>
    <template #icon>
      <span v-html="MindmapsIcon" />
    </template>
    Product Roadmap 2026
  </AiReference>
</template>`

const truncationUsage = `<div style="max-width: 200px;">
  <AiReference>
    <template #icon>
      <span v-html="TopicLinkIcon" />
    </template>
    This is a very long reference label that should be truncated
  </AiReference>
</div>`

const notClosableUsage = `<AiReference :closable="false">
  <template #icon>
    <span v-html="TopicLinkIcon" />
  </template>
  Read-only Reference
</AiReference>`

const noIconUsage = `<AiReference>
  Plain text reference
</AiReference>`
</script>
