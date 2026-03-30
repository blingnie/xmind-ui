<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { getEffectTokens } = useTokens()
const lightTokens = getEffectTokens('Light')
const darkTokens = getEffectTokens('Dark')
const activeMode = ref('Light')
const groups = computed(() => {
  const tokens = activeMode.value === 'Light' ? lightTokens : darkTokens
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
    <div class="flex items-center justify-between mb-1">
      <h1 class="text-xl font-semibold">Effects</h1>
      <div class="flex gap-1">
        <button v-for="m in ['Light', 'Dark']" :key="m" class="px-3 py-1 text-xs rounded-lg transition-colors" :class="activeMode === m ? 'bg-[var(--color-fill-brand)] text-[var(--color-text-invert)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-fill-secondary)]'" @click="activeMode = m">{{ m }}</button>
      </div>
    </div>
    <p class="text-sm text-[var(--color-text-tertiary)] mb-6">阴影、模糊参数。</p>
    <div v-for="{ group, items } in groups" :key="group" class="mb-8">
      <p class="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">{{ group }}</p>
      <div class="rounded-xl border border-[var(--color-border-translucent)] overflow-hidden divide-y divide-[var(--color-border-translucent)]">
        <div v-for="token in items" :key="token.varName" class="flex items-center gap-4 px-4 py-2.5 hover:bg-[var(--color-fill-secondary)] transition-colors">
          <div v-if="token.type === 'color'" class="w-6 h-6 rounded-md border border-[var(--color-border-translucent)] shrink-0" :style="{ background: `var(${token.varName})` }" />
          <span v-else class="w-6 h-6 flex items-center justify-center text-[10px] font-mono text-[var(--color-text-tertiary)] shrink-0">{{ token.value }}</span>
          <span class="text-sm text-[var(--color-text-secondary)] flex-1">{{ token.name }}</span>
          <button class="text-xs font-mono text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]" @click="copy(`var(${token.varName})`)">
            {{ copied === `var(${token.varName})` ? '✓ copied' : token.varName }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
