<script setup lang="ts">
import type { ComponentConfig } from '@xmind-ui/components/types/component-config'

const props = defineProps<{
  config: ComponentConfig
}>()

// 当前 props 状态（从 config 初始化默认值）
const currentProps = reactive<Record<string, any>>(
  Object.fromEntries(props.config.props.map(p => [p.name, p.default]))
)

// slot 内容
const slotContent = ref(
  props.config.slots?.[0]?.defaultContent ?? ''
)

// 生成代码字符串
const generatedCode = computed(() => {
  const attrs = props.config.props
    .filter(p => currentProps[p.name] !== p.default)
    .map(p => {
      const val = currentProps[p.name]
      if (typeof val === 'boolean') return val ? p.name : `:${p.name}="false"`
      return `:${p.name}="'${val}'"`.replace(/^:/, val === p.default ? '' : ':')
    })

  const allAttrs = props.config.props
    .map(p => {
      const val = currentProps[p.name]
      if (p.type === 'boolean') {
        if (val === true) return p.name
        if (val === false) return null
      }
      if (val === p.default && p.type !== 'boolean') return null
      return `${p.name}="${val}"`
    })
    .filter(Boolean)

  const attrsStr = allAttrs.length ? '\n  ' + allAttrs.join('\n  ') + '\n' : ''
  const slot = slotContent.value ? slotContent.value : ''
  return `<${props.config.name}${attrsStr}>\n  ${slot}\n</${props.config.name}>`
})

// 复制状态
const copied = ref(false)
async function copyCode() {
  await navigator.clipboard.writeText(generatedCode.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 1500)
}
</script>

<template>
  <div class="rounded-xl border border-[var(--color-border-translucent)] overflow-hidden">
    <!-- 预览区 -->
    <div class="min-h-40 flex items-center justify-center p-8 bg-[var(--color-fill-secondary)]">
      <slot :current-props="currentProps" :slot-content="slotContent" />
    </div>

    <!-- 控制面板 -->
    <div class="border-t border-[var(--color-border-translucent)] flex">
      <!-- Props 控件 -->
      <div class="flex-1 p-4 border-r border-[var(--color-border-translucent)]">
        <p class="text-xs font-medium text-[var(--color-text-tertiary)] mb-3 uppercase tracking-wider">Props</p>

        <div class="space-y-3">
          <!-- Slot 内容输入 -->
          <div v-if="config.slots?.length" class="flex items-center gap-3">
            <label class="text-xs text-[var(--color-text-secondary)] w-20 shrink-0">
              {{ config.slots[0].name }}
            </label>
            <input
              v-model="slotContent"
              type="text"
              class="flex-1 h-7 px-2 text-xs rounded-lg border border-[var(--color-border-translucent)] bg-transparent focus:outline-none focus:border-[var(--color-border-default)]"
            />
          </div>

          <!-- Props 控件 -->
          <div v-for="prop in config.props" :key="prop.name" class="flex items-center gap-3">
            <label class="text-xs text-[var(--color-text-secondary)] w-20 shrink-0">
              {{ prop.name }}
            </label>

            <!-- Boolean toggle -->
            <template v-if="prop.type === 'boolean'">
              <button
                class="w-8 h-4 rounded-full transition-colors relative"
                :class="currentProps[prop.name] ? 'bg-[var(--color-fill-accent-normal)]' : 'bg-[var(--color-fill-tertiary)]'"
                @click="currentProps[prop.name] = !currentProps[prop.name]"
              >
                <span
                  class="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform"
                  :class="currentProps[prop.name] ? 'left-4' : 'left-0.5'"
                />
              </button>
            </template>

            <!-- Enum select -->
            <template v-else-if="prop.type === 'enum'">
              <div class="flex gap-1">
                <button
                  v-for="opt in prop.options"
                  :key="opt"
                  class="px-2 py-0.5 text-xs rounded-md transition-colors"
                  :class="currentProps[prop.name] === opt
                    ? 'bg-[var(--color-fill-accent-normal)] text-[var(--color-text-invert)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-fill-secondary)]'"
                  @click="currentProps[prop.name] = opt"
                >
                  {{ opt }}
                </button>
              </div>
            </template>

            <!-- String / Number input -->
            <template v-else>
              <input
                v-model="currentProps[prop.name]"
                :type="prop.type === 'number' ? 'number' : 'text'"
                class="flex-1 h-7 px-2 text-xs rounded-lg border border-[var(--color-border-translucent)] bg-transparent focus:outline-none focus:border-[var(--color-border-default)]"
              />
            </template>
          </div>
        </div>
      </div>

      <!-- 代码面板 -->
      <div class="w-72 p-4 flex flex-col gap-2">
        <div class="flex items-center justify-between mb-1">
          <p class="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">Code</p>
          <button
            class="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
            @click="copyCode"
          >
            {{ copied ? '✓ Copied' : 'Copy' }}
          </button>
        </div>
        <pre class="text-xs leading-relaxed text-[var(--color-text-secondary)] whitespace-pre-wrap break-all font-mono">{{ generatedCode }}</pre>
      </div>
    </div>
  </div>
</template>
