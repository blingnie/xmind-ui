<template>
  <Transition appear name="fade">
    <div
      class="fixed bottom-4 left-4 right-4 z-free-trial-push flex flex-col items-center gap-8 rounded-2xl bg-light-grey-1 p-[24px] shadow-popover-light dark:bg-dark-grey-7 sm:bottom-8 sm:left-auto sm:right-8 sm:w-[360px] sm:p-[32px]"
    >
      <div class="flex flex-col items-center gap-3 text-center">
        <div class="flex flex-col items-center gap-2">
          <span class="text-desktop-headline-1 text-dark-grey-10 dark:text-light-grey-1" :class="{ 'w-48': image === 'coin' }">
            {{ heading }}
          </span>
          <span class="text-desktop-display-3 text-dark-grey-10 dark:text-light-grey-1" :class="{ 'w-48': image === 'coin' }">
            {{ title }}
          </span>
        </div>

        <img class="h-[100px] w-[238px]" uk-img :data-src="imageUrl" />

        <span class="w-48 text-desktop-body-3 text-dark-grey-8 dark:text-light-grey-1">{{ bodyText }}</span>
      </div>

      <button class="tw-button-primary tw-button-medium self-stretch" @click="handleFreeTrial">{{ confirmText }}</button>

      <close class="absolute right-6 top-6" @click="handleClose"></close>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { usePromiseHook } from 'utils/vue-utils'
import Close from 'client/components/base/close.vue'
import { useAccountStore, useAppStore, useServiceStore } from 'client/store'
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { useFreeTrialPushStore } from 'app/composables/use-free-trial-push'
import type { RouteRecordNameGeneric } from 'vue-router'
import freeTrialCoinLight from 'import-files/images/free-trial/free-trial-coin-light.png?url'
import freeTrialGiftLight from 'import-files/images/free-trial/free-trial-gift-light.png?url'
import freeTrialCoinDark from 'import-files/images/free-trial/free-trial-coin-dark.png?url'
import freeTrialGiftDark from 'import-files/images/free-trial/free-trial-gift-dark.png?url'

const props = defineProps<{
  heading: string
  title: string
  image: 'coin' | 'gift'
  bodyText: string
  confirmText: string
  triggeredBy: 'onboard_completed' | '2nd_sign_in' | '3rd_new_map' | '1st_new_folder' | 'ai_features_used' | 'collaboration_disconnect'
  onFreeTrialClick?: () => void
  onManualClose?: () => void
}>()

let parentRouteName: RouteRecordNameGeneric

const { resolve } = usePromiseHook()
const { setCloseFreeTrialPushFunction } = useFreeTrialPushStore()
const { appearance } = storeToRefs(useAppStore())
setCloseFreeTrialPushFunction(resolve)

const imageUrl = computed(() => {
  if (appearance.value === 'dark') {
    return props.image === 'coin' ? freeTrialCoinDark : freeTrialGiftDark
  } else {
    return props.image === 'coin' ? freeTrialCoinLight : freeTrialGiftLight
  }
})

const handleClose = () => {
  props.onManualClose?.()
  resolve(false)
}

const handleFreeTrial = () => {
  props.onFreeTrialClick?.()
}

const updateIsFreeTrialPushClosedType = () => {
  if (!useAccountStore().userData?.isFreeTrialPushClosedType) {
    useAccountStore().updateUserData({ isFreeTrialPushClosedType: props.triggeredBy })
  }
}

onMounted(() => {
  parentRouteName = useServiceStore().services.router.vueRouter.currentRoute.value?.name
})
onBeforeUnmount(() => {
  updateIsFreeTrialPushClosedType()
})

watch(
  () => useServiceStore().services.router.vueRouter.currentRoute.value?.name,
  routeName => {
    if (routeName !== parentRouteName) {
      updateIsFreeTrialPushClosedType()
      resolve(false)
    }
  },
)
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
