<template>
  <div class="flex flex-col gap-4 px-[24px]">
    <span class="text-mobile-subhead-small sm:text-desktop-subhead-small">{{ $T('Language') }}</span>

    <div class="flex flex-col gap-2">
      <span class="text-mobile-body-medium sm:text-desktop-body-medium">
        {{ $T('Change the interface language') }}
      </span>
      <fw-select
        class="w-full sm:w-60"
        :trigger-size="isPhoneSizeViewportWidth ? 'large' : 'medium'"
        :position="'bottom-left'"
        :selected-key="getCurrentLanguage()"
        :options="langOptions"
        @select="setCurrentLanguage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { GLOBAL_LANG_LABELS, getCurrentLanguage, setCurrentLanguage } from 'client/library/translation'
import { useWindowResize } from 'client/composables/window-resize'
import { computed } from 'vue'

const { isPhoneSizeViewportWidth } = useWindowResize()
const langOptions = computed(() => {
  return Object.keys(GLOBAL_LANG_LABELS).map(key => ({
    key,
    label: GLOBAL_LANG_LABELS[key].title,
  }))
})
</script>
