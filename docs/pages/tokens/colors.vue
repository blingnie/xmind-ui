<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { getColorGroups, getAliasTokens } = useTokens()
const colorGroups = getColorGroups()
const aliasTokens = getAliasTokens('Light')
const aliasGroups = computed(() => {
  const map = new Map()
  for (const t of aliasTokens) {
    const group = t.name.split('/')[0]
    if (!map.has(group)) map.set(group, [])
    map.get(group).push(t)
  }
  return Array.from(map.entries()).map(([group, tokens]) => ({ group, tokens }))
})
const copied = ref('')
async function copy(text) {
  await navigator.clipboard.writeText(text)
  copied.value = text
  setTimeout(() => { copied.value = '' }, 1200)
}
function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}
</script>
<template>
  <div class="px-10 py-8 max-w-5xl">
    <h1 class="text-xl font-semibold mb-1">Colors</h1>
    <p class="text-sm text-[var(--color-text-tertiary)] mb-6">Semantic color tokens that automatically adapt between light and dark themes. Click any token to copy the CSS variable name to your clipboard.</p>
    <div v-for="{ group, tokens } in aliasGroups" :key="group" class="mb-6">
      <p class="text-xs font-medium text-[var(--color-text-tertiary)] tracking-wider mb-2">{{ capitalize(group) }}</p>
      <div class="rounded-xl border border-[var(--color-border-translucent)] overflow-hidden divide-y divide-[var(--color-border-translucent)]">
        <div v-for="token in tokens" :key="token.varName" class="flex items-center gap-4 px-4 py-2.5 hover:bg-[var(--color-fill-secondary)] transition-colors">
          <div class="w-7 h-7 rounded-md border border-[var(--color-border-translucent)] shrink-0" :style="{ background: `var(${token.varName})` }" />
          <span class="text-sm flex-1 font-mono">{{ token.name }}</span>
          <button class="text-xs font-mono text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]" @click="copy(token.varName)">
            {{ copied === token.varName ? '✓ copied' : token.varName }}
          </button>
          <span class="text-xs font-mono text-[var(--color-text-tertiary)] w-32 text-right truncate" :title="token.refVar">{{ token.refVar }}</span>
        </div>
      </div>
    </div>
    <h2 class="text-base font-semibold mb-4">Palette</h2>
    <div v-for="{ group, swatches } in colorGroups" :key="group" class="mb-6">
      <p class="text-xs font-medium text-[var(--color-text-tertiary)] tracking-wider mb-2">{{ capitalize(group) }}</p>
      <div class="flex gap-1 flex-wrap">
        <button v-for="swatch in swatches" :key="swatch.varName" class="group flex flex-col items-center gap-1" @click="copy(swatch.varName)">
          <div class="w-9 h-9 rounded-lg border border-[var(--color-border-translucent)] group-hover:scale-110 transition-transform" :style="{ background: swatch.value }" />
          <span class="text-[10px] text-[var(--color-text-tertiary)]">{{ swatch.name.split('/')[1] }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
