<template>
  <div class="playground" :style="platformStyles">
    <!-- Platform Switcher -->
    <div v-if="config.supportsPlatform" class="playground__platform">
      <span class="platform-label">Platform</span>
      <DocSegmentedControl
        :selected-key="selectedPlatform"
        :options="platformOptions"
        @select="(key: string) => selectedPlatform = key"
      />
    </div>

    <!-- Component Preview -->
    <div class="playground__preview">
      <slot :props="componentProps" :slots="componentSlots" />
    </div>

    <!-- Controls Panel -->
    <div class="playground__controls">
      <!-- Table Header -->
      <div class="control-header">
        <span class="control-header__label">Option</span>
        <span class="control-header__value">Value</span>
      </div>

      <!-- Props Controls -->
      <div v-for="(control, propName) in config.props" :key="propName" class="control-row">
        <label class="control-row__label">{{ control.label }}</label>

        <div class="control-row__value">
          <!-- Boolean Control (Toggle) -->
          <DocToggle
            v-if="control.type === 'boolean'"
            v-model="componentProps[propName]"
          />

          <!-- Select Control (Segmented Control) -->
          <DocSegmentedControl
            v-else-if="control.type === 'select'"
            :selected-key="componentProps[propName]"
            :options="control.options.map((opt: any) => ({ key: opt.value, label: opt.label }))"
            @select="(key: string) => componentProps[propName] = key"
          />

          <!-- Text Control -->
          <input
            v-else-if="control.type === 'text'"
            v-model="componentProps[propName]"
            type="text"
            class="control-row__input"
          />

          <!-- Number Control -->
          <input
            v-else-if="control.type === 'number'"
            v-model.number="componentProps[propName]"
            type="number"
            :min="control.min"
            :max="control.max"
            :step="control.step"
            class="control-row__input"
          />
        </div>
      </div>

      <!-- Slot Controls -->
      <div v-for="(slot, slotName) in config.slots" :key="slotName" class="control-row">
        <label class="control-row__label">{{ slot.label }}</label>
        <div class="control-row__value">
          <input
            v-model="componentSlots[slotName]"
            type="text"
            class="control-row__input"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import type { ComponentConfig } from '../../packages/components/types/component-config'
import DocToggle from './DocToggle.vue'
import DocSegmentedControl from './DocSegmentedControl.vue'

const props = defineProps<{
  config: ComponentConfig
}>()

// Platform switcher
const selectedPlatform = ref('macos')
const platformOptions = [
  { key: 'macos', label: 'macOS' },
  { key: 'windows', label: 'Windows' }
]

// Platform-specific CSS variable overrides
const platformStyles = computed(() => {
  if (!props.config.supportsPlatform) return {}

  if (selectedPlatform.value === 'windows') {
    return {
      '--button-radius-small': 'var(--win-radius-button-small)',
      '--button-radius-medium': 'var(--win-radius-button-default)',
      '--button-radius-big': 'var(--win-radius-button-big)',
    }
  }

  return {}
})

// Initialize component props from config
const componentProps = reactive<Record<string, any>>({})
Object.keys(props.config.props).forEach((propName) => {
  componentProps[propName] = props.config.props[propName].defaultValue
})

// Initialize component slots from config
const componentSlots = reactive<Record<string, string>>({})
if (props.config.slots) {
  Object.keys(props.config.slots).forEach((slotName) => {
    componentSlots[slotName] = props.config.slots![slotName].defaultValue
  })
}

</script>

<style scoped>
.playground {
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-l-16);
  border: 1px solid var(--color-border-translucent);
  background: var(--color-fill-surfacebright);
  overflow: hidden;
}

.playground__platform {
  display: flex;
  align-items: center;
  gap: var(--spacing-size-m-16);
  padding: var(--spacing-padding-l-16);
  border-bottom: 1px solid var(--color-border-translucent);
  background-color: var(--color-fill-surfacebright);
}

.platform-label {
  width: 96px;
  flex-shrink: 0;
  font-size: var(--typo-interface-desktop-body-body-medium-size);
  line-height: var(--typo-interface-desktop-body-body-medium-lh);
  font-weight: var(--typo-interface-desktop-body-body-medium-weight);
  letter-spacing: var(--typo-interface-desktop-body-body-medium-ls);
  color: var(--color-text-secondary);
}

.playground__preview {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-padding-xxxl-48);
  background-color: var(--color-fill-surfacebright);
  min-height: 200px;
}

.playground__controls {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--color-border-translucent);
  background-color: var(--color-fill-surfacebright);
}

/* Table Header */
.control-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-size-m-16);
  padding: var(--spacing-padding-m-12) var(--spacing-padding-l-16);
  background-color: var(--color-fill-surfacebright);
  border-bottom: 1px solid var(--color-border-translucent);
}

.control-header__label,
.control-header__value {
  font-size: var(--typo-interface-desktop-body-body-small-size);
  line-height: var(--typo-interface-desktop-body-body-small-lh);
  font-weight: 600;
  letter-spacing: var(--typo-interface-desktop-body-body-small-ls);
  color: var(--color-text-secondary);
}

.control-header__label {
  width: 96px;
  flex-shrink: 0;
}

.control-header__value {
  flex: 1;
}

/* Table Row */
.control-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-size-m-16);
  padding: var(--spacing-padding-l-16);
  border-bottom: 1px solid var(--color-border-translucent);
}

.control-row:last-child {
  border-bottom: none;
}

.control-row__label {
  width: 96px;
  flex-shrink: 0;
  font-size: var(--typo-interface-desktop-body-body-medium-size);
  line-height: var(--typo-interface-desktop-body-body-medium-lh);
  font-weight: var(--typo-interface-desktop-body-body-medium-weight);
  letter-spacing: var(--typo-interface-desktop-body-body-medium-ls);
  color: var(--color-text-secondary);
}

.control-row__value {
  flex: 1;
  display: flex;
  align-items: center;
}

.control-row__input {
  flex: 1;
  height: var(--spacing-size-3xl-32);
  padding: var(--spacing-padding-xs-4) var(--spacing-padding-s-8);
  border: 1px solid var(--input-border-normal);
  border-radius: var(--input-radius-default);
  background-color: var(--input-bg-default-normal);
  color: var(--input-text-default);
  font-size: var(--typo-interface-desktop-body-body-medium-size);
  line-height: var(--typo-interface-desktop-body-body-medium-lh);
  font-weight: var(--typo-interface-desktop-body-body-medium-weight);
  letter-spacing: var(--typo-interface-desktop-body-body-medium-ls);
  font-family: inherit;
  transition: all 150ms ease;
}

.control-row__input:hover {
  border-color: var(--input-border-hover);
  background-color: var(--input-bg-default-hover);
}

.control-row__input:active {
  border-color: var(--input-border-pressed);
  background-color: var(--input-bg-default-pressed);
}

.control-row__input:focus {
  outline: none;
  border-color: var(--input-border-active);
}
</style>
