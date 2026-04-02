<template>
  <modal-dialog
    ref="dialogRef"
    :width="590"
    :is-opened="true"
    @modal-dialog-close="handleClose"
    :title="$T('Project Working Days')"
    :dialog-body-class="clsx('!px-6 !pt-3')"
    :buttons="bottomButtons"
    :dialog-footer-class="clsx('!pt-0')"
  >
    <div class="text-desktop-body-large text-text-primary-light dark:text-text-primary-dark">
      {{ $T('Only applies to the current project, independent of other project settings.') }}
    </div>
    <div class="flex gap-3 pt-3">
      <div
        class="border-border-muted-light bg-fill-surface-light dark:border-border-muted-dark dark:bg-fill-surface-dark flex flex-col rounded border"
      >
        <div class="p-4">
          <div class="mb-3 flex items-center justify-between">
            <div class="text-desktop-body-large text-text-primary-light dark:text-text-primary-dark font-medium">{{ $T('Import Calendar') }}</div>
            <fw-button v-if="canManageCalendar" theme="link" :size="'small'" @click="handleManageCalendar">
              {{ $T('Manage') }}
            </fw-button>
          </div>
          <fw-select :trigger-size="'small'" :options="calendarOptions" :selected-key="selectedCalendarId" @select="setActiveCalendarId" />
        </div>
        <fw-divider />
        <CalendarDatePicker :is-working-day="isWorkingDay" :inline="true" :locale="locale" :dark="isDark" :readonly="true" />
      </div>
      <div
        class="border-border-muted-light bg-fill-surface-light dark:border-border-muted-dark dark:bg-fill-surface-dark w-[300px] rounded border p-4"
      >
        <div class="mb-4">
          <div class="text-desktop-body-large text-text-primary-light dark:text-text-primary-dark mb-2 font-medium">{{ $T('Working Days') }}</div>
          <CalendarWorkingDayPicker
            class="working-day-picker"
            :value="localWorkingDays"
            :locale="locale"
            :dark="isDark"
            @change="handleChangeWorkingDays"
          />
        </div>
        <hr class="border-border-muted-light dark:border-border-muted-dark my-4 border-0 border-t" />
        <div>
          <div class="mb-2 flex items-center justify-between">
            <span class="text-desktop-subhead-mini text-text-primary-light dark:text-text-primary-dark">
              {{ $T('Exceptions') }}
            </span>
            <fw-tile-button size="small" class="h-5 w-5 p-[2px]" @click="handleAddException">
              <fw-icon name="add" :width="16" :height="16" />
            </fw-tile-button>
          </div>
          <calendar-exception-list
            :class="exceptionListClasses"
            :value="localExceptions"
            :locale="locale"
            :l10n="$T"
            :dark="isDark"
            @delete="handleDeleteException"
            @dblclick="handleDblClickException"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between pt-4">
        <div class="flex gap-2">
          <fw-button v-for="button in leftButtons" :key="button.text" :theme="button.type" :size="'small'" @click="button.onClick">
            {{ button.text }}
          </fw-button>
        </div>
        <div class="flex gap-2">
          <fw-button v-for="button in rightButtons" :key="button.text" :theme="button.type" :size="'small'" @click="button.onClick">
            {{ button.text }}
          </fw-button>
        </div>
      </div>
    </template>
  </modal-dialog>
</template>

<script setup lang="ts">
import type { WorkingDayRule, SupportedLocale, WorkingDaySettings, TaskGraph } from '@xmindltd/gantt'
import { CalendarDatePicker, CalendarExceptionList, CalendarWorkingDayPicker, TaskGraph as TaskGraphClass } from '@xmindltd/gantt'
import '@xmindltd/gantt/calendar.css'
import { ref, computed, reactive, onMounted } from 'vue'
import { usePromiseHook } from 'utils/vue-utils'
import { useAppStore } from 'client/store/app-store'
import { $T } from 'client/library/translation'
import ModalDialog, { type ModalDialogBottomButton } from 'client/components/new-base-modal-dialog.vue'
import { useTeamSpaceStore } from 'app/services/pinia/team-space-store'
import { generateUniqueIncrementedName } from 'utils/generator'
import { getCurrentGanttLocale } from 'client/library/translation-helper'
import { useCollaborativeStore } from 'app/services/pinia/collaborative-store'
import { useTeamSpaceData } from 'app/composables/team-space-data'
import { useServiceStore } from 'client/store'
import { rot13 } from 'utils/rot13'
import { clsx } from 'clsx'
import type { SpaceSettingsTab, TeamProfileTab } from 'app/types/common'

interface CalendarDialogProps {
  workingDaySettings?: WorkingDaySettings | null
}

const props = withDefaults(defineProps<CalendarDialogProps>(), {
  workingDaySettings: null,
})

type CalendarDialogResult =
  | { action: 'update'; workingDaySettings: WorkingDaySettings }
  | { action: 'add'; workingDaySettings: WorkingDaySettings }
  | { action: 'delete' }
  | { action: 'save-as-calendar'; workingDaySettings: WorkingDaySettings }
  | { action: 'cancel' }

const { resolve } = usePromiseHook<CalendarDialogResult>()
const dialogRef = ref<InstanceType<typeof ModalDialog>>()

const isEditingWorkingDaySettings = computed(() => !!props.workingDaySettings)
const spaceId = computed(() => useCollaborativeStore().sharingMetadata?.spaceId || null)
const space = computed(() => useTeamSpaceStore().joinedSpaceList?.find(s => s.spaceId === spaceId.value))
const canManageCalendar = computed(() => {
  const sharingMetadata = useCollaborativeStore().sharingMetadata
  const teamId = sharingMetadata?.teamId
  const isTeamManagementRole = useTeamSpaceData().hasTeamManagementPermission(teamId)
  const isSpaceManagementRole = helpers.isManagementRole({ role: space.value?.role })
  return isTeamManagementRole || isSpaceManagementRole
})

const calendarItemsState = ref<WorkingDaySettings[]>([])
const selectedCalendarId = ref<string>(props.workingDaySettings?.id || useCollaborativeStore().sharingMetadata?.spaceId)

const calendarOptions = computed(() => calendarItemsState.value.map(item => ({ key: item.id, label: item.name })))

const calendar = computed(() => calendarItemsState.value.find(cal => cal.id === selectedCalendarId.value))

const localWorkingDays = computed(() => calendar.value?.defaultWorkingDays || [])
const localExceptions = computed(() => (calendar.value?.rules ? [...calendar.value.rules].reverse() : []))

const isDark = computed(() => useAppStore().appearance === 'dark')
const locale = computed<SupportedLocale>(() => getCurrentGanttLocale())

const taskGraph = computed(() => reactive(TaskGraphClass.fromJson([], { workingDaySettings: calendar.value })) as TaskGraph)

const exceptionListClasses = computed(() => {
  const hasMultipleExceptions = localExceptions.value.length > 1
  return ['max-h-[200px]', hasMultipleExceptions ? 'overflow-y-auto' : 'overflow-visible']
})

const isWorkingDay = (date: Date): boolean => {
  return taskGraph.value.isWorkingDay(date.getTime())
}

const setActiveCalendarId = (calendarId: string) => {
  selectedCalendarId.value = calendarId
}

const handleChangeWorkingDays = (workingDaysToChange: number[]) => {
  calendarItemsState.value = calendarItemsState.value.map(item =>
    item.id === selectedCalendarId.value ? { ...item, defaultWorkingDays: workingDaysToChange } : item,
  )
}

const addException = (ruleToAdd: WorkingDayRule) => {
  calendarItemsState.value = calendarItemsState.value.map(item =>
    item.id === selectedCalendarId.value ? { ...item, rules: [...item.rules, ruleToAdd] } : item,
  )
}

const handleAddException = async () => {
  const result = await useServiceStore().services.action.dialog.openExceptionDialog({
    exceptions: localExceptions.value,
    isWorkingDay: isWorkingDay,
    dark: isDark.value,
  })
  if (result?.action === 'confirm' && result.exception) {
    addException(result.exception)
  }
}

const handleDeleteException = (exceptionIdToDelete: string) => {
  calendarItemsState.value = calendarItemsState.value.map(item =>
    item.id === selectedCalendarId.value
      ? {
          ...item,
          rules: item.rules.filter(rule => rule.id !== exceptionIdToDelete),
        }
      : item,
  )
}

const updateException = (exceptionToUpdate: WorkingDayRule) => {
  calendarItemsState.value = calendarItemsState.value.map(item =>
    item.id === selectedCalendarId.value
      ? {
          ...item,
          rules: item.rules.map(rule => (rule.id === exceptionToUpdate.id ? exceptionToUpdate : rule)),
        }
      : item,
  )
}

const openTeamSpaceSettings = async (args: { teamId: string; spaceId: string; initialTab?: SpaceSettingsTab | TeamProfileTab }) => {
  const { teamId, spaceId, initialTab } = args

  const encodedTeamId = rot13(teamId)
  const encodedSpaceId = rot13(spaceId)
  const isMyWorks = teamId === useTeamSpaceData().defaultTeamId.value
  const url = isMyWorks
    ? `${window.location.origin}/home/my-works${initialTab ? `#${initialTab}` : ''}`
    : `${window.location.origin}/home/team/${encodedTeamId}-${encodedSpaceId}${initialTab ? `#${initialTab}` : ''}`

  window.open(url, '_blank')
}

const handleDblClickException = async (exceptionToDblClick: WorkingDayRule) => {
  const result = await useServiceStore().services.action.dialog.openExceptionDialog({
    exceptions: localExceptions.value,
    exceptionId: exceptionToDblClick.id,
    isWorkingDay: isWorkingDay,
    dark: isDark.value,
  })
  if (result?.action === 'confirm' && result.exception) {
    updateException(result.exception)
  }
}

const handleManageCalendar = async () => {
  const sharingMetadata = useCollaborativeStore().sharingMetadata
  const teamId = sharingMetadata?.teamId
  const currentSpaceId = spaceId.value || sharingMetadata?.spaceId

  if (!teamId || !currentSpaceId) {
    return
  }

  openTeamSpaceSettings({ teamId, spaceId: currentSpaceId, initialTab: 'calendar' })
}

const handleDelete = async () => {
  const confirmed = await useServiceStore().services.action.dialog.confirm({
    title: $T('Delete Project Working Days'),
    description: $T('This action cannot be undone. Deleting this will turn off skip non-working days for this project.'),
    confirmButtonText: $T('Delete Anyway'),
    cancelButtonText: $T('Cancel'),
    confirmButtonType: 'danger',
    dismissable: true,
    disableExchangeConfirmButton: true,
    onConfirm: async () => true,
    onCancel: () => false,
  })

  if (confirmed) {
    await dialogRef.value?.closeDialogWithAnimation?.()
    resolve({ action: 'delete' })
  }
}

const handleSaveAsCalendar = async () => {
  const sharingMetadata = useCollaborativeStore().sharingMetadata
  const currentSpaceId = spaceId.value || sharingMetadata?.spaceId
  const teamId = sharingMetadata?.teamId

  if (!currentSpaceId || !teamId) {
    logger.warn('Cannot save calendar: missing spaceId or teamId')
    return
  }

  const calendarNames = calendarItemsState.value.map(cal => cal.name)
  const newName = generateUniqueIncrementedName(calendar.value.name, calendarNames)
  const calendarToCreate = {
    name: newName,
    defaultWorkingDays: calendar.value.defaultWorkingDays,
    rules: calendar.value.rules,
  }

  try {
    const createdCalendar = await useTeamSpaceData().createSpaceCalendar(currentSpaceId, calendarToCreate)
    if (createdCalendar) {
      await dialogRef.value?.closeDialogWithAnimation?.()

      openTeamSpaceSettings({ teamId, spaceId: currentSpaceId, initialTab: 'calendar' })
      resolve({ action: 'cancel' })
    }
  } catch (error) {
    console.error('Failed to create calendar:', error)
  }
}

const leftButtons = computed<ModalDialogBottomButton[]>(() => {
  if (!isEditingWorkingDaySettings.value) return []

  const buttons: ModalDialogBottomButton[] = []

  if (useCollaborativeStore().isCollaborationEditable) {
    buttons.push({
      text: $T('Delete'),
      type: 'danger',
      onClick: handleDelete,
    })
  }

  if (canManageCalendar.value) {
    buttons.push({
      text: $T('Save as a Calendar'),
      type: 'default',
      onClick: handleSaveAsCalendar,
    })
  }

  return buttons
})

const rightButtons = computed<ModalDialogBottomButton[]>(() => [
  {
    text: $T('Cancel'),
    type: 'default',
    onClick: handleClose,
  },
  {
    text: isEditingWorkingDaySettings.value ? $T('Save') : $T('Create'),
    type: 'secondary',
    onClick: confirm,
  },
])

const bottomButtons = computed<ModalDialogBottomButton[]>(() => [...leftButtons.value, ...rightButtons.value])

const handleClose = async () => {
  await dialogRef.value?.closeDialogWithAnimation?.()
  resolve({ action: 'cancel' })
}

const confirm = async () => {
  await dialogRef.value?.closeDialogWithAnimation?.()
  resolve({
    action: isEditingWorkingDaySettings.value ? 'update' : 'add',
    workingDaySettings: JSON.parse(JSON.stringify(calendar.value)),
  })
}

onMounted(async () => {
  if (useCollaborativeStore().sharingMetadata?.spaceId) {
    await useTeamSpaceData().fetchSpaceCalendars(spaceId.value)
    const calendars = useTeamSpaceStore().getSpaceCalendars() || []
    if (props.workingDaySettings) {
      calendarItemsState.value = calendars.map(cal => (cal.id === props.workingDaySettings?.id ? props.workingDaySettings : cal))
    } else {
      calendarItemsState.value = [...calendars]
    }
  }
})

defineExpose({ confirm })
</script>

<style scoped>
:deep(.working-day-picker-item) {
  list-style: none;
}
</style>
