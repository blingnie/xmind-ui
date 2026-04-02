<template>
  <input
    type="radio"
    :checked="modelValue === value"
    :disabled="disabled"
    :value="value"
    :class="twMerge(variant === 'default' ? 'radio' : 'radio-filled', props.class)"
    @change="$emit('update:modelValue', value)"
  />
</template>

<script lang="ts" setup>
const props = defineProps<{
  modelValue?: string
  value: string
  disabled?: boolean
  class?: VueClass
  variant?: 'default' | 'filled'
}>()
defineEmits(['update:modelValue'])
</script>

<style scoped>
.radio {
  @apply h-4 w-4 appearance-none rounded-full border border-solid border-[#cccccc] dark:border-[#626365];
}

.radio:hover {
  @apply [&:not([disabled])]:hover:border-2  [&:not([disabled])]:hover:border-brand-6;
}

.radio:disabled {
  @apply cursor-not-allowed disabled:border-[#cccccc] disabled:dark:border-[#626365];
}

.radio:checked {
  @apply checked:border-[5px] checked:border-brand-6;
}

.radio-filled {
  @apply h-4 w-4 appearance-none rounded-full border-0 bg-mask-overlay-s-light shadow-elevation-b1-light dark:bg-mask-overlay-s-dark dark:shadow-elevation-b1-dark;
}

.radio-filled:hover {
  @apply hover:bg-mask-overlay-s-light dark:hover:bg-mask-overlay-s-dark;
}

.radio-filled:checked {
  @apply border-[5px] border-solid border-border-primary-light bg-transparent shadow-none dark:border-border-primary-dark;
}
</style>
