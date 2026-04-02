<template>
  <div class="flex w-full items-start justify-between">
    <div class="flex flex-col">
      <div class="mb-3 flex items-center gap-2">
        <span class="text-mobile-subhead-small sm:text-desktop-subhead-small">{{ paymentVersion }}</span>
        <icon name="checkmark-circle-fill" color="#2F9952" />
      </div>
      <div class="text-mobile-body-medium sm:text-desktop-body-medium mb-2">
        <template v-if="paymentDisplay.paymentAmount">
          <span v-show="paymentDisplay.paymentAmount" class="text-mobile-subhead-mini sm:text-desktop-subhead-mini">
            {{ paymentDisplay.paymentAmount }}
          </span>
          <span> - </span>
        </template>
        <span>{{ paymentDisplay.description }}</span>
      </div>
      <span class="text-mobile-caption-header text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-caption-header">
        {{ paymentDisplay.expiryDate }}
      </span>
    </div>
    <fw-tile-button v-if="item.invoice_url" :icon-name="'download-invoice'" @click="handleClickInvoice" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { $T } from 'client/library/translation'
import { formatMonths } from 'utils/misc'
import { formatDate } from './utils'
import { OrderPayment } from 'client/library/payment/types'
import { useServiceStore } from 'client/store'
import Icon from 'client/components/icon/icon.vue'

const props = defineProps<{
  item: OrderPayment
}>()

const addSeatsBindVersionTitle = (plan: OrderPayment['plan']) => {
  switch (plan) {
    case 'essential':
      return $T('Essential Plan')
    case 'business':
      return $T('Business Plan')
    default:
      return ''
  }
}

const durationPlanText = (intervalCount: number) => {
  switch (intervalCount) {
    case 1:
      return $T('Monthly-Plan')
    case 12:
      return $T('Yearly-Plan')
    default:
      return ''
  }
}

const paymentVersion = computed(() => {
  switch (props.item.bind_version) {
    case 'plus':
      return props.item.order_version === 'duo' ? $T('Premium Plan') : $T('Personal Plan')
    case 'team':
      return $T('Team Plan')
    case 'premium':
      return $T('Premium Plan')
    case 'essential':
      return $T('Essential Plan')
    case 'business':
      return $T('Business Plan')
    case 'enterprise':
      return $T('Enterprise Plan')
    case 'addon':
      return $T('Credits Add-on')
    case '+seat':
      return addSeatsBindVersionTitle(props.item.plan)
    default:
      return ''
  }
})

const seatsText = computed(() => (props.item.quantity > 1 ? $T('Seats') : $T('Seat')))
const seatsDisplayText = computed(() => {
  if (!props.item.quantity || props.item.bind_version === 'plus') return ''
  return `${props.item.quantity} ${seatsText.value}`
})

const paymentDisplay = computed(() => {
  const display = {
    description: '',
    expiryDate: '',
    paymentAmount: null,
  }

  switch (props.item.bind_version) {
    case 'plus':
    case 'team':
    case 'premium':
    case 'essential':
    case 'business':
    case 'enterprise':
      display.expiryDate = `${formatDate(props.item.period_start)} - ${formatDate(props.item.period_end)}`
      display.description =
        props.item.trial_day > 0
          ? `${props.item.trial_day} ${$T('Days')} ${seatsDisplayText.value ? `- ${seatsDisplayText.value}` : ''}`
          : `${formatMonths(props.item.interval_count, true)} ${seatsDisplayText.value ? `- ${seatsDisplayText.value}` : ''}`
      break
    case 'addon':
      display.description = `${props.item.credits} ${$T('Credits')}`
      display.expiryDate = formatDate(props.item.bill_date)
      break
    case '+seat':
      display.description = `${$T('Added')} ${props.item.quantity} ${durationPlanText(props.item.interval_count)} ${seatsText.value}`
      display.expiryDate = `${formatDate(props.item.period_start)} - ${formatDate(props.item.period_end)}`
      break
  }

  if (props.item.gateway === 'redeem') {
    display.description = `${$T('Redeem Code')} ${seatsDisplayText.value ? `- ${seatsDisplayText.value}` : ''}`
  }

  const currency = props.item.currency || 'USD'
  const currencyFormat = Intl.NumberFormat('en-US', { style: 'currency', currency, currencyDisplay: 'narrowSymbol' })
  display.paymentAmount = props.item.amount || props.item.amount === 0 ? currencyFormat.format(props.item.amount) : ''

  return display
})

const handleClickInvoice = () => {
  useServiceStore().services.action.dialog.openConfirmInvoiceInformationDialog({ invoiceUrl: props.item.invoice_url })
}
</script>
