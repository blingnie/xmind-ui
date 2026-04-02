<template>
  <div class="flex items-center justify-center gap-[8px]">
    <span>{{ $T(options[selected]) }}</span>
    <img uk-svg :data-src="toURL('/assets/static/images/home-sidebar/file-list-expand.svg')" />
  </div>
  <div id="drop-menu" ref="pop" uk-pop data-sel-close="#drop-menu > div > div" data-offset="12" data-pos="bottom-left" class="w-[224px]">
    <landing-menu :selected="selected" :options="options" @select="(value: string) => $emit('select', value)" />
  </div>
</template>

<script setup lang="ts">
import landingMenu from 'client/components/landing-menu.vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'

defineProps({
  selected: {
    type: String,
    required: true,
  },
  options: {
    type: Object,
    default: () => ({}),
  },
})

defineEmits<{
  (e: 'select', args: any): void
}>()

const pop = ref<HTMLElement>()

const handleClosePopoverOverlay = () => {
  setTimeout(() => window.UIkit.pop(pop.value).removeOverlay(), 100)
}

const closePop = () => {
  pop.value && window.UIkit.pop(pop.value).hide()
}

onMounted(() => {
  setTimeout(() => {
    window.UIkit.util.on(pop.value, 'show', handleClosePopoverOverlay)
    window.addEventListener('scroll', closePop)
  }, 100)
})
onBeforeUnmount(() => {
  window.UIkit.util.off(pop.value, 'show', handleClosePopoverOverlay)
  window.removeEventListener('scroll', closePop)
})
</script>
