<template>
  <Transition appear>
    <div
      class="progress-animation-overlay fixed left-0 top-0 z-export-progress-bar flex h-full w-full items-center justify-center bg-transparent-dark-7 dark:bg-transparent-dark-8"
    >
      <div
        class="progress-animation-container relative mx-4 flex min-w-0 items-center justify-center gap-3 rounded-2xl bg-light-grey-1 py-3 pl-3 pr-8 dark:bg-dark-grey-7"
        :class="[customClasses, 'min-w-[calc(100vw-32px)] sm:min-w-[420px]']"
      >
        <img class="z-10 h-[80px] w-[80px] flex-shrink-0 sm:h-[114px] sm:w-[114px]" :src="logoSrc" alt="app.xmind.com" />

        <div class="z-10 flex min-w-0 flex-1 flex-col gap-2 sm:gap-3">
          <div class="flex min-w-0 items-center justify-between">
            <span class="progress-text truncate text-desktop-headline-1 not-italic text-dark-grey-8 dark:text-light-grey-1">
              {{ displayTitle }}
            </span>
            <button
              v-if="showCancel"
              class="ml-3 flex-shrink-0 rounded-lg bg-dark-grey-7 px-3 py-1 text-light-grey-1 hover:bg-dark-grey-10 dark:bg-light-grey-5 dark:text-dark-grey-8 dark:hover:bg-light-grey-2 dark:hover:text-dark-grey-7"
              @click="cancelDownload"
            >
              {{ $T('Cancel') }}
            </button>
          </div>
          <div class="h-[14px] w-full py-1 sm:w-[472px]">
            <!-- border -->
            <div
              class="relative h-[6px] w-full self-stretch rounded-[3px] bg-transparent-dark-4 shadow-export-shadow dark:bg-transparent-white-4"
              :class="trueProgressContainerClasses"
            >
              <!-- true progress -->
              <div
                :style="{ width: progressWidth }"
                class="absolute h-full rounded-[3px] bg-transparent-dark-6 transition-all duration-300 ease-in-out dark:bg-transparent-white-6"
                :class="trueProgressClasses"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useLottieAnimation } from 'app/composables/lottie-animation'
import { type ExportType } from 'app/services/pinia/progress-animation'
import { $T } from 'client/library/translation'
import { computed, onMounted, onUnmounted, ref } from 'vue'
const DEFAULT_ANIMATION_DURATION = 2000
const props = withDefaults(
  defineProps<{
    logoSrc: string
    exportType: ExportType
    title?: string
    customClasses?: string
    trueProgressClasses?: string
    trueProgressContainerClasses?: string
    estimatedDuration?: number // in seconds
    onCancel: () => {}
  }>(),
  {
    title: $T('Exporting...'),
    customClasses: '',
    trueProgressClasses: '',
    trueProgressContainerClasses: '',
    estimatedDuration: DEFAULT_ANIMATION_DURATION,
  },
)

const allowedTypes = ['markdown', 'docx', 'xlsx', 'powerpoint', 'opml', 'textBundle', 'png', 'jpeg', 'svg', 'xmind', 'pdf']

const enableAiBackgroundLottie =
  props.exportType === 'brainstorm' ||
  props.exportType === 'copilot-file' ||
  props.exportType === 'copilot-link' ||
  props.exportType === 'data-masking' ||
  props.exportType === 'ai-template'

enableAiBackgroundLottie &&
  useLottieAnimation({
    containerParentSelector: '.progress-animation-container',
    dataFilePathLoader: {
      light: async () => (await import('import-files/json/copilot-dialog-background-light.json?url')).default,
      dark: async () => (await import('import-files/json/copilot-dialog-background-dark.json?url')).default,
    },
    options: {
      containerStyleClass: 'dark:shadow-ai-background-lottie-animation-dark overflow-hidden rounded-2xl',
      animationStyleClass: 'filter blur opacity-40',
    },
  })

const DEFAULT_DURATION = 10000
const MAX_PROGRESS_AFTER = 99

// old logic: 100% after 10 seconds, then increase by 1 per second
const MAX_PROGRESS_BEFORE_COMPLETION = 100

const progress = ref(0)
const startTime = ref(Date.now())
const elapsedTime = ref(0)
let intervalId: number | null = null

function startProgressAnimation() {
  progress.value = 0
  if (intervalId !== null) clearInterval(intervalId)
  if (allowedTypes.includes(props.exportType)) {
    startTime.value = Date.now()
    intervalId = window.setInterval(() => {
      elapsedTime.value = Date.now() - startTime.value
      if (elapsedTime.value < DEFAULT_DURATION) {
        // use 90% for the first 10 seconds, then increase by 1 per second
        progress.value = Math.min((elapsedTime.value / DEFAULT_DURATION) * 90, 90)
      } else {
        const additional = Math.floor((elapsedTime.value - DEFAULT_DURATION) / 1000) * 1
        progress.value = Math.min(90 + additional, MAX_PROGRESS_AFTER)
      }
      if (progress.value > MAX_PROGRESS_AFTER) {
        clearInterval(intervalId!)
        intervalId = null
      }
    }, 100)
  } else {
    const startTimeOld = Date.now()
    intervalId = window.setInterval(() => {
      const elapsedTimeOld = Date.now() - startTimeOld
      const estimatedDuration = props.estimatedDuration ?? DEFAULT_ANIMATION_DURATION
      progress.value = Math.min((elapsedTimeOld / estimatedDuration) * 100, MAX_PROGRESS_BEFORE_COMPLETION)
      if (progress.value >= MAX_PROGRESS_BEFORE_COMPLETION) {
        clearInterval(intervalId!)
        intervalId = null
      }
    }, 100)
  }
}

const progressWidth = computed(() => `${progress.value}%`)

const displayTitle = computed(() => {
  return elapsedTime.value >= DEFAULT_DURATION ? $T("We're working hard on this file, almost ready…") : props.title
})

const showCancel = computed(() => elapsedTime.value >= 60000 && props.onCancel)

function cancelDownload() {
  if (intervalId !== null) {
    clearInterval(intervalId)
    intervalId = null
  }
  progress.value = 0
  props.onCancel?.()
}

onMounted(() => {
  startProgressAnimation()
})

onUnmounted(() => {
  if (intervalId !== null) {
    clearInterval(intervalId)
  }
})
</script>

<style scoped lang="less">
.progress-animation-overlay {
  .progress-text {
    font-feature-settings:
      'liga' off,
      'clig' off;
  }
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease-in;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
