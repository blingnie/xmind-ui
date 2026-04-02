<template>
  <settings-members
    :members="computedTeammates"
    :is-show-invite="showInviteToTeam"
    :is-loading-members="isLoadingTeammates"
    :is-owner="team.role === 'owner'"
    :is-admin="team.role === 'admin'"
    :build-menu-option="buildMenuOptions"
    :display-role="displayRole"
    @select-option="handleSelectOption"
    @invite="handleInviteToTeam"
  />
</template>

<script setup lang="ts">
import SettingsMembers from '../settings-common/settings-members.vue'
import { $T } from 'client/library/translation'
import type { TeammatePayload, TeamMetadata } from 'client/server-export'
import { computed, onMounted, ref, watch } from 'vue'
import { normalizeTimestamp } from 'utils/misc'
import { trackTeam } from 'client/library/tracker'
import { useTeammateMenu } from './use-teammate-menu'
import type { TeammateMetadata } from 'client/library/teams'
import { useHomeStore, useServiceStore, useTeamSpaceStore } from 'app/services/pinia'
import { useTeamSpaceData } from 'app/composables/team-space-data'

const props = defineProps<{
  team: TeamMetadata & { role: TeammatePayload['role'] }
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const teammates = computed<Array<TeammateMetadata>>(() => useTeamSpaceStore().getTeammatesData(props.team.teamId) ?? [])
const isLoadingTeammates = ref(false)

const handleFetchTeammates = async () => {
  isLoadingTeammates.value = true
  await useTeamSpaceData().fetchTeammates(props.team.teamId, true)
  isLoadingTeammates.value = false
}

const { buildMenuOptions, handleSelect } = useTeammateMenu({
  refreshTeammatesPanel: handleFetchTeammates,
  close: () => emit('close'),
})

const handleSelectOption = (args: { option: string; member: TeammateMetadata }) => {
  handleSelect(args.option, props.team, args.member)
}

const showInviteToTeam = computed(() => helpers.isManagementRole(props.team))

const computedTeammates = computed(() => {
  const descFactor = -1
  const joinedTeammates = teammates.value.filter(teammate => teammate.inviteStatus !== 'pending')
  const pendingTeammates = teammates.value.filter(teammate => teammate.inviteStatus === 'pending')

  return [
    ...joinedTeammates.sort((a, b) => descFactor * (normalizeTimestamp(a.joinedTime) - normalizeTimestamp(b.joinedTime))),
    ...pendingTeammates.sort((a, b) => descFactor * (normalizeTimestamp(a.inviteTime) - normalizeTimestamp(b.inviteTime))),
  ] as TeammateMetadata[]
})

const handleInviteToTeam = () => {
  useServiceStore().services.action.dialog.openInviteToTeamDialog({ teamId: props.team.teamId })
}

const displayRole = (memberMetadata: TeammateMetadata) => {
  if (memberMetadata.role === 'admin') return $T('Admin')
  return $T(memberMetadata.role === 'editor' ? 'Editor' : 'Viewer')
}

onMounted(async () => {
  await handleFetchTeammates()
  trackTeam.teamInviteEntry('TeamMemberInvite')
})

watch(
  () => useHomeStore().refreshTeamMembersListIndicator,
  async () => {
    await handleFetchTeammates()
  },
)
</script>
