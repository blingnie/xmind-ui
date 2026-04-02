import type { PlusAccount, TeamMetadata } from 'client/server-export'
import { $T } from 'client/library/translation'
import { useServices } from 'app/fragments/use-services'
import type { TeammateMetadata } from 'client/library/teams'
import { useTeamsClient } from 'app/composables/team-client'
import { useUrlNavigator } from 'app/composables/url-navigator'
import { useActionCompose } from 'app/composables/action-composes'
import { useAccountStore } from 'client/store/account-store'
import { useGlobalEvents } from 'client/store/global-events'
import { useTeamSpaceData } from 'app/composables/team-space-data'

export const useTeammateMenu = (args: { refreshTeammatesPanel: () => Promise<void>; close: () => void }) => {
  const { refreshTeammatesPanel, close } = args
  const { action } = useServices()

  const buildMenuOptions = (args: {
    isOwner: boolean
    isAdmin: boolean
    member: TeammateMetadata
  }): { key: string; label: string; badge?: PlusAccount['plan'] }[] => {
    const { isOwner: isCurrentUserTeamOwner, member, isAdmin: isCurrentUserTeamAdmin } = args

    const isMemberTeamOwner = member.role === 'owner'
    const isMemberTeamAdmin = member.role === 'admin'
    const isMemberSelf = member.userId === useAccountStore().userXmindId
    const isTeamSubscribedAndBusinessPlanOrAbove = useTeamSpaceData().isTeamSubscribedAndBusinessPlanOrAbove(member.teamId)

    const adminOption: { key: string; label: string; badge?: PlusAccount['plan'] } = isMemberTeamAdmin
      ? { key: 'remove-admin', label: $T('Remove Admin'), badge: isTeamSubscribedAndBusinessPlanOrAbove ? null : 'business' }
      : { key: 'set-admin', label: $T('Set as Admin'), badge: isTeamSubscribedAndBusinessPlanOrAbove ? null : 'business' }

    const removeFromTeamOption: { key: string; label: string } = isMemberSelf
      ? { key: 'leave-team', label: $T('Leave Team') }
      : {
          key: 'remove-from-team',
          label: $T('Remove from Team'),
        }

    if (isCurrentUserTeamOwner && !isMemberTeamOwner) {
      return [{ key: 'transfer-owner', label: $T('Transfer Owner') }, adminOption, removeFromTeamOption]
    }

    if (isCurrentUserTeamAdmin && !isMemberTeamOwner) {
      return [removeFromTeamOption]
    }

    if (!isCurrentUserTeamOwner && !isMemberTeamOwner && !isMemberTeamAdmin) {
      return [removeFromTeamOption]
    }

    return []
  }

  const handleRemoveFromTeam = async (team: TeamMetadata, member: TeammateMetadata) => {
    const memberName = member.inviteStatus === 'pending' ? member.email.substring(0, member.email.indexOf('@')) : member.name
    const memberEmail = member.email ?? member.userIdOrEmail
    await action.dialog.confirm({
      title: $T('Remove from Team'),
      description: $T('Are you sure you want to remove $1 from the team?', `${memberName} (${memberEmail})`),
      confirmButtonText: $T('Remove'),
      cancelButtonText: $T('Cancel'),
      onConfirm: async () => {
        const success = await useTeamsClient().removeTeammate({ teamId: team.teamId, xmindId: member.userId, email: member.email })
        success && refreshTeammatesPanel()
        return success
      },
      confirmButtonType: 'danger',
    })
  }

  const handleSelect = (option: string, team: TeamMetadata, member: TeammateMetadata) => {
    if (option === 'remove-from-team') {
      handleRemoveFromTeam(team, member)
    }
    if (option === 'leave-team') {
      useActionCompose().handleLeaveTeamWithConfirm({
        teamId: team.teamId,
        xmindId: member.userId,
        afterSuccess: () => {
          if (useUrlNavigator().homeSectionTeamId.value === team.teamId) useUrlNavigator().changeHomeSectionRouter({ section: 'recents' })
        },
      })
    }
    if (option === 'set-admin') {
      const targetId = member.userId ?? member.userIdOrEmail
      useActionCompose().handleGiveMemberAdminAccessWithConfirm({
        teamId: team.teamId,
        xmindId: targetId,
        afterSuccess: () => {
          refreshTeammatesPanel()
        },
      })
    }

    if (option === 'remove-admin') {
      const targetId = member.userId ?? member.userIdOrEmail
      useActionCompose().handleRemoveMemberAdminAccessWithConfirm({
        teamId: team.teamId,
        xmindId: targetId,
        afterSuccess: () => {
          refreshTeammatesPanel()
        },
      })
    }

    if (option === 'transfer-owner') {
      useActionCompose().handleTransferOwnerWithConfirm({
        teamId: team.teamId,
        xmindId: member.userId,
        name: member.name,
        afterSuccess: () => {
          useUrlNavigator()
            .changeHomeSectionRouter({ section: 'recents', teamId: team.teamId })
            .then(() => useGlobalEvents().trigger('refreshHome'))
          close()
        },
      })
    }
  }

  return {
    buildMenuOptions,
    handleSelect,
  }
}
