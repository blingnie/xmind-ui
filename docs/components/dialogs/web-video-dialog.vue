<template>
  <app-base-overlay
    v-show="true"
    background-color="rgba(0,0,0,.7)"
    :is-activated="true"
    class="uk-width-1-1 uk-height-1-1 uk-flex uk-flex-column uk-flex-middle uk-flex-center"
    @overlay-close="handleClose"
  >
    <div class="video-container">
      <iframe class="video-iframe" allow="autoplay" :src="embedUrl"></iframe>
    </div>
    <div class="uk-width-1-1 uk-height-1-1 uk-position-absolute" style="z-index: -1" @click="handleClose"></div>
  </app-base-overlay>
</template>

<script lang="ts" setup>
import AppBaseOverlay from 'client/components/base-overlay.vue'
import { usePromiseHook } from 'utils/vue-utils'

defineProps<{
  embedUrl: string
}>()

const { resolve } = usePromiseHook()

const handleClose = () => {
  resolve()
}
</script>

<style lang="less" scoped>
.video-container {
  width: 850px;
  height: 500px;
  border-radius: 6px;

  iframe {
    width: 100%;
    height: 100%;
  }
}
</style>
