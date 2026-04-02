<template>
  <modal-dialog
    :is-opened="true"
    :width="440"
    :is-mobile-drawer="false"
    :dialog-header-class="'!p-0'"
    :dialog-body-class="'!p-0'"
    :dialog-footer-class="'hidden'"
    @modal-dialog-close="resolve(null)"
  >
    <div class="w-full">
      <img :src="IntroBg" alt="Copilot image attachment feature" class="h-auto w-full" />
    </div>

    <div class="absolute right-4 top-4">
      <close class="self-baseline" @click="resolve(null)" />
    </div>

    <div class="p-8 text-center">
      <p class="text-mobile-headline-large sm:text-desktop-headline-large text-text-primary-light dark:text-text-primary-dark">
        {{ $T('Image attachments are now supported') }}
      </p>
      <p class="font-NeverMind-UI text-mobile-body-large sm:text-desktop-body-large text-text-secondary-light dark:text-text-secondary-dark my-4">
        {{ $T('Upload mind map or content images to automatically recognize their structure and generate clear, organized mind maps.') }}
      </p>

      <fw-button class="mt-6 w-full" size="medium" theme="secondary" @click="resolve(null)">{{ $T('Try Now') }}</fw-button>
    </div>
  </modal-dialog>
</template>

<script setup lang="ts">
import { usePromiseHook } from 'utils/vue-utils'
import IntroBg from 'client/assets/static/images/dialog-copilot/copilot-image-intro.png'
import ModalDialog from 'client/components/new-base-modal-dialog.vue'
import Close from 'client/components/base/close.vue'

const { resolve } = usePromiseHook()
</script>
