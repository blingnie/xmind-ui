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
