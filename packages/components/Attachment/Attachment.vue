<template>
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
    <!-- 左侧图片/图标框 -->
    <div :class="mediaClasses">
      <span v-if="loading" class="attachment__spinner" v-html="spinnerSvg" />
      <template v-else>
        <!-- template：缩略图 -->
        <img
          v-if="type === 'template' && thumbnailUrl"
          :src="thumbnailUrl"
          class="attachment__thumb-img"
          alt=""
        />
        <!-- file：light/dark 双图切换 -->
        <template v-if="type === 'file' && fileType">
          <img
            :src="fileIconsLight[fileType]"
            class="attachment__file-icon attachment__file-icon--light"
            alt=""
          />
          <img
            :src="fileIconsDark[fileType]"
            class="attachment__file-icon attachment__file-icon--dark"
            alt=""
          />
        </template>
      </template>
    </div>

    <!-- 右侧文字 -->
    <div class="attachment__text">
      <span v-if="title" class="attachment__title">{{ title }}</span>
      <span v-if="subtitle" class="attachment__subtitle">{{ subtitle }}</span>
    </div>

    <!-- 关闭按钮 -->
    <button
      v-if="closable"
      class="attachment__close attachment__close--abs"
      @click="emit('close')"
      aria-label="Remove"
    >
      <span class="attachment__close-icon" v-html="closeIcon" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Raw SVG imports
import closeIcon from './close.svg?raw'
import spinnerSvg from './spinner.svg?raw'

// File icon PNG imports (Vite resolves to URL)
import pdfLight from './file-icons/pdf-light.png'
import docLight from './file-icons/doc-light.png'
import pptLight from './file-icons/ppt-light.png'
import mdLight from './file-icons/md-light.png'
import txtLight from './file-icons/txt-light.png'
import pdfDark from './file-icons/pdf-dark.png'
import docDark from './file-icons/doc-dark.png'
import pptDark from './file-icons/ppt-dark.png'
import mdDark from './file-icons/md-dark.png'
import txtDark from './file-icons/txt-dark.png'

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

const fileIconsLight: Record<FileType, string> = {
  pdf: pdfLight,
  doc: docLight,
  ppt: pptLight,
  md: mdLight,
  txt: txtLight,
}

const fileIconsDark: Record<FileType, string> = {
  pdf: pdfDark,
  doc: docDark,
  ppt: pptDark,
  md: mdDark,
  txt: txtDark,
}

const cardClasses = computed(() => {
  return [
    'attachment',
    `attachment--${props.type}`,
  ].filter(Boolean).join(' ')
})

const mediaClasses = computed(() => {
  return [
    'attachment__media',
    `attachment__media--${props.type}`,
  ].filter(Boolean).join(' ')
})
</script>

<style scoped>
/* ================================================
   Base card
   ================================================ */
.attachment {
  border-radius: var(--radius-m-12);
  border: 1px solid var(--color-border-translucent);
  overflow: hidden;
  box-sizing: border-box;
}

/* ================================================
   Template / File shared layout
   ================================================ */
.attachment--template,
.attachment--file {
  width: 210px; /* no token */
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-padding-s-8);
  padding: var(--spacing-padding-s-8);
  background: var(--color-mask-overlays);
  transition: background 150ms ease;
  position: relative;
}

.attachment--file {
  align-items: center;
}

.attachment--template:hover,
.attachment--file:hover {
  background: var(--color-mask-overlaym);
}

/* ================================================
   Media (left thumbnail / icon frame)
   ================================================ */
.attachment__media {
  flex-shrink: 0;
  border-radius: var(--radius-xs-6);
  border: 1px solid var(--color-border-translucent);
  background: var(--color-fill-surface-desktop);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.attachment__media--template {
  width: 80px; /* no token */
  height: 48px; /* no token */
}

.attachment__media--file {
  width: 48px; /* no token */
  height: 48px; /* no token */
}

/* Thumbnail image (template) */
.attachment__thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* File type icon (file) */
.attachment__file-icon {
  width: 32px; /* no token */
  height: 32px; /* no token */
  object-fit: contain;
  display: block;
}

/* Dark mode icon switching */
.attachment__file-icon--light {
  display: block;
}

.attachment__file-icon--dark {
  display: none;
}

.dark .attachment__file-icon--light,
[data-theme="dark"] .attachment__file-icon--light {
  display: none;
}

.dark .attachment__file-icon--dark,
[data-theme="dark"] .attachment__file-icon--dark {
  display: block;
}

/* ================================================
   Text area (right side)
   ================================================ */
.attachment__text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px; /* no token */
  justify-content: center;
  align-self: stretch;
  overflow: hidden;
  min-width: 0;
}

.attachment__title {
  font-size: var(--typo-interface-desktop-body-body-medium-size);
  line-height: var(--typo-interface-desktop-body-body-medium-lh);
  font-weight: var(--typo-interface-desktop-body-body-medium-weight);
  letter-spacing: var(--typo-interface-desktop-body-body-medium-ls);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.attachment__subtitle {
  font-size: var(--typo-interface-desktop-caption-caption-size);
  line-height: var(--typo-interface-desktop-caption-caption-lh);
  font-weight: var(--typo-interface-desktop-caption-caption-weight);
  letter-spacing: var(--typo-interface-desktop-caption-caption-ls);
  color: var(--color-text-tertiary);
}

/* ================================================
   Close button
   ================================================ */
.attachment__close {
  background: var(--color-mask-overlayxl);
  border-radius: 9999px; /* no token */
  padding: 2px; /* no token */
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 150ms ease;
}

.attachment:hover .attachment__close {
  opacity: 1;
}

.attachment__close-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px; /* no token */
  height: 14px; /* no token */
  color: var(--color-text-invert-default);
}

.attachment__close-icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

/* 关闭按钮统一绝对定位右上角 */
.attachment__close--abs {
  position: absolute;
  top: 7px; /* no token */
  right: 7px; /* no token */
}

/* ================================================
   Preview card
   ================================================ */
.attachment--preview {
  width: 64px; /* no token */
  height: 64px; /* no token */
  position: relative;
  background: var(--color-fill-surface-desktop);
}

.attachment__preview-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.attachment--preview::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--palette-black-8);
  opacity: 0;
  transition: opacity 150ms ease;
  pointer-events: none;
}

.attachment--preview:hover::after {
  opacity: 1;
}

.attachment__loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-mask-overlays);
}

/* ================================================
   Spinner
   ================================================ */
.attachment__spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px; /* no token */
  height: 24px; /* no token */
  animation: attachment-rotate 1s linear infinite;
  color: var(--color-text-tertiary);
}

.attachment__spinner :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

@keyframes attachment-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
