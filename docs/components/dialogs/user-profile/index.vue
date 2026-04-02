<script lang="ts">
export default {
  name: 'ProfileDesktop',
}
</script>
<script setup lang="ts">
import ModalDialog from 'client/components/new-base-modal-dialog.vue'
import { usePromiseHook } from 'utils/vue-utils'
import DialogSidebar from 'client/components/dialogs/settings-common/dialog-sidebar.vue'
import UserPreference from 'client/components/dialogs/user-profile/user-preference.vue'
import UserAccount from 'client/components/dialogs/user-profile/user-account.vue'
import ExternalStorage from 'client/components/dialogs/user-profile/external-storage.vue'
import OverlayScrollbar from 'client/components/overlay-scrollbar.vue'
import { ref, computed } from 'vue'
import { $T } from 'client/library/translation'
import type { UserProfileTab } from 'app/types/common'
import { isMobileDevice } from 'utils/detectDevice'
import { useWindowResize } from 'client/composables/window-resize'
import type { IconName } from 'client/components/icon/icons'
import { useUserBaseProfileStore } from 'client/store/user-base-profile-store'
import { useAccountStore } from 'client/store'
import { generateAvatarDataURI } from 'client/library/cloud-kit/utils/avatar'
import { useExternalStorage } from 'app/fragments/router-views/new-home/xmind-drive/use-external-storage'

const props = defineProps<{
  initTab: UserProfileTab
}>()

const { resolve } = usePromiseHook()
const { isPhoneSizeViewportWidth } = useWindowResize()
const { openManageCloudDrivesDialog } = useExternalStorage()

const tab = ref<UserProfileTab>((props?.initTab ?? isMobileDevice()) ? 'accountSetting' : 'myAccount')
const dialogTitle = {
  accountSetting: $T('My Works Settings'),
  myAccount: $T('My Account'),
  preference: $T('Preference'),
  externalStorage: $T('External Storage'),
}

const dialogTitleName = computed(() => {
  return useUserBaseProfileStore().getUserDisplayName(useAccountStore().profile)
})

const dialogIcon = computed(() => {
  const profile = useAccountStore().profile
  return profile?.avatar_url || generateAvatarDataURI({ name: profile?.full_name, xmindId: profile?.user })
})

const menuList = computed<
  { title: string; tab: UserProfileTab; icon: IconName; visible: boolean; rightIconPath?: string; onRightIconClick?: Function }[]
>(() => [
  {
    title: $T('My Account'),
    tab: 'myAccount',
    icon: 'person',
    visible: true,
  },
  {
    title: $T('Preference'),
    tab: 'preference',
    icon: 'adjustment',
    visible: true,
  },
  {
    title: $T('External Storage'),
    tab: 'externalStorage',
    icon: 'cloud',
    visible: true,
    rightBtnIcon: 'add',
    rightBtnHandler: () => {
      openManageCloudDrivesDialog()
    },
  },
])

const handleClose = () => {
  resolve(true)
}

const selectTab = (tabValue: UserProfileTab) => {
  tab.value = tabValue
}

const handleBack = () => {
  tab.value = 'accountSetting'
}
</script>

<template>
  <modal-dialog
    :is-opened="true"
    :close-button="false"
    :width="isPhoneSizeViewportWidth ? '100%' : 800"
    :height="isPhoneSizeViewportWidth ? '100%' : 780"
    :max-height="isPhoneSizeViewportWidth ? '100%' : '80vh'"
    :max-width="isPhoneSizeViewportWidth ? '100%' : '80vw'"
    :dialog-footer-class="'hidden'"
    :dialog-header-class="'hidden'"
    :dialog-class="`!shadow-elevation-l4-light dark:!shadow-elevation-l4-dark backdrop-blur-md !rounded-none sm:!rounded-2xl ${
      tab === 'accountSetting'
        ? '!bg-fill-container-light dark:!bg-fill-container-dark'
        : 'sm:!bg-fill-container-light dark:sm:!bg-fill-container-dark !bg-fill-surface-light dark:!bg-fill-surface-dark'
    }`"
    :modal-classes="isPhoneSizeViewportWidth ? 'animate-mobile-dialog-enter' : ''"
    :dialog-body-class="'sm:!p-3 !p-0 !overflow-hidden'"
    @modal-dialog-close="handleClose"
  >
    <!-- Mobile -->
    <div v-if="isPhoneSizeViewportWidth" class="flex h-full flex-col">
      <div class="flex items-center justify-between px-[16px] py-[24px]">
        <div v-show="tab !== 'accountSetting'" class="rounded-full bg-mask-overlay-m-light p-[4px] dark:bg-mask-overlay-m-dark" @click="handleBack">
          <fw-icon name="chevron-backward" class="text-icon-secondary-light dark:text-icon-secondary-dark" />
        </div>
        <span class="text-mobile-headline-small text-text-primary-light dark:text-text-primary-dark">{{ dialogTitle[tab] }}</span>
        <fw-close @click="handleClose" />
      </div>
      <fw-divider :class="{ '!border-divider-onContainer-light dark:!border-divider-onContainer-dark': tab === 'accountSetting' }" />
      <overlay-scrollbar class="h-full py-[24px]">
        <keep-alive>
          <dialog-sidebar
            v-if="tab === 'accountSetting'"
            :dialog-title="dialogTitleName"
            :tab="tab"
            :menu-list="menuList"
            :title-icon="{ type: 'image', value: dialogIcon }"
            @select-tab="selectTab"
          >
            <template #avatar>
              <img uk-img class="h-7 w-7 rounded" :data-src="dialogIcon" />
            </template>
          </dialog-sidebar>
        </keep-alive>
        <keep-alive>
          <user-account v-if="tab === 'myAccount'" />
        </keep-alive>
        <keep-alive>
          <user-preference v-if="tab === 'preference'" />
        </keep-alive>
        <keep-alive>
          <external-storage v-if="tab === 'externalStorage'" @close="handleClose" />
        </keep-alive>
      </overlay-scrollbar>
    </div>

    <!-- Desktop -->
    <div v-else class="flex h-full w-full gap-3">
      <dialog-sidebar :dialog-title="dialogTitleName" :tab="tab" :menu-list="menuList" @select-tab="selectTab">
        <template #avatar>
          <img uk-img class="rounded sm:h-5 sm:w-5" :data-src="dialogIcon" />
        </template>
      </dialog-sidebar>
      <div
        class="flex flex-1 flex-col rounded-xl bg-fill-surface-light shadow-elevation-g-light dark:bg-fill-surface-dark dark:shadow-elevation-g-dark"
      >
        <div class="flex items-center justify-between px-[24px] py-[16px]">
          <span class="text-desktop-headline-small">{{ dialogTitle[tab] }}</span>
          <fw-close @click="handleClose" />
        </div>
        <fw-divider />
        <overlay-scrollbar class="h-full py-[24px]">
          <keep-alive>
            <user-account v-if="tab === 'myAccount'" />
          </keep-alive>
          <keep-alive>
            <user-preference v-if="tab === 'preference'" />
          </keep-alive>
          <keep-alive>
            <external-storage v-if="tab === 'externalStorage'" @close="handleClose" />
          </keep-alive>
        </overlay-scrollbar>
      </div>
    </div>
  </modal-dialog>
</template>
