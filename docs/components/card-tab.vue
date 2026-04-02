<template>
  <div class="card-tabs flex flex-col">
    <div class="z-10 flex w-full justify-center gap-3">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        :class="{ active: tab.key === active }"
        class="tab min-w-fit cursor-pointer rounded-t-xl border-x border-t border-transparent bg-transparent-dark-1 px-[24px] py-[12px] text-[16px] font-semibold not-italic leading-6 hover:bg-transparent-dark-2"
        @click="selectTab(tab.key)"
      >
        <span>{{ tab.name }}</span>
        <slot name="afterTabName" :tab="tab"></slot>
      </div>
    </div>
    <div class="h-[1px] w-full bg-transparent-dark-3"></div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  active?: string
  tabs: { key: string; name: string }[]
}>()

const emit = defineEmits<{
  (e: 'tabSelected', v: string): void
}>()

const selectTab = (key: string) => {
  emit('tabSelected', key)
}
</script>

<style lang="less" scoped>
.card-tabs {
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  .tab {
    &.active {
      position: relative;
      bottom: -1px;
      padding-top: 11px;
      border-top-color: rgba(0, 0, 0, 0.08);
      border-right-color: rgba(0, 0, 0, 0.08);
      border-left-color: rgba(0, 0, 0, 0.08);
      background-color: #ffffff;
    }
  }
}
</style>
