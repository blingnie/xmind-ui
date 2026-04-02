<template>
  <modal-dialog
    :is-opened="true"
    :close-button="true"
    :width="dialogWidth"
    :title="config.title"
    :buttons="bottomButtons"
    :dialog-body-styles="{
      'padding-bottom': '16px',
    }"
    @modal-dialog-close="handleClose"
  >
    <template #separator>
      <div class="mt-[24px] h-[1px] w-full shrink-0 bg-transparent-dark-2 dark:bg-transparent-white-2"></div>
    </template>
    <div class="flex flex-col">
      <div class="text-sm font-semibold leading-[18px] text-dark-grey-8 dark:text-light-grey-1">{{ config.reportReasonsTitle }}</div>
      <div v-for="(reason, index) in reportReasons" :key="index">
        <label class="mt-[16px] flex items-center gap-2">
          <base-checkbox v-model="reason.checked"></base-checkbox>
          <span class="text-[13px] leading-[18px] text-dark-grey-10 dark:text-light-grey-1">{{ reason.label }}</span>
        </label>
      </div>
      <div>
        <div class="mt-6 text-[13px] font-normal leading-[18px] text-transparent-dark-8 dark:text-transparent-white-8">
          {{ config.reportDetailTitle }}
        </div>
        <base-textarea v-model="inputExplanation" class="mt-3 h-[100px]" :placeholder="config.reportDetailInputHint" :maxlength="200" />
      </div>
    </div>
  </modal-dialog>
</template>

<script lang="ts" setup>
import { usePromiseHook } from 'utils/vue-utils'
import ModalDialog, { ModalDialogBottomButton } from 'client/components/new-base-modal-dialog.vue'
import BaseCheckbox from 'client/components/base-checkbox.vue'
import BaseTextarea from 'client/components/base-textarea.vue'
import { computed, ref } from 'vue'
import { isPhoneViewportSmall } from 'utils/detectDevice'
import { Account } from 'client/library/account'
import { toastActions } from 'client/library/new-notifications'
import { FileReportConfig } from './file-report'

const props = defineProps<{
  fileId: string
  config: FileReportConfig
}>()

const { resolve } = usePromiseHook()

const handleClose = () => {
  resolve(false)
}

const handleReport = async () => {
  try {
    if (
      await Account.sendCNFileReport({
        fileId: props.fileId,
        reasons: reportReasons.value.filter(reason => reason.checked).map(reason => reason.label),
        explanation: inputExplanation.value,
      })
    ) {
      toastActions.reportFileSuccess()
      resolve(true)
    }
  } catch (err) {
    if (err.message === 'already_reported') {
      toastActions.reportFileRepeatedlyError()
    }
  }
}

const dialogWidth = isPhoneViewportSmall() ? 343 : 520

const reportReasons = ref(
  props.config.reportReasons.map(reason => ({
    label: reason,
    checked: false,
  })),
)

const inputExplanation = ref<string>('')

const isReportButtonDisabled = computed<boolean>(() => {
  return !reportReasons.value.some(reason => reason.checked) || inputExplanation.value.length < 5
})

const bottomButtons = computed<ModalDialogBottomButton[]>(() => {
  return [
    {
      text: props.config.buttonText,
      onClick: () => handleReport(),
      isDisabled: isReportButtonDisabled.value,
      type: 'default',
    },
  ]
})
</script>
