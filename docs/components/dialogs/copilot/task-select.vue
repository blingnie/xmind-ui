<template>
  <fw-tooltip :content-style="{ 'max-width': '200px', 'white-space': 'normal' }">
    <template #trigger>
      <div class="inline-flex h-8 flex-row items-center rounded-md border border-solid" :class="buttonClassList">
        <button
          class="inline-flex h-full flex-row items-center gap-1 px-2 hover:bg-transparent-dark-2 dark:hover:bg-transparent-white-2"
          @click="handleTaskToggle"
        >
          <fw-icon :name="taskIconDisplayed" width="20" height="20" />
          <span class="font-NeverMind-U truncate text-mobile-body-large sm:text-desktop-body-large">{{ taskTitleDisplayed }}</span>
        </button>
        <div class="h-4 w-px bg-border-translucent-light dark:bg-transparent-white-1"></div>
        <fw-menu-popover :menu-items="menuItems">
          <template #trigger>
            <button class="h-8 px-2 hover:bg-transparent-dark-2 dark:hover:bg-transparent-white-2">
              <fw-icon :name="'chevron-downward'" width="16" height="16" />
            </button>
          </template>
          <template #item-right="{ item }">
            <fw-icon v-if="item.key === taskDisplayed" :name="'tick'" width="20" height="20" />
          </template>
        </fw-menu-popover>
      </div>
    </template>
    <template #tooltip>
      <span>{{ $T(tooltipText) }}</span>
    </template>
  </fw-tooltip>
</template>
<script setup lang="ts">
import { $T } from 'client/library/translation'
import { computed, ref } from 'vue'
import { type MenuItem } from 'client/components/types'
import { type IconName } from 'client/components/icon/icons'
import { TaskOption } from './copilot-states'

const model = defineModel<TaskOption | null>()

const buttonClassList = computed(() => {
  return !model.value
    ? 'border-transparent-dark-3 dark:border-transparent-white-3 bg-transparent-dark-1 dark:bg-transparent-white-1 text-text-secondary-light dark:text-text-secondary-dark'
    : 'bg-[#751dfb0d] border-brand-4 text-purple-600 dark:bg-[#802ffb1a] dark:border-ai-purple-300 dark:text-ai-purple-300'
})

const taskSelected = ref<TaskOption>('project-plan')

const taskDisplayed = computed(() => model.value || taskSelected.value)
const taskIconDisplayed = computed<IconName>(() => (taskDisplayed.value === 'todo' ? 'todo' : 'work-breakdown'))
const taskTitleDisplayed = computed(() => (taskDisplayed.value === 'todo' ? $T('To-Do') : $T('Work Breakdown')))
const tooltipText = computed(() =>
  taskDisplayed.value === 'todo'
    ? $T('Create organized to-do lists from your thoughts and ideas instantly')
    : $T('Break down project into actionable tasks with automated timeline and priority'),
)

const menuItems: MenuItem[] = [
  {
    key: 'project-plan' as TaskOption,
    title: $T('Work Breakdown'),
    iconName: 'work-breakdown',
    action: () => {
      taskSelected.value = 'project-plan'
      model.value = 'project-plan'
    },
  },
  {
    key: 'todo' as TaskOption,
    title: $T('To-Do'),
    iconName: 'todo',
    action: () => {
      taskSelected.value = 'todo'
      model.value = 'todo'
    },
  },
]

const handleTaskToggle = () => {
  if (model.value) {
    model.value = null
  } else {
    model.value = taskSelected.value
  }
}
</script>
