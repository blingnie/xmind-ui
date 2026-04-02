<script lang="ts">
import { defineComponent, computed, PropType, ref } from 'vue'
import ModalDialog, { ModalDialogBottomButton } from '../base-modal-dialog.vue'
import { CloudStorageFile } from 'client/types/file'
import { usePromiseHook } from 'utils/vue-utils'
import { $T } from 'client/library/translation'

export interface UploadConflictDialogProps {
  isOpened: boolean
  isUploading: boolean
  meta: CloudStorageFile
  // $T: (text: string) => string;
}

export default defineComponent({
  name: 'AppUploadConflictDialog',
  components: {
    ModalDialog,
  },
  props: {
    meta: {
      type: Object as PropType<CloudStorageFile>,
      required: true,
    },
    onUpload: {
      type: Function as PropType<() => Promise<boolean>>,
      required: true,
    },
  },
  setup(props) {
    const { resolve } = usePromiseHook()
    const isUploading = ref(false)
    const handleUpload = async () => {
      isUploading.value = true
      const isCanClose = await props.onUpload()
      isUploading.value = false
      if (isCanClose) {
        resolve()
      }
    }

    const handleClose = () => {
      if (isUploading.value) return
      resolve()
    }

    const bottomButtons = computed<ModalDialogBottomButton[]>(() => {
      return [
        {
          text: $T('Cancel'),
          onClick: () => handleClose(),
          isDisabled: isUploading.value,
          classes: 'uk-button uk-button-default',
        },
        {
          text: $T('Save As Copy'),
          onClick: () => handleUpload(),
          isDisabled: isUploading.value,
          classes: 'uk-button uk-button-primary uk-margin-small-left',
        },
      ]
    })
    return {
      handleClose,
      bottomButtons,
    }
  },
})
</script>

<template>
  <modal-dialog
    :title="'Current file can\'t be update'"
    :is-opened="true"
    :buttons="bottomButtons"
    :height="320"
    :width="580"
    class="upload-conflict-dialog"
    @modal-dialog-close="handleClose"
  >
    <div class="upload-conflict-dialog__body">
      <span class="upload-conflict-dialog__body-desc">
        {{ 'You can only save all changes as a copy.' }}
      </span>
    </div>
  </modal-dialog>
</template>
