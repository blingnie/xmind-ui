<template>
  <base-popover v-model="isPopoverOpen" :position="position">
    <template #trigger="{ isActive }">
      <base-input
        :key="modelValue"
        :model-value="dateString"
        :placeholder="placeholder"
        :class="twMerge('h-6 text-desktop-body-medium text-text-quaternary-light dark:text-text-quaternary-dark', inputClass)"
        :size="'small'"
        :disabled="disabled"
        :is-read-only="true"
        :custom-input-class="'cursor-pointer'"
        :disable-clear-icon="!clearable || !modelValue"
        :type="'text'"
        @clear="handleClear"
      >
        <template #clear-icon="{ disabled: isDisabled }">
          <fw-tooltip :disabled="!clearTooltip" :trigger-on-click="true">
            <fw-icon
              v-if="clearable && modelValue && !isDisabled"
              name="xmark-fill"
              :width="16"
              :height="16"
              class="shrink-0 cursor-pointer text-icon-quaternary-light dark:text-icon-quaternary-dark"
              :class="{ visible: modelValue, invisible: !modelValue }"
              @click="handleClear"
            />

            <template #tooltip>
              <span>{{ clearTooltip }}</span>
            </template>
          </fw-tooltip>
        </template>
        <template #suffix="{ disabled }">
          <fw-icon
            name="chevron-downward"
            width="12"
            height="12"
            :class="
              clsx(
                'shrink-0 transition-transform',
                disabled ? 'text-text-quaternary-light dark:text-text-quaternary-dark' : 'text-icon-primary-light dark:text-icon-primary-dark',
                isActive && 'rotate-180',
              )
            "
          />
        </template>
      </base-input>
    </template>

    <template #content>
      <CalendarDatePicker
        :value="modelValue"
        :inline="true"
        :dark="isDark"
        :locale="getCurrentGanttLocale()"
        :disabled-dates="disabledDatesHandler"
        :is-working-day="isWorkingDay"
        @change="handleDateChange"
      ></CalendarDatePicker>
    </template>
  </base-popover>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { CalendarDatePicker } from '@xmindltd/gantt'
import '@xmindltd/gantt/calendar.css'
import BasePopover from 'components/base/popover.vue'
import BaseInput from 'components/base/input.vue'
import { $T } from 'client/library/translation'
import { getCurrentGanttLocale } from 'client/library/translation-helper'
import { PopoverPosition } from '../types'

const props = withDefaults(
  defineProps<{
    modelValue?: number
    isDark?: boolean
    maxDate?: Date | null
    minDate?: Date | null
    startDate?: Date | null
    dateDisplay?: (time: number) => string
    disabledDates?: (date: Date) => boolean
    isWorkingDay?: (date: Date) => boolean
    inputClass?: VueClass
    placeholder?: string
    disabled?: boolean
    clearable?: boolean
    position?: PopoverPosition
    clearTooltip?: string
  }>(),
  {
    modelValue: undefined,
    isDark: false,
    maxDate: null,
    minDate: null,
    startDate: null,
    dateDisplay: (time: number) => new Date(time).toLocaleDateString(),
    disabledDates: undefined,
    isWorkingDay: undefined,
    inputClass: '',
    placeholder: $T('Choose a Date'),
    disabled: false,
    clearable: true,
    clearTooltip: undefined,
  },
)

const emits = defineEmits<{
  (event: 'blur'): void
  (event: 'change', date: Date | undefined): void
  (event: 'clear'): void
}>()

const isPopoverOpen = ref(false)

const dateString = computed(() => {
  if (!props.modelValue) return ''
  return props.dateDisplay(props.modelValue)
})

const startOfDay = (timestamp: number): number => {
  const date = new Date(timestamp)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

const disabledDatesHandler = (date: Date): boolean => {
  if (props.disabledDates) {
    return props.disabledDates(date)
  }

  const dateTime = startOfDay(date.getTime())

  if (props.minDate) {
    const minDateTime = startOfDay(props.minDate.getTime())
    if (dateTime < minDateTime) return true
  }

  if (props.maxDate) {
    const maxDateTime = startOfDay(props.maxDate.getTime())
    if (dateTime > maxDateTime) return true
  }

  return false
}

const handleDateChange = (date: Date | null) => {
  emits('change', date || undefined)
  isPopoverOpen.value = false
}

const handleClear = () => {
  emits('clear')
}
</script>

<style scoped></style>
