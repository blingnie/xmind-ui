import { ref, watch, onMounted } from 'vue'
import { createHighlighter, type Highlighter } from 'shiki'

let highlighterInstance: Highlighter | null = null
let initPromise: Promise<Highlighter> | null = null

async function getHighlighter() {
  if (highlighterInstance) {
    return highlighterInstance
  }

  if (initPromise) {
    return initPromise
  }

  initPromise = createHighlighter({
    themes: ['github-dark', 'github-light'],
    langs: ['vue', 'html', 'typescript', 'javascript', 'css']
  }).then(highlighter => {
    highlighterInstance = highlighter
    return highlighter
  })

  return initPromise
}

export function useShiki() {
  const highlighter = ref<Highlighter | null>(null)
  const isLoading = ref(true)
  const currentTheme = ref<'github-dark' | 'github-light'>('github-light')

  // 获取当前主题
  const updateTheme = () => {
    if (typeof document !== 'undefined') {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
      currentTheme.value = isDark ? 'github-dark' : 'github-light'
    }
  }

  // 初始化 highlighter
  onMounted(async () => {
    try {
      highlighter.value = await getHighlighter()
      updateTheme()

      // 监听主题变化
      if (typeof document !== 'undefined') {
        const observer = new MutationObserver(() => {
          updateTheme()
        })

        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['data-theme']
        })
      }
    } catch (error) {
      console.error('Failed to initialize shiki:', error)
    } finally {
      isLoading.value = false
    }
  })

  const highlight = (code: string, lang: string = 'vue') => {
    if (!highlighter.value) {
      return code
    }

    try {
      return highlighter.value.codeToHtml(code, {
        lang,
        theme: currentTheme.value
      })
    } catch (error) {
      console.error('Failed to highlight code:', error)
      return `<pre><code>${escapeHtml(code)}</code></pre>`
    }
  }

  return {
    highlighter,
    isLoading,
    currentTheme,
    highlight
  }
}

function escapeHtml(text: string) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
