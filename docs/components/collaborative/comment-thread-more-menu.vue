<template>
  <fw-menu-popover
    v-model:is-menu-opened="isCommentThreadMoreMenuOpened"
    :menu-items="menuItems"
    position="bottom-right"
    content-class="min-w-[230px]"
  >
    <template #trigger>
      <fw-tile-button icon-name="more" />
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
import { isCommentThreadUnread } from 'client/library/collaborative/comments'
import { useCollaborativeClient } from 'app/services/collaborative'
import { useSharedStore } from 'app/services/pinia/shared-store'
import { CollaborativeCommentThread } from '@xmindltd/document-kit-yjs'
import * as Clipboard from 'utils/clipboard'
import { toastActions } from 'client/library/new-notifications'
import { trackComment } from 'client/library/tracker'
import { type MenuItem } from 'client/components/types'

const props = defineProps<{
  commentThread: CollaborativeCommentThread
  source: 'threadHeader' | 'threadCard'
}>()

const emit = defineEmits(['delete'])
const isCommentThreadMoreMenuOpened = defineModel('isMenuOpened', {
  type: Boolean,
  default: false,
})

const { commentAuthor } = useCollaborativeClient()
const { markThreadAs } = useSharedStore()

const menuItems = computed<MenuItem[]>(() => {
  const isThreadUnread = isCommentThreadUnread(props.commentThread, commentAuthor.value.xmindId)
  const unreadMarkItem = isThreadUnread
    ? {
        title: $T('Mark as read'),
        iconName: 'comment-badge' as const,
        disabled: !commentAuthor.value.xmindId,
        action: () => {
          markThreadAs({ threadId: props.commentThread.id, mark: 'read', author: commentAuthor.value })
          if (props.source === 'threadCard') {
            trackComment.commentPanelClick('CardMoreMarkAsRead')
          } else if (props.source === 'threadHeader') {
            trackComment.commentPopClick('MarkAsRead')
          }
        },
      }
    : {
        title: $T('Mark as unread'),
        iconName: 'comment' as const,
        disabled: !commentAuthor.value.xmindId,
        action: () => {
          markThreadAs({ threadId: props.commentThread.id, mark: 'unread', author: commentAuthor.value })
          if (props.source === 'threadCard') {
            trackComment.commentPanelClick('CardMoreMarkAsUnread')
          } else if (props.source === 'threadHeader') {
            trackComment.commentPopClick('MarkAsUnread')
          }
        },
      }

  return [
    unreadMarkItem,
    {
      title: $T('Copy Link'),
      iconName: 'note-link',
      action: async () => {
        await Clipboard.write({
          'text/plain': new Blob([`${window.location.origin}${window.location.pathname}?thread-id=${props.commentThread.id}`], {
            type: 'text/plain',
          }),
        })
        if (props.source === 'threadCard') {
          trackComment.commentPanelClick('CardMoreCopyLink')
        } else if (props.source === 'threadHeader') {
          trackComment.commentPopClick('CopyLink')
        }
        toastActions.sheetLinkCopied()
      },
    },
    {
      divider: true,
    },
    {
      title: $T('Delete'),
      iconName: 'trash',
      action: () => {
        emit('delete')
        if (props.source === 'threadCard') {
          trackComment.commentPanelClick('CardMoreDelete')
        } else if (props.source === 'threadHeader') {
          trackComment.commentPopClick('DeleteThread')
        }
      },
    },
  ]
})
</script>
