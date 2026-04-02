<template>
  <div ref="commentCardEl" class="comment-card group/comment-card flex w-full flex-col">
    <div class="flex w-full flex-row items-center justify-between">
      <div ref="commentAuthorInfoEl" class="flex max-w-[calc(100%-28px)] flex-row items-center">
        <div>
          <fw-image-container :src="authorAvatarUrl" :class="'mr-2 h-6 w-6 rounded-full'" />
        </div>
        <span :class="twMerge('font-NeverMind-UI text-text-primary-light dark:text-text-primary-dark', 'text-desktop-body-medium', 'truncate')">
          {{ comment.author.name }}
        </span>
        <span class="ml-2 whitespace-nowrap font-NeverMind-UI text-desktop-caption text-text-tertiary-light dark:text-text-tertiary-dark"
          >{{ prettyDate(comment.createdDate) }}
        </span>
      </div>
      <div class="opacity-0 group-hover/comment-card:opacity-100" :class="{ 'opacity-100': isMenuVisible }">
        <comment-item-menu
          :comment="comment"
          @edit="emit('edit')"
          @delete="emit('delete')"
          @show="isMenuVisible = true"
          @hide="isMenuVisible = false"
        />
      </div>
    </div>
    <div class="mt-2 flex flex-row">
      <div>
        <div
          class="pointer-events-none mx-3 h-full w-px bg-transparent-dark-4 dark:bg-border-translucent-dark"
          :class="{ '!bg-transparent': props.isLastComment }"
        ></div>
      </div>
      <div
        class="w-full whitespace-pre-line break-words pl-2 pr-6 text-desktop-body-medium text-text-secondary-light dark:text-text-secondary-dark"
        :class="{ 'pb-4': !props.isLastComment }"
      >
        <editor-content class="w-full" :editor="editor" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { prettyDate } from 'utils/misc'
import { generateAvatarDataURI } from 'client/library/cloud-kit/utils/avatar'
import CommentItemMenu from './comment-item-menu.vue'
import { useTiptapEditor } from './use-tiptap-editor'
import { EditorContent } from '@tiptap/vue-3'
import { CollaborativeComment } from '@xmindltd/document-kit-yjs'

const props = withDefaults(
  defineProps<{
    comment: CollaborativeComment
    isShowMoreButton?: boolean
    isLastComment?: boolean
  }>(),
  {
    isShowMoreButton: true,
    isLastComment: false,
  },
)

const emit = defineEmits(['edit', 'delete'])

const commentCardEl = ref(null)
const commentAuthorInfoEl = ref(null)

const isMenuVisible = ref<boolean>(false)

const authorAvatarUrl = computed(() => {
  const { xmindId, name, avatarUrl, color } = props.comment.author
  return (
    avatarUrl ??
    generateAvatarDataURI({
      xmindId,
      name,
      backgroundColor: color,
      foregroundColor: '#ffffff',
    })
  )
})

const { editor } = useTiptapEditor({
  initJsonContent: props.comment.content,
})
</script>

<style scoped>
:deep(.tiptap) {
  p {
    margin: 0;
  }
}

:deep(.mention) {
  @apply text-blue-500;
}
</style>
