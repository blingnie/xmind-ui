<template>
  <div :class="classString" @click="inputElement.focus()">
    <slot name="front-icon" :disabled="disabled">
      <icon v-if="frontIconName" :name="frontIconName" class="shrink-0 cursor-text" />
    </slot>

    <input
      ref="inputElement"
      v-model="inputValue"
      :type="type"
      class="h-6 min-w-0 flex-1 truncate bg-transparent font-NeverMind-UI caret-[#328FE5] outline-none placeholder:text-text-tertiary-light dark:placeholder:text-text-tertiary-dark"
      :class="clsx(customInputClass)"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :maxlength="maxlength"
      :disabled="disabled ? disabled : null"
      :readonly="isReadOnly ? isReadOnly : null"
      @change="emits('change', inputValue)"
      @focus="emits('focus')"
      @blur="emits('blur', inputValue)"
      @input="emits('inputChange', inputValue)"
      @keydown.enter.stop="emits('enter', inputValue)"
    />

    <slot name="clear-icon" :disabled="disabled">
      <icon
        v-if="!disableClearIcon && !disabled"
        name="xmark-fill"
        class="shrink-0 cursor-pointer text-icon-quaternary-light dark:text-icon-quaternary-dark"
        :class="{ visible: inputValue, invisible: !inputValue }"
        :width="closeIconSize"
        :height="closeIconSize"
        @click="handleClearInput"
      />
    </slot>
    <slot name="suffix" :disabled="disabled"></slot>
  </div>
</template>

<script setup lang="ts">
import Icon from 'client/components/icon/icon.vue'
import { computed, ref, onMounted } from 'vue'
import type { IconName } from 'client/components/icon/icons'

const props = withDefaults(
  defineProps<{
    placeholder?: string
    type?: string
    isError?: boolean
    isSuccess?: boolean
    isAutoFocus?: boolean
    isAutoSelect?: boolean
    autocomplete?: string
    disabled?: boolean
    isReadOnly?: boolean
    size?: 'small' | 'medium' | 'large'
    theme?: 'bright' | 'dim'
    disableClearIcon?: boolean
    frontIconName?: IconName
    customInputClass?: string
    maxlength?: number
  }>(),
  {
    placeholder: '',
    type: 'text',
    isError: false,
    isSuccess: false,
    isAutoFocus: false,
    isAutoSelect: false,
    autocomplete: '',
    disabled: false,
    isReadOnly: false,
    size: 'medium',
    theme: 'bright',
    disableClearIcon: false,
    frontIconName: null,
    customInputClass: '',
    maxlength: 10000,
  },
)

const emits = defineEmits<{
  (e: 'clear'): void
  (e: 'focus'): void
  (e: 'blur', v: string): void
  (e: 'enter', v: string): void
  (e: 'change', v: string): void
  (e: 'inputChange', v: string): void
}>()

const inputValue = defineModel<string>({ default: '', required: true })
const inputElement = ref<HTMLInputElement>()

const closeIconSize = computed(() => {
  switch (props.size) {
    case 'small':
      return 16
    case 'large':
      return 24
    case 'medium':
    default:
      return 20
  }
})

const classString = computed(() => {
  return [
    'base-input',
    `base-input-${props.size}`,
    props.isError && 'base-input-error',
    props.isSuccess && 'base-input-success',
    props.disabled && 'base-input-disabled',
    props.theme === 'bright' ? 'base-input-bright' : 'base-input-dim',
  ]
})

const handleClearInput = (event: MouseEvent) => {
  event.stopPropagation()
  inputValue.value = ''
  emits('clear')
  inputElement.value?.focus()
}

onMounted(async () => {
  await new Promise(resolve => setTimeout(resolve, 100))
  if (inputElement.value) {
    if (props.isAutoFocus && inputElement.value) {
      inputElement.value.focus()
    }
    if (props.isAutoSelect && inputElement.value) {
      inputElement.value.select()
    }
  }
})

defineExpose({
  blurInput: () => {
    inputElement.value?.blur()
  },
  setInput: (value: string) => {
    inputValue.value = value
  },
  focus: () => {
    inputElement.value?.focus()
  },
})
</script>

<style scoped>
.base-input {
  @apply flex min-w-0 items-center gap-1 rounded border border-border-quaternary-light text-text-primary-light focus-within:border-border-primary-light hover:border-border-tertiary-light hover:focus-within:border-border-primary-light focus:border-border-primary-light dark:border-border-quaternary-dark  dark:text-text-primary-dark dark:focus-within:border-border-primary-dark dark:hover:border-border-tertiary-dark dark:hover:focus-within:border-border-primary-dark dark:focus:border-border-primary-dark;
}

.base-input-bright {
  @apply bg-fill-surfaceBright-light dark:bg-fill-surfaceBright-dark;
}

.base-input-dim {
  @apply bg-fill-surface-light dark:bg-fill-surface-dark;
}

.base-input-small {
  input {
    @apply text-desktop-body-medium placeholder:text-desktop-body-medium;
  }
  @apply pl-[8px] pr-[4px];
}
.base-input-medium {
  input {
    @apply text-desktop-body-medium placeholder:text-desktop-body-medium;
  }
  @apply py-[4px] pl-[8px] pr-[4px];
}
.base-input-large {
  input {
    @apply text-desktop-body-large placeholder:text-desktop-body-large;
  }
  @apply py-[8px] pl-[8px] pr-[8px];
}

.base-input-error {
  @apply !border-red-500 hover:!border-red-500;
}

.base-input-success {
  @apply !border-green-500;
}

.base-input-disabled {
  input {
    @apply placeholder:!text-text-quaternary-light dark:placeholder:!text-text-quaternary-dark;
  }
  @apply !border-border-quaternary-light !bg-transparent !text-text-quaternary-light dark:!border-border-quaternary-dark dark:!text-text-quaternary-dark;
}

/* Chrome, Safari, Edge */
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type='number'] {
  -moz-appearance: textfield;
}
</style>
