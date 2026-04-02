<template>
  <label
    class="doc-toggle"
    :class="{ 'doc-toggle--checked': checked, 'doc-toggle--disabled': disabled }"
  >
    <input
      type="checkbox"
      :checked="checked"
      :disabled="disabled"
      class="doc-toggle__input"
      @change="handleToggle"
    />
    <div class="doc-toggle__knob"></div>
  </label>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  disabled?: boolean
}>(), {
  disabled: false,
})

const checked = defineModel<boolean>({
  default: false,
  required: true,
})

const handleToggle = (event: Event) => {
  if (props.disabled) return
  checked.value = (event.target as HTMLInputElement).checked
}
</script>

<style scoped>
.doc-toggle {
  position: relative;
  display: inline-block;
  width: 32px;
  height: var(--spacing-size-m-16);
  flex-shrink: 0;
  border-radius: var(--radius-infinite-300);
  background-color: var(--switch-bg-uncheck-normal);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08) inset, 0 1px 2px 0 rgba(0, 0, 0, 0.10) inset;
  transition: background-color 150ms ease;
  cursor: pointer;
}

.doc-toggle:active:not(.doc-toggle--disabled) {
  background-color: var(--switch-bg-uncheck-pressed);
}

.doc-toggle--checked {
  background-color: var(--switch-bg-checked-normal);
}

.doc-toggle--checked:active:not(.doc-toggle--disabled) {
  background-color: var(--switch-bg-checked-pressed);
}

.doc-toggle--disabled {
  cursor: not-allowed;
  background-color: var(--switch-bg-uncheck-disable);
}

.doc-toggle--disabled.doc-toggle--checked {
  background-color: var(--switch-bg-checked-disable);
}

.doc-toggle__input {
  display: none;
}

.doc-toggle__knob {
  position: absolute;
  left: 2px;
  top: 2px;
  width: 20px;
  height: 12px;
  border-radius: var(--radius-infinite-300);
  background-color: var(--switch-knob-default);
  box-shadow: 0 0.5px 4px 0 rgba(0, 0, 0, 0.12), 0 0 1.8px 0 rgba(0, 0, 0, 0.08);
  transition: transform 150ms ease;
}

.doc-toggle--checked .doc-toggle__knob {
  transform: translateX(8px);
}

.doc-toggle--disabled .doc-toggle__knob {
  background-color: var(--switch-knob-disable);
}
</style>
