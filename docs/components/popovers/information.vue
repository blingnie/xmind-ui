<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import AppBaseTopicLocatorPopover from './base-topic-locator.vue'
import { WorkbookManager } from 'client/library/workbook-next/workbook-manager'
import { useMindMap } from 'compositions/mindmap'
import { extractExtFromPath } from 'utils/path-ext'
import { $T } from 'client/library/translation'
import { formatDate } from 'client/components/dialogs/team-profile/utils'
import { usePlannedTask } from 'app/composables/planned-task/use-planned-task'

// Define props
interface Props {
  isOpened: boolean
  workbookId?: string
  isReadonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  workbookId: '',
  isReadonly: false,
})

const emit = defineEmits<{
  (e: 'close-popover'): void
  (e: 'visibility-change', value: boolean): void
  (e: 'open-href', data: { href: string; sourceTopicId?: string; attachmentFilename?: string }): void
  (e: 'show-note-popover', value: boolean): void
  (e: 'show-hyperlink-popover', data: { href: string }): void
  (e: 'open-audio-player', topicId: string): void
  (e: 'open-planned-task', topicId: string): void
  (e: 'context-menu', data: { event: MouseEvent; type: 'note' | 'hyperlink' }): void
}>()

const { selection } = useMindMap()
const workbook = computed(() => props.workbookId && WorkbookManager.find(props.workbookId))
const selectionIds = computed(() => selection.value?.modelIds ?? [])
const isInformationPopoverOpened = computed(() => props.isOpened)
const popoverHeight = ref<number>(0)
const { removeTask } = usePlannedTask()

const current = ref<{
  note: string
  hyperlink: string
  comments: string
  audioNote: string
  taskInfo: {
    taskContent: string
    assignedContent: string
  } | null
  topicLink: string
  attachment: string
}>({
  note: '',
  hyperlink: '',
  comments: '',
  audioNote: '',
  taskInfo: {
    taskContent: '',
    assignedContent: '',
  },
  topicLink: '',
  attachment: '',
})

const refreshModel = () => {
  if (!isInformationPopoverOpened.value || !selectionIds.value.length || !workbook.value || !workbook.value) {
    return
  }

  // Reset
  current.value = {
    note: null,
    hyperlink: '',
    comments: '',
    audioNote: '',
    taskInfo: null,
    topicLink: '',
    attachment: '',
  }

  // Refresh
  const selectionId = selectionIds.value[0]
  const properties = workbook.value?.workbookEditor.properties.value
  const document = workbook.value.document

  current.value.note = properties.notes?.value?.text

  const audioNote = properties.audioNotes?.value?.title
  if (audioNote) {
    current.value.audioNote = audioNote
  }

  const topicQuery = document.value.query({ id: selectionId }).asTopic()

  const { href, title: topicTitle } = topicQuery

  if (href) {
    if (href.startsWith('xmind:#')) {
      const targetTopicId = href.replace('xmind:#', '')
      const targetTopic = document.value.query({ id: targetTopicId })?.asTopic()
      if (targetTopic) {
        const topicTitle = targetTopic.title
        const sheetTitle = targetTopic.ownerSheet?.title
        current.value.topicLink = `${topicTitle}(${sheetTitle})`
      }
    } else if (href.startsWith('xap:')) {
      current.value.attachment = topicTitle || href.split('/').pop() || 'attachment'
    } else if (href.startsWith('file:') || href.startsWith('http:') || href.startsWith('https:')) {
      current.value.hyperlink = href
    } else {
      logger.warn('unknown url schema', href)
      current.value.hyperlink = href
    }
  }

  const { task } = properties
  if (task.value) {
    // P1 | 99% | 2025/01/31 - 2025/03/31
    // Assigned: B, C, D
    if (!task.value.taskPresentation) return []
    // no need to show task info in popover when task is displayed as block
    if (workbook?.value?.workbookEditor?.activeSheet.value?.topicTasksDisplay === 'block') {
      current.value.taskInfo = null
      return
    }

    const priority = task.value.taskPriority
    const progress = task.value.taskProgress
    const assigned = task.value.taskAssignees
    const priorityMap = { 0: 'P0', 1: 'P1', 2: 'P2', 3: 'P3', 4: 'P4', 5: 'P5', 6: 'P6', 7: 'P7', 8: 'P8', 9: 'P9' }
    const priorityLabel = priorityMap[priority]
    const progressLabel = `${(progress || 0) * 100}`

    const startDate = task.value.taskStartDate
    const formatStartDate = startDate ? formatDate(startDate) : ''
    const dueDate = task.value.taskDueDate
    const formatDueDate = dueDate ? formatDate(dueDate) : ''
    const durationLabel = formatStartDate && formatDueDate ? `${formatStartDate}-${formatDueDate}` : ''

    const assignedLabel = assigned ? assigned.map(name => name).join(', ') : ''
    // current.value.taskInfo = [current.value.taskContent, current.value.assignedContent].filter(Boolean).join(' | ')
    current.value.taskInfo = {
      taskContent: [priorityLabel, progressLabel, durationLabel].filter(Boolean).join(' | '),
      assignedContent: assignedLabel ? `${$T('Assigned')}: ${assignedLabel}` : '',
    }
  }

  handleClosePopoverIfNeeded()
}

const refreshPopoverHeight = async () => {
  const popoverPadding = 8
  const basePopoverItemHeight = 40
  const currentVisibleItems = Object.values(current.value).filter(item => Boolean(item)).length
  popoverHeight.value = popoverPadding * 2 + basePopoverItemHeight * currentVisibleItems
  if (current.value.taskInfo.assignedContent && current.value.taskInfo) {
    popoverHeight.value += 10
  }
}

const handleVisibleChange = (newValue: boolean) => {
  emit('visibility-change', Boolean(newValue))
  refreshPopoverHeight()
}

const handleClosePopoverIfNeeded = () => {
  const shouldClosePopover = !Object.values(current.value).some(value => Boolean(value))
  if (shouldClosePopover) {
    emit('close-popover')
  }
}

const handleOpenHref = () => {
  if (!workbook.value) return
  const selectionId = selectionIds.value[0]
  const document = workbook.value.document
  const topicQuery = document.value.query({ id: selectionId }).asTopic()
  const { href, id: topicId } = topicQuery
  if (href) {
    emit('open-href', { href, sourceTopicId: topicId })
  }
}

// Note
const handleOpenNotePopover = async () => {
  emit('show-note-popover', true)
}

const handleDeleteNotes = async () => {
  if (!selectionIds.value.length || !workbook.value) {
    return
  }
  workbook.value.workbookEditor.executeAction({
    name: 'mutateTarget:notes',
    payload: {
      topicIds: selectionIds.value,
      notes: '',
    },
  })
  current.value.note = ''
  handleClosePopoverIfNeeded()
}

// Hyperlink
const handleOpenHyperlinkPopover = () => emit('show-hyperlink-popover', { href: current.value.hyperlink })
const handleOpenHyperlink = () => handleOpenHref()

const handleDeleteHyperlink = () => {
  if (!workbook.value) return
  workbook.value.workbookEditor.executePropertyAction({
    name: 'mutateProperty:webLink',
  })
  current.value.hyperlink = ''
  handleClosePopoverIfNeeded()
}

// Topic Link
const handleClickTopicLink = () => handleOpenHref()

const handleDeleteTopicLink = () => {
  if (!workbook.value) return
  workbook.value.workbookEditor.executePropertyAction({
    name: 'mutateProperty:topicLink',
  })
  current.value.topicLink = ''
  handleClosePopoverIfNeeded()
}

// Attachment
const handleOpenAttachment = () => {
  if (!workbook.value) return
  const attachFile = workbook.value.workbookEditor.properties.value?.attachmentFile.value
  if (attachFile) {
    const { fileName: attachmentFilename, resourcePath } = attachFile
    const href = `xap:${resourcePath}`
    const baseFilename = attachmentFilename.split('.').shift() || 'attachment'
    const ext = extractExtFromPath(resourcePath)
    const name = ext ? `${baseFilename}${ext}` : baseFilename
    emit('open-href', { attachmentFilename: name, href })
  }
}

const handleDeleteAttachment = () => {
  if (!workbook.value) return
  workbook.value.workbookEditor.executeMutationAction({
    name: 'mutate:removeAttachment',
  })
  current.value.attachment = ''
  handleClosePopoverIfNeeded()
}

// Audio
const handleOpenAudioNoteBar = () => emit('open-audio-player', selectionIds.value[0])

const handleDeleteAudioNote = () => {
  if (!workbook.value) return
  workbook.value.workbookEditor.executeMutationAction({
    name: 'mutate:removeAudioNotes',
  })
  current.value.audioNote = ''
  handleClosePopoverIfNeeded()
}

// Planned Task
const handleOpenPlannedTask = () => emit('open-planned-task', selectionIds.value[0])

const handleDeletePlannedTask = () => {
  if (!workbook.value) return
  removeTask()
  current.value.taskInfo = null
  handleClosePopoverIfNeeded()
}

const handleContextMenu = (event: MouseEvent, type: 'note' | 'hyperlink') => {
  event.preventDefault()
  event.stopPropagation()
  emit('context-menu', { event, type })
}

watch(
  () => isInformationPopoverOpened.value,
  async isOpened => {
    if (!isOpened) return
    refreshModel()
  },
  { immediate: true },
)

watch(
  () => current.value,
  () => refreshPopoverHeight(),
  { immediate: true },
)

watch(
  () => workbook.value?.workbookEditor?.properties?.value,
  () => {
    if (isInformationPopoverOpened.value) {
      refreshModel()
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="information-more">
    <app-base-topic-locator-popover
      :workbook-id="workbookId"
      :value="isInformationPopoverOpened"
      :width="306"
      :height="popoverHeight"
      @input="handleVisibleChange"
    >
      <div class="flex flex-col p-2">
        <!-- Note -->
        <button
          v-if="current.note"
          class="information-more-item uk-button uk-button-tile uk-button-icon uk-padding-small flex flex-row"
          @click="handleOpenNotePopover"
          @contextmenu="event => handleContextMenu(event, 'note')"
        >
          <div class="flex shrink-0 self-center">
            <fw-icon :name="'note'" />
          </div>
          <span class="information-more-item__title uk-margin-small-left uk-text-left uk-overflow-hidden uk-width-1-1">
            {{ current.note }}
          </span>
          <span
            v-if="!isReadonly"
            class="information-more-item__delete-button uk-margin-small-left uk-button-tile fw-button-icon-xsmall no-shrink"
            uk-icon="icon: trash"
            @click.stop="handleDeleteNotes"
          ></span>
        </button>

        <!-- Hyperlink -->
        <button
          v-if="current.hyperlink"
          class="information-more-item uk-button uk-button-tile uk-button-icon uk-padding-small flex flex-row"
          @click="handleOpenHyperlinkPopover()"
          @contextmenu="event => handleContextMenu(event, 'hyperlink')"
        >
          <div class="flex h-[24px] w-[24px] shrink-0 self-center">
            <fw-icon :name="'note-link'" />
          </div>
          <span
            class="information-more-item__title uk-margin-small-left uk-text-left uk-overflow-hidden uk-width-1-1"
            @click.stop="handleOpenHyperlink()"
          >
            {{ current.hyperlink }}
          </span>
          <span
            v-if="!isReadonly"
            class="information-more-item__delete-button uk-margin-small-left uk-button-tile fw-button-icon-xsmall no-shrink"
            uk-icon="icon: trash"
            @click.stop="handleDeleteHyperlink()"
          ></span>
        </button>

        <!-- Topic Link -->
        <button
          v-if="current.topicLink"
          class="information-more-item uk-button uk-button-tile uk-button-icon uk-padding-small flex flex-row"
          @click="handleClickTopicLink()"
        >
          <div class="flex h-[24px] w-[24px] shrink-0 self-center">
            <fw-icon :name="'note-link'" />
          </div>
          <span class="information-more-item__title uk-margin-small-left uk-text-left uk-overflow-hidden uk-width-1-1">
            {{ current.topicLink }}
          </span>
          <span
            v-if="!isReadonly"
            class="information-more-item__delete-button uk-margin-small-left uk-button-tile fw-button-icon-xsmall no-shrink"
            uk-icon="icon: trash"
            @click.stop="handleDeleteTopicLink()"
          ></span>
        </button>

        <!-- Attachment -->
        <button
          v-if="current.attachment"
          class="information-more-item uk-button uk-button-tile fw-button-icon-xsmall uk-button-icon uk-padding-small flex flex-row"
          @click="handleOpenAttachment()"
        >
          <img
            draggable="false"
            uk-svg
            :data-src="$toResourceURL('/assets/static/images/information-icon/info_attachment.svg')"
            class="information-more-item__icon uk-margin-small-left uk-preserve uk-background-norepeat no-shrink"
          />
          <span class="information-more-item__title uk-margin-small-left uk-text-left uk-overflow-hidden uk-width-1-1" :title="current.attachment">
            {{ current.attachment }}
          </span>
          <span
            v-if="!isReadonly"
            class="information-more-item__delete-button uk-margin-small-left uk-button-tile fw-button-icon-xsmall no-shrink"
            uk-icon="icon: trash"
            @click.stop="handleDeleteAttachment()"
          ></span>
        </button>

        <!-- Audio -->
        <button
          v-if="current.audioNote"
          class="information-more-item uk-button uk-button-tile uk-button-icon uk-padding-small flex flex-row"
          @click="handleOpenAudioNoteBar"
        >
          <div class="flex h-[24px] w-[24px] shrink-0 self-center">
            <fw-icon :name="'audio-note'" />
          </div>
          <span class="information-more-item__title uk-margin-small-left uk-text-left uk-overflow-hidden uk-width-1-1" :title="current.audioNote">
            {{ current.audioNote }}
          </span>
          <span
            v-if="!isReadonly"
            class="information-more-item__delete-button uk-margin-small-left uk-button-tile fw-button-icon-xsmall no-shrink"
            uk-icon="icon: trash"
            @click.stop="handleDeleteAudioNote()"
          ></span>
        </button>

        <!-- Planned Task -->
        <button
          v-if="current.taskInfo"
          class="information-more-item uk-button uk-button-tile uk-button-icon uk-padding-small flex flex-row"
          @click="handleOpenPlannedTask"
        >
          <div class="flex h-[24px] w-[24px] shrink-0 self-center">
            <fw-icon :name="'planned'" />
          </div>
          <div class="uk-margin-small-left uk-text-left flex min-w-0 flex-1">
            <div class="flex w-full flex-col justify-center">
              <span class="overflow-hidden text-ellipsis whitespace-nowrap text-desktop-body-medium" :title="current.taskInfo.taskContent">
                {{ current.taskInfo.taskContent }}
              </span>
              <span
                v-if="current.taskInfo.assignedContent"
                class="overflow-hidden text-ellipsis whitespace-nowrap text-desktop-body-medium"
                :title="current.taskInfo.assignedContent"
              >
                {{ current.taskInfo.assignedContent }}
              </span>
            </div>
          </div>
          <span
            v-if="!isReadonly"
            class="information-more-item__delete-button uk-margin-small-left uk-button-tile fw-button-icon-xsmall no-shrink"
            uk-icon="icon: trash"
            @click.stop="handleDeletePlannedTask"
          ></span>
        </button>
      </div>
    </app-base-topic-locator-popover>
  </div>
</template>

<style lang="less" scoped>
@lineHeight: 24px;
.information-more-item {
  line-height: @lineHeight;
}
.information-more-item .information-more-item__icon {
  width: 14px;
  height: 14px;
}
.information-more-item .information-more-item__title {
  font-size: 14px;
  line-height: @lineHeight;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
}
.information-more-item .information-more-item__delete-button {
  line-height: @lineHeight;
  visibility: hidden;
  opacity: 0;
  transition: 0.2s ease opacity;
}
.information-more-item:hover .information-more-item__delete-button {
  visibility: visible;
  min-width: 26px;
  opacity: 1;
}
</style>
