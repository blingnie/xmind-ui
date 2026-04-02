<template>
  <div
    :class="
      twMerge(
        'flex h-6 items-center gap-1 rounded-[4px] border border-border-quaternary-light bg-fill-surfaceBright-light px-2  dark:border-border-quaternary-dark dark:bg-fill-surfaceBright-dark ',
        'active:border-border-primary-light dark:active:border-border-primary-dark',
        isInputFocused && 'border-border-primary-light dark:border-border-primary-dark',
        disabled
          ? 'pointer-events-none border-border-quaternary-light bg-transparent text-text-quaternary-light  placeholder-text-quaternary-light dark:text-text-quaternary-dark dark:placeholder-text-quaternary-dark dark:hover:border-border-tertiary-dark'
          : 'text-text-primary-light placeholder-text-tertiary-light hover:border-border-tertiary-light dark:border-border-quaternary-dark dark:text-text-primary-dark dark:placeholder-text-tertiary-dark',
        props.class,
      )
    "
  >
    <input
      :id="inputId"
      v-model="internalValue"
      type="text"
      class="h-full w-8 flex-1 appearance-none border-0 bg-transparent text-mobile-body-medium outline-0 [moz-appearance:textfield] sm:text-desktop-body-medium"
      :placeholder="placeholder"
      :name="name"
      :disabled="disabled"
      @focus="onFocus"
      @blur="onBlur"
      @keyup.enter.stop="onEntered"
      @keydown="handleInputKeydown"
    />

    <span
      :class="
        twMerge('pointer-events-none !text-text-tertiary-light dark:!text-text-tertiary-dark', 'text-mobile-body-medium sm:text-desktop-caption')
      "
      >{{ measurement }}</span
    >
  </div>
</template>

<script setup lang="ts">
import { watch, ref } from 'vue'

interface Props {
  name?: string
  value?: string
  placeholder?: string
  disabled?: boolean
  inputId?: string
  increment?: number
  min?: number
  max?: number
  class?: VueClass
  measurement?: string
}

const props = withDefaults(defineProps<Props>(), {
  name: '',
  value: '',
  placeholder: '',
  disabled: false,
  inputId: '',
  increment: 1,
  min: -Infinity,
  max: Infinity,
  measurement: 'px',
  class: '',
})

const emit = defineEmits<{
  (e: 'input', value: string): void
  (e: 'focus', event: Event): void
  (e: 'blur', event: Event): void
  (e: 'entered', event: Event): void
}>()

const isInputFocused = ref(false)

const internalValue = ref<string>(props.value)

const onFocus = (event: Event) => {
  emit('focus', event)
  isInputFocused.value = true
}

const onBlur = (event: Event) => {
  emit('blur', event)
  isInputFocused.value = false
}

const onEntered = (event: Event) => {
  emit('entered', event)
}

const handleInputKeydown = (event: KeyboardEvent) => {
  const { keyCode } = event
  if (keyCode === 38) {
    // up
    alterValue(props.increment)
  } else if (keyCode === 40) {
    // down
    alterValue(-props.increment)
  }
}

const alterValue = (increment: number) => {
  if (isNaN(increment)) {
    return
  }

  if (!internalValue.value) {
    return
  }

  const match = internalValue.value.match(/([\d.-]+)/)
  if (!match) {
    return
  }

  const numText = match[1]
  let num = numText.includes('.') ? parseFloat(numText) : parseInt(numText)

  if (isNaN(num)) {
    return
  }

  num = Math.min(Math.max(num + increment, props.min), props.max)
  internalValue.value = num.toString()
}

watch(
  () => internalValue.value,
  value => {
    // Emit changes ONLY if internal value is different from outer value
    if (value === props.value) return
    // filter out non-numeric chars
    const normalValue = value.replace(/[^0-9.]/g, '').trim()
    if (normalValue !== internalValue.value) {
      internalValue.value = normalValue
    }

    emit('input', internalValue.value)
  },
)

watch(
  () => props.value,
  value => {
    // Receive outer value
    internalValue.value = value
  },
)
</script>
