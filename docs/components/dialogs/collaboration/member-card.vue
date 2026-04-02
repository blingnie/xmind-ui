<template>
  <div class="member-card flex w-full items-center justify-between">
    <div class="flex h-full flex-1 items-center gap-3 overflow-hidden">
      <div
        v-if="displayAvatar"
        class="relative h-[32px] w-[32px] overflow-hidden rounded-full before:absolute before:inset-0 before:rounded-full before:border before:border-gray-500/20"
      >
        <img uk-img :src="displayAvatar" />
      </div>

      <fw-empty-user-profile-icon v-else class="height-[32px] w-[32px] flex-shrink-0" />
      <div class="flex flex-1 flex-col overflow-hidden">
        <div class="flex">
          <span class="no-underline-safari truncate text-mobile-subhead-mini no-underline sm:text-desktop-subhead-mini">{{ displayName }}</span>
        </div>
        <span class="no-underline-safari block truncate text-desktop-caption text-text-tertiary-light no-underline dark:text-text-tertiary-dark">{{
          displayContact
        }}</span>
      </div>
    </div>
    <div class="flex h-full items-center text-desktop-body-3">
      <fw-tooltip v-if="roleIcon" style="margin-right: 6px" :content-style="{ 'max-width': '260px', 'white-space': 'normal' }" :allow-click="true">
        <template #trigger>
          <span
            uk-svg
            class="uk-display-block text-mobile-body-medium sm:text-desktop-body-medium"
            :data-src="roleIcon"
            width="16"
            height="16"
          ></span>
        </template>
        <template v-if="roleIconTooltip" #tooltip>
          <span>{{ roleIconTooltip }}</span>
        </template>
      </fw-tooltip>

      <span v-if="buttonMode === 'roleInfo'" class="text-mobile-body-medium sm:text-desktop-body-medium">{{ displayRoleInfos[role] }}</span>
      <span v-else-if="buttonMode === 'roleCan'" class="text-mobile-body-medium sm:text-desktop-body-medium">{{ displayRoleCans[role] }}</span>
      <fw-select
        v-else-if="buttonMode === 'roleEdit'"
        :selected-key="role"
        :options="displayRoleOperation"
        :trigger-size="isPhoneSizeViewportWidth ? 'medium' : 'small'"
        :menu-custom-class="'w-52'"
        @select="displayRoleOperate"
      />
      <fw-select
        v-else
        :selected-key="role"
        :options="displayInviteeRole"
        :trigger-size="isPhoneSizeViewportWidth ? 'medium' : 'small'"
        :menu-custom-class="'w-52'"
        @select="displayInviteeRoleOperate"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SharingInviteeProfile } from 'client/library/cloud-kit'
import { $T } from 'client/library/translation'
import { useWindowResize } from 'client/composables/window-resize'
import { useTeamSpaceData } from 'app/composables/team-space-data'
import type { IconName } from 'client/components/icon/icons'

const props = withDefaults(
  defineProps<{
    xmindId?: string
    teamId?: string
    name: string
    email?: string
    phone?: string
    avatar: string
    role?: SharingInviteeProfile['role'] | 'owner'
    roleIcon?: string
    roleIconTooltip?: string
    inviteMethod?: SharingInviteeProfile['inviteMethod']
    buttonMode: 'roleInfo' | 'roleCan' | 'roleEdit' | 'leave'
    accountId?: string
    aggregated?: boolean
  }>(),
  {
    xmindId: undefined,
    name: '',
    email: undefined,
    phone: undefined,
    roleIcon: undefined,
    roleIconTooltip: undefined,
    avatar: '',
    role: 'viewer',
    inviteMethod: undefined,
    teamId: '',
    accountId: '',
    aggregated: false,
  },
)

const emit = defineEmits<{
  (event: 'role-change', value: { role: SharingInviteeProfile['role']; accountId: string; aggregated: boolean }): void
  (event: 'user-remove', value: { accountId: string; aggregated: boolean }): void
  (event: 'leave'): void
}>()

const { isPhoneSizeViewportWidth } = useWindowResize()

const displayName = computed(() => props.name || $T('Anonymous'))
const displayContact = computed(() => {
  if (props.inviteMethod === 'email') return props.email ?? ''
  if (props.inviteMethod === 'phone') return props.phone ?? ''
  if (props.inviteMethod === 'slack' && !props.xmindId) return props.email ?? ''
  return ''
})
const displayRoleInfos = computed<Record<SharingInviteeProfile['role'], string>>(() => ({
  owner: $T('Owner'),
  editor: $T('Editor'),
  viewer: $T('Viewer'),
}))
const displayRoleCans = computed<Record<SharingInviteeProfile['role'], string>>(() => ({
  owner: $T('Owner'),
  editor: $T('Can edit'),
  viewer: $T('Can view'),
}))

const displayAvatar = computed(() => (props.name ? props.avatar : null))

const changeRole = (role: SharingInviteeProfile['role']) => {
  emit('role-change', { role, accountId: props.accountId || props.xmindId || props.email, aggregated: props.aggregated })
}

const removeUser = async () => {
  emit('user-remove', { accountId: props.accountId || props.xmindId || props.email, aggregated: props.aggregated })
}

const displayRoleOperation = computed<{ key: SharingInviteeProfile['role'] | 'remove' | 'separator'; label: string; icon?: IconName }[]>(() => {
  return [
    {
      key: 'editor',
      label: $T('Can edit'),
      icon: (!useTeamSpaceData().getIsTeamSubscribedSync(props.teamId) ? 'lock-pro' : undefined) as IconName | undefined,
    },
    { key: 'viewer', label: $T('Can view') },
    { key: 'separator', label: '' },
    { key: 'remove', label: $T('Remove') },
  ]
})

const displayRoleOperate = operation => {
  switch (operation) {
    case 'editor':
    case 'viewer':
      changeRole(operation)
      return
    case 'remove':
      removeUser()
      return
  }
}

const displayInviteeRole = computed<{ key: SharingInviteeProfile['role'] | 'separator' | 'leave'; label: string }[]>(() => {
  return props.role === 'editor'
    ? [
        { key: 'editor', label: $T('Editor') },
        { key: 'separator', label: '' },
        { key: 'leave', label: $T('Leave') },
      ]
    : [
        { key: 'viewer', label: $T('Viewer') },
        { key: 'separator', label: '' },
        { key: 'leave', label: $T('Leave') },
      ]
})

const displayInviteeRoleOperate = operation => {
  switch (operation) {
    case 'editor':
    case 'viewer':
      return
    case 'leave':
      emit('leave')
      return
  }
}
</script>
