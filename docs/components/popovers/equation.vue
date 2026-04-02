<template>
  <div ref="container">
    <app-base-topic-locator-popover v-if="!isSmallMode" :workbook-id="workbookId" :value="isOpened" :height="280" :width="394" class="is-large-view">
      <div class="uk-padding uk-flex uk-flex-column uk-flex-middle uk-height-1-1">
        <div class="uk-width-1-1 uk-flex uk-flex-between">
          <h4 class="uk-margin-small-bottom uk-width-1-1 uk-text-disabled uk-text-bold" style="pointer-events: none">{{ $T('Equation') }}</h4>
          <span
            v-if="!isEmbed"
            id="equationHelp"
            tabindex="-1"
            class="equation-help uk-flex-no-shrink uk-flex-no-grow"
            uk-icon="icon: question; ratio: 1.1"
            @click="handleGoEquationHelp"
          />
        </div>

        <div class="uk-height-expand uk-width-1-1 uk-flex" style="flex-direction: column">
          <textarea
            ref="equationInputArea"
            v-model="equation"
            class="uk-textarea uk-width-1-1 uk-padding-remove uk-margin-remove"
            style="border: none; box-shadow: none; background-color: transparent; flex: 1 0 auto"
            :placeholder="$T('Type or paste LaTeX')"
            @blur="handleClose"
          ></textarea>
          <div
            ref="previewContainer"
            class="equation-preview-container uk-flex uk-flex-center uk-flex-middle bg-light-grey-3 dark:bg-dark-grey-6"
          ></div>
        </div>
      </div>
    </app-base-topic-locator-popover>
    <app-base-topic-locator-page
      v-if="isSmallMode"
      :value="isOpened"
      title="Equation"
      class="is-small-view"
      content-class="uk-flex uk-flex-column"
      @close="handleClosePage"
      @input="handleClose"
    >
      <textarea
        ref="equationInputArea"
        v-model="equation"
        class="uk-textarea uk-width-1-1 uk-padding-remove uk-margin-remove"
        style="border: none; box-shadow: none; background-color: transparent; flex: 1 0 auto"
        :placeholder="$T('Type or paste LaTeX')"
        @input.stop
        @keydown.enter.stop.prevent="handleClose($event)"
      ></textarea>
      <div
        ref="previewContainerForMobile"
        class="equation-preview-container uk-flex uk-flex-center uk-flex-middle bg-light-grey-3 dark:bg-dark-grey-6"
      ></div>
    </app-base-topic-locator-page>
  </div>
</template>

<script lang="ts">
import { $T } from 'client/library/translation'
import { defineComponent, ref, computed, watch, onMounted } from 'vue'
import AppBaseTopicLocatorPopover from './base-topic-locator.vue'
import AppBaseTopicLocatorPage from './base-topic-locator-page.vue'
import { debounce } from 'utils/misc'
import { useServices } from 'app/fragments/use-services'
import { snowdanceUtils, useMindMap } from 'compositions/mindmap'
import { useWorkspaceStore } from 'app/services/pinia'
import { SVGToOtherType } from 'client/library/workbook-next/libs/image'

export default defineComponent({
  name: 'AppEquationPopover',
  components: {
    AppBaseTopicLocatorPopover,
    AppBaseTopicLocatorPage,
  },
  props: {
    isOpened: {
      type: Boolean,
      required: true,
    },
    workbookId: {
      type: String,
      default: '',
    },
  },
  emits: ['visibility-change'],
  setup(props, ctx) {
    const { router } = useServices()

    const route = router.vueRouter.currentRoute.value
    const isEmbed = typeof route.name === 'string' && route.name.startsWith('embed-for')
    const workbook = useWorkspaceStore().workbook
    const { selection } = useMindMap()

    const container = ref<HTMLDivElement>()
    const previewContainer = ref<HTMLElement>()
    const equationInputArea = ref<HTMLElement>()
    const previewContainerForMobile = ref<HTMLElement>()

    const equation = ref('')

    const EQUATION_PREVIEW_PADDING = 6

    const selectionIds = computed(() => selection.value?.modelIds ?? [])

    const isSmallMode = computed(() => {
      return window.matchMedia('(max-width: 413.5px)').matches
    })

    const mathJaxExportSvg = async (equation: string) => {
      if (!equation) return
      const svgContent = await useMindMap().generateMathJaxSVG(equation)
      const parser = new DOMParser()
      const document = parser.parseFromString(svgContent, 'image/svg+xml')
      const SVGElement = document.firstChild as SVGElement
      return SVGElement
    }

    const handleUpdatePreview = debounce(async (newEquation: string) => {
      let currentPreviewContainer: HTMLElement
      if (previewContainer.value?.offsetParent) {
        currentPreviewContainer = previewContainer.value
      } else {
        currentPreviewContainer = previewContainerForMobile.value as HTMLElement
      }

      if (!currentPreviewContainer || typeof newEquation !== 'string') return

      // Remove all child elements
      if (currentPreviewContainer.lastChild) {
        currentPreviewContainer.innerHTML = ''
      }

      newEquation = newEquation.trim()

      if (newEquation) {
        const computedContainerStyles = window.getComputedStyle(currentPreviewContainer)
        const containerHeight = parseFloat(computedContainerStyles.height) - EQUATION_PREVIEW_PADDING * 2
        const containerWidth = parseFloat(computedContainerStyles.width) - EQUATION_PREVIEW_PADDING * 2

        const equationElement = await mathJaxExportSvg(newEquation)
        let equationHeight = 0
        let equationWidth = 0

        if (equationElement) {
          currentPreviewContainer.append(equationElement)
          const equationComputedStyles = window.getComputedStyle(equationElement)
          equationHeight = parseFloat(equationComputedStyles.height)
          equationWidth = parseFloat(equationComputedStyles.width)
          currentPreviewContainer.removeChild(equationElement)
        }
        const zoomScale = Math.min(containerHeight / equationHeight, containerWidth / equationWidth, 1)
        equationElement.style.height = equationHeight * zoomScale + 'px'
        equationElement.style.width = equationWidth * zoomScale + 'px'
        currentPreviewContainer.append(equationElement)
      } else {
        const previewText = document.createElement('span')
        previewText.classList.add('uk-text-bold')
        previewText.style.opacity = '0.3'
        previewText.style.fontSize = '13px'
        previewText.innerText = $T('Equation Preview')
        currentPreviewContainer.append(previewText)
      }
    })

    const handleGoEquationHelp = () => {
      window.open('https://www.xmind.net/faq/question/equation/')
    }

    const getMathJaxText = () => {
      return workbook.workbookEditor.properties.value?.equation.value?.text ?? ''
    }

    const updateMathJaxText = async (equation: string) => {
      const editor = workbook.workbookEditor
      if (!editor) return

      const oldValue = getMathJaxText()
      if (oldValue === equation) return

      const svgString = await useMindMap().generateMathJaxSVG(equation)
      const svgUrl = snowdanceUtils.getSVGUri(svgString)
      const imageBlob = await SVGToOtherType(svgUrl as `data:image/svg+xml,${string}`, 1, 'blob')
      const imageArraybuffer = await imageBlob.arrayBuffer()
      const xapUrl = await editor.createXapUrlByArrayBuffer(imageArraybuffer, '.png')
      const imageBlobUrl = URL.createObjectURL(imageBlob)
      const { width } = await readImageOriginalSize(imageBlobUrl)
      URL.revokeObjectURL(imageBlobUrl)

      const newEquation = {
        text: equation,
        fallbackImageResourcePath: xapUrl?.slice(4),
        width,
      }

      editor.executeAction({
        name: 'mutateTarget:equation',
        payload: {
          topicIds: selectionIds.value,
          equation: newEquation,
        },
      })
    }

    const handleClose = (event: FocusEvent | KeyboardEvent) => {
      //@ts-ignore
      if (event.relatedTarget?.id === 'equationHelp') return
      updateMathJaxText(equation.value)
      ctx.emit('visibility-change', false)
    }

    const handleClosePage = () => {
      ctx.emit('visibility-change', false)
    }

    watch(
      () => equation.value,
      () => {
        handleUpdatePreview(equation.value)
      },
    )

    onMounted(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      equation.value = getMathJaxText()
      handleUpdatePreview(equation.value)
      equationInputArea.value?.focus()
    })

    const readImageOriginalSize = (src: string) => {
      const newImg = new Image()
      return new Promise<{ height: number; width: number }>((resolve, reject) => {
        newImg.onload = function () {
          const { height, width } = newImg
          resolve({ height, width })
        }
        newImg.onerror = err => reject(err)
        newImg.src = src
      })
    }

    return {
      isEmbed,
      equation,
      workbook,

      container,
      previewContainer,
      previewContainerForMobile,
      equationInputArea,
      isSmallMode,

      selectionIds,

      handleClose,
      handleGoEquationHelp,
      handleClosePage,
    }
  },
})
</script>

<style lang="less">
.equation-preview-container {
  margin-top: 10px;
  height: 76px;
  padding: 6px;
  width: 100%;

  // fix the problem of filling svg color
  & > svg {
    fill: currentColor;
  }
}
.equation-help {
  opacity: 0.3;
  &:hover {
    opacity: 0.6;
  }
}

.is-small-view {
  display: none;
}
@media screen and (max-width: 413.5px) {
  .is-large-view {
    display: none;
  }
  .is-small-view {
    display: block;
  }
}
</style>
