<template>
  <modal-dialog
    :title="$T('Image')"
    :is-opened="true"
    :dialog-body-styles="'p-0'"
    :min-height="200"
    :esc-close="true"
    :buttons="buttons"
    :use-overlay-scrollbar="false"
    :width="452"
    :height="'auto'"
    @modal-dialog-close="handleClose"
  >
    <template #outer-body>
      <div class="mx-6 mt-4">
        <fw-tab :active="activeTab" :tabs="tabs" @tab-selected="activeTab = $event">
          <template #tab-item="{ tab }">
            <div class="flex items-center gap-1">
              <fw-icon :name="tab.icon" class="h-5 w-5" />
              <span>{{ tab.name }}</span>
            </div>
          </template>
        </fw-tab>
      </div>
      <div v-if="activeTab === 'upload'" class="p-0 text-desktop-body-1" tabindex="-1">
        <div
          class="mx-6 mb-6 mt-4 box-border rounded-xl border-[3px] border-solid"
          :class="{
            'border-border-primary-light bg-mask-overlay-s-light outline-2 outline-border-primary-light dark:border-border-primary-dark dark:bg-mask-overlay-s-dark dark:outline-border-primary-dark':
              dropZoneHovering,
            'border-transparent': !dropZoneHovering,
          }"
        >
          <div
            ref="dropZone"
            class="flex min-h-[224px] flex-col items-center justify-center rounded-lg border border-border-quaternary-light bg-fill-surfaceBright-light px-6 py-8 text-transparent-dark-6 hover:bg-mask-overlay-s-light dark:border-border-quaternary-dark dark:bg-fill-surfaceBright-dark dark:text-transparent-white-6 dark:hover:bg-mask-overlay-s-dark max-h-500:min-h-[150px]"
            :class="{ 'border-dashed': !dropZoneHovering }"
            @click="handleFileSelect"
            @drop.prevent="handleDrop"
            @dragenter.prevent="handleDragEnter"
            @dragleave.prevent="handleDragLeave"
            @dragover.prevent
          >
            <img v-if="appearance === 'default'" class="mb-4 h-[120px] w-[188px]" :src="importImageLight" />
            <img v-else class="mb-4 h-[120px] w-[188px]" :src="importImageDark" />
            <div class="whitespace-pre-line text-center text-desktop-subhead-mini text-text-secondary-light dark:text-text-secondary-dark">
              {{ $T('Drag a file here or click to upload') }}
            </div>
            <div
              class="mt-2 flex items-center justify-center text-center text-desktop-caption text-text-quaternary-light dark:text-text-quaternary-dark"
            >
              {{ $T('Supports JPG, PNG, GIF, SVG, WebP · Max 10MB · Resized if over 2048px.') }}
            </div>
          </div>
        </div>
      </div>

      <div v-else class="p-0 text-desktop-body-1" tabindex="-1">
        <div class="mx-6 mb-6 mt-5">
          <fw-input v-model="imageUrl" :is-auto-focus="true" class="fw-override w-full rounded-md" :placeholder="$T('Paste the image link here…')" />
        </div>
      </div>
    </template>
  </modal-dialog>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useAppStore } from 'client/store/app-store'
import { usePromiseHook } from 'utils/vue-utils'
import ModalDialog, { type ModalDialogBottomButton } from 'client/components/new-base-modal-dialog.vue'
import importImageLight from 'client/assets/import-files/images/import-image-dialog/import-image-light.png?url'
import importImageDark from 'client/assets/import-files/images/import-image-dialog/import-image-dark.png?url'

import { ref, computed } from 'vue'
import { getFiles } from 'utils/get-files'
import { getDataTransferFiles } from 'utils/file-selector'
import { $T } from 'client/library/translation'
import { toastActions } from 'client/library/new-notifications'
import { useMindMap } from 'app/fragments/compositions/mindmap'
import { useWorkspaceStore } from 'app/services/pinia'
import { formatBytes } from 'utils/misc'
import { XMIND_DRIVE_UPLOAD_IMAGE_LIMIT_BYTE_SIZE } from 'client/constants'
import type { IconName } from 'client/components/icon/icons'

const { appearance } = storeToRefs(useAppStore())
const { resolve } = usePromiseHook()

const tabs = computed<
  Array<{
    key: string
    name: string
    icon: IconName
  }>
>(() => [
  {
    key: 'upload',
    name: $T('Upload Image'),
    icon: 'photo',
  },
  {
    key: 'embed',
    name: $T('Embed Link'),
    icon: 'code',
  },
])
const buttons = computed<ModalDialogBottomButton[]>(() => [
  {
    text: $T('Cancel'),
    onClick: handleClose,
    isDisabled: false,
    type: 'default',
  },
  {
    text: $T('Embed Image'),
    onClick: handleEmbedImage,
    isDisabled: !imageUrl.value.trim() || isProcessing.value,
    type: 'secondary',
  },
])
const activeTab = ref('upload')
const imageUrl = ref<string>('')
const isProcessing = ref(false)
const dropZoneHovering = ref<boolean>(false)
const dropZone = ref<HTMLElement | null>(null)

const handleClose = () => resolve(null)

const supportedImageTypes = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']
const imageFileTypesAccept = {
  'image/*': supportedImageTypes,
}

async function validateImageUrlWithFetch(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'cors',
    })
    const isValidStatus = response.ok
    const contentType = response.headers.get('content-type') || ''
    const isImage = contentType.startsWith('image/')

    return isValidStatus && isImage
  } catch (error) {
    logger.error('Fetch validation failed:', error)
    return false
  }
}
const handleFileSelect = async () => {
  try {
    const files = await getFiles({
      multiple: false,
      types: [
        {
          description: 'Image Files',
          accept: imageFileTypesAccept,
        },
      ],
      excludeAcceptAllOption: true,
    })

    if (files.length > 0) {
      const file = files[0]
      if (isValidImageFile(file)) {
        await handleImageUpload(file)
      } else {
        toastActions.show({ message: $T('Selected files are not supported.'), topic: 'warning' })
      }
    }
  } catch (err) {
    logger.error(err)
    if (err.name !== 'AbortError') {
      toastActions.showCommonOperationFailedToast()
    }
  }
}

const handleDragEnter = () => {
  dropZoneHovering.value = true
}

const handleDragLeave = (event: DragEvent) => {
  if (dropZone.value?.contains(event.relatedTarget as Node)) return
  dropZoneHovering.value = false
}

const handleDrop = async (event: DragEvent) => {
  dropZoneHovering.value = false

  try {
    const files = await getDataTransferFiles(event.dataTransfer)
    if (files.length > 0) {
      const file = files[0]
      if (isValidImageFile(file)) {
        await handleImageUpload(file)
      } else {
        toastActions.show({ message: $T('Selected files are not supported.'), topic: 'warning' })
      }
    }
  } catch (err) {
    logger.error(err)
    toastActions.showCommonOperationFailedToast()
  }
}

const isValidImageFile = (file: File): boolean => {
  const fileName = file.name.toLowerCase()
  return supportedImageTypes.some(type => fileName.endsWith(type))
}

const handleImageUpload = async (file: File) => {
  const editorState = useWorkspaceStore().editor
  const workbook = useWorkspaceStore().workbook

  if (!editorState || !workbook) {
    toastActions.showCommonOperationFailedToast()
    return
  }
  if (editorState.meta?.extension?.name === 'xmind-sharing' && file.size > XMIND_DRIVE_UPLOAD_IMAGE_LIMIT_BYTE_SIZE) {
    toastActions.show({
      message: $T('The image size cannot exceed $1.', formatBytes(XMIND_DRIVE_UPLOAD_IMAGE_LIMIT_BYTE_SIZE)),
      topic: 'failed',
    })
    return
  }

  const extName = file.name.split('.').pop() || ''
  const arrayBuffer = await file.arrayBuffer()

  const xapURL = await useMindMap().createXapUrlByArrayBuffer(arrayBuffer, '.' + extName)
  workbook.getAction('editor.changeImage').execute({ value: xapURL })
  resolve(true)
}

const handleEmbedImage = async () => {
  if (!imageUrl.value.trim()) return
  if (!(await validateImageUrlWithFetch(imageUrl.value.trim()))) {
    toastActions.show({
      message: $T('Please enter a valid link.'),
      topic: 'warning',
    })
    return
  }

  isProcessing.value = true

  const workbook = useWorkspaceStore().workbook
  if (!workbook) {
    toastActions.showCommonOperationFailedToast()
    return
  }
  const imageArrayBuffer = await fetch(imageUrl.value.trim()).then(res => res.arrayBuffer())
  const xapURL = await useMindMap().createXapUrlByArrayBuffer(imageArrayBuffer, '.jpg')
  workbook.getAction('editor.changeImage').execute({ value: xapURL })
  isProcessing.value = false
  resolve(true)
}
</script>
