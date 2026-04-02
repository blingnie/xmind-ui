<script lang="ts">
/**
 * @deprecated This component is deprecated. Please use <fw-input> instead.
 */
export default {
  name: 'NewBaseInput',
}
</script>
<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps({
  value: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  isError: Boolean,
  errorMsg: {
    type: String,
    default: '',
  },
  isAutoFocus: {
    type: Boolean,
    default: false,
  },
  selectedRange: {
    type: Array,
    validator(value: any): boolean {
      return Array.isArray(value) && value.length === 2 && value.every(val => typeof val === 'number')
    },
    default() {
      return undefined
    },
  },
  autocomplete: {
    type: String,
    default: '',
  },
  isAutoSelect: {
    type: Boolean,
    default: false,
  },
  isReadonly: {
    type: Boolean,
    default: false,
  },
  frontIcon: {
    type: String,
    default: '',
  },
  frontIconStyle: {
    type: Object,
    default: () => {
      return {}
    },
  },
  clearIcon: {
    type: String,
    default: '',
  },
  appendIcon: {
    type: String,
    default: '',
  },
  handleAppendIconFunc: {
    type: Function,
    default: () => {
      return
    },
  },
  size: {
    type: String,
    default: 'normal',
  },
  disableSelectRangeOnAppendIcon: {
    type: Boolean,
    default: false,
  },
  dataFocus: {
    type: String,
    default: '',
  },
  dataBlur: {
    type: String,
    default: '',
  },
  tabIndex: {
    type: Number,
    default: 0,
  },
})
// const emits = defineEmits(['clear', 'focus', 'blur'])
const emits = defineEmits<{
  (e: 'clear'): void
  (e: 'focus'): void
  (e: 'blur', v: string): void
  (e: 'enter', v: string): void
  (e: 'change', v: string): void
  (e: 'inputChange', v: string): void
}>()
const inputElement = ref<HTMLInputElement>()
const inputValue = ref(props.value)
const updateSelectedRange = (range: [number, number] = [props.value.length, props.value.length]) => {
  if (!inputElement.value) return
  inputElement.value.select()
  inputElement.value.setSelectionRange(range[0], range[1])
}

const showClearIcon = computed(() => inputValue.value?.length > 0)
const handleClearInput = () => {
  inputValue.value = ''
  emits('clear')
}

const handleClickAppendIcon = () => {
  props.handleAppendIconFunc()
  if (!props.disableSelectRangeOnAppendIcon) {
    setTimeout(() => {
      updateSelectedRange([inputValue.value.length, inputValue.value.length])
    }, 0)
  }
}

watch(
  () => props.selectedRange,
  () => {
    if (!props.selectedRange) return
    updateSelectedRange(props.selectedRange as [number, number])
  },
  { immediate: true },
)

watch(
  () => props.isAutoFocus,
  () => {
    if (props.isAutoFocus && inputElement.value) {
      inputElement.value.focus()
    }
  },
)

onMounted(() => {
  if (inputElement.value) {
    if (props.isAutoFocus && inputElement.value) {
      inputElement.value.focus()
    }

    if (props.isAutoSelect && inputElement.value) {
      updateSelectedRange([0, 9999])
    }

    if (props.selectedRange) {
      updateSelectedRange(props.selectedRange as [number, number])
    }
  }
})

defineExpose({
  clearInput() {
    inputValue.value = ''
  },
  setInput(value: string) {
    inputValue.value = value
  },
  blurInput() {
    inputElement.value?.blur()
  },
  focusInput() {
    inputElement.value?.focus()
  },
})
</script>

<template>
  <div
    class="base-input"
    :class="{
      'uk-inline': frontIcon || clearIcon || appendIcon,
      'is-empty': !value,
      'is-error animate__wiggle': isError,
      'with-error-message ': isError && errorMsg,
    }"
  >
    <span v-if="frontIcon" class="uk-form-icon">
      <img uk-svg :data-src="frontIcon" :style="frontIconStyle" />
    </span>
    <span v-if="clearIcon" v-show="showClearIcon" class="uk-form-icon uk-form-icon-flip" @click="handleClearInput">
      <img uk-svg :data-src="clearIcon" />
    </span>
    <span v-if="appendIcon" id="base-input-append-icon" class="uk-form-icon uk-form-icon-flip cursor-pointer" @click="handleClickAppendIcon">
      <img uk-svg :data-src="appendIcon" />
    </span>
    <input
      ref="inputElement"
      v-model="inputValue"
      class="uk-input"
      :class="{
        error: isError,
        disabled: isReadonly,
        large: size === 'large',
      }"
      :type="type"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :readonly="isReadonly"
      :data-focus="dataFocus ? dataFocus : null"
      :data-blur="dataBlur ? dataBlur : null"
      :tabindex="tabIndex"
      @change="emits('change', inputValue)"
      @focus="emits('focus')"
      @blur="emits('blur', inputValue)"
      @input="emits('inputChange', inputValue)"
      @keydown.enter.stop="emits('enter', inputValue)"
    />
    <span v-if="isError && errorMsg" class="alert-error">{{ errorMsg }}</span>
  </div>
</template>

<style lang="less" scoped>
@import '../styles/new-ui/new-variables.less';

.base-input {
  padding: 2px;
}

input {
  height: auto;
  padding: 8px 12px 8px 12px;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.03);
  border-color: transparent;
  border-width: 1px;

  &:hover {
    padding: 8px 12px 8px 12px;
    border-color: transparent;
    background-color: rgba(0, 0, 0, 0.038);
  }

  &:focus {
    padding: 8px 12px 8px 12px;
    border: 1px solid var(--form-focus-outline01, transparent);
    box-shadow: 0 0 0 2px var(--form-focus-outline01, rgba(128, 189, 255, 1));
    background-color: transparent;
  }

  &::placeholder {
    color: currentColor;
    opacity: 0.3;
  }

  &.error {
    border: 1px solid var(--form-focus-error, red);
    background-color: transparent;
    &:focus {
      border: 1px solid transparent;
      box-shadow: 0 0 0 2px var(--form-focus-error, red);
    }
  }
}

[color-scheme='light'] .fw-override.base-input {
  --input-placeholder-color: @transparent-dark-6;
  --svg-color: @dark-grey-8;
  --input-background: @light-grey-1;
  --input-border-color: @transparent-dark-5;
  --input-border-color-hover: @brand-3;
  --input-border-color-focus: @brand-6;
  --input-text-color: @dark-grey-8;
  --input-disabled-text-color: @transparent-dark-6;
  --input-disabled-bg-color: @light-grey-3;
  --input-disabled-border-color: @transparent-dark-3;
  --alert-error-color: @red-8;
}
[color-scheme='dark'] .fw-override.base-input {
  --input-placeholder-color: @transparent-white-5;
  --svg-color: @light-grey-1;
  --input-background: @dark-grey-6;
  --input-border-color: @transparent-white-5;
  --input-border-color-hover: @brand-3;
  --input-border-color-focus: @brand-5;
  --input-text-color: @light-grey-1;
  --input-disabled-text-color: @transparent-white-3;
  --input-disabled-bg-color: @dark-grey-7;
  --input-disabled-border-color: @transparent-white-2;
  --alert-error-color: @red-7;
}

.fw-override {
  &.base-input {
    padding: unset;

    .uk-input {
      line-height: 16px;
      font-size: 12px;
      font-weight: 400;
      letter-spacing: 0.074px;

      height: 32px;
      border: 1px solid var(--input-border-color);
      border-radius: 6px;
      color: var(--input-text-color);
      background-color: var(--input-background);
      box-shadow: none;
      text-overflow: ellipsis;

      &.error {
        background-color: var(--input-background) !important;
        border: 1px solid @red-8 !important;
        box-shadow: 0 0 0 1px @red-8 !important;
      }

      &.disabled {
        background-color: var(--input-disabled-bg-color) !important;
        border: 1px solid var(--input-disabled-border-color) !important;
        box-shadow: none !important;
        color: var(--input-disabled-text-color) !important;
      }

      &.large {
        height: 40px;
        padding: 8px 16px;
        font-size: 16px;
        line-height: 24px;
        font-weight: 400;
        letter-spacing: initial;

        &::placeholder {
          font-size: 16px;
          line-height: 24px;
          font-weight: 400;
          letter-spacing: initial;
        }
      }
    }
    .uk-input:not(:disabled):not(:focus):not(:focus-within):hover {
      background-color: var(--input-background);
      border: 1px solid var(--input-border-color-hover);
      box-shadow: none;
    }
    .uk-input:focus,
    .uk-input:focus-within {
      background-color: var(--input-background);
      border: 1px solid var(--input-border-color-focus);
      box-shadow: 0 0 0 1px var(--input-border-color-focus);
    }
    .uk-input::placeholder {
      color: var(--input-placeholder-color);
      opacity: 1;
      font-size: 12px;
      line-height: 16px;
      font-weight: 400;
      letter-spacing: 0.074px;
    }

    .uk-input::-ms-reveal,
    .uk-input::-ms-clear {
      display: none;
    }

    .uk-form-icon,
    .uk-form-icon-flip {
      color: var(--svg-color);
    }

    .uk-form-icon:not(.uk-form-icon-flip) {
      width: 24px;
      margin-left: 8px;
      margin-right: 4px;
    }

    .uk-form-icon-flip {
      width: 16px;
      margin-right: 8px;
      margin-left: 4px;
      pointer-events: initial;
    }

    .uk-form-icon:not(.uk-form-icon-flip) ~ .uk-input {
      padding-left: 36px !important;
    }

    .uk-form-icon-flip ~ .uk-input {
      padding-right: 28px !important;
    }
    &.with-error-message {
      vertical-align: unset;
    }
    span.alert-error {
      display: inline-block;
      padding: 9px 0;
      font-size: 12px;
      font-weight: 400;
      line-height: 16px;
      color: var(--alert-error-color);
    }
  }
}
</style>
