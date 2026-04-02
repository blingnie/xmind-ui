<script lang="ts">
/**
 * The menu used by landing page, including plan and lang select.
 * The style should be same as xmind.cn
 */
export default {
  name: 'LandingMenu',
}
</script>

<script lang="ts" setup>
import icon from './icon/icon.vue'

defineProps<{
  selected: string
  options: Record<string, string>
}>()

defineEmits<{
  (e: 'select', value: string): void
}>()
</script>

<template>
  <div class="flex flex-col gap-[4px] rounded-[12px] bg-light-grey-1 px-[12px] py-[16px] shadow-shadow-small">
    <button
      v-for="optionKey in Object.keys(options)"
      :key="optionKey"
      class="flex cursor-pointer items-center justify-start gap-[12px] rounded-[6px] px-[12px] py-[8px] text-dark-grey-8 hover:bg-[#EAECEF]"
      @click="$emit('select', optionKey)"
    >
      <icon width="24" height="24" :class="{ invisible: optionKey !== selected }" name="tick" />

      <span class="text-desktop-body-1">{{ $T(options[optionKey]) }}</span>
    </button>
  </div>
</template>

<style lang="less" scoped></style>
