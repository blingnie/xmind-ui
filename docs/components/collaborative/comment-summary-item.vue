<template>
  <div class="flex flex-col">
    <div class="flex flex-row items-center">
      <div class="flex flex-row items-center justify-center" :style="{ marginLeft: `${avatarListXOffset}px` }">
        <div v-for="(avatarUrl, index) in avatarList" :key="index" class="shrink-0" :class="index > 0 ? '-ml-2' : ''">
          <div class="h-4 w-4 overflow-hidden rounded-full">
            <fw-image-container :src="avatarUrl" />
          </div>
        </div>
      </div>
      <span class="ml-2 font-NeverMind-UI text-desktop-caption text-text-tertiary-light dark:text-text-tertiary-dark">{{ collapsedMessage }}</span>
    </div>
    <div class="h-6">
      <div class="mx-3 my-2 h-2 w-px bg-transparent-dark-4 dark:bg-border-translucent-dark"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { $T } from 'client/library/translation'
import { generateAvatarDataURI } from 'client/library/cloud-kit/utils/avatar'
import { CollaborativeComment } from '@xmindltd/document-kit-yjs'

const props = withDefaults(
  defineProps<{
    comments: CollaborativeComment[]
    avatarCenterX?: number
  }>(),
  {
    // See: The center x of avatar element in `comment-content-item.vue`
    avatarCenterX: 12,
  },
)

const avatarList = computed(() => {
  return (
    props.comments
      .map(comment => {
        return (
          comment.author.avatarUrl ??
          generateAvatarDataURI({
            xmindId: comment.author.xmindId,
            name: comment.author.name,
            backgroundColor: comment.author.color,
            foregroundColor: '#ffffff',
          })
        )
      })
      .filter((avatarUrl, index, avatarList) => avatarList.indexOf(avatarUrl) === index)
      // Prevent overflow from it's parent element
      .slice(0, 6)
  )
})

const avatarListXOffset = computed(() => {
  const avatarListWidth = (avatarList.value.length + 1) * (16 / 2)
  return props.avatarCenterX - avatarListWidth / 2
})

const collapsedMessage = computed(() => $T('$1 more comments', `${props.comments.length}`))
</script>
