<template>
  <div class="contents">
    <div class="flex flex-col gap-5 px-[24px] sm:pt-[8px]">
      <slot name="tab"></slot>

      <section
        v-if="!isTeamSubscribed"
        class="flex flex-col items-start gap-2 rounded-md bg-mask-overlay-s-light p-[12px] dark:bg-mask-overlay-s-dark"
      >
        <span class="text-mobile-body-medium text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-body-medium">
          {{ upgradeTips }}
        </span>
        <fw-button v-if="isTeamOwner" theme="link" size="small" @click="upgrade">
          <span>{{ REGION === 'cn' ? $T('Upgrade premium') : $T('Upgrade') }}</span>
          <span v-if="REGION === 'cn'">
            {{ $T('unlock real-time collaboration features.') }}
          </span>
        </fw-button>
      </section>

      <section class="flex flex-col gap-2">
        <span class="text-mobile-subhead-mini sm:text-desktop-subhead-mini">{{ $T('Invite Collaborators') }}</span>
        <fw-input
          v-model="enterEmailEmptyInput"
          class="cursor-pointer"
          type="text"
          :theme="'dim'"
          :custom-input-class="'cursor-pointer'"
          :is-read-only="true"
          :size="isPhoneSizeViewportWidth ? 'large' : 'medium'"
          :placeholder="$T('Enter Email to Invite')"
          @click.prevent="$emit('emailInvite')"
        ></fw-input>
      </section>

      <section v-if="isShowInviteSection && !isPresetSpace" class="flex flex-col gap-2">
        <span class="text-mobile-subhead-mini sm:text-desktop-subhead-mini">{{ $T('Space Authority') }}</span>
        <div class="group-authority-unit">
          <div class="flex max-w-full items-center gap-2 sm:max-w-[60%]">
            <team-space-avatar
              :image-url="spaceMetadata?.imageUrl"
              :type="spaceMetadata?.category === 'preset' ? 'presetSpace' : 'space'"
              class="shrink-0"
            />
            <span class="truncate text-mobile-body-medium sm:text-desktop-body-medium">{{ spaceNameLabel }}</span>
          </div>
          <fw-select
            class="w-full sm:w-fit"
            :selected-key="spaceMemberRole"
            :options="linkRoles"
            :position="isPhoneSizeViewportWidth ? 'bottom-left' : 'bottom-right'"
            :trigger-size="isPhoneSizeViewportWidth ? 'medium' : 'small'"
            :menu-custom-class="isPhoneSizeViewportWidth ? '!w-full' : '!w-36'"
            :menu-width-match-trigger="isPhoneSizeViewportWidth"
            @select="changeSpaceMemberRole"
          />
        </div>
      </section>

      <section v-if="isShowInviteSection" class="flex flex-col gap-2">
        <span class="text-mobile-subhead-mini sm:text-desktop-subhead-mini">{{ $T('Team Authority') }}</span>
        <div class="group-authority-unit">
          <div class="flex max-w-full items-center gap-2 sm:max-w-[60%]">
            <team-space-avatar :image-url="teamMetadata?.imageUrl" :type="'team'" class="shrink-0" />
            <span class="truncate text-mobile-body-large sm:text-desktop-body-medium">{{ teamNameLabel }}</span>
          </div>
          <fw-select
            class="w-full sm:w-fit"
            :selected-key="teammateRole"
            :options="linkRoles"
            :position="isPhoneSizeViewportWidth ? 'bottom-left' : 'bottom-right'"
            :trigger-size="isPhoneSizeViewportWidth ? 'medium' : 'small'"
            :menu-custom-class="isPhoneSizeViewportWidth ? '!w-full' : '!w-36'"
            :menu-width-match-trigger="isPhoneSizeViewportWidth"
            @select="changeTeammateRole"
          />
        </div>
      </section>
    </div>

    <fw-divider class="mb-[16px] mt-[32px]" />

    <section class="flex items-center justify-between gap-2 px-[24px] pb-[32px] sm:pb-[18px]">
      <button
        v-if="!isPhoneSizeViewportWidth"
        class="tw-button-tile tw-button-small relative flex flex-shrink-0 items-center gap-1"
        @click="$emit('manage')"
      >
        <fw-icon name="person" />
        <span class="text-mobile-subhead-mini sm:text-desktop-subhead-mini">{{ $T('Manage') }}</span>
        <span v-if="hasPendingAccessRequest" class="absolute right-0 top-0 block h-1 w-1 rounded-[2px] bg-xred-500"></span>
      </button>

      <div class="contents items-center gap-2 sm:flex">
        <fw-button
          v-if="isPhoneSizeViewportWidth"
          class="relative flex-1 gap-1"
          theme="default"
          :size="isPhoneSizeViewportWidth ? 'large' : 'small'"
          @click="$emit('manage')"
        >
          <fw-icon name="person" />
          <span>{{ $T('Manage') }}</span>
          <span v-if="hasPendingAccessRequest" class="absolute right-0 top-0 block h-1 w-1 rounded-[2px] bg-xred-500"></span>
        </fw-button>
        <fw-button v-else theme="default" size="small" @click="$emit('close')">{{ $T('Cancel') }}</fw-button>
        <fw-tooltip class="h-10 flex-1 sm:h-7">
          <fw-button
            class="w-full gap-1 whitespace-nowrap sm:flex-auto"
            theme="secondary"
            :size="isPhoneSizeViewportWidth ? 'large' : 'small'"
            @click="copyInviteLink"
          >
            <fw-icon v-show="!isLinkCopied" name="note-link" />
            <fw-icon v-show="isLinkCopied" name="tick" />
            <span>{{ linkText }}</span>
          </fw-button>
          <template #tooltip>
            {{ tooltipText }}
          </template>
        </fw-tooltip>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { $T } from 'client/library/translation'
import TeamSpaceAvatar from 'client/components/team-space-avatar.vue'
import { useCollaborativeManagement, CollaboratorTeammateRole } from 'app/services/collaborative/collaborative-management'
import { trackCollaborateInviteLink, trackNewVersionWorks } from 'client/library/tracker'
import { useTeamSpaceData } from 'app/composables/team-space-data'
import { TeammateMetadata } from 'client/library/teams'
import { useAccountStore, useServiceStore } from 'app/services/pinia'
import { REGION } from 'client/constants'
import { storeToRefs } from 'pinia'
import { useWindowResize } from 'client/composables/window-resize'

const props = withDefaults(
  defineProps<{
    fileId: string
  }>(),
  {},
)

defineEmits<{
  (e: 'emailInvite'): void
  (e: 'manage'): void
  (e: 'close'): void
}>()

const { isPhoneSizeViewportWidth } = useWindowResize()

const {
  inviteeCollaboratorProfiles,
  pendingFileAccessRequests,
  teammateRole,
  spaceMemberRole,
  accessMode,
  isPresetSpace,
  isBrainstormFile,
  changeTeammateRole,
  changeSpaceMemberRole,
  teamId,
  writeLinkToClipboard,
  teamName,
  spaceName,
  teamMetadata,
  spaceMetadata,
  isFileOwnerSigned,
} = useCollaborativeManagement(props.fileId)
const { isUserProSubscribed } = storeToRefs(useAccountStore())

const isLinkCopied = ref(false)
const enterEmailEmptyInput = ref('')

const linkRoles = computed<{ key: CollaboratorTeammateRole; label: string }[]>(() => {
  return [
    { key: 'editor', label: $T('Can Edit') },
    { key: 'viewer', label: $T('Can View') },
    { key: 'none', label: $T('No Access') },
  ]
})

const teamMemberList = ref<Array<TeammateMetadata>>([])

const teamNameLabel = computed(() => $T('Everyone at $1', teamName.value))
const spaceNameLabel = computed(() => $T('People in $1', spaceName.value))

const { defaultTeamId, getIsTeamSubscribedAsync } = useTeamSpaceData()

const isMyWorksTeam = computed(() => teamId.value === defaultTeamId.value)
const isShowInviteSection = computed(() => !isMyWorksTeam.value || teamMemberList.value.length > 1)
const isTeamOwner = computed(() => isMyWorksTeam.value || useTeamSpaceData().hasTeamManagementPermission(teamId.value))
const hasPendingAccessRequest = computed(() => isFileOwnerSigned.value && pendingFileAccessRequests.value?.length > 0)

const isTeamSubscribed = ref(false)
const refreshTeamSubscribedStatus = async () => {
  isTeamSubscribed.value = teamId.value ? await getIsTeamSubscribedAsync(teamId.value) : false
}
watch(teamId, refreshTeamSubscribedStatus, { immediate: true })

const tooltipText = computed(() => {
  if (accessMode.value != 'private') {
    return $T('This file is published, so anyone with the link can access the file without sign-in.')
  } else if (isMyWorksTeam.value) {
    if (inviteeCollaboratorProfiles.value.length == 1) {
      return $T('Only you can access this file, so the file link will only work for you.')
    } else {
      return $T('Only you and other invited collaborators will be able to view this file link.')
    }
  } else {
    if (teammateRole.value !== 'none') {
      // team have access
      return $T('This file has team access, so anyone in this team will be able to view the link.')
    } else {
      // team  have no access
      if (inviteeCollaboratorProfiles.value.length == 1) {
        return $T('Only you can access this file, so the file link will only work for you.')
      } else {
        return $T('Only you and other invited collaborators will be able to view this file link.')
      }
    }
  }
})

const linkText = computed(() => {
  if (isBrainstormFile.value) {
    return isLinkCopied.value ? $T('link copied') : $T('Copy Link')
  } else {
    return isLinkCopied.value ? $T('Map link copied') : $T('Copy Map Link')
  }
})

let timeout: ReturnType<typeof setTimeout> | null = null
const flagIsLinkCopied = () => {
  isLinkCopied.value = true
  timeout && clearTimeout(timeout)
  timeout = setTimeout(() => {
    isLinkCopied.value = false
  }, 5000)
}

const copyInviteLink = async () => {
  await writeLinkToClipboard(true)
  flagIsLinkCopied()

  trackCollaborateInviteLink('copyInviteLink')
  trackNewVersionWorks.collaborateCopyLink()
}

const upgradeTips = computed(() => {
  if (REGION === 'cn') {
    return $T(
      'My Works is on the $1, therefore this file can only be shared as a static webpage.',
      isUserProSubscribed.value ? 'Pro 版本' : '免费版本',
    )
  } else {
    if (isMyWorksTeam.value) {
      return $T(
        'My Works is on the $1, therefore this file can only be shared as a static webpage.',
        isUserProSubscribed.value ? $T('Pro Plan') : $T('Free Plan'),
      )
    } else {
      return $T('The current team is on the Free Plan, therefore this file can only be shared as a static webpage. ')
    }
  }
})

const upgrade = () => {
  useServiceStore().services.action.dialog.openActivateDialog({
    trackingName: 'fromCollaborationFreeNotice',
    teamId: teamId.value,
    trackingAction: 'share_and_collaborative',
  })
}

onMounted(() => {
  isMyWorksTeam.value &&
    useTeamSpaceData()
      .fetchTeammates(teamId.value, true)
      .then(teammates => {
        teamMemberList.value = teammates
      })
})

onBeforeUnmount(() => {
  timeout && clearTimeout(timeout)
})
</script>

<style scoped>
.group-authority-unit {
  @apply flex flex-wrap gap-3 rounded border border-border-muted-light bg-fill-surface-light p-[12px] dark:border-border-muted-dark dark:bg-fill-surface-dark sm:flex-nowrap sm:justify-between sm:p-[16px];
}
</style>
