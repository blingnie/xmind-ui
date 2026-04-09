<template>
  <button
    :class="buttonClasses"
    :disabled="isDisabled"
    @click="handleClick"
  >
    <span v-if="$slots['icon-left']" class="ai-button__icon ai-button__icon--left">
      <slot name="icon-left" />
    </span>
    <slot />
    <span v-if="$slots['icon-right']" class="ai-button__icon ai-button__icon--right">
      <slot name="icon-right" />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export type AiButtonVariant = 'default' | 'secondary' | 'outline' | 'muted'
export type AiButtonSize = 'small' | 'medium' | 'large'

interface AiButtonProps {
  variant?: AiButtonVariant
  size?: AiButtonSize
  disabled?: boolean
  active?: boolean
  iconOnly?: boolean
}

const props = withDefaults(defineProps<AiButtonProps>(), {
  variant: 'default',
  size: 'medium',
  disabled: false,
  active: false,
  iconOnly: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const isDisabled = computed(() => props.disabled)

const buttonClasses = computed(() => {
  return [
    'ai-button',
    `ai-button--${props.variant}`,
    `ai-button--${props.size}`,
    props.active && 'ai-button--active',
    props.iconOnly && 'ai-button--icon-only',
    isDisabled.value && 'ai-button--disabled',
  ].filter(Boolean).join(' ')
})

const handleClick = (event: MouseEvent) => {
  if (!isDisabled.value) {
    emit('click', event)
  }
}
</script>

<style scoped>
/* ================================================
   Base
   ================================================ */
.ai-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: none;
  outline: none;
  cursor: pointer;
  transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease;
  white-space: nowrap;
  user-select: none;
  box-sizing: border-box;
}

.ai-button--disabled {
  cursor: not-allowed;
  pointer-events: none;
}

/* ================================================
   Size
   ================================================ */
.ai-button--large {
  height: var(--button-height-xl);
  padding: 0 var(--spacing-padding-l-16);
  border-radius: var(--radius-m-12);
  font-size: var(--typo-interface-mobile-body-body-large-size);
  line-height: var(--typo-interface-mobile-body-body-large-lh);
  font-weight: var(--typo-interface-mobile-body-body-large-weight);
  letter-spacing: var(--typo-interface-mobile-body-body-large-ls);
}

.ai-button--medium {
  height: var(--button-height-l);
  padding: 0 var(--spacing-padding-m-12);
  border-radius: var(--radius-s-8);
  font-size: var(--typo-interface-desktop-body-body-large-size);
  line-height: var(--typo-interface-desktop-body-body-large-lh);
  font-weight: var(--typo-interface-desktop-body-body-large-weight);
  letter-spacing: var(--typo-interface-desktop-body-body-large-ls);
}

.ai-button--small {
  height: var(--button-height-m);
  padding: 0 var(--spacing-padding-s-8);
  border-radius: var(--radius-s-8);
  font-size: var(--typo-interface-desktop-body-body-medium-size);
  line-height: var(--typo-interface-desktop-body-body-medium-lh);
  font-weight: var(--typo-interface-desktop-body-body-medium-weight);
  letter-spacing: var(--typo-interface-desktop-body-body-medium-ls);
}

/* ================================================
   Variant: default
   ================================================ */
.ai-button--default {
  background-color: var(--ai-button-bg-default-normal);
  color: var(--ai-button-content-oncolor-default);
  box-shadow: var(--elevation-l1);
}

.ai-button--default:hover:not(.ai-button--disabled) {
  background-color: var(--ai-button-bg-default-hover);
}

.ai-button--default:active:not(.ai-button--disabled) {
  background-color: var(--ai-button-bg-default-pressed);
}

.ai-button--default.ai-button--disabled {
  background-color: var(--ai-button-bg-default-disable);
  color: var(--ai-button-content-oncolor-disable);
  box-shadow: none;
}

/* ================================================
   Variant: secondary
   ================================================ */
.ai-button--secondary {
  background-color: var(--ai-button-bg-secondary-normal);
  color: var(--ai-button-content-default-normal);
  border: 1px solid var(--ai-button-border-secondary-normal);
  box-shadow: var(--elevation-l1);
}

.ai-button--secondary:hover:not(.ai-button--disabled) {
  background-color: var(--ai-button-bg-secondary-hover);
  border-color: var(--ai-button-border-secondary-hover);
  color: var(--ai-button-content-default-hover);
}

.ai-button--secondary:active:not(.ai-button--disabled) {
  background-color: var(--ai-button-bg-secondary-pressed);
  border-color: var(--ai-button-border-secondary-pressed);
  color: var(--ai-button-content-default-pressed);
}

.ai-button--secondary.ai-button--disabled {
  background-color: var(--ai-button-bg-secondary-disable);
  border-color: var(--ai-button-border-secondary-disable);
  color: var(--ai-button-content-default-disable);
  box-shadow: none;
}

/* ================================================
   Variant: outline
   ================================================ */
.ai-button--outline {
  background-color: var(--ai-button-bg-outline-normal);
  color: var(--ai-button-content-default-normal);
  border: 1px solid var(--ai-button-border-outline-normal);
}

.ai-button--outline:hover:not(.ai-button--disabled):not(.ai-button--active) {
  background-color: var(--ai-button-bg-outline-hover);
  border-color: var(--ai-button-border-outline-hover);
  color: var(--ai-button-content-default-hover);
}

.ai-button--outline:active:not(.ai-button--disabled):not(.ai-button--active) {
  background-color: var(--ai-button-bg-outline-pressed);
  border-color: var(--ai-button-border-outline-pressed);
  color: var(--ai-button-content-default-pressed);
}

.ai-button--outline.ai-button--active {
  background-color: var(--ai-button-bg-outline-active);
  border-color: var(--ai-button-border-outline-active);
  color: var(--ai-button-content-default-active);
}

.ai-button--outline.ai-button--disabled {
  background-color: var(--ai-button-bg-outline-disable);
  border-color: var(--ai-button-border-outline-disable);
  color: var(--ai-button-content-default-disable);
}

/* ================================================
   Variant: muted (same as outline but no border)
   ================================================ */
.ai-button--muted {
  background-color: var(--ai-button-bg-outline-normal);
  color: var(--ai-button-content-default-normal);
}

.ai-button--muted:hover:not(.ai-button--disabled):not(.ai-button--active) {
  background-color: var(--ai-button-bg-outline-hover);
  color: var(--ai-button-content-default-hover);
}

.ai-button--muted:active:not(.ai-button--disabled):not(.ai-button--active) {
  background-color: var(--ai-button-bg-outline-pressed);
  color: var(--ai-button-content-default-pressed);
}

.ai-button--muted.ai-button--active {
  background-color: var(--ai-button-bg-outline-active);
  color: var(--ai-button-content-default-active);
}

.ai-button--muted.ai-button--disabled {
  background-color: var(--ai-button-bg-outline-disable);
  color: var(--ai-button-content-default-disable);
}

/* ================================================
   Icon slots
   ================================================ */
.ai-button__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: currentColor;
}

.ai-button__icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.ai-button--small .ai-button__icon {
  width: 14px; /* no token */
  height: 14px; /* no token */
}

.ai-button--medium .ai-button__icon {
  width: 16px; /* no token */
  height: 16px; /* no token */
}

.ai-button--large .ai-button__icon {
  width: 20px; /* no token */
  height: 20px; /* no token */
}

.ai-button__icon--left {
  margin-right: var(--spacing-size-xs-4);
}

.ai-button__icon--right {
  margin-left: var(--spacing-size-xs-4);
}

/* ================================================
   Icon only
   ================================================ */
.ai-button--icon-only {
  padding: 0;
  aspect-ratio: 1 / 1;
}

.ai-button--icon-only.ai-button--small {
  width: var(--button-height-m);
}

.ai-button--icon-only.ai-button--medium {
  width: var(--button-height-l);
}

.ai-button--icon-only.ai-button--large {
  width: var(--button-height-xl);
}

.ai-button--icon-only .ai-button__icon--left {
  margin-right: 0;
}

.ai-button--icon-only .ai-button__icon--right {
  margin-left: 0;
}

/* Icon only — direct child icon sizing */
.ai-button--icon-only.ai-button--small > * {
  width: 14px; /* no token */
  height: 14px; /* no token */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
}

.ai-button--icon-only.ai-button--small > * :deep(svg),
.ai-button--icon-only.ai-button--small > :deep(svg) {
  display: block;
  width: 14px; /* no token */
  height: 14px; /* no token */
}

.ai-button--icon-only.ai-button--medium > * {
  width: 16px; /* no token */
  height: 16px; /* no token */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
}

.ai-button--icon-only.ai-button--medium > * :deep(svg),
.ai-button--icon-only.ai-button--medium > :deep(svg) {
  display: block;
  width: 16px; /* no token */
  height: 16px; /* no token */
}

.ai-button--icon-only.ai-button--large > * {
  width: 20px; /* no token */
  height: 20px; /* no token */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
}

.ai-button--icon-only.ai-button--large > * :deep(svg),
.ai-button--icon-only.ai-button--large > :deep(svg) {
  display: block;
  width: 20px; /* no token */
  height: 20px; /* no token */
}
</style>
