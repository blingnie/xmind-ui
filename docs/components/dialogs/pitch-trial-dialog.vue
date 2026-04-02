<template>
  <modal-dialog
    :is-opened="true"
    :close-button="true"
    :width="540"
    :dialog-body-styles="{ padding: 0, borderRadius: '16px', position: 'relative', overflow: 'overlay' }"
    :dialog-header-class="'!absolute w-full'"
    :dialog-header-styles="{ width: '100%' }"
    class="pitch-trial-dialog"
    @modal-dialog-close="handleClose"
  >
    <div>
      <img
        class="uk-width-1-1 uk-height-1-1 uk-img"
        draggable="false"
        :src="$toResourceURL('/assets/static/images/pitchmode/pitch-trial.jpg')"
        alt="Xmind AI pitch"
      />
    </div>

    <div class="pitch-trial-dialog-content uk-position-relative">
      <h1 class="pitch-trial-dialog-subscribe-title uk-text-bold">
        {{ $T('Pitch Mode') }}
      </h1>
      <p class="pitch-trial-dialog-subscribe-desc">
        <span>{{
          $T(
            'Your mind map is a slide show, one click to go. Pitch Mode generates smooth transitions and layouts for your mind map. Brainstorm, outline, rehearse, and present all in one place.',
          )
        }}</span>
        <span class="uk-display-block uk-margin-top">{{
          $T('You can only present the first five slides in Xmind Free plan. Upgrade to Xmind Pro to fully present.')
        }}</span>
      </p>

      <div class="pitch-trial-dialog-buttons uk-flex uk-flex-middle uk-flex-between">
        <button class="fw-override uk-button uk-button-default uk-width-1-1 uk-flex uk-flex-center uk-flex-middle uk-text-nowrap" @click="upgrade">
          <span>{{ $T('Upgrade Now') }}</span>
        </button>
        <button class="fw-override uk-button uk-button-primary uk-width-1-1 uk-flex uk-flex-center uk-flex-middle uk-text-nowrap" @click="tryForFree">
          <span>{{ $T('Try For Free') }}</span>
        </button>
      </div>
    </div>
  </modal-dialog>
</template>

<script lang="ts" setup>
import { usePromiseHook } from 'utils/vue-utils'
import ModalDialog from '../new-base-modal-dialog.vue'

const props = defineProps<{
  handleTryForFree: () => Promise<void>
  handleUpgrade: () => Promise<void>
}>()

const { resolve } = usePromiseHook()

const handleClose = () => {
  resolve(false)
}

const tryForFree = async () => {
  await props.handleTryForFree()
  resolve(true)
}

const upgrade = async () => {
  await props.handleUpgrade()
  resolve(false)
}
</script>

<style scoped lang="less">
@import '../../styles/variables';

.pitch-trial-dialog {
  ::-webkit-scrollbar {
    display: none;
  }

  .pitch-trial-dialog-content {
    padding: 24px 40px;
    .pitch-trial-dialog-subscribe-title {
      font-size: 28px;
      line-height: 34px;
      font-weight: 700;
      margin-bottom: 24px;
    }

    .pitch-trial-dialog-subscribe-desc {
      font-size: 13px;
      line-height: 18px;
      margin-bottom: 40px;
    }
  }

  .pitch-trial-dialog-buttons {
    gap: 16px;
    > button {
      height: 32px;
    }
  }
}
</style>
