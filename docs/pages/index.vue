<script setup lang="ts">
definePageMeta({ layout: 'default' })
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold">Xmind UI Kit</h1>
    <p class="text-[var(--color-text-secondary)] text-base">
      Xmind 设计系统文档。产品、设计、开发共享同一份真相。
    </p>

    <div class="grid grid-cols-2 gap-3">
      <NuxtLink
        to="/tokens/colors"
        class="p-4 rounded-xl border border-[var(--color-border-translucent)] bg-[var(--color-fill-surfacebright)] hover:shadow-[var(--shadow-l2)] transition-shadow"
      >
        <p class="text-sm font-medium mb-1">Foundation</p>
        <p class="text-xs text-[var(--color-text-tertiary)]">色板、字体、间距、圆角</p>
      </NuxtLink>
      <NuxtLink
        to="/components/button"
        class="p-4 rounded-xl border border-[var(--color-border-translucent)] bg-[var(--color-fill-surfacebright)] hover:shadow-[var(--shadow-l2)] transition-shadow"
      >
        <p class="text-sm font-medium mb-1">Components</p>
        <p class="text-xs text-[var(--color-text-tertiary)]">可复用 UI 组件</p>
      </NuxtLink>
    </div>
  </div>
</template>
