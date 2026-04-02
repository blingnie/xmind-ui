<template>
  <fw-responsive-wrapper>
    <template #desktop>
      <div class="note-editor">
        <app-base-topic-locator-popover
          :topic-ids="selectionIds"
          :workbook-id="props.workbookId"
          :value="isNotesPopoverOpened"
          :height="280"
          :width="348"
          @input="handleVisibleChange"
        >
          <div class="relative flex h-full w-full flex-col items-center p-4" @mousedown="onMouseDown">
            <div class="mb-3 flex gap-2">
              <fw-tile-button
                v-for="button in formatButtons"
                :icon-name="button"
                class="p-0.5"
                :size="isPhoneSizeViewportWidth ? 'large' : 'small'"
                @click="handleFormatText(button)"
              />
            </div>
            <div style="overflow: hidden; width: 100%">
              <div class="transition" :style="notesStyle">
                <div class="flex items-center px-4" @input.stop>
                  <fw-input
                    ref="linkInputBox"
                    v-model="link"
                    :placeholder="$T('Enter Link URL')"
                    @blur="onInputBlur"
                    class="h-6"
                    @compositionstart="isComposition = true"
                    @compositionend="isComposition = false"
                    @keydown="onInputKeyDown"
                  />
                  <fw-tile-button class="ml-1 p-0.5" icon-name="tick" size="small" @click="setLink" @mousedown.prevent />
                </div>
                <div v-show="!isContainerFocused" class="container-mask" @click="onContainerMaskClick"></div>
                <div
                  ref="container"
                  class="trix-notes-editor-container w-full py-0 text-desktop-body-medium text-text-primary-light dark:text-text-primary-dark"
                  style="overflow: auto; cursor: text"
                  :style="containerStyle"
                  @input.stop.self
                  @selectionchange="handleSelectionChanged"
                />
              </div>
            </div>
          </div>
        </app-base-topic-locator-popover>
      </div>
    </template>
    <template #mobile>
      <transition name="fade">
        <drawer-mask v-if="isNotesPopoverOpened && isMounted" class="z-common-popover" @click.stop="handleClosePage" />
      </transition>
      <transition name="slide-in-out">
        <bottom-drawer
          v-if="isNotesPopoverOpened && isMounted"
          :class="'bg-fill-container-light dark:bg-fill-container-dark'"
          class="fixed bottom-0 z-common-popover max-h-[calc(100%-32px)]"
        >
          <div class="flex h-full w-full flex-col gap-2">
            <div class="relative flex items-center px-6 pb-4 pt-6">
              <span class="absolute left-1/2 -translate-x-1/2 text-mobile-subhead-small text-text-primary-light dark:text-text-primary-dark">
                {{ $T('Note') }}
              </span>
              <span class="ml-auto cursor-pointer text-mobile-body-medium text-blue-5" @click="handleChangeNotes">
                {{ $T('Done') }}
              </span>
            </div>

            <div class="flex flex-1 flex-col px-4 pb-6">
              <div class="mb-3 flex items-center justify-center gap-2">
                <fw-tile-button
                  v-for="button in formatButtons"
                  :key="button"
                  :icon-name="button"
                  class="p-1"
                  size="large"
                  @click="handleFormatText(button)"
                />
              </div>
              <div v-if="isShowLinkBox" class="mb-3 flex items-center gap-2 rounded-lg" :style="notesStyle" @input.stop>
                <fw-input
                  ref="linkInputBox"
                  v-model="link"
                  size="medium"
                  class="flex-1"
                  :placeholder="$T('Enter Link URL')"
                  @blur="onInputBlur"
                  @compositionstart="isComposition = true"
                  @compositionend="isComposition = false"
                  @keydown="onInputKeyDown"
                />
                <fw-tile-button icon-name="tick" size="large" @click="setLink" @mousedown.prevent />
              </div>

              <div class="flex-1 overflow-hidden rounded-lg">
                <div v-show="!isContainerFocused" class="container-mask" @click="onContainerMaskClick"></div>
                <div
                  ref="container"
                  class="trix-notes-editor-container w-full py-0 text-mobile-body-medium text-text-primary-light dark:text-text-primary-dark"
                  style="overflow: auto; cursor: text"
                  :style="containerStyle"
                  @input.stop.self
                  @selectionchange="handleSelectionChanged"
                />
              </div>
            </div>
          </div>
        </bottom-drawer>
      </transition>
    </template>
  </fw-responsive-wrapper>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import AppBaseTopicLocatorPopover from './base-topic-locator.vue'
import DrawerMask from 'client/components/base/drawer-mask.vue'
import BottomDrawer from 'client/components/base/bottom-drawer.vue'
import { useServices } from 'app/fragments/use-services'
import { WorkbookManager } from 'client/library/workbook-next/workbook-manager'
import { Workbook } from 'client/library/workbook-next/workbook'
import { useFrameStore } from 'app/services/pinia'
import { getStringSizeUtf8 } from 'utils/string'
import { MAX_NOTE_SIZE_LIMIT } from 'client/constants'
import { useWindowResize } from 'client/composables/window-resize'
import { $T } from 'client/library/translation'

const props = withDefaults(
  defineProps<{
    isOpened: boolean
    workbookId?: string
    isEditable?: boolean
  }>(),
  {
    workbookId: '',
    isEditable: true,
    isOpened: true,
  },
)

const emit = defineEmits<{
  (e: 'visibility-change', visible: boolean): void
}>()
type FormatButtonName = 'bold' | 'italic' | 'underline' | 'list-bullet' | 'number-list' | 'note-link'

const NotesEditor = window.Notes.Editor
const NotesType = window.Notes.Type
const { action } = useServices()
const isShowLinkBox = computed(() => storeToRefs(useFrameStore()).notesLinkBoxVisible.value)
const isMounted = ref(false)
const editor = ref<any>()
const selectionStyles = ref<string[]>([])
const isComposition = ref<boolean>(false)

const LINK_BOX_HEIGHT = 26
const { isPhoneSizeViewportWidth } = useWindowResize()

const containerStyle = computed(() => {
  const CONTAINER_HEIGHT = 218
  return {
    height: isPhoneSizeViewportWidth.value ? '100%' : isShowLinkBox.value ? `${CONTAINER_HEIGHT - LINK_BOX_HEIGHT}px` : `${CONTAINER_HEIGHT}px`,
  }
})
const notesStyle = computed(() => {
  return { transform: `translateY(${isShowLinkBox.value ? '0' : `-${LINK_BOX_HEIGHT}`}px)` }
})

const link = ref<string>('')
const linkInputBox = ref<HTMLInputElement>()
const formatButtons = <FormatButtonName[]>['bold', 'italic', 'underline', 'list-bullet', 'number-list', 'note-link']
const formatStylesMap: Record<FormatButtonName, any> = {
  bold: NotesType.TextStyles.bold,
  italic: NotesType.TextStyles.italic,
  underline: NotesType.TextStyles.underline,
  'list-bullet': NotesType.TextStyles.bullet,
  'number-list': NotesType.TextStyles.number,
  'note-link': 'note-link',
}

const showLinkBox = () => {
  action.ui.setNotesLinkBoxVisible.execute({ visible: true })
}
const closeLinkBox = () => {
  action.ui.setNotesLinkBoxVisible.execute({ visible: false })
}
const onNotesLinkButtonClick = () => {
  if (!isShowLinkBox.value) {
    showLinkBox()
  } else {
    closeLinkBox()
  }
}
const onInputBlur = () => {
  if (isShowLinkBox.value) {
    closeLinkBox()
  }
}

watch(isShowLinkBox, isShow => {
  if (editor.value && isShow) {
    editor.value.autoFitLinkSelectedRange()
    editor.value.setSelectionStyle(NotesType.TextStyles.frozen, null, { isCanUndo: false })
    const defaultLink = editor.value.getSingleWholeLink()
    link.value = defaultLink ? defaultLink : ''
    linkInputBox.value?.focus()
  } else if (editor.value) {
    editor.value.removeSelectionStyle(NotesType.TextStyles.frozen, { isCanUndo: false })
    editor.value.focus()
  }
})

const setLink = () => {
  if (!editor.value) return
  editor.value.setLink(link.value)
  link.value = ''
}
const onContainerMaskClick = () => {
  if (!editor.value) return
  editor.value.focus()
}
const onInputKeyDown = (e: KeyboardEvent) => {
  if (isComposition.value) return
  if (['Tab', 'Enter'].includes(e.key)) e.preventDefault()
  if (e.key === 'Enter') setLink()
}
const onMouseDown = (e: MouseEvent) => {
  if (!editor.value) return
  if (e.target === linkInputBox.value) {
    linkInputBox.value.focus()
    return
  }
  if (!editor.value.container.contains(e.target as Node) || e.target === editor.value.container) {
    e.preventDefault()
    e.stopPropagation()
  }
}

const workbook = computed(() => props.workbookId && WorkbookManager.find(props.workbookId))
const selectionIds = computed(() => (workbook.value instanceof Workbook && workbook.value.selectionIds) ?? [])
const isNotesPopoverOpened = computed(() => props.isOpened)

const filterBase64Image = (html: string) => {
  return html.replace(/<figure.*?data:image.*?;base64,[A-Za-z0-9+/]+={0,2}.*?<\/figure>/g, '')
}

const refreshNotes = () => {
  if (!workbook.value) return
  const notes = workbook.value.workbookEditor.syncedProperties.value.notes?.value
  if (editor.value && notes) {
    editor.value.setNoteData({
      plain: { content: notes.text ?? '' },
      realHTML: { content: filterBase64Image(notes.html) ?? '' },
    })
  }
}
const changeNotes = () => {
  if (!editor.value || !workbook.value) return
  if (editor.value.htmlLength) {
    const noteContent = editor.value.getNoteData()
    if (!noteContent) return
    const htmlContent = noteContent?.realHTML?.content ?? ''
    const textContent = noteContent?.plain?.content ?? ''
    if (getStringSizeUtf8(htmlContent) > MAX_NOTE_SIZE_LIMIT || getStringSizeUtf8(textContent) > MAX_NOTE_SIZE_LIMIT) {
      action.ui.toasts.noteContentExceedsLimit()
      return
    }
    workbook.value.workbookEditor.executeAction({
      name: 'mutateTarget:notes',
      payload: {
        topicIds: selectionIds.value,
        notes: {
          html: noteContent?.realHTML.content,
          text: noteContent?.plain.content,
        },
      },
    })
  } else {
    workbook.value.workbookEditor.executeAction({
      name: 'mutateTarget:notes',
      payload: {
        topicIds: selectionIds.value,
        notes: '',
      },
    })
  }
}
const refreshButtonState = () => {
  if (!editor.value || !workbook.value) return
  selectionStyles.value = editor.value.getSelectionStyles() || []
}
const handleVisibleChange = (isNotesPopoverVisible: boolean) => {
  emit('visibility-change', isNotesPopoverVisible)
  if (!editor.value) return
  if (isNotesPopoverVisible) {
    refreshNotes()
  } else {
    changeNotes()
  }
}
const handleFormatText = (format: any) => {
  if (!editor.value) return
  if (format === 'note-link') {
    onNotesLinkButtonClick()
    return
  }
  const textStyle = formatStylesMap[format]
  if (textStyle) {
    editor.value.toggleSelectionStyle(textStyle)
    refreshButtonState()
  }
}
const handleSelectionChanged = () => refreshButtonState()

const handleClosePage = () => {
  if (isPhoneSizeViewportWidth.value && editor.value) {
    changeNotes()
  }
  emit('visibility-change', false)
}

const handleChangeNotes = () => {
  if (!workbook.value) return
  if (isPhoneSizeViewportWidth.value) {
    changeNotes()
  }
  handleClosePage()
}

const container = ref<HTMLElement>()
const isContainerFocused = ref(false)

const onFocus = () => (isContainerFocused.value = true)
const onBlur = () => (isContainerFocused.value = false)
const onLinkActivated = (e: any) => {
  window.open(e.detail.href)
}

onMounted(async () => {
  isMounted.value = true
  await new Promise(resolve => requestAnimationFrame(() => resolve(true)))
  if (container.value) {
    await initializeEditor()
  }
})

const initializeEditor = async () => {
  editor.value = new NotesEditor({ container: container.value })
  useFrameStore().setNotesEditor(editor.value)
  refreshNotes()

  container.value.addEventListener('focus', onFocus)
  container.value.addEventListener('blur', onBlur)
  container.value.addEventListener('link-activated', onLinkActivated)
  if (!isPhoneSizeViewportWidth.value) {
    await new Promise(resolve => setTimeout(resolve, 100))
    editor.value.focus()
  }
}

onBeforeUnmount(() => {
  if (isPhoneSizeViewportWidth.value && editor.value) {
    changeNotes()
  }
  useFrameStore().setNotesEditor(null)
  container.value?.removeEventListener('focus', onFocus)
  container.value?.removeEventListener('blur', onBlur)
  container.value?.removeEventListener('link-activated', onLinkActivated)
})
</script>

<style lang="less">
// Warning no scoped less styles here due to [uk-icon] UIkit component
.note-editor .uk-button-tile fw-button-icon > span > * {
  height: 16px;
  width: 16px;
}

.notes-editor-frozen {
  background-color: #90c9f9 !important;
  color: #27292a;
  text-shadow: none;
}

.note-editor {
  a {
    color: #3665bb;
    text-decoration: underline;
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: #4b83ca;
      text-decoration: underline;
    }

    &:active {
      color: #024f9c;
    }
  }
}

.container-mask {
  position: absolute;
  width: 100%;
  height: 218px;
  background: transparent;
}

.trix-notes-editor-container {
  ul,
  ol {
    padding-left: 30px;
  }
}
</style>
