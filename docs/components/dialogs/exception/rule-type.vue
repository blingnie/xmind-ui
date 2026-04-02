<template>
  <fw-select
    :trigger-size="isPhoneSizeViewportWidth ? 'medium' : 'small'"
    :selected-key="type"
    :options="ruleTypes"
    :disabled="disabled"
    :trigger-classes="'!text-desktop-body-medium'"
    @select="select"
  />
</template>

<script setup lang="ts">
import type { WorkingDayRule } from '@xmindltd/gantt'
import { useWindowResize } from 'client/composables/window-resize'
import { $T } from 'client/library/translation'

defineProps<{
  type: WorkingDayRule['type'] | null
  disabled?: boolean
}>()
const emit = defineEmits<{
  (e: 'change', value: WorkingDayRule['type']): void
}>()

const { isPhoneSizeViewportWidth } = useWindowResize()
const ruleTypes = [
  {
    key: 'WORKING_DAY',
    label: $T('Working Day'),
  },
  {
    key: 'NON_WORKING_DAY',
    label: $T('Day off'),
  },
]
const select = (value: WorkingDayRule['type']) => {
  emit('change', value)
}
</script>
