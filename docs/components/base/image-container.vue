<template>
  <div :class="twMerge('relative w-full overflow-hidden', props.class)">
    <img
      ref="imageRef"
      class="image-ele h-full w-full"
      :draggable="false"
      :src="sourceCompose"
      :alt="alt"
      :class="twMerge(isShowPlaceholder ? 'invisible' : 'visible', imageClass)"
      @load="setImageLoaded"
    />
    <icon-placeholder v-if="isShowPlaceholder" class="!absolute left-0 top-0 block h-full w-full" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import iconPlaceholder from 'client/components/icon/icon-placeholder.vue'
import debounce from 'utils/debounce'

const props = withDefaults(
  defineProps<{
    src: string
    alt?: string
    lazy?: boolean
    imageClass?: VueClass
    class?: VueClass
  }>(),
  {
    alt: 'app.xmind.com',
    lazy: true,
    imageClass: '',
    class: '',
  },
)

const imageRef = ref<HTMLImageElement>()
const isImageLoaded = ref(false)
const isImageVisible = ref(false)
const sourceCompose = computed(() => (isImageVisible.value || !props.lazy ? props.src : ''))
const isShowPlaceholder = computed(() => !isImageLoaded.value || !sourceCompose.value)

const setImageLoaded = debounce(() => {
  isImageLoaded.value = true
}, 150)

const observer = new IntersectionObserver(
  ([entry]) => {
    const { isIntersecting } = entry
    if (!isIntersecting) return
    isImageVisible.value = true
    observer.disconnect()
  },
  {
    threshold: 0.1,
    rootMargin: '0px',
  },
)

onMounted(() => {
  imageRef.value && observer.observe(imageRef.value)
})

onBeforeUnmount(() => observer.disconnect())
</script>

<style scoped>
.image-ele {
  object-fit: inherit;
}
</style>
