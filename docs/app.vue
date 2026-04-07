<script setup lang="ts">
const theme = useState('theme', () => 'light')

onMounted(() => {
  const saved = localStorage.getItem('xmind-ui-theme') ?? 'light'
  theme.value = saved
  document.documentElement.setAttribute('data-theme', saved)
})

function toggleTheme() {
  const next = theme.value === 'light' ? 'dark' : 'light'
  theme.value = next
  document.documentElement.setAttribute('data-theme', next)
  localStorage.setItem('xmind-ui-theme', next)
}

provide('theme', { theme, toggleTheme })
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
/* ========== Global Markdown Styles ========== */

/* Inline code */
main code {
  display: inline;
  padding: 2px var(--spacing-padding-s-8); /* 垂直 2px no token */
  background: var(--color-mask-overlays);
  border-radius: var(--radius-xxs-4);
  font-family: 'Fira Code', 'Monaco', 'Courier New', monospace;
  font-size: var(--typo-markdown-code-block-default-size);
  font-weight: var(--typo-markdown-code-block-default-weight);
  line-height: var(--typo-markdown-code-block-default-lh);
  letter-spacing: var(--typo-markdown-code-block-default-ls);
  color: var(--color-text-secondary);
  /* 关键：让 code 跟随文本流换行，不自己决定断行位置 */
  white-space: normal;
  word-break: normal;
  overflow-wrap: anywhere;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
}

/* Links - only in main content area */
main a {
  color: var(--color-text-link-normal);
  text-decoration: none;
}

main a:hover {
  text-decoration: underline;
}

/* Strong text */
main strong {
  display: inline;
  font-weight: 600;
  color: var(--color-text-primary);
}

/* Unordered lists - only apply to lists without specific classes, but exclude .ai-markdown */
main ul:not([class]):not(.ai-markdown ul):not(.ai-markdown *) {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}

main ul:not([class]):not(.ai-markdown ul):not(.ai-markdown *) li {
  display: block;
  padding-left: 1em;
  position: relative;
  font-size: var(--typo-markdown-paragraph-default-size);
  line-height: var(--typo-markdown-paragraph-default-lh);
  font-weight: var(--typo-markdown-paragraph-default-weight);
  letter-spacing: var(--typo-markdown-paragraph-default-ls);
  color: var(--color-text-primary);
}

main ul:not([class]):not(.ai-markdown ul):not(.ai-markdown *) li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--color-text-tertiary);
}
</style>
