<template>
  <app-base-topic-locator-popover
    :workbook-id="workbookId"
    :value="isOpened"
    :width="POPOVER_WIDTH"
    :height="POPOVER_HEIGHT"
    @input="handleVisibleChange"
  >
    <div class="flex h-full w-full flex-col justify-between gap-4 p-4">
      <div class="text-desktop-subhead-mini text-text-primary-light dark:text-text-primary-dark">
        {{ $T('Structure') }}
      </div>
      <div class="flex items-center justify-between">
        <span class="text-desktop-body-medium text-text-secondary-light dark:text-text-secondary-dark">
          {{ $T('Columns') }}
        </span>
        <fw-select
          :options="numberOfColumnsOptions"
          :selected-key="selectedColumns"
          :disabled="isSelectionDisabled"
          :trigger-size="'small'"
          :menu-width-match-trigger="true"
          :trigger-custom-class="selectTriggerClass"
          :menu-custom-class="selectMenuClass"
          @select="handleSelect"
        >
          <template #selectedLabel>
            <span class="truncate">{{ selectedDisplayText }}</span>
          </template>
        </fw-select>
      </div>
    </div>
  </app-base-topic-locator-popover>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppBaseTopicLocatorPopover from './base-topic-locator.vue'
import { useEditorFeaturePaywall } from 'app/composables/editor-feature-paywall'
import { useNumberOfColumnsForGridStructure } from 'app/fragments/compositions/ui/format-panel'

const GRID_MAX_COLUMNS = 999
const POPOVER_WIDTH = 240
const POPOVER_HEIGHT = 88
withDefaults(
  defineProps<{
    isOpened: boolean
    workbookId?: string | null
  }>(),
  {
    isOpened: false,
    workbookId: '',
  },
)

const emit = defineEmits<{
  (e: 'visibility-change', value: boolean): void
}>()

const {
  numberOfColumnsForGridStructure,
  changeNumberOfColumnsForGridStructure,
  isNumberOfColumnsForGridStructureDisabled,
  isNumberOfColumnsForGridStructureMultiple,
} = useNumberOfColumnsForGridStructure()

const editorFeaturePaywall = useEditorFeaturePaywall()

const numberOfColumnsOptions = computed(() =>
  Array.from({ length: 12 }, (_, index) => {
    const value = String(index + 1)
    return { key: value, label: value }
  }),
)

const selectedColumns = computed(() => {
  if (isNumberOfColumnsForGridStructureMultiple.value) {
    return ''
  }
  const value = Number(numberOfColumnsForGridStructure.value)
  if (!Number.isFinite(value) || value <= 0) {
    return ''
  }
  return String(value)
})

const selectedDisplayText = computed(() => selectedColumns.value || '--')

const isSelectionDisabled = computed(() => isNumberOfColumnsForGridStructureDisabled.value)

const selectTriggerClass = 'w-[88px] justify-between'
const selectMenuClass = 'w-[88px]'

const handleVisibleChange = (newValue: boolean) => {
  emit('visibility-change', Boolean(newValue))
}

const handleSelect = async (key: string) => {
  if (!key) return
  const columns = parseInt(String(key), 10)
  if (Number.isNaN(columns)) return
  const normalizedColumns = Math.max(1, Math.min(GRID_MAX_COLUMNS, columns))
  if (String(normalizedColumns) === selectedColumns.value) {
    return
  }
  const isFeatureRestricted = !(await editorFeaturePaywall.isEditorFeatureUnrestricted('changeNumberOfColumnsForGridStructure'))
  if (isFeatureRestricted) {
    await editorFeaturePaywall.showEditorFeatureLimitPaywall()
    return
  }
  changeNumberOfColumnsForGridStructure(normalizedColumns)
}
</script>
