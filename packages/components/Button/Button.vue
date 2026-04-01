<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export type ButtonVariant = 'default' | 'primary' | 'secondary' | 'ai' | 'danger' | 'link'
export type ButtonSize = 'small' | 'medium' | 'large'

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  text?: boolean
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'default',
  size: 'medium',
  disabled: false,
  text: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => {
  return [
    'button',
    `button--${props.variant}`,
    `button--${props.size}`,
    props.text && 'button--text',
    props.disabled && 'button--disabled',
  ].filter(Boolean).join(' ')
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<style scoped>
/* Base button styles */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: none;
  outline: none;
  font-family: var(--font-family-base);
  cursor: pointer;
  transition: all 150ms ease;
  user-select: none;
}

.button--disabled {
  cursor: not-allowed;
}

/* Size variants */
.button--small {
  height: var(--button-height-m);
  border-radius: var(--button-radius-small);
  padding: var(--button-padding-vertical-small) var(--button-padding-horizontal-small);
  font-size: var(--typo-interface-desktop-subhead-subhead-mini-size);
  line-height: var(--typo-interface-desktop-subhead-subhead-mini-lh);
  font-weight: var(--typo-interface-desktop-subhead-subhead-mini-weight);
  letter-spacing: var(--typo-interface-desktop-subhead-subhead-mini-ls);
}

.button--medium {
  height: var(--button-height-l);
  border-radius: var(--button-radius-medium);
  padding: var(--button-padding-vertical-medium) var(--button-padding-horizontal-medium);
  font-size: var(--typo-interface-desktop-subhead-subhead-small-size);
  line-height: var(--typo-interface-desktop-subhead-subhead-small-lh);
  font-weight: var(--typo-interface-desktop-subhead-subhead-small-weight);
  letter-spacing: var(--typo-interface-desktop-subhead-subhead-small-ls);
}

.button--large {
  height: var(--button-height-xl);
  border-radius: var(--button-radius-big);
  padding: var(--button-padding-vertical-big) var(--button-padding-horizontal-big);
  font-size: var(--typo-interface-desktop-subhead-subhead-medium-size);
  line-height: var(--typo-interface-desktop-subhead-subhead-medium-lh);
  font-weight: var(--typo-interface-desktop-subhead-subhead-medium-weight);
  letter-spacing: var(--typo-interface-desktop-subhead-subhead-medium-ls);
}

/* Theme variants */
.button--default {
  background-color: var(--button-bg-default-normal);
  color: var(--button-content-default-normal);
  border: 1px solid var(--button-border-default-normal);
  box-shadow: var(--shadow-l1);
}

.button--default:hover:not(.button--disabled) {
  background-color: var(--button-bg-default-hover);
  color: var(--button-content-default-hover);
}

.button--default:active:not(.button--disabled) {
  background-color: var(--button-bg-default-pressed);
  color: var(--button-content-default-pressed);
}

.button--default.button--disabled {
  background-color: var(--button-bg-default-disable);
  color: var(--button-content-default-disable);
}

.button--primary {
  background-color: var(--button-bg-primary-normal);
  color: var(--button-content-oncolor-default);
}

.button--primary:hover:not(.button--disabled) {
  background-color: var(--button-bg-primary-hover);
}

.button--primary:active:not(.button--disabled) {
  background-color: var(--button-bg-primary-pressed);
}

.button--primary.button--disabled {
  background-color: var(--button-bg-primary-disable);
  color: var(--button-content-oncolor-disable);
}

.button--secondary {
  background-color: var(--button-bg-secondary-normal);
  color: var(--button-content-oncolor-default);
}

.button--secondary:hover:not(.button--disabled) {
  background-color: var(--button-bg-secondary-hover);
}

.button--secondary:active:not(.button--disabled) {
  background-color: var(--button-bg-secondary-pressed);
}

.button--secondary.button--disabled {
  background-color: var(--button-bg-secondary-disable);
  color: var(--button-content-oncolor-disable);
}

.button--ai {
  background-color: var(--button-bg-ai-normal);
  color: var(--button-content-oncolor-default);
}

.button--ai:hover:not(.button--disabled) {
  background-color: var(--button-bg-ai-hover);
}

.button--ai:active:not(.button--disabled) {
  background-color: var(--button-bg-ai-pressed);
}

.button--ai.button--disabled {
  background-color: var(--button-bg-ai-disable);
  color: var(--button-content-oncolor-disable);
}

.button--danger {
  background-color: transparent;
  color: var(--button-content-danger-normal);
  border: 1px solid var(--button-border-danger-normal);
}

.button--danger:hover:not(.button--disabled) {
  color: var(--button-content-danger-hover);
  border-color: var(--button-border-danger-hover);
}

.button--danger:active:not(.button--disabled) {
  color: var(--button-content-danger-pressed);
  border-color: var(--button-border-danger-pressed);
}

.button--danger.button--disabled {
  color: var(--button-content-danger-disable);
  border-color: var(--button-border-danger-disable);
}

.button--link {
  background-color: transparent;
  color: var(--button-content-link-normal);
  padding: var(--spacing-padding-xxs-2) var(--spacing-padding-xs-4);
}

.button--link:hover:not(.button--disabled) {
  background-color: var(--color-mask-overlays);
  color: var(--button-content-link-hover);
}

.button--link:active:not(.button--disabled) {
  background-color: var(--color-mask-overlaym);
  color: var(--button-content-link-pressed);
}

.button--link.button--disabled {
  color: var(--button-content-link-disable);
}

/* Link button size overrides */
.button--link.button--small {
  height: var(--button-height-xxs);
  font-size: var(--typo-interface-desktop-body-body-small-size);
  line-height: var(--typo-interface-desktop-body-body-small-lh);
}

.button--link.button--medium {
  height: var(--button-height-xs);
  font-size: var(--typo-interface-desktop-subhead-subhead-mini-size);
  line-height: var(--typo-interface-desktop-subhead-subhead-mini-lh);
}

.button--link.button--large {
  height: var(--button-height-s);
  font-size: var(--typo-interface-desktop-subhead-subhead-small-size);
  line-height: var(--typo-interface-desktop-subhead-subhead-small-lh);
}

/* Text button modifier */
.button--text {
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  padding: 0 !important;
}

.button--text.button--primary {
  color: var(--color-fill-accent-normal);
}

.button--text.button--primary:hover:not(.button--disabled) {
  color: var(--color-fill-accent-hover);
}

.button--text.button--primary:active:not(.button--disabled) {
  color: var(--color-fill-accent-pressed);
}

.button--text.button--primary.button--disabled {
  color: var(--color-fill-accent-disable);
}

.button--text.button--secondary {
  color: var(--color-text-primary);
}

.button--text.button--secondary:hover:not(.button--disabled) {
  color: var(--color-text-secondary);
}

.button--text.button--secondary:active:not(.button--disabled) {
  color: var(--color-text-primary);
}

.button--text.button--secondary.button--disabled {
  color: var(--color-text-quaternary);
}
</style>
