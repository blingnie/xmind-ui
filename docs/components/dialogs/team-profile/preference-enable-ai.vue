<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useTeamSpaceData } from 'app/composables/team-space-data'
import { debounce } from 'utils/misc'
import { useWindowResize } from 'client/composables/window-resize'

const props = defineProps<{
  teamId: string
  enableAILabLabel: string
  enableAILabDesc: string
  enableCopilotLabel: string
  enableCopilotDesc: string
}>()

const { isPhoneSizeViewportWidth } = useWindowResize()

const enableCopilotSwitch = ref(true)
const enableAILabSwitch = ref(true)

const preference = computed(() => useTeamSpaceData().getTeamPreference(props.teamId))

const changeEnableCopilot = async (isEnable: boolean) => {
  enableCopilotSwitch.value = isEnable
  changeEnableCopilotWithDebounce(isEnable)
}

const changeEnableCopilotWithDebounce = debounce(async (isEnable: boolean) => {
  const success = await useTeamSpaceData().updateTeamPreference(props.teamId, { ...preference.value, enableCopilot: isEnable })
  if (!success) {
    enableCopilotSwitch.value = !isEnable
  }
}, 1000)

const changeEnableAILab = async (isEnable: boolean) => {
  enableAILabSwitch.value = isEnable
  changeEnableAILabWithDebounce(isEnable)
}

const changeEnableAILabWithDebounce = debounce(async (isEnable: boolean) => {
  const success = await useTeamSpaceData().updateTeamPreference(props.teamId, { ...preference.value, enableAILab: isEnable })
  if (!success) {
    enableAILabSwitch.value = !isEnable
  }
}, 1000)

watch(
  preference,
  newPreference => {
    if (!newPreference) return
    enableCopilotSwitch.value = newPreference.enableCopilot
    enableAILabSwitch.value = newPreference.enableAILab
  },
  {
    immediate: true,
  },
)
</script>

<template>
  <div class="flex flex-col items-start gap-5">
    <div class="flex flex-col items-start gap-3">
      <span class="text-mobile-subhead-small text-text-primary-light dark:text-text-primary-dark sm:text-desktop-subhead-small">{{
        $T('Copilot')
      }}</span>
      <div class="inline-flex items-center justify-center gap-2">
        <fw-toggle
          :size="isPhoneSizeViewportWidth ? 'large' : 'small'"
          :toggle-for="'copilotSwitch'"
          :checked="enableCopilotSwitch"
          @toggle="changeEnableCopilot"
        />
        <span class="text-mobile-body-medium text-text-primary-light dark:text-text-primary-dark sm:text-desktop-body-medium">
          {{ enableCopilotLabel }}
        </span>
      </div>
      <span class="text-mobile-caption-header text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-caption-header">
        {{ enableCopilotDesc }}
      </span>
    </div>
    <div v-if="enableCopilotSwitch" class="flex flex-col items-start gap-3">
      <span class="text-mobile-subhead-small text-text-primary-light dark:text-text-primary-dark sm:text-desktop-subhead-small">{{
        $T('AI Lab')
      }}</span>
      <div class="inline-flex items-center justify-center gap-2">
        <fw-toggle
          :size="isPhoneSizeViewportWidth ? 'large' : 'small'"
          :toggle-for="'aiLabSwitch'"
          :checked="enableAILabSwitch"
          @toggle="changeEnableAILab"
        />
        <span class="text-mobile-body-medium text-text-primary-light dark:text-text-primary-dark sm:text-desktop-body-medium">
          {{ enableAILabLabel }}
        </span>
      </div>
      <span class="text-mobile-caption-header text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-caption-header">
        {{ enableAILabDesc }}
      </span>
    </div>
  </div>
</template>
