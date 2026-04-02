<template>
  <fw-responsive-wrapper>
    <template #desktop>
      <div class="readonly-note">
        <app-base-topic-locator-popover
          :topic-ids="selectionIds"
          :workbook-id="workbookId"
          :value="isOpened && isMounted"
          :padding-top="paddingTop"
          :padding-left="paddingLeft"
          :padding-right="paddingRight"
          :padding-bottom="paddingBottom"
          :height="280"
          :width="400"
          @input="handleVisibleChange"
        >
          <div class="relative flex h-full w-full flex-col gap-3 p-4 pr-0">
            <h3 class="text-desktop-subhead-small">
              {{ 'Note' }}
            </h3>
            <div class="h-full w-full overflow-auto outline-none" tabindex="-1">
              <div ref="container" class="w-full overflow-auto" @input.stop.self />
            </div>
          </div>
        </app-base-topic-locator-popover>
      </div>
    </template>
    <template #mobile>
      <transition name="fade">
        <drawer-mask v-if="isOpened && isMounted" class="z-common-popover" @click.stop="handleClosePage" />
      </transition>
      <transition name="slide-in-out">
        <bottom-drawer
          v-if="isOpened && isMounted"
          :class="'bg-fill-container-light dark:bg-fill-container-dark'"
          class="fixed bottom-0 z-common-popover max-h-[calc(100%-32px)]"
        >
          <div class="flex h-full w-full flex-col gap-2">
            <div class="relative flex items-center px-6 pb-4 pt-6">
              <span class="absolute left-1/2 -translate-x-1/2 text-mobile-subhead-small text-text-primary-light dark:text-text-primary-dark">
                {{ 'Note' }}
              </span>
              <span class="ml-auto cursor-pointer text-mobile-subhead-mini text-blue-5" @click="handleClosePage">
                {{ $T('Done') }}
              </span>
            </div>

            <div class="flex flex-1 flex-col px-4 pb-6">
              <div class="flex-1 overflow-hidden rounded-lg">
                <div
                  ref="container"
                  class="trix-notes-editor-container w-full py-0 text-mobile-body-medium text-text-primary-light dark:text-text-primary-dark"
                  style="overflow: auto; cursor: text; height: 100%"
                  @input.stop.self
                />
              </div>
            </div>
          </div>
        </bottom-drawer>
      </transition>
    </template>
  </fw-responsive-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted } from 'vue'
import AppBaseTopicLocatorPopover from './base-topic-locator.vue'
import DrawerMask from 'client/components/base/drawer-mask.vue'
import BottomDrawer from 'client/components/base/bottom-drawer.vue'
import { WorkbookManager } from 'client/library/workbook-next/workbook-manager'
import { useWindowResize } from 'client/composables/window-resize'

export default defineComponent({
  name: 'AppReadonlyNotePopover',
  components: {
    AppBaseTopicLocatorPopover,
    DrawerMask,
    BottomDrawer,
  },
  props: {
    workbookId: {
      type: String,
      default: '',
    },
    isOpened: {
      type: Boolean,
      default: false,
    },
    paddingTop: {
      type: Number,
      default: 0,
    },
    paddingLeft: {
      type: Number,
      default: 0,
    },
    paddingBottom: {
      type: Number,
      default: -100,
    },
    paddingRight: {
      type: Number,
      default: 0,
    },
  },
  emits: ['visibility-change'],
  setup(props, ctx) {
    const container = ref<HTMLElement>()
    const isMounted = ref(false)
    const { isPhoneSizeViewportWidth } = useWindowResize()

    const NotesEditor = window.Notes.Editor
    const workbook = computed(() => WorkbookManager.find(props.workbookId))
    const selectionIds = computed(() => workbook.value.selectionIds ?? [])
    const notesContent = computed(() => {
      const notes = workbook.value?.workbookEditor.syncedProperties.value.notes?.value
      if (!props.isOpened) return ''
      return notes
    })

    const handleVisibleChange = (newValue: boolean) => ctx.emit('visibility-change', newValue)

    const handleClosePage = () => {
      ctx.emit('visibility-change', false)
    }

    let editor: any = null
    watch(
      () => notesContent.value,
      () => {
        if (notesContent.value) {
          editor?.setNoteData({
            plain: { content: notesContent.value.text ?? '' },
            realHTML: { content: notesContent.value.html ?? '' },
          })
        }
      },
      { immediate: true },
    )

    const handlePatchLinkActivated = (e: any) => {
      const href = NotesEditor.getHref(e.target)
      if (href) {
        window.open(href, '_blank')
        e.preventDefault()
        e.stopImmediatePropagation()
        e.stopPropagation()
      }
    }

    const initializeEditor = async () => {
      editor = new NotesEditor({ container: container.value as HTMLElement })
      if (notesContent.value) {
        editor?.setNoteData({
          plain: { content: notesContent.value.text ?? '' },
          realHTML: { content: notesContent.value.html ?? '' },
        })
      }
      // Uses mousedown instead of link-activated event because trix focus control are conflict with 'map-focus-plugin.ts'.
      container.value?.addEventListener('mousedown', handlePatchLinkActivated, { capture: true })
      // Trix Editor are not supports readonly. Simply remove contenteditable attribute.
      container.value?.querySelectorAll('[contenteditable]').forEach(el => {
        el.setAttribute('contenteditable', 'false')
      })
    }

    onMounted(async () => {
      if (isPhoneSizeViewportWidth.value) {
        await new Promise(resolve => requestAnimationFrame(() => resolve(true)))
        isMounted.value = true
        await new Promise(resolve => requestAnimationFrame(() => resolve(true)))

        if (container.value) {
          await initializeEditor()
        }
      } else {
        await new Promise(resolve => requestAnimationFrame(() => resolve(true)))
        if (container.value) {
          await initializeEditor()
        }
        isMounted.value = true
        await new Promise(resolve => requestAnimationFrame(() => resolve(true)))
      }
    })

    return {
      selectionIds,
      container,
      isMounted,
      notesContent,
      handleVisibleChange,
      handleClosePage,
    }
  },
})
</script>

<style lang="less">
// Warning no scoped less styles here due to [uk-icon] UIkit component
.readonly-note .uk-button-tile fw-button-icon > span > * {
  height: 16px;
  width: 16px;
}

.readonly-note {
  a {
    color: #3665bb;
    text-decoration: underline;
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: #4b83ca;
      text-decoration: underline;
    }

    &:active {
      color: #024f9c;
    }
  }
}

.trix-notes-editor-container {
  ul,
  ol {
    padding-left: 30px;
  }
}
</style>
