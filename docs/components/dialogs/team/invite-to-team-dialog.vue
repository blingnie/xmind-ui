<template>
  <modal-dialog
    ref="dialog"
    :is-opened="true"
    :close-button="isPhoneSizeViewportWidth ? true : false"
    :dialog-class="'rounded-xl'"
    :dialog-header-class="'hidden'"
    :dialog-body-class="'!p-0 !overflow-hidden'"
    :dialog-footer-class="'hidden'"
    :width="540"
    :height="dialogHeight"
    :max-height="'80vh'"
    :max-width="'90vw'"
    @modal-dialog-close="handleClose"
  >
    <div class="dialog-body uk-fw-modal-dialog relative flex h-full w-full max-w-full flex-col">
      <div
        class="bg-fill-surfaceBright-light shadow-elevation-l4-light dark:bg-fill-surfaceBright-dark dark:shadow-elevation-l4-dark flex h-full flex-col overflow-hidden rounded-xl rounded-b-none rounded-t-3xl sm:rounded-xl"
      >
        <div class="relative flex shrink-0 flex-row items-center justify-between px-6 pt-6">
          <div class="text-mobile-headline-small sm:text-desktop-headline-small w-full break-words">
            <span>
              {{ $T('Invite Members') }}
            </span>
          </div>
          <close v-if="isPhoneSizeViewportWidth" class="self-baseline" :class="['modal-dialog__close']" @click="handleClose" />
        </div>

        <div class="flex flex-col px-6 pt-4" v-if="REGION !== 'cn'">
          <fw-tab :active="activeTab" :tabs="tabs" @tab-selected="activeTab = $event">
            <template #tab-item="{ tab }">
              <div class="flex items-center gap-1">
                <fw-icon :name="tab.icon" class="h-5 w-5" />
                <span>{{ tab.name }}</span>
              </div>
            </template>
          </fw-tab>
          <fw-divider />
        </div>

        <keep-alive>
          <component
            :is="tabs.find(tab => tab.key === activeTab)?.component"
            ref="dialogContent"
            :team-id="teamId"
            :is-reach-team-member-limit="isReachTeamMemberLimit"
            :team-member-total-invites-count="teamMemberTotalInvitesCount"
            :is-sending-invites="isSendingInvites"
            @close="handleClose"
            @invite="handleSendMailInvitations"
          />
        </keep-alive>
      </div>
    </div>
    <div class="absolute h-full w-full" style="z-index: -1" @click="handleClose"></div>
  </modal-dialog>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import type { Component } from 'vue'
import { $T } from 'client/library/translation'
import { usePromiseHook } from 'utils/vue-utils'
import ModalDialog from 'client/components/new-base-modal-dialog.vue'
import Close from 'client/components/base/close.vue'
import { trackTeam } from 'client/library/tracker'
import { useWindowResize } from 'client/composables/window-resize'
import MailInviteToTeamDialogContent from './mail-invite-to-team-dialog-content.vue'
import SlackInviteToTeamDialogContent from './slack-invite-to-team-dialog-content.vue'
import { useTeamsClient } from 'app/composables/team-client'
import { toastActions } from 'client/library/new-notifications'
import { InvitePaymentNeeds2ndConfirmationError, InviteTooFrequentlyError, InviteTooManyEmailsError } from 'client/library/cloud-kit/errors'
import { useServiceStore } from 'client/store'
import { useTeamSpaceData } from 'app/composables/team-space-data'
import { useMutationObserver } from '@vueuse/core'
import type { IconName } from 'client/components/icon/icons'
import { REGION } from 'client/constants'

const props = defineProps<{
  teamId: string
}>()
const dialog = ref<InstanceType<typeof ModalDialog>>()
const { isPhoneSizeViewportWidth } = useWindowResize()

const activeTab = ref('mail-invite')

const tabs = computed<Array<{ key: string; name: string; icon: IconName; component: Component }>>(
  () =>
    [
      { key: 'mail-invite', name: $T('Mail Invite'), icon: 'mail', component: MailInviteToTeamDialogContent },
      REGION !== 'cn' ? { key: 'slack-invite', name: $T('Slack Invite'), icon: 'slack', component: SlackInviteToTeamDialogContent } : null,
    ].filter(Boolean) as Array<{ key: string; name: string; icon: IconName; component: Component }>,
)

const { resolve } = usePromiseHook()
const handleClose = async () => {
  await dialog.value?.closeDialogWithAnimation?.()
  resolve(false)
}

const dialogContent = ref<InstanceType<typeof MailInviteToTeamDialogContent> | InstanceType<typeof SlackInviteToTeamDialogContent>>()

const isDialogHasStretchClass = ref<boolean>(false)
const dialogHeight = computed(() =>
  isPhoneSizeViewportWidth.value && activeTab.value === 'slack-invite' && isDialogHasStretchClass.value ? '100%' : 'auto',
)

useMutationObserver(
  dialogContent,
  mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const classList = (mutation.target as HTMLElement).classList
        // If the dialog body has a child with class "stretch", it will stretch to fill the height.
        isDialogHasStretchClass.value = classList.contains('stretch')
      }
    })
  },
  {
    attributes: true,
  },
)

const isReachTeamMemberLimit = ref(false)
const teamMemberTotalInvitesCount = ref<number>(0)

const refreshTeamMemberCountLimit = async () => {
  const data = await useTeamsClient().getTeamMemberCountLimit({ teamId: props.teamId })
  isReachTeamMemberLimit.value = data?.totalInvites >= data?.limit
  teamMemberTotalInvitesCount.value = data?.totalInvites
}

onMounted(async () => {
  await refreshTeamMemberCountLimit()

  trackTeam.teamInvitePop('PopShow')
})

const isSendingInvites = ref(false)

const handleSendMailInvitations = async (data: { emails: string[]; phones: string[] }) => {
  const { emails, phones } = data

  if (emails.length === 0 && phones.length === 0) return

  if (isSendingInvites.value) return
  isSendingInvites.value = true

  try {
    let success = false

    if (REGION === 'cn') {
      const result = await useTeamsClient().inviteTeammatesByCNContacts({
        teamId: props.teamId,
        role: 'editor',
        emails,
        phones,
      })

      if (result) {
        const { invalidEmails, invalidPhones } = result
        const invalidInvites = [...invalidEmails, ...invalidPhones]
        if (invalidInvites.length > 0) {
          useServiceStore().services.action.dialog.confirm({
            title: '部分邀请未成功发送',
            description: `我们无法发送邀请给以下手机号码或者邮箱：|
            ${invalidInvites.join(', ')}|
            |
            可能是账号不存在或手机号未绑定邮箱，建议检查一下或换个方式试试`,
            confirmButtonText: '我知道了',
            confirmButtonType: 'secondary',
            hiddenCancel: true,
            onConfirm: async () => true,
          })
        }
        success = true
      }
    } else {
      success = await useTeamsClient().inviteTeammatesByEmail({
        teamId: props.teamId,
        role: 'editor',
        emails,
      })
    }

    if (success) {
      toastActions.teamEmailInvitationSent()
      // Invoke refresh team panel teammates list
      await Promise.all([useTeamSpaceData().fetchTeammates(props.teamId, true), refreshTeamMemberCountLimit()])
      dialogContent.value?.reset?.()
    } else {
      toastActions.teamEmailInvitationFailed()
    }
  } catch (err) {
    if (err instanceof InviteTooFrequentlyError) {
      toastActions.teamEmailInviteTooFrequentlyError()
    } else if (err instanceof InvitePaymentNeeds2ndConfirmationError) {
      const onConfirm = () => {
        handleClose()
        useServiceStore().services.action.dialog.openChangeTeamSeatsDialog({ teamId: props.teamId })
      }
      const { hide } = toastActions.notifyInviteByEmailNeeds2ndConfirmation(onConfirm)
      window.setTimeout(hide, 10000)
    } else if (err instanceof InviteTooManyEmailsError) {
      toastActions.teamEmailInviteTooManyEmailsError()
    }
  }

  isSendingInvites.value = false
  trackTeam.teamInvitePop('SendInvitation')
}
</script>
