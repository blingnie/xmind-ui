<template>
  <badge
    :label="label"
    :class="twMerge('pointer-events-none rounded-[3px] bg-ai-purple-100 px-1 dark:bg-[#9453F726]', props.class)"
    :text-class="twMerge('font-semibold text-[10px]  leading-[13px] text-ai-purple-500 dark:text-ai-purple-400', props.textClass)"
  ></badge>
</template>

<script lang="ts" setup>
import Badge from 'client/components/base/badge.vue'
import { $T } from 'client/library/translation'

const props = withDefaults(
  defineProps<{
    label?: string
    class?: VueClass
    textClass?: VueClass
  }>(),
  { label: $T('Lab'), class: '', textClass: '' },
)
</script>
