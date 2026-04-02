<template>
  <div class="h-full px-[24px]">
    <app-cloud-drive-list
      :is-files-expanded="true"
      :is-sidebar-expanded="true"
      :is-loading-third-party-accounts="!isSignedIn || !isThirdPartyAccountReady"
      :third-party-accounts="thirdPartyAccounts"
      :selected-third-party-account="selectedThirdPartyAccount"
      third-party-account-preview-class-list="uk-card uk-card-default uk-border-rounded uk-overflow-hidden"
      @select-cloud-drive="handleSelectCloudDrive($event)"
      @open-cloud-drive-dialog="openManageCloudDrivesDialog()"
      @re-order="handleCloudDrivesReorder($event)"
    ></app-cloud-drive-list>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import AppCloudDriveList from 'app/fragments/router-views/new-home/stateless/sidebar/cloud-drive-account-list.vue'
import type { ThirdPartyAccount } from 'client/types/account'
import { useAccountStore } from 'app/services/pinia'
import { useExternalStorage } from 'app/fragments/router-views/new-home/xmind-drive/use-external-storage'
import { useUrlNavigator } from 'app/composables/url-navigator'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { isSignedIn, isThirdPartyAccountReady, thirdPartyAccounts } = storeToRefs(useAccountStore())
const { selectedThirdPartyAccount, setSelectedThirdPartyAccount, openManageCloudDrivesDialog } = useExternalStorage()

const handleCloudDrivesReorder = async (accounts: ThirdPartyAccount[]) => {
  useAccountStore().reOrderThirdPartyAccount(accounts)
}

const handleSelectCloudDrive = (account: ThirdPartyAccount) => {
  setSelectedThirdPartyAccount(account)
  useUrlNavigator().changeHomeSectionRouter({ section: 'cloud-drive' })
  emit('close')
}

onMounted(() => {
  // initialize the states
  useExternalStorage().unload()
  useExternalStorage().refreshThirdPartyAccountAccess()
})
</script>
