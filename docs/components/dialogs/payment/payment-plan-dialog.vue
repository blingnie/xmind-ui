<template>
  <base-full-screen-dialog
    :is-opened="true"
    class="sm:!p-0 min-w-906:!p-[12px]"
    :dialog-content-class="'!pt-[24px] sm:!pt-[24px] min-w-906:!pt-[48px]'"
    :dialog-body-class="'!rounded-none min-w-906:!rounded-xl'"
    @modal-dialog-close="handleClose"
  >
    <payment-form
      :scenario="'payment-plan'"
      :team-id="teamId"
      :title="$T('Choose Your Plan')"
      :sub-title="$T('Become a subscriber to unlock enhanced features and boost your Xmind experience.')"
      :selected-plans="selectedPlans"
      @close="handleClose"
    >
      <template #free-plan-btn>
        <base-button theme="default" size="large" class="w-full" :class="{ invisible: teamOrMyWorksPlan !== 'basic' }" :disabled="true">
          <span>{{ $T('Current') }}</span>
        </base-button>
      </template>
    </payment-form>
  </base-full-screen-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { usePromiseHook } from 'utils/vue-utils'
import BaseFullScreenDialog from 'client/components/base/full-screen-dialog.vue'
import PaymentForm from './payment-plan-form.vue'
import BaseButton from 'client/components/base/button.vue'
import { onBeforeRouteLeave } from 'vue-router'
import { useUrlNavigator } from 'app/composables/url-navigator'
import { useTeamSpaceData } from 'app/composables/team-space-data'
import { type PlusAccount } from 'client/server-export'

const props = defineProps<{
  teamId: string
  selectedPlans?: PlusAccount['plan'][]
}>()

const { resolve } = usePromiseHook()
const { getTeamOrMyWorksPlan } = useTeamSpaceData()

const teamOrMyWorksPlan = computed(() => getTeamOrMyWorksPlan(props.teamId))

const handleClose = () => {
  resolve(false)
}

const { unregister, enter: enterHashRouter } = useUrlNavigator().registerHash({
  hash: '#payment-plan',
  onLeave: handleClose,
})

onBeforeRouteLeave(() => false)

onMounted(async () => {
  window?.gtag?.('event', 'Paywall_exposure', {})
  enterHashRouter?.()
})

onUnmounted(() => {
  unregister?.()
})
</script>
