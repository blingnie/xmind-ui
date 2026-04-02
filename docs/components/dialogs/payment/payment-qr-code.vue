<template>
  <modal-dialog
    :is-opened="true"
    :close-button="false"
    :dialog-header-class="'!py-0'"
    :dialog-footer-class="'!py-0'"
    :width="274"
    :dialog-class="'rounded-2xl border solid border-transparent-dark-3 dark:border-transparent-dark-3 dark:bg-dark-grey-7 shadow-card-shadow-light dark:shadow-card-shadow-dark'"
    :dialog-body-class="'p-8'"
    @modal-dialog-close="handleClose"
  >
    <div>
      <div class="flex flex-col items-center">
        <div class="flex items-center text-desktop-body-3 text-dark-grey-8 dark:text-light-grey-1">
          <span>{{ '扫一扫付款' }}</span>
          <span>{{ currencyLabel }}</span>
        </div>
        <span class="mt-1 text-desktop-headline-1 text-dark-grey-8 dark:text-light-grey-1">{{ price.toFixed(2) }}</span>
        <div class="my-[10px] rounded-xl bg-transparent-dark-1 p-3 dark:bg-transparent-white-1">
          <img :src="qrCodeImageUrl" alt="" class="h-[176px] w-[176px]" />
        </div>
        <div class="flex items-center gap-1">
          <fw-icon v-if="payMethod === 'wechat-pay'" :name="'wechat-pay'" />
          <fw-icon v-else :name="'alipay'" />
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span class="text-desktop-title-2 text-dark-grey-8 dark:text-light-grey-1" v-html="paymentTips" />
        </div>
      </div>
      <div class="absolute right-4 top-4">
        <close class="self-baseline" @click="handleClose" />
      </div>
    </div>
  </modal-dialog>
</template>
<script lang="ts" setup>
import { computed, onMounted, onUnmounted } from 'vue'
import ModalDialog from 'client/components/new-base-modal-dialog.vue'
import Close from 'client/components/base/close.vue'
import { PaymentMethodCn, TeamMetadata } from 'client/server-export'
import { usePromiseHook } from 'utils/vue-utils'
import { usePaymentClient } from 'app/composables/payment-client'
import { useServiceStore } from 'client/store'

const props = defineProps<{
  team: TeamMetadata
  orderHash: string
  payMethod: PaymentMethodCn
  price: number
  base64QRCode: string
  currency: string
}>()

const { resolve } = usePromiseHook()

onMounted(() => {
  pollingOrderStatus()
})

const currencyLabel = computed(() => {
  return props.currency === 'cny' ? '（元）' : ''
})

const qrCodeImageUrl = computed(() => {
  return `data:image/png;base64,${props.base64QRCode}`
})

const paymentTips = computed(() => {
  const paymentMethodLabel = props.payMethod === 'wechat-pay' ? '微信' : '支付宝'
  const scanLabel = `<b>${'「扫一扫」'}</b>`
  return `使用${paymentMethodLabel}${scanLabel}即可付款`
})

const handleClose = () => {
  resolve()
}

const getOrderStatus = async () => {
  try {
    const { status } = await usePaymentClient().getOrder(props.orderHash)
    if (status === 0) {
      // Order is paid
      stopPollingOrderStatus()

      resolve(true)

      await useServiceStore().services.action.dialog.openPaymentSuccessDialog({
        orderVersion: 'addon',
        isTrialOrder: false,
        team: props.team,
      })
    }
  } catch (error) {
    logger.error('Error get order status:', error)
  }
}

let pollingIntervalTimer: number

const pollingOrderStatus = () => {
  pollingIntervalTimer && window.clearInterval(pollingIntervalTimer)
  pollingIntervalTimer = window.setInterval(getOrderStatus, 5000)
}

const stopPollingOrderStatus = () => {
  pollingIntervalTimer && window.clearInterval(pollingIntervalTimer)
}

onUnmounted(() => {
  stopPollingOrderStatus()
})
</script>
