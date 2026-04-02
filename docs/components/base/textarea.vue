<template>
  <textarea
    :id="id"
    ref="inputElement"
    :class="
      twMerge(
        'w-full resize-none rounded border border-border-quaternary-light px-[12px] pb-[4px] pt-[8px] text-mobile-body-medium outline-none hover:border-border-tertiary-light focus:border-border-primary-light dark:border-border-quaternary-dark dark:hover:border-border-tertiary-dark dark:focus:border-border-primary-dark sm:text-desktop-body-medium',
        classString,
        props.class,
      )
    "
    :placeholder="placeholder"
    :value="modelValue"
    :maxlength="maxlength"
    @input="onInput"
  />
</template>

<script setup lang="ts">
import { generateShortUUID } from 'utils/shortUUID'
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    id?: string
    modelValue: string
    placeholder: string
    maxlength?: number
    class?: VueClass
    theme?: 'bright' | 'dim'
  }>(),
  {
    id: generateShortUUID(),
    placeholder: '',
    class: '',
    maxlength: 10000,
    theme: 'bright',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const inputElement = ref<HTMLInputElement>()

const classString = computed(() => {
  return [props.theme === 'bright' ? 'base-textarea-bright' : 'base-textarea-dim']
})

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
  selectInputText: () => {
    selectInputText()
  },
  inputElement,
})
</script>

<style scoped>
.base-textarea-bright {
  @apply bg-fill-surfaceBright-light dark:bg-fill-surfaceBright-dark;
}

.base-textarea-dim {
  @apply bg-fill-surface-light dark:bg-fill-surface-dark;
}
</style>
