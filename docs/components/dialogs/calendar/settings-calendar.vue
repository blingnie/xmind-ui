<style scoped>
:deep(.working-day-picker-item) {
  list-style: none;
}
:deep(.working-day-picker-item > label) {
  cursor: pointer;
}
:deep(.exception-list-delete-icon) {
  cursor: pointer;
}
:deep(.mobile-mode .exception-list-delete-icon) {
  visibility: visible !important;
}
</style>
<script setup lang="ts">
import { useAppStore } from 'client/store'
import { computed, onMounted, ref } from 'vue'
import type { WorkingDayRule } from '@xmindltd/gantt'
import { CalendarDatePicker, CalendarExceptionList, CalendarWorkingDayPicker } from '@xmindltd/gantt'
import '@xmindltd/gantt/calendar.css'
import { $T } from 'client/library/translation'
import { useWindowResize } from 'client/composables/window-resize'
import { useServiceStore } from 'client/store'
import { getCurrentGanttLocale } from 'client/library/translation-helper'
import { useCalendar } from './use-calendar'
import { useLogger } from 'client/utils/logger'

import FileListItemSkeletonAnimation from 'client/components/skeleton-animation/new-file-list-item-skeleton-animation.vue'

const logger = useLogger('settings-calendar')

const props = defineProps<{
  spaceId: string
}>()

const {
  activeCalendarId,
  workingDays,
  exceptions,
  curCalendar,
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
} = useCalendar(props.spaceId)

const isLoading = ref(true)
const isPopoverOpen = ref(false)
const isRenaming = ref(false)
const renamingValue = ref('')
const { isPhoneSizeViewportWidth } = useWindowResize()

const isDark = computed(() => useAppStore().appearance === 'dark')
const locale = getCurrentGanttLocale()

const calendarMenuItems = computed(() => {
  const items = []
  if (!isDefault.value) {
    items.push([{ label: 'Rename Calendar', action: 'rename' }])
  }
  items.push([
    { label: 'Copy Current Calendar', action: 'copy' },
    { label: 'New Calendar', action: 'new' },
  ])
  if (!isDefault.value) {
    items.push([{ label: 'Delete Calendar', action: 'delete' }])
  }
  return items
})

const action = useServiceStore().services.action
const handleAddException = async () => {
  const result = await action.dialog.openExceptionDialog({
    exceptions: exceptions.value,
    isWorkingDay: isWorkingDay.value,
    dark: isDark.value,
  })
  if (result?.action === 'confirm' && result.exception) {
    addException(result.exception)
  }
}

const handleEditException = async (ex: WorkingDayRule) => {
  const result = await action.dialog.openExceptionDialog({
    exceptions: exceptions.value,
    exceptionId: ex.id,
    isWorkingDay: isWorkingDay.value,
    dark: isDark.value,
  })
  if (result?.action === 'confirm' && result.exception) {
    updateException(result.exception)
  }
}

const handleDeleteException = (exceptionId: string) => {
  deleteException(exceptionId)
}

const handleMenuClick = async (action: string) => {
  isPopoverOpen.value = false

  switch (action) {
    case 'copy':
      await copyCurrentCalendar()
      break
    case 'rename':
      isRenaming.value = true
      renamingValue.value = curCalendar.value?.name
      break
    case 'new':
      await createNewCalendar()
      break
    case 'delete':
      await deleteCurrentCalendar()
      break
  }
}

const handleRenameConfirm = async () => {
  const newName = renamingValue.value.trim()
  if (!newName || newName === curCalendar.value?.name) {
    isRenaming.value = false
    return
  }
  const result = await renameCalendar(newName)
  if (result.success) {
    isRenaming.value = false
  } else {
    logger.error('Rename failed', result.error)
  }
}

const handleRenameCancel = () => {
  isRenaming.value = false
}

const handleFetchCalendars = async () => {
  if (!props.spaceId) return

  await fetchCalendars()
  isLoading.value = false
}

onMounted(async () => {
  await handleFetchCalendars()
})
</script>

<template>
  <div class="flex flex-col gap-3 px-6">
    <div class="rounded-lg bg-fill-container-light p-4 dark:bg-fill-container-dark">
      <template v-if="isLoading">
        <file-list-item-skeleton-animation />
        <file-list-item-skeleton-animation class="mt-2"></file-list-item-skeleton-animation>
        <file-list-item-skeleton-animation class="mt-2"></file-list-item-skeleton-animation>
      </template>

      <template v-else>
        <div class="flex items-center justify-between">
          <fw-input
            v-if="isRenaming"
            v-model="renamingValue"
            :size="isPhoneSizeViewportWidth ? 'medium' : 'small'"
            :maxlength="30"
            :is-auto-focus="true"
            :is-auto-select="true"
            class="h-8 w-[190px] sm:h-6"
            @enter="handleRenameConfirm"
            @blur="handleRenameConfirm"
            @keydown.esc.stop="handleRenameCancel"
          />
          <fw-select
            v-else
            class="w-[190px]"
            :trigger-size="isPhoneSizeViewportWidth ? 'medium' : 'small'"
            :position="'bottom-left'"
            :options="calendarOptions"
            :selected-key="activeCalendarId"
            :menu-custom-class="'w-[200px]'"
            @select="selectActiveCalendar"
          />

          <fw-popover v-model="isPopoverOpen" position="bottom-right" :offset-y="4">
            <template #trigger>
              <fw-tile-button size="small" class="h-5 w-5 p-[2px]">
                <fw-icon name="more" :width="16" :height="16" />
              </fw-tile-button>
            </template>
            <template #content>
              <div class="flex w-[200px] flex-col gap-1 p-2">
                <template v-for="(group, groupIndex) in calendarMenuItems" :key="groupIndex">
                  <fw-menu-button
                    v-for="item in group"
                    :key="item.action"
                    class="h-8 text-mobile-body-medium text-text-primary-light dark:text-text-primary-dark sm:text-desktop-body-medium"
                    @click="handleMenuClick(item.action)"
                  >
                    {{ $T(item.label) }}
                  </fw-menu-button>
                  <fw-divider v-if="groupIndex < calendarMenuItems.length - 1" />
                </template>
              </div>
            </template>
          </fw-popover>
        </div>

        <fw-divider class="-mx-4 my-4 w-[calc(100%+32px)]" />

        <div class="flex flex-col gap-2">
          <span class="text-desktop-subhead-mini text-text-primary-light dark:text-text-primary-dark">{{ $T('Working Days') }}</span>
          <calendar-working-day-picker class="working-day-picker" :value="workingDays" :locale="locale" :dark="isDark" @change="changeWorkingDays" />

          <fw-divider class="my-2" />

          <div class="flex items-center justify-between">
            <span class="text-desktop-subhead-mini text-text-primary-light dark:text-text-primary-dark">
              {{ $T('Exceptions') }}
            </span>
            <fw-tile-button size="small" class="h-5 w-5 p-[2px]" @click="handleAddException">
              <fw-icon name="add" :width="16" :height="16" />
            </fw-tile-button>
          </div>
          <calendar-exception-list
            :class="{ 'mobile-mode': isPhoneSizeViewportWidth }"
            :value="exceptions"
            :locale="locale"
            :l10n="$T"
            :dark="isDark"
            @delete="handleDeleteException"
            @dblclick="handleEditException"
          />
        </div>
      </template>
    </div>

    <div class="rounded-lg bg-fill-container-light dark:bg-fill-container-dark" v-if="!isLoading">
      <calendar-date-picker :responsive="true" :is-working-day="isWorkingDay" :inline="true" :locale="locale" :dark="isDark" :readonly="true" />
    </div>
  </div>
</template>
