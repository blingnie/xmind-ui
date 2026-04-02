<script lang="ts">
import { defineComponent, PropType, ref, computed } from 'vue'
import { validateFilename } from 'utils/misc'
import SimplyInputDialog from './new-simply-input-dialog.vue'
import { usePromiseHook } from 'utils/vue-utils'
import { $T } from 'client/library/translation'

export default defineComponent({
  name: 'AppRenameDialog',
  components: {
    SimplyInputDialog,
  },
  props: {
    value: {
      required: true,
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
    const isErrored = ref(false)

    const illegalInputWarningContent = computed(() => $T('The file name cannot contain more than 255 characters.'))

    const handleConfirm = async (newName: string) => {
      newName = newName.trim()
      newName = newName || $T('untitled')
      if (!validateFilename(newName)) {
        isErrored.value = true
        return
      }
      isErrored.value = false
      isLoading.value = true
      const isCanClose = await props.onConfirm(newName).catch(err => logger.error(err))
      isLoading.value = false
      if (isCanClose) {
        resolve(newName)
      }
      handleClose()
    }

    const handleClose = () => {
      resolve()
    }

    return {
      illegalInputWarningContent,

      isErrored,
      isLoading,
      handleClose,
      handleConfirm,
    }
  },
})
</script>

<template>
  <simply-input-dialog
    class="rename-dialog"
    :title="$T('Rename Map')"
    :confirm-button-text="$T('Rename')"
    :cancel-button-text="$T('Cancel')"
    :width="420"
    :description="''"
    :is-disable-confirm="false"
    :is-opened="true"
    :value="value"
    :placeholder="$T('Map Name')"
    :is-loading="isLoading"
    :is-errored="isErrored"
    :error-message="illegalInputWarningContent"
    :select-text="false"
    :theme="'dim'"
    @confirm="handleConfirm"
    @modal-dialog-close="handleClose"
  >
  </simply-input-dialog>
</template>
