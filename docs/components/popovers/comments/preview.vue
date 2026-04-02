<template>
  <comment-thread-locator-popover
    :workbook-id="workbookId"
    :value="isCommentPopoverOpened"
    :x="popupPosition.x"
    :y="popupPosition.y"
    :width="width"
    :is-activated="false"
    @input="handleVisibleChange"
    @click="handleClick()"
  >
    <div ref="commentThreadDiv" class="flex flex-col">
      <div v-if="!isEmptyThread">
        <comment-collapsed-list :comment-thread="commentThread" />
      </div>
      <comment-editor v-if="isCommentEditorVisible" :editor-mode="commentEditorMode" :style="commentEditorStyleObj" @send="handleSendComment" />
    </div>
  </comment-thread-locator-popover>
</template>

<script lang="ts" setup>
import CommentThreadLocatorPopover from './comment-thread-locator.vue'
import CommentCollapsedList from './comment-collapsed-list.vue'
import CommentEditor from './comment-editor.vue'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useMindMap, viewerKit } from '@xmindltd/snowmonster'
import { useSharedStore } from 'app/services/pinia/shared-store'
import { useServiceStore } from 'client/store'
import { useCollaborativeStore } from 'app/services/pinia/collaborative-store'
import { useMouse, useMousePressed } from '@vueuse/core'
import { useCollaborativeClient } from 'app/services/collaborative'
import { useFrameStore } from 'app/services/pinia/frame-store'
import { CommentContentType } from '@xmindltd/document-kit-yjs'
import { trackComment } from 'client/library/tracker'
import { commentThreadPopoverAnchorOffset, commentViewSize } from 'app/services/collaborative/shared/comments-style'
import { useCommentPosition } from './use-comment-position'
import { computeCommentThreadViewBound } from 'client/library/collaborative/comments'

const props = defineProps<{
  isOpened: boolean
  workbookId?: string
}>()

const emit = defineEmits<{ (e: 'visibility-change', newValue: boolean): void }>()
const isCommentPopoverOpened = computed(() => props.isOpened)

const { commentThreads } = storeToRefs(useSharedStore())
const { lastActiveCommentThreadId, commentThreadPreviewInfo, lastActiveCommentThreadViewBound, activeSheetFigure, activeSheetViewportMetrics } =
  useMindMap()
const { newAddedCommentThreadIdsByOthers } = storeToRefs(useSharedStore())
const { addCommentToThread, deleteCommentThread, setNewAddedCommentThreadIdsByOthers } = useSharedStore()
const { isFileOwner } = useCollaborativeStore()
const { commentAuthor } = useCollaborativeClient()

const commentThreadDiv = ref<HTMLElement>()

const handleVisibleChange = (newValue: boolean) => {
  emit('visibility-change', Boolean(newValue))
}

const previewMode = computed<'hover' | 'new-added'>(() => {
  return newAddedCommentThreadIdsByOthers.value && newAddedCommentThreadIdsByOthers.value[0] ? 'new-added' : 'hover'
})

const previewCommentThreadId = computed(() => {
  return previewMode.value === 'hover' ? lastActiveCommentThreadId.value : newAddedCommentThreadIdsByOthers.value[0]
})

const commentThread = computed(() => {
  return commentThreads.value.find(thread => thread.id === previewCommentThreadId.value)
})

const isEmptyThread = computed(() => {
  const commentList = commentThread.value?.comments ?? []
  return commentList.length === 0
})

const commentEditorStyleObj = computed(() => {
  return isEmptyThread.value ? { 'border-radius': '8px' } : { 'border-radius': '0 0 8px 8px' }
})

const width = 300

const threadViewBound = computed(() => {
  const editorViewportBound = useMindMap().activeSheetViewer.value?.viewport?.getBoundingClientRect()

  if (previewMode.value === 'hover') {
    const bound = commentThreadPreviewInfo.value?.bound ?? lastActiveCommentThreadViewBound.value
    if (!bound) {
      return { x: 0, y: 0 }
    }

    return {
      x: bound.x + (editorViewportBound?.x ?? 0),
      y: bound.y + (editorViewportBound?.y ?? 0),
    }
  } else {
    const computedCommentThreadViewBound = computeCommentThreadViewBound(
      commentThread.value,
      activeSheetFigure.value,
      activeSheetViewportMetrics.value,
    )

    return {
      x: computedCommentThreadViewBound.x + (editorViewportBound?.x ?? 0),
      y: computedCommentThreadViewBound.y + (editorViewportBound?.y ?? 0),
    }
  }
})

const popupPosition = useCommentPosition({
  width,
  threadViewBound,
  commentThreadDiv,
})

const { x: mouseX, y: mouseY } = useMouse()
const { pressed: mousePressed } = useMousePressed()

function isMouseHoverIn(
  mousePosition: viewerKit.Point,
  bound: {
    left: number
    top: number
    width: number
    height: number
  },
) {
  return (
    mousePosition.x > bound.left &&
    mousePosition.x < bound.left + bound.width &&
    mousePosition.y > bound.top &&
    mousePosition.y < bound.top + bound.height
  )
}

const isMouseHoverInPopupAndCommentView = (mousePosition: viewerKit.Point) => {
  const bound = commentThreadDiv.value.getBoundingClientRect()
  return isMouseHoverIn(mousePosition, bound)
}

const isMouseHoverInCommentView = (mousePosition: viewerKit.Point) => {
  const bound = {
    left: threadViewBound.value.x - commentViewSize.width / 2 - commentThreadPopoverAnchorOffset.x,
    top: threadViewBound.value.y - commentViewSize.height / 2 - commentThreadPopoverAnchorOffset.y,
    width: commentViewSize.width + commentThreadPopoverAnchorOffset.x * 2,
    height: commentViewSize.height + commentThreadPopoverAnchorOffset.y * 2,
  }
  return isMouseHoverIn(mousePosition, bound)
}

watch([mouseX, mouseY], ([mouseX, mouseY]) => {
  if (
    previewMode.value === 'hover' &&
    !isCommentEditorVisible.value &&
    !isMouseHoverInPopupAndCommentView({ x: mouseX, y: mouseY }) &&
    !isMouseHoverInCommentView({ x: mouseX, y: mouseY })
  ) {
    handleVisibleChange(false)
  }
})

watch([mousePressed, mouseX, mouseY], ([mousePressed, mouseX, mouseY]) => {
  if (
    mousePressed &&
    (isCommentEditorVisible.value || previewMode.value === 'new-added') &&
    !isMouseHoverInPopupAndCommentView({ x: mouseX, y: mouseY })
  ) {
    handleVisibleChange(false)
  }
})

const isCommentEditorVisible = computed(() => isEmptyThread.value)
const commentEditorMode = computed(() => (isEmptyThread.value ? 'plain' : 'default'))

const handleClick = () => {
  if (isEmptyThread.value) return

  useServiceStore().services.action.ui.openCommentThreadPopup.execute({ status: true, commentThreadId: commentThread.value.id })
  trackComment.commentPopShow('FromMapHoverClick')
}

onMounted(() => {
  useFrameStore().setCurrentCommentThreadId(commentThread.value?.id)
})

onUnmounted(() => {
  if (commentThread.value) {
    deleteCommentThread({ threadId: commentThread.value.id, ifEmpty: true })
  }

  setNewAddedCommentThreadIdsByOthers([])
})

const handleSendComment = (content: CommentContentType) => {
  addCommentToThread({ threadId: commentThread.value.id, newCommentContent: content, author: commentAuthor.value })
  trackComment.commentAddFrom(isFileOwner ? 'FromOwner' : 'FromCollaborator')
}
</script>
