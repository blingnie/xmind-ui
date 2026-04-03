<template>
  <div class="doc-toc-wrapper">
    <div v-show="showTopFade" class="doc-toc-fade doc-toc-fade--top"></div>
    <nav class="doc-toc" ref="tocRef" @scroll="updateFadeStates">
      <div class="doc-toc__header">
        <h3 class="doc-toc__title">On this page</h3>
      </div>
      <ul class="doc-toc__list">
      <li
        v-for="item in items"
        :key="item.id"
        class="doc-toc__item"
        :class="{ 'doc-toc__item--nested': item.level > 2 }"
      >
        <a
          :href="`#${item.id}`"
          class="doc-toc__link"
          :class="{ 'doc-toc__link--active': activeId === item.id }"
          @click.prevent="scrollToSection(item.id)"
        >
          {{ item.text }}
        </a>
        </li>
      </ul>
    </nav>
    <div v-show="showBottomFade" class="doc-toc-fade doc-toc-fade--bottom"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface TocItem {
  id: string
  text: string
  level: number
}

const props = withDefaults(defineProps<{
  items?: TocItem[]
}>(), {
  items: () => []
})

const activeId = ref<string>('')
const showTopFade = ref(false)
const showBottomFade = ref(false)
const tocRef = ref<HTMLElement | null>(null)

const updateFadeStates = () => {
  if (!tocRef.value) return

  const { scrollTop, scrollHeight, clientHeight } = tocRef.value

  // 顶部渐隐：滚动超过 10px 时显示
  showTopFade.value = scrollTop > 10

  // 底部渐隐：还有内容可以滚动时显示
  showBottomFade.value = scrollTop + clientHeight < scrollHeight - 10
}

const scrollToSection = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    const headerOffset = 80 // Account for fixed header
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })

    activeId.value = id
  }
}

// Track active section on scroll
const updateActiveSection = () => {
  const sections = props.items.map(item => document.getElementById(item.id)).filter(Boolean)

  for (let i = sections.length - 1; i >= 0; i--) {
    const section = sections[i]
    if (section) {
      const rect = section.getBoundingClientRect()
      if (rect.top <= 100) {
        activeId.value = section.id
        break
      }
    }
  }
}

onMounted(() => {
  window.addEventListener('scroll', updateActiveSection)
  updateActiveSection()
  updateFadeStates()
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateActiveSection)
})
</script>

<style scoped>
.doc-toc-wrapper {
  position: relative;
  position: sticky;
  top: 112px;
  align-self: flex-start;
  width: 240px;
  max-height: calc(100vh - 160px);
}

.doc-toc {
  max-height: calc(100vh - 160px);
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
  transition: scrollbar-color 0.2s;
}

.doc-toc:hover {
  scrollbar-color: var(--color-border-default) transparent;
}

.doc-toc::-webkit-scrollbar {
  width: 6px;
}

.doc-toc::-webkit-scrollbar-track {
  background: transparent;
}

.doc-toc::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 3px;
  transition: background 0.2s;
}

.doc-toc:hover::-webkit-scrollbar-thumb {
  background: var(--color-border-default);
}

.doc-toc:hover::-webkit-scrollbar-thumb:hover {
  background: var(--color-border-default);
}

/* Fade effects */
.doc-toc-fade {
  position: absolute;
  left: 0;
  right: 0;
  height: 60px;
  pointer-events: none;
  z-index: 10;
}

.doc-toc-fade--top {
  top: 0;
  background: linear-gradient(180deg, var(--color-fill-surface-desktop) 0%, transparent 100%);
}

.doc-toc-fade--bottom {
  bottom: 0;
  background: linear-gradient(180deg, transparent 0%, var(--color-fill-surface-desktop) 100%);
}

.doc-toc__header {
  margin-bottom: var(--spacing-margin-margin-l-24);
}

.doc-toc__title {
  margin: 0;
  font-size: var(--typo-interface-desktop-subhead-subhead-small-size);
  line-height: var(--typo-interface-desktop-subhead-subhead-small-lh);
  font-weight: var(--typo-interface-desktop-subhead-subhead-small-weight);
  letter-spacing: var(--typo-interface-desktop-subhead-subhead-small-ls);
  color: var(--color-text-secondary);
}

.doc-toc__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-size-m-16);
}

.doc-toc__item {
  margin: 0;
}

.doc-toc__item--nested {
  padding-left: var(--spacing-padding-l-16);
}

.doc-toc__link {
  display: block;
  font-size: var(--typo-interface-desktop-body-body-medium-size);
  line-height: var(--typo-interface-desktop-body-body-medium-lh);
  font-weight: var(--typo-interface-desktop-body-body-medium-weight);
  letter-spacing: var(--typo-interface-desktop-body-body-medium-ls);
  color: var(--color-text-tertiary);
  text-decoration: none;
  transition: color 150ms ease;
}

.doc-toc__link:hover {
  color: var(--color-text-secondary);
}

.doc-toc__link--active {
  color: var(--color-text-primary);
}
</style>
