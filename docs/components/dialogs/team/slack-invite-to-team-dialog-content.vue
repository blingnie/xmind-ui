<template>
  <div class="flex h-full flex-col overflow-hidden" :class="{ stretch: isPhoneSizeViewportWidth && connectStatus === 'connected' }">
    <div class="relative h-full w-full max-w-full overflow-hidden px-6 pb-6 text-desktop-body-1" tabindex="-1">
      <div class="flex h-full w-full flex-col overflow-hidden">
        <team-seats-billing-tips
          :team-id="teamId"
          :is-reach-team-member-limit="isReachTeamMemberLimit"
          :team-member-total-invites-count="teamMemberTotalInvitesCount"
          :valid-emails-length="validEmails.length"
        />

        <div class="flex h-full flex-col overflow-hidden">
          <div v-if="connectStatus === 'fetching'" class="flex h-[183px] w-full items-center justify-center">
            <loading :background-color="'rgba(0,0,0,0)'" :force-appearance="useAppStore().appearance === 'dark' ? 'dark' : 'light'" />
          </div>
          <template v-else-if="connectStatus === 'connected'">
            <fw-input v-model="searchInput" front-icon-name="search" :placeholder="$T('Search contacts in your Slack account')" />
            <div class="my-4 flex items-center gap-2 text-text-primary-light dark:text-text-primary-dark sm:my-5">
              <fw-checkbox :model-value="isSelectAll" @update:model-value="toggleSelectAll" />
              <span class="text-desktop-body-medium">{{ $T('Select all') }}</span>
            </div>
            <fw-divider v-if="isTeammatesListScrolling" />
            <div ref="teammatesListRef" class="flex w-full flex-grow flex-col gap-2 overflow-auto sm:h-[300px] sm:gap-1">
              <fw-checkbox-item
                v-for="teammate in slackTeammatesComposed"
                :key="teammate.id"
                v-model="checkedTeammates[teammate.id]"
                class="w-full"
                :disabled="!!teammate.inviteStatus"
              >
                <fw-member-item
                  class="flex-1 px-1 py-2"
                  :avatar-url="
                    teammate.avatarUrl ?? generateAvatarDataURI({ name: teammate.name, xmindId: teammate.id, style: { fontWeight: '600' } })
                  "
                  :name="teammate.name"
                  :sub-info="teammate.email"
                  :invite-status-text="computeInviteStatusText(teammate.inviteStatus)"
                  :is-self="teammate.isMe"
                />
              </fw-checkbox-item>
            </div>
          </template>
          <template v-else>
            <div
              class="flex h-[183px] w-full flex-col items-center justify-center gap-2 rounded border border-border-muted-light bg-fill-surface-light px-5 font-NeverMind-UI dark:border-border-muted-dark dark:bg-fill-surface-dark"
            >
              <span class="text-mobile-subhead-mini text-text-primary-light dark:text-text-primary-dark sm:text-desktop-subhead-small">{{
                $T('Connect Slack to invite your team')
              }}</span>
              <span class="text-center text-mobile-caption-footer text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-caption">{{
                $T('Connect your Slack account to easily invite people from your organization.')
              }}</span>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div class="shrink-0 border-t border-divider-onSurfaceBright-light px-6 pb-8 pt-4 dark:border-divider-onSurfaceBright-dark sm:pb-[18px]">
      <div class="flex items-center justify-between gap-2">
        <base-button v-if="!isPhoneSizeViewportWidth" theme="default" size="medium" @click="emits('close')">{{ $T('Cancel') }}</base-button>
        <div class="contents items-center gap-2 sm:flex">
          <base-button
            v-if="connectStatus === 'disconnected'"
            theme="secondary"
            size="medium"
            class="flex-1 sm:flex-auto"
            @click="handleSlackOAuthConnect"
            >{{ $T('Connect') }}</base-button
          >
          <base-button
            v-else-if="connectStatus === 'connected'"
            class="flex-1 sm:flex-auto"
            theme="secondary"
            :size="isPhoneSizeViewportWidth ? 'large' : 'medium'"
            :disabled="validEmails.length <= 0 || isSendingInvites"
            @click="handleSendMailInvitations"
            >{{ sendInvitationsButtonText }}</base-button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useScroll } from '@vueuse/core'
import BaseButton from 'client/components/base/button.vue'
import Loading from 'client/components/composite/loading.vue'
import TeamSeatsBillingTips from './team-seats-billing-tips.vue'
import { useWindowResize } from 'client/composables/window-resize'
import { use3rdIntegrationClient } from 'app/composables/third-integration-client'
import { SlackConnectionNotFoundError, type SlackTeammate } from 'client/library/cloud-kit'
import { generateAvatarDataURI } from 'client/library/cloud-kit/utils/avatar'
import { useAccountStore, useAppStore } from 'client/store'
import { $T } from 'client/library/translation'

const props = defineProps<{
  teamId: string
  isReachTeamMemberLimit: boolean
  teamMemberTotalInvitesCount: number
  isSendingInvites: boolean
}>()

const emits = defineEmits<{
  (e: 'close'): void
  (e: 'invite', emails: string[]): void
}>()

const { isPhoneSizeViewportWidth } = useWindowResize()

const connectStatus = ref<'fetching' | 'connected' | 'disconnected'>('fetching')

const teammatesListRef = ref<HTMLElement>()

const searchInput = ref<string>('')
const slackTeammates = ref<(SlackTeammate & { isMe: boolean })[]>([])
const checkedTeammates = ref<Record<string, boolean>>({})

const validEmails = computed(() =>
  slackTeammates.value.filter(teammate => !teammate.inviteStatus && checkedTeammates.value[teammate.id]).map(teammate => teammate.email),
)

const computeInviteStatusText = (inviteStatus: SlackTeammate['inviteStatus']) => {
  switch (inviteStatus) {
    case 'pending':
      return $T('Already invited')
    case 'accepted':
      return $T('Already in your team')
    default:
      return ''
  }
}

const sendInvitationsButtonText = computed(() => {
  const count = validEmails.value.length
  if (count === 0) {
    return $T('Send Invitations')
  } else if (count === 1) {
    return $T('Send $1 Invitation', count.toString())
  } else {
    return $T('Send $1 Invitations', count.toString())
  }
})

const { y, isScrolling } = useScroll(teammatesListRef)

const isTeammatesListScrolling = computed(() => isScrolling.value || y.value > 0)

const isSelectAll = computed(() => {
  return slackTeammatesComposed.value.every(teammate => checkedTeammates.value[teammate.id])
})

const slackTeammatesComposed = computed(() => {
  const slackTeammatesSorted = [...slackTeammates.value].sort((a, b) => (a.inviteStatus ? 1 : 0) - (b.inviteStatus ? 1 : 0))
  const searchInputTrimmed = searchInput.value.trim().toLowerCase()

  if (!searchInputTrimmed) {
    return slackTeammatesSorted
  }

  return slackTeammatesSorted.filter(teammate => {
    return teammate.name.toLowerCase().includes(searchInputTrimmed) || teammate.email.toLowerCase().includes(searchInputTrimmed)
  })
})

const refreshSlackTeammates = async (silent?: boolean) => {
  try {
    if (!silent) {
      connectStatus.value = 'fetching'
    }
    const fechedSlackTeammates = await use3rdIntegrationClient().listSlackTeammates({ teamId: props.teamId })
    slackTeammates.value = fechedSlackTeammates.map(teammate => ({
      ...teammate,
      isMe: teammate.email === useAccountStore().profile?.primary_email?.toLowerCase(),
    }))
    slackTeammates.value
      .filter(teammate => !!teammate.inviteStatus)
      .forEach(teammate => {
        checkedTeammates.value[teammate.id] = true
      })
    connectStatus.value = 'connected'
  } catch (err) {
    logger.log('Failed to list Slack teammates: ', err)
    if (err instanceof SlackConnectionNotFoundError) {
      if (!silent) {
        connectStatus.value = 'disconnected'
      }
    }
  }
}

onMounted(async () => {
  refreshSlackTeammates()
})

const toggleSelectAll = (selected: boolean) => {
  slackTeammatesComposed.value
    .filter(teammate => !teammate.inviteStatus)
    .forEach(teammate => {
      checkedTeammates.value[teammate.id] = selected
    })
}

const handleSlackOAuthConnect = async () => {
  const oauthUrl = await use3rdIntegrationClient().getSlackOAuthUrl()
  if (oauthUrl) {
    window.open(oauthUrl, '_blank')
  }
  pollingSlackTeammates()
}

const handleSendMailInvitations = () => {
  emits('invite', validEmails.value)
}

let pollingIntervalTimer: number

const pollingSlackTeammates = () => {
  pollingIntervalTimer && window.clearInterval(pollingIntervalTimer)
  pollingIntervalTimer = window.setInterval(async () => {
    await refreshSlackTeammates(true)
    if (connectStatus.value === 'connected') {
      stopPollingSlackTeammates()
    }
  }, 5000)
}

const stopPollingSlackTeammates = () => {
  pollingIntervalTimer && window.clearInterval(pollingIntervalTimer)
}

onUnmounted(() => {
  stopPollingSlackTeammates()
})

defineExpose({
  reset: () => {
    refreshSlackTeammates()
  },
})
</script>
