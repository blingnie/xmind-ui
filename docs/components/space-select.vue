<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useWindowResize } from 'client/composables/window-resize'
import { localStore } from 'utils/browserStorage'
import { useTeamSpaceData } from 'app/composables/team-space-data'
import { REGION } from 'client/constants'
interface SpaceSelectProps {
  spaceId: string
  storageKey?: string
}
type SpaceSelectOptions = Record<string, { teamId: string; spaceId: string; name: string; imageUrl: string }>

const props = withDefaults(defineProps<SpaceSelectProps>(), {
  storageKey: 'spaceSelectLocation',
  spaceId: '',
})

const { joinedSpaceList } = useTeamSpaceData()
const { isPhoneSizeViewportWidth } = useWindowResize()

const selectedSpaceId = ref(props.spaceId)

const isShowSpaceSelector = computed(() => joinedSpaceList.value.length > 1 && REGION === 'global')
const selectedSpace = computed(() => {
  const targetSpaceId = selectedSpaceId.value
  return teamSelectOptions.value[targetSpaceId] || null
})
const selectOptions = computed(() => {
  return Object.values(teamSelectOptions.value).map(space => ({
    key: space.spaceId,
    label: space.name,
    imageUrl: space.imageUrl,
  }))
})
const teamSelectOptions = computed<SpaceSelectOptions>(() => {
  if (!isShowSpaceSelector.value) return {}
  const options: SpaceSelectOptions = {}
  joinedSpaceList.value.forEach(space => {
    options[space.spaceId] = {
      teamId: space.teamId,
      spaceId: space.spaceId,
      name: space.spaceMetadata.nameTranslated || space.spaceMetadata.name,
      imageUrl: space.spaceMetadata.imageUrl,
    }
  })
  return options
})

const emits = defineEmits<{
  (e: 'select', spaceId: string): void
}>()

const handleSelect = (spaceId: string) => {
  selectedSpaceId.value = spaceId
  if (props.storageKey) {
    localStore.set(props.storageKey, spaceId)
  }
  emits('select', spaceId)
}

onMounted(() => {
  const cachedSelectedSpaceId = localStore.get(props.storageKey)
  if (cachedSelectedSpaceId && teamSelectOptions.value[cachedSelectedSpaceId]) {
    selectedSpaceId.value = cachedSelectedSpaceId
    emits('select', cachedSelectedSpaceId)
  }
})
</script>

<template>
  <div v-if="isShowSpaceSelector" class="relative">
    <fw-select
      :selected-key="selectedSpace?.spaceId"
      :options="selectOptions"
      :position="'bottom-left'"
      :theme="'muted'"
      :trigger-size="isPhoneSizeViewportWidth ? 'large' : 'small'"
      :trigger-custom-class="'border-none justify-start inline-flex h-6  items-center   pl-2 pr-1 text-dark-grey-8 outline-none dark:text-light-grey-1 '"
      :menu-custom-class="' w-[230px] overflow-y-auto max-h-[140px]'"
      @select="handleSelect"
    >
      <template #trigger>
        <div class="flex items-center">
          <span class="max-w-20 truncate text-mobile-body-large sm:max-w-[200px] sm:text-desktop-body-large">{{ selectedSpace?.name }}</span>
        </div>
      </template>
      <template #icon>
        <fw-icon name="chevron-downward" class="m1-2" width="16" height="16" />
      </template>
      <template #optionItem="{ option, emit }">
        <fw-menu-button class="justify-between" @click="emit('select', option.key)">
          <div class="flex items-center gap-2">
            <img class="h-4 w-4" :src="option?.imageUrl" alt="" />
            <span class="max-w-[150px] truncate text-mobile-body-medium sm:text-desktop-body-medium">{{ option.label }}</span>
          </div>
          <fw-icon :class="[option.key === selectedSpace?.spaceId ? 'visible' : 'invisible']" name="tick" />
        </fw-menu-button>
      </template>
    </fw-select>
  </div>
</template>
