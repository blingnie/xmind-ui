<template>
  <div class="flex flex-col items-start gap-4">
    <span class="inline-block text-mobile-subhead-small text-text-primary-light dark:text-text-primary-dark sm:text-desktop-subhead-small">
      {{ $T('Name') }}
    </span>
    <fw-input
      v-show="!isChangingName"
      ref="nameInput"
      v-model="teamName"
      class="w-full"
      size="large"
      :disabled="isInputDisabled"
      :disable-clear-icon="true"
      @enter="blurInput"
      @blur="changeName"
    ></fw-input>
    <fw-input v-show="isChangingName" v-model="teamRenamingText" class="w-full" size="large" :disabled="true"></fw-input>
  </div>
</template>

<script setup lang="ts">
import { $T } from 'client/library/translation'
import { debounce } from 'utils/misc'
import { ref } from 'vue'

const props = defineProps<{
  name: string
  handleChangeName: (newName: string) => Promise<boolean>
  isInputDisabled?: boolean
}>()

const teamRenamingText = $T('Renaming...')
const teamName = ref(props.name)
const nameInput = ref()
const isChangingName = ref(false)

const blurInput = debounce(() => {
  nameInput.value?.blurInput()
}, 100)

const changeName = debounce(async (value: string) => {
  if (value.trim() === props.name.trim() || isChangingName.value) return
  isChangingName.value = true
  try {
    // at least 400ms
    await Promise.all([props.handleChangeName(value), new Promise(resolve => setTimeout(resolve, 400))])
  } catch (error) {
    logger.error('Failed to change team name', error)
  }
  isChangingName.value = false
}, 100)
</script>
