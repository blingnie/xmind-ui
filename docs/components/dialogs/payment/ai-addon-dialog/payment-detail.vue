<template>
  <div
    class="border-transparent-dark-3 bg-light-grey-2 dark:border-transparent-white-3 dark:bg-dark-grey-6 flex flex-col items-start gap-8 rounded-xl border border-solid p-6 sm:p-8"
  >
    <h2 class="text-mobile-headline-1 text-dark-grey-5 dark:text-light-grey-6 sm:text-desktop-display-4">{{ $T('Payment Details') }}</h2>
    <div class="flex w-full flex-col gap-3">
      <div class="flex w-full justify-between">
        <span class="text-desktop-body-1 text-dark-grey-5 dark:text-light-grey-6">{{ '原价' }}</span>
        <span class="text-desktop-body-2 text-dark-grey-5 dark:text-light-grey-6">{{ originalPriceText }}</span>
      </div>
      <div v-if="discountPriceText" class="flex w-full justify-between">
        <span class="text-desktop-body-1 text-dark-grey-5 dark:text-light-grey-6">{{ '优惠' }}</span>
        <span class="text-desktop-body-2 text-dark-grey-5 dark:text-light-grey-6">{{ discountPriceText }}</span>
      </div>
      <fw-divider />
      <div class="flex w-full justify-between">
        <span class="text-desktop-headline-1 text-dark-grey-8 dark:text-light-grey-1">{{ '合计' }}</span>
        <span class="text-desktop-headline-1 text-dark-grey-8 dark:text-light-grey-1">{{ priceText }}</span>
      </div>
    </div>
    <div class="flex w-full flex-col gap-6">
      <div class="flex gap-4">
        <div class="flex items-center">
          <fw-radio v-model="selectedPayMethod" :value="'wechat-pay'" :disabled="false" />
          <span class="text-desktop-body-3 ml-2">{{ '微信支付' }}</span>
        </div>
        <div class="flex items-center">
          <fw-radio v-model="selectedPayMethod" :value="'alipay'" :disabled="false" />
          <span class="text-desktop-body-3 ml-2">{{ '支付宝支付' }}</span>
        </div>
      </div>
      <fw-button :theme="'ai'" :size="'large'" class="w-full" :disabled="isCreatingOrder" @click="handlePurchase">
        <span v-if="!isCreatingOrder">{{ '付款' }}</span>
        <ellipsis-loading v-else />
      </fw-button>
    </div>
    <div>
      <ul class="text-desktop-caption-1 text-transparent-dark-6 dark:text-transparent-white-6 pl-[18px]">
        <li>
          {{ 'AI 包含的具体功能见：' }}
          <a href="https://xmind.cn/pricing/" target="_blank" class="text-transparent-dark-8 dark:text-transparent-white-8">{{
            'https://xmind.cn/pricing/'
          }}</a>
        </li>
        <li>{{ '订阅之日起享受 7天无理由退款服务' }}</li>
        <li>{{ '加量包有效期为 12 个月，自购买成功之日起计算。' }}</li>
        <li>{{ '在有效期内再次购买加量包，系统会自动将未到期的加量包有效期顺延（以最新一次购买时间为准）。' }}</li>
      </ul>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, ref } from 'vue'
import EllipsisLoading from 'client/components/ellipsis-loading.vue'
import { AiAddonCn, PaymentMethodCn } from 'client/server-export'

const selectedPayMethod = ref<PaymentMethodCn>('wechat-pay')

const props = defineProps<{
  addon?: AiAddonCn
  isCreatingOrder?: boolean
}>()

const emits = defineEmits<{
  (e: 'create-order', payMethod: PaymentMethodCn, addon: AiAddonCn): void
}>()

const handlePurchase = async () => {
  if (!props.addon) {
    return
  }

  emits('create-order', selectedPayMethod.value, props.addon)
}

const originalPriceText = computed(() => {
  return `¥${props.addon.original_price}`
})

const discountPriceText = computed(() => {
  if (props.addon?.discount < 1.0) {
    return `- ¥${props.addon.original_price - props.addon.price}`
  }
  return undefined
})

const priceText = computed(() => {
  return `¥${props.addon.price}`
})
</script>
