<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { getTypoGroups } = useTokens()
const typoGroups = getTypoGroups()
const activeGroup = ref(typoGroups[0]?.group ?? '')

function formatNumber(num: number, decimals = 0): string {
  return Number(num.toFixed(decimals)).toString()
}

const copied = ref('')
async function copy(text: string) {
  await navigator.clipboard.writeText(text)
  copied.value = text
  setTimeout(() => { copied.value = '' }, 1200)
}
</script>
<template>
  <div class="px-10 py-8 max-w-5xl">
    <h1 class="text-xl font-semibold mb-1">Typography</h1>
    <p class="text-sm text-[var(--color-text-tertiary)] mb-6">Typography scale and specifications using the NeverMind UI font family. Each token defines font size, line height, letter spacing, and weight for consistent text styling across interfaces.</p>
    <div class="border-b border-[var(--color-border-translucent)] mb-6">
      <div class="flex gap-1 flex-wrap -mb-px">
        <button
          v-for="{ group } in typoGroups"
          :key="group"
          class="px-4 py-2 text-sm font-medium transition-all relative"
          :class="activeGroup === group
            ? 'text-[var(--color-fill-brand)] border-b-2 border-[var(--color-fill-brand)]'
            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border-b-2 border-transparent'"
          @click="activeGroup = group"
        >
          {{ group }}
        </button>
      </div>
    </div>
    <div v-for="{ group, tokens } in typoGroups" v-show="activeGroup === group" :key="group">
      <div class="rounded-xl border border-[var(--color-border-translucent)] overflow-hidden">
        <div class="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_2fr] gap-4 px-4 py-2 bg-[var(--color-fill-secondary)] text-xs text-[var(--color-text-tertiary)] font-medium">
          <span>Preview / Name</span><span>Size</span><span>Line Height</span><span>Letter Spacing</span><span>Weight</span><span>Token</span>
        </div>
        <div class="divide-y divide-[var(--color-border-translucent)]">
          <div v-for="token in tokens" :key="token.name" class="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_2fr] gap-4 px-4 py-3 items-center">
            <div class="text-left min-w-0">
              <div
                :style="{ fontSize: `${token.fontSize}px`, lineHeight: token.lineHeightUnit === 'PIXELS' ? `${token.lineHeight}px` : `${token.lineHeight}%`, fontWeight: token.fontWeight }"
                :class="token.name.includes('Code block') ? 'font-mono' : ''"
                class="truncate mb-0.5"
              >{{ token.name.includes('Code block') ? 'Code' : 'Aa' }}</div>
              <span class="text-xs text-[var(--color-text-tertiary)] font-mono truncate block">{{ token.name }}</span>
            </div>
            <span class="text-xs font-mono text-[var(--color-text-secondary)]">{{ token.fontSize }}px</span>
            <span class="text-xs font-mono text-[var(--color-text-secondary)]">{{ formatNumber(token.lineHeight, token.lineHeightUnit === 'PIXELS' ? 0 : 0) }}{{ token.lineHeightUnit === 'PIXELS' ? 'px' : '%' }}</span>
            <span class="text-xs font-mono text-[var(--color-text-secondary)]">{{ formatNumber(token.letterSpacing, 1) }}{{ token.letterSpacingUnit === 'PERCENT' ? '%' : 'px' }}</span>
            <span class="text-xs font-mono text-[var(--color-text-secondary)]">{{ token.fontWeight }}</span>
            <button class="text-xs font-mono text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] text-left truncate" @click="copy(`var(${token.varName})`)">
              {{ copied === `var(${token.varName})` ? '✓ copied' : token.varName }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
