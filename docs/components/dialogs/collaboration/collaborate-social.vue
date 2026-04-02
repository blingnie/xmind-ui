<template>
  <div class="contents">
    <div class="flex flex-col gap-4 px-[24px] sm:gap-6 sm:pt-[8px]">
      <slot name="tab"></slot>

      <div
        v-if="!isAccessible"
        class="flex h-40 flex-col items-center justify-center gap-2 rounded border border-border-muted-light bg-fill-surface-light p-6 text-center dark:border-border-muted-dark dark:bg-fill-surface-dark sm:h-36"
      >
        <img :src="appearance === 'dark' ? collaborateSocialImgDark : collaborateSocialImgLight" class="w-[90px]" />
        <div class="inline-flex items-center gap-1">
          <fw-button theme="link" :size="isPhoneSizeViewportWidth ? 'large' : 'medium'" :disabled="isPublishing" @click="$emit('publish')">
            {{ $T('Publish') }}
          </fw-button>
          <span class="text-mobile-subhead-mini sm:text-desktop-subhead-mini">{{ $T('to share on social media') }}</span>
        </div>

        <span class="text-mobile-caption-footer text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-caption">
          {{ $T('Once published, anyone with the link can access your map without signing in.') }}
        </span>
      </div>

      <template v-else>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div
            class="flex cursor-pointer flex-row items-center justify-between rounded border border-border-muted-light bg-fill-surface-light py-2 pl-[8px] pr-[12px] transition-colors duration-300 hover:border-border-quaternary-light active:border-border-tertiary-light dark:border-border-muted-dark dark:bg-fill-surface-dark dark:hover:border-border-quaternary-dark dark:active:border-border-tertiary-dark"
            @click="shareToSocialMedia('twitter')"
          >
            <div class="flex flex-1 items-center gap-2">
              <fw-icon name="twitter-color" />
              <span class="text-mobile-body-medium sm:text-desktop-body-medium">{{ $T('Twitter') }}</span>
            </div>
          </div>

          <div
            class="flex cursor-pointer flex-row items-center justify-between rounded border border-border-muted-light bg-fill-surface-light py-2 pl-[8px] pr-[12px] transition-colors duration-300 hover:border-border-quaternary-light active:border-border-tertiary-light dark:border-border-muted-dark dark:bg-fill-surface-dark dark:hover:border-border-quaternary-dark dark:active:border-border-tertiary-dark"
            @click="shareToSocialMedia('linkedin')"
          >
            <div class="flex flex-1 items-center gap-2">
              <fw-icon name="linkedin-color" />
              <span class="text-mobile-body-medium sm:text-desktop-body-medium">{{ $T('LinkedIn') }}</span>
            </div>
          </div>

          <div
            class="flex cursor-pointer flex-row items-center justify-between rounded border border-border-muted-light bg-fill-surface-light py-2 pl-[8px] pr-[12px] transition-colors duration-300 hover:border-border-quaternary-light active:border-border-tertiary-light dark:border-border-muted-dark dark:bg-fill-surface-dark dark:hover:border-border-quaternary-dark dark:active:border-border-tertiary-dark"
            @click="shareToSocialMedia('facebook')"
          >
            <div class="flex flex-1 items-center gap-2">
              <fw-icon name="facebook-color" />
              <span class="text-mobile-body-medium sm:text-desktop-body-medium">{{ $T('Facebook') }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>

    <fw-divider class="mb-[16px] mt-[32px]" />

    <section class="flex items-center justify-end gap-2 px-[24px] pb-[32px] sm:pb-[18px]">
      <fw-button class="flex-1 sm:flex-initial" theme="default" :size="isPhoneSizeViewportWidth ? 'large' : 'small'" @click="$emit('close')">
        {{ $T('Cancel') }}
      </fw-button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from 'client/store'
import { useWindowResize } from 'client/composables/window-resize'
import collaborateSocialImgLight from 'import-files/images/dialog-collaborate/collaborate-publish-social-light.png?url'
import collaborateSocialImgDark from 'import-files/images/dialog-collaborate/collaborate-publish-social-dark.png?url'
import { $T } from 'client/library/translation'
import { generateShortUUID } from 'utils/shortUUID'
import { getCurrentTrackingTab, useTracking } from 'client/composables/use-tracking'

const props = defineProps<{
  fileId: string
  isAccessible: boolean
  fileTitle: string
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'publish'): void
}>()

const { isPhoneSizeViewportWidth } = useWindowResize()

const isPublishing = ref(false)
const appearance = computed(() => useAppStore().appearance)

const shareToSocialMedia = (category: 'twitter' | 'facebook' | 'linkedin') => {
  let shareUrl = ''
  switch (category) {
    case 'twitter':
      shareUrl = `https://x.com/intent/post?text=${encodeURIComponent(
        `Just created my mind map <${props.fileTitle}> with @XmindHQ ~ See details: ${window.location.origin}/share/${
          props.fileId
        }?utm_source=published&xid=${generateShortUUID()}`,
      )}&hashtags=Xmind,MindMapping`
      break
    case 'facebook':
      shareUrl = `https://www.facebook.com/share_channel/?type=reshare&link=${encodeURIComponent(
        `${window.location.origin}/share/${props.fileId}?xid=${generateShortUUID()}`,
      )}&app_id=966242223397117&source_surface=external_reshare&&hashtag=${encodeURIComponent(
        'Just created my mind map with @Xmindhq ~ Click to see details #mindmapping #xmind',
      )}`
      break
    case 'linkedin':
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?shareActive=true&shareUrl=https%3A%2F%2Fxmind.ai%2Fapi%2Fdrive%2Ffile%2F${
        props.fileId
      }%2FThumbnails%2Fthumbnail.png&text=${encodeURIComponent(
        `Just created my mind map <${props.fileTitle}> with @Xmind ~ See details: ${window.location.origin}/share/${
          props.fileId
        }?xid=${generateShortUUID()}&utm_source=published`,
      )}`
      break
  }
  shareUrl && window.open(shareUrl, '_blank')
  useTracking().trackClick('share', { action: 'publish', tab: getCurrentTrackingTab(), share_platform: category })
}
</script>
