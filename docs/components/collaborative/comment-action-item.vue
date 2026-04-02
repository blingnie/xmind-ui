<template>
  <div class="comment-action-item flex flex-row items-center text-text-tertiary-light dark:text-text-tertiary-dark">
    <fw-icon :name="resolvedStatusIcon" :width="16" :height="16" class="mx-1" />
    <span class="action-content text-desktop-caption">{{ resolvedActionContent }}</span>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { $T } from 'client/library/translation'
import { prettyDate } from 'utils/misc'
import { AuthorAction } from '@xmindltd/document-kit-yjs'
import { type IconName } from '../icon/icons'

const props = defineProps<{
  action: AuthorAction
}>()

const resolvedStatusIcon = computed<IconName>(() => (props.action.payload ? 'checkmark-circle-fill' : 'checkmark-circle-outline'))

const resolvedActionContent = computed(() => {
  const action = props.action.payload
    ? $T('$1 marked as resolved.', props.action.author.name)
    : $T('$1 marked as unresolved.', props.action.author.name)
  return `${action} •${prettyDate(props.action.createdDate)}`
})
</script>
