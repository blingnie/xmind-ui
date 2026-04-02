<template>
  <Transition appear name="fade">
    <div
      class="fixed bottom-4 left-4 right-4 z-free-trial-push mb-4 flex flex-col rounded-2xl bg-light-grey-1 shadow-popover-light dark:bg-dark-grey-7 sm:bottom-7 sm:left-auto sm:right-7 sm:w-[400px]"
    >
      <div class="flex flex-col gap-4 p-6">
        <div class="flex h-9 items-center">
          <span class="text-mobile-headline-small text-text-primary-light dark:text-text-primary-dark sm:text-desktop-subhead-large">
            {{ heading }}
          </span>
        </div>
        <span class="text-mobile-body-large text-dark-grey-10 dark:text-light-grey-1 sm:text-desktop-body-large">
          {{ bodyText }}
        </span>
        <div class="flex items-center gap-3 rounded bg-mask-overlay-s-light p-2 dark:bg-mask-overlay-s-dark">
          <div class="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded bg-[#FA4A1E26] text-xred-500">
            <fw-icon :name="'crown-fill'" />
          </div>
          <span class="text-mobile-body-medium text-dark-grey-8 dark:text-light-grey-1 sm:text-desktop-body-medium">{{ confirmText }}</span>
        </div>
      </div>
      <base-divider />
      <div class="flex flex-col gap-2 p-6 sm:flex-row-reverse sm:pb-[18px] sm:pt-[17px]">
        <fw-button :theme="'secondary'" :size="isPhoneSizeViewportWidth ? 'large' : 'small'" data-focus="not-allow" @click="handleSwitch">
          {{ $T('Switch Now') }}
        </fw-button>
        <fw-button :theme="'default'" :size="isPhoneSizeViewportWidth ? 'large' : 'small'" data-focus="not-allow" @click="handleAlwaysClose">
          {{ $T("Don't remind me") }}
        </fw-button>
      </div>
      <close class="absolute right-6 top-6" @click="handleClose" />
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { usePromiseHook } from 'utils/vue-utils'
import Close from 'client/components/base/close.vue'
import { useWindowResize } from 'client/composables/window-resize'
import BaseDivider from 'client/components/base/divider.vue'
import { useTracking, getCurrentTrackingTab } from 'client/composables/use-tracking'

const props = defineProps<{
  heading?: string
  bodyText?: string
  confirmText?: string
  onManualClose?: (reason?: 'never' | 'close') => void
  onAnnualDiscountClick?: () => void
}>()
const { resolve } = usePromiseHook()
const { isPhoneSizeViewportWidth } = useWindowResize()
const handleClose = () => {
  props.onManualClose?.('close')
  resolve(false)
}

const handleSwitch = () => {
  useTracking().trackClick('upgrade', {
    plan: 'premium',
    renew_period: 'yearly',
    dlg: 'tip_dialog',
    tab: getCurrentTrackingTab(),
  })
  props.onAnnualDiscountClick?.()
  resolve(true)
}
const handleAlwaysClose = () => {
  props.onManualClose?.('never')
  resolve(false)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
