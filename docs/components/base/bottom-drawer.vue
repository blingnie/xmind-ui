<template>
  <div
    ref="bottomDrawerRef"
    :class="
      twMerge(
        'relative flex h-[420px] w-[100vw] flex-col overflow-y-auto rounded-t-3xl border border-border-panel-light bg-material-acrylic-light shadow-elevation-l4-light backdrop-blur-md dark:border-border-panel-dark dark:bg-material-acrylic-dark dark:shadow-elevation-l4-dark',
        clsx(props.class),
      )
    "
  >
    <div v-if="title" class="flex w-full items-center justify-between px-6 pb-4 pt-6">
      <span :class="titleClass">{{ title }}</span>
      <fw-close @click.prevent.stop="emit('close')" />
    </div>

    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useElementVisibility } from '@vueuse/core'
import { generateShortUUID } from 'utils/shortUUID'
import { useGlobalEvents } from 'client/store/global-events'

const props = withDefaults(
  defineProps<{
    class?: VueClass
    drawerId?: string
    title?: string
    titleClass?: VueClass
  }>(),
  {
    class: '',
    drawerId: generateShortUUID(),
    title: '',
    titleClass: 'text-mobile-headline-small',
  },
)

const emit = defineEmits<{
  (e: 'close'): void
}>()

const bottomDrawerRef = ref<HTMLElement | null>(null)

const isVisible = useElementVisibility(bottomDrawerRef)

watch(isVisible, visible => {
  if (visible) {
    useGlobalEvents().trigger<{ id: string }>('bottomDrawerRendered', {
      id: props.drawerId,
    })
  }
})
</script>
