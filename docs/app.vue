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
  padding: var(--spacing-padding-xs-4) var(--spacing-padding-s-8);
  background: var(--color-mask-overlays);
  border-radius: var(--radius-xxs-4);
  font-family: 'Fira Code', 'Monaco', 'Courier New', monospace;
  font-size: var(--typo-markdown-code-block-default-size);
  font-weight: var(--typo-markdown-code-block-default-weight);
  line-height: var(--typo-markdown-code-block-default-lh);
  letter-spacing: var(--typo-markdown-code-block-default-ls);
  color: var(--color-text-secondary);
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

/* Unordered lists - only apply to lists without specific classes */
main ul:not([class]) {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-padding-xs-4);
}

main ul:not([class]) li {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-padding-xs-4);
  min-height: 26px;
  font-size: var(--typo-markdown-paragraph-default-size);
  line-height: var(--typo-markdown-paragraph-default-lh);
  font-weight: var(--typo-markdown-paragraph-default-weight);
  letter-spacing: var(--typo-markdown-paragraph-default-ls);
  color: var(--color-text-primary);
}

main ul:not([class]) li::before {
  content: '';
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 26px;
  flex-shrink: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='2' fill='%23666666'/%3E%3C/svg%3E");
  background-size: 20px 20px;
  background-repeat: no-repeat;
  background-position: center;
}
</style>
