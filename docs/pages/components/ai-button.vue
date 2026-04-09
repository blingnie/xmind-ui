<template>
  <div class="doc-page-layout">
    <!-- Main Content -->
    <div class="doc-page-content">
      <h1 class="text-xl">AI Button</h1>
      <p class="text-sm text-[var(--color-text-tertiary)]" style="margin-bottom: 0;">A button component designed for AI-specific interactions. Supports four visual variants — default (purple), secondary, outline, and muted — with an optional active state for toggle-style controls.</p>

      <!-- Figma Link -->
      <PlatformLink
        href="https://www.figma.com/design/1Zb3WXCH66yxr6O4i7DFDg/xmind-UI-Components?node-id=14464-15088"
        label="Figma"
        :icon="FigmaIcon"
      />

      <!-- Default preview -->
      <section id="preview" class="doc-section">
        <div class="preview-card">
          <PreviewArea>
            <AiButton variant="default" size="medium">AI Generate</AiButton>
          </PreviewArea>
          <div class="pt-2 px-4 pb-4 border-t border-[var(--color-border-translucent)]">
            <Tabs v-model="activeTab" :tabs="['Usage', 'Source']" />
            <SimpleCodeBlock :code="activeTab === 'Usage' ? defaultUsage : componentSource" language="vue" height="280px" />
          </div>
        </div>
      </section>

      <!-- Playground -->
      <section id="playground" class="doc-section">
        <h2>Playground</h2>
        <Playground :config="playgroundConfig">
          <template #default="{ props, slots }">
            <AiButton v-bind="props">
              <template v-if="props.iconOnly">
                <span v-html="SparkleIcon" />
              </template>
              <template v-else>
                {{ slots.default }}
              </template>
            </AiButton>
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
            <span data-label="Type"><code>AiButtonVariant</code></span>
            <span data-label="Default"><code>'default'</code></span>
            <span data-label="Description">The visual style variant of the button</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>size</code></span>
            <span data-label="Type"><code>AiButtonSize</code></span>
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
            <span data-label="Name"><code>active</code></span>
            <span data-label="Type"><code>boolean</code></span>
            <span data-label="Default"><code>false</code></span>
            <span data-label="Description">Active state for outline and muted variants, renders a purple highlight</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>iconOnly</code></span>
            <span data-label="Type"><code>boolean</code></span>
            <span data-label="Default"><code>false</code></span>
            <span data-label="Description">Render as a square icon-only button</span>
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
            <PreviewArea>
              <AiButton variant="default">Default</AiButton>
              <AiButton variant="secondary">Secondary</AiButton>
              <AiButton variant="outline">Outline</AiButton>
              <AiButton variant="muted">Muted</AiButton>
            </PreviewArea>
            <div class="p-4 border-t border-[var(--color-border-translucent)]">
              <SimpleCodeBlock :code="variantsUsage" language="vue" />
            </div>
          </div>
        </div>

        <!-- Sizes -->
        <div id="example-sizes" class="example-block">
          <h3>Sizes</h3>
          <div class="preview-card">
            <PreviewArea>
              <AiButton size="small">Small</AiButton>
              <AiButton size="medium">Medium</AiButton>
              <AiButton size="large">Large</AiButton>
            </PreviewArea>
            <div class="p-4 border-t border-[var(--color-border-translucent)]">
              <SimpleCodeBlock :code="sizesUsage" language="vue" />
            </div>
          </div>
        </div>

        <!-- Disabled -->
        <div id="example-disabled" class="example-block">
          <h3>Disabled</h3>
          <div class="preview-card">
            <PreviewArea>
              <AiButton variant="default" disabled>Default</AiButton>
              <AiButton variant="secondary" disabled>Secondary</AiButton>
              <AiButton variant="outline" disabled>Outline</AiButton>
              <AiButton variant="muted" disabled>Muted</AiButton>
            </PreviewArea>
            <div class="p-4 border-t border-[var(--color-border-translucent)]">
              <SimpleCodeBlock :code="disabledUsage" language="vue" />
            </div>
          </div>
        </div>

        <!-- Active -->
        <div id="example-active" class="example-block">
          <h3>Active State</h3>
          <div class="preview-card">
            <PreviewArea>
              <AiButton variant="outline" active>Outline Active</AiButton>
              <AiButton variant="muted" active>Muted Active</AiButton>
            </PreviewArea>
            <div class="p-4 border-t border-[var(--color-border-translucent)]">
              <SimpleCodeBlock :code="activeUsage" language="vue" />
            </div>
          </div>
        </div>

        <!-- With Icon -->
        <div id="example-with-icon" class="example-block">
          <h3>With Icon</h3>
          <div class="preview-card">
            <PreviewArea>
              <AiButton variant="default">
                <template #icon-left>
                  <span v-html="SparkleIcon" />
                </template>
                AI Generate
              </AiButton>
              <AiButton variant="secondary">
                <template #icon-left>
                  <span v-html="SparkleIcon" />
                </template>
                AI Assist
              </AiButton>
              <AiButton variant="outline">
                <template #icon-left>
                  <span v-html="SettingIcon" />
                </template>
                Settings
              </AiButton>
              <AiButton variant="muted">
                <template #icon-left>
                  <span v-html="AttachmentIcon" />
                </template>
                Attachment
              </AiButton>
            </PreviewArea>
            <div class="p-4 border-t border-[var(--color-border-translucent)]">
              <SimpleCodeBlock :code="withIconUsage" language="vue" />
            </div>
          </div>
        </div>

        <!-- Icon Only -->
        <div id="example-icon-only" class="example-block">
          <h3>Icon Only</h3>
          <div class="preview-card">
            <PreviewArea>
              <AiButton variant="default" icon-only>
                <span v-html="SparkleIcon" />
              </AiButton>
              <AiButton variant="secondary" icon-only>
                <span v-html="SettingIcon" />
              </AiButton>
              <AiButton variant="outline" icon-only>
                <span v-html="MoreIcon" />
              </AiButton>
              <AiButton variant="muted" icon-only>
                <span v-html="TrashIcon" />
              </AiButton>
            </PreviewArea>
            <div class="p-4 border-t border-[var(--color-border-translucent)]">
              <SimpleCodeBlock :code="iconOnlyUsage" language="vue" />
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Table of Contents -->
    <DocTableOfContents :items="tocItems" class="hidden xl:block" />
  </div>
</template>

<script setup lang="ts">
import AiButton from '../../../packages/components/AiButton/AiButton.vue'
import SimpleCodeBlock from '~/components/SimpleCodeBlock.vue'
import Tabs from '~/components/Tabs.vue'
import Playground from '~/components/Playground.vue'
import DocTableOfContents from '~/components/DocTableOfContents.vue'
import PlatformLink from '~/components/PlatformLink.vue'
import PreviewArea from '~/components/PreviewArea.vue'

// Import icons
import SparkleIcon from '~/components/icon/fw-icons/xmind-ai.svg?raw'
import SettingIcon from '~/components/icon/fw-icons/setting.svg?raw'
import MoreIcon from '~/components/icon/fw-icons/more.svg?raw'
import TrashIcon from '~/components/icon/fw-icons/trash.svg?raw'
import AttachmentIcon from '~/components/icon/fw-icons/attachment.svg?raw'

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
  { id: 'example-active', text: 'Active State', level: 3 },
  { id: 'example-with-icon', text: 'With Icon', level: 3 },
  { id: 'example-icon-only', text: 'Icon Only', level: 3 },
])

// Full source code
const componentSource = `<template>
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
    \`ai-button--\${props.variant}\`,
    \`ai-button--\${props.size}\`,
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
<\/script>`

// Playground configuration
const playgroundConfig = {
  name: 'AiButton',
  props: {
    variant: {
      label: 'Variant',
      type: 'select' as const,
      defaultValue: 'default',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Outline', value: 'outline' },
        { label: 'Muted', value: 'muted' },
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
    active: {
      label: 'Active',
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
      defaultValue: 'AI Generate'
    }
  }
}

// Example code
const defaultUsage = `<AiButton variant="default" size="medium">AI Generate</AiButton>`

const variantsUsage = `<AiButton variant="default">Default</AiButton>
<AiButton variant="secondary">Secondary</AiButton>
<AiButton variant="outline">Outline</AiButton>
<AiButton variant="muted">Muted</AiButton>`

const sizesUsage = `<AiButton size="small">Small</AiButton>
<AiButton size="medium">Medium</AiButton>
<AiButton size="large">Large</AiButton>`

const disabledUsage = `<AiButton variant="default" disabled>Default</AiButton>
<AiButton variant="secondary" disabled>Secondary</AiButton>
<AiButton variant="outline" disabled>Outline</AiButton>
<AiButton variant="muted" disabled>Muted</AiButton>`

const activeUsage = `<AiButton variant="outline" active>Outline Active</AiButton>
<AiButton variant="muted" active>Muted Active</AiButton>`

const withIconUsage = `<script setup>
import SparkleIcon from '~/components/icon/fw-icons/xmind-ai.svg?raw'
import SettingIcon from '~/components/icon/fw-icons/setting.svg?raw'
import AttachmentIcon from '~/components/icon/fw-icons/attachment.svg?raw'
<\/script>

<template>
  <AiButton variant="default">
    <template #icon-left>
      <span v-html="SparkleIcon" />
    </template>
    AI Generate
  </AiButton>

  <AiButton variant="secondary">
    <template #icon-left>
      <span v-html="SparkleIcon" />
    </template>
    AI Assist
  </AiButton>

  <AiButton variant="outline">
    <template #icon-left>
      <span v-html="SettingIcon" />
    </template>
    Settings
  </AiButton>

  <AiButton variant="muted">
    <template #icon-left>
      <span v-html="AttachmentIcon" />
    </template>
    Attachment
  </AiButton>
</template>`

const iconOnlyUsage = `<script setup>
import SparkleIcon from '~/components/icon/fw-icons/xmind-ai.svg?raw'
import SettingIcon from '~/components/icon/fw-icons/setting.svg?raw'
import MoreIcon from '~/components/icon/fw-icons/more.svg?raw'
import TrashIcon from '~/components/icon/fw-icons/trash.svg?raw'
<\/script>

<template>
  <AiButton variant="default" icon-only>
    <span v-html="SparkleIcon" />
  </AiButton>

  <AiButton variant="secondary" icon-only>
    <span v-html="SettingIcon" />
  </AiButton>

  <AiButton variant="outline" icon-only>
    <span v-html="MoreIcon" />
  </AiButton>

  <AiButton variant="muted" icon-only>
    <span v-html="TrashIcon" />
  </AiButton>
</template>`
</script>
