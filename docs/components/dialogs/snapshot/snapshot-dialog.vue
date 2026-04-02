<template>
  <div class="contents">
    <fw-responsive-wrapper>
      <template #desktop
        ><modal-dialog
          :is-opened="true"
          :close-button="false"
          :width="944"
          :height="624"
          :dialog-header-class="'hidden'"
          :dialog-footer-class="'hidden'"
          :dialog-body-class="'!p-0'"
          :dialog-class="'rounded-2xl'"
          :min-height="624"
          @modal-dialog-close="handleClose"
        >
          <div class="inset-0 flex h-full items-center gap-3 rounded-lg bg-fill-container-light p-4 dark:bg-fill-container-dark">
            <div class="tw-section-container flex h-full flex-1 flex-col overflow-hidden rounded-[12px]">
              <snapshot-empty v-if="isSnapshotEmpty" />
              <snapshot-preview
                v-else-if="selectedSnapshot"
                :key="selectedSnapshot?.snapshotId"
                :snapshot="selectedSnapshot"
                :is-fetching-snapshot-list="isFetchingSnapshotList"
                :sheet-list-pop-boundary="'.snapshot-left-panel'"
                @plan-upgrade="handlePlanUpgrade"
                @map-status="snapshotPreviewStatus = $event"
              />
            </div>
            <div
              class="tw-section-container flex h-full w-[270px] flex-col rounded-[12px] bg-fill-surfaceDesktop-light dark:bg-fill-surfaceDesktop-dark"
            >
              <div class="w-full flex-1 overflow-y-auto">
                <snapshot-list
                  class="snapshot-right-panel"
                  :snapshots="snapshots"
                  :selected-snapshot="selectedSnapshot"
                  :show-selected-snapshot="true"
                  :is-version-history-unlimited="isVersionHistoryUnlimited"
                  @selected-snapshot-change="handleSelectedSnapshotChange"
                  @restore-snapshot="handleSnapshotRestore"
                  @plan-upgrade="handlePlanUpgrade"
                  @close="handleClose"
                ></snapshot-list>
              </div>
              <div class="w-full">
                <fw-divider />
              </div>
              <div class="flex items-center justify-end gap-2 px-4 py-[18px]">
                <fw-button size="small" theme="default" @click="handleClose">{{ $T('Cancel') }}</fw-button>
                <fw-button
                  size="small"
                  theme="secondary"
                  :disabled="!selectedSnapshot || snapshotPreviewStatus === 'loading'"
                  @click="handleSnapshotRestore"
                  >{{ $T('Restore') }}</fw-button
                >
              </div>
            </div>
          </div>
        </modal-dialog></template
      >
      <template #mobile>
        <modal-dialog
          class="snapshot-list-dialog"
          :is-opened="true"
          :close-button="activatedComponent === 'snapshot-list'"
          :width="'100%'"
          :height="'100%'"
          :max-width="'100%'"
          :max-height="'100%'"
          :title="$T('Version History')"
          :dialog-body-class="'p-0'"
          :dialog-class="'!rounded-none'"
          :dialog-header-class="'px-4'"
          @modal-dialog-close="handleClose"
        >
          <template #separator>
            <div class="w-full pt-6"><fw-divider /></div>
          </template>

          <template v-if="activatedComponent === 'snapshot-preview'" #header>
            <div class="flex w-full items-center justify-between text-mobile-subhead-small">
              <rounded-icon icon-name="chevron-backward" @click.prevent.stop="handleBack" />
              <span>{{ pretty24HourDate(selectedSnapshot?.createdTime, REGION) }}</span>

              <fw-button size="large" theme="link" :disabled="snapshotPreviewStatus === 'loading'" @click="handleSnapshotRestore">
                <span class="">{{ $T('Restore') }}</span>
              </fw-button>
            </div>
          </template>

          <div class="size-full">
            <div v-if="isFetchingSnapshotList" class="flex size-full items-center justify-center">
              <fw-loading />
            </div>

            <snapshot-empty v-else-if="isSnapshotEmpty" />

            <snapshot-list
              v-else-if="activatedComponent === 'snapshot-list'"
              :key="selectedSnapshot?.snapshotId"
              class="size-full"
              :snapshots="snapshots"
              :selected-snapshot="selectedSnapshot"
              :show-selected-snapshot="false"
              :is-fetching-snapshot-list="isFetchingSnapshotList"
              :is-version-history-unlimited="isVersionHistoryUnlimited"
              @selected-snapshot-change="handleSelectSnapshot"
              @restore-snapshot="handleSnapshotRestore"
              @plan-upgrade="handlePlanUpgrade"
              @close="handleClose"
            >
            </snapshot-list>

            <snapshot-preview
              v-else-if="activatedComponent === 'snapshot-preview'"
              :snapshot="selectedSnapshot"
              class="size-full"
              @plan-upgrade="handlePlanUpgrade"
              @map-status="snapshotPreviewStatus = $event"
            >
            </snapshot-preview>
          </div>
        </modal-dialog>
      </template>
    </fw-responsive-wrapper>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import ModalDialog from '../../new-base-modal-dialog.vue'
import SnapshotList from './snapshot-list.vue'
import SnapshotPreview from './snapshot-preview.vue'
import roundedIcon from 'client/components/base/rounded-icon.vue'
import SnapshotEmpty from 'client/components/dialogs/snapshot/snapshot-empty.vue'

import { usePromiseHook } from 'utils/vue-utils'
import { useAccountStore, useServiceStore } from 'client/store'
import { useUserBaseProfileStore } from 'client/store/user-base-profile-store'
import type { ExtendedSnapshotMetadata } from 'client/types/file'
import { useCloudKitClient } from 'app/composables/cloud-kit-client'
import { $T } from 'client/library/translation'
import { pretty24HourDate } from 'utils/misc'
import { useCollaborativeClient } from 'app/services/collaborative'
import { toastActions } from 'client/library/new-notifications'
import { trackNewVersionWorks } from 'client/library/tracker'
import { useTeamSpaceData } from 'app/composables/team-space-data'
import { type PlusAccount, type SnapshotMetadata, SNAPSHOT_RETAINED_FOR_FREE_IN_DAYS } from 'client/server-export'
import { REGION } from 'client/constants'
import { useWindowResize } from 'client/composables/window-resize'

const props = defineProps<{
  fileId: string
  teamId: string
}>()

const { resolve } = usePromiseHook()

const { isPhoneSizeViewportWidth } = useWindowResize()

const handleClose = () => {
  resolve(false)
}

const snapshotPreviewStatus = ref<'loading' | 'loaded'>('loading')
const snapshots = ref<ExtendedSnapshotMetadata[]>(null)
const selectedSnapshot = ref<ExtendedSnapshotMetadata>(null)

const activatedComponent = ref<'snapshot-list' | 'snapshot-preview' | ''>('')

const isFetchingSnapshotList = ref<boolean>(false)

const isVersionHistoryUnlimited = computed(() => {
  const teamPlan = useTeamSpaceData().getUnexpiredTeamPlanSync(props.teamId)
  return teamPlan === 'enterprise'
})

const isSnapshotEmpty = computed(() => {
  return !isFetchingSnapshotList.value && (!snapshots.value || snapshots.value.length === 0)
})

const isShouldShowUpgrade = computed(() => {
  return !isVersionHistoryUnlimited.value && selectedSnapshot.value?.planRequired !== 'basic'
})

const computeSnapshotPlanRequired = async (snapshotMetadata: SnapshotMetadata): Promise<PlusAccount['plan']> => {
  const isTeamSubscribed = await useTeamSpaceData().getIsTeamSubscribedAsync(props.teamId)
  const snapshotAge = Date.now() - new Date(snapshotMetadata.createdTime).getTime()
  const isMyWorksTeam = props.teamId === useAccountStore().userXmindId

  return snapshotAge > SNAPSHOT_RETAINED_FOR_FREE_IN_DAYS * 24 * 60 * 60 * 1000 && !isTeamSubscribed
    ? isMyWorksTeam
      ? 'premium'
      : 'business'
    : 'basic'
}

onMounted(async () => {
  isFetchingSnapshotList.value = true

  try {
    activatedComponent.value = 'snapshot-list'

    const data = await useCloudKitClient().listFileSnapshots({ fileId: props.fileId })
    snapshots.value = await Promise.all(
      data.snapshots
        .sort((a, b) => (new Date(a.createdTime).getTime() < new Date(b.createdTime).getTime() ? 1 : -1))
        .map(async metadata => {
          const modifierNames = metadata.modifierIds
            ? await Promise.all(
                metadata.modifierIds.filter(Boolean).map(async userId => {
                  const profile = await useUserBaseProfileStore().getUserBaseProfile(userId)
                  return useUserBaseProfileStore().getUserDisplayName(profile)
                }),
              )
            : []

          return {
            ...metadata,
            modifierNames,
            planRequired: await computeSnapshotPlanRequired(metadata),
          }
        }),
    )

    if (snapshots.value.length && !isPhoneSizeViewportWidth.value) {
      selectedSnapshot.value = snapshots.value[0]
    }
  } catch (err) {
    logger.error(err)
  }

  isFetchingSnapshotList.value = false
})

const handleSelectedSnapshotChange = (value: { snapshot: ExtendedSnapshotMetadata }) => {
  selectedSnapshot.value = value.snapshot
}

const handlePlanUpgrade = () => {
  useServiceStore().services.action.dialog.openActivateDialog({ teamId: props.teamId })
}

const handleSnapshotRestore = async () => {
  if (isShouldShowUpgrade.value) {
    handlePlanUpgrade()
    return
  }

  const { preEditOrEditTopics, sendStatelessMessage } = useCollaborativeClient()

  if (preEditOrEditTopics.value && preEditOrEditTopics.value.length > 0) {
    toastActions.snapshotRestoreFailureWhenCollaborativeEdit()
    return
  }

  if (
    await useServiceStore().services.action.dialog.confirm({
      title: $T('Restore History Version'),
      width: 538,
      height: 232,
      description: $T('Are you sure you would like to restore to this version?'),
      confirmButtonText: $T('Restore'),
      cancelButtonText: $T('Cancel'),
      isMobileDrawerStyle: true,
      onCancel: async () => {
        trackNewVersionWorks.historyVersion('cancel')
        return true
      },
    })
  ) {
    trackNewVersionWorks.historyVersion('restore')

    const snapshotAgeAsDays = Math.ceil((Date.now() - new Date(selectedSnapshot.value?.createdTime).getTime()) / (24 * 60 * 60 * 1000))

    if (snapshotAgeAsDays <= 1) {
      trackNewVersionWorks.restoreHistory('1day')
    } else if (snapshotAgeAsDays <= 3) {
      trackNewVersionWorks.restoreHistory('3day')
    } else {
      trackNewVersionWorks.restoreHistory('7day')
    }

    sendStatelessMessage(JSON.stringify({ action: 'prepare-restore-snapshot' }))

    setTimeout(async () => {
      await useCloudKitClient().restoreSnapshot({
        fileId: selectedSnapshot.value.fileId,
        snapshotId: selectedSnapshot.value.snapshotId,
      })
    }, 5 * 1000)

    resolve(true)
  }
}

const handleSelectSnapshot = (value: { snapshot: ExtendedSnapshotMetadata }) => {
  selectedSnapshot.value = value.snapshot
  activatedComponent.value = 'snapshot-preview'
}

const handleBack = () => {
  activatedComponent.value = 'snapshot-list'
}
</script>

<style lang="less" scoped></style>
