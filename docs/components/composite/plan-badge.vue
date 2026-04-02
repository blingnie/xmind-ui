<template>
  <base-badge :label="planLabel" :text-class="textClass" :custom-class="customClass" @click="handleClickBadge" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseBadge from 'client/components/base/badge.vue'
import { type PlusAccount } from 'client/server-export'
import { REGION } from 'client/constants'

const props = defineProps<{
  plan: PlusAccount['plan'] | 'pro'
}>()

const emits = defineEmits<{
  (e: 'click-free-badge'): void
}>()

const planLabel = computed(() => {
  switch (props.plan) {
    case 'basic':
      return 'Free'
    case 'pro':
      return 'Pro'
    case 'personal':
      return 'Personal'
    case 'premium':
      return REGION === 'cn' ? 'Pro+' : 'Premium'
    case 'essential':
      return 'Essential'
    case 'team':
      return 'Team'
    case 'business':
      return 'Business'
    case 'enterprise':
      return 'Enterprise'
    default:
      return ''
  }
})
const textClass = computed(() => {
  switch (props.plan) {
    case 'pro':
    case 'personal':
    case 'premium':
    case 'essential':
    case 'team':
    case 'business':
    case 'enterprise':
      return 'text-red-500'
    case 'basic':
    default:
      return 'text-text-tertiary-light dark:text-text-tertiary-dark'
  }
})

const customClass = computed(() => {
  switch (props.plan) {
    case 'pro':
    case 'personal':
    case 'premium':
    case 'essential':
    case 'team':
    case 'business':
    case 'enterprise':
      return 'bg-[rgba(250,74,30,0.15)] h-5 rounded px-[6px]'
    case 'basic':
    default:
      return 'h-5 bg-mask-overlay-s-light dark:bg-mask-overlay-s-dark hover:bg-mask-overlay-m-light dark:hover:bg-mask-overlay-m-dark active:bg-mask-overlay-l-light dark:active:bg-mask-overlay-l-dark rounded px-[6px]'
  }
})

const handleClickBadge = () => {
  if (props.plan === 'basic') {
    emits('click-free-badge')
  }
}
</script>
