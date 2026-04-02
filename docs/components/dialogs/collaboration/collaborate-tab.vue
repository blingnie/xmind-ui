<template>
  <fw-tab :tabs="tabs" :active="active" @tab-selected="tabSelect">
    <template #afterTabName="props">
      <div v-if="props.tab.key === dotKey" class="relative ml-[6px] h-4 w-4">
        <bounce-dot :size="16" :color="'#FA4A1E'" />
      </div>
    </template>
  </fw-tab>
</template>

<script setup lang="ts">
import bounceDot from 'client/components/bounce-dot.vue'

defineProps<{
  tabs: { key: string; name: string }[]
  dotKey?: string
  active: string
}>()

const emit = defineEmits<{
  (e: 'tab-selected', v: string): void
}>()

const tabSelect = (tab: string) => {
  emit('tab-selected', tab)
}
</script>
