<template>
  <DocPopover
    v-model="isOpen"
    :offset-x="offsetX"
    :offset-y="offsetY"
    :close-on-click-outside="closeOnClickOutside"
    :close-on-click-inside-selector="closeOnClickInsideSelector"
    :position="position"
    :popover-width-match-trigger="menuWidthMatchTrigger"
    :close-on-esc="closeOnEsc"
  >
    <template #trigger>
      <button
        type="button"
        :class="triggerClasses"
        :disabled="disabled"
        class="doc-select-trigger"
      >
        <span class="doc-select-label truncate">
          {{ selectedLabel }}
        </span>
        <svg class="doc-select-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </template>
    <template #content>
      <div :class="menuCustomClass" :style="menuCustomStyle" class="doc-select-menu">
        <div class="doc-select-options">
          <template v-for="(option, index) in options" :key="index">
            <div v-if="option.key === 'separator'" class="doc-select-divider"></div>
            <button
              v-else
              class="doc-select-option"
              :class="{ 'doc-select-option--selected': option.key === selectedKey }"
              @click="handleSelect(option.key)"
            >
              <span class="doc-select-option-label">{{ option.label }}</span>
              <svg
                v-if="showTick && option.key === selectedKey"
                class="doc-select-tick"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </template>
        </div>
      </div>
    </template>
  </DocPopover>
</template>

<script setup lang="ts" generic="T extends { key: string | 'separator'; label: string }">
import { computed, ref, type StyleValue } from 'vue'
import DocPopover from './DocPopover.vue'

type Position = 'bottom-left' | 'bottom-center' | 'bottom-right' | 'top-left' | 'top-center' | 'top-right'

const props = withDefaults(defineProps<{
  selectedKey?: T['key'] | '' | string
  options: T[]
  closeOnClickOutside?: boolean
  closeOnClickInsideSelector?: string
  position?: Position
  offsetX?: number
  offsetY?: number
  disabled?: boolean
  menuWidthMatchTrigger?: boolean
  menuCustomClass?: string
  menuCustomStyle?: StyleValue
  triggerClasses?: string
  showTick?: boolean
  closeOnEsc?: boolean
}>(), {
  selectedKey: '',
  offsetX: 0,
  offsetY: 8,
  closeOnClickOutside: true,
  closeOnClickInsideSelector: 'button',
  position: 'bottom-right',
  disabled: false,
  menuCustomClass: '',
  menuCustomStyle: '',
  triggerClasses: '',
  menuWidthMatchTrigger: false,
  showTick: true,
  closeOnEsc: false,
})

const emit = defineEmits<{
  (e: 'select', key: T['key']): void
}>()

const isOpen = ref(false)

const selectedLabel = computed(() => {
  const selectedOption = props.options.find(option => option.key === props.selectedKey)
  return selectedOption ? selectedOption.label : ''
})

const handleSelect = (key: T['key']) => {
  emit('select', key)
  isOpen.value = false
}
</script>

<style scoped>
.doc-select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-size-s-8);
  width: 100%;
  height: var(--spacing-size-3xl-32);
  padding-left: var(--spacing-padding-s-8);
  padding-right: var(--spacing-padding-xs-4);
  border: 1px solid var(--color-border-quaternary);
  border-radius: var(--radius-s-8);
  background-color: var(--color-fill-surfacebright);
  font-size: var(--typo-interface-desktop-body-body-medium-size);
  line-height: var(--typo-interface-desktop-body-body-medium-lh);
  font-weight: var(--typo-interface-desktop-body-body-medium-weight);
  letter-spacing: var(--typo-interface-desktop-body-body-medium-ls);
  cursor: pointer;
  transition: all 150ms ease;
}

.doc-select-trigger:hover:not(:disabled) {
  border-color: var(--color-border-tertiary);
}

.doc-select-trigger:active:not(:disabled) {
  border-color: var(--color-border-tertiary);
  background-color: var(--color-mask-overlays);
}

.doc-select-trigger:disabled {
  cursor: not-allowed;
  border-color: var(--color-border-quaternary);
  background-color: transparent;
}

.doc-select-label {
  flex: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.doc-select-icon {
  flex-shrink: 0;
  color: var(--color-text-tertiary);
}

.doc-select-menu {
  min-width: 200px;
  max-height: 300px;
  overflow-y: auto;
  padding: var(--spacing-padding-s-8);
}

.doc-select-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-padding-xs-4);
}

.doc-select-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-size-s-8);
  width: 100%;
  height: var(--spacing-size-3xl-32);
  padding: var(--spacing-padding-xs-4) var(--spacing-padding-s-8);
  border: none;
  border-radius: var(--radius-xs-6);
  background-color: transparent;
  font-size: var(--typo-interface-desktop-body-body-medium-size);
  line-height: var(--typo-interface-desktop-body-body-medium-lh);
  font-weight: var(--typo-interface-desktop-body-body-medium-weight);
  letter-spacing: var(--typo-interface-desktop-body-body-medium-ls);
  text-align: left;
  cursor: pointer;
  transition: background-color 150ms ease;
}

.doc-select-option:hover {
  background-color: var(--color-mask-overlays);
}

.doc-select-option:active {
  background-color: var(--color-mask-overlay-deep);
}

.doc-select-option--selected {
  background-color: var(--color-mask-overlay-deep);
}

.doc-select-option-label {
  flex: 1;
}

.doc-select-tick {
  flex-shrink: 0;
  color: var(--color-text-primary);
}

.doc-select-divider {
  height: 1px;
  margin: var(--spacing-margin-margin-xxs-4) 0;
  background-color: var(--color-border-muted);
}
</style>
