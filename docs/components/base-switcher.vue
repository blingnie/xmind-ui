<template>
  <div ref="switcherRef" class="switch-button">
    <div class="knobs flex whitespace-nowrap">
      <p v-for="(option, index) in options" ref="optionRefs" :key="index" @click="handleSwitch(index)">
        <span>
          <slot :name="option.key">{{ option.name }}</slot>
        </span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @deprecated This component is deprecated. Please use NewComponent instead.
 */
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

const { width: switcherWidth } = useElementSize(switcherRef)

const handleSwitch = (index: number) => {
  emits('update:modelValue', props.options[index].key)
}

const computedKnobsStyles = () => {
  if (!switcherRef.value || optionRefs.value.length == 0) return

  const selectedOptionIndex = props.options.findIndex(option => option.key === props.modelValue)
  const optionWidth = optionRefs.value[selectedOptionIndex].getBoundingClientRect().width

  let left = 0
  for (let i = 0; i < selectedOptionIndex; i++) {
    left += optionRefs.value[i].getBoundingClientRect().width
  }

  switcherRef.value.style.setProperty('--knobs-width', `${optionWidth}px`)
  switcherRef.value.style.setProperty('--knobs-left', `${left + switcherPaddingX}px`)
}

watchEffect(computedKnobsStyles, { flush: 'post' })
watch(switcherWidth, computedKnobsStyles, { flush: 'post' })
</script>

<style lang="less" scoped>
@import '../styles/new-ui/new-variables.less';

* {
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

[color-scheme='light'] .switch-button {
  --background-color: @transparent-dark-3;
  --text-color-normal: @transparent-dark-8;
  --text-color-hover: @transparent-dark-9;
  --knobs-color: @transparent-white-10;
  --knobs-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.05), 0px 4px 15px 0px rgba(0, 0, 0, 0.1);
}
[color-scheme='dark'] .switch-button {
  --background-color: @transparent-dark-7;
  --text-color-normal: @transparent-white-8;
  --text-color-hover: @transparent-white-9;
  --knobs-color: @dark-grey-7;
  --knobs-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.2), 0px 4px 15px 0px rgba(0, 0, 0, 0.3);
}

.switch-button {
  position: relative;

  .checkbox {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    opacity: 0;
    z-index: 3;
    cursor: pointer;
  }

  .knobs {
    position: relative;
    padding: 4px;
    align-items: center;
    border-radius: 99px;
    background: var(--background-color);
  }

  .knobs > p {
    display: inline-block;
    position: relative;
    padding: 4px 24px;
    color: var(--text-color-normal);
    font-size: 14px;
    font-weight: 700;
    line-height: 18px;
    z-index: 2;
    text-align: center;
    cursor: pointer;
  }
  .checkbox:checked + .knobs > span:last-child,
  .checkbox:not(:checked) + .knobs > span:first-child,
  &:hover .checkbox:checked + .knobs > span:first-child,
  &:hover .checkbox:not(:checked) + .knobs > span:last-child {
    color: var(--text-color-hover);
  }

  @media only screen and (max-width: @breakpoint-small) {
    .knobs > p {
      padding: 4px 12px;
    }
  }

  .knobs::before {
    content: '';
    border-radius: 99px;
    background: var(--knobs-color);
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
