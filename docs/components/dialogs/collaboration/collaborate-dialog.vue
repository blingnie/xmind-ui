<template>
  <div :class="{ iphone: isIPhone, safari: isSafari }">
    <modal-dialog
      ref="dialog"
      :is-opened="true"
      :close-button="isPhoneSizeViewportWidth ? true : false"
      :width="520"
      :max-width="'90%'"
      :min-height="dialogMinHeight"
      :max-height="dialogMaxHeight"
      :title="dialogTitle"
      :dialog-header-class="dialogHeaderClass"
      :dialog-body-class="'!p-0'"
      :dialog-footer-class="'hidden'"
      @modal-dialog-close="handleClose"
    >
      <fw-loading
        v-if="!activatedComponent"
        class="h-full"
        :background-color="'rgba(0,0,0,0)'"
        :force-appearance="useAppStore().appearance === 'dark' ? 'dark' : 'light'"
      >
      </fw-loading>
      <keep-alive>
        <collaborate-invite
          v-if="activatedComponent === 'collaborate-invite'"
          :file-id="fileId"
          @email-invite="switchToEmailInvite"
          @manage="switchToManage"
          @close="handleClose"
        >
          <template #tab>
            <collaborate-tab :tabs="tabs" :dot-key="accessUnRestricted ? 'publish' : ''" :active="'invite'" class="tabs" @tab-selected="tabSelect" />
          </template>
        </collaborate-invite>
      </keep-alive>
      <keep-alive>
        <collaborate-embed
          v-if="activatedComponent === 'collaborate-embed'"
          :file-id="fileId"
          :is-accessible="accessMode !== 'private'"
          @publish="handlePublish"
          @close="handleClose"
        >
          <template #tab>
            <collaborate-tab :tabs="tabs" :dot-key="accessUnRestricted ? 'publish' : ''" :active="'embed'" class="tabs" @tab-selected="tabSelect" />
          </template>
        </collaborate-embed>
      </keep-alive>
      <keep-alive>
        <collaborate-export
          v-if="activatedComponent === 'collaborate-export'"
          :file-id="fileId"
          :file-title="fileTitle"
          :is-accessible="accessMode !== 'private'"
          @close="handleClose"
        >
          <template #tab>
            <collaborate-tab :tabs="tabs" :dot-key="accessUnRestricted ? 'publish' : ''" :active="'export'" class="tabs" @tab-selected="tabSelect" />
          </template>
        </collaborate-export>
      </keep-alive>

      <keep-alive>
        <collaborate-email-invite
          v-if="activatedComponent === 'collaborate-email-invite'"
          :file-id="fileId"
          :emails="payload?.emails"
          @back="switchToLinkInvite"
          @close="handleClose"
        />
      </keep-alive>
      <keep-alive>
        <collaborate-manage v-if="activatedComponent === 'collaborate-manage'" :file-id="fileId" @back="switchToLinkInvite" />
      </keep-alive>
      <!-- For invitee to manage share only -->
      <keep-alive>
        <collaborate-invitee-manage v-if="activatedComponent === 'collaborate-invitee-manage'" :file-id="fileId" @close="handleClose" />
      </keep-alive>

      <keep-alive>
        <collaborate-publish v-if="activatedComponent === 'collaborate-publish'" class="pb-2" :file-id="fileId" @close="handleClose">
          <template #tab>
            <collaborate-tab :tabs="tabs" :dot-key="accessUnRestricted ? 'publish' : ''" :active="'publish'" class="tabs" @tab-selected="tabSelect" />
          </template>
        </collaborate-publish>
      </keep-alive>

      <keep-alive>
        <collaborate-social
          v-if="activatedComponent === 'collaborate-social'"
          :file-id="fileId"
          :file-title="fileTitle"
          :is-accessible="accessMode !== 'private'"
          @close="handleClose"
          @publish="handlePublish"
        >
          <template #tab>
            <collaborate-tab :tabs="tabs" :dot-key="accessUnRestricted ? 'publish' : ''" :active="'social'" class="tabs" @tab-selected="tabSelect" />
          </template>
        </collaborate-social>
      </keep-alive>
    </modal-dialog>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import ModalDialog from 'client/components/new-base-modal-dialog.vue'
import CollaborateInvite from './collaborate-invite.vue'
import CollaborateEmailInvite from './collaborate-email-invite.vue'
import CollaborateManage from './collaborate-manage.vue'
import CollaborateInviteeManage from './collaborate-invitee-manage.vue'
import CollaborateEmbed from './collaborate-embed.vue'
import CollaboratePublish from './collaborate-publish.vue'
import collaborateExport from './collaborate-export.vue'
import CollaborateSocial from './collaborate-social.vue'
import CollaborateTab from './collaborate-tab.vue'
import { useCollaborativeManagement } from 'app/services/collaborative/collaborative-management'

import { usePromiseHook } from 'utils/vue-utils'
import { trackCollaborateEmailInvite, trackCollaborateManageDialog, trackCollaboratePeopleDialog } from 'client/library/tracker'
import { useCollaborativeStore } from 'app/services/pinia'
import { $T } from 'client/library/translation'
import { useContextStore } from 'client/store/context-store'
import { useWindowResize } from 'client/composables/window-resize'
import { REGION } from 'client/constants'
import { useAppStore } from 'client/store/app-store'
import { toastActions } from 'client/library/new-notifications'

type TabKey = 'invite' | 'embed' | 'publish' | 'export' | 'social'
export type CollaborateDialogComponent =
  | 'collaborate-invite'
  | 'collaborate-email-invite'
  | 'collaborate-manage'
  | 'collaborate-invitee-manage'
  | 'collaborate-embed'
  | 'collaborate-publish'
  | 'collaborate-export'
  | 'collaborate-social'

const props = defineProps<{
  fileId: string
  initComponent?: CollaborateDialogComponent
  payload?: { emails: string[] }
}>()

const dialog = ref<InstanceType<typeof ModalDialog>>()
const { resolve } = usePromiseHook()
const { isPhoneSizeViewportWidth } = useWindowResize()

const {
  fetchCollaborativeMetadata,
  fetchFileInviteeProfiles,
  fetchFileAccessRequests,
  isFileOwnerSigned,
  isFileSharing,
  clearStates: clearCollaborativeManagementStates,
  accessMode,
  accessUnRestricted,
  isBrainstormFile,
  fileTitle,
  shareToWeb,
} = useCollaborativeManagement(props.fileId)

const handleClose = async () => {
  await dialog.value?.closeDialogWithAnimation?.()

  resolve(isFileSharing.value)
}

const handlePublish = async () => {
  if (await shareToWeb(true)) {
    toastActions.show({
      message: $T('Your map is now published—you can turn it off anytime in Share under Publish.'),
      topic: 'success',
      timeout: 5000,
    })
  }
}

const userAgent = navigator.userAgent
const isIPhone = /iPhone/i.test(userAgent)
const isSafari = /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)

const activatedComponent = ref<CollaborateDialogComponent | ''>('')

const tabs = computed<Array<{ key: TabKey; name: string }>>(() => {
  if (REGION === 'cn') {
    return useContextStore().contexts.isInHome
      ? [{ key: 'invite', name: $T('Invite') }]
      : [
          { key: 'invite', name: $T('Invite') },
          { key: 'export', name: $T('Export') },
        ]
  }
  if (isBrainstormFile.value) {
    return [{ key: 'invite', name: $T('Invite') }]
  }
  return useContextStore().contexts.isInHome
    ? [
        { key: 'invite', name: $T('Invite') },
        { key: 'publish', name: $T('Publish'), dotKey: accessUnRestricted ? 'publish' : '' },
        { key: 'embed', name: $T('Embed') },
        { key: 'social', name: $T('Social Media') },
      ]
    : [
        { key: 'invite', name: $T('Invite') },
        { key: 'publish', name: $T('Publish') },
        { key: 'embed', name: $T('Embed') },
        { key: 'export', name: $T('Export') },
        { key: 'social', name: $T('Social Media') },
      ]
})

const tabSelect = (key: TabKey) => {
  switch (key) {
    case 'invite':
      return switchToLinkInvite()
    case 'embed':
      return switchToEmbed()
    case 'publish':
      return switchToPublish()
    case 'social':
      return switchToSocial()
    case 'export':
      return switchToExport()
  }
}

const switchToEmailInvite = () => (activatedComponent.value = 'collaborate-email-invite')
const switchToLinkInvite = () => (activatedComponent.value = 'collaborate-invite')
const switchToManage = () => (activatedComponent.value = 'collaborate-manage')
const switchToEmbed = () => (activatedComponent.value = 'collaborate-embed')
const switchToPublish = () => (activatedComponent.value = 'collaborate-publish')
const switchToSocial = () => (activatedComponent.value = 'collaborate-social')
const switchToExport = () => (activatedComponent.value = 'collaborate-export')

const dialogTitle = computed(() => {
  switch (activatedComponent.value) {
    case 'collaborate-invite':
      return $T('Share')
    case 'collaborate-email-invite':
      return $T('Invite Collaborators')
    case 'collaborate-manage':
      return $T('Manage Access')
    case 'collaborate-invitee-manage':
      return $T('Share')
    case 'collaborate-embed':
      return $T('Share')
    case 'collaborate-publish':
      return $T('Share')
    case 'collaborate-social':
      return $T('Share')
    case 'collaborate-export':
      return $T('Share')
    default:
      return $T('Share')
  }
})

const dialogMinHeight = computed(() => {
  if (activatedComponent.value === 'collaborate-manage' || activatedComponent.value === 'collaborate-invitee-manage') {
    return '400px'
  } else {
    return 'auto'
  }
})
const dialogMaxHeight = computed(() => {
  if (activatedComponent.value === 'collaborate-manage' || activatedComponent.value === 'collaborate-invitee-manage') {
    return '600px'
  } else if (activatedComponent.value === 'collaborate-email-invite') {
    return 'calc(100vh - 32px)'
  } else {
    return 'auto'
  }
})
const dialogHeaderClass = computed(() => {
  if (activatedComponent.value === 'collaborate-manage' || activatedComponent.value === 'collaborate-invitee-manage') {
    return '!pb-4'
  } else {
    return ''
  }
})

onMounted(async () => {
  useContextStore().setContext('isInCollaborateDialog', true)

  await Promise.all([
    fetchCollaborativeMetadata(),
    fetchFileInviteeProfiles(),
    REGION !== 'cn' && fetchFileAccessRequests(),
    new Promise(resolve => setTimeout(resolve, 400)),
  ])

  if (props.initComponent) {
    activatedComponent.value = props.initComponent
  } else {
    activatedComponent.value = isFileOwnerSigned.value ? 'collaborate-invite' : 'collaborate-invitee-manage'
  }
})

onBeforeUnmount(() => {
  clearCollaborativeManagementStates()
  useContextStore().setContext('isInCollaborateDialog', false)
})

watch(
  () => activatedComponent.value,
  component => {
    switch (component) {
      case 'collaborate-manage':
        trackCollaborateManageDialog('collaborateManageDialog')
        break
      case 'collaborate-email-invite':
        trackCollaborateEmailInvite('collaborateEmailInvite')
        break
      case 'collaborate-invitee-manage':
        trackCollaboratePeopleDialog(useCollaborativeStore().connectionMode === 'readwrite' ? 'invitededitor' : 'invitedviewer')
        break
      default:
        break
    }
  },
)
</script>
