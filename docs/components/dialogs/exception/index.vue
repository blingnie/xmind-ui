<template>
  <modal-dialog
    ref="dialogRef"
    :width="436"
    :is-opened="true"
    @modal-dialog-close="handleClose"
    :title="dialogTitle"
    :dialog-body-class="'!pt-3 overflow-y-auto'"
    :buttons="dialogButtons"
  >
    <div class="mb-4 text-mobile-body-medium text-text-primary-light dark:text-text-primary-dark sm:text-desktop-body-large">
      {{ $T('Customize working days or days off within a specific date range.') }}
    </div>

    <div class="flex flex-col gap-3 text-text-primary-light dark:text-text-primary-dark">
      <!-- title -->
      <div class="mt-2 text-mobile-caption-1 text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-caption">
        {{ $T('Title') }}({{ $T('Optional') }})
      </div>
      <fw-input
        v-model="form.name"
        type="text"
        :size="isPhoneSizeViewportWidth ? 'medium' : 'small'"
        :placeholder="$T('Example Calendar')"
        :disable-clear-icon="true"
      />

      <!-- date -->
      <div class="mt-2 text-mobile-caption-1 text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-caption">
        {{ $T('Date Range') }}
      </div>
      <exception-field :label="$T('Start')">
        <exception-date :model-value="form.start" :is-dark="dark" :is-working-day="isWorkingDay" @change="changeStart" />
      </exception-field>

      <exception-field :label="$T('End')">
        <exception-date :model-value="form.end" :is-dark="dark" :is-working-day="isWorkingDay" @change="changeEnd" />
      </exception-field>

      <fw-divider class="my-2" />

      <!-- rule -->
      <div class="mt-2 text-mobile-caption-1 text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-caption">
        {{ $T('Rule Settings') }}
      </div>
      <exception-field :label="$T('Date')">
        <exception-date :model-value="form.selectedDate" :is-dark="dark" :is-working-day="isWorkingDay" @change="changeDate" />
      </exception-field>

      <exception-field :label="$T('Type')">
        <rule-type :type="form.type" @change="changeType" />
      </exception-field>

      <exception-field :label="$T('Repeat')">
        <rule-frequency :value="form.frequency" :selected-date="form.selectedDate" @change="changeFrequency" />
      </exception-field>

      <exception-desc class="mt-2" :rule="buildException()" />
    </div>

    <template #between-body-footer>
      <fw-divider />
    </template>
  </modal-dialog>
</template>

<script setup lang="ts">
import '@xmindltd/gantt/calendar.css'
import { computed, ref, toRef } from 'vue'
import { usePromiseHook } from 'utils/vue-utils'
import { $T } from 'client/library/translation'
import { useWindowResize } from 'client/composables/window-resize'
import ModalDialog, { type ModalDialogBottomButton } from 'client/components/new-base-modal-dialog.vue'

import ExceptionField from './exception-field.vue'
import RuleType from './rule-type.vue'
import RuleFrequency from './rule-frequency.vue'
import ExceptionDesc from './exception-desc.vue'
import ExceptionDate from './exception-date.vue'
import { ExceptionDialogResult } from 'app/services/action/dialog/exception-dialog'
import { useException, type Exception } from './use-exception'

interface ExceptionDialogProps {
  isWorkingDay?: (date: Date) => boolean
  dark?: boolean
  exceptions: Exception[]
  exceptionId?: string
}

const props = withDefaults(defineProps<ExceptionDialogProps>(), {
  dark: false,
  exceptions: () => [],
})

const { resolve } = usePromiseHook<ExceptionDialogResult>()
const dialogRef = ref<InstanceType<typeof ModalDialog>>()
const { isPhoneSizeViewportWidth } = useWindowResize()

const { form, exception, changeStart, changeEnd, changeDate, changeType, changeFrequency, buildException } = useException({
  exceptions: toRef(props, 'exceptions'),
  exceptionId: toRef(props, 'exceptionId'),
  isWorkingDay: props.isWorkingDay ?? (() => true),
})

const dialogTitle = computed(() => {
  return exception.value ? $T('Edit Exception') : $T('Add Exception')
})
const dialogButtons = computed(() => {
  const buttons: ModalDialogBottomButton[] = []
  buttons.push({
    text: $T('Cancel'),
    onClick: handleClose,
    isDisabled: false,
    type: 'default',
  })

  buttons.push({
    text: $T('Save'),
    onClick: handleSubmit,
    isDisabled: false,
    type: 'secondary',
  })
  return buttons
})
const handleSubmit = async () => {
  await dialogRef.value?.closeDialogWithAnimation?.()
  resolve({ action: 'confirm', exception: buildException() })
}
const handleClose = async () => {
  await dialogRef.value?.closeDialogWithAnimation?.()
  resolve({ action: 'cancel' })
}
</script>
