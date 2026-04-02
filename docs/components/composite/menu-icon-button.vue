<template>
  <base-menu-button :class="twMerge('h-8', iconName && 'pl-1', $slots['right'] && 'pr-1', props.class)" :disabled="disabled">
    <div class="flex w-full items-center justify-between gap-1">
      <slot name="left"></slot>
      <div class="flex flex-1 items-center gap-2 truncate">
        <icon v-if="iconName" :width="iconSize" :height="iconSize" :name="iconName" :class="twMerge('m-[2px] shrink-0', iconClass)" />
        <span class="truncate text-mobile-body-large sm:text-desktop-body-medium"
          ><slot>
            {{ name }}
          </slot></span
        >
      </div>
      <slot name="right"></slot>
    </div>
  </base-menu-button>
</template>

<script setup lang="ts">
import BaseMenuButton from 'client/components/base/menu-button.vue'
import Icon from 'client/components/icon/icon.vue'
import type { IconName } from 'client/components/icon/icons'

const props = withDefaults(
  defineProps<{
    iconName?: IconName
    iconSize?: number
    iconClass?: VueClass
    name?: string
    disabled?: boolean
    class?: VueClass
  }>(),
  {
    disabled: false,
    iconSize: undefined,
    name: '',
    iconName: undefined,
    iconClass: undefined,
    rightIconName: undefined,
    class: '',
  },
)
</script>
