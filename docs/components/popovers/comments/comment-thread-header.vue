<template>
  <div class="flex flex-row items-center">
    <div v-if="headerMode === 'thread-list'" class="flex h-full w-full flex-row items-center p-3">
      <div class="flex w-full flex-row justify-between">
        <div class="flex flex-row gap-2">
          <fw-tile-button :icon-name="'chevron-backward'" :disabled="!previousThread" @click="navigateToPreviousThread" />
          <fw-tile-button :icon-name="'chevron-forward'" :disabled="!nextThread" @click="navigateToNextThread" />
        </div>
        <div class="flex flex-row gap-2">
          <fw-tile-button :icon-name="resolvedStatusIcon" @click="handleResolvedButtonClick" />
          <fw-tile-button v-show="pinnedStatusIcon === 'pin-outline'" :icon-name="'pin-outline'" @click="emit('toggle-pinned')" />
          <fw-tile-button v-show="pinnedStatusIcon === 'pin-fill'" :icon-name="'pin-fill'" @click="emit('toggle-pinned')" />
          <comment-thread-more-menu :comment-thread="commentThread" :source="'threadHeader'" @delete="emit('delete-thread')" />
        </div>
      </div>
    </div>
    <div v-else class="flex w-full flex-row items-center justify-between py-3 pl-5 pr-3">
      <div class="text-desktop-subhead-small text-text-primary-light dark:text-text-primary-dark">{{ $T('Edit Comment') }}</div>
      <fw-tile-button :icon-name="'close'" @click.stop="emit('close')" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { $T } from 'client/library/translation'
import CommentThreadMoreMenu from '../../collaborative/comment-thread-more-menu.vue'
import { filterCommentThreadsBy, sortCommentThreadsBy } from 'client/library/collaborative/comments'
import { computed } from 'vue'
import { useCommentSettingsStore } from 'app/services/pinia/comment-settings-store'
import { useServiceStore } from 'client/store'
import { useSharedStore } from 'app/services/pinia/shared-store'
import { storeToRefs } from 'pinia'
import { useCollaborativeClient } from 'app/services/collaborative'
import { useMindMap } from '@xmindltd/snowmonster'
import { CollaborativeCommentThread } from '@xmindltd/document-kit-yjs'
import { trackComment } from 'client/library/tracker'
import { IconName } from 'client/components/icon/icons'

const props = defineProps<{
  commentThread: CollaborativeCommentThread
  headerMode: 'thread-list' | 'comment'
  pinned: boolean
}>()

const emit = defineEmits(['delete-thread', 'toggle-pinned', 'close'])

const { sortByMethod, showResolvedThreads, onlyShowMyThreads } = storeToRefs(useCommentSettingsStore())
const { commentThreads, currentDocSheets, currentDocTopics } = storeToRefs(useSharedStore())
const { markThreadAs } = useSharedStore()
const { commentAuthor } = useCollaborativeClient()
const { activeSheetId } = useMindMap()

const sortedFilteredCommentThreads = computed(() => {
  const filteredThreads = filterCommentThreadsBy({
    threads: commentThreads.value,
    currentSheetId: activeSheetId.value,
    xmindId: commentAuthor.value.xmindId,
    filterby: {
      currentDocSheets: currentDocSheets.value,
      currentDocTopics: currentDocTopics.value,
      showEmptyThreads: false,
      showResolvedThreads: showResolvedThreads.value,
      onlyShowMyThreads: onlyShowMyThreads.value,
      onlyShowCurrentSheet: true,
    },
  })

  return sortCommentThreadsBy({
    threads: filteredThreads,
    xmindId: commentAuthor.value.xmindId,
    sortBy: sortByMethod.value,
  })
})

const previousThread = computed(() => {
  const index = sortedFilteredCommentThreads.value.findIndex(thread => thread.id === props.commentThread.id)
  if (index < 1) return null
  return sortedFilteredCommentThreads.value[index - 1]
})

const nextThread = computed(() => {
  const index = sortedFilteredCommentThreads.value.findIndex(thread => thread.id === props.commentThread.id)
  if (index < 0 || index === sortedFilteredCommentThreads.value.length - 1) return null
  return sortedFilteredCommentThreads.value[index + 1]
})

const navigateToPreviousThread = () => {
  if (previousThread.value) {
    useServiceStore().services.action.ui.openCommentThreadPopup.execute({ status: true, commentThreadId: previousThread.value.id })
    trackComment.commentPopClick('Back')
  }
}

const navigateToNextThread = () => {
  if (nextThread.value) {
    useServiceStore().services.action.ui.openCommentThreadPopup.execute({ status: true, commentThreadId: nextThread.value.id })
    trackComment.commentPopClick('Forward')
  }
}

const resolvedStatusIcon = computed<IconName>(() => (props.commentThread.status.resolved ? 'checkmark-circle-fill' : 'checkmark-circle-outline'))

const handleResolvedButtonClick = () => {
  trackComment.commentPopClick(props.commentThread.status.resolved ? 'UnResolve' : 'Resolve')
  markThreadAs({
    threadId: props.commentThread.id,
    mark: props.commentThread.status.resolved ? 'unresolved' : 'resolved',
    author: commentAuthor.value,
  })
}

const pinnedStatusIcon = computed<'pin-fill' | 'pin-outline'>(() => (props.pinned ? 'pin-fill' : 'pin-outline'))
</script>
