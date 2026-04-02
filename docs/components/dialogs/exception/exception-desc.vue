<template>
  <div
    class="flex flex-col items-center gap-1 rounded border border-border-muted-light bg-fill-surface-light p-4 text-mobile-caption-1 text-text-tertiary-light dark:border-border-muted-dark dark:bg-fill-surface-dark dark:text-text-tertiary-dark sm:text-desktop-caption"
  >
    <span>
      {{ rule.type === 'WORKING_DAY' ? $T('Working Day') : $T('Day Off') }}
    </span>
    <span>{{ description }}</span>
  </div>
</template>

<script setup lang="ts">
import { type SupportedFrequency, type WorkingDayRule, formatWorkingDayRule } from '@xmindltd/gantt'
import { $T } from 'client/library/translation'
import { computed } from 'vue'
import { getCurrentGanttLocale } from 'client/library/translation-helper'

const props = defineProps<{
  rule: WorkingDayRule & { frequency: SupportedFrequency }
}>()

const description = computed(() => {
  return formatWorkingDayRule(props.rule, getCurrentGanttLocale(), $T)
})
</script>
