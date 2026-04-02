<template>
  <new-modal-dialog
    :title="$T('Pitch Video')"
    :is-opened="true"
    :min-height="220"
    :height="'auto'"
    :width="412"
    :buttons="buttons"
    :dialog-body-class="'px-6'"
    :close-button="isPhoneSizeViewportWidth"
    class="export-to-pitch-video-dialog"
    @modal-dialog-close="handleClose"
  >
    <div class="mb-6 flex w-full">
      <fw-carousel class="w-full" track-class="no-scrollbar relative flex w-full overflow-x-auto py-0.5" :active-item="activeThemeItem">
        <button
          v-for="{ id, name, thumbnail } of themeOptions"
          :key="id"
          type="button"
          class="mr-2 flex w-[120px] shrink-0 flex-col items-center gap-[6px]"
          @click="selectedThemeId = id"
          :ref="el => setThemeRef(id, el as HTMLButtonElement | null)"
        >
          <div
            class="outline-border-muted-light dark:outline-border-muted-dark relative rounded-lg outline outline-[1.6px]"
            :class="
              selectedThemeId === id
                ? '!outline-ai-purple-400 outline-[1.6px] outline-offset-0'
                : 'hover:outline-border-quaternary-light dark:hover:outline-border-quaternary-dark'
            "
          >
            <img :src="thumbnail" class="h-full w-full cursor-pointer rounded-lg object-cover" :alt="name" />
          </div>
        </button>
      </fw-carousel>
    </div>
    <div class="flex w-full flex-col gap-3">
      <div class="flex items-center gap-4">
        <label
          class="text-mobile-body-medium text-text-primary-light dark:text-text-primary-dark sm:text-desktop-body-medium w-[108px] flex-shrink-0"
        >
          {{ $T('Aspect Ratio') }}
        </label>
        <fw-select
          :trigger-size="isPhoneSizeViewportWidth ? 'large' : 'small'"
          :selected-key="aspectRatio"
          :options="aspectRatioOptions"
          class="flex-1 flex-shrink-0"
          @select="key => (aspectRatio = key)"
        />
      </div>

      <div class="flex items-center gap-4">
        <label
          class="text-mobile-body-medium text-text-primary-light dark:text-text-primary-dark sm:text-desktop-body-medium w-[108px] flex-shrink-0"
        >
          {{ $T('Duration') }}
        </label>
        <fw-select
          :trigger-size="isPhoneSizeViewportWidth ? 'large' : 'small'"
          :selected-key="duration"
          :options="durationOptions"
          class="flex-1 flex-shrink-0"
          @select="key => (duration = key)"
        />
      </div>
    </div>
  </new-modal-dialog>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import NewModalDialog, { type ModalDialogBottomButton } from '../new-base-modal-dialog.vue'
import { usePromiseHook } from 'utils/vue-utils'
import { $T } from 'client/library/translation'
import { useWindowResize } from 'client/composables/window-resize'

// Import pitch video theme images
import dark16_9 from 'assets/import-files/images/pitchvideo/theme/16_9/dark.svg?url'
import dark9_16 from 'assets/import-files/images/pitchvideo/theme/9_16/dark.svg?url'
import light16_9 from 'assets/import-files/images/pitchvideo/theme/16_9/light.svg?url'
import light9_16 from 'assets/import-files/images/pitchvideo/theme/9_16/light.svg?url'
import innocence16_9 from 'assets/import-files/images/pitchvideo/theme/16_9/innocence.svg?url'
import innocence9_16 from 'assets/import-files/images/pitchvideo/theme/9_16/innocence.svg?url'
import shapeForYou16_9 from 'assets/import-files/images/pitchvideo/theme/16_9/shape-for-you.svg?url'
import shapeForYou9_16 from 'assets/import-files/images/pitchvideo/theme/9_16/shape-for-you.svg?url'
import midnightRose16_9 from 'assets/import-files/images/pitchvideo/theme/16_9/midnight-rose.svg?url'
import midnightRose9_16 from 'assets/import-files/images/pitchvideo/theme/9_16/midnight-rose.svg?url'
import hubbleBubble16_9 from 'assets/import-files/images/pitchvideo/theme/16_9/hubble-bubble.svg?url'
import hubbleBubble9_16 from 'assets/import-files/images/pitchvideo/theme/9_16/hubble-bubble.svg?url'
import handDrawn16_9 from 'assets/import-files/images/pitchvideo/theme/16_9/hand-drawn.svg?url'
import handDrawn9_16 from 'assets/import-files/images/pitchvideo/theme/9_16/hand-drawn.svg?url'

const { resolve } = usePromiseHook()
const { isPhoneSizeViewportWidth } = useWindowResize()

const aspectRatio = ref('16:9')
const duration = ref('60s')
const selectedThemeId = ref('default')
const themeItemRefs = ref<Record<string, HTMLButtonElement | null>>({})

const aspectRatioOptions = computed(() => [
  { key: '16:9', label: '16:9' },
  { key: '9:16', label: '9:16' },
])

const durationOptions = computed(() => [
  { key: '30s', label: $T('30s'), value: 30 },
  { key: '60s', label: $T('60s'), value: 60 },
  { key: '120s', label: $T('120s'), value: 120 },
])

const themeOptions = computed(() => [
  {
    id: 'default',
    name: $T('Dark'),
    thumbnail: dark16_9,
    verticalThumbnail: dark9_16,
  },
  {
    id: 'light',
    name: $T('Light'),
    thumbnail: light16_9,
    verticalThumbnail: light9_16,
  },
  {
    id: 'innocence',
    name: $T('Innocence'),
    thumbnail: innocence16_9,
    verticalThumbnail: innocence9_16,
  },
  {
    id: 'shape-for-you',
    name: $T('Shape for You'),
    thumbnail: shapeForYou16_9,
    verticalThumbnail: shapeForYou9_16,
  },
  {
    id: 'midnight-rose',
    name: $T('Midnight Rose'),
    thumbnail: midnightRose16_9,
    verticalThumbnail: midnightRose9_16,
  },
  {
    id: 'hubble-bubble',
    name: $T('Hubble Bubble'),
    thumbnail: hubbleBubble16_9,
    verticalThumbnail: hubbleBubble9_16,
  },
  {
    id: 'hand-drawn',
    name: $T('Sketchbook'),
    thumbnail: handDrawn16_9,
    verticalThumbnail: handDrawn9_16,
  },
])

const activeThemeItem = computed(() => themeItemRefs.value[selectedThemeId.value] || null)

const setThemeRef = (id: string, el: HTMLButtonElement | null) => {
  if (el) {
    themeItemRefs.value[id] = el
    return
  }
  delete themeItemRefs.value[id]
}

const handleClose = () => {
  resolve({ status: false, payload: null })
}

const handleContinue = async () => {
  const selectedTheme = themeOptions.value.find(option => option.id === selectedThemeId.value)
  const themeThumbnailUrl = aspectRatio.value === '9:16' ? selectedTheme?.verticalThumbnail : selectedTheme?.thumbnail
  resolve({
    status: true,
    payload: {
      aspectRatio: aspectRatio.value,
      durationInSeconds: durationOptions.value.find(option => option.key === duration.value)?.value,
      appearanceId: selectedThemeId.value,
      themeThumbnailUrl,
    },
  })
}

const buttons = computed<ModalDialogBottomButton[]>(() => [
  {
    text: $T('Cancel'),
    onClick: handleClose,
    isDisabled: false,
    type: 'default',
  },
  {
    text: $T('Continue'),
    onClick: handleContinue,
    isDisabled: false,
    type: 'secondary',
  },
])
</script>
