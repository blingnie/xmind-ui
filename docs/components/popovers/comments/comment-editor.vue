<template>
  <div ref="commentEditorContainer" class="comment-editor-container bg-material-acrylic-light dark:bg-fill-surfaceBright-dark">
    <div class="flex flex-col">
      <div v-if="editorMode === 'default'" class="flex flex-row px-5 py-4">
        <fw-image-container :src="editorAvatarUrl" :class="'mr-2 h-6 w-6 rounded-full'" />
        <editor-content
          class="editor-content overflow-auto"
          :class="editorMode"
          :editor="editor"
          :style="commentEditorContentStyleObj"
          @keydown.esc.prevent="handleKeydown"
        />
      </div>
      <div v-else class="flex flex-row items-center" :style="commentEditorContentContainerStyleObj">
        <editor-content
          class="editor-content overflow-auto"
          :class="editorMode"
          :editor="editor"
          :style="commentEditorContentStyleObj"
          @keydown.esc.prevent="handleKeydown"
        />
        <fw-button v-if="!actionsPanelOpened" :size="'small'" :theme="'secondary'" class="!h-8 !px-[6px]" :disabled="true">
          <fw-icon name="arrow-upward" />
        </fw-button>
      </div>
      <div v-if="actionsPanelOpened" class="flex w-full flex-row justify-between px-3 pb-3">
        <fw-tile-button icon-name="mention" :active="isMentionsMenuVisible" @click="handleMentionButtonClick" />
        <fw-button :size="'small'" :theme="'secondary'" class="!h-8 !px-[6px]" @click="sendComment">
          <fw-icon name="arrow-upward" />
        </fw-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useCollaborativeClient } from 'app/services/collaborative'
import { generateAvatarDataURI } from 'client/library/cloud-kit/utils/avatar'
import { EditorContent } from '@tiptap/vue-3'
import { useTiptapEditor } from './use-tiptap-editor'
import { CommentContentType } from '@xmindltd/document-kit-yjs'
import { trackComment } from 'client/library/tracker'
import { useSharedStore } from 'app/services/pinia'
import { useCommentMentionsStore } from 'app/services/pinia/comment-mentions-store'
import { useCollaborativeManagement } from 'app/services/collaborative/collaborative-management'
import { useTeamSpaceData } from 'app/composables/team-space-data'

const props = withDefaults(
  defineProps<{
    editorMode: 'default' | 'plain'
    initContent?: CommentContentType | null
  }>(),
  {
    editorMode: 'default',
    initContent: null,
  },
)

const emit = defineEmits<{
  (event: 'send', content: CommentContentType): void
}>()

const commentEditorContainer = ref<HTMLElement>()

const { commentAuthor } = useCollaborativeClient()
const { setOnlineCommentAuthors, setTeammateCommentAuthors } = useCommentMentionsStore()

const loadCommentAuthors = async () => {
  const { fetchCollaborativeMetadata, fetchFileInviteeProfiles, inviteeProfiles, teamId } = useCollaborativeManagement(useSharedStore().sharedFileId)
  await Promise.all([fetchFileInviteeProfiles(), fetchCollaborativeMetadata()])

  setOnlineCommentAuthors(
    inviteeProfiles.value
      .filter(profile => profile.role === 'editor')
      .filter(profile => !!profile.name)
      .map(profile => {
        return {
          xmindId: profile.xmindId,
          name: profile.name,
          avatarUrl: profile.avatarUrl,
        }
      }),
  )

  const teammates = await useTeamSpaceData().fetchTeammates(teamId.value, true)
  setTeammateCommentAuthors(
    teammates.map(teammate => ({
      xmindId: teammate.userId,
      name: teammate.name,
      avatarUrl: teammate.avatarUrl,
    })),
  )
}

const {
  editor,
  isEmpty,
  editContent: editingComment,
} = useTiptapEditor({
  editable: true,
  mentionsContainerDiv: commentEditorContainer,
  onEnterPressed: () => {
    if (isMentionsMenuVisible.value) return false

    sendComment()
    return true
  },
})

watch(
  () => props.initContent,
  () => {
    editor.value?.commands.setContent(props.initContent)
    editor.value?.commands.focus('end')
  },
  { immediate: true },
)

const editorAvatarUrl = computed(
  () =>
    commentAuthor.value.avatarUrl ||
    generateAvatarDataURI({
      xmindId: commentAuthor.value.xmindId,
      name: commentAuthor.value.name,
      backgroundColor: commentAuthor.value.color,
      foregroundColor: '#ffffff',
    }),
)

const actionsPanelOpened = computed(() => !isEmpty.value)

const sendComment = () => {
  if (isEmpty.value) return

  emit('send', editingComment.value)
  trackComment.commentPopClick('Send')
  trackComment.commentAddEntry('Reply')

  editor.value.commands.clearContent()
  editor.value.commands.focus('end')
}

const editorContentMinHeight = computed(() => (props.editorMode === 'default' ? 24 : 16))
const editorContentLineHeight = 18

let tiptapEditorResizeObserver: ResizeObserver
const tiptapEditorParagraphHeight = ref<number>(editorContentLineHeight)
const tiptapEditorParagraphVerticalMargin = ref<number>(props.editorMode === 'default' ? 4 : 0)

onMounted(async () => {
  editor.value.commands.focus()
  await loadCommentAuthors()

  tiptapEditorResizeObserver = new ResizeObserver(([entry]) => {
    tiptapEditorParagraphHeight.value = entry.contentRect.height > editorContentLineHeight ? editorContentLineHeight * 2 : editorContentLineHeight

    tiptapEditorParagraphVerticalMargin.value = Math.max((editorContentMinHeight.value - tiptapEditorParagraphHeight.value) / 2, 0)
  })
  const tiptapEditorParagraphEl = document.querySelector('.editor-content div.tiptap > p')
  tiptapEditorParagraphEl && tiptapEditorResizeObserver.observe(tiptapEditorParagraphEl)
})

const handleMentionButtonClick = () => {
  const transaction = editor.value.state.tr.insertText(' @')
  editor.value.view.dispatch(transaction)
  editor.value.commands.focus('end')
}

const isMentionsMenuVisible = ref<boolean>(false)
let observer: MutationObserver = null

onMounted(() => {
  observer = new MutationObserver(() => {
    isMentionsMenuVisible.value = !!commentEditorContainer.value.querySelector('.mentions-menu')
  })

  observer.observe(commentEditorContainer.value, { childList: true, subtree: true })
})

onBeforeUnmount(() => {
  tiptapEditorResizeObserver?.disconnect()
  observer?.disconnect()
})

const handleKeydown = (event: KeyboardEvent) => {
  if (isMentionsMenuVisible.value) {
    event.stopPropagation()

    const mentionsMenuEl = commentEditorContainer.value.querySelector('.mentions-menu')
    mentionsMenuEl && commentEditorContainer.value.removeChild(mentionsMenuEl)
  }
}

const commentEditorContentContainerStyleObj = computed(() => ({
  paddingLeft: '16px',
  paddingRight: actionsPanelOpened.value ? '12px' : '8px',
  paddingTop: actionsPanelOpened.value ? '12px' : '8px',
  paddingBottom: actionsPanelOpened.value ? '12px' : '8px',
}))

const commentEditorContentStyleObj = computed(() => ({
  width: `${props.editorMode === 'default' ? 268 : actionsPanelOpened.value ? 242 : 210}px`,
  height: `${tiptapEditorParagraphHeight.value}px`,
  margin: `${tiptapEditorParagraphVerticalMargin.value}px 0`,
}))
</script>

<style scoped>
.editor-content :deep(div.tiptap) {
  @apply font-NeverMind-UI text-desktop-body-large text-text-primary-light outline-none dark:text-text-primary-dark;
}

.editor-content :deep(div.tiptap > p) {
  @apply m-0;
}

.editor-content :deep(div.tiptap p.is-editor-empty) {
  @apply h-[18px];
}

.editor-content &.plain :deep(div.tiptap p.is-editor-empty) {
  @apply h-[18px];
}

.editor-content :deep(div.tiptap p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  @apply pointer-events-none float-left h-0 text-desktop-body-large text-transparent-dark-7 dark:text-transparent-white-7;
}

.editor-content &.plain :deep(div.tiptap p.is-editor-empty:first-child::before) {
  @apply leading-[18px];
}

.editor-content :deep(.mention) {
  @apply text-blue-500;
}
</style>
