<template>
  <input
    v-model="checked"
    type="checkbox"
    :disabled="disabled"
    class="checkbox"
    :class="twMerge([size === 'small' ? 'checkbox-small' : 'checkbox-large'], !disabled && 'cursor-pointer', props.class)"
  />
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    disabled?: boolean
    size?: 'small' | 'large'
    class?: VueClass
  }>(),
  {
    disabled: false,
    size: 'small',
    class: '',
  },
)

const checked = defineModel<boolean>({
  default: false,
  required: true,
})
</script>

<style scoped>
.checkbox {
  @apply appearance-none  border border-solid	border-transparent bg-mask-overlay-s-light  bg-center bg-no-repeat shadow-elevation-b1-light transition duration-100 ease-in-out dark:bg-mask-overlay-s-dark dark:shadow-elevation-b1-dark;
}

.checkbox-small {
  @apply h-[16px] w-[16px] rounded-[3px];
}
.checkbox-large {
  @apply h-[20px] w-[20px] rounded-[4px];
}

.checkbox:hover {
  @apply [&:not([disabled])]:checked:bg-icon-secondary-light [&:not([disabled])]:dark:checked:bg-icon-secondary-dark;
}

.checkbox:disabled {
  @apply cursor-not-allowed border-border-muted-light checked:bg-icon-quaternary-light dark:border-border-muted-dark dark:checked:bg-icon-quaternary-dark;
}
.checkbox:checked {
  @apply bg-text-primary-light bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxMCAxMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTguMTI4NDQgMC4zODM5OTlDOC4xODQ0NCAwLjI3MTk5OSA4LjI1NjQ0IDAuMTg3OTk5IDguMzQ0NDQgMC4xMzJDOC40NDA0NCAwLjA2Nzk5OTYgOC41NDA0NCAwLjAzNTk5OTUgOC42NDQ0NCAwLjAzNTk5OTVDOC43NjQ0NCAwLjAzNTk5OTUgOC44ODg0NCAwLjA3OTk5OTQgOS4wMTY0NCAwLjE2Nzk5OUM5LjE5MjQ0IDAuMjk2IDkuMjgwNDQgMC40NjQgOS4yODA0NCAwLjY3MkM5LjI4MDQ0IDAuNzY4IDkuMjU2NDQgMC44NjQgOS4yMDg0NCAwLjk2TDUuMjM2NDQgOC40MTJDNC45NzI0NCA4LjkwOCA0LjY0ODQ0IDkuMTU2IDQuMjY0NDQgOS4xNTZDMy45NjA0NCA5LjE1NiAzLjY1NjQ0IDguOTkyIDMuMzUyNDQgOC42NjRMMC44ODA0MzggNS45NEMwLjc2ODQzOCA1LjgyOCAwLjcxMjQzOCA1LjY4OCAwLjcxMjQzOCA1LjUyQzAuNzEyNDM4IDUuMzM2IDAuNzgwNDM4IDUuMTg4IDAuOTE2NDM4IDUuMDc2QzEuMDQ0NDQgNC45NDggMS4xODg0NCA0Ljg4NCAxLjM0ODQ0IDQuODg0QzEuNTE2NDQgNC44ODQgMS42NjQ0NCA0Ljk1NiAxLjc5MjQ0IDUuMUw0LjA0ODQ0IDcuNjMyQzQuMDgwNDQgNy42NzIgNC4xMjA0NCA3LjY5MiA0LjE2ODQ0IDcuNjkyQzQuMjE2NDQgNy42OTIgNC4yNTY0NCA3LjY2NCA0LjI4ODQ0IDcuNjA4TDguMTI4NDQgMC4zODM5OTlaIiBmaWxsPSIjRjVGNkY3Ii8+Cjwvc3ZnPgo=')] dark:bg-text-primary-dark dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxMCAxMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTguMTI4NDQgMC4zODM5OTlDOC4xODQ0NCAwLjI3MTk5OSA4LjI1NjQ0IDAuMTg3OTk5IDguMzQ0NDQgMC4xMzJDOC40NDA0NCAwLjA2Nzk5OTYgOC41NDA0NCAwLjAzNTk5OTUgOC42NDQ0NCAwLjAzNTk5OTVDOC43NjQ0NCAwLjAzNTk5OTUgOC44ODg0NCAwLjA3OTk5OTQgOS4wMTY0NCAwLjE2Nzk5OUM5LjE5MjQ0IDAuMjk2IDkuMjgwNDQgMC40NjQgOS4yODA0NCAwLjY3MkM5LjI4MDQ0IDAuNzY4IDkuMjU2NDQgMC44NjQgOS4yMDg0NCAwLjk2TDUuMjM2NDQgOC40MTJDNC45NzI0NCA4LjkwOCA0LjY0ODQ0IDkuMTU2IDQuMjY0NDQgOS4xNTZDMy45NjA0NCA5LjE1NiAzLjY1NjQ0IDguOTkyIDMuMzUyNDQgOC42NjRMMC44ODA0MzggNS45NEMwLjc2ODQzOCA1LjgyOCAwLjcxMjQzOCA1LjY4OCAwLjcxMjQzOCA1LjUyQzAuNzEyNDM4IDUuMzM2IDAuNzgwNDM4IDUuMTg4IDAuOTE2NDM4IDUuMDc2QzEuMDQ0NDQgNC45NDggMS4xODg0NCA0Ljg4NCAxLjM0ODQ0IDQuODg0QzEuNTE2NDQgNC44ODQgMS42NjQ0NCA0Ljk1NiAxLjc5MjQ0IDUuMUw0LjA0ODQ0IDcuNjMyQzQuMDgwNDQgNy42NzIgNC4xMjA0NCA3LjY5MiA0LjE2ODQ0IDcuNjkyQzQuMjE2NDQgNy42OTIgNC4yNTY0NCA3LjY2NCA0LjI4ODQ0IDcuNjA4TDguMTI4NDQgMC4zODM5OTlaIiBmaWxsPSIjMUYyMzI2Ii8+Cjwvc3ZnPgo=')];
}

.checkbox-large:checked {
  @apply bg-[length:70%];
}
</style>
