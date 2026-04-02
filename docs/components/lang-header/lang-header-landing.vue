<script lang="ts">
export default {
  name: 'LangHeaderLanding',
}
</script>

<script lang="ts" setup>
import { useLangHeader } from './use-lang-header'
import closeIcon from 'client/components/base/close.vue'

const { text, visible, close, switchAndClose } = useLangHeader()
</script>

<template>
  <div v-if="visible" class="top-0 z-[999] flex h-[60px] justify-center bg-transparent-dark-1 px-4 dark:bg-transparent-white-2 lg:px-8">
    <div class="relative flex w-full max-w-[1120px] items-center justify-between gap-4">
      <span class="text-[13px] font-normal text-transparent-dark-8 dark:text-white sm:text-[14px] md:text-base">{{ text.description }}</span>
      <div class="flex items-center gap-4">
        <button class="tw-button-primary tw-button-small shrink-0" @click="switchAndClose">
          {{ text.switch }}
        </button>
        <closeIcon class="cursor-pointer" @close="close" />
      </div>
    </div>
  </div>
</template>
