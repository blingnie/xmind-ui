<template>
  <popover
    ref="popoverRef"
    :popover-id="menuPopoverId"
    :parent-id="parentId"
    v-model="isPopoverOpen"
    :position="isPhoneSizeViewportWidth ? 'bottom-drawer' : position"
    :offset-x="offsetX"
    :offset-y="offsetY"
    :is-hover-trigger="!!isHoverTrigger"
    :arrow="arrow"
    :is-disabled="disabled"
    :name-space="menuPopoverNameSpace"
    :drawer-animation="drawerAnimation"
    :trigger-rect="triggerRect"
    :min-popover-height="minPopoverHeight"
    :disable-bottom-drawer-mask="disableBottomDrawerMask"
    :popover-width-match-trigger="popoverWidthMatchTrigger"
    :hover-leave-behavior="hoverLeaveBehavior"
  >
    <template v-if="$slots['trigger']" #trigger="{ popoverId, isActive }">
      <slot name="trigger" :popover-id="popoverId" :is-active="isActive"></slot>
    </template>

    <template v-if="!isPhoneSizeViewportWidth" #content>
      <div
        v-if="!isTopScrollIndicatorVisible && isShowScrollIndicator"
        class="indicator-top pointer-events-none absolute left-0 top-0 z-10 flex w-full justify-center rounded-t-lg bg-menu-indicator-top-gradient-light pb-3 pt-1 text-text-tertiary-light dark:bg-menu-indicator-top-gradient-dark dark:text-text-tertiary-dark"
      >
        <fw-icon name="chevron-upward" />
      </div>
      <div
        :class="twMerge('no-scrollbar desktop-menu-content relative flex max-h-full flex-col gap-1 overflow-y-auto p-2', contentClass)"
        :style="[menuMinimumWidth ? { minWidth: menuMinimumWidth + 'px' } : {}]"
      >
        <span v-if="isShowScrollIndicator" ref="topScrollIndicator" class="-mt-1 h-0 w-px"></span>
        <template v-for="(item, index) of menuItemsComposed" :key="index">
          <template v-if="!isDivider(item)">
            <template v-if="!item.subMenuItems">
              <slot name="menu-item" :item="item">
                <menu-icon-button
                  :icon-name="item.iconName"
                  :icon-class="item.iconClass"
                  :icon-size="item.iconSize"
                  :disabled="item.disabled"
                  :class="menuItemClass"
                  data-focus="not-allow"
                  @click.stop.prevent="item.action"
                  @mouseenter="onDesktopMenuItemHover()"
                >
                  {{ item.title }}
                  <template #right>
                    <slot name="item-right" :item="item"></slot>
                  </template>
                </menu-icon-button>
              </slot>
            </template>
            <menu-popover
              v-else
              :menu-items="item.subMenuItems"
              :content-class="subMenuContentClass"
              :parent-id="menuPopoverId"
              :menu-item-class="subMenuItemClass"
              :name-space="menuPopoverNameSpace"
              :position="isPhoneSizeViewportWidth ? 'bottom-drawer' : 'right-top'"
              :disabled="item.disabled"
              :offset-x="0"
              :offset-y="-8"
              :is-hover-trigger="true"
              :min-popover-height="minPopoverHeight"
              :is-show-scroll-indicator="isShowScrollIndicator"
              :hover-leave-behavior="'keep'"
            >
              <template #trigger="{ popoverId }">
                <menu-icon-button
                  :icon-name="item.iconName"
                  :icon-class="item.iconClass"
                  :icon-size="item.iconSize"
                  :class="twMerge('w-full', menuItemClass)"
                  :disabled="item.disabled"
                  data-focus="not-allow"
                  @mouseenter="onDesktopMenuItemHover(popoverId)"
                >
                  <span>{{ item.title }}</span>
                  <template #right>
                    <slot name="item-right" :item="item">
                      <fw-icon
                        name="chevron-forward"
                        :width="14"
                        :height="14"
                        :class="!item.disabled ? 'text-icon-tertiary-light dark:text-icon-tertiary-dark' : ''"
                      />
                    </slot>
                  </template>
                </menu-icon-button>
              </template>
              <template #item-right="{ item: subitem }">
                <slot name="subitem-right" :item="subitem"></slot>
              </template>
            </menu-popover>
          </template>
          <div v-else class="px-2 py-1"><divider class="border-menu-divider-light dark:border-menu-divider-dark" /></div>
        </template>
        <span v-if="isShowScrollIndicator" ref="bottomScrollIndicator" class="-mt-1 h-0 w-px"></span>
      </div>
      <div
        v-if="!isBottomScrollIndicatorVisible && isShowScrollIndicator"
        class="indicator-bottom pointer-events-none absolute bottom-0 left-0 z-10 flex w-full justify-center rounded-b-lg bg-menu-indicator-bottom-gradient-light pb-1 pt-3 text-text-tertiary-light dark:bg-menu-indicator-bottom-gradient-dark dark:text-text-tertiary-dark"
      >
        <fw-icon name="chevron-downward" />
      </div>
    </template>

    <template v-if="isPhoneSizeViewportWidth" #drawer-container="{ isRoot: isRootMenu, isDrawerActive }">
      <bottom-drawer
        ref="bottomDrawerRef"
        :drawer-id="mobileDrawerId"
        :class="
          twMerge(
            'gap-2 pt-6',
            isRootMenu
              ? 'border border-border-panel-light bg-material-acrylic-light shadow-elevation-l4-light backdrop-blur-md dark:border-border-panel-dark dark:bg-material-acrylic-dark dark:shadow-elevation-l4-dark'
              : 'border border-transparent bg-transparent shadow-none backdrop-blur-none dark:border-transparent dark:bg-transparent dark:shadow-none dark:backdrop-blur-none',
            bottomDrawerClass,
          )
        "
      >
        <!-- mobile header -->
        <slot name="mobile-header">
          <div class="flex w-full items-center justify-between gap-2 px-6 pb-4 text-mobile-headline-small">
            <rounded-icon
              v-if="isShowBackwardsButton"
              icon-name="chevron-backward"
              :class="twMerge('shrink-0 transition-all duration-300 ease-linear', !isDrawerActive ? 'translate-x-[-100%] opacity-0' : '')"
              @click.prevent.stop="closeCurrentPopover"
            />
            <span
              v-if="menuName"
              :class="
                twMerge(
                  'truncate transition-all duration-300 ease-linear',
                  !isDrawerActive ? 'translate-x-[-100%] opacity-0' : '',
                  isShowBackwardsButton ? 'flex-1 text-center' : 'flex-1',
                )
              "
            >
              {{ menuName }}
            </span>
            <!-- this is a workaround: only the root close are visible, but every invisible close could be click and fire close all popovers -->
            <close :class="twMerge('shrink-0', !isRootMenu && 'opacity-0')" @click.prevent.stop="closeAllPopovers" />
          </div>
        </slot>

        <slot name="mobile-before-menu-content"></slot>

        <div
          class="no-scrollbar flex flex-1 flex-col overflow-y-auto px-4 pb-4 transition-transform duration-300 ease-linear"
          :class="twMerge(!isDrawerActive ? 'translate-x-[-100%]' : '')"
        >
          <slot name="mobile-menu-content-prepend"></slot>

          <slot name="mobile-menu-content">
            <div class="flex flex-col gap-3 rounded-lg">
              <div v-for="(menuItemGroup, index) of menuItemsGroupByDivider" :key="index">
                <div
                  v-if="$slots['mobile-menu-group-header']"
                  class="mb-1 w-full truncate px-4 text-mobile-caption-header text-text-tertiary-light dark:text-text-tertiary-dark"
                >
                  <slot name="mobile-menu-group-header" :menu-item-group="menuItemGroup" :index="index"> </slot>
                </div>
                <div class="rounded-lg bg-fill-surfaceBright-light dark:bg-fill-surfaceBright-dark">
                  <template v-for="(item, itemIndex) of menuItemGroup" :key="itemIndex">
                    <menu-icon-button
                      v-if="!item.subMenuItems"
                      :icon-name="item.iconName"
                      :icon-class="item.iconClass"
                      :icon-size="item.iconSize"
                      :disabled="item.disabled"
                      :class="twMerge('h-[56px] w-full px-4', menuItemClass)"
                      @click.prevent.stop="item.action"
                    >
                      <template #left>
                        <slot name="item-left" :item="item"></slot>
                      </template>
                      {{ item.title }}
                      <template #right>
                        <slot name="item-right" :item="item"></slot>
                      </template>
                    </menu-icon-button>

                    <menu-popover
                      v-else
                      :menu-items="item.subMenuItems"
                      :content-class="subMenuContentClass"
                      :menu-item-class="subMenuItemClass"
                      :parent-id="menuPopoverId"
                      position="bottom-drawer"
                      :name-space="menuPopoverNameSpace"
                      :disabled="item.disabled"
                      :menu-name="item.menuName || item.title"
                      drawer-animation="right-slide-in-out"
                      :bottom-drawer-class="bottomDrawerClass"
                      :is-show-backwards-button="true"
                    >
                      <template #trigger>
                        <menu-icon-button
                          :icon-name="item.iconName"
                          :icon-class="item.iconClass"
                          :icon-size="item.iconSize"
                          :class="twMerge('h-[56px] w-full px-4', menuItemClass)"
                          :disabled="item.disabled"
                        >
                          <span>{{ item.title }}</span>
                          <template #right>
                            <fw-icon name="chevron-forward" class="text-icon-tertiary-light dark:text-icon-tertiary-dark" />
                          </template>
                        </menu-icon-button>
                      </template>
                      <template #item-right="{ item: subitem }">
                        <slot name="subitem-right" :item="subitem"></slot>
                      </template>
                    </menu-popover>

                    <div v-if="itemIndex < menuItemGroup.length - 1" class="w-full pl-4">
                      <divider class="border-menu-divider-light dark:border-menu-divider-dark" />
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </slot>

          <slot name="mobile-after-menu-content"></slot>
        </div>
      </bottom-drawer>
    </template>
  </popover>
</template>
<script lang="ts" setup>
import { ref, computed, watch, onBeforeUnmount, useTemplateRef } from 'vue'
import Popover, { type PopoverProps } from 'client/components/base/popover.vue'
import MenuIconButton from 'client/components/composite/menu-icon-button.vue'
import BottomDrawer from 'client/components/base/bottom-drawer.vue'
import Divider from 'client/components/base/divider.vue'
import Close from 'client/components/base/close.vue'
import roundedIcon from 'client/components/base/rounded-icon.vue'

import { isDivider, type menuBtnItem, type PopoverPosition, type MenuItem } from 'client/components/types'
import { generateShortUUID } from 'utils/shortUUID'
import { useWindowResize } from 'client/composables/window-resize'
import { usePopoverChain } from 'client/store/popover-chain'
import { useGlobalEvents } from 'client/store/global-events'
import { useElementVisibility } from '@vueuse/core'

type Props = Pick<
  PopoverProps,
  | 'parentId'
  | 'offsetX'
  | 'offsetY'
  | 'isHoverTrigger'
  | 'nameSpace'
  | 'arrow'
  | 'drawerAnimation'
  | 'disableBottomDrawerMask'
  | 'triggerRect'
  | 'minPopoverHeight'
  | 'popoverWidthMatchTrigger'
  | 'hoverLeaveBehavior'
> & {
  menuItems: MenuItem[]
  position?: PopoverPosition
  menuName?: string
  disabled?: boolean
  isShowBackwardsButton?: boolean
  menuItemClass?: VueClass
  subMenuItemClass?: VueClass
  contentClass?: VueClass
  subMenuContentClass?: VueClass
  bottomDrawerClass?: VueClass
  closeMobileDrawerOnOtherDrawerOpen?: boolean
  isShowScrollIndicator?: boolean
  menuMinimumWidth?: number
}

defineOptions({
  name: 'MenuPopover',
})

const bottomDrawerRef = useTemplateRef('bottomDrawerRef')
const topScrollIndicator = useTemplateRef('topScrollIndicator')
const bottomScrollIndicator = useTemplateRef('bottomScrollIndicator')

const popoverRef = ref<InstanceType<typeof Popover>>()

const props = withDefaults(defineProps<Props>(), {
  offsetX: 0,
  offsetY: 7,
  isHoverTrigger: false,
  position: 'bottom-left',
  menuName: '',
  disabled: false,
  triggerRect: null,
  isShowBackwardsButton: false,
  nameSpace: null,
  menuItemClass: '',
  subMenuItemClass: '',
  contentClass: '',
  subMenuContentClass: '',
  bottomDrawerClass: '',
  arrow: null,
  drawerAnimation: 'slide-in-out',
  disableBottomDrawerMask: false, // if true, the bottom drawer mask will not be rendered
  closeMobileDrawerOnOtherDrawerOpen: true,
  isShowScrollIndicator: false,
  popoverWidthMatchTrigger: false,
  menuMinimumWidth: 240,
  hoverLeaveBehavior: undefined,
})

const emit = defineEmits(['open', 'close'])

const isTopScrollIndicatorVisible = props.isShowScrollIndicator && useElementVisibility(topScrollIndicator)
const isBottomScrollIndicatorVisible = props.isShowScrollIndicator && useElementVisibility(bottomScrollIndicator)

const { isPhoneSizeViewportWidth } = useWindowResize()
const { closeAll, closeOpenedPopover, getPopover } = usePopoverChain()

const isPopoverOpen = defineModel('isMenuOpened', {
  type: Boolean,
  default: false,
})

const menuPopoverNameSpace = props.nameSpace || 'menu-popover' + generateShortUUID() // use to communicate with popover chain
const menuPopoverId = generateShortUUID(12)

const mobileDrawerId = computed(() => menuPopoverNameSpace + generateShortUUID())

const onDesktopMenuItemHover = (triggerPopoverId?: string) => {
  const parentIds = []
  const collectParentIds = (id: string) => {
    const popoverChainItem = getPopover(menuPopoverNameSpace, id)
    if (popoverChainItem?.parentId) {
      parentIds.push(popoverChainItem.parentId)
      collectParentIds(popoverChainItem.parentId)
    }
  }
  collectParentIds(menuPopoverId)
  // menu popover id is current menu
  // trigger popover id is the submenu that is going to open
  // parentIds are all the parent popovers of current menu
  closeOpenedPopover(menuPopoverNameSpace, [menuPopoverId, triggerPopoverId, ...parentIds].filter(Boolean) as string[])
}

const closeCurrentPopover = () => {
  popoverRef.value?.closePopover()
}

const closeAllPopovers = () => {
  closeAll(menuPopoverNameSpace)
}

const menuItemsComposed = computed(() => {
  return props.menuItems.map(item => {
    if (isDivider(item)) {
      return item // Return the divider item as is
    }
    return {
      ...item,
      action: () => {
        if (item.actionCloseType === 'none') {
          // do nothing
        } else if (item.actionCloseType === 'current') {
          closeCurrentPopover()
        } else {
          // default to 'all'
          closeAllPopovers()
        }
        item.action?.()
      },
    }
  })
})

const menuItemsGroupByDivider = computed<Array<menuBtnItem[]>>(() => {
  const groups: Array<menuBtnItem[]> = []
  let currentGroup: menuBtnItem[] = []

  for (const item of menuItemsComposed.value) {
    if (isDivider(item)) {
      if (currentGroup.length > 0) {
        groups.push(currentGroup)
        currentGroup = []
      }
    } else {
      currentGroup.push(item)
    }
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup)
  }

  return groups
})

watch(
  () => isPopoverOpen.value,
  () => {
    if (isPopoverOpen.value) {
      emit('open')
    } else {
      emit('close')
    }
  },
  { immediate: true, flush: 'post' },
)

const unListen = useGlobalEvents().listen<{ id: string }>('bottomDrawerRendered', ({ id }) => {
  if (props.closeMobileDrawerOnOtherDrawerOpen && !id.startsWith(menuPopoverNameSpace) && isPhoneSizeViewportWidth.value) {
    closeAllPopovers()
  }
})

onBeforeUnmount(() => {
  unListen?.()
})

defineExpose({
  close: closeAllPopovers,
  bottomDrawerRef,
})
</script>
<style scoped>
.desktop-menu-content > * {
  @apply shrink-0;
}
</style>
