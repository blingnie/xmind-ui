<template>
  <div class="flex flex-row items-center gap-1">
    <span v-if="status === 'on'" class="h-1.5 w-1.5 rounded-[50%] bg-[#2F9952]"></span>
    <span v-else class="h-1.5 w-1.5 rounded-[50%] bg-[#9EA3A8]"></span>
    <span
      class="font-NeverMind-UI text-[15px] font-bold leading-[19px] text-text-primary-light dark:text-text-tertiary-dark sm:text-[13px] sm:leading-[17px]"
      >{{ status == 'on' ? $T('On') : $T('Off') }}</span
    >
  </div>
</template>

<script lang="ts" setup>
import { $T } from 'client/library/translation'

defineProps<{
  status: 'on' | 'off'
}>()
</script>
