<template>
  <modal-dialog
    ref="dialog"
    class="whats-new-dialog"
    :title="$T('Release Notes')"
    :width="'90%'"
    :max-width="668"
    :height="isPhoneSizeViewportWidth ? '75%' : '80%'"
    :max-height="766"
    :dialog-class="isPhoneSizeViewportWidth ? '!fixed !bottom-0 !left-0 !right-0 !w-full !m-0 !h-[80vh] !rounded-t-2xl !rounded-b-none ' : ''"
    :is-opened="true"
    :close-button="true"
    :esc-close="true"
    :dialog-header-class="
      isPhoneSizeViewportWidth
        ? '!px-[24px] !pt-[24px] !pb-[16px] justify-between items-center'
        : '!px-[32px] !py-[24px] justify-between items-center'
    "
    :dialog-body-class="isPhoneSizeViewportWidth ? '!px-6 !pt-[24px]' : '!px-[32px]  !py-[24px]'"
    :dialog-footer-class="'!p-0'"
    @modal-dialog-close="handleClose"
  >
    <template #separator>
      <base-divider />
    </template>

    <div v-for="(versionInfo, versionIndex) in contentList" :key="versionIndex" class="flex flex-col">
      <div class="mb-5 flex flex-col">
        <span class="text-mobile-body-large text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-body-large">
          {{ $T('Version') }} {{ versionInfo?.version }}
        </span>
        <span class="text-desktop-body-large text-text-tertiary-light dark:text-text-tertiary-dark">
          {{ $T('Release Date') }}: {{ formatDate(versionInfo?.releaseDate) }}
        </span>
      </div>

      <div class="flex flex-col gap-5">
        <div v-for="(featureInfo, featureIndex) in versionInfo.features" :key="featureIndex">
          <div v-if="featureInfo.type === 'main-update'" class="flex flex-col gap-5">
            <img
              v-if="featureInfo.img"
              uk-img
              class="border-border-translucent-light dark:border-border-translucent-dark w-full rounded-lg border"
              :data-src="$toResourceURL(featureInfo.img as string)"
              :alt="featureInfo.title as string"
            />
            <div class="flex flex-col">
              <span
                v-if="featureInfo.title"
                class="text-mobile-subhead-small text-text-primary-light dark:text-text-primary-dark sm:text-desktop-subhead-small"
              >
                {{ $T(featureInfo.title) }}
              </span>
              <span
                :class="featureInfo.title && featureInfo.content ? 'mt-3' : ''"
                class="text-mobile-body-large text-text-primary-light dark:text-text-primary-dark sm:text-desktop-body-large"
              >
                {{ $T(featureInfo.content) }}
              </span>
            </div>
          </div>

          <div v-else-if="featureInfo.type === 'normal-update'" class="flex flex-col gap-3">
            <span class="text-mobile-subhead-small text-text-primary-light dark:text-text-primary-dark sm:text-desktop-subhead-small">
              {{ getNormalUpdateIndex(versionInfo.features, featureIndex) }}. {{ $T(featureInfo.title) }}
            </span>
            <span
              v-if="featureInfo.content"
              class="text-mobile-body-large text-text-primary-light dark:text-text-primary-dark sm:text-desktop-body-large"
            >
              {{ $T(featureInfo.content) }}
            </span>
          </div>

          <div v-else-if="featureInfo.type === 'single-update'" class="flex flex-col gap-2">
            <span class="text-mobile-body-large text-text-primary-light dark:text-text-primary-dark sm:text-desktop-body-large">
              {{ $T(featureInfo.title) }}:
            </span>
            <span class="text-mobile-body-large text-text-primary-light dark:text-text-primary-dark sm:text-desktop-body-large">
              {{ $T(featureInfo.content) }}
            </span>
          </div>

          <div v-else-if="featureInfo.type === 'normal-title'" class="flex items-center gap-1">
            <span class="text-mobile-body-large text-text-primary-light dark:text-text-primary-dark sm:text-desktop-body-large">
              {{ $T(featureInfo.title) }}
            </span>
            <img
              v-if="featureInfo.proIcon"
              uk-img
              class="inline-block h-[14px] w-[14px]"
              :data-src="toURL('/assets/static/images/home-sidebar/pricing-lock.png')"
              alt=""
            />
          </div>

          <div v-else-if="featureInfo.type === 'special-launch'" class="flex items-center gap-1">
            <button class="uk-button uk-button-text fw-override">{{ $T(featureInfo.title) }}</button>
            <span class="text-mobile-body-large text-text-primary-light dark:text-text-primary-dark sm:text-desktop-body-large">
              : {{ $T(featureInfo.content) }}
            </span>
          </div>

          <ul v-else class="mb-0 list-disc">
            <li>
              <span class="text-mobile-body-large text-text-primary-light dark:text-text-primary-dark sm:text-desktop-body-large">
                {{ $T(featureInfo.title) }}:
              </span>
              <span class="text-mobile-body-large text-text-primary-light dark:text-text-primary-dark sm:text-desktop-body-large">
                {{ $T(featureInfo.content) }}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <base-divider v-if="versionIndex !== contentList.length - 1" class="my-9" />
    </div>

    <div class="h-6 w-full"></div>
  </modal-dialog>
</template>

<script setup lang="ts">
import { usePromiseHook } from 'utils/vue-utils'
import { ref } from 'vue'
import BaseDivider from 'client/components/base/divider.vue'
import whatsNewInfoCN from 'client/assets/import-files/whats-new/whats-new-cn.json'
import whatsNewInfoGlobal from 'client/assets/import-files/whats-new/whats-new-global.json'
import { useWindowResize } from 'client/composables/window-resize'
import { REGION } from 'client/constants'

import ModalDialog from 'client/components/new-base-modal-dialog.vue'
import { formatDate } from './team-profile/utils'

interface VersionInfo {
  version: string
  releaseDate?: string
  features: readonly FeatureInfo[]
}

interface FeatureInfo {
  type: string
  title: string
  img?: string
  content?: string
  proIcon?: boolean
}

const dialog = ref<InstanceType<typeof ModalDialog>>()
const { resolve } = usePromiseHook()
const { isPhoneSizeViewportWidth } = useWindowResize()

const whatsNewInfo = REGION === 'cn' ? whatsNewInfoCN : whatsNewInfoGlobal
const contentList = ref((whatsNewInfo as VersionInfo[]).slice(0, 5))
const getNormalUpdateIndex = (features: readonly FeatureInfo[], currentIndex: number) => {
  let count = 0
  for (let i = 0; i <= currentIndex; i++) {
    if (features[i].type === 'normal-update') {
      count++
    }
  }
  return count
}

const handleClose = async () => {
  await dialog.value?.closeDialogWithAnimation?.()
  resolve()
}
</script>
