<template>
  <modal-dialog
    :is-opened="true"
    :close-button="false"
    :width="520"
    :dialog-class="'!bg-ai-background-light dark:!bg-ai-background-dark'"
    :dialog-header-styles="{ padding: '0' }"
    :dialog-footer-styles="{ padding: '0' }"
    :dialog-body-class="'!px-[24px] xs:!px-[32px] !pt-[24px] !pb-[16px] xs:!pt-[32px] xs:!pb-[24px]'"
    @modal-dialog-close="handleCancel"
  >
    <div class="flex flex-col items-center">
      <div class="mb-[24px] w-full text-center text-mobile-display-1 xs:text-desktop-display-4">{{ title }}</div>

      <p class="text-desktop-text-1 mb-2 self-start text-dark-grey-4 dark:text-light-grey-4">{{ $T('Requirement') }}</p>

      <base-textarea
        ref="inputTextArea"
        v-model="inputContent"
        :maxlength="500"
        class="h-[120px] rounded-md bg-transparent-dark-1 placeholder:text-transparent-dark-6 dark:bg-transparent-white-1 dark:placeholder:text-transparent-white-5 dark:focus:!border-brand-5"
        :placeholder="placeholder"
      />
      <fw-button
        class="my-[24px] w-full gap-2 xs:my-[32px] xs:w-[200px]"
        :size="'large'"
        :theme="'ai'"
        :disabled="!inputContent"
        @click="handleConfirm"
      >
        <fw-icon name="xmind-ai" />
        <span>{{ confirmText }}</span>
      </fw-button>
      <div class="text-[12px] text-transparent-dark-5 dark:text-transparent-white-5">
        {{ tip }}
      </div>
    </div>
  </modal-dialog>
</template>
<script lang="ts" setup>
import ModalDialog from 'client/components/new-base-modal-dialog.vue'
import BaseTextarea from 'client/components/base-textarea.vue'

import { ref, onMounted } from 'vue'
import { usePromiseHook } from 'utils/vue-utils'

const props = defineProps<{
  placeholder: string
  initText?: string
  autoSelectText?: boolean
  title: string
  confirmText: string
  tip: string
}>()

const { resolve } = usePromiseHook()

const inputContent = ref(props.initText || '')
const inputTextArea = ref<HTMLTextAreaElement>()

const handleCancel = () => {
  resolve({ success: false })
}

const handleConfirm = () => {
  resolve({ success: true, prompt: inputContent.value.trim() })
}

onMounted(async () => {
  await new Promise(resolve => setTimeout(resolve, 150))
  inputTextArea.value?.focus()
  await new Promise(resolve => setTimeout(resolve, 50))
  if (props.autoSelectText) {
    inputTextArea.value?.select()
  }
})
</script>
