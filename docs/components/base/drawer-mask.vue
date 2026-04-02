<template>
  <div
    :class="twMerge('fixed bottom-0 left-0 right-0 top-0 bg-mask-background-default-light dark:bg-mask-background-default-dark', clsx(props.class))"
  ></div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  class?: VueClass
}>()
</script>
