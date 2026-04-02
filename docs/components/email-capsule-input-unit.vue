<template>
  <div
    class="inline-flex h-6 max-w-full cursor-default items-center gap-3 rounded-[18px] pl-[12px] pr-[8px]"
    :class="[
      checkIsValidValue(inputValue)
        ? 'border border-border-muted-light bg-fill-surface-light hover:border-border-quaternary-light dark:border-border-muted-dark dark:bg-fill-surface-dark dark:hover:border-border-quaternary-dark'
        : 'border-none bg-[#E53232]',
      isInputFocused
        ? '!border-transparent bg-transparent text-text-primary-light dark:!border-transparent dark:!bg-transparent dark:text-text-primary-dark'
        : '',
    ]"
    @click.stop
  >
    <input
      ref="inputRef"
      v-model="inputValue"
      class="overflow-hidden text-ellipsis text-nowrap border-0 bg-transparent text-mobile-body-medium outline-none sm:text-desktop-body-medium"
      :class="[
        !checkIsValidValue(inputValue) ? 'text-light-grey-1' : 'text-text-primary-light dark:text-text-primary-dark',
        isInputFocused ? ' text-text-primary-light dark:text-text-primary-dark' : 'cursor-pointer',
      ]"
      :style="{ width: `${inputRefWidth}px` }"
      type="text"
      @click.stop
      @blur="confirmEdit"
      @compositionupdate="inputCompositionText = $event.data"
      @compositionend="inputCompositionText = ''"
      @focus="isInputFocused = true"
      @focusout="isInputFocused = false"
      @keydown.enter="blurInput"
    />
    <div class="flex w-[12px] items-center sm:w-[16px]">
      <span
        v-if="!isInputFocused"
        uk-icon="icon: close"
        class="cursor-pointer"
        :class="{ 'text-light-grey-1': !checkIsValidValue(inputValue) }"
        @click.stop="removeEmail(inputValue)"
      ></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { measureText } from 'utils/text-measure'
import { useWindowSize } from '@vueuse/core'

const props = defineProps<{
  emailSource: string
  checkIsValidValue: (value: string) => boolean
}>()

const emit = defineEmits<{
  (event: 'remove-email', email: string): void
  (event: 'email-edited', email: string): void
}>()

const { width: windowWidth } = useWindowSize()

const inputRef = ref<HTMLInputElement>()
const inputRefWidth = ref(0)
const inputValue = ref(props.emailSource)
const inputCompositionText = ref('')
const isInputFocused = ref(false)

const inputFontSize = computed<number>(() => (windowWidth.value < 600 ? 15 : 13))

const removeEmail = (email: string) => emit('remove-email', email)

const measureInputLength = () => {
  const textCompose = inputValue.value + inputCompositionText.value
  inputRefWidth.value = Math.max(8, measureText(textCompose, inputFontSize.value).width + 2)
}

const blurInput = () => {
  inputRef.value?.blur()
}

const confirmEdit = () => {
  emit('email-edited', inputValue.value)
}

watch([inputValue, inputCompositionText], measureInputLength, { immediate: true })

// watch(inputValue, debouncedConfirmEdit)
</script>
