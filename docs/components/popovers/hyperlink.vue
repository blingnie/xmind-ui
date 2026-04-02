<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'
import AppBaseTopicLocatorPopover from './base-topic-locator.vue'
import AppBaseTopicLocatorPage from './base-topic-locator-page.vue'
import { v1 as uuid } from 'uuid'
import { WorkbookManager } from 'client/library/workbook-next/workbook-manager'
import { useMindMap } from 'compositions/mindmap'

export default defineComponent({
  name: 'AppHyperLinkPopover',
  components: {
    AppBaseTopicLocatorPopover,
    AppBaseTopicLocatorPage,
  },
  props: {
    isOpened: {
      type: Boolean,
      required: true,
    },
    workbookId: {
      type: String,
      default: '',
    },
  },
  emits: ['visibility-change'],
  setup(props, ctx) {
    const { selection } = useMindMap()
    const workbook = computed(() => props.workbookId && WorkbookManager.find(props.workbookId))

    // Seems template refs not work in slot, use querySelector and query child input contianer
    const container = ref<HTMLDivElement>(null)
    const inputId = 'input-' + uuid()
    const hyperlink = ref<string>('')
    const hyperlinkInput = ref<HTMLTextAreaElement>()

    const selectionIds = computed(() => selection.value?.modelIds ?? [])
    const isHyperlinkPopoverOpened = computed(() => props.isOpened)
    const isSmallMode = computed(() => {
      return window.matchMedia('(max-width: 413.5px)').matches
    })

    const handleVisibleChange = (newValue: boolean) => {
      // action.ui.openHyperlinkPopover({ status: newValue })
      ctx.emit('visibility-change', Boolean(newValue))
      if (!newValue) {
        handleHyperlinkChange()
      }
    }

    const refreshHyperlink = async () => {
      hyperlink.value = ''
      if (!workbook.value) return
      const retrievedHyperlink = workbook.value.workbookEditor.syncedProperties.value.webLink?.value?.href
      if (retrievedHyperlink) {
        hyperlink.value = retrievedHyperlink
      } else {
        hyperlink.value = ''
        if (container.value) {
          await new Promise(resolve => setTimeout(resolve))
          const inputElement = container.value.querySelector(`[data-input-id=${inputId}]`) as HTMLInputElement
          if (inputElement) {
            inputElement.select()
          }
        }
      }
    }

    const setHyperlink = (link: string) => {
      if (!workbook.value) return
      let hyperlink = (link || '').trim()
      const DEFAULT_HYPERLINK = 'http://'
      const DEFAULT_EMAILLINK = 'mailto:'
      if (hyperlink && !hyperlink.match(/([a-zA-Z0-9]+:\/\/|xmind:#|mailto:)/)) {
        if (hyperlink.match(/[\d\w]+\b@[a-zA-ZA-z0-9]+\.[a-z]+/g)) {
          hyperlink = DEFAULT_EMAILLINK + hyperlink
        } else {
          hyperlink = DEFAULT_HYPERLINK + hyperlink
        }
      }

      // Delete hyperlink when it is empty
      if (!hyperlink.length || hyperlink === 'http://') {
        hyperlink = ''
      }
      workbook.value?.workbookEditor.executePropertyAction({
        name: 'mutateProperty:webLink',
        payload: {
          href: hyperlink,
        },
      })
    }

    const handleHyperlinkChange = () => {
      setHyperlink(hyperlink.value)
      ctx.emit('visibility-change', false)
    }

    const handleClosePage = () => {
      ctx.emit('visibility-change', false)
    }

    watch(
      () => isHyperlinkPopoverOpened.value,
      async isOpened => {
        if (isOpened) {
          refreshHyperlink()
          await new Promise(resolve => setTimeout(resolve, 100))
          hyperlinkInput.value?.focus()
        }
      },
      { immediate: true },
    )

    return {
      hyperlinkInput,
      inputId,
      container,
      hyperlink,
      isSmallMode,
      selectionIds,
      handleVisibleChange,
      handleHyperlinkChange,
      isHyperlinkPopoverOpened,
      handleClosePage,
    }
  },
})
</script>

<template>
  <div ref="container">
    <app-base-topic-locator-popover
      v-if="!isSmallMode"
      :workbook-id="workbookId"
      :topic-ids="selectionIds"
      :value="isHyperlinkPopoverOpened"
      :height="110"
      :width="300"
      class="is-large-view"
      @input="handleVisibleChange"
    >
      <div class="uk-padding uk-flex uk-flex-column uk-flex-middle uk-height-1-1">
        <h4 class="uk-margin-small-bottom uk-width-1-1 uk-text-disabled uk-text-bold">
          {{ $T('Hyperlink') }}
        </h4>
        <div class="uk-height-expand uk-width-1-1">
          <textarea
            ref="hyperlinkInput"
            v-model="hyperlink"
            :data-input-id="inputId"
            type="url"
            class="uk-textarea hyperlink-popover-textarea uk-width-1-1 uk-height-1-1 uk-padding-remove uk-margin-remove"
            style="border: none; box-shadow: none; background-color: transparent"
            :placeholder="$T('Enter the URL')"
            @keypress.enter.stop.prevent="handleHyperlinkChange"
          ></textarea>
        </div>
      </div>
    </app-base-topic-locator-popover>
    <app-base-topic-locator-page
      v-if="isSmallMode"
      :value="isHyperlinkPopoverOpened"
      title="Hyperlink"
      class="is-small-view"
      @close="handleClosePage"
      @input="handleVisibleChange"
    >
      <textarea
        ref="hyperlinkInput"
        v-model="hyperlink"
        type="url"
        class="uk-textarea hyperlink-popover-textarea uk-width-1-1 uk-height-1-1 uk-padding-remove uk-margin-remove"
        style="border: none; box-shadow: none; background-color: transparent"
        :placeholder="$T('Enter the URL')"
        @keydown.enter.stop.prevent="handleHyperlinkChange"
      ></textarea>
    </app-base-topic-locator-page>
  </div>
</template>

<style lang="less" scoped>
.hyperlink-popover-textarea {
  // prevent tab highlighting on iOS.
  -webkit-tap-highlight-color: transparent;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 14px !important;
    height: 16px !important;
  }

  &::-webkit-scrollbar-thumb {
    display: block !important;
    background-color: rgba(0, 0, 0, 0.2) !important;
  }
}

.is-small-view {
  display: none;
}
@media screen and (max-width: 413.5px) {
  .is-large-view {
    display: none;
  }
  .is-small-view {
    display: block;
  }
}
</style>
