<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import NewSimplyInputDialog from './new-simply-input-dialog.vue'
import { usePromiseHook } from 'utils/vue-utils'

export interface RenameSheetDialogProps {
  isOpened: boolean
  value: string
}

export default defineComponent({
  name: 'AppRenameSheetDialog',
  components: {
    NewSimplyInputDialog,
  },
  props: {
    value: {
      default: '',
      type: String,
    },
    onConfirm: {
      type: Function as PropType<(name: string) => Promise<boolean>>,
      required: true,
    },
  },
  setup(props) {
    const { resolve } = usePromiseHook()
    const isLoading = ref(false)

    const handleConfirm = async (newName: string) => {
      isLoading.value = true
      const isCanClose = await props.onConfirm(newName)
      isLoading.value = false
      if (isCanClose) {
        resolve()
      }
    }
    const handleClose = () => {
      resolve()
    }

    return {
      isLoading,
      handleClose,
      handleConfirm,
    }
  },
})
</script>

<template>
  <new-simply-input-dialog
    class="new-sheet-dialog"
    :is-opened="true"
    :width="420"
    :title="$T('Rename Sheet')"
    :confirm-button-text="$T('OK')"
    :cancel-button-text="$T('Cancel')"
    :value="value"
    :placeholder="$T('Sheet Name')"
    :is-loading="isLoading"
    :select-text="false"
    @confirm="handleConfirm"
    @modal-dialog-close="handleClose"
  ></new-simply-input-dialog>
</template>
