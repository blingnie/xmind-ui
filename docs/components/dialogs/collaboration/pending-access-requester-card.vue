<template>
  <div class="member-card flex w-full items-center justify-between">
    <div class="flex h-full flex-1 items-center gap-3 overflow-hidden">
      <img uk-img class="height-[32px] w-[32px] flex-shrink-0 overflow-hidden rounded-[16px]" :src="props.avatar" />
      <div class="flex flex-1 flex-col overflow-hidden">
        <div class="flex">
          <span class="no-underline-safari truncate text-mobile-subhead-mini no-underline sm:text-desktop-subhead-mini">
            {{ displayName }}
          </span>
        </div>
        <span
          v-if="$props.email"
          class="no-underline-safari block truncate text-desktop-caption text-text-tertiary-light no-underline dark:text-text-tertiary-dark"
          >{{ props.email }}</span
        >
      </div>
    </div>
    <div class="flex flex-row items-center justify-center gap-3">
      <button class="text-mobile-subhead-mini sm:text-desktop-subhead-mini" @click="$emit('deny', xmindId)">{{ $T('Deny') }}</button>
      <fw-button theme="secondary" size="medium" @click="$emit('approve', xmindId)">{{ $T('Approve') }}</fw-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { $T } from 'client/library/translation'

const props = withDefaults(
  defineProps<{
    xmindId: string
    name: string
    avatar: string
    email?: string
  }>(),
  {
    xmindId: undefined,
    name: '',
    avatar: '',
    email: '',
  },
)

defineEmits<{
  (event: 'deny', userId: string): void
  (event: 'approve', userId: string): void
}>()

const displayName = computed(() => props.name || $T('Anonymous'))
</script>
