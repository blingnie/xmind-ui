<template>
  <div class="doc-page-layout">
    <!-- Main Content -->
    <div class="doc-page-content">
      <h1 class="text-xl">Attachment</h1>
      <p class="text-sm text-[var(--color-text-tertiary)]" style="margin-bottom: 0;">A compact card for displaying attachment previews. Supports three types — template, file, and image preview — commonly used in chat input areas or message bubbles.</p>

      <!-- Figma Link -->
      <PlatformLink
        href="https://www.figma.com/design/1Zb3WXCH66yxr6O4i7DFDg/xmind-UI-Components?node-id=16231-16075"
        label="Figma"
        :icon="FigmaIcon"
      />

      <!-- Default preview -->
      <section id="default" class="doc-section">
        <div class="preview-card">
          <PreviewArea class="preview-area--attachment">
            <div style="display: flex; gap: 12px; align-items: flex-start; flex-wrap: wrap;">
              <Attachment
                type="template"
                title="Illumination"
                subtitle="Template"
                thumbnailUrl="/images/attachment-placeholder.png"
              />
              <Attachment
                type="file"
                title="COMPLETE_INSTALLATION_GUIDE.pdf"
                subtitle="File"
                file-type="pdf"
              />
              <Attachment
                type="preview"
                thumbnailUrl="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=128&h=128&fit=crop"
              />
            </div>
          </PreviewArea>
          <div class="pt-2 px-4 pb-4 border-t border-[var(--color-border-translucent)]">
            <Tabs v-model="activeTab" :tabs="['Usage', 'Source']" />
            <SimpleCodeBlock :code="activeTab === 'Usage' ? defaultUsage : componentSource" language="vue" height="280px" />
          </div>
        </div>
      </section>

      <!-- Variants -->
      <section id="variants" class="doc-section">
        <h2>Variants</h2>

        <!-- Template -->
        <div id="template" class="example-block">
          <h3>Template</h3>
          <p class="text-sm text-[var(--color-text-tertiary)]" style="margin-bottom: var(--spacing-margin-margin-m-16);">Horizontal card (210px wide) with an 80×48 thumbnail frame on the left and title/subtitle on the right.</p>
          <div class="preview-card">
            <PreviewArea class="preview-area--attachment">
              <Attachment
                type="template"
                title="Illumination"
                subtitle="Template"
                thumbnailUrl="/images/attachment-placeholder.png"
              />
            </PreviewArea>
          </div>
        </div>

        <!-- File -->
        <div id="file" class="example-block">
          <h3>File</h3>
          <p class="text-sm text-[var(--color-text-tertiary)]" style="margin-bottom: var(--spacing-margin-margin-m-16);">Horizontal card (210px wide) with a 48×48 file-type icon on the left. Supports pdf, doc, ppt, md, and txt with automatic dark mode adaptation.</p>
          <div class="preview-card">
            <PreviewArea class="preview-area--attachment">
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <Attachment type="file" title="document.pdf" subtitle="File" file-type="pdf" />
                <Attachment type="file" title="document.doc" subtitle="File" file-type="doc" />
                <Attachment type="file" title="document.ppt" subtitle="File" file-type="ppt" />
                <Attachment type="file" title="document.md" subtitle="File" file-type="md" />
                <Attachment type="file" title="document.txt" subtitle="File" file-type="txt" />
              </div>
            </PreviewArea>
          </div>
        </div>

        <!-- Preview -->
        <div id="preview" class="example-block">
          <h3>Preview</h3>
          <p class="text-sm text-[var(--color-text-tertiary)]" style="margin-bottom: var(--spacing-margin-margin-m-16);">A 64×64 square image thumbnail with object-fit: cover filling.</p>
          <div class="preview-card">
            <PreviewArea class="preview-area--attachment">
              <div style="display: flex; gap: 8px;">
                <Attachment type="preview" thumbnailUrl="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=128&h=128&fit=crop" />
                <Attachment type="preview" thumbnailUrl="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=128&h=128&fit=crop" />
                <Attachment type="preview" thumbnailUrl="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=128&h=128&fit=crop" />
              </div>
            </PreviewArea>
          </div>
        </div>
      </section>

      <!-- States -->
      <section id="states" class="doc-section">
        <h2>States</h2>

        <!-- Loading -->
        <div id="loading" class="example-block">
          <h3>Loading</h3>
          <p class="text-sm text-[var(--color-text-tertiary)]" style="margin-bottom: var(--spacing-margin-margin-m-16);">When loading, the media area is replaced with a centered spinner.</p>
          <div class="preview-card">
            <PreviewArea class="preview-area--attachment">
              <div style="display: flex; gap: 12px; align-items: flex-start;">
                <Attachment type="template" title="Illumination" subtitle="Template" :loading="true" />
                <Attachment type="file" title="document.pdf" subtitle="File" :loading="true" file-type="pdf" />
                <Attachment type="preview" :loading="true" />
              </div>
            </PreviewArea>
          </div>
        </div>

        <!-- Closable -->
        <div id="closable" class="example-block">
          <h3>Closable</h3>
          <p class="text-sm text-[var(--color-text-tertiary)]" style="margin-bottom: var(--spacing-margin-margin-m-16);">When closable is true, a dismiss button appears on hover and emits the close event. Typically used in input-area attachment previews.</p>
          <div class="preview-card">
            <PreviewArea class="preview-area--attachment">
              <div style="display: flex; gap: 12px; align-items: flex-start;">
                <Attachment
                  type="template"
                  title="Illumination"
                  subtitle="Template"
                  thumbnailUrl="/images/attachment-placeholder.png"
                  :closable="true"
                  @close="() => {}"
                />
                <Attachment
                  type="file"
                  title="COMPLETE_INSTALLATION_GUIDE.pdf"
                  subtitle="File"
                  file-type="pdf"
                  :closable="true"
                  @close="() => {}"
                />
                <Attachment
                  type="preview"
                  thumbnailUrl="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=128&h=128&fit=crop"
                  :closable="true"
                  @close="() => {}"
                />
              </div>
            </PreviewArea>
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
            <span data-label="Name"><code>type</code></span>
            <span data-label="Type"><code>'template' | 'file' | 'preview'</code></span>
            <span data-label="Default">—</span>
            <span data-label="Description">The card display type</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>title</code></span>
            <span data-label="Type"><code>string</code></span>
            <span data-label="Default">—</span>
            <span data-label="Description">Primary text, displayed in template and file types</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>subtitle</code></span>
            <span data-label="Type"><code>string</code></span>
            <span data-label="Default">—</span>
            <span data-label="Description">Secondary text, displayed in template and file types</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>thumbnailUrl</code></span>
            <span data-label="Type"><code>string</code></span>
            <span data-label="Default">—</span>
            <span data-label="Description">Thumbnail image URL, used by template and preview types</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>fileType</code></span>
            <span data-label="Type"><code>'pdf' | 'doc' | 'ppt' | 'md' | 'txt'</code></span>
            <span data-label="Default">—</span>
            <span data-label="Description">File extension icon, used by file type</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>loading</code></span>
            <span data-label="Type"><code>boolean</code></span>
            <span data-label="Default"><code>false</code></span>
            <span data-label="Description">Shows a spinner in the media area</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>closable</code></span>
            <span data-label="Type"><code>boolean</code></span>
            <span data-label="Default"><code>false</code></span>
            <span data-label="Description">Shows a dismiss button on hover</span>
          </div>
        </div>

        <!-- Emits -->
        <h3 id="emits">Emits</h3>
        <div class="api-table api-table--3-cols">
          <div class="api-table__header">
            <span>Name</span>
            <span>Payload</span>
            <span>Description</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>close</code></span>
            <span data-label="Payload">—</span>
            <span data-label="Description">Emitted when the dismiss button is clicked</span>
          </div>
        </div>
      </section>
    </div>

    <!-- Table of Contents -->
    <DocTableOfContents :items="tocItems" class="hidden xl:block" />
  </div>
</template>

<script setup lang="ts">
import Attachment from '../../../packages/components/Attachment/Attachment.vue'
import SimpleCodeBlock from '~/components/SimpleCodeBlock.vue'
import Tabs from '~/components/Tabs.vue'
import DocTableOfContents from '~/components/DocTableOfContents.vue'
import PlatformLink from '~/components/PlatformLink.vue'
import PreviewArea from '~/components/PreviewArea.vue'

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
  { id: 'default', text: 'Default', level: 2 },
  { id: 'variants', text: 'Variants', level: 2 },
  { id: 'template', text: 'Template', level: 3 },
  { id: 'file', text: 'File', level: 3 },
  { id: 'preview', text: 'Preview', level: 3 },
  { id: 'states', text: 'States', level: 2 },
  { id: 'loading', text: 'Loading', level: 3 },
  { id: 'closable', text: 'Closable', level: 3 },
  { id: 'api', text: 'API', level: 2 },
  { id: 'props', text: 'Props', level: 3 },
  { id: 'emits', text: 'Emits', level: 3 },
])

// Source code
const componentSource = `<template>
  <!-- Preview -->
  <div v-if="type === 'preview'" class="attachment attachment--preview">
    <div v-if="loading" class="attachment__loading-overlay">
      <span class="attachment__spinner" v-html="spinnerSvg" />
    </div>
    <img
      v-else-if="thumbnailUrl"
      :src="thumbnailUrl"
      class="attachment__preview-img"
      alt=""
    />
    <button
      v-if="closable"
      class="attachment__close attachment__close--abs"
      @click="emit('close')"
      aria-label="Remove"
    >
      <span class="attachment__close-icon" v-html="closeIcon" />
    </button>
  </div>

  <!-- Template / File -->
  <div v-else :class="cardClasses">
    <div :class="mediaClasses">
      <span v-if="loading" class="attachment__spinner" v-html="spinnerSvg" />
      <template v-else>
        <img
          v-if="type === 'template' && thumbnailUrl"
          :src="thumbnailUrl"
          class="attachment__thumb-img"
          alt=""
        />
        <template v-if="type === 'file' && fileType">
          <img :src="fileIconsLight[fileType]"
            class="attachment__file-icon attachment__file-icon--light" alt="" />
          <img :src="fileIconsDark[fileType]"
            class="attachment__file-icon attachment__file-icon--dark" alt="" />
        </template>
      </template>
    </div>
    <div class="attachment__text">
      <span v-if="title" class="attachment__title">{{ title }}</span>
      <span v-if="subtitle" class="attachment__subtitle">{{ subtitle }}</span>
    </div>
    <button v-if="closable" class="attachment__close"
      @click="emit('close')" aria-label="Remove">
      <span class="attachment__close-icon" v-html="closeIcon" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import closeIcon from '../../../docs/components/icon/fw-icons/close.svg?raw'
import spinnerSvg from '../Button/spinner.svg?raw'

export type AttachmentType = 'template' | 'file' | 'preview'
export type FileType = 'pdf' | 'doc' | 'ppt' | 'md' | 'txt'

interface AttachmentProps {
  type: AttachmentType
  title?: string
  subtitle?: string
  thumbnailUrl?: string
  fileType?: FileType
  loading?: boolean
  closable?: boolean
}

const props = withDefaults(defineProps<AttachmentProps>(), {
  loading: false,
  closable: false,
})

const emit = defineEmits<{
  close: []
}>()
<\/script>`

// Usage code
const defaultUsage = `<Attachment
  type="template"
  title="Illumination"
  subtitle="Template"
  :thumbnail-url="thumbnailUrl"
/>`
</script>

<style scoped>
.preview-area--attachment {
  padding: var(--spacing-padding-3xl-32) var(--spacing-padding-6xl-48);
}
</style>
