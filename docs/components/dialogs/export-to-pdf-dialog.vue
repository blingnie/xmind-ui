<template>
  <new-modal-dialog
    :title="$T('Export to PDF')"
    :is-opened="true"
    :min-height="300"
    :height="'auto'"
    :width="450"
    :dialog-body-class="'px-6'"
    :buttons="buttons"
    class="export-to-pdf-dialog"
    @modal-dialog-close="handleClose"
  >
    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-4">
        <label
          class="w-[108px] flex-shrink-0 text-mobile-body-medium text-text-primary-light dark:text-text-primary-dark sm:text-desktop-body-medium"
        >
          {{ $T('Content') }}
        </label>
        <fw-select
          :trigger-size="isPhoneSizeViewportWidth ? 'large' : 'small'"
          :selected-key="exportContentScope"
          :options="exportContentScopeTypes"
          class="w-[calc(100%-120px)] flex-shrink-0"
          @select="handleExportContentScope"
        />
      </div>

      <div class="flex items-center gap-4">
        <label
          class="w-[108px] flex-shrink-0 text-mobile-body-medium text-text-primary-light dark:text-text-primary-dark sm:text-desktop-body-medium"
        >
          {{ $T('Scale') }}
        </label>
        <fw-select
          :trigger-size="isPhoneSizeViewportWidth ? 'large' : 'small'"
          :selected-key="exportScale"
          :options="exportAvailableScales"
          class="w-[120px] flex-shrink-0"
          @select="key => (exportScale = key)"
        />
      </div>
      <div v-if="bigMindMap" class="ml-[124px] flex items-start gap-2">
        <fw-icon name="preview-slash" class="text-warning-500 mt-0.5 h-4 w-4 flex-shrink-0" />
        <span class="text-desktop-caption text-text-quaternary-light dark:text-text-quaternary-dark sm:text-desktop-body-small">
          {{ $T('The image size will be reduced because the currently set size is over the maximum.') }}
        </span>
      </div>
      <fw-divider class="w-full" />

      <div class="flex flex-col gap-3">
        <div
          class="flex cursor-pointer select-none items-center text-desktop-subhead-mini text-text-primary-light dark:text-text-primary-dark"
          @click="toggleOptionsExpanded"
        >
          <fw-icon :name="!isOptionsExpanded ? 'arrow-fill-right' : 'arrow-fill-down'" class="h-4 w-4 transition-transform duration-200" />
          <span class="text-desktop-subhead-mini text-text-primary-light dark:text-text-primary-dark">{{ $T('Options') }}</span>
        </div>

        <div v-if="isOptionsExpanded" class="flex flex-col gap-4 transition-all duration-200 ease-in-out">
          <div class="flex items-center justify-between">
            <label class="truncate text-mobile-body-medium text-text-primary-light dark:text-text-primary-dark sm:text-desktop-body-medium">
              {{ $T('Transparent Background') }}
            </label>
            <fw-toggle
              :checked="isTransparent"
              :size="isPhoneSizeViewportWidth ? 'large' : 'small'"
              toggle-for="transparent-toggle"
              @toggle="handleTransparentToggle"
            />
          </div>

          <div class="flex items-center justify-between">
            <label
              class="flex items-center gap-1.5 truncate text-mobile-body-medium text-text-primary-light dark:text-text-primary-dark sm:text-desktop-body-medium"
            >
              {{ $T("Show 'Presented with Xmind'") }}
              <fw-icon
                v-if="!isEditorCommonPaidFeatureEnabled"
                name="lock-pro"
                class="h-3.5 w-3.5 text-text-quaternary-light dark:text-text-quaternary-dark"
              />
            </label>
            <fw-toggle
              :checked="hasWatermark"
              :size="isPhoneSizeViewportWidth ? 'large' : 'small'"
              toggle-for="watermark-toggle"
              @toggle="handleWatermarkToggle"
            />
          </div>
        </div>
      </div>
    </div>
  </new-modal-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, PropType, ComputedRef, watch } from 'vue'
import NewModalDialog, { type ModalDialogBottomButton } from '../new-base-modal-dialog.vue'
import { usePromiseHook } from 'utils/vue-utils'
import { $T } from 'client/library/translation'
import { useWorkspaceStore } from 'app/services/pinia/workspace-store'
import { useImageFrameStore } from 'app/services/pinia/image-frame-store'
import { storeToRefs } from 'pinia'
import type { TrackingAction } from 'client/types/tracking'
import { useFreeTrialToast } from 'app/composables/use-free-trial-toast'
import { useWindowResize } from 'client/composables/window-resize'
import type { IconName } from '../icon/icons'

const WARN_LENGTH_LIMIT = 30000
const props = defineProps({
  value: {
    required: true,
    type: String,
  },
  query: {
    type: Object,
    required: true,
  },
  onExport: {
    type: Function as PropType<(options: object) => Promise<boolean>>,
    required: true,
  },
  isActivateStatusValid: {
    type: Object as PropType<ComputedRef<boolean>>,
    required: true,
  },
  openActivateDialog: {
    type: Function as PropType<(args: { feature: string; type: string; trackingAction?: TrackingAction }) => Promise<boolean>>,
    required: true,
  },
  isEmbed: {
    type: Boolean,
    required: true,
  },
})

const { isPhoneSizeViewportWidth } = useWindowResize()
const { resolve } = usePromiseHook()
const isEditorCommonPaidFeatureEnabled = computed(() => !!props.isActivateStatusValid?.value)

const isOptionsExpanded = ref(true)
const exportContentScope = ref('current')
const exportScale = ref('1')

const { hasWatermark, isTransparent, isSplitByMainBranch } = storeToRefs(useImageFrameStore())
const { updateImageFrame } = useImageFrameStore()

const exportContentScopeTypes = computed(() => [
  {
    key: 'current',
    label: $T('Current Map'),
  },
  {
    key: 'all',
    label: $T('Current File'),
    icon: (isEditorCommonPaidFeatureEnabled.value ? undefined : 'lock-pro') as IconName,
    isPro: !isEditorCommonPaidFeatureEnabled.value,
  },
])

const exportAvailableScales = computed(() => [
  {
    key: '1',
    label: '100%',
  },
  {
    key: '2',
    label: '200%',
    icon: (isEditorCommonPaidFeatureEnabled.value ? undefined : 'lock-pro') as IconName,
    isPro: !isEditorCommonPaidFeatureEnabled.value,
  },
  {
    key: '3',
    label: '300%',
    icon: (isEditorCommonPaidFeatureEnabled.value ? undefined : 'lock-pro') as IconName,
    isPro: !isEditorCommonPaidFeatureEnabled.value,
  },
])
const buttons = computed<ModalDialogBottomButton[]>(() => [
  {
    text: $T('Cancel'),
    onClick: handleClose,
    isDisabled: false,
    type: 'default',
  },
  {
    text: $T('Export'),
    onClick: doExport,
    isDisabled: false,
    type: 'secondary',
  },
])
const bigMindMap = computed(() => {
  const editor = useWorkspaceStore().workbook?.workbookEditor
  if (!editor) return false

  const sheet = editor.activeSheet.value
  if (!sheet) return false

  const bounds = editor.editorContainer.value.getBoundingClientRect()
  return Math.max(bounds.width, bounds.height) * parseInt(exportScale.value) > WARN_LENGTH_LIMIT
})
const toggleOptionsExpanded = () => {
  isOptionsExpanded.value = !isOptionsExpanded.value
}

const handleTransparentToggle = (checked: boolean) => {
  updateImageFrame({ isTransparent: checked })
}

const handleClose = () => {
  resolve()
}

const downloadPDF = async (options: object) => {
  handleClose()
  await props.onExport(options)
}

const handleExportContentScope = async (key: string) => {
  const option = exportContentScopeTypes.value.find(opt => opt.key === key)
  if (option?.isPro && !props.isEmbed) {
    props.openActivateDialog({
      feature: 'exportAllMapsAtOnce',
      type: 'pdf',
      trackingAction: props.query.source === 'export-share-pop' ? 'share_export_to_pdf_all_maps_at_once' : 'export_to_pdf_all_maps_at_once',
    })
    return
  }
  if (key === 'all') {
    useFreeTrialToast().showFreeTrialToastForExportIfNeeded(props.query.source || 'export-as', 'pdf', 'all_maps_at_once')
  }
  exportContentScope.value = key
}

const doExport = () => {
  const options = {
    mode: exportContentScope.value,
    scale: parseInt(exportScale.value),
    isTransparent: isTransparent.value,
    hasWatermark: hasWatermark.value,
    isSmartSplit: isSplitByMainBranch.value,
  }
  try {
    downloadPDF({ options })
  } catch (e) {
    logger.error(e)
  }
}

const handleWatermarkToggle = (checked: boolean) => {
  if (!isEditorCommonPaidFeatureEnabled.value && !props.isEmbed) {
    props.openActivateDialog({
      feature: 'exportCurrentWithoutWatermark',
      type: 'pdf',
    })
    return
  }
  if (hasWatermark.value) {
    useFreeTrialToast().showFreeTrialToastForExportIfNeeded(props.query.source || 'export-as', 'pdf')
  }
  updateImageFrame({ hasWatermark: checked })
}
watch(
  () => parseInt(exportScale.value),
  async newValue => {
    if (newValue > 1 && !isEditorCommonPaidFeatureEnabled.value && !props.isEmbed) {
      const trackingAction: TrackingAction =
        props.query.source === 'export-share-pop'
          ? (`share_export_to_pdf_${newValue}x_size` as TrackingAction)
          : (`export_to_pdf_${newValue}x_size` as TrackingAction)
      props.openActivateDialog({
        feature: 'exportScale2x3x',
        type: 'pdf',
        trackingAction,
      })
      exportScale.value = '1'
    }
    newValue > 1 &&
      useFreeTrialToast().showFreeTrialToastForExportIfNeeded(props.query.source || 'export-as', 'pdf', `${newValue}x_size` as '2x_size' | '3x_size')
  },
)
onMounted(() => {
  updateImageFrame({ hasWatermark: isEditorCommonPaidFeatureEnabled.value ? hasWatermark.value : true })
})
</script>
