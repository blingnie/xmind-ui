<template>
  <div class="doc-page-layout">
    <!-- Main Content -->
    <div class="doc-page-content">
      <h1 class="text-xl">Getting Started</h1>
      <p class="text-sm text-[var(--color-text-tertiary)]" style="margin-bottom: 0;">Xmind Design System is Xmind's internal design system — a collection of production-ready Vue 3 components built with Design Tokens for consistent styling across light and dark themes. Primarily designed for Xmind desktop application projects.</p>

      <!-- Figma Link -->
      <PlatformLink
        href="https://www.figma.com/design/SbtmOZIYx5KVJZ3xuSOkaY/Xmind-UI-Components-2.0?node-id=0-1&t=F8uGcaioymYlseop-1"
        label="Figma"
        :icon="FigmaIcon"
      />

      <!-- Quick Links -->
      <section class="doc-section">
        <div class="quick-links-grid">
          <NuxtLink
            to="/tokens/colors"
            class="quick-link-card"
          >
            <h3 class="quick-link-card__title">Foundation</h3>
            <p class="quick-link-card__description">Design tokens for colors, typography, spacing, and radii</p>
          </NuxtLink>
          <NuxtLink
            to="/components/button"
            class="quick-link-card"
          >
            <h3 class="quick-link-card__title">Components</h3>
            <p class="quick-link-card__description">Reusable UI components for desktop applications</p>
          </NuxtLink>
        </div>
      </section>

      <!-- Before You Start -->
      <section id="before-you-start" class="doc-section">
        <h2 id="before-you-start">Before you start</h2>
        <p class="section-description">Make sure your project meets the following requirements:</p>

        <ul class="requirements-list">
          <li><strong>Vue 3</strong> (3.4 or later)</li>
          <li><strong>Tailwind CSS</strong> (v4.0 or later)</li>
          <li><strong>Desktop application context</strong> — components are optimized for desktop UI patterns and interactions</li>
          <li>Access to the <a href="https://github.com/blingnie/xmind-ui" class="text-link" target="_blank" rel="noopener">xmind-ui repository</a></li>
        </ul>

        <p class="token-note">
          Xmind Design System is built around a custom Design Token system. All component styles rely on CSS variables defined in <code>tokens.css</code>. <strong>You must import this file in your project entry for components to render correctly.</strong>
        </p>
      </section>

      <!-- Desktop-specific guidelines -->
      <section id="desktop-guidelines" class="doc-section">
        <h2 id="desktop-guidelines">Desktop-specific guidelines</h2>
        <p class="section-description">Components in Xmind Design System follow desktop UI conventions:</p>

        <ul class="requirements-list">
          <li><strong>Typography</strong> uses <code>Interface Desktop</code> token set — optimized for screen reading at standard desktop resolutions</li>
          <li><strong>Spacing</strong> is calibrated for mouse and keyboard interaction, not touch</li>
          <li><strong>Component sizes</strong> default to desktop-appropriate dimensions (e.g. Button medium is 32px height)</li>
          <li><strong>Hover and active states</strong> are designed for cursor-based interactions</li>
        </ul>

        <p class="token-note">
          For mobile or responsive contexts, components may need adaptation.
        </p>
      </section>

      <!-- NeverMind UI font -->
      <section id="nevermind-font" class="doc-section">
        <h2 id="nevermind-font">NeverMind UI font</h2>
        <p class="section-description">Xmind Design System is designed with the NeverMind UI typeface. If your project uses it, set the font variable in your CSS:</p>

        <SimpleCodeBlock
          :code="fontCode"
          language="css"
          height="100px"
        />
      </section>

      <!-- Installation -->
      <section id="installation" class="doc-section">
        <h2 id="installation">Installation</h2>
        <p class="section-description">Install Xmind UI from Git repository for cross-project usage.</p>

        <div class="example-block">
          <h3 id="basic-installation">Basic Installation</h3>
          <SimpleCodeBlock
            :code="installCode"
            language="bash"
            height="150px"
          />
        </div>

        <div class="example-block">
          <h3 id="specify-version">Specify Version</h3>
          <SimpleCodeBlock
            :code="versionCode"
            language="bash"
            height="150px"
          />
        </div>

        <div class="example-block">
          <h3 id="project-structure">Project Structure</h3>
          <SimpleCodeBlock
            :code="structureCode"
            language="bash"
            height="180px"
          />
        </div>
      </section>

      <!-- Import -->
      <section id="import" class="doc-section">
        <h2 id="import">Import</h2>

        <!-- Import Components -->
        <div class="example-block">
          <h3 id="import-components">Import Components</h3>
          <p class="section-description">Import components and types by package name.</p>

          <SimpleCodeBlock
            :code="componentImportCode"
            language="vue"
            height="220px"
          />
        </div>

        <!-- Import Tokens -->
        <div class="example-block">
          <h3 id="import-tokens">Import Design Tokens</h3>
          <p class="section-description">Import tokens.css in your entry file to ensure all component styles work correctly.</p>

          <SimpleCodeBlock
            :code="tokensImportCode"
            language="typescript"
            height="80px"
          />
        </div>
      </section>

      <!-- Using in Host Projects -->
      <section id="host-project-integration" class="doc-section">
        <h2 id="host-project-integration">Using in Host Projects</h2>
        <p class="section-description">If you're integrating Xmind UI components into an existing project, a one-time token mapping file is required to bridge the design system's CSS variables with your project's token system.</p>

        <div class="example-block">
          <h3 id="token-mapping">Token Mapping</h3>
          <p class="section-description">Create a mapping CSS file in your project that maps Xmind UI's CSS variables to your local Tailwind theme tokens. This only needs to be done once — no component code changes are required.</p>
          <SimpleCodeBlock
            :code="tokenMappingCode"
            language="css"
            height="180px"
          />
        </div>

        <div class="example-block">
          <h3 id="dark-mode-compat">Dark Mode Compatibility</h3>
          <p class="section-description">Xmind UI uses <code>data-theme="dark"</code> to switch CSS variables. If your project uses Tailwind's <code>.dark</code> class instead, support both in the mapping file — component code stays unchanged.</p>
          <SimpleCodeBlock
            :code="darkModeCompatCode"
            language="css"
            height="200px"
          />
        </div>

        <div class="note-block note-block--warning">
          <h4><span class="icon icon--warning" v-html="TriangleIcon"></span>Token Semantic Mismatch</h4>
          <ul class="requirements-list">
            <li>Verify that token semantics align before mapping — e.g. <code>--color-text-primary</code> in Xmind UI may not match the same name in your project under dark mode</li>
            <li>Spacing and radius token names may differ — map them explicitly (e.g. <code>--spacing-size-l-16</code> → <code>spacing.4</code>)</li>
            <li>When in doubt, check the token reference tables in the <NuxtLink to="/tokens/colors" class="text-link">Colors</NuxtLink> and <NuxtLink to="/tokens/spacing" class="text-link">Spacing</NuxtLink> pages</li>
          </ul>
        </div>
      </section>

      <!-- Design Tokens -->
      <section id="tokens" class="doc-section">
        <h2 id="tokens">Using Design Tokens</h2>
        <p class="section-description">All component styles are based on Design Tokens to ensure visual consistency and theme switching. <strong>Never hardcode colors, spacing, or other values. Always use CSS variables.</strong></p>

        <div class="example-block">
          <h3 id="use-tokens">Use Tokens in Custom Styles</h3>

          <div class="example-card">
            <div class="example-card__label example-card__label--good">
              <span class="icon icon--success" v-html="SuccessCircularIcon"></span>
              Correct Example
            </div>
            <div class="example-card__code">
              <SimpleCodeBlock
                :code="correctTokensCode"
                language="vue"
                height="200px"
              />
            </div>
          </div>

          <div class="example-card">
            <div class="example-card__label example-card__label--bad">
              <span class="icon icon--error" v-html="ErrorCircularIcon"></span>
              Wrong Example
            </div>
            <div class="example-card__code">
              <SimpleCodeBlock
                :code="wrongTokensCode"
                language="vue"
                height="220px"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Token Reference -->
      <section id="token-reference" class="doc-section">
        <h2 id="token-reference">Common Tokens Reference</h2>

        <div v-if="colorTokens.length > 0">
          <h3 id="color-tokens">Color Tokens</h3>
          <div class="token-table-wrapper">
            <table class="token-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Reference (Light)</th>
                  <th>Reference (Dark)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="token in colorTokens" :key="token.name">
                  <td><code>{{ token.name }}</code></td>
                  <td><code>{{ token.lightRef }}</code></td>
                  <td><code>{{ token.darkRef }}</code></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="spacingTokens.length > 0">
          <h3 id="spacing-tokens">Spacing Tokens</h3>
          <div class="token-table-wrapper">
            <table class="token-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="token in spacingTokens" :key="token.name">
                  <td><code>{{ token.name }}</code></td>
                  <td>{{ token.value }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="radiusTokens.length > 0">
          <h3 id="radius-tokens">Radius Tokens</h3>
          <div class="token-table-wrapper">
            <table class="token-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="token in radiusTokens" :key="token.name">
                  <td><code>{{ token.name }}</code></td>
                  <td>{{ token.value }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <p class="token-reference-note">
          For complete token lists, see
          <NuxtLink to="/tokens/colors" class="text-link">Colors</NuxtLink>,
          <NuxtLink to="/tokens/spacing" class="text-link">Spacing</NuxtLink>,
          <NuxtLink to="/tokens/radius" class="text-link">Radius</NuxtLink> documentation pages.
        </p>
      </section>

      <!-- Troubleshooting -->
      <section id="troubleshooting" class="doc-section">
        <h2 id="troubleshooting">Troubleshooting</h2>

        <div class="example-block">
          <h3 id="tokens-not-working">Tokens Not Working</h3>
          <p class="section-description">If Design Tokens are not applied correctly, check the following:</p>
          <ul class="troubleshoot-list">
            <li><span class="icon icon--success" v-html="CheckmarkCircleFillIcon"></span>Ensure <code>@xmind-ui/tokens/dist/tokens.css</code> is imported in your entry file</li>
            <li><span class="icon icon--success" v-html="CheckmarkCircleFillIcon"></span>Check browser DevTools to verify CSS variables are loaded</li>
            <li><span class="icon icon--success" v-html="CheckmarkCircleFillIcon"></span>Verify the import path matches your project structure</li>
          </ul>
        </div>

        <div class="example-block">
          <h3 id="component-styles-broken">Component Styles Broken</h3>
          <p class="section-description">If component styles appear broken or unstyled:</p>
          <ul class="troubleshoot-list">
            <li><span class="icon icon--success" v-html="CheckmarkCircleFillIcon"></span>Ensure your project has Vue 3 installed (<code>npm list vue</code>)</li>
            <li><span class="icon icon--success" v-html="CheckmarkCircleFillIcon"></span>Check if your bundler (Vite/Webpack) is configured to process .vue files</li>
            <li><span class="icon icon--success" v-html="CheckmarkCircleFillIcon"></span>Verify tokens.css is imported before any component usage</li>
          </ul>
        </div>

        <div class="example-block">
          <h3 id="dark-mode-not-switching">Dark Mode Not Switching</h3>
          <p class="section-description">If dark mode toggle doesn't work:</p>
          <ul class="troubleshoot-list">
            <li><span class="icon icon--success" v-html="CheckmarkCircleFillIcon"></span>Ensure <code>data-theme="dark"</code> attribute is set on <code>&lt;html&gt;</code> or <code>&lt;body&gt;</code></li>
            <li><span class="icon icon--success" v-html="CheckmarkCircleFillIcon"></span>Check theme toggle implementation updates this attribute correctly</li>
            <li><span class="icon icon--success" v-html="CheckmarkCircleFillIcon"></span>Verify tokens.css contains both light and dark theme definitions</li>
          </ul>
        </div>
      </section>

      <!-- Notes -->
      <section id="notes" class="doc-section">
        <h2 id="notes">Important Notes</h2>

        <div class="note-block note-block--warning">
          <h4><span class="icon icon--warning" v-html="TriangleIcon"></span>Style Guidelines</h4>
          <ul class="requirements-list">
            <li>All colors, spacing, and radius must use Design Tokens</li>
            <li>Never hardcode any style values</li>
            <li>Never use Tailwind built-in color classes (e.g., <code>bg-gray-500</code>, <code>text-zinc-700</code>)</li>
            <li>Always check <code>packages/tokens/dist/tokens.css</code> before using tokens</li>
          </ul>
        </div>

        <div class="note-block note-block--info">
          <h4><span class="icon icon--brand" v-html="InformationFillIcon"></span>Development Tips</h4>
          <ul class="requirements-list">
            <li>Prefer using existing components to avoid duplication</li>
            <li>New components must follow design specifications and token system</li>
            <li>Ensure components work correctly in both light mode and dark mode</li>
            <li>Add complete TypeScript types for all components</li>
          </ul>
        </div>
      </section>
    </div>

    <!-- Table of Contents -->
    <DocTableOfContents :items="tocItems" class="hidden xl:block" />
  </div>
</template>

<script setup lang="ts">
import { Button } from '@xmind-ui/components'
import DocTableOfContents from '~/components/DocTableOfContents.vue'
import SimpleCodeBlock from '~/components/SimpleCodeBlock.vue'
import PlatformLink from '~/components/PlatformLink.vue'
import { useTokens } from '~/composables/useTokens'
import SuccessCircularIcon from '~/components/icon/fw-icons/success-circular.svg?raw'
import CheckmarkCircleFillIcon from '~/components/icon/fw-icons/checkmark-circle-fill.svg?raw'
import ErrorCircularIcon from '~/components/icon/fw-icons/error-circular.svg?raw'
import TriangleIcon from '~/components/icon/fw-icons/triangle.svg?raw'
import InformationFillIcon from '~/components/icon/fw-icons/information-fill.svg?raw'

// Figma icon
const FigmaIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M6.66667 18.3334C8.13943 18.3334 9.33333 17.1395 9.33333 15.6667V13.0001H6.66667C5.19391 13.0001 4 14.194 4 15.6667C4 17.1395 5.19391 18.3334 6.66667 18.3334Z" fill="#0ACF83"/>
  <path d="M4 10.0001C4 8.52728 5.19391 7.33337 6.66667 7.33337H9.33333V12.6667H6.66667C5.19391 12.6667 4 11.4728 4 10.0001Z" fill="#A259FF"/>
  <path d="M4.00001 4.66671C4.00001 3.19395 5.19392 2.00004 6.66668 2.00004H9.33334V7.33337H6.66668C5.19392 7.33337 4.00001 6.13947 4.00001 4.66671Z" fill="#F24E1E"/>
  <path d="M9.33334 2.00004H12C13.4728 2.00004 14.6667 3.19395 14.6667 4.66671C14.6667 6.13947 13.4728 7.33337 12 7.33337H9.33334V2.00004Z" fill="#FF7262"/>
  <path d="M14.6667 10.0001C14.6667 11.4728 13.4728 12.6667 12 12.6667C10.5272 12.6667 9.33334 11.4728 9.33334 10.0001C9.33334 8.52728 10.5272 7.33337 12 7.33337C13.4728 7.33337 14.6667 8.52728 14.6667 10.0001Z" fill="#1ABCFE"/>
</svg>`

definePageMeta({ layout: 'default' })

const { getAliasTokens, getSpacingTokens, getRadiusTokens } = useTokens()

// Get tokens
const aliasLight = getAliasTokens('Light')
const aliasDark = getAliasTokens('Dark')
const allSpacing = getSpacingTokens()
const allRadius = getRadiusTokens()

// Filter tokens for display
const colorTokens = computed(() => {
  const commonColors = [
    'text/primary',
    'text/secondary',
    'bg/primary',
    'bg/secondary',
    'border/default',
    'fill/brand'
  ]

  return commonColors.map(name => {
    const lightToken = aliasLight.find(t => t.name === name)
    const darkToken = aliasDark.find(t => t.name === name)
    return {
      name: lightToken?.varName || `--color-${name.replace(/\//g, '-')}`,
      light: lightToken?.rawValue || 'N/A',
      dark: darkToken?.rawValue || 'N/A',
      lightRef: lightToken?.refVar || 'N/A',
      darkRef: darkToken?.refVar || 'N/A'
    }
  }).filter(t => t.light !== 'N/A')
})

const spacingTokens = computed(() => {
  const commonSpacing = ['padding/xs 4', 'padding/s 8', 'padding/m 12', 'padding/l 16', 'padding/xl 20']
  return allSpacing
    .filter(t => commonSpacing.some(s => t.name.includes(s.split(' ')[0])))
    .slice(0, 5)
    .map(t => ({
      name: t.varName,
      value: `${t.value}px`
    }))
})

const radiusTokens = computed(() => {
  const commonRadius = ['xs 6', 'm 12', 'l 16', 'xl 24']
  return allRadius
    .filter(t => commonRadius.some(r => t.name.includes(r.split(' ')[0])))
    .slice(0, 4)
    .map(t => ({
      name: t.varName,
      value: `${t.value}px`
    }))
})

const tocItems = ref([
  { id: 'before-you-start', text: 'Before you start', level: 2 },
  { id: 'desktop-guidelines', text: 'Desktop-specific guidelines', level: 2 },
  { id: 'nevermind-font', text: 'NeverMind UI font', level: 2 },
  { id: 'installation', text: 'Installation', level: 2 },
  { id: 'basic-installation', text: 'Basic Installation', level: 3 },
  { id: 'specify-version', text: 'Specify Version', level: 3 },
  { id: 'project-structure', text: 'Project Structure', level: 3 },
  { id: 'import', text: 'Import', level: 2 },
  { id: 'import-components', text: 'Import Components', level: 3 },
  { id: 'import-tokens', text: 'Import Design Tokens', level: 3 },
  { id: 'host-project-integration', text: 'Using in Host Projects', level: 2 },
  { id: 'token-mapping', text: 'Token Mapping', level: 3 },
  { id: 'dark-mode-compat', text: 'Dark Mode Compatibility', level: 3 },
  { id: 'tokens', text: 'Using Design Tokens', level: 2 },
  { id: 'use-tokens', text: 'Use Tokens in Custom Styles', level: 3 },
  { id: 'token-reference', text: 'Common Tokens Reference', level: 2 },
  { id: 'color-tokens', text: 'Color Tokens', level: 3 },
  { id: 'spacing-tokens', text: 'Spacing Tokens', level: 3 },
  { id: 'radius-tokens', text: 'Radius Tokens', level: 3 },
  { id: 'troubleshooting', text: 'Troubleshooting', level: 2 },
  { id: 'tokens-not-working', text: 'Tokens Not Working', level: 3 },
  { id: 'component-styles-broken', text: 'Component Styles Broken', level: 3 },
  { id: 'dark-mode-not-switching', text: 'Dark Mode Not Switching', level: 3 },
  { id: 'notes', text: 'Important Notes', level: 2 },
])

const installCode = `# Using pnpm (recommended)
pnpm add git+https://github.com/blingnie/xmind-ui.git

# Using npm
npm install git+https://github.com/blingnie/xmind-ui.git

# Using yarn
yarn add git+https://github.com/blingnie/xmind-ui.git`

const versionCode = `# Specify tag version
pnpm add git+https://github.com/blingnie/xmind-ui.git#v0.1.0

# Specify branch
pnpm add git+https://github.com/blingnie/xmind-ui.git#main

# Specify commit
pnpm add git+https://github.com/blingnie/xmind-ui.git#abc1234`

const structureCode = `xmind-ui/
├── packages/
│   ├── components/          # Component library @xmind-ui/components
│   │   ├── Button/
│   │   │   └── Button.vue
│   │   └── index.ts        # Unified exports
│   └── tokens/             # Design tokens @xmind-ui/tokens
│       └── dist/tokens.css
└── docs/                   # Documentation site`

const componentImportCode = `<script setup>
// Import component
import { Button } from '@xmind-ui/components'

// Import types
import type { ButtonVariant, ButtonSize } from '@xmind-ui/components'
<\/script>

<template>
  <Button variant="secondary" size="medium">
    Click me
  </Button>
<\/template>`

const tokensImportCode = `// main.ts or app.vue
import '@xmind-ui/tokens/dist/tokens.css'`

const tokenMappingCode = `/* xmind-ui-token-bridge.css — add to your project entry */
:root {
  --color-text-primary: theme('colors.grey.900');
  --color-text-secondary: theme('colors.grey.700');
  --color-icon-quaternary: theme('colors.grey.400');
  /* ... map remaining tokens */
}`

const darkModeCompatCode = `/* Support both switching mechanisms in the same file */

/* Xmind UI's method */
[data-theme="dark"] {
  --color-text-primary: theme('colors.grey.100');
  --color-bg-primary: theme('colors.grey.900');
}

/* Tailwind dark: prefix method */
.dark {
  --color-text-primary: theme('colors.grey.100');
  --color-bg-primary: theme('colors.grey.900');
}`

const fontCode = `@theme {
  --font-family-base: 'NeverMind UI', system-ui, sans-serif;
}`

const correctTokensCode = `<style scoped>
.my-component {
  color: var(--color-text-primary);
  background: var(--color-bg-primary);
  padding: var(--spacing-padding-m-12);
  border-radius: var(--radius-m-12);
  border: 1px solid var(--color-border-default);
}

.my-component:hover {
  background: var(--color-bg-secondary);
}
<\/style>`

const wrongTokensCode = `<style scoped>
.my-component {
  color: #333333;              /* ❌ Hardcoded color */
  background: rgb(255,255,255); /* ❌ Hardcoded color */
  padding: 12px;                /* ❌ Hardcoded spacing */
  border-radius: 8px;           /* ❌ Hardcoded radius */
}

/* ❌ Using Tailwind built-in colors */
.text-gray-500 { }
.bg-zinc-700 { }
<\/style>`
</script>

<style scoped>
/* ========== Quick Links ========== */
.quick-links-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-size-m-16);
  margin-bottom: var(--spacing-margin-margin-xxxl-48);
}

.quick-link-card {
  padding: var(--spacing-padding-l-16);
  border-radius: var(--radius-l-16);
  border: 1px solid var(--color-border-translucent);
  background: var(--color-fill-surfacebright);
  text-decoration: none;
  transition: box-shadow 150ms ease;
}

.quick-link-card:hover {
  box-shadow: var(--elevation-l2);
}

.quick-link-card__title {
  margin: 0 0 var(--spacing-margin-margin-xs-4) 0;
  font-size: var(--typo-interface-desktop-subhead-subhead-small-size);
  line-height: var(--typo-interface-desktop-subhead-subhead-small-lh);
  font-weight: var(--typo-interface-desktop-subhead-subhead-small-weight);
  letter-spacing: var(--typo-interface-desktop-subhead-subhead-small-ls);
  color: var(--color-text-primary);
}

.quick-link-card__description {
  margin: 0;
  font-size: var(--typo-interface-desktop-body-body-small-size);
  line-height: var(--typo-interface-desktop-body-body-small-lh);
  font-weight: var(--typo-interface-desktop-body-body-small-weight);
  letter-spacing: var(--typo-interface-desktop-body-body-small-ls);
  color: var(--color-text-tertiary);
}

/* ========== Introduction ========== */
.intro-paragraph {
  margin: 0;
  font-size: var(--typo-markdown-paragraph-default-size);
  line-height: var(--typo-markdown-paragraph-default-lh);
  font-weight: var(--typo-markdown-paragraph-default-weight);
  letter-spacing: var(--typo-markdown-paragraph-default-ls);
  color: var(--color-text-secondary);
}

/* ========== Requirements List ========== */
.requirements-list {
  margin: 0 0 var(--spacing-margin-margin-l-24) 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-padding-xs-4);
}

.requirements-list li {
  position: relative;
  padding-left: calc(20px + var(--spacing-padding-xs-4));
  min-height: 26px;
  font-size: var(--typo-markdown-paragraph-default-size);
  line-height: var(--typo-markdown-paragraph-default-lh);
  font-weight: var(--typo-markdown-paragraph-default-weight);
  letter-spacing: var(--typo-markdown-paragraph-default-ls);
  color: var(--color-text-primary);
}

.requirements-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 20px;
  height: 26px;
  background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='2' fill='%23666666'/%3E%3C/svg%3E");
  background-size: 20px 20px;
  background-repeat: no-repeat;
  background-position: center;
}

.token-note {
  margin: 0;
  padding: var(--spacing-padding-l-16);
  background: var(--color-mask-overlays);
  border-radius: var(--radius-m-12);
  font-size: var(--typo-markdown-paragraph-default-size);
  line-height: var(--typo-markdown-paragraph-default-lh);
  font-weight: var(--typo-markdown-paragraph-default-weight);
  letter-spacing: var(--typo-markdown-paragraph-default-ls);
  color: var(--color-text-secondary);
}

.section-description {
  margin-bottom: var(--spacing-margin-margin-m-16);
  font-size: var(--typo-markdown-paragraph-default-size);
  line-height: var(--typo-markdown-paragraph-default-lh);
  font-weight: var(--typo-markdown-paragraph-default-weight);
  letter-spacing: var(--typo-markdown-paragraph-default-ls);
  color: var(--color-text-secondary);
}

.token-reference-note {
  margin-top: var(--spacing-margin-margin-m-16);
  font-size: var(--typo-markdown-paragraph-default-size);
  line-height: var(--typo-markdown-paragraph-default-lh);
  font-weight: var(--typo-markdown-paragraph-default-weight);
  letter-spacing: var(--typo-markdown-paragraph-default-ls);
  color: var(--color-text-secondary);
}

/* ========== Example Cards ========== */
.example-card {
  border-radius: var(--radius-l-16);
  border: 1px solid var(--color-border-translucent);
  background: var(--color-fill-surfacebright);
  overflow: hidden;
  margin-bottom: var(--spacing-margin-margin-l-24);
}

.example-card__label {
  display: flex;
  align-items: center;
  padding: var(--spacing-padding-m-12) var(--spacing-padding-l-16);
  font-size: var(--typo-interface-desktop-subhead-subhead-mini-size);
  line-height: var(--typo-interface-desktop-subhead-subhead-mini-lh);
  font-weight: var(--typo-interface-desktop-subhead-subhead-mini-weight);
  letter-spacing: var(--typo-interface-desktop-subhead-subhead-mini-ls);
  border-bottom: 1px solid var(--color-border-translucent);
}

.example-card__label--good {
  background: color-mix(in srgb, var(--color-fill-success-normal) 10%, transparent);
  color: var(--color-text-primary);
}

.example-card__label--bad {
  background: color-mix(in srgb, var(--color-fill-error-normal) 10%, transparent);
  color: var(--color-text-primary);
}

.example-card__code {
  padding: var(--spacing-padding-m-12);
}

/* ========== SimpleCodeBlock Overrides ========== */
.example-block :deep(.simple-code-block) {
  overflow: auto !important;
}

.example-block :deep(.simple-code-block pre) {
  overflow: auto !important;
  white-space: pre !important;
  word-break: normal !important;
}

.example-card :deep(.simple-code-block) {
  overflow: auto !important;
}

.example-card :deep(.simple-code-block pre) {
  overflow: auto !important;
  white-space: pre !important;
  word-break: normal !important;
}

/* ========== Token Tables ========== */
.token-table-wrapper {
  margin-bottom: var(--spacing-margin-margin-xl-32);
  border: 1px solid var(--color-border-translucent);
  border-radius: var(--radius-l-16);
  overflow: hidden;
}

.token-table {
  width: 100%;
  border-collapse: collapse;
  margin: 0;
}

.token-table thead {
  background: var(--color-fill-surfacebright);
}

.token-table th {
  padding: var(--spacing-padding-m-12) var(--spacing-padding-l-16);
  text-align: left;
  font-size: var(--typo-interface-desktop-body-body-small-size);
  line-height: var(--typo-interface-desktop-body-body-small-lh);
  font-weight: var(--typo-interface-desktop-body-body-small-weight);
  letter-spacing: var(--typo-interface-desktop-body-body-small-ls);
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border-translucent);
}

.token-table td {
  padding: var(--spacing-padding-m-12) var(--spacing-padding-l-16);
  font-size: var(--typo-interface-desktop-body-body-medium-size);
  line-height: var(--typo-interface-desktop-body-body-medium-lh);
  font-weight: var(--typo-interface-desktop-body-body-medium-weight);
  letter-spacing: var(--typo-interface-desktop-body-body-medium-ls);
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border-translucent);
}

.token-table tr:last-child td {
  border-bottom: none;
}

/* ========== Troubleshooting Lists ========== */
.troubleshoot-list {
  margin: 0;
  padding: var(--spacing-padding-l-16);
  background: var(--color-mask-overlays);
  border-radius: var(--radius-l-16);
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-padding-xs-4);
}

.troubleshoot-list li {
  display: block;
  padding-left: calc(16px + var(--spacing-padding-xs-4));
  text-indent: calc(-16px - var(--spacing-padding-xs-4));
  min-height: 26px;
  font-size: var(--typo-markdown-paragraph-default-size);
  line-height: var(--typo-markdown-paragraph-default-lh);
  font-weight: var(--typo-markdown-paragraph-default-weight);
  letter-spacing: var(--typo-markdown-paragraph-default-ls);
  color: var(--color-text-primary);
}

.troubleshoot-list li .icon {
  display: inline-block;
  vertical-align: middle;
}

/* ========== Note Blocks ========== */
.note-block {
  padding: var(--spacing-padding-xl-20);
  border-radius: var(--radius-l-16);
  margin-bottom: var(--spacing-margin-margin-l-24);
}

.note-block--warning {
  background: color-mix(in srgb, var(--color-fill-warning-normal) 10%, transparent);
}

.note-block--info {
  background: color-mix(in srgb, var(--palette-teal-400) 10%, transparent);
}

.note-block h4 {
  display: flex;
  align-items: center;
  margin: 0 0 var(--spacing-margin-margin-m-16) 0;
  font-size: var(--typo-interface-desktop-subhead-subhead-mini-size);
  line-height: var(--typo-interface-desktop-subhead-subhead-mini-lh);
  font-weight: var(--typo-interface-desktop-subhead-subhead-mini-weight);
  letter-spacing: var(--typo-interface-desktop-subhead-subhead-mini-ls);
  color: var(--color-text-primary);
}

.note-block ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-padding-xs-4);
}

.note-block li {
  position: relative;
  padding-left: calc(20px + var(--spacing-padding-xs-4));
  min-height: 26px;
  font-size: var(--typo-markdown-paragraph-default-size);
  line-height: var(--typo-markdown-paragraph-default-lh);
  font-weight: var(--typo-markdown-paragraph-default-weight);
  letter-spacing: var(--typo-markdown-paragraph-default-ls);
  color: var(--color-text-primary);
}

.note-block li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 20px;
  height: 26px;
  background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='2' fill='%23666666'/%3E%3C/svg%3E");
  background-size: 20px 20px;
  background-repeat: no-repeat;
  background-position: center;
}

/* ========== Icons ========== */
.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-right: var(--spacing-padding-xs-4);
  flex-shrink: 0;
  vertical-align: middle;
}

.icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.icon--success {
  color: var(--color-fill-success-normal);
}

.icon--error {
  color: var(--color-fill-error-normal);
}

.icon--warning {
  color: var(--color-fill-warning-normal);
}

.icon--brand {
  color: var(--palette-base-teal);
}
</style>
