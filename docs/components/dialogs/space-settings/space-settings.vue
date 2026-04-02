<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import DialogSidebar from 'client/components/dialogs/settings-common/dialog-sidebar.vue'
import ModalDialog from 'client/components/new-base-modal-dialog.vue'
import SpaceSettingsGeneral from 'client/components/dialogs/space-settings/space-settings-general.vue'
import SpaceSettingsMembers from './space-settings-members.vue'
import SettingsCalendar from 'client/components/dialogs/calendar/settings-calendar.vue'
import { usePromiseHook } from 'utils/vue-utils'
import OverlayScrollbar from 'client/components/overlay-scrollbar.vue'
import { $T } from 'client/library/translation'
import { trackTeam } from 'client/library/tracker'
import type { SpaceSettingsTab } from 'app/types/common'
import { useTeamSpaceStore } from 'app/services/pinia'
import { useWindowResize } from 'client/composables/window-resize'
import type { IconName } from 'client/components/icon/icons'
import TeamSpaceAvatar from 'client/components/team-space-avatar.vue'
import { useTeamSpaceData } from 'app/composables/team-space-data'

defineOptions({
  name: 'SpaceSettingsDialog',
})

const props = defineProps<{
  spaceId: string
  initialTab?: SpaceSettingsTab
  handleChangeSpaceName?: (newName: string) => Promise<boolean>
  handleDeleteSpace?: () => Promise<boolean>
  handleLeaveSpace?: () => Promise<boolean>
  handleChangeAvatar?: () => Promise<void>
}>()

const { resolve } = usePromiseHook()
const { isPhoneSizeViewportWidth } = useWindowResize()

const tab = ref<SpaceSettingsTab>(isPhoneSizeViewportWidth.value ? 'settings' : (props.initialTab ?? 'general'))
const dialogTitle: Record<SpaceSettingsTab, string> = {
  settings: $T('Space Settings'),
  general: $T('Settings'),
  calendar: $T('Calendar'),
  members: $T('Members'),
}

const space = computed(() => useTeamSpaceStore().joinedSpaceList?.find(space => space.spaceId === props.spaceId))
const isCalendarVisible = computed(() => {
  const teamId = space.value?.teamId
  const isTeamManagementRole = useTeamSpaceData().hasTeamManagementPermission(teamId)
  const isSpaceManagementRole = helpers.isManagementRole({ role: space.value?.role })
  return isTeamManagementRole || isSpaceManagementRole
})

const menuList = computed<{ title: string; tab: SpaceSettingsTab; icon: IconName; visible: boolean }[]>(() => {
  return [
    {
      title: $T('Settings'),
      tab: 'general',
      icon: 'setting',
      visible: true,
    },
    {
      title: $T('Calendar'),
      tab: 'calendar',
      icon: 'calendar',
      visible: isCalendarVisible.value,
    },
    {
      title: $T('Members'),
      tab: 'members',
      icon: 'person-team',
      visible: true,
    },
  ]
})

const dialogTitleName = computed(() => {
  return space?.value?.spaceMetadata?.nameTranslated
})

const handleClose = () => {
  resolve(true)
}

const selectTab = (tabValue: SpaceSettingsTab) => {
  tab.value = tabValue
}

const handleBack = () => {
  tab.value = 'settings'
}

const leaveSpace = async () => {
  const isSuccess = await props?.handleLeaveSpace?.()
  isSuccess && handleClose()
}

const deleteSpace = async () => {
  const close = await props?.handleDeleteSpace?.()
  close && handleClose()
}

const changeSpaceName = async (newName: string) => {
  return await props?.handleChangeSpaceName?.(newName)
}

onMounted(async () => {
  trackTeam.teamSettings('TeamSettingsShow')
})
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
      tab === 'settings'
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
        <div v-show="tab !== 'settings'" class="bg-mask-overlay-m-light dark:bg-mask-overlay-m-dark rounded-full p-[4px]" @click="handleBack">
          <fw-icon name="chevron-backward" class="text-icon-secondary-light dark:text-icon-secondary-dark" />
        </div>
        <span class="text-mobile-headline-small text-text-primary-light dark:text-text-primary-dark">{{ dialogTitle[tab] }}</span>
        <fw-close @click="handleClose" />
      </div>
      <fw-divider :class="{ '!border-divider-onContainer-light dark:!border-divider-onContainer-dark': tab === 'settings' }" />
      <overlay-scrollbar class="h-full py-[24px]">
        <keep-alive>
          <dialog-sidebar v-if="tab === 'settings'" :dialog-title="dialogTitleName" :tab="tab" :menu-list="menuList" @select-tab="selectTab">
            <template #avatar>
              <team-space-avatar :image-url="space.spaceMetadata?.imageUrl" :type="'space'" :size="28" />
            </template>
          </dialog-sidebar>
        </keep-alive>
        <keep-alive>
          <space-settings-general
            v-if="tab === 'general'"
            :space="space"
            :handle-change-name="changeSpaceName"
            @delete-space="deleteSpace"
            @leave-space="leaveSpace"
            @update-avatar="handleChangeAvatar"
          />
        </keep-alive>
        <keep-alive>
          <space-settings-members v-if="tab === 'members'" :space="space" />
        </keep-alive>
        <keep-alive>
          <settings-calendar v-if="tab === 'calendar' && space" :space-id="space.spaceId" />
        </keep-alive>
      </overlay-scrollbar>
    </div>

    <!-- Desktop -->
    <div v-else class="flex h-full w-full gap-3">
      <dialog-sidebar :dialog-title="dialogTitleName" :tab="tab" :menu-list="menuList" @select-tab="selectTab">
        <template #avatar>
          <team-space-avatar :image-url="space.spaceMetadata?.imageUrl" :type="'space'" />
        </template>
      </dialog-sidebar>
      <div
        class="bg-fill-surface-light shadow-elevation-g-light dark:bg-fill-surface-dark dark:shadow-elevation-g-dark flex flex-1 flex-col rounded-xl"
      >
        <div class="flex items-center justify-between px-[24px] py-[16px]">
          <span class="text-desktop-headline-small">{{ dialogTitle[tab] }}</span>
          <fw-close @click="handleClose" />
        </div>
        <fw-divider />
        <overlay-scrollbar class="h-full py-[24px]">
          <keep-alive>
            <space-settings-general
              v-if="tab === 'general'"
              :space="space"
              :handle-change-name="changeSpaceName"
              @delete-space="deleteSpace"
              @leave-space="leaveSpace"
              @update-avatar="handleChangeAvatar"
            />
          </keep-alive>
          <keep-alive>
            <space-settings-members v-if="tab === 'members'" :space="space" />
          </keep-alive>
          <keep-alive>
            <settings-calendar v-if="tab === 'calendar' && space" :space-id="space.spaceId" />
          </keep-alive>
        </overlay-scrollbar>
      </div>
    </div>
  </modal-dialog>
</template>
