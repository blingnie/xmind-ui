<template>
  <div class="contents">
    <div class="mb-6 flex flex-col gap-4 px-[24px] sm:gap-6 sm:pt-[8px]">
      <slot name="tab"></slot>

      <div
        class="flex h-40 flex-col gap-2 overflow-y-auto rounded border border-border-muted-light bg-fill-surface-light p-6 dark:border-border-muted-dark dark:bg-fill-surface-dark sm:h-36"
        :class="{ 'items-center justify-center': !isAccessible }"
      >
        <fw-icon
          v-if="!isAccessible"
          name="code"
          width="28"
          height="28"
          class="rounded-[6px] border-[0.5px] border-solid border-black/5 bg-fill-surfaceBright-light p-1 shadow-elevation-l1-light dark:bg-fill-surfaceBright-dark dark:shadow-elevation-l1-dark"
        />
        <p v-if="isAccessible" class="break-all text-mobile-body-large sm:text-desktop-body-large">{{ embedMessage }}</p>
        <div v-else class="flex flex-col items-center gap-2">
          <div class="inline-flex items-center gap-1">
            <fw-button theme="link" :size="isPhoneSizeViewportWidth ? 'large' : 'medium'" :disabled="isPublishing" @click="$emit('publish')">
              {{ $T('Publish') }}
            </fw-button>
            <span class="text-mobile-subhead-mini sm:text-desktop-subhead-mini">{{ $T(' to get embed code') }}</span>
          </div>
          <span class="text-mobile-caption-footer text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-caption">
            {{ $T('Once published, anyone with the link can access your map without signing in.') }}
          </span>
        </div>
      </div>

      <div v-if="isPhoneSizeViewportWidth" class="flex items-center gap-2">
        <span class="text-mobile-body-medium sm:text-desktop-body-medium">{{ $T('Content') }}</span>
        <new-select
          class="flex-1"
          :selected-key="selectedKey"
          :options="selectItems"
          :position="'bottom-left'"
          :trigger-size="'medium'"
          :menu-custom-class="'w-52'"
          :disabled="!isAccessible"
          @select="handleSelect"
        />
      </div>
    </div>

    <template v-if="isPhoneSizeViewportWidth && isAccessible">
      <fw-divider class="mb-[16px]" />
      <div class="flex w-full items-center justify-between gap-2 px-[24px] pb-8 sm:w-auto">
        <fw-button theme="default" class="flex flex-1 items-center gap-1" size="large" @click="copyLink">
          <fw-icon v-show="isLinkCopied" :width="24" :height="24" name="tick" />
          <fw-icon v-show="!isLinkCopied" :width="24" :height="24" name="note-link" />
          <span class="truncate">{{ isLinkCopied ? 'Link Copied' : $T('Copy Link') }}</span></fw-button
        >
        <fw-button class="flex-1 gap-1" theme="secondary" size="large" @click="copyCode">
          <fw-icon v-show="isCodeCopied" :width="24" :height="24" name="tick" />
          <fw-icon v-show="!isCodeCopied" :width="24" :height="24" name="code" />
          <span class="truncate">{{ isCodeCopied ? 'Code Copied' : $T('Copy Code') }}</span>
        </fw-button>
      </div>
    </template>

    <template v-if="!isPhoneSizeViewportWidth">
      <fw-divider class="mb-[16px]" />
      <section class="flex items-center justify-between px-[24px] pb-[32px] sm:pb-[18px]">
        <div v-if="!isPhoneSizeViewportWidth" class="flex items-center gap-2">
          <span class="text-mobile-body-medium sm:text-desktop-body-medium">{{ $T('Content') }}</span>
          <new-select
            :selected-key="selectedKey"
            :options="selectItems"
            :position="'bottom-left'"
            :trigger-size="'small'"
            :menu-custom-class="'w-52'"
            :disabled="!isAccessible"
            @select="handleSelect"
          />
        </div>

        <div v-if="isAccessible" class="flex w-full items-center gap-2 sm:w-auto">
          <fw-button theme="default" class="flex flex-1 items-center gap-1" size="small" @click="copyLink">
            <fw-icon v-show="isLinkCopied" :width="16" :height="16" name="tick" />
            <fw-icon v-show="!isLinkCopied" :width="16" :height="16" name="note-link" />
            <span class="truncate">{{ isLinkCopied ? 'Link Copied' : $T('Copy Link') }}</span></fw-button
          >
          <fw-button class="w-full gap-1 sm:w-auto" theme="secondary" size="small" @click="copyCode">
            <fw-icon v-show="isCodeCopied" :width="16" :height="16" name="tick" />
            <fw-icon v-show="!isCodeCopied" :width="16" :height="16" name="code" />
            <span class="truncate">{{ isCodeCopied ? 'Code Copied' : $T('Copy Code') }}</span>
          </fw-button>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import * as Clipboard from 'utils/clipboard'
import { $T } from 'client/library/translation'
import { useMindMap } from 'compositions/mindmap'
import { trackCollaborateCopyEmbedLink } from 'client/library/tracker'
import { useWindowResize } from 'client/composables/window-resize'
import NewSelect from 'client/components/base/select.vue'

type SelectKey = 'current-file' | 'current-sheet'

const props = defineProps<{
  fileId: string
  isAccessible: boolean
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'publish'): void
}>()

const { isPhoneSizeViewportWidth } = useWindowResize()

const isCodeCopied = ref(false)
const isLinkCopied = ref(false)
const isPublishing = ref(false)
const selectedKey = ref<SelectKey>('current-sheet')
const selectItems = computed<{ key: SelectKey; label: string }[]>(() => {
  return [
    { key: 'current-sheet', label: $T('Current Sheet') },
    { key: 'current-file', label: $T('Current File') },
  ]
})

const embedUrl = computed(
  () =>
    `${window.location.origin}/embed/${props.fileId}${selectedKey.value === 'current-sheet' ? `?sheet-id=${useMindMap().activeSheetId.value}` : ''}`,
)
const embedMessage = computed(
  () => `<iframe src="${embedUrl.value}" width="900px" height="540px" frameborder="0" scrolling="no" allow="fullscreen"></iframe>`,
)

const handleSelect = (key: SelectKey) => {
  selectedKey.value = key
}

let codeTimeout: ReturnType<typeof setTimeout> | null = null
const flagIsCodeCopied = () => {
  isCodeCopied.value = true
  codeTimeout && clearTimeout(codeTimeout)
  codeTimeout = setTimeout(() => {
    isCodeCopied.value = false
  }, 5000)
}

let linkTimeout: ReturnType<typeof setTimeout> | null = null
const flagIsLinkCopied = () => {
  isLinkCopied.value = true
  linkTimeout && clearTimeout(linkTimeout)
  linkTimeout = setTimeout(() => {
    isLinkCopied.value = false
  }, 5000)
}

const copyCode = async () => {
  await Clipboard.write({
    'text/plain': new Blob([embedMessage.value], { type: 'text/plain' }),
  })
  flagIsCodeCopied()
  trackCollaborateCopyEmbedLink(selectedKey.value)
}

const copyLink = async () => {
  await Clipboard.write({
    'text/plain': new Blob([embedUrl.value], { type: 'text/plain' }),
  })
  flagIsLinkCopied()
}

onBeforeUnmount(() => {
  clearTimeout(codeTimeout)
  clearTimeout(linkTimeout)
})
</script>
