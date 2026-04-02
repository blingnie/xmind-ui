<template>
  <div class="new-number-input flex gap-[8px]">
    <base-button class="!p-[6px]" theme="default" size="medium" :disabled="isDisabled || isMinusDisabled" @click="handleValueChange(value - 1)">
      <icon name="minus" width="20" height="20" />
    </base-button>
    <input
      class="w-full rounded border border-border-quaternary-light bg-fill-surfaceBright-light text-center font-NeverMind-UI text-text-primary-light caret-[#328FE5] outline-none placeholder:text-text-tertiary-light focus-within:border-border-primary-light hover:border-border-tertiary-light hover:focus-within:border-border-primary-light focus:border-border-primary-light disabled:border-border-quaternary-light disabled:bg-transparent disabled:text-text-quaternary-light disabled:placeholder:text-text-quaternary-light dark:border-border-quaternary-dark dark:bg-fill-surfaceBright-dark dark:text-text-primary-dark dark:placeholder:text-text-tertiary-dark dark:focus-within:border-border-primary-dark dark:hover:border-border-tertiary-dark dark:hover:focus-within:border-border-primary-dark dark:focus:border-border-primary-dark dark:disabled:border-border-quaternary-dark dark:disabled:bg-transparent dark:disabled:text-text-quaternary-dark dark:disabled:placeholder:text-text-quaternary-dark"
      type="number"
      :min="min"
      :max="max"
      data-blur="without-focus"
      :value="value"
      :disabled="isDisabled"
      @input="handleValueChange(($event.target as HTMLInputElement).valueAsNumber, true)"
    />
    <base-button class="!p-[6px]" theme="default" size="medium" :disabled="isDisabled || isAddDisabled" @click="handleValueChange(value + 1)">
      <icon name="add" width="20" height="20" />
    </base-button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from './base/button.vue'
import Icon from 'client/components/icon/icon.vue'

const props = withDefaults(
  defineProps<{
    value: number
    isDisabled: boolean
    min?: number
    max?: number
  }>(),
  {
    min: 1,
    max: 9999,
  },
)

const emits = defineEmits<{
  (event: 'update:value', value: number, manualInput: boolean): void
}>()

const isAddDisabled = computed(() => props.value >= props.max)
const isMinusDisabled = computed(() => props.value <= props.min)

const handleValueChange = async (newValue: number, manualInput = false) => {
  newValue = Number.isInteger(newValue) ? Math.min(Math.max(newValue, props.min), props.max) : props.min
  emits('update:value', newValue, manualInput)
}
</script>

<style scoped lang="less">
.new-number-input {
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
}
</style>
