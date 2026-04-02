<template>
  <div class="flex flex-col gap-1">
    <template v-for="item of items" :key="item.value">
      <slot name="before" :item="item"></slot>

      <fw-accordion
        :title="item.text"
        :btn-class="[
          'p-1 rounded-[4px]',
          item.value === activeId
            ? 'bg-mask-overlay-m-light dark:bg-mask-overlay-m-dark'
            : 'hover:bg-mask-overlay-s-light hover:dark:bg-mask-overlay-s-dark',
        ]"
        :btn-style="{
          paddingLeft: `${indent}px`,
        }"
        :disabled="!isExpandAble(item)"
        :is-disable-title-toggle="true"
        :default-expanded="isExpandAble(item)"
        @btn-click="itemClick(item)"
      >
        <template #icon>
          <span v-if="item.icon">
            <fw-icon :name="item.icon" :width="16" :height="16" />
          </span>
          <span v-else-if="!isExpandAble(item)" class="flex h-4 w-4 items-center justify-center">
            <span class="h-1 w-1 bg-icon-quaternary-light dark:bg-icon-quaternary-dark"></span>
          </span>
          <div v-else class="flex h-4 w-4 items-center justify-center">
            <fw-icon name="play-fill" :width="9" :height="9" />
          </div>
        </template>

        <template #accordion-title>
          <div class="flex items-center gap-1">
            <span :class="['truncate', item.isBold ? 'text-desktop-subhead-small' : 'text-desktop-body-large']">
              <span v-if="item.highlight" class="contents">
                <span v-for="({ text, isHighlight }, ids) in item.highlight" :key="ids" :class="{ 'bg-blue-100': isHighlight }">{{ text }}</span>
              </span>
              <span v-else>{{ item.text }}</span>
            </span>
            <span
              v-if="item?.items?.length > 0"
              class="flex h-4 w-4 items-center justify-center rounded-full bg-mask-overlay-s-light text-desktop-subhead-mini dark:bg-mask-overlay-s-dark"
              >{{ item?.items?.length }}</span
            >
          </div>
        </template>

        <div v-if="isExpandAble(item)" class="relative pt-1">
          <span
            class="pointer-events-none absolute h-[calc(100%-6px)] w-0 border-r-[1px] border-dashed border-border-quaternary-light dark:border-border-quaternary-dark"
            :style="{
              left: `${indent + 8}px`,
            }"
          ></span>
          <outline-list :items="item.items" :indent="indent + intentOfOneLevel" :active-id="activeId" @item-click="item => itemClick(item)" />
        </div>
      </fw-accordion>
    </template>
  </div>
</template>

<script lang="ts" setup>
import type { TreeListItem } from 'client/components/types'

defineOptions({
  name: 'OutlineList',
})

withDefaults(
  defineProps<{
    items: TreeListItem[]
    activeId?: string | null
    indent?: number
  }>(),
  {
    activeId: null,
    indent: 4, // base padding left
  },
)

const intentOfOneLevel = 20 // additional indent for each level
const emit = defineEmits<{
  (e: 'item-click', item: TreeListItem): void
}>()

const isExpandAble = (item: TreeListItem) => {
  return item?.items?.length > 0
}

const itemClick = (item: TreeListItem) => {
  emit('item-click', item)
}
</script>
