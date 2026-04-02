<template>
  <div :class="twMerge('flex flex-col', props.class)">
    <div
      :class="twMerge('flex shrink-0 items-center gap-1', disabled || isDisableTitleToggle ? 'cursor-default' : 'cursor-pointer', btnClass)"
      :style="btnStyle"
      @click="btnClick"
    >
      <div
        class="transition-transform"
        :class="twMerge({ 'rotate-90': isExpanded }, !disabled && 'cursor-pointer', iconBoxClass)"
        @click.stop.prevent="toggle"
      >
        <slot name="icon">
          <icon name="play-fill" :width="12" :height="12" />
        </slot>
      </div>
      <slot name="accordion-title" :title="title">
        <div :class="clsx('text-mobile-subhead-mini sm:text-desktop-subhead-mini', isDisableTitleToggle ? 'pointer-events-none' : 'cursor-pointer')">
          {{ title }}
        </div>
      </slot>
    </div>

    <div v-if="isExpanded" :class="contentClass">
      <slot></slot>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, type StyleValue } from 'vue'
import icon from 'components/icon/icon.vue'

const props = defineProps<{
  title: string
  class?: string
  contentClass?: VueClass
  btnClass?: VueClass
  btnStyle?: StyleValue
  iconBoxClass?: VueClass
  defaultExpanded?: boolean
  disabled?: boolean
  isDisableTitleToggle?: boolean
}>()

const emit = defineEmits<{
  (e: 'btn-click'): void
}>()

const isExpanded = ref(!!props.defaultExpanded)

const toggle = () => {
  if (!props.disabled) {
    isExpanded.value = !isExpanded.value
  }
}

const btnClick = () => {
  emit('btn-click')
  if (!props.disabled && !props.isDisableTitleToggle) {
    isExpanded.value = !isExpanded.value
  }
}
</script>
