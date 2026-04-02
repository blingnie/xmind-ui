<template>
  <div class="flex flex-col gap-1">
    <div class="flex items-center gap-2">
      <new-input
        ref="couponInputRef"
        v-model="couponCodeInput"
        class="w-full"
        text="text"
        :placeholder="$T('Enter Code')"
        :is-error="!!couponCodeErrorMessage"
        :disabled="isLoading || isCouponCodeApplied || isDisabled"
        :disable-clear-icon="true"
        @input="handleCouponCodeChange"
        @keydown.enter="handleApplyCouponCode()"
      ></new-input>
      <base-button
        size="medium"
        theme="default"
        :disabled="isLoading || isDisabled"
        @click="isCouponCodeApplied ? handleRemoveCouponCode() : handleApplyCouponCode()"
      >
        {{ isCouponCodeApplied ? $T('Remove') : $T('Apply') }}
      </base-button>
    </div>
    <span v-if="couponCodeErrorMessage" class="text-desktop-caption-1 text-red-500">{{ couponCodeErrorMessage }}</span>
    <div v-else-if="isCouponCodeApplied" class="flex items-center gap-1 text-desktop-footnote text-green-7">
      <icon name="tick" />
      <span>{{ couponSuccessMessages?.[couponCodeInput] || $T('Coupon code applied.') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import NewInput from 'client/components/base/input.vue'
import BaseButton from 'client/components/base/button.vue'
import Icon from 'client/components/icon/icon.vue'
import { $T } from 'client/library/translation'
import { CouponAttemptsExceeded, CouponCodeError, CouponUnavailableError } from 'client/errors'
import { toastActions } from 'client/library/new-notifications'
import { isPhoneViewportSmall } from 'utils/detectDevice'

const props = defineProps<{
  isLoading: boolean
  isDisabled?: boolean
  couponSuccessMessages?: Record<string, string>
  onRemoveCoupon: () => Promise<void>
  onApplyCoupon: (couponCode: string) => Promise<void>
}>()

const emits = defineEmits<{
  (e: 'set-is-coupon-timeout', isTimeout: boolean): void
}>()

let couponCodeRetryTimer: number
let hideCouponRetryToast: () => void

const couponInputRef = ref()
const couponCodeInput = ref('')
const couponCodeErrorMessage = ref('')
const isCouponCodeApplied = ref(false)

const handleCouponCodeChange = () => {
  couponCodeErrorMessage.value = ''
}

const handleRemoveCouponCode = () => {
  isCouponCodeApplied.value = false
  couponInputRef.value?.clearInput()
  couponCodeInput.value = ''
  couponCodeErrorMessage.value = ''

  props.onRemoveCoupon()
}

const handleApplyCouponCode = async () => {
  couponCodeErrorMessage.value = ''
  try {
    if (couponCodeRetryTimer) {
      throw new CouponAttemptsExceeded()
    }
    await props.onApplyCoupon(couponCodeInput.value)
    isCouponCodeApplied.value = true
  } catch (e) {
    if (e instanceof CouponCodeError) {
      couponCodeErrorMessage.value = $T('Invalid Code. Please try again with a valid code.')
    } else if (e instanceof CouponAttemptsExceeded) {
      handleExceedCouponAttemptsError()
    } else if (e instanceof CouponUnavailableError) {
      couponCodeErrorMessage.value = $T('Only applies to the first year of subscription.')
    } else {
      logger.error(e)
      couponCodeErrorMessage.value = $T('Network error. Please try again later.')
    }
    isCouponCodeApplied.value = false
  }
}

const handleExceedCouponAttemptsError = () => {
  if (couponCodeRetryTimer) return
  const toast = toastActions.show({
    message: (isPhoneViewportSmall() ? '' : $T('Request limitation reached. ')) + $T('Please try it again after $1s.'),
    topic: 'loading',
    timeout: 60000,
  })
  emits('set-is-coupon-timeout', true)
  hideCouponRetryToast = toast.hide
  couponCodeRetryTimer = window.setTimeout(() => {
    couponCodeRetryTimer = null
    emits('set-is-coupon-timeout', false)
  }, 60000)
}

onBeforeUnmount(() => {
  hideCouponRetryToast?.()
})

defineExpose({
  setCoupon: async (coupon: string) => {
    couponCodeInput.value = coupon
    await handleApplyCouponCode()
  },
})
</script>
