<template>
  <div class="flex select-none items-center gap-3">
    <!-- avatar -->
    <div
      v-if="inviteStatus === 'pending'"
      class="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-border-translucent-light bg-fill-surfaceDark-light dark:border-border-translucent-dark dark:bg-fill-surfaceDark-dark"
    >
      <fw-icon name="person" class="text-text-quaternary-light dark:text-text-quaternary-dark" />
    </div>

    <div v-else class="h-8 w-8 overflow-hidden rounded-full">
      <fw-image-container
        :src="avatarUrl"
        draggable="false"
        :image-class="'rounded-full border border-solid  border-border-translucent-light dark:border-border-translucent-dark'"
      />
    </div>

    <div class="flex flex-col">
      <!-- name/email -->
      <div class="text-mobile-subhead-mini text-text-primary-light dark:text-text-primary-dark sm:text-desktop-subhead-mini">
        <span v-if="inviteStatus === 'pending'" class="truncate">
          {{ subInfo.substring(0, subInfo.indexOf('@')) }}
          <span class="text-transparent-dark-6 dark:text-transparent-white-6">
            {{ `(${$T('Pending')})` }}
          </span>
        </span>

        <span v-else class="truncate">
          {{ name }}
          <span v-if="isSelf" class="text-transparent-dark-6 dark:text-transparent-white-6">
            {{ `(${$T('You')})` }}
          </span>
          <span v-else-if="inviteStatusText" class="text-transparent-dark-6 dark:text-transparent-white-6"> ({{ inviteStatusText }}) </span>
        </span>
      </div>

      <!-- email -->
      <span class="truncate text-desktop-caption text-text-tertiary-light dark:text-text-tertiary-dark">
        {{ subInfo }}
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  name: string
  subInfo: string
  avatarUrl: string
  inviteStatus?: 'pending' | 'accepted' | string
  inviteStatusText?: string
  isSelf?: boolean
}>()
</script>
