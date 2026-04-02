<template>
  <div class="flex items-center">
    <fw-select
      :selected-key="language"
      :options="outputLanguages"
      :position="position"
      :is-use-virtualized-list="true"
      :menu-custom-class="menuCustomClass"
      :theme="'muted'"
      @select="key => (language = key)"
    >
      <template #trigger>
        <div class="flex items-center gap-1 text-transparent-dark-8 dark:text-transparent-white-8">
          <copilot-language-icon class="h-4 w-4" />
          <span class="text-desktop-body-3">{{ outputLanguages.find(option => option.key === language)?.label }}</span>
        </div>
      </template>
    </fw-select>
  </div>
</template>

<script lang="ts" setup>
import { $T, CopilotLanguage, CopilotOutputLanguages } from 'client/library/translation'
import { computed } from 'vue'
import CopilotLanguageIcon from 'client/assets/import-files/images/dialog-copilot/copilot-language.svg'
import type { PopoverPosition } from '../types'
withDefaults(
  defineProps<{
    position?: PopoverPosition
    menuCustomClass?: string
  }>(),
  {
    position: 'bottom-left',
    menuCustomClass: 'max-h-[250px] w-[200px] !pr-0',
  },
)

const language = defineModel<CopilotLanguage | 'auto' | ''>({
  default: 'auto',
  required: true,
})

const outputLanguages = computed(() => {
  const options = Object.keys(CopilotOutputLanguages).map(key => ({
    key,
    label: CopilotOutputLanguages[key],
  }))
  options.unshift({ key: 'auto', label: $T('Auto') })
  return [...options] as { key: CopilotLanguage | 'auto'; label: string }[]
})
</script>
