<template>
  <div>
    <h1 class="text-xl font-semibold">Button</h1>
    <p class="text-sm text-[var(--color-text-tertiary)]">Buttons are commonly used for key actions such as submit, confirm, create, switch, invoke tools, or advance workflows. In editing and property-panel contexts, Button often serves as a high-frequency entry point (e.g., apply, reset, add, more tools) or a decision checkpoint, requiring a balanced emphasis between accessibility, error prevention, and visual priority.</p>

      <!-- 默认预览 -->
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
            <Button v-bind="props">{{ slots.default }}</Button>
          </template>
        </Playground>
      </section>

      <!-- API 参考 -->
      <section id="api" class="doc-section">
        <h2>API</h2>

        <!-- Props -->
        <h3 id="props">Props</h3>
        <div class="api-table-wrapper">
          <table class="api-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>variant</code></td>
                <td><code>ButtonVariant</code></td>
                <td><code>'default'</code></td>
                <td>
                  <div class="props-preview">
                    <Button variant="default" size="small">Default</Button>
                    <Button variant="primary" size="small">Primary</Button>
                    <Button variant="secondary" size="small">Secondary</Button>
                    <Button variant="ai" size="small">AI</Button>
                    <Button variant="danger" size="small">Danger</Button>
                    <Button variant="link" size="small">Link</Button>
                  </div>
                </td>
              </tr>
              <tr>
                <td><code>size</code></td>
                <td><code>ButtonSize</code></td>
                <td><code>'medium'</code></td>
                <td>
                  <div class="props-preview">
                    <Button size="small">Small</Button>
                    <Button size="medium">Medium</Button>
                    <Button size="large">Large</Button>
                  </div>
                </td>
              </tr>
              <tr>
                <td><code>disabled</code></td>
                <td><code>boolean</code></td>
                <td><code>false</code></td>
                <td>禁用按钮</td>
              </tr>
              <tr>
                <td><code>text</code></td>
                <td><code>boolean</code></td>
                <td><code>false</code></td>
                <td>文本模式</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Events -->
        <h3 id="events">Events</h3>
        <div class="api-table-wrapper">
          <table class="api-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Payload</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>click</code></td>
                <td><code>MouseEvent</code></td>
                <td>按钮点击事件</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Slots -->
        <h3 id="slots">Slots</h3>
        <div class="api-table-wrapper">
          <table class="api-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>default</code></td>
                <td>按钮内容</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 用法示例 -->
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
              <Button variant="primary" disabled>Primary</Button>
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
      </section>
  </div>
</template>

<script setup lang="ts">
import Button from '../../../packages/components/Button/Button.vue'
import SimpleCodeBlock from '~/components/SimpleCodeBlock.vue'
import Tabs from '~/components/Tabs.vue'
import Playground from '~/components/Playground.vue'

definePageMeta({ layout: 'default' })

const activeTab = ref('Usage')

// 完整源码
const buttonSource = `<template>
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
    \`button--\${props.variant}\`,
    \`button--\${props.size}\`,
    props.text && 'button--text',
    props.disabled && 'button--disabled',
  ].filter(Boolean).join(' ')
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
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
</style>`

// Playground 配置
const playgroundConfig = {
  name: 'Button',
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
  },
  slots: {
    default: {
      label: 'Button Text',
      defaultValue: 'Click me'
    }
  }
}

// 示例代码
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

const disabledUsage = `<Button variant="primary" disabled>Primary</Button>
<Button variant="default" disabled>Default</Button>`

const textUsage = `<Button variant="primary" text>Primary Text</Button>
<Button variant="secondary" text>Secondary Text</Button>`
</script>

<style scoped>
/* ========== 区块 ========== */
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

/* ========== 预览卡片 ========== */
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
  gap: var(--spacing-gap-gap-xs-8);
  flex-wrap: wrap;
  padding: var(--spacing-padding-xxxl-48);
  background: var(--color-fill-surfacebright);
  min-height: 240px;
}

/* ========== API 表格 ========== */
.api-table-wrapper {
  overflow-x: auto;
  margin-bottom: var(--spacing-margin-margin-m-16);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-translucent);
  background: var(--color-fill-surfacebright);
  overflow: hidden;
}

.api-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--typo-interface-desktop-body-body-medium-size);
  line-height: var(--typo-interface-desktop-body-body-medium-lh);
}

.api-table th {
  text-align: left;
  padding: var(--spacing-padding-xs-4) var(--spacing-padding-m-12);
  background: var(--color-fill-surfacebright);
  color: var(--color-text-secondary);
  font-weight: 600;
  font-size: var(--typo-interface-desktop-caption-caption-large-size);
  border-bottom: 1px solid var(--color-border-translucent);
}

.api-table td {
  padding: var(--spacing-padding-xs-4) var(--spacing-padding-m-12);
  border-bottom: 1px solid var(--color-border-translucent);
  color: var(--color-text-primary);
  vertical-align: top;
}

.api-table tbody tr:last-child td {
  border-bottom: none;
}

.api-table code {
  font-family: 'Fira Code', monospace;
  font-size: var(--typo-interface-desktop-caption-caption-small-size);
  color: var(--color-fill-accent-normal);
  background: var(--color-mask-overlays);
  padding: 2px 6px;
  border-radius: var(--radius-xs);
}

.props-preview {
  display: flex;
  gap: var(--spacing-gap-gap-xs-8);
  flex-wrap: wrap;
  margin-top: var(--spacing-margin-margin-xs-8);
}

/* ========== 示例区块 ========== */
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
</style>
