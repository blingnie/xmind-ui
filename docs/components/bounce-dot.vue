<template>
  <div :style="{ width: size + 'px', height: size + 'px', margin: `-${size / 2}px 0 0 -${size / 2}px` }">
    <span :style="{ background: color ?? '' }"></span>
    <span
      :style="{ background: color ?? '', width: size * 0.3 + 'px', height: size * 0.3 + 'px', margin: `-${size * 0.15}px 0 0 -${size * 0.15}px` }"
    ></span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  size: number
  color?: string
}>()
</script>

<style lang="less" scoped>
div {
  position: absolute;
  top: 50%;
  left: 50%;
}

span {
  position: absolute;
  display: block;
  background: #222;
  border-radius: 100%;
  -webkit-border-radius: 100%;
  -moz-border-radius: 100%;
  width: 100%;
  height: 100%;
}
span:nth-child(1) {
  animation: span 3s infinite;
}

span:nth-child(2) {
  opacity: 0.65;
  -moz-opacity: 0.65;
  top: 50%;
  left: 50%;
}

@keyframes span {
  0% {
    transform: scale(0);
    opacity: 1;
    -moz-opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
    -moz-opacity: 0;
  }
}
</style>
