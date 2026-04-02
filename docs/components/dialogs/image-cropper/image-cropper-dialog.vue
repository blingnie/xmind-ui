<template>
  <modal-dialog
    ref="dialog"
    :title="$T('Upload')"
    :is-opened="true"
    :width="381"
    :close-button="isPhoneSizeViewportWidth ? true : false"
    :max-width="'90%'"
    :min-height="200"
    :buttons="buttons"
    @modal-dialog-close="handleClose"
  >
    <div class="flex flex-col gap-[20px] sm:flex-row">
      <image-cropper
        v-if="inited"
        :image-scale-in-percentage="slideInputValue"
        :image-url="imageUrl"
        :container-width="imageCropperContainerWidth"
        :cropper-padding="cropperPadding"
        class="shrink-0"
        @preview-data="value => (imagePreviewData = value)"
      />

      <div class="flex flex-1 flex-row gap-4 sm:flex-col">
        <div class="aspect-square h-[64px] w-auto overflow-hidden sm:h-auto sm:w-full">
          <img v-if="imagePreviewData" :src="imagePreviewData" alt="app.xmind.com" />
        </div>

        <!-- slider component -->
        <div class="relative flex-1 items-center justify-center">
          <fw-slider-input v-model="slideInputValue" :is-show-sign="true" :vertical="!isPhoneSizeViewportWidth" />
        </div>
      </div>
    </div>
    <template #between-body-footer>
      <fw-divider />
    </template>
  </modal-dialog>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue'
import ModalDialog from 'client/components/new-base-modal-dialog.vue'
import ImageCropper from 'client/components/dialogs/image-cropper/cropper.vue'
import { useWindowResize } from 'client/composables/window-resize'
import type { ModalDialogBottomButton } from 'components/new-base-modal-dialog.vue'
import { $T } from 'client/library/translation'
import { usePromiseHook } from 'utils/vue-utils'

const props = withDefaults(
  defineProps<{
    imageUrl: string
    confirmButtonText?: string
    handleUpload?: (data: ArrayBuffer) => Promise<boolean>
  }>(),
  {
    confirmButtonText: $T('Upload'),
    handleUpload: null,
  },
)

const dialog = ref<InstanceType<typeof ModalDialog>>()
const { isPhoneSizeViewportWidth, windowWidth } = useWindowResize()
const { resolve } = usePromiseHook()

const isUploading = ref(false) // Flag to indicate if the upload is in progress
const inited = ref(false) // Flag to indicate if the image cropper is initialized

const handleClose = async () => {
  await dialog.value?.closeDialogWithAnimation?.()
  resolve()
}

const slideInputValue = ref(0) // Default value for the slider input
const imagePreviewData = ref('') // This will hold the cropped image data

const imageCropperContainerWidth = computed(() => (isPhoneSizeViewportWidth.value ? windowWidth.value - 24 * 2 : 240))
const cropperPadding = computed(() => (isPhoneSizeViewportWidth.value ? 50 : 40))

const base64dataUrlToArrayBuffer = (dataUrl: string): Promise<ArrayBuffer> => {
  return new Promise(resolve => {
    const base64 = dataUrl.split(',')[1]
    const binaryString = window.atob(base64)
    const len = binaryString.length
    const bytes = new Uint8Array(len)

    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    resolve(bytes.buffer)
  })
}

const buttons = computed<ModalDialogBottomButton[]>(() => [
  {
    text: $T('Cancel'),
    isDisabled: false,
    onClick: () => {
      resolve(null)
    },
    type: 'default',
  },
  {
    text: $T('Upload'),
    isDisabled: isUploading.value || !imagePreviewData.value,
    onClick: async () => {
      if (!imagePreviewData.value) {
        return
      }
      isUploading.value = true
      try {
        const arrayBuffer = await base64dataUrlToArrayBuffer(imagePreviewData.value)
        const success = await props.handleUpload?.(arrayBuffer)
        success && resolve(success)
      } catch (err) {
        logger.warn('Image upload failed:', err)
      } finally {
        isUploading.value = false
      }
    },
    type: 'secondary',
  },
])

onMounted(() => {
  setTimeout(() => {
    inited.value = true
  }, 150) // Delay to ensure the component is fully rendered before initializing
})
</script>
