<template>
  <transition name="fade" appear>
    <div :class="twMerge('absolute inset-0 z-modal-dialog-mask bg-[rgba(0,0,0,0.5)] dark:bg-[rgba(0,0,0,0.7)]')"></div>
  </transition>
  <modal-dialog
    ref="dialogRef"
    v-if="isChooseTemplateDialogOpen"
    :is-opened="isChooseTemplateDialogOpen"
    :width="isPhoneSizeViewportWidth ? '100%' : '80%'"
    :height="isPhoneSizeViewportWidth ? '100%' : '80%'"
    :max-width="isPhoneSizeViewportWidth ? '100%' : '1036px'"
    :max-height="isPhoneSizeViewportWidth ? '100%' : '80%'"
    :dialog-class="'sm:!rounded-2xl !rounded-none'"
    :modal-classes="isPhoneSizeViewportWidth ? 'animate-mobile-dialog-enter' : ''"
    :dialog-footer-class="'border-t border-border-muted-light dark:border-border-muted-dark'"
    dialog-overlay-class="opacity-0"
    :close-button="false"
    :esc-close="true"
    :use-overlay-scrollbar="true"
    @modal-dialog-close="handleClose"
  >
    <template #header>
      <div class="flex w-full items-center justify-between pb-6">
        <span class="text-mobile-display-3 sm:text-desktop-headline-small">{{ $T('Choose a Template') }}</span>
        <space-select :space-id="selectedSpaceId" :storage-key="SPACE_TEMPLATE_LOCATION_KEY" @select="selectedSpaceId = $event" />
      </div>
    </template>

    <template v-if="!interactionObserverRefIsVisible" #separator>
      <div class="h-0 w-full">
        <base-divider class="mt-[-1px]" />
      </div>
    </template>

    <template #outer-body>
      <div ref="templateGroupsRef" class="relative h-full w-full max-w-full px-6 pb-4 text-desktop-body-1 outline-none sm:p-6">
        <div ref="interactionObserverRef" class="absolute top-0 h-0 w-full"></div>
        <div class="flex flex-col gap-6" v-if="visibleGroups.length > 0">
          <template-group
            v-for="(group, index) in visibleGroups"
            :key="index"
            :group="group"
            v-model="collapseMap[group.id]"
            :template-item-min-width="isLargeViewportWidth ? templateCardMinWidth : templateCardMinWidthSmall"
            :selected-template-id="selectedTemplateId"
            :show-lock-icon="isShowLockIcon"
            :is-enable-ai-template="isEnableAiTemplate"
            :register-item-ref="registerTemplateItemRef"
            @select="handleSelect"
            @open="id => handleCreate(id)"
            @create-with-ai="handleCreateWithAi"
          ></template-group>

          <div class="h-1"></div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex items-center gap-2 sm:justify-end">
        <base-button
          class="flex-1 sm:flex-none"
          :theme="enableAILab ? 'secondary' : 'default'"
          :size="isPhoneSizeViewportWidth ? 'large' : 'small'"
          @click="handleClose"
        >
          {{ $T('Cancel') }}
        </base-button>
        <base-button
          v-if="!enableAILab"
          class="flex-1 sm:flex-none"
          :theme="'secondary'"
          :disabled="!selectedTemplateId"
          :size="isPhoneSizeViewportWidth ? 'large' : 'small'"
          @click="handleCreateFromSelected"
        >
          {{ $T('Create') }}
        </base-button>
      </div>
    </template>
  </modal-dialog>
</template>

<script setup lang="ts">
import BaseDivider from 'client/components/base/divider.vue'
import BaseButton from 'client/components/base/button.vue'
import TemplateGroup from 'client/components/dialogs/templates/template-group.vue'
import spaceSelect from 'client/components/space-select.vue'
import { usePromiseHook } from 'utils/vue-utils'
import ModalDialog from 'client/components/new-base-modal-dialog.vue'
import { useWindowResize } from 'client/composables/window-resize'
import { $T, CopilotLanguage } from 'client/library/translation'
import { computed, onMounted, ref, watch, useTemplateRef, reactive } from 'vue'
import { useTeamSpaceData } from 'app/composables/team-space-data'
import { useMindmapTemplates } from 'app/composables/mindmap-templates'
import { useElementVisibility, useMutationObserver } from '@vueuse/core'
import { useServiceStore } from 'client/store'
import { TemplateBasicInfo, TemplateItem } from 'client/library/templates'
import { debounce } from 'utils/misc'
import { useTemplateAiHistory } from './use-template-ai-history'

const props = defineProps<{
  teamId: string
  currentFolderId: string
  initialSpaceId?: string
  initialTemplateId?: string
  autoCreateWithAi?: boolean
  createFromTemplate: (templateInfo: TemplateBasicInfo, spaceId?: string) => void | Promise<void>
  createFromAiTemplate: (args: { templateItem: TemplateItem; prompt: string; language: CopilotLanguage | 'auto'; spaceId?: string }) => Promise<{
    status: 'success' | 'failed' | 'cancelled' | 'forbidden'
  }>
}>()

const templateCardMinWidthSmall = 150
const templateCardMinWidth = 228

const SPACE_TEMPLATE_LOCATION_KEY = `spaceTemplateLocation_${props.teamId}`
const templateGroupsRef = useTemplateRef('templateGroupsRef')
const interactionObserverRef = ref<HTMLElement | null>(null)
const filterKey = ref('all')
const selectedTemplateId = ref(props.initialTemplateId || '')
const isChooseTemplateDialogOpen = ref(true)

const { presetSpaceId, getTeamPreference } = useTeamSpaceData()
const selectedSpaceId = ref(props.initialSpaceId || presetSpaceId.value)
const { resolve } = usePromiseHook()
const { isPhoneSizeViewportWidth, isLargeViewportWidth } = useWindowResize()
const { templateGroups } = useMindmapTemplates()
const hasAutoCreated = ref(false)
const templateItemRefs = new Map<string, HTMLElement>()

const teamPreference = computed(() => getTeamPreference(props.teamId))
const enableAILab = computed(() => teamPreference.value.enableAILab)

const findTemplateItem = (targetTemplateId: string) => templateGroups.value.flatMap(group => group.items).find(item => item.id === targetTemplateId)

const interactionObserverRefIsVisible = useElementVisibility(interactionObserverRef)
const visibleGroups = computed(() => {
  if (filterKey.value === 'all') {
    return templateGroups.value
  } else {
    return templateGroups.value.filter(group => group.id === filterKey.value)
  }
})
const handleClose = () => {
  resolve(false)
}

const isShowLockIcon = computed(() => {
  return !useTeamSpaceData().checkIsTeamHasAnyPlan(props.teamId)
})

const initialCollapsed = (items: TemplateItem[]) => {
  if (props.initialTemplateId) {
    return !items.find(item => item.id === props.initialTemplateId)
  }
  return true
}

const createTemplateCollapseMap = () => {
  const map: Record<string, boolean> = {}
  for (const group of templateGroups.value) {
    map[group.id] = initialCollapsed(group.items)
  }
  return map
}
const collapseMap = reactive(createTemplateCollapseMap())

const isEnableAiTemplate = (item: TemplateItem) => {
  return enableAILab.value && item.groupId !== 'basic'
}

const handleCreate = async (targetTemplateId: string) => {
  const templateItem = findTemplateItem(targetTemplateId)
  if (!templateItem) {
    logger.warn(`Template item with id ${targetTemplateId} not found`)
    return
  }
  resolve(true)
  props.createFromTemplate(templateItem, selectedSpaceId.value)
}

const handleSelect = (item: TemplateItem) => {
  selectedTemplateId.value = item.id
  if (enableAILab.value && item.groupId === 'basic') {
    handleCreate(item.id)
  }
}

const handleCreateFromSelected = () => {
  return handleCreate(selectedTemplateId.value)
}

let isCreatingWithAi = false
const handleCreateWithAi = async (templateId: string) => {
  if (!templateId || isCreatingWithAi) return
  selectedTemplateId.value = templateId

  const templateItem = findTemplateItem(templateId)

  if (!templateItem) {
    logger.warn(`Template item with id ${templateId} not found`)
    return
  }
  isChooseTemplateDialogOpen.value = false
  isCreatingWithAi = true
  const res = await useServiceStore().services?.action?.dialog?.openNewFileWithAITemplateDialog({
    templateItem,
    isTransparentOverlay: true,
    teamId: props.teamId,
    initialSpaceId: selectedSpaceId.value,
  })
  if (!res) {
    isCreatingWithAi = false
    isChooseTemplateDialogOpen.value = true
    return
  }
  const { prompt, language, spaceId } = res
  props
    .createFromAiTemplate({
      templateItem,
      prompt,
      language,
      spaceId,
    })
    .then(({ status }) => {
      if (status === 'success') {
        useTemplateAiHistory().clearTemplateAiHistory()
      }
      if (status === 'failed') {
        logger.warn('Create from AI template failed, reopen choose template dialog')
        setTimeout(
          () =>
            useServiceStore().services?.action?.dialog?.openChooseATemplateDialog({
              teamId: props.teamId,
              currentFolderId: props.currentFolderId,
              initialSpaceId: spaceId,
              initialTemplateId: templateId,
              autoCreateWithAi: true,
            }),
          300,
        )
      }
    })
  resolve(true)
}

const scrollToInitialTemplate = async () => {
  // wait for template groups to render ended
  await new Promise(resolve => {
    const { stop } = useMutationObserver(
      templateGroupsRef,
      debounce(() => {
        resolve(true)
        stop()
      }, 100),
      { subtree: true, childList: true },
    )
  })
  if (!selectedTemplateId.value) return
  requestAnimationFrame(() => {
    const target = templateItemRefs.get(selectedTemplateId.value)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'start' })
    }
  })
}

const maybeAutoCreateWithAi = async () => {
  if (!props.autoCreateWithAi || !props.initialTemplateId || hasAutoCreated.value) return
  const templateItem = findTemplateItem(props.initialTemplateId)
  if (!templateItem) return
  hasAutoCreated.value = true
  await handleCreateWithAi(props.initialTemplateId)
}

const registerTemplateItemRef = (id: string, el: HTMLElement | null) => {
  if (!el) {
    templateItemRefs.delete(id)
    return
  }
  templateItemRefs.set(id, el)
}

onMounted(async () => {
  maybeAutoCreateWithAi()
})

watch(
  () => isChooseTemplateDialogOpen.value,
  debounce(() => {
    isChooseTemplateDialogOpen.value && scrollToInitialTemplate()
  }, 200),
  { immediate: true },
)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease-in-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
