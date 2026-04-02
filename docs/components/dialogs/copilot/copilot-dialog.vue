<template>
  <modal-dialog
    ref="modalDialogRef"
    class="copilot-dialog"
    :is-opened="isOpened"
    :width="700"
    @modal-dialog-close="handleClose"
    :dialog-class="'!bg-ai-background-light dark:!bg-ai-background-dark'"
    :dialog-body-class="'sm:pt-4'"
    :dialog-footer-class="'hidden'"
    :modal-classes="isPhoneSizeViewportWidth ? '!overflow-hidden rounded-b-none rounded-t-3xl' : '!overflow-hidden rounded-xl'"
  >
    <template #header-title>
      <div class="flex w-full justify-between">
        <span class="pointer-events-none truncate">{{ $T('Create with AI') }}</span>
        <space-select v-model="selectedSpaceId" :team-id="teamId" :is-disable="!!spaceId" />
      </div>
    </template>

    <div class="relative flex h-full flex-col">
      <div
        :class="[
          'bg-transparent-dark-1 mt-6 flex flex-col gap-8 rounded-xl border border-solid px-4 pb-4 pt-3 sm:mt-0',
          isInputTextareaFocused ? 'border-ai-purple-400' : 'border-transparent-dark-3 dark:border-transparent-white-1',
        ]"
      >
        <div class="h-[100px] w-full sm:h-[128px]">
          <fw-textarea
            ref="inputTextareaRef"
            v-model="inputText"
            :placeholder="inputTextPlaceholder"
            :maxlength="XAI_INPUT_MAX_CHARACTERS"
            class="!text-mobile-body-large placeholder:font-NeverMind-UI placeholder:text-mobile-body-medium placeholder:text-transparent-dark-7 dark:placeholder:text-transparent-white-7 sm:!text-desktop-body-large sm:placeholder:!text-desktop-body-large h-full border-none !bg-transparent !p-0"
            @focus="isInputTextareaFocused = true"
            @blur="isInputTextareaFocused = false"
          />
        </div>
        <div ref="menusContainerRef" class="flex w-full flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div class="flex" :class="leftMenusContainerClasses" ref="leftMenusContainerRef">
            <div class="flex flex-row gap-3 sm:min-w-0 sm:shrink">
              <file-upload-button v-model="fileUploadStatus" ref="fileUploadButtonRef" />
              <thinking-button
                v-model="isEnableThinking"
                ref="thinkingButtonRef"
                v-if="fileUploadButtonDisplayMode === 'default' || fileUploadButtonDisplayMode === 'singleline-with-thinking-btn'"
              />
            </div>

            <div class="flex flex-col gap-3 sm:flex-row">
              <thinking-button
                v-model="isEnableThinking"
                ref="thinkingButtonRef"
                v-if="!(fileUploadButtonDisplayMode === 'default' || fileUploadButtonDisplayMode === 'singleline-with-thinking-btn')"
              />
              <task-select v-model="selectedTask" ref="taskSelectElRef" />
            </div>
          </div>

          <div ref="settingsMenuRef">
            <settings-menu v-model="settingMenuModelValue" />
          </div>
        </div>
      </div>

      <div class="flex flex-col items-center gap-3 pt-6 sm:pt-8">
        <fw-button class="w-full gap-2 sm:w-[200px]" :size="'large'" :theme="'ai'" :disabled="!isGenerateButtonEnabled" @click="handleGenerate">
          <fw-icon name="xmind-ai" />
          <span>{{ $T('Generate') }}</span>
        </fw-button>

        <span class="font-NeverMind-UI text-desktop-caption-header text-text-quaternary-light dark:text-text-quaternary-dark">
          {{ $T('AI-Powered Feature, for Reference Only.') }}
        </span>
      </div>
    </div>

    <Teleport v-if="dropZoneHovering && modalDialogEntityEl" :to="modalDialogEntityEl">
      <file-drag-area />
    </Teleport>
  </modal-dialog>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, useTemplateRef } from 'vue'
import ModalDialog from '../../new-base-modal-dialog.vue'
import { usePromiseHook } from 'utils/vue-utils'
import { $T } from 'client/library/translation'
import { localStore } from 'utils/browserStorage'
import { useLottieAnimation } from 'app/composables/lottie-animation'
import FileUploadButton, { FileUploadStatus } from './file-upload-button.vue'
import FileDragArea from './file-drag-area.vue'
import ThinkingButton from './thinking-button.vue'
import TaskSelect from './task-select.vue'
import SettingsMenu, { type SettingsMenuModel } from './settings-menu.vue'
import SpaceSelect from './space-select.vue'
import { CopilotLanguageOption } from './copilot-language'
import type { CopilotDialogStatesSnapshot, TaskOption } from './copilot-states'
import { checkTeamCreditsBeforeCopilot, handleTeamIsOutOfCredits } from './team-credits-check'
import { REGION } from 'client/constants'
import { XAI_INPUT_MAX_CHARACTERS } from 'client/server-export'
import { useWindowResize } from 'client/composables/window-resize'
import { useElementSize, useEventListener } from '@vueuse/core'
import { measureText } from 'utils/text-measure'
import { toastActions } from 'client/library/new-notifications'

const COPILOT_LANGUAGE_KEY = 'copilotLanguage'

const props = defineProps<{
  teamId: string
  spaceId?: string | null
  initialSnapshot?: CopilotDialogStatesSnapshot
}>()

const { resolve } = usePromiseHook()

useLottieAnimation({
  containerParentSelector: '.copilot-dialog .modal-dialog__background',
  dataFilePathLoader: {
    light: async () => (await import('import-files/json/copilot-dialog-background-light.json?url')).default,
    dark: async () => (await import('import-files/json/copilot-dialog-background-dark.json?url')).default,
  },
  options: {
    renderer: 'canvas',
    containerStyleClass: 'dark:shadow-ai-background-lottie-animation-dark',
    animationStyleClass: 'filter blur opacity-40',
  },
})

const isOpened = ref<boolean>(true)

const handleClose = () => {
  resolve(null)
}

const isSupportYtb = computed(() => REGION === 'global')

const inputText = ref(props.initialSnapshot?.inputText ?? '')

const inputTextPlaceholder = computed(() => {
  if (selectedTask.value === 'todo') {
    return $T('Enter a task or goal to generate a to-do list.')
  }

  if (selectedTask.value === 'project-plan') {
    return $T('Enter a detailed description of your project, including goals and deadline.')
  }

  return isSupportYtb.value
    ? $T('Turn anything into mind map: ideas, long text, files, links, YouTube URLs.')
    : $T('Turn anything into mind map: ideas, long text, files, links.')
})

const fileUploadStatus = ref<FileUploadStatus>(
  props.initialSnapshot?.fileContent || props.initialSnapshot?.fileId
    ? {
        type: 'uploaded',
        fileName: props.initialSnapshot.fileName,
        fileContent: props.initialSnapshot.fileContent,
        file: props.initialSnapshot.file,
        fileMimeType: props.initialSnapshot.fileMimeType,
        fileId: props.initialSnapshot.fileId,
      }
    : { type: 'ready' },
)

const isEnableThinking = ref<boolean>(props.initialSnapshot?.isEnableThinking ?? false)
const selectedTask = ref<TaskOption | null>(props.initialSnapshot?.task ?? null)
const selectedSpaceId = ref<string | null>(props.initialSnapshot?.spaceId ?? null)
const isInputTextareaFocused = ref<boolean>(false)
const inputTextareaRef = useTemplateRef('inputTextareaRef')

// Restore the previously selected language if available
const initialSelectedLanguageKey: CopilotLanguageOption['key'] = (localStore.get(COPILOT_LANGUAGE_KEY) as CopilotLanguageOption['key']) ?? 'auto'

const settingMenuModelValue = ref<SettingsMenuModel>({
  language: props.initialSnapshot?.language ?? initialSelectedLanguageKey,
  skeletonGroupId: props.initialSnapshot?.skeletonGroupId ?? 'Auto',
})

const selectedLanguageOptionKey = computed<CopilotLanguageOption['key']>(() => settingMenuModelValue.value.language)
const selectedSkeletonGroupId = computed(() => settingMenuModelValue.value.skeletonGroupId)

const isGenerateButtonEnabled = computed(() => {
  if (fileUploadStatus.value.type === 'uploading') return false
  return inputText.value?.trim() || fileUploadStatus.value.type === 'uploaded'
})

onMounted(async () => {
  await new Promise(resolve => setTimeout(resolve, 100))
  inputTextareaRef.value?.focus()
})

const handleGenerate = async () => {
  // Save the selected language to local storage
  localStore.set(COPILOT_LANGUAGE_KEY, selectedLanguageOptionKey.value)
  const statesSnapshot: CopilotDialogStatesSnapshot = {
    inputText: inputText.value,
    fileName: fileUploadStatus.value.type === 'uploaded' ? fileUploadStatus.value.fileName : null,
    fileContent: fileUploadStatus.value.type === 'uploaded' ? fileUploadStatus.value.fileContent : null,
    file: fileUploadStatus.value.type === 'uploaded' ? fileUploadStatus.value.file : null,
    fileMimeType: fileUploadStatus.value.type === 'uploaded' ? fileUploadStatus.value.fileMimeType : null,
    fileId: fileUploadStatus.value.type === 'uploaded' ? fileUploadStatus.value.fileId || null : null,
    isEnableThinking: isEnableThinking.value,
    task: selectedTask.value,
    language: selectedLanguageOptionKey.value,
    skeletonGroupId: selectedSkeletonGroupId.value,
    spaceId: selectedSpaceId.value,
  }

  logger.debug('Copilot dialog states snapshot:', statesSnapshot)

  const isAllow = await checkTeamCreditsBeforeCopilot({ teamId: props.teamId })
  if (!isAllow) {
    handleTeamIsOutOfCredits({ teamId: props.teamId })
    return
  } else {
    resolve(statesSnapshot)
  }
}

const modalDialogRef = ref<InstanceType<typeof ModalDialog> | null>(null)
const modalDialogEntityEl = computed(() => modalDialogRef.value?.dialogEntity ?? null)

const fileUploadButtonRef = ref<InstanceType<typeof FileUploadButton>>()
const menusContainerRef = ref<HTMLElement>()
const leftMenusContainerRef = ref<HTMLElement>()
const thinkingButtonRef = ref<HTMLElement>()
const taskSelectElRef = ref<HTMLElement>()
const settingsMenuRef = ref<HTMLElement>()
const { width: menusContainerWidth } = useElementSize(menusContainerRef)
const { width: taskSelectElWidth } = useElementSize(taskSelectElRef)
const { width: settingsMenuWidth } = useElementSize(settingsMenuRef)

const { isPhoneSizeViewportWidth } = useWindowResize()

const estimatedThinkingButtonWidth = computed(() => {
  const thinkingButtonTextWidth = measureText($T('Thinking'), isPhoneSizeViewportWidth.value ? 17 : 14).width
  // Thinking button has padding 16px (left + right) + icon width 20px + gap 4px + text width (for "Thinking")
  return 8 * 2 + 20 + 4 + thinkingButtonTextWidth
})

const remainInlineFileUploadButtonWidth = computed(() => {
  if (isPhoneSizeViewportWidth.value) {
    return menusContainerWidth.value - estimatedThinkingButtonWidth.value - 12
  } else {
    return (
      menusContainerWidth.value - estimatedThinkingButtonWidth.value - (taskSelectElWidth.value || 0) - (settingsMenuWidth.value || 0) - 12 * 2 - 16
    )
  }
})

const isFilenameTextTruncated = computed(() => {
  const el = fileUploadButtonRef.value?.fileNameElement
  if (!el) return false

  return el.scrollWidth > el.clientWidth
})

const fileUploadButtonDisplayMode = computed<'default' | 'singleline' | 'singleline-with-thinking-btn'>(() => {
  if (isPhoneSizeViewportWidth.value) {
    return isFilenameTextTruncated.value ? 'singleline' : 'singleline-with-thinking-btn'
  } else {
    if (remainInlineFileUploadButtonWidth.value && remainInlineFileUploadButtonWidth.value < 120) {
      return isFilenameTextTruncated.value ? 'singleline' : 'singleline-with-thinking-btn'
    } else {
      return 'default'
    }
  }
})

const leftMenusContainerClasses = computed(() => {
  if (isPhoneSizeViewportWidth.value) {
    return 'flex-col gap-3'
  } else {
    if (fileUploadButtonDisplayMode.value === 'default') {
      return 'flex-row gap-3 shrink min-w-0 mr-4'
    } else {
      return 'flex-col gap-3'
    }
  }
})

const dropZoneHovering = ref<boolean>(false)

const handleDragEnter = (e: Event) => {
  e.preventDefault()
  if (fileUploadStatus.value.type === 'uploading' || fileUploadStatus.value.type === 'disabled') return
  dropZoneHovering.value = true
}

const handleDragLeave = (e: Event) => {
  e.preventDefault()
  const currentTarget = e.currentTarget as HTMLElement | null
  const relatedTarget = (e as DragEvent).relatedTarget as Node | null
  if (currentTarget && relatedTarget && currentTarget.contains(relatedTarget)) {
    return
  }
  dropZoneHovering.value = false
}

const preventDefaultHandler = (e: Event) => e.preventDefault()

const handleDrop = async (e: Event) => {
  e.preventDefault()
  dropZoneHovering.value = false

  if (fileUploadStatus.value.type === 'uploading' || fileUploadStatus.value.type === 'disabled') return
  if (fileUploadStatus.value.type === 'uploaded') {
    toastActions.copilotUploadSingleFileOnly()
    return
  }

  const event = e as DragEvent
  const items = Array.from(event.dataTransfer?.items || [])
  const files = items.map(item => item.getAsFile())

  if (files.length === 0) return

  if (files.length > 1) {
    toastActions.copilotUploadSingleFileOnly()
  }

  const file = files[0]
  await fileUploadButtonRef.value?.uploadFile({ file })
}

useEventListener(modalDialogEntityEl, 'dragenter', handleDragEnter)
useEventListener(modalDialogEntityEl, 'dragleave', handleDragLeave)
useEventListener(modalDialogEntityEl, 'dragover', preventDefaultHandler)
useEventListener(modalDialogEntityEl, 'drop', handleDrop)
</script>
