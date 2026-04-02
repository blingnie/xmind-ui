<template>
  <label
    class="relative inline-block shrink-0 rounded-full shadow-elevation-b1-light transition-colors dark:shadow-elevation-b1-dark"
    :class="[classString, disabled ? 'disabled pointer-events-none' : 'cursor-pointer']"
    :for="toggleFor"
  >
    <input :id="toggleFor" class="hidden" type="checkbox" :checked="checked" @change="handleToggle" />
    <div class="toggleKnob"></div>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    checked: boolean
    toggleFor: string
    size?: 'small' | 'large'
    disabled?: boolean
  }>(),
  {
    size: 'small',
    disabled: false,
  },
)

const emit = defineEmits<{
  (e: 'toggle', checked: boolean, event: InputEvent): void
}>()

const classString = computed(() => {
  return ['toggle', props.size === 'small' ? 'toggle-small' : 'toggle-large', props.checked ? 'toggle-checked' : '']
})

const handleToggle = (event: InputEvent) => {
  if (props.disabled) return
  emit('toggle', (event.target as HTMLInputElement).checked, event as InputEvent)
}
</script>

<style scoped>
.toggle {
  @apply bg-switch-bg-uncheck-normal-light active:bg-switch-bg-uncheck-pressed-light dark:bg-switch-bg-uncheck-normal-dark dark:active:bg-switch-bg-uncheck-pressed-dark [&.disabled]:bg-switch-bg-uncheck-disable-light hover:[&.disabled]:bg-switch-bg-uncheck-disable-light active:[&.disabled]:bg-switch-bg-uncheck-disable-light dark:[&.disabled]:bg-switch-bg-uncheck-disable-dark dark:hover:[&.disabled]:bg-switch-bg-uncheck-disable-dark dark:active:[&.disabled]:bg-switch-bg-uncheck-disable-dark;
}
.toggle.toggle-checked {
  @apply bg-switch-bg-checked-normal-light active:bg-switch-bg-checked-pressed-light dark:bg-switch-bg-checked-normal-dark dark:active:bg-switch-bg-checked-pressed-dark [&.disabled]:bg-switch-bg-checked-disable-light hover:[&.disabled]:bg-switch-bg-checked-disable-light active:[&.disabled]:bg-switch-bg-checked-disable-light dark:[&.disabled]:bg-switch-bg-checked-disable-dark dark:hover:[&.disabled]:bg-switch-bg-checked-disable-dark dark:active:[&.disabled]:bg-switch-bg-checked-disable-dark;
}

.toggle.toggle-small {
  @apply h-4 w-8;
}
.toggle.toggle-large {
  @apply h-6 w-11;
}

.toggle.toggle-small .toggleKnob {
  @apply left-[2px] top-[2px] h-3 w-3;
}
.toggle.toggle-small.toggle-checked .toggleKnob {
  @apply translate-x-4;
}
.toggle.toggle-large .toggleKnob {
  @apply left-[3px] top-[3px] h-[18px] w-[18px];
}
.toggle.toggle-large.toggle-checked .toggleKnob {
  @apply translate-x-5;
}

.toggle .toggleKnob {
  @apply absolute rounded-full bg-white transition-transform;
}
.toggle.disabled .toggleKnob {
  @apply bg-switch-bg-uncheck-disable-light dark:bg-switch-bg-uncheck-disable-dark;
}
</style>
