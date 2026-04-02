<template>
  <modal-dialog
    :is-opened="isOpened"
    :close-button="false"
    :width="520"
    :dialog-class="'!bg-ai-background-light dark:!bg-ai-background-dark'"
    :dialog-header-styles="{ padding: '0' }"
    :dialog-footer-styles="{ padding: '0' }"
    :dialog-body-class="'!px-[24px] xs:!px-[32px] !pt-[24px] !pb-[16px] xs:!pt-[32px] xs:!pb-[24px]'"
    @modal-dialog-close="handleClose"
  >
    <div class="flex flex-col items-center">
      <div class="mb-[24px] w-full text-center text-mobile-display-1 xs:text-desktop-display-4">{{ $T('Reorganize on Demand') }}</div>

      <base-textarea
        ref="inputTextArea"
        v-model="inputContent"
        :maxlength="500"
        class="h-[120px] rounded-md bg-transparent-dark-1 placeholder:text-transparent-dark-6 dark:bg-transparent-white-1 dark:placeholder:text-transparent-white-5 dark:focus:!border-brand-5"
        :placeholder="$T('Provide some tips to reorganize your mind map on your demand.')"
      />
      <fw-button
        class="my-[24px] w-full gap-2 xs:my-[32px] xs:w-[200px]"
        :size="'large'"
        :theme="'ai'"
        :disabled="!inputContent"
        @click="handleOrganize"
      >
        <fw-icon name="xmind-ai" />
        <span>{{ $T('Start') }}</span>
      </fw-button>
      <div class="text-[12px] text-transparent-dark-5 dark:text-transparent-white-5">
        {{ $T('AI-Powered Feature, for Reference Only.') }}
      </div>
    </div>
  </modal-dialog>
</template>
<script lang="ts" setup>
import ModalDialog from 'client/components/new-base-modal-dialog.vue'
import BaseTextarea from '../../base-textarea.vue'
import { useEditorFeaturePaywall } from 'app/composables/editor-feature-paywall'
import { trackAIFeature } from 'client/library/tracker'
import { onBeforeUnmount, ref, watch } from 'vue'
import { useAigcStore, useWorkspaceStore } from 'app/services/pinia'
import { storeToRefs } from 'pinia'

const props = defineProps<{
  isOpened: boolean
  workbookId: string
}>()

const emits = defineEmits<{
  (e: 'visibility-change', value: boolean): void
}>()

const inputContent = ref('')
const inputTextArea = ref()
const { isEditorCommonPaidFeatureEnabled } = useEditorFeaturePaywall()

const { workbook } = storeToRefs(useWorkspaceStore())
const { organizePrompt } = storeToRefs(useAigcStore())

const { setOrganizePrompt } = useAigcStore()

const handleClose = () => {
  emits('visibility-change', false)
}

const handleOrganize = () => {
  setOrganizePrompt(inputContent.value)
  workbook.value?.getAction('editor.organize').execute()
  trackAIFeature.reorganize({
    userType: isEditorCommonPaidFeatureEnabled.value ? 'plusUser' : 'freeUser',
    entry: 'toolBar',
    mode: 'onDemand',
  })
  handleClose()
}

onBeforeUnmount(() => {
  handleClose()
})

watch(
  () => props.isOpened,
  async (newValue, oldValue) => {
    if (newValue && !oldValue) {
      await new Promise(resolve => setTimeout(resolve, 150))
      inputTextArea.value?.focus()
    }
  },
  {
    flush: 'post',
  },
)

watch(
  () => organizePrompt.value,
  newValue => {
    inputContent.value = newValue
  },
)
</script>
