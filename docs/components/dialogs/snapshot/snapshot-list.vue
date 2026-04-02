<template>
  <div class="flex w-full flex-col gap-2 p-4">
    <div v-if="isFetchingSnapshotList" class="flex size-full items-center justify-center">
      <fw-loading />
    </div>
    <template v-else>
      <div
        v-if="!isVersionHistoryUnlimited"
        class="p-2 text-mobile-caption-header text-text-secondary-light dark:text-text-secondary-dark sm:text-desktop-body-small"
      >
        {{ $T('Map Versions are stored for 30 days') }}
      </div>
      <div v-for="(snapshot, index) in snapshots" :key="index">
        <fw-menu-button
          :class="clsx('flex w-full items-center justify-between gap-1 py-[7.5px]', isPhoneSizeViewportWidth && 'py-[10.5px]')"
          :active="selectedSnapshot?.snapshotId === snapshot.snapshotId"
          @click="handleSnapshotSelect(snapshot)"
        >
          <div class="flex flex-1 flex-col text-left">
            <span class="truncate text-mobile-body-medium text-text-primary-light dark:text-text-primary-dark sm:text-desktop-body-medium">
              {{ pretty24HourDate(snapshot.createdTime, REGION) }}
            </span>
            <span
              v-if="snapshot.modifierNames?.length"
              class="truncate text-desktop-caption text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-caption-small"
            >
              {{ snapshot.modifierNames?.join(', ') }}
            </span>
          </div>
          <div class="flex h-full items-center justify-center">
            <fw-plan-badge v-if="snapshot.planRequired !== 'basic'" :plan="snapshot.planRequired" />
          </div>
        </fw-menu-button>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { REGION } from 'client/constants'
import { trackNewVersionWorks } from 'client/library/tracker'
import { ExtendedSnapshotMetadata } from 'client/types/file'
import { pretty24HourDate } from 'utils/misc'
import { useWindowResize } from 'client/composables/window-resize'

const { isPhoneSizeViewportWidth } = useWindowResize()

withDefaults(
  defineProps<{
    snapshots: ExtendedSnapshotMetadata[] | null
    selectedSnapshot: ExtendedSnapshotMetadata | null
    showSelectedSnapshot?: boolean
    isFetchingSnapshotList?: boolean
    isVersionHistoryUnlimited?: boolean
  }>(),
  {
    snapshots: null,
    selectedSnapshot: null,
    isVersionHistoryUnlimited: false,
  },
)

const emit = defineEmits<{
  (event: 'selected-snapshot-change', value: { snapshot: ExtendedSnapshotMetadata }): void
  (event: 'plan-upgrade'): void
}>()

const handleSnapshotSelect = (snapshot: ExtendedSnapshotMetadata) => {
  trackNewVersionWorks.historyVersion('viewHistory')
  emit('selected-snapshot-change', { snapshot })
}
</script>

<style lang="less" scoped></style>
