<template>
  <div class="flex h-full flex-col">
    <fw-divider v-if="!interactionObserverRefIsVisible" class="w-full" />

    <overlay-scrollbar class="relative flex-1 pb-[24px]">
      <div ref="interactionObserverRef" class="absolute top-0 h-0 w-full"></div>
      <div class="flex flex-1 flex-col gap-5 px-[24px]">
        <section class="flex items-center justify-between">
          <span class="text-mobile-body-medium text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-body-medium">
            {{ $T('Shared with $1 people', aggregatedCollaboratorProfiles.length.toString()) }}
          </span>
          <div class="flex items-center gap-3">
            <fw-button class="gap-1" theme="link" size="small" @click="copyShareLink">
              <fw-icon v-show="isShareLinkCopied" name="tick" width="16" height="16" />
              <fw-icon v-show="!isShareLinkCopied" name="note-link" width="16" height="16" />
              <span v-if="isShareLinkCopied">{{ $T('Share Link Copied') }}</span>
              <span v-else>{{ $T('Copy Share Link') }}</span>
            </fw-button>
            <fw-button v-if="isShowEmbedBtn" class="gap-1" theme="link" size="small" @click="copyEmbedLink">
              <fw-icon v-show="isEmbedLinkCopied" name="tick" width="16" height="16" />
              <fw-icon v-show="!isEmbedLinkCopied" name="double-arrow" class="rotate-90" width="16" height="16" />
              <span v-if="isEmbedLinkCopied">{{ $T('Embed Link Copied') }}</span>
              <span v-else>{{ $T('Get Embed') }}</span>
            </fw-button>
          </div>
        </section>

        <template v-for="collaborator in aggregatedCollaboratorProfiles" :key="collaborator.profile.xmindId">
          <member-card
            v-if="collaborator.type === 'invitee'"
            :xmind-id="collaborator.profile.xmindId"
            :team-id="teamId"
            :name="collaborator.profile.name"
            :avatar="collaborator.profile.avatarUrl"
            :role="collaborator.profile.isOwner ? 'owner' : collaborator.profile.role"
            :invite-method="collaborator.profile.inviteMethod"
            :button-mode="collaborator.profile.isMe && collaborator.profile.xmindId ? 'leave' : 'roleInfo'"
            @leave="handleLeave"
          />
          <access-requester-card
            v-else
            :xmind-id="collaborator.profile.xmindId"
            :team-id="teamId"
            :name="collaborator.profile.name"
            :avatar="collaborator.profile.avatarUrl"
            :role="collaborator.profile.role"
            :aggregated="collaborator.aggregated"
            :button-mode="collaborator.profile.isMe && collaborator.profile.xmindId ? 'leave' : 'roleInfo'"
            @leave="handleLeaveAsFileAccessRequester"
          />
        </template>
      </div>
    </overlay-scrollbar>

    <fw-divider class="mb-[16px]" />

    <section class="flex items-center justify-end px-[24px] pb-[32px] sm:pb-[18px]">
      <fw-button v-if="!isPhoneSizeViewportWidth" theme="default" :size="'small'" @click="emit('close')">
        {{ $T('Cancel') }}
      </fw-button>
      <fw-button v-else class="flex-1 gap-2" theme="default" size="large" @click="copyShareLink">
        <fw-icon v-show="isShareLinkCopied" name="tick" />
        <fw-icon v-show="!isShareLinkCopied" name="note-link" />
        <span v-if="isShareLinkCopied">{{ $T('Share Link Copied') }}</span>
        <span v-else>{{ $T('Copy Share Link') }}</span>
      </fw-button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { $T } from 'client/library/translation'
import MemberCard from './member-card.vue'
import AccessRequesterCard from './access-requester-card.vue'
import OverlayScrollbar from 'client/components/overlay-scrollbar.vue'
import { useCollaborativeManagement } from 'app/services/collaborative/collaborative-management'
import { trackCollaboratePeopleDialog, trackCollaborateShareEmbed } from 'client/library/tracker'
import * as Clipboard from 'utils/clipboard'
import { useAccountStore, useServiceStore } from 'app/services/pinia'
import { REGION } from 'client/constants'
import { useWindowResize } from 'client/composables/window-resize'
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

const isShareLinkCopied = ref(false)
const isEmbedLinkCopied = ref(false)

const {
  teamId,
  isBrainstormFile,
  removeCurrentUserAsInvitee,
  removeFileAccessRequest,
  writeLinkToClipboard,
  accessUnRestricted,
  aggregatedCollaboratorProfiles,
} = useCollaborativeManagement(props.fileId)

const isShowEmbedBtn = computed(() => !isPhoneSizeViewportWidth.value && REGION !== 'cn' && !isBrainstormFile.value && accessUnRestricted.value)

let copyShareLinkTimeout: ReturnType<typeof setTimeout> | null = null
const copyShareLink = async () => {
  await writeLinkToClipboard()
  isShareLinkCopied.value = true
  copyShareLinkTimeout && clearTimeout(copyShareLinkTimeout)
  copyShareLinkTimeout = setTimeout(() => {
    isShareLinkCopied.value = false
  }, 5000)
  trackCollaboratePeopleDialog('copysharelink')
}

const emit = defineEmits(['close'])

const handleLeave = async () => {
  if (
    await useServiceStore().services.action.dialog.confirm({
      title: $T('Leave Collaboration?'),
      width: 420,
      height: 250,
      description: $T('Are you sure you want to leave this collaboration? You may not be able to access this file anymore.'),
      confirmButtonText: $T('Leave'),
      cancelButtonText: $T('Cancel'),
    })
  ) {
    emit('close')

    await Promise.all([removeFileAccessRequest(useAccountStore().userXmindId), removeCurrentUserAsInvitee()])

    // Also need to exit editor
    await useServiceStore().services.action.editorNext.closeEditor.execute({ isForceClose: true })

    trackCollaboratePeopleDialog('leave')
  }
}

const handleLeaveAsFileAccessRequester = async () => {
  if (
    await useServiceStore().services.action.dialog.confirm({
      title: $T('Leave Collaboration?'),
      width: 420,
      height: 250,
      description: $T('Are you sure you want to leave this collaboration? You may not be able to access this file anymore.'),
      confirmButtonText: $T('Leave'),
      cancelButtonText: $T('Cancel'),
    })
  ) {
    emit('close')

    await Promise.all([removeFileAccessRequest(useAccountStore().userXmindId), removeCurrentUserAsInvitee()])

    // Also need to exit editor
    await useServiceStore().services.action.editorNext.closeEditor.execute({ isForceClose: true })

    trackCollaboratePeopleDialog('leave')
  }
}

let copyEmbedLinkTimeout: ReturnType<typeof setTimeout> | null = null
const copyEmbedLink = async () => {
  await Clipboard.write({
    'text/plain': new Blob(
      [
        `<iframe src="${window.location.origin}/embed/${props.fileId}" width="900px" height="540px" frameborder="0" scrolling="no" allow="fullscreen"></iframe>`,
      ],
      {
        type: 'text/plain',
      },
    ),
  })
  isEmbedLinkCopied.value = true
  copyEmbedLinkTimeout && clearTimeout(copyEmbedLinkTimeout)
  copyEmbedLinkTimeout = setTimeout(() => {
    isEmbedLinkCopied.value = false
  }, 5000)
  trackCollaborateShareEmbed()
}
</script>
