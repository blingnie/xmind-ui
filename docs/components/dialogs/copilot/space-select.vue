<template>
  <div>
    <fw-popover
      v-if="isShowSpaceSelect"
      :offset-x="0"
      :offset-y="8"
      :position="'bottom-left'"
      :close-on-click-outside="true"
      :close-on-click-inside-selector="'button'"
    >
      <template #trigger>
        <button
          class="text-text-primary-light hover:bg-transparent-dark-1 active:bg-mask-overlay-m-light dark:text-icon-primary-dark dark:hover:bg-transparent-white-1 dark:active:bg-mask-overlay-m-dark flex flex-row items-center gap-1 rounded px-2 py-1"
        >
          <span class="font-NeverMind-UI text-mobile-body-large sm:text-desktop-body-large">{{ selectedSpaceName }}</span>
          <fw-icon :name="'chevron-downward'" width="12" height="12" />
        </button>
      </template>
      <template #content>
        <div class="flex max-h-[320px] w-[270px] flex-col gap-2 overflow-y-auto p-2">
          <div v-for="option of spaceOptions" :key="option.id" class="f">
            <fw-menu-button class="w-full justify-between" @click.prevent="select(option.id)">
              <div class="flex items-center gap-2">
                <team-space-avatar :type="option.isPresetSpace ? 'presetSpace' : 'space'" :image-url="option.imageUrl"></team-space-avatar>
                <span class="text-mobile-body-medium sm:text-desktop-body-medium max-w-[150px] truncate">
                  {{ option.name }}
                </span>
              </div>
              <fw-icon :class="[option.id === model ? 'visible' : 'invisible']" name="tick" :width="16" :height="16" />
            </fw-menu-button>
          </div>
        </div>
      </template>
    </fw-popover>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import teamSpaceAvatar from 'client/components/team-space-avatar.vue'
import { useTeamSpaceData } from 'app/composables/team-space-data'
import { SpaceListItem } from 'client/library/teams'

const props = defineProps<{
  teamId: string
  isDisable?: boolean
}>()

const model = defineModel<string>()

const joinedTeamSpacesByTeamId = ref<SpaceListItem[]>([])
const isShowSpaceSelect = computed(
  () =>
    !props.isDisable &&
    joinedTeamSpacesByTeamId.value.length > 0 &&
    joinedTeamSpacesByTeamId.value.find(space => space?.spaceMetadata?.category !== 'preset'),
)

const spaceOptions = computed(() => {
  return joinedTeamSpacesByTeamId.value.map(space => ({
    id: space.spaceId,
    name: space.spaceMetadata.nameTranslated,
    imageUrl: space.spaceMetadata.imageUrl,
    isPresetSpace: space?.spaceMetadata?.category === 'preset',
  }))
})

const selectedSpaceName = computed(() => {
  return spaceOptions.value.find(option => option.id === model.value)?.name
})

const select = (id: string) => {
  model.value = id
}

onMounted(async () => {
  joinedTeamSpacesByTeamId.value = await useTeamSpaceData().requestJointedSpaces({ teamId: props.teamId, isSilent: true })
  if (!model.value && joinedTeamSpacesByTeamId.value.length > 0) {
    model.value = joinedTeamSpacesByTeamId.value.find(space => space?.spaceMetadata?.category === 'preset')?.spaceId || ''
  }
})
</script>
