<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-col items-start overflow-hidden rounded-lg border border-[rgba(250,74,30,0.2)]">
      <div class="flex items-center gap-1 self-stretch border-b border-[rgba(250,74,30,0.20)] bg-[rgba(250,74,30,0.08)] p-[12px] text-xred-500">
        <fw-icon name="crown" width="16" height="16" />
        <span class="text-mobile-subhead-mini sm:text-desktop-subhead-mini">{{ $T('Premium') }}</span>
      </div>
      <div class="flex items-center gap-1 self-stretch border-b border-[rgba(250,74,30,0.20)] bg-[rgba(250,74,30,0.02)] p-[12px]">
        <fw-icon name="tick" width="16" height="16" class="text-xred-500" />
        <span class="text-mobile-body-small sm:text-desktop-body-small">{{ $T('Create unlimited real-time collaborative maps') }}</span>
      </div>
      <div class="flex items-center gap-1 self-stretch border-b border-[rgba(250,74,30,0.20)] bg-[rgba(250,74,30,0.02)] p-[12px]">
        <fw-icon name="tick" width="16" height="16" class="text-xred-500" />
        <span class="text-mobile-body-small sm:text-desktop-body-small">{{ $T('Get $1 credits monthly for all Al features', '500') }}</span>
      </div>
      <div class="flex items-center gap-1 self-stretch border-b border-[rgba(250,74,30,0.20)] bg-[rgba(250,74,30,0.02)] p-[12px]">
        <fw-icon name="tick" width="16" height="16" class="text-xred-500" />
        <span class="text-mobile-body-small sm:text-desktop-body-small">{{ $T('AI summarizes long texts, documents, links etc.') }}</span>
      </div>
      <div class="flex items-center gap-1 self-stretch border-b bg-[rgba(250,74,30,0.02)] p-[12px]">
        <fw-icon name="tick" width="16" height="16" class="text-xred-500" />
        <span class="text-mobile-body-small sm:text-desktop-body-small">{{ $T('AI breaks down a project into tasks or to-dos') }}</span>
      </div>
      <div class="flex items-center gap-1 self-stretch bg-[rgba(250,74,30,0.02)] p-[12px]">
        <fw-icon name="tick" width="16" height="16" class="text-xred-500" />
        <span class="text-mobile-body-small sm:text-desktop-body-small">{{ $T('Visualize project management with Gantt chart') }}</span>
      </div>
    </div>

    <fw-button :theme="'link'" :size="'small'" class="self-start" @click="handleOpenPricing">
      {{ $T('Compare Features') }}
    </fw-button>
  </div>
</template>

<script setup lang="ts">
import { useTracking } from 'client/composables/use-tracking'
import { XMIND_APP_ENDPOINT } from 'client/constants'
import { useContextStore } from 'client/store/context-store'

const handleOpenPricing = () => {
  useTracking().trackClick('compare_features', {
    plan: 'premium',
    renew_period: 'monthly',
    dlg: 'order_page',
    tab: useContextStore().contexts.isInRecents
      ? 'recents'
      : useContextStore().contexts.isInMyWorks
        ? 'my_works'
        : useContextStore().isInAnyEditor
          ? 'editor'
          : null,
  })
  window.open(XMIND_APP_ENDPOINT + '/pricing', '_blank')
}
</script>
