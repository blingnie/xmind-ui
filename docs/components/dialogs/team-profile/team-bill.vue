<script lang="ts">
export default {
  name: 'TeamBill',
}
</script>
<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import PaymentCard from './payment-card.vue'
import InvoiceGuideCn from './invoice-guide-cn.vue'
import type { TeamMetadata, TeammatePayload } from 'client/library/cloud-kit'
import CloudDriveItemSkeletonAnimation from 'client/components/skeleton-animation/new-cloud-drive-item-skeleton-animation.vue'
import type { OrderPayment, OrderPlan } from 'client/library/payment/types'
import BaseDivider from 'client/components/base/divider.vue'
import { REGION } from 'client/constants'
const ErrorState = defineAsyncComponent(() => import('client/components/base/error-state.vue'))

withDefaults(
  defineProps<{
    plans: OrderPlan[]
    payments: OrderPayment[]
    team: TeamMetadata & { role: TeammatePayload['role'] }
    isLoading: boolean
    isMyWorks?: boolean
  }>(),
  {},
)

defineEmits<{
  (event: 'cancel-order', args: { subscriptionId: string; customerId: string }): void
  (event: 'to-plan'): void
  (event: 'renew-success'): void
}>()
</script>

<template>
  <div class="flex flex-col gap-6 px-[24px]">
    <div v-if="isLoading" class="flex flex-col gap-4">
      <cloud-drive-item-skeleton-animation />
      <cloud-drive-item-skeleton-animation />
      <cloud-drive-item-skeleton-animation />
      <cloud-drive-item-skeleton-animation />
    </div>
    <error-state v-else-if="payments.length === 0" type="no-payment" class="pt-20" />
    <template v-else>
      <template v-for="(item, index) in payments" :key="item.sub_id">
        <base-divider v-if="index !== 0" />
        <payment-card :item="item" />
      </template>
    </template>
    <invoice-guide-cn v-if="REGION === 'cn' && payments.length > 0" />
  </div>
</template>
