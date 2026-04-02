<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import ModalDialog, { ModalDialogBottomButton } from '../new-base-modal-dialog.vue'
import NewInput from 'client/components/base/input.vue'
import { $T } from 'client/library/translation'

export interface SimplyInputDialogProps {
  isOpened: boolean
  value: string
  errorMessage?: string
  isLoading: boolean
  isErrored?: boolean
  title: string
  description?: string
  confirmButtonText: string
  cancelButtonText: string
  placeholder: string
  selectText?: boolean
  isDisableConfirm?: boolean
  theme?: 'bright' | 'dim'
  width: number
}

const props = withDefaults(defineProps<SimplyInputDialogProps>(), {
  isOpened: false,
  value: '',
  errorMessage: '',
  isLoading: false,
  isErrored: false,
  title: '',
  description: '',
  confirmButtonText: '',
  cancelButtonText: '',
  placeholder: '',
  selectText: true,
  width: 420,
  theme: 'bright',
  isDisableConfirm: false,
})

const emit = defineEmits<{
  (e: 'confirm', v: string): void
  (e: 'input'): void
  (e: 'modal-dialog-close'): void
}>()

const internalValue = ref(props.value)
const dialogInstance = ref<InstanceType<typeof ModalDialog | null>>(null)
const inputInstance = ref<InstanceType<typeof NewInput | null>>(null)
watch(
  () => props.value,
  () => {
    internalValue.value = props.value || ''
  },
  { immediate: true },
)
const handleConfirm = (newName: string) => emit('confirm', newName)
const handleClose = async () => {
  await dialogInstance.value?.closeDialogWithAnimation?.()

  emit('modal-dialog-close')
}
const handleInput = () => {
  emit('input')
}
const handleInputFocusOut = (event: FocusEvent) => {
  const relatedTarget = event.relatedTarget as HTMLElement
  if (!relatedTarget) return

  if (relatedTarget.tagName === 'BUTTON' && dialogInstance.value?.dialog?.contains(relatedTarget)) {
    inputInstance.value?.focus()
    event.preventDefault()
  }
}

const bottomButtons = computed<ModalDialogBottomButton[]>(() => {
  return [
    {
      text: props.cancelButtonText || $T('Cancel'),
      onClick: () => handleClose(),
      isDisabled: props.isLoading,
      type: 'default',
    },
    {
      text: props.confirmButtonText || 'Save',
      onClick: () => handleConfirm(internalValue.value),
      isDisabled: props.isLoading || props.isDisableConfirm,
      type: 'secondary',
    },
  ]
})
</script>

<template>
  <div>
    <modal-dialog
      ref="dialogInstance"
      :title="title"
      :is-opened="true"
      :buttons="bottomButtons"
      :width="width"
      :max-width="'auto'"
      :max-height="460"
      class="simply-input-dialog"
      @modal-dialog-close="handleClose"
    >
      <div class="simply-input-dialog__body">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span class="simply-input-dialog__body-desc" v-html="description"></span>
        <div class="uk-flex uk-flex-middle" :class="{ 'mt-[16px]': description }">
          <new-input
            ref="inputInstance"
            v-model="internalValue"
            type="text"
            size="large"
            class="w-full"
            :is-auto-focus="true"
            :is-auto-select="selectText"
            :placeholder="placeholder"
            :is-error="isErrored"
            :disable-clear-icon="true"
            :theme="theme"
            @focusout="handleInputFocusOut($event)"
            @input="handleInput"
            @keypress.enter="!isLoading && handleConfirm(internalValue)"
          >
          </new-input>
          <slot name="after-input"></slot>
        </div>
        <span v-if="isErrored && errorMessage" class="text-desktop-caption-1 text-red-500">{{ errorMessage }}</span>
        <slot></slot>
      </div>
    </modal-dialog>
  </div>
</template>
