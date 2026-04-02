<template>
  <modal-dialog
    :title="$T('$1 Stops Responding', thirdPartyDrive())"
    :is-opened="true"
    :close-button="false"
    :buttons="bottomButtons"
    :height="320"
    :width="580"
    class="nonexistent-cloud-storage-dialog"
    @modal-dialog-close="handleClose"
  >
    <div class="delete-dialog__body">
      <span class="rename-dialog__body-desc">
        {{ `We're sorry, but the cloud storage is currently unresponsive. Would you like to save this file in Xmind AI instead?` }}
      </span>
    </div>
  </modal-dialog>
</template>

<script lang="ts" setup>
import ModalDialog, { ModalDialogBottomButton } from '../base-modal-dialog.vue'
import { computed, PropType, ref } from 'vue'
import { usePromiseHook } from 'utils/vue-utils'
import { MapCache } from 'client/library/map-cache'
import { notificationsActions } from 'client/library/notifications'
import { CreateFileInsufficientSpaceError } from 'client/library/cloud-kit/client/create-file'
import { $T } from 'client/library/translation'
import { useWorkspaceStore } from 'app/services/pinia'

const props = defineProps({
  onSave: {
    type: Function as PropType<() => Promise<MapCache>>,
    required: true,
  },
})
const { resolve } = usePromiseHook()

const handleClose = () => {
  resolve(null)
}
const thirdPartyDrive = () => {
  const meta = useWorkspaceStore().editor.meta
  switch (meta.thirdPartyProvider) {
    case 'dropbox':
      return 'Dropbox Drive'
    case 'onedrive':
      return 'One Drive'
    case 'googledrive':
      return 'Google Drive'
  }
}
const isSaving = ref(false)

const handleSaveToXmindWorks = async () => {
  isSaving.value = true
  const metadata = await props
    .onSave()
    .catch(e => {
      if (e?.error instanceof CreateFileInsufficientSpaceError) {
        notificationsActions.show({
          message: $T('Save file failed. There is not enough space on Xmind AI.'),
        })
      } else {
        notificationsActions.show({
          message: $T('Save file failed.'),
        })
      }
    })
    .finally(() => (isSaving.value = false))
  if (metadata) {
    resolve(metadata)
  }
  resolve(null)
}

const bottomButtons = computed<ModalDialogBottomButton[]>(() => {
  return [
    {
      text: $T('Cancel'),
      onClick: () => handleClose(),
      isDisabled: isSaving.value,
      classes: 'uk-button uk-button-default',
    },
    {
      text: $T('Save'),
      onClick: () => handleSaveToXmindWorks(),
      isDisabled: isSaving.value,
      classes: 'uk-button uk-button-primary uk-margin-small-left',
    },
  ]
})
</script>

<style scoped lang="less">
.nonexistent-cloud-storage-dialog {
  &__body-desc {
    margin-top: 14px;
    line-height: 28px;
  }
}
</style>
