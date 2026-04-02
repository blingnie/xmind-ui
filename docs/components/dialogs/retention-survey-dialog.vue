<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
// components
import ModalDialog from 'client/components/new-base-modal-dialog.vue'
import BaseButton from 'client/components/base/button.vue'
import baseDivider from 'client/components/base/divider.vue'
import checkboxItem from 'client/components/composite/checkbox-item.vue'
// images
import MindmapDark from 'import-files/retention/mindmap-dark.jpg'
import MindmapLight from 'import-files/retention/mindmap-light.jpg'
import CreditsDark from 'import-files/retention/credits-dark.jpg'
import CreditsLight from 'import-files/retention/credits-light.jpg'
import taskDark from 'import-files/retention/task-dark.jpg'
import taskLight from 'import-files/retention/task-light.jpg'
import versionHistoryDark from 'import-files/retention/version-history-dark.jpg'
import versionHistoryLight from 'import-files/retention/version-history-light.jpg'
// composables
import { usePromiseHook } from 'utils/vue-utils'
import { useTeamSpaceData } from 'app/composables/team-space-data'
import { $T } from 'client/library/translation'
import { useCloudKitClient } from 'app/composables/cloud-kit-client'
import { useAppStore, useUserBaseProfileStore } from 'client/store'
import { useWindowResize } from 'client/composables/window-resize'

const props = defineProps<{
  expiredTime: string
  teamIdToCancel: string
}>()

const { getUnexpiredTeamPlanSync, getTeamPlanProfileAsync, fetchTeamMetadata, getTeamOwner, defaultTeamId } = useTeamSpaceData()

const { resolve } = usePromiseHook()

const isSending = ref(false)
const isContinued = ref(false)
const isConfirm = ref(false)
const isDialogOpened = ref(true)
const otherDescription = ref('')

const { isPhoneSizeViewportWidth } = useWindowResize()

const resources = computed(() => {
  const isDarkAppearance = useAppStore().appearance === 'dark'
  return {
    mindmap: {
      source: isDarkAppearance ? MindmapDark : MindmapLight,
      text: $T('Unlimited Maps'),
    },
    versionHistory: {
      source: isDarkAppearance ? versionHistoryDark : versionHistoryLight,
      text: $T('30-Day Version History'),
    },
    task: {
      source: isDarkAppearance ? taskDark : taskLight,
      text: $T('Add Tasks, Equations and Attachments'),
    },
    credits: {
      source: isDarkAppearance ? CreditsDark : CreditsLight,
      text: $T('800 Credits / Seat / Month'),
    },
  }
})

const cancel = () => resolve(false)
const unexpiredTeamPlan = computed(() => getUnexpiredTeamPlanSync(props.teamIdToCancel))

const computedWidth = computed(() => (window.innerWidth > 768 ? 520 : 343))
const formattedPlanName = computed(() => {
  const planName = unexpiredTeamPlan.value.charAt(0).toUpperCase() + unexpiredTeamPlan.value.slice(1)
  switch (planName) {
    case 'Premium':
      return $T('Premium')
    case 'Essential':
      return $T('Essential')
    case 'Business':
      return $T('Business')
    case 'Personal':
      return $T('Personal')
    case 'Team':
      return $T('Team')
    default:
      return $T('basic')
  }
})
const handleContinue = () => {
  isContinued.value = true
}
const handleBack = () => {
  Object.keys(checkers).forEach(key => {
    checkers[key] = false
  })
  otherDescription.value = ''
  isContinued.value = false
}
const checkers = reactive({
  tooComplicated: false,
  lackFeatures: false,
  tooExpensive: false,
  foundAnother: false,
  noNeed: false,
  other: false,
})
const isAllowedToSend = computed(() => Object.values(checkers).some(value => value))

const checkerTitles = computed(() => {
  const titles = {
    tooComplicated: $T('Too Complicated to Use or Learn'),
    lackFeatures: $T('Lacking the Features I Need'),
    tooExpensive: $T('Too Expensive'),
    foundAnother: $T('Found a Better Alternative'),
    noNeed: $T("Don't Need the Service at the Moment"),
    other: $T('Other'),
  }
  const randomize = obj => {
    const entries = Object.entries(obj).filter(([key]) => key !== 'other')
    // Fisher-Yates Shuffle
    for (let i = entries.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[entries[i], entries[j]] = [entries[j], entries[i]]
    }
    return Object.fromEntries([...entries, ['other', obj['other']]])
  }

  return randomize(titles)
})

const feedbackSent = ref(false)
const handleCancelPlanSendFeedback = async () => {
  isSending.value = true

  const teamMetadata = await fetchTeamMetadata({ teamId: props.teamIdToCancel })
  const teamOwner = await getTeamOwner(props.teamIdToCancel)
  if (!teamOwner?.userId) return ''
  const teamOwnerProfile = await useUserBaseProfileStore().getUserBaseProfile(teamOwner.userId)
  const teamOwnerEmail = teamOwnerProfile?.email
  const teamProfile = await getTeamPlanProfileAsync(props.teamIdToCancel)

  const selectedCheckers = Object.entries(checkers)
    .filter(([key, value]) => value && key !== 'other') // get the selected checkers
    .map(([key]) => checkerTitles.value[key]) // get titles
  const feedback = {
    isMyWorksOrTeam: props.teamIdToCancel === defaultTeamId.value ? 'myWorks' : 'team',
    teamName: teamMetadata?.name ?? '',
    teamOwnerEmail,
    plan: teamProfile?.plan ?? '',
    status: teamProfile?.status ?? '',
    cancelReason: selectedCheckers,
    other: otherDescription.value,
  }

  try {
    const isSent = await useCloudKitClient().retentionSurveyFeedback({ teamId: props.teamIdToCancel, feedbackData: feedback })
    if (isSent) {
      isDialogOpened.value = false
      isConfirm.value = true
    }
    feedbackSent.value = isSent
  } catch (error) {
    logger.error('Failed to send feedback', error)
  } finally {
    isSending.value = false
  }
}
const handleConfirmComplete = () => {
  isConfirm.value = false
  resolve(feedbackSent.value)
}
</script>

<template>
  <div class="retention-survey-feedback-dialog">
    <modal-dialog
      v-if="isContinued"
      :title="$T('Sorry to See You Go')"
      :is-opened="isDialogOpened"
      :width="computedWidth"
      :close-button="!!isPhoneSizeViewportWidth"
      :dialog-header-class="'!pb-4 sm:!pb-6'"
      dialog-body-class="!pt-0"
      dialog-footer-class="!pt-4 !pb-[32px] sm:!pb-[18px]"
      :is-modal-dialog-close-disabled="isSending"
      @modal-dialog-close="cancel"
    >
      <div class="flex w-full flex-col">
        <div>
          <section class="mb-4">
            <p class="w-full text-mobile-subhead-small sm:text-desktop-subhead-small">
              {{ $T('Why did you decide to unsubscribe?') }}
            </p>
          </section>

          <section class="flex flex-col gap-5 sm:gap-4">
            <div v-for="checker in Object.keys(checkerTitles)" :key="checker" class="flex w-full">
              <checkbox-item v-model="checkers[checker]" :title="checkerTitles[checker]" />
            </div>
            <fw-textarea
              v-if="checkers.other"
              v-model="otherDescription"
              :maxlength="1000"
              class="h-[100px] w-full px-4 py-3"
              :placeholder="$T('Anything you\'d like to add? We appreciate your insights.')"
            />
          </section>
        </div>
      </div>
      <template #between-body-footer>
        <base-divider />
      </template>
      <template #footer>
        <div class="flex w-full justify-between gap-2 sm:gap-4">
          <base-button
            class="w-[50%] sm:w-auto"
            :theme="'default'"
            :size="isPhoneSizeViewportWidth ? 'large' : 'small'"
            :disabled="isSending"
            data-focus="not-allow"
            @click="handleBack"
          >
            {{ $T('Back') }}
          </base-button>
          <base-button
            class="w-[50%] sm:w-auto"
            :theme="'danger'"
            :size="isPhoneSizeViewportWidth ? 'large' : 'small'"
            data-focus="not-allow"
            :disabled="isSending || !isAllowedToSend"
            @click="handleCancelPlanSendFeedback"
          >
            {{ $T('Continue') }}
          </base-button>
        </div>
      </template>
    </modal-dialog>

    <modal-dialog
      v-else
      :title="$T('Sorry to See You Go')"
      :is-opened="isDialogOpened"
      :width="computedWidth"
      :close-button="!!isPhoneSizeViewportWidth"
      :dialog-header-class="'!pb-4 sm:!pb-6'"
      dialog-body-class="!pt-0"
      dialog-footer-class="!pt-4 !pb-[32px] sm:!pb-[18px]"
      :is-modal-dialog-close-disabled="isSending"
      @modal-dialog-close="cancel"
    >
      <div class="flex w-full flex-col">
        <section class="flex flex-col gap-3 sm:gap-2">
          <p class="w-full text-mobile-subhead-small sm:text-desktop-subhead-small">
            {{ $T('You can enjoy all $1 Plan benefits until $2.', formattedPlanName, props.expiredTime) }}
          </p>
          <p class="w-full text-mobile-body-medium text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-body-medium">
            {{ $T('We regret that unsubscribing will remove access to') }}:
          </p>
        </section>

        <section class="grid grid-cols-2 gap-4 pt-4">
          <div
            v-for="[key, item] in Object.entries(resources)"
            :key="key"
            class="relative flex h-[133px] flex-col justify-end overflow-hidden rounded-[8px] bg-mask-overlay-s-light dark:bg-mask-overlay-s-dark sm:h-[140px]"
          >
            <img :src="item.source" class="absolute left-0 top-0 w-full object-top" alt="app.xmind.com" />
            <div class="z-10 flex justify-center text-text-secondary-light dark:text-text-secondary-dark">
              <p class="max-w-[134px] px-2 pb-3 text-center text-mobile-subhead-mini sm:max-w-[160px] sm:text-desktop-subhead-mini">
                {{ item.text }}
              </p>
            </div>
          </div>
        </section>
      </div>
      <template #between-body-footer>
        <base-divider />
      </template>
      <template #footer>
        <div class="flex w-full justify-between gap-2 sm:gap-4">
          <base-button
            class="w-[50%] sm:w-auto"
            :theme="'default'"
            :size="isPhoneSizeViewportWidth ? 'large' : 'small'"
            :disabled="false"
            data-focus="not-allow"
            @click="() => cancel()"
          >
            {{ $T('Cancel') }}
          </base-button>
          <base-button
            class="w-[50%] sm:w-auto"
            :theme="'default'"
            :size="isPhoneSizeViewportWidth ? 'large' : 'small'"
            data-focus="not-allow"
            @click="handleContinue"
          >
            {{ $T('Continue') }}
          </base-button>
        </div>
      </template>
    </modal-dialog>

    <modal-dialog
      v-if="isConfirm"
      :title="$T('Your Cancellation Is Confirmed')"
      :is-opened="true"
      :width="520"
      :close-button="!!isPhoneSizeViewportWidth"
      :dialog-header-class="'!pb-4 sm:!pb-6'"
      dialog-body-class="!pt-0"
      dialog-footer-class="!pt-4 !pb-[32px] sm:!pb-[18px]"
    >
      <div>
        <section class="text-mobile-body-large sm:text-desktop-body-large">
          {{ $T("Thank you for using Xmind AI. We'd love the opportunity to work together with you again in the future.") }}
        </section>
      </div>

      <template #between-body-footer>
        <base-divider class="visible sm:invisible" />
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2 sm:gap-4">
          <base-button
            class="w-full sm:w-auto"
            :theme="'default'"
            :size="isPhoneSizeViewportWidth ? 'large' : 'small'"
            data-focus="not-allow"
            @click="handleConfirmComplete"
          >
            {{ $T('Got it') }}
          </base-button>
        </div>
      </template>
    </modal-dialog>
  </div>
</template>
