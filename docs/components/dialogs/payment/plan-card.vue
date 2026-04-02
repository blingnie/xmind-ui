<template>
  <div
    class="plan-card flex flex-col items-start rounded-2xl shadow-elevation-l2-light dark:shadow-elevation-l2-dark"
    :class="{ selected: selected, highlight: highlight, 'outline-border': outline }"
  >
    <span v-if="topTitle" class="self-stretch px-[32px] py-[12px] text-mobile-subhead-mini text-light-grey-1 sm:text-desktop-subhead-mini">
      {{ topTitle }}
    </span>

    <div
      class="plan-card-content flex h-full w-full flex-col items-start border p-[32px] sm:min-h-[500px]"
      :class="[
        selected
          ? 'rounded-xl border-transparent bg-fill-surfaceBright-light dark:bg-fill-surfaceBright-dark'
          : 'rounded-2xl border-border-translucent-light bg-fill-surface-light dark:border-border-translucent-dark dark:bg-fill-surface-dark',
      ]"
    >
      <div class="mb-[16px] flex w-full flex-col items-start justify-center gap-2">
        <div class="flex h-7 w-full items-center justify-between text-mobile-subhead-large sm:text-desktop-subhead-large" :class="data.nameClass">
          <slot name="plan-name">
            <span>{{ $T(data.name) }}</span>
          </slot>
        </div>
        <span class="h-[34px] sm:h-[40px]">
          <slot name="plan-price"></slot>
        </span>
        <span
          class="min-h-[34px] text-mobile-body-medium text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-body-medium"
          :class="data.descriptionClass"
        >
          {{ $T(data.description) }}
        </span>
      </div>

      <slot name="plan-button"></slot>

      <div class="mt-[24px] flex w-full flex-col items-start justify-center gap-4">
        <span
          v-if="data.detailsHeader"
          class="text-mobile-body-small text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-body-small"
          :class="data.detailsHeaderClass"
        >
          {{ $T(data.detailsHeader) }}
        </span>
        <div v-for="(detail, index) in data.details" :key="index" class="flex items-center gap-2 self-stretch" :class="data.detailsClass">
          <template v-if="detail.separator">
            <span class="w-full border-t border-transparent-dark-2 dark:border-transparent-white-2"></span>
          </template>
          <template v-else>
            <img v-if="detail.icon && detail.isIconSvg" uk-svg :data-src="detail.icon" class="shrink-0" :class="detail.iconClass" />
            <img v-else-if="detail.icon && !detail.isIconSvg" uk-img :data-src="detail.icon" class="shrink-0" :class="detail.iconClass" />
            <icon
              v-else
              name="tick"
              :class="[selected || highlight ? 'icon-pricing text-text-accent' : 'text-transparent-dark-7 dark:text-transparent-white-7', 'shrink-0']"
            />
            <div class="flex flex-wrap items-center gap-1" :class="data.detailsClass">
              <span class="text-mobile-body-medium sm:text-desktop-body-medium">{{ $T(detail.text) }}</span>
              <span v-if="detail.tips" class="text-desktop-caption text-text-quaternary-light dark:text-text-quaternary-dark">
                {{ $T(detail.tips) }}
              </span>
              <icon
                v-show="detail.aiTag"
                name="ai-type"
                :class="[
                  selected || highlight ? 'icon-pricing text-text-accent' : 'text-transparent-dark-7 opacity-50 dark:text-transparent-white-7',
                  'inline-block',
                  'align-text-bottom',
                  'shrink-0',
                ]"
              />
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { PlanCardData } from 'client/library/payment/plans-card-data'
import Icon from 'client/components/icon/icon.vue'
import { $T } from 'client/library/translation'

const props = defineProps<{
  data: PlanCardData
  selected?: boolean
  highlight?: boolean
  outline?: boolean
  topTitle: string
}>()

const topTitle = computed(() => (props.selected ? props.topTitle : ''))
</script>

<style scoped>
* {
  user-select: none;
  -webkit-user-select: none;
}

.plan-card-content {
  --selected-color: #7f31ff;
}

.plan-card.outline-border .plan-card-content {
  border: 3px solid var(--selected-color);
}

.plan-card.selected {
  padding-left: 3px;
  padding-right: 3px;
  padding-bottom: 3px;
  background-image: linear-gradient(225deg, #e9913e 1%, #f20000 99.93%);
  background-origin: border-box;
  background-clip: padding-box, border-box;

  &.animate {
    background-size: 600%;
    animation: anime 8s linear infinite;
  }

  @keyframes anime {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
}
</style>
