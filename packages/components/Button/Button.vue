<template>
  <component
    :is="componentTag"
    :class="buttonClasses"
    :disabled="isDisabled"
    :href="href"
    @click="handleClick"
  >
    <span v-if="loading" class="button__spinner" aria-hidden="true">
      <span :class="spinnerClasses" v-html="SpinnerSvg"></span>
    </span>
    <span v-if="$slots['icon-left']" class="button__icon button__icon--left">
      <slot name="icon-left" />
    </span>
    <slot />
    <span v-if="$slots['icon-right']" class="button__icon button__icon--right">
      <slot name="icon-right" />
    </span>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SpinnerSvg from '../../../docs/components/icon/spinner.svg?raw'

export type ButtonVariant = 'default' | 'primary' | 'secondary' | 'ai' | 'danger' | 'link'
export type ButtonSize = 'small' | 'medium' | 'large'

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  text?: boolean
  loading?: boolean
  iconOnly?: boolean
  href?: string
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'default',
  size: 'medium',
  disabled: false,
  text: false,
  loading: false,
  iconOnly: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const componentTag = computed(() => {
  return props.href ? 'a' : 'button'
})

const isDisabled = computed(() => {
  return props.disabled || props.loading
})

const buttonClasses = computed(() => {
  return [
    'button',
    `button--${props.variant}`,
    `button--${props.size}`,
    props.text && 'button--text',
    props.loading && 'button--loading',
    props.iconOnly && 'button--icon-only',
    isDisabled.value && 'button--disabled',
  ].filter(Boolean).join(' ')
})

const spinnerClasses = computed(() => {
  return [
    'button__spinner-icon',
    `button__spinner-icon--${props.size}`,
  ].filter(Boolean).join(' ')
})

const handleClick = (event: MouseEvent) => {
  if (!isDisabled.value) {
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
  box-shadow: var(--elevation-l1);
}

.button--default:hover:not(.button--disabled) {
  background-color: var(--button-bg-default-hover);
  color: var(--button-content-default-hover);
  border-color: var(--button-border-default-hover);
}

.button--default:active:not(.button--disabled) {
  background-color: var(--button-bg-default-pressed);
  color: var(--button-content-default-pressed);
  border-color: var(--button-border-default-pressed);
}

.button--default.button--disabled {
  background-color: var(--button-bg-default-disable);
  color: var(--button-content-default-disable);
  border-color: var(--button-border-default-disable);
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
  color: var(--button-content-invert-default);
}

.button--secondary:hover:not(.button--disabled) {
  background-color: var(--button-bg-secondary-hover);
}

.button--secondary:active:not(.button--disabled) {
  background-color: var(--button-bg-secondary-pressed);
}

.button--secondary.button--disabled {
  background-color: var(--button-bg-secondary-disable);
  color: var(--button-content-invert-disable);
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
  background-color: var(--button-bg-nocontainer-normal);
  color: var(--button-content-link-normal);
  padding: var(--spacing-padding-none-0) var(--spacing-padding-xs-4);
}

/* Link button size overrides */
.button--link.button--small {
  height: var(--button-height-xxs);
  padding: var(--spacing-padding-none-0) var(--spacing-padding-xs-4);
  font-size: var(--typo-interface-desktop-body-body-small-size);
  line-height: var(--typo-interface-desktop-body-body-small-lh);
}

.button--link.button--medium {
  height: var(--button-height-xs);
  padding: var(--spacing-padding-none-0) var(--spacing-padding-xs-4);
  font-size: var(--typo-interface-desktop-subhead-subhead-mini-size);
  line-height: var(--typo-interface-desktop-subhead-subhead-mini-lh);
}

.button--link.button--large {
  height: var(--button-height-s);
  padding: var(--spacing-padding-none-0) var(--spacing-padding-xs-4);
  font-size: var(--typo-interface-desktop-subhead-subhead-small-size);
  line-height: var(--typo-interface-desktop-subhead-subhead-small-lh);
}

.button--link:hover:not(.button--disabled) {
  background-color: var(--button-bg-nocontainer-hover);
  color: var(--button-content-link-hover);
}

.button--link:active:not(.button--disabled) {
  background-color: var(--button-bg-nocontainer-pressed);
  color: var(--button-content-link-pressed);
}

.button--link.button--disabled {
  background-color: var(--button-bg-nocontainer-disable);
  color: var(--button-content-link-disable);
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

/* Loading state with spinner */
.button--loading {
  position: relative;
}

.button__spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--spacing-size-xs-4);
  flex-shrink: 0;
}

.button--icon-only .button__spinner {
  margin-right: 0;
}

.button__spinner-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  animation: button-spinner-rotate 1s linear infinite;
  position: relative;
  color: currentColor;
}

/* Use currentColor to match button text color */
.button__spinner-icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.button__spinner-icon :deep(svg path) {
  fill: currentColor;
}

/* Size-specific spinner dimensions */
.button__spinner-icon--small {
  width: 14px;
  height: 14px;
}

.button__spinner-icon--medium {
  width: 16px;
  height: 16px;
}

.button__spinner-icon--large {
  width: 20px;
  height: 20px;
}

@keyframes button-spinner-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Icon spacing */
.button__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.button__icon--left {
  margin-right: var(--spacing-size-xs-4);
}

.button__icon--right {
  margin-left: var(--spacing-size-xs-4);
}

/* Icon only button - square shape */
.button--icon-only {
  padding: 0;
  aspect-ratio: 1 / 1;
}

.button--icon-only.button--small {
  width: var(--button-height-m);
}

.button--icon-only.button--medium {
  width: var(--button-height-l);
}

.button--icon-only.button--large {
  width: var(--button-height-xl);
}

/* Link button as anchor tag */
.button[href] {
  text-decoration: none;
  display: inline-flex;
}

.button[href]:disabled {
  pointer-events: none;
  opacity: 0.6;
}
</style>
