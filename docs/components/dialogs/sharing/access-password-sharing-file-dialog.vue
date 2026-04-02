<script lang="ts">
import { defineComponent, ref, computed, watch, PropType, onMounted } from 'vue'
import ModalDialog, { ModalDialogBottomButton } from '../../new-base-modal-dialog.vue'
import { usePromiseHook } from 'utils/vue-utils'
import { useVueRouter } from 'client/composables/vue-router'

export default defineComponent({
  name: 'AppAccessPasswordSharingFileDialog',
  components: {
    ModalDialog,
  },
  props: {
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
      isErrored.value = !isSucceed
      if (isSucceed) {
        resolve(password)
      }
    }
    const handleClose = async () => {
      resolve()
    }
    const bottomButtons = computed<ModalDialogBottomButton[]>(() => {
      return [
        {
          text: 'OK',
          isDisabled: isLoading.value || !internalValue.value.length,
          onClick: () => handleConfirm(internalValue.value),
          type: 'primary',
          style: { width: '100%' },
        },
      ]
    })

    onMounted(() => {
      useVueRouter().listenRouterPathChange(handleClose)
    })

    const isShowPasswordText = ref(false)

    return {
      handleClose,
      handleConfirm,
      bottomButtons,
      isLoading,
      isErrored,
      isShowPasswordText,
      internalValue,
    }
  },
})
</script>

<template>
  <modal-dialog :title="'Encrypted File'" :is-opened="true" :close-button="false" :buttons="bottomButtons" :width="402" class="password-dialog">
    <div class="password-dialog__body">
      <span class="password-dialog__body-desc">
        {{ 'Enter a password for the link.' }}
      </span>
      <fw-input
        v-model="internalValue"
        class="mt-4 w-full"
        :class="{ 'hide-password': !isShowPasswordText }"
        :type="'text'"
        :placeholder="$T('Enter Password')"
        :is-error="isErrored"
        :is-auto-focus="true"
        @input-change="isErrored = false"
        @keypress.enter="handleConfirm(internalValue)"
      >
        <template #clear-icon>
          <fw-icon v-show="isShowPasswordText" name="preview" @click="isShowPasswordText = !isShowPasswordText" />
          <fw-icon v-show="!isShowPasswordText" name="preview-slash" @click="isShowPasswordText = !isShowPasswordText" />
        </template>
      </fw-input>
      <div v-if="passwordHint" class="uk-text-muted uk-text-small" style="margin-top: 16px; font-size: 14px">Hint: {{ passwordHint }}</div>
      <span v-if="isErrored" class="text-desktop-caption-1 text-red-500">{{ $T("Password doesn't match.") }}</span>
    </div>
  </modal-dialog>
</template>

<style scoped>
.hide-password:deep(input) {
  -webkit-text-security: disc;
}
</style>
