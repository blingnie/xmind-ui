<template>
  <new-modal-dialog
    :is-opened="true"
    :width="760"
    :height="480"
    :dialog-header-class="clsx('p-0')"
    :dialog-body-class="clsx('p-0 sm:p-0')"
    :dialog-footer-class="clsx('sm:p-0 p-0')"
    :dialog-class="clsx('bg-fill-container-light dark:bg-fill-container-dark')"
    @modal-dialog-close="handleClose"
  >
    <div class="flex h-full gap-3 p-3">
      <div
        class="border-border-panel-light bg-fill-surfaceDesktop-light shadow-elevation-g-light dark:border-border-panel-dark dark:bg-fill-surfaceDesktop-dark dark:shadow-elevation-g-dark flex w-[242px] flex-shrink-0 flex-col items-center justify-center rounded-xl border p-5"
      >
        <div ref="localPreviewRef" class="h-full w-full overflow-hidden" :style="previewContainerStyle"></div>

        <pagination
          class="mt-5"
          :current-page="print.currentPage.value + 1"
          :total-pages="print.totalPages.value"
          @go-to-page="print.goToPage($event - 1)"
        />
      </div>

      <div
        class="border-border-panel-light bg-fill-surfaceDesktop-light shadow-elevation-g-light dark:border-border-panel-dark dark:bg-fill-surfaceDesktop-dark dark:shadow-elevation-g-dark flex flex-1 flex-col overflow-hidden rounded-xl border"
      >
        <div class="flex flex-1 flex-col overflow-auto p-6">
          <h2 class="font-NeverMind-UI text-desktop-headline-small text-text-primary-light dark:text-text-primary-dark mb-4">
            {{ $T('Print Settings') }}
          </h2>

          <div class="mb-4 flex items-center gap-4">
            <label class="text-desktop-body-medium text-text-primary-light dark:text-text-primary-dark w-20">
              {{ $T('Page Size') }}
            </label>
            <fw-select
              :selected-key="print.pageSize.value"
              :options="pageSizeOptions"
              size="small"
              class="flex-1"
              @select="print.pageSize.value = $event as PaperSize"
            />
          </div>

          <div class="mb-4 flex items-center gap-4">
            <label class="text-desktop-body-medium text-text-primary-light dark:text-text-primary-dark w-20">
              {{ $T('Layout') }}
            </label>
            <segment-button
              :active-keys="[print.orientation.value]"
              :items="layoutOptions"
              item-class="flex items-center justify-center px-2 w-10"
              @change="handleLayoutChange"
            >
              <template #item="{ item }">
                <fw-icon :name="item.icon" class="pointer-events-none" />
              </template>
            </segment-button>
          </div>

          <div class="flex items-start gap-4">
            <label class="text-desktop-body-medium text-text-primary-light dark:text-text-primary-dark w-20">
              {{ $T('Scale') }}
            </label>
            <div class="flex-1 space-y-2">
              <label class="flex cursor-pointer items-center gap-2">
                <fw-radio v-model="print.scaleMode.value" value="actual" variant="filled" />
                <span class="text-desktop-body-medium text-text-primary-light dark:text-text-primary-dark">{{ $T('Actual Size') }}</span>
              </label>
              <label class="flex cursor-pointer items-center gap-2">
                <fw-radio v-model="print.scaleMode.value" value="fit" variant="filled" />
                <span class="text-desktop-body-medium text-text-primary-light dark:text-text-primary-dark">{{ $T('Fit Page') }}</span>
              </label>
              <label class="flex cursor-pointer items-center gap-2">
                <fw-radio v-model="print.scaleMode.value" value="custom" variant="filled" />
                <span class="text-desktop-body-medium text-text-primary-light dark:text-text-primary-dark">{{ $T('Custom Split') }}</span>
              </label>

              <div v-if="print.scaleMode.value === 'custom'" class="ml-6 mt-2 flex items-start gap-2">
                <div class="flex flex-col items-center gap-1">
                  <measure-input
                    :value="String(print.customColumns.value)"
                    :min="1"
                    measurement=""
                    class="w-16"
                    @input="print.updateColumns(parseInt($event) || 1)"
                  />
                  <span class="text-desktop-body-small text-text-tertiary-light dark:text-text-tertiary-dark">{{ $T('Columns') }}</span>
                </div>
                <fw-icon name="ratio-lock" class="text-text-tertiary-light dark:text-text-tertiary-dark mt-1" />
                <div class="flex flex-col items-center gap-1">
                  <measure-input
                    :value="String(print.customRows.value)"
                    :min="1"
                    measurement=""
                    class="w-16"
                    @input="print.updateRows(parseInt($event) || 1)"
                  />
                  <span class="text-desktop-body-small text-text-tertiary-light dark:text-text-tertiary-dark">{{ $T('Rows') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <fw-divider />

        <div class="flex justify-end gap-2 px-6 py-4">
          <fw-button theme="default" size="small" @click="handleClose">
            {{ $T('Cancel') }}
          </fw-button>
          <fw-button theme="secondary" size="small" :disabled="print.isPrinting.value" @click="handlePrint">
            {{ print.isPrinting.value ? $T('Printing...') : $T('Print') }}
          </fw-button>
        </div>
      </div>
    </div>
  </new-modal-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import NewModalDialog from '../new-base-modal-dialog.vue'
import SegmentButton from 'client/components/base/segment-button.vue'
import MeasureInput from 'client/components/measure-input.vue'
import Pagination from 'client/components/composite/pagination.vue'
import { $T } from 'client/library/translation'
import type { Gantt } from '@xmindltd/gantt'
import { useGanttPrint } from 'app/composables/use-gantt-print'
import { usePromiseHook } from 'client/utils/vue-utils'
import { useWindowResize } from 'client/composables/window-resize'

type PaperSize = 'A4' | 'A3' | 'Letter' | 'Legal'

const props = defineProps<{
  ganttRef: InstanceType<typeof Gantt> | null
}>()

const pageSizeOptions = [
  { key: 'A4', label: 'A4' },
  { key: 'A3', label: 'A3' },
  { key: 'Letter', label: 'Letter' },
  { key: 'Legal', label: 'Legal' },
]

const layoutOptions = [
  { key: 'landscape', name: $T('Landscape'), icon: 'file-horizontal' as const },
  { key: 'portrait', name: $T('Portrait'), icon: 'file' as const },
]

const handleLayoutChange = (item: { key: string }) => {
  print.orientation.value = item.key as 'portrait' | 'landscape'
}

const { resolve } = usePromiseHook()
const { isPhoneSizeViewportWidth } = useWindowResize()

const localPreviewRef = ref<HTMLElement | null>(null)
const previewContainerRef = computed(() => localPreviewRef.value)
const ganttRefValue = computed(() => props.ganttRef)

const print = useGanttPrint(ganttRefValue, previewContainerRef)

const PREVIEW_LANDSCAPE = { width: 200, height: 120 }
const PREVIEW_PORTRAIT = { width: 120, height: 200 }

const previewBorderSize = computed(() => {
  return print.orientation.value === 'landscape' ? PREVIEW_LANDSCAPE : PREVIEW_PORTRAIT
})

const previewContainerStyle = computed(() => {
  const { width, height } = previewBorderSize.value
  return {
    width: `${width}px`,
    height: `${height}px`,
    overflow: 'hidden',
  }
})

const handleClose = () => {
  print.close()
  resolve()
}

const handlePrint = async () => {
  await print.executePrint()
  print.close()
  resolve()
}

if (isPhoneSizeViewportWidth.value) {
  resolve()
} else {
  print.open()
}
</script>
<style>
.print-page {
  border-radius: 16px;
}
.modal-dialog__footer:empty {
  padding-bottom: 0 !important;
}
</style>
