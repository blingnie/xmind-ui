<template>
  <date-picker
    :model-value="dateTimestamp"
    :is-dark="isDark"
    :clearable="false"
    :is-working-day="isWorkingDay"
    :start-date="dateValue"
    :position="'bottom-center'"
    :date-display="dateDisplayFormat"
    :input-class="clsx('text-mobile-body-medium sm:text-desktop-body-medium', 'h-8 sm:h-6 w-full')"
    @change="change"
  />
</template>

<script setup lang="ts">
import { getCurrentLocale } from 'client/library/translation-helper'
import { computed } from 'vue'
import DatePicker from 'client/components/base/date-picker.vue'

defineProps<{
  isDark: boolean
  isWorkingDay?: (date: Date) => boolean
}>()
const emit = defineEmits<{
  (e: 'change', value: Date): void
}>()

const dateValue = defineModel<Date>()
const dateTimestamp = computed(() => {
  return dateValue.value?.getTime() ?? 0
})

const change = (date: Date) => {
  dateValue.value = date
  emit('change', date)
}

const dateDisplayFormat = (time: number) => {
  return new Intl.DateTimeFormat(getCurrentLocale(), { dateStyle: 'medium' }).format(time)
}
</script>
