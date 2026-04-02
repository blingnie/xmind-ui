<script setup lang="ts">
import { computed, PropType } from 'vue'
import { $T } from 'client/library/translation'
import BaseMenuButton from 'client/components/base/menu-button.vue'
import BaseDivider from 'client/components/base/divider.vue'
import Icon from 'client/components/icon/icon.vue'
import type { IconName } from 'client/components/icon/icons'
import { TeamProfileTab } from 'client/pages/app/types'
import { type TeammatePayload, type TeamMetadata } from 'client/server-export'

const props = defineProps({
  tab: {
    type: String as PropType<TeamProfileTab>,
    required: true,
  },
  team: {
    type: Object as PropType<TeamMetadata & { role: TeammatePayload['role'] }>,
    required: true,
  },
  isMyWorks: {
    type: Boolean,
    default: false,
  },
})

defineEmits<{
  (e: 'selectTab', tab: TeamProfileTab): void
}>()

const menuList = computed<{ title: string; tab: TeamProfileTab; icon: IconName; visible: boolean }[]>(() => {
  const menus = []

  if (props.isMyWorks) {
    menus.push({
      title: $T('Settings'),
      tab: 'settings',
      icon: 'setting',
      visible: props.team.role !== 'viewer',
    })
  }

  menus.push({
    title: $T('Calendar'),
    tab: 'calendar',
    icon: 'calendar',
    visible: helpers.isManagementRole(props.team),
  })

  menus.push({
    title: $T('AI Requests'),
    tab: 'plans',
    icon: 'plan',
    visible: props.team.role !== 'viewer',
  })

  return menus
})

const dialogTitle = computed(() => {
  return props.isMyWorks ? $T('My Works') : props.team.name
})
</script>

<template>
  <div
    class="flex flex-col gap-4 px-[16px] sm:w-56 sm:items-start sm:gap-3 sm:rounded-xl sm:bg-fill-surface-light sm:px-[12px] sm:py-[16px] sm:shadow-elevation-g-light dark:sm:bg-fill-surface-dark dark:sm:shadow-elevation-g-dark"
  >
    <div
      class="flex max-w-full items-center gap-4 rounded-lg bg-fill-surface-light py-[16px] dark:bg-fill-surface-dark sm:gap-2 sm:rounded-none sm:bg-inherit sm:py-0"
    >
      <span class="inline-block truncate text-mobile-subhead-small text-text-primary-light dark:text-text-primary-dark sm:text-desktop-subhead-small">
        {{ dialogTitle }}
      </span>
    </div>

    <div class="hidden w-full flex-col items-start gap-1 sm:flex">
      <base-menu-button
        v-for="item in menuList"
        :key="item.title"
        class="h-8 self-stretch"
        :class="{ hidden: !item.visible }"
        :custom-inactive-class="'hover:bg-fill-surfaceDim-light dark:hover:bg-fill-surfaceDim-dark active:bg-fill-surfaceDark-light dark:active:bg-fill-surfaceDark-dark'"
        :custom-active-class="'bg-fill-surfaceDark-light dark:bg-fill-surfaceDark-dark'"
        :active="tab === item.tab"
        @click="$emit('selectTab', item.tab)"
      >
        <icon :name="item.icon" />
        <span class="text-desktop-body-large">{{ item.title }}</span>
      </base-menu-button>
    </div>

    <div class="flex w-full flex-col items-start rounded-lg bg-fill-surface-light dark:bg-fill-surface-dark sm:hidden">
      <template v-for="item in menuList" :key="item.title">
        <div
          class="mobile-menu-item flex items-center justify-between self-stretch p-[16px]"
          :class="{ hidden: !item.visible }"
          @click="$emit('selectTab', item.tab)"
        >
          <div class="flex items-center gap-2">
            <icon :name="item.icon" />
            <span class="text-mobile-body-large">{{ item.title }}</span>
          </div>
          <icon name="chevron-forward" />
        </div>
        <base-divider />
      </template>
    </div>
  </div>
</template>
