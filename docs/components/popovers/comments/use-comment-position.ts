import { useWindowSize } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { MaybeRef, MaybeRefOrGetter, computed, toValue } from 'vue'

import { viewerKit } from '@xmindltd/snowmonster'

import { commentThreadPopoverAnchorOffset, commentViewSize } from 'app/services/collaborative/shared/comments-style'
import { useFrameStore } from 'app/services/pinia'
import { useEditorPanelManage } from 'app/composables/use-editor-panel-manage'

interface UseCommentPositionOptions {
  width: MaybeRefOrGetter<number>
  threadViewBound: MaybeRefOrGetter<viewerKit.Point>
  commentThreadDiv: MaybeRef<HTMLElement>
}

const viewportPadding = 8

/**
 * 12 is the margin between comment and float bar
 */
const commentPadding = 12

/**
 * 40 is the height of top bar
 */
const topBarHeight = 0

const topPadding = viewportPadding + topBarHeight + commentPadding

/**
 * 264 is the width of right panel
 * NOTE: right panel has .uk-visible@m
 */
const rightPanelWidth = 264

/**
 * 44 is the height of bottom bar
 */
const bottomBarHeight = 44

const bottomPadding = viewportPadding + bottomBarHeight + commentPadding

export function useCommentPosition({ width, threadViewBound, commentThreadDiv }: UseCommentPositionOptions) {
  const { width: windowWidth, height: windowHeight } = useWindowSize()

  const { isRightBarVisible } = storeToRefs(useFrameStore())

  const rightPadding = computed(() => {
    const isRightPanelOpened = useEditorPanelManage().currentRightPanelTab.value !== null
    if ((isRightBarVisible.value || isRightPanelOpened) && windowWidth.value > 767.5) {
      return viewportPadding + rightPanelWidth + commentPadding
    }

    return viewportPadding
  })

  const popupPosition = computed<viewerKit.Point>(() => {
    const commentThreadDivRect = toValue(commentThreadDiv)?.getBoundingClientRect()
    const threadViewBoundValue = toValue(threadViewBound)

    /**
     * First, we try to put it on the right.
     * If it exceeds the right boundary, we put it on the left.
     */
    const calcX = () => {
      const commentThreadDivWidth = commentThreadDivRect?.width ?? toValue(width)
      const maxX = windowWidth.value - commentThreadDivWidth - rightPadding.value
      const bestX = threadViewBoundValue.x + commentViewSize.width / 2 + commentThreadPopoverAnchorOffset.x

      if (bestX >= maxX) {
        const secondaryX = threadViewBoundValue.x - commentViewSize.width / 2 - commentThreadPopoverAnchorOffset.x - commentThreadDivWidth
        return Math.max(Math.min(secondaryX, maxX), viewportPadding)
      }

      return Math.max(Math.min(bestX, maxX), viewportPadding)
    }

    const calcY = () => {
      const y = threadViewBoundValue.y - commentViewSize.height / 2 - commentThreadPopoverAnchorOffset.y
      const commentThreadDivHeight = commentThreadDivRect?.height ?? 0
      const maxY = windowHeight.value - commentThreadDivHeight - bottomPadding
      return Math.max(Math.min(y, maxY), topPadding)
    }

    return {
      x: calcX(),
      y: calcY(),
    }
  })

  return popupPosition
}
