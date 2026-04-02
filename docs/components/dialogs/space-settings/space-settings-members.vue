<template>
  <settings-members
    :members="computedSpaceMembers"
    :is-loading-members="isLoadingMembers"
    :is-show-invite="showInviteToSpace"
    :is-owner="space?.role === 'owner' || teamOwner?.userId === useAccountStore().userXmindId"
    :is-space-owner="space?.role === 'owner'"
    :build-menu-option="buildMenuOptions"
    :display-role="displayRole"
    @select-option="handleSelectOption"
    @invite="handleInviteToSpace"
  />
</template>

<script setup lang="ts">
import { useTeamSpaceData } from 'app/composables/team-space-data'
import SettingsMembers from '../settings-common/settings-members.vue'
import type { SpaceListItem, TeammateMetadata, TeamSpaceMemberMetadata } from 'client/library/teams'
import { computed, onMounted, ref } from 'vue'
import { $T } from 'client/library/translation'
import { useAccountStore, useServiceStore } from 'client/store'
import { normalizeTimestamp } from 'utils/misc'
import { useSpaceMembersMenu } from './use-space-members-menu'
import { useTeamSpaceStore } from 'app/services/pinia/team-space-store'

const props = defineProps<{
  space: SpaceListItem
}>()

const spaceMembers = computed<TeamSpaceMemberMetadata[]>(() => useTeamSpaceStore().getSpaceMembersData(props.space.spaceId) ?? [])
const isLoadingMembers = ref(false)

const teamId = computed(() => props.space.teamId)
const teamOwner = ref<TeammateMetadata>(null)

const handleFetchSpaceMembers = async () => {
  isLoadingMembers.value = true
  const [_, owner] = await Promise.all([
    useTeamSpaceData().fetchSpaceMembers(props.space.spaceId, true),
    useTeamSpaceData().getTeamOwner(teamId.value),
    useTeamSpaceData().refreshSpaceList(teamId.value),
  ])
  teamOwner.value = owner
  isLoadingMembers.value = false
}

const { buildMenuOptions, handleSelect } = useSpaceMembersMenu({ refreshSpaceMembersPanel: handleFetchSpaceMembers })

const handleSelectOption = (args: { option: string; member: TeamSpaceMemberMetadata }) => {
  const { option, member } = args
  handleSelect(option, props.space.spaceMetadata, member)
}

const showInviteToSpace = computed(() => props.space?.role === 'owner')

const computedSpaceMembers = computed(() => {
  const descFactor = -1
  const joinedMembers = spaceMembers.value.filter(member => member.inviteStatus !== 'pending')
  const pendingMembers = spaceMembers.value.filter(member => member.inviteStatus === 'pending')

  return [
    ...joinedMembers.sort((a, b) => descFactor * (normalizeTimestamp(a.joinedTime) - normalizeTimestamp(b.joinedTime))),
    ...pendingMembers.sort((a, b) => descFactor * (normalizeTimestamp(a.inviteTime) - normalizeTimestamp(b.inviteTime))),
  ] as TeamSpaceMemberMetadata[]
})

const handleInviteToSpace = () => {
  useServiceStore().services.action.dialog.openInviteSpaceMemberDialog({ teamId: props.space.teamId, spaceId: props.space.spaceId })
}

const displayRole = (memberMetadata: TeamSpaceMemberMetadata) => {
  if (teamOwner.value && memberMetadata?.userId === teamOwner.value?.userId) {
    return $T('Team Owner')
  }
  return memberMetadata.role === 'editor' ? $T('Editor') : $T('Viewer')
}

onMounted(async () => {
  await handleFetchSpaceMembers()
})
</script>
