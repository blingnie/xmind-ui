<template>
  <label
    :for="id"
    class="flex items-center gap-2 text-mobile-body-medium text-text-primary-light dark:text-text-primary-dark sm:text-desktop-body-medium"
    :class="disabled ? 'cursor-not-allowed text-text-quaternary-light dark:text-text-quaternary-dark' : 'cursor-pointer'"
    :title="title"
  >
    <base-checkbox :id="id" v-model="checked" :size="isPhoneSizeViewportWidth ? 'large' : 'small'" :disabled="disabled" />
    <slot>
      <span class="cursor-pointer">{{ title }}</span>
    </slot>
  </label>
</template>

<script lang="ts" setup>
import { generateShortUUID } from 'utils/shortUUID'
import BaseCheckbox from 'components/base/checkbox.vue'
import { useWindowResize } from 'client/composables/window-resize'

const checked = defineModel<boolean>({
  default: false,
  required: true,
})

const id = generateShortUUID()
const { isPhoneSizeViewportWidth } = useWindowResize()

defineProps<{
  disabled?: boolean
  title?: string
}>()
defineEmits(['update:modelValue'])
</script>
