export interface PropControl {
  label: string
  type: 'boolean' | 'select' | 'text' | 'number'
  defaultValue: any
  options?: Array<{ label: string; value: string | number | boolean }>
  min?: number
  max?: number
  step?: number
}

export interface SlotControl {
  label: string
  defaultValue: string
}

export interface ComponentConfig {
  name: string
  props: Record<string, PropControl>
  slots?: Record<string, SlotControl>
}
