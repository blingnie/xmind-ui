<template>
  <modal-dialog
    ref="dialog"
    :is-opened="true"
    :close-button="isPhoneSizeViewportWidth ? true : false"
    :width="514"
    :max-width="514"
    :use-overlay-scrollbar="true"
    :title="$T('Create new space')"
    :buttons="buttons"
    :dialog-body-class="'!pt-4'"
    class="new-space-dialog"
    @modal-dialog-close="handleClose"
  >
    <div class="flex w-full flex-col gap-6">
      <div>
        <fw-input
          v-model="spaceName"
          :placeholder="inputPlaceHolderText"
          theme="dim"
          :is-auto-focus="true"
          :size="isPhoneSizeViewportWidth ? 'large' : 'medium'"
          :disabled="isCreatingNewSpace"
          @enter="handleCreateNewSpace"
        />
      </div>
    </div>
    <template #between-body-footer>
      <fw-divider />
    </template>
  </modal-dialog>
</template>
<script lang="ts" setup>
import { ref, computed } from 'vue'
import { $T } from 'client/library/translation'
import { usePromiseHook } from 'utils/vue-utils'
import ModalDialog, { ModalDialogBottomButton } from '../../new-base-modal-dialog.vue'
import { useWindowResize } from 'client/composables/window-resize'

const props = defineProps<{
  onSpaceNameConfirmed?: (name: string) => Promise<boolean>
}>()

const dialog = ref<InstanceType<typeof ModalDialog>>()
const { isPhoneSizeViewportWidth } = useWindowResize()

const { resolve } = usePromiseHook()
const handleClose = async () => {
  await dialog.value?.closeDialogWithAnimation?.()
  resolve(false)
}

const spaceName = ref('')
const isCreatingNewSpace = ref(false)
const inputPlaceHolderText = computed(() => $T("Space's Name"))

const handleCreateNewSpace = async () => {
  const name = spaceName.value.trim()
  if (!name) return
  isCreatingNewSpace.value = true
  if (props.onSpaceNameConfirmed) {
    const isSuccess = await props.onSpaceNameConfirmed(name)
    if (!isSuccess) {
      isCreatingNewSpace.value = false
      return
    }
  }
  isCreatingNewSpace.value = false
  resolve(name)
}

const buttons = computed<ModalDialogBottomButton[]>(() => [
  {
    text: $T('Cancel'),
    isDisabled: false,
    onClick: () => {
      resolve('')
    },
    type: 'default',
  },
  {
    text: $T('Create'),
    isDisabled: spaceName.value.trim().length === 0 || isCreatingNewSpace.value,
    onClick: () => handleCreateNewSpace(),
    type: 'secondary',
  },
])
</script>

<style scoped lang="less"></style>
