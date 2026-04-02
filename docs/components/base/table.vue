<template>
  <div class="flex flex-col">
    <slot name="header" :header-keys="headerKeys">
      <div class="grid w-full" :class="`grid-cols-${headerKeys.length}`">
        <div v-for="(headerKey, index) in headerKeys" :key="index">
          <span class="block text-left font-NeverMind-UI text-xs font-normal text-text-tertiary-light dark:text-text-tertiary-dark">{{
            headers[headerKey]
          }}</span>
        </div>
      </div>
    </slot>

    <template v-for="(group, groupIndex) in groups" :key="groupIndex">
      <div class="mt-6 flex w-full flex-col">
        <div class="mb-4 w-full">
          <slot name="group-caption" :group-caption="group.caption" :index="groupIndex">
            <span class="block text-left font-NeverMind-UI text-xs font-normal text-text-tertiary-light dark:text-text-tertiary-dark">{{
              group.caption
            }}</span>
          </slot>
        </div>
        <div class="flex w-full flex-col">
          <template v-for="item in group.items" :key="item._id">
            <slot name="row" :item="item">
              <div class="grid" :class="`grid-cols-${headerKeys.length}`">
                <span
                  v-for="headerKey in headerKeys"
                  :key="headerKey"
                  class="block text-left font-NeverMind-UI text-xs font-normal text-text-tertiary-light dark:text-text-tertiary-dark"
                >
                  {{ item[headerKey] }}
                </span>
              </div>
            </slot>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts" generic="T extends { _id: string }">
import { computed } from 'vue'

type key = Exclude<keyof T, '_id'>
const props = defineProps<{
  headers: Record<key, string> // also the number of columns
  groups: { caption: string; items: T[] }[]
}>()

const headerKeys = computed(() => Object.keys(props.headers).filter(h => h !== '_id') as key[])
</script>
