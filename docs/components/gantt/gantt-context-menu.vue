<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { TaskContextMenuPayload } from '@xmindltd/gantt'
import type { MenuOptionItem } from 'app/fragments/router-views/new-home/stateless/menu/menu-types'
import ContextMenu from 'app/fragments/router-views/new-home/stateless/menu/context-menu.vue'

const contextMenuRef = ref<InstanceType<typeof ContextMenu> | null>(null)
const currentPayload = ref<TaskContextMenuPayload | null>(null)

const menuItems = computed<MenuOptionItem[]>(() => {
  if (!currentPayload.value || !currentPayload.value.items.length) return []

  return currentPayload.value.items.map(item => ({
    type: 'option' as const,
    title: item.label,
    handler: () => {
      item.click()
      hide()
    },
  }))
})

const show = (payload: TaskContextMenuPayload) => {
  currentPayload.value = payload
  if (menuItems.value.length > 0) {
    contextMenuRef.value?.show(undefined, 'context')
  }
}

const hide = () => {
  contextMenuRef.value?.hide()
  currentPayload.value = null
}

defineExpose({
  show,
  hide,
})
</script>

<template>
  <context-menu ref="contextMenuRef" :items="menuItems" />
</template>
