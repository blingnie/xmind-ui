<template>
  <div class="contents">
    <div class="flex flex-col px-6 pt-4">
      <section class="relative">
        <div
          class="email-input border-border-quaternary-light bg-fill-surface-light focus-within:border-border-primary-light hover:border-border-primary-light dark:border-border-quaternary-dark dark:bg-fill-surface-dark dark:focus-within:border-border-primary-dark dark:hover:border-border-primary-dark relative flex flex-1 flex-col justify-between rounded border"
        >
          <email-capsule-input
            ref="emailInput"
            :key="emailInputKey"
            class="h-32 w-full"
            :preset-invite-emails="emails"
            :is-support-c-n-phone="isSupportCNPhoneInput"
            @update-values="$event => (validInputValues = $event)"
          />

          <fw-select
            class="absolute right-3 top-2 z-10"
            theme="muted"
            :selected-key="activatedEmailPermissionRole"
            :options="emailPermissionRoles"
            :position="isPhoneSizeViewportWidth ? 'bottom-center' : 'bottom-right'"
            :trigger-size="isPhoneSizeViewportWidth ? 'medium' : 'small'"
            :menu-custom-class="isPhoneSizeViewportWidth ? '!w-80' : '!w-36'"
            @select="selectEmailPermissionRole"
          />
        </div>
      </section>

      <section v-if="filteredSuggestEmails.length > 0" class="mt-4">
        <div class="text-desktop-subhead-mini w-full break-words">
          {{ $T('Suggest') }}
        </div>

        <div class="relative mt-3">
          <fw-divider v-if="!suggestScrollObserverIsVisible" class="absolute left-0 top-0 z-10 w-full" />

          <TransitionGroup tag="div" name="suggest-email" class="relative -mr-6 flex flex-wrap content-start gap-2 pr-6" :style="suggestListStyle">
            <div key="observer" ref="suggestScrollObserverRef" class="absolute left-0 top-0 h-0 w-full"></div>

            <div
              v-for="email in filteredSuggestEmails"
              :key="email"
              class="bg-mask-overlay-s-light text-icon-tertiary-light hover:bg-mask-overlay-m-light active:bg-mask-overlay-l-light dark:bg-mask-overlay-s-dark dark:text-icon-tertiary-dark dark:hover:bg-mask-overlay-m-dark dark:active:bg-mask-overlay-l-dark flex h-6 cursor-pointer items-center gap-1 rounded-xl pl-2 pr-3"
              @click="handleSuggestEmailClick(email)"
            >
              <fw-icon name="add" class="h-4 w-4" />
              <span class="text-mobile-body-medium text-text-secondary-light dark:text-text-secondary-dark sm:text-desktop-body-medium">{{
                email
              }}</span>
            </div>
          </TransitionGroup>
        </div>
      </section>
    </div>

    <fw-divider class="mb-4 mt-6" />

    <section class="flex items-center justify-between gap-2 px-6 pb-8 sm:pb-[18px]">
      <fw-button class="flex-1 sm:flex-initial" theme="default" :size="isPhoneSizeViewportWidth ? 'large' : 'small'" @click="back">
        {{ $T('Back') }}
      </fw-button>

      <div class="contents items-center gap-2 sm:flex">
        <fw-button v-if="!isPhoneSizeViewportWidth" class="flex-1 sm:flex-initial" theme="default" size="small" @click="$emit('close')">
          {{ $T('Cancel') }}
        </fw-button>
        <fw-button theme="secondary" :size="isPhoneSizeViewportWidth ? 'large' : 'small'" class="flex-1 sm:flex-auto" @click="sendEmailInvitation">
          {{ $T('Invite') }}
        </fw-button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onActivated, onMounted } from 'vue'
import { $T } from 'client/library/translation'
import { useCollaborativeManagement } from 'app/services/collaborative/collaborative-management'
import emailCapsuleInput from 'client/components/email-capsule-input.vue'
import { toastActions } from 'client/library/new-notifications'
import { trackCollaborateEmailInvite, trackNewVersionWorks } from 'client/library/tracker'
import {
  InviteTooFrequentlyError,
  InviteRecipientsLimitedError,
  ExceedInvitesThresholdError,
  InviteTooManyEmailsError,
} from 'client/library/cloud-kit'
import { useTeamSpaceData } from 'app/composables/team-space-data'
import { useServiceStore } from 'client/store'
import { REGION } from 'client/constants'
import { useWindowResize } from 'client/composables/window-resize'
import type { IconName } from 'client/components/icon/icons'
import { useElementVisibility, useWindowSize } from '@vueuse/core'

type Role = 'editor' | 'viewer'

const props = withDefaults(
  defineProps<{
    fileId: string
    emails?: string[]
  }>(),
  {},
)
const emit = defineEmits(['back', 'close'])

const { isPhoneSizeViewportWidth } = useWindowResize()
const { sendFileInvitations, teamId, writeLinkToClipboard } = useCollaborativeManagement(props.fileId)

const activatedEmailPermissionRole = ref<Role>('viewer')
const emailInput = ref()
const emailPermissionRoles = computed<{ key: Role; label: string; icon?: IconName }[]>(() => {
  return [
    {
      key: 'editor',
      label: $T('Can edit'),
      icon: (!useTeamSpaceData().getIsTeamSubscribedSync(teamId.value) ? 'lock-pro' : undefined) as IconName | undefined,
    },
    { key: 'viewer', label: $T('Can view') },
  ]
})
const validInputValues = ref<string[]>([])
const emailInputKey = ref(0)
const isSupportCNPhoneInput = REGION === 'cn'

const back = () => {
  emit('back')
  trackCollaborateEmailInvite('cancel')
}

const { getIsTeamSubscribedAsync } = useTeamSpaceData()

const selectEmailPermissionRole = async (role: Role) => {
  if (role === 'editor' && !(teamId.value && (await getIsTeamSubscribedAsync(teamId.value)))) {
    useServiceStore().services.action.dialog.openActivateDialog({ teamId: teamId.value, trackingAction: 'share_allow_editing' })
    trackNewVersionWorks.upgradeDialog('fromCollaborationPop')
    return
  }
  activatedEmailPermissionRole.value = role
  trackCollaborateEmailInvite('permissionChange')
}

const isSendingInvitation = ref(false)
const isSendInvitationAllowed = computed(() => validInputValues.value.length > 0 && !isSendingInvitation.value)

const sendEmailInvitation = async () => {
  if (isSendInvitationAllowed.value) {
    isSendingInvitation.value = true

    try {
      if (await sendFileInvitations(validInputValues.value, activatedEmailPermissionRole.value, '')) {
        await useServiceStore().services.storage.addRecentInviteEmails(validInputValues.value)

        isSupportCNPhoneInput && (await writeLinkToClipboard())
        emit('close')
        emailInputKey.value++
        trackCollaborateEmailInvite('sendInvitation')
      }
    } catch (error) {
      if (error instanceof InviteTooFrequentlyError) {
        toastActions.collaborativeInviteTooFrequentlyError()
      } else if (error instanceof InviteRecipientsLimitedError) {
        toastActions.collaborativeInviteRecipientsLimitedError()
      } else if (error instanceof ExceedInvitesThresholdError) {
        toastActions.collaborativeExceedInvitesThresholdError()
      } else if (error instanceof InviteTooManyEmailsError) {
        toastActions.collaborativeInviteTooManyEmailsError()
      }
    }

    isSendingInvitation.value = false
  }
}

const suggestEmails = ref<string[]>([])
const filteredSuggestEmails = computed(() => suggestEmails.value.filter(email => !validInputValues.value.includes(email)))
const suggestScrollObserverRef = ref<HTMLElement | null>(null)
const suggestScrollObserverIsVisible = useElementVisibility(suggestScrollObserverRef)

const { height: windowHeight } = useWindowSize()
const suggestListStyle = computed<Record<string, string>>(() => {
  if (!isPhoneSizeViewportWidth.value) return {}

  const contentExcludeEmailListHeight = 355
  const emailListMaxHeight = 312
  const availableHeight = windowHeight.value - 32 - contentExcludeEmailListHeight // keep 32px at least on the top

  if (availableHeight < emailListMaxHeight) {
    return {
      maxHeight: `${Math.max(80, availableHeight)}px`,
      overflowY: 'auto',
    }
  }

  return {}
})

const loadSuggestEmails = async () => {
  try {
    suggestEmails.value = await useServiceStore().services.storage.getRecentInviteEmails()
  } catch {
    suggestEmails.value = []
  }
}

const handleSuggestEmailClick = (email: string) => {
  if (!validInputValues.value.includes(email)) {
    emailInput.value?.addEmail(email)
  }
}

onMounted(() => {
  loadSuggestEmails()
})

onActivated(() => {
  emailInput.value?.focusEmailInput()
})
</script>

<style scoped>
.suggest-email-enter-active,
.suggest-email-leave-active {
  transition: all 0.2s ease;
}
.suggest-email-enter-from,
.suggest-email-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
.suggest-email-move {
  transition: transform 0.2s ease;
}

.email-input::before {
  content: '';
  position: absolute;
  top: 0;
  right: 1rem;
  width: 6rem;
  height: 2rem;
  border-top-right-radius: 4px;
  background: linear-gradient(180deg, rgb(250, 251, 252), rgb(250, 251, 252) 70%, transparent);
  z-index: 1;
  mask-image: linear-gradient(90deg, transparent, rgb(250, 251, 252) 20%);
  -webkit-mask-image: linear-gradient(90deg, transparent, rgb(250, 251, 252) 20%);
}

[color-scheme='dark'] .email-input::before {
  background: linear-gradient(180deg, rgb(32, 35, 38), rgb(32, 35, 38) 70%, transparent);
  mask-image: linear-gradient(90deg, transparent, rgb(32, 35, 38) 20%);
  -webkit-mask-image: linear-gradient(90deg, transparent, rgb(32, 35, 38) 20%);
}
</style>
