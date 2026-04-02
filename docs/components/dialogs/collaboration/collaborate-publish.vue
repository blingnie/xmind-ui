<template>
  <div class="contents">
    <div class="flex flex-col gap-4 px-[24px] sm:gap-6 sm:pt-[8px]">
      <slot name="tab"></slot>

      <div
        v-if="!shareToWebSwitch"
        class="flex h-40 flex-col items-center justify-center gap-2 rounded border border-border-muted-light bg-fill-surface-light p-6 text-center dark:border-border-muted-dark dark:bg-fill-surface-dark sm:h-36"
      >
        <fw-icon
          name="global"
          width="28"
          height="28"
          class="rounded-[6px] border-[0.5px] border-solid border-black/5 bg-fill-surfaceBright-light p-1 shadow-elevation-l1-light dark:bg-fill-surfaceBright-dark dark:shadow-elevation-l1-dark"
        />

        <span class="text-mobile-subhead-mini sm:text-desktop-subhead-mini">{{ $T('Publish Mind Map to the Web') }}</span>
        <span class="text-mobile-caption-footer text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-caption-footer">
          {{ $T('Anyone with the link can access the mind map without sign-in.') }}
        </span>
      </div>

      <template v-else>
        <div class="flex flex-col gap-2">
          <span class="text-mobile-subhead-mini sm:text-desktop-subhead-mini">{{ $T('The mind map is published on the web') }}</span>
          <div class="flex items-center gap-2">
            <fw-input v-model="shareLinkUrl" type="text" :disabled="true" class="flex-1" />
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1">
            <span class="text-mobile-subhead-mini sm:text-desktop-subhead-mini">{{ $T('Allow Editing') }}</span>
            <fw-icon v-if="!isPlanSubscribed" name="lock-pro" width="14" height="14" class="cursor-pointer" @click="showUpgradeDialog" />
          </div>
          <div @click.capture="handleShowUpgradeDialog">
            <fw-toggle
              :size="isPhoneSizeViewportWidth ? 'large' : 'small'"
              :toggle-for="'switch-access-role'"
              :checked="isAllowEdit"
              :disabled="!isPlanSubscribed"
              @toggle="clickSwitchAccessRole"
            />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <span class="text-mobile-subhead-mini sm:text-desktop-subhead-mini">{{ $T('Password') }}</span>
            <fw-toggle
              :size="isPhoneSizeViewportWidth ? 'large' : 'small'"
              :toggle-for="'switch-access-mode'"
              :checked="isPasswordAccess"
              @toggle="togglePasswordAccess"
            />
          </div>

          <div v-if="isPasswordAccess" class="flex items-center gap-3 sm:justify-start">
            <fw-input
              v-model="passwordInput"
              class="w-full sm:w-80"
              :class="{ 'hide-password': !isShowPasswordText }"
              :type="isShowPasswordText ? 'text' : 'password'"
              :autocomplete="'new-password'"
              :placeholder="$T('Enter Password')"
              :is-read-only="!isAllowChangePassword"
              @input-change="passwordInput = $event"
            >
              <template #clear-icon>
                <fw-icon v-show="isShowPasswordText" name="preview" @click="isShowPasswordText = !isShowPasswordText" />
                <fw-icon v-show="!isShowPasswordText" name="preview-slash" @click="isShowPasswordText = !isShowPasswordText" />
              </template>
            </fw-input>
            <fw-button
              v-if="isAllowChangePassword"
              class="shrink-0"
              theme="link"
              size="small"
              :disabled="!isSetPasswordBtnEnabled"
              @click="handlePasswordInput"
            >
              {{ $T('Set Password') }}
            </fw-button>
            <fw-button v-else class="shrink-0" theme="link" size="small" @click.prevent="handleChangePasswordButtonClicked">
              {{ $T('Change') }}
            </fw-button>
          </div>
          <div v-if="isPasswordAccess" class="flex items-center justify-start">
            <checkbox-item v-model="isPasswordInclude" :title="$T('Include password when copying')" />
          </div>
        </div>
      </template>
    </div>

    <fw-divider class="mb-[16px] mt-[32px]" />

    <section class="flex items-center justify-end gap-2 px-[24px] pb-[32px] sm:pb-[18px]">
      <template v-if="shareToWebSwitch">
        <fw-button
          class="flex-1 sm:flex-initial"
          theme="default"
          :size="isPhoneSizeViewportWidth ? 'large' : 'small'"
          :disabled="isTogglingShareToWeb"
          @click="toggleShareToWeb"
        >
          {{ $T('Unpublish') }}
        </fw-button>
        <fw-button class="flex-1 sm:flex-initial" theme="secondary" :size="isPhoneSizeViewportWidth ? 'large' : 'small'" @click="copyShareLink">
          <fw-icon v-show="isLinkCopied" name="tick" width="16" height="16" class="mr-1" />
          <span>{{ isLinkCopied ? $T('Link copied') : $T('Copy Link') }}</span>
        </fw-button>
      </template>
      <template v-else>
        <fw-button class="flex-1 sm:flex-initial" theme="default" :size="isPhoneSizeViewportWidth ? 'large' : 'small'" @click="$emit('close')">
          {{ $T('Cancel') }}
        </fw-button>
        <fw-button
          class="flex-1 sm:flex-initial"
          theme="secondary"
          :size="isPhoneSizeViewportWidth ? 'large' : 'small'"
          :disabled="isTogglingShareToWeb"
          @click="toggleShareToWeb"
        >
          {{ $T('Publish') }}
        </fw-button>
      </template>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onActivated, onBeforeUnmount } from 'vue'
import { useCollaborativeManagement } from 'app/services/collaborative/collaborative-management'
import { trackCollaborateShareToWeb, trackCollaborateShareToWebPermission, trackNewVersionWorks } from 'client/library/tracker'
import { toastActions } from 'client/library/new-notifications'
import { useTeamSpaceData } from 'app/composables/team-space-data'
import { useServiceStore } from 'client/store'
import { useWindowResize } from 'client/composables/window-resize'
import { generateStrongPwd } from 'utils/generate-strong-password'
import { getCurrentTrackingTab, useTracking } from 'client/composables/use-tracking'
import checkboxItem from 'client/components/composite/checkbox-item.vue'
import { $T } from 'client/library/translation'

const props = defineProps<{
  fileId: string
}>()

defineEmits<{
  (e: 'close'): void
}>()

const { isPhoneSizeViewportWidth } = useWindowResize()
const {
  accessUnRestricted,
  unrestrictedAccessMode,
  accessRole,
  // accessMode,
  accessPassword,
  changeAccessRole,
  setAccessPassword,
  writePublishedLinkToClipboard,
  shareToWeb,
  shareLinkUrl,
  teamId,
} = useCollaborativeManagement(props.fileId)

const shareToWebSwitch = ref(false)
const isLinkCopied = ref(false)
const isAllowChangePassword = ref(false)
const isShowPasswordText = ref(false)
const isPasswordInclude = ref(true)
const isAllowEdit = ref(accessRole.value === 'editor')
const isPasswordAccess = ref(unrestrictedAccessMode.value === 'password')
const passwordInput = ref<string>('')

const isSetPasswordBtnEnabled = computed(() => passwordInput.value && passwordInput.value !== accessPassword.value)

const isPlanSubscribed = computed(() => {
  return useTeamSpaceData().getIsTeamSubscribedSync(teamId.value)
})

let timeout: ReturnType<typeof setTimeout> | null = null
const flagIsLinkCopied = () => {
  isLinkCopied.value = true
  timeout && clearTimeout(timeout)
  timeout = setTimeout(() => {
    isLinkCopied.value = false
  }, 5000)
}

const copyShareLink = async () => {
  if (isPasswordAccess.value) {
    toastActions.show({ message: $T('For your security, avoid sharing links with passwords in public.'), topic: 'plain' })
  }
  await writePublishedLinkToClipboard(isPasswordInclude.value)
  flagIsLinkCopied()

  trackCollaborateShareToWebPermission('copy')
}

const handlePasswordInput = async () => {
  if (!isAllowChangePassword.value) {
    return
  }
  await setAccessPassword(passwordInput.value.trim())
  isAllowChangePassword.value = false
  isShowPasswordText.value = false
  toastActions.collaborativePasswordSet()

  trackCollaborateShareToWebPermission('setpassword')
}

// const cancelPassword = () => {
//   if (accessMode.value !== 'password') {
//     isPasswordAccess.value = false
//     passwordInput.value = ''
//   } else {
//     isAllowChangePassword.value = false
//     passwordInput.value = accessPassword.value
//     isShowPasswordText.value = false
//   }

//   trackCollaborateShareToWebPermission('cancel')
// }

const handleChangePasswordButtonClicked = () => {
  isAllowChangePassword.value = true
  passwordInput.value = ''

  trackCollaborateShareToWebPermission('change')
}

const isTogglingShareToWeb = ref(false)

const toggleShareToWeb = async () => {
  try {
    isTogglingShareToWeb.value = true
    const targetShareToWeb = !shareToWebSwitch.value

    if (targetShareToWeb) {
      isPasswordAccess.value = false
      await shareToWeb(true)
    } else {
      toastActions.disableShareToWeb()
      await shareToWeb(false)
    }
    shareToWebSwitch.value = targetShareToWeb
  } finally {
    isTogglingShareToWeb.value = false
  }
  trackCollaborateShareToWeb(shareToWebSwitch.value ? 'buttonToOpen' : 'buttonToClose')
  shareToWebSwitch.value ? trackNewVersionWorks.collaboratePublishClick() : trackNewVersionWorks.collaborateUnpublishClick()
  useTracking().trackClick('publish', { tab: getCurrentTrackingTab() })
}

const showUpgradeDialog = () => {
  useServiceStore().services.action.dialog.openActivateDialog({
    teamId: teamId.value,
    trackingAction: 'publish_allow_editing',
  })
  trackNewVersionWorks.upgradeDialog('fromPublishAllowEditing')
}

const handleShowUpgradeDialog = (event: MouseEvent) => {
  if (!isPlanSubscribed.value) {
    showUpgradeDialog()
    event.stopPropagation()
    return
  }
}

const clickSwitchAccessRole = (isEnable: boolean) => {
  isAllowEdit.value = isEnable
}

const togglePasswordAccess = async (isEnable: boolean) => {
  isPasswordAccess.value = isEnable
  if (isPasswordAccess.value) {
    passwordInput.value = generateStrongPwd()
    isPasswordInclude.value = true
    isShowPasswordText.value = true
    isAllowChangePassword.value = false
    await setAccessPassword(passwordInput.value.trim())
    toastActions.collaborativePasswordSet()
    trackCollaborateShareToWebPermission('setpassword')
  }
}

watch(isPasswordAccess, isPasswordAccess => {
  if (!isPasswordAccess) {
    unrestrictedAccessMode.value = 'anyone'
  }
})

watch(isAllowEdit, isAllowEdit => {
  changeAccessRole(isAllowEdit ? 'editor' : 'viewer')
})

const init = () => {
  passwordInput.value = accessPassword.value
  isAllowChangePassword.value = !accessPassword.value
  shareToWebSwitch.value = accessUnRestricted.value
}

onMounted(init)
onActivated(init)

onBeforeUnmount(() => {
  timeout && clearTimeout(timeout)
})
</script>

<style scoped>
.hide-password:deep(input) {
  -webkit-text-security: disc;
}
</style>
