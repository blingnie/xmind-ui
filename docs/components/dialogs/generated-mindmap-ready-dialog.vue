<template>
  <modal-dialog
    class="mindmap-ready"
    :is-opened="true"
    :close-button="false"
    :max-height="595"
    :width="360"
    :min-height="382"
    :dialog-header-styles="{ display: 'none' }"
    :dialog-footer-styles="{ display: 'none' }"
    :dialog-body-styles="{ padding: 0, borderRadius: '16px', position: 'relative', overflow: 'overlay', 'z-index': 10 }"
    @modal-dialog-close="handleModalOverlayClose"
  >
    <div class="relative h-full w-full overflow-hidden bg-ai-background-light dark:bg-ai-background-dark">
      <div class="relative flex h-full w-full flex-col gap-4 p-8">
        <section class="block w-full text-center">
          <h2 class="text-desktop-display-4">{{ titles[props.generatedFrom] }}</h2>
        </section>

        <section class="flex justify-center">
          <img
            class="rotate-[4.613deg]"
            :src="
              isDark
                ? $toResourceURL('/assets/static/images/ai-brainstorm/brainstorm-ready-glow-dark.svg')
                : $toResourceURL('/assets/static/images/ai-brainstorm/brainstorm-ready-glow-light.svg')
            "
            alt="app.xmind.com"
          />
        </section>

        <section class="flex w-full flex-col items-center justify-center text-center">
          <p class="max-w-[290px] text-desktop-body-3">{{ descriptions[props.generatedFrom] }}</p>
          <p class="text-desktop-body-3">{{ $T('Would you like to view it now?') }}</p>
        </section>

        <section class="mt-auto flex w-full gap-4">
          <button class="tw-button-default tw-button-medium flex-1" @click="handleClose">{{ computeBtnText.cancel }}</button>
          <button class="tw-button-primary tw-button-medium flex-1" @click="handleConfirm">{{ computeBtnText.confirm }}</button>
        </section>
      </div>
    </div>
  </modal-dialog>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useAppStore } from 'client/store'
import { usePromiseHook } from 'utils/vue-utils'
import ModalDialog from 'client/components/new-base-modal-dialog.vue'
import { useLottieAnimation } from 'app/composables/lottie-animation'
import { useConfetti } from 'client/composables/use-confetti'
import { $T } from 'client/library/translation'

useLottieAnimation({
  containerParentSelector: '.mindmap-ready .modal-dialog__entity',
  dataFilePathLoader: {
    light: async () => (await import('import-files/json/copilot-dialog-background-light.json?url')).default,
    dark: async () => (await import('import-files/json/copilot-dialog-background-dark.json?url')).default,
  },
  options: {
    containerStyleClass: 'dark:shadow-ai-background-lottie-animation-dark overflow-hidden rounded-2xl',
    animationStyleClass: 'filter blur opacity-40',
  },
})

const props = defineProps<{
  generatedFrom: 'brainstorm' | 'data-masking' | 'ai-template' | 'reorganize' | 'global-completion'
  isDisableOverlayClose?: boolean
}>()

const computeBtnText = computed(() => {
  switch (props.generatedFrom) {
    case 'ai-template':
      return {
        cancel: $T('Edit'),
        confirm: $T('Share Image'),
      }
    case 'global-completion':
      return {
        cancel: $T('Later'),
        confirm: $T('View Now'),
      }
    default:
      return {
        cancel: $T('Cancel'),
        confirm: $T('View Now'),
      }
  }
})

const titles = computed(() => ({
  brainstorm: $T('Mind Map is Ready'),
  'ai-template': $T('Mind Map is Ready'),
  reorganize: $T('Mind Map is Ready'),
  'data-masking': $T('Data Masking Done'),
  'global-completion': $T('Mind Map is Ready'),
}))

const descriptions = computed(() => ({
  brainstorm: $T('Your mind map has been successfully organized and saved.'),
  'ai-template': $T('Your mind map has been successfully generated and saved in My Works.'),
  reorganize: $T('Your mind map has been successfully reorganized and saved.'),
  'data-masking': $T('The data-masked mind map has been saved in a new file.'),
  'global-completion': $T('The changes by the Map Refine have been applied to the new sheet.'),
}))

const isDark = computed(() => useAppStore().appearance === 'dark')

const { resolve } = usePromiseHook()
const handleClose = () => {
  resolve(false)
}

const handleModalOverlayClose = () => {
  if (props.isDisableOverlayClose) return
  handleClose()
}

const handleConfirm = () => {
  resolve(true)
}
const { showRainingConfetti } = useConfetti()
showRainingConfetti()
</script>

<style scoped lang="less">
@import '../../styles/variables';
</style>
