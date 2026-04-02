<template>
  <textarea
    ref="inputElement"
    class="w-full resize-none rounded-[12px] border border-transparent-dark-3 p-4 text-desktop-body-3 outline-none hover:border-brand-3 focus:border-brand-6 focus:shadow-input-focus-border-color dark:border-transparent-white-3 dark:bg-dark-grey-6 dark:hover:border-brand-3 dark:focus:border-brand-6"
    :placeholder="placeholder"
    :value="modelValue"
    :maxlength="maxlength"
    @input="onInput"
  />
</template>

<script setup lang="ts">
/**
 * @deprecated Use <fw-textarea> instead.
 */
import { ref } from 'vue'

withDefaults(
  defineProps<{
    modelValue: string
    placeholder: string
    maxlength: number
  }>(),
  {
    placeholder: '',
    maxlength: null,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const inputElement = ref<HTMLInputElement>()

const onInput = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLTextAreaElement).value)
}

const focusInputElement = async () => {
  inputElement.value?.focus()
}

const selectInputText = async () => {
  if (inputElement.value) {
    inputElement.value.select()
  }
}

defineExpose({
  focus: () => {
    focusInputElement()
  },
  select: () => {
    selectInputText()
  },
})
</script>

<style lang="less" scoped></style>
