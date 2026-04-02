<template>
  <comment-thread-locator-popover
    :workbook-id="workbookId"
    :value="isCommentPopoverOpened"
    :x="popupPosition.x"
    :y="popupPosition.y"
    :width="width"
    :is-activated="false"
    @input="handleVisibleChange"
  >
    <div v-if="commentThread" ref="commentThreadDiv" class="flex flex-col">
      <template v-if="isThreadHeaderVisible">
        <comment-thread-header
          :comment-thread="commentThread"
          :header-mode="headerMode"
          :pinned="pinned"
          @delete-thread="handleDeleteThread"
          @toggle-pinned="handleTogglePinned"
          @close="handleClose"
        />
        <fw-divider />
      </template>

      <template v-if="isCommentExpandedListVisible">
        <comment-expanded-list :comment-thread="commentThread" @edit-comment="handleEditComment" @delete-comment="handleDeleteComment" />
        <fw-divider v-if="isCommentEditorVisible" />
      </template>

      <comment-editor v-if="isCommentEditorVisible" :editor-mode="editorMode" :init-content="currentEditCommentContent" @send="handleSendComment" />
    </div>
  </comment-thread-locator-popover>
</template>

<script lang="ts" setup>
import CommentThreadLocatorPopover from './comment-thread-locator.vue'
import CommentExpandedList from './comment-expanded-list.vue'
import CommentEditor from './comment-editor.vue'
import CommentThreadHeader from './comment-thread-header.vue'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useMindMap, viewerKit } from '@xmindltd/snowmonster'
import { useSharedStore } from 'app/services/pinia/shared-store'
import { useServiceStore } from 'client/store'
import { useCollaborativeClient } from 'app/services/collaborative'
import { computeCommentThreadViewBound } from 'client/library/collaborative/comments'
import { storeToRefs } from 'pinia'
import { $T } from 'client/library/translation'
import { onClickOutside, useMouse } from '@vueuse/core'
import { CommentContentType } from '@xmindltd/document-kit-yjs'
import { trackComment } from 'client/library/tracker'
import { useCollaborativeStore, useWorkspaceStore } from 'app/services/pinia'
import { commentThreadPopoverAnchorOffset, commentViewSize } from 'app/services/collaborative/shared/comments-style'
import { useCommentPosition } from './use-comment-position'

export type PopupMode = 'expanded' | 'edit'

const props = defineProps<{
  isOpened: boolean
  commentThreadId: string
  workbookId?: string
}>()

const emit = defineEmits<{ (e: 'visibility-change', newValue: boolean): void }>()
const isCommentPopoverOpened = computed(() => props.isOpened)

const { activeSheetFigure, activeSheetViewportMetrics, commentThreadPreviewInfo } = useMindMap()
const { addCommentToThread, updateComment, deleteCommentThread, deleteComment, markThreadAs } = useSharedStore()
const { commentThreads } = storeToRefs(useSharedStore())
const { isFileOwner } = useCollaborativeStore()
const { commentAuthor } = useCollaborativeClient()

const commentThreadDiv = ref<HTMLElement>()

const handleVisibleChange = (newValue: boolean) => {
  emit('visibility-change', Boolean(newValue))
}

const commentThread = computed(() => {
  return commentThreads.value.find(thread => thread.id === props.commentThreadId)
})

const currentPopupMode = ref<PopupMode>('expanded')

const isEmptyThread = computed(() => {
  const commentList = commentThread.value?.comments ?? []
  return commentList.length === 0
})

const isThreadHeaderVisible = computed(() => !isEmptyThread.value)
const isCommentExpandedListVisible = computed(() => currentPopupMode.value === 'expanded' && !isEmptyThread.value)
const isCommentEditorVisible = computed(() => currentPopupMode.value === 'expanded' || currentPopupMode.value === 'edit')

const headerMode = computed(() => (currentPopupMode.value === 'edit' ? 'comment' : 'thread-list'))
const editorMode = computed(() => (isEmptyThread.value ? 'plain' : 'default'))

const width = computed(() => {
  return editorMode.value === 'plain' ? 254 : 340
})

const threadViewBound = computed(() => {
  if (!commentThread.value) {
    return { x: 0, y: 0 }
  }

  const editorViewportBound = useMindMap().activeSheetViewer.value?.viewport?.getBoundingClientRect()
  if (commentThreadPreviewInfo && commentThreadPreviewInfo.value?.threadId === commentThread.value.id) {
    const commentThreadPreviewBound = commentThreadPreviewInfo.value.bound
    return {
      x: commentThreadPreviewBound.x + (editorViewportBound?.x ?? 0),
      y: commentThreadPreviewBound.y + (editorViewportBound?.y ?? 0),
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

const handleClose = () => {
  if (currentPopupMode.value === 'edit') {
    currentPopupMode.value = 'expanded'
    currentEditCommentId.value = null
  }
}

onMounted(() => {
  if (!isEmptyThread.value) {
    markThreadAs({ threadId: props.commentThreadId, mark: 'read', author: commentAuthor.value })
  }
})

onUnmounted(() => {
  if (commentThread.value?.id) {
    deleteCommentThread({ threadId: commentThread.value.id, ifEmpty: true })
  }

  // If comment popover is pinned, the state in frame-store is not updated before back from comment popover, so change it here
  handleVisibleChange(false)
})

const currentEditCommentId = ref<string | null>(null)

const handleEditComment = (commentId: string) => {
  if (currentPopupMode.value === 'expanded') {
    currentPopupMode.value = 'edit'
    currentEditCommentId.value = commentId
  }
}

const currentEditCommentContent = computed(() => {
  const comment = commentThread.value?.comments.find(comment => comment.id === currentEditCommentId.value)
  return comment?.content ?? null
})

const handleDeleteThread = async () => {
  if (
    await useServiceStore().services.action.dialog.confirm({
      title: $T('Delete Thread'),
      width: 538,
      height: 232,
      description: $T('Are you sure you want to delete this thread? This action cannot be undone.'),
      confirmButtonText: $T('Delete'),
      cancelButtonText: $T('Cancel'),
      dismissable: false,
    })
  ) {
    handleVisibleChange(false)
    deleteCommentThread({ threadId: commentThread.value.id })
  }
}

const handleDeleteComment = async (commentId: string) => {
  if (
    await useServiceStore().services.action.dialog.confirm({
      title: $T('Delete Comment'),
      width: 538,
      height: 232,
      description: $T('Are you sure you want to delete this comment? This action cannot be undone.'),
      confirmButtonText: $T('Delete'),
      dismissable: false,
    })
  ) {
    deleteComment({ threadId: commentThread.value.id, commentId })
    if (isEmptyThread.value) {
      handleVisibleChange(false)
      deleteCommentThread({ threadId: commentThread.value.id, ifEmpty: true })
    }
  }
}

const handleSendComment = (content: CommentContentType) => {
  if (currentPopupMode.value === 'edit') {
    currentPopupMode.value = 'expanded'
    updateComment({ threadId: commentThread.value.id, commentId: currentEditCommentId.value, delta: { content } })
  } else {
    addCommentToThread({ threadId: commentThread.value.id, newCommentContent: content, author: commentAuthor.value })
    trackComment.commentAddFrom(isFileOwner ? 'FromOwner' : 'FromCollaborator')
  }
  currentEditCommentId.value = null
}

const pinned = ref<boolean>(false)

const handleTogglePinned = () => {
  trackComment.commentPopClick(pinned.value ? 'Unpin' : 'Pin')
  pinned.value = !pinned.value
}

const isMouseHoverInPopupAndCommentView = (mousePosition: viewerKit.Point) => {
  const bound = commentThreadDiv.value.getBoundingClientRect()
  const threadPopupBound = { left: bound.left + window.scrollX, top: bound.top + window.scrollY, width: bound.width, height: bound.height }

  const mouseXOffset = mousePosition.x - threadPopupBound.left
  const mouseYOffset = mousePosition.y - threadPopupBound.top

  return (
    mouseXOffset > -commentThreadPopoverAnchorOffset.x - commentViewSize.width &&
    mouseXOffset < bound.width &&
    mouseYOffset > 0 &&
    mouseYOffset < bound.height
  )
}

const { x: mouseX, y: mouseY } = useMouse()

onClickOutside(
  commentThreadDiv,
  () => {
    const isMouseHoverInSelf = isMouseHoverInPopupAndCommentView({ x: mouseX.value, y: mouseY.value })
    if (props.isOpened && !pinned.value && mouseX.value && mouseY.value && !isMouseHoverInSelf) {
      handleVisibleChange(false)
    }
  },
  {
    // Ignore click event on modal dialog such as deletion confirm dialog
    ignore: ['.modal-dialog'],
  },
)

const { workbook } = storeToRefs(useWorkspaceStore())
const workbookEditor = workbook.value.workbookEditor

const { activeSheetViewerState } = workbookEditor
watch([activeSheetViewerState], ([activeSheetViewerState]) => {
  if (activeSheetViewerState?.editSession?.kind === 'custom' && activeSheetViewerState?.editSession?.customKind === 'comment-creation') {
    if (pinned.value) {
      handleVisibleChange(false)
    }
  }
})
</script>
