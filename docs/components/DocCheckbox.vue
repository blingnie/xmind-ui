<template>
  <input
    v-model="checked"
    type="checkbox"
    :disabled="disabled"
    class="doc-checkbox"
    :class="{ 'doc-checkbox--disabled': disabled }"
  />
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  disabled?: boolean
}>(), {
  disabled: false,
})

const checked = defineModel<boolean>({
  default: false,
  required: true,
})
</script>

<style scoped>
.doc-checkbox {
  appearance: none;
  width: 20px;
  height: 20px;
  border: 1px solid transparent;
  border-radius: var(--radius-xxs-4);
  background-color: var(--color-mask-overlays);
  background-position: center;
  background-repeat: no-repeat;
  box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.20) inset, 0 0.5px 2px 0 rgba(0, 0, 0, 0.10) inset;
  transition: all 100ms ease-in-out;
  cursor: pointer;
}

.doc-checkbox:hover:not(:disabled):checked {
  background-color: var(--color-icon-secondary);
}

.doc-checkbox:disabled {
  cursor: not-allowed;
  border-color: var(--color-border-muted);
}

.doc-checkbox:disabled:checked {
  background-color: var(--color-icon-quaternary);
}

.doc-checkbox:checked {
  background-color: var(--color-text-primary);
  background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxMCAxMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTguMTI4NDQgMC4zODM5OTlDOC4xODQ0NCAwLjI3MTk5OSA4LjI1NjQ0IDAuMTg3OTk5IDguMzQ0NDQgMC4xMzJDOC40NDA0NCAwLjA2Nzk5OTYgOC41NDA0NCAwLjAzNTk5OTUgOC42NDQ0NCAwLjAzNTk5OTVDOC43NjQ0NCAwLjAzNTk5OTUgOC44ODg0NCAwLjA3OTk5OTQgOS4wMTY0NCAwLjE2Nzk5OUM5LjE5MjQ0IDAuMjk2IDkuMjgwNDQgMC40NjQgOS4yODA0NCAwLjY3MkM5LjI4MDQ0IDAuNzY4IDkuMjU2NDQgMC44NjQgOS4yMDg0NCAwLjk2TDUuMjM2NDQgOC40MTJDNC45NzI0NCA4LjkwOCA0LjY0ODQ0IDkuMTU2IDQuMjY0NDQgOS4xNTZDMy45NjA0NCA5LjE1NiAzLjY1NjQ0IDguOTkyIDMuMzUyNDQgOC42NjRMMC44ODA0MzggNS45NEMwLjc2ODQzOCA1LjgyOCAwLjcxMjQzOCA1LjY4OCAwLjcxMjQzOCA1LjUyQzAuNzEyNDM4IDUuMzM2IDAuNzgwNDM4IDUuMTg4IDAuOTE2NDM4IDUuMDc2QzEuMDQ0NDQgNC45NDggMS4xODg0NCA0Ljg4NCAxLjM0ODQ0IDQuODg0QzEuNTE2NDQgNC44ODQgMS42NjQ0NCA0Ljk1NiAxLjc5MjQ0IDUuMUw0LjA0ODQ0IDcuNjMyQzQuMDgwNDQgNy42NzIgNC4xMjA0NCA3LjY5MiA0LjE2ODQ0IDcuNjkyQzQuMjE2NDQgNy42OTIgNC4yNTY0NCA3LjY2NCA0LjI4ODQ0IDcuNjA4TDguMTI4NDQgMC4zODM5OTlaIiBmaWxsPSIjRjVGNkY3Ii8+Cjwvc3ZnPgo=');
  background-size: 70%;
}

.doc-checkbox--disabled {
  cursor: not-allowed;
}
</style>
