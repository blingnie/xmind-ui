<template>
  <div class="flex h-full flex-col">
    <fw-divider v-if="!interactionObserverRefIsVisible" class="w-full" />

    <overlay-scrollbar class="relative flex-1 pb-[24px]">
      <div ref="interactionObserverRef" class="absolute top-0 h-0 w-full"></div>
      <div class="flex flex-col gap-5 px-[24px]">
        <section v-if="isFileOwnerSigned && pendingFileAccessRequests.length > 0" class="flex flex-col gap-4">
          <span class="text-mobile-body-medium text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-body-medium">
            {{ $T('Request to Access') }}
          </span>
          <pending-access-requester-card
            v-for="request in pendingFileAccessRequests"
            :key="request.userId"
            :xmind-id="request.userId"
            :email="request.email"
            :name="request.name"
            :avatar="request.avatarUrl"
            @approve="handleApproveRequest"
            @deny="handleDenyRequest"
          />
        </section>

        <section class="flex flex-col gap-4">
          <span class="text-mobile-body-medium text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-body-medium">
            {{ $T('People with Access') }}
          </span>
          <template v-for="collaborator in aggregatedCollaboratorProfiles" :key="collaborator.profile.xmindId">
            <member-card
              v-if="collaborator.type === 'invitee'"
              :xmind-id="collaborator.profile.xmindId"
              :account-id="collaborator.profile.profileAccountId"
              :team-id="teamId"
              :name="collaborator.profile.name"
              :email="collaborator.profile.email"
              :avatar="collaborator.profile.avatarUrl"
              :phone="collaborator.profile.phone"
              :role="collaborator.profile.isOwner ? 'owner' : collaborator.profile.role"
              :invite-method="collaborator.profile.inviteMethod"
              :aggregated="collaborator.aggregated"
              :button-mode="collaborator.profile.isOwner || (!collaborator.profile.xmindId && !collaborator.profile.email) ? 'roleCan' : 'roleEdit'"
              :role-icon="isVisitor(collaborator.profile) ? visitorPermissionIcon : ''"
              :role-icon-tooltip="$T('This person can edit/view, because the mind map is set to allow editing/viewing by anyone without sign-in.')"
              @role-change="setInviteeRole"
              @user-remove="deleteInvitee"
            />
            <access-requester-card
              v-else
              :xmind-id="collaborator.profile.xmindId"
              :team-id="teamId"
              :name="collaborator.profile.name"
              :avatar="collaborator.profile.avatarUrl"
              :role="collaborator.profile.role"
              :button-mode="'roleEdit'"
              :aggregated="collaborator.aggregated"
              @role-change="setAccessRequestRole"
              @user-remove="deleteAccessRequest"
            />
          </template>
        </section>
      </div>
    </overlay-scrollbar>

    <fw-divider class="mb-[16px]" />

    <section class="flex items-center justify-start px-[24px] pb-[32px] sm:pb-[18px]">
      <fw-button class="flex-1 sm:flex-initial" theme="default" :size="isPhoneSizeViewportWidth ? 'large' : 'small'" @click="back">
        {{ $T('Back') }}
      </fw-button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import toURL from 'utils/to-url'
import { useWindowResize } from 'client/composables/window-resize'
import MemberCard from './member-card.vue'
import AccessRequesterCard from './access-requester-card.vue'
import PendingAccessRequesterCard from './pending-access-requester-card.vue'
import OverlayScrollbar from 'client/components/overlay-scrollbar.vue'

import { InviteeCollaboratorProfile, useCollaborativeManagement } from 'app/services/collaborative/collaborative-management'
import { trackCollaborateManageDialog } from 'client/library/tracker'
import { useFileAccessRequest } from 'app/composables/file-access-request'
import { useElementVisibility } from '@vueuse/core'

const props = withDefaults(
  defineProps<{
    fileId: string
  }>(),
  {},
)
const interactionObserverRef = ref<HTMLElement | null>(null)

const { isPhoneSizeViewportWidth } = useWindowResize()
const interactionObserverRefIsVisible = useElementVisibility(interactionObserverRef)

const {
  fetchFileInviteeProfiles,
  fetchFileAccessRequests,
  aggregatedCollaboratorProfiles,
  pendingFileAccessRequests,
  changeInviteeRole,
  removeInvitee,
  changeFileAccessRequestRole,
  removeFileAccessRequest,
  accessMode,
  teamId,
  isFileOwnerSigned,
} = useCollaborativeManagement(props.fileId)

const { approveFileAccessRequest, denyFileAccessRequest } = useFileAccessRequest()

const setInviteeRole = async args => {
  const { accountId, role, aggregated } = args
  await changeInviteeRole(accountId, role)

  if (aggregated) {
    await changeFileAccessRequestRole(accountId, role)
  }

  trackCollaborateManageDialog(role === 'editor' ? 'canedit' : 'canview')
}

const deleteInvitee = async args => {
  const { accountId, aggregated } = args
  await removeInvitee(accountId)

  if (aggregated) {
    await removeFileAccessRequest(accountId)
  }

  trackCollaborateManageDialog('remove')
}

const setAccessRequestRole = async args => {
  const { accountId, role, aggregated } = args
  await changeFileAccessRequestRole(accountId, role)

  if (aggregated) {
    await changeInviteeRole(accountId, role)
  }
}

const deleteAccessRequest = async args => {
  const { accountId, aggregated } = args
  await removeFileAccessRequest(accountId)

  if (aggregated) {
    await removeInvitee(accountId)
  }
}

const isVisitor = (inviteeProfile: InviteeCollaboratorProfile) => !inviteeProfile.xmindId && !inviteeProfile.email

const visitorPermissionIcon = computed(() => {
  switch (accessMode.value) {
    case 'anyone':
      return toURL('/assets/static/icons/universal.svg')
    case 'password':
      return toURL('/assets/static/icons/key.svg')
    default:
      return ''
  }
})

const handleApproveRequest = async (userId: string) => {
  await approveFileAccessRequest({
    fileId: props.fileId,
    requester: userId,
  })

  await refreshData()
}

const handleDenyRequest = async (userId: string) => {
  await denyFileAccessRequest({
    fileId: props.fileId,
    requester: userId,
  })

  await refreshData()
}

const refreshData = async () => {
  await Promise.all([fetchFileInviteeProfiles(), fetchFileAccessRequests()])
}

const emit = defineEmits(['back'])

const back = () => emit('back')
</script>
