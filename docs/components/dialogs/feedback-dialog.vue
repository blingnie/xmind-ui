<template>
  <modal-dialog
    ref="dialog"
    class="whats-new-dialog"
    :title="$T('Feedback')"
    width="500px"
    :dialog-class="isPhoneSizeViewportWidth ? '!h-[650px]' : 'min-h-[468px]'"
    :is-opened="true"
    :esc-close="true"
    :close-button="isPhoneSizeViewportWidth"
    @modal-dialog-close="handleClose"
  >
    <div class="flex flex-col gap-4 sm:-mt-2 sm:flex-row">
      <fw-input
        v-model="emailValue"
        class="sm:w-[276px]"
        type="text"
        :is-read-only="hasProfileEmail"
        :size="isPhoneSizeViewportWidth ? 'large' : 'medium'"
        :placeholder="$T('Enter your email')"
        :disable-clear-icon="true"
      />
      <fw-input
        v-model="enterNameInput"
        class="cursor-pointer sm:w-[160px]"
        type="text"
        theme="dim"
        :maxlength="20"
        custom-input-class="cursor-pointer w-full"
        :size="isPhoneSizeViewportWidth ? 'large' : 'medium'"
        :placeholder="$T('Name (Optional)')"
      />
    </div>
    <div class="mb-3 mt-6 sm:mb-2 sm:mt-4">
      <fw-textarea
        v-model="ideasText"
        :maxlength="MAX_CHARS"
        theme="dim"
        class="resize-non mb-0 block min-h-[200px] w-full rounded-bl-none rounded-br-none border-b-[#1214161F] dark:border-b-[#E4E7EB1F]"
        :placeholder="
          $T(
            'If you\'ve run into any issues or have ideas to make Xmind better, we\'d love to hear from you. Please share your feedback with as much detail as you can.',
          )
        "
      />
      <div
        class="text-mobile-caption border-grey-300 bg-fill-surfaceDesktop-light text-grey-500 dark:border-grey-300 dark:border-grey-500 dark:bg-fill-surfaceDesktop-dark dark:bg-grey-800 dark:text-grey-450 flex h-10 items-center rounded-bl-[4px] rounded-br-[4px] border border-t-0 px-3 py-2"
      >
        <fw-button
          theme="link"
          class="h-6 !rounded-[4px]"
          :class="
            selectedFile
              ? '!pl-2 !pr-1'
              : 'hover:!bg-mask-overlay-s-light active:!bg-mask-overlay-m-light hover:dark:!bg-mask-overlay-s-dark active:dark:!bg-mask-overlay-m-dark w-24'
          "
          size="small"
          @click="handleAttachFile"
        >
          <fw-icon name="attachment" class="mr-1 inline-block h-4 w-4 sm:h-[14px] sm:w-[14px]" />
          <span class="sm:text-desktop-body-small max-w-[255px] truncate text-left sm:max-w-[365px]">
            {{ selectedFile ? selectedFile.name : $T('Attach file') }}
          </span>
        </fw-button>
        <fw-icon
          v-if="selectedFile"
          name="xmark-fill"
          class="text-transparent-dark-6 hover:text-icon-tertiary-light active:text-icon-secondary-light dark:text-grey-500 dark:hover:text-icon-tertiary-dark dark:active:text-icon-secondary-dark inline-block w-5 cursor-pointer sm:w-4"
          @click="removeFile"
        />
        <input ref="fileInputRef" type="file" class="hidden" @change="onFileChange" />
      </div>
    </div>
    <!-- eslint-disable vue/no-v-html -->
    <span
      class="text-mobile-body-small text-transparent-dark-8 dark:text-transparent-white-8 sm:text-desktop-body-small"
      v-html="diagnosticDataTooltipHTML"
    ></span>
    <!-- eslint-enable vue/no-v-html -->
    <template #between-body-footer>
      <base-divider />
    </template>
    <template #footer>
      <div class="flex flex-col justify-end gap-2 sm:flex-row">
        <fw-button theme="default" :size="isPhoneSizeViewportWidth ? 'large' : 'small'" data-focus="not-allow" @click="handleClose">
          {{ $T('Cancel') }}
        </fw-button>
        <fw-button
          theme="secondary"
          :size="isPhoneSizeViewportWidth ? 'large' : 'small'"
          data-focus="not-allow"
          :disabled="!ideasText.trim() || sendButtonDisabled"
          @click="handleSendIdea"
        >
          {{ $T('Send') }}
        </fw-button>
      </div>
    </template>
  </modal-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePromiseHook } from 'utils/vue-utils'
import BaseDivider from 'client/components/base/divider.vue'
import ModalDialog from 'client/components/new-base-modal-dialog.vue'
import { useWindowResize } from 'client/composables/window-resize'
import { useAccountStore } from 'client/store/account-store'
import { $T, getCurrentLanguage } from 'client/library/translation'
import { REGION } from 'client/constants'
import { toastActions } from 'client/library/new-notifications'
import { getDeviceAndPlatformInfo } from 'client/utils/get-platform'
import { getOS, isMobileDevice, isTabletLikeDevice } from 'client/utils/detectDevice'
import { getFingerprintSync } from 'client/library/cloud-kit/client/internal-request'

const enterNameInput = ref('')
const ideasText = ref('')
const selectedFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const dialog = ref<InstanceType<typeof ModalDialog>>()
const sendButtonDisabled = ref(false)

const MAX_CHARS = 500
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const { resolve } = usePromiseHook()
const { isPhoneSizeViewportWidth } = useWindowResize()
const accountStore = useAccountStore()
const profile = computed(() => accountStore.profile)
const profileEmail = computed(() => profile.value?.primary_email)
const hasProfileEmail = computed(() => !!profileEmail.value)
const emailValue = ref(hasProfileEmail.value ? profileEmail.value : '')
const userAgent = navigator.userAgent

const diagnosticDataTooltipHTML =
  REGION === 'cn'
    ? '部分问题已在我们的<a class="font-app-body text-blue-6 hover:text-blue-6" href="https://xmind.cn/getting-help/" target="_blank">使用指南</a>中涵盖。仍需帮助？通过<a class="text-blue-6 hover:text-blue-6 font-app-body" href="mailto:hello@xmind.com" target="_blank">Email</a>联系我们。'
    : $T(
        'Some issues are covered in our $1. Still need help? Reach us via $2 or $3.',
        '<a class="font-app-body text-blue-6 hover:text-blue-6" href="https://app.xmind.com/faq" target="_blank">FAQ</a>',
        '<a class="text-blue-6 hover:text-blue-6 font-app-body" href="mailto:hello@xmind.com" target="_blank">Email</a>',
        '<a class="text-blue-6 hover:text-blue-6 font-app-body" href="https://discord.gg/qTZvcR2Qjp" target="_blank">Discord</a>',
      )

const removeFile = () => {
  selectedFile.value = null
}

const handleClose = async () => {
  await dialog.value?.closeDialogWithAnimation?.()
  resolve()
}
const handleAttachFile = () => {
  fileInputRef.value?.click()
}

const onFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (file.size > MAX_FILE_SIZE) {
    toastActions.show({
      message: $T('File size cannot exceed 10MB.'),
      topic: 'failed',
    })
    input.value = ''
    return
  }
  selectedFile.value = file
  input.value = ''
}

const extractOSVersion = (): string => {
  const patterns = [
    { regex: /(?:iPhone|iPad|iPod) OS (\d+[._]\d+(?:[._]\d+)?)/i, transform: (v: string) => v.replace(/_/g, '.') },
    { regex: /Android (\d+(?:\.\d+)*)/i },
    { regex: /Mac OS X (\d+[._]\d+(?:[._]\d+)?)/i, transform: (v: string) => v.replace(/_/g, '.') },
    { regex: /Windows NT (\d+\.\d+)/i },
    { regex: /(?:Harmony|OpenHarmony)[/\s]?(\d+(?:\.\d+)*)/i },
  ]

  for (const { regex, transform } of patterns) {
    const match = userAgent.match(regex)
    if (match) return transform ? transform(match[1]) : match[1]
  }

  return ''
}

const extractOSDistro = (): string => {
  const distros = ['ColorOS', 'Ubuntu', 'CentOS']
  const kilin = userAgent.match(/KilinOS|Kylin/i)
  if (kilin) return 'KilinOS'

  for (const distro of distros) {
    if (userAgent.includes(distro)) return distro
  }

  return ''
}

const getDevicePayload = () => {
  const deviceInfo = getDeviceAndPlatformInfo()
  const platformType = isMobileDevice() ? (isTabletLikeDevice() ? 'tablet' : 'phone') : 'desktop'
  const os = getOS() || 'unknown'

  return {
    platformType: platformType || 'other',
    os: os === 'Mac OS' ? 'macOS' : os,
    osDistro: extractOSDistro(),
    osVersion: extractOSVersion(),
    osLanguage: navigator.language || 'unknown',
    deviceBrand: deviceInfo.deviceBrand || '',
    deviceModel: deviceInfo.deviceModel || '',
    deviceId: getFingerprintSync(),
  }
}

const getAppPayload = () => {
  const { platform } = getDeviceAndPlatformInfo()
  const packageTypeMap: Record<string, string> = {
    mac: 'Mac',
    win: 'Windows',
    ios: 'iPhone',
    android: 'Android',
    harmony: 'Harmony',
  }

  return {
    packageType: packageTypeMap[platform] || '',
    appVersion: navigator.appVersion || '',
    language: getCurrentLanguage() || 'unknown',
  }
}

const handleSendIdea = async () => {
  sendButtonDisabled.value = true

  try {
    if (!emailValue.value) {
      toastActions.show({
        message: $T('Please fill in your email address before submitting'),
        topic: 'failed',
      })
      sendButtonDisabled.value = false
      return
    }
    const userPlan = accountStore.isUserPremiumSubscribed ? 'premium' : accountStore.isUserProSubscribed ? 'pro' : 'free'

    const formData = new FormData()
    formData.append('app', JSON.stringify(getAppPayload()))
    formData.append('userId', profile.value.user || '')
    formData.append('plan', userPlan)
    formData.append('device', JSON.stringify(getDevicePayload()))
    formData.append('title', enterNameInput.value || 'Feedback')
    formData.append('content', ideasText.value)
    formData.append('email', emailValue.value)

    if (selectedFile.value) {
      const isImage = selectedFile.value.type.startsWith('image/')
      const isTxtOrZip =
        selectedFile.value.type === 'text/plain' ||
        selectedFile.value.type === 'application/zip' ||
        selectedFile.value.type === 'application/x-zip-compressed' ||
        selectedFile.value.name.endsWith('.zip')

      if (isImage) {
        formData.append('image', selectedFile.value)
        formData.append('log', '')
      } else if (isTxtOrZip) {
        formData.append('log', selectedFile.value)
        formData.append('image', '')
      } else {
        formData.append('image', selectedFile.value)
        formData.append('log', '')
      }
    } else {
      formData.append('image', '')
      formData.append('log', '')
    }

    const success = await accountStore.sendFeedbackInformation(formData)

    if (!success) {
      throw new Error('Failed to send feedback')
    }

    toastActions.show({
      message: $T('Thank you for your feedback'),
      topic: 'success',
    })

    await dialog.value?.closeDialogWithAnimation?.()
    resolve()
  } catch (error) {
    logger.error('Error sending feedback:', error)
    toastActions.show({
      message: $T('Failed to send feedback. Please try again.'),
      topic: 'failed',
    })
    sendButtonDisabled.value = false
  }
}
</script>
