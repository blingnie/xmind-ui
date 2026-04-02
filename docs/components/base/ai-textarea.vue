<template>
  <div :class="twMerge(wrapperClasses, props.class)">
    <div :class="twMerge(fieldClasses, props.fieldClass)" @click="focusTextarea">
      <textarea :ref="setTextareaElement" v-model="model" v-bind="controlAttrs" :class="twMerge(inputClasses, props.inputClass)" />
    </div>

    <p v-if="errorMessage" class="ai-textarea-error-message">
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
    size?: 'small' | 'medium' | 'big'
    theme?: 'bright' | 'dim'
    disabled?: boolean
    readonly?: boolean
    rows?: number
    errorMessage?: string
    maxlength?: number
    class?: VueClass
    fieldClass?: VueClass
    inputClass?: VueClass
  }>(),
  {
    placeholder: '',
    size: 'medium',
    theme: 'bright',
    disabled: false,
    readonly: false,
    rows: 3,
    errorMessage: '',
    maxlength: 10000,
    class: '',
    fieldClass: '',
    inputClass: '',
  },
)

const model = defineModel<string>({ required: true })

const textareaElement = ref<HTMLTextAreaElement>()

const setTextareaElement = (el: HTMLTextAreaElement | null) => {
  textareaElement.value = el ?? undefined
}

const wrapperClasses = computed(() => {
  return clsx([
    'ai-textarea',
    `ai-textarea-${props.size}`,
    `ai-textarea-${props.theme}`,
    props.disabled && 'ai-textarea-disabled',
    props.errorMessage && 'ai-textarea-error',
  ])
})

const fieldClasses = computed(() => {
  return clsx(['ai-textarea-field'])
})

const inputClasses = computed(() => {
  return clsx(['ai-textarea-control'])
})

const controlAttrs = computed(() => {
  return {
    placeholder: props.placeholder,
    maxlength: props.maxlength,
    disabled: props.disabled,
    readonly: props.readonly,
    rows: props.rows,
  }
})

const focusTextarea = () => {
  if (!props.disabled) textareaElement.value?.focus()
}

defineExpose({
  focus: () => textareaElement.value?.focus(),
  blur: () => textareaElement.value?.blur(),
  select: () => textareaElement.value?.select(),
  textareaElement,
})
</script>

<style scoped>
.ai-textarea {
  @apply flex w-full flex-col gap-1;
}

/* Field */
.ai-textarea-field {
  @apply flex w-full items-center gap-2 px-[12px] py-[8px];
  @apply border border-transparent transition-colors duration-150 ease-out;
  @apply text-ai-input-text-default-light dark:text-ai-input-text-default-dark;
  @apply focus-within:!border-ai-input-border-pressed hover:border-ai-input-border-hover;
  @apply rounded-[16px];
}

.ai-textarea-bright .ai-textarea-field {
  @apply bg-ai-input-bg-bright-light dark:bg-ai-input-bg-bright-dark;
}

.ai-textarea-dim .ai-textarea-field {
  @apply bg-ai-input-bg-default-light dark:bg-ai-input-bg-default-dark;
}

/* Control */
.ai-textarea-control {
  @apply font-NeverMind-UI w-full bg-transparent outline-none;
  @apply placeholder:text-text-tertiary-light dark:placeholder:text-text-tertiary-dark;
  @apply min-h-[56px] resize-none;
}

/* Sizes */
.ai-textarea-small .ai-textarea-control,
.ai-textarea-medium .ai-textarea-control {
  @apply text-desktop-body-medium placeholder:text-desktop-body-medium;
}

.ai-textarea-big .ai-textarea-control {
  @apply text-desktop-body-large placeholder:text-desktop-body-large;
}

/* States */
.ai-textarea-error .ai-textarea-field {
  @apply border-ai-input-border-error-normal focus-within:!border-ai-input-border-error-pressed hover:border-ai-input-border-error-hover;
}

.ai-textarea-disabled :is(.ai-textarea-field, .ai-textarea-control) {
  @apply cursor-not-allowed;
}

.ai-textarea-disabled .ai-textarea-field {
  @apply border-ai-input-border-disable-light dark:border-ai-input-border-disable-dark;
}

.ai-textarea-disabled .ai-textarea-control {
  @apply placeholder:!text-ai-input-text-disable-light dark:placeholder:!text-ai-input-text-disable-dark;
}

.ai-textarea-error-message {
  @apply text-desktop-caption-header text-ai-input-text-error;
}
</style>
