<script lang="ts">
export default {
  name: 'InvoiceGuideCn',
}
</script>
<script setup lang="ts">
import { $T } from 'client/library/translation'
import { XMIND_APP_ENDPOINT } from 'client/constants'
import noPaymentImageUrl from 'import-files/images/error-state/no-payment.png?url'
const invoiceUrl = `${XMIND_APP_ENDPOINT}/account/payment/`

const handleGoToInvoice = () => {
  window.open(invoiceUrl, '_blank')
}
</script>

<template>
  <div class="flex w-full flex-col items-center gap-3 p-3">
    <div class="flex flex-col items-center justify-center pt-9">
      <img :src="noPaymentImageUrl" class="w-40" alt="Go to Invoice" />
    </div>
    <span class="text-desktop-headline-small text-text-primary-light dark:text-text-primary-dark">{{ $T('Billing & Invoicing') }}</span>
    <span class="text-mobile-body-medium sm:text-desktop-body-medium text-text-secondary-light dark:text-text-secondary-dark">{{
      $T('To apply for an invoice, please visit the Xmind website')
    }}</span>
    <fw-button size="medium" theme="default" @click="handleGoToInvoice">
      {{ $T('Go to Invoice') }}
    </fw-button>
  </div>
</template>
