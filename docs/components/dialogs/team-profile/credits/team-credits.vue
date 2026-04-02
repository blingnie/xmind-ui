<script setup lang="ts">
import { computed } from 'vue'
import { $T } from 'client/library/translation'
import Icon from 'client/components/icon/icon.vue'
import BaseButton from 'client/components/base/button.vue'
import CreditsProgressBar from './credits-progress-bar.vue'
import CreditsLegend from './credits-legend.vue'
import AiUpgradeNotification from './ai-upgrade-notification.vue'
import type { CreditSegment } from './credits-progress-bar.vue'
import type { CreditLegendItem } from './credits-legend.vue'
import type { PlusAccount } from 'client/server-export'
import { useWindowResize } from 'client/composables/window-resize'
import { isManagementRole } from 'utils/global-helper'
import { REGION } from 'client/constants'

const props = defineProps<{
  teamPlanProfile: PlusAccount
  unexpiredTeamPlan: string
  isMyWorksTeam: boolean
  isPlanSubscribed: boolean
  teamRole: string
  isLoadingPlan: boolean
  isRenewing: boolean
  isCreatingOrder: boolean
  usedCreditNumber: number
  totalCreditNumber: number
}>()

defineEmits<{
  (event: 'get-extra-credits'): void
}>()

const { isPhoneSizeViewportWidth } = useWindowResize()

const isAICreditsUnlimited = computed(() => props.unexpiredTeamPlan === 'enterprise')

const creditSegments = computed<CreditSegment[]>(() => {
  if (!props.teamPlanProfile?.credits || isAICreditsUnlimited.value) return []

  const segments: CreditSegment[] = []
  const credits = props.teamPlanProfile.credits

  const purchasedCredits = credits.filter(c => c.type === 'purchased')
  if (purchasedCredits.length > 0 && props.isPlanSubscribed) {
    const total = purchasedCredits.reduce((sum, c) => sum + c.total, 0)
    const remainder = purchasedCredits.reduce((sum, c) => sum + c.remainder, 0)
    if (remainder > 0) {
      segments.push({
        type: 'purchased',
        total,
        remainder,
        color: '#691AE0',
      })
    }
  }

  const grantedCredits = credits.filter(c => c.type === 'granted')
  if (grantedCredits.length > 0) {
    const total = grantedCredits.reduce((sum, c) => sum + c.total, 0)
    const remainder = grantedCredits.reduce((sum, c) => sum + c.remainder, 0)
    segments.push({
      type: 'granted',
      total,
      remainder,
      color: '#9453F7',
    })
  }

  const freeCredits = credits.filter(c => c.type === 'free')
  if (freeCredits.length > 0) {
    const total = freeCredits.reduce((sum, c) => sum + c.total, 0)
    const remainder = freeCredits.reduce((sum, c) => sum + c.remainder, 0)
    if (remainder > 0) {
      segments.push({
        type: 'free',
        total,
        remainder,
        color: '#C39DFD',
      })
    }
  }

  return segments
})

const creditLegendItems = computed<CreditLegendItem[]>(() => {
  if (!creditSegments.value.length) return []
  return creditSegments.value
    .filter(segment => segment.remainder > 0)
    .map(segment => ({
      type: segment.type,
      color: segment.color,
      label: segment.type === 'purchased' ? $T('Add-on Credits') : segment.type === 'granted' ? $T('Subscription Credits') : $T('Free Credits'),
    }))
})

const remainderCreditsForDisplay = computed(() => {
  if (isAICreditsUnlimited.value) return 0
  return creditSegments.value.reduce((sum, seg) => sum + seg.remainder, 0).toFixed(1)
})

const totalCreditsForDisplay = computed(() => {
  if (isAICreditsUnlimited.value) return 0
  return creditSegments.value.reduce((sum, seg) => sum + seg.total, 0).toFixed(1)
})

const canManageCredits = computed(() => isManagementRole({ role: props.teamRole }) || props.teamRole === 'admin')
</script>

<template>
  <div class="flex flex-col items-start gap-3 sm:items-stretch">
    <div class="flex items-center gap-1">
      <span class="text-mobile-subhead-small sm:text-desktop-subhead-small">{{ $T('AI Credits') }}</span>
      <icon name="xmind-ai" class="text-ai-purple-500" />
    </div>

    <credits-progress-bar v-if="!isAICreditsUnlimited" :segments="creditSegments" />
    <div class="flex w-full flex-wrap items-center justify-between gap-4">
      <credits-legend v-if="!isAICreditsUnlimited && creditLegendItems.length" :items="creditLegendItems" />
      <div v-if="isAICreditsUnlimited" class="inline-flex items-center gap-1">
        <icon name="unlimited" color="#802FFB" />
        <span class="unlimited-text text-mobile-subhead-mini sm:text-desktop-subhead-mini">
          {{ $T('Unlimited') }}
        </span>
      </div>
      <div v-else class="whitespace-nowrap">
        <span class="text-desktop-subhead-mini text-text-primary-light dark:text-text-primary-dark"> {{ remainderCreditsForDisplay }} </span>
        <span class="text-desktop-subhead-mini text-text-secondary-light dark:text-text-secondary-dark"> {{ ` / ${totalCreditsForDisplay}` }}</span>
      </div>
    </div>

    <div class="flex w-full flex-col items-start gap-4 sm:flex-row sm:flex-nowrap sm:justify-between">
      <span class="text-mobile-caption-header text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-caption-header flex-1">
        {{
          isMyWorksTeam
            ? $T(
                'AI Credits allow you to access advanced AI-powered features. Monthly credits reset each month and any purchased credits do not expire.',
              )
            : $T(
                'AI Credits allow your team to access advanced AI-powered features. Monthly credits reset each month and any purchased credits do not expire.',
              )
        }}
      </span>
      <base-button
        v-if="isPlanSubscribed && canManageCredits && !isAICreditsUnlimited"
        class="!inline-flex sm:shrink-0"
        theme="default"
        :size="isPhoneSizeViewportWidth ? 'large' : 'medium'"
        :disabled="isCreatingOrder || isRenewing || isLoadingPlan"
        @click="$emit('get-extra-credits')"
      >
        {{ $T('More Credits') }}
      </base-button>
    </div>

    <!-- AI Upgrade Notification -->
    <ai-upgrade-notification v-if="REGION === 'cn'" :team-plan-profile="teamPlanProfile" />
  </div>
</template>

<style scoped>
.unlimited-text {
  background: linear-gradient(90deg, #802ffb 0%, #ac7af8 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
