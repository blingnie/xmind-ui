<script setup lang="ts">
definePageMeta({ layout: 'default' })
const config = {
  name: 'Button',
  description: '基础操作按钮，支持三种视觉层级和三种尺寸。',
  props: [
    { name: 'variant', type: 'enum', options: ['solid', 'outline', 'ghost'], default: 'solid', description: '视觉层级' },
    { name: 'size', type: 'enum', options: ['sm', 'md', 'lg'], default: 'md', description: '尺寸' },
    { name: 'disabled', type: 'boolean', default: false, description: '禁用状态' },
  ],
  slots: [{ name: 'default', defaultContent: 'Button' }],
}
</script>
<template>
  <div class="px-10 py-8 max-w-3xl">
    <h1 class="text-xl font-semibold mb-1">Button</h1>
    <p class="text-sm text-[var(--color-text-tertiary)] mb-6">{{ config.description }}</p>
    <Playground :config="config">
      <template #default="{ currentProps, slotContent }">
        <button
          :disabled="currentProps.disabled"
          class="inline-flex items-center justify-center font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none"
          :class="[
            currentProps.size === 'sm' ? 'h-7 px-3 text-sm rounded-lg' : currentProps.size === 'lg' ? 'h-10 px-5 text-base rounded-xl' : 'h-8 px-4 text-sm rounded-lg',
            currentProps.variant === 'solid' ? 'bg-[var(--color-fill-accent-normal)] text-[var(--color-text-invert)]' : currentProps.variant === 'outline' ? 'border border-[var(--color-border-default)] text-[var(--color-text-primary)]' : 'text-[var(--color-text-primary)] hover:bg-[var(--color-fill-secondary)]'
          ]"
        >{{ slotContent }}</button>
      </template>
    </Playground>
    <div class="mt-8">
      <h2 class="text-sm font-semibold mb-3">Props</h2>
      <div class="rounded-xl border border-[var(--color-border-translucent)] overflow-hidden">
        <div class="grid grid-cols-[1fr_1fr_1fr_2fr] gap-4 px-4 py-2 bg-[var(--color-fill-secondary)] text-xs text-[var(--color-text-tertiary)] font-medium">
          <span>Name</span><span>Type</span><span>Default</span><span>Description</span>
        </div>
        <div class="divide-y divide-[var(--color-border-translucent)]">
          <div v-for="prop in config.props" :key="prop.name" class="grid grid-cols-[1fr_1fr_1fr_2fr] gap-4 px-4 py-2.5 items-center">
            <span class="text-sm font-mono">{{ prop.name }}</span>
            <span class="text-xs font
mkdir -p ~/Documents/xmind-ui/docs/assets/css
cat > ~/Documents/xmind-ui/docs/assets/css/main.css << 'EOF'
@import "tailwindcss";

*, *::before, *::after { box-sizing: border-box; }
html { -webkit-font-smoothing: antialiased; }
body {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
}
