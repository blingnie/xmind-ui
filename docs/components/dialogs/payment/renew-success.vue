<template>
  <modal-dialog class="renew-success-dialog" :is-opened="true" :width="360" @modal-dialog-close="handleClose">
    <div class="flex flex-col items-center gap-[16px]">
      <span class="text-desktop-display-4">{{ $T('Renew Successfully') }}</span>
      <img uk-img class="w-[120px]" :data-src="toURL('/assets/static/images/dialog-payment/renew-successful.png')" />
      <span class="text-center text-desktop-body-3">
        {{ $T('Your subscription has been successfully renewed. Thank you for continuing to be part of the Xmind AI community!') }}
      </span>
      <base-button theme="secondary" size="medium" class="mt-[24px] self-stretch" @click="handleClose">{{ $T('Start Now') }}</base-button>
    </div>
  </modal-dialog>
</template>

<script setup lang="ts">
import ModalDialog from '../../new-base-modal-dialog.vue'
import BaseButton from 'client/components/base/button.vue'
import { usePromiseHook } from 'utils/vue-utils'

const { resolve } = usePromiseHook()
const handleClose = () => resolve(true)
</script>

<style scoped lang="less">
.renew-success-dialog {
  &:deep(.modal-dialog__body) {
    padding: 32px;
    overflow: visible;
  }

  &:deep(.modal-dialog__header),
  &:deep(.modal-dialog__footer) {
    display: none;
  }
}
</style>
