<template>
  <new-modal-dialog
    :title="title"
    :is-opened="true"
    :close-button="false"
    :width="599"
    class="create-sharing-dialog"
    :buttons="buttons"
    @modal-dialog-close="handleClose"
  >
    <div class="uk-position-relative uk-height-1-1 uk-overflow-auto" tabindex="-1">
      <fw-loading v-if="isLoading" style="background-color: transparent" position-class="" :text="$T('Uploading File ...')"> </fw-loading>
      <div v-else>{{ message }}</div>
    </div>
  </new-modal-dialog>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import NewModalDialog, { ModalDialogBottomButton } from '../../new-base-modal-dialog.vue'
import { usePromiseHook } from 'utils/vue-utils'
import { trackCollaborateCloudDriveShare } from 'client/library/tracker'
import { $T } from 'client/library/translation'

const props = defineProps<{
  title: string
  message: string
  confirmButtonText: string
  onCopy: () => Promise<string>
}>()

const { resolve } = usePromiseHook()
const isLoading = ref(false)

const handleClose = () => {
  if (isLoading.value) {
    return
  }

  trackCollaborateCloudDriveShare('cancel')

  resolve()
}
const handleCopyToSharing = async () => {
  isLoading.value = true
  try {
    const fileId = await props.onCopy()
    if (fileId) {
      resolve(fileId)
    }
  } finally {
    isLoading.value = false
  }

  trackCollaborateCloudDriveShare('continue')
}
const buttons = computed<ModalDialogBottomButton[]>(() => {
  return [
    {
      text: $T('Cancel'),
      onClick: handleClose,
      isDisabled: isLoading.value,
      type: 'default',
    },
    {
      text: props.confirmButtonText,
      onClick: handleCopyToSharing,
      isDisabled: isLoading.value,
      type: 'primary',
    },
  ]
})
</script>
