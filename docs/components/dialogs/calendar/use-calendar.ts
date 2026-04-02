import type { WorkingDayRule, WorkingDaySettings } from '@xmindltd/gantt'
import { TaskGraph } from '@xmindltd/gantt'
import { useTeamSpaceStore } from 'app/services/pinia'
import { useTeamSpaceData } from 'app/composables/team-space-data'
import { computed, type ComputedRef } from 'vue'
import { debounce } from 'utils/misc'
import { useLogger } from 'client/utils/logger'
import { generateUniqueIncrementedName } from 'utils/generator'
import { useServiceStore } from 'client/store'
import { BASIC_CALENDAR } from 'client/constants'
import { $T } from 'client/library/translation'

const logger = useLogger('use-calendar')

export const useCalendar = (spaceId: string) => {
  const calendars = computed(() => useTeamSpaceStore().getSpaceCalendars())
  const activeCalendarId = computed(() => useTeamSpaceStore().getSpaceActiveCalendarId())

  const curCalendar = computed(() => calendars.value.find(c => c.id === activeCalendarId.value))
  const workingDays = computed(() => curCalendar.value?.defaultWorkingDays)
  const exceptions = computed(() => curCalendar.value?.rules ?? [])
  const isDefault = computed(() => activeCalendarId.value === spaceId)

  const calendarOptions = computed(() =>
    calendars.value.map(item => ({
      key: item.id,
      label: item.id === spaceId ? $T('Basic Calendar') : item.name || item.id,
    })),
  )

  const doUpdate = async (calendar: WorkingDaySettings) => {
    try {
      await useTeamSpaceData().updateSpaceCalendar(spaceId, calendar)
    } catch (err) {
      logger.error('saveCalendar failed', err)
    }
  }
  const debouncedUpdate = debounce(doUpdate, 900)
  const updateCalendar = (updates: Partial<WorkingDaySettings>, isDebounce = false) => {
    useTeamSpaceStore().updateSpaceCalendar(activeCalendarId.value, updates)
    const calendar = { ...curCalendar.value, ...updates } as WorkingDaySettings
    return isDebounce ? debouncedUpdate(calendar) : doUpdate(calendar)
  }

  const changeWorkingDays = (value: number[]) => {
    updateCalendar({ defaultWorkingDays: value })
  }

  const selectActiveCalendar = async (calendarId: string) => {
    try {
      await useTeamSpaceData().setActiveSpaceCalendar(spaceId, calendarId)
    } catch (err) {
      logger.error('selectActiveCalendar failed', err)
    }
  }

  const addException = (exception: WorkingDayRule) => {
    const currentRules = exceptions.value
    updateCalendar({ rules: [exception, ...currentRules] })
  }

  const updateException = (exception: WorkingDayRule) => {
    const currentRules = exceptions.value
    const index = currentRules.findIndex(e => e.id === exception.id)
    if (index === -1) return
    updateCalendar({
      rules: [...currentRules.slice(0, index), exception, ...currentRules.slice(index + 1)],
    })
  }

  const deleteException = (exceptionId: string) => {
    const currentRules = exceptions.value
    updateCalendar({
      rules: currentRules.filter(e => e.id !== exceptionId),
    })
  }

  const copyCurrentCalendar = async () => {
    const calendarNames = calendars.value.map(c => (c.id === spaceId ? $T('Basic Calendar') : c.name))
    const baseName = curCalendar.value.id === spaceId ? $T('Basic Calendar') : curCalendar.value.name
    const newName = generateUniqueIncrementedName(baseName, calendarNames)

    const newCalendar = {
      name: newName,
      defaultWorkingDays: [...curCalendar.value.defaultWorkingDays],
      rules: curCalendar.value.rules.map(rule => ({ ...rule })),
      effectiveRange: curCalendar.value.effectiveRange,
    }

    try {
      await useTeamSpaceData().createSpaceCalendar(spaceId, newCalendar)
    } catch (err) {
      logger.error('copyCurrentCalendar failed', err)
    }
  }

  const createNewCalendar = async () => {
    const action = useServiceStore().services.action
    const calendarNames = calendars.value.map(c => c.name)
    const defaultName = generateUniqueIncrementedName($T('Basic Calendar'), calendarNames)

    const result = await action.dialog.openCreateCalendarDialog({ defaultName })

    if (result?.action === 'confirm' && result.name) {
      const newCalendar = {
        name: result.name,
        ...BASIC_CALENDAR,
      }

      try {
        await useTeamSpaceData().createSpaceCalendar(spaceId, newCalendar)
      } catch (err) {
        logger.error('createNewCalendar failed', err)
      }
    }
  }

  const deleteCurrentCalendar = async () => {
    const action = useServiceStore().services.action

    const confirmed = await action.dialog.confirm({
      title: $T('Delete Calendar'),
      description: $T("This action cannot be undone. Deleting the calendar will not affect the project's working days."),
      confirmButtonText: $T('Delete Anyway'),
      cancelButtonText: $T('Cancel'),
      confirmButtonType: 'danger',
      dismissable: true,
      disableExchangeConfirmButton: true,
      onConfirm: async () => {
        try {
          const success = await useTeamSpaceData().deleteSpaceCalendar(spaceId, activeCalendarId.value)
          return success
        } catch (err) {
          logger.error('deleteCurrentCalendar failed', err)
          return false
        }
      },
      onCancel: () => true,
    })

    return confirmed
  }

  const renameCalendar = async (newName: string) => {
    const trimmedName = newName.trim()
    if (!trimmedName || trimmedName.length > 30) {
      logger.error('renameCalendar failed: invalid name', { name: trimmedName })
      return { success: false, error: 'Invalid name' }
    }
    const oldName = curCalendar.value.name
    useTeamSpaceStore().updateSpaceCalendar(activeCalendarId.value, { name: trimmedName })
    try {
      const updatedCalendar = { ...curCalendar.value, name: trimmedName } as WorkingDaySettings
      await doUpdate(updatedCalendar)
      logger.log('renameCalendar success', { oldName, newName: trimmedName })
      return { success: true }
    } catch (err) {
      useTeamSpaceStore().updateSpaceCalendar(activeCalendarId.value, { name: oldName })
      logger.error('renameCalendar failed', err)
      return { success: false, error: err }
    }
  }

  const isWorkingDay: ComputedRef<(date: Date) => boolean> = computed(() => {
    const calendar = curCalendar.value
    if (!calendar) return () => true

    const tempGraph = new TaskGraph(calendar)
    return (date: Date) => tempGraph.isWorkingDay(date.getTime())
  })

  const fetchCalendars = async () => {
    await useTeamSpaceData().fetchSpaceCalendars(spaceId)
  }

  return {
    calendars,
    activeCalendarId,
    curCalendar,
    workingDays,
    exceptions,
    isDefault,
    calendarOptions,
    isWorkingDay,
    changeWorkingDays,
    selectActiveCalendar,
    addException,
    updateException,
    deleteException,
    copyCurrentCalendar,
    createNewCalendar,
    deleteCurrentCalendar,
    renameCalendar,
    fetchCalendars,
  }
}
