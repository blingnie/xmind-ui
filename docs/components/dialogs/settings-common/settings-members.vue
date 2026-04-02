<template>
  <div class="px-[24px]">
    <div class="flex flex-row items-center justify-between">
      <div class="text-mobile-body-medium text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-body-medium">
        <span>{{ $T('Members') }}</span>
        <span v-if="membersCount"> ({{ membersCount }})</span>
      </div>
      <fw-button v-if="isShowInvite" theme="link" :size="'medium'" class="flex flex-shrink-0 items-center gap-1" @click="$emit('invite')">
        <fw-icon name="person-add" :width="18" :height="18" />
        <span class="">{{ $T('Add Members') }}</span>
      </fw-button>
    </div>
    <div class="flex flex-col gap-3 pt-[16px]">
      <div v-if="isLoadingMembers">
        <file-list-item-skeleton-animation class="mt-[16px]"></file-list-item-skeleton-animation>
        <file-list-item-skeleton-animation class="mt-[16px]"></file-list-item-skeleton-animation>
        <file-list-item-skeleton-animation class="mt-[16px]"></file-list-item-skeleton-animation>
      </div>

      <!-- Members List -->
      <div v-for="(member, index) in members" v-else :key="index" class="flex select-none items-center justify-between py-[4px]">
        <fw-member-item
          :avatar-url="member.avatarUrl ?? generateAvatarDataURI({ name: member.fullName, xmindId: member.userId, style: { fontWeight: '600' } })"
          :invite-status="member.inviteStatus"
          :name="member.name"
          :sub-info="member.email ?? member.userIdOrEmail"
          :is-self="member.userId === userXmindId"
        />

        <!-- role -->
        <div>
          <!-- Owner display -->
          <span v-if="member.role === 'owner'" class="text-mobile-body-medium sm:text-desktop-body-medium">
            {{ computeOwnerTitle(member) }}
          </span>

          <!-- Role selection dropdown -->
          <fw-select
            v-else-if="isOwner || isAdmin || member.userId === userXmindId"
            :options="buildMenuOption({ isOwner, member, isAdmin, isSpaceOwner })"
            :trigger-size="isPhoneSizeViewportWidth ? 'medium' : 'small'"
            :menu-custom-class="member.userId === userXmindId ? 'w-44' : 'w-52'"
            :is-show-tick="false"
            @select="$emit('select-option', { option: $event, member })"
          >
            <template #selectedLabel>
              {{ displayRole(member) }}
            </template>
            <template #optionItem="{ option }">
              <fw-menu-button
                :key="option.key"
                :icon="option.icon"
                :is-show-tick="false"
                class="h-8"
                @click="emit('select-option', { option: option.key, member })"
              >
                <span class="text-mobile-body-medium sm:text-desktop-body-medium truncate">{{ option.label }}</span>
                <plan-badge v-if="option.badge" :plan="option.badge" class="text-desktop-caption ml-auto !h-4 rounded-[3px]" />
              </fw-menu-button>
            </template>
          </fw-select>

          <!-- Read-only role display -->
          <span v-else class="text-mobile-body-medium sm:text-desktop-body-medium">
            {{ displayRole(member) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends TeammateMetadata | TeamSpaceMemberMetadata">
import FileListItemSkeletonAnimation from 'client/components/skeleton-animation/new-file-list-item-skeleton-animation.vue'
import { generateAvatarDataURI } from 'client/library/cloud-kit/utils/avatar'
import planBadge from 'client/components/composite/plan-badge.vue'
import { useWindowResize } from 'client/composables/window-resize'
import type { TeammateMetadata, TeamSpaceMemberMetadata } from 'client/library/teams'
import { computed } from 'vue'
import { useAccountStore } from 'client/store/account-store'
import { storeToRefs } from 'pinia'
import type { IconName } from 'client/components/icon/icons'
import { $T } from 'client/library/translation'
import type { PlusAccount } from 'client/server-export'

const props = defineProps<{
  members: T[]
  isShowInvite: boolean
  isLoadingMembers: boolean
  isOwner: boolean // space owner or team owner both can be owner
  isSpaceOwner?: boolean // space owner only
  isAdmin?: boolean // team admin
  buildMenuOption: (args: {
    isOwner: boolean
    isAdmin?: boolean
    isSpaceOwner?: boolean
    member: T
  }) => Array<{ key: string; label: string; icon?: IconName; badge?: PlusAccount['plan'] }>
  displayRole: (memberMetadata: T) => string
}>()

const emit = defineEmits<{
  (e: 'invite'): void
  (e: 'select-option', args: { option: string; member: T }): void
}>()

const { isPhoneSizeViewportWidth } = useWindowResize()
const { userXmindId } = storeToRefs(useAccountStore())

const computeOwnerTitle = (memberMetadata: T) => {
  let title = ''
  if (memberMetadata.role === 'owner' && memberMetadata.type === 'space-member') {
    title = $T('Space Owner')
  }
  if (memberMetadata.role === 'owner' && memberMetadata.type === 'teammate') {
    title = $T('Team Owner')
  }

  return title
}

const membersCount = computed(() => props.members.length)
</script>
