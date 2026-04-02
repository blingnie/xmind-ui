<template>
  <div
    class="bg-fill-surface-light shadow-elevation-g-light dark:bg-fill-surface-dark dark:shadow-elevation-g-dark flex w-full flex-col justify-center gap-6 rounded-2xl p-[24px] md:min-w-96 md:max-w-[544px] md:rounded-none md:bg-transparent md:p-0 md:shadow-none dark:md:shadow-none"
  >
    <span class="text-mobile-subhead-large text-text-secondary-light dark:text-text-secondary-dark md:text-desktop-subhead-large">
      {{ $T('Payment Details') }}
    </span>

    <form class="w-full" @submit="handleSubmit">
      <label class="text-mobile-body-medium text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-body-medium mb-[12px] block w-full">
        {{ $T('Card Number') }}
      </label>
      <div
        id="card-number-element"
        class="border-border-quaternary-light bg-fill-surfaceBright-light hover:border-border-tertiary-light dark:border-border-quaternary-dark dark:bg-fill-surfaceBright-dark dark:hover:border-border-tertiary-dark h-10 w-full cursor-text rounded border py-[10px] pl-[16px] pr-[8px]"
        :class="{
          '!border-border-primary-light dark:!border-border-primary-dark': cardNumberElementActive,
          'error [&.error]:!border-red-500': cardNumberErrorMessage,
          'border-border-quaternary-light dark:border-border-quaternary-dark pointer-events-none bg-transparent dark:bg-transparent': isLoading,
        }"
      >
        <!-- A Stripe Element will be inserted here. -->
      </div>
      <span
        class="text-desktop-caption-1 mt-[4px] block h-7 w-full text-red-500"
        :class="{ visible: cardNumberErrorMessage || paymentErrorMessage, invisible: !cardNumberErrorMessage && !paymentErrorMessage }"
      >
        {{ paymentErrorMessage || cardNumberErrorMessage }}
      </span>
      <div class="flex gap-3">
        <div class="min-w-0 max-w-[50%] flex-1">
          <label
            class="text-mobile-body-medium text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-body-medium mb-[12px] block w-full"
          >
            {{ $T('Expiration') }}
          </label>
          <div
            id="card-expiry-element"
            class="border-border-quaternary-light bg-fill-surfaceBright-light hover:border-border-tertiary-light dark:border-border-quaternary-dark dark:bg-fill-surfaceBright-dark dark:hover:border-border-tertiary-dark h-10 rounded border py-[10px] pl-[16px] pr-[8px]"
            :class="{
              '!border-border-primary-light dark:!border-border-primary-dark': cardExpiryElementActive,
              'error [&.error]:!border-red-500': cardExpiryErrorMessage,
              'border-border-quaternary-light dark:border-border-quaternary-dark pointer-events-none bg-transparent dark:bg-transparent': isLoading,
            }"
          >
            <!-- A Stripe Element will be inserted here. -->
          </div>
          <span
            class="text-desktop-caption-1 mt-[4px] block h-7 w-full text-red-500"
            :class="{ visible: cardExpiryErrorMessage, invisible: !cardExpiryErrorMessage }"
          >
            {{ cardExpiryErrorMessage }}
          </span>

          <template v-if="selectedCountry && countryOptions">
            <label
              class="text-mobile-body-large text-text-tertiary-light dark:text-text-tertiary-dark md:text-desktop-body-large mb-[12px] block w-full"
            >
              {{ $T('Country / Region') }}
              <span class="text-red-6">*</span>
            </label>
            <fw-select
              class="w-full"
              :offset-y="8"
              :position="'bottom-left'"
              :trigger-size="'large'"
              :menu-custom-class="'max-h-[350px] w-[300px] !pr-0'"
              :disabled="isLoading"
              :selected-key="selectedCountry"
              :options="countryOptions"
              :is-use-virtualized-list="true"
              @select="handleSelectCountry($event)"
            />
          </template>
        </div>
        <div class="min-w-0 max-w-[50%] flex-1">
          <label
            class="text-mobile-body-medium text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-body-medium mb-[12px] block w-full"
          >
            {{ $T('CVC') }}
          </label>
          <div
            id="card-cvc-element"
            class="border-border-quaternary-light bg-fill-surfaceBright-light hover:border-border-tertiary-light dark:border-border-quaternary-dark dark:bg-fill-surfaceBright-dark dark:hover:border-border-tertiary-dark h-10 rounded border py-[10px] pl-[16px] pr-[8px]"
            :class="{
              '!border-border-primary-light dark:!border-border-primary-dark': cardCvcElementActive,
              'error [&.error]:!border-red-500': cardCvcErrorMessage,
              'border-border-quaternary-light dark:border-border-quaternary-dark pointer-events-none bg-transparent dark:bg-transparent': isLoading,
            }"
          >
            <!-- A Stripe Element will be inserted here. -->
          </div>
          <span
            class="text-desktop-caption-1 mt-[4px] block h-7 w-full text-red-500"
            :class="{ visible: cardCvcErrorMessage, invisible: !cardCvcErrorMessage }"
          >
            {{ cardCvcErrorMessage }}
          </span>

          <template v-if="selectedCountry && countryOptions">
            <label
              class="text-mobile-body-large text-text-tertiary-light dark:text-text-tertiary-dark md:text-desktop-body-large mb-[12px] block w-full"
            >
              {{ $T('Postal Code') }}
              <span class="text-red-6">*</span>
            </label>
            <fw-input
              v-model="postalCode"
              class="w-full"
              size="large"
              type="text"
              data-blur="without-focus"
              :disabled="isLoading"
              :placeholder="$T('Postal Code')"
              :disable-clear-icon="true"
              @input-change="handleInputPostalCode"
            />
            <span
              class="text-desktop-caption-1 mt-[4px] block h-7 w-full text-red-500"
              :class="{ visible: postalCodeErrorMessage, invisible: !postalCodeErrorMessage }"
            >
              {{ postalCodeErrorMessage }}
            </span>
          </template>
        </div>
      </div>
      <div v-if="!isDisableOptionalFieldsInput" class="flex flex-col gap-3" :class="[isShowOptionalFields ? 'mb-[32px]' : 'mb-[16px]']">
        <div
          class="hover:bg-mask-overlay-s-light active:bg-mask-overlay-deep-light dark:hover:bg-mask-overlay-s-dark dark:active:bg-mask-overlay-deep-dark flex cursor-pointer select-none items-center gap-1 self-start rounded px-[8px] py-[4px] transition-colors"
          @click="isShowOptionalFields = !isShowOptionalFields"
        >
          <span class="text-mobile-body-large md:text-desktop-body-large">{{ $T('Optional') }}</span>
          <icon
            class="transition-transform"
            :class="{ '-rotate-90': isShowOptionalFields, 'rotate-90': !isShowOptionalFields }"
            name="chevron-forward"
            width="12"
            height="12"
          />
        </div>
        <div v-if="optionalInvoiceSetting" v-show="isShowOptionalFields" class="flex flex-col gap-3">
          <label class="text-mobile-body-medium text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-body-medium block w-full">
            {{ $T('Your Company') }}
          </label>
          <fw-input
            v-model="optionalInvoiceSetting.company"
            class="w-full"
            size="large"
            type="text"
            data-blur="without-focus"
            :disabled="isLoading"
            :disable-clear-icon="true"
            :placeholder="$T('Optional')"
          />
          <label class="text-mobile-body-medium text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-body-medium block w-full">
            {{ $T('Your Address') }}
          </label>
          <fw-input
            v-model="optionalInvoiceSetting.address"
            class="w-full"
            size="large"
            type="text"
            data-blur="without-focus"
            :disabled="isLoading"
            :disable-clear-icon="true"
            :placeholder="$T('Optional')"
          />
          <div class="flex gap-3">
            <div class="min-w-0 max-w-[50%] flex-1">
              <label
                class="text-mobile-body-medium text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-body-medium mb-[12px] block w-full"
              >
                {{ $T('City') }}
              </label>
              <fw-input
                v-model="optionalInvoiceSetting.city"
                class="w-full"
                size="large"
                type="text"
                data-blur="without-focus"
                :disabled="isLoading"
                :disable-clear-icon="true"
                :placeholder="$T('Optional')"
              />
            </div>
            <div class="min-w-0 max-w-[50%] flex-1">
              <label
                class="text-mobile-body-medium text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-body-medium mb-[12px] block w-full"
              >
                {{ $T('VAT') }}
              </label>
              <fw-input
                v-model="optionalInvoiceSetting.vat"
                class="w-full"
                size="large"
                type="text"
                data-blur="without-focus"
                :disabled="isLoading"
                :disable-clear-icon="true"
                :placeholder="$T('Optional')"
              />
            </div>
          </div>
        </div>
      </div>
      <base-button
        class="mt-[16px] w-full"
        theme="primary"
        size="large"
        data-focus="now-allow"
        type="submit"
        :disabled="isLoading || isSubmitDisabled"
      >
        {{ submitButtonText }}
      </base-button>
    </form>

    <div class="mt-[8px] flex w-full flex-col items-center justify-center gap-4">
      <div class="flex gap-4 py-[8px]">
        <div class="flex items-center justify-center gap-1">
          <img uk-svg :data-src="$toResourceURL('/assets/static/images/dialog-payment/ssl.svg')" class="h-5" />
          <span class="text-mobile-body-medium text-text-tertiary-light dark:text-text-tertiary-dark md:text-desktop-body-large">
            {{ $T('SSL Encryption') }}
          </span>
        </div>
        <div class="flex cursor-pointer items-center justify-center gap-1" @click="handleClickPowerByStripe">
          <span class="text-mobile-body-medium text-text-tertiary-light dark:text-text-tertiary-dark md:text-desktop-body-large">
            {{ $T('Powered by') }}
          </span>
          <img uk-svg :data-src="$toResourceURL('/assets/static/images/dialog-payment/stripe.svg')" class="h-5" />
        </div>
      </div>
      <slot name="payment-note"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Stripe,
  StripeCardCvcElement,
  StripeCardExpiryElement,
  StripeCardNumberElement,
  StripeElementChangeEvent,
  StripeElementCSSProperties,
  StripeElements,
  StripeElementStyle,
} from '@stripe/stripe-js'
import { $T } from 'client/library/translation'
import { useAppStore } from 'client/store'
import { onMounted, ref, watch, onBeforeUnmount } from 'vue'
import { type InvoiceSetting, loadCountryOptions } from 'client/library/payment'
import type { Alpha2Code } from 'i18n-iso-countries'
import BaseButton from 'client/components/base/button.vue'
import FwInput from 'client/components/base/input.vue'
import FwSelect from 'client/components/base/select.vue'
import Icon from 'client/components/icon/icon.vue'
import NeverMindUIRegular from 'import-files/fonts/NeverMindUI-Regular.ttf?url'
import { usePaymentClient } from 'app/composables/payment-client'

const stripeElementBaseStyle: StripeElementCSSProperties = {
  fontSize: '14px',
  fontWeight: 400,
  lineHeight: '18px',
  fontFamily: 'NeverMind UI',
}

const stripeElementStyleLight: StripeElementStyle = {
  base: {
    ...stripeElementBaseStyle,
    color: '#1F2326',
    '::placeholder': {
      color: '#747A80',
    },
  },
  invalid: {
    color: '#1F2326',
  },
}
const stripeElementStyleDark: StripeElementStyle = {
  base: {
    ...stripeElementBaseStyle,
    color: '#E4E7EB',
    '::placeholder': {
      color: '#878C92',
    },
  },
  invalid: {
    color: '#E4E7EB',
  },
}

const stripeElementStyleDisabledLight: StripeElementStyle = {
  base: {
    ...stripeElementBaseStyle,
    color: 'rgba(0,0,0,0.3)',
    '::placeholder': {
      color: 'rgba(0,0,0,0.3)',
    },
  },
}
const stripeElementStyleDisabledDark: StripeElementStyle = {
  base: {
    ...stripeElementBaseStyle,
    color: 'rgba(255,255,255,0.3)',
    '::placeholder': {
      color: 'rgba(255,255,255,0.3)',
    },
  },
}

let stripeElements: StripeElements
let cardNumberElement: StripeCardNumberElement
let cardExpiryElement: StripeCardExpiryElement
let cardCvcElement: StripeCardCvcElement

const props = defineProps<{
  stripe: Stripe
  isLoading: boolean
  submitButtonText: string
  isSubmitDisabled?: boolean
  isDisableCountryAndPostalInput?: boolean
  isDisableOptionalFieldsInput?: boolean
  paymentErrorMessage?: string
}>()

const emits = defineEmits<{
  (e: 'submit', args: { stripeCardNumberElement: StripeCardNumberElement; paymentCountry?: Alpha2Code; paymentPostal?: string }): void
}>()

const cardNumberErrorMessage = ref('')
const cardExpiryErrorMessage = ref('')
const cardCvcErrorMessage = ref('')
const postalCodeErrorMessage = ref('')
const isMounted = ref(false)
const postalCode = ref('')
const selectedCountry = ref<Alpha2Code>()
const countryOptions = ref()
const isShowOptionalFields = ref(false)
const optionalInvoiceSetting = ref<InvoiceSetting>()
const cardNumberElementActive = ref(false)
const cardExpiryElementActive = ref(false)
const cardCvcElementActive = ref(false)

const handleSubmit = (event: SubmitEvent) => {
  event.preventDefault()

  if (!props.isDisableCountryAndPostalInput && !postalCode.value) {
    postalCodeErrorMessage.value = $T('Postal Code is required')
    return
  }

  if (!props.isDisableOptionalFieldsInput) {
    updateInvoiceSetting()
  }

  emits('submit', {
    stripeCardNumberElement: cardNumberElement,
    paymentCountry: selectedCountry.value,
    paymentPostal: postalCode.value.trim(),
  })
}

const handleClickPowerByStripe = () => {
  window.open('https://stripe.com/', '__blank')
}

const init = () => {
  stripeElements = props.stripe.elements({
    locale: 'en',
    fonts: [{ src: `url("${NeverMindUIRegular}")`, family: 'NeverMind UI' }],
  })

  const style = useAppStore().appearance === 'dark' ? stripeElementStyleDark : stripeElementStyleLight
  cardNumberElement = stripeElements.create('cardNumber', {
    showIcon: true,
    iconStyle: 'solid',
    style,
  })
  cardExpiryElement = stripeElements.create('cardExpiry', {
    style,
    placeholder: $T('MM / YY'),
  })
  cardCvcElement = stripeElements.create('cardCvc', {
    style,
    placeholder: $T('CVC'),
  })

  cardNumberElement.mount('#card-number-element')
  cardExpiryElement.mount('#card-expiry-element')
  cardCvcElement.mount('#card-cvc-element')

  cardNumberElement.on('ready', () => {
    cardNumberElement.focus()
  })

  cardNumberElement.on('change', cardElementChangeHandler)
  cardExpiryElement.on('change', cardElementChangeHandler)
  cardCvcElement.on('change', cardElementChangeHandler)

  cardNumberElement.on('focus', cardElementFocusHandler)
  cardExpiryElement.on('focus', cardElementFocusHandler)
  cardCvcElement.on('focus', cardElementFocusHandler)

  cardNumberElement.on('blur', cardElementBlurHandler)
  cardExpiryElement.on('blur', cardElementBlurHandler)
  cardCvcElement.on('blur', cardElementBlurHandler)
}

const cardElementChangeHandler = (event: StripeElementChangeEvent) => {
  switch (event.elementType) {
    case 'cardNumber':
      cardNumberErrorMessage.value = event.error ? event.error.message : ''
      break
    case 'cardExpiry':
      cardExpiryErrorMessage.value = event.error ? event.error.message : ''
      break
    case 'cardCvc':
      cardCvcErrorMessage.value = event.error ? event.error.message : ''
  }
}
const cardElementFocusHandler = (event: { elementType: 'cardNumber' | 'cardExpiry' | 'cardCvc' }) => {
  switch (event.elementType) {
    case 'cardNumber':
      cardNumberElementActive.value = true
      break
    case 'cardExpiry':
      cardExpiryElementActive.value = true
      break
    case 'cardCvc':
      cardCvcElementActive.value = true
  }
}

const cardElementBlurHandler = (event: { elementType: 'cardNumber' | 'cardExpiry' | 'cardCvc' }) => {
  switch (event.elementType) {
    case 'cardNumber':
      cardNumberElementActive.value = false
      break
    case 'cardExpiry':
      cardExpiryElementActive.value = false
      break
    case 'cardCvc':
      cardCvcElementActive.value = false
  }
}

const handleSelectCountry = (country: string) => {
  selectedCountry.value = country as Alpha2Code
}

const handleInputPostalCode = () => {
  postalCodeErrorMessage.value = ''
}

const loadCountryCodes = async () => {
  const { country, options } = await loadCountryOptions()
  selectedCountry.value = country
  countryOptions.value = options
}

const getInvoiceSetting = async () => {
  const invoice = await usePaymentClient().getInvoiceSetting()
  optionalInvoiceSetting.value = invoice
}

const updateInvoiceSetting = () => {
  usePaymentClient().updateInvoiceSetting(optionalInvoiceSetting.value)
}

onMounted(() => {
  isMounted.value = true
  !props.isDisableCountryAndPostalInput && loadCountryCodes()
  !props.isDisableOptionalFieldsInput && getInvoiceSetting()
})
onBeforeUnmount(() => {
  cardNumberElement?.off('change', cardElementChangeHandler)
  cardExpiryElement?.off('change', cardElementChangeHandler)
  cardCvcElement?.off('change', cardElementChangeHandler)

  cardNumberElement?.off('focus', cardElementFocusHandler)
  cardExpiryElement?.off('focus', cardElementFocusHandler)
  cardCvcElement?.off('focus', cardElementFocusHandler)

  cardNumberElement?.off('blur', cardElementBlurHandler)
  cardExpiryElement?.off('blur', cardElementBlurHandler)
  cardCvcElement?.off('blur', cardElementBlurHandler)
})

watch(
  [() => props.stripe, () => isMounted.value],
  ([newStripe, newIsMounted]) => {
    if (newStripe && newIsMounted) {
      init()
    }
  },
  { flush: 'post' },
)

watch(
  () => useAppStore().appearance,
  newValue => {
    const style = newValue === 'dark' ? stripeElementStyleDark : stripeElementStyleLight
    cardNumberElement?.update({ style })
    cardExpiryElement?.update({ style })
    cardCvcElement?.update({ style })
  },
)

watch(
  () => props.isLoading,
  newValue => {
    const style = useAppStore().appearance === 'dark' ? stripeElementStyleDark : stripeElementStyleLight
    const disabledStyle = useAppStore().appearance === 'dark' ? stripeElementStyleDisabledDark : stripeElementStyleDisabledLight
    cardNumberElement?.update({ style: newValue ? disabledStyle : style })
    cardExpiryElement?.update({ style: newValue ? disabledStyle : style })
    cardCvcElement?.update({ style: newValue ? disabledStyle : style })
  },
)
</script>
