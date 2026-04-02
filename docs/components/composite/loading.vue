<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue'
import { $T } from 'client/library/translation'
import { useAppStore } from 'client/store/app-store'
import { computeAppearanceByLuminance } from 'utils/color-luminance'
import { DARK_MODE_CLASS_NAME } from 'client/utils/appearance'
import loadingDark from 'client/components/icon/fw-icons/toast/loading-dark.svg?url'
import loadingLight from 'client/components/icon/fw-icons/toast/loading-light.svg?url'

defineOptions({
  name: 'AppLoading',
})

defineEmits(['cancel'])

const props = withDefaults(
  defineProps<{
    text?: string
    backgroundColor?: string
    cancelBtnDelay?: number
    showCancelBtn?: boolean
    /** `forceAppearance` is used to *Force* the appearance of the loading spinner, most case the appearance is based on the background color,but if background color contains alpha channel, the luminance calculation will be incorrect */
    forceAppearance?: 'dark' | 'light'
  }>(),
  {
    text: () => $T('Loading...'),
    backgroundColor: '',
    cancelBtnDelay: undefined,
    showCancelBtn: false,
    forceAppearance: undefined,
  },
)

const cancelBtnDelayReached = ref(false)
const backgroundColor = computed(() => props.backgroundColor || (useAppStore().appearance === 'dark' ? '#4B4B4B' : '#FFFFFF'))
//!Note appearance is based on the background color, not the global appearance
const appearance = computed(() => props.forceAppearance ?? computeAppearanceByLuminance(backgroundColor.value))
const isShowCancelBtn = computed(() => props.showCancelBtn || cancelBtnDelayReached.value)

onMounted(() => {
  if (typeof props.cancelBtnDelay !== 'undefined') {
    setTimeout(() => (cancelBtnDelayReached.value = true), props.cancelBtnDelay)
  }
})
</script>

<template>
  <div
    class="loading flex h-full w-full flex-col items-center justify-center"
    :style="{ backgroundColor: backgroundColor }"
    :class="[appearance === 'dark' && DARK_MODE_CLASS_NAME]"
  >
    <div class="flex flex-col items-center gap-3">
      <slot>
        <img :src="appearance === 'dark' ? loadingDark : loadingLight" width="64" height="64" class="spinner" />
      </slot>
      <span v-if="text" class="max-w-[300px] pl-2 text-center text-desktop-subhead-medium text-text-tertiary-light dark:text-text-tertiary-dark">
        {{ text }}
      </span>
      <fw-button theme="default" size="small" :class="[isShowCancelBtn ? 'visible' : 'invisible', 'mt-1']" @click.stop="$emit('cancel')">
        {{ $T('Cancel') }}
      </fw-button>
    </div>
  </div>
</template>

<style scoped>
@keyframes loading {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.spinner {
  animation: loading 1s linear infinite;
}
</style>
