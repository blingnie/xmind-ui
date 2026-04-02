import { useActionCompose } from 'app/composables/action-composes'
import { useTeamsClient } from 'app/composables/team-client'
import { useTeamSpaceData } from 'app/composables/team-space-data'
import { useUrlNavigator } from 'app/composables/url-navigator'
import { useTeam } from 'app/fragments/router-views/new-home/team/use-team'
import { useServices } from 'app/fragments/use-services'
import type { TeamSpaceMemberMetadata } from 'client/library/teams'
import { $T } from 'client/library/translation'
import type { TeamSpaceMetadata } from 'client/server-export'
import { useAccountStore } from 'client/store'

export const useSpaceMembersMenu = (args: { refreshSpaceMembersPanel: () => Promise<void> | void }) => {
  const { refreshSpaceMembersPanel } = args
  const { action } = useServices()
  const { selectedHomeSpaceId, selectedHomeTeamId } = useTeam()
  const { presetSpaceId } = useTeamSpaceData()

  const buildMenuOptions = ({
    member,
    isSpaceOwner,
  }: {
    isOwner: boolean
    member: TeamSpaceMemberMetadata
    isSpaceOwner: boolean
  }): { key: string; label: string }[] => {
    const isMenuSelectedMemberSpaceOwner = member.role === 'owner'
    const isMemberMySelf = member.userId === useAccountStore().userXmindId

    if (isMenuSelectedMemberSpaceOwner) return []

    const removeFromSpaceOption: { key: string; label: string } = isMemberMySelf
      ? { key: 'leave-space', label: $T('Leave Space') }
      : { key: 'remove-from-space', label: $T('Remove from Space') }

    if (isSpaceOwner) {
      return [{ key: 'transfer-space-owner', label: $T('Transfer Owner') }, removeFromSpaceOption]
    }

    return [removeFromSpaceOption]
  }

  const handleRemoveFromSpace = async (space: TeamSpaceMetadata, member: TeamSpaceMemberMetadata) => {
    const memberName = member.inviteStatus === 'pending' ? member.email.substring(0, member.email.indexOf('@')) : member.name
    const memberEmail = member.email ?? member.userIdOrEmail
    const proceed = await action.dialog.confirm({
      title: $T('Remove from Space'),
      description: $T('Are you sure you want to remove $1 from the space?', `${memberName} (${memberEmail})`),
      confirmButtonText: $T('Remove'),
      cancelButtonText: $T('Cancel'),
      confirmButtonType: 'danger',
    })
    if (!proceed) return
    const success = await useTeamsClient().removeTeamSpaceMember({ spaceId: space.spaceId, xmindId: member.userId })
    success && refreshSpaceMembersPanel()
  }

  const handleSelect = (
    option: 'remove-from-space' | 'leave-space' | 'transfer-space-owner' | string,
    space: TeamSpaceMetadata,
    member: TeamSpaceMemberMetadata,
  ) => {
    if (option === 'remove-from-space') {
      handleRemoveFromSpace(space, member)
    } else if (option === 'leave-space') {
      useActionCompose().handleLeaveSpaceWithConfirm({
        spaceId: space.spaceId,
        xmindId: member.userId,
        afterSuccess: () => {
          if (space.spaceId === selectedHomeSpaceId.value) {
            useUrlNavigator().changeHomeSectionRouter({
              section: 'team',
              teamId: selectedHomeTeamId.value,
              spaceId: presetSpaceId.value,
            })
          }
          useTeamSpaceData().refreshSpaceList(selectedHomeTeamId.value)
        },
      })
    } else if (option === 'transfer-space-owner') {
      useActionCompose().handleTransferSpaceOwnerWithConfirm({
        spaceId: space.spaceId,
        xmindId: member.userId,
        name: member.name,
        afterSuccess: () => {
          refreshSpaceMembersPanel()
        },
      })
    }
  }

  return {
    buildMenuOptions,
    handleSelect,
  }
}
