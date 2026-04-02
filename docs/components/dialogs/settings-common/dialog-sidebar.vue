<script setup lang="ts" generic="T extends string">
import TileBtn from 'client/components/composite/tile-button.vue'
import type { IconName } from 'client/components/icon/icons'

const _ = defineProps<{
  tab: T
  menuList: { title: string; tab: T; icon: IconName; visible: boolean; rightBtnIcon?: IconName; rightBtnHandler?: () => void }[]
  dialogTitle: string
}>()

defineEmits<{
  (e: 'selectTab', tab: T): void
}>()
</script>

<template>
  <div
    class="flex flex-col gap-4 px-[16px] sm:w-56 sm:items-start sm:gap-3 sm:rounded-xl sm:bg-fill-surface-light sm:px-[12px] sm:py-[16px] sm:shadow-elevation-g-light dark:sm:bg-fill-surface-dark dark:sm:shadow-elevation-g-dark"
  >
    <div
      class="flex max-w-full items-center gap-4 rounded-lg bg-fill-surface-light px-[16px] py-[16px] dark:bg-fill-surface-dark sm:gap-2 sm:rounded-none sm:bg-inherit sm:px-[8px] sm:py-0"
    >
      <div class="shrink-0 p-[2px]">
        <slot name="avatar"></slot>
      </div>
      <span class="inline-block truncate text-mobile-subhead-small text-text-primary-light dark:text-text-primary-dark sm:text-desktop-subhead-small">
        {{ dialogTitle }}
      </span>
    </div>

    <div class="hidden w-full flex-col items-start gap-1 sm:flex">
      <fw-menu-button
        v-for="item in menuList"
        :key="item.title"
        class="group h-8 self-stretch"
        :class="{ hidden: !item.visible }"
        :custom-inactive-class="'hover:bg-fill-surfaceDim-light dark:hover:bg-fill-surfaceDim-dark active:bg-fill-surfaceDark-light dark:active:bg-fill-surfaceDark-dark'"
        :custom-active-class="'bg-fill-surfaceDark-light dark:bg-fill-surfaceDark-dark'"
        :active="tab === item.tab"
        @click="$emit('selectTab', item.tab)"
      >
        <fw-icon :name="item.icon" />
        <span class="text-desktop-body-large">{{ item.title }}</span>
        <div v-if="item.rightBtnIcon" class="flex h-full flex-1 items-center justify-end">
          <tile-btn size="small" class="invisible !p-[2px] group-hover:visible" :icon-name="item.rightBtnIcon" @click.stop="item.rightBtnHandler" />
        </div>
      </fw-menu-button>
    </div>

    <div class="flex w-full flex-col items-start rounded-lg bg-fill-surface-light dark:bg-fill-surface-dark sm:hidden">
      <template v-for="(item, index) in menuList" :key="item.title">
        <div
          class="mobile-menu-item flex items-center justify-between self-stretch p-[16px]"
          :class="{ hidden: !item.visible }"
          @click="$emit('selectTab', item.tab)"
        >
          <div class="flex items-center gap-2">
            <fw-icon :name="item.icon" />
            <span class="text-mobile-body-large">{{ item.title }}</span>
          </div>
          <fw-icon name="chevron-forward" class="text-icon-tertiary-light dark:text-icon-tertiary-dark" />
        </div>
        <fw-divider v-if="index !== menuList.length - 1" class="!w-[calc(100%-16px)] self-end" />
      </template>
    </div>
  </div>
</template>
