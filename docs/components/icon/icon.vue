<template>
  <component :is="IconComponent" :width="width" :height="height" :color="color" :data-component-name="name" />
</template>

<script lang="ts" setup>
// This component dynamically loads and displays an icon based on the provided name prop.
// It uses defineAsyncComponent to load the icon component asynchronously.
// The width, height, and color of the icon can be customized through props.
// If the icon is loading, a placeholder component is displayed.
// Demo page: localhost:10009/icons-demo
import { computed, defineAsyncComponent } from 'vue'
import { type IconName, getIconComponent, getSyncIconComponent } from 'client/components/icon/icons'
import iconPlaceholder from 'client/components/icon/icon-placeholder.vue'

const props = withDefaults(
  defineProps<{
    name: IconName
    width?: number | string
    height?: number | string
    color?: string
  }>(),
  {
    width: 20,
    height: 20,
    color: null,
  },
)

const RETRY_LIMIT = 30

const IconComponent = computed(() => {
  if (getSyncIconComponent(props.name)) {
    return getSyncIconComponent(props.name)
  }
  return defineAsyncComponent({
    loader: getIconComponent?.(props.name),
    loadingComponent: iconPlaceholder,
    onError(error, retry, fail, attempts) {
      if (error.message.match(/fetch/) && attempts <= RETRY_LIMIT) {
        retry()
      } else {
        fail()
      }
    },
  })
})
</script>
