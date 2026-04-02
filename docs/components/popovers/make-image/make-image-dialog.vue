<template>
  <app-base-topic-locator-popover
    :workbook-id="workbookId"
    :value="isOpened"
    :show-arrow="false"
    :width="isPhoneSizeViewportWidth ? 343 : 380"
    :height="isPhoneSizeViewportWidth ? 320 : 260"
    :popover-background-class="'!rounded-3xl !shadow-elevation-l3-light dark:!shadow-elevation-l3-dark !bg-fill-surfaceBright-light dark:!bg-fill-surfaceBright-dark'"
    @input="handleVisibilityChange"
  >
    <div class="box-border flex w-full flex-col gap-3 p-3">
      <div
        class="bg-ai-input-bg-default-light has-[textarea:focus]:!border-ai-purple-400 has-[textarea:hover]:border-ai-purple-300 dark:bg-ai-input-bg-default-dark flex flex-col gap-2 rounded-xl border border-transparent p-3 pt-2 transition-colors"
      >
        <div class="relative h-[140px] sm:h-[84px]">
          <div v-if="!isPromptStarted" class="flex h-full flex-col gap-2">
            <span class="inspiring-text text-mobile-body-medium text-text-ai-light dark:text-text-ai-dark sm:text-desktop-body-medium mb-1">
              {{ $T('Inspiring prompt…') }}
            </span>
            <div class="flex flex-col gap-2">
              <skeleton-animation :height="8" class="skeleton-purple w-full rounded-full" />
              <skeleton-animation :height="8" class="skeleton-purple w-full rounded-full" />
              <skeleton-animation :height="8" class="skeleton-purple !w-[110px] rounded-full" />
            </div>
          </div>

          <div v-else class="relative h-full">
            <fw-textarea
              ref="promptTextarea"
              v-model="generatedPrompt"
              :theme="'dim'"
              class="prompt-textarea-wrapper block h-full w-full resize-none overflow-y-auto border-0 !bg-transparent !p-0"
              :placeholder="$T('Describe what image you want to make. Choose a style below — or select Custom to define your own.')"
            >
            </fw-textarea>
            <div v-if="!isAtTop" class="fade-overlay fade-overlay-top">
              <div class="bg-fill-surfaceBright-light dark:bg-fill-surfaceBright-dark absolute inset-0"></div>
              <div class="bg-ai-input-bg-default-light dark:bg-ai-input-bg-default-dark absolute inset-0"></div>
            </div>
            <div v-if="!isAtBottom" class="fade-overlay fade-overlay-bottom">
              <div class="bg-fill-surfaceBright-light dark:bg-fill-surfaceBright-dark absolute inset-0"></div>
              <div class="bg-ai-input-bg-default-light dark:bg-ai-input-bg-default-dark absolute inset-0"></div>
            </div>
          </div>
        </div>

        <div class="flex gap-2">
          <fw-ai-select-model
            :selected-key="selectedModel"
            :options="modelOptions"
            :size="isPhoneSizeViewportWidth ? 'default' : 'small'"
            @select="handleModelSelect"
          />
          <fw-tooltip align="top" :disabled="isPromptGenerating">
            <template #trigger>
              <button
                class="hover:enabled:bg-mask-overlay-s-light disabled:text-button-content-default-disable-light hover:enabled:dark:bg-mask-overlay-s-dark dark:disabled:text-button-content-default-disable-dark flex h-8 w-8 items-center justify-center rounded-lg sm:h-7 sm:w-7"
                :disabled="isPromptGenerating"
                @click="startInspirePrompt"
              >
                <fw-icon name="magic-wand" :width="16" :height="16" />
              </button>
            </template>
            <template #tooltip>
              {{ $T('Inspire prompt') }}
            </template>
          </fw-tooltip>
          <fw-ai-button
            :disabled="!generatedPrompt"
            @click="generateAndApplyImage"
            :size="isPhoneSizeViewportWidth ? 'medium' : 'small'"
            class="ml-auto flex w-8 items-center justify-center !p-0 sm:w-7"
          >
            <fw-icon
              name="arrow-upward"
              :width="16"
              :height="16"
              class="text-button-content-onColor-default-light dark:text-button-content-onColor-default-dark"
            />
          </fw-ai-button>
        </div>
      </div>
      <fw-carousel controls-visibility="hover">
        <div
          v-for="(style, index) in styles"
          :key="style.key || index"
          class="group/item flex flex-shrink-0 cursor-pointer flex-col items-center gap-1 [&:not(:last-of-type)]:mr-2"
          @click="selectedStyleIndex = index"
        >
          <div
            :class="[
              'relative h-16 w-16 overflow-hidden rounded-xl',
              index === selectedStyleIndex
                ? 'border-ai-style-picker-border-pressed bg-ai-style-picker-bg-pressed text-ai-style-picker-border-pressed border-2'
                : style.image
                  ? 'border-ai-style-picker-border-normal group-hover/item:border-ai-style-picker-border-hover border'
                  : 'border-border-translucent group-hover/item:bg-ai-style-picker-bg-hover-light group-hover/item:dark:bg-ai-style-picker-bg-hover-dark border',
              !style.image ? 'flex items-center justify-center' : '',
            ]"
          >
            <img v-if="style.image" :src="style.image" :alt="style.name" class="h-full w-full object-cover" />
            <fw-icon v-else name="union" :width="20" :height="20" />
          </div>
          <div
            :class="[
              'text-desktop-caption h-4',
              index === selectedStyleIndex
                ? 'bg-ai-style-picker-bg-pressed text-ai-style-picker-text-pressed rounded-[4px] px-2'
                : 'group-hover/item:bg-ai-style-picker-bg-hover-light group-hover/item:dark:bg-ai-style-picker-bg-hover-dark rounded-[4px] px-2',
            ]"
          >
            {{ style.name }}
          </div>
        </div>
      </fw-carousel>
    </div>
  </app-base-topic-locator-popover>
</template>

<script setup lang="ts">
import { onBeforeUnmount, watch, ref, computed } from 'vue'
import AppBaseTopicLocatorPopover from '../base-topic-locator.vue'
import { useCollaborativeStore, useWorkspaceStore, useFrameStore, useAigcStore } from 'app/services/pinia'
import { useAiBarResult } from 'app/composables/ai-features/use-ai-bar-result'
import { createXaiFeedbackHandler } from 'app/composables/ai-features/create-feedback-fn'
import type { XaiFeedbackSnapshot } from 'app/services/pinia'
import { dataKit, useMindMap } from 'compositions/mindmap/index'
import { useFetch } from 'client/composables/request'
import { useAccountStore } from 'client/store'
import { base64ToArrayBuffer } from 'client/utils/base64'
import * as ArrayBufferConverter from 'base64-arraybuffer'
import { convertJpegArrayBufferToPng } from 'client/utils/image'
import { useWindowResize } from 'client/composables/window-resize'
import { toastActions } from 'client/library/new-notifications'
import { useActionCompose } from 'app/composables/action-composes'
import SkeletonAnimation from 'client/components/base/skeleton-animation.vue'
import makeImageIcon from 'client/assets/import-files/images/make-image/icon.svg?url'
import makeImageManga from 'client/assets/import-files/images/make-image/manga.svg?url'
import makeImageSketch from 'client/assets/import-files/images/make-image/sketch.svg?url'
import makeImageWash from 'client/assets/import-files/images/make-image/wash.svg?url'
import makeImage3dBlob from 'client/assets/import-files/images/make-image/3d-blob.svg?url'
import makeImagePixel from 'client/assets/import-files/images/make-image/pixel.svg?url'
import seedreamIcon from 'client/assets/import-files/illustrations/ai-models/seedream.svg?url'
import nanoBananaIcon from 'client/assets/import-files/illustrations/ai-models/nano-banana.svg?url'
import wanIcon from 'client/assets/import-files/illustrations/ai-models/wan.svg?url'
import { useXAPResourcesManager } from 'app/services/collaborative/doc/xap-resource-manager'
import { generateXapResourceURL } from 'utils/xap-resource'
import { useCloudKitClient } from 'app/composables/cloud-kit-client'
import { blobToArrayBuffer } from 'client/utils/misc'
import { $T } from 'client/library/translation'
import { REGION } from 'client/constants'
import { useServiceStore } from 'client/store'
import { useTeamSpaceData } from 'app/composables/team-space-data'
import { handleGetAddonCn, handleGetExtraCreditsOverseas } from 'client/components/dialogs/copilot/team-credits-check'
// import gptIcon from 'client/assets/import-files/illustrations/ai-models/gpt.svg?url'

const props = defineProps<{
  isOpened: boolean
  workbookId: string
}>()

const emits = defineEmits<{
  (e: 'visibility-change', value: boolean): void
}>()

const styles = [
  { key: 'Icon', name: $T('Icon'), image: makeImageIcon },
  { key: 'Manga', name: $T('Manga'), image: makeImageManga },
  { key: 'Sketch', name: $T('Sketch'), image: makeImageSketch },
  { key: 'Wash', name: $T('Wash'), image: makeImageWash },
  { key: '3D Blob', name: $T('3D Blob'), image: makeImage3dBlob },
  { key: 'Pixel', name: $T('Pixel'), image: makeImagePixel },
  { key: '', name: $T('Custom'), image: null },
]

const selectedModel = ref('seedream')
const modelOptions = computed(() => {
  if (REGION === 'cn') {
    return [
      { key: 'seedream', label: '即梦 4.0', iconUrl: seedreamIcon },
      { key: 'wan', label: '万相 2.6', iconUrl: wanIcon },
    ]
  }
  return [
    { key: 'seedream', label: 'Seedream 4.0', iconUrl: seedreamIcon },
    { key: 'nano-banana', label: 'Nano Banana', iconUrl: nanoBananaIcon },
    // { key: 'gpt-image', label: 'GPT Image 1', iconUrl: gptIcon },   暂时隐藏 GPT Image 1
  ]
})

const findStyleIndex = (styleKey: string): number => {
  return styles.findIndex(s => s.key === styleKey)
}

const handleModelSelect = (key: string) => {
  selectedModel.value = key
}
const { isPhoneSizeViewportWidth } = useWindowResize()
const isPromptGenerating = ref(false)
const generatedPrompt = ref('')
const selectedStyleIndex = ref(0)
const isPromptStarted = ref(false)
const retryTopicId = ref<string | null>(null)
const frameStore = useFrameStore()

const promptTextarea = ref<{
  inputElement: HTMLTextAreaElement
  focus: () => void
  selectInputText: () => void
} | null>(null)
const isAtTop = ref(false)
const isAtBottom = ref(false)

const handleVisibilityChange = (newValue: boolean) => {
  emits('visibility-change', newValue)
}

const buildInspirePayload = async () => {
  const { workbook } = useWorkspaceStore()
  const { selection } = useMindMap()
  const { sharingMetadata } = useCollaborativeStore()

  const activeSheet = workbook?.workbookEditor?.activeSheet?.value
  const serializedSheetJson = dataKit.serializeSheetToJSON(activeSheet)

  return {
    sheetContent: JSON.stringify([serializedSheetJson]),
    selectedTopicId: selection.value?.modelIds[0] ?? '',
    teamId: sharingMetadata?.teamId,
  }
}

const startInspirePrompt = async () => {
  isPromptGenerating.value = true
  isPromptStarted.value = false
  generatedPrompt.value = ''
  selectedStyleIndex.value = 0

  const payload = await buildInspirePayload()
  const { sharingMetadata } = useCollaborativeStore()

  let matchedStyleKey: string | null = null
  let isTimedOut = false
  let hasCreditsError = false

  const timeoutPromise = new Promise<void>(resolve => {
    setTimeout(() => {
      isTimedOut = true
      resolve()
    }, 15000)
  })

  const stylePromise = useFetch(useAccountStore().authToken)
    .post('/api/xai/illustrate-topic/inspire-image-style', payload)
    .then(response => {
      if (response?.data?.code === 403 && response?.data?.message === 'no_credit_available') {
        hasCreditsError = true
        return
      }
      if (!isTimedOut && response?.data?.data?.style) {
        matchedStyleKey = response.data.data.style
      }
    })
    .catch(error => {
      logger.error('Style matching error:', error)
    })

  const promptPromise = useFetch(useAccountStore().authToken)
    .post('/api/xai/illustrate-topic/inspire-image-prompt', payload)
    .then(response => {
      if (response?.data?.code === 403 && response?.data?.message === 'no_credit_available') {
        hasCreditsError = true
        return
      }
      if (!isTimedOut && response?.data?.data?.composition) {
        isPromptStarted.value = true
        generatedPrompt.value = response.data.data.composition

        if (matchedStyleKey) {
          const matchedIndex = findStyleIndex(matchedStyleKey)
          if (matchedIndex !== -1) {
            selectedStyleIndex.value = matchedIndex
          }
        }
      }
    })
    .catch(error => {
      logger.error('Prompt generation error:', error)
    })

  await Promise.race([Promise.allSettled([promptPromise, stylePromise]), timeoutPromise])

  if (hasCreditsError) {
    handleVisibilityChange(false)
    isPromptGenerating.value = false
    await useActionCompose().handleShowAIfeatureOutOfCreditsConfirm({
      teamId: sharingMetadata?.teamId || '',
    })
    return
  }

  if (isTimedOut && !isPromptStarted.value) {
    toastActions.show({ message: $T('Inspiring prompt failed'), topic: 'failed' })
    isPromptStarted.value = true
  }

  isPromptGenerating.value = false
}

const checkMakeImageCredits = async (): Promise<boolean> => {
  const teamSpaceData = useTeamSpaceData()
  const targetTeamId = useCollaborativeStore().currentSharingFileTeamId
  if (!targetTeamId) {
    return true
  }

  if (REGION === 'cn') {
    const remainingCredits = teamSpaceData.getTeamRemainingCreditsSync(targetTeamId)
    if (Math.floor(remainingCredits) < 15) {
      const shouldGetCredits = await useServiceStore().services.action.dialog.confirm({
        title: '点数不足',
        description: '生成图像大约需要 15 点数。您当前余额不足，请购买 AI 加量包并重试。',
        confirmButtonText: '获取点数',
        cancelButtonText: '取消',
        confirmButtonType: 'secondary',
        disableExchangeConfirmButton: true,
      })

      if (shouldGetCredits) {
        await handleGetAddonCn(targetTeamId)
      }
      return false
    }
  } else {
    const remainingCredits = teamSpaceData.getTeamRemainingCreditsSync(targetTeamId)
    if (Math.floor(remainingCredits) < 15) {
      const shouldGetCredits = await useServiceStore().services.action.dialog.confirm({
        title: $T('Insufficient Credits'),
        description: $T(
          'Making an image requires approximately 15 credits. Your current credit balance is insufficient. Please purchase Add-on credits and try again.',
        ),
        confirmButtonText: $T('Get Credits'),
        cancelButtonText: $T('Cancel'),
        confirmButtonType: 'secondary',
        disableExchangeConfirmButton: true,
      })

      if (shouldGetCredits) {
        await handleGetExtraCreditsOverseas(targetTeamId)
      }
      return false
    }
  }

  return true
}

const generateAndApplyImage = async () => {
  if (!generatedPrompt.value.trim()) {
    logger.warn('No prompt available for image generation')
    return
  }

  const hasEnoughCredits = await checkMakeImageCredits()
  if (!hasEnoughCredits) {
    return
  }

  const { workbook } = useWorkspaceStore()
  const { selection, createXapUrlByArrayBuffer, document, changeDoc } = useMindMap()
  const { sharingMetadata } = useCollaborativeStore()

  const topicId = retryTopicId.value || selection.value?.modelIds[0]
  if (!topicId) {
    logger.warn('No topic selected')
    return
  }

  if (!workbook) {
    logger.warn('No workbook available')
    return
  }

  handleVisibilityChange(false)

  const payload = {
    composition: generatedPrompt.value,
    provider: selectedModel.value,
    style: styles[selectedStyleIndex.value]?.key,
    teamId: sharingMetadata?.teamId,
  }

  const feedbackPayload: XaiFeedbackSnapshot = {
    apiPath: '/api/xai/illustrate-topic/compose',
    requestBody: JSON.stringify(payload),
    responseBody: '',
  }

  try {
    useAigcStore().addAiImageGeneratingTopicId(topicId)
    workbook?.workbookEditor?.activeSheetViewer.value.changeViewerState({ selection: null })
    const response = await useFetch(useAccountStore().authToken).post('/api/xai/illustrate-topic/compose', payload)
    if (response?.data?.code === 403 && response?.data?.message === 'no_credit_available') {
      await useActionCompose().handleShowAIfeatureOutOfCreditsConfirm({
        teamId: sharingMetadata?.teamId || '',
      })

      return
    }

    if (response?.data?.data?.imageBase64) {
      const base64Data = response.data.data.imageBase64
      let outputFormat = (response.data.data.outputFormat || 'jpeg').toLowerCase()
      let imageArrayBuffer = base64ToArrayBuffer(base64Data)
      if (outputFormat === 'jpeg' || outputFormat === 'jpg') {
        imageArrayBuffer = await convertJpegArrayBufferToPng(imageArrayBuffer)
        const pngBase64 = ArrayBufferConverter.encode(imageArrayBuffer)
        logger.log('make-image debug base64 (png):', pngBase64)
        outputFormat = 'png'
      }

      const extName = '.png'
      if (sharingMetadata?.teamId) {
        try {
          const fileBlob = new Blob([imageArrayBuffer], { type: 'image/png' })
          const cutoutBlob = await useCloudKitClient().imageCutoutAsync({
            teamId: sharingMetadata.teamId,
            filename: `make-image-${topicId}${extName}`,
            file: fileBlob,
          })
          if (cutoutBlob) {
            imageArrayBuffer = await blobToArrayBuffer(cutoutBlob)
          }
        } catch (error) {
          logger.error('Image cutout error:', error)
        }
      }
      // predict xap url and upload prior to applying
      const xapUrlPredict = await generateXapResourceURL(imageArrayBuffer, extName)
      await useXAPResourcesManager(workbook.cacheId).setter(xapUrlPredict, imageArrayBuffer, true)
      // so now the real xap url can be created without duplicate upload
      const xapURL = await createXapUrlByArrayBuffer(imageArrayBuffer, extName)

      // Directly update the topic image without changing selection
      const mutableTopic = document.value.query({ id: topicId })?.asTopic()?.asMutable()
      if (mutableTopic) {
        const newDocument = mutableTopic.attrs({ imageSource: xapURL }).commit().ownerDocument
        changeDoc(newDocument)
      }
      useAigcStore().removeAiImageGeneratingTopicId(topicId)

      // Update feedback payload with response
      feedbackPayload.responseBody = base64Data

      // Show ai-bar result with feedback handler
      const { openAiBarResult } = useAiBarResult()
      const action = await openAiBarResult({
        mode: 'make-image',
        status: 'completed',
        sendXaiFeedback: createXaiFeedbackHandler('make-image', feedbackPayload),
      })
      if (action === 'retry') {
        frameStore.setMakeImageRetryData({
          prompt: generatedPrompt.value,
          styleIndex: selectedStyleIndex.value,
          topicId,
        })
        useMindMap().executeMutationAction({
          name: 'mutate:selectTopics',
          payload: {
            topics: [topicId],
            centerOn: true,
          },
        })
        workbook?.getAction('editor.aiImage').execute()
      }
    }
  } catch (error) {
    logger.error('Image generation error:', error)
  } finally {
    useAigcStore().removeAiImageGeneratingTopicId(topicId)
  }
}

let cleanupScrollListener: (() => void) | null = null

const setupScrollObserver = () => {
  if (!promptTextarea.value?.inputElement) return

  const textarea = promptTextarea.value.inputElement

  if (cleanupScrollListener) {
    cleanupScrollListener()
    cleanupScrollListener = null
  }

  const checkScrollPosition = () => {
    const { scrollTop, scrollHeight, clientHeight } = textarea
    const isScrollable = scrollHeight > clientHeight

    if (!isScrollable) {
      isAtTop.value = true
      isAtBottom.value = true
      return
    }

    isAtTop.value = scrollTop <= 1
    isAtBottom.value = scrollTop + clientHeight >= scrollHeight - 1
  }

  textarea.addEventListener('scroll', checkScrollPosition)
  checkScrollPosition()

  const resizeObserver = new ResizeObserver(checkScrollPosition)
  resizeObserver.observe(textarea)

  cleanupScrollListener = () => {
    textarea.removeEventListener('scroll', checkScrollPosition)
    resizeObserver.disconnect()
  }
}

watch(
  () => props.isOpened,
  value => {
    if (value) {
      const retryData = frameStore.makeImageRetryData
      if (retryData) {
        generatedPrompt.value = retryData.prompt
        selectedStyleIndex.value = retryData.styleIndex
        retryTopicId.value = retryData.topicId
        isPromptStarted.value = true
        frameStore.setMakeImageRetryData(null)
        setTimeout(() => {
          promptTextarea.value?.selectInputText()
        }, 100)
      } else {
        retryTopicId.value = null
        startInspirePrompt()
      }
    }
  },
  { immediate: true },
)

watch(isPromptStarted, value => {
  if (value) {
    setTimeout(setupScrollObserver, 100)
  }
})

onBeforeUnmount(() => {
  if (cleanupScrollListener) {
    cleanupScrollListener()
  }
  handleVisibilityChange(false)
})
</script>

<style scoped>
.fade-overlay {
  pointer-events: none;
  position: absolute;
  left: 0;
  right: 0;
}

.fade-overlay > div {
  mask-composite: exclude;
  -webkit-mask-composite: xor;
}

.fade-overlay-top {
  top: 0;
  height: 12px;
}

.fade-overlay-top > div {
  mask-image: linear-gradient(to bottom, black 0%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 0%, transparent 100%);
}

.fade-overlay-bottom {
  bottom: 0;
  height: 20px;
}

.fade-overlay-bottom > div {
  mask-image: linear-gradient(to top, black 0%, transparent 100%);
  -webkit-mask-image: linear-gradient(to top, black 0%, transparent 100%);
}

.skeleton-purple {
  background: linear-gradient(90deg, rgba(148, 83, 247, 0.3), rgba(197, 160, 255, 0.08)) !important;
}

.skeleton-purple::before {
  background: linear-gradient(to right, rgba(255, 255, 255, 0) 46%, rgba(197, 160, 255, 0.35) 50%, rgba(255, 255, 255, 0) 54%) 50% 50% !important;
  animation-duration: 1.25s !important;
}

.inspiring-text {
  animation: opacity-cycle 5s ease infinite;
}

.prompt-textarea-wrapper {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

.prompt-textarea-wrapper:hover {
  scrollbar-color: rgba(0, 0, 0, 0.3) transparent;
}

@keyframes opacity-cycle {
  0% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.3;
  }
}
</style>
