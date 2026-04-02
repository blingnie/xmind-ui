<template>
  <div class="flex flex-col gap-6 px-[24px]">
    <settings-change-name
      :name="space.spaceMetadata?.name"
      :handle-change-name="handleChangeName"
      :is-input-disabled="space.role !== 'owner' && !isOwnerOfSpaceBelongingTeam"
    />

    <settings-change-avatar
      :current-avatar="currentAvatar"
      :tip="$T('You can change the space icon, which appears in your space list.')"
      :is-upload-disabled="isDisableUploadAvatar"
      @upload="$emit('update-avatar')"
    />

    <template v-if="space.role !== 'owner'">
      <fw-divider />
      <settings-leave
        :heading="$T('Leave Space')"
        :tips="$T('After leaving the space, you won’t have access to the maps within the space anymore.')"
        :leave-button-text="$T('Leave Space')"
        @leave="$emit('leave-space')"
      />
    </template>

    <template v-if="space.role === 'owner' || isOwnerOfSpaceBelongingTeam">
      <fw-divider />
      <settings-delete
        :heading="$T('Delete Space')"
        :tips="
          $T(
            'Deleting this space will permanently remove all associated resources, including files, settings, and data. This action is irreversible.',
          )
        "
        :delete-button-text="$T('Permanently Delete Space')"
        @delete="$emit('delete-space')"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useTeamSpaceData } from 'app/composables/team-space-data'
import SettingsChangeName from '../settings-common/settings-change-name.vue'
import SettingsDelete from '../settings-common/settings-delete.vue'
import SettingsLeave from '../settings-common/settings-leave.vue'
import settingsChangeAvatar from '../settings-common/settings-change-avatar.vue'
import type { TeammateMetadata, SpaceListItem } from 'client/library/teams'
import { useAccountStore } from 'client/store'

const props = defineProps<{
  space: SpaceListItem
  handleChangeName?: (newName: string) => Promise<boolean>
}>()

defineEmits<{
  (e: 'delete-space'): void
  (e: 'leave-space'): void
  (e: 'update-avatar'): void
}>()

const teamOwner = ref<TeammateMetadata>(null)
const currentAvatar = computed(() => props.space?.spaceMetadata?.imageUrl ?? '')

const isDisableUploadAvatar = computed(() => {
  const teamId = props.space?.teamId
  const isTeamManagementRole = useTeamSpaceData().hasTeamManagementPermission(teamId)
  const isSpaceManagementRole = helpers.isManagementRole({ role: props.space?.role })
  const isManagementPermission = isTeamManagementRole || isSpaceManagementRole
  return !isManagementPermission || props?.space?.spaceMetadata?.category === 'preset'
})

const isOwnerOfSpaceBelongingTeam = computed(() => teamOwner.value?.userId === useAccountStore().userXmindId)

onMounted(() => {
  useTeamSpaceData()
    .getTeamOwner(props.space.teamId)
    .then(owner => {
      teamOwner.value = owner
    })
})
</script>
