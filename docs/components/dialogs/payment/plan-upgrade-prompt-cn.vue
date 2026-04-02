<template>
  <modal-dialog :is-opened="true" :width="dialogWidth" class="plan-upgrade-prompt-dialog" @modal-dialog-close="handleClose">
    <div class="dialog-container">
      <div class="absolute" :class="closeBtnPositionClasses">
        <span class="close-btn" @click="handleClose">
          <img uk-svg :data-src="$toResourceURL('/assets/static/images/dialog-payment/close.svg')" />
        </span>
      </div>
      <div class="flex flex-col items-center gap-6">
        <img
          uk-img
          class="h-[244px] w-full"
          :data-src="
            appearance === 'dark'
              ? toURL('/assets/static/images/dialog-payment/plan-upgrade-prompt-dark.jpg')
              : toURL('/assets/static/images/dialog-payment/plan-upgrade-prompt.jpg')
          "
        />
        <h2 class="font-bold">{{ $T('Upgrade and Go Unlimited') }}</h2>
        <p :style="{ maxWidth: promptMaxWidth }">{{ prompt }}</p>
        <button v-if="isFileOwner" class="tw-button-primary tw-button-medium" @click="handleUpgrade()">{{ $T('Upgrade Now') }}</button>
      </div>
    </div>
  </modal-dialog>
</template>

<script setup lang="ts">
import { usePromiseHook } from 'utils/vue-utils'
import ModalDialog from '../../new-base-modal-dialog.vue'
import { computed } from 'vue'
import { $T } from 'client/library/translation'
import { isPhoneViewportSmall } from 'utils/detectDevice'
import { useAccountStore, useAppStore, useServiceStore } from 'app/services/pinia'
import { storeToRefs } from 'pinia'
import { trackNewVersionWorks } from 'client/library/tracker'
import { useTeamSpaceData } from 'app/composables/team-space-data'

const props = defineProps<{
  teamId: string
  trigger: 'create-map' | 'create-sheet'
  limit: number
}>()
const { appearance } = storeToRefs(useAppStore())

const { resolve } = usePromiseHook()

const isFileOwner = useAccountStore().userXmindId === props.teamId

const handleUpgrade = async () => {
  const isMyWorksTeam = useTeamSpaceData().defaultTeamId.value === props.teamId
  switch (props.trigger) {
    case 'create-map':
      trackNewVersionWorks.upgradeDialog(isMyWorksTeam ? 'fromMyWorksMapLimitPop' : 'fromMapLimitPop')
      break
    case 'create-sheet':
      trackNewVersionWorks.upgradeDialog(isMyWorksTeam ? 'fromMyWorksMapLimitPop' : 'fromSheetLimitPop')
      break
  }

  await useServiceStore().services.action.dialog.openActivateDialog({ teamId: props.teamId })
  resolve(true)
}

const handleClose = () => {
  resolve(false)
}

const dialogWidth = isPhoneViewportSmall() ? 343 : 480

const closeBtnPositionClasses = isPhoneViewportSmall() ? 'top-6 right-6' : 'top-8 right-8'

const prompt = computed(() => {
  if (props.trigger === 'create-sheet') {
    return isFileOwner
      ? $T(
          '$1 can create up to $2 sheets per map. Upgrade to create unlimited sheets.',
          useAccountStore().isUserProSubscribed ? 'Pro 用户' : '免费用户',
          `${props.limit}`,
        )
      : $T(
          'Current plan users can create up to $1 sheets per map. Please try contacting the file owner to upgrade to create unlimited sheets.',
          `${props.limit}`,
        )
  } else {
    return $T('Current plan users can create up to $1 maps. Upgrade to create unlimited maps.', `${props.limit}`)
  }
})

const promptMaxWidth = computed(() => {
  if (isPhoneViewportSmall()) {
    return isFileOwner ? '300px' : '280px'
  } else {
    return isFileOwner ? '343px' : '380px'
  }
})
</script>

<style scoped lang="less">
@import '../../../styles/new-ui/new-variables.less';

[color-scheme='light'] .plan-upgrade-prompt-dialog {
  --title-color: @dark-grey-10;
  --prompt-color: @dark-grey-8;
  --close-btn-color: @transparent-dark-7;
}
[color-scheme='dark'] .plan-upgrade-prompt-dialog {
  --title-color: @light-grey-1;
  --prompt-color: @light-grey-1;
  --close-btn-color: @transparent-white-7;
}

.plan-upgrade-prompt-dialog {
  .dialog-container {
    width: 100%;
    text-align: center;

    .close-btn {
      color: var(--close-btn-color);
      cursor: pointer;
      opacity: 0.5;

      &:hover {
        opacity: 0.3;
      }
    }

    h2 {
      color: var(--title-color);
      font-size: 28px;
      line-height: 34px;
    }

    p {
      color: var(--prompt-color);
      font-size: 13px;
      line-height: 18px;
      margin: 0;
    }

    button {
      max-width: 400px;
      width: 100%;
    }
  }

  &:deep(.modal-dialog__body) {
    padding: 0px 0px 40px 0px;
  }

  &:deep(.modal-dialog__header),
  &:deep(.modal-dialog__footer) {
    display: none;
  }

  @media screen and (max-width: @breakpoint-small) {
    &:deep(.modal-dialog__body) {
      padding: 0px 0px 32px 0px;
    }

    .dialog-container {
      h2 {
        font-size: 24px;
        line-height: 30px;
      }

      button {
        max-width: 280px;
        width: 100%;
      }
    }
  }
}
</style>
