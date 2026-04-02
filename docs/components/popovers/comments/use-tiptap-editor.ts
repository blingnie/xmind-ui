import Placeholder from '@tiptap/extension-placeholder'
import Mention from '@tiptap/extension-mention'
import StarterKit from '@tiptap/starter-kit'
import { Extension, JSONContent, VueRenderer, useEditor } from '@tiptap/vue-3'
import { Ref, computed } from 'vue'
import MentionsMenu from './mentions-menu.vue'
import { $T } from 'client/library/translation'
import { trackComment } from 'client/library/tracker'
import { useCommentMentionsStore } from 'app/services/pinia/comment-mentions-store'
import { storeToRefs } from 'pinia'

export function useTiptapEditor(options: {
  editable?: boolean
  mentionsContainerDiv?: Ref<HTMLElement>
  initJsonContent?: JSONContent
  onEnterPressed?: () => boolean
}) {
  const { editable = false, mentionsContainerDiv, initJsonContent, onEnterPressed } = options

  const { onlineCommentAuthors, teammateCommentAuthors } = storeToRefs(useCommentMentionsStore())

  const editor = useEditor({
    content: initJsonContent ?? null,
    editable,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: $T('Type your comment'),
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        renderLabel({ node }) {
          return `@${node.attrs.id.name}`
        },
        suggestion: {
          items: ({ query }) => {
            if (query) {
              const authors = [...onlineCommentAuthors.value]
              for (const teammate of teammateCommentAuthors.value) {
                if (!authors.some(author => author.xmindId === teammate.xmindId)) {
                  authors.push(teammate)
                }
              }
              return authors.filter(item => item.name.toLowerCase().startsWith(query.toLowerCase()))
            } else {
              return onlineCommentAuthors.value
            }
          },

          render: () => {
            let component: VueRenderer

            return {
              onStart: props => {
                logger.log('[Tiptap] suggestion render onStart: ', props)

                component = new VueRenderer(MentionsMenu, {
                  props,
                  editor: props.editor,
                })

                mentionsContainerDiv?.value.appendChild(component.element)
                trackComment.commentPopClick('@')
              },

              onUpdate(props) {
                logger.log('[Tiptap] suggestion render onUpdate: ', props)
                component.updateProps(props)
              },

              onKeyDown(props) {
                logger.log('[Tiptap] onKeyDown: ', props)
                return component.ref?.onKeyDown(props)
              },

              onExit() {
                component.element.parentElement?.removeChild(component.element)
              },
            }
          },
        },
      }),
      Extension.create({
        addKeyboardShortcuts() {
          return {
            Enter: () => {
              return onEnterPressed?.() ?? false
            },
          }
        },
      }),
    ],
  })

  const isEmpty = computed(() => editor.value?.isEmpty ?? true)
  const editContent = computed(() => editor.value?.getJSON() ?? null)

  return {
    editor,
    isEmpty,
    editContent,
  }
}
