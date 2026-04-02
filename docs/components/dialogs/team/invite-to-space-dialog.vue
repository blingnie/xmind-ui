<template>
  <modal-dialog
    ref="dialog"
    :is-opened="true"
    :close-button="isPhoneSizeViewportWidth ? true : false"
    :width="540"
    :max-width="'90%'"
    :title="$T('Add Members to Space')"
    :dialog-footer-class="'border-t border-divider-onSurfaceBright-light dark:border-divider-onSurfaceBright-dark'"
    :dialog-body-class="'!pt-4 !pb-0'"
    @modal-dialog-close="handleClose"
  >
    <div class="flex h-full w-full flex-col">
      <section ref="inviteInputContainer" class="relative mb-[8px] flex w-full flex-col justify-between overflow-visible">
        <fw-input
          v-model="inviteSearchInput"
          :placeholder="$T('Search people by name or emails in the team')"
          theme="dim"
          class="!py-2"
          type="text"
          :size="isPhoneSizeViewportWidth ? 'medium' : 'large'"
          front-icon-name="search"
          @focus="isInputFocused = true"
          @blur="isInputFocused = false"
        />
      </section>

      <div class="relative mt-4 sm:mt-5">
        <fw-divider v-if="!interactionObserverRefIsVisible" class="absolute left-0 top-0 w-full" />
        <section class="relative h-[356px] overflow-y-auto pb-4">
          <div ref="interactionObserverRef" class="absolute top-0 h-0 w-full"></div>
          <div v-if="isLoadingTeammates" class="flex h-full items-center justify-center">
            <loading :background-color="'rgba(0,0,0,0)'" :force-appearance="useAppStore().appearance === 'dark' ? 'dark' : 'light'" />
          </div>
          <div v-else-if="teammatesComposed.length" class="flex w-full flex-col gap-2 sm:gap-1">
            <fw-checkbox-item
              v-for="user of teammatesComposed"
              :key="user.userId"
              v-model="checkedUserIds[user.userId]"
              class="w-full"
              :disabled="user.isJoinedSpace"
            >
              <fw-member-item
                class="flex-1 px-1 py-2"
                :avatar-url="user.avatarUrl ?? generateAvatarDataURI({ name: user.fullName, xmindId: user.userId, style: { fontWeight: '600' } })"
                :invite-status="user.inviteStatus"
                :name="user.name"
                :sub-info="user.email ?? user.userIdOrEmail"
                :is-self="user.userId === useAccountStore().userXmindId"
              />
            </fw-checkbox-item>
          </div>
        </section>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between gap-2">
        <base-button v-if="!isPhoneSizeViewportWidth" theme="default" size="small" :disabled="isSendingInvites" @click="handleClose">{{
          $T('Cancel')
        }}</base-button>
        <div class="contents items-center gap-2 sm:flex">
          <base-button
            class="flex-1 gap-1 sm:flex-auto"
            theme="default"
            :size="isPhoneSizeViewportWidth ? 'large' : 'small'"
            :disabled="!inviteLink"
            @click="handleCopyInviteLink"
          >
            <template v-if="!isInviteLinkCopied">
              <icon name="note-link" />
              <span>{{ $T('Copy Link') }}</span>
            </template>
            <template v-else>
              <icon name="tick" />
              <span>{{ $T('Link Copied') }}</span>
            </template>
          </base-button>
          <base-button
            class="flex-1 sm:flex-auto"
            theme="secondary"
            :size="isPhoneSizeViewportWidth ? 'large' : 'small'"
            :disabled="inviteUserIds.length <= 0 || isSendingInvites"
            @click="handleAddMembers"
          >
            <span v-if="inviteUserIds.length && !isSendingInvites">{{
              inviteUserIds.length === 1 ? $T('Add 1 Member') : $T('Add $1 Members', `${inviteUserIds.length}`)
            }}</span>
            <span v-else>{{ $T('Add Members') }}</span>
          </base-button>
        </div>
      </div>
    </template>
  </modal-dialog>
</template>
<script lang="ts" setup>
import { ref, onBeforeUnmount, onMounted, computed } from 'vue'
import { $T } from 'client/library/translation'
import { usePromiseHook } from 'utils/vue-utils'
import ModalDialog from '../../new-base-modal-dialog.vue'
import BaseButton from 'client/components/base/button.vue'
import Icon from 'client/components/icon/icon.vue'
import loading from 'client/components/composite/loading.vue'
import { useTeamsClient } from 'app/composables/team-client'
import { toastActions } from 'client/library/new-notifications'
import { debounce } from 'utils/misc'
import { trackTeam } from 'client/library/tracker'
import { useTeamSpaceData } from 'app/composables/team-space-data'
import { useSpaceInviteLink } from './use-invite-link'
import { useWindowResize } from 'client/composables/window-resize'
import { useAppStore } from 'client/store/app-store'
import { useAccountStore } from 'client/store/account-store'
import type { TeammateMetadata } from 'client/library/teams/types'
import { generateAvatarDataURI } from 'client/library/cloud-kit/utils/avatar'
import { useElementVisibility } from '@vueuse/core'

const props = defineProps<{
  teamId: string
  spaceId: string
}>()

const dialog = ref<InstanceType<typeof ModalDialog>>()
const { isPhoneSizeViewportWidth } = useWindowResize()

const interactionObserverRef = ref<HTMLElement | null>(null)
const interactionObserverRefIsVisible = useElementVisibility(interactionObserverRef)

const isSendingInvites = ref(false)
const inviteInputContainer = ref<HTMLElement>()
const inviteSearchInput = ref('')
const isInputFocused = ref(false)
const checkedUserIds = ref<Record<string, boolean>>({})

const inviteUserIds = computed<Array<string>>(() => {
  const users = Object.entries(checkedUserIds.value)
    .filter(([_, isChecked]) => isChecked)
    .map(([userId]) => {
      const teammate = teammates.value.find(user => user.userId === userId)
      return teammate && !teammate?.isJoinedSpace ? userId : null
    })
    .filter(Boolean) as Array<string>
  return users
})

const teammates = ref<Array<TeammateMetadata & { isJoinedSpace: boolean }>>([])
const isLoadingTeammates = ref(false)

const teammatesComposed = computed(() => {
  const inputSearch = inviteSearchInput.value.trim().toLowerCase()
  const teammatesInputSorted = [...teammates.value].sort(a => (a.isJoinedSpace ? 1 : -1))
  if (inputSearch) {
    return teammatesInputSorted.filter(teammate => {
      const fullName = teammate.name.toLowerCase()
      const email = teammate.email.toLowerCase()
      return fullName.includes(inputSearch) || email.includes(inputSearch)
    })
  }
  return teammatesInputSorted
})

const handleFetchTeammates = async () => {
  isLoadingTeammates.value = true
  const [teammatesData, spaceMembers] = await Promise.all([
    useTeamSpaceData().fetchTeammates(props.teamId, true),
    useTeamSpaceData().fetchSpaceMembers(props.spaceId, true),
    new Promise(resolve => setTimeout(resolve, 400)), // Simulate delay
  ])

  teammates.value = teammatesData
    .filter(t => t.inviteStatus !== 'pending' && !!t.userId)
    .map(teammate => {
      const isJoinedSpace = spaceMembers.some(member => member.userId === teammate.userId)
      return { ...teammate, isJoinedSpace }
    })
    .filter(teammate => !teammate?.isJoinedSpace)
  teammates.value.forEach(teammate => {
    teammate.isJoinedSpace && (checkedUserIds.value[teammate.userId] = true)
  })

  isLoadingTeammates.value = false
}

const { resolve } = usePromiseHook()
const handleClose = async () => {
  if (isSendingInvites.value) return

  await dialog.value?.closeDialogWithAnimation?.()

  resolve(false)
}

const handleAddMembers = debounce(async () => {
  if (inviteUserIds.value.length === 0) {
    logger.warn('no user to invite')
    return
  }

  if (isSendingInvites.value) return
  isSendingInvites.value = true

  try {
    if (
      await useTeamsClient().addSpaceMembers({
        spaceId: props.spaceId,
        xmindIds: inviteUserIds.value,
      })
    ) {
      toastActions.show({
        message: $T('Space members added.'),
        topic: 'success',
      })
      isSendingInvites.value = false
      // Invoke refresh space member list
      useTeamSpaceData().fetchSpaceMembers(props.spaceId, true)
      handleClose() // close dialog
    } else {
      toastActions.show({
        message: $T('Add space members failed.'),
        topic: 'failed',
      })
      toastActions.teamEmailInvitationFailed()
    }
  } catch (err) {
    // TODO handle error
    logger.error('send invitation failed', err)
  }

  isSendingInvites.value = false
  trackTeam.teamInvitePop('SendInvitation')
}, 300)

const isInviteLinkCopied = ref(false)
let inviteLinkCopyTimeout: ReturnType<typeof setTimeout> | null = null
const { inviteLink, refreshInviteLink, copyInviteLink } = useSpaceInviteLink(props.spaceId)
const handleCopyInviteLink = debounce(async () => {
  const success = await copyInviteLink()
  if (success) {
    isInviteLinkCopied.value = true
    inviteLinkCopyTimeout && clearTimeout(inviteLinkCopyTimeout)
    inviteLinkCopyTimeout = setTimeout(() => {
      isInviteLinkCopied.value = false
    }, 5000)
    // toastActions.inviteLinkCopied()
    trackTeam.teamInvitePop('CopyLink')
  }
}, 300)

const { start: startRefreshInviteLink, stop: stopRefreshInviteLink } = refreshInviteLink()
onMounted(() => {
  startRefreshInviteLink()
  handleFetchTeammates()
  trackTeam.teamInvitePop('PopShow')
})

onBeforeUnmount(() => {
  stopRefreshInviteLink()
})
</script>
