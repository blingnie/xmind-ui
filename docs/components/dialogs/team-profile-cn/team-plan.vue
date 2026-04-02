<script lang="ts">
export default {
  name: 'TeamPlan',
}
</script>
<script setup lang="ts">
import { computed } from 'vue'
import { $T } from 'client/library/translation'
import BaseButton from 'client/components/base/button.vue'
import Icon from 'client/components/icon/icon.vue'
import type { PlusAccount, TeamMetadata, TeammatePayload } from 'client/server-export'
import { useTeamSpaceData } from 'app/composables/team-space-data'
import { useWindowResize } from 'client/composables/window-resize'
import { useServiceStore } from 'client/store'
import CreditsProgressBar from './credits/credits-progress-bar.vue'
import type { CreditSegment } from './credits/credits-progress-bar.vue'

const props = defineProps<{
  team: TeamMetadata & { role: TeammatePayload['role'] }
}>()

const emits = defineEmits<{
  (event: 'payment-success'): void
}>()

const { getTeamPlanProfileSync } = useTeamSpaceData()
const { isPhoneSizeViewportWidth } = useWindowResize()

const teamPlanProfile = computed(() => getTeamPlanProfileSync(props.team.teamId) as PlusAccount)

const nonPurchasedBasicRequestTotal = computed<number>(() => {
  return teamPlanProfile.value?.credits.reduce((prevValue, currentValue) => {
    if (currentValue.type !== 'purchased') {
      prevValue += currentValue.total
    }
    return prevValue
  }, 0)
})

const purchasedBasicRequestTotal = computed<number>(() => {
  return teamPlanProfile.value?.credits.reduce((prevValue, currentValue) => {
    if (currentValue.type === 'purchased') {
      prevValue += currentValue.total
    }
    return prevValue
  }, 0)
})

const basicRequestRemainder = computed<number>(() => {
  return teamPlanProfile.value?.credits.reduce((prevValue, currentValue) => {
    prevValue += currentValue.remainder
    return prevValue
  }, 0)
})

const basicRequestTotal = computed<number>(() => {
  return teamPlanProfile.value?.credits.reduce((sum, c) => sum + c.total, 0) || 0
})

const basicCreditSegments = computed<CreditSegment[]>(() => {
  if (!teamPlanProfile.value?.credits || basicRequestRemainder.value === 0) return []

  return [
    {
      type: 'purchased' as const,
      total: basicRequestTotal.value,
      remainder: basicRequestRemainder.value,
      color: '#691AE0',
    },
  ]
})
const nonPurchasedAdvancedRequestTotal = computed<number>(() => {
  return teamPlanProfile.value?.credits.reduce((prevValue, currentValue) => {
    if (currentValue.type !== 'purchased') {
      prevValue += currentValue.advancedTotal ?? 0
    }
    return prevValue
  }, 0)
})

const purchasedAdvancedRequestTotal = computed<number>(() => {
  return teamPlanProfile.value?.credits.reduce((prevValue, currentValue) => {
    if (currentValue.type === 'purchased') {
      prevValue += currentValue.advancedTotal ?? 0
    }
    return prevValue
  }, 0)
})

const advancedRequestRemainder = computed<number>(() => {
  return teamPlanProfile.value?.credits.reduce((prevValue, currentValue) => {
    prevValue += currentValue.advancedRemainder ?? 0
    return prevValue
  }, 0)
})

const advancedRequestTotal = computed<number>(() => {
  return teamPlanProfile.value?.credits.reduce((sum, c) => sum + (c.advancedTotal ?? 0), 0) || 0
})

const advancedCreditSegments = computed<CreditSegment[]>(() => {
  if (!teamPlanProfile.value?.credits || advancedRequestRemainder.value === 0) return []

  return [
    {
      type: 'purchased' as const,
      total: advancedRequestTotal.value,
      remainder: advancedRequestRemainder.value,
      color: '#691AE0',
      isAdvanced: true,
    },
  ]
})

const handleGetAddonPack = async () => {
  if (await useServiceStore().services.action.dialog.openAiAddonPaymentDialog({ team: props.team })) {
    emits('payment-success')
  }
}
</script>

<template>
  <div class="flex flex-col gap-6 px-[24px]">
    <div class="flex flex-col items-start gap-4 sm:items-stretch">
      <!-- AI Requests -->
      <div class="flex items-center gap-1">
        <span class="text-mobile-subhead-small sm:text-desktop-subhead-small">{{ $T('AI Features') }}</span>
        <icon name="xmind-ai" class="text-ai-purple-500" />
      </div>

      <div class="flex w-full items-start justify-between gap-10">
        <div class="flex flex-1 flex-col gap-4">
          <credits-progress-bar :segments="basicCreditSegments" :show-tooltip="false" height="h-[6px]" rounded="rounded-full" />
          <div class="flex items-center gap-1 text-text-secondary-light dark:text-text-secondary-dark">
            <span class="text-mobile-body-medium sm:text-desktop-body-medium">{{ `${basicRequestRemainder} / ` }}</span>
            <span v-if="purchasedBasicRequestTotal > 0" class="text-mobile-subhead-mini sm:text-desktop-subhead-mini">
              {{ `(${nonPurchasedBasicRequestTotal} + ${purchasedBasicRequestTotal})` }}
            </span>
            <span v-else class="text-mobile-subhead-mini sm:text-desktop-subhead-mini">{{ nonPurchasedBasicRequestTotal }}</span>
          </div>
        </div>
      </div>

      <!-- AI Advanced Requests -->
      <div class="flex items-center gap-1">
        <span class="text-mobile-subhead-small sm:text-desktop-subhead-small">{{ $T('AI Advanced Features') }}</span>
        <icon name="xmind-ai" class="text-ai-purple-500" />
      </div>

      <div class="flex w-full items-start justify-between gap-10">
        <div class="flex flex-1 flex-col gap-4">
          <credits-progress-bar :segments="advancedCreditSegments" />
          <div class="flex items-center gap-1 text-text-secondary-light dark:text-text-secondary-dark">
            <span class="text-mobile-body-medium sm:text-desktop-body-medium">{{ `${advancedRequestRemainder} / ` }}</span>
            <span v-if="purchasedAdvancedRequestTotal > 0" class="text-mobile-subhead-mini sm:text-desktop-subhead-mini">
              {{ `(${nonPurchasedAdvancedRequestTotal} + ${purchasedAdvancedRequestTotal})` }}
            </span>
            <span v-else class="text-mobile-subhead-mini sm:text-desktop-subhead-mini">{{ nonPurchasedAdvancedRequestTotal }}</span>
          </div>
        </div>
      </div>

      <span class="text-mobile-caption-header text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-caption-header">
        {{
          $T(
            'AI credits can be used to unlock AI features. One-time granted AI credits expire upon use. Purchased AI add-on packs have no usage limit. Each AI add-on pack includes both AI features and advanced AI features.',
          )
        }}
      </span>

      <div>
        <base-button theme="default" :size="isPhoneSizeViewportWidth ? 'large' : 'medium'" @click="handleGetAddonPack">
          {{ '购买 AI 加量包' }}
        </base-button>
      </div>
    </div>
  </div>
</template>
