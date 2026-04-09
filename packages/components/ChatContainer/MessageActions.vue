<template>
  <div class="message-actions">
    <!-- Copy -->
    <AiButton
      variant="muted"
      size="medium"
      icon-only
      @click="handleCopy"
    >
      <template #icon-left>
        <span class="message-actions__icon" v-html="copied ? TickIcon : CopyTextIcon" />
      </template>
    </AiButton>

    <!-- Good -->
    <AiButton
      variant="muted"
      size="medium"
      icon-only
      @click="handleGood"
    >
      <template #icon-left>
        <span class="message-actions__icon" v-html="feedbackValue === 'good' ? GoodFillIcon : GoodIcon" />
      </template>
    </AiButton>

    <!-- Bad -->
    <AiButton
      variant="muted"
      size="medium"
      icon-only
      @click="handleBad"
    >
      <template #icon-left>
        <span class="message-actions__icon" v-html="feedbackValue === 'bad' ? BadFillIcon : BadIcon" />
      </template>
    </AiButton>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AiButton from '../AiButton/AiButton.vue'

import CopyTextIcon from '~/components/icon/fw-icons/copy-text.svg?raw'
import TickIcon from '~/components/icon/fw-icons/tick.svg?raw'
import GoodIcon from '~/components/icon/fw-icons/good.svg?raw'
import GoodFillIcon from '~/components/icon/fw-icons/good-fill.svg?raw'
import BadIcon from '~/components/icon/fw-icons/bad.svg?raw'
import BadFillIcon from '~/components/icon/fw-icons/bad-fill.svg?raw'

export type FeedbackType = 'good' | 'bad' | null

const emit = defineEmits<{
  copy: []
  feedback: [value: FeedbackType]
}>()

const copied = ref(false)
const feedbackValue = ref<FeedbackType>(null)

let copyTimer: ReturnType<typeof setTimeout> | null = null

const handleCopy = () => {
  copied.value = true
  emit('copy')

  if (copyTimer) clearTimeout(copyTimer)
  copyTimer = setTimeout(() => {
    copied.value = false
  }, 2000)
}

const handleGood = () => {
  feedbackValue.value = feedbackValue.value === 'good' ? null : 'good'
  emit('feedback', feedbackValue.value)
}

const handleBad = () => {
  feedbackValue.value = feedbackValue.value === 'bad' ? null : 'bad'
  emit('feedback', feedbackValue.value)
}

defineExpose({
  feedbackValue,
  copied,
})
</script>

<style scoped>
.message-actions {
  display: flex;
  gap: var(--spacing-padding-xs-4);
  align-items: center;
}

.message-actions__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
}

.message-actions__icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
