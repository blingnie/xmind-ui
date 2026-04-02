const plugin = require('tailwindcss/plugin')
const twColors = require('tailwindcss/colors')
const designTokens = require('../docs/xmind-design-tokens-251229.json')
const BASE_COLOR_PALETTES = {
  yellow: {
    ...twColors.yellow,
    DEFAULT: twColors.yellow[500],
    1: '#FFFDE7',
    2: '#FFF9C4',
    3: '#FFF590',
    4: '#FFF176',
    5: '#FFEE58',
    6: '#FFEB3B',
    7: '#FDD835',
    8: '#FBC02D',
    9: '#F9A825',
    10: '#F57F17',
  },
  green: {
    ...twColors.green,
    DEFAULT: twColors.green[500],
    1: '#E8F5E9',
    2: '#C8E6C9',
    3: '#A5D6A7',
    4: '#80C884',
    5: '#65BB68',
    6: '#4CAF4E',
    7: '#42A046',
    8: '#388E3B',
    9: '#2F7C31',
    10: '#1C5E20',
    100: '#E8F5E9',
    400: '#80C884',
    600: '#4CAF4E',
    900: '#1C5E20',
    500: '#2F9952',
  },
  blue: {
    ...twColors.blue,
    DEFAULT: twColors.blue[500],
    1: '#E4F2FE',
    2: '#BEDFFE',
    3: '#95CCFF',
    4: '#6CB7FD',
    5: '#50A7FD',
    6: '#3B99FC',
    7: '#167EEF',
    8: '#0F66DE',
    9: '#0E57CA',
    10: '#0C43A5',
    100: '#BBDAF6',
    400: '#479EED',
    500: '#328FE5',
    600: '#2A77BF',
    900: '#11304C',
  },
  brand: {
    1: '#EFE7FC',
    2: '#DFCEF9',
    3: '#C09EF4',
    4: '#A777EF',
    5: '#8F4EF3',
    6: '#751DFB',
    7: '#610CE3',
    8: '#5610C2',
    9: '#480EA1',
    10: '#3B0D82',
  },
  red: {
    ...twColors.red,
    DEFAULT: twColors.red[500],
    1: '#FFEBEE',
    2: '#FFCDD2',
    3: '#EF9A9A',
    4: '#E57373',
    5: '#EF5350',
    6: '#F44336',
    7: '#E53935',
    8: '#D32F2F',
    9: '#C62828',
    10: '#B71C1C',
    50: '#FFEBEE',
    100: '#F6BBBB',
    200: '#F29999',
    300: '#EE7676',
    400: '#E95454',
    500: '#E53232',
    600: '#BF2A2A',
    700: '#992121',
    800: '#731919',
    900: '#4C1111',
  },
  orange: {
    ...twColors.orange,
    DEFAULT: twColors.orange[500],
    50: '#FFF3E0',
    100: '#FFE0B2',
    200: '#FFCC80',
    300: '#FFB74D',
    400: '#FFA726',
    500: '#FF9800',
    600: '#FB8C00',
    700: '#F57C00',
    800: '#EF6C00',
    900: '#E65100',
  },
  xred: {
    25: '#FFEDE9',
    50: '#FEE1DA',
    100: '#FDC3B4',
    200: '#FDA58F',
    300: '#FC8669',
    400: '#FB6843',
    500: '#FA4A1E',
    600: '#D13E19',
    700: '#A73114',
    800: '#7D250F',
    900: '#54190A',
    950: '#290C05',
  },
  white: {
    DEFAULT: twColors.white,
    30: 'rgba(255, 255, 255, 0.3)',
    50: 'rgba(255, 255, 255, 0.5)',
    70: 'rgba(255, 255, 255, 0.7)',
    90: 'rgba(255, 255, 255, 0.9)',
  },
  black: {
    DEFAULT: twColors.black,
    30: 'rgba(0, 0, 0, 0.3)',
    50: 'rgba(0, 0, 0, 0.5)',
    70: 'rgba(0, 0, 0, 0.7)',
  },
  grey: {
    1: '#F8F9FA',
    2: '#EAECEF',
    3: '#DFE1E5',
    4: '#CFD4D9',
    5: '#AEB5BD',
    6: '#6E757C',
    7: '#4A5056',
    8: '#353A3F',
    9: '#212529',
    10: '#151719',
    25: '#ffffff',
    50: 'rgba(250, 251, 252, 1)',
    100: 'rgba(245, 246, 247, 1)',
    150: 'rgba(237, 240, 242, 1)',
    200: 'rgba(228, 231, 235, 1)',
    250: '#D3D7DB',
    300: 'rgba(189, 194, 199, 1)',
    350: 'rgba(158, 163, 168, 1)',
    400: '#878C92',
    450: '#747A80',
    500: 'rgba(103, 110, 116, 1)',
    550: 'rgba(89, 96, 102, 1)',
    600: 'rgba(78, 84, 89, 1)',
    650: 'rgba(67, 72, 77, 1)',
    700: 'rgba(56, 60, 64, 1)',
    750: 'rgba(43, 47, 51, 1)',
    800: 'rgba(31, 35, 38, 1)',
    850: 'rgba(25, 28, 31, 1)',
    900: '#151719',
  },
  purple: {
    ...twColors.purple,
    DEFAULT: twColors.purple[500],
    200: 'rgba(195, 157, 253, 1)',
    400: 'rgba(148, 83, 247, 1)',
    500: 'rgba(128, 47, 251, 1)',
    600: 'rgba(105, 26, 224, 1)',
    700: 'rgba(89, 27, 183, 1)',
  },
  'ai-purple': {
    25: '#F4EDFF',
    50: '#E9DAFF',
    100: '#DAC2FF',
    200: '#C39DFD',
    300: '#AC7AF8',
    400: '#9453F7',
    500: '#802FFB',
    600: '#691AE0',
    700: '#591BB7',
    800: '#42138B',
    900: '#301061',
    950: '#200B40',
  },
  'light-grey': {
    1: '#FFFFFF',
    2: '#FAFAFB',
    3: '#F5F5F5',
    4: '#EEEEEE',
    5: '#E8E8E8',
    6: '#DADADB',
    7: '#CCCDCE',
    8: '#BEBFC0',
    9: '#B0B2B3',
    10: '#A2A4A6',
  },
  'dark-grey': {
    1: '#949699',
    2: '#86898C',
    3: '#787B7F',
    4: '#6A6D71',
    5: '#5C6064',
    6: '#343638',
    7: '#2D2F31',
    8: '#27292A',
    9: '#222425',
    10: '#1D1F20',
  },
  'transparent-white': {
    1: 'rgba(255, 255, 255, 0.05)',
    2: 'rgba(255, 255, 255, 0.1)',
    3: 'rgba(255, 255, 255, 0.15)',
    4: 'rgba(255, 255, 255, 0.2)',
    5: 'rgba(255, 255, 255, 0.25)',
    6: 'rgba(255, 255, 255, 0.4)',
    7: 'rgba(255, 255, 255, 0.5)',
    8: 'rgba(255, 255, 255, 0.7)',
    9: 'rgba(255, 255, 255, 0.8)',
    10: 'rgba(255, 255, 255, 0.9)',
  },
  'transparent-dark': {
    1: 'rgba(0, 0, 0, 0.03)',
    2: 'rgba(0, 0, 0, 0.05)',
    3: 'rgba(0, 0, 0, 0.08)',
    4: 'rgba(0, 0, 0, 0.1)',
    5: 'rgba(0, 0, 0, 0.2)',
    6: 'rgba(0, 0, 0, 0.3)',
    7: 'rgba(0, 0, 0, 0.5)',
    8: 'rgba(0, 0, 0, 0.7)',
    9: 'rgba(0, 0, 0, 0.8)',
    10: 'rgba(0, 0, 0, 1)',
  },
}

const BASE_COLOR_ALIASES = {
  'base/white': BASE_COLOR_PALETTES['light-grey'][1],
  'base/red': BASE_COLOR_PALETTES.red[500],
  'base/blue': BASE_COLOR_PALETTES.blue[500],
  'base/green': BASE_COLOR_PALETTES.green[500],
  'base/orange': BASE_COLOR_PALETTES.orange[500],
  'base/x-red': BASE_COLOR_PALETTES.xred[500],
  'base/AI-purple': BASE_COLOR_PALETTES['ai-purple'][500],
}

const BASE_TOKEN_PALETTES = {
  gray: BASE_COLOR_PALETTES.grey,
  'ai-purple': BASE_COLOR_PALETTES['ai-purple'],
  blue: BASE_COLOR_PALETTES.blue,
  green: BASE_COLOR_PALETTES.green,
  orange: BASE_COLOR_PALETTES.orange,
  red: BASE_COLOR_PALETTES.red,
  'x-red': BASE_COLOR_PALETTES.xred,
  black: BASE_COLOR_PALETTES.black,
  white: BASE_COLOR_PALETTES.white,
}

const buildTokenIndex = (collectionName, tokenType) => {
  const collection = designTokens.collections?.find(item => item.name === collectionName)
  const index = { light: {}, dark: {} }

  for (const mode of collection?.modes || []) {
    const modeKey = mode.name.toLowerCase()
    index[modeKey] = {}
    for (const variable of mode.variables || []) {
      if (tokenType && variable.type !== tokenType) {
        continue
      }
      index[modeKey][variable.name] = variable
    }
  }

  return index
}

const aliasColorTokens = buildTokenIndex('Alias Token', 'color')
const specificColorTokens = buildTokenIndex('Specific Token', 'color')
const effectsColorTokens = buildTokenIndex('Effects', 'color')
const aiSpecificColorTokens = buildTokenIndex('AI Specific Token', 'color')

const resolveBaseColor = refName => {
  const alias = BASE_COLOR_ALIASES[refName]
  if (alias) {
    return alias
  }

  const [paletteName, shade] = refName.split('/')
  const palette = BASE_TOKEN_PALETTES[paletteName]

  if (!palette || !shade) {
    return undefined
  }

  return palette[shade]
}

const resolveAliasColor = (mode, tokenName, visited = new Set()) => {
  const tokensForMode = aliasColorTokens[mode]
  const token = tokensForMode?.[tokenName]

  if (!token) {
    return undefined
  }

  if (!token.isAlias) {
    return token.value
  }

  const refName = token.value?.name
  const refCollection = token.value?.collection

  if (!refName || visited.has(refName)) {
    return undefined
  }

  visited.add(refName)

  let resolvedValue
  if (refCollection === 'Alias Token' || refName.startsWith('color/')) {
    resolvedValue = resolveAliasColor(mode, refName, visited)
  } else {
    resolvedValue = resolveBaseColor(refName)
  }

  visited.delete(refName)
  return resolvedValue
}

const resolveAliasColorPair = tokenName => {
  return {
    light: resolveAliasColor('light', tokenName),
    dark: resolveAliasColor('dark', tokenName),
  }
}

const normalizeTokenKey = tokenName => {
  const normalized = tokenName.startsWith('color/') ? tokenName.slice('color/'.length) : tokenName
  return normalized.replace(/\//g, '-')
}

const AI_SPECIFIC_TOKEN_FALLBACKS = {
  'color/fill/tertiary/normal': BASE_COLOR_PALETTES.grey[25],
  'color/fill/tertiary/hover': BASE_COLOR_PALETTES.grey[25],
  'color/fill/tertiary/pressed': BASE_COLOR_PALETTES.grey[200],
  'color/fill/tertiary/disable': BASE_COLOR_PALETTES.grey[25],
}

const normalizeAiSpecificKey = key => {
  return key.replace('onColor', 'on-color').replace('stylePicker', 'style-picker')
}

const buildAiSpecificColorValue = (lightValue, darkValue) => {
  const resolvedLight = lightValue ?? darkValue
  const resolvedDark = darkValue ?? lightValue ?? resolvedLight
  return {
    DEFAULT: resolvedLight,
    light: resolvedLight,
    dark: resolvedDark,
  }
}

const resolveTokenVariablePair = variable => {
  if (!variable) {
    return undefined
  }

  if (!variable.isAlias) {
    return {
      light: variable.value,
      dark: variable.value,
    }
  }

  const refName = variable.value?.name
  const refCollection = variable.value?.collection

  if (!refName) {
    return undefined
  }

  if (refCollection === 'Alias Token' || refName.startsWith('color/')) {
    return resolveAliasColorPair(refName)
  }

  const baseValue = resolveBaseColor(refName)
  if (!baseValue) {
    return undefined
  }

  return {
    light: baseValue,
    dark: baseValue,
  }
}

const resolveTokenVariableValue = (mode, variable) => {
  if (!variable) {
    return undefined
  }

  if (!variable.isAlias) {
    return variable.value
  }

  const refName = variable.value?.name
  const refCollection = variable.value?.collection

  if (!refName) {
    return undefined
  }

  if (refCollection === 'Alias Token' || refName.startsWith('color/')) {
    return resolveAliasColor(mode, refName)
  }

  return resolveBaseColor(refName)
}

const buildAllTokenColorEntries = () => {
  const entries = {}

  for (const tokenName of Object.keys(aliasColorTokens.light || {})) {
    const pair = resolveAliasColorPair(tokenName)
    entries[normalizeTokenKey(tokenName)] = buildAiSpecificColorValue(pair.light, pair.dark)
  }

  const specificTokenNames = new Set([...Object.keys(specificColorTokens.desktop || {}), ...Object.keys(specificColorTokens.mobile || {})])

  for (const tokenName of specificTokenNames) {
    const desktopPair = resolveTokenVariablePair(specificColorTokens.desktop?.[tokenName])
    const mobilePair = resolveTokenVariablePair(specificColorTokens.mobile?.[tokenName])
    const basePair = desktopPair || mobilePair

    if (basePair) {
      entries[normalizeTokenKey(tokenName)] = buildAiSpecificColorValue(basePair.light, basePair.dark)
    }

    if (desktopPair) {
      entries[`${normalizeTokenKey(tokenName)}-desktop`] = buildAiSpecificColorValue(desktopPair.light, desktopPair.dark)
    }

    if (mobilePair) {
      entries[`${normalizeTokenKey(tokenName)}-mobile`] = buildAiSpecificColorValue(mobilePair.light, mobilePair.dark)
    }
  }

  const effectsTokenNames = new Set([...Object.keys(effectsColorTokens.light || {}), ...Object.keys(effectsColorTokens.dark || {})])

  for (const tokenName of effectsTokenNames) {
    const lightValue = resolveTokenVariableValue('light', effectsColorTokens.light?.[tokenName])
    const darkValue = resolveTokenVariableValue('dark', effectsColorTokens.dark?.[tokenName])
    entries[normalizeTokenKey(tokenName)] = buildAiSpecificColorValue(lightValue, darkValue)
  }

  return entries
}

const resolveAiSpecificVariablePair = variable => {
  const pair = resolveTokenVariablePair(variable)
  if (!variable?.isAlias) {
    return pair
  }

  const refName = variable.value?.name
  if (!refName?.startsWith('color/')) {
    return pair
  }

  const fallback = AI_SPECIFIC_TOKEN_FALLBACKS[refName]
  if (!fallback) {
    return pair
  }

  return {
    light: pair?.light ?? fallback,
    dark: pair?.dark ?? fallback,
  }
}

const buildAiSpecificColorEntries = () => {
  const entries = {}
  const tokens = aiSpecificColorTokens.desktop || {}

  for (const [tokenName, variable] of Object.entries(tokens)) {
    const pair = resolveAiSpecificVariablePair(variable)
    if (!pair) {
      continue
    }
    entries[normalizeAiSpecificKey(normalizeTokenKey(tokenName))] = buildAiSpecificColorValue(pair.light, pair.dark)
  }

  return entries
}

const AISpecificColors = buildAiSpecificColorEntries()

const ALL_TOKEN_COLOR_ENTRIES = buildAllTokenColorEntries()

const COLOR_TOKEN_KEYS = {
  'text-primary': 'color/text/primary',
  'text-secondary': 'color/text/secondary',
  'text-tertiary': 'color/text/tertiary',
  'text-quaternary': 'color/text/quaternary',
  'text-link-normal': 'color/text/link/normal',
  'icon-primary': 'color/icon/primary',
  'icon-secondary': 'color/icon/secondary',
  'icon-tertiary': 'color/icon/tertiary',
  'icon-quaternary': 'color/icon/quaternary',
  'icon-invert': 'color/icon/invert',
  'border-primary': 'color/border/primary',
  'border-secondary': 'color/border/secondary',
  'border-tertiary': 'color/border/tertiary',
  'border-quaternary': 'color/border/quaternary',
  'border-muted': 'color/border/muted',
  'border-translucent': 'color/border/translucent',
  'border-panel': 'color/border/panel',
  'divider-onSurfaceBright': 'color/divider/onSurfaceBright',
  'divider-onContainer': 'color/divider/onContainer',
  'divider-strong': 'color/divider/strong',
  'divider-muted': 'color/divider/muted',
  'fill-surface': 'color/fill/surface-desktop',
  'fill-surfaceBright': 'color/fill/surfaceBright',
  'fill-surfaceDim': 'color/fill/surfaceDim',
  'fill-container': 'color/fill/container',
  'fill-secondary': 'color/fill/secondary/normal',
  'mask-overlay-s': 'color/mask/overlayS',
  'mask-overlay-m': 'color/mask/overlayM',
  'mask-overlay-l': 'color/mask/overlayL',
  'mask-overlay-bright': 'color/mask/overlayBright',
  'mask-overlay-deep': 'color/mask/overlayDeep',
  'mask-background-default': 'color/mask/backgroundDefault',
  'material-acrylic': 'color/material/acrylic',
  'material-acrylic-bright': 'color/material/acrylicBright',
}

const COLOR_TOKEN_ENTRIES = Object.fromEntries(Object.entries(COLOR_TOKEN_KEYS).map(([key, tokenName]) => [key, resolveAliasColorPair(tokenName)]))

const EXTENDED_COLORS = {
  ...BASE_COLOR_PALETTES,
  ...COLOR_TOKEN_ENTRIES,
  'floating-bar-background': {
    light: '#ffffff',
    dark: '#27292A',
  },
  'text-accent': resolveAliasColor('light', 'color/text/accent'),
  'fill-surfaceDark': {
    light: '#E4E7EB',
    dark: '#383C40',
  },
  'fill-surfaceDesktop': {
    light: 'rgba(250, 251, 252, 1)',
    dark: 'rgba(31, 35, 38, 1)',
  },
  'text-ai': {
    light: 'rgba(105, 26, 224, 1)',
    dark: 'rgba(148, 83, 247, 1)',
  },
  'switch-bg-checked-normal': {
    light: '#383C40',
    dark: '#878C92',
  },
  'switch-bg-uncheck-normal': {
    light: 'rgba(28, 40, 52, 0.12)',
    dark: 'rgba(235, 244, 252, 0.16)',
  },
  'switch-bg-checked-pressed': {
    light: '#1F2326',
    dark: '#9EA3A8',
  },
  'switch-bg-uncheck-pressed': {
    light: 'rgba(55, 64, 71, 0.30)',
    dark: 'rgba(235, 244, 252, 0.30)',
  },
  'switch-bg-checked-disable': {
    light: '#D3D7DB',
    dark: '#43484D',
  },
  'switch-bg-uncheck-disable': {
    light: 'rgba(28, 40, 52, 0.05)',
    dark: 'rgba(235, 244, 252, 0.10)',
  },
  ai: { ...AISpecificColors },
  ...ALL_TOKEN_COLOR_ENTRIES,
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{html,ts,tsx,vue}',
    './pages/**/*.{html,ts,tsx,vue}',
    './shared/**/*.{html,ts,tsx,vue}',
    './library/**/*.{html,ts,tsx,vue}',
  ],
  darkMode: ['class', '.fw-dark'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'NeverMind UI',
          'system-ui',
          '-apple-system',
          'PingFang SC',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Microsoft YaHei',
          '微软雅黑',
          '黑体',
        ],
        NeverMind: ['NeverMind'],
        'NeverMind-SemiCondensed': ['NeverMind SemiCondensed'],
        'NeverMind-UI': ['NeverMind UI'],
        'app-body': [
          'NeverMind UI',
          'system-ui',
          '-apple-system',
          'PingFang SC',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Microsoft YaHei',
          '微软雅黑',
          '黑体',
        ],
      },
      fontSize: {
        xxs: ['0.625rem', { lineHeight: '0.875rem' }],

        'desktop-display-1': ['38px', { fontWeight: '700', lineHeight: '57px', letterSpacing: '0.3px' }],
        'desktop-display-2': ['32px', { fontWeight: '700', lineHeight: '40px' }],
        'desktop-display-3': ['28px', { fontWeight: '700', lineHeight: '34px' }],
        'desktop-display-4': ['24px', { fontWeight: '700', lineHeight: '30px' }],

        'desktop-headline-1': ['18px', { fontWeight: '700', lineHeight: '24px' }],
        'desktop-headline-2': ['14px', { fontWeight: '600', lineHeight: '18px' }],
        'desktop-headline-3': ['14px', { fontWeight: '700', lineHeight: '18px' }],

        'desktop-title-1': ['13px', { fontWeight: '500', lineHeight: '18px' }],
        'desktop-title-2': ['13px', { fontWeight: '700', lineHeight: '18px' }],

        'desktop-body-1': ['16px', { fontWeight: '400', lineHeight: '24px' }],
        'desktop-body-2': ['16px', { fontWeight: '500', lineHeight: '24px' }],
        'desktop-body-3': ['13px', { fontWeight: '400', lineHeight: '18px' }],

        'desktop-footnote': ['13px', { fontWeight: '400', lineHeight: '18px' }],
        'desktop-caption-1': ['12px', { fontWeight: '400', lineHeight: '16px', letterSpacing: '0.074px' }],
        'desktop-caption-2': ['11px', { fontWeight: '500', lineHeight: '16px', letterSpacing: '-0.15px' }],

        'desktop-headline-small': ['21px', { fontWeight: '700', lineHeight: '27px', letterSpacing: '0.21px' }],
        'desktop-headline-large': ['28px', { fontWeight: '700', lineHeight: '34px', letterSpacing: '0.28px' }],
        'desktop-subhead-mini': ['13px', { fontWeight: '600', lineHeight: '17px', letterSpacing: '0.26px' }],
        'desktop-subhead-small': ['15px', { fontWeight: '700', lineHeight: '19px', letterSpacing: '0.3px' }],
        'desktop-subhead-medium': ['17px', { fontWeight: '700', lineHeight: '23px', letterSpacing: '0.34px' }],
        'desktop-subhead-large': ['19px', { fontWeight: '700', lineHeight: '25px', letterSpacing: '0.19px' }],
        'desktop-body-large': ['14px', { fontWeight: '400', lineHeight: '18px', letterSpacing: '0.56px' }],
        'desktop-body-medium': ['13px', { fontWeight: '400', lineHeight: '17px', letterSpacing: '0.52px' }],
        'desktop-body-small': ['12px', { fontWeight: '400', lineHeight: '16px', letterSpacing: '0.48px' }],
        'desktop-caption': ['11px', { fontWeight: '400', lineHeight: '15px', letterSpacing: '0.44px' }],
        'desktop-caption-header': ['12px', { fontWeight: '400', lineHeight: '16px', letterSpacing: '0.48px' }],
        'desktop-caption-footer': ['13px', { fontWeight: '400', lineHeight: '17px', letterSpacing: '0.52px' }],
        'desktop-caption-small': ['10px', { fontWeight: '400', lineHeight: '14px', letterSpacing: '0.4px' }],

        'mobile-display-1': ['30px', { fontWeight: '700', lineHeight: '40px', letterSpacing: '0.3px' }],
        'mobile-display-2': ['28px', { fontWeight: '700', lineHeight: '34px' }],
        'mobile-display-3': ['24px', { fontWeight: '700', lineHeight: '30px' }],
        'mobile-display-4': ['20px', { fontWeight: '700', lineHeight: '28px' }],

        'mobile-headline-1': ['16px', { fontWeight: '700', lineHeight: '24px', letterSpacing: '0.098px' }],
        'mobile-headline-2': ['14px', { fontWeight: '600', lineHeight: '18px' }],
        'mobile-headline-3': ['14px', { fontWeight: '700', lineHeight: '18px' }],

        'mobile-title-1': ['13px', { fontWeight: '500', lineHeight: '18px' }],
        'mobile-title-2': ['13px', { fontWeight: '700', lineHeight: '18px' }],

        'mobile-body-1': ['16px', { fontWeight: '400', lineHeight: '24px' }],
        'mobile-body-2': ['16px', { fontWeight: '500', lineHeight: '24px' }],
        'mobile-body-3': ['13px', { fontWeight: '400', lineHeight: '18px' }],

        'mobile-footnote': ['13px', { fontWeight: '400', lineHeight: '18px' }],
        'mobile-caption-small': ['11px', { fontWeight: '400', lineHeight: '15px', letterSpacing: '0.44px' }],
        'mobile-caption-1': ['12px', { fontWeight: '400', lineHeight: '16px', letterSpacing: '0.074px' }],
        'mobile-caption-2': ['11px', { fontWeight: '500', lineHeight: '16px', letterSpacing: '-0.15px' }],
        'mobile-caption-header': ['13px', { fontWeight: '400', lineHeight: '17px', letterSpacing: '0.52px' }],
        'mobile-caption-footer': ['13px', { fontWeight: '400', lineHeight: '17px', letterSpacing: '0.52px' }],

        'mobile-subhead-mini': ['15px', { fontWeight: '700', lineHeight: '21px', letterSpacing: '0.3px' }],
        'mobile-subhead-small': ['17px', { fontWeight: '700', lineHeight: '23px', letterSpacing: '0.34px' }],
        'mobile-subhead-medium': ['19px', { fontWeight: '700', lineHeight: '25px', letterSpacing: '0.19px' }],
        'mobile-subhead-large': ['21px', { fontWeight: '700', lineHeight: '27px', letterSpacing: '0.21px' }],
        'mobile-body-small': ['13px', { fontWeight: '400', lineHeight: '17px', letterSpacing: '0.52px' }],
        'mobile-body-medium': ['15px', { fontWeight: '400', lineHeight: '19px', letterSpacing: '0.6px' }],
        'mobile-body-large': ['17px', { fontWeight: '400', lineHeight: '21px', letterSpacing: '0.68px' }],
        'mobile-headline-small': ['24px', { fontWeight: '700', lineHeight: '28px', letterSpacing: '0.24px' }],
        'mobile-headline-large': ['34px', { fontWeight: '700', lineHeight: '40px', letterSpacing: '0.43px' }],
        'landing-header': ['16px', { fontWeight: 600, lineHeight: '24px' }],
      },
      spacing: {
        'toolbar-icon-button-width': '32px',
        'toolbar-icon-button-height': '32px',
      },
      padding: {
        'menu-checked-padding-left-patch': '36px',
      },
      screens: {
        xss: '320px',
        'max-w-xss': { raw: '(max-width: 320px)' },
        xs: '480px',
        sm: '600px',
        'max-w-sm': { raw: '(max-width: 600px)' },
        md: '768px',
        'md-800': '800px',
        'md-840': '840px',
        'max-w-md': { raw: '(max-width: 768px)' },
        lg: '1024px',
        'max-w-lg': { raw: '(max-width: 1024px)' },
        xl: '1280px',
        'max-w-xl': { raw: '(max-width: 1280px)' },
        '2xl': '1536px',
        '3xl': '1920px',
        'min-w-704': { raw: '(min-width: 704px)' },
        'min-w-906': { raw: '(min-width: 906px)' },
        'max-w-880': { raw: '(max-width: 880px)' },
        'max-h-500': { raw: '(max-height: 500px)' },
        'max-h-470': { raw: '(max-height: 470px)' },
        'hover-none': { raw: '(any-hover: none)' },
      },
      colors: EXTENDED_COLORS,
      backgroundImage: {
        'gradient-primary': 'linear-gradient(132.89deg, #7F31FF -8.87%, #58009E 108.18%)',
        'gradient-brand': 'linear-gradient(95deg, #970be2 0%, #520be2 52.94%, #3e0bdb 102.67%)',
        'landing-opening':
          'linear-gradient(180deg, rgba(176, 171, 255, 0.05) 0%, rgba(241, 91, 255, 0.05) 23.5%, rgba(245, 102, 102, 0.05) 50%, rgba(249, 201, 82, 0.10) 75%, rgba(255, 255, 255, 0.00) 100%);',
        'badge-primary': 'linear-gradient(0deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.05) 100%)',
        'badge-default': 'linear-gradient(0deg, rgba(0, 0, 0, 0.10) 0%, rgba(0, 0, 0, 0.10) 100%)',
        'ai-background-dark':
          'linear-gradient(93deg, rgba(228, 132, 255, 0.15) 0%, rgba(255, 122, 197, 0.15) 51.56%, rgba(255, 133, 133, 0.15) 103.11%)',
        'ai-background-light':
          'linear-gradient(93deg, rgba(228, 132, 255, 0.1) 0%, rgba(255, 122, 197, 0.1) 51.56%, rgba(255, 133, 133, 0.1) 103.11%)',
        'brainstorm-disclaimer-dark': 'linear-gradient(180deg, rgba(20, 20, 20, 0.00) 0%, #141414 100%)',
        'brainstorm-disclaimer-light': 'linear-gradient(180deg, rgba(255, 255, 255, 0.00) 0%, #FFF 100%)',
        'progress-animation-background-gradient':
          'linear-gradient(90deg, rgba(181, 48, 152, 0.50) 0%, rgba(182, 133, 255, 0.50) 35%, rgba(67, 115, 226, 0.50) 70%, rgba(240, 150, 240, 0.50) 100%)',
        'ai-unlimited': 'linear-gradient(91deg, #AF1AFF 0.45%, #7430FF 17.85%, #924AFF 34.2%)',
        'minibar-gradient':
          'linear-gradient(90deg, rgba(255, 240, 223, 0.50) -2.19%, rgba(255, 220, 247, 0.50) 35.36%, rgba(222, 221, 255, 0.50) 80.52%, rgba(255, 255, 255, 0.50) 117.12%)',
        'markdown-uploading-gradient': 'linear-gradient(180deg, #FFF 55.84%, #FFFCF7 100%)',
        'docx-uploading-gradient': 'linear-gradient(180deg, #FFF 55.84%, #F5FAFF 100%)',
        'opml-uploading-gradient': 'linear-gradient(180deg, #FFF 55.84%, #F6FFF8 100%)',
        'notebooklm-uploading-gradient': 'linear-gradient(180deg, #FFF 55.84%, #F7F6FF 100%)',
        'textbundle-uploading-gradient': 'linear-gradient(180deg, #FFF 55.84%, #F6FFFF 100%)',
        'ai-template-label-gradient': 'linear-gradient(92deg, #AB8AFF -18.66%, #FF64B2 63.26%, #FFB1AA 118.31%)',
        'menu-indicator-top-gradient-light': 'linear-gradient(to top, rgba(255, 255, 255, 0) 0%, rgba(245, 246, 247, 0.92) 100%)',
        'menu-indicator-bottom-gradient-light': 'linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(245, 246, 247, 0.92) 100%)',
        'menu-indicator-top-gradient-dark': 'linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(31, 35, 38, 0.92) 100%)',
        'menu-indicator-bottom-gradient-dark': 'linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(31, 35, 38, 0.92) 100%)',
        'ai-loading-text-gradient-light':
          'linear-gradient(90deg, rgba(0, 0, 0, 0.3) 0%, #000 25%, rgba(0, 0, 0, 0.3) 50%, #000 75%, rgba(0, 0, 0, 0.3) 100%)',
        'ai-loading-text-gradient-dark':
          'linear-gradient(90deg, rgba(255, 255, 255, 0.3) 0%, #FFF 25%, rgba(255, 255, 255, 0.3) 50%, #FFF 75%, rgba(255, 255, 255, 0.3) 100%)',
        'ai-lab-export-menu-gradient':
          'linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(148, 83, 247, 0.05) 25%, rgba(255, 255, 255, 0.05) 50%, rgba(148, 83, 247, 0.05) 75%, rgba(255, 255, 255, 0.05) 100%)',
      },
      boxShadow: {
        'button-shadow-1': '0px 1px 1px 0px rgba(0, 0, 0, 0.05), 0px 0.5px 1px 0px rgba(0, 0, 0, 0.10)',
        'button-shadow-2': '0px 0.5px 1px 0px rgba(0, 0, 0, 0.10), 0px 1px 1px 0px rgba(0, 0, 0, 0.05)',
        'floating-bar-shadow': '0px 0px 3px 0px rgba(0, 0, 0, 0.14), 0px 8px 40px 0px rgba(0, 0, 0, 0.06)',
        'right-bar-dark': 'inset 0px 0px 2px 0px rgba(255, 255, 255, 0.2), 0px 0px 3px 0px rgba(0, 0, 0, 0.2), 0px 8px 40px 0px rgba(0, 0, 0, 0.5)',
        'shadow-small': '0px 0px 2px 0px rgba(0, 0, 0, 0.08), 0px 2px 10px 0px rgba(0, 0, 0, 0.16)',
        'popover-light': '0px 0px 3px 0px rgba(0, 0, 0, 0.14), 0px 8px 40px 0px rgba(0, 0, 0, 0.06), 0px 0px 3px 0px rgba(255, 255, 255, 0.10) inset',
        'popover-grey': '0px 0px 3px 0px rgba(0, 0, 0, 0.20), 0px 8px 40px 0px rgba(0, 0, 0, 0.50), 0px 0px 2px 0px rgba(255, 255, 255, 0.20) inset',
        'popover-dark': '6px 6px 0px 0px rgba(255, 255, 255, 0.08)',
        'card-shadow-light': '0px 4px 15px rgba(0, 0, 0, 0.1), 0px 1px 4px rgba(0, 0, 0, 0.05)',
        'card-shadow-dark': '0px 4px 15px rgba(0, 0, 0, 0.3), 0px 1px 4px rgba(0, 0, 0, 0.2)',
        'badge-shadow': '0px 0px 0px 1px rgba(255, 255, 255, 0.25) inset',
        'landing-opening-shadow':
          '0px 420.209px 117.659px 0px rgba(0, 0, 0, 0.00), 0px 268.934px 107.574px 0px rgba(0, 0, 0, 0.01), 0px 151.275px 90.765px 0px rgba(0, 0, 0, 0.03), 0px 67.233px 67.233px 0px rgba(0, 0, 0, 0.05), 0px 16.808px 36.978px 0px rgba(0, 0, 0, 0.06)',
        'landing-opening-image-shadow': '0px 0px 8.3px 0px rgba(0, 0, 0, 0.12)',
        'input-focus-border-color': '0px 0px 0px 1px #751DFB',
        'ai-toast-shadow': '0px 4px 15px 0px rgba(0, 0, 0, 0.10), 0px 1px 4px 0px rgba(0, 0, 0, 0.05)',
        'export-shadow': '0px 1px 2px 0px rgba(0, 0, 0, 0.03) inset, 0px 0px 2px 0px rgba(0, 0, 0, 0.05) inset',
        'brainstorm-trash-unit-light': '6px 6px 0px 0px rgba(0, 0, 0, 0.20)',
        'brainstorm-trash-unit-light-hover': '6px 6px 0px 0px rgba(0, 0, 0, 0.40)',
        'brainstorm-trash-unit-dark': '6px 6px 0px 0px rgba(255, 255, 255, 0.08)',
        'brainstorm-trash-unit-dark-hover': '6px 6px 0px 0px rgba(255, 255, 255, 0.1)',
        'brainstorm-bar-light': '0px 0px 3px 0px rgba(0, 0, 0, 0.14), 0px 8px 40px 0px rgba(0, 0, 0, 0.06), 0px 0px 4px 0px rgb(0 0 0 / 10%) inset',
        'container-light':
          '0.5px 0.7px 0px 0px rgba(255, 255, 255, 0) inset, -0.5px -0.7px 0px 0px rgba(255, 255, 255, 0) inset, 0px 0px 1.5px 0px rgba(0, 0, 0, 0.06), 0px 0px 3px 0px rgba(0, 0, 0, 0.03)',
        'container-dark':
          '0.5px 0.7px 0px 0px rgba(255, 255, 255, 0.05) inset, -0.5px -0.7px 0px 0px rgba(255, 255, 255, 0.03) inset, 0px 0px 1.5px 0px rgba(0, 0, 0, 0.06), 0px 0px 3px 0px rgba(0, 0, 0, 0.06)',
        'button-default-light':
          '0px 0.5px 4px 0px var(--drop-shadow-l1-01, rgba(0, 0, 0, 0.12)), 0px 0px 1.8px 0px var(--drop-shadow-l1-02, rgba(0, 0, 0, 0.08))',
        'button-default-dark':
          '0px 0.5px 4px 0px var(--drop-shadow-l1-01, rgba(0, 0, 0, 0.25)), 0px 0px 1.8px 0px var(--drop-shadow-l1-02, rgba(0, 0, 0, 0.2))',
        'ai-background-lottie-animation-dark': '0px 0px 16px 0px rgba(255, 255, 255, 0.12) inset',
        'grid-card-thumbnail-light': '0px 4px 12px 0px rgba(0, 0, 0, 0.04), 0px 1px 4px 0px rgba(0, 0, 0, 0.03)',
        'grid-card-thumbnail-dark': '0px 4px 12px 0px rgba(255, 255, 255, 0.04), 0px 1px 4px 0px rgba(255, 255, 255, 0.03)',
        'grid-card-star-light': '0px 0.5px 4px 0px rgba(0, 0, 0, 0.12), 0px 0px 1.8px 0px rgba(0, 0, 0, 0.08)',
        'grid-card-star-dark': '0px 0.5px 4px 0px rgba(255, 255, 255, 0.12), 0px 0px 1.8px 0px rgba(255, 255, 255, 0.08)',
        'expressive-small':
          '0px 0px 2px 0px rgba(0, 0, 0, 0.10), 0px 27px 7px 0px rgba(0, 0, 0, 0.00), 0px 17px 7px 0px rgba(0, 0, 0, 0.01), 0px 10px 6px 0px rgba(0, 0, 0, 0.03), 0px 4px 4px 0px rgba(0, 0, 0, 0.05), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)',
        'expressive-large':
          '0px 107px 30px 0px rgba(0, 0, 0, 0.00), 0px 68px 27px 0px rgba(0, 0, 0, 0.01), 0px 38px 23px 0px rgba(0, 0, 0, 0.05), 0px 17px 17px 0px rgba(0, 0, 0, 0.09), 0px 4px 9px 0px rgba(0, 0, 0, 0.10)',
        'productive-small': '0px 2px 16px 0px rgba(0, 0, 0, 0.08), 0px 0px 2px 0px rgba(0, 0, 0, 0.08)',
        'productive-large': '0px 8px 32px 0px rgba(0, 0, 0, 0.08), 0px 0px 2px 0px rgba(0, 0, 0, 0.08)',
        'elevation-l1-light': '0 0.5px 4px 0 rgba(0, 0, 0, 0.12), 0 0 1.8px 0 rgba(0, 0, 0, 0.08)',
        'elevation-l1-dark': '0 0.5px 4px rgba(0, 0, 0, 0.25), 0 0 1.8px rgba(0, 0, 0, 0.20)',
        'elevation-l2-light': '0 2.4px 24px 0 rgba(0, 0, 0, 0.15), 0 0 3px 0 rgba(0, 0, 0, 0.10)',
        'elevation-l2-dark': '0 2.4px 24px rgba(0, 0, 0, 0.30), 0 0 3px rgba(0, 0, 0, 0.30)',
        'elevation-l3-light':
          '0 0 0 0 var(--inner-shadow-l3-01, rgba(255, 255, 255, 0.00)) inset, 0 0 0 0 rgba(255, 255, 255, 0.00) inset, 0 6px 32px 0 rgba(0, 0, 0, 0.20), 0 0 3px 0 rgba(0, 0, 0, 0.10)',
        'elevation-l3-dark':
          '0.3px 0.5px 0 rgba(255, 255, 255, 0.05) inset, -0.3px -0.5px 0 rgba(255, 255, 255, 0.03) inset, 0 6px 32px rgba(0, 0, 0, 0.35), 0 0 3px rgba(0, 0, 0, 0.30)',
        'elevation-l4-light':
          '0.3px 0.5px 0 0 rgba(255, 255, 255, 0.20) inset, -0.3px -0.5px 0 0 rgba(255, 255, 255, 0.10) inset, 0 8px 100px 0 rgba(0, 0, 0, 0.25), 0 4px 32px 0 rgba(0, 0, 0, 0.10)',
        'elevation-l4-dark':
          '0.3px 0.5px 0 rgba(255, 255, 255, 0.05) inset, -0.3px -0.5px 0 rgba(255, 255, 255, 0.03) inset, 0 8px 100px rgba(0, 0, 0, 0.40), 0 4px 32px rgba(0, 0, 0, 0.30)',
        'elevation-g-light':
          '0.5px 0.7px 0 0 rgba(255, 255, 255, 0.00) inset, 0 0 0 0 rgba(255, 255, 255, 0.00) inset, 0 0 1.5px 0 rgba(0, 0, 0, 0.06), 0 0 3px 0 rgba(0, 0, 0, 0.03)',
        'elevation-g-dark':
          '0.5px 0.7px 0 rgba(255, 255, 255, 0.05) inset, -0.5px -0.7px 0 rgba(255, 255, 255, 0.03) inset, 0 0 1.5px rgba(0, 0, 0, 0.06), 0 0 3px rgba(0, 0, 0, 0.06)',
        'elevation-b1-light': '0 0 1px 0 rgba(0, 0, 0, 0.20) inset, 0 0.5px 2px 0 rgba(0, 0, 0, 0.10) inset',
        'elevation-b1-dark': '0 0.5px 1.5px rgba(0, 0, 0, 0.40) inset, 0 0.2px 1.2px rgba(0, 0, 0, 0.10) inset',
        'ad-block-light': '0 2px 5px 0 rgba(0, 0, 0, 0.08), 0 24px 0 0 #FAFAFC',
        'ad-block-dark': '0 2px 6px 0 rgba(0, 0, 0, 0.24), 0 24px 0 0 #1F2326',
        'date-picker':
          '0.3px 0.5px 0px 0px rgba(255, 255, 255, 0.20) inset, -0.3px -0.5px 0px 0px rgba(255, 255, 255, 0.10) inset, 0px 8px 100px 0px rgba(0, 0, 0, 0.25), 0px 4px 32px 0px rgba(0, 0, 0, 0.10)',
        'copilot-loading-body': '0 0 64px 0 rgba(255, 255, 255, 0.12) inset',
      },
      zIndex: {
        'export-progress-bar': 3000,
        'common-popover': 2010,
        'common-popover-arrow': 2020,
        'ai-panel': 2000,
        'gantt-dialog': 2000,
        'bottom-tool-bar': 2000,
        'master-loading': 2000,
        'xmind-ai-header': 999,
        'modal-dialog-mask': 2000,
        'modal-dialog': 2001,
        'modal-dialog-overlay': 2002,
        'one-tap-login': 2003,
        'home-sidebar': 1200,
        'file-access-request-dialog': 2000,
        'free-trial-push': 2000,
        'ai-global-completion': 2001,
        'access-requests-temporal-message': 4000,
        'ai-copilot-loading': 2005,
        'ai-bar': 2006,
        'pitch-video-view': 2005,
      },
      transitionTimingFunction: {
        'productive-standard': 'cubic-bezier(0.2, 0, 0.4, 1)',
        'productive-entrance': 'cubic-bezier(0, 0.3, 0.4, 1)',
        'productive-exit': 'cubic-bezier(0.2, 0, 0.6, 1)',
        'productive-spring': 'cubic-bezier(0.2, 0.9, 0.5, 1.1)',
        'expressive-standard': 'cubic-bezier(0.4, 0.1, 0.3, 1)',
        'expressive-entrance': 'cubic-bezier(0, 0.5, 0.4, 1)',
        'expressive-exit': 'cubic-bezier(0.4, 0.1, 1, 1)',
        'expressive-spring': 'cubic-bezier(0.4, 0.1, 0.3, 1.1)',
      },
      transitionDuration: {
        'short-1': '50ms',
        'short-2': '100ms',
        'short-3': '150ms',
        'medium-1': '200ms',
        'medium-2': '250ms',
        'medium-3': '300ms',
        'long-1': '350ms',
        'long-2': '400ms',
        'long-3': '500ms',
        'extra-long-1': '600ms',
        'extra-long-2': '800ms',
        'extra-long-3': '1200ms',
      },
      transitionDelay: {
        'short-1': '20ms',
        'short-2': '40ms',
        'medium-1': '80ms',
        'medium-2': '150ms',
        'long-1': '400ms',
        'long-2': '800ms',
        'extra-long-1': '1200ms',
        'extra-long-2': '1800ms',
      },
      keyframes: {
        'move-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'move-down': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'slide-in-top': {
          '0%': { opacity: '0', transform: 'translateY(-40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-out-top': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-40px)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'scale-out': {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.9)' },
        },
        'slide-in-bottom': {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-out-bottom': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(100%)' },
        },
        'slide-out-left': {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(-100%)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-out-right': {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(100%)' },
        },
      },
      animation: {
        'move-up': 'move-up 0.2s ease forwards',
        'move-down': 'move-down 0.2s ease forwards',
        'dialog-enter': 'slide-in-top 300ms cubic-bezier(0.4, 0.1, 0.3, 1) forwards',
        'mobile-dialog-enter': 'slide-in-left 300ms cubic-bezier(0.4, 0.1, 0.3, 1) forwards',
        'mask-enter': 'fade-in 100ms cubic-bezier(0.2, 0, 0.4, 1) forwards',
        'dialog-exit': 'slide-out-top 300ms cubic-bezier(0.4, 0.1, 1, 1) forwards',
        'menu-enter': 'scale-in 300ms cubic-bezier(0, 0.5, 0.4, 1) forwards',
        'menu-exit': 'scale-out 200ms cubic-bezier(0.4, 0.1, 1, 1) forwards',
        'popover-enter': 'scale-in 300ms cubic-bezier(0.2, 0.9, 0.5, 1.1) forwards',
        'popover-exit': 'scale-out 200ms cubic-bezier(0.4, 0.1, 1, 1) forwards',
        'tooltip-enter': 'fade-in 200ms cubic-bezier(0.2, 0, 0.4, 1)  forwards',
        'tooltip-exit': 'fade-out 100ms cubic-bezier(0.4, 0.1, 1, 1) forwards',
        'drawer-enter': 'slide-in-bottom 200ms cubic-bezier(0, 0.5, 0.4, 1) forwards',
        'drawer-exit': 'slide-out-bottom 200ms cubic-bezier(0.4, 0.1, 1, 1) forwards',
        'drawer-left-exit': 'slide-out-left 200ms cubic-bezier(0.4, 0.1, 1, 1) forwards',
        'drawer-right-enter': 'slide-in-right 200ms cubic-bezier(0, 0.5, 0.4, 1) forwards',
        'drawer-right-exit': 'slide-out-right 200ms cubic-bezier(0.4, 0.1, 1, 1) forwards',
      },
    },
  },
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant('open', ['&.uk-open'])
    }),
  ],
}
