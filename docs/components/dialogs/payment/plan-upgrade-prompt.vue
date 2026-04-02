<template>
  <modal-dialog :is-opened="true" :width="dialogWidth" class="plan-upgrade-prompt-dialog" @modal-dialog-close="handleClose">
    <div class="dialog-container">
      <div class="absolute" :class="closeBtnPositionClasses">
        <span class="close-btn" @click="handleClose">
          <img uk-svg :data-src="$toResourceURL('/assets/static/images/dialog-payment/close.svg')" />
        </span>
      </div>
      <div class="flex flex-col items-center gap-6">
        <img uk-img class="h-60 w-full" :data-src="backgroundSource" />
        <h2 class="font-bold">{{ $T('Upgrade and Go Unlimited') }}</h2>
        <p :style="{ maxWidth: promptMaxWidth }">{{ prompt }}</p>
        <upgrade-gradient-button
          v-if="isTeamOwner"
          :size="isPhoneViewportSmall() ? 'large' : 'medium'"
          class="w-full"
          :disabled="isLoading"
          @click="handleUpgrade()"
        >
          <span v-if="!isLoading">{{ upgradeButtonText }}</span>
          <ellipsis-loading v-else />
        </upgrade-gradient-button>
      </div>
    </div>
  </modal-dialog>
</template>

<script setup lang="ts">
import { usePromiseHook } from 'utils/vue-utils'
import ModalDialog from '../../new-base-modal-dialog.vue'
import UpgradeGradientButton from 'client/components/composite/upgrade-gradient-button.vue'
import EllipsisLoading from 'client/components/ellipsis-loading.vue'
import planUpgradePromptLight from 'assets/import-files/images/dialog-payment/plan-upgrade-prompt-light.png?url'
import planUpgradePromptDark from 'assets/import-files/images/dialog-payment/plan-upgrade-prompt-dark.png?url'
import planUpgradeLimitBrainstormLight from 'assets/import-files/images/dialog-payment/plan-upgrade-limit-brainstorm-light.png?url'
import planUpgradeLimitBrainstormDark from 'assets/import-files/images/dialog-payment/plan-upgrade-limit-brainstorm-dark.png?url'
import { ref, computed, onMounted } from 'vue'
import { $T } from 'client/library/translation'
import { isPhoneViewportSmall } from 'utils/detectDevice'
import { useAppStore, useServiceStore } from 'app/services/pinia'
import { trackNewVersionWorks } from 'client/library/tracker'
import { useTeamSpaceData } from 'app/composables/team-space-data'
import { useContextStore } from 'client/store/context-store'
import { useTracking } from 'client/composables/use-tracking'
import { usePaymentClient } from 'app/composables/payment-client'

const props = defineProps<{
  teamId: string
  isTeamOwner: boolean
  isBrainstormScope: boolean
  trigger: 'create-map' | 'create-sheet'
  limit: number
}>()

const isEligibleForTrial = ref(false)
const isLoading = ref(false)
const { resolve } = usePromiseHook()

const backgroundSource = computed(() => {
  if (props.isBrainstormScope) {
    return useAppStore().appearance === 'dark' ? planUpgradeLimitBrainstormDark : planUpgradeLimitBrainstormLight
  } else {
    return useAppStore().appearance === 'dark' ? planUpgradePromptDark : planUpgradePromptLight
  }
})

const upgradeButtonText = computed(() => {
  return isEligibleForTrial.value ? $T('Start Your Free Trial') : $T('Upgrade Now')
})

const handleUpgrade = async () => {
  const isMyWorksTeam = useTeamSpaceData().defaultTeamId.value === props.teamId

  const { contexts } = useContextStore()
  const tab = contexts.isInRecents ? 'recents' : contexts.isInMyWorks ? 'my_works' : 'team'
  useTracking().trackClick('upgrade', { dlg: 'file_limit', tab })
  useTracking().trackPaywallView({ paywall_trigger: 'file_limit', tab })

  switch (props.trigger) {
    case 'create-map':
      trackNewVersionWorks.upgradeDialog(isMyWorksTeam ? 'fromMyWorksMapLimitPop' : 'fromMapLimitPop')
      break
    case 'create-sheet':
      trackNewVersionWorks.upgradeDialog(isMyWorksTeam ? 'fromMyWorksMapLimitPop' : 'fromSheetLimitPop')
      break
  }

  await useServiceStore().services.action.dialog.openPaymentDialog({
    teamId: props.teamId,
    orderVersion: isMyWorksTeam ? 'premium' : 'business',
    isTrialOrder: isEligibleForTrial.value,
    ...(isMyWorksTeam && { isShowBenefitsSection: true, billingPeriodUIType: 'select' }),
  })
  resolve(true)
}

const handleClose = () => {
  resolve(false)
}

const dialogWidth = isPhoneViewportSmall() ? 343 : 480

const closeBtnPositionClasses = isPhoneViewportSmall() ? 'top-6 right-6' : 'top-8 right-8'

const prompt = computed(() => {
  const isMyWorksTeam = useTeamSpaceData().defaultTeamId.value === props.teamId

  if (props.trigger === 'create-sheet') {
    if (isMyWorksTeam) {
      return $T('Current plan users can create up to $1 sheets per map. Upgrade to create unlimited sheets.', `${props.limit}`)
    } else {
      return props.isTeamOwner
        ? $T('Current plan users can create up to $1 sheets per map. Upgrade to create unlimited sheets.', `${props.limit}`)
        : $T(
            'Free plan users can create up to $1 sheets per map. Please try contacting the team owner to upgrade to create unlimited sheets.',
            `${props.limit}`,
          )
    }
  } else {
    if (isMyWorksTeam) {
      return $T('Current plan users can create up to $1 files. Upgrade to create unlimited files.', `${props.limit}`)
    } else {
      return props.isTeamOwner
        ? $T('Current plan users can create up to $1 files. Upgrade to create unlimited files.', `${props.limit}`)
        : $T('Free plan users can create up to $1 files. Please contact the team owner to upgrade and create unlimited files.', `${props.limit}`)
    }
  }
})

const promptMaxWidth = computed(() => {
  if (isPhoneViewportSmall()) {
    return props.isTeamOwner ? '300px' : '280px'
  } else {
    return props.isTeamOwner ? '343px' : '380px'
  }
})
onMounted(async () => {
  isLoading.value = true
  try {
    isEligibleForTrial.value = await usePaymentClient().isUserEligibleForTrial()
  } catch (error) {
    logger.error('Failed to check trial eligibility:', error)
    isEligibleForTrial.value = false
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped lang="less">
@import '../../../styles/new-ui/new-variables.less';

[color-scheme='light'] .plan-upgrade-prompt-dialog {
  --title-color: @dark-grey-10;
  --prompt-color: @dark-grey-8;
  --close-btn-color: @transparent-dark-7;
}
[color-scheme='dark'] .plan-upgrade-prompt-dialog {
  --title-color: @light-grey-1;
  --prompt-color: @light-grey-1;
  --close-btn-color: @transparent-white-7;
}

.plan-upgrade-prompt-dialog {
  .dialog-container {
    width: 100%;
    text-align: center;

    .close-btn {
      color: var(--close-btn-color);
      cursor: pointer;
      opacity: 0.5;

      &:hover {
        opacity: 0.3;
      }
    }

    h2 {
      color: var(--title-color);
      font-size: 28px;
      line-height: 34px;
    }

    p {
      color: var(--prompt-color);
      font-size: 13px;
      line-height: 18px;
      margin: 0;
    }

    button {
      max-width: 400px;
      width: 100%;
    }
  }

  &:deep(.modal-dialog__body) {
    padding: 0px 0px 40px 0px;
  }

  &:deep(.modal-dialog__header),
  &:deep(.modal-dialog__footer) {
    display: none;
  }

  @media screen and (max-width: @breakpoint-small) {
    &:deep(.modal-dialog__body) {
      padding: 0px 0px 32px 0px;
    }

    .dialog-container {
      h2 {
        font-size: 24px;
        line-height: 30px;
      }

      button {
        max-width: 280px;
        width: 100%;
      }
    }
  }
}
</style>
