<template>
  <input
    type="checkbox"
    :checked="modelValue"
    class="base-checkbox tw-checkbox"
    @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
  />
</template>

<script lang="ts" setup>
/**
 * @deprecated Use <fw-checkbox> instead.
 */
defineProps<{
  modelValue?: boolean
}>()
defineEmits(['update:modelValue'])
</script>

<style lang="less" scoped>
.base-checkbox {
  &:checked {
    background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2IiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTExLjgxNzggNUw3LjUxOTE4IDEwLjc5NTJDNy41MTU1NyAxMC44MDAxIDcuNTA4NDkgMTAuODAwNiA3LjUwNDE2IDEwLjc5NjRMNSA4LjM1MTE1IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEuNiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPg==');
  }
}
</style>
