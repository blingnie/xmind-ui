<template>
  <modal-dialog
    class="template-rewrite-dialog"
    :is-opened="true"
    :width="700"
    :title="$T('Create with AI')"
    @modal-dialog-close="handleClose"
    :dialog-class="'!bg-ai-background-light dark:!bg-ai-background-dark'"
    :dialog-footer-class="'hidden'"
    :dialog-overlay-class="isTransparentOverlay ? 'opacity-0' : ''"
  >
    <template #header-title>
      <div class="flex w-full justify-between">
        <span class="pointer-events-none truncate">{{ $T('Create with AI') }}</span>
        <space-select v-model="selectedSpaceId" :team-id="teamId" />
      </div>
    </template>
    <div class="relative flex h-full flex-col">
      <div v-if="templatePreviewUrl" class="relative mt-[8px] flex w-full justify-center py-[10px] sm:mt-0 sm:py-6">
        <img
          :src="backgroundPatternUrl"
          class="pointer-events-none absolute left-0 top-0 h-full w-full object-cover opacity-60"
          alt="Background pattern"
        />
        <div class="template-image-shell rounded-[10px] sm:rounded-[20px]">
          <img
            :src="templatePreviewUrl"
            class="template-image-wrapper h-[120px] w-[200px] rounded-lg object-cover sm:h-[180px] sm:w-[300px] sm:rounded-2xl"
            alt="app.xmind.com"
          />
          <div
            class="absolute right-3 top-3 z-10 flex size-6 cursor-pointer items-center justify-center rounded-full bg-fill-secondary-light shadow-elevation-l1-light"
            @click.stop="handleClose"
          >
            <fw-icon name="retry" class="text-icon-invert-light" :width="16" :height="16" />
          </div>
        </div>
      </div>

      <div
        :class="[
          'mt-6 flex flex-col gap-4 rounded-xl border border-solid bg-transparent-dark-1 px-4 pb-4 pt-3 sm:mt-4 sm:gap-2',
          isInputTextareaFocused ? 'border-ai-purple-400' : 'border-transparent-dark-3 dark:border-transparent-white-1',
        ]"
      >
        <div class="h-[150px] w-full sm:h-[110px]">
          <fw-textarea
            ref="inputTextareaRef"
            v-model="inputTextContent"
            :placeholder="inputPlaceholder"
            :maxlength="XAI_INPUT_MAX_CHARACTERS"
            class="max-w-sm:no-scrollbar h-full border-none !bg-transparent p-0 !text-mobile-body-large !text-text-primary-light placeholder:text-text-tertiary-light dark:!text-text-primary-dark dark:placeholder:text-text-tertiary-dark sm:!text-desktop-body-large"
            @focus="isInputTextareaFocused = true"
            @blur="isInputTextareaFocused = false"
            @keydown.enter.exact="handleSubmit"
          />
        </div>

        <div class="flex justify-start sm:justify-end">
          <settings-menu v-model="settingMenuModelValue" :menu-keys="['language']" />
        </div>
      </div>

      <p v-if="errorMessage" class="bg-status-error/10 text-status-error mt-3 w-full rounded px-3 py-2 text-desktop-caption-1">
        {{ errorMessage }}
      </p>

      <div class="flex flex-col items-center gap-3 pt-6 sm:pt-8">
        <fw-button
          class="w-full gap-2 sm:w-[200px]"
          :size="'large'"
          :theme="'ai'"
          :disabled="isSubmitDisabled"
          :is-loading="isSubmitting"
          @click="handleSubmit"
        >
          <fw-icon name="xmind-ai" />
          <span>{{ $T('Generate') }}</span>
        </fw-button>

        <span class="font-NeverMind-UI text-desktop-caption-header text-text-quaternary-light dark:text-text-quaternary-dark">
          {{ $T('AI-Powered Feature, for Reference Only.') }}
        </span>
      </div>
    </div>
  </modal-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import ModalDialog from 'client/components/new-base-modal-dialog.vue'
import { $T } from 'client/library/translation'
import { useLottieAnimation } from 'app/composables/lottie-animation'
import backgroundPatternUrl from 'client/assets/import-files/images/template-preview-background.png?url'
import spaceSelect from '../copilot/space-select.vue'
import SettingsMenu, { type SettingsMenuModel } from '../copilot/settings-menu.vue'
import { XAI_INPUT_MAX_CHARACTERS } from 'client/server-export'

import { usePromiseHook } from 'utils/vue-utils'
import type { TemplateItem } from 'client/library/templates'
import debounce from 'utils/debounce'
import { useTemplateAiHistory } from './use-template-ai-history'

const { resolve } = usePromiseHook()
const { getPromptHistory, setPromptHistory, getLanguageHistory, setLanguageHistory } = useTemplateAiHistory()

const props = defineProps<{
  templateItem: TemplateItem | null
  isTransparentOverlay?: boolean
  initialSpaceId?: string
  teamId: string | null
}>()

const selectedSpaceId = ref<string | null>(props.initialSpaceId ?? null)
const settingMenuModelValue = ref<SettingsMenuModel>({
  language: getLanguageHistory(),
  skeletonGroupId: null,
})

const templatePreviewUrl = computed(() => props.templateItem?.thumbnail || '')

useLottieAnimation({
  containerParentSelector: '.template-rewrite-dialog .modal-dialog__background',
  dataFilePathLoader: {
    light: async () => (await import('import-files/json/copilot-dialog-background-light.json?url')).default,
    dark: async () => (await import('import-files/json/copilot-dialog-background-dark.json?url')).default,
  },
  options: {
    renderer: 'canvas',
    containerStyleClass: 'dark:shadow-ai-background-lottie-animation-dark pointer-events-none',
    animationStyleClass: 'filter blur opacity-40',
  },
})

const inputTextContent = ref(getPromptHistory())
const isInputTextareaFocused = ref(false)

const isSubmitting = ref(false)
const errorMessage = ref('')
const inputPlaceholder = computed(() => {
  return $T('Enter your ideas or outlined content to get a map based on your chosen template style.')
})

const handleClose = () => {
  if (isSubmitting.value) return
  resolve(null)
}

const handleSubmit = async () => {
  if (isSubmitDisabled.value) return

  const prompt = inputTextContent.value.trim()

  if (!props.templateItem) {
    errorMessage.value = 'Template data missing'
    isSubmitting.value = false
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  resolve({
    templateItem: props.templateItem,
    prompt,
    language: settingMenuModelValue.value?.language,
    spaceId: selectedSpaceId.value,
  })

  isSubmitting.value = false
}

const isSubmitDisabled = computed(() => {
  if (isSubmitting.value) return true
  return inputTextContent.value.trim().length === 0
})

watch(
  () => inputTextContent.value,
  debounce(newValue => {
    setPromptHistory(newValue)
  }, 200),
)

watch(
  () => settingMenuModelValue.value.language,
  newValue => {
    if (!newValue) return
    setLanguageHistory(newValue)
  },
)
</script>

<style scoped>
.template-rewrite-dialog :deep(.modal-dialog-content) {
  max-width: 700px;
}
</style>

<style>
@import '../../../styles/template-image-border.css';
</style>
