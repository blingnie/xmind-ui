<script lang="ts" setup>
import ModalDialog from 'client/components/new-base-modal-dialog.vue'
import { usePromiseHook } from 'utils/vue-utils'
import { $T } from 'client/library/translation'

const { resolve } = usePromiseHook()

const handleClose = () => resolve(true)
</script>

<template>
  <div class="team-deletion-feedback-dialog">
    <modal-dialog
      ref="dialogInstance"
      :is-opened="true"
      :width="360"
      :dialog-footer-styles="{ paddingBottom: '0' }"
      :dialog-header-styles="{ paddingTop: '8px' }"
      @modal-dialog-close="handleClose"
    >
      <div class="flex w-full flex-col gap-4">
        <p class="text-center text-desktop-display-4">{{ $T('Thank you for your feedback') }}</p>

        <div class="flex w-full justify-center">
          <img width="296" :src="$toResourceURL('/assets/static/images/dialog-team/team-deletion-feedback-success.png')" alt="app.xmind.com" />
        </div>

        <p class="w-full text-center text-desktop-body-3 text-dark-grey-8 dark:text-light-grey-1">
          {{ $T("We're sorry to see you go and appreciate your input to help us improve.") }}
        </p>

        <fw-button class="mt-6 w-full" theme="secondary" size="medium" @click="handleClose">{{ $T('Start Now') }}</fw-button>
      </div>
    </modal-dialog>
  </div>
</template>
