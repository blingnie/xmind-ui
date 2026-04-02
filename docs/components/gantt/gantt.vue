<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="shouldRenderGantt && !isPhoneSizeViewportWidth" class="z-gantt-dialog flex items-center justify-center">
        <div
          ref="dialog"
          class="fixed select-none rounded-lg bg-fill-container-light px-3 pb-3 shadow-elevation-l4-light outline-none backdrop-blur-md dark:bg-fill-container-dark dark:shadow-elevation-l4-dark"
          :style="dialogStyle"
          tabindex="-1"
          @pointerdown.capture="focusDialog"
        >
          <div ref="dragHandle" class="grid w-full cursor-move grid-cols-[1fr_auto_1fr] items-center gap-4 pb-3 pt-3">
            <div></div>
            <h3 class="truncate text-desktop-subhead-small text-text-primary-light dark:text-text-primary-dark">
              {{ $T('Gantt Chart') }}
            </h3>
            <div class="flex cursor-pointer items-center justify-end">
              <fw-tile-button
                class="m-1"
                icon-name="finish-to-start"
                size="small"
                :disabled="!canLinkTasks"
                @click="startLinkMode"
                :title="$T('Link Tasks')"
              />
              <fw-divider :orientation="'vertical'" class="mx-2 h-4 border-divider-onContainer-light dark:border-divider-onContainer-dark" />
              <fw-tile-button class="m-1" icon-name="export" size="small" @click="showExportMenu" :title="$T('Export')" />
              <fw-tile-button class="m-1" icon-name="print" size="small" @click="handlePrintGantt" :title="$T('Print')" />
              <fw-divider :orientation="'vertical'" class="mx-2 h-4 border-divider-onContainer-light dark:border-divider-onContainer-dark" />
              <fw-tile-button class="m-1" icon-name="minus-outline" size="small" @click="zoomOut" :title="$T('Zoom Out')" />
              <div ref="sliderContainer" class="w-24 cursor-auto" @mousedown.stop @touchstart.stop @pointerdown.stop @click.stop>
                <fw-slider-input
                  v-model="zoom"
                  @update:model-value="setZoom"
                  :thick="4"
                  :knob-size="12"
                  :knob-area-padding="2"
                  bar-class="bg-fill-secondary-light dark:bg-fill-secondary-dark"
                />
              </div>
              <fw-tile-button class="m-1" icon-name="add-outline" size="small" @click="zoomIn" :title="$T('Zoom In')" />
              <div class="bg-stroke-divider-light dark:bg-stroke-divider-dark mx-1 h-5 w-px"></div>
              <fw-close class="z-10 m-1 cursor-pointer" @click="closeDialog" type="rounded" :icon-size="12" />
            </div>
          </div>
          <Gantt
            ref="ganttRef"
            :taskGraph="taskGraph"
            :showGrid="showGrid"
            :readonly="readonly"
            :locales="getCurrentSnowBirdLanguage()"
            :l10n="$T"
            :available="available"
            :dark="useAppStore().appearance === 'dark'"
            :guided-payment="guidedPayment"
            @task-edit="editTask"
            @task-change="updateTaskByOp"
            @selected-task-change="changeSelectedTask"
            @task-contextmenu="handleTaskContextMenu"
            @contexts-change="setContexts"
            @zoom-change="handleZoomChange"
          />
        </div>
        <gantt-context-menu ref="contextMenuRef" />
        <context-menu ref="exportMenuRef" :items="getExportMenuItems()" />
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, useTemplateRef, watch } from 'vue'
import { useDraggable } from '@vueuse/core'
import { useWindowResize } from 'client/composables/window-resize'
import { Gantt, type TaskContextMenuPayload } from '@xmindltd/gantt'
import '@xmindltd/gantt/gantt.css'
import { useAppStore } from 'client/store/app-store'
import { useGantt } from 'app/composables/use-gantt'
import { useEditorPanelManage } from 'app/composables/use-editor-panel-manage'
import { useTaskGraph } from 'app/composables/planned-task/use-task-graph'
import { $T } from 'client/library/translation'
import { getCurrentSnowBirdLanguage } from 'client/library/translation-helper'
import GanttContextMenu from './gantt-context-menu.vue'
import { useGanttExport } from 'app/composables/use-gantt-export'
import ContextMenu from 'app/fragments/router-views/new-home/stateless/menu/context-menu.vue'
import { useServiceStore } from 'client/store'
import { trackGantt } from 'client/library/tracker'

withDefaults(
  defineProps<{
    available: boolean
  }>(),
  {
    available: true,
  },
)

const emit = defineEmits<{
  'visibility-change': [value: boolean]
}>()
const PANEL_WIDTH = 400
const HEADER_HEIGHT = 46
const DEFAULT_GANTT_CONFIG = {
  cellWidth: {
    month: 290,
    day: 87,
    hour: 60,
  },
}

const { taskGraph } = useTaskGraph()
const { currentLeftPanelTab } = useEditorPanelManage()
const {
  ganttRef,
  showGrid,
  readonly,
  zoom,
  changeSelectedTask,
  editTask,
  guidedPayment,
  updateTaskByOp,
  zoomIn,
  zoomOut,
  setContexts,
  setZoom,
  handleZoomChange,
  startLinkMode,
  canLinkTasks,
  addKeyboardShortcutsListener,
  removeKeyboardShortcutsListener,
} = useGantt()
const { windowWidth: width, windowHeight: height, isPhoneSizeViewportWidth } = useWindowResize()

const contextMenuRef = ref<InstanceType<typeof GanttContextMenu> | null>(null)
const { exportMenuRef, getExportMenuItems, showExportMenu } = useGanttExport(ganttRef)

const shouldRenderGantt = ref(false)
const dialogRef = useTemplateRef<HTMLElement>('dialog')
const dragHandleRef = useTemplateRef<HTMLElement>('dragHandle')
const sliderContainerRef = useTemplateRef<HTMLElement>('sliderContainer')
const dialogSize = ref({
  width: 0,
  height: height.value > 700 ? height.value * 0.6 : 420,
})

const dialogStyle = computed(() => {
  return {
    left: `${x.value}px`,
    top: `${y.value}px`,
    width: `${dialogSize.value.width}px`,
    height: `${dialogSize.value.height}px`,
    cursor: isDragging.value ? 'grabbing' : 'default',
  }
})

const updateDialogSize = () => {
  const rightAreaWidth = currentLeftPanelTab.value === 'PLANNED_TASK' ? width.value - PANEL_WIDTH : width.value
  dialogSize.value.width = Math.max(500, rightAreaWidth * 0.95)
  dialogSize.value.height = height.value > 700 ? height.value * 0.6 : 420
}

const calculateInitialPosition = () => {
  const rightAreaWidth = currentLeftPanelTab.value === 'PLANNED_TASK' ? width.value - PANEL_WIDTH : width.value
  return {
    x:
      currentLeftPanelTab.value === 'PLANNED_TASK'
        ? PANEL_WIDTH + Math.max(0, (rightAreaWidth - rightAreaWidth * 0.9) / 2)
        : Math.max(0, (width.value - dialogSize.value.width) / 2),
    y: Math.max(0, height.value - dialogSize.value.height - 32),
  }
}

const resetDialogPosition = () => {
  updateDialogSize()
  const newPosition = calculateInitialPosition()
  x.value = newPosition.x
  y.value = newPosition.y
}

const { x, y, isDragging } = useDraggable(dialogRef, {
  initialValue: calculateInitialPosition(),
  handle: dragHandleRef,
  pointerTypes: ['mouse', 'touch', 'pen'],
  onStart: (_, event) => {
    const target = event.target as HTMLElement
    if (sliderContainerRef.value && (sliderContainerRef.value === target || sliderContainerRef.value.contains(target))) {
      return false
    }
  },
  onMove: position => {
    if (window.innerHeight - position.y < HEADER_HEIGHT) {
      position.y = window.innerHeight - HEADER_HEIGHT
    }
    if (position.y < 0) {
      position.y = 0
    }
    if (position.x > window.innerWidth - 90) {
      position.x = window.innerWidth - 90
    }
    if (position.x < 90 - dialogSize.value.width) {
      position.x = 90 - dialogSize.value.width
    }
  },
})

const closeDialog = () => {
  emit('visibility-change', false)
}

const handleTaskContextMenu = (payload: TaskContextMenuPayload) => {
  contextMenuRef.value?.show(payload)
}

const handlePrintGantt = () => {
  trackGantt.printGantt()
  useServiceStore().services.action.dialog.openPrintGanttDialog({ ganttRef: ganttRef.value })
}

watch([width, currentLeftPanelTab], () => {
  resetDialogPosition()
})

watch(shouldRenderGantt, isVisible => {
  if (isVisible) {
    nextTick(() => {
      ganttRef.value?.updateConfig(DEFAULT_GANTT_CONFIG)
      focusDialog()
    })
  }
})

onMounted(async () => {
  resetDialogPosition()
  await nextTick()
  requestAnimationFrame(() => {
    shouldRenderGantt.value = true
  })
  addKeyboardShortcutsListener()
})

onUnmounted(() => {
  removeKeyboardShortcutsListener()
})

const focusDialog = () => {
  if (!dialogRef.value) return
  if (dialogRef.value.contains(document.activeElement)) return
  dialogRef.value.focus({ preventScroll: true })
}
</script>

<style scoped>
:deep(.gantt-root) {
  height: calc(100% - 66px) !important;
  overflow: inherit !important;
}
</style>
