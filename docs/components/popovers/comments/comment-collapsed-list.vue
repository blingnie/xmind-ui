<template>
  <div class="flex flex-col gap-2 p-4">
    <template v-for="(comment, index) in collapsedCommentItems" :key="collapsedCommentItemKeys[index]">
      <comment-summary-item v-if="comment.type === 'summary'" :comments="comment.comments" />
      <comment-content-item v-else :comment="comment.comment" :is-last-comment="comment.type === 'tail'" />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { CollaborativeCommentThread } from '@xmindltd/document-kit-yjs'
import CommentContentItem from './comment-content-item.vue'
import CommentSummaryItem from 'client/components/collaborative/comment-summary-item.vue'
import { computeCollapsedCommentItems } from 'client/library/collaborative/comments'
import { computed } from 'vue'

const props = defineProps<{
  commentThread: CollaborativeCommentThread
}>()

const collapsedCommentItems = computed(() => {
  return computeCollapsedCommentItems(props.commentThread)
})

const collapsedCommentItemKeys = computed(() => {
  return collapsedCommentItems.value.map(item => {
    return item.type === 'summary' ? item.comments.map(comment => comment.id).join('') : item.comment.id
  })
})
</script>
