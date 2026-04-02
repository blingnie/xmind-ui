<script lang="ts">
export default {
  name: 'TeamPlan',
}
</script>
<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import { $T } from 'client/library/translation'
import NewInput from 'client/components/base/input.vue'
import BaseDivider from 'client/components/base/divider.vue'
import BaseButton from 'client/components/base/button.vue'
import UpgradeGradientButton from 'client/components/composite/upgrade-gradient-button.vue'
import TeamCredits from 'client/components/dialogs/team-profile/credits/team-credits.vue'
import { useAccountStore, useServiceStore } from 'app/services/pinia'
import { formatDate, getCreditCardBrandIcon } from 'client/components/dialogs/team-profile/utils'
import { toastActions } from 'client/library/new-notifications'
import { trackNewVersionWorks } from 'client/library/tracker'
import { BrowserNetworkError, RedeemAttemptsExceeded, RedeemCodeError } from 'client/errors'
import { isPhoneViewportSmall } from 'utils/detectDevice'
import type { PlusAccount, TeamMetadata, TeammatePayload } from 'client/server-export'
import { useTeamSpaceData } from 'app/composables/team-space-data'
import { usePaymentClient } from 'app/composables/payment-client'
import { TeamMemberCount } from 'client/library/teams'
import { getPlanName, OrderPlan } from 'client/library/payment'
import { storeToRefs } from 'pinia'
import { useTracking } from 'client/composables/use-tracking'
import { useWindowResize } from 'client/composables/window-resize'
import { isManagementRole } from 'utils/global-helper'
import { REGION } from 'client/constants'

const props = defineProps<{
  team: TeamMetadata & { role: TeammatePayload['role'] }
  teamMemberCount?: TeamMemberCount
  plan: OrderPlan
  isLoadingPlan: boolean
}>()

const emit = defineEmits<{
  (event: 'redeem-success'): void
  (event: 'renew-success'): void
  (event: 'manage'): void
  (event: 'seats-changed'): void
  (event: 'payment-method-changed'): void
  (event: 'cancel-order', args: { subscriptionId: string; customerId: string }): void
  (event: 'manage-account'): void
}>()

const { isUserProSubscribed, isUserProAutoRenewable, userProExpireTime, userProAutoRenewMonth } = storeToRefs(useAccountStore())
const { getTeamPlanProfileSync, getIsTeamSubscribedSync, getUnexpiredTeamPlanSync, defaultTeamId } = useTeamSpaceData()
const { isPhoneSizeViewportWidth } = useWindowResize()

let redeemCodeRetryTimer: number

const isShowRedeemCodeArea = ref(false)
const isRenewing = ref(false)
const isCreatingOrder = ref(false)
const redeemCodeInput = ref('')
const redeemCodeErrorMessage = ref('')
const isRedeeming = ref(false)
const redeemInputRef = ref()
const redeemCodeRef = ref<HTMLElement>()

const teamPlanProfile = computed(() => getTeamPlanProfileSync(props.team.teamId) as PlusAccount)
const unexpiredTeamPlan = computed(() => getUnexpiredTeamPlanSync(props.team.teamId))
const isPlanSubscribed = computed(() => getIsTeamSubscribedSync(props.team.teamId))
const isPlanExpired = computed(() => teamPlanProfile.value?.status === 'expired')
const isPlanTrialing = computed(() => teamPlanProfile.value?.status === 'trialing')
const planExpiryDate = computed(() => (isPlanSubscribed.value ? teamPlanProfile.value?.expiredAt : userProExpireTime.value))
const isMyWorksTeam = computed(() => props.team.teamId === defaultTeamId.value)
const planName = computed(() =>
  getPlanName(isPlanSubscribed.value ? unexpiredTeamPlan.value : isMyWorksTeam.value && isUserProSubscribed.value ? 'pro' : 'basic', false),
)
const subscriptionStatusText = computed(() => (isPlanTrialing.value ? $T('In Trial') : $T('Activated')))
const subscriptionPeriodText = computed(() => {
  const month = isPlanSubscribed.value ? teamPlanProfile.value.month : userProAutoRenewMonth.value
  return month === 1 ? $T('Monthly') : $T('Yearly')
})
// CN has no Stripe auto-renewal, so auto-renew cancellation is not applicable
const isPlanAutoRenewCanceled = computed(() => {
  if (REGION === 'cn') return false
  return (
    (isPlanSubscribed.value && ((!props.isLoadingPlan && !props.plan) || props.plan?.cancel_at_period_end || props.plan?.status === 'canceled')) ||
    (isMyWorksTeam.value && isUserProSubscribed.value && !isUserProAutoRenewable.value)
  )
})
const currentPlanButton = computed<'renew' | 'upgrade' | 'cancel' | 'manage' | null>(() => {
  const isMyWorksProPlan = isMyWorksTeam.value && isUserProSubscribed.value
  switch (unexpiredTeamPlan.value) {
    case 'basic':
      return isMyWorksProPlan ? 'manage' : 'upgrade'
    case 'personal':
    case 'business':
    case 'premium':
      if (REGION === 'cn') return null
      return isPlanAutoRenewCanceled.value ? 'renew' : /* planAutoRenewMonth.value === 1 || isPlanTrialing.value ? 'upgrade' : */ 'cancel'
    case 'team':
    case 'essential':
      if (isPlanAutoRenewCanceled.value) return 'renew'
      return 'upgrade'
    default:
      return isMyWorksProPlan ? 'manage' : null
  }
})
const planAmount = computed(() => props.plan?.upcoming_invoice?.total || props.plan?.amount)
const currencyFormat = computed(() =>
  Intl.NumberFormat('en-US', { style: 'currency', currency: props.plan?.upcoming_invoice?.currency || props.plan?.currency || 'USD' }),
)
const planAmountText = computed(() => (planAmount.value || planAmount.value === 0 ? currencyFormat.value?.format(planAmount.value) : ''))

const normalCreditNumber = computed<number>(() => {
  return teamPlanProfile.value?.credits.reduce((prevValue, currentValue) => {
    if (currentValue.type !== 'purchased') {
      prevValue += currentValue.total
    }
    return prevValue
  }, 0)
})

const purchasedCreditNumber = computed<number>(() => {
  return teamPlanProfile.value?.credits.reduce((prevValue, currentValue) => {
    if (currentValue.type === 'purchased') {
      prevValue += currentValue.total ?? 0
    }
    return prevValue
  }, 0)
})

const totalCreditNumber = computed(() => {
  return !getIsTeamSubscribedSync(props.team.teamId) ? normalCreditNumber.value : normalCreditNumber.value + purchasedCreditNumber.value
})

const usedCreditNumber = computed<number>(() => {
  const remainderCredit = teamPlanProfile.value?.credits.reduce((prevValue, currentValue) => {
    if (!getIsTeamSubscribedSync(props.team.teamId) && currentValue.type === 'purchased') {
      return prevValue
    }
    if (currentValue.remainder > 0) {
      prevValue += currentValue.remainder
    }
    return prevValue
  }, 0)
  return parseFloat(remainderCredit.toFixed(1))
})

const seatsAllocatedHtml = computed(() =>
  $T(
    'Your team has $1 seats, with $2 currently allocated.',
    `<span class="text-text-primary-light dark:text-text-primary-dark text-mobile-subhead-mini sm:text-desktkop-subhead-mini">${props.teamMemberCount.limit}</span>`,
    props.teamMemberCount.acceptCount.toString(),
  ),
)

const handleOpenChangePaymentMethodDialog = async () => {
  const isPaymentMethodChanged = await useServiceStore().services.action.dialog.openChangePaymentMethodDialog({
    teamId: props.team.teamId,
    planId: props.plan.id,
  })
  isPaymentMethodChanged && emit('payment-method-changed')
}

const handleOpenChangeTeamSeatsDialog = async () => {
  trackNewVersionWorks.changeTeamSizeEntry()
  const isSeatsChanged = await useServiceStore().services.action.dialog.openChangeTeamSeatsDialog({
    teamId: props.team.teamId,
    teamMemberCount: props.teamMemberCount,
  })
  isSeatsChanged && emit('seats-changed')
}

const handleUpgrade = async () => {
  switch (unexpiredTeamPlan.value) {
    case 'basic': {
      isMyWorksTeam.value && isUserProSubscribed.value
        ? useServiceStore().services.action.dialog.openPaymentDialog({
            teamId: props.team.teamId,
            orderVersion: 'premium',
            planDuration: 'yearly',
            isUpgradePlanOrder: true,
          })
        : useServiceStore().services.action.dialog.openActivateDialog({ teamId: props.team.teamId })
      break
    }
    case 'team':
    case 'essential':
    case 'personal':
    case 'premium':
    case 'business': {
      useServiceStore().services.action.dialog.openPaymentDialog({
        teamId: props.team.teamId,
        orderVersion: isMyWorksTeam.value ? 'premium' : 'business',
        planDuration: 'yearly',
        isUpgradePlanOrder: true,
      })
      break
    }
  }

  const tab = isMyWorksTeam.value ? 'my_works' : 'team'
  useTracking().trackClick('upgrade', { dlg: 'settings_plans', tab })
  useTracking().trackPaywallView({ paywall_trigger: 'manual_click', tab })
}

const handleRenew = async () => {
  if (unexpiredTeamPlan.value === 'team' && isPlanAutoRenewCanceled.value) {
    handleUpgrade()
    return
  }

  // only plans satisfying the following conditions can be renewed
  if (['premium', 'business'].includes(unexpiredTeamPlan.value) && props.plan?.status === 'sub' && props.plan?.cancel_at_period_end) {
    isRenewing.value = true
    const paymentClient = usePaymentClient()
    const success = await paymentClient.renewOrder({ teamId: props.team.teamId, id: props.plan.id })
    isRenewing.value = false

    if (success) {
      emit('renew-success')
    } else {
      toastActions.show({ message: $T('Failed to renew the subscription. Please try again later.'), topic: 'failed' })
    }
  } else {
    useServiceStore().services.action.dialog.openActivateDialog({ teamId: props.team.teamId })
    trackNewVersionWorks.upgradeDialog('fromTeamSettings')
    trackNewVersionWorks.myPlanPurchase('Upgrade')
  }
}

const handleCancel = () => {
  trackNewVersionWorks.cancelSubscription('ConfirmCancellation')
  emit('cancel-order', { subscriptionId: props.plan.id, customerId: props.plan.customer })
}

const handleGetExtraCredits = async () => {
  if (isCreatingOrder.value) {
    return
  }

  isCreatingOrder.value = true

  try {
    if (REGION === 'cn') {
      await useServiceStore().services.action.dialog.openAiAddonPaymentDialog({ team: props.team })
      return
    }

    const paymentClient = usePaymentClient()
    const orderHash = await paymentClient.createOrder({
      version: 'addon',
      invoiceEmail: useAccountStore().profile.primary_email,
      teamId: props.team.teamId,
    })

    if (!orderHash) {
      return
    }

    useServiceStore().services.action.dialog.openPaymentDialog({ orderHash, orderVersion: 'addon', teamId: props.team.teamId })
    trackNewVersionWorks.myPlanPurchase('Buy Credits')
  } finally {
    isCreatingOrder.value = false
  }
}

const handleRedeemCode = async () => {
  isRedeeming.value = true

  const paymentClient = usePaymentClient()
  try {
    if (redeemCodeRetryTimer) {
      throw new RedeemAttemptsExceeded()
    }
    await paymentClient.redeemCode(redeemCodeInput.value, props.team)
    emit('redeem-success')
    trackNewVersionWorks.redeemClick('Successful')
    redeemCodeInput.value = ''
  } catch (e) {
    if (e instanceof BrowserNetworkError) {
      redeemCodeErrorMessage.value = $T('Network error. Please try again later.')
      trackNewVersionWorks.redeemClick('Error2')
    } else if (e instanceof RedeemCodeError) {
      redeemCodeErrorMessage.value = $T('Invalid Code. Please try again with a valid code.')
      trackNewVersionWorks.redeemClick('Error1')
    } else if (e instanceof RedeemAttemptsExceeded) {
      handleExceedRedeemAttemptsError()
      trackNewVersionWorks.redeemClick('Error3')
    } else {
      logger.error(e)
      redeemCodeErrorMessage.value = $T('Network error. Please try again later.')
      trackNewVersionWorks.redeemClick('Error2')
    }
  }

  isRedeeming.value = false
}

const handleRedeemCodeChange = () => {
  redeemCodeErrorMessage.value = ''
}

const handleClearRedeemCodeInput = () => {
  redeemCodeErrorMessage.value = ''
}

const handleExceedRedeemAttemptsError = () => {
  if (redeemCodeRetryTimer) return
  toastActions.show({
    message: (isPhoneViewportSmall() ? '' : $T('Request limitation reached. ')) + $T('Please try it again after $1s.'),
    topic: 'loading',
    timeout: 60000,
  })
  redeemCodeRetryTimer = window.setTimeout(() => {
    redeemCodeRetryTimer = null
  }, 60000)
}

const handleClickHaveARedeemCode = async () => {
  isShowRedeemCodeArea.value = !isShowRedeemCodeArea.value
  await nextTick()
  isShowRedeemCodeArea.value && redeemCodeRef.value?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <div class="flex flex-col gap-6 px-[24px]">
    <!-- Current Plan -->
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap items-start justify-between gap-4 sm:flex-nowrap">
        <div class="flex w-full flex-col justify-center gap-4 sm:w-auto">
          <span class="text-mobile-subhead-small sm:text-desktop-subhead-small">{{ $T('Current plan') }}: {{ planName }}</span>
          <span
            v-if="unexpiredTeamPlan === 'basic' && (!isMyWorksTeam || (isMyWorksTeam && !isUserProSubscribed))"
            class="text-mobile-body-medium sm:text-desktop-body-medium"
          >
            {{ $T('Upgrade today to enjoy all the benefits of Xmind.') }}
          </span>
          <div v-else v-show="!isLoadingPlan" class="flex flex-col gap-2">
            <span class="text-mobile-body-medium sm:text-desktop-body-medium">
              {{ $T('Subscription status') }}:
              <img
                uk-svg
                class="mr-[4px] inline-block"
                :class="{ 'text-yellow-7': isPlanAutoRenewCanceled, 'text-green-6': !isPlanAutoRenewCanceled }"
                :data-src="toURL('/assets/static/images/dialog-payment/circle.svg')"
                alt="cicle"
              />
              <span class="text-mobile-subhead-mini sm:text-desktop-subhead-mini">{{ subscriptionStatusText }}</span>
            </span>
            <span class="text-mobile-body-medium sm:text-desktop-body-medium">
              {{ $T('Subscription period') }}:
              <span class="text-mobile-subhead-mini sm:text-desktop-subhead-mini">
                {{ subscriptionPeriodText }}
              </span>
            </span>
            <template v-if="isManagementRole(team)">
              <span class="text-mobile-body-medium sm:text-desktop-body-medium">
                {{ isPlanAutoRenewCanceled ? $T('Expiration date') : $T('Next invoice date') }}:
                <span class="text-mobile-subhead-mini sm:text-desktop-subhead-mini">{{ formatDate(planExpiryDate) }}</span>
              </span>
              <span v-if="!isPlanAutoRenewCanceled && planAmountText" class="text-mobile-body-medium sm:text-desktop-body-medium">
                {{ $T('Next invoice amount') }}:
                <span v-show="planAmountText" class="text-mobile-subhead-mini sm:text-desktop-subhead-mini">{{ planAmountText }}</span>
              </span>
            </template>
          </div>
          <span v-if="isPlanAutoRenewCanceled" class="text-mobile-caption-header sm:text-desktop-caption-header">
            {{ $T('Renew today to keep enjoying all the benefits of Xmind.') }}
          </span>
        </div>
        <template v-if="isManagementRole(team) && !isLoadingPlan">
          <base-button
            v-if="currentPlanButton === 'renew'"
            :size="isPhoneSizeViewportWidth ? 'large' : 'medium'"
            theme="default"
            :disabled="isLoadingPlan || isRenewing || isCreatingOrder"
            @click="handleRenew"
          >
            {{ isRenewing ? $T('Renewing...') : $T('Renew') }}
          </base-button>
          <upgrade-gradient-button
            v-else-if="currentPlanButton === 'upgrade'"
            :size="isPhoneSizeViewportWidth ? 'large' : 'medium'"
            @click="handleUpgrade"
          >
            {{ $T('Upgrade') }}
          </upgrade-gradient-button>
          <base-button
            v-else-if="currentPlanButton === 'cancel'"
            theme="default"
            :size="isPhoneSizeViewportWidth ? 'large' : 'medium'"
            :disabled="isLoadingPlan || isRenewing || isCreatingOrder"
            @click="handleCancel"
          >
            {{ $T('Cancel') }}
          </base-button>
          <base-button
            v-else-if="currentPlanButton === 'manage'"
            theme="default"
            :size="isPhoneSizeViewportWidth ? 'large' : 'medium'"
            :disabled="isLoadingPlan || isRenewing || isCreatingOrder"
            @click="$emit('manage-account')"
          >
            {{ $T('Manage') }}
          </base-button>
        </template>
      </div>
    </div>

    <base-divider />

    <!-- Change Payment Method -->
    <template v-if="REGION !== 'cn' && isPlanSubscribed && !isPlanAutoRenewCanceled && !isLoadingPlan && isManagementRole(team)">
      <div class="flex flex-col justify-center gap-4">
        <div class="text-mobile-subhead-small sm:text-desktop-subhead-small">{{ $T('Payment Method') }}</div>
        <div class="flex flex-wrap items-start justify-between gap-4 sm:flex-nowrap">
          <div class="flex items-start justify-center gap-3">
            <div class="bg-fill-surfaceDim-light dark:bg-fill-surfaceDim-dark flex h-10 w-10 items-center justify-center rounded-lg">
              <img uk-img :data-src="getCreditCardBrandIcon(plan?.payment_source.brand)" />
            </div>
            <div class="flex flex-col gap-1">
              <div class="flex items-center gap-2">
                <span class="text-mobile-body-large sm:text-desktop-body-large">{{ plan.payment_source.brand }}</span>
                <span class="text-mobile-body-medium sm:text-desktop-body-medium">{{ `•••• •••• •••• •••• ${plan.payment_source.last4}` }}</span>
              </div>
              <span class="text-mobile-caption-header text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-caption-header">
                {{ `${$T('Expiry')}: ${plan.payment_source.exp_month}/${plan.payment_source.exp_year}` }}
              </span>
            </div>
          </div>
          <base-button
            theme="default"
            :size="isPhoneSizeViewportWidth ? 'large' : 'medium'"
            :disabled="isLoadingPlan || isRenewing || isCreatingOrder"
            @click="handleOpenChangePaymentMethodDialog"
          >
            {{ $T('Change') }}
          </base-button>
        </div>
      </div>
      <base-divider />
    </template>

    <!-- Team Size -->
    <div v-if="teamMemberCount" class="flex flex-wrap items-end justify-between gap-4 sm:flex-nowrap">
      <div class="flex w-full flex-col items-start justify-center gap-3 sm:w-auto">
        <div class="text-mobile-subhead-small sm:text-desktop-subhead-small">{{ $T('Team Size') }}</div>
        <div class="text-mobile-body-large text-text-secondary-light dark:text-text-secondary-dark sm:text-desktop-body-large">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-html="seatsAllocatedHtml"></span>
        </div>
      </div>
      <base-button
        v-if="!isPlanExpired && unexpiredTeamPlan !== 'enterprise'"
        theme="default"
        :size="isPhoneSizeViewportWidth ? 'large' : 'medium'"
        :disabled="isLoadingPlan || isRenewing || isCreatingOrder"
        @click="handleOpenChangeTeamSeatsDialog"
      >
        {{ $T('Adjust') }}
      </base-button>
    </div>

    <base-divider v-if="teamMemberCount" />

    <!-- AI Credits -->
    <team-credits
      :team-plan-profile="teamPlanProfile"
      :unexpired-team-plan="unexpiredTeamPlan"
      :is-my-works-team="isMyWorksTeam"
      :is-plan-subscribed="isPlanSubscribed"
      :team-role="team.role"
      :is-loading-plan="isLoadingPlan"
      :is-renewing="isRenewing"
      :is-creating-order="isCreatingOrder"
      :used-credit-number="usedCreditNumber"
      :total-credit-number="totalCreditNumber"
      @get-extra-credits="handleGetExtraCredits"
    />

    <base-divider v-if="isManagementRole(team) || team.role === 'admin'" />

    <!-- Have a Redeem Code -->
    <div v-if="isManagementRole(team) || team.role === 'admin'" class="flex flex-col items-start gap-4">
      <base-button theme="link" :size="isPhoneSizeViewportWidth ? 'large' : 'medium'" @click="handleClickHaveARedeemCode">
        {{ $T('Have a redeem code?') }}
      </base-button>
      <template v-if="isShowRedeemCodeArea">
        <div ref="redeemCodeRef" class="flex w-full items-center justify-between gap-4">
          <new-input
            ref="redeemInputRef"
            v-model="redeemCodeInput"
            class="flex-1"
            :placeholder="$T('Enter Code')"
            :is-error="Boolean(redeemCodeErrorMessage)"
            @clear="handleClearRedeemCodeInput"
            @input="handleRedeemCodeChange"
            @keydown.enter="handleRedeemCode()"
          ></new-input>
          <base-button :size="isPhoneSizeViewportWidth ? 'large' : 'medium'" theme="default" :disabled="isRedeeming" @click="handleRedeemCode()">
            {{ $T('Redeem') }}
          </base-button>
        </div>
        <span v-if="redeemCodeErrorMessage" class="text-desktop-caption-1 text-red-500">
          {{ redeemCodeErrorMessage }}
        </span>
      </template>
    </div>
  </div>
</template>
