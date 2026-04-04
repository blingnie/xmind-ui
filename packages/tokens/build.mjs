import { readFileSync, writeFileSync, mkdirSync } from 'fs'

const data = JSON.parse(readFileSync('./foundation.json', 'utf-8'))
const variablesData = JSON.parse(readFileSync('./component.json', 'utf-8'))
const elevationData = JSON.parse(readFileSync('./elevation.json', 'utf-8'))

function nameToVar(name) {
  return name.replace(/\//g, '-').replace(/ /g, '-').replace(/_/g, '-').toLowerCase()
}

function stripPrefix(name, prefix) {
  return name.startsWith(prefix + '/') ? name.slice(prefix.length + 1) : name
}

// Create a lookup map for foundation tokens to their collection names
const foundationTokenMap = new Map()
for (const collection of data.collections) {
  const collectionName = collection.name.toLowerCase()
  for (const mode of collection.modes) {
    for (const variable of mode.variables) {
      foundationTokenMap.set(variable.name, collectionName)
    }
  }
}

const linesRoot = []
const linesLight = []
const linesDark = []

// Add base font-family (extracted from typography tokens)
// All typography tokens use the same font family, so set it globally
let baseFontFamily = null

// ── 1. Color Palette（原始色板，作为所有颜色的基础）──
const paletteCol = data.collections.find(c => c.name === 'colorPalette')
const paletteMap = new Map()
for (const v of paletteCol.modes[0].variables) {
  if (!v.isAlias) {
    linesRoot.push(`  --palette-${nameToVar(v.name)}: ${v.value};`)
    paletteMap.set(v.name, v.value)
  }
}

// ── 1.5. Base Colors（基础颜色 alias）──
for (const v of paletteCol.modes[0].variables) {
  if (v.isAlias && v.name.startsWith('base/')) {
    const targetName = v.value.name
    const varName = `--palette-${nameToVar(v.name)}`
    const refVar = `var(--palette-${nameToVar(targetName)})`
    linesRoot.push(`  ${varName}: ${refVar};`)
  }
}

// ── 2. Spacing ──
const spacingCol = data.collections.find(c => c.name === 'spacing')
for (const v of spacingCol.modes[0].variables) {
  linesRoot.push(`  --spacing-${nameToVar(v.name)}: ${v.value}px;`)
}

// ── 3. Radius ──
const radiusCol = data.collections.find(c => c.name === 'radius')
for (const v of radiusCol.modes[0].variables) {
  linesRoot.push(`  --radius-${nameToVar(v.name)}: ${v.value}px;`)
}

// ── 3.5. Padding Aliases (for backward compatibility with component.json references) ──
// component.json references tokens like "padding/xl-20" but we generate "spacing/padding/xl-20"
// Create aliases so both work
for (const v of spacingCol.modes[0].variables) {
  if (v.name.startsWith('padding/')) {
    const shortName = v.name.replace('padding/', '')
    linesRoot.push(`  --padding-${nameToVar(shortName)}: var(--spacing-padding-${nameToVar(shortName)});`)
  }
}

// ── 4. Typography ──
const typoCol = data.collections.find(c => c.name === 'Typography')
for (const v of typoCol.modes[0].variables) {
  const t = v.value
  const base = `--typo-${nameToVar(v.name)}`
  const lhUnit = t.lineHeightUnit === 'PIXELS' ? 'px' : '%'

  // Extract base font-family (first occurrence)
  if (!baseFontFamily && t.fontFamily) {
    baseFontFamily = t.fontFamily
  }

  // Convert letter-spacing: PERCENT means percentage of font-size, convert to em
  // e.g., 2% = 0.02em
  const ls = t.letterSpacingUnit === 'PERCENT'
    ? `${t.letterSpacing / 100}em`
    : `${t.letterSpacing}px`

  // Map font weight names to numeric values
  const weightMap = {
    'Thin': '100',
    'ExtraLight': '200',
    'Light': '300',
    'Regular': '400',
    'Retina': '400',
    'Medium': '500',
    'SemiBold': '600',
    'DemiBold': '600',
    'Bold': '700',
    'ExtraBold': '800',
    'Black': '900'
  }
  const weight = weightMap[t.fontWeight] || t.fontWeight || '400'

  // Don't generate individual font-family tokens since all use the same base font
  // linesRoot.push(`  ${base}-family: ${t.fontFamily};`)
  linesRoot.push(`  ${base}-size: ${t.fontSize}px;`)
  linesRoot.push(`  ${base}-lh: ${t.lineHeight}${lhUnit};`)
  linesRoot.push(`  ${base}-weight: ${weight};`)
  linesRoot.push(`  ${base}-ls: ${ls};`)
}

// ── 5. Alias Token（Light / Dark）──
const aliasCol = variablesData.collections.find(c => c.name === 'Alias Token')
for (const mode of aliasCol.modes) {
  const target = mode.name === 'Light' ? linesLight : linesDark
  for (const v of mode.variables) {
    const cleanName = stripPrefix(v.name, 'color')
    const varName = `--color-${nameToVar(cleanName)}`
    const val = v.value
    if (typeof val === 'object' && val !== null) {
      target.push(`  ${varName}: var(--palette-${nameToVar(val.name)});`)
    } else {
      target.push(`  ${varName}: ${val};`)
    }
  }
}

// ── 6. Effects（Light / Dark）──
const effectsCol = variablesData.collections.find(c => c.name === 'Effects')
for (const mode of effectsCol.modes) {
  if (!['Light', 'Dark'].includes(mode.name)) continue
  const target = mode.name === 'Light' ? linesLight : linesDark
  for (const v of mode.variables) {
    if (!['color', 'number'].includes(v.type)) continue
    const varName = `--effect-${nameToVar(v.name)}`
    let val = v.value
    if (typeof val === 'object' && val !== null) {
      val = `var(--palette-${nameToVar(val.name)})`
    } else if (v.type === 'number') {
      val = `${val}px`
    }
    target.push(`  ${varName}: ${val};`)
  }
}

// ── 7. Elevations (Shadow) - Light / Dark ──
for (const elevation of elevationData.elevations) {
  const level = nameToVar(elevation.level)
  const lightShadow = elevation.light.boxShadow
  const darkShadow = elevation.dark.boxShadow

  if (lightShadow) {
    linesLight.push(`  --elevation-${level}: ${lightShadow};`)
  }
  if (darkShadow) {
    linesDark.push(`  --elevation-${level}: ${darkShadow};`)
  }
}

// ── 8. Specific Token (Component-specific tokens like button/*, tab/*, etc.) ──
// These are theme-agnostic and reference Alias Tokens, so define in :root only
const linesSpecific = []
const specificCol = variablesData.collections.find(c => c.name === 'Specific Token')
if (specificCol) {
  for (const mode of specificCol.modes) {
    for (const v of mode.variables) {
      const varName = `--${nameToVar(v.name)}`
      let val = v.value

      // Handle different value types
      if (typeof val === 'object' && val !== null) {
        if (val.collection === 'Alias Token') {
          val = `var(--color-${nameToVar(stripPrefix(val.name, 'color'))})`
        } else {
          // Check if this is a foundation token reference
          const foundationCollection = foundationTokenMap.get(val.name)
          if (foundationCollection) {
            val = `var(--${foundationCollection}-${nameToVar(val.name)})`
          } else {
            val = `var(--${nameToVar(val.name)})`
          }
        }
      } else if (v.type === 'number') {
        val = `${val}px`
      }

      linesSpecific.push(`  ${varName}: ${val};`)
    }
  }
}

// ── 9. AI Specific Token (skipped for now - these are AI theme variants) ──
// const aiSpecificCol = variablesData.collections.find(c => c.name === 'AI Specific Token')
// TODO: Handle AI Specific Token as a separate theme variant (e.g., .ai-mode class)

// ── 10. Common Aliases for easier usage ──
linesLight.push(`  --color-text-oncolor: var(--color-text-oncolor-default);`)
linesDark.push(`  --color-text-oncolor: var(--color-text-oncolor-default);`)

// ── 输出 CSS ──
const css = [
  '/* Auto-generated by build.mjs — do not edit manually */',
  '/* Source: foundation.json + component.json + elevation.json */',
  '',
  ':root {',
  `  /* Base font family for all components */`,
  baseFontFamily ? `  --font-family-base: ${baseFontFamily};` : '',
  baseFontFamily ? `  font-family: var(--font-family-base);` : '',
  '',
  ...linesRoot,
  ...linesSpecific,
  '}',
  '',
  ':root, [data-theme="light"] {',
  ...linesLight,
  '}',
  '',
  '[data-theme="dark"] {',
  ...linesDark,
  '}',
].filter(line => line !== '').join('\n')

mkdirSync('./dist', { recursive: true })
writeFileSync('./dist/tokens.css', css, 'utf-8')

console.log(`✅ tokens.css generated`)
console.log(`   palette + spacing + radius + typography: ${linesRoot.length} variables`)
console.log(`   light theme: ${linesLight.length} variables`)
console.log(`   dark theme: ${linesDark.length} variables`)
