<script lang="ts">
/**
 * @deprecated This component is deprecated. Please use new-base-modal-dialog.vue instead.
 */
import { defineComponent, ref, computed, PropType, watch, onMounted, onBeforeUnmount } from 'vue'
import AppBaseOverlay from 'client/components/base-overlay.vue'

export interface ModalDialogBottomButton {
  isDisabled: boolean
  onClick: () => void
  text: string
  classes?: string
}

export interface ModalDialogProps {
  height: number
  width: number
  maxHeight?: number
  minHeight?: number
  title: string
  isOpened: boolean
  escClose: boolean
  closeButton: boolean
  dialogStyles?: object
  dialogHeaderStyles?: object
  dialogHeaderTitleStyles?: object
  dialogBodyStyles?: object
  buttons: {
    text: string
    onClicked: Function
  }[]
}

export const ModalDialogPropsDefinition = {
  height: {
    type: Number,
    default: null,
  },
  maxHeight: {
    type: Number,
    default: null,
  },
  minHeight: {
    type: Number,
    default: 260,
  },
  width: {
    type: Number,
    default: 604,
  },
  dialogStyles: {
    type: Object,
    default() {
      return {}
    },
  },
  dialogHeaderStyles: {
    type: Object,
    default() {
      return {}
    },
  },
  dialogHeaderTitleStyles: {
    type: Object,
    default() {
      return {}
    },
  },
  dialogBodyStyles: {
    type: Object,
    default() {
      return {}
    },
  },
  dialogClass: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  isOpened: {
    type: Boolean,
    default: false,
  },
  escClose: {
    type: Boolean,
    default: true,
  },
  closeButton: {
    type: Boolean,
    default: false,
  },
  buttons: {
    type: Array as PropType<ModalDialogBottomButton[]>,
    default: () => {
      return []
    },
  },
}

export default defineComponent({
  name: 'ModalDialog',
  components: {
    AppBaseOverlay,
  },
  props: ModalDialogPropsDefinition,
  emits: ['modal-dialog-close'],
  setup(props, ctx) {
    const dialog = ref<HTMLElement>()

    const modalDialogStyle = computed(() => {
      const normalize = (num: unknown) => (typeof num === 'number' ? num + 'px' : '')
      const styles = {
        width: normalize(props.width),
        'max-height': `min(90%, ${normalize(props.maxHeight) || '90%'})`,
        'min-height': 'none',
        '--modal-dialog-max-height': normalize(props.maxHeight),
      }
      if (props.minHeight) {
        styles['min-height'] = normalize(props.minHeight)
      }
      return styles
    })

    const emitClose = () => {
      ctx.emit('modal-dialog-close')
    }

    const setFocusIfFocusElementNotInDialog = async () => {
      await new Promise(resolve => setTimeout(resolve))
      if (!dialog.value) return
      if (!document.activeElement || !dialog.value?.contains(document.activeElement)) {
        const dialogEle = dialog.value?.querySelector('.modal-dialog__body') as HTMLElement
        dialogEle?.focus()
      }
    }
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
      window.addEventListener('popstate', emitClose, false)
    })
    onBeforeUnmount(() => {
      window.removeEventListener('popstate', emitClose, false)
    })
    const test = () => {
      logger.log('Log')
    }
    return {
      modalDialogStyle,
      dialog,
      emitClose,
      test,
    }
  },
})
</script>

<template>
  <app-base-overlay
    v-show="isOpened"
    background-color="rgba(0,0,0,.7)"
    :is-activated="isOpened"
    class="uk-width-1-1 uk-height-1-1 uk-flex uk-flex-column uk-flex-middle uk-flex-center"
    style="min-width: 320px"
    @overlay-close="emitClose"
  >
    <div
      ref="dialog"
      class="modal-dialog uk-flex uk-flex-column uk-fw-modal-dialog"
      :class="{
        'close-button': closeButton,
      }"
      :style="modalDialogStyle"
    >
      <div
        class="modal-dialog__entity uk-flex uk-flex-column uk-height-1-1 uk-border-rounded uk-box-shadow-floating fw-border-radius-xlarge uk-overflow-hidden uk-fw-modal-dialog-entity"
        :style="dialogStyles"
        :class="dialogClass"
      >
        <div class="modal-dialog__header uk-position-relative uk-flex uk-flex-column uk-flex-no-shrink" :style="dialogHeaderStyles">
          <span v-if="closeButton" class="modal-dialog__close" @click="emitClose">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M16.0083 32C24.755 32 32 24.755 32 15.9917C32 7.24497 24.7385 0 15.9917 0C7.24497 0 0 7.24497 0 15.9917C0 24.755 7.26148 32 16.0083 32ZM10.4631 22.9232C9.70397 22.9232 9.09335 22.296 9.09335 21.5369C9.09335 21.1573 9.24188 20.8272 9.48943 20.5797L14.0609 16.0083L9.48943 11.4368C9.24188 11.1893 9.09335 10.8592 9.09335 10.4961C9.09335 9.72047 9.70397 9.12635 10.4631 9.12635C10.8427 9.12635 11.1728 9.27488 11.4203 9.52243L15.9917 14.0939L20.5962 9.52243C20.8767 9.22537 21.1738 9.10985 21.5369 9.10985C22.3125 9.10985 22.9232 9.70397 22.9232 10.4796C22.9232 10.8427 22.7911 11.1563 22.5106 11.4203L17.9391 16.0083L22.4941 20.5467C22.7581 20.8272 22.9067 21.1408 22.9067 21.5369C22.9067 22.296 22.296 22.9232 21.5204 22.9232C21.1408 22.9232 20.7942 22.7581 20.5467 22.5106L15.9917 17.9391L11.4368 22.5106C11.1893 22.7746 10.8427 22.9232 10.4631 22.9232Z"
                fill="currentcolor"
              />
            </svg>
          </span>
          <slot name="header">
            <div class="modal-dialog__header-title" :style="dialogHeaderTitleStyles">
              <slot name="header-title">
                <span v-if="title" class="fw-text-heading02 fw-text-heading01@m">
                  {{ title }}
                </span>
              </slot>
            </div>
          </slot>
        </div>
        <div class="modal-dialog__body fw-text-body" tabindex="-1" :style="dialogBodyStyles">
          <slot></slot>
        </div>
        <div class="modal-dialog__footer uk-flex-no-shrink">
          <slot name="footer">
            <div v-if="buttons.length" class="modal-dialog__footer-default uk-flex uk-flex-middle uk-flex-right">
              <button
                v-for="(button, index) in buttons"
                :key="`modal-dialog-btn#${index}`"
                :class="button.classes"
                :disabled="button.isDisabled"
                data-focus="not-allow"
                @click="button.onClick"
              >
                {{ button.text }}
              </button>
            </div>
          </slot>
        </div>
      </div>
    </div>
    <div class="uk-width-1-1 uk-height-1-1 uk-position-absolute" style="z-index: -1" @click="emitClose"></div>
  </app-base-overlay>
</template>

<style lang="less" scoped>
@import '../styles/variables';
@import '../styles/utility/platform';

.modal-dialog {
  // Dialog Padding 16px (left + right)
  max-width: calc(100% - 64px);
  outline: none;

  @media only screen and (max-width: @breakpoint-medium) {
    // Dialog Padding 32px (left + right)
    max-width: calc(100% - 32px);
  }

  * {
    box-sizing: border-box;
  }

  .modal-dialog__close {
    width: 32px;
    height: 32px;
    transition: opacity 0.5s ease;
    //opacity: .1;
    top: 16px;
    right: 16px;
    align-self: flex-end;
    position: absolute;
    z-index: 10;

    path {
      opacity: 0.3;
    }

    img,
    svg {
      width: 100%;
      height: 100%;
    }

    @media only screen and (max-width: @breakpoint-medium) {
      top: 8px;
      right: 8px;
      width: 24px;
      height: 24px;
    }

    &:hover path {
      opacity: 1;
    }
  }

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

  &.close-button {
    .modal-dialog__header-title {
      padding-top: 48px;
      @media only screen and (max-width: @breakpoint-medium) {
        padding-top: 32px;
      }
    }
  }
  .modal-dialog__header-title {
    padding-top: 32px;
    padding-left: 32px;
    padding-right: 32px;
    @media only screen and (max-width: @breakpoint-medium) {
      padding-top: 24px;
      padding-left: 16px;
      padding-right: 16px;
    }
  }

  .modal-dialog__body {
    max-width: 100%;
    width: 100%;
    height: 100%;
    padding-top: 16px;
    padding-left: 32px;
    padding-right: 32px;
    overflow: auto;
    overflow: overlay;
    outline: none;

    @media only screen and (max-width: @breakpoint-medium) {
      padding-left: 16px;
      padding-right: 16px;
    }
  }

  .modal-dialog__footer-default {
    margin: 24px;
  }
}
</style>
