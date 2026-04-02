<template>
  <div class="flex items-center gap-1">
    <input
      :id="inputId"
      ref="input"
      v-model="internalValue"
      type="text"
      :class="
        twMerge(
          'flex h-6 w-[52px] items-center gap-1 rounded-[4px] border border-border-quaternary-light bg-fill-surfaceBright-light pl-2 pr-1  dark:border-border-quaternary-dark dark:bg-fill-surfaceBright-dark ',
          'hover:border-border-tertiary-light dark:hover:border-border-tertiary-dark',
          'active:border-border-primary-light dark:active:border-border-primary-dark',
          isInputFocused && 'border-border-primary-light dark:border-border-primary-dark',
          disabled
            ? 'border-border-quaternary-light bg-transparent text-text-quaternary-light placeholder-text-quaternary-light dark:border-border-quaternary-dark dark:text-text-quaternary-dark dark:placeholder-text-quaternary-dark'
            : 'text-text-primary-light placeholder-text-tertiary-light dark:text-text-primary-dark dark:placeholder-text-tertiary-dark',
          'text-desktop-body-medium outline-0',
          props.class,
        )
      "
      :name="name"
      :disabled="disabled"
      @focus="onFocus"
      @blur="onBlur"
      @keydown="handleInputKeydown"
    />

    <div class="flex h-[22px] shrink-0 flex-col gap-[1px]">
      <fw-button
        theme="default"
        size="small"
        class="!h-[50%] !w-[16px] !rounded-b-none !p-0"
        :disabled="disabled"
        tabindex="-1"
        @click="handleStepperUpClick"
      >
        <fw-icon class="pointer-events-none" :width="9" :height="9" name="chevron-upward" />
      </fw-button>

      <fw-button
        theme="default"
        size="small"
        class="!h-[50%] !w-[16px] !rounded-t-none !p-0"
        :disabled="disabled"
        tabindex="-1"
        @click="handleStepperDownClick"
      >
        <fw-icon class="pointer-events-none" :width="9" :height="9" name="chevron-downward" />
      </fw-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { generateShortUUID } from 'utils/shortUUID'
import { watch, ref, nextTick } from 'vue'

const props = withDefaults(
  defineProps<{
    class?: VueClass
    name?: string
    value?: string
    disabled?: boolean
    inputId?: string
    increment?: number
    min?: number | string
    max?: number | string
    suffix?: string
  }>(),
  {
    name: '',
    class: '',
    value: '',
    disabled: false,
    inputId: generateShortUUID(),
    increment: 1,
    min: -Infinity,
    max: Infinity,
    suffix: '',
  },
)

const emit = defineEmits<{
  (e: 'input', value: string): void
}>()

const input = ref<HTMLInputElement>()
const internalValue = ref(props.value)
const isInputFocused = ref(false)

watch(internalValue, (newVal, oldVal) => {
  if (newVal && newVal === oldVal) return
  emit('input', newVal)
})

watch(
  () => props.value,
  value => {
    internalValue.value = value
  },
)

const onFocus = () => {
  isInputFocused.value = true
}

const onBlur = () => {
  isInputFocused.value = false
}

const handleInputKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowUp') {
    updateInternalValue(props.increment)
  } else if (event.key === 'ArrowDown') {
    updateInternalValue(-props.increment)
  }
}

const handleStepperUpClick = () => {
  updateInternalValue(props.increment)
  nextTick(() => input.value?.focus())
}

const handleStepperDownClick = () => {
  updateInternalValue(-props.increment)
  nextTick(() => input.value?.focus())
}

const updateInternalValue = (increment: number) => {
  if (isNaN(increment)) {
    return
  }

  const match = internalValue.value.match(/([\d.-]+)/)
  if (!match) return

  const noSuffixValue = match[1]
  const newVal = Number(noSuffixValue) + increment

  if (isNaN(newVal)) return
  if (newVal < Number(props.min) || newVal > Number(props.max)) return

  internalValue.value = newVal + props.suffix
}
</script>
