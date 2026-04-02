<script lang="ts" setup>
import { computed, ref } from 'vue'
import NewModalDialog, { ModalDialogBottomButton, ModalDialogButtonType } from '../new-base-modal-dialog.vue'
import UpgradeGradientButton from 'client/components/composite/upgrade-gradient-button.vue'
import { usePromiseHook } from 'utils/vue-utils'
import { useWindowResize } from 'client/composables/window-resize'

const props = withDefaults(
  defineProps<{
    title: string
    height: number | string | undefined
    text: string
    confirmText: string
    onConfirm: (() => Promise<boolean>) | null
    cancelText: string
    onCancel: (() => Promise<boolean>) | null
    dismissable: boolean
    exchangeConfirmButton: boolean
    confirmButtonType: ModalDialogButtonType
    // @deprecated
    isMobileDrawerStyle?: boolean
    isUpgradeConfirm?: boolean
  }>(),
  {
    title: 'Alert',
    height: undefined,
    text: '',
    confirmText: 'OK',
    onConfirm: null,
    cancelText: 'Cancel',
    onCancel: null,
    dismissable: true,
    exchangeConfirmButton: false,
    confirmButtonType: 'secondary',
    isUpgradeConfirm: false,
  },
)

const dialog = ref<InstanceType<typeof NewModalDialog>>()
const { resolve } = usePromiseHook()
const { isPhoneSizeViewportWidth } = useWindowResize()

const isOpened = ref(true)
const isCloseable = ref(true)

const handleClose = async () => {
  if (isCloseable.value && props.dismissable) {
    await dialog.value?.closeDialogWithAnimation?.()
    isOpened.value = false
    resolve()
  }
}
const automaticCloseWithExecuteFunction = (func: () => Promise<boolean>, result: boolean) => {
  return async () => {
    isCloseable.value = false
    const isAllowClose = await func()
    isCloseable.value = true
    if (isAllowClose) {
      await dialog.value?.closeDialogWithAnimation?.()
      isOpened.value = false
      resolve(result)
    }
  }
}

const buttons = computed(() => {
  const buttons: ModalDialogBottomButton[] = []
  if (props.onCancel) {
    buttons.push({
      text: props.cancelText,
      onClick: automaticCloseWithExecuteFunction(props.onCancel, false),
      isDisabled: !isCloseable.value,
      type: 'default',
    })
  }

  if (props.onConfirm) {
    const type = props.confirmButtonType as ModalDialogButtonType
    props.exchangeConfirmButton
      ? buttons.unshift({
          text: props.confirmText,
          onClick: automaticCloseWithExecuteFunction(props.onConfirm, true),
          isDisabled: !isCloseable.value,
          type,
        })
      : buttons.push({
          text: props.confirmText,
          onClick: automaticCloseWithExecuteFunction(props.onConfirm, true),
          isDisabled: !isCloseable.value,
          type,
        })
  }
  return buttons
})
</script>

<template>
  <new-modal-dialog
    ref="dialog"
    :title="title"
    :is-opened="true"
    :close-button="false"
    :buttons="buttons"
    :height="height"
    :min-height="200"
    :width="580"
    class="confirm-dialog"
    @modal-dialog-close="handleClose"
  >
    <div class="confirm-dialog__body w-full break-words">
      <span class="confirm-dialog__body-desc flex flex-col text-desktop-body-1">
        <template v-for="(para, index) of text.split('|')" :key="index">
          <span v-if="para.trim()">{{ para }}</span>
          <br v-else />
        </template>
      </span>
    </div>
    <template v-if="isUpgradeConfirm" #footer>
      <div class="flex w-full justify-end gap-2 sm:gap-4">
        <upgrade-gradient-button
          class="flex-1 sm:flex-none"
          :size="isPhoneSizeViewportWidth ? 'large' : 'small'"
          :disabled="!isCloseable"
          @click="onConfirm"
        >
          {{ confirmText }}
        </upgrade-gradient-button>
      </div>
    </template>
  </new-modal-dialog>
</template>
