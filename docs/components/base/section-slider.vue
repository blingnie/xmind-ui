<template>
  <div ref="sectionContainerRef" :class="twMerge('relative h-full w-full', props.class)">
    <div class="absolute flex h-full" :class="[`gap-[${gap}px]`]">
      <section
        class="flex h-full flex-row-reverse duration-300 ease-in-out"
        :class="[isContainerOnResizing ? 'transition-none' : 'transition-all']"
        :style="{
          width: leftPartWidth + 'px',
        }"
      >
        <div class="absolute flex h-full flex-row-reverse" :class="[`gap-[${gap}px]`]">
          <!-- editor section -->
          <section
            class="relative flex h-full flex-shrink-0 duration-300 ease-in-out"
            :class="[isContainerOnResizing ? 'transition-none' : 'transition-all']"
            :style="{
              width: middleSectionWidth + 'px',
            }"
          >
            <slot name="middle">
              <div></div>
            </slot>
          </section>
          <!-- left panel section -->
          <section
            v-if="$slots['left']"
            ref="leftPanelRef"
            class="h-full transition-all duration-200 ease-linear"
            :class="[isShowLeftPanel ? 'opacity-100' : 'opacity-0']"
          >
            <slot name="left">
              <div></div>
            </slot>
          </section>
        </div>
      </section>

      <!-- right panel section -->
      <section
        v-if="$slots['right']"
        ref="rightPanelRef"
        class="h-full transition-all duration-200 ease-linear"
        :class="[isShowRightPanel ? 'opacity-100' : 'opacity-0']"
      >
        <slot name="right">
          <div></div>
        </slot>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useElementSize, useResizeObserver } from '@vueuse/core'
import { debounce } from 'lodash'

const props = withDefaults(
  defineProps<{
    gap?: number
    class?: VueClass
    isShowRightPanel?: boolean
    isShowLeftPanel?: boolean
  }>(),
  {
    gap: 12,
    class: '',
    isShowRightPanel: false,
    isShowLeftPanel: false,
  },
)

const sectionContainerRef = ref<HTMLElement | null>(null)
const leftPanelRef = ref<HTMLElement | null>(null)
const rightPanelRef = ref<HTMLElement | null>(null)
const sectionContainerWidth = ref(0)
const { width: leftPanelWidth } = useElementSize(leftPanelRef)
const { width: rightPanelWidth } = useElementSize(rightPanelRef)

const leftPartWidth = computed(() => {
  if (!sectionContainerWidth.value) return 0
  const rightPanelWidthValue = rightPanelWidth.value ? rightPanelWidth.value + props.gap : 0
  return sectionContainerWidth.value - (props.isShowRightPanel ? rightPanelWidthValue : 0)
})
const middleSectionWidth = computed(() => {
  if (!sectionContainerWidth.value) return 0
  const leftPanelWidthValue = leftPanelWidth.value ? leftPanelWidth.value + props.gap : 0
  return leftPartWidth.value - (props.isShowLeftPanel ? leftPanelWidthValue : 0)
})

const isContainerOnResizing = ref(false)
const debounceReleaseIsContainerOnResizing = debounce(() => (isContainerOnResizing.value = false), 200)
useResizeObserver(sectionContainerRef, entries => {
  const entry = entries[0]
  const { width: newWidth } = entry.contentRect
  sectionContainerWidth.value = newWidth
  isContainerOnResizing.value = true
  debounceReleaseIsContainerOnResizing()
})
</script>
