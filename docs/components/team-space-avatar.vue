<template>
  <div>
    <div
      v-if="type === 'myWorks'"
      class="flex items-center justify-center rounded border border-border-translucent-light bg-[rgba(0,0,0,0.60)] dark:border-border-translucent-dark dark:bg-[rgba(255,255,255,0.8)]"
      :style="[sizeStyle, { borderRadius: `${myWorksIconRadius}px` }]"
    >
      <fw-icon class="text-white dark:text-black" :name="'my-works-fill'" :width="myWorksIconSize" :height="myWorksIconSize" />
    </div>
    <fw-icon v-else-if="type === 'presetSpace'" name="general" :size="size" />
    <fw-icon v-else-if="type === 'myWorksPresetSpace'" :size="size" name="all" />
    <fw-image-container v-else-if="imageUrl" :style="sizeStyle" class="max-w-[unset]" :src="imageUrl" />
  </div>
</template>

<script setup lang="ts">
import type { TeamSpaceAvatarCategory } from 'app/types'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    imageUrl?: string
    type: TeamSpaceAvatarCategory
    size?: number
    myWorksIconSize?: number
    myWorksIconRadius?: number
  }>(),
  {
    imageUrl: '',
    isPresetTeamOrSpace: false,
    size: 20,
    myWorksIconSize: 14,
    myWorksIconRadius: 4,
  },
)

const sizeStyle = computed(() => {
  return {
    width: `${props.size}px`,
    height: `${props.size}px`,
  }
})
</script>
