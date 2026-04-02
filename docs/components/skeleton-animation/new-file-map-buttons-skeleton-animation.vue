<template>
  <div class="skeleton-animation-item uk-width-1-1 uk-flex">
    <div v-for="index in skeletonCount" :key="index" class="base-skeleton-animation-unit skeleton-button-thumbnail"></div>
  </div>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    skeletonCount: number
  }>(),
  {
    skeletonCount: 3,
  },
)
</script>

<style scoped lang="less">
.skeleton-button-thumbnail {
  --margin: 32px;

  @media (max-width: 600px) {
    --margin: 12px;
  }
  min-height: 90px;
  width: calc(33.33% - var(--margin));
  margin-left: var(--margin);
  border-radius: 10px;
  &:nth-of-type(1) {
    margin-left: 0;
    width: 33.33%;
  }
}
</style>
