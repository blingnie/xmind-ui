<template>
  <fw-tooltip :content-style="{ 'max-width': '200px', 'white-space': 'normal' }" :disabled="isTooltipDisabled">
    <template #trigger>
      <div>
        <button
          class="flex h-9 flex-row rounded-md border border-solid px-2 sm:h-8"
          :class="
            model
              ? 'border-brand-4 bg-[#751dfb0d] text-brand-6 dark:border-ai-purple-300 dark:bg-[#802ffb1a] dark:text-ai-purple-300'
              : 'border-transparent-dark-3  bg-transparent-dark-1 text-text-secondary-light hover:bg-transparent-dark-2 dark:border-transparent-white-3 dark:bg-transparent-white-1 dark:text-text-secondary-dark dark:hover:bg-transparent-white-2'
          "
          @click="handleClick"
        >
          <div class="flex flex-row items-center gap-1">
            <fw-icon :name="'deepseek-r1'" :width="20" :height="20" />
            <span class="whitespace-nowrap font-NeverMind-UI text-mobile-body-large sm:text-desktop-body-large">{{ $T('Thinking') }}</span>
          </div>
        </button>
      </div>
    </template>
    <template #tooltip>
      <span>{{ '深度思考模式，开启后将消耗 AI 高级功能的次数' }}</span>
    </template>
  </fw-tooltip>
</template>
<script setup lang="ts">
import { REGION } from 'client/constants'
import { computed } from 'vue'

const model = defineModel<boolean>()

const isTooltipDisabled = computed(() => REGION === 'global')

const handleClick = () => {
  model.value = !model.value
}
</script>
