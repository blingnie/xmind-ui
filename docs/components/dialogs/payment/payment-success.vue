<template>
  <modal-dialog :is-opened="true" :width="360" class="payment-success-dialog" @modal-dialog-close="handleClose">
    <div class="flex flex-col items-center">
      <div class="dialog-container">
        <div v-if="isUpgradePlanOrder">
          <h2 class="text-desktop-subhead-large">{{ $T('Welcome to') }}</h2>
          <h1 class="text-desktop-headline-large">{{ REGION === 'cn' ? `Xmind ${planName}` : planName }}</h1>
        </div>
        <div class="h-20 w-20 bg-contain bg-no-repeat" :class="isIndividualPlan ? 'rounded-full' : 'rounded-2xl'" uk-img :data-src="avatarUrl"></div>
        <h1 v-if="orderVersion === 'addon'" class="!text-[24px]">{{ paymentSuccessDescription }}</h1>
        <div class="flex flex-col gap-3 text-desktop-body-large">
          <template v-if="isUpgradePlanOrder">
            <p class="text-desktop-body-large">
              <span>{{ $T('Your journey starts here!') }}</span>
              <span>{{ $T('Enjoy and happy mind mapping!') }}</span>
            </p>
          </template>
          <template v-else-if="orderVersion === 'addon'">
            <template v-if="REGION === 'cn'">
              <p class="text-desktop-body-3">
                <span>{{ '欢迎购买 AI 加量包，' }}</span>
                <span>{{ '本次已成功为你增加 AI 使用次数。' }}</span>
                <span>{{ '尽情享受 AI 加持的思维导图新体验。' }}</span>
              </p>
            </template>
            <template v-else>
              <p class="text-desktop-body-large">
                {{ $T('Thank you for purchasing Credits Add-on. An additional 500 credits has been successfully added to your balance.') }}
              </p>
              <p>{{ $T('Enjoy and happy mind mapping!') }}</p>
            </template>
          </template>
        </div>
        <base-button v-if="REGION === 'cn' && orderVersion === 'addon'" size="medium" theme="ai" @click="handleClose()">{{ '立即使用' }}</base-button>
        <base-button v-else size="medium" theme="secondary" @click="handleClose()">{{ $T('Start Now') }}</base-button>
      </div>
    </div>
  </modal-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePromiseHook } from 'utils/vue-utils'
import { useConfetti } from 'client/composables/use-confetti'
import { getPlanName, type OrderVersion } from 'client/library/payment'
import { useAccountStore } from 'client/store/account-store'
import ModalDialog from '../../new-base-modal-dialog.vue'
import BaseButton from 'client/components/base/button.vue'
import { generateAvatarDataURI } from 'client/library/cloud-kit/utils/avatar'
import type { TeamMetadata } from 'client/library/cloud-kit'
import { $T } from 'client/library/translation'
import toURL from 'utils/to-url'
import { REGION } from 'client/constants'

const props = defineProps<{
  orderVersion: OrderVersion
  isTrialOrder: boolean
  team: TeamMetadata
}>()

const { profile } = useAccountStore()

const isIndividualPlan = computed(
  () => props.orderVersion === 'duo' || props.orderVersion === 'plus' || props.orderVersion === 'xmbund' || props.orderVersion === 'premium',
)
const avatarUrl = computed(() => {
  return isIndividualPlan.value
    ? profile?.avatar_url ||
        generateAvatarDataURI({ name: profile?.full_name, xmindId: profile?.user }) ||
        toURL('/assets/static/images/home-top-bar/avatar2.svg')
    : props.team.imageUrl || generateAvatarDataURI({ name: props.team.name, xmindId: props.team.teamId, style: { fontWeight: '600' } })
})

const { resolve } = usePromiseHook()
const handleClose = () => {
  resolve(true)
}

const isUpgradePlanOrder = computed(() => ['plus', 'premium', 'essential', 'business', 'duo', 'xmbund'].includes(props.orderVersion))
const planName = computed(() => getPlanName(props.orderVersion))

const paymentSuccessDescription = REGION === 'cn' ? '🎉 ' + '付款成功！' : $T('Payment Successful')

const { showRainingConfetti } = useConfetti()
showRainingConfetti()
</script>

<style scoped lang="less">
@import '../../../styles/new-ui/new-variables.less';

[color-scheme='light'] .payment-success-dialog {
  --title-color: @dark-grey-10;
}
[color-scheme='dark'] .payment-success-dialog {
  --title-color: @light-grey-1;
}

.payment-success-dialog {
  .dialog-container {
    display: flex;
    width: 100%;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 16px;
    text-align: center;

    h1 {
      margin: 0;
      color: var(--title-color);
      font-size: 28px;
      font-weight: 700;
      line-height: 34px;
    }

    h2 {
      font-size: 18px;
      font-weight: 700;
    }

    p {
      font-size: 13px;
      line-height: 18px;
      max-width: 400px;
      margin: 0;

      span {
        display: block;
      }
    }

    > button {
      margin-top: 24px;
      max-width: 400px;
      width: 100%;
    }
  }

  @media screen and (max-width: @breakpoint-small) {
    .dialog-container {
      padding: 0px 0px 32px 0px;

      > h1 {
        font-size: 24px;
        line-height: 30px;
      }

      > p,
      > button {
        max-width: 279px;
      }
    }
  }

  &:deep(.modal-dialog__body) {
    padding: 32px;
    overflow: visible;
  }

  &:deep(.modal-dialog__header),
  &:deep(.modal-dialog__footer) {
    display: none;
  }
}
</style>
