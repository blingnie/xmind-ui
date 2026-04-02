<template>
  <div class="px-4 sm:px-6">
    <div v-if="!isAllowManageSSO" class="flex flex-col gap-4 sm:flex-row sm:gap-3">
      <div class="flex flex-col gap-4">
        <h2
          class="font-NeverMind-UI text-[17px] font-bold leading-[23px] text-text-primary-light dark:text-text-primary-dark sm:text-[15px] sm:leading-[19px]"
        >
          {{ $T('SAML SSO') }}
        </h2>
        <span
          class="font-NeverMind-UI text-[15px] font-normal leading-[19px] tracking-[0.52px] text-text-primary-light dark:text-text-primary-dark sm:text-[13px] sm:leading-[17px]"
        >
          {{ $T('SAML SSO is only available on the Enterprise plan, upgrade to use this feature.') }}
        </span>
      </div>
      <div>
        <upgrade-gradient-button :size="isPhoneSizeViewportWidth ? 'small' : 'medium'" @click="handleUpgrade">
          {{ $T('Upgrade') }}
        </upgrade-gradient-button>
      </div>
    </div>
    <div v-else class="flex flex-col">
      <h2
        class="font-NeverMind-UI text-[17px] font-bold leading-[23px] text-text-primary-light dark:text-text-primary-dark sm:text-[15px] sm:leading-[19px]"
      >
        {{ $T('SAML SSO') }}
      </h2>
      <div
        class="mt-4 font-NeverMind-UI text-[15px] font-normal leading-[19px] tracking-[0.52px] text-text-primary-light dark:text-text-primary-dark sm:text-[13px] sm:leading-[17px]"
      >
        {{
          $T(
            'SSO can be enabled after domain verified and SSO authentication is configured. Please complete domain verification first, then set up SSO.',
          )
        }}
      </div>
      <div class="mb-2 mt-5 flex flex-row items-center gap-2">
        <span class="font-NeverMind-UI text-[13px] leading-[17px] text-text-primary-light dark:text-text-primary-dark">{{ $T('Status:') }}</span>
        <sso-status :status="hasActiveConnection ? 'on' : 'off'" />
      </div>
      <domain-list-panel :domain-list="domainList" @add-domain="handleAddDomain" @remove-domain="handleRemoveDomain" />

      <div class="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
        <div class="flex flex-col gap-1">
          <h3
            class="font-NeverMind-UI text-[15px] font-semibold leading-[21px] text-text-primary-light dark:text-text-primary-dark sm:text-[13px] sm:leading-[17px]"
          >
            {{ $T('Configurate SSO') }}
          </h3>
          <span class="font-NeverMind-UI text-xs text-text-tertiary-light dark:text-text-tertiary-dark sm:text-[11px] sm:leading-[15px]">{{
            $T('After the configuration is complete, SSO will be enabled.')
          }}</span>
        </div>
        <div>
          <fw-button
            :theme="'default'"
            :size="isPhoneSizeViewportWidth ? 'small' : 'medium'"
            :disabled="!isAllowSetupSSOConfiguration"
            @click="handleSetupSSOConfiguration"
          >
            {{ $T('Go to Configuration') }}
          </fw-button>
        </div>
      </div>

      <div v-if="isAllowDisableSSOConfiguration" class="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
        <div class="flex flex-col gap-1">
          <h3
            class="font-NeverMind-UI text-[15px] font-semibold leading-[21px] text-text-primary-light dark:text-text-primary-dark sm:text-[13px] sm:leading-[17px]"
          >
            {{ $T('Disable SSO') }}
          </h3>
          <span class="font-NeverMind-UI text-xs text-text-tertiary-light dark:text-text-tertiary-dark sm:text-[11px] sm:leading-[15px]">{{
            $T('Once SSO is disabled, re-enabling it will require reconfiguration.')
          }}</span>
        </div>
        <div>
          <fw-button :theme="'danger'" :size="isPhoneSizeViewportWidth ? 'small' : 'medium'" @click="handleDisableSSOConfiguration">
            {{ $T('Disable') }}
          </fw-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useWindowResize } from 'client/composables/window-resize'
import { TeammatePayload, TeamMetadata } from 'client/server-export'
import UpgradeGradientButton from 'client/components/composite/upgrade-gradient-button.vue'
import { useTeamSpaceData } from 'app/composables/team-space-data'
import { useSSOManage } from 'app/composables/sso-manage'
import SsoStatus from 'client/components/dialogs/team-profile/identity-provision/sso-status.vue'
import DomainListPanel from 'client/components/dialogs/team-profile/identity-provision/domain-list-panel.vue'
import { useServiceStore } from 'app/services/pinia'
import { $T } from 'client/library/translation'

const props = defineProps<{
  team: TeamMetadata & { role: TeammatePayload['role'] }
}>()

const { isPhoneSizeViewportWidth } = useWindowResize()
const { getUnexpiredTeamPlanSync } = useTeamSpaceData()
const { hasActiveConnection, domainList, fetchOrganization, addDomain, removeDomain, addConnection, removeConnection } = useSSOManage()

const unexpiredTeamPlan = computed(() => getUnexpiredTeamPlanSync(props.team.teamId))

const isAllowManageSSO = computed(() => unexpiredTeamPlan.value === 'enterprise')
const isAllowSetupSSOConfiguration = computed(() => domainList.value.length > 0)
const isAllowDisableSSOConfiguration = computed(() => hasActiveConnection.value)

onMounted(async () => {
  await fetchOrganization({ teamId: props.team.teamId })
  pollingOrganizationFetch()
})

const handleUpgrade = () => {
  useServiceStore().services.action.dialog.openActivateDialog({ teamId: props.team.teamId, selectedPlans: ['enterprise'] })
}

const handleAddDomain = async () => {
  const domainVerificationLink = await addDomain({ teamId: props.team.teamId })
  window.open(domainVerificationLink, '_blank')
}

const handleRemoveDomain = async (domain: string) => {
  const confirmed = await useServiceStore().services.action.dialog.confirm({
    title: $T('Delete domain'),
    description: $T('Email addresses under $1 will no longer be able to use SSO login.', domain),
    confirmButtonType: 'primary',
    confirmButtonText: $T('Delete'),
    cancelButtonText: $T('Cancel'),
  })

  if (confirmed) {
    await removeDomain({ teamId: props.team.teamId, domain })
    await fetchOrganization({ teamId: props.team.teamId })
  }
}

const handleSetupSSOConfiguration = async () => {
  const ssoConfigLink = await addConnection({ teamId: props.team.teamId })
  window.open(ssoConfigLink, '_blank')
}

const handleDisableSSOConfiguration = async () => {
  const confirmed = await useServiceStore().services.action.dialog.confirm({
    title: $T('Disable SSO'),
    description: $T('Once SSO is disabled, re-enabling it will require reconfiguration'),
    confirmButtonType: 'primary',
    confirmButtonText: $T('Disable'),
    cancelButtonText: $T('Cancel'),
  })

  if (confirmed) {
    await removeConnection({ teamId: props.team.teamId })
    await fetchOrganization({ teamId: props.team.teamId })
  }
}

let pollingIntervalTimer: number

const pollingOrganizationFetch = () => {
  pollingIntervalTimer && window.clearInterval(pollingIntervalTimer)
  pollingIntervalTimer = window.setInterval(async () => {
    await fetchOrganization({ teamId: props.team.teamId })
  }, 5000)
}

onUnmounted(() => {
  pollingIntervalTimer && window.clearInterval(pollingIntervalTimer)
})
</script>
