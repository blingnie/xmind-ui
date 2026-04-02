import { IconName } from 'client/components/icon/icons'

export type DividerItem = { divider: true }

export type menuBtnItem = {
  key?: string
  title: string
  iconName?: IconName
  iconClass?: VueClass
  iconSize?: number
  action?: () => void | Promise<void>
  actionCloseType?: 'all' | 'current' | 'none' // default to 'all'
  disabled?: boolean
  subMenuItems?: MenuItem[]
  menuName?: string
  rightIconName?: IconName
  meta?: Record<string, any>
}

export type MenuItem = menuBtnItem | DividerItem

export function isDivider(item: MenuItem): item is DividerItem {
  return (item as DividerItem).divider === true
}

export type PopoverPosition =
  | 'bottom-center'
  | 'bottom-left'
  | 'bottom-right'
  | 'bottom-drawer'
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'left-top'
  | 'left-center'
  | 'left-bottom'
  | 'right-top'
  | 'right-center'
  | 'right-bottom'

export type BaseButtonTheme = 'default' | 'primary' | 'secondary' | 'ai' | 'danger' | 'link'

export type BaseButtonSize = 'small' | 'medium' | 'large'

export type Highlight = {
  isHighlight: boolean
  text: string
}

export interface TreeListItem {
  value: string
  text: string
  type: 'sheet' | 'map' | 'topic' | 'note' | 'label' | 'marker' | 'task' | 'boundary' | 'link' | 'relationship' | 'todo'
  items?: TreeListItem[]
  isBold?: boolean
  title?: string
  isTitle?: boolean
  image?: string
  icon?: IconName
  highlight?: Highlight[]
  sheetId?: string
  isRootTopic?: boolean
}
