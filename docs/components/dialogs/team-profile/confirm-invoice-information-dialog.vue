<template>
  <modal-dialog
    ref="dialog"
    :title="$T('Confirm invoice information')"
    :is-opened="true"
    :esc-close="true"
    :close-button="isPhoneSizeViewportWidth ? true : false"
    :width="500"
    :max-width="'90%'"
    :dialog-footer-class="`border-t border-divider-onSurfaceBright-light dark:border-divider-onSurfaceBright-dark ${isLoading ? 'hidden' : ''}`"
    @modal-dialog-close="handleClose"
  >
    <div v-if="isLoading" class="flex flex-col gap-4 pt-[24px] sm:pt-0">
      <cloud-drive-item-skeleton-animation></cloud-drive-item-skeleton-animation>
      <cloud-drive-item-skeleton-animation></cloud-drive-item-skeleton-animation>
      <cloud-drive-item-skeleton-animation></cloud-drive-item-skeleton-animation>
      <cloud-drive-item-skeleton-animation></cloud-drive-item-skeleton-animation>
    </div>

    <div v-else-if="showType === 'getInvoice'" class="flex flex-col items-start gap-3">
      <div class="flex flex-col gap-2">
        <span class="text-mobile-subhead-small sm:text-desktop-subhead-small">
          {{ $T('Name') }}: <span class="text-desktop-headline-2">{{ invoiceSetting.name || user }}</span>
        </span>
        <span class="text-mobile-subhead-small sm:text-desktop-subhead-small">
          {{ $T('Email') }}: <span class="text-desktop-headline-2">{{ invoiceSetting.email || primary_email }}</span>
        </span>
      </div>

      <div class="flex flex-col items-start gap-2 self-stretch rounded-lg bg-mask-overlay-s-light p-[16px] dark:bg-mask-overlay-s-dark">
        <span class="w-full truncate text-mobile-subhead-mini sm:text-desktop-subhead-mini">
          {{ $T('Company') }}: <span class="text-mobile-body-medium sm:text-desktop-body-medium">{{ invoiceSetting.company }}</span>
        </span>
        <span class="w-full truncate text-mobile-subhead-mini sm:text-desktop-subhead-mini">
          {{ $T('Address') }}: <span class="text-mobile-body-medium sm:text-desktop-body-medium">{{ invoiceSetting.address }}</span>
        </span>
        <span class="w-full truncate text-mobile-subhead-mini sm:text-desktop-subhead-mini">
          {{ $T('Postal/Zip') }}: <span class="text-mobile-body-medium sm:text-desktop-body-medium">{{ invoiceSetting.zip }}</span>
        </span>
        <span class="w-full truncate text-mobile-subhead-mini sm:text-desktop-subhead-mini">
          {{ $T('City') }}: <span class="text-mobile-body-medium sm:text-desktop-body-medium">{{ invoiceSetting.city }}</span>
        </span>
        <span class="w-full truncate text-mobile-subhead-mini sm:text-desktop-subhead-mini">
          {{ $T('Country') }}: <span class="text-mobile-body-medium sm:text-desktop-body-medium">{{ invoiceSetting.country }}</span>
        </span>
        <span class="w-full truncate text-mobile-subhead-mini sm:text-desktop-subhead-mini">
          {{ $T('VAT') }}: <span class="text-mobile-body-medium sm:text-desktop-body-medium">{{ invoiceSetting.vat }}</span>
        </span>
      </div>
    </div>

    <div v-else-if="showType === 'updateInvoice'" class="flex flex-col gap-6">
      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <new-input
            v-model="newInvoiceSetting.name"
            size="medium"
            type="text"
            :disable-clear-icon="true"
            :disabled="isLoading"
            :placeholder="$T('Your Name')"
            :is-error="!!nameErrorMessage"
            @input-change="handleInputName"
          />
          <span v-if="nameErrorMessage" class="text-desktop-caption-1 text-red-500">{{ nameErrorMessage }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <new-input
            v-model="newInvoiceSetting.email"
            size="medium"
            type="email"
            :disable-clear-icon="true"
            :disabled="isLoading"
            :placeholder="$T('Email Address')"
            :is-error="!!emailErrorMessage"
            @input-change="handleInputEmail"
          />
          <span v-if="emailErrorMessage" class="text-desktop-caption-1 text-red-500">{{ emailErrorMessage }}</span>
        </div>
      </div>

      <div class="flex cursor-pointer items-center gap-1 self-start" @click="isShowMoreDetails = !isShowMoreDetails">
        <span class="text-mobile-body-large sm:text-desktop-body-large">{{ $T('More Details') }}</span>
        <icon name="chevron-downward" width="16" height="16" class="transition-transform" :class="{ '-rotate-90': !isShowMoreDetails }" />
      </div>

      <div v-show="isShowMoreDetails" class="flex flex-col gap-3">
        <new-input
          v-model="newInvoiceSetting.company"
          size="medium"
          type="text"
          :disable-clear-icon="true"
          :disabled="isLoading"
          :placeholder="$T('Your Company (Optional)')"
        />
        <new-input
          v-model="newInvoiceSetting.address"
          size="medium"
          type="text"
          :disable-clear-icon="true"
          :disabled="isLoading"
          :placeholder="$T('Your Address (Optional)')"
        />
        <new-input
          v-model="newInvoiceSetting.zip"
          size="medium"
          type="text"
          :disable-clear-icon="true"
          :disabled="isLoading"
          :placeholder="$T('Postal/Zip (Optional)')"
        />
        <new-input
          v-model="newInvoiceSetting.city"
          size="medium"
          type="text"
          :disable-clear-icon="true"
          :disabled="isLoading"
          :placeholder="$T('City (Optional)')"
        />
        <new-input
          v-model="newInvoiceSetting.country"
          size="medium"
          type="text"
          :disable-clear-icon="true"
          :disabled="isLoading"
          :placeholder="$T('Country (Optional)')"
        />
        <new-input
          v-model="newInvoiceSetting.vat"
          size="medium"
          type="text"
          :disable-clear-icon="true"
          :disabled="isLoading"
          :is-readonly="isLoading"
          :placeholder="$T('VAT (Optional)')"
        />
      </div>
    </div>

    <template #footer>
      <div v-if="showType === 'getInvoice'" class="flex items-center justify-between">
        <base-button v-if="!isPhoneSizeViewportWidth" theme="default" size="medium" @click="handleClose">
          {{ $T('Cancel') }}
        </base-button>
        <div class="flex w-full items-center gap-2 sm:w-auto">
          <base-button
            class="flex-1 sm:flex-auto"
            theme="default"
            :size="isPhoneSizeViewportWidth ? 'large' : 'medium'"
            @click="handleShowUpdateInformation"
          >
            {{ $T('Update') }}
          </base-button>
          <base-button class="flex-1 sm:flex-auto" theme="secondary" :size="isPhoneSizeViewportWidth ? 'large' : 'medium'" @click="handleGetInvoice">
            {{ $T('Get Invoice') }}
          </base-button>
        </div>
      </div>

      <div v-else-if="showType === 'updateInvoice'" class="flex items-center justify-end gap-2">
        <base-button
          class="flex-1 sm:flex-initial"
          theme="default"
          :size="isPhoneSizeViewportWidth ? 'large' : 'medium'"
          @click="showType = 'getInvoice'"
        >
          {{ $T('Cancel') }}
        </base-button>
        <base-button class="flex-1 sm:flex-initial" theme="secondary" :size="isPhoneSizeViewportWidth ? 'large' : 'medium'" @click="updateInvoice">
          {{ $T('Save') }}
        </base-button>
      </div>
    </template>
  </modal-dialog>
</template>

<script setup lang="ts">
import { usePaymentClient } from 'app/composables/payment-client'
import ModalDialog from 'client/components/new-base-modal-dialog.vue'
import { InvoiceSetting } from 'client/library/payment'
import { usePromiseHook } from 'utils/vue-utils'
import { onMounted, ref } from 'vue'
import CloudDriveItemSkeletonAnimation from 'client/components/skeleton-animation/new-cloud-drive-item-skeleton-animation.vue'
import { toastActions } from 'client/library/new-notifications'
import BaseButton from 'client/components/base/button.vue'
import NewInput from 'client/components/base/input.vue'
import Icon from 'client/components/icon/icon.vue'
import { IS_DEV, IS_TEST } from 'client/constants'
import { useAccountStore } from 'client/store'
import { $T } from 'client/library/translation'
import { isEmailValidFormat } from 'client/shared/login/login-common'
import { useWindowResize } from 'client/composables/window-resize'

const props = defineProps<{
  invoiceUrl: string
}>()

const dialog = ref<InstanceType<typeof ModalDialog>>()
const { isPhoneSizeViewportWidth } = useWindowResize()
const { resolve } = usePromiseHook()
const { primary_email, user } = useAccountStore().profile

const showType = ref<'getInvoice' | 'updateInvoice'>('getInvoice')
const isLoading = ref(false)
const invoiceSetting = ref<InvoiceSetting>({
  name: '',
  email: '',
  company: '',
  address: '',
  zip: '',
  city: '',
  country: '',
  vat: '',
})
const newInvoiceSetting = ref<InvoiceSetting>({
  name: '',
  email: '',
  company: '',
  address: '',
  zip: '',
  city: '',
  country: '',
  vat: '',
})
const nameErrorMessage = ref('')
const emailErrorMessage = ref('')
const isShowMoreDetails = ref(false)

const handleClose = async () => {
  await dialog.value?.closeDialogWithAnimation?.()
  resolve(true)
}

const handleInputName = () => {
  nameErrorMessage.value = ''
}

const handleInputEmail = () => {
  emailErrorMessage.value = ''
}

const getInvoiceSetting = async () => {
  isLoading.value = true
  const invoice = await usePaymentClient().getInvoiceSetting()
  invoiceSetting.value = invoice

  if (!invoiceSetting.value) {
    toastActions.show({ message: 'Failed to get invoice information. Please try again later.', topic: 'failed' })
    handleClose()
  }

  isLoading.value = false
}

const handleGetInvoice = () => {
  let xmindHost = ''
  if (IS_DEV) {
    xmindHost = 'https://test-www.xmind.app'
  } else if (IS_TEST) {
    xmindHost = 'https://beta.xmind.app'
  } else {
    xmindHost = 'https://xmind.app'
  }
  const url = new URL(`${xmindHost}${props.invoiceUrl}`)
  url.searchParams.set('format', 'pdf')

  window.open(url.toString(), '_blank')
}

const updateInvoice = async () => {
  if (!newInvoiceSetting.value.name || !newInvoiceSetting.value.email) {
    !newInvoiceSetting.value.name && (nameErrorMessage.value = $T("You can't leave this empty."))
    !newInvoiceSetting.value.email && (emailErrorMessage.value = $T("You can't leave this empty."))
    return
  }

  if (!isEmailValidFormat(newInvoiceSetting.value.email)) {
    emailErrorMessage.value = $T('Incorrect email address.')
    return
  }

  isLoading.value = true
  const success = await usePaymentClient().updateInvoiceSetting({
    name: newInvoiceSetting.value.name,
    email: newInvoiceSetting.value.email,
    company: newInvoiceSetting.value.company,
    address: newInvoiceSetting.value.address,
    zip: newInvoiceSetting.value.zip,
    city: newInvoiceSetting.value.city,
    country: newInvoiceSetting.value.country,
    vat: newInvoiceSetting.value.vat,
  })

  if (success) {
    await getInvoiceSetting()
    showType.value = 'getInvoice'
    toastActions.show({ message: 'Invoice information updated.', topic: 'success' })
  } else {
    toastActions.show({ message: 'Failed to update invoice information. Please try again later.', topic: 'failed' })
  }

  isLoading.value = false
}

const handleShowUpdateInformation = () => {
  newInvoiceSetting.value = { ...invoiceSetting.value }
  showType.value = 'updateInvoice'
}

onMounted(async () => {
  getInvoiceSetting()
})
</script>
