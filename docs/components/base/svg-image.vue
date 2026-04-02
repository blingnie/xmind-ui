<template>
  <div ref="containerRef" :class="clsx(loaded ? 'contents' : props.class)" v-html="loaded ? processedSvgContent : ''"></div>
</template>

<script setup lang="ts">
import clsx from 'clsx'
import { ref, onBeforeUnmount, watch, toRef, computed, onMounted } from 'vue'

interface Props {
  source?: string // Can be URL, SVG string, or base64 data URL
  lazy?: boolean
  adaptColor?: boolean
  class?: VueClass
}

const props = withDefaults(defineProps<Props>(), {
  adaptColor: true,
  lazy: true,
})

const containerRef = ref<HTMLElement>()
const loaded = ref(false)
const svgContent = ref('')
const observer = ref<IntersectionObserver>()
const sourceRef = toRef(props, 'source')

// Computed processed SVG content
const processedSvgContent = computed(() => {
  if (!svgContent.value) return ''
  return processSvgContent(svgContent.value, props.class, props.adaptColor)
})

// Detect source type and return appropriate content
async function getSvgContent(source: string): Promise<string> {
  // Check if it's an SVG string (remove comments and whitespace before checking)
  const cleanedSource = source
    .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML/SVG comments
    .trim() // Remove leading/trailing whitespace
  // Check if it's a base64 data URL
  if (cleanedSource.startsWith('data:image/svg+xml;base64,')) {
    try {
      const base64Data = cleanedSource.replace('data:image/svg+xml;base64,', '')
      return atob(base64Data)
    } catch (error) {
      return ''
    }
  }

  // Check if it's a data URL with UTF-8 encoding
  if (cleanedSource.startsWith('data:image/svg+xml;charset=utf-8,')) {
    return decodeURIComponent(cleanedSource.replace('data:image/svg+xml;charset=utf-8,', ''))
  }

  // Check if it's a simple data URL
  if (cleanedSource.startsWith('data:image/svg+xml,')) {
    return decodeURIComponent(cleanedSource.replace('data:image/svg+xml,', ''))
  }

  if (cleanedSource.startsWith('<svg') || cleanedSource.includes('<svg')) {
    return cleanedSource
  }

  // Otherwise, treat it as a URL and fetch it
  return fetchSvg(source)
}

// Fetch SVG from URL
async function fetchSvg(src: string): Promise<string> {
  try {
    const response = await fetch(src)
    if (!response.ok) {
      throw new Error(`Failed to fetch SVG: ${response.statusText}`)
    }
    const svgContent = await response.text()
    return svgContent
  } catch (error) {
    // Silent error handling for SVG loading
    return ''
  }
}

// Process SVG content to adapt currentColor
function processSvgContent(svgContent: string, className: VueClass, adaptColor = true): string {
  if (!adaptColor) return svgContent

  // Create a temporary DOM parser
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgContent, 'image/svg+xml')
  const svgElement = doc.querySelector('svg')

  if (!svgElement) return svgContent

  // Traverse all elements and replace fill and stroke colors
  const elements = svgElement.querySelectorAll('*')
  elements.forEach(element => {
    const fill = element.getAttribute('fill')
    const stroke = element.getAttribute('stroke')

    // Set fill to currentColor if it's not 'none', 'transparent', or a URL
    if (fill && fill !== 'none' && fill !== 'transparent' && !fill.includes('url(')) {
      element.setAttribute('fill', 'currentColor')
    }

    // Set stroke to currentColor if it's not 'none', 'transparent', or a URL
    if (stroke && stroke !== 'none' && stroke !== 'transparent' && !stroke.includes('url(')) {
      element.setAttribute('stroke', 'currentColor')
    }
  })

  // Add default fill="currentColor" to SVG root element if not set
  if (!svgElement.getAttribute('fill')) {
    svgElement.setAttribute('fill', 'currentColor')
  }

  svgElement.setAttribute('class', clsx(svgElement.getAttribute('class'), className))

  return svgElement.outerHTML
}

// Load SVG content
async function loadSvg() {
  if (loaded.value || !props.source) return
  loaded.value = true

  const content = await getSvgContent(props.source)

  if (content) {
    svgContent.value = content
    loaded.value = true
  }
}

// Setup lazy loading
function setupLazyLoading() {
  if (!props.lazy || !('IntersectionObserver' in window)) {
    // If lazy loading is not needed or browser doesn't support IntersectionObserver, load directly
    loadSvg()
    return
  }

  // Clean up previous observer
  if (observer.value) {
    observer.value.disconnect()
  }

  // Create new observer
  observer.value = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadSvg()
          observer.value?.disconnect()
        }
      })
    },
    {
      rootMargin: '50px', // Start loading 50px before entering viewport
    },
  )

  observer.value.observe(containerRef.value)
}

// Watch for source changes after mounted
watch(sourceRef, () => {
  if (containerRef.value) {
    svgContent.value = ''
    loaded.value = false
    setupLazyLoading()
  }
})

onMounted(() => {
  if (containerRef.value) {
    setupLazyLoading()
  }
})

onBeforeUnmount(() => {
  if (observer.value) {
    observer.value.disconnect()
  }
})
</script>
