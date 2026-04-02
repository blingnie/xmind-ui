<template>
  <div
    :class="
      twMerge(
        'fw-tabs flex h-10 w-full gap-4',
        activeMode === 'underline' && 'active-underline',
        activeMode === 'background' && 'active-background',
        props.class,
      )
    "
  >
    <div
      v-for="tab in tabs"
      ref="tabRefs"
      :key="tab.key"
      :class="
        twMerge(
          'fw-tab',
          tab.key === active && 'active',
          tab.disabled && 'pointer-events-none !text-text-quaternary-light dark:!text-text-quaternary-dark',
          itemClass,
        )
      "
      @click="selectTab(tab.key)"
    >
      <slot name="tab-item" :tab="tab">
        <svg-image v-if="tab.svg" :source="tab.svg" />
        <icon v-else-if="tab.icon" :name="tab.icon" />
        <span class="max-w-32 truncate">{{ tab.name }}</span>
        <slot name="afterTabName" :tab="tab"></slot>
      </slot>
    </div>
  </div>
</template>

<script lang="ts" setup generic="T extends { key: string; name: string; icon?: IconName; disabled?: boolean; svg?: string }">
import { ref } from 'vue'
import type { IconName } from '../icon/icons'
import Icon from '../icon/icon.vue'
import SvgImage from './svg-image.vue'

const props = withDefaults(
  defineProps<{
    active: T['key']
    tabs: T[]
    activeMode?: 'underline' | 'background'
    class?: VueClass
    itemClass?: string
  }>(),
  {
    activeMode: 'underline',
    class: '',
    itemClass: '',
  },
)

const tabRefs = ref<HTMLElement[]>([])

const emit = defineEmits<{
  (e: 'tabSelected', v: T['key']): void
}>()

const selectTab = (key: T['key']) => {
  emit('tabSelected', key)
}

const scrollToTab = (key: T['key']) => {
  const index = props.tabs.findIndex(t => t.key === key)
  tabRefs.value?.[index]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

defineExpose({
  scrollToTab,
})
</script>

<style scoped>
.fw-tabs {
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

.fw-tabs.active-underline .fw-tab {
  @apply relative flex min-w-fit cursor-pointer items-center text-mobile-body-large text-text-secondary-light transition-colors dark:text-text-secondary-dark sm:text-desktop-body-medium;
}
.fw-tabs.active-underline .fw-tab.active {
  @apply text-mobile-subhead-small text-text-primary-light after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-border-primary-light after:content-[''] dark:text-text-primary-dark dark:after:bg-border-primary-dark sm:text-desktop-subhead-mini;
}

.fw-tabs.active-background {
  @apply inline-flex shrink-0 items-center gap-1 p-2;
}
.fw-tabs.active-background .fw-tab {
  @apply flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-desktop-title-1;
}
.fw-tabs.active-background .fw-tab.active {
  @apply bg-transparent-dark-2 dark:bg-transparent-white-2;
}
</style>
