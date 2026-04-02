<script lang="ts">
import { defineComponent, ref, PropType } from 'vue'
import ModalDialog from '../base-modal-dialog.vue'
import { ThirdPartyAccount } from 'client/types/account'
import { usePromiseHook } from 'utils/vue-utils'

export interface AccountSelectionDialogProps {
  isOpened: boolean
  thirdPartyAccounts: ThirdPartyAccount[]
  isLoadingThirdPartyAccounts: boolean
}

export default defineComponent({
  name: 'AppAccountSelectionDialog',
  components: {
    ModalDialog,
  },
  props: {
    onLoadThirdPartyAccounts: {
      type: Function as PropType<() => Promise<ThirdPartyAccount[]>>,
      required: true,
    },
  },
  setup(props) {
    const { resolve } = usePromiseHook()
    const isOpened = ref(false)
    const isLoadingThirdPartyAccounts = ref(true)
    const thirdPartyAccounts = ref<ThirdPartyAccount[]>([])

    props.onLoadThirdPartyAccounts().then((accounts: ThirdPartyAccount[]) => {
      thirdPartyAccounts.value = accounts
      isLoadingThirdPartyAccounts.value = false
    })

    const handleSelectAccount = (account: ThirdPartyAccount) => resolve(account)
    const handleClose = () => resolve()

    return {
      isOpened,
      isLoadingThirdPartyAccounts,
      thirdPartyAccounts,
      handleSelectAccount,
      handleClose,
    }
  },
})
</script>

<template>
  <modal-dialog
    :is-opened="true"
    :min-height="372"
    :max-height="535"
    :width="580"
    :title="'Select a connected account'"
    class="account-selection-dialog"
    @modal-dialog-close="handleClose"
  >
    <div class="account-selection-dialog__body uk-height-1-1 uk-width-1-1">
      <div class="uk-height-1-1 uk-width-1-1" style="padding-bottom: 44px">
        <div class="uk-position-relative uk-height-1-1 uk-overflow-auto uk-width-1-1">
          <fw-loading v-if="isLoadingThirdPartyAccounts" text=""></fw-loading>
          <div
            v-for="(account, index) in thirdPartyAccounts"
            v-else
            :key="`account-selection#${index}`"
            style="padding: 12px 16px"
            class="account-selection-dialog__body-item uk-flex uk-flex-between@s uk-flex-middle uk-margin-small-top uk-background-muted uk-width-1-1"
            @click="handleSelectAccount(account)"
          >
            <div v-if="account.provider === 'dropbox'" class="uk-flex-no-shrink">
              <img
                uk-img
                class="connect-dialog__brand-shadow uk-margin-right uk-flex-no-shrink"
                style="height: 32px; width: 32px"
                :data-src="$toResourceURL('/assets/static/images/third-party-logos/dropbox-connect-logo.svg')"
              />
              <span class="uk-visible@s"> Dropbox </span>
            </div>

            <div v-if="account.provider === 'googledrive'" class="uk-flex-no-shrink">
              <img
                uk-img
                class="connect-dialog__brand-shadow uk-margin-right uk-flex-no-shrink"
                style="height: 32px; width: 32px"
                :data-src="$toResourceURL('/assets/static/images/third-party-logos/googledrive-connect-logo.svg')"
              />
              <span class="uk-visible@s"> Google Drive </span>
            </div>
            <div v-if="account.provider === 'onedrive'" class="uk-flex-no-shrink">
              <img
                uk-img
                class="connect-dialog__brand-shadow uk-margin-right"
                style="height: 32px; width: 32px"
                :data-src="$toResourceURL('/assets/static/images/third-party-logos/onedrive-connect-logo.svg')"
              />
              <span class="uk-visible@s"> OneDrive </span>
            </div>

            <span class="uk-text-muted" style="word-break: break-all">
              {{ account.thirdPartyAccountId }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </modal-dialog>
</template>

<style scoped lang="less">
.account-selection-dialog {
  box-sizing: border-box;

  &__body-item {
    transition: 0.5s ease;
    user-select: none;
    outline: none;

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    &:focus,
    &:active {
      background-color: rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
