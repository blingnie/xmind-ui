<template>
  <div class="flex h-full w-full flex-col">
    <div class="w-full px-[16px] py-[16px] sm:px-[32px]"><header-skeleton-animation /></div>
    <fw-divider />
    <div
      v-if="layoutMode === 'grid'"
      class="grid w-full p-[16px] sm:p-[32px]"
      :class="[gridGapClasses]"
      :style="{ 'grid-template-columns': gridTemplateColumns }"
    >
      <grid-item-skeleton-animation v-for="(_, index) of Array.from({ length: count })" :key="index" />
    </div>
    <div v-else class="p-[16px] sm:p-[32px]">
      <list-skeleton-animation :rows="12" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import HeaderSkeletonAnimation from 'client/components/skeleton-animation/panel-header-skeleton-animation.vue'
import GridItemSkeletonAnimation from 'client/components/skeleton-animation/new-file-grid-item-skeleton-animation.vue'
import ListSkeletonAnimation from 'client/components/skeleton-animation/list-skeleton-animation.vue'
import { computed, ref } from 'vue'
import type { GridSize } from 'app/composables/grid-view-size'
import { getHomeLocalData } from 'app/fragments/router-views/new-home/local-data'

const props = withDefaults(
  defineProps<{
    size?: GridSize
    count?: number
  }>(),
  {
    size: 'large',
    count: 12,
  },
)

const initLocalData = getHomeLocalData()
const layoutMode = ref<'list' | 'grid'>(initLocalData.layoutMode ?? 'grid')

const gridTemplateColumns = computed(() => {
  switch (props.size) {
    case 'tiny':
      return 'repeat(auto-fill, minmax(150px, 1fr))'
    case 'small':
    case 'medium':
      return 'repeat(auto-fill, minmax(190px, 1fr))'
    case 'xxlarge':
      return 'repeat(auto-fill, minmax(250px, 1fr))'
    case 'large':
    case 'xlarge':
    default:
      return 'repeat(auto-fill, minmax(210px, 1fr))'
  }
})

const gridGapClasses = computed(() => {
  switch (props.size) {
    case 'tiny':
    case 'small':
      return 'gap-3'
    case 'medium':
      return 'gap-4'
    case 'large':
    case 'xlarge':
    case 'xxlarge':
    default:
      return 'gap-8'
  }
})
</script>
