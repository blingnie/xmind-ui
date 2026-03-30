<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { getRadiusTokens } = useTokens()
const tokens = getRadiusTokens()
const copied = ref('')
async function copy(text) {
  await navigator.clipboard.writeText(text)
  copied.value = text
  setTimeout(() => { copied.value = '' }, 1200)
}
</script>
<template>
  <div class="px-10 py-8 max-w-5xl">
    <h1 class="text-xl font-semibold mb-1">Radius</h1>
    <p class="text-sm text-[var(--color-text-tertiary)] mb-6">Border radius tokens for creating rounded corners with consistent curvature across components. All values are measured in pixels.</p>
    <div class="flex flex-wrap gap-6">
      <button v-for="token in tokens" :key="token.varName" class="flex flex-col items-center gap-2 p-4 rounded-xl border border-[var(--color-border-translucent)] hover:shadow-[var(--shadow-l2)] transition-shadow w-32" @click="copy(`var(${token.varName})`)">
        <div class="w-16 h-16 border-2 border-[var(--color-fill-accent-normal)]" :style="{ borderRadius: `${token.value}px` }" />
        <span class="text-sm font-mono">{{ token.value }}px</span>
        <span class="text-xs text-[var(--color-text-tertiary)] text-center leading-tight">{{ copied === `var(${token.varName})` ? '✓ copied' : token.name }}</span>
      </button>
    </div>
  </div>
</template>
