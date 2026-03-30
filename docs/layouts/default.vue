<script setup lang="ts">
const { theme, toggleTheme } = inject('theme') as any
const sidebarOpen = ref(false)

const nav = [
  {
    group: 'Foundation',
    items: [
      { label: 'Colors', to: '/tokens/colors' },
      { label: 'Typography', to: '/tokens/typography' },
      { label: 'Spacing', to: '/tokens/spacing' },
      { label: 'Radius', to: '/tokens/radius' },
      { label: 'Elevation', to: '/tokens/effects' },
    ],
  },
  {
    group: 'Components',
    items: [
      { label: 'Button', to: '/components/button' },
      { label: 'Badge', to: '/components/badge' },
      // 后续新增组件在这里追加
    ],
  },
]

// Close sidebar on navigation (mobile)
const route = useRoute()
watch(() => route.path, () => {
  sidebarOpen.value = false
})
</script>

<template>
  <!-- Centered container with max-width -->
  <div class="min-h-screen max-w-[1440px] mx-auto px-4 md:px-8 lg:px-20 xl:px-40">
    <!-- Mobile header -->
    <header class="h-14 flex items-center justify-between lg:hidden border-b border-[var(--color-border-translucent)] px-2">
      <button
        @click="sidebarOpen = !sidebarOpen"
        class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[var(--color-fill-secondary)] transition-colors"
        aria-label="Toggle menu"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <NuxtLink to="/" class="flex items-center">
        <svg width="94" height="13" viewBox="0 0 94 13" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-3">
          <path d="M8.48005 0.976093H11.5521L7.98405 6.46409L11.8081 12.4961H8.70405L5.98405 8.09609L3.12005 12.4961H5.37336e-05L4.00005 6.44809L0.432054 0.976093H3.48805L6.03205 4.96009L8.48005 0.976093ZM15.2212 4.17609L15.6692 5.02409C15.8932 4.67209 16.2078 4.38943 16.6132 4.17609C17.0292 3.96276 17.4718 3.85609 17.9412 3.85609C18.5598 3.85609 19.0932 3.97876 19.5412 4.22409C19.9998 4.45876 20.3572 4.81076 20.6132 5.28009C20.8478 4.85343 21.2052 4.51209 21.6852 4.25609C22.1652 3.98943 22.6878 3.85609 23.2532 3.85609C23.8932 3.85609 24.4532 4.01609 24.9332 4.33609C25.4132 4.64543 25.7812 5.08809 26.0372 5.66409C26.3038 6.24009 26.4372 6.91209 26.4372 7.68009V12.4961H23.9092V7.71209C23.9092 7.24276 23.7812 6.86943 23.5252 6.59209C23.2692 6.30409 22.9225 6.16009 22.4852 6.16009C22.0905 6.16009 21.7652 6.33076 21.5092 6.67209C21.2532 7.00276 21.1252 7.41876 21.1252 7.92009V12.4961H18.5972V7.71209C18.5972 7.24276 18.4692 6.86943 18.2132 6.59209C17.9678 6.30409 17.6372 6.16009 17.2212 6.16009C16.8158 6.16009 16.4745 6.33076 16.1972 6.67209C15.9198 7.00276 15.7812 7.41876 15.7812 7.92009V12.4961H13.2532V4.17609H15.2212ZM30.4341 4.17609V12.4961H27.9061V4.17609H30.4341ZM29.1861 3.20009C28.7381 3.20009 28.3541 3.04543 28.0341 2.73609C27.7247 2.41609 27.5701 2.03743 27.5701 1.60009C27.5701 1.16276 27.7247 0.789426 28.0341 0.480093C28.3541 0.160093 28.7381 9.34601e-05 29.1861 9.34601e-05C29.6127 9.34601e-05 29.9807 0.160093 30.2901 0.480093C30.6101 0.789426 30.7701 1.16276 30.7701 1.60009C30.7701 2.03743 30.6154 2.41609 30.3061 2.73609C29.9967 3.04543 29.6234 3.20009 29.1861 3.20009ZM33.8693 4.17609L34.3013 4.97609C34.504 4.63476 34.7973 4.36276 35.1813 4.16009C35.576 3.95743 36.0453 3.85609 36.5893 3.85609C37.6133 3.85609 38.3973 4.18143 38.9413 4.83209C39.496 5.47209 39.7733 6.39476 39.7733 7.60009V12.4961H37.2453V7.71209C37.2453 7.21076 37.1226 6.82676 36.8773 6.56009C36.6426 6.29343 36.3066 6.16009 35.8693 6.16009C35.4426 6.16009 35.096 6.33609 34.8293 6.68809C34.5626 7.04009 34.4293 7.50943 34.4293 8.09609V12.4961H31.9013V4.17609H33.8693ZM45.1658 12.6721C44.3871 12.6721 43.6725 12.4748 43.0218 12.0801C42.3711 11.6854 41.8538 11.1521 41.4698 10.4801C41.0858 9.80809 40.8938 9.07209 40.8938 8.27209C40.8938 7.47209 41.0858 6.73609 41.4698 6.06409C41.8538 5.38143 42.3711 4.84276 43.0218 4.44809C43.6725 4.05343 44.3871 3.85609 45.1658 3.85609C46.0618 3.85609 46.8831 4.12809 47.6298 4.67209V0.848093L50.1578 1.71209V12.4961H48.2538L47.8058 11.7121C47.4431 12.0214 47.0325 12.2614 46.5738 12.4321C46.1258 12.5921 45.6565 12.6721 45.1658 12.6721ZM45.5498 10.3841C45.9445 10.3841 46.3071 10.2881 46.6378 10.0961C46.9685 9.90409 47.2298 9.64276 47.4218 9.31209C47.6138 8.98143 47.7098 8.61876 47.7098 8.22409C47.7098 7.84009 47.6138 7.48276 47.4218 7.15209C47.2298 6.82143 46.9685 6.56009 46.6378 6.36809C46.3071 6.17609 45.9445 6.08009 45.5498 6.08009C45.1551 6.08009 44.7925 6.17609 44.4618 6.36809C44.1418 6.56009 43.8858 6.82143 43.6938 7.15209C43.5018 7.48276 43.4058 7.84009 43.4058 8.22409C43.4058 8.61876 43.5018 8.98143 43.6938 9.31209C43.8858 9.64276 44.1418 9.90409 44.4618 10.0961C44.7925 10.2881 45.1551 10.3841 45.5498 10.3841ZM60.0776 12.6992C59.1557 12.6992 58.3406 12.5299 57.6322 12.1914C56.9291 11.8529 56.3848 11.3763 55.9994 10.7617C55.614 10.1471 55.4213 9.43359 55.4213 8.62109V1.22266H57.4291V8.44922C57.4291 8.94401 57.5385 9.37891 57.7572 9.75391C57.976 10.1289 58.2833 10.418 58.6791 10.6211C59.0802 10.8242 59.5463 10.9258 60.0776 10.9258C60.614 10.9258 61.0828 10.8242 61.4838 10.6211C61.8848 10.418 62.1947 10.1315 62.4135 9.76172C62.6374 9.39193 62.7494 8.96224 62.7494 8.47266V1.22266H64.7572V8.59766C64.7572 9.41016 64.5619 10.1263 64.1713 10.7461C63.7859 11.3659 63.239 11.8477 62.5307 12.1914C61.8276 12.5299 61.0098 12.6992 60.0776 12.6992ZM66.4876 1.22266H68.4954V12.4961H66.4876V1.22266ZM74.5107 1.22266H76.4872V6.05859H76.8388L80.9013 1.22266H83.3232L78.6279 6.75391L83.6122 12.4961H81.1904L77.1591 7.85547H76.4872V12.4961H74.5107V1.22266ZM84.5691 4.21484H86.5457V12.4961H84.5691V4.21484ZM84.4832 0.792969H86.6316V2.80859H84.4832V0.792969ZM91.0729 1.30078V4.21484H93.3229V5.87891H91.0729V10.2852C91.0729 10.5039 91.1536 10.6862 91.3151 10.832C91.4765 10.9779 91.6901 11.0612 91.9557 11.082C92.1588 11.0872 92.3854 11.0716 92.6354 11.0352C92.8854 10.9987 93.1145 10.9492 93.3229 10.8867V12.4258C93.1041 12.5091 92.8203 12.5768 92.4713 12.6289C92.1276 12.681 91.7812 12.7044 91.4322 12.6992C90.9687 12.6992 90.5598 12.6107 90.2057 12.4336C89.8515 12.2513 89.5755 12.0013 89.3776 11.6836C89.1848 11.3607 89.0885 10.9883 89.0885 10.5664V5.87891H87.8151V4.21484H89.0885V1.91797L91.0729 1.30078Z" fill="var(--color-text-primary)"/>
        </svg>
      </NuxtLink>

      <button
        class="relative w-14 h-8 bg-[var(--color-mask-overlays)] transition-colors flex items-center justify-between px-2"
        style="border-radius: var(--radius-m-12);"
        :title="theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'"
        @click="toggleTheme"
      >
        <!-- Sun icon (left) -->
        <svg class="w-3.5 h-3.5 text-[var(--color-text-tertiary)] z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="5" stroke-width="2" />
          <line x1="12" y1="1" x2="12" y2="3" stroke-width="2" stroke-linecap="round" />
          <line x1="12" y1="21" x2="12" y2="23" stroke-width="2" stroke-linecap="round" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke-width="2" stroke-linecap="round" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke-width="2" stroke-linecap="round" />
          <line x1="1" y1="12" x2="3" y2="12" stroke-width="2" stroke-linecap="round" />
          <line x1="21" y1="12" x2="23" y2="12" stroke-width="2" stroke-linecap="round" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke-width="2" stroke-linecap="round" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke-width="2" stroke-linecap="round" />
        </svg>

        <!-- Moon icon (right) -->
        <svg class="w-3.5 h-3.5 text-[var(--color-text-tertiary)] z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>

        <!-- Slider -->
        <div
          class="absolute top-1 w-6 h-6 bg-[var(--color-fill-surfacebright)] border border-[var(--color-border-translucent)] shadow-[var(--shadow-l1)] transition-all duration-200 ease-in-out"
          style="border-radius: var(--radius-s-8);"
          :class="theme === 'light' ? 'left-1' : 'left-[28px]'"
        />
      </button>
    </header>

    <!-- Desktop layout -->
    <div class="hidden lg:block min-h-screen">
      <!-- Floating top header bar (fixed, 32px top margin, 960px width, centered) -->
      <header class="fixed top-8 left-1/2 -translate-x-1/2 h-12 z-30 w-[960px]">
        <div class="flex items-center justify-between h-full pl-4 pr-2 bg-[var(--color-fill-surfacebright)] border border-[var(--color-border-translucent)] shadow-[var(--shadow-l2)]" style="border-radius: var(--radius-l-16);">
          <NuxtLink to="/" class="flex items-center">
            <svg width="94" height="13" viewBox="0 0 94 13" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.48005 0.976093H11.5521L7.98405 6.46409L11.8081 12.4961H8.70405L5.98405 8.09609L3.12005 12.4961H5.37336e-05L4.00005 6.44809L0.432054 0.976093H3.48805L6.03205 4.96009L8.48005 0.976093ZM15.2212 4.17609L15.6692 5.02409C15.8932 4.67209 16.2078 4.38943 16.6132 4.17609C17.0292 3.96276 17.4718 3.85609 17.9412 3.85609C18.5598 3.85609 19.0932 3.97876 19.5412 4.22409C19.9998 4.45876 20.3572 4.81076 20.6132 5.28009C20.8478 4.85343 21.2052 4.51209 21.6852 4.25609C22.1652 3.98943 22.6878 3.85609 23.2532 3.85609C23.8932 3.85609 24.4532 4.01609 24.9332 4.33609C25.4132 4.64543 25.7812 5.08809 26.0372 5.66409C26.3038 6.24009 26.4372 6.91209 26.4372 7.68009V12.4961H23.9092V7.71209C23.9092 7.24276 23.7812 6.86943 23.5252 6.59209C23.2692 6.30409 22.9225 6.16009 22.4852 6.16009C22.0905 6.16009 21.7652 6.33076 21.5092 6.67209C21.2532 7.00276 21.1252 7.41876 21.1252 7.92009V12.4961H18.5972V7.71209C18.5972 7.24276 18.4692 6.86943 18.2132 6.59209C17.9678 6.30409 17.6372 6.16009 17.2212 6.16009C16.8158 6.16009 16.4745 6.33076 16.1972 6.67209C15.9198 7.00276 15.7812 7.41876 15.7812 7.92009V12.4961H13.2532V4.17609H15.2212ZM30.4341 4.17609V12.4961H27.9061V4.17609H30.4341ZM29.1861 3.20009C28.7381 3.20009 28.3541 3.04543 28.0341 2.73609C27.7247 2.41609 27.5701 2.03743 27.5701 1.60009C27.5701 1.16276 27.7247 0.789426 28.0341 0.480093C28.3541 0.160093 28.7381 9.34601e-05 29.1861 9.34601e-05C29.6127 9.34601e-05 29.9807 0.160093 30.2901 0.480093C30.6101 0.789426 30.7701 1.16276 30.7701 1.60009C30.7701 2.03743 30.6154 2.41609 30.3061 2.73609C29.9967 3.04543 29.6234 3.20009 29.1861 3.20009ZM33.8693 4.17609L34.3013 4.97609C34.504 4.63476 34.7973 4.36276 35.1813 4.16009C35.576 3.95743 36.0453 3.85609 36.5893 3.85609C37.6133 3.85609 38.3973 4.18143 38.9413 4.83209C39.496 5.47209 39.7733 6.39476 39.7733 7.60009V12.4961H37.2453V7.71209C37.2453 7.21076 37.1226 6.82676 36.8773 6.56009C36.6426 6.29343 36.3066 6.16009 35.8693 6.16009C35.4426 6.16009 35.096 6.33609 34.8293 6.68809C34.5626 7.04009 34.4293 7.50943 34.4293 8.09609V12.4961H31.9013V4.17609H33.8693ZM45.1658 12.6721C44.3871 12.6721 43.6725 12.4748 43.0218 12.0801C42.3711 11.6854 41.8538 11.1521 41.4698 10.4801C41.0858 9.80809 40.8938 9.07209 40.8938 8.27209C40.8938 7.47209 41.0858 6.73609 41.4698 6.06409C41.8538 5.38143 42.3711 4.84276 43.0218 4.44809C43.6725 4.05343 44.3871 3.85609 45.1658 3.85609C46.0618 3.85609 46.8831 4.12809 47.6298 4.67209V0.848093L50.1578 1.71209V12.4961H48.2538L47.8058 11.7121C47.4431 12.0214 47.0325 12.2614 46.5738 12.4321C46.1258 12.5921 45.6565 12.6721 45.1658 12.6721ZM45.5498 10.3841C45.9445 10.3841 46.3071 10.2881 46.6378 10.0961C46.9685 9.90409 47.2298 9.64276 47.4218 9.31209C47.6138 8.98143 47.7098 8.61876 47.7098 8.22409C47.7098 7.84009 47.6138 7.48276 47.4218 7.15209C47.2298 6.82143 46.9685 6.56009 46.6378 6.36809C46.3071 6.17609 45.9445 6.08009 45.5498 6.08009C45.1551 6.08009 44.7925 6.17609 44.4618 6.36809C44.1418 6.56009 43.8858 6.82143 43.6938 7.15209C43.5018 7.48276 43.4058 7.84009 43.4058 8.22409C43.4058 8.61876 43.5018 8.98143 43.6938 9.31209C43.8858 9.64276 44.1418 9.90409 44.4618 10.0961C44.7925 10.2881 45.1551 10.3841 45.5498 10.3841ZM60.0776 12.6992C59.1557 12.6992 58.3406 12.5299 57.6322 12.1914C56.9291 11.8529 56.3848 11.3763 55.9994 10.7617C55.614 10.1471 55.4213 9.43359 55.4213 8.62109V1.22266H57.4291V8.44922C57.4291 8.94401 57.5385 9.37891 57.7572 9.75391C57.976 10.1289 58.2833 10.418 58.6791 10.6211C59.0802 10.8242 59.5463 10.9258 60.0776 10.9258C60.614 10.9258 61.0828 10.8242 61.4838 10.6211C61.8848 10.418 62.1947 10.1315 62.4135 9.76172C62.6374 9.39193 62.7494 8.96224 62.7494 8.47266V1.22266H64.7572V8.59766C64.7572 9.41016 64.5619 10.1263 64.1713 10.7461C63.7859 11.3659 63.239 11.8477 62.5307 12.1914C61.8276 12.5299 61.0098 12.6992 60.0776 12.6992ZM66.4876 1.22266H68.4954V12.4961H66.4876V1.22266ZM74.5107 1.22266H76.4872V6.05859H76.8388L80.9013 1.22266H83.3232L78.6279 6.75391L83.6122 12.4961H81.1904L77.1591 7.85547H76.4872V12.4961H74.5107V1.22266ZM84.5691 4.21484H86.5457V12.4961H84.5691V4.21484ZM84.4832 0.792969H86.6316V2.80859H84.4832V0.792969ZM91.0729 1.30078V4.21484H93.3229V5.87891H91.0729V10.2852C91.0729 10.5039 91.1536 10.6862 91.3151 10.832C91.4765 10.9779 91.6901 11.0612 91.9557 11.082C92.1588 11.0872 92.3854 11.0716 92.6354 11.0352C92.8854 10.9987 93.1145 10.9492 93.3229 10.8867V12.4258C93.1041 12.5091 92.8203 12.5768 92.4713 12.6289C92.1276 12.681 91.7812 12.7044 91.4322 12.6992C90.9687 12.6992 90.5598 12.6107 90.2057 12.4336C89.8515 12.2513 89.5755 12.0013 89.3776 11.6836C89.1848 11.3607 89.0885 10.9883 89.0885 10.5664V5.87891H87.8151V4.21484H89.0885V1.91797L91.0729 1.30078Z" fill="var(--color-text-primary)"/>
            </svg>
          </NuxtLink>

          <!-- Theme toggle switch -->
          <button
            class="relative w-14 h-8 bg-[var(--color-mask-overlays)] transition-colors flex items-center justify-between px-2"
            style="border-radius: var(--radius-m-12);"
            :title="theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'"
            @click="toggleTheme"
          >
            <!-- Sun icon (left) -->
            <svg class="w-3.5 h-3.5 text-[var(--color-text-tertiary)] z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="5" stroke-width="2" />
              <line x1="12" y1="1" x2="12" y2="3" stroke-width="2" stroke-linecap="round" />
              <line x1="12" y1="21" x2="12" y2="23" stroke-width="2" stroke-linecap="round" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke-width="2" stroke-linecap="round" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke-width="2" stroke-linecap="round" />
              <line x1="1" y1="12" x2="3" y2="12" stroke-width="2" stroke-linecap="round" />
              <line x1="21" y1="12" x2="23" y2="12" stroke-width="2" stroke-linecap="round" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke-width="2" stroke-linecap="round" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke-width="2" stroke-linecap="round" />
            </svg>

            <!-- Moon icon (right) -->
            <svg class="w-3.5 h-3.5 text-[var(--color-text-tertiary)] z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>

            <!-- Slider -->
            <div
              class="absolute top-1 w-6 h-6 bg-[var(--color-fill-surfacebright)] border border-[var(--color-border-translucent)] shadow-[var(--shadow-l1)] transition-all duration-200 ease-in-out"
              style="border-radius: var(--radius-s-8);"
              :class="theme === 'light' ? 'left-1' : 'left-[28px]'"
            />
          </button>
        </div>
      </header>

      <!-- Gradient mask from top (100px height, linear blur) -->
      <div class="fixed top-0 left-0 right-0 h-[100px] z-20 pointer-events-none" style="background: linear-gradient(to bottom, var(--color-fill-surface-desktop), transparent);" />

      <!-- Content area: Sidebar + Main (with top padding to avoid header) -->
      <div class="pt-36 flex gap-16">
        <!-- Sidebar (240px, fixed) -->
        <aside class="fixed top-36 bottom-0 w-60 overflow-y-auto">
          <nav class="flex flex-col gap-8">
            <div v-for="section in nav" :key="section.group" class="flex flex-col gap-3">
              <p class="pl-2 font-bold" style="font-size: var(--typo-interface-desktop-subhead-subhead-small-size); line-height: var(--typo-interface-desktop-subhead-subhead-small-lh); letter-spacing: var(--typo-interface-desktop-subhead-subhead-small-ls);">
                {{ section.group }}
              </p>
              <ul class="flex flex-col gap-1">
                <li v-for="item in section.items" :key="item.to">
                  <NuxtLink
                    :to="item.to"
                    class="flex items-center h-8 px-2 py-1 rounded-lg text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-mask-overlays)]"
                    style="font-size: var(--typo-interface-desktop-body-body-large-size); line-height: var(--typo-interface-desktop-body-body-large-lh); letter-spacing: var(--typo-interface-desktop-body-body-large-ls);"
                    active-class="bg-[var(--color-mask-overlaym)]"
                  >
                    {{ item.label }}
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        <!-- Spacer for fixed sidebar -->
        <div class="w-60 shrink-0" />

        <!-- Main content (816px width, always fills max width) -->
        <main class="w-[816px] shrink-0 pb-20">
          <slot />
        </main>
      </div>
    </div>

    <!-- Mobile layout -->
    <div class="flex lg:hidden flex-col min-h-[calc(100vh-56px)]">
      <!-- Sidebar overlay -->
      <Transition
        enter-active-class="transition-opacity duration-200"
        leave-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="sidebarOpen"
          class="fixed inset-0 bg-black/50 z-40"
          @click="sidebarOpen = false"
        />
      </Transition>

      <!-- Sidebar -->
      <aside
        class="fixed top-0 left-0 bottom-0 w-60 flex flex-col bg-[var(--color-fill-surface-desktop)] z-50 transform transition-transform duration-200"
        :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
      >
        <!-- Mobile header inside sidebar -->
        <div class="h-14 flex items-center justify-between px-5 border-b border-[var(--color-border-translucent)]">
          <NuxtLink to="/" class="text-sm font-semibold tracking-tight" @click="sidebarOpen = false">
            Xmind UI Kit
          </NuxtLink>
          <button
            @click="sidebarOpen = false"
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--color-fill-secondary)] transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Nav -->
        <nav class="flex-1 overflow-y-auto p-5">
          <div class="flex flex-col gap-8">
            <div v-for="section in nav" :key="section.group" class="flex flex-col gap-3">
              <p class="pl-2 font-bold" style="font-size: var(--typo-interface-desktop-subhead-subhead-small-size); line-height: var(--typo-interface-desktop-subhead-subhead-small-lh); letter-spacing: var(--typo-interface-desktop-subhead-subhead-small-ls);">
                {{ section.group }}
              </p>
              <ul class="flex flex-col gap-1">
                <li v-for="item in section.items" :key="item.to">
                  <NuxtLink
                    :to="item.to"
                    class="flex items-center h-8 px-2 py-1 rounded-lg text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-mask-overlays)]"
                    style="font-size: var(--typo-interface-desktop-body-body-large-size); line-height: var(--typo-interface-desktop-body-body-large-lh); letter-spacing: var(--typo-interface-desktop-body-body-large-ls);"
                    active-class="bg-[var(--color-mask-overlaym)]"
                  >
                    {{ item.label }}
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </aside>

      <!-- Main content -->
      <main class="flex-1 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
