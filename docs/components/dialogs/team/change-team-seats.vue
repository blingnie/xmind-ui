<template>
  <base-full-screen-dialog
    :is-opened="true"
    class="sm:!p-0 md:!p-[12px]"
    :dialog-content-class="'!pt-[24px] sm:!pt-[24px] md:!pt-[48px]'"
    :dialog-body-class="'md:!bg-fill-surface-light md:dark:!bg-fill-surface-dark !bg-fill-container-light dark:!bg-fill-container-dark shadow-none md:shadow-elevation-g-light dark:md:shadow-elevation-g-dark'"
    @modal-dialog-close="handleClose"
  >
    <h1
      class="px-[16px] text-left text-mobile-headline-small text-text-primary-light dark:text-text-primary-dark md:mb-[48px] md:px-0 md:text-center md:text-desktop-headline-large"
    >
      {{ $T('Change Team Size') }}
    </h1>

    <base-divider class="mb-[24px] mt-[24px] block !border-divider-onContainer-light dark:!border-divider-onContainer-dark md:hidden" />

    <div class="flex flex-col items-center justify-center gap-3 px-[16px] pb-[32px] md:flex-row md:items-start md:gap-4 md:px-[16px] lg:gap-12">
      <!-- seats detail -->
      <div
        class="flex w-full flex-col justify-center gap-6 rounded-2xl bg-fill-surface-light p-[24px] shadow-elevation-g-light dark:bg-fill-surface-dark dark:shadow-elevation-g-dark md:w-96 md:rounded-none md:bg-transparent md:p-0 md:shadow-none dark:md:shadow-none"
      >
        <div v-if="team" class="flex w-full items-center gap-2">
          <img
            uk-img
            :data-src="team.imageUrl || generateAvatarDataURI({ name: team.name, xmindId: team.teamId, style: { fontWeight: '600' } })"
            class="h-[27px] w-[27px] rounded-[6px]"
          />
          <span class="truncate text-mobile-subhead-small text-text-secondary-light dark:text-text-secondary-dark md:text-desktop-subhead-small">
            {{ team.name }}
          </span>
          <span v-if="badgeText" class="tw-badge-primary tw-plan-tag pointer-events-none block">{{ badgeText }}</span>
        </div>
        <div class="flex flex-col items-start gap-[8px] self-stretch">
          <span class="text-mobile-body-large text-text-tertiary-light dark:text-text-tertiary-dark md:text-desktop-body-large">
            {{ $T('Seats') }}
          </span>
          <new-number-input class="w-full" :value="teamSeats" :is-disabled="isLoading" @update:value="handleSeatChange" />
          <div
            v-if="currentMembersCount && teamSeats && teamSeats < currentMembersCount"
            class="mt-[8px] flex items-start gap-2 self-stretch rounded-md bg-mask-overlay-s-light p-[12px] dark:bg-mask-overlay-s-dark"
          >
            <icon name="information-fill" width="16" height="16" color="#F27B13" class="shrink-0" />
            <span class="text-desktop-caption-1 text-transparent-dark-8 dark:text-transparent-white-8">
              {{
                isPluralCount
                  ? $T(
                      'You currently have $1 members on your team. To decrease team size, you’ll need to remove $2 members in "Team Members" page first.',
                      currentMembersCount.toString(),
                      (currentMembersCount - teamSeats).toString(),
                    )
                  : $T(
                      'You currently have $1 members on your team. To decrease team size, you’ll need to remove $2 member in "Team Members" page first.',
                      currentMembersCount.toString(),
                      (currentMembersCount - teamSeats).toString(),
                    )
              }}
            </span>
          </div>
        </div>
        <div class="flex flex-col items-center justify-center gap-[8px] text-desktop-body-2">
          <div class="flex items-center justify-between self-stretch">
            <span class="w-36 text-mobile-body-large text-text-tertiary-light dark:text-text-tertiary-dark md:text-desktop-body-large">
              {{ $T('Current') }}
            </span>
            <span class="w-36 text-mobile-subhead-mini text-text-tertiary-light dark:text-text-tertiary-dark md:text-desktop-subhead-mini">
              {{ $T('Updated') }}
            </span>
          </div>

          <base-divider class="my-[4px]" />

          <div class="flex items-center justify-between self-stretch">
            <span class="w-36 text-mobile-body-large text-text-tertiary-light dark:text-text-tertiary-dark md:text-desktop-body-large">
              {{ `${currentSeats} ${currentSeats > 1 ? $T('seats') : $T('seat')}` }}
            </span>
            <span class="w-36 text-mobile-subhead-mini text-text-tertiary-light dark:text-text-tertiary-dark md:text-desktop-subhead-mini">
              {{ `${teamSeats} ${teamSeats > 1 ? $T('seats') : $T('seat')}` }}
            </span>
          </div>

          <template v-if="!isPlanAutoRenewCanceled">
            <base-divider class="my-[4px]" />
            <div class="flex h-[24px] items-center justify-between self-stretch">
              <span
                v-if="currentCharges || currentCharges === 0"
                class="w-36 text-mobile-body-large text-text-tertiary-light dark:text-text-tertiary-dark md:text-desktop-body-large"
              >
                {{
                  autoRenewMonth === 1
                    ? $T('$1 per month', currencyFormat.format(currentCharges))
                    : $T('$1 per year', currencyFormat.format(currentCharges))
                }}
              </span>
              <span
                v-if="updatedCharges || updatedCharges === 0"
                class="w-36 text-mobile-subhead-mini text-text-tertiary-light dark:text-text-tertiary-dark md:text-desktop-subhead-mini"
              >
                {{
                  autoRenewMonth === 1
                    ? $T('$1 per month', currencyFormat.format(updatedCharges))
                    : $T('$1 per year', currencyFormat.format(updatedCharges))
                }}
              </span>
            </div>
          </template>
        </div>
      </div>

      <base-divider orientation="vertical" class="hidden self-stretch md:block" />

      <!-- order summary -->
      <div
        class="flex w-full flex-col justify-center gap-6 rounded-2xl bg-fill-surface-light p-[24px] shadow-elevation-g-light dark:bg-fill-surface-dark dark:shadow-elevation-g-dark md:min-w-96 md:max-w-[544px] md:rounded-none md:bg-transparent md:p-0 md:shadow-none dark:md:shadow-none"
      >
        <div class="flex items-center gap-[8px]">
          <span class="text-mobile-subhead-large text-text-secondary-light dark:text-text-secondary-dark md:text-desktop-subhead-large">
            {{ $T('Payment Details') }}
          </span>
          <fw-tooltip class="inline-block" :content-style="{ 'max-width': '270px', 'white-space': 'normal' }" :allow-click="true">
            <template #trigger>
              <img uk-svg :data-src="$toResourceURL('/assets/static/icons/query.svg')" width="16" height="16" />
            </template>
            <template #tooltip>
              <div class="text-desktop-caption-1">
                {{
                  $T(
                    'Charges for adding seats are prorated, so you only pay for the time you use. Please note that refunds are not available when licenses are removed.',
                  )
                }}
                <span class="cursor-pointer text-brand-4" @click="openFAQ">{{ $T('Learn More') }}</span>
              </div>
            </template>
          </fw-tooltip>
        </div>

        <div class="flex flex-col items-center gap-3 self-stretch">
          <div class="flex justify-between self-stretch">
            <span class="text-mobile-body-large text-text-tertiary-light dark:text-text-tertiary-dark md:text-desktop-body-large">
              {{ $T('Change team size') }}
            </span>
            <span
              v-if="amountDueToday || amountDueToday === 0"
              class="text-mobile-body-large text-text-tertiary-light dark:text-text-tertiary-dark md:text-desktop-body-large"
            >
              {{ currencyFormat.format(amountDueToday) }}
            </span>
          </div>
          <base-divider class="my-[4px]" />
          <div class="flex justify-between self-stretch">
            <span class="text-mobile-subhead-small text-text-primary-light dark:text-text-primary-dark md:text-desktop-subhead-small">
              {{ `${$T('Due on')} ${formatDate(Date.now())}` }}
            </span>
            <span
              v-if="amountDueToday || amountDueToday === 0"
              class="text-mobile-subhead-small text-text-primary-light dark:text-text-primary-dark md:text-desktop-subhead-small"
            >
              {{ currencyFormat.format(amountDueToday) }}
            </span>
          </div>
        </div>

        <div class="flex flex-col gap-4 self-stretch">
          <base-button theme="primary" size="large" :disabled="isLoading || isConfirmButtonDisabled" @click="handleConfirmTeamSeats">
            <span v-if="!isLoading">{{ $T('Confirm') }}</span>
            <ellipsis-loading v-else :dark="false" />
          </base-button>
          <template v-if="currentSeats && teamSeats !== currentSeats && teamSeats >= currentMembersCount">
            <span v-if="!isTrial && nextBillingDate" class="text-desktop-body-small text-text-quaternary-light dark:text-text-quaternary-dark">
              {{ `${$T('Next payment:')} ${nextBillingDate ? formatDate(nextBillingDate) : ''}` }}
            </span>
            <div v-else-if="isTrial" class="text-desktop-body-small text-text-quaternary-light dark:text-text-quaternary-dark">
              <span>
                {{ $T('We’ll start charging you when your trail ends, on ') }}
                <span class="text-text-primary-light dark:text-text-primary-dark"> {{ `${formatDate(trialExpiresAt)}` }}</span>
              </span>
              <span>{{ $T('. Your subscription cost will be based on the number of seats in your team at the end of the trial.') }}</span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </base-full-screen-dialog>
</template>

<script setup lang="ts">
import BaseFullScreenDialog from 'client/components/base/full-screen-dialog.vue'
import BaseDivider from 'client/components/base/divider.vue'
import Icon from 'client/components/icon/icon.vue'
import BaseButton from 'client/components/base/button.vue'
import { usePromiseHook } from 'utils/vue-utils'
import { generateAvatarDataURI } from 'client/library/cloud-kit/utils/avatar'
import { computed, onMounted, ref } from 'vue'
import { TeamMetadata } from 'client/library/cloud-kit'
import { $T } from 'client/library/translation'
import { useTeamSpaceData } from 'app/composables/team-space-data'
import { toastActions } from 'client/library/new-notifications'
import { usePaymentClient } from 'app/composables/payment-client'
import { useTeamsClient } from 'app/composables/team-client'
import { formatDate } from '../team-profile/utils'
import EllipsisLoading from 'client/components/ellipsis-loading.vue'
import { TeamMemberCount } from 'client/library/teams'
import { useAccountStore } from 'app/services/pinia'
import { debounce } from 'utils/misc'
import { trackNewVersionWorks } from 'client/library/tracker'
import NewNumberInput from 'client/components/new-number-input.vue'
import { checkLoginSession } from 'client/library/payment'

const props = defineProps<{
  teamId: string
  teamMemberCount?: TeamMemberCount
}>()

const { resolve } = usePromiseHook()
const currency = 'USD'
const currencyFormat = Intl.NumberFormat('en-US', { style: 'currency', currency })
const isTrial = ref(false)
const trialExpiresAt = ref<number | string>()
const autoRenewMonth = ref<number>()

let currentSeats: number
let currentMembersCount: number

const team = ref<TeamMetadata>()
const teamSeats = ref<number>()
const currentCharges = ref<number>()
const updatedCharges = ref<number>()
const amountDueToday = ref<number>()
const nextBillingDate = ref<string>('')
const isLoading = ref(false)
const isConfirmButtonDisabled = ref(false)
const isPlanAutoRenewCanceled = ref(false)

const plan = computed(() => useTeamSpaceData().getUnexpiredTeamPlanSync(props.teamId))
const badgeText = computed(() => {
  switch (plan.value) {
    case 'premium':
      return $T('PREMIUM')
    case 'essential':
      return $T('ESSENTIAL')
    case 'business':
      return $T('BUSINESS')
    case 'personal':
      return $T('PERSONAL')
    case 'team':
      return $T('TEAM')
    default:
      return ''
  }
})
const isPluralCount = computed(() => currentMembersCount - teamSeats.value > 1)
const handleClose = (isSeatsChanged = false) => {
  if (isLoading.value) return
  resolve(isSeatsChanged)
}

const openFAQ = () => {
  window.open('/faq#13', '_blank')
}

const fetchTeamSeats = async () => {
  const { limit, totalInvites } = props.teamMemberCount ?? (await useTeamsClient().getTeamMemberCountLimit({ teamId: props.teamId }))
  teamSeats.value = limit
  currentSeats = limit
  currentMembersCount = totalInvites
}

const fetchTeamMetadata = async () => {
  const teamMetadata = await useTeamSpaceData().fetchTeamMetadata({ teamId: props.teamId })
  if (!teamMetadata || !teamMetadata.teamId) {
    toastActions.show({ message: $T('Could not get your team information, please try again later'), topic: 'failed' })
    handleClose()
    return
  }
  team.value = teamMetadata
}

const handleSeatChange = async (newSeats: number, manualInput: boolean) => {
  teamSeats.value = newSeats

  isConfirmButtonDisabled.value = currentMembersCount > newSeats
  manualInput ? previewSeatFeesWithDebounceByManualInput() : previewSeatFeesWithDebounce()
}

const previewSeatFees = async (newSeats: number) => {
  updatedCharges.value = null
  amountDueToday.value = null

  const fees = await usePaymentClient().getSeatFees({ teamId: props.teamId, newSeats })
  if (!fees) {
    toastActions.show({ message: $T('Could not update team size, please try again later'), topic: 'failed' })
    return
  }

  currentCharges.value = fees.currentCharges
  updatedCharges.value = fees.updatedCharges
  amountDueToday.value = fees.amountDueToday
  nextBillingDate.value = fees.nextBillingDate

  if (!nextBillingDate.value) {
    isPlanAutoRenewCanceled.value = true
  }
}

const previewSeatFeesWithDebounce = debounce(async () => {
  isLoading.value = true
  await previewSeatFees(teamSeats.value)
  isLoading.value = false
}, 250)

const previewSeatFeesWithDebounceByManualInput = debounce(async () => {
  isLoading.value = true
  await previewSeatFees(teamSeats.value)
  isLoading.value = false
}, 1000)

const handleConfirmTeamSeats = async () => {
  if (isLoading.value) return

  isLoading.value = true
  const invoiceEmail = useAccountStore().profile.primary_email
  const status = await usePaymentClient().changeTeamSeats({ teamId: props.teamId, newSeats: teamSeats.value, invoiceEmail })
  isLoading.value = false
  trackNewVersionWorks.changeTeamSizeConfirm({ plan: plan.value, diff: teamSeats.value - currentSeats, total: amountDueToday.value })

  if (status === 'success') {
    toastActions.show({ message: $T('Team size changed.'), topic: 'success' })
    handleClose(true)
  } else if (status === 'fail') {
    toastActions.show({ message: $T('Could not change team size, please try again later.'), topic: 'failed' })
  }
}

const fetchTeamPlanProfile = async () => {
  const teamPlanProfile = await useTeamSpaceData().getTeamPlanProfileAsync(props.teamId)
  isTrial.value = teamPlanProfile?.status === 'trialing'
  trialExpiresAt.value = teamPlanProfile?.expiredAt
  autoRenewMonth.value = teamPlanProfile?.month
}

onMounted(async () => {
  checkLoginSession()

  isLoading.value = true
  await Promise.all([fetchTeamSeats(), fetchTeamMetadata(), fetchTeamPlanProfile()])
  await previewSeatFees(currentSeats)
  isLoading.value = false
})
</script>
