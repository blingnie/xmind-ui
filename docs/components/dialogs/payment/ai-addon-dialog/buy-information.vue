<template>
  <div
    class="border-transparent-dark-3 bg-light-grey-2 dark:border-transparent-white-3 dark:bg-dark-grey-6 flex flex-col items-start gap-8 rounded-xl border border-solid p-6 sm:p-8"
  >
    <h2 class="text-mobile-headline-1 text-dark-grey-5 dark:text-light-grey-6 sm:text-desktop-display-4">{{ '购买信息' }}</h2>
    <div class="flex w-full flex-col items-start gap-4">
      <div class="flex items-center gap-2">
        <h3 class="text-desktop-headline-1 text-dark-grey-8 dark:text-light-grey-1 w-full">{{ 'AI 加量包' }}</h3>
        <span v-if="discountText" class="text-desktop-title-2 text-brand-5 text-nowrap rounded-[99px] bg-[#EAE0FA] px-3 py-1 dark:bg-[#423A54]">{{
          discountText
        }}</span>
      </div>
      <div class="flex w-full flex-col gap-2">
        <span class="text-desktop-body-1 text-dark-grey-5 dark:text-light-grey-6">{{ '购买内容' }}</span>
        <div class="border-brand-6 dark:bg-dark-grey-6 flex w-full items-center justify-between rounded-lg border border-solid bg-white p-4">
          <span class="text-desktop-title-2 text-dark-grey-8 dark:text-light-grey-1">{{ unitsLabel }}</span>
          <div v-if="addon && addon.discount < 1.0" class="flex gap-2">
            <span class="text-desktop-body-1 text-transparent-dark-7 dark:text-transparent-white-7 line-through">{{ originalPriceText }}</span>
            <span class="text-desktop-body-1 text-brand-6 dark:text-brand-4">{{ priceText }}</span>
          </div>
          <span v-else class="text-desktop-body-1 text-dark-grey-8 dark:text-light-grey-1">{{ priceText }}</span>
        </div>
      </div>
      <fw-divider />
      <h3 class="text-desktop-headline-3 text-dark-grey-5 dark:text-light-grey-6">{{ '包含用量' }}</h3>
      <div class="flex w-full justify-between">
        <span class="text-desktop-body-1 text-dark-grey-5 dark:text-light-grey-6">{{ 'AI 功能' }}</span>
        <span class="text-desktop-body-2 text-dark-grey-5 dark:text-light-grey-6">{{ `${aiRequestsNumber}点/份` }}</span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { AiAddonCn } from 'client/server-export'

const props = defineProps<{
  addOns: AiAddonCn[]
}>()

const addon = computed(() => props.addOns?.[0])

const discountText = computed(() => {
  const discount = addon.value?.discount
  if (discount && discount < 1.0) {
    return `${discount * 10}折`
  }
  return undefined
})

const unitsLabel = computed(() => (addon.value ? `${addon.value.extend}份` : ''))

const originalPriceText = computed(() => (addon.value ? `¥${addon.value.original_price}` : ''))

const priceText = computed(() => (addon.value ? `¥${addon.value.price}` : ''))

const aiRequestsNumber = computed(() => addon.value?.included_usage?.find(usage => (usage.name as string) === 'credits')?.value || 0)
</script>
