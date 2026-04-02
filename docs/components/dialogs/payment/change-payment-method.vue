<template>
  <base-full-screen-dialog
    :is-opened="true"
    :close-button="true"
    class="sm:!p-0 md:!p-[12px]"
    :dialog-content-class="'!pt-[24px] sm:!pt-[24px] md:!pt-[48px]'"
    :dialog-body-class="'md:!bg-fill-surface-light md:dark:!bg-fill-surface-dark !bg-fill-container-light dark:!bg-fill-container-dark shadow-none md:shadow-elevation-g-light dark:md:shadow-elevation-g-dark'"
    @modal-dialog-close="handleClose"
  >
    <h1
      class="px-[16px] text-left text-mobile-headline-small text-text-primary-light dark:text-text-primary-dark md:mb-[48px] md:px-0 md:text-center md:text-desktop-headline-large"
    >
      {{ $T('Change Payment Method') }}
    </h1>

    <base-divider class="mb-[24px] mt-[24px] block !border-divider-onContainer-light dark:!border-divider-onContainer-dark md:hidden" />

    <div class="flex items-center justify-center px-[16px]">
      <payment-details
        :submit-button-text="$T('Confirm')"
        :stripe="stripe"
        :is-loading="isLoading"
        :is-submit-disabled="isLoading"
        :is-disable-country-and-postal-input="true"
        :is-disable-optional-fields-input="true"
        @submit="handleSubmit"
      ></payment-details>
    </div>
  </base-full-screen-dialog>
</template>

<script setup lang="ts">
import BaseFullScreenDialog from 'client/components/base/full-screen-dialog.vue'
import PaymentDetails from './payment-details.vue'
import BaseDivider from 'client/components/base/divider.vue'
import { $T } from 'client/library/translation'
import { usePromiseHook } from 'utils/vue-utils'
import { onMounted, ref } from 'vue'
import { usePaymentClient } from 'app/composables/payment-client'
import { Stripe, StripeCardNumberElement } from '@stripe/stripe-js'
import { toastActions } from 'client/library/new-notifications'
import { useServiceStore } from 'app/services/pinia'

const props = defineProps<{
  teamId: string
  planId: string
}>()

const { resolve } = usePromiseHook()

const isLoading = ref(false)
const stripe = ref<Stripe | null>(null)

const handleClose = (isPaymentMethodChanged = false) => {
  if (isLoading.value) return
  resolve(isPaymentMethodChanged)
}

const openPaymentResultDialog = async (title: string, msg: string, onConfirm = async () => true) => {
  await useServiceStore().services.action.dialog.confirm({
    title: title,
    description: msg,
    confirmButtonText: $T('OK'),
    onConfirm,
    hiddenCancel: true,
    dismissable: false,
    confirmButtonType: 'default',
  })
}

const init = async () => {
  stripe.value = await usePaymentClient().initStripe()
  if (!stripe.value) {
    toastActions.show({ message: $T('Network error, please try again later'), topic: 'failed' })
    handleClose()
    return
  }
}

const handleSubmit = async (args: { stripeCardNumberElement: StripeCardNumberElement }) => {
  const { stripeCardNumberElement } = args

  if (isLoading.value) return
  isLoading.value = true

  const { token, error } = await stripe.value.createToken(stripeCardNumberElement)
  if (error) {
    error.type !== 'validation_error' && openPaymentResultDialog($T('Payment Declined'), error.message)
    isLoading.value = false
    return
  }

  const success = await usePaymentClient().changePaymentMethod({ id: props.planId, teamId: props.teamId, newStripeToken: token.id })
  isLoading.value = false

  if (success) {
    toastActions.show({ message: $T('Your payment method has been updated successfully.'), topic: 'success' })
  } else {
    toastActions.show({ message: $T('Failed to update payment method. Please check your details and try again.'), topic: 'failed' })
  }
  handleClose(success)
}

onMounted(() => {
  init()
})
</script>
