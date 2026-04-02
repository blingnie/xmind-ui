<template>
  <modal-dialog
    :is-opened="true"
    :width="isPhoneSizeViewportWidth ? 343 : 360"
    :dialog-footer-class="'hidden'"
    :dialog-header-class="'hidden'"
    :dialog-body-class="'!p-[32px]'"
    @modal-dialog-close="handleClose"
  >
    <div class="flex flex-col items-center gap-4">
      <div class="flex flex-col items-center gap-2 text-center">
        <span class="text-mobile-subhead-large sm:text-desktop-subhead-large">{{ $T('🎉 Exported') }}</span>
        <span class="w-56 text-mobile-headline-large sm:w-52 sm:text-desktop-headline-large">{{ $T('Time to share your minds!') }}</span>
      </div>

      <div class="flex flex-col items-center gap-3">
        <img uk-img :data-src="appearance === 'dark' ? exportImageSuccessDarkImg : exportImageSuccessLightImg" class="h-24 w-24" />
        <div class="flex items-center gap-5 rounded-lg bg-mask-overlay-s-light px-[16px] py-[12px] dark:bg-mask-overlay-s-dark">
          <span class="text-mobile-caption-header sm:text-desktop-caption-header">{{ $T('Share to') }}</span>
          <div class="flex items-center gap-4">
            <fw-tooltip>
              <template #trigger>
                <img uk-img :data-src="exportTwitterImg" class="h-7 w-7 cursor-pointer" @click="shareToSocialMedia('twitter')" />
              </template>
              <template #tooltip>
                <span>{{ $T('Click to share on X(Twitter).') }}</span>
              </template>
            </fw-tooltip>
            <fw-tooltip>
              <template #trigger>
                <img uk-img :data-src="exportFacebookImg" class="h-7 w-7 cursor-pointer" @click="shareToSocialMedia('facebook')" />
              </template>
              <template #tooltip>
                <span>{{ $T('Click to share on Facebook.') }}</span>
              </template>
            </fw-tooltip>
            <fw-tooltip>
              <template #trigger>
                <img uk-img :data-src="exportLinkedinImg" class="h-7 w-7 cursor-pointer" @click="shareToSocialMedia('linkedin')" />
              </template>
              <template #tooltip>
                <span>{{ $T('Click to share on LinkedIn.') }}</span>
              </template>
            </fw-tooltip>
            <fw-tooltip>
              <template #trigger>
                <img uk-img :data-src="exportInstagramImg" class="h-7 w-7 cursor-pointer" @click="shareToSocialMedia('instagram')" />
              </template>
              <template #tooltip>
                <span>{{ $T('Click to upload your exported image to share on Instagram.') }}</span>
              </template>
            </fw-tooltip>
          </div>
        </div>
      </div>

      <fw-button theme="default" :size="isPhoneSizeViewportWidth ? 'large' : 'medium'" class="mt-[24px] self-stretch" @click="handleClose">
        {{ $T('Not now') }}
      </fw-button>
    </div>
  </modal-dialog>
</template>

<script lang="ts" setup>
import ModalDialog from 'client/components/new-base-modal-dialog.vue'
import { usePromiseHook } from 'utils/vue-utils'
import { useWindowResize } from 'client/composables/window-resize'
import exportImageSuccessLightImg from 'import-files/images/dialog-export/export-image-success-light.png?url'
import exportImageSuccessDarkImg from 'import-files/images/dialog-export/export-image-success-dark.png?url'
import exportFacebookImg from 'import-files/images/dialog-export/facebook.png?url'
import exportTwitterImg from 'import-files/images/dialog-export/twitter.png?url'
import exportLinkedinImg from 'import-files/images/dialog-export/linkedin.png?url'
import exportInstagramImg from 'import-files/images/dialog-export/instagram.png?url'
import { useAppStore } from 'client/store'
import { computed } from 'vue'
import { getCurrentTrackingTab, useTracking } from 'client/composables/use-tracking'

const props = defineProps<{
  fileId: string
  filename: string
}>()

const { resolve } = usePromiseHook()
const { isPhoneSizeViewportWidth } = useWindowResize()
const appearance = computed(() => useAppStore().appearance)

const handleClose = () => {
  resolve(true)
}

const shareToSocialMedia = (category: 'twitter' | 'facebook' | 'linkedin' | 'instagram') => {
  let shareUrl = ''
  switch (category) {
    case 'twitter':
      shareUrl = `https://x.com/intent/post?text=${encodeURIComponent(
        `Just created my mind map <${props.filename}> with @XmindHQ https://xmind.ai/?utm_source=exported`,
      )}&hashtags=XmindAI,MindMapping`
      break
    case 'facebook':
      shareUrl = `https://www.facebook.com/share_channel/?type=reshare&link=https%3A%2F%2Fxmind.ai%2Fapi%2Fdrive%2Ffile%2F${
        props.fileId
      }%2FThumbnails%2Fthumbnail.png&source_surface=external_reshare&&hashtag=${encodeURIComponent(
        'Just created my mind map with @Xmindhq https://xmind.ai/?utm_source=exported #mindmapping #xmind',
      )}`
      break
    case 'linkedin':
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?shareActive=true&shareUrl=https%3A%2F%2Fxmind.ai%2Fapi%2Fdrive%2Ffile%2F${
        props.fileId
      }%2FThumbnails%2Fthumbnail.png&text=${encodeURIComponent(`Just created my mind map <${props.filename}> with @Xmind https://xmind.ai/`)}`
      break
    case 'instagram':
      shareUrl = 'https://www.instagram.com/'
      break
  }
  shareUrl && window.open(shareUrl, '_blank')
  useTracking().trackClick('share', { action: 'export', tab: getCurrentTrackingTab(), share_platform: category })
}
</script>
