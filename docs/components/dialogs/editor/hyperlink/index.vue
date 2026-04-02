<template>
  <div>
    <modal-dialog
      ref="dialog"
      :is-opened="isHyperlinkDialogOpened"
      :close-button="isPhoneSizeViewportWidth ? true : false"
      :width="460"
      :max-width="'90%'"
      :title="$T('Insert Hyperlink')"
      @modal-dialog-close="closeDialog"
    >
      <div class="flex h-full w-full flex-col">
        <div class="flex h-full flex-col gap-4">
          <fw-input
            v-model="hyperlink"
            :is-auto-focus="true"
            class="fw-override w-full rounded-md"
            :placeholder="$T('Enter or paste a URL')"
            :clear-icon="toURL('/assets/static/images/home/close.svg')"
          />
          <div class="flex items-center justify-center rounded-[4px] bg-fill-surface-light dark:bg-fill-surface-dark">
            <hyperlink-preview-status v-if="previewStatus === 'empty'" status-icon="note-link" :title="$T('Link Information Preview')" />
            <hyperlink-preview-status v-else-if="previewStatus === 'not-found'" status-icon="warning-circular" :title="$T('No information found')" />
            <hyperlink-preview-status v-else-if="previewStatus === 'pending'" status-icon="loading" :title="$T('Loading link information...')" />
            <template v-else>
              <div
                class="flex max-w-full flex-col items-center justify-center gap-3 p-4"
                :style="{
                  height: `${previewContentHeight}`,
                }"
              >
                <span
                  v-if="shouldShowTitlePreview"
                  class="line-clamp-2 max-w-full text-ellipsis text-[15px] font-semibold leading-[21px] text-text-primary-light dark:text-text-primary-dark sm:line-clamp-1 sm:whitespace-nowrap sm:text-[13px] sm:leading-[17px]"
                  >{{ hyperlinkPreview.title }}
                </span>
                <img
                  v-if="shouldShowImagePreview"
                  :src="hyperlinkPreview.imageUrl"
                  referrerpolicy="no-referrer"
                  alt=""
                  :style="{
                    height: `${previewImageHeight}`,
                  }"
                />
              </div>
            </template>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-NeverMind-UI text-[15px] font-normal leading-[17px] sm:text-[13px]">{{ $T('Auto Fill:') }}</span>
              <fw-select
                ref="autoFillSelectRef"
                class="flex-grow sm:min-w-[155px] sm:flex-grow-0"
                :selected-key="displayedAutoFillOptions"
                :options="autoFillOptions"
                :position="isPhoneSizeViewportWidth ? 'top-left' : 'bottom-left'"
                :trigger-size="'small'"
                :menu-custom-class="fillSelectMenuCustomClass"
                :disabled="!isAutoFillSelectEnabled"
                @select="handleSelectAutoFill"
              />
            </div>
          </div>
        </div>
      </div>

      <template #between-body-footer>
        <fw-divider />
      </template>

      <template #footer>
        <div v-if="isPhoneSizeViewportWidth" class="flex gap-2">
          <fw-button v-if="initialLink" :theme="'default'" class="flex-1" :size="'large'" @click="handleRemove">
            {{ $T('Remove') }}
          </fw-button>
          <fw-button v-else :theme="'default'" class="flex-1" :size="'large'" @click="handleCancel">
            {{ $T('Cancel') }}
          </fw-button>
          <fw-button :theme="'secondary'" class="flex-1" :size="'large'" :disabled="!hyperlink?.trim()" @click="handleInsert">
            {{ $T('Insert') }}
          </fw-button>
        </div>
        <div v-else class="flex w-full justify-between">
          <div>
            <fw-button v-if="initialLink" :theme="'default'" :size="'small'" @click="handleRemove">
              {{ $T('Remove') }}
            </fw-button>
          </div>
          <div class="flex gap-2">
            <fw-button :theme="'default'" :size="'small'" @click="handleCancel">
              {{ $T('Cancel') }}
            </fw-button>
            <fw-button :theme="'secondary'" :size="'small'" :disabled="!hyperlink?.trim()" @click="handleInsert">
              {{ $T('Insert') }}
            </fw-button>
          </div>
        </div>
      </template>
    </modal-dialog>
  </div>
</template>
<script setup lang="ts">
import ModalDialog from 'client/components/new-base-modal-dialog.vue'
import { computed, ref, watch } from 'vue'
import { WorkbookManager } from 'client/library/workbook-next/workbook-manager'
import HyperlinkPreviewStatus from './preview-status.vue'
import { type AutoFillOptionKey, useHyperlink } from './use-hyperlink'
import { $T } from 'client/library/translation'
import { useWindowResize } from 'client/composables/window-resize'
import { useElementSize } from '@vueuse/core'
import { localStore } from 'utils/browserStorage'

const props = defineProps<{
  isOpened: boolean
  workbookId: string
}>()

const emit = defineEmits<{ (e: 'visibility-change', newValue: boolean): void }>()

const dialog = ref<InstanceType<typeof ModalDialog>>()

const isHyperlinkDialogOpened = computed(() => props.isOpened)

const workbook = computed(() => props.workbookId && WorkbookManager.find(props.workbookId))
const initialLink = computed(() => {
  if (!workbook.value) return ''
  return workbook.value.workbookEditor.syncedProperties.value.webLink?.value?.href ?? ''
})

const { isPhoneSizeViewportWidth } = useWindowResize()

const { hyperlink, isHyperlinkValid, hyperlinkPreview, isFetchingPreview, saveHyperlinkToWorkbook, removeHyperlinkInWorkbook } =
  useHyperlink(workbook)

watch(
  () => isHyperlinkDialogOpened.value,
  isOpened => {
    if (isOpened) {
      hyperlink.value = initialLink.value
    }
  },
  { immediate: true },
)

type PreviewStatus = 'empty' | 'pending' | 'not-found' | 'ready'
const previewStatus = computed<PreviewStatus>(() => {
  if (!hyperlink.value) return 'empty'
  if (isFetchingPreview.value) return 'pending'
  if (isHyperlinkValid.value && hyperlinkPreview.value && (hyperlinkPreview.value.title || hyperlinkPreview.value.imageUrl)) return 'ready'
  return 'not-found'
})

const isAutoFillSelectEnabled = computed(() => previewStatus.value === 'ready')

const autoFillOptions = computed<{ key: AutoFillOptionKey; label: string }[]>(() => {
  const options: { key: AutoFillOptionKey; label: string }[] = [{ key: 'none', label: $T('None') }]
  if (previewStatus.value === 'ready') {
    if (hyperlinkPreview.value?.title) {
      options.push({ key: 'title', label: $T('Link Title') })
    }
    if (hyperlinkPreview.value?.imageUrl) {
      options.push({ key: 'image', label: $T('Link Thumbnail') })
    }
  }

  options.push({ key: 'all', label: $T('All Information') })

  return options
})

const selectedAutoFillOption = ref<AutoFillOptionKey>('all')

const shouldShowTitlePreview = computed(() => hyperlinkPreview.value?.title)
const shouldShowImagePreview = computed(() => hyperlinkPreview.value?.imageUrl)

const previewContentHeight = computed(() => {
  return shouldShowTitlePreview.value && !shouldShowImagePreview.value ? '148px' : 'auto'
})

const previewImageHeight = computed(() => {
  return isPhoneSizeViewportWidth.value ? '166px' : '214px'
})

watch(
  () => [hyperlinkPreview.value],
  () => {
    if (localStore.get('lastUsedAutoFillOption')) {
      const raw = localStore.get('lastUsedAutoFillOption')
      selectedAutoFillOption.value = raw === 'none' || raw === 'title' || raw === 'image' || raw === 'all' ? (raw as AutoFillOptionKey) : 'none'
    }
    if (
      (!hyperlinkPreview.value?.title && selectedAutoFillOption.value === 'title') ||
      (!hyperlinkPreview.value?.imageUrl && selectedAutoFillOption.value === 'image')
    ) {
      // If auto fill option is not matched with preview data, set to `none`
      selectedAutoFillOption.value = 'none'
    }
  },
  { immediate: true },
)

const displayedAutoFillOptions = computed<AutoFillOptionKey>(() => {
  if (previewStatus.value !== 'ready') return 'none'
  return selectedAutoFillOption.value
})

const handleSelectAutoFill = (key: AutoFillOptionKey) => {
  selectedAutoFillOption.value = key
}

const handleVisibleChange = (newValue: boolean) => {
  emit('visibility-change', Boolean(newValue))
}

const closeDialog = async () => {
  await dialog.value?.closeDialogWithAnimation?.()
  handleVisibleChange(false)
}

const handleCancel = async () => {
  await closeDialog()
}

const handleInsert = async () => {
  localStore.set('lastUsedAutoFillOption', displayedAutoFillOptions.value)
  saveHyperlinkToWorkbook(selectedAutoFillOption.value)
  await closeDialog()
}

const handleRemove = async () => {
  removeHyperlinkInWorkbook()
  await closeDialog()
}

const autoFillSelectRef = ref<HTMLElement>()
const { width: autoFillSelectWidth } = useElementSize(autoFillSelectRef)
const fillSelectMenuCustomClass = computed(() => {
  if (isPhoneSizeViewportWidth.value) {
    return autoFillSelectWidth.value ? `w-[${autoFillSelectWidth.value}px]` : ''
  } else {
    return '!w-44'
  }
})
</script>
