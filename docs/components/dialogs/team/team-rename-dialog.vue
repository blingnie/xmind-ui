<script lang="ts" setup>
import { ref, computed } from 'vue'
import SimplyInputDialog from 'client/components/dialogs/new-simply-input-dialog.vue'
import { usePromiseHook } from 'utils/vue-utils'
import { $T } from 'client/library/translation'
import { useTeamsClient } from 'app/composables/team-client'

const props = defineProps<{
  initialValue: string
  teamId: string
}>()

const { resolve } = usePromiseHook()
const isLoading = ref(false)
const isErrored = ref(false)

const illegalInputWarningContent = computed(() => $T('The team name cannot contain more than 255 characters.'))

const isValidTeamName = (name: string) => {
  return name.trim().length > 0 && name.trim().length <= 255
}

const handleConfirm = async (newName: string) => {
  newName = newName.trim()
  if (newName === props.initialValue) {
    resolve(null)
  }
  if (!isValidTeamName(newName)) {
    isErrored.value = true
    return
  }
  isErrored.value = false
  isLoading.value = true
  const newTeamMetadata = await useTeamsClient()
    .changeTeamName({ teamId: props.teamId, name: newName })
    .catch(() => null)
  isLoading.value = false

  if (newTeamMetadata?.name) {
    resolve(newTeamMetadata)
    handleClose()
  }
}

const handleClose = () => {
  resolve(null)
}
</script>

<template>
  <simply-input-dialog
    class="rename-dialog"
    :title="$T('Rename Team')"
    :confirm-button-text="$T('Rename')"
    :cancel-button-text="$T('Cancel')"
    :width="420"
    :is-opened="true"
    :value="initialValue"
    :placeholder="$T('Map Name')"
    :is-loading="isLoading"
    :is-errored="isErrored"
    :error-message="illegalInputWarningContent"
    :select-text="true"
    @confirm="handleConfirm"
    @modal-dialog-close="handleClose"
  >
  </simply-input-dialog>
</template>
