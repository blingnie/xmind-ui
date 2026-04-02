<template>
  <div class="flex flex-col rounded-lg bg-fill-container-light py-3 dark:bg-fill-surfaceBright-dark">
    <div class="flex flex-col justify-between gap-3 px-3 pb-3 sm:flex-row sm:items-center sm:gap-0">
      <div class="flex flex-col gap-1 text-text-tertiary-light dark:text-text-tertiary-dark">
        <h3
          class="font-NeverMind-UI text-[15px] font-semibold leading-[21px] text-text-primary-light dark:text-text-primary-dark sm:text-[13px] sm:leading-[17px]"
        >
          {{ $T('Verify Domain') }}
        </h3>
        <div class="text-[11px] font-normal leading-[15px]">{{ $T('Members with a verified domain email can sign in via SSO.') }}</div>
      </div>
      <div>
        <fw-button :theme="'secondary'" :size="'small'" @click="emit('addDomain')">
          {{ $T('Add Domain') }}
        </fw-button>
      </div>
    </div>
    <fw-divider class="w-full"></fw-divider>
    <div class="px-3 pt-3">
      <div v-if="!domainList.length" class="flex flex-col items-center gap-1 py-4 text-text-tertiary-light dark:text-text-tertiary-dark sm:py-3">
        <img uk-svg class="h-5 w-5" :data-src="orgDomainSvg" alt="" />
        <div class="font-NeverMind-UI text-xs sm:text-[11px] sm:leading-[15px]">
          {{ $T('No domains configured.') }}
        </div>
      </div>
      <div v-else class="flex flex-col gap-3">
        <div v-for="domain in domainList" :key="domain.id">
          <div class="flex flex-row items-center justify-between">
            <span class="w-[120px] font-NeverMind-UI text-[13px] text-text-primary-light dark:text-text-primary-dark sm:text-xs sm:leading-[17px]">
              {{ domain.domain }}
            </span>
            <span class="rounded-[99px] bg-[#D4E4DD] px-1.5 py-[1px] font-NeverMind-UI text-[10px] leading-[14px] text-green-500 dark:bg-[#2B3C37]">
              {{ $T('Verified') }}
            </span>
            <div>
              <button class="uk-button uk-button-tile uk-button-icon uk-icon px-2">
                <img uk-svg :data-src="$toResourceURL('/assets/static/images/home-sidebar/more.svg')" />
              </button>
              <div uk-pop data-sel-close="button" :data-pos="'bottom-right'" data-offset="4" class="fw-override uk-popover !w-max">
                <ul uk-menu>
                  <button
                    class="menu-item-content uk-position-relative fw-override uk-button uk-button-list"
                    @click="emit('removeDomain', domain.domain)"
                  >
                    <div class="flex flex-row items-center gap-2 text-red-500">
                      <fw-icon name="trash" />
                      <span class="font-NeverMind-UI text-[13px] leading-[17px]">{{ $T('Delete') }}</span>
                    </div>
                  </button>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { $T } from 'client/library/translation'
import orgDomainSvg from 'client/assets/import-files/images/sso/org-domain.svg?url'
import { OrganizationDomain } from 'client/server-export'

defineProps<{
  domainList: OrganizationDomain[]
}>()

const emit = defineEmits<{
  (e: 'addDomain'): void
  (e: 'removeDomain', domain: string): void
}>()
</script>
