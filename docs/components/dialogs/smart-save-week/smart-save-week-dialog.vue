<template>
  <modal-dialog
    :is-opened="true"
    :width="isPhoneSizeViewportWidth ? '100%' : 400"
    :min-height="isPhoneSizeViewportWidth ? 0 : 400"
    :dialog-header-class="'!p-0'"
    :dialog-body-class="'!p-[32px] relative'"
    :dialog-footer-class="'hidden'"
    @modal-dialog-close="handleClose"
  >
    <div class="absolute right-4 top-4">
      <close class="self-baseline" @click="handleClose" />
    </div>
    <div class="relative items-center text-center">
      <div class="text-mobile-headline-small sm:text-desktop-headline-small">{{ dialogContent.title }}</div>
    </div>
    <div class="relative flex flex-col items-center gap-3">
      <div class="mt-2 text-center text-desktop-display-3 text-text-primary-light dark:text-text-primary-dark">{{ dialogContent.subtitle }}</div>
      <fw-image-container class="h-[164px] w-[296px] rounded-lg object-cover" :src="dialogContent.discountImage" />
      <p class="text-center text-text-primary-light dark:text-text-primary-dark">
        <span class="text-desktop-subhead-small">{{ $T('Smart Saver Week: ') }}</span>
        <span class="text-desktop-body-large">{{ dialogContent.description }}</span>
      </p>
    </div>
    <upgrade-gradient-button class="mt-6 w-full" :size="isPhoneSizeViewportWidth ? 'large' : 'medium'" @click="handleUpgrade">
      {{ dialogContent.urgencyMessage }}
    </upgrade-gradient-button>
  </modal-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { FeaturePhase } from 'client/library/payment'
import ModalDialog from 'client/components/new-base-modal-dialog.vue'
import Close from 'client/components/base/close.vue'
import UpgradeGradientButton from 'client/components/composite/upgrade-gradient-button.vue'
import smartSaveWeekOnlyLightImage from 'import-files/images/smart-save-week/smart-save-week-only-light.png?url'
import smartSaveWeekOnlyDarkImage from 'import-files/images/smart-save-week/smart-save-week-only-dark.png?url'
import smartSaveWeekLeftLightImage from 'import-files/images/smart-save-week/smart-save-week-left-light.png?url'
import smartSaveWeekLeftDarkImage from 'import-files/images/smart-save-week/smart-save-week-left-dark.png?url'
import smartSaveWeekEndsLightImage from 'import-files/images/smart-save-week/smart-save-week-ends-light.png?url'
import smartSaveWeekEndsDarkImage from 'import-files/images/smart-save-week/smart-save-week-ends-dark.png?url'
import { useConfetti } from 'client/composables/use-confetti'
import { usePromiseHook } from 'utils/vue-utils'
import { useWindowResize } from 'client/composables/window-resize'
import { $T } from 'client/library/translation'
import { useAppStore } from 'client/store'
import { useTracking } from 'client/composables/use-tracking'
import { useContextStore } from 'client/store/context-store'

const props = defineProps<{
  phase: FeaturePhase
  onUpgrade: () => void
  onClose: () => void
}>()

const { resolve } = usePromiseHook()
const { isPhoneSizeViewportWidth } = useWindowResize()

const dialogContent = computed(() => {
  switch (props.phase) {
    case 'smart-save-week-only':
      return {
        title: $T('Ends in 72 Hours'),
        discount: '40% OFF',
        subtitle: $T('🎁 A Special Thank-You Gift'),
        description: $T("You've Unlocked a Special Discount ⏳ Drops each day !!!"),
        urgencyMessage: $T('Claim My Gift'),
        discountImage: useAppStore().appearance === 'dark' ? smartSaveWeekOnlyDarkImage : smartSaveWeekOnlyLightImage,
      }
    case 'smart-save-week-three-days-left':
      return {
        title: $T('Only 3 Days Left'),
        discount: '30% OFF',
        subtitle: $T('🎁 A Special Thank-You Gift'),
        description: $T("You've Unlocked a Special Discount ⏳ Drops each day !!!"),
        urgencyMessage: $T('Claim My Gift'),
        discountImage: useAppStore().appearance === 'dark' ? smartSaveWeekLeftDarkImage : smartSaveWeekLeftLightImage,
      }
    case 'smart-save-week-ends-today':
      return {
        title: $T('Ends Today'),
        discount: '20% OFF',
        subtitle: $T('🎁 A Special Thank-You Gift'),
        description: $T("You've Unlocked a Special Discount ⏳ Drops each day !!!"),
        urgencyMessage: $T('Claim My Gift'),
        discountImage: useAppStore().appearance === 'dark' ? smartSaveWeekEndsDarkImage : smartSaveWeekEndsLightImage,
      }
    default:
      return {}
  }
})

const handleClose = () => {
  resolve(null)
}

const handleUpgrade = () => {
  useTracking().trackClick('upgrade', {
    dlg: 'promo_dialog',
    plan: 'premium',
    renew_period: 'yearly',
    tab: useContextStore().contexts.isInRecents
      ? 'recents'
      : useContextStore().contexts.isInMyWorks
        ? 'my_works'
        : useContextStore().isInAnyEditor
          ? 'editor'
          : null,
  })
  props.onUpgrade()
  resolve(true)
}
const { showRainingConfetti } = useConfetti()

onMounted(async () => {
  useTracking().track('dialog_view', {
    dlg: 'promo_dialog',
    tab: useContextStore().contexts.isInRecents
      ? 'recents'
      : useContextStore().contexts.isInMyWorks
        ? 'my_works'
        : useContextStore().isInAnyEditor
          ? 'editor'
          : null,
  })
  setTimeout(() => {
    showRainingConfetti()
  }, 1500)
})
</script>
