<script lang="ts">
export default {
  name: 'TeamProfile',
}
</script>
<script setup lang="ts">
import ModalDialog from 'client/components/new-base-modal-dialog.vue'
import { usePromiseHook } from 'utils/vue-utils'
import ProfileSidebar from 'client/components/dialogs/team-profile-cn/profile-sidebar.vue'
import { ref, computed } from 'vue'
import TeamPlan from 'client/components/dialogs/team-profile-cn/team-plan.vue'
import MyWorksSettings from 'client/components/dialogs/team-profile/my-works-settings.vue'
import SettingsCalendar from 'client/components/dialogs/calendar/settings-calendar.vue'
import BaseDivider from 'client/components/base/divider.vue'
import Close from 'client/components/base/close.vue'
import OverlayScrollbar from 'client/components/overlay-scrollbar.vue'
import { $T } from 'client/library/translation'
import type { TeamProfileTab } from 'app/types/common'
import { useTeamSpaceStore } from 'app/services/pinia'
import { useWindowResize } from 'client/composables/window-resize'

const props = defineProps<{
  teamId: string
  initialTab?: TeamProfileTab
}>()

const { resolve } = usePromiseHook()
const { isPhoneSizeViewportWidth } = useWindowResize()

const tab = ref<TeamProfileTab>(props.initialTab ?? 'settings')
const dialogTitle: Record<TeamProfileTab, string> = {
  teamSettings: $T('Settings'),
  plans: $T('Plans'),
  billing: $T('Billing'),
  settings: $T('My Works Settings'),
  teammates: $T('Members'),
  'identity-provision': $T('Identity'),
  calendar: $T('Calendar'),
}

const team = computed(() => useTeamSpaceStore().joinedTeamList?.find(team => team.teamId === props.teamId))

const handleClose = () => {
  resolve(true)
}

const selectTab = (tabValue: TeamProfileTab) => {
  tab.value = tabValue
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
      tab === 'settings'
        ? '!bg-fill-container-light dark:!bg-fill-container-dark'
        : 'sm:!bg-fill-container-light dark:sm:!bg-fill-container-dark !bg-fill-surface-light dark:!bg-fill-surface-dark'
    }`"
    :dialog-body-class="'sm:!p-[12px] !p-0 !overflow-hidden'"
    @modal-dialog-close="handleClose"
  >
    <!-- Mobile -->
    <div v-if="isPhoneSizeViewportWidth" class="flex h-full flex-col">
      <div class="flex items-center justify-between px-[16px] py-[24px]">
        <span class="text-mobile-headline-small text-text-primary-light dark:text-text-primary-dark">{{ dialogTitle[tab] }}</span>
        <close @click="handleClose" />
      </div>
      <base-divider :class="{ '!border-divider-onContainer-light dark:!border-divider-onContainer-dark': tab === 'settings' }" />
      <overlay-scrollbar class="h-full py-[24px]">
        <keep-alive>
          <team-plan v-if="tab === 'plans'" :team="team" @payment-success="handleClose" />
          <my-works-settings v-else-if="tab === 'settings'" :team="team" />
          <settings-calendar v-else-if="tab === 'calendar' && team" :space-id="team.teamId" />
        </keep-alive>
      </overlay-scrollbar>
    </div>

    <!-- Desktop -->
    <div v-else class="flex h-full w-full gap-3">
      <profile-sidebar :tab="tab" :team="team" :is-my-works="true" @select-tab="selectTab" />
      <div
        class="bg-fill-surface-light shadow-elevation-g-light dark:bg-fill-surface-dark dark:shadow-elevation-g-dark flex flex-1 flex-col rounded-xl"
      >
        <div class="flex items-center justify-between px-[24px] py-[16px]">
          <span class="text-desktop-headline-small">{{ dialogTitle[tab] }}</span>
          <close @click="handleClose" />
        </div>
        <base-divider />
        <overlay-scrollbar class="h-full py-[24px]">
          <keep-alive>
            <team-plan v-if="tab === 'plans'" :team="team" @payment-success="handleClose" />
            <my-works-settings v-else-if="tab === 'settings'" :team="team" />
            <settings-calendar v-else-if="tab === 'calendar' && team" :space-id="team.teamId" />
          </keep-alive>
        </overlay-scrollbar>
      </div>
    </div>
  </modal-dialog>
</template>
