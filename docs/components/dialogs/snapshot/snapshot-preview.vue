<template>
  <div class="relative size-full bg-fill-surfaceDesktop-light dark:bg-fill-surfaceDesktop-dark">
    <div class="absolute inset-0 flex size-full flex-col" :class="clsx(isLoading ? 'opacity-0' : 'opacity-100')">
      <div id="snapshot-preview" ref="snapshotPreviewEl" class="relative w-full flex-1"></div>
      <div class="hidden w-full sm:block">
        <fw-divider />
      </div>
      <bottom-bar
        v-if="!isLoading"
        :instance-id="Symbol('snapshot-bottom-bar')"
        :active-sheet-id="mindmap?.activeSheetId"
        :sheets="mindmap?.sheets"
        :zoom-options="zoomOptions"
        :zoom-value="zoomValue"
        :is-editable="false"
        @zoom-change="updateZoomScale"
        @switch-sheet="switchSheet"
        @fit-map="fitMap"
      />
    </div>

    <div v-if="isLoading" class="flex size-full items-center justify-center">
      <fw-loading />
    </div>

    <div v-else-if="isPreviewLimited" class="flex size-full items-center justify-center">
      <div class="flex flex-col items-center gap-4">
        <no-history-image :width="96" :height="96" />
        <span class="px-2 text-center text-desktop-body-large text-text-quaternary-light dark:text-text-quaternary-dark max-w-sm:max-w-[240px]">{{
          $T('Please upgrade to access versions older than $1 days', `${SNAPSHOT_RETAINED_FOR_FREE_IN_DAYS}`)
        }}</span>

        <fw-button
          v-if="['premium', 'essential'].includes(snapshot?.planRequired)"
          size="small"
          theme="primary"
          class="min-w-[120px]"
          @click="handleUpgrade"
          >{{ $T('Upgrade') }}</fw-button
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { until } from '@vueuse/core'
import { debounce } from 'lodash'
import { Document, Snowdance, XFilePath, dataKit, mindmapVue, useMindMap, useSnowdance } from '@xmindltd/snowmonster'
import NoHistoryImage from 'client/assets/import-files/images/snapshot-dialog/no-history.svg'
import BottomBar from 'client/pages/app/fragments/shared/editor-bottom-bar/bottom-bar.vue'
import { useCloudKitClient } from 'app/composables/cloud-kit-client'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { ExtendedSnapshotMetadata } from 'client/types/file'
import { CollaborativeDocClientProvider } from 'app/services/collaborative/doc/file-client-provider'
import { $T } from 'client/library/translation'
import { trackNewVersionWorks } from 'client/library/tracker'
import { SNAPSHOT_RETAINED_FOR_FREE_IN_DAYS } from 'client/server-export'
import { PresetZoomScales } from 'app/constants'
import type { MindMap } from 'client/library/workbook-next/types'

const props = withDefaults(
  defineProps<{
    isFetchingSnapshotList?: boolean
    snapshot: ExtendedSnapshotMetadata | null
    sheetListPopBoundary?: string | null
  }>(),
  {
    sheetListPopBoundary: null,
    snapshot: null,
  },
)

const snapshotPreviewEl = ref(null)

const snowdanceInstance = ref<Snowdance>(null)
const mindmap = ref<MindMap>(null)

const loadedDocument = ref<Document>(null)

const isLoadingMap = ref(false)
const isPreviewLimited = computed(() => {
  return props.snapshot?.planRequired && ['premium', 'essential', 'business'].includes(props.snapshot.planRequired)
})

const isLoading = computed(() => {
  return isLoadingMap.value || props.isFetchingSnapshotList
})

const emit = defineEmits<{
  (e: 'plan-upgrade'): void
  (e: 'map-status', v: 'loading' | 'loaded'): void
}>()

const handleUpgrade = () => {
  trackNewVersionWorks.upgradeDialog('fromVersionHistory')
  trackNewVersionWorks.historyVersion('upgrade')

  emit('plan-upgrade')
}

const stage: mindmapVue.Stage = {
  take: async (filePath: XFilePath): Promise<ArrayBuffer | null> => {
    logger.log('SNAPSHOT STAGE take', filePath)
    const xapURL = `xap:${filePath}`
    const filename = xapURL.replace(/^xap:resources\//, '')

    const fileClientProvider = new CollaborativeDocClientProvider({ fileId: props.snapshot?.fileId })
    try {
      let resource = await fileClientProvider.getXAP({ xapURL })

      if (!resource) {
        resource = await useCloudKitClient().downloadSnapshotResource({
          fileId: props.snapshot.fileId,
          snapshotId: props.snapshot.snapshotId,
          filename,
        })

        await fileClientProvider.setXAP({ xapURL, data: resource })
      }
      return resource as ArrayBuffer
    } catch (err) {
      return null
    }
  },
  add: async (filePath: XFilePath, content_ignored: ArrayBuffer) => {
    logger.log('SNAPSHOT STAGE add', filePath)
  },
  delete: async (filePath: XFilePath) => {
    logger.log('SNAPSHOT STAGE delete', filePath)
  },
  toUrl: async (filePath: XFilePath) => {
    logger.log('SNAPSHOT STAGE toUrl', filePath)
    return ''
  },
  getDocument: async () => {
    const contentJson = await useCloudKitClient().downloadSnapshotContentJSON({
      fileId: props.snapshot.fileId,
      snapshotId: props.snapshot.snapshotId,
    })

    const document = await dataKit.deserializeDocument({ content: contentJson })
    return document
  },
  setDocument: async (document: Document) => {
    loadedDocument.value = document
  },
}

const zoomValue = computed(() => (mindmap.value?.currentZoomScale ?? 1.0) * 100)

const zoomOptions = computed(() => {
  return [...new Set(PresetZoomScales.concat([zoomValue.value]))].sort((a, b) => (a > b ? 1 : -1))
})

const switchSheet = (sheetId: string) => {
  mindmap.value?.executeEditorAction({
    name: 'mutateEditor:switchSheet',
    inputValue: sheetId,
  })
}

const updateZoomScale = (value: number) => {
  mindmap.value?.executeEditorAction({
    name: 'mutateEditor:zoomScale',
    inputValue: Number(value) / 100,
  })
}

const fitMap = debounce(() => {
  mindmap.value?.executeEditorAction({ name: 'mutateEditor:fitMap' })
}, 1)

const setupPreview = () => {
  snowdanceInstance.value = useSnowdance(Symbol.for('snapshot-preview'))
  mindmap.value = useMindMap(Symbol.for('snapshot-preview'))
  mindmap.value.changeEditorMode('readonly-fw')
  snowdanceInstance.value.setContainer(snapshotPreviewEl.value)
}

const disposePreview = () => {
  if (snapshotPreviewEl.value) {
    snapshotPreviewEl.value.innerHTML = ''
  }
  mindmap.value?.dispose()
  snowdanceInstance.value?.dispose()
}

const loadMap = async () => {
  if (isPreviewLimited.value) {
    return
  }
  isLoadingMap.value = true
  emit('map-status', 'loading')

  if (loadedDocument.value) {
    loadedDocument.value = null
  }

  const lastPreviewActiveSheetId = mindmap.value?.activeSheetId

  disposePreview()
  setupPreview()

  lastPreviewActiveSheetId && mindmap.value.setInitialSheetId(lastPreviewActiveSheetId)

  snowdanceInstance.value?.changeFile({
    id: props.snapshot.snapshotId,
    stage,
  })

  await until(() => !!mindmap.value?.activeSheetFigure).toBe(true)
  await new Promise(resolve => setTimeout(resolve, 100)) // wait for the sheet to be fully rendered
  fitMap()
  await new Promise(resolve => setTimeout(resolve, 100)) // wait for the fitMap to take effect
  isLoadingMap.value = false
  emit('map-status', 'loaded')
}

onMounted(() => {
  loadMap()
})

onUnmounted(() => {
  disposePreview()
})
</script>

<style scoped>
:deep(.sheet-viewer) {
  width: 100%;
  height: 100%;
  position: absolute;
  overflow: auto;
  z-index: -1;
  opacity: 0;
  outline: none;
  &.active {
    z-index: 0;
    opacity: 1;
  }
}
</style>
