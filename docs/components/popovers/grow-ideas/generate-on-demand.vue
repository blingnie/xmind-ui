<template>
  <app-base-topic-locator-popover
    class="generate-on-demand-popover"
    :workbook-id="workbookId"
    :value="isOpened"
    :width="310"
    :height="258"
    @input="handleVisibilityChange"
  >
    <div class="generate-on-demand relative z-10 inline-flex w-full flex-col justify-center gap-[16px] p-4">
      <div class="flex flex-col items-start gap-[12px]">
        <span class="text-desktop-subhead-mini text-text-secondary-light dark:text-text-secondary-dark">{{ $T('Generate on Demand') }}</span>
        <fw-ai-textarea
          input-class="h-[102px]"
          ref="inputTextArea"
          :multiline="true"
          theme="dim"
          v-model="inputContent"
          :placeholder="$T('Provide some tips to generate your topics on your demand.')"
        >
        </fw-ai-textarea>
      </div>
      <fw-ai-button :disabled="!inputContent" @click="handleGenerate">
        <span>{{ $T('Generate') }}</span>
      </fw-ai-button>
      <span class="text-desktop-caption text-text-quaternary-light dark:text-text-quaternary-dark text-center">
        {{ $T('AI-Powered Feature, for Reference Only.') }}
      </span>
    </div>
  </app-base-topic-locator-popover>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import AppBaseTopicLocatorPopover from '../base-topic-locator.vue'
import { useEditorFeaturePaywall } from 'app/composables/editor-feature-paywall'
import { trackAIFeature } from 'client/library/tracker'
import { storeToRefs } from 'pinia'
import { useWorkspaceStore, useFrameStore } from 'app/services/pinia'
import { useLottieAnimation } from 'app/composables/lottie-animation'

defineProps<{
  isOpened: boolean
  workbookId: string
}>()

const emits = defineEmits<{
  (e: 'visibility-change', value: boolean): void
}>()

useLottieAnimation({
  containerParentSelector: '.generate-on-demand-popover .popover-body .uk-background-default',
  dataFilePathLoader: {
    light: async () => (await import('import-files/json/copilot-dialog-background-light.json?url')).default,
    dark: async () => (await import('import-files/json/copilot-dialog-background-dark.json?url')).default,
  },
  options: {
    containerStyleClass: 'dark:shadow-ai-background-lottie-animation-dark overflow-hidden rounded-lg',
    animationStyleClass: 'filter blur opacity-40',
  },
})

const { workbook } = storeToRefs(useWorkspaceStore())
const { growIdeasInitialPrompt } = storeToRefs(useFrameStore())
const inputContent = ref('')
const inputTextArea = ref()
const { isEditorCommonPaidFeatureEnabled } = useEditorFeaturePaywall()

const handleVisibilityChange = (newValue: boolean) => {
  emits('visibility-change', newValue)
}

const handleGenerate = () => {
  workbook.value?.getAction('editor.growIdeas').execute({ payload: { tips: inputContent.value } })
  inputContent.value = ''
  trackAIFeature.growIdeaGenerate({
    userType: isEditorCommonPaidFeatureEnabled.value ? 'plusUser' : 'freeUser',
    entry: 'toolBar',
    mode: 'onDemand',
  })
  handleVisibilityChange(false)
}

onBeforeUnmount(() => {
  handleVisibilityChange(false)
})

onMounted(async () => {
  inputContent.value = growIdeasInitialPrompt.value
  await new Promise(resolve => setTimeout(resolve, 150))
  inputTextArea.value?.focus()
})
</script>

<style scoped lang="less">
[color-scheme='light'] .generate-on-demand-popover {
  &:deep(.popover-body::after) {
    border-bottom-color: #fbecff;
  }
}
[color-scheme='dark'] .generate-on-demand-popover {
  &:deep(.popover-body::after) {
    border-bottom-color: #4f2e59;
  }
}

.generate-on-demand-popover:deep(.popover-body) {
  --popover-bg-color: var(--ai-background);
}
</style>
