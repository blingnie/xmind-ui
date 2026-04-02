<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { $T } from 'client/library/translation'
import { localStore } from 'utils/browserStorage'
import type { PlusAccount } from 'client/server-export'
import { useAccountStore } from 'client/store/account-store'

const props = defineProps<{
  teamPlanProfile: PlusAccount
}>()

const emit = defineEmits<{
  (event: 'close'): void
}>()

const isVisible = ref(false)

const NOTIFICATION_DISMISSED_KEY = computed(() => `AI_UPGRADE_NOTIFICATION_DISMISSED_${useAccountStore().userXmindId || 'default'}`)
const NOTIFICATION_TRIGGER_KEY = computed(() => `AI_UPGRADE_NOTIFICATION_TRIGGERED_${useAccountStore().userXmindId || 'default'}`)

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000
const TRIGGER_RECORD_TTL_MS = 365 * 24 * 60 * 60 * 1000

const hasAICreditsEntitlement = computed(() => {
  if (!props.teamPlanProfile?.credits) return false

  const credits = props.teamPlanProfile.credits
  const hasGrantedCredits = credits.some(c => c.type === 'granted' && c.total > 0)
  const hasFreeCredits = credits.some(c => c.type === 'free' && c.total > 0)

  return hasGrantedCredits || hasFreeCredits
})

const computeShouldShowNotification = () => {
  if (!hasAICreditsEntitlement.value) return false

  const isDismissed = localStore.get(NOTIFICATION_DISMISSED_KEY.value)
  if (isDismissed) return false

  const triggerTimeStr = localStore.get(NOTIFICATION_TRIGGER_KEY.value)
  const triggerTime = triggerTimeStr ? Number.parseInt(triggerTimeStr) : null

  if (!triggerTime || Number.isNaN(triggerTime)) {
    const now = Date.now()
    localStore.set(NOTIFICATION_TRIGGER_KEY.value, now.toString(), TRIGGER_RECORD_TTL_MS)
    return true
  }

  const now = Date.now()
  const isWithinFourteenDays = now - triggerTime <= FOURTEEN_DAYS_MS

  return isWithinFourteenDays
}

const handleClose = () => {
  localStore.set(NOTIFICATION_DISMISSED_KEY.value, 'true', 365 * 24 * 60 * 60 * 1000)
  isVisible.value = false
  emit('close')
}

watch(
  [hasAICreditsEntitlement, () => useAccountStore().userXmindId],
  () => {
    isVisible.value = computeShouldShowNotification()
  },
  { immediate: true },
)
</script>

<template>
  <div v-if="isVisible" class="bg-mask-overlay-s-light dark:bg-mask-overlay-s-dark mt-3 flex w-full items-center gap-1 rounded-md p-3">
    <fw-icon name="credits-notification" class="text-ai-purple-400" />
    <span class="text-desktop-body-small text-text-secondary-light dark:text-text-secondary-dark flex-1">
      {{ $T('AI 已升级为「AI 点数」，你的剩余次数已全部妥善转换，请放心使用。') }}
    </span>
    <fw-tile-button
      icon-name="close"
      size="small"
      class="flex-shrink-0"
      :custom-class="'text-text-tertiary-light dark:text-text-tertiary-dark w-4 h-4'"
      @click="handleClose"
    />
  </div>
</template>
