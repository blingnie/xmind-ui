<template>
  <section
    v-if="isReachingTeamMemberBilledLimitWithValidEmails"
    class="mb-[16px] flex flex-col items-start gap-2 rounded-md bg-mask-overlay-s-light p-[12px] dark:bg-mask-overlay-s-dark"
  >
    <span class="text-mobile-body-medium text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-body-medium">
      {{ chargedForAdditionalSeatsTips }}
    </span>
    <base-button theme="link" size="small" @click="openFAQ">{{ $T('Learn More') }}</base-button>
  </section>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import BaseButton from 'client/components/base/button.vue'
import { useTeamSpaceData } from 'app/composables/team-space-data'
import { $T } from 'client/library/translation'

const props = defineProps<{
  teamId: string
  isReachTeamMemberLimit: boolean
  teamMemberTotalInvitesCount: number
  validEmailsLength: number
}>()

const billedSeats = computed(() => useTeamSpaceData().getTeamPlanProfileSync(props.teamId)?.billedSeats ?? 0)

const isReachingTeamMemberBilledLimitWithValidEmails = computed(
  () =>
    billedSeats.value &&
    useTeamSpaceData().getIsTeamSubscribedSync(props.teamId) &&
    props.validEmailsLength + props.teamMemberTotalInvitesCount > billedSeats.value,
)

const chargedForAdditionalSeatsTips = computed(() => {
  return billedSeats.value === 1
    ? $T(
        'Your team has $1 seat ($2 allocated). If you send invitations exceeding the available seats, you will be charged for the additional seats.',
        billedSeats.value.toString(),
        props.teamMemberTotalInvitesCount.toString(),
      )
    : $T(
        'Your team has $1 seats ($2 allocated). If you send invitations exceeding the available seats, you will be charged for the additional seats.',
        billedSeats.value.toString(),
        props.teamMemberTotalInvitesCount.toString(),
      )
})

const openFAQ = () => {
  window.open('/faq#13', '_blank')
}
</script>
