<template>
  <div class="playground">
    <!-- Component Preview -->
    <div class="playground__preview">
      <slot :props="componentProps" :slots="componentSlots" />
    </div>

    <!-- Controls Panel -->
    <div class="playground__controls">
      <div v-for="(control, propName) in config.props" :key="propName" class="control-row">
        <label class="control-row__label">{{ control.label }}</label>

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

      <!-- Slot Controls -->
      <div v-for="(slot, slotName) in config.slots" :key="slotName" class="control-row">
        <label class="control-row__label">{{ slot.label }}</label>
        <input
          v-model="componentSlots[slotName]"
          type="text"
          class="control-row__input"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import type { ComponentConfig } from '../../packages/components/types/component-config'
import DocToggle from './DocToggle.vue'
import DocSegmentedControl from './DocSegmentedControl.vue'

const props = defineProps<{
  config: ComponentConfig
}>()

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
  gap: var(--spacing-size-xl-24);
  border-radius: var(--radius-l-16);
  border: 1px solid var(--color-border-translucent);
  background: var(--color-fill-surfacebright);
  overflow: hidden;
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
  gap: var(--spacing-padding-s-8);
  padding: var(--spacing-padding-l-16);
  border-top: 1px solid var(--color-border-translucent);
  background-color: var(--color-fill-surfacebright);
}

.control-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: var(--spacing-padding-l-16);
  min-height: var(--spacing-size-3xl-32);
}

.control-row__label {
  flex-shrink: 0;
  width: 80px;
  display: flex;
  align-items: center;
  font-size: var(--typo-interface-desktop-body-body-medium-size);
  line-height: var(--typo-interface-desktop-body-body-medium-lh);
  font-weight: var(--typo-interface-desktop-body-body-medium-weight);
  letter-spacing: var(--typo-interface-desktop-body-body-medium-ls);
  color: var(--color-text-secondary);
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
