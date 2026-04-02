<template>
  <modal-dialog
    :is-opened="true"
    :width="dialogWidth"
    :dialog-body-class="'!p-0'"
    :dialog-class="isPhoneViewportSmall() ? 'mobile-dialog !m-auto !rounded-2xl' : ''"
    :overlay-classes="isPhoneViewportSmall() ? 'items-center' : ''"
    @modal-dialog-close="handleClose"
  >
    <div class="dialog-container w-full pb-4 text-center sm:pb-6">
      <div class="absolute" :class="closeBtnPositionClasses">
        <span class="cursor-pointer text-gray-500 transition-opacity hover:opacity-30 dark:text-gray-400" @click="handleClose">
          <img uk-svg :data-src="$toResourceURL('/assets/static/images/dialog-payment/close.svg')" />
        </span>
      </div>
      <div class="flex flex-col items-center gap-4 px-4 sm:gap-6 sm:px-6">
        <img uk-img class="h-[220px] w-[432px]" :data-src="backgroundSource" />
        <h2 class="text-text-primary-light dark:text-text-primary-dark text-2xl font-bold leading-[30px] sm:text-[28px] sm:leading-[34px]">
          {{ title }}
        </h2>
        <p :style="{ maxWidth: promptMaxWidth }" class="text-text-secondary-light dark:text-text-secondary-dark m-0 text-sm leading-[18px]">
          {{ prompt }}
        </p>

        <upgrade-gradient-button class="w-full max-w-[400px]" :size="isPhoneViewportSmall() ? 'large' : 'medium'" @click="handleUpgrade()">
          {{ upgradeButtonText }}
        </upgrade-gradient-button>
        <fw-button theme="default" :size="isPhoneViewportSmall() ? 'large' : 'medium'" class="w-full max-w-[400px]" @click="handleContinue()">
          {{ $T('Continue') }}
        </fw-button>
      </div>
    </div>
  </modal-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePromiseHook } from 'utils/vue-utils'
import ModalDialog from '../../new-base-modal-dialog.vue'
import UpgradeGradientButton from 'client/components/composite/upgrade-gradient-button.vue'
import { $T } from 'client/library/translation'
import { isPhoneViewportSmall } from 'utils/detectDevice'
import { useAppStore, useServiceStore } from 'app/services/pinia'
import { ProductMode } from 'app/types/file-limit'
import { useTeamSpaceData } from 'app/composables/team-space-data'
import { useContextStore } from 'client/store/context-store'
import { useTracking } from 'client/composables/use-tracking'
import { REGION } from 'client/constants'
import planUpgradePromptLight from 'assets/import-files/images/dialog-payment/plan-upgrade-prompt-light.png?url'
import planUpgradePromptDark from 'assets/import-files/images/dialog-payment/plan-upgrade-prompt-dark.png?url'

const props = defineProps<{
  teamId: string
  productMode: ProductMode
}>()

const { resolve } = usePromiseHook()

const dialogWidth = isPhoneViewportSmall() ? 343 : 480
const closeBtnPositionClasses = isPhoneViewportSmall() ? 'top-6 right-6' : 'top-4 right-8'

const isMyWorksTeam = computed(() => useTeamSpaceData().defaultTeamId.value === props.teamId)

const title = computed(() => {
  return isMyWorksTeam.value ? $T('Create Without Limits') : $T('Teamwork Without Limits')
})

const upgradeButtonText = computed(() => {
  if (REGION === 'cn') {
    return $T('Upgrade Now')
  }

  return props.productMode === ProductMode.FREE_TRIAL
    ? isMyWorksTeam.value
      ? $T('Start Your Free Trial')
      : $T('Go Limitless With Trial')
    : $T('Upgrade Now')
})

const backgroundSource = computed(() => {
  return useAppStore().appearance === 'dark' ? planUpgradePromptDark : planUpgradePromptLight
})

const prompt = computed(() => {
  return isMyWorksTeam.value
    ? $T("You've created 8 awesome maps, leaving only 2 more on the current free plan. Upgrade to create unlimited files.")
    : $T('Your team just created 2 awesome maps, leaving only 1 more on the current free plan. Upgrade to create unlimited files.')
})

const promptMaxWidth = computed(() => {
  return isPhoneViewportSmall() ? '300px' : '343px'
})

const handleUpgrade = async () => {
  const { contexts } = useContextStore()
  const tab = contexts.isInRecents ? 'recents' : contexts.isInMyWorks ? 'my_works' : 'team'

  const isTrialMode = REGION === 'cn' ? false : props.productMode === ProductMode.FREE_TRIAL
  const btnId = isTrialMode ? 'start_free_trial' : 'upgrade'
  const plan = isMyWorksTeam.value ? 'premium' : 'business'

  useTracking().trackClick(btnId, {
    plan,
    dlg: 'file_limit_pre_reminder',
    tab,
  })

  if (REGION === 'cn') {
    await useServiceStore().services.action.dialog.openActivateDialog({ teamId: props.teamId })
    resolve(false)
    return
  }

  await useServiceStore().services.action.dialog.openPaymentDialog({
    teamId: props.teamId,
    orderVersion: isMyWorksTeam.value ? 'premium' : 'business',
    planDuration: 'yearly',
    isTrialOrder: isTrialMode,
    ...(isMyWorksTeam.value && { isShowBenefitsSection: true, billingPeriodUIType: 'select' }),
  })

  resolve(false)
}

const handleClose = () => {
  resolve(false)
}

const handleContinue = () => {
  resolve(true)
}
</script>
