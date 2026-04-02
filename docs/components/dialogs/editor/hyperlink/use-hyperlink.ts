import { useCloudKitClient } from 'app/composables/cloud-kit-client'
import { type UrlPreviewInfo } from 'client/library/cloud-kit'
import { type Workbook } from 'client/library/workbook-next/workbook'
import debounce from 'utils/debounce'
import { dataKit, documentKit } from 'compositions/mindmap'
import { isValidHttpUrl, normalizeUrl } from 'utils/url-utils'
import { computed, ref, Ref, watch } from 'vue'
import { useWorkspaceStore } from 'app/services/pinia'

export type AutoFillOptionKey = 'none' | 'title' | 'image' | 'all'

export const useHyperlink = (workbook: Ref<Workbook>) => {
  const hyperlink = ref<string>('')

  const hyperlinkPreview = ref<UrlPreviewInfo | null>(null)

  const normalizedHyperlink = computed(() => normalizeUrl(hyperlink.value))
  const isHyperlinkValid = computed(() => isValidHttpUrl(normalizedHyperlink.value))

  watch(
    () => [isHyperlinkValid.value, normalizedHyperlink.value],
    async () => {
      if (isHyperlinkValid.value) {
        await fetchHyperlinkPreviewDebounced()
      } else {
        hyperlinkPreview.value = null
      }
    },
    { immediate: true },
  )

  const saveHyperlinkToWorkbook = (option: AutoFillOptionKey) => {
    if (!workbook.value) return

    let href = (hyperlink.value || '').trim()
    if (href && !href.match(/([a-zA-Z0-9]+:\/\/|xmind:#|mailto:)/)) {
      if (href.match(/[\d\w]+\b@[a-zA-ZA-z0-9]+\.[a-z]+/g)) {
        href = `mailto:${href}`
      } else {
        href = `https://${href}`
      }
    }

    const titleToSave = option === 'title' || option === 'all' ? hyperlinkPreview.value?.title : undefined
    const imageUrlToSave = option === 'image' || option === 'all' ? hyperlinkPreview.value?.imageUrl : undefined
    const embedUrlToSave = option === 'image' || option === 'all' ? hyperlinkPreview.value?.embedUrl : undefined

    const newDoc = dataKit.changeWebLinkFor(
      workbook.value.workbookEditor.activeSheet.value,
      workbook.value.workbookEditor.selection.value.modelIds[0],
      {
        href,
        title: titleToSave,
        videoThumbnail: imageUrlToSave,
        videoEmbedUrl: embedUrlToSave,
      },
    ) as documentKit.Document

    useWorkspaceStore().workbook?.workbookEditor.changeDoc(newDoc)
  }

  const removeHyperlinkInWorkbook = () => {
    if (!workbook.value) return

    const newDoc = dataKit.changeWebLinkFor(
      workbook.value.workbookEditor.activeSheet.value,
      workbook.value.workbookEditor.selection.value.modelIds[0],
      {
        href: '',
      },
    ) as documentKit.Document

    useWorkspaceStore().workbook?.workbookEditor.changeDoc(newDoc)
  }

  const fetchHyperlinkPreviewDebounced = debounce(
    () => {
      fetchHyperlinkPreview()
    },
    2000,
    { leading: true },
  )

  const activeRequestCount = ref(0)
  const isFetchingPreview = computed(() => activeRequestCount.value > 0)
  let cancelFetchHyperlinkPreview: Function | null = null

  const fetchHyperlinkPreview = async () => {
    activeRequestCount.value++

    if (cancelFetchHyperlinkPreview) {
      cancelFetchHyperlinkPreview()
    }

    try {
      const res = await useCloudKitClient().readUrlPreview({
        url: normalizedHyperlink.value,
        cancel: handler => (cancelFetchHyperlinkPreview = handler),
      })
      hyperlinkPreview.value = res
    } catch (error) {
      logger.error('Failed to load url preview', error)
      hyperlinkPreview.value = null
    } finally {
      activeRequestCount.value--
    }
  }

  return {
    hyperlink,
    hyperlinkPreview,
    isFetchingPreview,
    isHyperlinkValid,
    saveHyperlinkToWorkbook,
    removeHyperlinkInWorkbook,
  }
}
