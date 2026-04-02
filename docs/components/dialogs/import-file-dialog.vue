<template>
  <modal-dialog
    :title="$T('Import Files')"
    :is-opened="true"
    :buttons="buttons"
    :dialog-body-styles="'p-0'"
    :min-height="200"
    :close-button="isPhoneSizeViewportWidth"
    :esc-close="true"
    :use-overlay-scrollbar="false"
    :width="452"
    :height="'auto'"
    :dialog-class="[
      isPhoneSizeViewportWidth ? 'fixed bottom-0 left-0 right-0 w-full max-w-full m-0 h-auto rounded-t-2xl rounded-b-none mobile-dialog' : '',
    ]"
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

      <div v-if="activeTab === 'upload'" class="text-desktop-body-1 p-0" tabindex="-1">
        <div
          class="mx-6 mb-6 mt-4 box-border rounded-xl border-[3px] border-solid"
          :class="{
            'border-border-primary-light bg-mask-overlay-s-light outline-border-primary-light dark:border-border-primary-dark dark:bg-mask-overlay-s-dark dark:outline-border-primary-dark outline-2':
              dropZoneHovering,
            'border-transparent': !dropZoneHovering,
          }"
        >
          <div
            ref="dropZone"
            class="border-border-quaternary-light bg-fill-surfaceBright-light text-transparent-dark-6 hover:bg-mask-overlay-s-light dark:border-border-quaternary-dark dark:bg-fill-surfaceBright-dark dark:text-transparent-white-6 dark:hover:bg-mask-overlay-s-dark flex min-h-[180px] flex-col items-center justify-center rounded-lg border px-6 py-8"
            :class="{ 'border-dashed': !dropZoneHovering }"
            @click="handleFileSelect"
            @drop.prevent="handleDrop"
            @dragenter.prevent="handleDragEnter"
            @dragleave.prevent="handleDragLeave"
            @dragover.prevent
          >
            <img v-if="appearance === 'default'" class="mb-4 h-[80px] w-[120px]" :src="importFileLight" />
            <img v-else class="mb-4 h-[80px] w-[120px]" :src="importFileDark" />

            <div v-if="targetFile" class="text-center">
              <div class="text-desktop-body-large text-text-secondary-light dark:text-text-secondary-dark mb-2">
                {{ targetFile.name }}
              </div>
            </div>
            <template v-else>
              <div class="text-desktop-subhead-mini text-text-secondary-light dark:text-text-secondary-dark whitespace-pre-line text-center">
                {{ $T('Drag a file here or click to Import') }}
              </div>
              <div
                class="text-desktop-caption text-text-quaternary-light dark:text-text-quaternary-dark mt-2 flex items-center justify-center text-center"
              >
                {{ $T('Supported Format: Xmind, Markdown, OPML, TextBundle, Word (DOCX Only), Other Mind Map Format') }}
              </div>
            </template>
          </div>
        </div>
      </div>

      <div v-else class="text-desktop-body-1 p-0" tabindex="-1">
        <div class="mx-6 mb-6 mt-5">
          <fw-textarea
            v-model="markdownText"
            :maxlength="MAX_CHARS"
            :theme="'dim'"
            class="min-h-[180px] w-full resize-none"
            :placeholder="
              $T(
                'Paste or type markdown text to instantly create your mind map.\n\nFor example:\n# Central Topic\n## Main Topic\n- Subtopic 1\n- Subtopic 2',
              )
            "
          />
        </div>
      </div>

      <div class="mx-6 mb-4">
        <div class="mb-4 flex items-center gap-4">
          <label class="text-desktop-body-2 text-text-primary-light dark:text-text-primary-dark whitespace-nowrap">
            {{ $T('Import Location:') }}
          </label>
          <fw-select
            class="flex-1"
            :button-width="isPhoneSizeViewportWidth ? 260 : selectWidth"
            :menu-custom-class="'w-auto'"
            :selected-key="currentOption"
            :options="importOptions"
            @select="key => (currentOption = key as ImportOption)"
          />
        </div>
      </div>
    </template>
  </modal-dialog>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useAppStore } from 'client/store/app-store'
import ModalDialog, { type ModalDialogBottomButton } from 'client/components/new-base-modal-dialog.vue'
import importFileLight from 'assets/import-files/images/import-file-dialog/import-file-light.png?url'
import importFileDark from 'assets/import-files/images/import-file-dialog/import-file-dark.png?url'

import { usePromiseHook } from 'utils/vue-utils'
import { computed, ref, watch } from 'vue'
import { getFiles } from 'utils/get-files'
import { getDataTransferFiles } from 'utils/file-selector'
import { $T } from 'client/library/translation'
import { ImportFiles, ImportFileType, simplePath, compressTextbundleFile, importFileTypesAccept, computeImportFileType } from 'utils/import-file'
import { toastActions } from 'client/library/new-notifications'
import { getStringSizeUtf8 } from 'utils/string'
import { trackNewVersionWorks } from 'client/library/tracker'
import { MAXIMUMS_SINGLE_MAP_CONTENT_FILE_SIZE, FREE_PLAN_SHEETS_LIMIT } from 'client/constants'
import { useTeamSpaceData } from 'app/composables/team-space-data'
import { useWindowResize } from 'client/composables/window-resize'
import type { IconName } from 'client/components/icon/icons'
const props = defineProps<{
  teamId?: string
}>()

const { isPhoneSizeViewportWidth } = useWindowResize()
const { appearance } = storeToRefs(useAppStore())
const { resolve } = usePromiseHook()
const targetFile = ref<File | null>(null)
const targetFileType = ref<ImportFileType | null>(null)
const dropZoneHovering = ref<boolean>(false)
const dropZone = ref<HTMLElement | null>(null)
const markdownText = ref('')
const MAX_CHARS = 30000
const hasShownCharLimitWarning = ref(false)
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

const canCreateNewMap = computed(() => {
  if (!props.teamId) return true
  return useTeamSpaceData().checkIsTeamAllowToEnter(props.teamId)
})

const importOptions = computed(() => {
  const options = [
    {
      key: 'map',
      label: $T('Create a new map'),
    },
    {
      key: 'sheet',
      label: $T('Import a new sheet in current map'),
    },
  ]
  if (!canCreateNewMap.value) {
    return options.filter(option => option.key !== 'map')
  }
  return options
})

const buttons = computed<ModalDialogBottomButton[]>(() => [
  {
    text: $T('Cancel'),
    onClick: handleClose,
    isDisabled: false,
    type: 'default',
  },
  {
    text: activeTab.value === 'paste' ? $T('Create') : $T('Import'),
    onClick: handleImport,
    isDisabled: !canImport.value,
    type: 'secondary',
  },
])
type ImportOption = 'map' | 'sheet'
const currentOption = ref<ImportOption>(canCreateNewMap.value ? 'map' : 'sheet')

const canImport = computed(() => {
  if (activeTab.value === 'upload') {
    return targetFile.value !== null && targetFileType.value !== null
  } else {
    return markdownText.value.trim().length > 0
  }
})

const { currentLanguage } = storeToRefs(useAppStore())
const selectWidth = computed(() => {
  switch (currentLanguage.value) {
    case 'de':
      return 320
    case 'ja-JP':
      return 270
    case 'vi':
      return 300
    case 'fr':
    case 'en-US':
    default:
      return 248
  }
})

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

const handleClose = () => resolve(null)

const handleFileSelect = async () => {
  trackNewVersionWorks.importPop('ClickToImport')
  try {
    const files = await getFiles({ types: [{ accept: importFileTypesAccept }], excludeAcceptAllOption: true })
    setFile(files[0])
  } catch (err) {
    logger.error(err)
    if (err.name !== 'AbortError') {
      toastActions.importFileFailed()
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
  trackNewVersionWorks.importPop('DragFile')

  const items = Array.from(event.dataTransfer?.items || [])
  const files = items.map(item => item.getAsFile())

  if (files.length === 0) return

  let file = files[0]
  if (simplePath.extname(file.name) === '.textbundle') {
    const innerFiles = await getDataTransferFiles(event.dataTransfer)
    file = await compressTextbundleFile(innerFiles, file.name)
  }
  setFile(file)
}

const setFile = (file: File | null) => {
  const type = file ? computeImportFileType(file) : null
  if (file === null || !type) {
    toastActions.selectedFileNotSupported()
  } else {
    targetFile.value = file
    targetFileType.value = type
  }
}

const handleImport = async () => {
  if (activeTab.value === 'paste') {
    await handleCreateFromMarkdown()
  } else {
    await handleImportFile()
  }
}

const handleImportFile = async () => {
  if (!targetFile.value || !targetFileType.value) return

  trackNewVersionWorks.importPop('Import')
  const suffix = simplePath.extname(targetFile.value.name)
  const basename = simplePath.basename(targetFile.value.name, suffix)
  const importFile = ImportFiles[targetFileType.value]
  try {
    const document = await importFile(targetFile.value)

    if (getStringSizeUtf8(JSON.stringify(document.doc)) > MAXIMUMS_SINGLE_MAP_CONTENT_FILE_SIZE) {
      toastActions.importFileContentExceedsLimit()
      handleClose()
      return
    }

    if (props.teamId && !(await useTeamSpaceData().checkIsTeamHasAnyPlan(props.teamId)) && document.doc.sheets.length > FREE_PLAN_SHEETS_LIMIT) {
      toastActions.fileImportSheetExceedsLimit()
      handleClose()
      return
    }

    resolve({ document, filename: basename, importOption: currentOption.value })
  } catch (err) {
    logger.error(err)
    toastActions.importFileFailed()
    handleClose()
  }
}

const handleCreateFromMarkdown = async () => {
  const markdownContent = markdownText.value.trim()
  if (!markdownContent) return

  if (!/^#{1,6}\s+.+$/m.test(markdownContent)) {
    toastActions.show({
      message: $T('Invalid Markdown format. Please adjust and retry.'),
      topic: 'warning',
    })
    return
  }

  try {
    const { importMarkdownV3 } = await import('@xmindltd/snowdust/lib/esm/importer/markdown_v3')
    const encoder = new TextEncoder()
    const markdownBuffer = encoder.encode(markdownContent)
    const xmindFile = await importMarkdownV3(markdownBuffer)

    const { openDocWithInject } = await import('utils/import-file')
    const { doc } = await openDocWithInject(xmindFile, true)

    const document = { doc, xapResources: {} }
    const titleMatch = markdownContent.match(/^#{1,6}\s+(.*)$/m)
    const filename = titleMatch ? titleMatch[1] : 'untitled'

    if (getStringSizeUtf8(JSON.stringify(document.doc)) > MAXIMUMS_SINGLE_MAP_CONTENT_FILE_SIZE) {
      toastActions.importFileContentExceedsLimit()
      handleClose()
    } else {
      resolve({ document, filename, importOption: currentOption.value })
    }
  } catch (err) {
    logger.error('Error creating mind map from markdown:', err)
    toastActions.show({
      message: $T('Conversion failed, please retry or change another Markdown file.'),
      topic: 'warning',
    })
  }
}
// Trigger file select immediately in touch device.
if (isPhoneSizeViewportWidth.value) {
  handleFileSelect()
}
</script>
