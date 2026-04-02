<template>
  <base-full-screen-dialog
    :is-opened="true"
    :close-button="false"
    :class="stage === 'payment-form' ? 'min-w-906:!p-[12px] sm:!p-0' : ''"
    :dialog-content-class="stage === 'payment-form' ? '!pt-[24px] sm:!pt-[24px] min-w-906:!pt-[48px]' : ''"
    :dialog-body-class="stage === 'payment-form' ? '!rounded-none min-w-906:!rounded-xl' : ''"
    @modal-dialog-close="clickClose"
  >
    <div v-if="stage === 'team-form'" class="flex h-full w-full max-w-full flex-1 flex-col items-center">
      <h1
        class="text-mobile-headline-small text-text-primary-light dark:text-text-primary-dark sm:text-desktop-headline-large self-start px-[16px] text-left sm:mb-[16px] sm:self-center sm:text-center"
      >
        {{ $T('Create a new team') }}
      </h1>
      <base-divider class="!border-divider-onContainer-light dark:!border-divider-onContainer-dark mb-[24px] mt-[24px] block md:hidden" />

      <div class="flex w-[381px] max-w-full flex-col gap-4">
        <span
          class="text-mobile-body-large text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-body-large mb-[8px] sm:mb-[16px] sm:text-center"
        >
          {{ $T('After creating a team, you can invite others to join') }}
        </span>
        <div>
          <new-input
            v-model="teamName"
            size="large"
            :placeholder="inputPlaceHolderText"
            :is-auto-focus="true"
            :disable-clear-icon="true"
            @keypress.enter="handleCreateNewTeam()"
          />
        </div>
        <div class="flex w-full max-w-[800px] justify-end px-[1px]">
          <base-button
            class="w-full"
            theme="secondary"
            :size="isPhoneSizeViewportWidth ? 'large' : 'medium'"
            :disabled="teamName.trim().length === 0 || isCreating"
            @click="handleCreateNewTeam"
          >
            {{ $T('Create Team') }}
          </base-button>
        </div>
      </div>
    </div>

    <email-form v-if="stage === 'email-form'" :team-id="teamMetadata.teamId" @next="toPaymentStage"></email-form>

    <payment-form
      v-if="stage === 'payment-form' && !isCnRegion"
      :scenario="'new-team'"
      :title="title"
      :team-id="teamMetadata.teamId"
      @close="handleClose"
    >
      <template #free-plan-btn>
        <base-button theme="default" size="large" class="w-full" @click="handleChooseBasic()">
          <span>{{ $T('Current') }}</span>
        </base-button>
      </template>
    </payment-form>
  </base-full-screen-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { $T } from 'client/library/translation'
import NewInput from 'client/components/base/input.vue'
import BaseButton from 'client/components/base/button.vue'
import PaymentForm from 'client/components/dialogs/payment/payment-plan-form.vue'
import EmailForm from 'client/components/dialogs/team/invite-by-email-form.vue'
import BaseFullScreenDialog from 'client/components/base/full-screen-dialog.vue'
import BaseDivider from 'client/components/base/divider.vue'
import { usePromiseHook } from 'utils/vue-utils'
import { useTeamsClient } from 'app/composables/team-client'
import { TeamMetadata } from 'client/library/cloud-kit'
import { trackNewVersionWorks, trackTeam } from 'client/library/tracker'
import { useWindowResize } from 'client/composables/window-resize'
import { CN_PAYMENT_LINK, REGION } from 'client/constants'

const props = defineProps<{
  onCreatedNewTeam?: (teamId: string) => Promise<void>
}>()

const { resolve } = usePromiseHook()
const { isPhoneSizeViewportWidth } = useWindowResize()
const isCnRegion = REGION === 'cn'

const teamName = ref('')
const isCreating = ref(false)

const stage = ref<'team-form' | 'email-form' | 'payment-form'>('team-form')
const teamMetadata = ref<TeamMetadata>()

const handleClose = () => {
  resolve(teamMetadata.value)
}

const handleChooseBasic = () => {
  handleClose()
}

const clickClose = () => {
  if (isCnRegion && stage.value === 'email-form') return
  handleClose()
  stage.value === 'payment-form' && trackTeam.newTeamChoosePlan('Close')
}

const title = computed(() => $T("Choose a plan that's right for you"))

const handleCreateNewTeam = async () => {
  if (!teamName.value.trim() || isCreating.value) return

  isCreating.value = true
  teamMetadata.value = await useTeamsClient().createTeam({ teamName: teamName.value })

  if (teamMetadata.value?.teamId) {
    await props.onCreatedNewTeam?.(teamMetadata.value.teamId)
    stage.value = 'email-form'
    trackNewVersionWorks.newTeamInviteShow()
  }
  isCreating.value = false

  trackTeam.newTeamCreate()
}

const toPaymentStage = async () => {
  if (isCnRegion) {
    const teamId = teamMetadata.value?.teamId
    if (teamId) {
      const callbackUrl = `${window.location.origin}/checkout/callback/${teamId}`
      const pricingUrl = `${CN_PAYMENT_LINK}?type=xai&version=business&team_id=${teamId}&return_url=${encodeURIComponent(callbackUrl)}`
      handleClose()
      window.location.href = pricingUrl
    } else {
      handleClose()
    }
    return
  }

  stage.value = 'payment-form'
  trackNewVersionWorks.upgradeDialog('fromTeamNew')
}

const inputPlaceHolderText = $T("Team's name")
</script>
