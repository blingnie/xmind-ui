<template>
  <div class="" :class="twMerge('flex items-center justify-center', props.class, customClass)">
    <span class="" :class="twMerge('text-desktop-caption', textClass)">{{ props.label }}</span>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  label: string
  class?: VueClass
  customClass?: VueClass
  textClass?: VueClass
}>()
</script>
