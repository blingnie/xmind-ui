<template>
  <div class="contents">
    <div class="flex flex-col sm:pt-[8px]">
      <div class="px-[24px]"><slot name="tab"></slot></div>

      <overlay-scrollbar class="max-h-64 pb-[24px] sm:max-h-80">
        <div class="grid grid-cols-1 gap-3 px-[24px] pt-[24px] sm:grid-cols-2">
          <div
            v-for="option in exportOptions"
            :key="option.key"
            :class="
              twMerge(
                'flex cursor-pointer flex-row items-center justify-between rounded border border-border-muted-light bg-fill-surface-light py-1 pl-[8px] pr-[12px] transition-colors duration-300 hover:border-border-quaternary-light active:border-border-tertiary-light dark:border-border-muted-dark dark:bg-fill-surface-dark dark:hover:border-border-quaternary-dark dark:active:border-border-tertiary-dark',
                option?.isLab && 'ai-lab-menu border-ai-purple-50',
              )
            "
            @click="option.action()"
          >
            <div class="flex flex-1 items-center gap-2">
              <img :src="getLogo(option.key)" :alt="option.label" class="h-8 w-8 object-cover" />
              <span class="text-mobile-body-medium sm:text-desktop-body-medium">{{ option.label }}</span>
            </div>
            <fw-icon v-show="option.isPro" name="lock-pro" width="14" height="14" />
            <ai-lab-badge v-show="option.isLab" />
          </div>
        </div>
      </overlay-scrollbar>
    </div>

    <fw-divider class="mb-[16px]" />

    <section class="flex items-center justify-end px-[24px] pb-[32px] sm:pb-[18px]">
      <fw-button class="flex-1 sm:flex-initial" theme="default" :size="isPhoneSizeViewportWidth ? 'large' : 'small'" @click="$emit('close')">
        {{ $T('Cancel') }}
      </fw-button>
    </section>
  </div>
</template>

<script setup lang="ts">
// ! only available in editor
import { useProgressBarStore } from 'app/services/pinia/progress-animation'
import { useAppStore } from 'client/store'
import { useServices } from 'app/fragments/use-services'
import { trackNewVersionWorks } from 'client/library/tracker'
import { useWindowResize } from 'client/composables/window-resize'
import OverlayScrollbar from 'client/components/overlay-scrollbar.vue'
import { useFreeTrialToast } from 'app/composables/use-free-trial-toast'
import { useEditorFeaturePaywall } from 'app/composables/editor-feature-paywall'
import { usePitchVideo } from 'app/composables/ai-features/pitch-video'
import videoSvgUrlLight from 'client/assets/import-files/images/export/video-light.svg?url'
import videoSvgUrlDark from 'client/assets/import-files/images/export/video-dark.svg?url'
import AiLabBadge from 'client/components/composite/ai-lab-badge.vue'
import { useTeamSpaceData } from 'app/composables/team-space-data'
import { useCollaborativeStore } from 'app/services/pinia/collaborative-store'
import { $T } from 'client/library/translation'

const props = defineProps<{
  fileId: string
  fileTitle: string
  isAccessible: boolean
}>()

defineEmits<{
  (e: 'close'): void
}>()

interface ExportOption {
  key: string
  label: string
  action: () => void
  isPro?: boolean
  isLab?: boolean
}
const { action } = useServices()
const progressBarStore = useProgressBarStore()
const appStore = useAppStore()
const { isPhoneSizeViewportWidth } = useWindowResize()
const { isEditorCommonPaidFeatureEnabled } = useEditorFeaturePaywall()

const isEnableAiLab = () => {
  return !!useTeamSpaceData().getTeamPreference(useCollaborativeStore().sharingMetadata?.teamId || '')?.enableAILab
}

const exportOptions: ExportOption[] = [
  {
    key: 'xmind',
    label: 'Xmind',
    action: () => {
      trackNewVersionWorks.trackSharePopExport('Xmind')
      action.editorNext.downloadSharingFile.execute()
    },
  },
  isEnableAiLab()
    ? {
        key: 'pitch-video',
        label: $T('Pitch Video'),
        isLab: true,
        action: () => {
          trackNewVersionWorks.trackSharePopExport('Pitch Video')
          usePitchVideo().startPitchVideoGenerateCompose()
        },
      }
    : null,
  {
    key: 'png',
    label: 'PNG',
    action: () => {
      trackNewVersionWorks.trackSharePopExport('PNG')
      action.dialog.openDownloadImageDialog({
        type: 'png',
        source: 'export-share-pop',
        onAfterDownload: () => action.dialog.openExportImageSuccessDialog({ fileId: props.fileId, filename: props.fileTitle }),
      })
    },
  },
  {
    key: 'pdf',
    label: 'PDF',
    action: () => {
      trackNewVersionWorks.trackSharePopExport('PDF')
      action.dialog.openExportPDFDialog({ source: 'export-share-pop' })
    },
  },
  {
    key: 'svg',
    label: 'SVG',
    isPro: !isEditorCommonPaidFeatureEnabled.value,
    action: () => {
      trackNewVersionWorks.trackSharePopExport('SVG')
      if (!isEditorCommonPaidFeatureEnabled.value) {
        action.dialog.openActivateDialog({ trackingName: 'fromSVG', trackingAction: 'share_export_to_svg' })
        return
      }
      action.dialog.openDownloadImageDialog({ type: 'svg', source: 'export-share-pop' })
      useFreeTrialToast().showFreeTrialToastForExportIfNeeded('export-share-pop', 'svg')
    },
  },
  {
    key: 'markdown',
    label: 'Markdown',
    isPro: !isEditorCommonPaidFeatureEnabled.value,
    action: () => {
      trackNewVersionWorks.trackSharePopExport('Markdown')
      action.exportAs.exportMD.execute({ source: 'export-share-pop' })
      useFreeTrialToast().showFreeTrialToastForExportIfNeeded('export-share-pop', 'markdown')
    },
  },
  {
    key: 'docx',
    label: 'Word',
    isPro: !isEditorCommonPaidFeatureEnabled.value,
    action: () => {
      trackNewVersionWorks.trackSharePopExport('Word')
      action.exportAs.exportWord.execute({ source: 'export-share-pop' })
      useFreeTrialToast().showFreeTrialToastForExportIfNeeded('export-share-pop', 'word')
    },
  },
  {
    key: 'xlsx',
    label: 'Excel',
    isPro: !isEditorCommonPaidFeatureEnabled.value,
    action: () => {
      trackNewVersionWorks.trackSharePopExport('Excel')
      action.exportAs.exportExcel.execute({ source: 'export-share-pop' })
      useFreeTrialToast().showFreeTrialToastForExportIfNeeded('export-share-pop', 'excel')
    },
  },

  {
    key: 'powerpoint',
    label: 'PowerPoint',
    isPro: !isEditorCommonPaidFeatureEnabled.value,
    action: () => {
      trackNewVersionWorks.trackSharePopExport('PowerPoint')
      action.exportAs.exportPowerPoint.execute({ source: 'export-share-pop' })
      useFreeTrialToast().showFreeTrialToastForExportIfNeeded('export-share-pop', 'powerpoint')
    },
  },
  {
    key: 'opml',
    label: 'OPML',
    isPro: !isEditorCommonPaidFeatureEnabled.value,
    action: () => {
      trackNewVersionWorks.trackSharePopExport('OPML')
      action.exportAs.exportOPML.execute({ source: 'export-share-pop' })
      useFreeTrialToast().showFreeTrialToastForExportIfNeeded('export-share-pop', 'opml')
    },
  },
  {
    key: 'textBundle',
    label: 'TextBundle',
    isPro: !isEditorCommonPaidFeatureEnabled.value,
    action: () => {
      trackNewVersionWorks.trackSharePopExport('TextBundle')
      action.exportAs.exportTextBundle.execute({ source: 'export-share-pop' })
      useFreeTrialToast().showFreeTrialToastForExportIfNeeded('export-share-pop', 'textbundle')
    },
  },
  {
    key: 'task-csv',
    label: 'Excel (Task)',
    isPro: !isEditorCommonPaidFeatureEnabled.value,
    action: () => {
      trackNewVersionWorks.trackSharePopExport('Excel (Task)')
      action.exportAs.exportTaskCSV.execute({ source: 'export-share-pop' })
    },
  },
  {
    key: 'ics',
    label: 'Calendar (Task)',
    isPro: !isEditorCommonPaidFeatureEnabled.value,
    action: () => {
      trackNewVersionWorks.trackSharePopExport('Calendar (Task)')
      action.exportAs.exportTaskICS.execute({ source: 'export-share-pop' })
    },
  },
].filter(Boolean) as ExportOption[]

const getLogo = (key: string) => {
  const isDark = appStore.appearance === 'dark'
  if (key === 'pitch-video') {
    return isDark ? videoSvgUrlDark : videoSvgUrlLight
  }
  const resource = progressBarStore.resources[key] || progressBarStore.resources['error']
  return isDark ? resource.dark : resource.light
}
</script>
<style scoped>
.ai-lab-menu {
  @apply relative overflow-hidden bg-transparent;
}

@keyframes TransitionAnimation {
  0% {
    transform: translate3d(0%, 0, 0);
  }
  100% {
    transform: translate3d(50%, 0, 0);
  }
}

.ai-lab-menu:after {
  content: '';
  animation: TransitionAnimation 2s linear infinite;
  @apply absolute left-[-100%] top-0 z-10 h-full w-[200%] bg-ai-lab-export-menu-gradient;
}
</style>
