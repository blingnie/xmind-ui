<template>
  <modal-dialog
    :is-opened="true"
    :dialog-body-styles="'!p-0'"
    :min-height="200"
    :close-button="false"
    :esc-close="true"
    :use-overlay-scrollbar="false"
    :width="452"
    :height="isShowSpaceSelector ? '540' : '478'"
    :overlay-classes="isPhoneSizeViewportWidth ? 'justify-end' : ''"
    :dialog-class="
      isPhoneSizeViewportWidth
        ? '!fixed !bottom-0 !left-0 !right-0 !w-full !max-w-full !m-0 !h-auto !rounded-t-2xl !rounded-b-none mobile-dialog'
        : ''
    "
    :dialog-header-class="isPhoneSizeViewportWidth ? '!pt-4 !pr-4' : ''"
    :dialog-body-class="isPhoneSizeViewportWidth ? '!pb-4' : ''"
    :dialog-footer-class="isPhoneSizeViewportWidth ? '!p-4' : ''"
    @modal-dialog-close="handleClose"
  >
    <template #header>
      <div class="flex w-full items-center justify-between">
        <span class="text-mobile-display-3 sm:text-desktop-headline-small">{{ $T('Import Files') }}</span>
        <space-select v-if="showSpaceSelect" :space-id="presetSpaceId" :storage-key="SPACE_UPLOAD_LOCATION_KEY" @select="selectedSpaceId = $event" />
      </div>
    </template>
    <template #outer-body>
      <div class="mx-6 mt-4">
        <fw-tab :active="activeTab" :tabs="tabs" @tab-selected="activeTab = $event">
          <template #tab-item="{ tab }">
            <div class="flex items-center gap-[4px]">
              <icon :name="tab.icon" class="h-5 w-5" />
              <span>{{ tab.name }}</span>
            </div>
          </template>
        </fw-tab>
      </div>
      <div v-if="activeTab === 'upload'" class="!p-0 text-desktop-body-1" tabindex="-1">
        <div
          class="mx-6 my-4 box-border rounded-xl border-[3px] border-solid"
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
            <img v-if="appearance === 'default'" class="mb-4 h-[120px] w-[188px]" uk-img :data-src="importFileLight" />
            <img v-else class="mb-4 h-[120px] w-[188px]" uk-img :data-src="importFileDark" />
            <div class="whitespace-pre-line text-center text-[14px] font-semibold text-text-secondary-light dark:text-text-secondary-dark">
              {{ $T('Drag a file here or click to Import') }}
            </div>
            <div
              class="mt-2 flex items-center justify-center text-center text-[11px] leading-[15px] tracking-wider text-text-quaternary-light dark:text-text-quaternary-dark"
            >
              {{ $T('Supports Xmind, Markdown, OPML, TextBundle, Word (DOCX Only), Other Mind Map format files.') }}
            </div>
          </div>
        </div>
      </div>
      <div v-else class="!p-0 text-desktop-body-1" tabindex="-1">
        <div class="mx-6 my-4">
          <fw-textarea
            ref="textareaRef"
            v-model="markdownText"
            :maxlength="MAX_CHARS"
            :theme="'dim'"
            class="min-h-[262px] w-full resize-none"
            :placeholder="
              $T(
                'Paste or type markdown text to instantly create your mind map.\n\nFor example:\n# Central Topic\n## Main Topic\n- Subtopic 1\n- Subtopic 2',
              )
            "
          />
        </div>
      </div>
    </template>

    <template #between-body-footer>
      <base-divider class="w-full" />
    </template>
    <template #footer>
      <div class="flex w-full items-center justify-end gap-2">
        <base-button
          theme="default"
          :size="isPhoneSizeViewportWidth ? 'large' : 'small'"
          :class="{ 'w-full': isPhoneSizeViewportWidth }"
          @click="handleClose"
        >
          {{ $T('Cancel') }}
        </base-button>

        <base-button
          v-if="activeTab === 'paste'"
          theme="secondary"
          :size="isPhoneSizeViewportWidth ? 'large' : 'small'"
          :class="{ 'w-full': isPhoneSizeViewportWidth }"
          :disabled="!markdownText.trim() || isProcessing"
          @click="handleCreateFromMarkdown"
        >
          {{ $T('Create') }}
        </base-button>
      </div>
    </template>
  </modal-dialog>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useAppStore } from 'client/store/app-store'
import { usePromiseHook } from 'utils/vue-utils'
import ModalDialog from 'client/components/new-base-modal-dialog.vue'
import BaseButton from 'client/components/base/button.vue'
import BaseDivider from 'client/components/base/divider.vue'
import spaceSelect from 'client/components/space-select.vue'
import Icon from 'client/components/icon/icon.vue'
import importFileLight from 'assets/import-files/images/import-file-dialog/import-file-light.png?url'
import importFileDark from 'assets/import-files/images/import-file-dialog/import-file-dark.png?url'

import { ref, watch, computed } from 'vue'
import { getFiles } from 'utils/get-files'
import { FileWithPath, getDataTransferFiles } from 'utils/file-selector'
import { $T } from 'client/library/translation'
import { toastActions } from 'client/library/new-notifications'
import { trackNewVersionWorks } from 'client/library/tracker'
import { importFileTypesAccept, computeImportFileType, compressTextbundleFile, openDocWithInject } from 'utils/import-file'
import { useWindowResize } from 'client/composables/window-resize'
import { useServiceStore } from 'app/services/pinia'
import { dataKit } from 'compositions/mindmap'
import { generateThumbnailFromDocument, exportFileBuffer } from 'client/library/workbook-next/libs/snowmonster-ext'
import { handleUploadFiles } from 'app/fragments/router-views/new-home/xmind-drive/upload-files/upload-common'
import type { FileMetadata } from 'client/server-export'
import { useTeamSpaceData } from 'app/composables/team-space-data'
import { useTracking } from 'client/composables/use-tracking'
import type { IconName } from 'client/components/icon/icons'
import { snowball } from '@xmindltd/snowmonster'

const props = defineProps<{
  teamId: string
  showSpaceSelect?: boolean
}>()

const { appearance } = storeToRefs(useAppStore())
const { isPhoneSizeViewportWidth } = useWindowResize()
const { resolve } = usePromiseHook()
const { router } = useServiceStore().services
const { joinedSpaceList, presetSpaceId } = useTeamSpaceData()
const SPACE_UPLOAD_LOCATION_KEY = `spaceUploadLocation_${props.teamId}`
const textareaRef = ref<HTMLElement>()
const tabs = computed<
  Array<{
    key: string
    name: string
    icon: IconName
  }>
>(() => [
  {
    key: 'upload',
    name: $T('Upload Files'),
    icon: 'file',
  },
  {
    key: 'paste',
    name: $T('Paste Text'),
    icon: 'text',
  },
])

const activeTab = ref('upload')
const markdownText = ref('')
const isProcessing = ref(false)
const hasShownCharLimitWarning = ref(false)
const MAX_CHARS = 30000
const dropZoneHovering = ref<boolean>(false)
const dropZone = ref<HTMLElement | null>(null)
const selectedSpaceId = ref(presetSpaceId.value)

const isShowSpaceSelector = computed(() => props.showSpaceSelect && joinedSpaceList.value.length > 1)

const handleClose = () => resolve(null)
watch(
  () => markdownText.value.length,
  newLength => {
    if (newLength < MAX_CHARS && hasShownCharLimitWarning.value) {
      hasShownCharLimitWarning.value = false
    }

    if (newLength >= MAX_CHARS) {
      toastActions.show({
        message: $T('Up to 30,000 characters allowed.'),
        topic: 'warning',
      })
    }
  },
)
const handleFileSelect = async () => {
  trackNewVersionWorks.myWorksUpload('topButton')
  try {
    const files = await getFiles({
      multiple: true,
      types: [
        {
          description: 'Supported Files',
          accept: importFileTypesAccept,
        },
      ],
      excludeAcceptAllOption: true,
    })

    if (files.length > 0) {
      if (files[0].path.endsWith('.textbundle') && files[0].size < 170) {
        return toastActions.textbundleDragOnly()
      }
      await handleFiles(files)
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
  trackNewVersionWorks.myWorksUpload('dragToMyWorks')

  try {
    const innerFiles = await getDataTransferFiles(event.dataTransfer)
    if (innerFiles.length > 0) {
      await handleFiles(innerFiles)
    } else {
      toastActions.selectedFileNotSupported()
    }
  } catch (err) {
    logger.error(err)
    toastActions.showCommonOperationFailedToast()
  }
}

const handleFiles = async (files: FileWithPath[]) => {
  const processedFiles = []
  const processedTextBundles = new Set<string>()

  for (const file of files) {
    if (file.path.includes('.textbundle')) {
      const match = file.path.match(/^(.+\.textbundle)/)
      if (match) {
        const bundleName = match[1]
        if (!processedTextBundles.has(bundleName)) {
          processedTextBundles.add(bundleName)
          const compressedFile = await compressTextbundleFile(files, bundleName)
          if (compressedFile) {
            processedFiles.push(compressedFile)
          }
        }
      }
    } else {
      const fileType = computeImportFileType(file)
      if (fileType) {
        processedFiles.push(file)
      }
    }
  }

  if (processedFiles.length > 0) {
    resolve({ files: processedFiles, selectedSpaceId: selectedSpaceId.value })
  } else {
    toastActions.selectedFilesNotSupported()
  }
}

const getFileNameFromMarkdown = (content: string): string => {
  const titleMatch = content.match(/^#{1,6}\s+(.*)$/m)
  return titleMatch ? `${titleMatch[1]}.xmind` : 'untitled.xmind'
}

const handleCreateFromMarkdown = async () => {
  if (!markdownText.value.trim()) return

  isProcessing.value = true

  const markdownContent = markdownText.value.trim()
  if (!/^#{1,6}\s+.+$/m.test(markdownContent)) {
    toastActions.show({
      message: $T('Invalid Markdown format. Please adjust and retry.'),
      topic: 'warning',
    })
    isProcessing.value = false
    return
  }
  const fileName = getFileNameFromMarkdown(markdownContent)
  resolve(null)
  processMarkdownInBackground(markdownContent, fileName)
}

const processMarkdownInBackground = async (markdownContent: string, fileName: string) => {
  try {
    const { importMarkdownV3 } = await import('@xmindltd/snowdust/lib/esm/importer/markdown_v3')
    const encoder = new TextEncoder()
    const markdownBuffer = encoder.encode(markdownContent)
    const xmindFile = await importMarkdownV3(markdownBuffer)
    const colorTheme = dataKit.getColorThemeById(snowball.NEW_FILE_DEFAULT_COLOR_THEME_ID)
    const skeletonTheme = dataKit.getSkeletonThemeById(snowball.NEW_FILE_DEFAULT_SKELETON_THEME_ID)

    const { doc } = await openDocWithInject(xmindFile, true)
    const themedDoc = dataKit.combineTheme(doc.sheets[0], {
      colorTheme,
      skeletonTheme,
    }).ownerDocument

    const thumbnail = await generateThumbnailFromDocument(themedDoc, { size: { width: 640, height: 480 } })
    const xmindFileBuffer = await exportFileBuffer(themedDoc, { thumbnail, stage: null })
    const file = new File([xmindFileBuffer], fileName, { type: 'application/xmind' })

    const result = (await new Promise(resolve => {
      handleUploadFiles({
        files: [file],
        teamId: props.teamId,
        folderId: selectedSpaceId.value || props.teamId,
        onUploadSucceed: args => resolve(args),
      })
    })) as { metadata: FileMetadata }

    if (result?.metadata?.fileId) {
      await router.gotoXmindDriveEditor({ fileId: result.metadata.fileId })
      useTracking().trackClick('editor_entered', { tab: props.teamId === useTeamSpaceData().defaultTeamId.value ? 'my_works' : 'team' })
      toastActions.show({
        message: $T('Your mind map has been successfully generated and saved.'),
        topic: 'success',
      })
    }
  } catch (err) {
    logger.error('Error creating mind map from markdown:', err)
    toastActions.showCommonOperationFailedToast()
  } finally {
    isProcessing.value = false
  }
}

watch(activeTab, async v => {
  if (v === 'paste') {
    await new Promise(resolve => setTimeout(resolve, 50))
    textareaRef.value?.focus()
  }
})
</script>
