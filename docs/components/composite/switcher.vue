<template>
  <div ref="switcherRef" class="switch-button">
    <div class="knobs relative items-center rounded-full bg-fill-surfaceDark-light p-[4px] dark:bg-fill-surfaceDark-dark">
      <p
        v-for="(option, index) in options"
        ref="optionRefs"
        :key="index"
        class="relative z-[2] inline-flex cursor-pointer px-[12px] py-[4px] text-center"
        :class="
          selectedOptionIndex === index
            ? 'text-text-primary-light hover:text-text-secondary-light active:text-text-secondary-light dark:text-text-primary-dark dark:hover:text-text-secondary-dark dark:active:text-text-secondary-dark'
            : 'text-text-secondary-light hover:text-text-primary-light active:text-text-primary-light dark:text-text-secondary-dark dark:hover:text-text-primary-dark dark:active:text-text-primary-dark'
        "
        @click="handleSwitch(index)"
      >
        <span class="text-desktop-subhead-mini">
          <slot :name="option.key">{{ option.name }}</slot>
        </span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import { ref, watchEffect, watch } from 'vue'

const props = defineProps<{
  modelValue: string
  options: { key: string; name: string }[]
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

const switcherPaddingX = 4

const switcherRef = ref<HTMLElement>()
const optionRefs = ref<HTMLElement[]>([])
const selectedOptionIndex = ref(props.options.findIndex(option => option.key === props.modelValue))

const { width: switcherWidth } = useElementSize(switcherRef)

const handleSwitch = (index: number) => {
  emits('update:modelValue', props.options[index].key)
}

const computedKnobsStyles = () => {
  if (!switcherRef.value || optionRefs.value.length == 0) return

  selectedOptionIndex.value = props.options.findIndex(option => option.key === props.modelValue)
  const optionWidth = optionRefs.value[selectedOptionIndex.value].getBoundingClientRect().width

  let left = 0
  for (let i = 0; i < selectedOptionIndex.value; i++) {
    left += optionRefs.value[i].getBoundingClientRect().width
  }

  switcherRef.value.style.setProperty('--knobs-width', `${optionWidth}px`)
  switcherRef.value.style.setProperty('--knobs-left', `${left + switcherPaddingX}px`)
}

watchEffect(computedKnobsStyles, { flush: 'post' })
watch(switcherWidth, computedKnobsStyles, { flush: 'post' })
</script>

<style scoped>
* {
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

[color-scheme='light'] .switch-button {
  --knobs-color: #fafbfc;
  --knobs-shadow: '0.5px 0.7px 0px 0px  rgba(255, 255, 255, 0.00) inset, 0px 0px 0px 0px rgba(255, 255, 255, 0.00) inset, 0px 0px 1.5px 0px rgba(0, 0, 0, 0.06), 0px 0px 3px 0px rgba(0, 0, 0, 0.03)';
}
[color-scheme='dark'] .switch-button {
  --knobs-color: #1f2326;
  --knobs-shadow: '0.5px 0.7px 0px 0px  rgba(255, 255, 255, 0.05) inset, 0px 0px 0px 0px rgba(255, 255, 255, 0.03) inset, 0px 0px 1.5px 0px rgba(0, 0, 0, 0.06), 0px 0px 3px 0px rgba(0, 0, 0, 0.06)';
}

.switch-button {
  position: relative;

  .knobs::before {
    content: '';
    border-radius: 99px;
    background-color: var(--knobs-color);
    box-shadow: var(--knobs-shadow);
    position: absolute;
    top: 4px;
    bottom: 4px;
    left: var(--knobs-left);
    z-index: 1;
    width: var(--knobs-width);
    transition: 0.3s ease all;
  }
}
</style>
