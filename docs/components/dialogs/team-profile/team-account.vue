<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import SettingsChangeName from 'client/components/dialogs/settings-common/settings-change-name.vue'
import SettingsDelete from '../settings-common/settings-delete.vue'
import SettingsLeave from '../settings-common/settings-leave.vue'
import settingsChangeAvatar from '../settings-common/settings-change-avatar.vue'
import type { TeamMetadata, TeamPreference, TeammatePayload } from 'client/server-export'
import { useTeamSpaceData } from 'app/composables/team-space-data'
import { debounce } from 'utils/misc'
import { useWindowResize } from 'client/composables/window-resize'
import { $T } from 'client/library/translation'
import type { IconName } from 'client/components/icon/icons'
import PreferenceEnableAi from './preference-enable-ai.vue'

type TeamPreferenceUpdateProperty = keyof Omit<TeamPreference, 'teamId' | 'modifiedTime'>

const { isPhoneSizeViewportWidth } = useWindowResize()

const { isManagementRole } = helpers

const props = defineProps<{
  team: TeamMetadata & { role: TeammatePayload['role'] }
  handleChangeName?: (newName: string) => Promise<boolean>
}>()

defineEmits<{
  (e: 'delete-team'): void
  (e: 'leave-team'): void
  (e: 'update-avatar'): void
}>()

const isSwitchingPreference = ref(false)
const preferenceSwitch = ref({
  enableCopilot: true,
  enableTeamInviteLink: true,
  enableAILab: true,
})

const preference = computed(() => useTeamSpaceData().getTeamPreference(props.team.teamId))

const currentAvatar = computed(() => props.team?.imageUrl ?? '')

const isDisableUploadAvatar = computed(() => {
  const isManagementRole = props.team.role === 'owner' || props.team.role === 'admin'
  return !isManagementRole || props?.team?.category === 'preset'
})

const homePageEntryOptions = computed<Array<{ key: TeamPreference['homeEntry']; label: string; icon: IconName }>>(() => {
  return [
    { key: 'recents', label: $T('Recent'), icon: 'recent' },
    { key: 'general', label: $T('General Space'), icon: 'general' },
  ]
})

const selectedHomePageEntry = ref(useTeamSpaceData().getTeamPreference(props.team.teamId)?.homeEntry || 'recents')
const selectedHomePageEntryItem = computed(() => {
  return homePageEntryOptions.value.find(item => item.key === selectedHomePageEntry.value)
})

const changeHomePageEntry = debounce(async (newEntry: TeamPreference['homeEntry']) => {
  const oldEntry = selectedHomePageEntry.value
  if (oldEntry === newEntry) return
  selectedHomePageEntry.value = newEntry
  const success = await useTeamSpaceData().updateTeamPreference(props.team.teamId, { homeEntry: newEntry })
  !success && (selectedHomePageEntry.value = oldEntry)
}, 200)

const changeTeamPreference = async (isEnable: boolean, property: TeamPreferenceUpdateProperty) => {
  preferenceSwitch.value[property] = isEnable
  changeTeamPreferenceWithDebounce(isEnable, property)
}

const changeTeamPreferenceWithDebounce = debounce(async (isEnable: boolean, property: TeamPreferenceUpdateProperty) => {
  isSwitchingPreference.value = true
  const success = await useTeamSpaceData().updateTeamPreference(props.team.teamId, { [property]: isEnable })
  isSwitchingPreference.value = false
  if (!success) {
    preferenceSwitch.value[property] = !isEnable
  }
}, 1000)

watch(
  preference,
  newPreference => {
    if (!newPreference || isSwitchingPreference.value) return
    preferenceSwitch.value.enableCopilot = newPreference.enableCopilot
    preferenceSwitch.value.enableAILab = newPreference.enableAILab
    preferenceSwitch.value.enableTeamInviteLink = newPreference.enableTeamInviteLink
  },
  {
    immediate: true,
  },
)
</script>

<template>
  <div class="flex flex-col gap-6 px-[24px]">
    <settings-change-name :name="team.name" :handle-change-name="handleChangeName" :is-input-disabled="!isManagementRole(team)" />

    <settings-change-avatar
      :current-avatar="currentAvatar"
      :tip="$T('You can change the team icon, which appears on your team\'s home page.')"
      :is-upload-disabled="isDisableUploadAvatar"
      @upload="$emit('update-avatar')"
    />

    <fw-divider />

    <template v-if="isManagementRole(team)">
      <!-- Copilot Settings -->
      <PreferenceEnableAi
        :team-id="team.teamId"
        :enable-copilot-label="$T('Allow AI Assistant for your team')"
        :enable-copilot-desc="
          $T(
            'This option is enabled by default, providing AI-powered assistance to enhance your team\'s productivity. You can disable it here if your team prefers not to use AI features.',
          )
        "
        :enable-a-i-lab-label="$T('Enable Lab Features')"
        :enable-a-i-lab-desc="
          $T('Enable Lab Features to access beta and experimental AI capabilities. If disabled, Lab Features will be hidden and unavailable')
        "
      />

      <fw-divider />

      <!-- Team Home Page Settings -->
      <div class="flex flex-col items-start gap-3">
        <span class="text-mobile-subhead-small text-text-primary-light dark:text-text-primary-dark sm:text-desktop-subhead-small">
          {{ $T('Team Home Page') }}
        </span>
        <div class="inline-flex items-center justify-center gap-2">
          <fw-select
            :options="homePageEntryOptions"
            :selected-key="selectedHomePageEntry"
            :trigger-classes="'min-w-[200px]'"
            :menu-custom-class="'w-auto'"
            :menu-width-match-trigger="true"
            :position="'bottom-left'"
            :offset-x="0"
          >
            <template #selectedLabel>
              <div class="flex items-center gap-1">
                <fw-icon :name="selectedHomePageEntryItem.icon" :width="16" :height="16" />
                <span>{{ selectedHomePageEntryItem.label }}</span>
              </div>
            </template>

            <template #option-header>
              <span class="block truncate px-2 py-1 text-desktop-caption text-text-tertiary-light dark:text-text-tertiary-dark">{{
                $T('Select a Location')
              }}</span>
            </template>

            <template #optionItem="{ option }">
              <fw-menu-button @click="changeHomePageEntry(option.key)">
                <div class="flex w-full justify-between gap-1">
                  <div class="flex items-center gap-2">
                    <fw-icon :name="option.icon" :width="20" :height="20" />
                    <span class="text-mobile-body-medium sm:text-desktop-body-medium">{{ $T(option.label) }}</span>
                  </div>
                  <fw-icon v-if="option.key === selectedHomePageEntry" name="tick" :width="16" :height="16" />
                </div>
              </fw-menu-button>
            </template>
          </fw-select>
        </div>
        <span class="text-mobile-caption-header text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-caption-header">
          {{ $T('Choose where teammates land first — Recents or General — to help everyone dive in faster.') }}
        </span>
      </div>

      <fw-divider />

      <!-- Invitation Settings -->
      <div class="flex flex-col items-start gap-3">
        <span class="text-mobile-subhead-small text-text-primary-light dark:text-text-primary-dark sm:text-desktop-subhead-small">
          {{ $T('Team Invitation Settings') }}
        </span>
        <div class="inline-flex items-center justify-center gap-2">
          <fw-toggle
            :size="isPhoneSizeViewportWidth ? 'large' : 'small'"
            :toggle-for="'teamInviteLinkSwitch'"
            :checked="preferenceSwitch.enableTeamInviteLink"
            @toggle="changeTeamPreference($event, 'enableTeamInviteLink')"
          />
          <span class="text-mobile-body-medium text-text-primary-light dark:text-text-primary-dark sm:text-desktop-body-medium">
            {{ $T('Enable team invite link') }}
          </span>
        </div>
        <span class="text-mobile-caption-header text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-caption-header">
          {{
            $T(
              'Allow team owners to invite members via a shareable link. When enabled, an invite link will be shown during the invitation process. Anyone who joins through the link will be added to your subscription plan, which may result in additional charges.',
            )
          }}
        </span>
      </div>

      <fw-divider />

      <!-- Delete Team -->
      <settings-delete
        :heading="$T('Delete Team')"
        :tips="
          $T('Deleting this team will permanently remove all associated resources, including files, settings, and data. This action is irreversible.')
        "
        :delete-button-text="$T('Permanently Delete Team')"
        @delete="$emit('delete-team')"
      />
    </template>

    <settings-leave
      v-else
      :heading="$T('Leave Team')"
      :tips="$T('After leaving the team, you won’t have access to the maps within the team anymore.')"
      :leave-button-text="$T('Leave Team')"
      @leave="$emit('leave-team')"
    />
  </div>
</template>
