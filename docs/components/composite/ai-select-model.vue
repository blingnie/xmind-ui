<template>
  <fw-select
    :class="['ai-select', sizeClass, modelColorClass]"
    :trigger-classes="triggerClasses"
    :position="position"
    :selected-key="selectedKey"
    :options="options"
    :menu-custom-class="menuCustomClass"
    @select="handleSelect"
  >
    <template #trigger>
      <div class="ai-select-trigger flex h-full w-full items-center justify-between gap-1 rounded-lg px-1 transition-colors">
        <div class="flex min-w-0 items-center gap-1">
          <img v-if="selectedOption?.iconUrl" :src="selectedOption.iconUrl" class="h-4 w-4" />
          <span :class="['whitespace-nowrap', textSizeClass]">{{ selectedOption?.label }}</span>
        </div>
        <fw-icon name="chevron-downward" :width="12" :height="12" class="shrink-0" />
      </div>
    </template>
    <template #icon>
      <span class="hidden"></span>
    </template>
    <template #optionItem="{ option, emit }">
      <fw-menu-button class="h-8 justify-between" @click="emit('select', option.key)">
        <div class="flex items-center gap-2">
          <img v-if="option.iconUrl" :src="option.iconUrl" class="h-5 w-5 shrink-0" />
          <span class="text-mobile-body-medium sm:text-desktop-body-medium truncate">{{ option.label }}</span>
        </div>
        <fw-icon :class="[option.key === selectedKey ? 'visible' : 'invisible']" name="tick" :width="16" :height="16" />
      </fw-menu-button>
    </template>
  </fw-select>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PopoverPosition } from '../types'
import clsx from 'clsx'

export type AiSelectSize = 'default' | 'small'

export interface AiSelectOption {
  key: string
  label: string
  iconUrl: string
}

const props = withDefaults(
  defineProps<{
    selectedKey: string
    options: AiSelectOption[]
    position?: PopoverPosition
    menuCustomClass?: string
    size?: AiSelectSize
  }>(),
  {
    position: 'bottom-left',
    menuCustomClass: 'w-[190px]',
    size: 'default',
  },
)

const emit = defineEmits<{
  (e: 'select', key: string): void
}>()

const selectedOption = computed(() => props.options.find(option => option.key === props.selectedKey))

const sizeClass = computed(() => (props.size === 'small' ? 'ai-select-small' : 'ai-select-default'))

const textSizeClass = computed(() => (props.size === 'small' ? 'text-desktop-body-medium' : 'text-desktop-body-large sm:text-desktop-body-medium'))

const modelColorClass = computed(() => `ai-select-${props.selectedKey}`)

const triggerClasses = computed(() =>
  clsx(
    '!rounded-lg !border-0 !p-0 !justify-start !bg-transparent',
    'hover:!bg-transparent active:!bg-transparent',
    props.size === 'small' && '!h-[28px]',
  ),
)

const handleSelect = (key: string) => emit('select', key)
</script>

<style scoped>
.ai-select-default {
  @apply w-[130px];
}

.ai-select-small {
  @apply w-[124px];
}

/* Seedream */
.ai-select-seedream .ai-select-trigger {
  color: rgba(93, 152, 255, 1);
  background-color: rgba(127, 150, 223, 0.16) !important;
}

.ai-select-seedream .ai-select-trigger:hover,
.ai-select-seedream button.active .ai-select-trigger {
  background-color: rgba(127, 150, 223, 0.24) !important;
}

/* Nano Banana */
.ai-select-nano-banana .ai-select-trigger {
  color: rgba(213, 160, 37, 1);
  background-color: rgba(222, 208, 53, 0.16) !important;
}

.ai-select-nano-banana .ai-select-trigger:hover,
.ai-select-nano-banana button.active .ai-select-trigger {
  background-color: rgba(222, 208, 53, 0.3) !important;
}

/* GPT Image */
.ai-select-gpt-image .ai-select-trigger {
  color: rgba(182, 153, 95, 1);
  background-color: rgba(182, 153, 95, 0.2) !important;
}

.ai-select-gpt-image .ai-select-trigger:hover,
.ai-select-gpt-image button.active .ai-select-trigger {
  background-color: rgba(182, 153, 95, 0.3) !important;
}

/* Wan Xiang */
.ai-select-wan .ai-select-trigger {
  color: rgba(115, 99, 255, 1);
  background-color: rgba(134, 118, 255, 0.16) !important;
}

.ai-select-wan .ai-select-trigger:hover,
.ai-select-wan button.active .ai-select-trigger {
  background-color: rgba(134, 118, 255, 0.3) !important;
}
</style>
