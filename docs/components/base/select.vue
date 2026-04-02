<template>
  <popover
    :offset-x="offsetX"
    :offset-y="offsetY"
    :close-on-click-outside="closeOnClickOutside"
    :close-on-click-inside-selector="closeOnClickInsideSelector"
    :position="position"
    :popover-width-match-trigger="menuWidthMatchTrigger"
    :teleport-target="teleportTarget"
    :is-follow-trigger="isFollowTrigger"
    :close-on-esc="closeOnEsc"
  >
    <template #trigger>
      <button class="group max-w-full" type="button" tabindex="-1" :class="twMerge([classString, triggerClasses])" :disabled="disabled">
        <slot name="trigger">
          <span class="truncate group-disabled:text-text-quaternary-light dark:group-disabled:text-text-quaternary-dark">
            <slot name="selectedLabel">
              {{ selectedLabel }}
            </slot>
          </span>
        </slot>
        <slot name="icon">
          <icon
            name="chevron-downward"
            width="12"
            height="12"
            class="shrink-0 group-disabled:text-text-quaternary-light dark:group-disabled:text-text-quaternary-dark"
          />
        </slot>
      </button>
    </template>
    <template #content>
      <div
        v-bind="containerProps"
        :class="twMerge('w-56 rounded-lg bg-material-acrylic-light p-[8px] dark:bg-material-acrylic-dark', menuCustomClass)"
        :style="menuCustomStyle"
      >
        <div class="flex flex-col gap-1" v-bind="wrapperProps">
          <slot name="option-header"></slot>
          <template v-if="isUseVirtualizedList">
            <div v-for="{ index, data: option } in virtualizedOptions" :key="index" class="contents">
              <slot name="optionItem" :option="option" :emit="$emit">
                <base-divider v-if="option.key === 'separator'" class="shrink-0"></base-divider>
                <base-menu-button v-else class="h-8 justify-between" @click="$emit('select', option.key)">
                  <div class="flex items-center gap-2">
                    <icon v-if="showTick" :class="[option.key === selectedKey ? 'visible' : 'invisible']" name="tick" :width="16" :height="16" />
                    <span class="truncate text-mobile-body-large sm:text-desktop-body-medium">{{ option.label }}</span>
                  </div>
                  <icon v-if="option.icon" :name="option.icon" class="shrink-0" height="14" width="14" />
                </base-menu-button>
              </slot>
            </div>
          </template>
          <template v-else>
            <div v-for="(option, index) in options" :key="index" class="contents">
              <slot name="optionItem" :option="option" :emit="$emit">
                <base-divider v-if="option.key === 'separator'" class="shrink-0"></base-divider>
                <base-menu-button v-else class="h-8 justify-between" @click="$emit('select', option.key)">
                  <div class="flex items-center gap-2">
                    <icon v-if="showTick" :class="[option.key === selectedKey ? 'visible' : 'invisible']" name="tick" :width="16" :height="16" />
                    <span class="truncate text-mobile-body-medium sm:text-desktop-body-medium">{{ option.label }}</span>
                  </div>
                  <icon v-if="option.icon" :name="option.icon" class="shrink-0" height="14" width="14" />
                </base-menu-button>
              </slot>
            </div>
          </template>
        </div>
      </div>
    </template>
  </popover>
</template>

<script setup lang="ts" generic="T extends { key: string | 'separator'; label: string; icon?: IconName }">
import { computed, type StyleValue, toRef } from 'vue'
import Popover from './popover.vue'
import BaseMenuButton from './menu-button.vue'
import BaseDivider from './divider.vue'
import Icon from '../icon/icon.vue'
import type { IconName } from '../icon/icons'
import { useVirtualList } from '@vueuse/core'
import type { PopoverPosition } from '../types'

const props = withDefaults(
  defineProps<{
    selectedKey?: T['key'] | '' | string
    options: T[]
    closeOnClickOutside?: boolean
    closeOnClickInsideSelector?: string
    position?: PopoverPosition
    offsetX?: number
    offsetY?: number
    disabled?: boolean
    triggerSize?: 'large' | 'medium' | 'small'
    menuWidthMatchTrigger?: boolean
    theme?: 'text-dim' | 'muted'
    menuCustomClass?: VueClass
    menuCustomStyle?: StyleValue
    triggerCustomClass?: string
    triggerClasses?: string
    menuItemHeight?: number
    isUseVirtualizedList?: boolean
    teleportTarget?: string | Element
    showTick?: boolean
    isFollowTrigger?: boolean
    closeOnEsc?: boolean
  }>(),
  {
    selectedKey: '',
    offsetX: 0,
    offsetY: 8,
    closeOnClickOutside: true,
    closeOnClickInsideSelector: 'button',
    position: 'bottom-right',
    triggerSize: 'medium',
    disabled: false,
    menuCustomClass: '',
    menuCustomStyle: '',
    triggerCustomClass: '',
    menuWidthMatchTrigger: false,
    theme: 'text-dim',
    menuItemHeight: 28,
    isUseVirtualizedList: false,
    triggerClasses: '',
    teleportTarget: 'body',
    showTick: true,
    isFollowTrigger: false,
    closeOnEsc: false,
  },
)

defineEmits<{
  (e: 'select', key: T['key']): void
}>()

let virtualizedOptions
let containerProps
let wrapperProps

const optionsRef = toRef(() => props.options)

if (props.isUseVirtualizedList) {
  const virtualizedProps = useVirtualList(optionsRef, { itemHeight: props.menuItemHeight + 4 - 4 / props.options.length, overscan: 5 })
  virtualizedOptions = virtualizedProps.list
  containerProps = virtualizedProps.containerProps
  wrapperProps = virtualizedProps.wrapperProps
}

const selectedLabel = computed(() => {
  const selectedOption = props.options.find(option => option.key === props.selectedKey)
  return selectedOption ? selectedOption.label : ''
})

const classString = computed(() => {
  return [props.triggerCustomClass, `base-select-${props.theme}`, `base-select-${props.triggerSize}`]
})
</script>

<style scoped>
.base-select-text-dim {
  @apply flex w-full items-center justify-between gap-2 rounded border border-border-quaternary-light bg-fill-surfaceBright-light pl-[8px] pr-[4px] text-mobile-body-medium hover:border-border-tertiary-light active:border-border-tertiary-light active:bg-mask-overlay-s-light disabled:border-border-quaternary-light disabled:bg-transparent dark:border-border-quaternary-dark dark:bg-fill-surfaceBright-dark dark:hover:border-border-tertiary-light dark:active:border-border-tertiary-dark dark:active:bg-mask-overlay-s-dark dark:disabled:border-border-quaternary-dark dark:disabled:bg-transparent sm:text-desktop-body-medium [&.active]:border-border-tertiary-light [&.active]:bg-mask-overlay-s-light dark:[&.active]:border-border-tertiary-dark dark:[&.active]:bg-mask-overlay-s-dark;
}
.base-select-text-dim.base-select-small {
  @apply h-6;
}
.base-select-text-dim.base-select-medium {
  @apply h-8;
}
.base-select-text-dim.base-select-large {
  @apply h-10;
}

.base-select-muted {
  @apply flex items-center gap-1 rounded px-[8px] py-[4px] text-mobile-body-large transition-colors hover:bg-mask-overlay-s-light active:bg-mask-overlay-deep-light disabled:bg-transparent dark:hover:bg-mask-overlay-s-dark dark:active:bg-mask-overlay-deep-dark sm:text-desktop-body-small [&.active]:bg-mask-overlay-deep-light dark:[&.active]:bg-mask-overlay-deep-dark;
}
</style>
