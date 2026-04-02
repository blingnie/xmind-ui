<template>
  <fw-select
    :trigger-size="isPhoneSizeViewportWidth ? 'medium' : 'small'"
    :trigger-classes="'!text-desktop-body-medium'"
    :selected-key="value"
    :disabled="disabled"
    :options="repeatItems"
    @select="select"
  ></fw-select>
</template>

<script setup lang="ts">
import { type SupportedFrequency, formatDayOfMonthOrdinal } from '@xmindltd/gantt'
import { useWindowResize } from 'client/composables/window-resize'
import { $T } from 'client/library/translation'
import { getCurrentLocale } from 'client/library/translation-helper'
import { computed } from 'vue'

const { isPhoneSizeViewportWidth } = useWindowResize()

const props = defineProps<{
  value: SupportedFrequency
  disabled?: boolean
  selectedDate: Date | null
}>()

const emit = defineEmits<{
  change: [value: SupportedFrequency]
}>()

const select = (value: SupportedFrequency) => {
  emit('change', value)
}

const getWeekdayLabel = (date: Date): string => {
  return new Intl.DateTimeFormat(getCurrentLocale(), { weekday: 'long' }).format(date)
}
const repeatItems = computed<{ key: SupportedFrequency; label: string }[]>(() => [
  { key: 'NONE', label: $T('None') },
  { key: 'DAILY', label: $T('Daily') },
  {
    key: 'WEEKLY',
    label: props.selectedDate ? $T('Weekly ($1)', getWeekdayLabel(props.selectedDate)) : $T('Weekly'),
  },
  {
    key: 'MONTHLY_BY_DATE',
    label: props.selectedDate ? $T('Monthly ($1)', formatDayOfMonthOrdinal(props.selectedDate.getDate())) : $T('Monthly'),
  },
  { key: 'YEARLY', label: $T('Yearly') },
])
</script>
