<script lang="ts">
import { defineComponent, ref, watch, PropType } from 'vue'
import { usePromiseHook } from 'utils/vue-utils'
import { $T } from 'client/library/translation'

import SimplyInputDialog from './new-simply-input-dialog.vue'

export default defineComponent({
  name: 'AppEnterPasswordDialog',
  components: {
    SimplyInputDialog,
  },
  props: {
    desc: {
      type: String,
      default: $T('Please enter the password to open this file.'),
    },
    password: {
      type: String,
      default: '',
    },
    passwordHint: {
      type: String,
      default: '',
    },
    onConfirm: {
      type: Function as PropType<(password: string) => Promise<boolean>>,
      required: true,
    },
    onDownload: {
      type: Function as PropType<() => Promise<void>>,
      required: true,
    },
    onCancel: {
      type: Function as PropType<() => Promise<void>>,
      required: true,
    },
  },
  setup(props) {
    const { resolve } = usePromiseHook()
    const internalValue = ref(props.password)
    const isLoading = ref(false)
    const isErrored = ref(false)
    watch(
      () => props.password,
      () => {
        internalValue.value = props.password || ''
      },
      { immediate: true },
    )
    const handleConfirm = async (password: string) => {
      isLoading.value = true
      const isSucceed = await props.onConfirm(password)
      isLoading.value = false
      isErrored.value = Boolean(!isSucceed)
      if (isSucceed) {
        resolve(true)
      }
    }
    const handleClose = async () => {
      if (isLoading.value) {
        return
      }
      await props.onCancel?.()
      resolve()
    }

    return {
      handleClose,
      handleConfirm,
      isLoading,
      isErrored,
      internalValue,
    }
  },
})
</script>

<template>
  <simply-input-dialog
    class="password-dialog"
    :placeholder="$T('Password')"
    :title="$T('Encrypted File')"
    :value="''"
    :width="580"
    :confirm-button-text="$T('OK')"
    :cancel-button-text="$T('Cancel')"
    :is-opened="true"
    :is-loading="isLoading"
    :is-errored="isErrored"
    :error-message="$T('The password is not correct. Please try again.')"
    :description="desc"
    :select-text="true"
    :is-disable-confirm="false"
    @input="isErrored = false"
    @confirm="handleConfirm"
    @modal-dialog-close="handleClose"
  >
    <div style="margin-top: 8px">
      <div v-if="passwordHint" class="uk-text-muted uk-text-small" style="margin-top: 8px; font-size: 14px">Hint: {{ passwordHint }}</div>
    </div>
  </simply-input-dialog>
</template>
