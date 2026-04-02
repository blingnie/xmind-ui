<template>
  <div>
    <ul
      class="uk-color-picker-grid"
      uk-list-select
      uk-traverse
      data-item="li > button:not(:disabled)"
      data-columns="9"
      data-cls-active="false"
      @click="handleClickInsideColorPicker"
    >
      <li v-for="(option, index) in computedGridOptions" :key="'grid@' + index">
        <button
          ref="gridButton"
          class="uk-button uk-color-picker-button !cursor-pointer"
          :style="{ 'background-color': option.value }"
          :title="option.label || ''"
          :value="option.value"
          :class="{
            'uk-color-picker-button-selected': internalValue === option.value,
          }"
          data-ref="gridButton"
        ></button>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  gridOptions: Array<string | { value: string; label?: string }>
  value: string
}>()

const emit = defineEmits<{
  (e: 'input', value: string): void
}>()

const normalizeValue = (value: string) => {
  return value && /#[0-9a-f]{6}/i.test(value) ? value.toUpperCase() : value
}

const internalValue = ref<string>(normalizeValue(props.value))

const handleClickInsideColorPicker = ({ target }) => {
  target = getButton(target)
  if (!target || !target.hasAttribute('value')) {
    return
  }

  internalValue.value = normalizeValue(target.getAttribute('value'))
  emit('input', internalValue.value)
}

const getButton = el => {
  while (el && el.classList) {
    if (el.classList.contains('uk-color-picker-button')) return el
    el = el.parentNode
  }
  return null
}

const computedGridOptions = computed(() => {
  const valueSet = new Set()
  return props.gridOptions
    .map(option => {
      if (typeof option === 'string') return { value: normalizeValue(option) }
      return Object.assign({}, option, {
        value: normalizeValue(option && option.value),
      })
    })
    .filter(({ value }) => {
      if (valueSet.has(value)) return false
      valueSet.add(value)
      return true
    })
})

watch(
  () => props.value,
  value => {
    internalValue.value = normalizeValue(value)
  },
)
</script>
