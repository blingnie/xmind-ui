<template>
  <div class="doc-page-layout">
    <!-- Main Content -->
    <div class="doc-page-content">
      <h1 class="text-xl">Button</h1>
      <p class="text-sm text-[var(--color-text-tertiary)]" style="margin-bottom: 0;">Buttons are commonly used for key actions such as submit, confirm, create, switch, invoke tools, or advance workflows. In editing and property-panel contexts, Button often serves as a high-frequency entry point (e.g., apply, reset, add, more tools) or a decision checkpoint, requiring a balanced emphasis between accessibility, error prevention, and visual priority.</p>
      <p class="text-sm text-[var(--color-text-tertiary)]" style="margin-top: var(--spacing-margin-margin-xs-8); margin-bottom: 0;"><strong>Usage Guidelines:</strong> Primary buttons should only be used for branding and upgrade scenarios. Prefer Secondary buttons for most common actions.</p>

      <!-- Figma Link -->
      <PlatformLink
        href="https://www.figma.com/design/SbtmOZIYx5KVJZ3xuSOkaY/Xmind-UI-Components-2.0?node-id=16315-6208"
        label="Figma"
        :icon="FigmaIcon"
      />

      <!-- Default preview -->
      <section id="preview" class="doc-section">
        <div class="preview-card">
          <div class="preview-area">
            <Button variant="secondary" size="medium">Save changes</Button>
          </div>
          <div class="pt-2 px-4 pb-4 border-t border-[var(--color-border-translucent)]">
            <Tabs v-model="activeTab" :tabs="['Usage', 'Source']" />
            <SimpleCodeBlock :code="activeTab === 'Usage' ? defaultUsage : buttonSource" language="vue" height="280px" />
          </div>
        </div>
      </section>

      <!-- Playground -->
      <section id="playground" class="doc-section">
        <h2>Playground</h2>
        <Playground :config="playgroundConfig">
          <template #default="{ props, slots }">
            <Button v-bind="props">
              <template v-if="props.iconOnly && !props.loading">
                <div style="width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;" v-html="SettingIcon" />
              </template>
              <template v-else-if="!props.iconOnly">
                {{ slots.default }}
              </template>
            </Button>
          </template>
        </Playground>
      </section>

      <!-- API Reference -->
      <section id="api" class="doc-section">
        <h2>API</h2>

        <!-- Props -->
        <h3 id="props">Props</h3>
        <div class="api-table">
          <div class="api-table__header">
            <span>Name</span>
            <span>Type</span>
            <span>Default</span>
            <span>Description</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>variant</code></span>
            <span data-label="Type"><code>ButtonVariant</code></span>
            <span data-label="Default"><code>'default'</code></span>
            <span data-label="Description">The visual style variant of the button</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>size</code></span>
            <span data-label="Type"><code>ButtonSize</code></span>
            <span data-label="Default"><code>'medium'</code></span>
            <span data-label="Description">The size of the button</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>disabled</code></span>
            <span data-label="Type"><code>boolean</code></span>
            <span data-label="Default"><code>false</code></span>
            <span data-label="Description">Whether the button is disabled</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>text</code></span>
            <span data-label="Type"><code>boolean</code></span>
            <span data-label="Default"><code>false</code></span>
            <span data-label="Description">Render as a text button without background or border</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>loading</code></span>
            <span data-label="Type"><code>boolean</code></span>
            <span data-label="Default"><code>false</code></span>
            <span data-label="Description">Show loading spinner and disable the button</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>iconOnly</code></span>
            <span data-label="Type"><code>boolean</code></span>
            <span data-label="Default"><code>false</code></span>
            <span data-label="Description">Render as a square icon-only button</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>href</code></span>
            <span data-label="Type"><code>string</code></span>
            <span data-label="Default"><code>undefined</code></span>
            <span data-label="Description">When provided, renders as an anchor tag instead of a button</span>
          </div>
        </div>

        <!-- Events -->
        <h3 id="events">Events</h3>
        <div class="api-table api-table--3-cols">
          <div class="api-table__header">
            <span>Name</span>
            <span>Payload</span>
            <span>Description</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>click</code></span>
            <span data-label="Payload"><code>MouseEvent</code></span>
            <span data-label="Description">Emitted when the button is clicked (not emitted when disabled)</span>
          </div>
        </div>

        <!-- Slots -->
        <h3 id="slots">Slots</h3>
        <div class="api-table api-table--2-cols">
          <div class="api-table__header">
            <span>Name</span>
            <span>Description</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>default</code></span>
            <span data-label="Description">Button content</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>icon-left</code></span>
            <span data-label="Description">Icon placed before the button text</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>icon-right</code></span>
            <span data-label="Description">Icon placed after the button text</span>
          </div>
        </div>
      </section>

      <!-- Usage Examples -->
      <section id="examples" class="doc-section">
        <h2>Examples</h2>

        <!-- Variants -->
        <div id="example-variants" class="example-block">
          <h3>Variants</h3>
          <div class="preview-card">
            <div class="preview-area">
              <Button variant="default">Default</Button>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ai">AI</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="link">Link</Button>
            </div>
            <div class="p-4 border-t border-[var(--color-border-translucent)]">
              <SimpleCodeBlock :code="variantsUsage" language="vue" />
            </div>
          </div>
        </div>

        <!-- Sizes -->
        <div id="example-sizes" class="example-block">
          <h3>Sizes</h3>
          <div class="preview-card">
            <div class="preview-area">
              <Button size="small">Small</Button>
              <Button size="medium">Medium</Button>
              <Button size="large">Large</Button>
            </div>
            <div class="p-4 border-t border-[var(--color-border-translucent)]">
              <SimpleCodeBlock :code="sizesUsage" language="vue" />
            </div>
          </div>
        </div>

        <!-- Disabled -->
        <div id="example-disabled" class="example-block">
          <h3>Disabled</h3>
          <div class="preview-card">
            <div class="preview-area">
              <Button variant="secondary" disabled>Secondary</Button>
              <Button variant="default" disabled>Default</Button>
            </div>
            <div class="p-4 border-t border-[var(--color-border-translucent)]">
              <SimpleCodeBlock :code="disabledUsage" language="vue" />
            </div>
          </div>
        </div>

        <!-- Text Mode -->
        <div id="example-text" class="example-block">
          <h3>Text Mode</h3>
          <div class="preview-card">
            <div class="preview-area">
              <Button variant="primary" text>Primary Text</Button>
              <Button variant="secondary" text>Secondary Text</Button>
            </div>
            <div class="p-4 border-t border-[var(--color-border-translucent)]">
              <SimpleCodeBlock :code="textUsage" language="vue" />
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div id="example-loading" class="example-block">
          <h3>Loading State</h3>
          <div class="preview-card">
            <div class="preview-area">
              <Button variant="secondary" :loading="true">Loading...</Button>
              <Button variant="default" :loading="true">Processing</Button>
            </div>
            <div class="p-4 border-t border-[var(--color-border-translucent)]">
              <SimpleCodeBlock :code="loadingUsage" language="vue" />
            </div>
          </div>
        </div>

        <!-- With Icon -->
        <div id="example-with-icon" class="example-block">
          <h3>With Icon</h3>
          <div class="preview-card">
            <div class="preview-area">
              <Button variant="primary">
                <template #icon-left>
                  <div style="width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;" v-html="CrownIcon" />
                </template>
                Upgrade
              </Button>
              <Button variant="secondary">
                <template #icon-left>
                  <div style="width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;" v-html="AddIcon" />
                </template>
                Add Member
              </Button>
              <Button variant="default">
                <template #icon-left>
                  <div style="width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;" v-html="MailIcon" />
                </template>
                Email
              </Button>
              <Button variant="danger">
                <template #icon-left>
                  <div style="width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;" v-html="TrashIcon" />
                </template>
                Delete
              </Button>
            </div>
            <div class="p-4 border-t border-[var(--color-border-translucent)]">
              <SimpleCodeBlock :code="withIconUsage" language="vue" />
            </div>
          </div>
        </div>

        <!-- Icon Only -->
        <div id="example-icon-only" class="example-block">
          <h3>Icon Only</h3>
          <div class="preview-card">
            <div class="preview-area">
              <Button variant="default" icon-only>
                <div style="width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;" v-html="MoreIcon" />
              </Button>
              <Button variant="secondary" icon-only>
                <div style="width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;" v-html="SettingIcon" />
              </Button>
              <Button variant="danger" icon-only>
                <div style="width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;" v-html="TrashIcon" />
              </Button>
            </div>
            <div class="p-4 border-t border-[var(--color-border-translucent)]">
              <SimpleCodeBlock :code="iconOnlyUsage" language="vue" />
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Table of Contents: 只在xl及以上显示 -->
    <DocTableOfContents :items="tocItems" class="hidden xl:block" />
  </div>
</template>

<script setup lang="ts">
import Button from '../../../packages/components/Button/Button.vue'
import SimpleCodeBlock from '~/components/SimpleCodeBlock.vue'
import Tabs from '~/components/Tabs.vue'
import Playground from '~/components/Playground.vue'
import DocTableOfContents from '~/components/DocTableOfContents.vue'
import PlatformLink from '~/components/PlatformLink.vue'

// Import icons
import AddIcon from '~/components/icon/fw-icons/add.svg?raw'
import DownloadIcon from '~/components/icon/fw-icons/download.svg?raw'
import ChevronDownIcon from '~/components/icon/fw-icons/chevron-downward.svg?raw'
import CrownIcon from '~/components/icon/fw-icons/crown.svg?raw'
import MailIcon from '~/components/icon/fw-icons/mail.svg?raw'
import TrashIcon from '~/components/icon/fw-icons/trash.svg?raw'
import MoreIcon from '~/components/icon/fw-icons/more.svg?raw'
import SettingIcon from '~/components/icon/fw-icons/setting.svg?raw'

// Figma icon
const FigmaIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M6.66667 18.3334C8.13943 18.3334 9.33333 17.1395 9.33333 15.6667V13.0001H6.66667C5.19391 13.0001 4 14.194 4 15.6667C4 17.1395 5.19391 18.3334 6.66667 18.3334Z" fill="#0ACF83"/>
  <path d="M4 10.0001C4 8.52728 5.19391 7.33337 6.66667 7.33337H9.33333V12.6667H6.66667C5.19391 12.6667 4 11.4728 4 10.0001Z" fill="#A259FF"/>
  <path d="M4.00001 4.66671C4.00001 3.19395 5.19392 2.00004 6.66668 2.00004H9.33334V7.33337H6.66668C5.19392 7.33337 4.00001 6.13947 4.00001 4.66671Z" fill="#F24E1E"/>
  <path d="M9.33334 2.00004H12C13.4728 2.00004 14.6667 3.19395 14.6667 4.66671C14.6667 6.13947 13.4728 7.33337 12 7.33337H9.33334V2.00004Z" fill="#FF7262"/>
  <path d="M14.6667 10.0001C14.6667 11.4728 13.4728 12.6667 12 12.6667C10.5272 12.6667 9.33334 11.4728 9.33334 10.0001C9.33334 8.52728 10.5272 7.33337 12 7.33337C13.4728 7.33337 14.6667 8.52728 14.6667 10.0001Z" fill="#1ABCFE"/>
</svg>`

definePageMeta({ layout: 'default' })

const activeTab = ref('Usage')

// Table of Contents items
const tocItems = ref([
  { id: 'playground', text: 'Playground', level: 2 },
  { id: 'api', text: 'API', level: 2 },
  { id: 'props', text: 'Props', level: 3 },
  { id: 'events', text: 'Events', level: 3 },
  { id: 'slots', text: 'Slots', level: 3 },
  { id: 'examples', text: 'Examples', level: 2 },
  { id: 'example-variants', text: 'Variants', level: 3 },
  { id: 'example-sizes', text: 'Sizes', level: 3 },
  { id: 'example-disabled', text: 'Disabled', level: 3 },
  { id: 'example-text', text: 'Text Mode', level: 3 },
  { id: 'example-loading', text: 'Loading State', level: 3 },
  { id: 'example-with-icon', text: 'With Icon', level: 3 },
  { id: 'example-icon-only', text: 'Icon Only', level: 3 },
])

// Full source code
const buttonSource = `<template>
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
import SpinnerSvg from './spinner.svg?raw'

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
    \`button--\${props.variant}\`,
    \`button--\${props.size}\`,
    props.text && 'button--text',
    props.loading && 'button--loading',
    props.iconOnly && 'button--icon-only',
    isDisabled.value && 'button--disabled',
  ].filter(Boolean).join(' ')
})

const spinnerClasses = computed(() => {
  return [
    'button__spinner-icon',
    \`button__spinner-icon--\${props.size}\`,
  ].filter(Boolean).join(' ')
})

const handleClick = (event: MouseEvent) => {
  if (!isDisabled.value) {
    emit('click', event)
  }
}
<\/script>

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
  background-color: var(--button-bg-danger-normal);
  color: var(--button-content-danger-normal);
}

.button--danger:hover:not(.button--disabled) {
  background-color: var(--button-bg-danger-hover);
  color: var(--button-content-danger-hover);
}

.button--danger:active:not(.button--disabled) {
  background-color: var(--button-bg-danger-pressed);
  color: var(--button-content-danger-pressed);
}

.button--danger.button--disabled {
  background-color: var(--button-bg-danger-disable);
  color: var(--button-content-danger-disable);
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
</style>`

// Playground configuration
const playgroundConfig = {
  name: 'Button',
  supportsPlatform: true,
  props: {
    variant: {
      label: 'Variant',
      type: 'select' as const,
      defaultValue: 'default',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Primary', value: 'primary' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'AI', value: 'ai' },
        { label: 'Danger', value: 'danger' },
        { label: 'Link', value: 'link' },
      ]
    },
    size: {
      label: 'Size',
      type: 'select' as const,
      defaultValue: 'medium',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
      ]
    },
    disabled: {
      label: 'Disabled',
      type: 'boolean' as const,
      defaultValue: false
    },
    text: {
      label: 'Text Mode',
      type: 'boolean' as const,
      defaultValue: false
    },
    loading: {
      label: 'Loading State',
      type: 'boolean' as const,
      defaultValue: false
    },
    iconOnly: {
      label: 'Icon Only',
      type: 'boolean' as const,
      defaultValue: false
    },
  },
  slots: {
    default: {
      label: 'Button Text',
      defaultValue: 'Save changes'
    }
  }
}

// Example code
const defaultUsage = `<Button variant="secondary" size="medium">Save changes</Button>`

const variantsUsage = `<Button variant="default">Default</Button>
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ai">AI</Button>
<Button variant="danger">Danger</Button>
<Button variant="link">Link</Button>`

const sizesUsage = `<Button size="small">Small</Button>
<Button size="medium">Medium</Button>
<Button size="large">Large</Button>`

const disabledUsage = `<Button variant="secondary" disabled>Secondary</Button>
<Button variant="default" disabled>Default</Button>`

const textUsage = `<Button variant="primary" text>Primary Text</Button>
<Button variant="secondary" text>Secondary Text</Button>`

const loadingUsage = `<Button variant="secondary" :loading="true">Loading...</Button>
<Button variant="default" :loading="true">Processing</Button>`

const withIconUsage = `<script setup>
import CrownIcon from '~/components/icon/fw-icons/crown.svg?raw'
import AddIcon from '~/components/icon/fw-icons/add.svg?raw'
import MailIcon from '~/components/icon/fw-icons/mail.svg?raw'
import TrashIcon from '~/components/icon/fw-icons/trash.svg?raw'
<\/script>

<template>
  <Button variant="primary">
    <template #icon-left>
      <div style="width: 16px; height: 16px;" v-html="CrownIcon" />
    </template>
    Upgrade
  </Button>

  <Button variant="secondary">
    <template #icon-left>
      <div style="width: 16px; height: 16px;" v-html="AddIcon" />
    </template>
    Add Member
  </Button>

  <Button variant="default">
    <template #icon-left>
      <div style="width: 16px; height: 16px;" v-html="MailIcon" />
    </template>
    Email
  </Button>

  <Button variant="danger">
    <template #icon-left>
      <div style="width: 16px; height: 16px;" v-html="TrashIcon" />
    </template>
    Delete
  </Button>
</template>`

const iconOnlyUsage = `<script setup>
import MoreIcon from '~/components/icon/fw-icons/more.svg?raw'
import SettingIcon from '~/components/icon/fw-icons/setting.svg?raw'
import TrashIcon from '~/components/icon/fw-icons/trash.svg?raw'
<\/script>

<template>
  <Button variant="default" icon-only>
    <div style="width: 16px; height: 16px;" v-html="MoreIcon" />
  </Button>

  <Button variant="secondary" icon-only>
    <div style="width: 16px; height: 16px;" v-html="SettingIcon" />
  </Button>

  <Button variant="danger" icon-only>
    <div style="width: 16px; height: 16px;" v-html="TrashIcon" />
  </Button>
</template>`
</script>

<style scoped>
/* ========== Page Layout ========== */
.doc-page-layout {
  display: flex;
  gap: var(--spacing-size-6xl-48);
  min-height: calc(100vh - 80px);
}

/* xl以下隐藏TOC，单列布局 */
@media (max-width: 1279px) {
  .doc-page-layout {
    gap: 0;
  }
}

.doc-page-content {
  flex: 1;
  min-width: 0;
}

/* ========== Sections ========== */
.doc-section {
  margin-bottom: var(--spacing-margin-margin-xxxl-48);
}

.doc-section h2 {
  margin: 0 0 var(--spacing-margin-margin-l-24) 0;
  font-size: var(--typo-markdown-h2-default-size);
  line-height: var(--typo-markdown-h2-default-lh);
  font-weight: 700;
  color: var(--color-text-primary);
}

.doc-section h3 {
  margin: var(--spacing-margin-margin-xl-32) 0 var(--spacing-margin-margin-m-16) 0;
  font-size: var(--typo-markdown-h3-default-size);
  line-height: var(--typo-markdown-h3-default-lh);
  font-weight: 700;
  color: var(--color-text-primary);
}

.doc-section h3:first-child {
  margin-top: 0;
}

/* ========== Preview Card ========== */
.preview-card {
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-translucent);
  background: var(--color-fill-surfacebright);
  overflow: hidden;
}

.preview-area {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-size-m-16);
  flex-wrap: wrap;
  padding: var(--spacing-padding-xxxl-48);
  background: var(--color-fill-surfacebright);
  min-height: 240px;
}


/* ========== Example Block ========== */
.example-block {
  margin-bottom: var(--spacing-margin-margin-xl-32);
}

.example-block h3 {
  margin: 0 0 var(--spacing-margin-margin-m-16) 0;
  font-size: var(--typo-markdown-h3-default-size);
  line-height: var(--typo-markdown-h3-default-lh);
  font-weight: 700;
  color: var(--color-text-primary);
}

/* ========== API Table ========== */
.api-table {
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-translucent);
  overflow: hidden;
  margin-bottom: var(--spacing-margin-margin-l-16);
}

/* Desktop layout - 完全使用 design tokens */
@media (min-width: 1024px) {
  .api-table {
    border-radius: var(--radius-xl);
    overflow: hidden;
  }

  .api-table__header {
    display: flex;
    align-items: center;
    gap: var(--spacing-size-m-16);
    padding: var(--spacing-padding-m-12) var(--spacing-padding-l-16);
    background-color: var(--color-fill-surfacebright);
    border-bottom: 1px solid var(--color-border-translucent);
  }

  .api-table__header span {
    font-size: var(--typo-interface-desktop-body-body-small-size);
    line-height: var(--typo-interface-desktop-body-body-small-lh);
    font-weight: 600;
    letter-spacing: var(--typo-interface-desktop-body-body-small-ls);
    color: var(--color-text-secondary);
  }

  .api-table__row {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-size-m-16);
    padding: var(--spacing-padding-l-16);
    border-bottom: 1px solid var(--color-border-translucent);
  }

  .api-table__row:last-child {
    border-bottom: none;
  }

  .api-table__row span {
    font-size: var(--typo-interface-desktop-body-body-medium-size);
    line-height: var(--typo-interface-desktop-body-body-medium-lh);
    font-weight: var(--typo-interface-desktop-body-body-medium-weight);
    letter-spacing: var(--typo-interface-desktop-body-body-medium-ls);
  }

  /* 4列布局 (Props) - w-24=96px, w-32=128px */
  .api-table__header span:nth-child(1),
  .api-table__row span:nth-child(1) {
    width: 96px;
    flex-shrink: 0;
  }

  .api-table__header span:nth-child(2),
  .api-table__row span:nth-child(2) {
    width: 128px;
    flex-shrink: 0;
  }

  .api-table__header span:nth-child(3),
  .api-table__row span:nth-child(3) {
    width: 96px;
    flex-shrink: 0;
  }

  .api-table__header span:nth-child(4),
  .api-table__row span:nth-child(4) {
    flex: 1;
    min-width: 0;
  }

  /* 3列布局 (Events) */
  .api-table--3-cols .api-table__header span:nth-child(1),
  .api-table--3-cols .api-table__row span:nth-child(1) {
    width: 96px;
  }

  .api-table--3-cols .api-table__header span:nth-child(2),
  .api-table--3-cols .api-table__row span:nth-child(2) {
    width: 128px;
  }

  .api-table--3-cols .api-table__header span:nth-child(3),
  .api-table--3-cols .api-table__row span:nth-child(3) {
    flex: 1;
  }

  /* 2列布局 (Slots) */
  .api-table--2-cols .api-table__header span:nth-child(1),
  .api-table--2-cols .api-table__row span:nth-child(1) {
    width: 96px;
  }

  .api-table--2-cols .api-table__header span:nth-child(2),
  .api-table--2-cols .api-table__row span:nth-child(2) {
    flex: 1;
  }
}

/* Mobile layout - Card style - 完全使用 design tokens */
@media (max-width: 1023px) {
  .api-table {
    border: none;
    background: transparent;
    margin-bottom: var(--spacing-margin-margin-m-16);
  }

  .api-table__header {
    display: none;
  }

  .api-table__row {
    display: flex;
    flex-direction: column;
    gap: 0;
    padding: 0;
    margin-bottom: var(--spacing-margin-margin-m-16);
    border: 1px solid var(--color-border-translucent);
    border-radius: var(--radius-m-12);
    overflow: hidden;
  }

  .api-table__row:last-child {
    margin-bottom: 0;
  }

  .api-table__row span {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-size-xs-4);
    padding: var(--spacing-padding-m-12);
    border-bottom: 1px solid var(--color-border-translucent);
    font-size: var(--typo-interface-desktop-body-body-medium-size);
    line-height: var(--typo-interface-desktop-body-body-medium-lh);
    font-weight: var(--typo-interface-desktop-body-body-medium-weight);
    letter-spacing: var(--typo-interface-desktop-body-body-medium-ls);
  }

  .api-table__row span:last-child {
    border-bottom: none;
  }

  .api-table__row span::before {
    content: attr(data-label);
    font-size: var(--typo-interface-desktop-body-body-small-size);
    line-height: var(--typo-interface-desktop-body-body-small-lh);
    font-weight: var(--typo-interface-desktop-body-body-small-weight);
    letter-spacing: var(--typo-interface-desktop-body-body-small-ls);
    color: var(--color-text-secondary);
  }
}
</style>
