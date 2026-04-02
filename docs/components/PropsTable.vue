<template>
  <div class="props-table">
    <h2 class="text-base font-semibold mb-4">Props</h2>
    <div class="rounded-xl border border-[var(--color-border-translucent)] overflow-hidden">
      <div class="grid grid-cols-[1fr_1fr_2fr] gap-4 px-4 py-2 bg-[var(--color-fill-secondary)] text-xs text-[var(--color-text-tertiary)] font-medium">
        <span>Name</span>
        <span>Type</span>
        <span>Description</span>
      </div>
      <div class="divide-y divide-[var(--color-border-translucent)]">
        <div
          v-for="(prop, propName) in props.config.props"
          :key="propName"
          class="grid grid-cols-[1fr_1fr_2fr] gap-4 px-4 py-3 items-center"
        >
          <span class="text-sm font-mono">{{ propName }}</span>
          <span class="text-sm font-mono text-[var(--color-text-tertiary)]">{{ formatType(prop) }}</span>
          <span class="text-sm">{{ formatDescription(prop, propName) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComponentConfig, PropControl } from '../../packages/components/types/component-config'

const props = defineProps<{
  config: ComponentConfig
}>()

function formatType(prop: PropControl): string {
  if (prop.type === 'boolean') {
    return 'boolean'
  } else if (prop.type === 'number') {
    return 'number'
  } else if (prop.type === 'text') {
    return 'string'
  } else if (prop.type === 'select' && prop.options) {
    // Format as union type: 'option1' | 'option2' | 'option3'
    return prop.options.map(opt => {
      const value = opt.value
      if (typeof value === 'string') {
        return `'${value}'`
      }
      return String(value)
    }).join(' | ')
  }
  return 'any'
}

function formatDescription(prop: PropControl, propName: string): string {
  const parts: string[] = []

  // Add custom description if provided
  if (prop.description) {
    parts.push(prop.description)
  }

  // Add default value info
  if (prop.defaultValue !== undefined) {
    const defaultStr = typeof prop.defaultValue === 'string'
      ? `'${prop.defaultValue}'`
      : String(prop.defaultValue)
    parts.push(`Default: ${defaultStr}`)
  }

  // Add required info
  if (prop.required) {
    parts.push('Required')
  }

  return parts.join('. ') || `The ${propName} prop`
}
</script>

<style scoped>
.props-table {
  margin-top: 3rem;
}
</style>
