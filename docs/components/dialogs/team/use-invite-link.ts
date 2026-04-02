import { ref } from 'vue'
import { useTeamsClient } from 'app/composables/team-client'
import * as Clipboard from 'utils/clipboard'
import { generateShortUUID } from 'utils/shortUUID'

export const useTeamInviteLink = (teamId: string) => {
  const inviteLink = ref('')

  const refreshInviteLink = (interval = 60_000) => {
    let stopRefresh = false
    const refresh = async () => {
      if (stopRefresh) {
        return
      }
      const key = await useTeamsClient().getTeamInviteLinkKey({ teamId })
      if (key) {
        inviteLink.value = `${window.location.origin}/team_invite/${key}`
      }
      await new Promise(resolve => setTimeout(resolve, interval))
      await refresh()
    }
    return {
      stop: () => {
        stopRefresh = true
      },
      start: () => {
        stopRefresh = false
        refresh()
      },
    }
  }

  const copyInviteLink = async () => {
    const hasInviteLink = Boolean(inviteLink.value)
    if (hasInviteLink) {
      await Clipboard.write({ 'text/plain': new Blob([inviteLink.value + `?xid=${generateShortUUID()}`], { type: 'text/plain' }) })
    }
    return hasInviteLink
  }

  return { inviteLink, refreshInviteLink, copyInviteLink }
}

export const useSpaceInviteLink = (spaceId: string) => {
  const inviteLink = ref('')

  const refreshInviteLink = (interval = 60_000) => {
    let stopRefresh = false
    const refresh = async () => {
      if (stopRefresh) {
        return
      }
      const key = await useTeamsClient().getSpaceInviteLink({ spaceId })
      if (key) {
        inviteLink.value = `${window.location.origin}/space_invite/${key}`
      }
      await new Promise(resolve => setTimeout(resolve, interval))
      await refresh()
    }
    return {
      stop: () => {
        stopRefresh = true
      },
      start: () => {
        stopRefresh = false
        refresh()
      },
    }
  }

  const copyInviteLink = async () => {
    const hasInviteLink = Boolean(inviteLink.value)
    if (hasInviteLink) {
      await Clipboard.write({ 'text/plain': new Blob([inviteLink.value + `?xid=${generateShortUUID()}`], { type: 'text/plain' }) })
    }
    return hasInviteLink
  }

  return { inviteLink, refreshInviteLink, copyInviteLink }
}
