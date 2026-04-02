<template>
  <div class="flex items-center justify-center gap-2 text-desktop-body-small">
    <button :class="paginationButtonClass" :disabled="currentPage <= 1" @click="$emit('go-to-page', 1)">
      <fw-icon name="chevron-double-backforward" :width="16" :height="16" class="pointer-events-none" />
    </button>
    <button :class="paginationButtonClass" :disabled="currentPage <= 1" @click="$emit('go-to-page', currentPage - 1)">
      <fw-icon name="chevron-backward" :width="16" :height="16" class="pointer-events-none" />
    </button>
    <span class="px-3 text-text-primary-light dark:text-text-primary-dark"> {{ currentPage }}/{{ totalPages }} </span>
    <button :class="paginationButtonClass" :disabled="currentPage >= totalPages" @click="$emit('go-to-page', currentPage + 1)">
      <fw-icon name="chevron-forward" :width="16" :height="16" class="pointer-events-none" />
    </button>
    <button :class="paginationButtonClass" :disabled="currentPage >= totalPages" @click="$emit('go-to-page', totalPages)">
      <fw-icon name="chevron-double-forward" :width="16" :height="16" class="pointer-events-none" />
    </button>
  </div>
</template>

<script setup lang="ts">
import clsx from 'clsx'
import { computed } from 'vue'

defineProps<{
  currentPage: number
  totalPages: number
}>()

defineEmits<{
  (e: 'go-to-page', page: number): void
}>()

const paginationButtonClass = computed(() =>
  clsx(
    'rounded-xl bg-fill-surfaceDim-light dark:bg-fill-surfaceDim-dark p-[6px] transition-colors cursor-pointer hover:bg-mask-overlay-s-light active:bg-mask-overlay-m-light dark:hover:bg-mask-overlay-s-dark dark:active:bg-mask-overlay-m-dark disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-30',
  ),
)
</script>
