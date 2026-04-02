<template>
  <modal-dialog
    ref="dialog"
    :is-opened="isOpened"
    :width="748"
    :height="isPhoneSizeViewportWidth ? '85vh' : 460"
    :dialog-body-styles="{ padding: 0 }"
    :dialog-footer-styles="'display: none'"
    :dialog-header-styles="'display: none'"
    @modal-dialog-close="handleClose"
  >
    <div class="relative h-full min-h-[400px]">
      <div v-if="!isPhoneSizeViewportWidth" class="flex h-full p-0">
        <div class="relative flex-[3] overflow-hidden">
          <img :src="currentPCImage" :alt="content.title" class="h-full w-full object-cover object-left" />
        </div>

        <div
          class="border-l border-solid border-[var(--modal-divider,rgba(18,20,22,0.12))] dark:border-[var(--modal-divider,rgba(255,255,255,0.12))]"
        ></div>

        <div class="relative m-6 flex flex-[2] flex-col justify-between">
          <div class="flex justify-end">
            <close class="self-end" @click="handleClose" />
          </div>

          <div class="flex flex-1 flex-col overflow-y-auto pt-12">
            <div class="space-content">
              <h2 class="mb-4 font-NeverMind-UI text-mobile-headline-small text-text-primary-light dark:text-text-primary-dark">
                {{ content.title }}
              </h2>
              <p class="modal-description font-NeverMind-UI text-desktop-body-large text-text-secondary-light dark:text-text-secondary-dark">
                {{ content.description }}
              </p>
              <div
                v-if="showUpgradeSection"
                class="mt-6 flex items-center gap-3 rounded-lg bg-mask-overlay-s-light px-3 py-2 dark:bg-mask-overlay-s-dark"
              >
                <div class="flex-shrink-0 rounded bg-[rgba(250,74,30,0.15)] p-0.5">
                  <fw-icon name="crown-fill" class="text-xred-500" />
                </div>
                <div class="flex-1">
                  <p class="font-NeverMind-UI text-desktop-caption text-text-primary-light dark:text-text-primary-dark">
                    {{ $T('Premium Yearly with Free eBook') }}
                  </p>
                  <p class="font-NeverMind-UI text-desktop-caption text-text-primary-light dark:text-text-primary-dark">
                    {{ $T('Why Xmind Rocks? 2.0 (ePub/PDF)') }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end">
            <base-button theme="secondary" :size="'medium'" @click="handlePrimaryAction">
              {{ primaryButtonText }}
            </base-button>
          </div>
        </div>
      </div>

      <div v-else class="relative flex h-full w-full flex-col">
        <close class="absolute right-4 top-4 z-10" :force-light-mode="true" @click="handleClose" />

        <div class="flex-shrink-0 bg-white">
          <div class="overflow-hidden rounded-t-lg">
            <img :src="currentMobileImage" :alt="content.title" class="h-full w-full object-cover" />
          </div>
        </div>

        <base-divider />

        <div class="flex-1 overflow-y-auto p-6">
          <h3 class="mb-4 font-NeverMind-UI text-mobile-headline-small text-text-primary-light dark:text-text-primary-dark">
            {{ content.title }}
          </h3>
          <p class="font-NeverMind-UI text-text-secondary-light dark:text-text-secondary-dark">
            {{ content.description }}
          </p>
          <div
            v-if="showUpgradeSection"
            class="mt-4 flex items-center gap-3 rounded-lg bg-mask-overlay-s-light px-3 py-2 dark:bg-mask-overlay-s-dark"
          >
            <div class="flex-shrink-0 rounded bg-[rgba(250,74,30,0.15)] p-0.5">
              <fw-icon name="crown-fill" class="text-xred-500" />
            </div>
            <div class="flex-1">
              <p class="font-NeverMind-UI text-mobile-caption-1 text-text-primary-light dark:text-text-primary-dark">
                {{ $T('Premium Yearly with Free eBook') }}
              </p>
              <p class="font-NeverMind-UI text-mobile-caption-1 text-text-primary-light dark:text-text-primary-dark">
                {{ $T('Why Xmind Rocks? 2.0 (ePub/PDF)') }}
              </p>
            </div>
          </div>
        </div>

        <div class="p-6 pt-4">
          <base-button theme="secondary" size="large" class="w-full" @click="handlePrimaryAction">
            {{ primaryButtonText }}
          </base-button>
        </div>
      </div>
    </div>
  </modal-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ModalDialog from 'client/components/new-base-modal-dialog.vue'
import Close from 'client/components/base/close.vue'
import BaseButton from 'client/components/base/button.vue'
import BaseDivider from 'client/components/base/divider.vue'
import { usePromiseHook } from 'utils/vue-utils'
import { useWindowResize } from 'client/composables/window-resize'
import { $T } from 'client/library/translation'
import { V26_ADD_ON_EMAIL_EBOOK_COUPON_CODE, REGION } from 'client/constants'
import { useServiceStore } from 'app/services/pinia'
import { usePaymentClient } from 'app/composables/payment-client'
import { useTracking } from 'client/composables/use-tracking'
import { useEditorFeaturePaywall } from 'app/composables/editor-feature-paywall'
import type { TaskBannerKey } from 'app/types/task-banner'
import taskWorkGenerateImagePC from 'client/assets/import-files/images/task-update-dialog/task-work-generate-pc.png?url'
import taskWorkGenerateImageMobile from 'client/assets/import-files/images/task-update-dialog/task-work-generate-mobile.png?url'
import taskPanelImagePC from 'client/assets/import-files/images/task-update-dialog/task-panel-pc.png?url'
import taskPanelImageMobile from 'client/assets/import-files/images/task-update-dialog/task-panel-mobile.png?url'
import taskGanttImagePC from 'client/assets/import-files/images/task-update-dialog/task-gantt-pc.png?url'
import taskGanttImageMobile from 'client/assets/import-files/images/task-update-dialog/task-gantt-mobile.png?url'
import taskWorkGenerateCnImagePC from 'client/assets/import-files/images/task-update-dialog/task-work-generate-cn-pc.png?url'
import taskWorkGenerateCnImageMobile from 'client/assets/import-files/images/task-update-dialog/task-work-generate-cn-mobile.png?url'
import taskPanelCnImagePC from 'client/assets/import-files/images/task-update-dialog/task-panel-cn-pc.png?url'
import taskPanelCnImageMobile from 'client/assets/import-files/images/task-update-dialog/task-panel-cn-mobile.png?url'
import taskGanttCnImagePC from 'client/assets/import-files/images/task-update-dialog/task-gantt-cn-pc.png?url'
import taskGanttCnImageMobile from 'client/assets/import-files/images/task-update-dialog/task-gantt-cn-mobile.png?url'
import { useAiCopilot } from 'app/composables/ai-features/copilot/ai-copilot'

const props = withDefaults(
  defineProps<{
    featureKey: TaskBannerKey
    isMyWorks?: boolean
    isRecent?: boolean
    teamId?: string
  }>(),
  {
    isMyWorks: false,
    isRecent: false,
  },
)

const dialog = ref<InstanceType<typeof ModalDialog>>()
const { resolve } = usePromiseHook()
const { isPhoneSizeViewportWidth } = useWindowResize()
const isOpened = ref(true)
const isUserEligibleForTrial = ref(false)
const { isEditorCommonPaidFeatureEnabled } = useEditorFeaturePaywall()

const contentMap: Record<
  TaskBannerKey,
  {
    title: string
    description: string
    images: {
      global: { pc: string; mobile: string }
      cn: { pc: string; mobile: string }
    }
  }
> = {
  'work-breakdown': {
    title: $T('Think smarter, work faster with Xmind AI'),
    description: $T(
      "Whether you're planning projects, exploring ideas, or making sense of messy information, Xmind AI is always here to help. It's smart, sleek, and now works seamlessly with you across Web, Desktop, and iOS.",
    ),
    images: {
      global: { pc: taskWorkGenerateImagePC, mobile: taskWorkGenerateImageMobile },
      cn: { pc: taskWorkGenerateCnImagePC, mobile: taskWorkGenerateCnImageMobile },
    },
  },
  panel: {
    title: $T('Your mind map is your action plan'),
    description: $T(
      'After mapping out ideas, turn them into tasks in one click—no tool-switching, no disruption. Go from planning to execution seamlessly, all within your mind map.',
    ),
    images: {
      global: { pc: taskPanelImagePC, mobile: taskPanelImageMobile },
      cn: { pc: taskPanelCnImagePC, mobile: taskPanelCnImageMobile },
    },
  },
  gantt: {
    title: $T('Two views, one flow, zero friction'),
    description: $T(
      'No more complicated setup or clunky tools. Go from mind map to gantt chart in a single click. Drag to adjust durations or dependencies. Click to edit task details. Update one task, and related tasks follow—no repetitive setup. Fast. Smooth. Intuitive.',
    ),
    images: {
      global: { pc: taskGanttImagePC, mobile: taskGanttImageMobile },
      cn: { pc: taskGanttCnImagePC, mobile: taskGanttCnImageMobile },
    },
  },
}

const content = computed(() => contentMap[props.featureKey] ?? contentMap['work-breakdown'])
const currentPCImage = computed(() => {
  const key = REGION === 'cn' ? 'cn' : 'global'
  return content.value.images[key].pc
})
const currentMobileImage = computed(() => {
  const key = REGION === 'cn' ? 'cn' : 'global'
  return content.value.images[key].mobile
})

const showUpgradeSection = computed(() => {
  return !isEditorCommonPaidFeatureEnabled.value && props.isMyWorks
})
const primaryButtonText = computed(() => {
  if (!showUpgradeSection.value) {
    return REGION === 'cn' ? $T('抢先体验') : $T('Explore Now')
  }
  return isUserEligibleForTrial.value ? $T('Start Free Trial') : $T('Upgrade Now')
})

const handleClose = async () => {
  await dialog.value?.closeDialogWithAnimation?.()
  isOpened.value = false
  resolve(false)
}

const handlePrimaryAction = async () => {
  await dialog.value?.closeDialogWithAnimation?.()

  if (!showUpgradeSection.value) {
    isOpened.value = false
    useAiCopilot().startCopilot({
      teamId: props.teamId,
      entry: 'main',
      initialStates: {
        inputText: '',
        fileName: null,
        fileContent: null,
        file: null,
        fileMimeType: null,
        isEnableThinking: false,
        task: 'project-plan',
        language: 'en-US',
        skeletonGroupId: 'Mind Map',
        spaceId: null,
        fileId: null,
      },
    })
    resolve(true)
    return
  }

  useServiceStore().services.action.dialog.openPaymentDialog({
    teamId: props.teamId,
    orderVersion: 'premium',
    isUpgradePlanOrder: true,
    isTrialOrder: isUserEligibleForTrial.value,
    isShowBenefitsSection: true,
    billingPeriodUIType: 'select',
    planDuration: 'yearly',
    coupon: V26_ADD_ON_EMAIL_EBOOK_COUPON_CODE,
  })
  useTracking().trackClick('upgrade', {
    dlg: 'promo_dialog',
    plan: 'premium',
    renew_period: 'yearly',
    tab: props.isRecent ? 'recents' : 'my_works',
    space: props.isMyWorks ? 'my_works' : 'team',
  })
  isOpened.value = false
  resolve(true)
}

onMounted(async () => {
  isUserEligibleForTrial.value = await usePaymentClient().isUserEligibleForTrial()
  useTracking().track('dialog_view', {
    dlg: 'promo_dialog',
    tab: props.isRecent ? 'recents' : 'my_works',
    space: props.isMyWorks ? 'my_works' : 'team',
  })
})
</script>
