<template>
  <div
    class="relative flex aspect-square items-center justify-center overflow-hidden rounded-[4px] border-[1px] border-solid border-border-translucent-light bg-mask-background-default-light dark:border-border-translucent-dark dark:bg-mask-background-default-dark"
    :style="{
      width: `${containerWidth}px`,
      height: `${containerWidth}px`,
    }"
  >
    <!-- touch-action set to `none` to prevent browser default touch action from cancel planned ele's touch event -->
    <img
      v-show="inited"
      ref="imageRef"
      :src="imageUrl"
      class="absolute !max-w-[unset] touch-none"
      alt="app.xmind.com"
      :style="{
        transform: `translate(${imageTranslate.x}px, ${imageTranslate.y}px) scale(${currentImageScale})`,
        width: `${imageSize.width}px`,
        height: `${imageSize.height}px`,
      }"
      @pointerdown.stop.prevent="onDragStart"
      @pointermove.stop.prevent="oneDragging"
      @pointerup.stop.prevent="onDragEnd"
      @pointercancel.stop.prevent="onDragEnd"
    />

    <span
      v-show="inited"
      ref="cropperRef"
      class="pointer-events-none absolute block touch-none border-[1px] border-solid border-border-quaternary-light dark:border-border-quaternary-dark"
      :style="{
        width: `${cropperWidth}px`,
        height: `${cropperWidth}px`,
        boxShadow: isDarkAppearance ? '0px 0px 0px 100px rgba(18, 20, 22, 0.60)' : '0px 0px 0px 100px rgba(18, 20, 22, 0.30)',
      }"
    ></span>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, watch, nextTick } from 'vue'
import { useElementBounding } from '@vueuse/core'
import { useAppStore } from 'client/store/app-store'
import { outDistance, Rect } from 'utils/metrics'
import { debounce } from 'utils/misc'
import { useAnimationFrameThrottle } from 'client/composables/animation-frame-throttle'

const props = defineProps<{
  imageUrl: string
  cropperPadding: number
  containerWidth: number
  imageScaleInPercentage: number
}>()

const emit = defineEmits<{
  (event: 'previewData', value: string): void
}>()

const imageSize = ref<{ width: number; height: number }>({ width: 0, height: 0 })
const inited = ref(false)
const imageRef = ref<HTMLImageElement | null>(null)
const cropperRef = ref<HTMLSpanElement | null>(null)
const imageTranslate = ref({ x: 0, y: 0 })

const isDarkAppearance = computed(() => useAppStore().appearance === 'dark')
const cropperWidth = computed(() => props.containerWidth - props.cropperPadding * 2)

const { x: cropperX, y: cropperY, width: cropperW, height: cropperH } = useElementBounding(cropperRef)
const cropperRealRect = computed(() => {
  if (!cropperRef.value) return { x: 0, y: 0, width: 0, height: 0 }
  return {
    x: cropperX.value,
    y: cropperY.value,
    width: cropperW.value,
    height: cropperH.value,
  }
})

const { x: imageX, y: imageY, width: imageWidth, height: imageHeight } = useElementBounding(imageRef)
const imageRealRect = computed(() => {
  if (!imageRef.value) return { x: 0, y: 0, width: 0, height: 0 }
  return {
    x: imageX.value,
    y: imageY.value,
    width: imageWidth.value,
    height: imageHeight.value,
  }
})

const cropperCenter = computed(() => {
  return {
    x: cropperRealRect.value.x + cropperRealRect.value.width / 2,
    y: cropperRealRect.value.y + cropperRealRect.value.height / 2,
  }
})

const minImageScale = computed(() => {
  return Math.max(cropperWidth.value / imageSize.value.width, cropperWidth.value / imageSize.value.height)
})
const maxImageScale = computed(() => {
  return minImageScale.value * 2
})

// compute the current image scale based on the input percentage and the min/max image scale
const currentImageScale = computed(() => {
  const scale = (props.imageScaleInPercentage / 100) * (maxImageScale.value - minImageScale.value) + minImageScale.value
  return Math.max(minImageScale.value, Math.min(maxImageScale.value, scale))
})

const relocateImage = (imageRealRect: Rect) => {
  const imageCenter = {
    x: imageRealRect.x + imageRealRect.width / 2,
    y: imageRealRect.y + imageRealRect.height / 2,
  }
  let offsetX = imageCenter.x - cropperCenter.value.x
  let offsetY = imageCenter.y - cropperCenter.value.y
  const outDistances = outDistance(cropperRealRect.value, imageRealRect)
  if (outDistances.left < 0) offsetX += outDistances.left
  if (outDistances.right < 0) offsetX -= outDistances.right
  if (outDistances.top < 0) offsetY += outDistances.top
  if (outDistances.bottom < 0) offsetY -= outDistances.bottom
  imageTranslate.value.x = offsetX
  imageTranslate.value.y = offsetY
}

let initMousePoint: { x: number; y: number } | null = null
let imageRectOnStart: { x: number; y: number; width: number; height: number } | null = null
let moveStarted = false
const onDragStart = (e: PointerEvent) => {
  if (!inited.value) return
  initMousePoint = { x: e.clientX, y: e.clientY }
  imageRectOnStart = { ...imageRealRect.value }
  moveStarted = true
}

const { throttle: animationFrameThrottle } = useAnimationFrameThrottle()

const _oneDragging = (position: { x: number; y: number }) => {
  if (!inited.value) return
  animationFrameThrottle(() => {
    if (!position || !initMousePoint) return
    const deltaX = position.x - initMousePoint.x
    const deltaY = position.y - initMousePoint.y

    const targetImageRect = {
      x: imageRectOnStart.x + deltaX,
      y: imageRectOnStart.y + deltaY,
      width: imageRectOnStart?.width ?? 0,
      height: imageRectOnStart?.height ?? 0,
    }
    relocateImage(targetImageRect)
  })
}

const oneDragging = (e: PointerEvent) => {
  if (!inited.value || !moveStarted) return
  _oneDragging({ x: e.clientX, y: e.clientY })
}

const onDragEnd = () => {
  if (!inited.value) return
  moveStarted = false
  initMousePoint = null
  imageRectOnStart = null
}

const getImageRealSize = () => {
  const img = new Image()
  img.src = props.imageUrl
  return new Promise<{ width: number; height: number }>(resolve => {
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }
  })
}

const calculateRealImageCropperRect = (): Rect => {
  // Calculate the position relative to the original image
  const x = (cropperRealRect.value.x - imageRealRect.value.x) / currentImageScale.value
  const y = (cropperRealRect.value.y - imageRealRect.value.y) / currentImageScale.value
  const width = cropperRealRect.value.width / currentImageScale.value
  const height = cropperRealRect.value.height / currentImageScale.value
  return { x, y, width, height }
}

const img = new Image()
img.crossOrigin = 'anonymous'
img.src = props.imageUrl

const renderCroppedImageWithBorderRadius = async (options: {
  imageRect: Rect
  outputWidth: number
  outputHeight: number
  radius: number
  borderWidth?: number
  borderColor?: string
  backgroundColor?: string
}): Promise<string> => {
  const { imageRect, outputWidth, outputHeight, radius, borderWidth = 0, borderColor = 'transparent', backgroundColor = 'transparent' } = options
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  canvas.width = outputWidth
  canvas.height = outputHeight

  // First create the rounded rectangle path
  const createRoundedRectPath = () => {
    ctx.beginPath()
    ctx.moveTo(radius, 0)
    ctx.lineTo(outputWidth - radius, 0)
    ctx.quadraticCurveTo(outputWidth, 0, outputWidth, radius)
    ctx.lineTo(outputWidth, outputHeight - radius)
    ctx.quadraticCurveTo(outputWidth, outputHeight, outputWidth - radius, outputHeight)
    ctx.lineTo(radius, outputHeight)
    ctx.quadraticCurveTo(0, outputHeight, 0, outputHeight - radius)
    ctx.lineTo(0, radius)
    ctx.quadraticCurveTo(0, 0, radius, 0)
    ctx.closePath()
  }

  // Create the path and clip for image drawing
  createRoundedRectPath()
  ctx.save() // Save the current state before clipping
  ctx.clip()

  // Fill with background color if specified
  if (backgroundColor !== 'transparent') {
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, outputWidth, outputHeight)
  }

  await new Promise<void>(resolve => {
    if (img.complete) resolve()
    img.onload = () => {
      // Ensure the image is loaded before drawing
      resolve()
    }
  })

  ctx.drawImage(img, imageRect.x, imageRect.y, imageRect.width, imageRect.height, 0, 0, outputWidth, outputHeight)

  ctx.restore() // Restore state to remove clip

  // Draw border if borderWidth > 0
  if (borderWidth > 0) {
    ctx.lineWidth = borderWidth
    ctx.strokeStyle = borderColor
    createRoundedRectPath() // Create the rounded rectangle path again
    ctx.stroke() // Draw the border
  }

  return canvas.toDataURL('image/png', 1)
}

watch(currentImageScale, async () => {
  if (!inited.value) return
  await nextTick()
  animationFrameThrottle(() => {
    const imageRealRectValue = { ...imageRealRect.value }
    relocateImage(imageRealRectValue)
  })
})

watch(
  [imageRealRect, cropperRealRect, currentImageScale],
  debounce(async () => {
    if (!inited.value) return
    const previewImage = await renderCroppedImageWithBorderRadius({
      imageRect: calculateRealImageCropperRect(),
      outputWidth: 160,
      outputHeight: 160,
      radius: 32,
      borderWidth: 4, // Default to no border
      borderColor: 'rgba(116, 122, 128,0.2)', // Default transparent border color
      backgroundColor: ' #EDF0F2',
    })
    emit('previewData', previewImage)
  }, 150),
  { immediate: true },
)

onMounted(async () => {
  const size = await getImageRealSize()
  imageSize.value = size
  setTimeout(() => {
    inited.value = true
  }, 150)
})
</script>
