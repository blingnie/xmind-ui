<template>
  <div class="max-h-[450px] overflow-y-auto overflow-x-hidden">
    <div ref="commentListDiv" class="flex flex-col gap-2 px-5 pb-8 pt-6">
      <template v-for="(item, index) in expandedCommentItems" :key="expandedCommentItemKeys[index]">
        <template v-if="item.type === 'action'">
          <comment-action-item :action="item.action" :is-first-action="index === 0" :is-last-action="index === expandedCommentItems.length - 1" />
          <div
            v-if="expandedCommentItems[index + 1]?.type === 'comment'"
            class="pointer-events-none mx-3 h-4 w-px bg-transparent-dark-4 dark:bg-border-translucent-dark"
          />
        </template>
        <comment-content-item
          v-else
          :comment="item.comment"
          :is-last-comment="index === expandedCommentItems.length - 1"
          @edit="handleCommentEdit(item)"
          @delete="handleCommentDelete(item)"
        />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computeExpandedCommentItems, type ExpandedCommentItem } from 'client/library/collaborative/comments'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import CommentContentItem from './comment-content-item.vue'
import CommentActionItem from 'client/components/collaborative/comment-action-item.vue'
import { CollaborativeCommentThread } from '@xmindltd/document-kit-yjs'
import { trackComment } from 'client/library/tracker'

const props = defineProps<{
  commentThread: CollaborativeCommentThread
}>()

const emit = defineEmits<{
  (event: 'edit-comment', commentId: string): void
  (event: 'delete-comment', commentId: string): void
}>()

const commentListDiv = ref<HTMLDivElement>()

onMounted(() => {
  commentListDiv.value.scrollIntoView({ behavior: 'instant', block: 'end' })
})

const expandedCommentItems = computed(() => computeExpandedCommentItems(props.commentThread))

const expandedCommentItemsSize = computed(() => expandedCommentItems.value.length)

watch(expandedCommentItemsSize, async (size, oldSize) => {
  if (size > oldSize) {
    await nextTick()
    commentListDiv.value.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }
})

const expandedCommentItemKeys = computed(() => {
  return expandedCommentItems.value.map(item => {
    return item.type === 'action' ? item.action.id : item.comment.id
  })
})

const handleCommentEdit = (item: ExpandedCommentItem) => {
  if (item.type === 'comment') {
    emit('edit-comment', item.comment.id)
    trackComment.commentPopClick('Edit')
  }
}

const handleCommentDelete = (item: ExpandedCommentItem) => {
  if (item.type === 'comment') {
    emit('delete-comment', item.comment.id)
    trackComment.commentPopClick('DeleteComment')
  }
}
</script>
