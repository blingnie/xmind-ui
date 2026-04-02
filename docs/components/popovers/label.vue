<template>
  <fw-responsive-wrapper>
    <template #desktop>
      <div>
        <app-base-topic-locator-popover
          :topic-ids="selectionIds"
          :workbook-id="workbookId"
          :value="isLabelPopoverOpened && isMounted"
          :height="220"
          :width="300"
          @input="handleVisibleChange"
        >
          <div class="flex h-full flex-col items-center gap-3 p-4">
            <h4 class="w-full text-left text-desktop-subhead-small text-text-primary-light dark:text-text-primary-dark">
              {{ $T('Label') }}
            </h4>
            <div class="w-full flex-1">
              <textarea
                ref="labelInput"
                v-model="currentLabels"
                :maxlength="10000"
                theme="default"
                :class="'h-full w-full resize-none rounded bg-transparent px-0 pl-0 text-mobile-body-medium outline-none sm:text-desktop-body-medium'"
                :placeholder="$T('Enter labels, separated by commas')"
                @keypress.enter.stop.prevent="handleChangeLabels()"
              ></textarea>
            </div>
            <template v-if="allLabelsOfCurrentMap.length > 0">
              <fw-divider class="w-full" />
              <div class="flex max-h-12 w-full flex-wrap gap-1 overflow-hidden">
                <span
                  v-for="label of allLabelsOfCurrentMap"
                  :key="label"
                  class="flex h-5 max-w-32 cursor-default items-center truncate rounded-[10px] bg-mask-overlay-s-light px-3 text-desktop-body-small text-text-secondary-light dark:bg-mask-overlay-s-dark dark:text-text-secondary-dark"
                  @click.prevent="handleAddLabel(label)"
                  >{{ label }}</span
                >
              </div>
            </template>
          </div>
        </app-base-topic-locator-popover>
      </div>
    </template>
    <template #mobile>
      <transition name="fade">
        <drawer-mask v-if="isLabelPopoverOpened && isMounted" class="z-common-popover" @click.stop="handleClosePage" />
      </transition>
      <transition name="slide-in-out">
        <bottom-drawer
          v-if="isLabelPopoverOpened && isMounted"
          :class="'bg-fill-container-light dark:bg-fill-container-dark'"
          class="fixed bottom-0 z-common-popover max-h-[calc(100%-32px)]"
        >
          <div class="flex h-full w-full flex-col gap-2">
            <div class="relative flex items-center px-6 pb-4 pt-6">
              <span class="absolute left-1/2 -translate-x-1/2 text-mobile-subhead-small text-text-primary-light dark:text-text-primary-dark">
                {{ $T('Label') }}
              </span>
              <span class="ml-auto cursor-pointer text-mobile-subhead-mini text-blue-5" @click="handleChangeLabels">
                {{ $T('Done') }}
              </span>
            </div>

            <div class="flex flex-1 flex-col px-4 pb-6">
              <textarea
                ref="labelInput"
                v-model="currentLabels"
                :maxlength="10000"
                class="w-full flex-1 resize-none rounded bg-transparent text-mobile-body-medium outline-none"
                style="border: none; box-shadow: none; background-color: transparent; min-height: 120px"
                :placeholder="$T('Enter labels, separated by commas')"
                @keypress.enter.stop.prevent="handleChangeLabels"
              ></textarea>

              <div v-if="allLabelsOfCurrentMap.length > 0" class="mt-3">
                <fw-divider class="mb-3 w-full border-divider-strong-light dark:border-divider-strong-dark" />
                <div class="flex w-full flex-wrap gap-2">
                  <span
                    v-for="label of allLabelsOfCurrentMap"
                    :key="label"
                    class="flex cursor-pointer items-center truncate rounded-lg bg-mask-overlay-s-light px-3 py-1 text-mobile-body-small text-text-secondary-light dark:bg-mask-overlay-s-dark dark:text-text-secondary-dark"
                    @click.prevent="handleAddLabel(label)"
                  >
                    {{ label }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </bottom-drawer>
      </transition>
    </template>
  </fw-responsive-wrapper>
</template>

<script lang="ts" setup>
import { ref, computed, onBeforeUnmount, onMounted } from 'vue'
import { deepEqual } from 'utils/misc'
import { dataKit, useMindMap } from 'compositions/mindmap'
import AppBaseTopicLocatorPopover from './base-topic-locator.vue'
import DrawerMask from 'client/components/base/drawer-mask.vue'
import BottomDrawer from 'client/components/base/bottom-drawer.vue'
import { WorkbookManager } from 'client/library/workbook-next/workbook-manager'
import { Workbook } from 'client/library/workbook-next/workbook'
import { useWindowResize } from 'client/composables/window-resize'

const props = withDefaults(
  defineProps<{
    isOpened: boolean
    workbookId?: string
  }>(),
  { workbookId: '' },
)

const emit = defineEmits<{ (e: 'visibility-change', newValue: boolean): void }>()

const labelInput = ref<HTMLTextAreaElement>()
let closeType = 'Normal_Save'

const workbook = computed(() => props.workbookId && WorkbookManager.find(props.workbookId))
const labels = computed(() => workbook.value.workbookEditor.properties.value.topicLabel?.value.labels)
const currentLabels = ref<string>(labels.value.toString() || '')
const selectionIds = (workbook.value instanceof Workbook && workbook.value.selectionIds) ?? []
const isLabelPopoverOpened = computed(() => props.isOpened)
const isMounted = ref(false)
const { isPhoneSizeViewportWidth } = useWindowResize()
const allLabelsOfCurrentMap = computed(() =>
  props.isOpened
    ? [
        ...new Set(
          useMindMap()
            ?.sheets.value?.map(sheet => dataKit.allLabelsFromSheet(sheet))
            ?.flat(),
        ),
      ].filter(Boolean)
    : [],
)

const handleVisibleChange = (newValue: boolean) => {
  emit('visibility-change', Boolean(newValue))
}
const handleChangeLabels = () => {
  if (!workbook.value) return
  if (isPhoneSizeViewportWidth.value) {
    updateLabelContent(currentLabels.value)
  }
  handleVisibleChange(false)
}

const handleClosePage = () => {
  closeType = 'Cancel'
  handleVisibleChange(false)
}

const formatContent = (content): string => {
  return content
    .replace(/，/g, ',')
    .split(',')
    .map(label => label.trim())
    .filter(label => label.length > 0)
    .filter((label, index, array) => array.indexOf(label) === index)
}

const updateLabelContent = content => {
  const newContent = formatContent(content)
  if (deepEqual(newContent, labels.value)) return
  workbook.value.workbookEditor.executeAction({
    name: 'mutateTarget:topicLabel',
    payload: {
      topicIds: selectionIds,
      labels: newContent,
    },
  })
}

const focusLabelTextarea = async () => {
  await new Promise(resolve => setTimeout(resolve, 50))
  labelInput.value?.focus()
}

const handleAddLabel = (label: string) => {
  if (currentLabels.value.trim().endsWith(',') || currentLabels.value.trim().length === 0) {
    currentLabels.value = currentLabels.value + label.trim()
  } else {
    currentLabels.value = currentLabels.value + `,${label.trim()}`
  }
  focusLabelTextarea()
}

onBeforeUnmount(() => {
  if (workbook.value && closeType == 'Normal_Save') {
    updateLabelContent(currentLabels.value)
  }
})

onMounted(async () => {
  closeType = 'Normal_Save'
  await new Promise(resolve => requestAnimationFrame(() => resolve(true)))
  isMounted.value = true
  focusLabelTextarea()
})
</script>
