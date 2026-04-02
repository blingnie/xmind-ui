<template>
  <div class="cursor-pointer" :class="[model.type === 'uploaded' ? 'min-w-0 max-w-[184px]' : '']">
    <fw-tooltip :content-style="{ 'max-width': '200px', 'white-space': 'normal' }">
      <template #trigger>
        <button
          v-if="model.type === 'ready' || model.type === 'disabled'"
          :disabled="model.type === 'disabled'"
          class="border-transparent-dark-3 bg-transparent-dark-1 text-icon-secondary-light hover:bg-transparent-dark-2 active:bg-transparent-dark-3 disabled:text-icon-quaternary-light dark:border-transparent-white-3 dark:bg-transparent-white-1 dark:text-icon-primary-dark dark:hover:bg-transparent-white-2 dark:active:bg-transparent-white-3 dark:active:text-icon-primary-dark dark:disabled:text-icon-quaternary-dark rounded-md border border-solid px-2 py-[7px] sm:py-[5px]"
          @click="handleFileSelect"
        >
          <div class="h-5 w-5">
            <fw-icon :name="'attachment'" :width="20" :height="20" />
          </div>
        </button>
        <div
          v-else-if="model.type === 'uploading'"
          class="border-border-translucent-light bg-mask-overlay-s-light dark:border-transparent-white-3 dark:bg-transparent-white-1 relative flex h-9 w-[100px] flex-row items-center justify-center rounded-md border border-solid sm:h-8"
        >
          <!-- progress bar -->
          <div
            class="bg-ai-purple-200 absolute left-0 top-0 h-full transition-all duration-300 ease-out dark:bg-[#ac7af84d]"
            :style="{ width: model.percent + '%', 'border-radius': model.percent === 100 ? '4px' : '4px 0 0 4px' }"
          />
          <span class="font-NeverMind-UI text-mobile-body-large text-text-primary-light dark:text-text-tertiary-dark sm:text-desktop-body-large z-10"
            >{{ model.percent }}%</span
          >
          <div class="absolute right-2 z-10">
            <button class="text-icon-primary-light dark:text-icon-primary-dark h-full py-2" @click="handleCancelUpload">
              <fw-icon :name="'close'" :width="12" :height="12" />
            </button>
          </div>
        </div>
        <div
          v-else-if="model.type === 'uploaded'"
          class="border-border-translucent-light bg-mask-overlay-s-light relative inline-flex h-9 w-full flex-row items-center justify-start rounded-md border border-solid sm:h-8"
        >
          <fw-icon
            :name="isUploadedImage ? 'photo' : 'doc'"
            width="20"
            height="20"
            class="text-text-secondary-light dark:text-icon-secondary-dark ml-2 mr-1"
          />
          <span
            ref="fileNameElement"
            class="font-NeverMind-UI text-mobile-body-large text-text-secondary-light dark:text-icon-secondary-dark sm:text-desktop-body-large flex-1 truncate"
          >
            {{ model.fileName }}
          </span>
          <button class="text-icon-primary-light dark:text-icon-primary-dark h-full px-2" @click="handleFileRemove">
            <fw-icon :name="'close'" :width="12" :height="12" />
          </button>
        </div>
      </template>
      <template #tooltip>
        <div>{{ $T('Supports PDF, Word, PowerPoint, Text, Markdown, JPG, JPEG, PNG, up to 50MB in size.') }}</div>
      </template>
    </fw-tooltip>
  </div>
</template>
<script lang="ts" setup>
import { getFiles } from 'utils/get-files'
import { computeCopilotImportFileMimeType, copilotImportFileMimeTypes, isImageMimeType } from './copilot-import-file'
import { toastActions } from 'client/library/new-notifications'
import { COPILOT_UPLOADED_FILE_SIZE_LIMIT } from 'client/server-export'
import { useCloudKitClient } from 'app/composables/cloud-kit-client'
import { CreateFileExceedFilesLimitError } from 'client/library/cloud-kit/client/create-file'
import { FileParseError, ParsedTextTooLargeError } from 'client/library/cloud-kit'
import { useServiceStore } from 'client/store'
import { $T } from 'client/library/translation'
import { ProgressSimulator } from 'client/pages/app/fragments/shared/progress-simulator'
import { RequestCanceledError } from 'client/errors'
import { computed, ref } from 'vue'

interface FileUploadingStatus {
  type: 'uploading'
  percent: number
}

interface FileUploadedStatus {
  type: 'uploaded'
  fileName: string
  fileContent: string
  file: File
  fileMimeType: string
  fileId?: string
}

export type FileUploadStatus =
  | {
      type: 'ready' | 'disabled'
    }
  | FileUploadingStatus
  | FileUploadedStatus

const model = defineModel<FileUploadStatus>()

const isUploadedImage = computed(() => model.value?.type === 'uploaded' && isImageMimeType(model.value.fileMimeType))

const handleFileSelect = async () => {
  try {
    const files = await getFiles({ types: [{ accept: copilotImportFileMimeTypes }], excludeAcceptAllOption: true })
    if (files.length === 0) return
    const file = files[0]
    if (!file) return
    uploadFile({ file })
  } catch (err) {
    logger.error(err)
    if (err.name !== 'AbortError') toastActions.importFileFailed()
  }
}

let progressSimulator: ProgressSimulator | null = null
let uploadAbortController: AbortController | null = null

const uploadFile = async ({ file }: { file: File }) => {
  const mimetype = file ? computeCopilotImportFileMimeType(file) : null
  if (file === null || !mimetype) {
    toastActions.fileFormatNotSupported()
    return
  } else if (file.size > COPILOT_UPLOADED_FILE_SIZE_LIMIT) {
    toastActions.copilotUploadedFileExceedsLimit()
    return
  }

  model.value = {
    type: 'uploading',
    percent: 0,
  }

  try {
    uploadAbortController = new AbortController()
    progressSimulator = new ProgressSimulator(percent => {
      model.value = {
        type: 'uploading',
        percent,
      }
    })

    const [uploadedFile] = await Promise.all([
      useCloudKitClient().readFile({
        mimetype,
        file,
        signal: uploadAbortController.signal,
      }),
      progressSimulator.start(),
    ])

    // Ensure the progress bar reaches 100% before finalizing the upload.
    model.value = {
      type: 'uploading',
      percent: 100,
    }

    // Wait for a short duration to allow the UI to show the 100% progress.
    await new Promise(resolve => setTimeout(resolve, 300))

    const fileContent = uploadedFile.content || ''

    model.value = {
      type: 'uploaded',
      fileName: file.name,
      fileContent,
      file,
      fileMimeType: mimetype,
      fileId: uploadedFile.fileId,
    }
  } catch (err) {
    logger.error('Failed to read file:', err)

    progressSimulator && progressSimulator.cancel()

    model.value = {
      type: 'ready',
    }

    if (err instanceof CreateFileExceedFilesLimitError) {
      toastActions.copilotUploadedFileExceedsLimit()
    } else if (err instanceof ParsedTextTooLargeError) {
      if (
        !(await useServiceStore().services.action.dialog.confirm({
          title: $T('Attachment content exceeds the limit'),
          width: 538,
          height: 'auto',
          description: $T('The file content exceeds the processing limit. Please simplify or split it and try again.'),
          confirmButtonText: $T('Back'),
          confirmButtonType: 'primary',
          hiddenCancel: true,
        }))
      ) {
        return
      }
    } else if (err instanceof FileParseError) {
      if (
        !(await useServiceStore().services.action.dialog.confirm({
          title: $T('Parsing failed'),
          width: 538,
          height: 'auto',
          description: $T('The current file does not contain any usable text. Please verify that the file is correct.'),
          confirmButtonText: $T('Back'),
          confirmButtonType: 'primary',
          hiddenCancel: true,
        }))
      ) {
        return
      }
    } else {
      if (!(err instanceof RequestCanceledError)) {
        toastActions.aiServerNetworkFailed()
      }
    }
  }
}

const handleCancelUpload = () => {
  if (progressSimulator) {
    progressSimulator.cancel()
    progressSimulator = null
  }

  if (uploadAbortController) {
    uploadAbortController.abort()
    uploadAbortController = null
  }

  model.value = {
    type: 'ready',
  }
}

const handleFileRemove = () => {
  model.value = {
    type: 'ready',
  }
}

const fileNameElement = ref<HTMLElement>()

defineExpose({
  fileNameElement,
  uploadFile,
})
</script>
