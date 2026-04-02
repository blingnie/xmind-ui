<script lang="ts">
/**
 * The lang header used by home page.
 */
export default {
  name: 'LangHeaderHome',
}
</script>

<script lang="ts" setup>
import { useLangHeader } from './use-lang-header'
import { setCurrentLanguage } from 'client/library/translation'
import closeIcon from 'client/components/base/close.vue'

const { text, visible, close, browserLang } = useLangHeader()

const changeLanguage = () => {
  setCurrentLanguage(browserLang ?? 'en-US')
  close()
}
</script>

<template>
  <div
    v-if="visible"
    class="relative flex items-center justify-between gap-2 border border-transparent-dark-2 bg-light-grey-3 p-4 dark:border-transparent-white-2 dark:bg-dark-grey-6 md:justify-center md:gap-6 md:py-3"
  >
    <span class="text-desktop-title-1 text-transparent-dark-8 dark:text-transparent-white-8">{{ text.description }}</span>
    <button class="tw-button-default tw-button-small" @click="changeLanguage">
      {{ text.switch }}
    </button>
    <closeIcon class="cursor-pointer md:absolute md:right-8" @close="close" />
  </div>
</template>

<style lang="less" scoped></style>
