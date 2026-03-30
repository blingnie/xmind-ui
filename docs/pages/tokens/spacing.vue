<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { getSpacingTokens } = useTokens()
const tokens = getSpacingTokens()
const groups = computed(() => {
  const map = new Map()
  for (const t of tokens) {
    const group = t.name.split('/')[0]
    if (!map.has(group)) map.set(group, [])
    map.get(group).push(t)
  }
  return Array.from(map.entries()).map(([group, items]) => ({ group, items }))
})
const copied = ref('')
async function copy(text) {
  await navigator.clipboard.writeText(text)
  copied.value = text
  setTimeout(() => { copied.value = '' }, 1200)
}
</script>
<template>
  <div class="px-10 py-8 max-w-3xl">
    <h1 class="text-xl font-semibold mb-1">Spacing</h1>
    <p class="text-sm text-[var(--color-text-tertiary)] mb-6">Spacing tokens define consistent margin and padding values throughout the interface. All values are measured in pixels for precise layout control.</p>
    <div v-for="{ group, items } in groups" :key="group" class="mb-8">
      <p class="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">{{ group }}</p>
      <div class="rounded-xl border border-[var(--color-border-translucent)] overflow-hidden divide-y divide-[var(--color-border-translucent)]">
        <div v-for="token in items" :key="token.varName" class="flex items-center gap-4 px-4 py-2.5 hover:bg-[var(--color-fill-secondary)] transition-colors">
          <div class="w-32 shrink-0 flex items-center justify-center">
            <div class="h-6 rounded" style="background: rgb(59, 130, 246);" :style="{ width: `${Math.min(token.value, 128)}px` }" />
          </div>
          <span class="text-sm font-mono w-14 shrink-0 font-semibold">{{ token.value }}px</span>
          <span class="text-sm text-[var(--color-text-secondary)] flex-1">{{ token.name.split('/')[1] ?? token.name }}</span>
          <button class="text-xs font-mono text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]" @click="copy(`var(${token.varName})`)">
            {{ copied === `var(${token.varName})` ? '✓ copied' : token.varName }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
