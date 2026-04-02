<template>
  <span
    :class="
      twMerge(
        'block h-8 w-8 overflow-hidden rounded-full border border-dashed border-border-translucent-light bg-fill-surfaceDark-light dark:border-border-translucent-dark dark:bg-fill-surfaceDark-dark ',
        props.class,
      )
    "
  >
    <Person-fill-svg class="size-full translate-y-[13%] scale-105 text-icon-quaternary-light dark:text-icon-quaternary-dark" />
  </span>
</template>

<script setup lang="ts">
import PersonFillSvg from 'client/components/icon/fw-icons/person-fill.svg'

const props = defineProps<{
  class?: VueClass
}>()
</script>
