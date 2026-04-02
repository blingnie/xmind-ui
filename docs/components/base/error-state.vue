<template>
  <div class="flex flex-col items-center justify-center">
    <template v-if="props.type === 'no-clouddrive' || props.type === 'no-payment'">
      <img :src="content.errorImageUrl" class="w-40" />
    </template>
    <template v-else>
      <div ref="animationContainer" class="error-animation-container relative h-40 min-h-40 w-44"></div>
    </template>
    <div class="flex max-w-72 flex-col items-center gap-1 text-center">
      <span class="text-mobile-subhead-large text-text-primary-light dark:text-text-primary-dark sm:text-mobile-subhead-medium">
        {{ content.title }}
      </span>
      <span class="text-mobile-body-medium text-text-primary-light dark:text-text-primary-dark sm:text-desktop-body-large">
        {{ content.description }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { $T } from 'client/library/translation'
import { computed, nextTick, ref, watch } from 'vue'
import noMapsImageUrl from 'import-files/images/error-state/no-maps.png?url'
import noSharedMapsImageUrl from 'import-files/images/error-state/no-shared-maps.png?url'
import noTrashImageUrl from 'import-files/images/error-state/no-trash.png?url'
import noPaymentImageUrl from 'import-files/images/error-state/no-payment.png?url'
import noClouddriveImageUrl from 'import-files/images/error-state/no-clouddrive.png?url'
import noNetworkImageUrl from 'import-files/images/error-state/no-network.png?url'
import connectionFailedLight from 'import-files/json/empty-animation/connection-failed-light.json'
import connectionFailedDark from 'import-files/json/empty-animation/connection-failed-dark.json'
import { useLottieAnimation } from 'app/composables/lottie-animation'
export type ErrorStateType = 'no-maps' | 'no-clouddrive' | 'no-payment' | 'no-shared-maps' | 'no-trash' | 'no-network'

const props = defineProps<{
  type: ErrorStateType
}>()

const animationContainer = ref<HTMLElement | null>(null)
const animationFiles = {
  'no-maps': {
    light: async () => (await import('import-files/json/empty-animation/new-map.json?url')).default,
    dark: async () => (await import('import-files/json/empty-animation/new-map.json?url')).default,
  },
  'no-shared-maps': {
    light: async () => (await import('import-files/json/empty-animation/no-shared-map.json?url')).default,
    dark: async () => (await import('import-files/json/empty-animation/no-shared-map.json?url')).default,
  },
  'no-trash': {
    light: async () => (await import('import-files/json/empty-animation/no-trash.json?url')).default,
    dark: async () => (await import('import-files/json/empty-animation/no-trash.json?url')).default,
  },
  'no-network': {
    light: async () => {
      return URL.createObjectURL(new Blob([JSON.stringify(connectionFailedLight)], { type: 'application/json' }))
    },
    dark: async () => {
      return URL.createObjectURL(new Blob([JSON.stringify(connectionFailedDark)], { type: 'application/json' }))
    },
  },
} as const

const playContentAnimation = async () => {
  if (!animationContainer.value) return
  const { playAnimation, initAnimation } = useLottieAnimation({
    containerParentSelector: '.error-animation-container',
    isInitOnMounted: false,
    dataFilePathLoader: animationFiles[props.type],
    options: {
      loop: false,
      speed: 1,
      startPoint: 0,
    },
  })
  await initAnimation()
  playAnimation()
}

watch(
  () => props.type,
  async () => {
    await nextTick()
    playContentAnimation()
  },
  { immediate: true },
)

const content = computed<{ title: string; description: string; errorImageUrl: string }>(() => {
  switch (props.type) {
    case 'no-maps':
      return {
        title: $T('No maps here yet.'),
        description: $T('Now is good time to create one.'),
        errorImageUrl: noMapsImageUrl,
      }
    case 'no-clouddrive':
      return {
        title: $T('No cloud drive added yet.'),
        description: $T('Connect one now for quick access to your Xmind files.'),
        errorImageUrl: noClouddriveImageUrl,
      }
    case 'no-payment':
      return {
        title: $T('No payment history.'),
        description: $T('Your payments will appear here once made.'),
        errorImageUrl: noPaymentImageUrl,
      }
    case 'no-shared-maps':
      return {
        title: $T('No Shared maps. '),
        description: $T('Recently shared maps will appear here.'),
        errorImageUrl: noSharedMapsImageUrl,
      }
    case 'no-trash':
      return {
        title: $T('No Trash'),
        description: $T('Recently deleted maps will appear here.'),
        errorImageUrl: noTrashImageUrl,
      }
    case 'no-network':
      return {
        title: $T('Oops, network took a nap.'),
        description: $T('Reload to wake it up!'),
        errorImageUrl: noNetworkImageUrl,
      }
    default:
      return {
        title: '',
        description: '',
        errorImageUrl: '',
      }
  }
})
</script>
