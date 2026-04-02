<template>
  <span
    :style="sizeStyle"
    class="skeleton-animation-unit relative inline-block overflow-hidden bg-transparent-dark-3 dark:bg-transparent-white-1"
  ></span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{
  width?: number | string
  height?: number | string
}>()

const sizeStyle = computed(() => ({
  width: props.width ? `${props.width}px` : '100%',
  height: props.height ? `${props.height}px` : '100%',
}))
</script>

<style scoped>
html[color-scheme='light'] {
  --uk-skeleton-animation-rectangle-transition-background: rgba(255, 255, 255, 0.55);
}

html[color-scheme='dark'] {
  --uk-skeleton-animation-rectangle-transition-background: rgba(255, 255, 255, 0.05);
}

@keyframes SkeletonTransitionAnimation {
  0% {
    transform: translate3d(-30%, 0, 0);
  }
  100% {
    transform: translate3d(30%, 0, 0);
  }
}

.skeleton-animation-unit::before {
  content: ' ';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 50%;
  z-index: 1;
  width: 800%;
  margin-left: -250%;
  animation: SkeletonTransitionAnimation 1s linear infinite;
  background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0) 46%,
      var(--uk-skeleton-animation-rectangle-transition-background, rgba(255, 255, 255, 0.35)) 50%,
      rgba(255, 255, 255, 0) 54%
    )
    50% 50%;
}
</style>
