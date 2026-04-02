<template>
  <div class="flex h-[148px] items-center gap-1 text-text-tertiary-light">
    <fw-icon v-if="statusIcon === 'loading'" :name="statusIcon" class="animate-spin" width="20" height="20" color="currentColor" />
    <fw-icon v-else :name="statusIcon" width="20" height="20" color="currentColor" />
    <div class="font-NeverMind-UI text-[15px] font-semibold leading-[17px] sm:text-[13px]">{{ title }}</div>
  </div>
</template>
<script setup lang="ts">
import { type IconName } from 'client/components/icon/icons'

defineProps<{
  statusIcon: IconName
  title: string
}>()
</script>
