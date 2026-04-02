<template>
  <fw-button
    class="relative select-none text-white duration-medium-3 ease-expressive-standard"
    :size="size"
    :class="classString"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot></slot>
  </fw-button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    size?: 'small' | 'medium' | 'large'
    disabled?: boolean
    isAnimate?: boolean
  }>(),
  {
    size: 'large',
    disabled: false,
    isAnimate: false,
  },
)

const emits = defineEmits(['click'])

const classString = computed(() => {
  return ['gradient-button', props.isAnimate ? 'animate' : '']
})

const handleClick = (event: Event) => {
  if (!props.disabled) {
    emits('click', event)
  }
}
</script>

<style scoped>
.gradient-button {
  background-image: linear-gradient(225deg, #e9913e 1%, #f20000 100%);

  &:hover {
    background-image: linear-gradient(225deg, #fca757 1%, #ff2b1d 100%);
  }
  &:active {
    background-image: linear-gradient(225deg, #da7f2c 1%, #e80200 100%);
  }

  &.animate {
    background-size: 600%;
    animation: anime 8s linear infinite;

    &:hover {
      animation-play-state: paused;
    }
  }
}
@keyframes anime {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.gradient-button:disabled {
  @apply animate-none bg-xred-200 bg-none dark:bg-xred-800;
}
</style>
