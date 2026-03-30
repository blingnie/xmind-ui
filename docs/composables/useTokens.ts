import foundationRaw from '@xmind-ui/tokens/foundation.json'
import variablesRaw from '@xmind-ui/tokens/component.json'

function nameToVar(name: string) {
  return name.replace(/\//g, '-').replace(/ /g, '-').replace(/_/g, '-').toLowerCase()
}

// ── 类型 ──────────────────────────────────────────────
export interface ColorSwatch {
  name: string       // 'gray/800'
  varName: string    // '--palette-gray-800'
  value: string      // '#1A1A1A'
}

export interface ColorGroup {
  group: string
  swatches: ColorSwatch[]
}

export interface SpacingToken {
  name: string
  varName: string
  value: number
}

export interface RadiusToken {
  name: string
  varName: string
  value: number
}

export interface TypoToken {
  name: string
  varName: string
  fontSize: number
  lineHeight: number
  lineHeightUnit: string
  letterSpacing: number
  letterSpacingUnit: string
  fontWeight: string
  fontFamily: string
}

export interface TypoGroup {
  group: string
  tokens: TypoToken[]
}

export interface AliasToken {
  name: string
  varName: string
  refVar: string   // the palette var it points to
  rawValue: string // resolved hex or direct value
}

export interface EffectToken {
  name: string
  varName: string
  value: string
  type: 'color' | 'number'
}

// ── Helpers ──────────────────────────────────────────
function getCollection(data: any, name: string) {
  return data.collections.find((c: any) => c.name === name)
}

// ── Composable ───────────────────────────────────────
export function useTokens() {
  // Color palette grouped by hue
  function getColorGroups(): ColorGroup[] {
    const palette = getCollection(foundationRaw, 'colorPalette')
    const map = new Map<string, ColorSwatch[]>()

    for (const v of palette.modes[0].variables) {
      if (v.isAlias) continue
      const group = v.name.split('/')[0]
      if (!map.has(group)) map.set(group, [])
      map.get(group)!.push({
        name: v.name,
        varName: `--palette-${nameToVar(v.name)}`,
        value: v.value,
      })
    }

    return Array.from(map.entries()).map(([group, swatches]) => ({ group, swatches }))
  }

  // Alias tokens for light mode
  function getAliasTokens(mode: 'Light' | 'Dark' = 'Light'): AliasToken[] {
    const aliasCol = getCollection(variablesRaw, 'Alias Token')
    const modeData = aliasCol.modes.find((m: any) => m.name === mode)
    const palette = getCollection(foundationRaw, 'colorPalette')
    const paletteMap = new Map<string, string>()
    for (const v of palette.modes[0].variables) {
      if (!v.isAlias) paletteMap.set(v.name, v.value)
    }

    return modeData.variables.map((v: any) => {
      const cleanName = v.name.startsWith('color/') ? v.name.slice(6) : v.name
      const val = v.value
      const isDict = typeof val === 'object' && val !== null
      const refName = isDict ? val.name : null
      const refVar = refName ? `var(--palette-${nameToVar(refName)})` : null
      const rawValue = refName ? (paletteMap.get(refName) ?? val) : val
      return {
        name: cleanName,
        varName: `--color-${nameToVar(cleanName)}`,
        refVar: refVar ?? rawValue,
        rawValue,
      }
    })
  }

  // Spacing tokens
  function getSpacingTokens(): SpacingToken[] {
    const col = getCollection(foundationRaw, 'spacing')
    return col.modes[0].variables.map((v: any) => ({
      name: v.name,
      varName: `--spacing-${nameToVar(v.name)}`,
      value: v.value,
    }))
  }

  // Radius tokens
  function getRadiusTokens(): RadiusToken[] {
    const col = getCollection(foundationRaw, 'radius')
    return col.modes[0].variables.map((v: any) => ({
      name: v.name,
      varName: `--radius-${nameToVar(v.name)}`,
      value: v.value,
    }))
  }

  // Typography tokens grouped
  function getTypoGroups(): TypoGroup[] {
    const col = getCollection(foundationRaw, 'Typography')
    const map = new Map<string, TypoToken[]>()

    for (const v of col.modes[0].variables) {
      const parts = v.name.split('/')
      const group = parts.slice(0, 2).join('/')
      const t = v.value
      if (!map.has(group)) map.set(group, [])
      map.get(group)!.push({
        name: parts.slice(2).join('/') || parts[parts.length - 1],
        varName: `--typo-${nameToVar(v.name)}`,
        fontSize: t.fontSize,
        lineHeight: t.lineHeight,
        lineHeightUnit: t.lineHeightUnit,
        letterSpacing: t.letterSpacing,
        letterSpacingUnit: t.letterSpacingUnit,
        fontWeight: t.fontWeight,
        fontFamily: t.fontFamily,
      })
    }

    return Array.from(map.entries()).map(([group, tokens]) => ({ group, tokens }))
  }

  // Effect tokens
  function getEffectTokens(mode: 'Light' | 'Dark' = 'Light'): EffectToken[] {
    const col = getCollection(variablesRaw, 'Effects')
    const modeData = col.modes.find((m: any) => m.name === mode)
    return modeData.variables
      .filter((v: any) => ['color', 'number'].includes(v.type))
      .map((v: any) => {
        const val = v.value
        const resolved = typeof val === 'object' && val !== null
          ? `var(--palette-${nameToVar(val.name)})`
          : v.type === 'number' ? `${val}px` : val
        return {
          name: v.name,
          varName: `--effect-${nameToVar(v.name)}`,
          value: resolved,
          type: v.type,
        }
      })
  }

  return {
    getColorGroups,
    getAliasTokens,
    getSpacingTokens,
    getRadiusTokens,
    getTypoGroups,
    getEffectTokens,
  }
}
