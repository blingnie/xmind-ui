<script setup lang="ts">
import { ref } from 'vue'
import SimplyInputDialog from 'client/components/dialogs/new-simply-input-dialog.vue'
import { $T } from 'client/library/translation'
import { usePromiseHook } from 'utils/vue-utils'
import type { CreateCalendarDialogResult } from 'app/services/action/dialog/create-calendar-dialog'

const props = defineProps<{
  defaultName: string
}>()

const { resolve } = usePromiseHook<CreateCalendarDialogResult>()
const isOpened = ref(true)
const calendarName = ref(props.defaultName)
const isLoading = ref(false)

const handleConfirm = async (name: string) => {
  if (!name.trim()) return

  isLoading.value = true
  resolve({
    action: 'confirm',
    name: name.trim(),
  })
}

const handleClose = () => {
  resolve({
    action: 'cancel',
  })
}
</script>

<template>
  <simply-input-dialog
    :is-opened="isOpened"
    :value="calendarName"
    :is-loading="isLoading"
    :title="$T('Create a New Calendar')"
    :confirm-button-text="$T('Create')"
    :cancel-button-text="$T('Cancel')"
    :placeholder="$T('Calendar Name')"
    :width="420"
    @confirm="handleConfirm"
    @modal-dialog-close="handleClose"
  />
</template>
