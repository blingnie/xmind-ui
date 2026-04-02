<script setup lang="ts">
import { computed } from 'vue'
import { ShortcutManager } from 'client/library/shortcut-manager'

defineOptions({
  name: 'AppShortcutTooltip',
})

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    isHideShortcut?: boolean
    shortcut?: string
    align?: 'top' | 'bottom' | 'left' | 'right'
  }>(),
  {
    title: '',
    description: '',
    isHideShortcut: false,
    shortcut: '',
    align: 'top',
  },
)

const computedShortcut = computed(() => ShortcutManager.normalizeShortcutText(props.shortcut))
</script>

<template>
  <fw-tooltip :align="align" :delay="1000">
    <template #trigger>
      <slot></slot>
    </template>
    <template #tooltip>
      <div class="flex justify-between">
        <span class="fw-text-caption">
          {{ title }}
        </span>
        <span v-if="!isHideShortcut" style="color: rgba(255, 255, 255, 0.6)" class="fw-text-caption ml-2">
          {{ computedShortcut }}
        </span>
      </div>
      <div class="uk-text-muted uk-text-small mt-1">
        {{ description }}
      </div>
    </template>
  </fw-tooltip>
</template>
