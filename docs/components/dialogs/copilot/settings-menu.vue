<template>
  <fw-menu-popover :menu-items="menuItems" :menu-name="$T('Settings')">
    <template #trigger>
      <button
        class="flex flex-row items-center gap-1 rounded px-2 py-1.5 text-text-primary-light hover:bg-transparent-dark-1 active:bg-mask-overlay-m-light dark:text-icon-primary-dark dark:hover:bg-transparent-white-1 dark:active:bg-mask-overlay-m-dark"
      >
        <fw-icon :name="'setting'" :width="20" :height="20" />
        <span class="font-NeverMind-UI text-mobile-body-large sm:text-desktop-body-large">{{ $T('Settings') }}</span>
        <fw-icon :name="'chevron-downward'" width="12" height="12" />
      </button>
    </template>
    <template #item-right="{ item }">
      <div class="flex flex-row items-center gap-1">
        <span class="text-desktop-body-medium text-text-primary-light dark:text-text-primary-dark">{{ item['rightText'] }}</span>
        <fw-icon name="chevron-forward" />
      </div>
    </template>
    <template #subitem-right="{ item }">
      <fw-icon v-if="item.key === model.skeletonGroupId" :name="'tick'" width="20" height="20" />
    </template>
  </fw-menu-popover>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { type MenuItem } from 'client/components/types'
import { $T } from 'client/library/translation'
import { supportSkeletonGroups, type PredefinedSkeletonGroupId } from './copilot-skeleton'
import { buildLanguageOptions, type CopilotLanguageOption } from './copilot-language'

export interface SettingsMenuModel {
  language: CopilotLanguageOption['key']
  skeletonGroupId: PredefinedSkeletonGroupId | null
}

const props = withDefaults(
  defineProps<{
    menuKeys?: Array<string>
  }>(),
  {
    menuKeys: () => ['structure', 'language'],
  },
)

const model = defineModel<SettingsMenuModel>()

const languageOptions = buildLanguageOptions()

const languageMenuItems = computed<MenuItem[]>(() => {
  return languageOptions.map(option => ({
    key: option.key,
    title: option.label,
    iconName: 'tick',
    iconClass: model.value.language === option.key ? '' : 'opacity-0',
    action: () => {
      model.value.language = option.key
    },
  }))
})

const skeletonGroupMenuItems = computed<MenuItem[]>(() => {
  return supportSkeletonGroups.value.map(group => ({
    key: group.groupId,
    title: group.label,
    iconName: group.iconName,
    rightIconName: 'tick',
    action: () => {
      model.value.skeletonGroupId = group.groupId
    },
  }))
})

const menuItems = computed<MenuItem[]>(
  () =>
    [
      {
        key: 'structure',
        title: $T('Structure'),
        iconName: supportSkeletonGroups.value.find(group => group.groupId === model.value.skeletonGroupId)?.iconName,
        rightText: supportSkeletonGroups.value.find(group => group.groupId === model.value.skeletonGroupId)?.label,
        subMenuItems: skeletonGroupMenuItems.value,
      },
      {
        key: 'language',
        title: $T('Language'),
        iconName: 'language',
        rightText: languageOptions.find(option => option.key === model.value.language)?.label,
        subMenuItems: languageMenuItems.value,
      },
    ].filter(item => props.menuKeys.includes(item.key)) as MenuItem[],
)
</script>
