<template>
  <fw-menu-popover :menu-items="menuItems" position="bottom-right" content-class="min-w-[230px]" @open="emit('show')" @close="emit('hide')">
    <template #trigger>
      <fw-tile-button icon-name="more" :class="'h-6 w-6 p-[2px]'" />
    </template>
    <template #menu-item="{ item }">
      <fw-menu-icon-button
        :icon-name="item.iconName"
        :disabled="item.disabled"
        :class="item.iconName === 'trash' ? 'text-red-500' : ''"
        @click="item.action"
      >
        {{ item.title }}
      </fw-menu-icon-button>
    </template>
  </fw-menu-popover>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { $T } from 'client/library/translation'
import { CollaborativeComment } from '@xmindltd/document-kit-yjs'
import { useCollaborativeClient } from 'app/services/collaborative'
import { type MenuItem } from 'client/components/types'

const props = defineProps<{
  comment: CollaborativeComment
}>()
const emit = defineEmits(['edit', 'delete', 'show', 'hide'])

const { commentAuthor } = useCollaborativeClient()
const isCommentAuthor = computed(() => {
  const commentAuthorId = props.comment.author.xmindId || props.comment.author.clientId
  const currentUserId = commentAuthor.value.xmindId || commentAuthor.value.clientId
  return commentAuthorId === currentUserId
})

// If it's not your own comment, only the Copy button will be shown
const menuItems = computed<MenuItem[]>(() => {
  const editItem = isCommentAuthor.value
    ? [
        {
          title: $T('Edit'),
          iconName: 'edit' as const,
          action: () => {
            emit('edit')
          },
        },
      ]
    : []
  return [
    ...editItem,
    {
      title: $T('Copy Text'),
      iconName: 'note-link' as const,
      action: () => {
        const commentObj = props.comment.content.content

        commentObj.forEach(item => {
          if (item.content && Array.isArray(item.content)) {
            item.content.forEach(innerItem => {
              navigator.clipboard.writeText(innerItem.text)
            })
          }
        })
      },
    },
    isCommentAuthor.value ? { divider: true as const } : null,
    isCommentAuthor.value
      ? {
          title: $T('Delete'),
          iconName: 'trash' as const,
          action: () => {
            emit('delete')
          },
        }
      : null,
  ].filter(Boolean)
})
</script>
