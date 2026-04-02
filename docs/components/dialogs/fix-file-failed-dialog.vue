<script lang="ts">
import { computed, defineComponent, ref, PropType } from 'vue'
import ModalDialog from '../base-modal-dialog.vue'
import { usePromiseHook } from 'utils/vue-utils'
import { $T } from 'client/library/translation'
import { useServices } from 'app/fragments/use-services'

export default defineComponent({
  name: 'FixFileFailedDialog',
  components: {
    ModalDialog,
  },
  props: {
    onConfirm: {
      type: [Function, Object] as PropType<(() => Promise<boolean>) | null>,
      default: null,
    },
  },
  setup(props) {
    const { resolve } = usePromiseHook()
    const isOpened = ref(true)
    const isCloseable = ref(true)
    const title = $T('Unable to Fix')
    const bodyText = $T(
      'This file may have become corrupted. You can submit your feedback and attach the file to assist us in providing a solution. Thank you for helping us improve.',
    )
    const confirmText = $T('OK')

    const automaticCloseWithExecuteFunction = (func: () => Promise<boolean>, result: boolean) => {
      return async () => {
        isCloseable.value = false
        const isAllowClose = await func()
        isCloseable.value = true
        if (isAllowClose) {
          isOpened.value = false
          resolve(result)
        }
      }
    }

    const handleOpenFeedBackDialog = () => {
      useServices()?.action.dialog.openFeedbackDialog()
    }

    const buttons = computed(() => {
      const buttons = []
      if (props.onConfirm) {
        buttons.push({
          text: confirmText,
          onClick: automaticCloseWithExecuteFunction(props.onConfirm, true),
          isDisabled: !isCloseable.value,
          classes: 'uk-button uk-button-primary uk-margin-left',
        })
      }
      return buttons
    })

    return {
      isCloseable,
      buttons,
      isOpened,
      title,
      bodyText,
      handleOpenFeedBackDialog,
    }
  },
})
</script>

<template>
  <modal-dialog :title="title" :is-opened="true" :close-button="false" :buttons="buttons" :height="320" :width="580">
    <div>
      <span>{{ bodyText }}</span>
      <h4>
        <a @click="handleOpenFeedBackDialog">{{ $T('Submit Feedback') }}</a>
      </h4>
    </div>
  </modal-dialog>
</template>
