<template>
  <div class="flex flex-col gap-4">
    <button
      class="flex items-center justify-between rounded p-[4px] pl-[6px] hover:bg-mask-overlay-s-light active:bg-mask-overlay-m-light dark:hover:bg-mask-overlay-s-dark dark:active:bg-mask-overlay-m-dark"
      @click="collapsed = !collapsed"
    >
      <span class="text-mobile-subhead-small sm:text-desktop-subhead-small">{{ group.name }}</span>
      <icon name="chevron-forward" :width="16" :height="16" class="transition-transform" :class="{ 'rotate-90': !collapsed }" />
    </button>

    <div
      class="relative flex flex-col gap-3 overflow-hidden"
      :class="clsx(isSurelyRendered && 'transition-all')"
      :style="{ height: collapsed ? firstItemHeight + 6 + 'px' : groupHeight + 10 + 'px' }"
    >
      <div
        ref="groupRef"
        class="absolute top-0 grid w-full gap-[10px]"
        :style="{ 'grid-template-columns': `repeat(auto-fill, minmax(${templateItemMinWidth}px, 1fr))` }"
      >
        <div
          v-for="(item, index) in group.items"
          :key="item.id"
          :ref="el => setItemRef(el as HTMLElement, index, item.id)"
          class="group/template-item relative flex w-full cursor-pointer flex-col items-center justify-center gap-2 sm:gap-3"
          :data-template-id="item.id"
          @click="handleSelect(item)"
          @dblclick="!isEnableAiTemplate(item) && handleOpen(item.id)"
        >
          <div class="relative w-full p-[5px]">
            <image-container
              :key="item.thumbnail"
              :src="item.thumbnail"
              :draggable="false"
              :class="[
                'aspect-video w-full rounded-xl object-cover outline-1 outline-border-muted-light hover:outline-2 hover:outline-offset-[2px] hover:outline-border-quaternary-light dark:outline-border-muted-dark dark:hover:outline-border-quaternary-dark',
                selectedTemplateId === item.id && '!outline-[3px] outline-offset-2 !outline-border-primary-light dark:!outline-border-primary-dark',
                'outline',
              ]"
            />

            <div
              v-if="isEnableAiTemplate(item)"
              class="absolute inset-0 m-[5px] flex flex-col items-center justify-center gap-2 rounded-xl bg-mask-overlay-l-light px-4 py-3 text-desktop-body-small transition-opacity dark:bg-mask-overlay-l-dark"
              :class="
                clsx(
                  'z-[-1] opacity-0 sm:group-hover/template-item:z-10 sm:group-hover/template-item:opacity-100',
                  selectedTemplateId === item.id && '!z-10 opacity-100',
                )
              "
            >
              <!-- Use Template Button -->
              <fw-button size="small" theme="default" class="w-full" @click.stop="handleOpen(item.id)"
                ><span class="truncate">{{ $T('Use Template') }}</span></fw-button
              >

              <!-- Create with AI Button -->
              <fw-button size="small" theme="ai" class="flex w-full items-center gap-1" @click.stop="handleCreateWithAi(item.id)">
                <span class="truncate">{{ $T('Create with AI') }}</span>
                <ai-lab-badge />
              </fw-button>
            </div>
          </div>

          <span class="max-w-full truncate px-1.5 text-center text-desktop-body-small">{{ item.name }}</span>

          <fw-icon v-if="item.license === 'pro' && showLockIcon" name="lock-pro" class="absolute right-2 top-2" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Icon from 'client/components/icon/icon.vue'
import { onMounted, ref, nextTick } from 'vue'
import imageContainer from 'client/components/base/image-container.vue'
import AiLabBadge from 'client/components/composite/ai-lab-badge.vue'
import { useElementSize } from '@vueuse/core'
import type { TemplateItem } from 'client/library/templates'

const props = defineProps<{
  group: { id: string; name: string; items: TemplateItem[] }
  templateItemMinWidth: number
  selectedTemplateId: string
  showLockIcon: boolean
  isEnableAiTemplate: (item: TemplateItem) => boolean
  registerItemRef?: (id: string, el: HTMLElement | null) => void
}>()

const firstItemRef = ref<HTMLElement | null>(null)
const groupRef = ref<HTMLElement | null>(null)

const { height: firstItemHeight } = useElementSize(firstItemRef)
const { height: groupHeight } = useElementSize(groupRef)

const setItemRef = (el: HTMLElement, index: number, id: string) => {
  if (index === 0) {
    firstItemRef.value = el
  }
  props.registerItemRef?.(id, el)
}

const emit = defineEmits<{
  (e: 'select', item: TemplateItem): void
  (e: 'open', id: string): void
  (e: 'create-with-ai', id: string): void
}>()

const collapsed = defineModel<boolean>({
  default: true,
})

const handleSelect = (item: TemplateItem) => {
  emit('select', item)
}

const handleOpen = (id: string) => {
  emit('open', id)
}

const handleCreateWithAi = (id: string) => {
  emit('create-with-ai', id)
}

const isSurelyRendered = ref(false)
onMounted(async () => {
  nextTick(() => {
    requestAnimationFrame(() => {
      isSurelyRendered.value = true
    })
  })
})
</script>
