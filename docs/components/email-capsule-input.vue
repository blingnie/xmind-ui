<template>
  <div
    ref="emailInputContainer"
    class="group relative flex w-full cursor-text flex-col overflow-y-auto px-[12px] pb-[4px] pt-[8px]"
    @click.stop="focusEmailInput"
  >
    <div class="w-full">
      <div class="float-right h-6 w-20"></div>

      <div class="relative">
        <template v-for="(email, index) in inviteValues" :key="email">
          <email-capsule-input-unit
            class="z-[1] mb-2 mr-2"
            :email-source="email"
            :check-is-valid-value="isValidValue"
            @remove-email="removeValue"
            @email-edited="$event => setEmail(index, $event)"
          />
        </template>
        <div
          v-if="isShowPlaceholder"
          v-show="!inputText"
          class="text-mobile-body-medium text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-body-medium absolute mt-1"
        >
          <template v-if="isSupportCNPhone">
            {{ $T('Enter emails or phone numbers and press') }}
          </template>
          <template v-else>
            {{ $T('Enter emails and press') }}
          </template>
          <span class="bg-mask-overlay-s-light dark:bg-mask-overlay-s-dark rounded-sm px-[4px] py-[2px]">{{ 'Enter ↵' }}</span>
          {{ $T('to invite') }}
        </div>
        <input
          ref="emailInputArea"
          v-model="inputText"
          class="max-[220px] text-mobile-body-medium sm:text-desktop-body-medium relative border-0 bg-transparent outline-none"
          type="text"
          @click.stop
          @input="scrollToEnd"
          @compositionupdate="inputCompositionText = $event.data"
          @compositionend="inputCompositionText = ''"
          @keyup.prevent="handleKeyup"
          @keydown.tab.prevent
          @focus="isEmailInputFocused = true"
          @focusout="isEmailInputFocused = false"
          @paste="onPaste"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, watch, onBeforeUnmount, computed, shallowRef } from 'vue'
import { isValidEmail } from 'utils/check-email'
import { isValidCNPhone } from 'utils/check-cn-phone'
import { measureText } from 'utils/text-measure'
import EmailCapsuleInputUnit from './email-capsule-input-unit.vue'
import { useWindowSize } from '@vueuse/core'
import { $T } from 'client/library/translation'

const props = defineProps<{ presetInviteEmails?: string[]; isSupportCNPhone?: boolean }>()
const emits = defineEmits<{ (e: 'updateValues', v: string[]): void; (e: 'inputCanceled'): void; (e: 'updateAllInputEmails', v: string[]): void }>()
const { width: windowWidth } = useWindowSize()

const emailInputArea = ref<HTMLInputElement>()
const emailInputContainer = ref<HTMLElement>()
const inputText = ref('')
const inputCompositionText = ref('')
const isEmailInputFocused = ref(false)
const inviteValues = shallowRef<string[]>(props.presetInviteEmails ? props.presetInviteEmails.map(email => email.trim().toLowerCase()) : [])

const isShowPlaceholder = computed(() => !inviteValues.value.length)
const validEmails = computed(() => inviteValues.value.filter(isValidEmail))

const validCNPhones = computed(() => (props.isSupportCNPhone ? inviteValues.value.filter(isValidCNPhone) : []))

const inputFontSize = computed<number>(() => (windowWidth.value < 600 ? 15 : 13))

const removeValue = (email: string) => (inviteValues.value = inviteValues.value.filter(e => e !== email))
const addValue = (email: string) => (inviteValues.value = [...new Set([...inviteValues.value, email.trim().toLowerCase()])])

const scrollToEnd = () => {
  emailInputContainer.value?.scroll(0, emailInputContainer.value?.scrollHeight)
}

const oneConfirmInputText = async () => {
  if (!inputText.value.trim()) {
    return
  }
  inputText.value
    .split(/,|;|\s/)
    .filter(Boolean)
    .forEach(val => addValue(val))
  inputText.value = ''
  await nextTick()
  // scroll capsule area to bottom in order to show last confirmed email
  scrollToEnd()
}

const isValidValue = (value: string) => isValidEmail(value) || (props.isSupportCNPhone && isValidCNPhone(value))

const handleKeyup = (e: KeyboardEvent) => {
  if (e.key.toLowerCase() === 'enter' || e.key === ';' || e.key.toLowerCase() === 'tab') {
    oneConfirmInputText()
  }
}
const onPaste = async () => {
  await new Promise(resolve => setTimeout(resolve, 10))
  oneConfirmInputText()
}

const onClickOutside = (e: MouseEvent) => {
  if (emailInputContainer.value?.contains(e.target as Node)) return
  oneConfirmInputText()
}

const focusEmailInput = () => {
  emailInputArea.value?.focus()
}

const setEmail = (index: number, email: string) => {
  inviteValues.value[index] = email
}

const measureInputLength = () => {
  if (!emailInputArea.value) return
  const textCompose = inputText.value + inputCompositionText.value
  emailInputArea.value.style.width = `${measureText(textCompose, inputFontSize.value).width + 8}px`
}

watch([inputText, inputCompositionText], measureInputLength)

watch(
  () => [validEmails.value, validCNPhones.value],
  () => {
    emits('updateValues', [...validEmails.value, ...validCNPhones.value])
  },
  { immediate: true },
)

watch(
  inviteValues,
  emails => {
    emits('updateAllInputEmails', emails)
  },
  { immediate: true },
)

onMounted(() => {
  measureInputLength()
  document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
})

defineExpose({
  focusEmailInput: () => {
    focusEmailInput()
  },
  confirmEmail: () => {
    oneConfirmInputText()
  },
  addEmail: (email: string) => {
    addValue(email)
  },
  removeEmail: (email: string) => {
    removeValue(email)
  },
})
</script>

<style lang="less" scoped></style>
