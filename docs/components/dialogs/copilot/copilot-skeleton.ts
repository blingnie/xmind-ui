import { computed } from 'vue'
import { useSkeleton } from 'app/fragments/compositions/ui/format-panel'
import { type IconName } from 'client/components/icon/icons'
import { $T } from 'client/library/translation'

// Skeleton structure options
const { skeletonThemeItems } = useSkeleton()

export type PredefinedSkeletonGroupId = 'Auto' | 'Mind Map' | 'Logic Chart' | 'Brace Map' | 'Org Chart' | 'Tree Chart' | 'Timeline' | 'Fishbone'

// TODO: Hardcoded skeleton IDs based on copilot dialog's requirements
const predefinedSkeletonGroups: { groupId: PredefinedSkeletonGroupId; iconName: IconName }[] = [
  { groupId: 'Mind Map', iconName: 'mindmaps' },
  { groupId: 'Logic Chart', iconName: 'logic-chart-right' },
  { groupId: 'Brace Map', iconName: 'brace-map-right' },
  { groupId: 'Org Chart', iconName: 'org-chart-down' },
  { groupId: 'Tree Chart', iconName: 'tree-chart-balance-down' },
  { groupId: 'Timeline', iconName: 'timeline-horizontal-right' },
  { groupId: 'Fishbone', iconName: 'fishbone-right' },
]

export const supportSkeletonGroups = computed<{ groupId: PredefinedSkeletonGroupId; label: string; iconName: IconName }[]>(() => {
  const supportedSkeletionGroupIds = predefinedSkeletonGroups
    .map(group => group.groupId)
    .filter(groupId => skeletonThemeItems.value.map(group => group.id).includes(groupId))

  const groups = supportedSkeletionGroupIds.map(groupId => {
    const group = predefinedSkeletonGroups.find(item => item.groupId === groupId)
    return {
      groupId,
      label: skeletonThemeItems.value.find(item => item.id === groupId)?.label,
      iconName: group.iconName,
    }
  })

  groups.unshift({ groupId: 'Auto', label: $T('Auto'), iconName: 'map-auto' })
  return groups
})

export const computeDefaultSkeletonItemIdFromGroup = (groupId: string) => {
  return skeletonThemeItems.value.find(item => item.id === groupId)?.items[0].id
}
