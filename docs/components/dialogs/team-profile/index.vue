<script lang="ts">
export default {
  name: 'TeamProfile',
}
</script>
<script setup lang="ts">
import ModalDialog from 'client/components/new-base-modal-dialog.vue'
import { usePromiseHook } from 'utils/vue-utils'
import { ref, onMounted, computed, watch } from 'vue'
import TeamAccount from 'client/components/dialogs/team-profile/team-account.vue'
import MyWorksSettings from 'client/components/dialogs/team-profile/my-works-settings.vue'
import TeamPlan from 'client/components/dialogs/team-profile/team-plan.vue'
import TeamBill from 'client/components/dialogs/team-profile/team-bill.vue'
import Teammates from 'client/components/dialogs/team-profile/teammates.vue'
import IdentityProvision from 'client/components/dialogs/team-profile/identity-provision/index.vue'
import SettingsCalendar from 'client/components/dialogs/calendar/settings-calendar.vue'
import OverlayScrollbar from 'client/components/overlay-scrollbar.vue'
import DialogSidebar from 'client/components/dialogs/settings-common/dialog-sidebar.vue'
import { OrderPayment, OrderPlan } from 'client/library/payment'
import { useCloudKitClient } from 'app/composables/cloud-kit-client'
import { usePaymentClient } from 'app/composables/payment-client'
import { useTeamsClient } from 'app/composables/team-client'
import { $T } from 'client/library/translation'
import { trackNewVersionWorks, trackTeam } from 'client/library/tracker'
import { useTeamSpaceData } from 'app/composables/team-space-data'
import type { TeamProfileLaunchMode, TeamProfileTab } from 'app/types/common'
import { formatDate } from './utils'
import { TeamMemberCount } from 'client/library/teams'
import { useHomeStore, useServiceStore, useTeamSpaceStore } from 'app/services/pinia'
import { useChurnkey } from 'app/composables/use-churnkey'
import { useWindowResize } from 'client/composables/window-resize'
import type { IconName } from 'client/components/icon/icons'
import { generateAvatarDataURI } from 'client/library/cloud-kit/utils/avatar'
import { REGION } from 'client/constants'
import TeamSpaceAvatar from 'client/components/team-space-avatar.vue'

const props = defineProps<{
  teamId: string
  isMyWorks?: boolean
  initialTab?: TeamProfileTab
  launchMode?: TeamProfileLaunchMode
  handleChangeName?: (newName: string) => Promise<boolean>
  handleDeleteTeam?: () => Promise<boolean>
  handleLeaveTeam?: () => Promise<boolean>
  handleChangeAvatar?: () => Promise<void>
  onAfterTeamProfileDialogMounted?: () => Promise<void>
}>()

const { resolve } = usePromiseHook()
const { isPhoneSizeViewportWidth } = useWindowResize()

const tab = ref<TeamProfileTab>(isPhoneSizeViewportWidth.value ? 'settings' : (props.initialTab ?? 'teamSettings'))
const dialogTitle: Record<TeamProfileTab, string> = {
  teamSettings: $T('Settings'),
  plans: $T('Plans'),
  billing: $T('Billing'),
  settings: props.isMyWorks ? $T('My Works Settings') : $T('Team Settings'),
  teammates: $T('Members'),
  'identity-provision': $T('Identity'),
  calendar: $T('Calendar'),
}
const plans = ref<OrderPlan[]>([])
const payments = ref<OrderPayment[]>([])
const teamMemberCount = ref<TeamMemberCount>()
const isRefreshingOrderStatus = ref(false)
const accountType = ref<'xai' | 'xpro'>('xai')

const team = computed(() => useTeamSpaceStore().joinedTeamList?.find(team => team?.teamId === props.teamId))

const menuList = computed<{ title: string; tab: TeamProfileTab; icon: IconName; visible: boolean }[]>(() => {
  const menus = []
  menus.push({
    title: $T('Settings'),
    tab: 'teamSettings',
    icon: 'setting',
    visible: team.value?.role !== 'viewer',
  })

  menus.push({
    title: $T('Calendar'),
    tab: 'calendar',
    icon: 'calendar',
    visible: helpers.isManagementRole(team.value),
  })

  if (!props.isMyWorks) {
    menus.push({
      title: $T('Members'),
      tab: 'teammates',
      icon: 'person-team',
      visible: true,
    })
  }

  menus.push({
    title: $T('Plans'),
    tab: 'plans',
    icon: 'plan',
    visible: team.value?.role !== 'viewer',
  })

  menus.push({
    title: $T('Billing'),
    tab: 'billing',
    icon: 'creditcard',
    visible: helpers.isManagementRole(team.value),
  })

  if (!props.isMyWorks && REGION !== 'cn') {
    menus.push({
      title: $T('Identity'),
      tab: 'identity-provision',
      icon: 'identity-provision',
      visible: helpers.isManagementRole(team.value),
    })
  }

  return menus
})

const dialogTitleName = computed(() => {
  return props.isMyWorks ? $T('My Works') : team.value?.name
})

const dialogTitleIcon = computed<{ type: 'image' | 'icon'; value: string }>(() => {
  if (!props.isMyWorks) {
    return {
      type: 'image',
      value: generateAvatarDataURI({ name: team.value?.name, xmindId: team.value?.teamId }),
    }
  }
  return {
    type: 'icon',
    value: 'my-works-fill',
  }
})

const handleClose = () => {
  resolve(true)
}

const selectTab = (tabValue: TeamProfileTab) => {
  tab.value = tabValue
}

const handleBack = () => {
  tab.value = 'settings'
}

const paymentClient = usePaymentClient()

const handleCancelOrder = async (args: { subscriptionId: string; customerId: string }) => {
  const { subscriptionId, customerId } = args

  if (!team.value) return
  const teamIdToCancel = team.value?.teamId

  const cancelFallback = async () => {
    const isSurveyCompleted = await useServiceStore().services.action.dialog.openRetentionSurveyDialog({
      expiredTime: formatDate(plans.value.find(order => order.id === subscriptionId).next_bill_date),
      teamIdToCancel,
    })

    if (isSurveyCompleted) {
      isRefreshingOrderStatus.value = true // make sure animation is shown immediately
      paymentClient.cancelOrder({ id: subscriptionId, teamId: teamIdToCancel })
    }
  }

  handleClose()

  if (accountType.value === 'xpro') {
    cancelFallback()
    return
  }

  useChurnkey().showCancelFlow({
    subscriptionId,
    customerId,
    teamId: teamIdToCancel,
    errorFallback: () => {
      useChurnkey().hide()
      cancelFallback()
    },
    onAfterCanceled: handleAfterCanceled,
  })
}

const handleAfterCanceled = async () => {
  if (!team.value) return
  const res = await usePaymentClient().getOrdersStatus({ teamId: team.value?.teamId })
  const plan = res?.plans?.[0]
  plan && useHomeStore().setGlobalOrderPlan(props.teamId, plan)
}

const handleBackToPlan = () => {
  tab.value = 'plans'
}

const teamCapacityMaximums = ref<number>(null)
const teamCapacityTotal = ref<number>(null)

const handleRefreshTeamCapacity = async () => {
  if (!team.value) return
  const { maximums, total } = await useCloudKitClient().getTeamCapacity({ teamId: team.value?.teamId })
  teamCapacityTotal.value = total
  teamCapacityMaximums.value = maximums
}

const refreshGlobalOrdersStatus = async () => {
  if (!team.value) return
  isRefreshingOrderStatus.value = true
  const paymentClient = usePaymentClient()
  const res = await paymentClient.getOrdersStatus({ teamId: team.value?.teamId })
  plans.value = res.plans ?? []
  payments.value = res.payments ?? []
  isRefreshingOrderStatus.value = false
  accountType.value = res.plans[0]?.account_type
  logger.log('💰 Team Profile refreshGlobalOrdersStatus getOrdersStatus', res)

  if (plans.value.length > 0) {
    useHomeStore().setGlobalOrderPlan(props.teamId, plans.value[0])
  }
}

const onAfterRedeemSuccess = () => {
  refreshGlobalOrdersStatus()
  handleRefreshTeamCapacity()
  useTeamSpaceData().refreshTeamProfileById(team.value?.teamId)
  trackNewVersionWorks.plusSuccessful()
}

const onTeamSeatsChanged = () => {
  handleRefreshTeamMemberCount()
  refreshGlobalOrdersStatus()
  useTeamSpaceData().refreshTeamProfileById(props.teamId)
}

const onPaymentMethodChanged = () => {
  refreshGlobalOrdersStatus()
}

const onAfterRenewSuccess = () => {
  refreshGlobalOrdersStatus()
  useTeamSpaceData().refreshTeamProfileById(team.value?.teamId)
}

const deleteTeam = async () => {
  trackTeam.teamSettings('DeleteTeam')
  const close = await props?.handleDeleteTeam?.()
  close && handleClose()
}

const leaveTeam = async () => {
  trackTeam.teamSettings('LeaveTeam')
  const isSuccess = await props?.handleLeaveTeam?.()
  isSuccess && handleClose()
}

const changeTeamName = async (newName: string) => {
  trackTeam.teamSettings('ChangeName')
  return await props?.handleChangeName?.(newName)
}

const handleLaunchMode = () => {
  if (tab.value === 'billing' && props.launchMode === 'cancelOrder') {
    if (plans.value.length > 0) {
      const { id, customer } = plans.value[0]
      handleCancelOrder({ customerId: customer, subscriptionId: id })
    }
  }
}

const handleRefreshTeamMemberCount = async () => {
  if (!team.value) return
  const plan = await useTeamSpaceData().getUnexpiredTeamPlanAsync(team.value?.teamId)

  if (['team', 'business', 'essential', 'enterprise'].includes(plan) && helpers.isManagementRole(team.value)) {
    teamMemberCount.value = await useTeamsClient().getTeamMemberCountLimit({ teamId: team.value?.teamId })
  }
}

const handleManageXmindAccount = () => {
  window.open(REGION === 'cn' ? 'https://xmind.cn/account' : 'https://xmind.net/account')
}

onMounted(async () => {
  await Promise.all([handleRefreshTeamCapacity(), refreshGlobalOrdersStatus(), handleRefreshTeamMemberCount()])

  handleLaunchMode()

  trackTeam.teamSettings('TeamSettingsShow')

  props.onAfterTeamProfileDialogMounted?.()
})

watch(isPhoneSizeViewportWidth, newValue => {
  if (!newValue && tab.value === 'settings') selectTab('teamSettings')
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
    :dialog-body-class="'sm:!p-3 !p-0 !overflow-hidden'"
    :modal-classes="isPhoneSizeViewportWidth ? 'animate-mobile-dialog-enter' : ''"
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
          <dialog-sidebar
            v-if="tab === 'settings' && team"
            :dialog-title="dialogTitleName"
            :tab="tab"
            :menu-list="menuList"
            :title-icon="dialogTitleIcon"
            @select-tab="selectTab"
          >
            <template #avatar>
              <team-space-avatar :image-url="team?.imageUrl" :type="isMyWorks ? 'myWorks' : 'team'" :size="28" :my-works-icon-size="20" />
            </template>
          </dialog-sidebar>
        </keep-alive>
        <keep-alive>
          <template v-if="tab === 'teamSettings' && team">
            <my-works-settings v-if="isMyWorks" :team="team" />
            <team-account
              v-else
              :team="team"
              :handle-change-name="changeTeamName"
              @delete-team="deleteTeam"
              @update-avatar="handleChangeAvatar"
              @leave-team="leaveTeam"
            />
          </template>
        </keep-alive>
        <keep-alive>
          <team-plan
            v-if="tab === 'plans' && team"
            :team="team"
            :team-member-count="teamMemberCount"
            :plan="plans[0]"
            :is-loading-plan="isRefreshingOrderStatus"
            @manage="selectTab('billing')"
            @redeem-success="onAfterRedeemSuccess()"
            @seats-changed="onTeamSeatsChanged()"
            @payment-method-changed="onPaymentMethodChanged()"
            @renew-success="onAfterRenewSuccess()"
            @cancel-order="handleCancelOrder"
            @manage-account="handleManageXmindAccount"
          />
        </keep-alive>
        <keep-alive>
          <team-bill
            v-if="tab === 'billing' && team"
            :plans="plans"
            :payments="payments"
            :team="team"
            :is-loading="isRefreshingOrderStatus"
            :is-my-works="isMyWorks"
            @cancel-order="handleCancelOrder"
            @to-plan="handleBackToPlan"
            @renew-success="onAfterRenewSuccess"
          />
        </keep-alive>
        <keep-alive>
          <teammates v-if="tab === 'teammates' && team" :team="team" @close="handleClose" />
        </keep-alive>
        <keep-alive>
          <identity-provision v-if="tab === 'identity-provision' && team" :team="team" />
        </keep-alive>
        <keep-alive>
          <settings-calendar v-if="tab === 'calendar' && team" :space-id="team.teamId" />
        </keep-alive>
      </overlay-scrollbar>
    </div>

    <!-- Desktop -->
    <div v-else class="flex h-full w-full gap-3">
      <dialog-sidebar :dialog-title="dialogTitleName" :tab="tab" :menu-list="menuList" :title-icon="dialogTitleIcon" @select-tab="selectTab">
        <template #avatar>
          <team-space-avatar :image-url="team?.imageUrl" :type="isMyWorks ? 'myWorks' : 'team'" />
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
            <template v-if="tab === 'teamSettings' && team">
              <my-works-settings v-if="isMyWorks" :team="team" />
              <team-account
                v-else
                :team="team"
                :handle-change-name="changeTeamName"
                @delete-team="deleteTeam"
                @leave-team="leaveTeam"
                @update-avatar="handleChangeAvatar"
              />
            </template>
          </keep-alive>
          <keep-alive>
            <team-plan
              v-if="tab === 'plans' && team"
              :team="team"
              :team-member-count="teamMemberCount"
              :plan="plans[0]"
              :is-loading-plan="isRefreshingOrderStatus"
              @manage="selectTab('billing')"
              @redeem-success="onAfterRedeemSuccess()"
              @seats-changed="onTeamSeatsChanged()"
              @payment-method-changed="onPaymentMethodChanged()"
              @renew-success="onAfterRenewSuccess()"
              @cancel-order="handleCancelOrder"
              @manage-account="handleManageXmindAccount"
            />
          </keep-alive>
          <keep-alive>
            <team-bill
              v-if="tab === 'billing' && team"
              :plans="plans"
              :payments="payments"
              :team="team"
              :is-loading="isRefreshingOrderStatus"
              :is-my-works="isMyWorks"
              @cancel-order="handleCancelOrder"
              @to-plan="handleBackToPlan"
              @renew-success="onAfterRenewSuccess"
            />
          </keep-alive>
          <keep-alive>
            <teammates v-if="tab === 'teammates' && team" :team="team" @close="handleClose" />
          </keep-alive>
          <keep-alive>
            <identity-provision v-if="tab === 'identity-provision'" :team="team" />
          </keep-alive>
          <keep-alive>
            <settings-calendar v-if="tab === 'calendar' && team" :space-id="team.teamId" />
          </keep-alive>
        </overlay-scrollbar>
      </div>
    </div>
  </modal-dialog>
</template>
