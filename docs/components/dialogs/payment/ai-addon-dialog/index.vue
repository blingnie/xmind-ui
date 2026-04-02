<template>
  <base-full-screen-dialog :is-opened="true" :is-closable="true" @modal-dialog-close="handleClose">
    <div>
      <div class="flex flex-col items-center gap-8 px-4 py-2 sm:gap-12 sm:px-16 sm:py-4">
        <h1 class="text-mobile-display-4 text-dark-grey-10 dark:text-light-grey-1 sm:text-desktop-display-1">{{ '购买 AI 加量包' }}</h1>
        <div v-if="selectedAddon" class="flex w-full flex-col gap-8 sm:max-w-[928px] sm:flex-row">
          <buy-information class="sm:w-[38%]" :add-ons="xaiAddons" />
          <payment-detail class="sm:w-[58.6%]" :addon="selectedAddon" :is-creating-order="isCreatingOrder" @create-order="handleCreateOrder" />
        </div>
      </div>
    </div>
  </base-full-screen-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BuyInformation from './buy-information.vue'
import PaymentDetail from './payment-detail.vue'
import BaseFullScreenDialog from 'client/components/base/full-screen-dialog.vue'
import { usePromiseHook } from 'utils/vue-utils'
import { usePaymentClient } from 'client/pages/app/composables/payment-client'
import { AiAddonCn, PaymentMethodCn, TeamMetadata } from 'client/server-export'
import { useServiceStore } from 'client/store'

const { resolve } = usePromiseHook()

const props = defineProps<{
  team: TeamMetadata
}>()

const xaiAddons = ref<AiAddonCn[]>()
const selectedAddon = ref<AiAddonCn>()

const isCreatingOrder = ref(false)

const handleClose = () => {
  resolve(false)
}

const handleCreateOrder = async (payMethod: PaymentMethodCn, addon: AiAddonCn) => {
  isCreatingOrder.value = true
  try {
    const data = await usePaymentClient().createXaiAddonOrderCn({ payMethod, addon, teamId: props.team?.teamId })
    isCreatingOrder.value = false

    const serviceStore = useServiceStore()
    if (!serviceStore?.services?.action) {
      logger.error('Service store or action not available')
      return
    }

    if (
      await serviceStore.services.action.dialog.openPaymentQRCodeDialog({
        team: props.team,
        orderHash: data.order_hash,
        payMethod: data.pay_method,
        price: data.price,
        currency: data.currency,
        base64QRCode: data.charge_qr,
      })
    ) {
      resolve(true)
    }
  } catch (error) {
    logger.error('Error creating order:', error)
  } finally {
    isCreatingOrder.value = false
  }
}

onMounted(async () => {
  const addOns = await usePaymentClient().getXaiAddonCn()
  xaiAddons.value = addOns
  selectedAddon.value = addOns?.[0]
})
</script>
