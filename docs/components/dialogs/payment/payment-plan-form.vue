<template>
  <div class="payment-plan-dialog mx-auto h-full w-full max-w-[1137px]">
    <h1
      class="max-w-96 px-[16px] text-left text-mobile-headline-small text-text-primary-light dark:text-text-primary-dark sm:max-w-full min-w-906:mb-[12px] min-w-906:px-0 min-w-906:text-center min-w-906:text-desktop-headline-large"
    >
      {{ title }}
    </h1>

    <base-divider class="mb-[24px] mt-[24px] block !border-divider-onContainer-light dark:!border-divider-onContainer-dark min-w-906:hidden" />

    <div class="plan-card-container" :class="planCardContainerClass">
      <span v-if="subTitle" class="description">{{ subTitle }}</span>

      <fw-switcher v-model="selectedPlanDuration" class="plan-switcher" :options="durations">
        <template #yearly>
          <div class="flex gap-2">
            <span>{{ $T('Yearly') }}</span>
            <span class="text-xred-500">{{ $T('Up to $1% OFF', '45') }}</span>
          </div>
        </template>
      </fw-switcher>

      <template v-if="isMyWorksTeam">
        <!-- Free Card -->
        <plan-card
          class="plan-card justify-self-end min-w-906:max-w-[360px]"
          :data="freePlanCardData"
          :highlight="true"
          :style="{ 'grid-area': 'card1', width: '-webkit-fill-available' }"
          :top-title="$T('Most Popular')"
        >
          <template #plan-price>
            <div class="flex h-[34px] items-baseline whitespace-pre">
              <span class="text-mobile-subhead-mini sm:text-desktop-subhead-mini">US $ </span>
              <span class="translate-y-[1px] text-mobile-headline-large sm:text-desktop-headline-large">0</span>
            </div>
          </template>
          <template #plan-button>
            <slot name="free-plan-btn" :duration="selectedPlanDuration"></slot>
          </template>
        </plan-card>

        <!-- Premium Card -->
        <plan-card
          class="plan-card min-w-906:max-w-[360px]"
          :data="premiumPlanCardData"
          :selected="selectedPlans?.includes('premium')"
          :top-title="$T('Most Popular')"
          style="grid-area: card2"
        >
          <template #plan-price>
            <div class="flex h-[34px] items-baseline whitespace-pre">
              <span class="text-mobile-subhead-mini sm:text-desktop-subhead-mini">US $ </span>
              <span class="translate-y-[1px] text-mobile-headline-large sm:text-desktop-headline-large">
                {{ getPlanPerMonthDisplayPrice('premium', selectedPlanDuration) }}
              </span>
              <span class="text-mobile-subhead-mini text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-subhead-mini">
                / {{ duration }}
              </span>
            </div>
          </template>
          <template #plan-button>
            <div class="flex flex-col items-start justify-center gap-4 self-stretch">
              <upgrade-gradient-button class="w-full" @click="handleClickUpgrade({ orderVersion: 'premium' })">
                {{ upgradeButtonLabel }}
              </upgrade-gradient-button>
              <div v-if="showTryItFree" class="flex items-center justify-center gap-2">
                <span class="text-mobile-body-medium text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-body-medium">
                  {{ $T('or') }}
                </span>
                <base-button
                  theme="primary"
                  size="medium"
                  :text-button="true"
                  @click="handleClickUpgrade({ orderVersion: 'premium', fromPurchaseNow: true })"
                >
                  {{ $T('Purchase Now') }}
                </base-button>
              </div>
            </div>
          </template>
        </plan-card>

        <!-- Duo Card -->
        <!-- <plan-card v-show="selectedPlanDuration === 'yearly'" class="duo-card plan-card relative max-w-[360px]" :data="duoPlanCardData">
          <template #plan-name>
            <span>{{ duoPlanCardData.name }}</span>
            <span class="best-value-badge duo-gradient-text relative shrink-0 px-[12px] py-[4px] text-desktop-title-2">{{ $T('Best Value') }}</span>
          </template>
          <template #plan-price>
            <div class="flex h-[34px] items-baseline whitespace-pre">
              <span class="text-mobile-title-2 sm:text-[14px]">US $ </span>
              <span class="duo-gradient-text translate-y-[1px] text-mobile-display-2 sm:text-desktop-display-2">
                {{ getPlanPerMonthDisplayPrice('duo', selectedPlanDuration) }}
              </span>
              <span class="text-mobile-title-2 text-transparent-dark-7 dark:text-transparent-white-7 sm:text-[14px]"> / {{ $T('Year') }}</span>
              <span class="ml-[8px] text-desktop-headline-3 line-through">US $139</span>
            </div>
          </template>
          <template #plan-button>
            <button
              class="duo-button tw-button-large w-full text-light-grey-1 shadow-button-shadow-1 dark:text-light-grey-1 [&[disabled]]:cursor-not-allowed [&[disabled]]:opacity-30"
              :disabled="isCreatingOrder"
              @click="isDuoCardShowContactUs ? handleClickDuoCardContactUs() : handleClickUpgrade({ orderVersion: 'duo' })"
            >
              {{ isDuoCardShowContactUs ? $T('Contact Us') : $T('Buy Now') }}
            </button>
          </template>
        </plan-card> -->
      </template>

      <template v-else>
        <!-- Free Card -->
        <plan-card
          v-if="isFreeTeamPlanCardVisible"
          class="plan-card min-w-906:max-w-[360px]"
          :data="freeForTeamsPlanCardData"
          :highlight="true"
          :top-title="$T('Most Popular')"
          style="grid-area: card1"
        >
          <template #plan-price>
            <div class="flex h-[34px] items-baseline whitespace-pre">
              <span class="text-mobile-subhead-mini sm:text-desktop-subhead-mini">US $ </span>
              <span class="translate-y-[1px] text-mobile-headline-large sm:text-desktop-headline-large">0</span>
            </div>
          </template>
          <template #plan-button>
            <slot name="free-plan-btn" :duration="selectedPlanDuration"></slot>
          </template>
        </plan-card>

        <!-- Business Card -->
        <plan-card
          class="plan-card min-w-906:max-w-[360px]"
          :selected="selectedPlans?.includes('business')"
          :data="businessPlanCardData"
          :top-title="$T('Most Popular')"
          :style="{ 'grid-area': isFreeTeamPlanCardVisible ? 'card2' : 'card1', 'justify-self': isFreeTeamPlanCardVisible ? 'auto' : 'end' }"
        >
          <template #plan-price>
            <div class="flex h-[34px] items-baseline whitespace-pre">
              <span class="text-mobile-subhead-mini sm:text-desktop-subhead-mini">US $ </span>
              <span class="translate-y-[1px] text-mobile-headline-large sm:text-desktop-headline-large">
                {{ getPlanPerMonthDisplayPrice('business', selectedPlanDuration) }}
              </span>
              <span class="text-mobile-subhead-mini text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-subhead-mini">
                / {{ $T('Seat') }}
              </span>
              <span class="text-mobile-subhead-mini text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-subhead-mini">
                / {{ $T('Month') }}
              </span>
            </div>
          </template>
          <template #plan-button>
            <div class="flex flex-col items-start justify-center gap-4 self-stretch">
              <template v-if="businessPlanUpgradeButtonType === 'normal'">
                <base-button theme="default" size="large" class="w-full" @click="handleClickUpgrade({ orderVersion: 'business' })">
                  <span>{{ $T('Upgrade') }}</span>
                </base-button>
              </template>
              <template v-else-if="businessPlanUpgradeButtonType === 'current'">
                <base-button theme="default" size="large" class="w-full" :disabled="true">
                  <span>{{ $T('Current') }}</span>
                </base-button>
              </template>
              <template v-else>
                <upgrade-gradient-button class="w-full" @click="handleClickUpgrade({ orderVersion: 'business' })">
                  {{ upgradeButtonLabel }}
                </upgrade-gradient-button>
                <div v-if="showTryItFree" class="flex items-center justify-center gap-2">
                  <span class="text-mobile-body-medium text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-body-medium">
                    {{ $T('or') }}
                  </span>
                  <base-button
                    theme="primary"
                    size="medium"
                    :text-button="true"
                    @click="handleClickUpgrade({ orderVersion: 'business', fromPurchaseNow: true })"
                  >
                    {{ $T('Purchase Now') }}
                  </base-button>
                </div>
              </template>
            </div>
          </template>
        </plan-card>

        <!-- Enterprise Card -->
        <plan-card
          class="plan-card min-w-906:max-w-[360px]"
          :selected="selectedPlans?.includes('enterprise')"
          :data="enterprisePlanCardData"
          :highlight="true"
          :top-title="$T('Upgrade Now')"
          :style="{ 'grid-area': isFreeTeamPlanCardVisible ? 'card3' : 'card2' }"
        >
          <template #plan-price>
            <icon name="enterprise" width="40" height="40" />
          </template>
          <template #plan-button>
            <upgrade-gradient-button v-if="selectedPlans?.includes('enterprise')" class="w-full" @click="handleClickEnterpriseContactSales">
              {{ $T('Contact Sales') }}
            </upgrade-gradient-button>
            <base-button v-else size="large" theme="default" class="w-full" @click="handleClickEnterpriseContactSales">
              <span>{{ $T('Contact Sales') }}</span>
            </base-button>
          </template>
        </plan-card>
      </template>
    </div>

    <!-- <div class="enterprise-card mb-[32px] mt-[16px]" :class="planCardContainerSwipeClass">
      <div
        class="flex gap-[24px] rounded-[16px] bg-light-grey-1 p-[32px] shadow-popover-light dark:bg-dark-grey-6 dark:shadow-popover-grey"
        :class="isPhoneOrTabletViewportWidth ? 'flex-col items-start' : 'items-center justify-between'"
      >
        <div
          class="flex gap-[12px] text-dark-grey-8 dark:text-light-grey-1"
          :class="isPhoneOrTabletViewportWidth ? 'flex-col items-start justify-center' : 'items-center'"
        >
          <template v-if="isPhoneOrTabletViewportWidth">
            <div class="flex items-center gap-[12px]">
              <img uk-svg class="shrink-0" :data-src="$toResourceURL('/assets/static/images/dialog-payment/enterprise.svg')" />
              <span class="text-desktop-headline-1">{{ $T('Learn about our Enterprise plan') }}</span>
            </div>
            <span class="text-desktop-footnote text-dark-grey-5 dark:text-dark-grey-1">
              {{ $T('Built for enhanced security, scalable mind mapping process across companies, and more.') }}
            </span>
          </template>
          <template v-else>
            <img uk-svg class="shrink-0" :data-src="$toResourceURL('/assets/static/images/dialog-payment/enterprise.svg')" />
            <div class="flex flex-col items-start gap-[8px]">
              <span class="text-desktop-headline-1">{{ $T('Learn about our Enterprise plan') }}</span>
              <span class="text-desktop-footnote text-dark-grey-5 dark:text-dark-grey-1">
                {{ $T('Built for enhanced security, scalable mind mapping process across companies, and more.') }}
              </span>
            </div>
          </template>
        </div>
        <button
          class="tw-button-secondary tw-button-large self-stretch md:min-w-[172px] md:max-w-[304px] md:self-auto"
          @click="handleClickEnterpriseContactSales"
        >
          <span>{{ $T('Contact Sales') }}</span>
        </button>
      </div>
    </div> -->

    <!-- See all features -->
    <div class="see-all-features mt-[32px] flex items-center justify-center">
      <base-button theme="link" size="medium" class="mb-[48px] min-w-906:mb-[96px]" @click="handleOpenPricing">
        <span>{{ $T('See all features') }}</span>
      </base-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref, watch } from 'vue'
import { useAccountStore, useServiceStore, useWorkspaceStore } from 'app/services/pinia'
import { useMasterLoading } from 'app/composables/master-loading'
import {
  type PlanDurationOption,
  type OrderVersion,
  businessPlanCardData,
  enterprisePlanCardData,
  freePlanCardData,
  getPlanPerMonthDisplayPrice,
  freeForTeamsPlanCardData,
  premiumPlanCardData,
} from 'client/library/payment'
import { $T } from 'client/library/translation'
import PlanCard from './plan-card.vue'
import BaseButton from 'client/components/base/button.vue'
import BaseDivider from 'client/components/base/divider.vue'
import Icon from 'client/components/icon/icon.vue'
import UpgradeGradientButton from 'client/components/composite/upgrade-gradient-button.vue'
import { trackNewVersionWorks, trackTeam } from 'client/library/tracker'
import { storeToRefs } from 'pinia'
import { UrlActionManager } from 'client/library/url-action-manager'
import { enterprisePlanWaitlistLink } from 'client/constants'
import { useTeamSpaceData } from 'app/composables/team-space-data'
import { useTracking } from 'client/composables/use-tracking'
import { usePaymentClient } from 'app/composables/payment-client'
import { type PlusAccount } from 'client/server-export'

const props = withDefaults(
  defineProps<{
    title: string
    subTitle?: string
    teamId: string
    scenario: 'new-team' | 'payment-plan'
    selectedPlans?: PlusAccount['plan'][]
  }>(),
  {
    subTitle: '',
    selectedPlans: () => ['premium', 'business'],
  },
)

const emit = defineEmits(['close'])

const { showMasterLoading } = useMasterLoading()

const { isSignedIn } = storeToRefs(useAccountStore())

const isMyWorksTeam = computed(() => props.teamId === useTeamSpaceData().defaultTeamId.value)

const { getUnexpiredTeamPlanSync } = useTeamSpaceData()

const currentPlan = computed(() => getUnexpiredTeamPlanSync(props.teamId))

const durations: Array<{ key: PlanDurationOption; name: string }> = [
  { key: 'monthly', name: $T('Monthly') },
  { key: 'yearly', name: $T('Yearly') },
]

const selectedPlanDuration = ref<PlanDurationOption>('yearly')
const isEligibleForTrial = ref(false)

const isFreeTeamPlanCardVisible = computed(() => {
  return props.scenario === 'new-team' || currentPlan.value !== 'business'
})

const showTryItFree = computed(() => (isEligibleForTrial.value || !isSignedIn.value) && selectedPlanDuration.value === 'yearly')

const duration = computed(() => {
  switch (selectedPlanDuration.value) {
    case 'monthly':
      return $T('Month')
    case 'yearly':
    default:
      return $T('Year')
  }
})

const businessPlanUpgradeButtonType = computed<'highlight' | 'normal' | 'current'>(() => {
  if (props.scenario === 'new-team') return 'highlight'
  if (currentPlan.value === 'business') return 'current'
  if (props.selectedPlans?.includes('enterprise')) return 'normal'
  return 'highlight'
})

const planCardContainerClass = computed(() => {
  if (isMyWorksTeam.value) {
    return 'two-cards'
  } else {
    return currentPlan.value === 'business' ? 'two-cards' : 'three-cards'
  }
})

const upgradeButtonLabel = computed(() => {
  return showTryItFree.value ? $T('Try It Free') : $T('Upgrade')
})

const handleClose = () => {
  trackNewVersionWorks.upgradeNow('Close')
  emit('close')
}

const handleClickEnterpriseContactSales = () => {
  window.open(enterprisePlanWaitlistLink, '_blank')
  props.scenario === 'new-team' && trackTeam.newTeamChoosePlan('ContactSales')
  trackNewVersionWorks.upgradeNow(selectedPlanDuration.value === 'yearly' ? 'TeamYearlyEnterpriseContactSales' : 'TeamMonthlyEnterpriseContactSales')
}

/* const handleClickDuoCardContactUs = () => {
  let planText = 'Xmind'
  if (teamPlan.value === 'personal') {
    planText = 'Xmind AI Personal'
  } else if (teamPlan.value === 'team') {
    planText = 'Xmind AI Team'
  } else if (isUserProSubscribed.value) {
    planText = 'Xmind Pro'
  }
  emailFeedback(
    'Xmind Duo Suite Upgrade Offer',
    `Hi Xmind AI Team,\n\nI'm currently a subscriber of ${planText} and I'm interested in upgrading to the Xmind Duo Suite. Could you please provide me with the details on how to proceed with this upgrade?`,
  )
} */

const handleOpenPricing = () => {
  useServiceStore().services.router.openPricing('_blank')
  props.scenario === 'new-team' && trackTeam.newTeamChoosePlan('SeeAllFeatures')
  trackNewVersionWorks.upgradeNow('SeeAllFeatures')
}

/* Remove swipe feature, but save the code
const { windowWidth } = useWindowResize()
const selectedCardId = ref<PlanId>('business')
const handleSelectCard = (id: PlanId) => {
  selectedCardId.value = id
}

let startSwipeX: number

const planCardContainerSwipeClass = computed(() => {
  if (windowWidth.value <= 905) {
    switch (selectedCardId.value) {
      case 'essential':
        return 'swipe-1-3'
      case 'enterprise':
        return 'swipe-3-3'
      case 'business':
      default:
        return 'swipe-2-3'
    }
  } else {
    return ''
  }
})

const handleStartSwipe = (event: TouchEvent | MouseEvent) => {
  if (event instanceof TouchEvent) {
    startSwipeX = event.touches[0].clientX
  } else if (event instanceof MouseEvent && event.button === 0) {
    startSwipeX = event.clientX
  }
}

const handleSwipeMove = (event: TouchEvent | MouseEvent) => {
  if (!startSwipeX) return

  let endSwipeX: number
  let diff: number
  if (event instanceof TouchEvent) {
    endSwipeX = event.touches[0].clientX
  } else if (event instanceof MouseEvent) {
    endSwipeX = event.clientX
  } else {
    endSwipeX = startSwipeX
  }
  diff = startSwipeX - endSwipeX

  // Swiped Left
  if (diff > 60) {
    switch (selectedCardId.value) {
      case 'essential':
        handleSelectCard('business')
        break
      case 'business':
        handleSelectCard('enterprise')
        break
    }
    startSwipeX = null
  }
  // Swiped Right
  else if (diff < -60) {
    switch (selectedCardId.value) {
      case 'enterprise':
        handleSelectCard('business')
        break
      case 'business':
        handleSelectCard('essential')
        break
    }
    startSwipeX = null
  }
} */

const handleClickUpgrade = async (args: { orderVersion: OrderVersion; fromPurchaseNow?: boolean }) => {
  const { orderVersion, fromPurchaseNow = false } = args

  const isTrialOrder = !fromPurchaseNow && showTryItFree.value && ['essential', 'business', 'premium'].includes(orderVersion)

  trackClickUpgrade(fromPurchaseNow, isTrialOrder, orderVersion)

  if (isSignedIn.value) {
    openPaymentDialog(orderVersion, isTrialOrder)
  } else {
    let createdDriveFileId: string
    const { editor: editorState } = useWorkspaceStore()
    const isInEditor = !!editorState
    const isXmindSharingFile = editorState?.meta?.extension?.name === 'xmind-sharing'

    const logInResult = await useServiceStore().services.action.dialog.openLoginDialog({
      afterLogin: async () => {
        if (isXmindSharingFile || !isInEditor) return true
        createdDriveFileId = (await useServiceStore().services.action.editorNext.updateFileFromCurrentEditor.execute())?.fileId
        return !!createdDriveFileId
      },
    })
    if (!logInResult) return

    UrlActionManager.appendActionURL({ name: UrlActionManager.ActionNames.openPaymentPlanDialog })

    if (isInEditor && !isXmindSharingFile && createdDriveFileId) {
      handleClose()
      showMasterLoading()
      await useServiceStore().services.action.editorNext.closeEditor.execute({ isGoHome: false, isForceClose: true })
      await useServiceStore().services.router.gotoXmindDriveEditor({ fileId: createdDriveFileId })
      window.location.reload()
    } else if (isInEditor && isXmindSharingFile) {
      handleClose()
      window.location.reload()
    }
  }
}

const openPaymentDialog = async (orderVersion: OrderVersion, isTrialOrder = false) => {
  const result = await useServiceStore().services.action.dialog.openPaymentDialog({
    orderVersion,
    planDuration: selectedPlanDuration.value,
    isTrialOrder,
    teamId: props.teamId,
  })
  return result
}

const trackClickUpgrade = (fromPurchaseNow: boolean, isTrialOrder: boolean, orderVersion: OrderVersion) => {
  useTracking().trackClick(isTrialOrder ? 'start_free_trial' : 'start_purchase', { plan: orderVersion, renew_period: selectedPlanDuration.value })

  if (selectedPlanDuration.value === 'yearly' && isTrialOrder) {
    trackNewVersionWorks.tryItFree('Click')
  }

  // My Works
  if (isMyWorksTeam.value && orderVersion === 'duo') {
    trackNewVersionWorks.upgradeNow('DuoSuiteYearlyBuyNow')
  } else if (isMyWorksTeam.value && selectedPlanDuration.value === 'monthly') {
    trackNewVersionWorks.upgradeNow('MyWorksMonthlyUpgrade')
  } else if (isMyWorksTeam.value && selectedPlanDuration.value === 'yearly' && fromPurchaseNow) {
    trackNewVersionWorks.upgradeNow('MyWorksYearlyPurchaseNow')
  } else if (isMyWorksTeam.value && selectedPlanDuration.value === 'yearly' && !showTryItFree.value) {
    trackNewVersionWorks.upgradeNow('MyWorksYearlyUpgrade')
  } else if (isMyWorksTeam.value && selectedPlanDuration.value === 'yearly' && isTrialOrder) {
    trackNewVersionWorks.upgradeNow('MyWorksYearlyTryItFree')
  }
  // Teams Essential
  else if (selectedPlanDuration.value === 'yearly' && orderVersion === 'essential' && fromPurchaseNow) {
    props.scenario === 'new-team'
      ? trackTeam.newTeamChoosePlan('YearlyEssentialPurchaseNow')
      : trackNewVersionWorks.upgradeNow('TeamYearlyEssentialPurchaseNow')
  } else if (selectedPlanDuration.value === 'yearly' && orderVersion === 'essential' && !showTryItFree.value) {
    props.scenario === 'new-team'
      ? trackTeam.newTeamChoosePlan('YearlyEssentialUpgrade')
      : trackNewVersionWorks.upgradeNow('TeamYearlyEssentialUpgrade')
  } else if (selectedPlanDuration.value === 'yearly' && orderVersion === 'essential' && isTrialOrder) {
    props.scenario === 'new-team'
      ? trackTeam.newTeamChoosePlan('YearlyEssentialTryItFree')
      : trackNewVersionWorks.upgradeNow('TeamYearlyEssentialTryItFree')
  } else if (selectedPlanDuration.value === 'monthly' && orderVersion === 'essential') {
    props.scenario === 'new-team'
      ? trackTeam.newTeamChoosePlan('MonthlyEssentialUpgrade')
      : trackNewVersionWorks.upgradeNow('TeamMonthlyEssentialUpgrade')
  }
  // Teams Business
  else if (selectedPlanDuration.value === 'yearly' && orderVersion === 'business' && fromPurchaseNow) {
    props.scenario === 'new-team'
      ? trackTeam.newTeamChoosePlan('YearlyBusinessPurchaseNow')
      : trackNewVersionWorks.upgradeNow('TeamYearlyBusinessPurchaseNow')
  } else if (selectedPlanDuration.value === 'yearly' && orderVersion === 'business' && !showTryItFree.value) {
    props.scenario === 'new-team'
      ? trackTeam.newTeamChoosePlan('YearlyBusinessUpgrade')
      : trackNewVersionWorks.upgradeNow('TeamYearlyBusinessUpgrade')
  } else if (selectedPlanDuration.value === 'yearly' && orderVersion === 'business' && isTrialOrder) {
    props.scenario === 'new-team'
      ? trackTeam.newTeamChoosePlan('YearlyBusinessTryItFree')
      : trackNewVersionWorks.upgradeNow('TeamYearlyBusinessTryItFree')
  } else if (selectedPlanDuration.value === 'monthly' && orderVersion === 'business') {
    props.scenario === 'new-team'
      ? trackTeam.newTeamChoosePlan('MonthlyBusinessUpgrade')
      : trackNewVersionWorks.upgradeNow('TeamMonthlyBusinessUpgrade')
  }
}

watch(selectedPlanDuration, newDuration => {
  if (newDuration === 'yearly') {
    useTracking().trackClick('switch_plan_yearly')
  } else {
    useTracking().trackClick('switch_plan_monthly')
  }
})

onBeforeMount(async () => {
  const eligible = await usePaymentClient().isUserEligibleForTrial()
  isEligibleForTrial.value = eligible
  if (showTryItFree.value) {
    trackNewVersionWorks.tryItFree('Show')
  }
})
</script>

<style scoped lang="less">
@import '../../../styles/vanakit-override.less';

[color-scheme='light'] .payment-plan-dialog {
  --description-text-color: @transparent-dark-7;
  --duo-overlay-bg-color: @light-grey-1;
}
[color-scheme='dark'] .payment-plan-dialog {
  --description-text-color: @transparent-white-7;
  --duo-overlay-bg-color: @dark-grey-6;

  .duo-yearly-option {
    background-image: linear-gradient(133deg, #e09eff -8.87%, #ff6742 108.18%);
  }
}

.payment-plan-dialog {
  --duo-linear-gradient-color: linear-gradient(133deg, #7f31ff -8.87%, #fa4a1e 108.18%);

  .card-price-sub-text {
    color: var(--description-text-color);
    font-size: 13px;
    font-weight: 700;
    line-height: 18px;
  }

  .description {
    grid-area: description;
    color: var(--description-text-color);
    text-align: center;
    font-size: 16px;
    line-height: 24px;
    width: 524px;
    margin-bottom: 16px;
    justify-self: center;
  }

  .plan-card-container {
    grid-column: 2/5;
    display: grid;
    justify-content: center;
    align-items: flex-end;
    gap: 16px;
    padding-left: 16px;
    padding-right: 16px;

    &.two-cards {
      grid-template-columns: 1fr 1fr;
      grid-template-areas: 'description description' 'plan-switcher plan-switcher' 'card1 card2';
    }
    &.three-cards {
      grid-template-columns: 1fr 1fr 1fr;
      grid-template-areas:
        'description description description'
        'plan-switcher plan-switcher plan-switcher'
        'card1 card2 card3';
    }

    .plan-card {
      flex: 1;
      align-self: stretch;
    }

    &:has(.plan-card.selected) .plan-card {
      align-self: normal;
    }
  }

  .plan-switcher {
    grid-area: plan-switcher;
    margin-bottom: 16px;
    width: fit-content;
    justify-self: center;
  }

  .enterprise-card {
    grid-column: 2/5;
  }

  .see-all-features {
    grid-column: 3/4;
  }

  .duo-card {
    transform: rotate(2deg) translateX(-20px);

    &:deep(.plan-card-content::before),
    .best-value-badge::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--duo-linear-gradient-color);
      border-radius: 16px;
    }
    &:deep(.plan-card-content::after),
    .best-value-badge::after {
      content: '';
      position: absolute;
      top: 3px;
      left: 3px;
      right: 3px;
      bottom: 3px;
      background: var(--duo-overlay-bg-color);
    }

    &:deep(.plan-card-content::before) {
      z-index: -2;
    }
    &:deep(.plan-card-content::after) {
      z-index: -2;
      border-radius: 13px;
    }

    .best-value-badge {
      &::before {
        z-index: -1;
      }
      &::after {
        z-index: -1;
        border-radius: 16px;
      }
    }

    .duo-button {
      background-image: var(--duo-linear-gradient-color);
    }
  }

  .duo-gradient-text {
    background-image: var(--duo-linear-gradient-color);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  @media screen and (max-width: 905px) {
    .description {
      text-align: left;
      justify-self: flex-start;
      width: 307px;
    }
    .plan-switcher {
      justify-self: flex-start;
    }

    .plan-card-container {
      /* width: 250vw;
      transition: transform 0.3s ease;

      &.swipe-1-3 {
        transform: translateX(calc((50vw + 32px) / 6));
      }
      &.swipe-2-3 {
        transform: translateX(-75vw);
      }
      &.swipe-3-3 {
        transform: translateX(calc((-950vw - 32px) / 6));
      } */
      display: grid;
      width: 100%;

      &.two-cards {
        grid-template-columns: repeat(2, minmax(min-content, 1fr));
        grid-template-areas: 'description description' 'plan-switcher plan-switcher' 'card1 card2';
      }
      &.three-cards {
        grid-template-columns: repeat(2, minmax(min-content, 1fr));
        grid-template-areas:
          'description description'
          'plan-switcher plan-switcher'
          'card1 card2'
          'card3 .';
      }
      &.three-cards:has(.duo-card) {
        grid-template-areas:
          'description description'
          'plan-switcher plan-switcher'
          'card3 card2'
          'card1 .';
      }
    }

    .enterprise-card {
      display: flex;
      justify-content: center;
      width: 250vw;
      transform: translateX(-75vw);
      transition: transform 0.3s ease;

      > div {
        width: calc((100% - 32px) / 3);
      }
    }

    .duo-card {
      transform: initial;
    }
  }

  @media screen and (max-width: 767px) {
    .plan-card-container {
      &.two-cards {
        grid-template-columns: 1fr 1fr;
        grid-template-areas: 'description description' 'plan-switcher plan-switcher' 'card1 card2';
      }
      &.three-cards {
        grid-template-columns: 1fr 1fr;
        grid-template-areas:
          'description description'
          'plan-switcher plan-switcher'
          'card1 card2'
          'card3 .';
      }
      &.three-cards:has(.duo-card) {
        grid-template-areas:
          'description description'
          'plan-switcher plan-switcher'
          'card3 card2'
          'card1 .';
      }
    }
  }

  @media screen and (max-width: @breakpoint-small) {
    .plan-card-container {
      &.two-cards {
        grid-template-columns: minmax(min-content, 1fr);
        grid-template-areas: 'description' 'plan-switcher' 'card2' 'card1';
      }
      &.three-cards {
        grid-template-columns: minmax(min-content, 1fr);
        grid-template-areas: 'description' 'plan-switcher' 'card2' 'card1' 'card3';
      }
      &.three-cards:has(.duo-card) {
        grid-template-areas: 'description' 'plan-switcher' 'card3' 'card2' 'card1';
      }
    }
  }

  @media screen and (min-width: 906px) {
    .plan-card-container.three-cards {
      &:has(.plan-card.selected) .plan-card:not(.selected) {
        margin-top: 42px;
      }
    }
  }

  @media screen and (min-width: @breakpoint-small) and (max-width: 905px) {
    .plan-card-container.three-cards {
      &:has(.plan-card.selected) .plan-card:first-child {
        margin-top: 42px;
      }
    }
  }

  @media screen and (min-width: @breakpoint-small) {
    .plan-card-container.two-cards {
      &:has(.plan-card.selected) .plan-card:not(.selected) {
        margin-top: 42px;
      }
    }
  }
}
</style>
