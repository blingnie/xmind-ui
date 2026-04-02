<template>
  <div :class="twMerge(wrapperClasses, props.class)">
    <div :class="twMerge(fieldClasses, props.fieldClass)" @click="focusInput">
      <input :ref="setInputElement" v-model="inputValue" v-bind="controlAttrs" :class="twMerge(inputClasses, props.inputClass)" />
    </div>

    <p v-if="errorMessage" class="ai-input-error-message">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import clsx from 'clsx'

const props = withDefaults(
  defineProps<{
    placeholder?: string
    type?: string
    size?: 'small' | 'medium' | 'big'
    theme?: 'bright' | 'dim'
    disabled?: boolean
    readonly?: boolean
    errorMessage?: string
    maxlength?: number
    autocomplete?: string
    class?: VueClass
    fieldClass?: VueClass
    inputClass?: VueClass
  }>(),
  {
    placeholder: '',
    type: 'text',
    size: 'medium',
    theme: 'bright',
    disabled: false,
    readonly: false,
    errorMessage: '',
    maxlength: 10000,
    autocomplete: '',
    class: '',
    fieldClass: '',
    inputClass: '',
  },
)

const inputValue = defineModel<string>({ required: true })

const inputElement = ref<HTMLInputElement>()

const setInputElement = (el: HTMLInputElement | null) => {
  inputElement.value = el ?? undefined
}

const wrapperClasses = computed(() => {
  return clsx([
    'ai-input',
    `ai-input-${props.size}`,
    `ai-input-${props.theme}`,
    'ai-input-singleline',
    props.disabled && 'ai-input-disabled',
    props.errorMessage && 'ai-input-error',
  ])
})

const fieldClasses = computed(() => {
  return clsx(['ai-input-field'])
})

const inputClasses = computed(() => {
  return clsx(['ai-input-control', 'ai-input-text'])
})

const controlAttrs = computed(() => {
  const base: Record<string, unknown> = {
    placeholder: props.placeholder,
    maxlength: props.maxlength,
    disabled: props.disabled,
    readonly: props.readonly,
    type: props.type,
    autocomplete: props.autocomplete,
  }

  return base
})

const focusInput = () => {
  if (!props.disabled) inputElement.value?.focus()
}

defineExpose({
  focus: () => inputElement.value?.focus(),
  blur: () => inputElement.value?.blur(),
  select: () => inputElement.value?.select(),
  inputElement,
})
</script>

<style scoped>
.ai-input {
  @apply flex w-full flex-col gap-1;
}

/* Field */
.ai-input-field {
  @apply flex w-full items-center gap-2 px-[12px] py-[8px];
  @apply border border-transparent transition-colors duration-150 ease-out;
  @apply text-ai-input-text-default-light dark:text-ai-input-text-default-dark;
  @apply focus-within:!border-ai-input-border-pressed hover:border-ai-input-border-hover;
}

.ai-input-singleline .ai-input-field {
  @apply rounded-lg;
}

.ai-input-bright .ai-input-field {
  @apply bg-ai-input-bg-bright-light dark:bg-ai-input-bg-bright-dark;
}

.ai-input-dim .ai-input-field {
  @apply bg-ai-input-bg-default-light dark:bg-ai-input-bg-default-dark;
}

/* Control */
.ai-input-control {
  @apply font-NeverMind-UI w-full bg-transparent outline-none;
  @apply placeholder:text-text-tertiary-light dark:placeholder:text-text-tertiary-dark;
}

.ai-input-text {
  @apply truncate;
}

/* Sizes */
.ai-input-singleline.ai-input-small .ai-input-field {
  @apply h-6;
}

.ai-input-singleline.ai-input-medium .ai-input-field {
  @apply h-8;
}

.ai-input-singleline.ai-input-big .ai-input-field {
  @apply h-10 rounded-[12px];
}

.ai-input-small .ai-input-control,
.ai-input-medium .ai-input-control {
  @apply text-desktop-body-medium placeholder:text-desktop-body-medium;
}

.ai-input-big .ai-input-control {
  @apply text-desktop-body-large placeholder:text-desktop-body-large;
}

/* States */
.ai-input-error .ai-input-field {
  @apply border-ai-input-border-error-normal focus-within:!border-ai-input-border-error-pressed hover:border-ai-input-border-error-hover;
}

.ai-input-disabled :is(.ai-input-field, .ai-input-control) {
  @apply cursor-not-allowed;
}

.ai-input-disabled .ai-input-field {
  @apply border-ai-input-border-disable-light dark:border-ai-input-border-disable-dark;
}

.ai-input-disabled .ai-input-control {
  @apply placeholder:!text-ai-input-text-disable-light dark:placeholder:!text-ai-input-text-disable-dark;
}

.ai-input-error-message {
  @apply text-desktop-caption-header text-ai-input-text-error;
}
</style>
