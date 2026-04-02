<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
import ModalDialog from 'client/components/new-base-modal-dialog.vue'
import BaseButton from 'client/components/base/button.vue'
import baseDivider from 'client/components/base/divider.vue'
import checkboxItem from 'client/components/composite/checkbox-item.vue'
import { usePromiseHook } from 'utils/vue-utils'
import { $T } from 'client/library/translation'
import { useServices } from 'app/fragments/use-services'
import { useCloudKitClient } from 'app/composables/cloud-kit-client'
import { useAccountStore, useUserBaseProfileStore } from 'client/store'
import { useWindowResize } from 'client/composables/window-resize'

const props = defineProps<{
  teamId: string
  teamInfo: Record<string, any>
}>()

const { resolve } = usePromiseHook()
const isSending = ref(false)

const { isPhoneSizeViewportWidth } = useWindowResize()

const cancel = () => resolve(false)

const checkers = reactive({
  noNeed: false,
  differentTool: false,
  tooExpensive: false,
  lackFeatures: false,
  DifficultToUse: false,
  other: false,
})
const isAllowedToSend = computed(() => Object.values(checkers).some(value => value))

const otherDescription = ref('')
const suggestion = ref('')

const checkerTitles = computed(() => {
  return {
    noNeed: $T('No longer need the team'),
    differentTool: $T('Switched to a different tool'),
    tooExpensive: $T('Too expensive'),
    lackFeatures: $T('Lack of needed features'),
    DifficultToUse: $T('Difficult to use'),
    other: $T('Other'),
  }
})

const handleSendFeedback = async () => {
  isSending.value = true
  const userProfile = await useUserBaseProfileStore().getUserBaseProfile(useAccountStore().userXmindId)
  const feedback = {
    ...props.teamInfo,
    teamOwnerEmail: userProfile?.email ?? '',
    ["Anything you'd like to add? We appreciate your insights."]: otherDescription.value,
    ['Your feedback is important to us. Please let us know your thoughts here.']: suggestion.value,
  }

  try {
    const isSent = await useCloudKitClient().sentTeamDeletionFeedback({ teamId: props.teamId, feedbackData: feedback })
    isSent && useServices().action.dialog?.openTeamFeedbackSuccessDialog()
    resolve(isSent)
  } catch (error) {
    logger.error('Failed to send feedback', error)
  } finally {
    isSending.value = false
  }
}
</script>

<template>
  <div class="team-deletion-feedback-dialog">
    <modal-dialog
      ref="dialogInstance"
      :title="$T('We need your feedback')"
      :is-opened="true"
      :width="520"
      :close-button="!!isPhoneSizeViewportWidth"
      :dialog-header-class="'!pb-4 sm:!pb-6'"
      dialog-body-class="!pt-0"
      dialog-footer-class="!pt-4 !pb-[32px] sm:!pb-[18px]"
      @modal-dialog-close="cancel"
    >
      <div class="flex w-full flex-col gap-4 sm:gap-6">
        <section class="flex w-full flex-col gap-5 sm:gap-4">
          <p class="w-full text-mobile-subhead-small sm:text-desktop-subhead-small">{{ $T('What is the primary reason for deleting your team?') }}</p>

          <div v-for="checker in Object.keys(checkers)" :key="checker" class="flex w-full">
            <checkbox-item v-model="checkers[checker]" :title="checkerTitles[checker]" />
          </div>
        </section>

        <section v-if="checkers.other" class="h-[100px] w-full">
          <fw-textarea
            v-model="otherDescription"
            class="h-[100px]"
            :maxlength="1000"
            :placeholder="$T('Anything you\'d like to add? We appreciate your insights.')"
          />
        </section>

        <section class="flex w-full flex-col gap-4 sm:gap-5">
          <p class="w-full text-mobile-subhead-small sm:text-desktop-subhead-small">{{ $T('What could we have done better?') }}</p>
          <fw-textarea
            v-model="suggestion"
            :maxlength="1000"
            class="h-[100px]"
            :placeholder="$T('Your feedback is important to us. Please let us know your thoughts here.')"
          />
        </section>
      </div>
      <template #between-body-footer>
        <base-divider />
      </template>
      <template #footer>
        <div class="flex w-full flex-col gap-4 sm:flex-row sm:justify-end">
          <base-button
            class="!hidden w-auto sm:!block"
            :theme="'default'"
            :size="isPhoneSizeViewportWidth ? 'large' : 'small'"
            :disabled="false"
            data-focus="not-allow"
            @click="() => cancel()"
          >
            {{ $T('Cancel') }}
          </base-button>
          <base-button
            class="w-full sm:w-auto"
            :theme="'secondary'"
            :size="isPhoneSizeViewportWidth ? 'large' : 'small'"
            :disabled="isSending || !isAllowedToSend"
            data-focus="not-allow"
            @click="handleSendFeedback"
          >
            {{ $T('Submit feedback') }}
          </base-button>
        </div>
      </template>
    </modal-dialog>
  </div>
</template>
