<script lang="ts" setup>
import { ref, computed, watch, onMounted, StyleValue } from 'vue'
import AppBaseOverlay from 'client/components/new-base-overlay.vue'
import OverlayScrollbar from './overlay-scrollbar.vue'
import BaseButton from './base/button.vue'
import Close from 'client/components/base/close.vue'
import { useVueRouter } from 'client/composables/vue-router'
import { useWindowResize } from 'client/composables/window-resize'
import { debounce } from 'utils/misc'
import { until } from '@vueuse/core'
import type { BaseButtonSize, BaseButtonTheme } from 'client/components/types'

export type ModalDialogButtonType = BaseButtonTheme

export interface ModalDialogBottomButton {
  isDisabled?: boolean
  onClick?: () => void | Promise<void>
  text: string
  type: BaseButtonTheme
  size?: BaseButtonSize
  style?: StyleValue // use class instead of style, but sometimes we need to pass styles
  class?: VueClass
}

interface Props {
  height?: number | string
  maxHeight?: number | string
  minHeight?: number | string
  width?: number | string
  maxWidth?: number | string
  minWidth?: number | string
  dialogClass?: VueClass
  dialogHeaderClass?: VueClass
  dialogBodyClass?: VueClass
  dialogFooterClass?: VueClass
  dialogOverlayClass?: VueClass
  /** @deprecated */
  dialogStyles?: StyleValue
  /** @deprecated */
  dialogHeaderStyles?: StyleValue
  /** @deprecated */
  dialogHeaderTitleStyles?: StyleValue
  /** @deprecated */
  dialogBodyStyles?: StyleValue
  /** @deprecated */
  dialogFooterStyles?: StyleValue
  title?: string
  isOpened?: boolean
  escClose?: boolean
  closeButton?: boolean
  buttons?: ModalDialogBottomButton[]
  isModalDialogCloseDisabled?: boolean
  overlayClasses?: VueClass
  modalClasses?: string
  isMobileDrawer?: boolean
  customDialogAnimation?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: null,
  maxHeight: null,
  minHeight: 200,
  width: 604,
  maxWidth: null,
  minWidth: null,
  dialogStyles: () => ({}),
  dialogHeaderStyles: () => ({}),
  dialogHeaderClass: '',
  dialogHeaderTitleStyles: () => ({}),
  dialogBodyStyles: () => ({}),
  dialogBodyClass: '',
  dialogFooterStyles: () => ({}),
  dialogClass: '',
  dialogFooterClass: '',
  title: '',
  isOpened: false,
  escClose: true,
  closeButton: false,
  buttons: () => [],
  isModalDialogCloseDisabled: false,
  overlayClasses: '',
  modalClasses: '',
  isMobileDrawer: null, // use to show modal dialog as a drawer on mobile devices
  customDialogAnimation: '',
})

const emit = defineEmits<{
  (e: 'modal-dialog-close'): void
}>()

const isDialogAnimationEntered = ref(false)
const dialog = ref<HTMLElement>()
const dialogEntity = ref<HTMLElement>()
const isShowModalContent = ref(false)
const setIsShowModalContentDebounced = debounce((value: boolean) => {
  isShowModalContent.value = value
}, 10)

const { isPhoneSizeViewportWidth } = useWindowResize()

const isMobileDrawerComputed = computed(() => {
  if (typeof props.isMobileDrawer === 'boolean') {
    return props.isMobileDrawer
  }
  return isPhoneSizeViewportWidth.value
})

const dialogAnimation = computed(() => {
  if (isMobileDrawerComputed.value) {
    // Use slide-in-out for mobile drawer, cant customize animation
    return 'slide-in-out'
  }
  return props.customDialogAnimation || 'slide-in-out-half'
})

const normalize = (unit: number | string) => {
  if (typeof unit === 'number') {
    return unit + 'px'
  } else if (typeof unit === 'string') {
    return unit
  } else {
    return ''
  }
}

const modalDialogStyle = computed(() => {
  const styles = {
    width: isMobileDrawerComputed.value ? '100%' : normalize(props.width),
    height: normalize(props.height),
    'max-height': isMobileDrawerComputed.value ? '100%' : `${normalize(props.maxHeight) || '90%'}`,
    'min-height': 'none',
    '--modal-dialog-max-height': normalize(props.maxHeight),
    'max-width': isMobileDrawerComputed.value ? '100%' : `${normalize(props.maxWidth) || '90%'}`,
    'min-width': 'none',
  }
  if (props.minHeight) {
    styles['min-height'] = normalize(props.minHeight)
  }
  if (props.minWidth) {
    styles['min-width'] = normalize(props.minWidth)
  }
  return styles
})

const emitClose = () => {
  emit('modal-dialog-close')
}

const setFocusIfFocusElementNotInDialog = async () => {
  await new Promise(resolve => setTimeout(resolve))
  if (!dialog.value) return
  if (!document.activeElement || !dialog.value?.contains(document.activeElement)) {
    const modalDialogBody = dialog.value?.querySelector('.modal-dialog__body') as HTMLElement
    modalDialogBody?.focus()
  }
}

const closeDialogWithAnimation = async () => {
  if (isShowModalContent.value === false) {
    return
  }
  isShowModalContent.value = false
  await until(() => isDialogAnimationEntered.value).toBe(true, { timeout: 100, throwOnTimeout: false })
  await until(() => isDialogAnimationEntered.value).toBe(false, { timeout: 300, throwOnTimeout: false })
}

watch(
  () => props.isOpened,
  isOpened => {
    if (isOpened) {
      setIsShowModalContentDebounced(true)
    } else {
      isShowModalContent.value = false
    }
  },
)

watch(
  () => props.isOpened,
  (newVal, oldVal) => {
    if (newVal && newVal !== oldVal) {
      setFocusIfFocusElementNotInDialog()
    }
  },
)

onMounted(() => {
  setFocusIfFocusElementNotInDialog()
  useVueRouter().listenRouterPathChange(emitClose)
  setIsShowModalContentDebounced(!!props.isOpened)
})

defineExpose({
  dialog,
  dialogEntity,
  closeDialogWithAnimation,
})
</script>

<template>
  <app-base-overlay
    v-show="isOpened"
    :is-activated="isOpened"
    class="flex h-full w-full flex-col items-center"
    :class="twMerge(overlayClasses, isMobileDrawerComputed ? 'justify-end' : 'justify-center')"
    @overlay-close="emitClose"
  >
    <transition :name="dialogAnimation" @before-enter="isDialogAnimationEntered = true" @after-leave="isDialogAnimationEntered = false">
      <div
        v-show="isShowModalContent"
        ref="dialog"
        class="modal-dialog uk-fw-modal-dialog"
        :class="twMerge('relative flex flex-col outline-none', modalClasses)"
        :style="modalDialogStyle"
      >
        <div class="modal-dialog__background pointer-events-none absolute left-0 top-0 h-full w-full"></div>
        <div
          ref="dialogEntity"
          class="modal-dialog__entity"
          :style="dialogStyles"
          :class="
            twMerge(
              'bg-fill-surfaceBright-light shadow-elevation-l4-light dark:bg-fill-surfaceBright-dark dark:shadow-elevation-l4-dark flex h-full flex-col overflow-hidden rounded-xl',
              isMobileDrawerComputed ? '!rounded-b-none !rounded-t-3xl' : '',
              dialogClass,
            )
          "
        >
          <div :class="twMerge('no-shrink relative flex items-center justify-between px-6 pt-6', dialogHeaderClass)" :style="dialogHeaderStyles">
            <slot name="header">
              <div class="text-mobile-headline-small sm:text-desktop-headline-small w-full break-words" :style="dialogHeaderTitleStyles">
                <slot name="header-title">
                  <span v-if="title">
                    {{ title }}
                  </span>
                </slot>
              </div>
            </slot>
            <close
              v-if="closeButton"
              class="z-10 self-baseline"
              :class="[isModalDialogCloseDisabled ? 'cursor-not-allowed' : '']"
              :disabled="isModalDialogCloseDisabled"
              @click="emitClose"
            />
          </div>
          <slot name="separator"></slot>
          <overlay-scrollbar class="h-full">
            <slot name="outer-body">
              <div
                tabindex="-1"
                :style="dialogBodyStyles"
                :class="
                  twMerge('modal-dialog__body text-desktop-body-1 relative h-full w-full max-w-full px-6 py-4 outline-none sm:py-6', dialogBodyClass)
                "
              >
                <slot></slot>
              </div>
            </slot>
          </overlay-scrollbar>
          <slot name="between-body-footer">
            <div v-if="buttons.length" class="w-full">
              <fw-divider />
            </div>
          </slot>
          <div class="modal-dialog__footer" :style="dialogFooterStyles" :class="twMerge('no-shrink px-6 pb-8 pt-4 sm:pb-[18px]', dialogFooterClass)">
            <slot name="footer">
              <div v-if="buttons.length" class="flex w-full justify-end gap-2">
                <base-button
                  v-for="(button, index) in buttons"
                  :key="`modal-dialog-btn#${index}`"
                  :class="twMerge('flex-1 sm:flex-none', button.class)"
                  :theme="button.type"
                  :style="button?.style ?? null"
                  :size="button?.size || (isPhoneSizeViewportWidth ? 'large' : 'small')"
                  :disabled="!!button?.isDisabled"
                  data-focus="not-allow"
                  @click.stop="button?.onClick?.()"
                >
                  {{ button.text }}
                </base-button>
              </div>
            </slot>

            <slot name="footer-notification"> </slot>
          </div>
        </div>
      </div>
    </transition>
    <transition name="fade">
      <div
        v-if="isShowModalContent"
        :class="twMerge('absolute h-full w-full bg-[rgba(0,0,0,0.5)] dark:bg-[rgba(0,0,0,0.7)]', dialogOverlayClass)"
        style="z-index: -1"
        @click="emitClose"
      ></div>
    </transition>
  </app-base-overlay>
</template>

<style scoped>
.slide-in-out-enter-active,
.slide-in-out-leave-active {
  transition: transform 0.2s ease-in-out;
}
.slide-in-out-enter-from,
.slide-in-out-leave-to {
  transform: translateY(100%);
}

.slide-in-out-half-enter-active {
  transition:
    transform 0.3s cubic-bezier(0.4, 0.1, 0.3, 1),
    opacity 0.2s cubic-bezier(0.4, 0.1, 0.3, 1);
}
.slide-in-out-half-leave-active {
  transition:
    transform 0.3s cubic-bezier(0.4, 0.1, 1, 1),
    opacity 0.2s cubic-bezier(0.4, 0.1, 1, 1);
}
.slide-in-out-half-enter-from,
.slide-in-out-half-leave-to {
  transform: translateY(-40px);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease-in-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<style lang="less" scoped>
@import '../styles/utility/platform.less';

.modal-dialog__entity {
  // Polyfill this for Safari Mobile Bug to limit dialog height
  // https://stackoverflow.com/questions/19119910/safari-height-100-element-inside-a-max-height-element
  .safari-only({
      max-height: min(
        calc(90vh - (32px + var(--safe-area-bottom, 0) + var(--safe-area-top, 0))),
        var(--modal-dialog-max-height, 80vh)
      );
    });
}

.modal-dialog__footer {
  &:empty {
    padding-top: 0;
    padding-bottom: 16px;
  }
}
</style>
