<script lang="ts" setup>
import { computed, ref } from 'vue'
import { ThirdPartyAccountProvider } from 'client/types/account'
import { usePromiseHook } from 'utils/vue-utils'
import { useWindowResize } from 'client/composables/window-resize'
import ModalDialog from '../new-base-modal-dialog.vue'
import BaseButton from '../base/button.vue'
import Icon from 'client/components/icon/icon.vue'
import type { IconName } from 'client/components/icon/icons'

interface CloudProviderConfig {
  id: ThirdPartyAccountProvider
  icon: IconName
  title: string
}

defineProps<{
  onAuthorize: (provider: ThirdPartyAccountProvider, fullPermission: boolean) => void
}>()

const dialog = ref<InstanceType<typeof ModalDialog>>()
const { resolve } = usePromiseHook()
const { isPhoneSizeViewportWidth } = useWindowResize()

const isOpened = ref(false)
const selectedThirdPartyProvider = ref(ThirdPartyAccountProvider.Dropbox)

const selectedThirdPartyProviderName = computed(() => {
  switch (selectedThirdPartyProvider.value) {
    case ThirdPartyAccountProvider.Dropbox:
      return 'Dropbox'
    case ThirdPartyAccountProvider.GoogleDrive:
      return 'Google Drive'
    case ThirdPartyAccountProvider.Onedrive:
      return 'OneDrive'
    default:
      return 'Dropbox'
  }
})

const cloudProviderConfigs: CloudProviderConfig[] = [
  {
    id: ThirdPartyAccountProvider.Dropbox,
    icon: 'dropbox-color',
    title: 'Dropbox',
  },
  {
    id: ThirdPartyAccountProvider.GoogleDrive,
    icon: 'googledrive-color',
    title: 'Google Drive',
  },
  {
    id: ThirdPartyAccountProvider.Onedrive,
    icon: 'onedrive-color',
    title: 'OneDrive',
  },
]

const handleClose = async () => {
  await dialog.value?.closeDialogWithAnimation?.()

  isOpened.value = false
  resolve()
}
</script>

<template>
  <modal-dialog
    ref="dialog"
    :title="$T('Add External Storage')"
    :is-opened="true"
    :esc-close="true"
    :close-button="isPhoneSizeViewportWidth ? true : false"
    :width="500"
    :max-width="'90%'"
    :dialog-footer-class="'border-t border-divider-onSurfaceBright-light dark:border-divider-onSurfaceBright-dark'"
    @modal-dialog-close="handleClose"
  >
    <div class="mb-[24px] flex items-center gap-3">
      <div
        v-for="(config, index) in cloudProviderConfigs"
        :key="index"
        class="flex min-h-24 flex-1 cursor-pointer flex-col items-center justify-center gap-2 self-stretch rounded-lg border border-border-quaternary-light bg-fill-surfaceBright-light px-[8px] py-[20px] dark:border-border-quaternary-dark dark:bg-fill-surfaceBright-dark sm:px-[24px]"
        :class="{
          'border-transparent outline outline-border-primary-light dark:outline-border-primary-dark': config.id === selectedThirdPartyProvider,
        }"
        @click="selectedThirdPartyProvider = config.id"
      >
        <icon :name="config.icon" width="24" height="24" />
        <span class="text-center text-mobile-subhead-mini sm:text-desktop-subhead-mini">
          {{ config.title }}
        </span>
      </div>
    </div>

    <div class="flex flex-col gap-4">
      <span class="text-mobile-subhead-medium sm:text-desktop-subhead-medium">{{ $T('Connect With $1', `${selectedThirdPartyProviderName}`) }}</span>
      <div class="flex items-center justify-between gap-5">
        <div class="flex flex-col gap-2">
          <span class="text-mobile-subhead-mini sm:text-desktop-subhead-mini">{{ $T('Full Permission') }}</span>
          <span class="text-mobile-body-small text-text-secondary-light dark:text-text-secondary-dark sm:text-desktop-body-small">
            {{
              $T(
                'Allow Xmind AI to fully access all of your xmind files in your $1, including the ability to open, edit, create, and delete them.',
                `${selectedThirdPartyProviderName}`,
              )
            }}
          </span>
        </div>
        <base-button theme="secondary" :size="isPhoneSizeViewportWidth ? 'large' : 'medium'" @click="onAuthorize(selectedThirdPartyProvider, true)">
          {{ $T('Choose') }}
        </base-button>
      </div>
      <div class="flex items-center justify-between gap-5">
        <div class="flex flex-col gap-2">
          <span class="text-mobile-subhead-mini sm:text-desktop-subhead-mini">{{ $T('Limited Permission') }}</span>
          <span class="text-mobile-body-small text-text-secondary-light dark:text-text-secondary-dark sm:text-desktop-body-small">
            {{
              $T(
                'Allow Xmind AI to access only the xmind files that you create within Xmind AI, and not other files in your $1.',
                `${selectedThirdPartyProviderName}`,
              )
            }}
          </span>
        </div>
        <base-button theme="secondary" :size="isPhoneSizeViewportWidth ? 'large' : 'medium'" @click="onAuthorize(selectedThirdPartyProvider, false)">
          {{ $T('Choose') }}
        </base-button>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end">
        <base-button class="flex-1 sm:flex-initial" theme="default" :size="isPhoneSizeViewportWidth ? 'large' : 'medium'" @click="handleClose">
          {{ $T('Cancel') }}
        </base-button>
      </div>
    </template>
  </modal-dialog>
</template>
