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
      <close
        class="cursor-pointer text-transparent-dark-6 hover:text-transparent-dark-8 active:text-transparent-dark-10 dark:text-transparent-white-6 dark:hover:text-transparent-white-8 dark:active:text-transparent-white-10"
        @click="handleClose"
      />
    </div>
    <div class="flex flex-col items-center text-center">
      <div class="text-mobile-headline-small sm:text-desktop-headline-small">{{ $T('Smart Saver Win-Back') }}</div>
      <div class="mt-2 text-center text-desktop-display-3 text-text-primary-light dark:text-text-primary-dark">
        <transition name="fade" mode="out-in">
          <span v-if="!isLuckyPriceRevealed" key="subtitle-before">{{ $T('🎁 Want a Surprise Deal?') }}</span>
          <span v-else key="subtitle-after">🎉 You Got ${{ luckyPrice }} {{ $T('for Your First Month!') }}</span>
        </transition>
      </div>
    </div>

    <div class="flex flex-col items-center gap-3">
      <transition name="zoom-fade" mode="out-in">
        <div v-if="!isLuckyPriceRevealed" class="relative mt-2" :class="{ 'animate-shake': isShaking }">
          <img :src="winBackImage" class="h-[164px] w-[296px] rounded-lg bg-transparent object-cover transition-all duration-300" />
        </div>
        <div v-else key="discount-image-after" class="relative mt-2">
          <img :src="getPriceImage()" class="h-[164px] w-[296px] rounded-lg bg-transparent object-cover transition-all duration-300" />
        </div>
      </transition>

      <p class="mt-2 text-center text-desktop-body-large text-text-primary-light dark:text-text-primary-dark">
        {{ $T('Click to get a random special price for your first month of Premium (originally $15)') }}
      </p>
    </div>
    <upgrade-gradient-button class="mt-6 w-full" :size="isPhoneSizeViewportWidth ? 'large' : 'medium'" @click="handleAction">
      <transition name="fade" mode="out-in">
        <span v-if="!isLuckyPriceRevealed" key="btn-before">{{ $T('Try My Luck') }}</span>
        <span v-else key="btn-after">{{ $T('Upgrade Now') }}</span>
      </transition>
    </upgrade-gradient-button>
  </modal-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { usePromiseHook } from 'utils/vue-utils'
import { useWindowResize } from 'client/composables/window-resize'
import { $T } from 'client/library/translation'
import ModalDialog from 'client/components/new-base-modal-dialog.vue'
import Close from 'client/components/base/close.vue'
import UpgradeGradientButton from 'client/components/composite/upgrade-gradient-button.vue'
import { useConfetti } from 'client/composables/use-confetti'
import winBackDarkImage from 'import-files/images/smart-save-week/smart-save-winback-dark.png?url'
import winBackLightImage from 'import-files/images/smart-save-week/smart-save-winback-light.png?url'

import priceImage3Dark from 'import-files/images/smart-save-week/win-back-price-3-dark.png?url'
import priceImage3Light from 'import-files/images/smart-save-week/win-back-price-3-light.png?url'
import priceImage6Dark from 'import-files/images/smart-save-week/win-back-price-6-dark.png?url'
import priceImage6Light from 'import-files/images/smart-save-week/win-back-price-6-light.png?url'
import priceImage8Dark from 'import-files/images/smart-save-week/win-back-price-8-dark.png?url'
import priceImage8Light from 'import-files/images/smart-save-week/win-back-price-8-light.png?url'
import priceImage10Dark from 'import-files/images/smart-save-week/win-back-price-10-dark.png?url'
import priceImage10Light from 'import-files/images/smart-save-week/win-back-price-10-light.png?url'
import { useAppStore } from 'client/store/app-store'
import { useTracking } from 'client/composables/use-tracking'
import { useContextStore } from 'client/store/context-store'
import { useTeamSpaceData } from 'app/composables/team-space-data'
import { useServiceStore } from 'client/store'

const FIXED_PRICES = [
  { price: 5, coupon: 'V8BVE4U7CL' },
  { price: 7, coupon: 'LJA89YW3MS' },
  { price: 9, coupon: 'NP658F6G9Y' },
  { price: 12, coupon: '8CMWLNYPEP' },
]

const { resolve } = usePromiseHook()
const { isPhoneSizeViewportWidth } = useWindowResize()
const isLuckyPriceRevealed = ref(false)
const luckyPrice = ref(0)
const isShaking = ref(false)
const winBackImage = ref(useAppStore().appearance === 'dark' ? winBackDarkImage : winBackLightImage)
const { showRainingConfetti } = useConfetti()

const generateRandomPrice = (): number => {
  const possiblePrices = [3, 6, 8, 10]
  const randomIndex = Math.floor(Math.random() * possiblePrices.length)
  return possiblePrices[randomIndex]
}

const getPriceImage = () => {
  const isDark = useAppStore().appearance === 'dark'

  switch (luckyPrice.value) {
    case 3:
      return isDark ? priceImage3Dark : priceImage3Light
    case 6:
      return isDark ? priceImage6Dark : priceImage6Light
    case 8:
      return isDark ? priceImage8Dark : priceImage8Light
    case 10:
      return isDark ? priceImage10Dark : priceImage10Light
    default:
      return isDark ? priceImage3Dark : priceImage3Light
  }
}

const selectedCouponCode = computed(() => {
  return FIXED_PRICES.find(item => item.price === 15 - luckyPrice.value)?.coupon || ''
})

const revealLuckyPrice = async () => {
  if (isLuckyPriceRevealed.value) return

  isShaking.value = true
  luckyPrice.value = generateRandomPrice()

  showRainingConfetti()

  isShaking.value = false
  isLuckyPriceRevealed.value = true
}

const handleAction = () => {
  if (!isLuckyPriceRevealed.value) {
    revealLuckyPrice()
  } else {
    useTracking().trackClick('upgrade', {
      dlg: 'promo_dialog',
      plan: 'premium',
      renew_period: 'yearly',
      tab: useContextStore().contexts.isInRecents ? 'recents' : useContextStore().contexts.isInMyWorks ? 'my_works' : 'editor',
    })
    useServiceStore().services.action.dialog.openPaymentDialog({
      teamId: useTeamSpaceData().defaultTeamId.value,
      orderVersion: 'premium',
      isShowBenefitsSection: true,
      billingPeriodUIType: 'select',
      planDuration: 'monthly',
      coupon: selectedCouponCode.value,
    })
    resolve(true)
  }
}

const handleClose = () => {
  resolve(null)
}
onMounted(() => {
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
})
</script>

<style scoped>
.animate-shake {
  animation: gentle-rotate 0.6s ease-in-out;
}

@keyframes gentle-rotate {
  0% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-3deg);
  }
  50% {
    transform: rotate(3deg);
  }
  75% {
    transform: rotate(-2deg);
  }
  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }
}

.zoom-fade-enter-active,
.zoom-fade-leave-active {
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}

.zoom-fade-enter-from,
.zoom-fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.zoom-fade-enter-to,
.zoom-fade-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
