<script setup lang="ts">
import { computed } from 'vue'
import NewInput from 'client/components/base/input.vue'
import BaseButton from 'client/components/base/button.vue'
import { useAccountStore } from 'app/services/pinia'
import { generateAvatarDataURI } from 'client/library/cloud-kit/utils/avatar'
import { trackNewVersionWorks } from 'client/library/tracker'
import { useWindowResize } from 'client/composables/window-resize'

const { isPhoneSizeViewportWidth } = useWindowResize()

const profile = computed(() => useAccountStore().profile)

const handleChangeSetting = () => {
  trackNewVersionWorks.myAccount('ChangeSettings')
  window.open('https://xmind.net/account')
}

const defaultAvatar = computed(() => {
  if (!profile.value?.full_name) return null
  return generateAvatarDataURI({ name: profile.value?.full_name, xmindId: profile.value?.user })
})

const newsFrequency = [
  { key: '1', label: 'Monthly' },
  { key: '2', label: 'Bi-monthly' },
  { key: '0', label: 'None' },
  { key: '9', label: 'None' },
]
const newsLanguages = [
  { key: 'en', label: 'English' },
  { key: 'de', label: 'DEUTSCH' },
  { key: 'fr', label: 'Français' },
  { key: 'jp', label: '日本語' },
]
</script>

<template>
  <div class="flex flex-col gap-6 px-[24px]">
    <div class="flex flex-col gap-4">
      <span class="text-mobile-subhead-small sm:text-desktop-subhead-small">{{ $T('Profile Photo') }}</span>
      <div class="flex items-center gap-4">
        <img
          uk-img
          class="h-16 w-16 rounded-full sm:h-12 sm:w-12"
          :data-src="profile?.avatar_url || defaultAvatar || toURL('/assets/static/images/home-top-bar/avatar2.svg')"
        />
        <span class="text-mobile-body-medium sm:text-desktop-body-medium">
          {{ $T('Your profile photo will appear on your account page, the official website and Xmind applications after logging in.') }}
        </span>
      </div>
    </div>

    <div class="flex flex-col gap-3">
      <span class="text-mobile-subhead-small sm:text-desktop-subhead-small">{{ $T('Name') }}</span>
      <div class="flex items-center gap-3">
        <new-input v-model="profile.first_name" class="flex-1" :size="isPhoneSizeViewportWidth ? 'large' : 'medium'" :disabled="true"></new-input>
        <new-input v-model="profile.last_name" class="flex-1" :size="isPhoneSizeViewportWidth ? 'large' : 'medium'" :disabled="true"></new-input>
      </div>
    </div>

    <div class="flex flex-col gap-3">
      <span class="text-mobile-subhead-small sm:text-desktop-subhead-small">{{ $T('Email') }}</span>
      <new-input v-model="profile.primary_email" :size="isPhoneSizeViewportWidth ? 'large' : 'medium'" :disabled="true"></new-input>
    </div>

    <div class="flex flex-col gap-3">
      <span class="text-mobile-subhead-small sm:text-desktop-subhead-small">{{ $T('Newsletter') }}</span>
      <div class="flex items-center gap-3">
        <div class="flex flex-1 flex-col gap-2">
          <span class="text-mobile-body-medium sm:text-desktop-body-medium">{{ $T('Frequency') }}</span>
          <fw-select
            :trigger-size="isPhoneSizeViewportWidth ? 'large' : 'medium'"
            :position="'bottom-left'"
            :disabled="true"
            :trigger-custom-class="'w-full'"
            :selected-key="profile?.news_frequency.toString()"
            :options="newsFrequency"
          />
        </div>
        <div class="flex flex-1 flex-col gap-2">
          <span class="text-mobile-body-medium sm:text-desktop-body-medium">{{ $T('Language') }}</span>
          <fw-select
            :trigger-size="isPhoneSizeViewportWidth ? 'large' : 'medium'"
            :position="'bottom-left'"
            :disabled="true"
            :trigger-custom-class="'w-full'"
            :selected-key="profile?.news_language"
            :options="newsLanguages"
          />
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-3">
      <base-button class="self-start" theme="default" :size="isPhoneSizeViewportWidth ? 'large' : 'medium'" @click="handleChangeSetting">
        {{ $T('Manage Account') }}
      </base-button>
      <p class="text-desktop-caption-1 text-text-tertiary-light dark:text-text-tertiary-dark">
        {{ $T('View your subscription, devices list, and manage your account information.') }}
      </p>
    </div>
  </div>
</template>
