<template>
  <div
    :class="
      twMerge(
        'flex items-center rounded-full bg-mask-overlay-m-light p-[4px] dark:bg-mask-overlay-m-dark',
        disabled ? 'pointer-events-none' : '',
        props.class,
      )
    "
  >
    <icon
      class="shrink-0"
      :class="[
        forceLightMode ? 'text-icon-secondary-light' : 'text-icon-secondary-light dark:text-icon-secondary-dark',
        disabled ? 'opacity-50' : '',
      ]"
      :name="iconName"
    />
  </div>
</template>

<script setup lang="ts">
import Icon from 'client/components/icon/icon.vue'
import type { IconName } from 'client/components/icon/icons'

const props = defineProps<{
  disabled?: boolean
  forceLightMode?: boolean
  iconName: IconName
  class?: VueClass
}>()
</script>
