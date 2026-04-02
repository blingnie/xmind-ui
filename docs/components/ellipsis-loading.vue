<template>
  <div class="loading relative inline-block h-[24px] w-[64px]">
    <div
      class="absolute top-[8px] h-[9px] w-[9px] rounded-full ease-[cubic-bezier(0,1,1,0)]"
      :class="{ 'bg-light-grey-1': !dark, 'bg-dark-grey-7': dark }"
    ></div>
    <div
      class="absolute top-[8px] h-[9px] w-[9px] rounded-full ease-[cubic-bezier(0,1,1,0)]"
      :class="{ 'bg-light-grey-1': !dark, 'bg-dark-grey-7': dark }"
    ></div>
    <div
      class="absolute top-[8px] h-[9px] w-[9px] rounded-full ease-[cubic-bezier(0,1,1,0)]"
      :class="{ 'bg-light-grey-1': !dark, 'bg-dark-grey-7': dark }"
    ></div>
    <div
      class="absolute top-[8px] h-[9px] w-[9px] rounded-full ease-[cubic-bezier(0,1,1,0)]"
      :class="{ 'bg-light-grey-1': !dark, 'bg-dark-grey-7': dark }"
    ></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  dark?: boolean
}>()
</script>

<style lang="less" scoped>
@keyframes lds-ellipsis1 {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes lds-ellipsis3 {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(0);
  }
}

@keyframes lds-ellipsis2 {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(19px, 0);
  }
}

.loading {
  div:nth-child(1) {
    left: 6px;
    animation: lds-ellipsis1 0.6s infinite;
  }

  div:nth-child(2) {
    left: 6px;
    animation: lds-ellipsis2 0.6s infinite;
  }

  div:nth-child(3) {
    left: 26px;
    animation: lds-ellipsis2 0.6s infinite;
  }

  div:nth-child(4) {
    left: 45px;
    animation: lds-ellipsis3 0.6s infinite;
  }
}
</style>
