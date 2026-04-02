<script setup lang="ts">
import { TeamMetadata, TeammatePayload } from 'client/library/cloud-kit'
import PreferenceEnableAi from './preference-enable-ai.vue'

defineProps<{
  team: TeamMetadata & { role: TeammatePayload['role'] }
}>()
</script>

<template>
  <div class="flex flex-col gap-6 px-[24px]">
    <PreferenceEnableAi
      :team-id="team.teamId"
      :enable-copilot-label="$T('Enable Copilot')"
      :enable-copilot-desc="
        $T('Enable Copilot to assist with brainstorming and content generation. If disabled, Copilot will be hidden and unavailable.')
      "
      :enable-a-i-lab-label="$T('Enable Lab Features')"
      :enable-a-i-lab-desc="
        $T('Enable Lab Features to access beta and experimental AI capabilities. If disabled, Lab Features will be hidden and unavailable')
      "
    />
  </div>
</template>
