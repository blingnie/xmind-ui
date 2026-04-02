<template>
  <template v-if="isVisible">
    <li v-if="divider" class="uk-menu-divider"></li>

    <li v-else-if="withSubItem" class="uk-menu-item with-sub-item pr-1">
      <img v-if="imgSrc" uk-svg :data-src="imgSrc" class="uk-position-absolute" style="width: 24px; height: 24px; left: 4px; top: 4px" />
      <button
        :id="id"
        :disabled="disabled"
        class="with-sub-menu-btn fw-override uk-button uk-button-list !pr-3"
        :class="btnClass"
        style="line-height: 24px; padding-left: 36px; font-size: 13px"
      >
        {{ text }}
      </button>
      <span class="uk-position-absolute" style="right: 0; top: 4px">
        <img uk-svg :src="$toResourceURL('/assets/static/images/editor-top-bar/arrow-right.svg')" />
      </span>
    </li>

    <li v-else-if="upgradeBtnImg" class="uk-menu-item">
      <button class="fw-override uk-button uk-button-list !pr-3" :class="btnClass" style="padding: 0" @click="action">
        <img uk-img :data-src="upgradeBtnImg" style="width: 100%" />
      </button>
    </li>

    <li v-else-if="text" class="uk-menu-item">
      <button
        :disabled="disabled"
        class="menu-item-content uk-position-relative fw-override uk-button uk-button-list !pr-3"
        :class="btnClass"
        style="font-size: 13px; font-weight: 500"
        :style="{ 'pointer-events': disabled ? 'none' : null }"
        @click="action"
      >
        <span v-show="isPro" class="pro-limited">
          <img class="uk-img" :src="toURL('/assets/static/images/home-sidebar/pricing-lock.png')" alt="" />
        </span>
        <img v-if="imgSrc" uk-svg :data-src="imgSrc" style="width: 24px; height: 24px" />
        <span class="list-item-desc" :class="isPro && 'is-limited'">{{ text }}</span>
        <span v-if="annotation" class="uk-text-muted uk-position-center-right fw-text-small menu-annotation"> {{ annotation }} </span>
        <span v-if="rightImageSource" class="append-icon" style="top: 4px">
          <img uk-svg :data-src="rightImageSource" />
        </span>
        <img
          v-if="isBeta"
          uk-svg
          class="beta-badge-item uk-position-center-right uk-preserve"
          :data-src="toURL('/assets/static/images/editor-top-bar/beta-badge.svg')"
        />
      </button>
    </li>
  </template>
</template>

<script lang="ts" setup>
export interface MenuItemProps {
  text?: string
  action?: (...args: any[]) => any
  disabled?: boolean
  imgSrc?: string
  rightImageSource?: string
  divider?: boolean
  isVisible?: boolean
  withSubItem?: boolean
  id?: string
  upgradeBtnImg?: string
  annotation?: string
  isBeta?: boolean
  btnClass?: string
  isPro?: boolean
}

withDefaults(defineProps<MenuItemProps>(), {
  text: '',
  action: () => null,
  disabled: false,
  imgSrc: '',
  rightImageSource: '',
  divider: false,
  isVisible: true,
  withSubItem: false,
  id: '',
  annotation: '',
  btnClass: '',
  upgradeBtnImg: '',
  isBeta: false,
  isPro: false,
})
</script>

<style lang="less" scoped>
@import '../styles/new-ui/new-variables';

[color-scheme='light'] .menu-item-content {
  --beta-badge-fill-color: @transparent-dark-6;
}
[color-scheme='dark'] .menu-item-content {
  --beta-badge-fill-color: @transparent-white-5;
}

.menu-annotation {
  right: 6px;
}

&:deep(.beta-badge-item.uk-svg) {
  margin-right: 4px;
  fill: var(--beta-badge-fill-color);
}

.uk-menu-item.with-sub-item {
  position: relative;
}

span.is-limited {
  padding-left: 22px;
}

span.pro-limited {
  width: 14px;
  height: 14px;
}
</style>
