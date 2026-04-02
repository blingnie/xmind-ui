<script lang="ts">
/**
 * The image viewer for editor.
 * - we create a trigger dom with specific rect and url.
 * - init photoswipe and click trigger dom.
 * - mount the image viewer toolbar.
 */
export default {
  name: 'EditorImageViewer',
}
</script>

<script lang="ts" setup>
import { PropType, computed, nextTick, onBeforeUnmount, onMounted, onUnmounted, ref, watchEffect } from 'vue'
import PhotoSwipe from 'photoswipe'
import 'photoswipe/dist/photoswipe.css'
import { type XFilePath, viewerKit } from '@xmindltd/snowmonster'
import { useFullscreen } from '@vueuse/core'
import PhotoSwipeLightbox from 'photoswipe/lightbox'
import { useAppStore, useFrameStore, useWorkspaceStore } from 'app/services/pinia'
import { isMobileDevice } from 'utils/detectDevice'
import { getMIMETypeByFileName } from 'utils/mime'
import downloadByBlob from 'utils/download'

const props = defineProps({
  imageUrl: { type: String, required: true },
  // complex object should defined by this, or an error will be thrown.
  imageRect: { type: Object as PropType<viewerKit.Rect>, required: true },
})

/**
 * photoswipe requires `a` element.
 * We hide it and close its pointer events.
 */
const objectImageUrl = ref('')
const containerRef = ref<HTMLElement>()

const heightRef = ref(0)

const widthRef = ref(0)

/**
 * To avoid the overlap of the toolbar of image-viewer and the toolbar of the editor.
 */
const showToolbar = ref(false)

const isMobile = isMobileDevice()

let photoSwipe: PhotoSwipeLightbox

/**
 * It seems not work in http://localhost.
 */
const { isFullscreen, isSupported, exit, toggle } = useFullscreen(document.body, {
  autoExit: true,
})

function exitImageViewer() {
  useFrameStore().setActivatedPopover(null)
}

/**
 * call `photoSwipe?.destroy()` directly will not play animation.
 */
function close() {
  photoSwipe?.pswp?.close()
}

/**
 * - The browser supports fullscreen.
 * - The device is not mobile.
 */
const isSupportFullScreen = computed(() => isSupported.value && !isMobile)

/**
 * - If is fullscreen, exit fullscreen.
 * - If is not fullscreen, unmount the component.
 */
const onKeyDown = (event: KeyboardEvent) => {
  if (['Space', 'Escape'].includes(event.code)) {
    if (isFullscreen.value) {
      exit()
      return
    }

    close()
  }

  event.stopPropagation()
}

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
  URL.revokeObjectURL(objectImageUrl.value)
})

let unwatchBgColor: () => void

/**
 * - calc the height and weight of the image, which is needed by photoswipe.
 * - init photoswipe
 * - click the trigger dom
 * - change the bg color
 */
onMounted(async () => {
  window.addEventListener('keydown', onKeyDown)
  const imageBuffer = await useWorkspaceStore().workbook?.stage?.take(props.imageUrl as XFilePath)
  objectImageUrl.value = URL.createObjectURL(new Blob([imageBuffer], { type: getMIMETypeByFileName(props.imageUrl) }))
  await new Promise(resolve => setTimeout(resolve, 10))
  const image = new Image()
  image.src = objectImageUrl.value
  image.onload = async () => {
    /**
     * The default behavior is:
     * - image size > window size, the image will be scaled to fit the window.
     * - image size < window size, the image will be shown in its original size.
     */
    heightRef.value = image.height
    widthRef.value = image.width

    await nextTick()

    photoSwipe = new PhotoSwipeLightbox({
      gallery: containerRef.value,
      // Could use dynamic import if size matters.
      pswpModule: PhotoSwipe,
      bgOpacity: 1,

      /**
       * small image -> 1.5
       * big image -> fill
       * @see photoswipe:src/js/slide/zoom-level.js
       */
      secondaryZoomLevel(zoomLevelObject) {
        const { panAreaSize, elementSize } = zoomLevelObject
        const hRatio = panAreaSize.x / elementSize.x
        const vRatio = panAreaSize.y / elementSize.y
        const ratio = Math.min(1, hRatio, vRatio)
        const isSmallImage = ratio === 1
        return isSmallImage ? 1.5 : zoomLevelObject.fill
      },
    })

    photoSwipe.init()

    photoSwipe.on('destroy', () => {
      exitImageViewer()
    })

    photoSwipe.on('afterInit', () => {
      unwatchBgColor = watchEffect(() => {
        const bgElement: HTMLElement = document.querySelector('.pswp__bg')

        if (!bgElement) {
          return
        }

        if (isFullscreen.value) {
          bgElement.style.backgroundColor = 'rgba(0, 0, 0)'
          return
        }

        if (useAppStore().appearance === 'dark') {
          bgElement.style.backgroundColor = 'rgba(25, 28, 31, 1)'
          return
        }

        bgElement.style.backgroundColor = 'rgba(237, 240, 242, 1)'
      })
    })

    photoSwipe.on('openingAnimationEnd', () => {
      showToolbar.value = true
    })

    photoSwipe.on('closingAnimationStart', () => {
      showToolbar.value = false
    })

    containerRef.value.click()
  }
})

onUnmounted(() => {
  unwatchBgColor?.()
})

async function download() {
  const ext = props.imageUrl.split('.').pop() || 'png'
  const res = await fetch(objectImageUrl.value, { method: 'GET' })
  const blob = await res.blob()
  return downloadByBlob(blob, `image.${ext}`)
}
</script>

<template>
  <div>
    <a
      v-if="objectImageUrl"
      ref="containerRef"
      :href="objectImageUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="pointer-events-none invisible absolute"
      :data-pswp-width="widthRef"
      :data-pswp-height="heightRef"
      :style="{
        top: props.imageRect.y + 'px',
        left: props.imageRect.x + 'px',
        height: props.imageRect.height + 'px',
        width: props.imageRect.width + 'px',
      }"
    >
      <img :src="objectImageUrl" />
    </a>

    <div
      v-show="showToolbar"
      class="fixed right-6 top-6 z-[100001] flex items-center overflow-hidden rounded-lg bg-light-grey-1 shadow-popover-light dark:bg-grey-700 dark:shadow-popover-grey sm:rounded lg:right-8"
    >
      <div class="item relative flex items-center justify-center active:bg-transparent-dark-2 dark:active:bg-transparent-white-2">
        <fw-tile-button
          icon-name="download"
          :size="'small'"
          :custom-class="'sm:m-1 m-[6px] sm:h-4 h-6 sm:w-4 w-6'"
          class="rounded-none px-2 py-0"
          @click="download"
        />
      </div>
      <div
        v-if="isSupportFullScreen"
        class="item relative flex items-center justify-center active:bg-transparent-dark-2 dark:active:bg-transparent-white-2"
      >
        <fw-tile-button
          :icon-name="isFullscreen ? 'exit-full-screen' : 'full-screen'"
          :size="'small'"
          :custom-class="'sm:m-1 m-[6px] sm:h-4 h-6 sm:w-4 w-6'"
          class="rounded-none px-2 py-0"
          @click="toggle"
        />
      </div>
      <div class="item relative flex items-center justify-center active:bg-transparent-dark-2 dark:active:bg-transparent-white-2">
        <fw-tile-button
          icon-name="signout"
          :size="'small'"
          :custom-class="'sm:m-1 m-[6px] sm:h-4 h-6 sm:w-4 w-6'"
          class="rounded-none px-2 py-0"
          @click="close"
        />
      </div>
    </div>
  </div>
</template>

<style lang="css">
.pswp__hide-on-close {
  display: none;
}
</style>

<style lang="less" scoped>
@import '../../styles/new-ui/new-variables.less';

.item {
  &:not(:first-child)::before {
    position: absolute;
    left: 0;
    top: 6px;
    content: '';
    display: block;
    width: 1px;
    height: 12px;
    background-color: @transparent-dark-3;

    html[color-scheme='dark'] & {
      background-color: @transparent-white-3;
    }
  }

  &:hover::before,
  &:hover + &::before {
    visibility: hidden;
  }
}

@media (max-width: @breakpoint-small) {
  .item {
    &:not(:first-child)::before {
      top: 9px;
      height: 18px;
    }
  }
}
</style>
