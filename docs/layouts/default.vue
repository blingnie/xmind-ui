<script setup lang="ts">
const { theme, toggleTheme } = inject('theme') as any

const nav = [
  {
    group: 'Foundation',
    items: [
      { label: 'Colors', to: '/tokens/colors' },
      { label: 'Typography', to: '/tokens/typography' },
      { label: 'Spacing', to: '/tokens/spacing' },
      { label: 'Radius', to: '/tokens/radius' },
      { label: 'Effects', to: '/tokens/effects' },
    ],
  },
  {
    group: 'Components',
    items: [
      { label: 'Button', to: '/components/button' },
      { label: 'Badge', to: '/components/badge' },
      // 后续新增组件在这里追加
    ],
  },
]
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Sidebar -->
    <aside class="w-56 shrink-0 border-r border-[var(--color-border-translucent)] flex flex-col">
      <!-- Logo -->
      <div class="h-14 flex items-center px-5 border-b border-[var(--color-border-translucent)]">
        <NuxtLink to="/" class="text-sm font-semibold tracking-tight">
          Xmind UI Kit
        </NuxtLink>
      </div>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto py-4 px-3">
        <div v-for="section in nav" :key="section.group" class="mb-5">
          <p class="text-xs font-medium text-[var(--color-text-tertiary)] px-2 mb-1 tracking-wider">
            {{ section.group }}
          </p>
          <ul>
            <li v-for="item in section.items" :key="item.to">
              <NuxtLink
                :to="item.to"
                class="block px-2 py-1.5 text-sm rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-fill-secondary)] transition-colors"
                active-class="text-[var(--color-text-primary)] bg-[var(--color-fill-secondary)] font-medium"
              >
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </nav>
    </aside>

    <!-- Main -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Topbar -->
      <header class="h-14 flex items-center justify-end px-6 border-b border-[var(--color-border-translucent)] gap-3 shrink-0">
        <!-- Theme toggle -->
        <button
          class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--color-fill-secondary)] transition-colors text-[var(--color-text-secondary)]"
          :title="theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'"
          @click="toggleTheme"
        >
          <span v-if="theme === 'light'">🌙</span>
          <span v-else>☀️</span>
        </button>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
