<template>
  <base-full-screen-dialog
    :is-opened="true"
    :is-closable="isCloseable"
    :class="['payment-dialog sm:!p-0 md:!p-[12px]', { '!pt-[64px] md:!pt-[72px] ': useContextStore().contexts.isHeaderShowed }]"
    :dialog-content-class="'!pt-[24px] sm:!pt-[24px] md:!pt-[48px]'"
    :dialog-body-class="'md:!bg-fill-surface-light md:dark:!bg-fill-surface-dark !bg-fill-container-light dark:!bg-fill-container-dark shadow-none md:shadow-elevation-g-light dark:md:shadow-elevation-g-dark'"
    @modal-dialog-close="handleClose"
  >
    <h1
      class="text-mobile-headline-small text-text-primary-light dark:text-text-primary-dark md:text-desktop-headline-large px-[16px] text-left md:mb-[48px] md:px-0 md:text-center"
    >
      {{ $T('Check Your Order') }}
    </h1>

    <fw-divider class="!border-divider-onContainer-light dark:!border-divider-onContainer-dark mb-[24px] mt-[24px] block md:hidden" />

    <div
      ref="paymentDialogRef"
      class="flex flex-col items-center justify-center gap-3 px-[16px] pb-[32px] md:flex-row md:items-start md:gap-4 md:px-[16px] lg:gap-12"
    >
      <!-- order summary box -->
      <div
        class="bg-fill-surface-light shadow-elevation-g-light dark:bg-fill-surface-dark dark:shadow-elevation-g-dark flex w-full flex-col justify-center gap-6 rounded-2xl p-[24px] md:w-96 md:rounded-none md:bg-transparent md:p-0 md:shadow-none dark:md:shadow-none"
      >
        <span class="text-mobile-subhead-large text-text-secondary-light dark:text-text-secondary-dark md:text-desktop-subhead-large">
          {{ $T('Order Summary') }}
        </span>
        <div class="flex flex-col items-start justify-center gap-5">
          <span v-if="orderVersion === 'duo'" class="text-desktop-headline-1 text-dark-grey-5 dark:text-light-grey-6">
            {{ `${$T('Xmind Duo Suite')}: 1 ${$T('year')}` }}
          </span>
          <span v-else-if="orderVersion === 'xmbund'" class="text-desktop-headline-1 text-dark-grey-5 dark:text-light-grey-6">
            {{ $T('Xmind Premium & Mapify Pro') }}
          </span>

          <div v-if="orderVersion === 'addon'" class="flex items-center justify-between self-stretch">
            <span class="text-desktop-headline-1">{{ $T('Credits Add-on') }}</span>
            <span class="text-desktop-headline-3 text-dark-grey-5 dark:text-light-grey-6">{{ $T('500 credits') }}</span>
          </div>

          <div class="flex flex-col justify-center gap-5 self-stretch">
            <!-- Team -->
            <div
              v-if="['plus', 'premium', 'essential', 'business', 'duo'].includes(orderVersion)"
              class="flex flex-col items-start gap-3 self-stretch"
            >
              <span v-if="isMyWorksTeam || ['plus', 'duo'].includes(orderVersion)" class="text-desktop-headline-1 truncate">
                {{ $T('My Works') }}
              </span>
              <template v-else>
                <span class="text-mobile-body-large text-text-tertiary-light dark:text-text-tertiary-dark md:text-desktop-body-large">
                  {{ $T('Team') }}
                </span>
                <div class="w-full" :class="{ visible: isFetchTeamFinished, invisible: !isFetchTeamFinished }">
                  <template v-if="upgradeTeam">
                    <fw-select
                      v-if="upgradableTeams.length > 1 && !isUpgradePlanOrder"
                      :trigger-size="'medium'"
                      :selected-key="upgradeTeamId"
                      :options="upgradableTeamsSelectOptions"
                      :position="'bottom-left'"
                      :theme="'muted'"
                      :trigger-classes="'!px-[4px]'"
                      :menu-custom-class="'max-h-[250px] w-[200px]'"
                      :is-use-virtualized-list="true"
                      :menu-item-height="32 - 9 / upgradableTeamsSelectOptions.length"
                      @select="selectUpgradeTeam"
                    >
                      <template #trigger>
                        <div class="shrink-0 p-[2px]">
                          <img
                            uk-img
                            :data-src="
                              upgradeTeam.imageUrl ||
                              generateAvatarDataURI({ name: upgradeTeam.name, xmindId: upgradeTeam.teamId, style: { fontWeight: '600' } })
                            "
                            class="h-5 w-5 rounded"
                          />
                        </div>
                        <span class="truncate">{{ upgradeTeam.name }}</span>
                      </template>
                      <template #optionItem="{ option, emit }">
                        <span
                          v-if="option.key === 'header'"
                          class="text-desktop-caption text-text-tertiary-light dark:text-text-tertiary-dark px-[8px] py-[4px]"
                        >
                          {{ option.label }}
                        </span>
                        <menu-button v-else :class="'!pl-[4px] !pr-[8px]'" @click="emit('select', option.key)">
                          <div class="p-[2px]">
                            <img
                              uk-img
                              :data-src="
                                (option as TeamMetadata).imageUrl ||
                                generateAvatarDataURI({
                                  name: (option as TeamMetadata).name,
                                  xmindId: (option as TeamMetadata).teamId,
                                  style: { fontWeight: '600' },
                                })
                              "
                              class="h-5 w-5 rounded"
                            />
                          </div>
                          <span class="text-mobile-body-medium sm:text-desktop-body-medium flex-1 truncate text-left">{{ option.label }}</span>
                          <icon :class="[option.key === upgradeTeamId ? 'visible' : 'invisible']" name="tick" />
                        </menu-button>
                      </template>
                    </fw-select>
                    <div v-else class="flex items-center gap-2">
                      <img
                        uk-img
                        :data-src="
                          upgradeTeam.imageUrl ||
                          generateAvatarDataURI({ name: upgradeTeam.name, xmindId: upgradeTeam.teamId, style: { fontWeight: '600' } })
                        "
                        class="h-5 w-5 shrink-0 rounded"
                      />
                      <span class="text-mobile-body-large sm:text-desktop-body-large truncate">{{ upgradeTeam.name }}</span>
                    </div>
                  </template>
                  <!-- No teams upgradable, create a new team -->
                  <new-input
                    v-else
                    ref="newTeamNameInputRef"
                    v-model="newTeamName"
                    class="w-full"
                    size="medium"
                    type="text"
                    data-blur="without-focus"
                    :disabled="isLoading"
                    :placeholder="teamNamePlaceHolderText"
                    :disable-clear-icon="true"
                  />
                </div>
              </template>
            </div>

            <!-- Invoice Email -->
            <div
              v-if="['addon', 'duo', 'xmbund'].includes(orderVersion)"
              class="text-desktop-body-1 text-dark-grey-5 dark:text-light-grey-6 flex justify-between"
            >
              <span>{{ $T('Email') }}</span>
              <fw-tooltip v-if="emailOverflow" :delay="1000" class="max-w-56">
                <template #trigger>
                  <span class="invoice-email block truncate">{{ invoiceEmail }}</span>
                </template>
                <template #tooltip>{{ invoiceEmail }}</template>
              </fw-tooltip>
              <span v-else class="invoice-email block max-w-56 truncate">{{ invoiceEmail }}</span>
            </div>

            <!-- Seats -->
            <div v-if="['essential', 'business'].includes(orderVersion)" class="flex flex-col items-start gap-[8px] self-stretch">
              <span class="text-mobile-body-large text-text-tertiary-light dark:text-text-tertiary-dark md:text-desktop-body-large">
                {{ $T('Seats') }}
              </span>
              <new-number-input
                class="w-full"
                :value="teamSeats"
                :is-disabled="isLoading || isOpenByOrderHash"
                :min="isUpgradePlanOrder ? currentSeats : 1"
                @update:value="handleSeatChange"
              />
              <div
                v-if="currentMembersCount && teamSeats && teamSeats < currentMembersCount"
                class="bg-mask-overlay-s-light dark:bg-mask-overlay-s-dark mt-[8px] flex items-start gap-2 self-stretch rounded-md p-[12px]"
              >
                <icon name="information-fill" width="16" height="16" color="#F27B13" class="shrink-0" />
                <span class="text-mobile-body-medium text-text-tertiary-light dark:text-text-tertiary-dark md:text-desktop-body-medium">
                  {{
                    $T('You currently have $1 members on your team. Please purchase at least $1 seats to proceed.', currentMembersCount.toString())
                  }}
                </span>
              </div>
            </div>

            <!-- premium benefits -->
            <component :is="benefitsComponent" v-if="isShowBenefitsSection"></component>

            <fw-divider v-if="isShowBenefitsSection" />

            <!-- Billing Period -->
            <div
              v-if="['plus', 'premium', 'essential', 'business', 'xmbund'].includes(orderVersion)"
              class="flex flex-col items-start gap-2 self-stretch"
            >
              <div class="flex w-full items-center justify-between">
                <span class="text-mobile-body-large text-text-tertiary-light dark:text-text-tertiary-dark md:text-desktop-body-large">
                  {{ $T('Billing Period') }}
                </span>
                <span v-if="isTrialOrder || orderVersion === 'xmbund'" class="text-desktop-body-1 text-dark-grey-5 dark:text-light-grey-6">
                  1 {{ $T('Year') }}
                </span>
                <span v-else-if="couponDiscountMonth" class="text-desktop-body-1 text-dark-grey-5 dark:text-light-grey-6">
                  {{ $T('$1 Months', (couponDiscountMonth + autoRenewMonth).toString()) }}
                </span>
              </div>

              <template v-if="!isTrialOrder && !couponDiscountMonth && orderVersion !== 'xmbund'">
                <div v-if="billingPeriodUIType === 'card'" class="flex w-full gap-[8px]">
                  <div
                    class="bg-fill-surfaceBright-light outline-border-quaternary-light dark:bg-fill-surfaceBright-dark dark:outline-border-quaternary-dark [&:not([disabled])]:[&:not([selected])]:hover:outline-border-tertiary-light dark:[&:not([disabled])]:[&:not([selected])]:hover:outline-border-tertiary-dark [&[selected]]:outline-border-primary-light dark:[&[selected]]:outline-border-primary-dark flex flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg py-[16px] outline outline-1 [&[disabled]]:cursor-not-allowed [&[disabled]]:opacity-50 [&[selected]]:outline-2"
                    :selected="autoRenewMonth === 1 ? true : null"
                    :disabled="isTrialOrder || isOpenByOrderHash || isLoading || isUpgradePlanOrder ? true : null"
                    @click="handleChangeBillingPeriod(1)"
                  >
                    <span class="text-mobile-subhead-mini text-text-primary-light dark:text-text-primary-dark md:text-desktop-subhead-mini">
                      {{ $T('Monthly') }}
                    </span>
                  </div>
                  <div
                    class="bg-fill-surfaceBright-light outline-border-quaternary-light dark:bg-fill-surfaceBright-dark dark:outline-border-quaternary-dark [&:not([disabled])]:[&:not([selected])]:hover:outline-border-tertiary-light dark:[&:not([disabled])]:[&:not([selected])]:hover:outline-border-tertiary-dark [&[selected]]:outline-border-primary-light dark:[&[selected]]:outline-border-primary-dark flex flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg py-[16px] outline outline-1 [&[disabled]]:cursor-not-allowed [&[disabled]]:opacity-50 [&[selected]]:outline-2"
                    :selected="autoRenewMonth === 12 ? true : null"
                    :disabled="isOpenByOrderHash || isLoading || isUpgradePlanOrder ? true : null"
                    @click="handleChangeBillingPeriod(12)"
                  >
                    <span class="text-mobile-subhead-mini text-text-primary-light dark:text-text-primary-dark md:text-desktop-subhead-mini">
                      {{ $T('Yearly') }}
                    </span>
                    <span class="text-desktop-caption text-xred-500">
                      {{ $T('Up to $1% OFF', '45') }}
                    </span>
                  </div>
                </div>
                <fw-select
                  v-else-if="billingPeriodUIType === 'select'"
                  :theme="'muted'"
                  :position="'bottom-left'"
                  :disabled="isTrialOrder || isOpenByOrderHash || isLoading || isUpgradePlanOrder ? true : null"
                  :trigger-custom-class="'h-10'"
                  :selected-key="autoRenewMonth.toString()"
                  :options="[
                    { key: '1', label: $T('Monthly') },
                    { key: '12', label: $T('Yearly') },
                  ]"
                  @select="handleChangeBillingPeriod($event === '1' ? 1 : 12)"
                >
                  <template v-if="autoRenewMonth === 12" #selectedLabel>
                    {{ $T('Yearly') }}
                    <span class="text-xred-500">{{ $T('$1% OFF', '45') }}</span>
                  </template>
                  <template #optionItem="{ option, emit }">
                    <fw-menu-button class="!h-8" @click="emit('select', option.key)">
                      <fw-icon name="tick" :class="[option.key === autoRenewMonth.toString() ? 'visible' : 'invisible']" />
                      <span class="text-mobile-body-medium sm:text-desktop-body-medium">
                        {{ option.label }}
                        <span v-if="option.key === '12'" class="text-xred-500">{{ $T('$1% OFF', '45') }}</span>
                      </span>
                    </fw-menu-button>
                  </template>
                </fw-select>
              </template>
            </div>

            <fw-divider
              v-if="['plus', 'premium', 'essential', 'business', 'duo', 'xmbund'].includes(orderVersion) && !isOpenByOrderHash"
              class="mt-[4px]"
            />

            <!-- Coupon Code -->
            <div
              v-if="['plus', 'premium', 'essential', 'business', 'duo', 'xmbund'].includes(orderVersion) && !isOpenByOrderHash"
              class="flex flex-col gap-3"
            >
              <div
                class="hover:bg-mask-overlay-s-light active:bg-mask-overlay-deep-light dark:hover:bg-mask-overlay-s-dark dark:active:bg-mask-overlay-deep-dark flex cursor-pointer select-none items-center gap-1 self-start rounded px-[8px] py-[4px] transition-colors"
                @click="isShowCouponInput = !isShowCouponInput"
              >
                <span class="text-mobile-body-large md:text-desktop-body-large">{{ $T('Coupon Code') }}</span>
                <icon
                  class="transition-transform"
                  :class="{ '-rotate-90': isShowCouponInput, 'rotate-90': !isShowCouponInput }"
                  name="chevron-forward"
                  width="12"
                  height="12"
                />
              </div>
              <payment-coupon-input
                v-show="isShowCouponInput && autoRenewMonth === 1"
                ref="monthlyCouponInputRef"
                :is-loading="isLoading"
                :is-disabled="!!isCouponTimeout"
                :on-remove-coupon="onRemoveCoupon"
                :on-apply-coupon="onApplyCoupon"
                :coupon-success-messages="couponSuccessMessages"
                @set-is-coupon-timeout="isCouponTimeout = $event"
              ></payment-coupon-input>
              <payment-coupon-input
                v-show="isShowCouponInput && autoRenewMonth === 12"
                ref="yearlyCouponInputRef"
                :is-loading="isLoading"
                :is-disabled="!!isCouponTimeout"
                :on-remove-coupon="onRemoveCoupon"
                :on-apply-coupon="onApplyCoupon"
                :coupon-success-messages="couponSuccessMessages"
                @set-is-coupon-timeout="isCouponTimeout = $event"
              ></payment-coupon-input>
            </div>

            <fw-divider v-if="['plus', 'premium', 'essential', 'business', 'duo', 'xmbund'].includes(orderVersion)" class="mt-[4px]" />

            <!-- Plan -->
            <div v-if="['plus', 'premium', 'essential', 'business'].includes(orderVersion)" class="flex justify-between">
              <span class="text-mobile-body-large text-text-tertiary-light dark:text-text-tertiary-dark md:text-desktop-body-large">
                {{ $T('Plan') }}
              </span>
              <span class="text-mobile-subhead-mini text-text-tertiary-light dark:text-text-tertiary-dark md:text-desktop-subhead-mini">
                {{ planName }}
              </span>
            </div>

            <!-- Price Breakdown -->
            <div
              v-if="['plus', 'premium', 'essential', 'business'].includes(orderVersion)"
              class="flex min-h-[24px]"
              :class="{ 'justify-end': !priceBreakdownText, 'justify-between': priceBreakdownText }"
            >
              <span class="text-mobile-body-large text-text-tertiary-light dark:text-text-tertiary-dark md:text-desktop-body-large">
                {{ priceBreakdownText }}
              </span>
              <span class="text-mobile-subhead-mini text-text-tertiary-light dark:text-text-tertiary-dark md:text-desktop-subhead-mini">
                {{ regularPriceText }}
              </span>
            </div>

            <!-- Coupon Discount -->
            <div v-show="couponDiscountDisplayText" class="flex justify-between">
              <span class="text-mobile-body-large text-text-tertiary-light dark:text-text-tertiary-dark md:text-desktop-body-large">
                {{ $T('Coupon Code') }}
              </span>
              <span class="text-mobile-subhead-mini text-xred-500 dark:text-xred-400 md:text-desktop-subhead-mini">
                {{ couponDiscountDisplayText }}
              </span>
            </div>

            <!-- Remaining Balance -->
            <div v-show="remainingBalanceDiscountText" class="flex justify-between">
              <span class="text-mobile-body-large text-text-tertiary-light dark:text-text-tertiary-dark md:text-desktop-body-large">
                {{ $T('Remaining Balance') }}
              </span>
              <span class="text-mobile-subhead-mini text-text-tertiary-light dark:text-text-tertiary-dark md:text-desktop-subhead-mini">
                {{ remainingBalanceDiscountText }}
              </span>
            </div>

            <!-- Free Trial -->
            <template v-if="isTrialOrder && ['plus', 'premium', 'essential', 'business'].includes(orderVersion)">
              <div class="flex justify-between">
                <span class="text-mobile-body-large text-text-tertiary-light dark:text-text-tertiary-dark md:text-desktop-body-large">
                  {{ $T('Free Trial') }}
                </span>
                <span class="text-mobile-subhead-mini text-text-tertiary-light dark:text-text-tertiary-dark md:text-desktop-subhead-mini">
                  {{ `${trialDay ?? ''} days (${trialCredits ?? ''} credits)` }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-mobile-body-large text-text-tertiary-light dark:text-text-tertiary-dark md:text-desktop-body-large">
                  {{ $T('Due After Trial') }}
                </span>
                <div v-show="trialEndAmountText" class="flex flex-col text-right">
                  <span class="text-mobile-subhead-mini text-text-tertiary-light dark:text-text-tertiary-dark md:text-desktop-subhead-mini">
                    {{ trialEndAmountText }}
                  </span>
                  <span class="text-desktop-caption text-text-tertiary-light dark:text-text-tertiary-dark">{{ $T('Plus applicable taxes') }}</span>
                </div>
              </div>
            </template>

            <!-- Regular Price -->
            <div v-if="['addon', 'duo', 'xmbund'].includes(orderVersion)" class="flex justify-between">
              <span class="text-mobile-body-large text-text-tertiary-light dark:text-text-tertiary-dark md:text-desktop-body-large">
                {{ $T('Regular price') }}
              </span>
              <span class="text-mobile-subhead-mini text-text-tertiary-light dark:text-text-tertiary-dark md:text-desktop-subhead-mini">
                {{ regularPriceText }}
              </span>
            </div>

            <!-- Normal Discount -->
            <div v-if="orderVersion === 'xmbund' && normalDiscountDisplayText" class="flex justify-between">
              <span class="text-mobile-body-large text-text-tertiary-light dark:text-text-tertiary-dark md:text-desktop-body-large">
                {{ $T('Discount') }}
              </span>
              <span class="text-mobile-subhead-mini text-brand-5 dark:text-brand-4 md:text-desktop-subhead-mini">
                {{ normalDiscountDisplayText }}
              </span>
            </div>

            <fw-divider class="mt-[4px]" />

            <!-- Tax -->
            <template v-if="taxesText">
              <div class="flex justify-between">
                <div class="flex items-center gap-1">
                  <span class="text-mobile-body-large text-text-tertiary-light dark:text-text-tertiary-dark md:text-desktop-body-large">
                    {{ $T('Taxes (Estimated)') }}
                  </span>
                  <fw-tooltip :delay="500" :content-style="{ 'max-width': '260px', 'white-space': 'normal' }" :allow-click="true">
                    <template #trigger>
                      <icon class="text-text-tertiary-light dark:text-text-tertiary-dark" name="question-sign" width="16" height="16" />
                    </template>
                    <template #tooltip>
                      {{
                        $T(
                          'Estimated tax is based on your IP address. Actual tax depends on your entered country/region and postal code and updates after submitting payment.',
                        )
                      }}
                    </template>
                  </fw-tooltip>
                </div>
                <span class="text-mobile-subhead-mini text-text-tertiary-light dark:text-text-tertiary-dark md:text-desktop-subhead-mini">
                  {{ taxesText }}
                </span>
              </div>
              <fw-divider class="mt-[4px]" />
            </template>

            <!-- Total -->
            <div class="flex justify-between">
              <span v-if="isTrialOrder" class="text-mobile-subhead-medium md:text-desktop-subhead-medium">{{ $T('Due Today') }}</span>
              <span v-else class="text-mobile-subhead-medium md:text-desktop-subhead-medium">{{ $T('Total') }}</span>
              <div v-show="totalPriceText" class="flex flex-col text-right">
                <span class="text-mobile-subhead-medium md:text-desktop-subhead-medium">{{ totalPriceText }}</span>
                <span v-if="!isTrialOrder" class="text-desktop-caption text-text-tertiary-light dark:text-text-tertiary-dark">{{
                  $T('Plus applicable taxes')
                }}</span>
              </div>
            </div>
          </div>
        </div>
        <ul
          v-if="orderVersion === 'duo' || orderVersion === 'xmbund'"
          class="text-desktop-caption-1 text-transparent-dark-6 dark:text-transparent-white-6 pl-[8px]"
        >
          <!-- eslint-disable-next-line vue/no-v-html -->
          <li class="text-transparent-dark-6 dark:text-transparent-white-6 marker:text-[8px] marker:leading-[16px]" v-html="downloadAppHtml"></li>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <li class="text-transparent-dark-6 dark:text-transparent-white-6 marker:text-[8px] marker:leading-[16px]" v-html="checkFaqHtml"></li>
        </ul>
      </div>

      <fw-divider orientation="vertical" class="hidden self-stretch md:block" />

      <!-- payment details box -->
      <payment-details
        :submit-button-text="$T('Submit Payment')"
        :stripe="stripe"
        :is-loading="isLoading"
        :payment-error-message="paymentErrorMessage"
        :is-submit-disabled="isLoading || isSubmitPaymentButtonDisabled || isTeamSeatsLessThanCurrentMembers || isCreateNewTeamNameEmpty"
        @submit="handleSubmitPayment"
      >
        <template #payment-note>
          <ul
            class="text-mobile-body-small text-text-tertiary-light marker:text-mobile-body-small marker:text-text-tertiary-light dark:text-text-tertiary-dark dark:marker:text-text-tertiary-dark md:text-desktop-body-small md:marker:text-desktop-body-small m-0 pl-[8px]"
          >
            <template v-if="['essential', 'business', 'premium', 'plus', 'duo', 'xmbund'].includes(orderVersion)">
              <li v-if="orderVersion !== 'xmbund'">
                <span>{{ $T('Subscription automatically renews and can be cancelled anytime.') }}</span>
              </li>
              <li v-if="isTrialOrder && isCouponApplied">
                <span>{{ $T('Coupon code is only valid for the first subscription after the Free Trial ends.') }}</span>
              </li>
              <li v-if="!isTrialOrder && isCouponApplied">
                <span>{{ $T('Coupon code is only valid for the first subscription.') }}</span>
              </li>
              <li>
                <span>{{ $T("Refunds won't be available on cancellation.") }}</span>
              </li>
              <li v-if="isTrialOrder">
                <span>{{
                  $T(
                    '$1 credits will be added to your credits balance immediately. After the trial period ends, $2 credits will be obtained after successful payment.',
                    `${trialCredits ?? ''}`,
                    `${orderVersion === 'business' ? '8000' : '500'}`,
                  )
                }}</span>
              </li>
              <li>
                <span>{{ $T('By continuing, you agree to the ') }}</span>
                <a href="/terms-of-services" target="_blank">
                  <fw-button
                    size="small"
                    theme="link"
                    class="!text-text-primary-light hover:!text-text-primary-light dark:!text-text-primary-dark dark:hover:!text-text-primary-dark"
                  >
                    {{ $T('Terms of services') }}
                  </fw-button>
                </a>
                <span> & </span>
                <a href="/privacy-policy" target="_blank">
                  <fw-button
                    size="small"
                    theme="link"
                    class="!text-text-primary-light hover:!text-text-primary-light dark:!text-text-primary-dark dark:hover:!text-text-primary-dark"
                  >
                    {{ $T('Privacy policy') }}
                  </fw-button>
                </a>
              </li>
            </template>
            <template v-else-if="orderVersion === 'addon'">
              <li>
                <span>{{ $T('Purchased credits will be instantly added to your credit balance.') }}</span>
              </li>
              <li>
                <span>{{ $T('If your subscription expires, purchased credits will become inactive.') }}</span>
              </li>
              <li>
                <span>{{ $T('Credits Add-on is a one-time payment and does not support refunds.') }}</span>
              </li>
            </template>
          </ul>
        </template>
      </payment-details>
    </div>
  </base-full-screen-dialog>
</template>

<script setup lang="ts">
import { usePromiseHook } from 'utils/vue-utils'
import { Stripe, StripeCardNumberElement } from '@stripe/stripe-js'
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import { useAccountStore, useServiceStore } from 'client/store'
import {
  OrderVersion,
  OrderDetail,
  PlanDurationOption,
  AutoRenewMonth,
  getPlanPerMonthDisplayPrice,
  getPlanName,
  checkLoginSession,
  checkUpgradePlanOrderAvailability,
  checkUpgradePlanOrderFromAppStoreWarning,
} from 'client/library/payment'
import { $T } from 'client/library/translation'
import { toastActions } from 'client/library/new-notifications'
import { generateAvatarDataURI } from 'client/library/cloud-kit/utils/avatar'
import BaseFullScreenDialog from 'client/components/base/full-screen-dialog.vue'
import PaymentCouponInput from './payment-coupon-input.vue'
import NewNumberInput from '../../new-number-input.vue'
import FwSelect from 'client/components/base/select.vue'
import MenuButton from 'client/components/base/menu-button.vue'
import NewInput from 'client/components/base/input.vue'
import Icon from 'client/components/icon/icon.vue'
import PaymentDetails from './payment-details.vue'
import { onBeforeRouteLeave } from 'vue-router'
import { useTeamSpaceData } from 'app/composables/team-space-data'
import { TeamMetadata } from 'client/library/cloud-kit'
import { usePaymentClient } from 'app/composables/payment-client'
import { useTeamsClient } from 'app/composables/team-client'
import { debounce, formatMonths } from 'utils/misc'
import { trackNewVersionWorks } from 'client/library/tracker'
import { useUrlNavigator } from 'app/composables/url-navigator'
import type { TeamListItem, TeamMemberCount } from 'client/library/teams'
import { useStatsig } from 'client/composables/use-statsig'
import { useTracking } from 'client/composables/use-tracking'
import type { Alpha2Code } from 'i18n-iso-countries'
import { useContextStore } from 'client/store/context-store'
import { V26_ADD_ON_EMAIL_EBOOK_COUPON_CODE, V26_ADD_ON_EMAIL_EBOOK_COUPON_CODE_GTM } from 'client/constants'
const PremiumBenefitsComponent = defineAsyncComponent(() => import('./premium-benefits.vue'))

const usdCurrencyFormat = Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const props = withDefaults(
  defineProps<{
    teamId?: string
    orderHash?: string
    orderVersion: OrderVersion
    planDuration: PlanDurationOption
    isTrialOrder?: boolean
    orderInfo?: OrderDetail
    isOpenByOrderHash?: boolean
    onClose?: () => void
    teamMemberCount?: TeamMemberCount
    isUpgradePlanOrder?: boolean
    coupon?: string
    isRegisterHash?: boolean
    isCloseable?: boolean
    isShowBenefitsSection?: boolean
    billingPeriodUIType?: 'select' | 'card'
  }>(),
  {
    teamId: '',
    orderHash: '',
    isTrialOrder: false,
    orderInfo: null,
    onClose: null,
    teamMemberCount: null,
    isUpgradePlanOrder: false,
    coupon: '',
    isRegisterHash: true,
    isCloseable: true,
    isShowBenefitsSection: false,
    billingPeriodUIType: 'card',
  },
)

let currentMembersCount: number
let currentSeats: number

const { resolve } = usePromiseHook()
const paymentClient = usePaymentClient()
const {
  getTeamPlanProfileAsync,
  fetchTeamMetadata: fetchTeamMetadataHandler,
  getUnexpiredTeamPlanAsync,
  waitUntilTeamDataLoaded,
} = useTeamSpaceData()
const teamNamePlaceHolderText = $T("Team's name")

const { profile } = storeToRefs(useAccountStore())
const stripe = ref<Stripe | null>(null)
const paymentDialogRef = ref()
const autoRenewMonth = ref<AutoRenewMonth>(props.planDuration === 'monthly' ? 1 : 12)
const taxEstimated = ref<number>()
const orderTotal = ref<number>()
const regularPrice = ref<number>()
const currency = ref('USD')
const isLoading = ref(false)
const paymentErrorMessage = ref('')
const emailOverflow = ref(false)
const trialDay = ref<number>()
const trialCredits = ref<number>()
const trialEndDiscount = ref<number>()
const trialEndAmount = ref<number>()
const isCouponTimeout = ref<boolean>(false)
const monthlyCouponCode = ref('')
const yearlyCouponCode = ref('')
const isCouponApplied = ref(false)
const isShowCouponInput = ref(false)
const monthlyCouponInputRef = ref()
const yearlyCouponInputRef = ref()
const couponDiscountPrice = ref<number>()
const couponDiscountMonth = ref<number>()
const remainingBalance = ref<number>()
const normalDiscountPrice = ref<number>()
const teamSeats = ref<number>()
const isSubmitPaymentButtonDisabled = ref(false)
const upgradeTeamId = ref(props.teamId)
const upgradeTeam = ref<TeamMetadata>()
const upgradableTeams = ref<TeamMetadata[]>([])
const upgradableTeamsSelectOptions = ref<(({ key: string; label: string } & TeamMetadata) | { key: string; label: string })[]>([])
const newTeamName = ref('')
const newTeamNameInputRef = ref()
const isFetchTeamFinished = ref(false)
const stripeAccount = ref<OrderDetail['stripeAccount']>()

const invoiceEmail = computed(() => profile.value?.primary_email)
const isMyWorksTeam = computed(() => upgradeTeamId.value === useTeamSpaceData().defaultTeamId.value)
const isUpgradeForIndividuals = computed(() => ['premium', 'plus'].includes(props.orderVersion))
const regularPriceText = computed(() => (regularPrice.value ? `${currency.value} ${currencyFormat.value?.format(regularPrice.value)}` : ''))
const totalPriceText = computed(() =>
  orderTotal.value || orderTotal.value === 0 ? `${currency.value} ${currencyFormat.value?.format(props.isTrialOrder ? 0 : orderTotal.value)}` : '',
)
const couponDiscountDisplayText = computed(() => {
  if (props.isTrialOrder) {
    return trialEndDiscount.value ? `- ${currency.value} ${currencyFormat.value?.format(trialEndDiscount.value)}` : ''
  } else if (couponDiscountPrice.value) {
    return `- ${currency.value} ${currencyFormat.value?.format(couponDiscountPrice.value)}`
  } else if (couponDiscountMonth.value) {
    return `+ ${$T('$1 Months', couponDiscountMonth.value.toString())}`
  } else {
    return ''
  }
})
const remainingBalanceDiscountText = computed(() => {
  return remainingBalance.value ? `- ${currency.value} ${currencyFormat.value?.format(remainingBalance.value)}` : ''
})
const normalDiscountDisplayText = computed(() => {
  return normalDiscountPrice.value ? `- ${currency.value} ${currencyFormat.value?.format(normalDiscountPrice.value)}` : ''
})
const priceBreakdownText = computed(() => {
  const period = formatMonths(autoRenewMonth.value, false)
  const seatsText = teamSeats.value > 1 ? $T('seats') : $T('seat')
  const price = usdCurrencyFormat.format(getPlanPerMonthDisplayPrice(props.orderVersion, autoRenewMonth.value === 1 ? 'monthly' : 'yearly'))
  return isUpgradeForIndividuals.value ? `${price} x ${period}` : `${price} x ${teamSeats.value} ${seatsText} x ${period}`
})
const trialEndAmountText = computed(() => (trialEndAmount.value ? `${currency.value} ${currencyFormat.value?.format(trialEndAmount.value)}` : ''))
const taxesText = computed(() => {
  return taxEstimated.value || taxEstimated.value === 0 ? `${currency.value} ${currencyFormat.value?.format(taxEstimated.value)}` : ''
})
const isTeamSeatsLessThanCurrentMembers = computed(() => teamSeats.value < currentMembersCount)
const isCreateNewTeamNameEmpty = computed(() => !upgradeTeamId.value && newTeamName.value.trim().length === 0)
const planName = computed(() => getPlanName(props.orderVersion))
const downloadAppHtml = computed(() => {
  const mapifyHtml = $T(
    'Visit $1 to try your Mapify Pro',
    '<a href="https://mapify.so" target="_blank" class="text-transparent-dark-8 hover:text-transparent-dark-8 dark:text-transparent-white-8 dark:hover:text-transparent-white-8">Mapify</a>',
  )
  const xmindHtml = $T(
    'Download $1 to try your Xmind Pro',
    '<a href="https://xmind.app/download/" target="_blank" class="text-transparent-dark-8 hover:text-transparent-dark-8 dark:text-transparent-white-8 dark:hover:text-transparent-white-8">Xmind.app</a>',
  )
  return props.orderVersion === 'xmbund' ? mapifyHtml : xmindHtml
})
const checkFaqHtml = computed(() => {
  const mapifyText = $T(
    'Check $1 page to know more about this suite',
    `<a href="https://xmind.ai/embed/zkbyq25j?xid=oeRXgTSV" target="_blank" class="text-transparent-dark-8 hover:text-transparent-dark-8 dark:text-transparent-white-8 dark:hover:text-transparent-white-8">${$T(
      'FAQ',
    )}</a>`,
  )
  const xmindText = $T(
    'Check $1 page to know more about this bundle',
    `<a href="/faq" target="_blank" class="text-transparent-dark-8 hover:text-transparent-dark-8 dark:text-transparent-white-8 dark:hover:text-transparent-white-8">${$T(
      'FAQ',
    )}</a>`,
  )
  return props.orderVersion === 'xmbund' ? mapifyText : xmindText
})
const couponSuccessMessages = computed(() => {
  const eBookMessage = $T('All set! Your eBook bonus will be emailed after payment.')

  return {
    [V26_ADD_ON_EMAIL_EBOOK_COUPON_CODE]: eBookMessage,
    [V26_ADD_ON_EMAIL_EBOOK_COUPON_CODE_GTM]: eBookMessage,
  }
})
const currencyFormat = computed(() => Intl.NumberFormat('en-US', { style: 'currency', currency: currency.value || 'USD' }))

const benefitsComponent = computed(() => {
  switch (props.orderVersion) {
    case 'premium':
      return PremiumBenefitsComponent
    default:
      return null
  }
})

const handleClose = () => {
  if (props.onClose) {
    props.onClose()
  }
  if (isLoading.value) return
  resolve(false)
}

const { unregister, enter: enterHashRouter } = useUrlNavigator().registerHash({
  hash: '#payment',
  onLeave: handleClose,
})

const createNewTeam = async () => {
  if (!newTeamName.value.trim()) {
    return false
  }
  const newTeam = await useTeamsClient().createTeam({ teamName: newTeamName.value })
  if (newTeam.teamId) {
    upgradeTeamId.value = newTeam.teamId
    upgradeTeam.value = newTeam
    return true
  } else {
    toastActions.show({ message: $T('Could not create a team, please try again later'), topic: 'failed' })
    return false
  }
}

const handleSubmitPayment = async (args: { stripeCardNumberElement: StripeCardNumberElement; paymentCountry: Alpha2Code; paymentPostal: string }) => {
  const { stripeCardNumberElement, paymentCountry, paymentPostal } = args

  if (isLoading.value || isSubmitPaymentButtonDisabled.value || isTeamSeatsLessThanCurrentMembers.value) return

  const upgradeTeamIdValue = upgradeTeamId.value
  const upgradeTeamProfile = upgradeTeamIdValue ? await getTeamPlanProfileAsync(upgradeTeamIdValue) : null

  if (upgradeTeamProfile?.status === 'trialing' && ['essential', 'business', 'premium', 'plus', 'duo'].includes(props.orderVersion)) {
    const proceed = await useServiceStore().services.action.dialog.confirm({
      title: $T('End Your Free Trial?'),
      description: $T('By proceeding, you will immediately end your free trial and begin a new subscription.'),
      confirmButtonText: $T('Continue to Subscribe'),
      cancelButtonText: $T('Not Now'),
    })
    if (!proceed) return
  }

  if (
    props.isUpgradePlanOrder &&
    !checkUpgradePlanOrderAvailability({
      orderVersion: props.orderVersion,
      teamId: props.teamId,
      currentPlan: await getUnexpiredTeamPlanAsync(props.teamId),
    })
  ) {
    return
  }
  if (props.isUpgradePlanOrder && !(await checkUpgradePlanOrderFromAppStoreWarning({ orderVersion: props.orderVersion, teamId: props.teamId }))) {
    return
  }

  useTracking().trackClick('submit_payment')

  trackNewVersionWorks.checkOrderClick({
    version: props.orderVersion,
    seats: teamSeats.value,
    months: autoRenewMonth.value,
    total: orderTotal.value,
  })

  isLoading.value = true
  paymentErrorMessage.value = '' // Clear any previous payment errors

  if (!upgradeTeamId.value) {
    const success = await createNewTeam()
    if (!success) {
      isLoading.value = false
      return
    }
  }

  const { hide } = toastActions.show({ message: $T('Submitting payment...'), topic: 'loading', timeout: 30000 })

  const { token, error } = await stripe.value.createToken(stripeCardNumberElement, { address_country: paymentCountry, address_zip: paymentPostal })
  if (error) {
    error.type !== 'validation_error' && openPaymentResultDialog($T('Payment Declined'), error.message)
    hide()
    isLoading.value = false
    return
  }

  const orderHash =
    props.orderHash ||
    (await paymentClient.createOrder({
      version: props.orderVersion,
      invoiceEmail: invoiceEmail.value,
      teamId: upgradeTeamId.value,
      seats: teamSeats.value,
      month: autoRenewMonth.value,
      isTrialOrder: props.isTrialOrder,
      coupon: autoRenewMonth.value === 1 ? monthlyCouponCode.value : yearlyCouponCode.value,
      currency: currency.value,
    }))
  if (!orderHash) {
    hide()
    isLoading.value = false
    toastActions.show({ message: $T('Could not create an order, please try again later'), topic: 'failed' })
    return
  }

  const paymentResult = await paymentClient.stripePay(
    orderHash,
    token.id,
    upgradeTeam.value,
    props.orderVersion !== 'xmbund' && stripeAccount.value === 'xpro',
  )

  if (props.isOpenByOrderHash && paymentResult?.status === 'success') {
    paymentResult.url = window.location.origin
  }
  switch (paymentResult?.status) {
    case 'success':
      useTracking().trackOrder(trialDay.value ? 'free_trial' : 'purchase', {
        value: orderTotal.value,
        coupon: autoRenewMonth.value === 1 ? monthlyCouponCode.value : yearlyCouponCode.value,
        currency: currency.value,
        items: [
          {
            plan: props.orderVersion,
            renew_period: props.planDuration,
            price: regularPrice.value,
            quantity: teamSeats.value,
            trial_days: trialDay.value || 0,
            ...(isCouponApplied.value ? { discount_price: regularPrice.value - couponDiscountPrice.value } : {}),
          },
        ],
      })
      if (props.orderVersion !== 'addon') {
        if (trialDay.value) {
          useTracking().trackConversion({
            isTrial: true,
            plan: props.orderVersion,
            billingCycle: props.planDuration,
          })
        } else {
          useTracking().trackConversion({
            isTrial: false,
            plan: props.orderVersion,
            billingCycle: props.planDuration,
            value: orderTotal.value,
            currency: currency.value,
            subscriptionType: props.isUpgradePlanOrder ? 'upgrade' : useAccountStore().isUserProSubscribed ? 'renewal' : 'new',
          })
        }
      }
      if (trialDay.value) {
        useStatsig().log('free_trial', trialDay.value)
      }
      window.open(paymentResult.url, '_self')
      return
    case 'redirect':
      window.open(paymentResult.url, '_self')
      return
    case 'fail':
      if (paymentResult.msg === 'payment_declined') {
        // Show inline error for blacklisted card
        paymentErrorMessage.value = $T('Your payment has been declined.')
      } else {
        openPaymentResultDialog($T('Payment Declined'), $T('Your payment could not be processed. Please try again later.'))
      }
      logger.error(paymentResult.msg)
      break
    default:
      openPaymentResultDialog($T('Payment Declined'), $T('Your payment could not be processed. Please try again later.'))
  }

  hide()
  isLoading.value = false
}

const openPaymentResultDialog = async (title: string, msg: string, onConfirm = async () => true) => {
  await useServiceStore().services.action.dialog.confirm({
    title: title,
    description: msg,
    confirmButtonText: $T('OK'),
    onConfirm,
    hiddenCancel: true,
    dismissable: false,
    confirmButtonType: 'default',
  })
}

const initPaymentElements = async (useXmindProStripe: boolean) => {
  stripe.value = await paymentClient.initStripe(useXmindProStripe)
  if (!stripe.value) {
    toastActions.show({ message: $T('Network error, please try again later'), topic: 'failed' })
    handleClose()
    return
  }

  paymentDialogRef.value?.querySelector('.modal-dialog__body')?.setAttribute('data-blur', 'without-focus')
  paymentDialogRef.value?.querySelectorAll('.__PrivateStripeElement-input')?.forEach(element => element.setAttribute('data-blur', 'without-focus'))
}

const mapOrderInfo = (order: OrderDetail) => {
  orderTotal.value = order.total
  regularPrice.value = order.singlePrice * order.quantity
  trialDay.value = order.trialDay
  trialCredits.value = order.trialCredits
  trialEndDiscount.value = order.trialEndDiscount
  trialEndAmount.value = order.trialEndAmount
  couponDiscountPrice.value = order.couponDiscount
  couponDiscountMonth.value = order.freeMonth
  remainingBalance.value = order.upgradeDiscount
  normalDiscountPrice.value = order.discount
  currency.value = order.currency.toLocaleUpperCase()
  taxEstimated.value = order.taxEstimated

  stripeAccount.value = order.stripeAccount
}

const fetchOrderInfo = async () => {
  let order: OrderDetail
  if (props.orderInfo) {
    order = props.orderInfo
  } else {
    order = await paymentClient.getOrder(props.orderHash)
  }

  if (!order) {
    toastActions.show({ message: $T('Could not get your order, please try again later'), topic: 'failed' })
    handleClose()
    return
  }

  teamSeats.value = order.quantity

  mapOrderInfo(order)
}

const calculatePayment = async () => {
  orderTotal.value = null
  regularPrice.value = null
  trialDay.value = null
  trialCredits.value = null
  trialEndDiscount.value = null
  trialEndAmount.value = null
  couponDiscountPrice.value = null
  couponDiscountMonth.value = null
  remainingBalance.value = null
  normalDiscountPrice.value = null
  currency.value = null
  taxEstimated.value = null

  const order = await paymentClient.calculatePaymentPrice({
    version: props.orderVersion,
    teamId: upgradeTeamId.value,
    invoiceEmail: invoiceEmail.value,
    seats: teamSeats.value,
    month: autoRenewMonth.value,
    coupon: autoRenewMonth.value === 1 ? monthlyCouponCode.value : yearlyCouponCode.value,
    isTrialOrder: props.isTrialOrder,
  })

  if (!order) {
    isSubmitPaymentButtonDisabled.value = true
    toastActions.show({ message: $T('Could not update your order, please try again later'), topic: 'failed' })
    return
  }
  isSubmitPaymentButtonDisabled.value = false

  mapOrderInfo(order)
}

const onRemoveCoupon = async () => {
  autoRenewMonth.value === 1 ? (monthlyCouponCode.value = '') : (yearlyCouponCode.value = '')
  isCouponApplied.value = false
  await calculatePayment()
}

const onApplyCoupon = async (coupon: string) => {
  if (isCouponTimeout.value) return

  try {
    isLoading.value = true
    autoRenewMonth.value === 1 ? (monthlyCouponCode.value = coupon) : (yearlyCouponCode.value = coupon)
    await paymentClient.validateCoupon({ version: props.orderVersion, coupon })
    isCouponApplied.value = true
    await calculatePayment()
  } catch (e) {
    autoRenewMonth.value === 1 ? (monthlyCouponCode.value = '') : (yearlyCouponCode.value = '')
    throw e
  } finally {
    isShowCouponInput.value = true
    isLoading.value = false
  }
}

const handleChangeBillingPeriod = async (month: AutoRenewMonth) => {
  if (isLoading.value || month === autoRenewMonth.value) return
  if (props.isTrialOrder && month === 1) return
  if (props.isOpenByOrderHash) return
  if (props.isUpgradePlanOrder) return

  autoRenewMonth.value = month
  isLoading.value = true
  await calculatePayment()
  isLoading.value = false

  useTracking().trackOrder('order_change', {
    value: orderTotal.value,
    coupon: autoRenewMonth.value === 1 ? monthlyCouponCode.value : yearlyCouponCode.value,
    currency: currency.value,
    items: [
      {
        plan: props.orderVersion,
        renew_period: props.planDuration,
        price: regularPrice.value,
        quantity: teamSeats.value,
        trial_days: trialDay.value || 0,
        ...(isCouponApplied.value ? { discount_price: regularPrice.value - couponDiscountPrice.value } : {}),
      },
    ],
  })
}

const changeSeatsWithDebounce = debounce(async () => {
  isLoading.value = true
  await calculatePayment()
  isLoading.value = false
}, 250)

const changeSeatsWithDebounceByManualInput = debounce(async () => {
  isLoading.value = true
  await calculatePayment()
  isLoading.value = false
}, 1000)

const handleSeatChange = (newSeats: number, manualInput: boolean) => {
  teamSeats.value = newSeats
  manualInput ? changeSeatsWithDebounceByManualInput() : changeSeatsWithDebounce()
}

const selectUpgradeTeam = async (teamId: string) => {
  upgradeTeamId.value = teamId
  isLoading.value = true
  await Promise.all([fetchTeamMetadata(), fetchTeamSeats()])
  await calculatePayment()
  isLoading.value = false
}

const fetchTeamMetadata = async () => {
  if (!upgradeTeamId.value) {
    return
  }
  const teamMetadata = await fetchTeamMetadataHandler({ teamId: upgradeTeamId.value })
  if (!teamMetadata || !teamMetadata.teamId) {
    toastActions.show({ message: $T('Could not get your team information, please try again later'), topic: 'failed' })
    handleClose()
    return
  }
  upgradeTeam.value = teamMetadata
}

const fetchTeamSeats = async () => {
  if (!upgradeTeamId.value || !['essential', 'business'].includes(props.orderVersion)) {
    teamSeats.value = 1
    return
  }

  const { totalInvites, limit } = props.teamMemberCount ?? (await useTeamsClient().getTeamMemberCountLimit({ teamId: upgradeTeamId.value }))
  teamSeats.value = props.isUpgradePlanOrder ? limit : totalInvites
  currentMembersCount = totalInvites
  currentSeats = limit
}

const fetchTeam = async () => {
  if (props.isOpenByOrderHash) {
    await fetchTeamMetadata()
  } else {
    await waitUntilTeamDataLoaded()
    let teams: TeamListItem[] = []
    if (props.orderVersion === 'premium' || props.orderVersion === 'xmbund') {
      teams = useTeamSpaceData().joinedTeamList.value.filter(team => team.teamId === useTeamSpaceData().defaultTeamId.value)
    } else {
      teams = (
        await Promise.all(
          useTeamSpaceData().joinedTeamList.value.map(async team => {
            const plan = await getUnexpiredTeamPlanAsync(team.teamId)
            if (plan !== 'basic') {
              return null
            }
            if (helpers.isManagementRole(team) && team.teamId !== useTeamSpaceData().defaultTeamId.value) {
              return team
            }
            return null
          }),
        )
      ).filter(team => team !== null)
    }

    upgradeTeamId.value = upgradeTeamId.value || teams[0]?.teamId

    upgradableTeams.value = teams
    upgradableTeamsSelectOptions.value = [
      { key: 'header', label: $T('Upgradable Teams') },
      ...teams.map(team => ({
        key: team.teamId,
        label: team.name,
        ...team,
      })),
    ]

    await Promise.all([fetchTeamMetadata(), fetchTeamSeats()])
  }

  isFetchTeamFinished.value = true
}

const applyPromotionCouponAutomatically = async () => {
  if (props.coupon) {
    autoRenewMonth.value === 1 ? monthlyCouponInputRef.value?.setCoupon(props.coupon) : yearlyCouponInputRef.value?.setCoupon(props.coupon)
  }
}

onMounted(async () => {
  props.isRegisterHash && enterHashRouter?.()
  checkLoginSession()

  isLoading.value = true
  await fetchTeam()
    .then(async () => {
      props.isOpenByOrderHash ? await fetchOrderInfo() : await calculatePayment()
    })
    .then(async () => {
      await initPaymentElements(stripeAccount.value === 'xpro' && props.orderVersion !== 'xmbund')
    })
  isLoading.value = false

  calculateEmailOverflow()
  trackNewVersionWorks.checkOrderShow({ version: props.orderVersion, seats: teamSeats.value, months: autoRenewMonth.value, total: orderTotal.value })

  applyPromotionCouponAutomatically().then(() => {
    useTracking().trackOrder('order_view', {
      value: orderTotal.value,
      coupon: autoRenewMonth.value === 1 ? monthlyCouponCode.value : yearlyCouponCode.value,
      currency: currency.value,
      items: [
        {
          plan: props.orderVersion,
          renew_period: props.planDuration,
          price: regularPrice.value,
          quantity: teamSeats.value,
          trial_days: trialDay.value || 0,
          ...(isCouponApplied.value ? { discount_price: regularPrice.value - couponDiscountPrice.value } : {}),
        },
      ],
    })
  })
})

onUnmounted(() => {
  props.isRegisterHash && unregister?.()
})

onBeforeRouteLeave(() => false)

watchEffect(() => {
  const name = profile.value?.first_name ? `${profile.value.first_name}'s Team` : ''
  newTeamName.value = name
  newTeamNameInputRef.value?.setInput?.(name)
})

const calculateEmailOverflow = () => {
  const invoiceEmailElement = paymentDialogRef.value?.querySelector('.invoice-email') as HTMLElement
  if (!invoiceEmailElement) return

  emailOverflow.value = invoiceEmailElement.scrollWidth > invoiceEmailElement.offsetWidth
}
</script>
