<template>
  <div
    :class="
      twMerge(
        'flex overflow-hidden rounded-[4px] border border-border-muted-light dark:border-border-muted-dark',
        !disabled && 'hover:border-border-quaternary-light dark:border-border-quaternary-dark',
        !disabled && active && 'border-border-quaternary-light dark:border-border-quaternary-dark',
        props.class,
      )
    "
  >
    <div
      v-for="item of items"
      :key="item.key"
      :style="{
        width: `${100 / (cols || items.length)}%`,
      }"
      :class="
        twMerge(
          'h-6 cursor-pointer ',
          activeKeys.includes(item.key)
            ? itemDisabled(item)
              ? 'bg-mask-overlay-s-light dark:bg-mask-overlay-s-dark'
              : 'bg-mask-overlay-m-light dark:bg-mask-overlay-m-dark'
            : !itemDisabled(item)
              ? 'bg-fill-surfaceBright-light hover:bg-mask-overlay-s-light dark:bg-fill-surfaceBright-dark dark:hover:bg-mask-overlay-s-dark'
              : 'bg-transparent',
          itemDisabled(item) && 'pointer-events-none cursor-not-allowed',
          itemClass,
        )
      "
      @click="handleItemClick(item)"
    >
      <slot name="item" :item="item"> {{ item.name }}</slot>
    </div>
    <slot name="append"></slot>
  </div>
</template>

<script setup lang="ts" generic="T extends { key: string; name: string; disabled?: boolean }">
const props = defineProps<{
  activeKeys: T['key'][]
  items: T[]
  class?: VueClass
  itemClass?: string
  disabled?: boolean
  active?: boolean
  cols?: number
}>()

const emit = defineEmits<{
  (e: 'change', item: T): void
}>()

const itemDisabled = (item: T) => {
  return props.disabled || item.disabled
}

const handleItemClick = (item: T) => {
  emit('change', item)
}
</script>
