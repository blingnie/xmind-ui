<template>
  <fw-popover v-model="isPopoverOpen" :position="popoverPos as PopoverPosition" :arrow="true" :offset-x="-13" @visibility-change="onVisibilityChange">
    <template #trigger="{ isActive }">
      <button
        ref="button"
        type="button"
        :title="title"
        :disabled="isDisabled || !computedInputValue"
        :style="!isDisabled && { 'background-color': fullColor }"
        :class="
          twMerge(
            'group/color-well relative h-6 w-[72px] rounded-[4px]',
            !isDisabled && 'cursor-pointer',
            'border border-border-translucent-light dark:border-border-translucent-dark',
            (internalValue === noneValue || isDisabled) && 'bg-fill-surfaceBright-light dark:bg-fill-surfaceBright-dark',
          )
        "
      >
        <img v-if="iconUrl" :src="iconUrl" class="h-full w-full object-cover" alt="" />
        <svg v-else-if="internalValue === noneValue || isDisabled" width="100%" height="100%">
          <line x1="0%" y1="100%" x2="100%" y2="0%" stroke-dasharray="3,2" stroke="currentcolor" opacity="0.2" />
        </svg>
        <svg v-else-if="internalValue === intermediateValue" width="100%" height="100%">
          <circle cx="50%" cy="50%" r="2" fill="currentcolor" fill-opacity=".1" />
          <circle cx="calc(50% - 9px)" cy="50%" r="2" fill="currentcolor" fill-opacity=".1" />
          <circle cx="calc(50% + 9px)" cy="50%" r="2" fill="currentcolor" fill-opacity=".1" />
        </svg>

        <span
          class="absolute left-0 top-0 size-full"
          v-if="isActive && !isDisabled"
          :style="{
            background: computeMask(fullColor),
          }"
        ></span>

        <span
          class="absolute right-2 top-1/2 size-3 -translate-y-1/2 items-center justify-center rounded-full bg-mask-background-default-light"
          :class="clsx(!isDisabled && 'group-hover/color-well:flex', isActive ? 'flex' : 'hidden')"
        >
          <fw-icon name="chevron-downward" color="white" :width="10" :height="10" />
        </span>
      </button>
    </template>

    <template #content>
      <div class="flex h-full overflow-hidden">
        <overlay-scrollbar>
          <div class="w-auto p-4">
            <slot name="header"></slot>

            <ul class="uk-color-picker">
              <!-- Grid Section -->
              <li v-if="computedGridOptions.length > 0">
                <ul
                  class="uk-color-picker-grid"
                  uk-list-select
                  uk-traverse
                  data-item="li > button:not(:disabled)"
                  data-columns="9"
                  data-cls-active="false"
                >
                  <li v-for="(option, index) in computedGridOptions" :key="'grid@' + index">
                    <button
                      ref="gridButton"
                      class="uk-button uk-color-picker-button !cursor-pointer"
                      :style="{ 'background-color': option.value }"
                      :value="option.value"
                      :class="{ 'uk-color-picker-button-selected': internalValue === option.value }"
                      data-ref="gridButton"
                      @click.stop.prevent="handleClickColorOption(option.value)"
                    ></button>
                  </li>
                </ul>
              </li>

              <li class="uk-color-picker-customize !mt-2 flex justify-between">
                <div class="flex items-center gap-1">
                  <div
                    :class="
                      clsx(
                        'flex h-6 items-center gap-1 overflow-hidden rounded-[4px] border border-border-quaternary-light bg-fill-surfaceBright-light px-2 dark:border-border-quaternary-dark dark:bg-fill-surfaceBright-dark',
                        'hover:border-border-tertiary-light dark:hover:border-border-tertiary-dark',
                      )
                    "
                  >
                    <span
                      class="size-4 border border-border-translucent-light dark:border-border-translucent-dark"
                      :style="{ 'background-color': entityColor }"
                    ></span>
                    <input
                      ref="hexColorInput"
                      class="w-14 border-0 bg-transparent text-desktop-body-medium text-text-tertiary-light outline-none dark:text-text-tertiary-dark"
                      :value="entityColor.replace('#', '')"
                      @blur="handleHexInput"
                      @keydown.enter="handleHexInput"
                    />
                    <div>
                      <fw-divider :orientation="'vertical'" class="h-3" />
                    </div>
                    <input
                      class="w-7 border-0 bg-transparent text-desktop-body-medium outline-none"
                      :disabled="!computedInputValue"
                      :value="colorOpacityNumber"
                      @blur="handleOpacityInput"
                      @keydown.enter="handleOpacityInput"
                    />
                    <span class="text-desktop-body-medium">%</span>
                  </div>

                  <div
                    v-if="isInputValueButtonChecked"
                    class="uk-color-picker-input-preview uk-margin-small-left"
                    :style="{ 'background-color': computedInputValue }"
                  ></div>
                </div>
                <label class="uk-color-well-label !w-[22px] cursor-pointer px-0.5" :for="computedInputId">
                  <input
                    :id="computedInputId"
                    ref="input"
                    type="color"
                    class="uk-color-well-input cursor-pointer"
                    :value="computedInputValue"
                    :name="name"
                    @input="handleHexInput"
                    @click="handleInputClick"
                  />
                </label>
              </li>

              <slot></slot>
            </ul>

            <slot name="footer"></slot>
          </div>
          <slot name="bottom"></slot>
        </overlay-scrollbar>
      </div>
    </template>
  </fw-popover>
</template>

<script lang="ts" setup>
import { watch, computed, ref } from 'vue'
import type { PopoverPosition } from './types'
import overlayScrollbar from './overlay-scrollbar.vue'

interface ColorGridOption {
  value: string
  [key: string]: any
}

interface ColorWellProps {
  name?: string
  value?: string
  inputId?: string
  popoverPos?: string
  noneValue?: string
  intermediateValue?: string
  iconUrl?: string | null
  gridOptions?: Array<string | ColorGridOption>
  autofocusOnClose?: boolean
  title?: string
  isDisabled?: boolean
}

interface ColorWellEmits {
  (e: 'popover-show'): void
  (e: 'popover-hide'): void
  (e: 'update', value: string): void
  (e: 'click-color', value: string): void
}

const props = withDefaults(defineProps<ColorWellProps>(), {
  name: '',
  value: '',
  inputId: '',
  popoverPos: 'left-center',
  noneValue: '',
  intermediateValue: 'intermediate',
  iconUrl: null,
  gridOptions: () => [],
  autofocusOnClose: false,
  title: '',
  isDisabled: false,
})

const emit = defineEmits<ColorWellEmits>()

let globalSequence = 1

const sequence = globalSequence.toString()
globalSequence++

const isPopoverOpen = ref(false)

const normalizeValue = (value: string) => (value && /#[0-9a-f]{6}/i.test(value) ? value.toUpperCase() : value)

const internalValue = ref(normalizeValue(props.value))
const internalInputId = `uk_color_well_input_${sequence}`

const computedInputId = computed(() => props.inputId || internalInputId)

const computedInputValue = computed(() => {
  if (props.noneValue && props.value === props.noneValue) return ''
  if ((props.noneValue && internalValue.value === props.noneValue) || internalValue.value === props.intermediateValue) return '#000000'
  return internalValue.value || '#000000'
})

const fullColor = computed(() => {
  if (props.iconUrl) return ''
  if ((props.noneValue && internalValue.value === props.noneValue) || internalValue.value === props.intermediateValue) return ''
  return internalValue.value
})

const entityColor = computed(() => computedInputValue.value.slice(0, 7))
const colorOpacity = computed(() => {
  if (!computedInputValue.value || computedInputValue.value.length <= 7) return 'FF'
  return computedInputValue.value.slice(7, 9)
})
const colorOpacityNumber = computed(() => Math.floor((parseInt(colorOpacity.value, 16) / 255) * 100))

const computedGridOptions = computed(() => {
  const valueSet = new Set()
  return props.gridOptions
    .map((option: string | ColorGridOption) => {
      if (typeof option === 'string') return { value: normalizeValue(option) }
      return Object.assign({}, option, { value: normalizeValue(option.value) })
    })
    .filter(({ value }) => {
      if (valueSet.has(value)) return false
      valueSet.add(value)
      return true
    })
})

const isInputValueButtonChecked = computed(() => {
  if (internalValue.value === props.intermediateValue) return true
  if (props.noneValue && internalValue.value === props.noneValue) return false
  return computedGridOptions.value.some(({ value }) => value === internalValue.value)
})

watch(
  () => props.value,
  newVal => {
    internalValue.value = normalizeValue(newVal)
  },
  { immediate: true },
)

const onVisibilityChange = (visible: boolean) => {
  if (visible) {
    emit('popover-show')
  } else {
    emit('popover-hide')
  }
}

const handleHexInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let color = target.value

  // Not emit color changed when it is none value
  if (props.value === props.noneValue && color === '') {
    return
  }

  color = color.replace(/^#/, '')

  if (color.length > 6) {
    color = 'FFFFFF'
  } else {
    // Replace invalid characters #ABCZZZ -> #ABC000
    color = color.replace(/[^0-9a-f]/gi, '0')

    // Convert Shorthand, #ABC -> #AABBCC
    if (color.length === 3) {
      color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2]
    }

    // Fill default chars, #ABCD -> #ABCD00
    while (color.length !== 6) {
      color += '0'
    }
  }

  internalValue.value = '#' + color + colorOpacity.value
  emit('update', internalValue.value)
}

const handleOpacityInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const normalize = (color: string) => {
    if (color.length <= 1 || color.length > 7) return color
    let completion = color
    while (completion.length < 7) {
      completion = completion + color.slice(-1)
    }
    return completion
  }
  let opacity = parseInt(target.value)
  if (!opacity && opacity !== 0) opacity = 100
  if (opacity < 0) opacity = 0
  if (opacity > 100) opacity = 100

  let hex = Math.ceil((opacity / 100) * 255).toString(16)
  if (hex.length === 1) hex = `0${hex}`
  internalValue.value = normalize(entityColor.value) + hex
  emit('update', internalValue.value)
}

const handleInputClick = (event: Event) => {
  const target = event.target as HTMLInputElement
  target.value = computedInputValue.value
}

const handleClickColorOption = (value: string) => {
  internalValue.value = normalizeValue(value) + colorOpacity.value
  emit('click-color', internalValue.value)
}

const computeMask = (color: string) => {
  return `linear-gradient(0deg, rgba(28, 40, 52, 0.12) 0%, rgba(28, 40, 52, 0.12) 100%), ${color}`
}

defineExpose({
  closeColorWell: () => {
    isPopoverOpen.value = false
  },
})
</script>

<style lang="less" scoped></style>
