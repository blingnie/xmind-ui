// @ts-nocheck
// Read more: https://github.com/vuejs/core/pull/3399
// biome-ignore lint: disable
export {}

/* prettier-ignore */
declare module 'vue' {
  export interface GlobalComponents {
    // Base Components
    FwBadge: (typeof import('./../components/base/badge.vue'))['default']
    FwButton: (typeof import('./../components/base/button.vue'))['default']
    FwAiButton: (typeof import('./../components/base/ai-button.vue'))['default']
    FwAiInput: (typeof import('./../components/base/ai-input.vue'))['default']
    FwAiTextarea: (typeof import('./../components/base/ai-textarea.vue'))['default']
    FwCapsule: (typeof import('./../components/base/capsule.vue'))['default']
    FwCheckbox: (typeof import('./../components/base/checkbox.vue'))['default']
    FwClose: (typeof import('./../components/base/close.vue'))['default']
    FwDivider: (typeof import('./../components/base/divider.vue'))['default']
    FwDraggableList: (typeof import('./../components/base/draggable-list.vue'))['default']
    FwFrameBar: (typeof import('./../components/base/frame-bar.vue'))['default']
    FwImageContainer: (typeof import('./../components/base/image-container.vue'))['default']
    FwInput: (typeof import('./../components/base/input.vue'))['default']
    FwMenuButton: (typeof import('./../components/base/menu-button.vue'))['default']
    FwPopover: (typeof import('./../components/base/popover.vue'))['default']
    FwSelect: (typeof import('./../components/base/select.vue'))['default']
    FwSkeletonAnimation: (typeof import('./../components/base/skeleton-animation.vue'))['default']
    FwTab: (typeof import('./../components/base/tab.vue'))['default']
    FwTable: (typeof import('./../components/base/table.vue'))['default']
    FwTextarea: (typeof import('./../components/base/textarea.vue'))['default']
    FwToggle: (typeof import('./../components/base/toggle.vue'))['default']
    FwTooltip: (typeof import('./../components/base/tooltip.vue'))['default']
    FwSkeletonAnimation: (typeof import('./../components/base/skeleton-animation.vue'))['default']
    FwResponsiveWrapper: (typeof import('./../components/base/responsive-wrapper.vue'))['default']
    FwSvgImage: (typeof import('./../components/base/svg-image.vue'))['default']
    FwEmptyUserProfileIcon: (typeof import('./../components/base/empty-user-profile-icon.vue'))['default']
    FwMicroIcon: (typeof import('./../components/base/micro-icon.vue'))['default']
    FwCarousel: (typeof import('./../components/base/carousel.vue'))['default']

    // Icon Components
    FwIcon: (typeof import('./../components/icon/icon.vue'))['default']

    // Composite Components
    FwMemberItem: (typeof import('./../components/composite/member-item.vue'))['default']
    FwCheckboxItem: (typeof import('./../components/composite/checkbox-item.vue'))['default']
    FwLoading: (typeof import('./../components/composite/loading.vue'))['default']
    FwSliderInput: (typeof import('./../components/base/slider-input.vue'))['default']
    FwPlanBadge: (typeof import('./../components/composite/plan-badge.vue'))['default']
    FwSwitcher: (typeof import('./../components/composite/switcher.vue'))['default']
    FwTileButton: (typeof import('./../components/composite/tile-button.vue'))['default']
    FwMenuIconButton: (typeof import('./../components/composite/menu-icon-button.vue'))['default']
    FwMenuPopover: (typeof import('./../components/composite/menu-popover.vue'))['default']
    FwAccordion: (typeof import('./../components/composite/accordion.vue'))['default']
  }
}
