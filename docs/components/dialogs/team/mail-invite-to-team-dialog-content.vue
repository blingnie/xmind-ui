<template>
  <div class="flex flex-col">
    <div class="text-desktop-body-1 relative w-full max-w-full px-6 pb-6 pt-4" tabindex="-1">
      <div class="flex h-full w-full flex-col">
        <team-seats-billing-tips
          :team-id="teamId"
          :is-reach-team-member-limit="isReachTeamMemberLimit"
          :team-member-total-invites-count="teamMemberTotalInvitesCount"
          :valid-emails-length="validInputValues.length"
        />

        <section
          class="border-border-quaternary-light bg-fill-surface-light focus-within:border-border-primary-light hover:border-border-primary-light dark:border-border-quaternary-dark dark:bg-fill-surface-dark dark:focus-within:border-border-primary-dark dark:hover:border-border-primary-dark relative mb-[8px] flex w-full flex-col justify-between rounded border"
        >
          <email-capsule-input
            ref="emailInput"
            :key="emailInputKey"
            class="max-h-[251px] min-h-[160px]"
            :is-support-c-n-phone="isSupportCNPhone"
            @update-values="validInputValues = $event"
          />
        </section>

        <span class="text-desktop-caption text-text-quaternary-light dark:text-text-quaternary-dark">
          {{ placeholderText }}
        </span>
      </div>
    </div>

    <div class="border-divider-onSurfaceBright-light dark:border-divider-onSurfaceBright-dark shrink-0 border-t px-6 pb-8 pt-4 sm:pb-[18px]">
      <div class="flex items-center justify-between gap-2">
        <base-button v-if="!isPhoneSizeViewportWidth" theme="default" size="medium" @click="emits('close')">{{ $T('Cancel') }}</base-button>
        <div class="contents items-center gap-2 sm:flex">
          <base-button
            v-if="isShowCopyLink"
            class="flex-1 gap-1 sm:flex-auto"
            theme="default"
            :size="isPhoneSizeViewportWidth ? 'large' : 'medium'"
            :disabled="!inviteLink"
            @click="handleCopyInviteLink"
          >
            <template v-if="!isInviteLinkCopied">
              <fw-icon name="note-link" />
              <span>{{ $T('Copy Link') }}</span>
            </template>
            <template v-else>
              <fw-icon name="tick" />
              <span>{{ $T('Link Copied') }}</span>
            </template>
          </base-button>
          <base-button
            class="flex-1 sm:flex-auto"
            theme="secondary"
            :size="isPhoneSizeViewportWidth ? 'large' : 'medium'"
            :disabled="validInputValues.length <= 0 || isSendingInvites"
            @click="handleSendMailInvitations"
          >
            {{ sendInvitationsButtonText }}
          </base-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import debounce from 'utils/debounce'
import TeamSeatsBillingTips from './team-seats-billing-tips.vue'
import EmailCapsuleInput from 'client/components/email-capsule-input.vue'
import BaseButton from 'client/components/base/button.vue'
import { useTeamSpaceData } from 'app/composables/team-space-data'
import { $T, getCurrentLanguage } from 'client/library/translation'
import { useWindowResize } from 'client/composables/window-resize'
import { trackTeam } from 'client/library/tracker'
import { useTeamInviteLink } from './use-invite-link'
import { toastActions } from 'client/library/new-notifications'
import { TEAM_INVITE_LINK_EXPIRE_HOURS } from 'client/server-export'
import { REGION } from 'client/constants'
import { isValidEmail } from 'utils/check-email'
import { isValidCNPhone } from 'utils/check-cn-phone'

const props = defineProps<{
  teamId: string
  isReachTeamMemberLimit: boolean
  teamMemberTotalInvitesCount: number
  isSendingInvites: boolean
}>()

const emits = defineEmits<{
  (e: 'close'): void
  (e: 'invite', data: { emails: string[]; phones: string[] }): void
}>()

const { isPhoneSizeViewportWidth } = useWindowResize()

const emailInputKey = ref(0)
const emailInput = ref<InstanceType<typeof EmailCapsuleInput>>()

const isSupportCNPhone = REGION === 'cn'
const validInputValues = ref<string[]>([])
const validEmails = computed(() => validInputValues.value.filter(isValidEmail))
const validPhones = computed(() => (isSupportCNPhone ? validInputValues.value.filter(isValidCNPhone) : []))

const placeholderText = computed(() => {
  if (isSupportCNPhone) {
    return '输入或粘贴一个或多个手机号或电子邮件地址，使用逗号、空格或换行符分隔。'
  }
  return $T('Type or paste in one or multiple emails separated by commas, spaces, or line breaks.')
})

const sendInvitationsButtonText = computed(() => {
  const count = validInputValues.value.length
  const currentLang = getCurrentLanguage()
  const isChineseLang = currentLang === 'zh-Hans' || currentLang === 'zh-CN' || currentLang === 'zh-TW'

  if (isChineseLang) {
    return $T('Send Invitations')
  }

  if (count === 0) {
    return $T('Send Invitations')
  } else if (count === 1) {
    return $T('Send $1 Invitation', count.toString())
  } else {
    return $T('Send $1 Invitations', count.toString())
  }
})

const isShowCopyLink = computed(
  () =>
    useTeamSpaceData().getTeamPreference(props.teamId)?.enableTeamInviteLink && props.teamMemberTotalInvitesCount && !props.isReachTeamMemberLimit,
)
const handleSendMailInvitations = () => {
  emits('invite', {
    emails: validEmails.value,
    phones: validPhones.value,
  })
}

const isInviteLinkCopied = ref(false)
let inviteLinkCopyTimeout: ReturnType<typeof setTimeout> | null = null
const { inviteLink, refreshInviteLink, copyInviteLink } = useTeamInviteLink(props.teamId)
const handleCopyInviteLink = debounce(async () => {
  const success = await copyInviteLink()
  if (success) {
    isInviteLinkCopied.value = true
    inviteLinkCopyTimeout && clearTimeout(inviteLinkCopyTimeout)
    inviteLinkCopyTimeout = setTimeout(() => {
      isInviteLinkCopied.value = false
    }, 5000)

    toastActions.show({
      topic: 'success',
      message: $T('This invite link will expire in $1 hours.', `${TEAM_INVITE_LINK_EXPIRE_HOURS}`),
    })
    trackTeam.teamInvitePop('CopyLink')
  }
}, 300)

const { start: startRefreshInviteLink, stop: stopRefreshInviteLink } = refreshInviteLink()

onMounted(async () => {
  await new Promise(resolve => setTimeout(resolve, 100))
  emailInput.value?.focusEmailInput?.()
  startRefreshInviteLink()
})

onBeforeUnmount(() => {
  stopRefreshInviteLink()
})

defineExpose({
  reset: () => {
    validInputValues.value = []
    emailInputKey.value++
  },
})
</script>
