import type { SupportedFrequency, WorkingDayRule } from '@xmindltd/gantt'
import { v4 as uuid } from 'uuid'
import { computed, nextTick, reactive, watch, type Ref } from 'vue'
import { $T } from 'client/library/translation'
import { generateUniqueIncrementedName } from 'utils/generator'

export type Exception = WorkingDayRule & { frequency: SupportedFrequency }

export interface ExceptionForm {
  name: string
  start: Date | null
  end: Date | null
  selectedDate: Date | null
  type: WorkingDayRule['type'] | null
  frequency: SupportedFrequency
}

export interface UseExceptionOptions {
  exceptions: Ref<Exception[]>
  exceptionId: Ref<string | undefined>
  isWorkingDay: (date: Date) => boolean
}

export function useException(options: UseExceptionOptions) {
  const { exceptions, exceptionId, isWorkingDay } = options

  const exception = computed(() => {
    return exceptions.value.find(e => e.id === exceptionId.value)
  })

  const exceptionNames = computed(() => {
    return exceptions.value.map(e => e.name)
  })

  const defaultExceptionName = computed(() => {
    return generateUniqueIncrementedName($T('Exception'), exceptionNames.value)
  })

  const initFormData = (ex?: WorkingDayRule | null): ExceptionForm => {
    const selectedDate = ex?.selectedDates?.[0] ? new Date(ex.selectedDates[0]) : new Date()
    const type = ex?.type ? ex?.type : isWorkingDay(selectedDate) ? 'WORKING_DAY' : 'NON_WORKING_DAY'

    return {
      name: ex?.name || '',
      start: ex?.effectiveRange?.start ? new Date(ex.effectiveRange.start) : new Date(),
      end: ex?.effectiveRange?.end ? new Date(ex.effectiveRange.end) : new Date(),
      selectedDate,
      type,
      frequency: (ex?.frequency as SupportedFrequency) || 'NONE',
    }
  }

  const form = reactive<ExceptionForm>(initFormData(exception.value))

  watch(
    () => exceptionId.value,
    () => {
      const data = initFormData(exception.value)
      Object.assign(form, data)
    },
  )

  const adjustDateIfOutOfRange = () => {
    if (form.selectedDate && form.start && form.end) {
      const startTime = form.start.getTime()
      const endTime = form.end.getTime()
      const dateTime = form.selectedDate.getTime()

      if (dateTime < startTime || dateTime > endTime) {
        nextTick(() => {
          form.selectedDate = new Date(form.start!)
        })
      }
    }
  }

  const changeStart = (date: Date | null) => {
    form.start = date
    if (date && form.end && date.getTime() > form.end.getTime()) {
      form.end = new Date(date)
    }
    adjustDateIfOutOfRange()
  }

  const changeEnd = (date: Date | null) => {
    form.end = date
    adjustDateIfOutOfRange()
  }

  const changeDate = (date: Date | null) => {
    form.selectedDate = date
    if (date) {
      form.type = isWorkingDay(date) ? 'WORKING_DAY' : 'NON_WORKING_DAY'
    }
    adjustDateIfOutOfRange()
  }

  const changeType = (type: WorkingDayRule['type']) => {
    form.type = type
  }

  const changeFrequency = (frequency: SupportedFrequency) => {
    form.frequency = frequency
  }

  const toDateString = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const buildException = (): Exception => {
    return {
      id: exception.value?.id ?? uuid(),
      name: form.name || defaultExceptionName.value,
      type: form.type,
      frequency: form.frequency,
      selectedDates: [toDateString(form.selectedDate!)],
      effectiveRange: {
        start: toDateString(form.start!),
        end: toDateString(form.end!),
      },
    }
  }

  return {
    form,
    exception,
    defaultExceptionName,
    changeStart,
    changeEnd,
    changeDate,
    changeType,
    changeFrequency,
    buildException,
  }
}
