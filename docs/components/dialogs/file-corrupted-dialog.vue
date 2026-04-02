<template>
  <base-full-screen-dialog
    :is-opened="true"
    :is-closable="false"
    :dialog-content-class="'!pt-[24px] sm:!pt-[24px] md:!pt-[48px] h-full'"
    @modal-dialog-close="handleClose"
  >
    <div ref="dialogBodyRef" class="flex h-full flex-col items-center justify-center overflow-hidden text-center">
      <h1 class="text-mobile-headline-small text-text-primary-light dark:text-text-primary-dark sm:text-desktop-headline-small mb-3">
        {{ $T('Unable to Open File') }}
      </h1>

      <p class="text-mobile-body-medium text-text-secondary-light dark:text-text-secondary-dark sm:text-desktop-body-medium mb-8 max-w-md">
        <template v-if="hasVersionHistory">
          {{
            $T(
              "We couldn't open this file right now. It may be temporarily unavailable or have an issue. Please refresh to try again, or restore it from a previous version.",
            )
          }}
        </template>
        <template v-else>
          {{
            $T(
              "We couldn't open this file right now. It may be temporarily unavailable or have an issue. Please refresh to try again, or report this to us if the problem continues.",
            )
          }}
        </template>
      </p>

      <div class="mb-8 flex w-full max-w-md flex-col gap-3 sm:w-auto sm:flex-row">
        <template v-if="hasVersionHistory">
          <base-button
            theme="default"
            :size="isPhoneSizeViewportWidth ? 'large' : 'small'"
            :class="isPhoneSizeViewportWidth ? 'w-full' : ''"
            @click="handleRestore"
          >
            {{ $T('Restore') }}
          </base-button>
          <base-button
            theme="secondary"
            :size="isPhoneSizeViewportWidth ? 'large' : 'small'"
            :class="isPhoneSizeViewportWidth ? 'w-full' : ''"
            @click="handleRefresh"
          >
            {{ $T('Refresh') }}
          </base-button>
        </template>
        <template v-else>
          <base-button
            theme="default"
            :size="isPhoneSizeViewportWidth ? 'large' : 'small'"
            :class="isPhoneSizeViewportWidth ? 'w-full' : ''"
            @click="handleReport"
          >
            {{ $T('Report') }}
          </base-button>
          <base-button
            theme="secondary"
            :size="isPhoneSizeViewportWidth ? 'large' : 'small'"
            :class="isPhoneSizeViewportWidth ? 'w-full' : ''"
            @click="handleRefresh"
          >
            {{ $T('Refresh') }}
          </base-button>
        </template>
      </div>
      <fw-divider class="mb-8 w-full max-w-md sm:w-[450px]" />
      <p class="text-mobile-caption-footer text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-body-small">
        {{ $T('Xmind: The all-in-one tool for mind mapping, AI creation, and team collaboration.') }}
      </p>
    </div>
  </base-full-screen-dialog>
</template>

<script setup lang="ts">
import { useTemplateRef, onMounted } from 'vue'
import { usePromiseHook } from 'utils/vue-utils'
import { useServiceStore } from 'client/store'
import { useWindowResize } from 'client/composables/window-resize'
import { emailFeedback } from 'utils/email-feedback'
import BaseFullScreenDialog from 'client/components/base/full-screen-dialog.vue'
import BaseButton from 'client/components/base/button.vue'
import { $T } from 'client/library/translation'
import { useMasterLoading } from 'client/pages/app/composables/master-loading'

const props = defineProps<{
  hasVersionHistory: boolean
  fileId: string
  teamId: string
}>()

const dialogBodyRef = useTemplateRef<HTMLElement>('dialogBodyRef')

const { isPhoneSizeViewportWidth } = useWindowResize()
const { resolve } = usePromiseHook()
const handleClose = () => {
  useServiceStore().services.action?.editorNext?.closeEditor?.execute({ isForceClose: true })
  resolve(false)
}

const handleRestore = async () => {
  const res = await useServiceStore().services.action.dialog.openSnapshotDialog({
    fileId: props.fileId,
    teamId: props.teamId,
    container: dialogBodyRef.value,
  })

  if (res) {
    resolve(true)
  }
}

const handleReport = () => {
  emailFeedback()
}

const handleRefresh = () => {
  window.location.reload()
}

onMounted(() => {
  useMasterLoading().showMasterLoading()
})
</script>
