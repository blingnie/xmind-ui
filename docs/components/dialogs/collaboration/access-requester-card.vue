<template>
  <div class="member-card flex w-full items-center justify-between">
    <div class="flex h-full flex-1 items-center gap-3 overflow-hidden">
      <img v-if="displayAvatar" uk-img class="height-[32px] w-[32px] flex-shrink-0 overflow-hidden rounded-[16px]" :src="displayAvatar" />
      <fw-empty-user-profile-icon v-else class="height-[32px] w-[32px] flex-shrink-0" />
      <div class="flex flex-1 flex-col overflow-hidden">
        <div class="flex">
          <span class="no-underline-safari truncate text-mobile-subhead-mini no-underline sm:text-desktop-subhead-mini">{{ displayName }}</span>
        </div>
        <span class="no-underline-safari block truncate text-desktop-caption text-text-tertiary-light no-underline dark:text-text-tertiary-light">{{
          props.name
        }}</span>
      </div>
    </div>
    <div class="flex h-full items-center text-desktop-body-3">
      <span v-if="buttonMode === 'roleInfo'" class="text-mobile-body-medium sm:text-desktop-body-medium">{{ displayRoleInfos[role] }}</span>
      <fw-select
        v-else-if="buttonMode === 'roleEdit'"
        :selected-key="role"
        :options="displayRoleOperation"
        :trigger-size="isPhoneSizeViewportWidth ? 'medium' : 'small'"
        :menu-custom-class="'w-52'"
        @select="displayRoleOperate"
      ></fw-select>
      <fw-select
        v-else
        :selected-key="role"
        :options="displayInviteeRole"
        :trigger-size="isPhoneSizeViewportWidth ? 'medium' : 'small'"
        :menu-custom-class="'w-52'"
        @select="displayInviteeRoleOperate"
      ></fw-select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FileAccessRequestPayload } from 'client/library/cloud-kit'
import { $T } from 'client/library/translation'
import { useWindowResize } from 'client/composables/window-resize'

const props = withDefaults(
  defineProps<{
    xmindId?: string
    teamId?: string
    name: string
    avatar: string
    role?: FileAccessRequestPayload['role']
    buttonMode: 'roleInfo' | 'roleEdit' | 'leave'
    aggregated?: boolean
  }>(),
  {
    xmindId: undefined,
    name: '',
    avatar: '',
    role: 'viewer',
    teamId: '',
    aggregated: false,
  },
)

const emit = defineEmits<{
  (event: 'role-change', value: { role: FileAccessRequestPayload['role']; accountId: string; aggregated: boolean }): void
  (event: 'user-remove', value: { accountId: string }): void
  (event: 'leave'): void
}>()

const { isPhoneSizeViewportWidth } = useWindowResize()

const displayName = computed(() => props.name || $T('Anonymous'))
const displayAvatar = computed(() => (props.name ? props.avatar : null))

const changeRole = (role: FileAccessRequestPayload['role']) => {
  emit('role-change', { role, accountId: props.xmindId, aggregated: props.aggregated })
}

const removeUser = async () => {
  emit('user-remove', { accountId: props.xmindId })
}

const displayRoleOperation = computed<{ key: FileAccessRequestPayload['role'] | 'separator' | 'remove'; label: string }[]>(() => {
  return [
    { key: 'editor', label: $T('Can Edit') },
    { key: 'viewer', label: $T('Can View') },
    { key: 'separator', label: '' },
    { key: 'remove', label: $T('Remove') },
  ]
})

const displayRoleInfos = computed<Record<FileAccessRequestPayload['role'], string>>(() => ({
  owner: $T('Owner'),
  editor: $T('Editor'),
  viewer: $T('Viewer'),
}))

const displayInviteeRole = computed<{ key: FileAccessRequestPayload['role'] | 'leave' | 'separator'; label: string }[]>(() => {
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
</script>
