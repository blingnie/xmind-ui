<template>
  <modal-dialog
    ref="dialog"
    :is-opened="isOpened"
    :width="748"
    :height="isPhoneSizeViewportWidth ? '85vh' : 460"
    :dialog-class="
      isPhoneSizeViewportWidth ? '!fixed !bottom-0 !left-0 !right-0 !w-full !m-0 !max-h-[calc(100vh-32px)] !rounded-t-2xl !rounded-b-none ' : ''
    "
    :dialog-body-styles="{ padding: 0 }"
    :dialog-footer-styles="'display: none'"
    :dialog-header-styles="'display: none'"
    @modal-dialog-close="handleClose"
  >
    <div class="relative h-full min-h-[400px]">
      <div v-if="!isPhoneSizeViewportWidth" class="flex h-full p-0">
        <div class="relative flex-[3] overflow-hidden">
          <transition :name="'fade'" mode="out-in">
            <img
              :key="currentUpdateIndex"
              :src="currentPCImage"
              :alt="updates[currentUpdateIndex].title"
              class="h-full w-full bg-white object-cover object-left"
            />
          </transition>
        </div>

        <div
          class="border-l border-solid border-[var(--modal-divider,rgba(18,20,22,0.12))] dark:border-[var(--modal-divider,rgba(255,255,255,0.12))]"
        ></div>

        <div class="relative m-6 flex flex-[2] flex-col justify-between">
          <div class="flex justify-end">
            <close class="self-end" @click="handleClose" />
          </div>

          <div class="flex flex-1 flex-col overflow-y-auto pb-8 pt-12">
            <div :key="currentUpdateIndex" class="space-content">
              <p v-if="REGION === 'cn'" class="font-NeverMind-UI text-desktop-subhead-mini text-text-primary-light dark:text-text-primary-dark mb-2">
                {{ cnLabels[currentUpdateIndex] }}
              </p>
              <h2 class="font-NeverMind-UI text-mobile-headline-small mb-4">
                <template v-if="currentUpdateIndex === 0">
                  <span :class="[REGION === 'cn' ? 'inline' : 'block', 'text-text-primary-light dark:text-text-primary-dark']">
                    {{ $T('Project Management. ') }}
                  </span>
                  <span :class="[REGION === 'cn' ? 'inline' : 'block', 'text-text-primary-light dark:text-text-primary-dark font-light']">
                    {{ $T('The Light Way.') }}
                  </span>
                </template>
                <span v-else class="text-text-primary-light dark:text-text-primary-dark">
                  {{ updates[currentUpdateIndex].title }}
                </span>
              </h2>
              <p class="modal-description font-NeverMind-UI text-desktop-body-large text-text-secondary-light dark:text-text-secondary-dark">
                {{ updates[currentUpdateIndex].description }}
              </p>
              <div
                v-if="currentUpdateIndex === updates.length - 1 && showUpgradeSection"
                class="bg-mask-overlay-s-light dark:bg-mask-overlay-s-dark mt-6 flex items-center gap-3 rounded-lg px-3 py-2"
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

          <div class="mt-4 flex items-center justify-between">
            <div class="pagination-dots flex gap-2">
              <button
                v-for="(update, index) in updates"
                :key="index"
                class="h-2 w-2 cursor-pointer rounded-full transition-all duration-200"
                :class="[
                  currentUpdateIndex === index
                    ? ' bg-border-primary-light dark:bg-border-primary-dark'
                    : 'bg-border-quaternary-light dark:bg-border-quaternary-dark',
                ]"
                @click="switchToUpdate(index)"
              />
            </div>

            <div>
              <base-button v-if="currentUpdateIndex < updates.length - 1" theme="secondary" :size="'medium'" @click="nextUpdate">
                {{ getNextButtonText }}
              </base-button>
              <base-button v-else theme="secondary" :size="'medium'" @click="handleUpgrade">
                {{ getLastPageButtonText }}
              </base-button>
            </div>
          </div>
        </div>
      </div>

      <div v-else ref="swipeTarget" class="relative flex h-full w-full flex-col">
        <close class="absolute right-4 top-4 z-10" :force-light-mode="true" @click="handleClose" />

        <div class="flex-shrink-0 bg-white">
          <div class="overflow-hidden rounded-t-lg">
            <transition :name="slideTransitionName" mode="out-in">
              <img :key="currentUpdateIndex" :src="currentMobileImage" :alt="updates[currentUpdateIndex].title" class="h-full w-full object-cover" />
            </transition>
          </div>
        </div>

        <base-divider />

        <div class="flex-1 overflow-y-auto p-6">
          <transition :name="slideTransitionName" mode="out-in">
            <div :key="currentUpdateIndex">
              <p
                v-if="REGION === 'cn'"
                class="font-NeverMind-UI text-mobile-subhead-mini text-text-secondary-light dark:text-text-secondary-dark mb-2"
              >
                {{ cnLabels[currentUpdateIndex] }}
              </p>
              <h3 class="font-NeverMind-UI text-mobile-headline-small mb-4">
                <template v-if="currentUpdateIndex === 0">
                  <span :class="[REGION === 'cn' ? 'inline' : 'block', 'text-text-primary-light dark:text-text-primary-dark']">
                    {{ $T('Project Management. ') }}
                  </span>
                  <span :class="[REGION === 'cn' ? 'inline' : 'block', 'text-text-primary-light dark:text-text-primary-dark font-light']">
                    {{ $T('The Light Way.') }}
                  </span>
                </template>
                <span v-else class="text-text-primary-light dark:text-text-primary-dark">
                  {{ updates[currentUpdateIndex].title }}
                </span>
                <div
                  v-if="currentUpdateIndex === updates.length - 1 && showUpgradeSection"
                  class="bg-mask-overlay-s-light dark:bg-mask-overlay-s-dark mt-4 flex items-center gap-3 rounded-lg px-3 py-2"
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
              </h3>
              <p class="font-NeverMind-UI text-text-secondary-light dark:text-text-secondary-dark">
                {{ updates[currentUpdateIndex].description }}
              </p>
            </div>
          </transition>
        </div>

        <div class="border-fill-container-light dark:border-fill-container-dark flex justify-center py-2" :class="REGION === 'cn' ? '' : 'border-t'">
          <div class="flex gap-2">
            <button
              v-for="(_, index) in updates"
              :key="index"
              class="h-2 w-2 rounded-full transition-all duration-200"
              :class="[
                currentUpdateIndex === index
                  ? 'bg-border-primary-light dark:bg-border-primary-dark'
                  : 'bg-border-quaternary-light dark:bg-border-quaternary-dark',
              ]"
              @click="switchToUpdate(index)"
            />
          </div>
        </div>

        <div class="p-6 pt-4">
          <base-button v-if="currentUpdateIndex < updates.length - 1" theme="secondary" size="large" class="w-full" @click="nextUpdate">
            {{ getNextButtonText }}
          </base-button>
          <base-button v-else theme="secondary" size="large" class="w-full" @click="handleUpgrade">
            {{ getLastPageButtonText }}
          </base-button>
        </div>
      </div>
    </div>
  </modal-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSwipe } from '@vueuse/core'
import { usePromiseHook } from 'utils/vue-utils'
import { useWindowResize } from 'client/composables/window-resize'
import { usePaymentClient } from 'app/composables/payment-client'
import { useTracking } from 'client/composables/use-tracking'
import { useAiCopilot } from 'app/composables/ai-features/copilot/ai-copilot'
import { useEditorFeaturePaywall } from 'app/composables/editor-feature-paywall'
import { useAccountStore } from 'client/store/account-store'
import { useServiceStore } from 'client/store'
import ModalDialog from 'client/components/new-base-modal-dialog.vue'
import Close from 'client/components/base/close.vue'
import BaseButton from 'client/components/base/button.vue'
import BaseDivider from 'client/components/base/divider.vue'
import { $T } from 'client/library/translation'
import { V26_ADD_ON_EMAIL_EBOOK_COUPON_CODE, REGION } from 'client/constants'
import whatsNewInfoCN from 'client/assets/import-files/whats-new/whats-new-cn.json'
import whatsNewInfoGlobal from 'client/assets/import-files/whats-new/whats-new-global.json'
import taskTotaImagePC from 'client/assets/import-files/images/task-update-dialog/task-total-pc.png?url'
import taskTotalImageMobile from 'client/assets/import-files/images/task-update-dialog/task-total-mobile.png?url'
import taskWorkGenerateImagePC from 'client/assets/import-files/images/task-update-dialog/task-work-generate-pc.png?url'
import taskWorkGenerateImageMobile from 'client/assets/import-files/images/task-update-dialog/task-work-generate-mobile.png?url'
import taskPanelImageMobile from 'client/assets/import-files/images/task-update-dialog/task-panel-mobile.png?url'
import taskPanelImagePC from 'client/assets/import-files/images/task-update-dialog/task-panel-pc.png?url'
import taskGanttImageMobile from 'client/assets/import-files/images/task-update-dialog/task-gantt-mobile.png?url'
import taskGanttImagePC from 'client/assets/import-files/images/task-update-dialog/task-gantt-pc.png?url'
import taskTotalCnImagePC from 'client/assets/import-files/images/task-update-dialog/task-total-cn-pc.png?url'
import taskTotalCnImageMobile from 'client/assets/import-files/images/task-update-dialog/task-total-cn-mobile.png?url'
import taskWorkGenerateCnImagePC from 'client/assets/import-files/images/task-update-dialog/task-work-generate-cn-pc.png?url'
import taskWorkGenerateCnImageMobile from 'client/assets/import-files/images/task-update-dialog/task-work-generate-cn-mobile.png?url'
import taskPanelCnImageMobile from 'client/assets/import-files/images/task-update-dialog/task-panel-cn-mobile.png?url'
import taskPanelCnImagePC from 'client/assets/import-files/images/task-update-dialog/task-panel-cn-pc.png?url'
import taskGanttCnImageMobile from 'client/assets/import-files/images/task-update-dialog/task-gantt-cn-mobile.png?url'
import taskGanttCnImagePC from 'client/assets/import-files/images/task-update-dialog/task-gantt-cn-pc.png?url'

interface SpaceUpdate {
  title: string
  description: string
}
const props = withDefaults(
  defineProps<{
    updates?: SpaceUpdate[]
    isMyWorks?: boolean
    isRecent?: boolean
  }>(),
  {
    updates: () => [
      {
        title: $T('Project Management. The Light Way'),
        description: $T(
          "Plan in maps, break down with AI, track in Gantt. No complex setup, no switching tools. Everything you need to turn ideas into impact—nothing you don't.",
        ),
      },
      {
        title: $T('Think smarter, work faster with Xmind AI'),
        description: $T(
          "Whether you're planning projects, exploring ideas, or making sense of messy information, Xmind AI is always here to help. It's smart, sleek, and now works seamlessly with you across Web, Desktop, and iOS.",
        ),
      },
      {
        title: $T('Your mind map is your action plan'),
        description: $T(
          'After mapping out ideas, turn them into tasks in one click—no tool-switching, no disruption. Go from planning to execution seamlessly, all within your mind map.',
        ),
      },
      {
        title: $T('Two views, one flow, zero friction'),
        description: $T(
          'No more complicated setup or clunky tools. Go from mind map to gantt chart in a single click. Drag to adjust durations or dependencies. Click to edit task details. Update one task, and related tasks follow—no repetitive setup. Fast. Smooth. Intuitive.',
        ),
      },
    ],
  },
)

const dialog = ref<InstanceType<typeof ModalDialog>>()
const { resolve } = usePromiseHook()
const { isPhoneSizeViewportWidth } = useWindowResize()

const whatsNewInfo = REGION === 'cn' ? whatsNewInfoCN : whatsNewInfoGlobal

const isOpened = ref(true)
const currentUpdateIndex = ref(0)
const slideDirection = ref<'forward' | 'backward'>('forward')
const isUserEligibleForTrial = ref(false)
const slideTransitionName = computed(() => {
  return slideDirection.value === 'forward' ? 'slide-left' : 'slide-right'
})

const updateImagesPc = computed(() => {
  if (REGION === 'cn') {
    return [taskTotalCnImagePC, taskWorkGenerateCnImagePC, taskGanttCnImagePC, taskPanelCnImagePC]
  }
  return [taskTotaImagePC, taskWorkGenerateImagePC, taskPanelImagePC, taskGanttImagePC]
})

const updateImagesMobile = computed(() => {
  if (REGION === 'cn') {
    return [taskTotalCnImageMobile, taskWorkGenerateCnImageMobile, taskGanttCnImageMobile, taskPanelCnImageMobile]
  }
  return [taskTotalImageMobile, taskWorkGenerateImageMobile, taskPanelImageMobile, taskGanttImageMobile]
})

const currentPCImage = computed(() => {
  return updateImagesPc.value[currentUpdateIndex.value]
})

const currentMobileImage = computed(() => {
  return updateImagesMobile.value[currentUpdateIndex.value]
})

const { isEditorCommonPaidFeatureEnabled } = useEditorFeaturePaywall()
const showUpgradeSection = computed(() => {
  return !isEditorCommonPaidFeatureEnabled.value && props.isMyWorks
})

const cnLabels = computed(() => {
  if (REGION !== 'cn') return []
  return [$T('轻快起步｜轻准对齐｜轻效复盘'), $T('AI Work Breakdown'), $T('Task + Gantt Chart'), $T('Smarter Project Review')]
})

const getNextButtonText = computed(() => {
  if (REGION === 'cn') {
    const cnButtonTexts = [$T('探索更多'), $T('继续'), $T('继续')]
    return cnButtonTexts[currentUpdateIndex.value]
  }
  return $T('Next')
})

const getLastPageButtonText = computed(() => {
  if (!showUpgradeSection.value) {
    return REGION === 'cn' ? $T('抢先体验') : $T('Get Started')
  }
  return isUserEligibleForTrial.value ? $T('Start Free Trial') : $T('Upgrade Now')
})

const swipeTarget = ref<HTMLElement | null>(null)
const { direction } = useSwipe(swipeTarget, {
  threshold: 50,
  passive: false,
  onSwipeEnd() {
    if (direction.value === 'left' && currentUpdateIndex.value < props.updates.length - 1) {
      slideDirection.value = 'forward'
      nextUpdate()
    } else if (direction.value === 'right' && currentUpdateIndex.value > 0) {
      slideDirection.value = 'backward'
      previousUpdate()
    }
  },
})

const switchToUpdate = (index: number) => {
  if (index === currentUpdateIndex.value) return
  slideDirection.value = index > currentUpdateIndex.value ? 'forward' : 'backward'
  currentUpdateIndex.value = index
}

const nextUpdate = () => {
  if (currentUpdateIndex.value < props.updates.length - 1) {
    slideDirection.value = 'forward'
    currentUpdateIndex.value++
  }
}

const previousUpdate = () => {
  if (currentUpdateIndex.value > 0) {
    slideDirection.value = 'backward'
    currentUpdateIndex.value--
  }
}

const updateReadVersion = async () => {
  const currentWhatsNewVersion = whatsNewInfo[0].version
  await useAccountStore().updateUserData({
    readWhatsNewVersion: currentWhatsNewVersion,
  })
}

const handleClose = async () => {
  await updateReadVersion()
  await dialog.value?.closeDialogWithAnimation?.()

  isOpened.value = false
  resolve(false)
}

const handleUpgrade = async () => {
  await updateReadVersion()
  await dialog.value?.closeDialogWithAnimation?.()
  if (REGION === 'cn') {
    useAiCopilot().startCopilot({
      teamId: useAccountStore().userXmindId,
      entry: 'main',
      initialStates: {
        inputText: '',
        fileName: null,
        fileContent: null,
        file: null,
        fileMimeType: null,
        isEnableThinking: false,
        task: 'project-plan',
        language: 'zh',
        skeletonGroupId: 'Mind Map',
        spaceId: null,
        fileId: null,
      },
    })
    resolve(true)
    return
  }
  if (!showUpgradeSection.value) {
    isOpened.value = false
    resolve(true)
    return
  }

  useServiceStore().services.action.dialog.openPaymentDialog({
    teamId: useAccountStore().userXmindId,
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
    tab: props.isRecent ? 'recents' : props.isMyWorks ? 'my_works' : 'team',
    space: props.isMyWorks ? 'my_works' : 'team',
  })
  isOpened.value = false
  resolve(true)
}
onMounted(async () => {
  isUserEligibleForTrial.value = await usePaymentClient().isUserEligibleForTrial()
  useTracking().track('dialog_view', {
    dlg: 'promo_dialog',
    tab: props.isRecent ? 'recents' : props.isMyWorks ? 'my_works' : 'team',
    space: props.isMyWorks ? 'my_works' : 'team',
  })
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.5s ease-in-out;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.slide-left-enter-to,
.slide-left-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease-in-out;
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.slide-right-enter-to,
.slide-right-leave-from {
  opacity: 1;
  transform: translateX(0);
}
</style>
