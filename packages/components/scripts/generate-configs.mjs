import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const componentsDir = join(__dirname, '..')

/**
 * 从 Vue 组件的 <style> 部分提取所有使用的 CSS 变量
 */
function extractTokensFromComponent(filePath) {
  const content = readFileSync(filePath, 'utf-8')

  // 提取 <style> 部分
  const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
  if (!styleMatch) {
    return { colors: [], spacing: [], typography: [], radius: [], effects: [], other: [] }
  }

  const styleContent = styleMatch[1]

  // 提取所有 var(--xxx) 形式的 CSS 变量
  const varRegex = /var\(--([a-z0-9-]+)\)/gi
  const matches = styleContent.matchAll(varRegex)

  const tokens = new Set()
  for (const match of matches) {
    tokens.add(`--${match[1]}`)
  }

  // 按类型分类
  const result = {
    colors: [],
    spacing: [],
    typography: [],
    radius: [],
    effects: [],
    other: []
  }

  for (const token of Array.from(tokens).sort()) {
    if (token.startsWith('--color-') || token.startsWith('--button-bg-') ||
        token.startsWith('--button-content-') || token.startsWith('--button-border-')) {
      result.colors.push(token)
    } else if (token.startsWith('--spacing-') || token.startsWith('--button-padding-') ||
               token.startsWith('--button-height-')) {
      result.spacing.push(token)
    } else if (token.startsWith('--typo-')) {
      result.typography.push(token)
    } else if (token.startsWith('--radius-') || token.startsWith('--button-radius-')) {
      result.radius.push(token)
    } else if (token.startsWith('--shadow-') || token.startsWith('--effect-')) {
      result.effects.push(token)
    } else {
      result.other.push(token)
    }
  }

  return result
}

// 遍历所有组件目录并生成 token 配置
const skipDirs = ['utils', 'types', 'scripts', 'node_modules', 'dist', '.git']
const componentDirs = readdirSync(componentsDir).filter(name => {
  if (skipDirs.includes(name)) return false
  const path = join(componentsDir, name)
  try {
    return statSync(path).isDirectory()
  } catch {
    return false
  }
})

for (const componentName of componentDirs) {
  const componentPath = join(componentsDir, componentName, `${componentName}.vue`)
  const outputPath = join(componentsDir, componentName, `${componentName}.tokens.json`)

  try {
    const tokens = extractTokensFromComponent(componentPath)
    writeFileSync(outputPath, JSON.stringify(tokens, null, 2), 'utf-8')
    console.log(`✅ Generated tokens for ${componentName}`)
  } catch (err) {
    console.warn(`⚠️  Skipped ${componentName}: ${err.message}`)
  }
}

console.log('\n✅ All component tokens generated!')
