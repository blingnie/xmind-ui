<template>
  <modal-dialog
    ref="dialog"
    :title="$T('Delete Space')"
    dialog-body-class="!pt-4"
    :is-opened="true"
    :width="460"
    :close-button="!!isPhoneSizeViewportWidth"
    :max-width="'auto'"
    @modal-dialog-close="handleClose(false)"
  >
    <div class="flex w-full flex-col gap-3 sm:gap-4">
      <p class="text:mobile-body-large sm:text-desktop-body-large">
        {{
          $T(
            'Deleting this space will remove all its files. Please be careful! Would you like to move these files to another space before preceeding?',
          )
        }}
      </p>
    </div>
    <template #between-body-footer>
      <fw-divider />
    </template>
    <template #footer>
      <section class="flex items-center justify-between gap-2">
        <fw-button
          class="!hidden w-auto sm:!block"
          :theme="'default'"
          :size="'small'"
          data-focus="not-allow"
          :disabled="isLoading"
          @click="handleClose(false)"
        >
          {{ $T('Cancel') }}
        </fw-button>

        <div class="contents items-center gap-2 sm:flex">
          <fw-button
            class="relative flex-1 gap-1"
            theme="default"
            :size="isPhoneSizeViewportWidth ? 'large' : 'small'"
            :disabled="isLoading"
            @click="deleteAnyway"
          >
            {{ $T('Delete Anyway') }}
          </fw-button>
          <fw-button theme="secondary" :size="isPhoneSizeViewportWidth ? 'large' : 'small'" :disabled="isLoading" @click="moveFiles">
            {{ $T('Yes, Move Files') }}
          </fw-button>
        </div>
      </section>
    </template>
  </modal-dialog>
</template>

<script setup lang="ts">
import { useCloudKitClient } from 'app/composables/cloud-kit-client'
import { useTeamSpaceData } from 'app/composables/team-space-data'
import { executeActionWithNotification, handleSelectFolderDialog } from 'app/fragments/router-views/new-home/common'
import ModalDialog from 'client/components/new-base-modal-dialog.vue'
import { useWindowResize } from 'client/composables/window-resize'
import { generateAvatarDataURI } from 'client/library/cloud-kit/utils/avatar'
import { $T } from 'client/library/translation'
import { type TeamSpaceMetadata } from 'client/server-export'
import { useServiceStore } from 'client/store'
import { usePromiseHook } from 'utils/vue-utils'
import { computed, ref } from 'vue'

const props = defineProps<{
  spaceMetadata: TeamSpaceMetadata
}>()

const dialog = ref<InstanceType<typeof ModalDialog>>()
const { resolve } = usePromiseHook()
const { isPhoneSizeViewportWidth } = useWindowResize()
const { joinedSpaceList } = useTeamSpaceData()

let filesMigratedToSpaceId: string
const isLoading = ref(false)

const spacesOptions = computed<Array<{ teamId: string; spaceId: string; name: string; icon?: { url: string } }>>(() => {
  return joinedSpaceList.value
    .filter(space => space.spaceId !== props.spaceMetadata.spaceId)
    .map(space => {
      return {
        teamId: space.teamId,
        spaceId: space.spaceId,
        name: space.spaceMetadata.name,
        icon: {
          url:
            space.spaceMetadata.imageUrl ||
            generateAvatarDataURI({ name: space?.spaceMetadata?.name, xmindId: space.spaceId, style: { fontSize: '16', fontWeight: '600' } }),
        },
      }
    })
})

const handleClose = async (isDeleted: boolean) => {
  if (isLoading.value) return
  await dialog.value?.closeDialogWithAnimation?.()
  resolve({ isDeleted, filesMigratedToSpaceId })
}

const deleteAnyway = async () => {
  const isDeleted = await useServiceStore().services.action.dialog.openTeamOrSpaceDeleteDialog({
    type: 'team-space',
    metadata: props.spaceMetadata,
  })
  handleClose(isDeleted)
}

const moveFiles = async () => {
  let targetSpaceId: string

  try {
    const res = (await handleSelectFolderDialog({
      spaces: spacesOptions.value,
      title: $T('Move to'),
      confirmText: $T('Move to'),
      cancelText: $T('Cancel'),
    })) as { folderId: string; name: string; teamId: string }
    targetSpaceId = res.folderId
  } catch (err) {
    return
  }

  isLoading.value = true
  let success: boolean
  await executeActionWithNotification({
    text: $T('Moving files...'),
    handler: async () => {
      if (!targetSpaceId) return false
      if (targetSpaceId === props.spaceMetadata.spaceId) return false

      await useCloudKitClient().migrateSpaceFiles({ spaceId: props.spaceMetadata.spaceId, targetSpaceId })
      success = true
      filesMigratedToSpaceId = targetSpaceId
      return success
    },
  })
  isLoading.value = false

  if (success) {
    deleteAnyway()
  }
}
</script>
