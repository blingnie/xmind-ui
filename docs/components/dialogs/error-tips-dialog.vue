<template>
  <new-modal-dialog :title="title" :is-opened="true" :buttons="bottomButtons" :width="540" :max-height="600" @modal-dialog-close="handleClose">
    <span> {{ content }} </span>
  </new-modal-dialog>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import NewModalDialog, { ModalDialogBottomButton } from '../new-base-modal-dialog.vue'
import { usePromiseHook } from 'utils/vue-utils'

export default defineComponent({
  name: 'AppErrorTipsDialog',
  components: {
    NewModalDialog,
  },
  props: {
    value: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  setup() {
    const { resolve } = usePromiseHook()

    // computed
    const bottomButtons = computed<ModalDialogBottomButton[]>(() => {
      return [
        {
          text: 'Ok',
          onClick: () => handleClose(),
          isDisabled: false,
          type: 'primary',
        },
      ]
    })

    // method
    const handleClose = () => {
      resolve()
    }

    return {
      bottomButtons,
      handleClose,
    }
  },
})
</script>
