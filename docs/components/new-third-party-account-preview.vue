<script lang="ts" setup>
import { computed } from 'vue'
import { type ThirdPartyAccount, ThirdPartyAccountProvider } from 'client/types/account'
import Icon from 'client/components/icon/icon.vue'
import type { IconName } from 'client/components/icon/icons'

const props = defineProps<{
  account: ThirdPartyAccount
}>()

const isScopedAccess = computed(() => {
  switch (props.account && props.account.provider) {
    case ThirdPartyAccountProvider.GoogleDriveScoped:
    case ThirdPartyAccountProvider.OneDriveScoped:
    case ThirdPartyAccountProvider.DropboxScoped:
      return true
    default:
      return false
  }
})

const accountProviderImage = computed<IconName>(() => {
  switch (props.account && props.account.provider) {
    case ThirdPartyAccountProvider.GoogleDrive:
    case ThirdPartyAccountProvider.GoogleDriveScoped:
      return 'googledrive-color'
    case ThirdPartyAccountProvider.Onedrive:
    case ThirdPartyAccountProvider.OneDriveScoped:
      return 'onedrive-color'
    case ThirdPartyAccountProvider.Dropbox:
    case ThirdPartyAccountProvider.DropboxScoped:
      return 'dropbox-color'
    default:
      return null
  }
})
</script>

<template>
  <div
    class="flex cursor-pointer items-center gap-2 rounded-md px-[8px] py-[12px] hover:bg-mask-overlay-s-light active:bg-mask-overlay-m-light dark:hover:bg-mask-overlay-s-dark dark:active:bg-mask-overlay-m-dark"
  >
    <icon :name="accountProviderImage" />
    <span class="text-mobile-subhead-mini sm:text-desktop-subhead-mini">{{ account.thirdPartyAccountId }}</span>
    <span
      v-if="isScopedAccess"
      class="rounded bg-mask-overlay-s-light px-[4px] text-desktop-caption text-text-tertiary-light dark:bg-mask-overlay-s-dark dark:text-text-tertiary-dark"
    >
      {{ $T('Limited') }}
    </span>
  </div>
</template>
