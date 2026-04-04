<script setup lang="ts">
definePageMeta({ layout: 'default' })

// Get all icon files from fw-icons directory
const iconFiles = import.meta.glob('~/components/icon/fw-icons/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default'
})

const icons = computed(() => {
  return Object.entries(iconFiles).map(([path, content]) => {
    const fileName = path.split('/').pop()?.replace('.svg', '') || ''
    // Detect colorful brand icons that should preserve original colors
    const isColorful = fileName.includes('-color') ||
                       ['xmind', 'xmind-ai-colorful', 'googledrive-color',
                        'facebook-color', 'linkedin-color', 'twitter-color',
                        'slack', 'onedrive-color', 'tiktok'].includes(fileName)
    return {
      name: fileName,
      content: content as string,
      path,
      isColorful
    }
  }).sort((a, b) => a.name.localeCompare(b.name))
})

// Icon size control
const iconSize = ref(24)
const copied = ref('')

// Calculate slider fill percentage
const sliderPercent = computed(() => {
  const min = 16
  const max = 64
  return ((iconSize.value - min) / (max - min)) * 100
})

async function copyIconName(name: string) {
  await navigator.clipboard.writeText(name)
  copied.value = name
  setTimeout(() => { copied.value = '' }, 1200)
}
</script>

<template>
  <div>
    <h1 class="text-xl">Icons</h1>
    <p class="text-sm text-[var(--color-text-tertiary)] mb-[32px]">
      A comprehensive collection of {{ icons.length }} interface icons designed for clarity and consistency. Click any icon to copy its name.
    </p>

    <!-- Size Control -->
    <div class="mb-[32px] p-[16px] rounded-xl border border-[var(--color-border-translucent)] bg-[var(--color-fill-surfacebright)]">
      <div class="flex items-center gap-[16px]">
        <div class="text-sm font-medium text-[var(--color-text-secondary)] shrink-0 min-w-[80px] h-[20px] flex items-center">
          Size
        </div>
        <input
          v-model.number="iconSize"
          type="range"
          min="16"
          max="64"
          step="2"
          class="flex-1 slider"
          :style="{
            background: `linear-gradient(to right, var(--slider-filled-default) ${sliderPercent}%, var(--slider-bg) ${sliderPercent}%)`
          }"
        />
        <div class="text-sm font-mono text-[var(--color-text-primary)] min-w-[60px] text-right h-[20px] flex items-center justify-end">
          {{ iconSize }}px
        </div>
      </div>
    </div>

    <!-- Icons Grid -->
    <div class="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))]" style="column-gap: var(--spacing-padding-l-16); row-gap: var(--spacing-padding-xxl-24);">
      <div
        v-for="icon in icons"
        :key="icon.name"
        class="flex flex-col items-center"
        style="gap: var(--spacing-padding-m-12);"
      >
        <button
          @click="copyIconName(icon.name)"
          class="w-full aspect-square flex items-center justify-center rounded-xl border border-[var(--color-border-translucent)] bg-[var(--color-fill-surfacebright)] hover:shadow-[var(--elevation-l2)] transition-shadow cursor-pointer"
        >
          <div
            class="flex items-center justify-center shrink-0"
            :class="icon.isColorful ? 'icon-colorful' : 'icon-container'"
            :style="{ width: iconSize + 'px', height: iconSize + 'px' }"
            v-html="icon.content"
          />
        </button>
        <span
          class="text-xs text-[var(--color-text-tertiary)] text-center leading-tight w-full overflow-hidden text-ellipsis"
          :class="{ 'text-[var(--color-fill-accent-normal)] font-semibold': copied === icon.name }"
          style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;"
        >
          {{ copied === icon.name ? '✓ copied' : icon.name }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom range slider styling - based on Figma design */
.slider {
  height: 4px;
  border-radius: var(--radius-infinite-300);
  appearance: none;
  -webkit-appearance: none;
  /* Background is set inline with dynamic gradient */
  outline: none;
  cursor: pointer;
  box-shadow: var(--elevation-b1);
  position: relative;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--slider-knob-normal, var(--palette-base-white, #FFFFFF));
  cursor: pointer;
  border: 1px solid var(--slider-border);
  box-shadow: var(--elevation-l1);
  transition: all 150ms ease;
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--slider-knob-normal, var(--palette-base-white, #FFFFFF));
  cursor: pointer;
  border: 1px solid var(--slider-border);
  box-shadow: var(--elevation-l1);
  transition: all 150ms ease;
}

.slider:hover::-webkit-slider-thumb {
  background: var(--slider-knob-hover, var(--palette-gray-100, #F5F5F5));
}

.slider:hover::-moz-range-thumb {
  background: var(--slider-knob-hover, var(--palette-gray-100, #F5F5F5));
}

.slider:active::-webkit-slider-thumb {
  background: var(--slider-knob-pressed, var(--palette-gray-150, #EBEBEB));
}

.slider:active::-moz-range-thumb {
  background: var(--slider-knob-pressed, var(--palette-gray-150, #EBEBEB));
}

/* Ensure SVG icons scale properly */
.icon-container :deep(svg),
.icon-colorful :deep(svg) {
  width: 100% !important;
  height: 100% !important;
}

/* Colorful brand icons - preserve all original colors, no overrides */
.icon-colorful :deep(svg *) {
  /* Keep all original colors unchanged */
}

/* Only override currentColor fills - preserve all hardcoded colors and gradients */
/* Exclude elements with opacity attributes as they're part of special effects */
.icon-container :deep(svg path[fill="currentColor"]:not([fill-opacity]):not([opacity])),
.icon-container :deep(svg path[fill="currentcolor"]:not([fill-opacity]):not([opacity])),
.icon-container :deep(svg circle[fill="currentColor"]:not([fill-opacity]):not([opacity])),
.icon-container :deep(svg circle[fill="currentcolor"]:not([fill-opacity]):not([opacity])),
.icon-container :deep(svg rect[fill="currentColor"]:not([fill-opacity]):not([opacity])),
.icon-container :deep(svg rect[fill="currentcolor"]:not([fill-opacity]):not([opacity])),
.icon-container :deep(svg polygon[fill="currentColor"]:not([fill-opacity]):not([opacity])),
.icon-container :deep(svg polygon[fill="currentcolor"]:not([fill-opacity]):not([opacity])) {
  fill: var(--color-icon-primary);
}

/* Override problematic hardcoded dark colors that's invisible on dark backgrounds */
/* Also exclude elements with opacity attributes */
.icon-container :deep(svg path[fill="#1F2326"]:not([fill-opacity]):not([opacity])),
.icon-container :deep(svg path[fill="#1f2326"]:not([fill-opacity]):not([opacity])),
.icon-container :deep(svg path[fill="black"]:not([fill-opacity]):not([opacity])),
.icon-container :deep(svg circle[fill="#1F2326"]:not([fill-opacity]):not([opacity])),
.icon-container :deep(svg circle[fill="#1f2326"]:not([fill-opacity]):not([opacity])),
.icon-container :deep(svg circle[fill="black"]:not([fill-opacity]):not([opacity])),
.icon-container :deep(svg rect[fill="#1F2326"]:not([fill-opacity]):not([opacity])),
.icon-container :deep(svg rect[fill="#1f2326"]:not([fill-opacity]):not([opacity])),
.icon-container :deep(svg rect[fill="black"]:not([fill-opacity]):not([opacity])),
.icon-container :deep(svg polygon[fill="#1F2326"]:not([fill-opacity]):not([opacity])),
.icon-container :deep(svg polygon[fill="#1f2326"]:not([fill-opacity]):not([opacity])),
.icon-container :deep(svg polygon[fill="black"]:not([fill-opacity]):not([opacity])) {
  fill: var(--color-icon-primary);
}

/* Override currentColor and black strokes */
/* Exclude elements with opacity attributes */
.icon-container :deep(svg [stroke="currentColor"]:not([stroke-opacity]):not([opacity])),
.icon-container :deep(svg [stroke="currentcolor"]:not([stroke-opacity]):not([opacity])),
.icon-container :deep(svg [stroke="black"]:not([stroke-opacity]):not([opacity])) {
  stroke: var(--color-icon-primary);
}

/* Override white fills and strokes (used in circular icons) to use invert color */
/* Exclude elements with opacity attributes to preserve special effects */
.icon-container :deep(svg path[fill="white"]:not([fill-opacity]):not([opacity])),
.icon-container :deep(svg path[fill="#fff"]:not([fill-opacity]):not([opacity])),
.icon-container :deep(svg path[fill="#ffffff"]:not([fill-opacity]):not([opacity])),
.icon-container :deep(svg path[fill="#FFF"]:not([fill-opacity]):not([opacity])),
.icon-container :deep(svg path[fill="#FFFFFF"]:not([fill-opacity]):not([opacity])),
.icon-container :deep(svg circle[fill="white"]:not([fill-opacity]):not([opacity])),
.icon-container :deep(svg circle[fill="#fff"]:not([fill-opacity]):not([opacity])),
.icon-container :deep(svg circle[fill="#ffffff"]:not([fill-opacity]):not([opacity])),
.icon-container :deep(svg circle[fill="#FFF"]:not([fill-opacity]):not([opacity])),
.icon-container :deep(svg circle[fill="#FFFFFF"]:not([fill-opacity]):not([opacity])),
.icon-container :deep(svg rect[fill="white"]:not([fill-opacity]):not([opacity])),
.icon-container :deep(svg rect[fill="#fff"]:not([fill-opacity]):not([opacity])),
.icon-container :deep(svg rect[fill="#ffffff"]:not([fill-opacity]):not([opacity])),
.icon-container :deep(svg rect[fill="#FFF"]:not([fill-opacity]):not([opacity])),
.icon-container :deep(svg rect[fill="#FFFFFF"]:not([fill-opacity]):not([opacity])),
.icon-container :deep(svg polygon[fill="white"]:not([fill-opacity]):not([opacity])),
.icon-container :deep(svg polygon[fill="#fff"]:not([fill-opacity]):not([opacity])),
.icon-container :deep(svg polygon[fill="#ffffff"]:not([fill-opacity]):not([opacity])),
.icon-container :deep(svg polygon[fill="#FFF"]:not([fill-opacity]):not([opacity])),
.icon-container :deep(svg polygon[fill="#FFFFFF"]:not([fill-opacity]):not([opacity])) {
  fill: var(--color-icon-invert);
}

.icon-container :deep(svg [stroke="white"]:not([stroke-opacity]):not([opacity])),
.icon-container :deep(svg [stroke="#fff"]:not([stroke-opacity]):not([opacity])),
.icon-container :deep(svg [stroke="#ffffff"]:not([stroke-opacity]):not([opacity])),
.icon-container :deep(svg [stroke="#FFF"]:not([stroke-opacity]):not([opacity])),
.icon-container :deep(svg [stroke="#FFFFFF"]:not([stroke-opacity]):not([opacity])) {
  stroke: var(--color-icon-invert);
}
</style>
