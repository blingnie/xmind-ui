<script lang="ts" setup>
import { ref, computed } from 'vue'
import ModalDialog from 'client/components/new-base-modal-dialog.vue'
import { usePromiseHook } from 'utils/vue-utils'
import { $T } from 'client/library/translation'
import { useWindowResize } from 'client/composables/window-resize'
import { useTeamsClient } from 'app/composables/team-client'
import { TeamMetadata, TeamSpaceMetadata } from 'client/server-export'

const props = defineProps<{
  type: TeamMetadata['type'] | TeamSpaceMetadata['type']
  id: string
  name: string
  beforeDelete?: () => Promise<void>
}>()

const warningText =
  props.type === 'team'
    ? $T('Are you sure you want to permanently delete this team? This action cannot be undone and will remove all team data.')
    : $T('Are you sure you want to permanently delete this space? This action cannot be undone and will remove all space data.')
const confirmText =
  props.type === 'team' ? $T('To confirm, please enter the name of the team.') : $T('To confirm, please enter the name of the space.')
const buttonText = props.type === 'team' ? $T('Permanently Delete Team') : $T('Permanently Delete Space')
const titleText = props.type === 'team' ? $T('Delete Team') : $T('Delete Space')

const dialog = ref<InstanceType<typeof ModalDialog>>()
const { resolve } = usePromiseHook()
const nameInput = ref('')
const isProcessing = ref(false)
const isAllowToConfirm = computed(() => nameInput.value.trim() === props.name.trim() && !isProcessing.value)
const { isPhoneSizeViewportWidth } = useWindowResize()

const handleConfirm = async () => {
  if (!isAllowToConfirm.value) return
  isProcessing.value = true
  let isSuccess = false
  try {
    await props.beforeDelete?.()
    isSuccess =
      props.type === 'team' ? await useTeamsClient().deleteTeam({ teamId: props.id }) : await useTeamsClient().deleteTeamSpace({ spaceId: props.id })
  } catch (error) {
    logger.error(props.type === 'team' ? 'Failed to delete team' : 'Failed to delete space', error)
  } finally {
    isProcessing.value = false
  }
  await dialog.value?.closeDialogWithAnimation?.()
  resolve(isSuccess)
}
const cancel = async () => {
  await dialog.value?.closeDialogWithAnimation?.()
  resolve(false)
}
</script>

<template>
  <div>
    <modal-dialog
      ref="dialog"
      dialog-body-class="!pt-4"
      :title="titleText"
      :is-opened="true"
      :width="420"
      :max-height="460"
      :close-button="!!isPhoneSizeViewportWidth"
      dialog-footer-class="!pt-4 !pb-[32px] sm:!pb-[18px]"
      :max-width="'auto'"
      @modal-dialog-close="cancel"
    >
      <div class="flex w-full flex-col gap-3 sm:gap-4">
        <p class="text:mobile-body-large sm:text-desktop-body-large">
          {{ warningText }}
        </p>
        <p class="text:mobile-body-large sm:text-desktop-body-large">{{ confirmText }}</p>
        <div class="w-full pt-[8px] sm:pt-0">
          <fw-input
            v-model="nameInput"
            class="px-3 py-2 leading-6"
            :placeholder="name"
            :is-auto-focus="true"
            :size="'large'"
            :is-error="nameInput.length > 0 && nameInput.trim() !== name.trim()"
            :theme="'dim'"
          />
        </div>
      </div>
      <template #between-body-footer>
        <fw-divider />
      </template>
      <template #footer>
        <div class="flex w-full flex-col gap-4 sm:flex-row sm:justify-end">
          <fw-button
            class="!hidden w-auto sm:!block"
            :theme="'default'"
            :size="isPhoneSizeViewportWidth ? 'large' : 'small'"
            :disabled="false"
            data-focus="not-allow"
            @click="() => cancel()"
          >
            {{ $T('Cancel') }}
          </fw-button>
          <fw-button
            class="w-full sm:w-auto"
            :theme="'danger'"
            :size="isPhoneSizeViewportWidth ? 'large' : 'small'"
            :disabled="!isAllowToConfirm"
            data-focus="not-allow"
            @click="handleConfirm"
          >
            {{ buttonText }}
          </fw-button>
        </div>
      </template>
    </modal-dialog>
  </div>
</template>
