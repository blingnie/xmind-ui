<template>
  <div class="flex h-full w-full flex-col items-center">
    <h1
      class="text-mobile-headline-small text-text-primary-light dark:text-text-primary-dark sm:text-desktop-headline-large self-start px-[16px] text-left sm:mb-[16px] sm:self-center sm:text-center"
    >
      {{ $T('Invite your team members') }}
    </h1>

    <base-divider class="!border-divider-onContainer-light dark:!border-divider-onContainer-dark mb-[24px] mt-[24px] block md:hidden" />

    <div class="flex w-[381px] max-w-full flex-col gap-6">
      <span
        class="text-mobile-body-large text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-body-large sm:mb-[8px] sm:text-center"
      >
        {{ $T('Xmind works better with your team members.') }}
      </span>
      <div v-if="inputMode === 'separately'" class="flex flex-col gap-3">
        <new-input
          v-for="(_, index) in INPUT_NUMBER"
          :key="index"
          v-model="planToInviteEmails[index]"
          size="large"
          :placeholder="REGION === 'cn' ? $T('Email or Phone') : $T('Email')"
          :is-auto-focus="index === inputFocusIndex"
          :disable-clear-icon="true"
          @focus="trackNewVersionWorks.newTeamInviteClick('Email')"
          @input="handleInputEmail()"
          @keydown.prevent.tab="focusNextInput(index)"
        />
        <button class="flex items-center gap-1 self-start" @click="toBulkInputMode">
          <icon name="add" />
          <span class="text-mobile-subhead-mini sm:text-desktop-subhead-mini">{{ $T('Add more or bulk invite') }}</span>
        </button>
      </div>
      <div v-if="inputMode === 'bulk'" class="flex flex-col gap-2">
        <section
          class="border-border-quaternary-light bg-fill-surfaceBright-light focus-within:border-border-primary-light hover:border-border-tertiary-light hover:focus-within:border-border-primary-light dark:border-border-quaternary-dark dark:bg-fill-surfaceBright-dark dark:focus-within:border-border-primary-dark dark:hover:border-border-tertiary-dark dark:hover:focus-within:border-border-primary-dark relative flex w-full flex-col justify-between rounded border"
        >
          <email-capsule-input
            :preset-invite-emails="[...new Set(planToInviteEmails.filter(Boolean))]"
            :placeholder="$T('Enter emails to invite')"
            :is-support-c-n-phone="isSupportCNPhoneInput"
            class="max-h-[251px] min-h-[160px]"
            @update-values="validEmails = $event"
            @update-all-input-emails="planToInviteEmails = $event"
          />
        </section>
        <p class="text-desktop-caption text-text-quaternary-light dark:text-text-quaternary-dark">
          {{ $T('Type or paste in one or multiple emails separated by commas, spaces, or line breaks.') }}
        </p>
      </div>
      <section class="flex flex-col items-center justify-between gap-4">
        <base-button
          class="w-full gap-2"
          theme="default"
          :size="isPhoneSizeViewportWidth ? 'large' : 'medium'"
          :disabled="!inviteLink"
          @click="handleCopyInviteLink"
        >
          <template v-if="copiedState">
            <icon name="tick" />
            <span>{{ $T('Invite link copied') }}</span>
          </template>
          <template v-else>
            <icon name="note-link" />
            <span>{{ $T('Copy invite link') }}</span>
          </template>
        </base-button>
        <base-button
          class="w-full"
          :size="isPhoneSizeViewportWidth ? 'large' : 'medium'"
          theme="secondary"
          :disabled="validEmails.length !== planToInviteEmails.filter(Boolean).length"
          @click="handleSendInvitations"
        >
          <span v-if="validEmails.length <= 0">{{ $T('Take me to Xmind') }}</span>
          <span v-else>{{ $T('Invite and take me to Xmind') }}</span>
        </base-button>
      </section>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useTeamsClient } from 'app/composables/team-client'
import NewInput from 'client/components/base/input.vue'
import baseButton from 'client/components/base/button.vue'
import EmailCapsuleInput from 'client/components/email-capsule-input.vue'
import BaseDivider from 'client/components/base/divider.vue'
import Icon from 'client/components/icon/icon.vue'
import { InviteTooFrequentlyError } from 'client/library/cloud-kit'
import { toastActions } from 'client/library/new-notifications'
import debounce from 'utils/debounce'
import { useTeamInviteLink } from './use-invite-link'
import { trackNewVersionWorks } from 'client/library/tracker'
import { isValidEmail } from 'utils/check-email'
import { useWindowResize } from 'client/composables/window-resize'
import { useTeamSpaceData } from 'app/composables/team-space-data'
import { REGION } from 'client/constants'
const props = defineProps<{ teamId: string }>()
const emit = defineEmits(['next'])

const { isPhoneSizeViewportWidth } = useWindowResize()
const isSupportCNPhoneInput = REGION === 'cn'
const inputMode = ref<'separately' | 'bulk'>('separately')
const toBulkInputMode = () => {
  inputMode.value = 'bulk'
  trackNewVersionWorks.newTeamInviteClick('AddMore')
}

const planToInviteEmails = ref<string[]>([])
const validEmails = ref<string[]>([])

const handleInputEmail = () => {
  validEmails.value = planToInviteEmails.value.filter(isValidEmail)
}

const handleSendInvitations = debounce(async () => {
  trackNewVersionWorks.newTeamInviteClick('TakeMeToXmindAI')
  if (validEmails.value.length === 0) {
    emit('next')
    return
  }

  try {
    if (
      await useTeamsClient().inviteTeammatesByEmail({
        teamId: props.teamId,
        role: 'editor',
        emails: validEmails.value,
      })
    ) {
      // toastActions.teamEmailInvitationSent()
      // trackTeam.teamInvitePop('SendInvitation')
      // Invoke refresh team panel team member list
      trackNewVersionWorks.newTeamInviteNum(validEmails.value.length)
      useTeamSpaceData().fetchTeammates(props.teamId, true)
      emit('next')
    } else {
      toastActions.teamEmailInvitationFailed()
    }
  } catch (err) {
    if (err instanceof InviteTooFrequentlyError) {
      toastActions.teamEmailInviteTooFrequentlyError()
    }
  }
}, 300)

const { inviteLink, refreshInviteLink, copyInviteLink } = useTeamInviteLink(props.teamId)
const { start: startRefreshInviteLink, stop: stopRefreshInviteLink } = refreshInviteLink()
onMounted(() => startRefreshInviteLink())
onBeforeUnmount(() => stopRefreshInviteLink())

const copiedState = ref(false)
const showInviteLinkCopied = () => {
  copiedState.value = true
  setTimeout(() => (copiedState.value = false), 3000)
}

const handleCopyInviteLink = debounce(async () => {
  trackNewVersionWorks.newTeamInviteClick('CopyInviteLink')
  const success = await copyInviteLink()
  if (success) {
    showInviteLinkCopied()
  }
}, 300)

const INPUT_NUMBER = 3
const inputFocusIndex = ref(0)
const focusNextInput = index => (inputFocusIndex.value = (index + 1) % INPUT_NUMBER)
</script>
