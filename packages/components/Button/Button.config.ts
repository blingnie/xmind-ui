import type { ComponentConfig } from '../types/component-config'
import extractedTokens from './Button.tokens.json'

export const buttonConfig: ComponentConfig = {
  name: 'Button',
  description: 'A versatile button component with multiple variants and sizes, built with design tokens for consistent styling across light and dark themes.',
  props: {
    variant: {
      type: 'select',
      label: 'Variant',
      defaultValue: 'default',
      description: 'The visual style variant of the button',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Primary', value: 'primary' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'AI', value: 'ai' },
        { label: 'Danger', value: 'danger' },
        { label: 'Link', value: 'link' },
      ],
    },
    size: {
      type: 'select',
      label: 'Size',
      defaultValue: 'medium',
      description: 'The size of the button',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
      ],
    },
    disabled: {
      type: 'boolean',
      label: 'Disabled',
      defaultValue: false,
      description: 'Whether the button is disabled',
    },
    text: {
      type: 'boolean',
      label: 'Text Button',
      defaultValue: false,
      description: 'Render as a text button without background or border',
    },
  },
  events: [
    {
      name: 'click',
      payload: 'MouseEvent',
      description: 'Emitted when the button is clicked (not emitted when disabled)',
    },
  ],
  slots: {
    default: {
      label: 'Button Text',
      defaultValue: 'Click me',
    },
  },
  // 自动从 Button.vue 中提取的真实 tokens
  tokens: extractedTokens,
  figmaUrl: 'https://figma.com/design/YOUR_FILE_KEY/Button',
}
