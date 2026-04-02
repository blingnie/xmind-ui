<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import ModalDialog from '../base-modal-dialog.vue'
import { ThirdPartyAccount, ThirdPartyAccountProvider } from 'client/types/account'
import { usePromiseHook } from 'utils/vue-utils'
import { sortThirdPartyAccount } from 'utils/third-party-account'

// export interface ConnectDialogProps {
//   isOpened: boolean;
//   isLoadingThirdPartyAccounts: boolean;
//   isRevokingThirdPartyAccount: boolean;
//   thirdPartyAccounts: ThirdPartyAccount[];
// }

interface CloudProviderConfig {
  id: ThirdPartyAccountProvider
  imageUrl: string
  handler: () => any
  title: string
}

interface CloudProviderConnected {
  id: ThirdPartyAccountProvider
  imageUrl: string
  title: string
  isScoped?: boolean
}

export default defineComponent({
  name: 'AppConnectDialog',
  components: {
    ModalDialog,
  },
  props: {
    isShowConnectedAccounts: {
      type: Boolean,
      default: true,
    },
    onLoadThirdPartyAccounts: {
      type: Function,
      required: true,
    },
    onAuthorize: {
      type: Function,
      required: true,
    },
    onRevoke: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const { resolve } = usePromiseHook()
    const isOpened = ref(false)
    const isLoadingThirdPartyAccounts = ref(true)
    const isRevokingThirdPartyAccount = ref(false)
    const thirdPartyAccounts = ref<ThirdPartyAccount[]>([])

    const reloadAccounts = async () => {
      if (!props.isShowConnectedAccounts) return
      isLoadingThirdPartyAccounts.value = true
      thirdPartyAccounts.value = await props.onLoadThirdPartyAccounts()
      isLoadingThirdPartyAccounts.value = false
    }

    const computedThirdPartyAccounts = computed(() => sortThirdPartyAccount(thirdPartyAccounts.value))

    const handleGotoToDropboxAuthorize = () => {
      props.onAuthorize('dropbox')
    }
    const handleGotoGoogleDriveAuthorize = () => {
      props.onAuthorize('googledrive')
    }
    const handleGotoOnedriveAuthorize = () => {
      props.onAuthorize('onedrive')
    }
    const handleRevokeThirdPartyAccount = async (thirdPartyAccount: ThirdPartyAccount) => {
      isRevokingThirdPartyAccount.value = true
      const refreshedAccounts = await props.onRevoke(thirdPartyAccount)
      isRevokingThirdPartyAccount.value = false
      if (refreshedAccounts) {
        thirdPartyAccounts.value = JSON.parse(JSON.stringify(refreshedAccounts))
      }
    }
    const handleClose = () => {
      isOpened.value = false
      resolve()
    }

    reloadAccounts()

    const cloudProviderConfigs: CloudProviderConfig[] = [
      {
        id: ThirdPartyAccountProvider.Dropbox,
        imageUrl: '/assets/static/images/third-party-logos/dropbox-connect-logo.svg',
        title: 'Dropbox',
        handler: handleGotoToDropboxAuthorize,
      },
      {
        id: ThirdPartyAccountProvider.GoogleDrive,
        imageUrl: '/assets/static/images/third-party-logos/googledrive-connect-logo.svg',
        title: 'Google Drive',
        handler: handleGotoGoogleDriveAuthorize,
      },
      {
        id: ThirdPartyAccountProvider.Onedrive,
        imageUrl: '/assets/static/images/third-party-logos/onedrive-connect-logo.svg',
        title: 'OneDrive',
        handler: handleGotoOnedriveAuthorize,
      },
    ]

    const connectedCloudProviderConfigs: CloudProviderConnected[] = [
      {
        id: ThirdPartyAccountProvider.Dropbox,
        imageUrl: '/assets/static/images/third-party-logos/dropbox-connect-logo.svg',
        title: 'Dropbox',
        isScoped: false,
      },
      {
        id: ThirdPartyAccountProvider.DropboxScoped,
        imageUrl: '/assets/static/images/third-party-logos/dropbox-connect-logo.svg',
        title: 'Dropbox',
        isScoped: true,
      },
      {
        id: ThirdPartyAccountProvider.GoogleDrive,
        imageUrl: '/assets/static/images/third-party-logos/googledrive-connect-logo.svg',
        title: 'Google Drive',
        isScoped: false,
      },
      {
        id: ThirdPartyAccountProvider.GoogleDriveScoped,
        imageUrl: '/assets/static/images/third-party-logos/googledrive-connect-logo.svg',
        title: 'Google Drive',
        isScoped: true,
      },
      {
        id: ThirdPartyAccountProvider.Onedrive,
        imageUrl: '/assets/static/images/third-party-logos/onedrive-connect-logo.svg',
        title: 'OneDrive',
        isScoped: false,
      },
      {
        id: ThirdPartyAccountProvider.OneDriveScoped,
        imageUrl: '/assets/static/images/third-party-logos/onedrive-connect-logo.svg',
        title: 'OneDrive',
        isScoped: true,
      },
    ]

    return {
      isOpened,
      isRevokingThirdPartyAccount,
      isLoadingThirdPartyAccounts,
      thirdPartyAccounts,
      cloudProviderConfigs,
      connectedCloudProviderConfigs,
      computedThirdPartyAccounts,
      handleClose,
      handleGotoToDropboxAuthorize,
      handleGotoGoogleDriveAuthorize,
      handleGotoOnedriveAuthorize,
      handleRevokeThirdPartyAccount,
    }
  },
})
</script>

<template>
  <modal-dialog
    :title="thirdPartyAccounts.length ? $T('Manage Cloud Drive') : $T('Connect Cloud Drive')"
    :is-opened="true"
    :width="553"
    :max-height="610"
    :close-button="true"
    :dialog-class="'uk-fw-modal-dialog-card-entity'"
    class="connect-dialog"
    @modal-dialog-close="handleClose"
  >
    <div class="connect-dialog__body uk-position-relative">
      <div
        class="connect-dialog-logos-container connect-dialog__container__white uk-flex uk-flex-nowrap uk-flex-between uk-flex-no-shrink uk-position-relative uk-fw-modal-dialog-card-entity-body"
      >
        <div
          v-for="(config, index) in cloudProviderConfigs"
          :key="`connect-dialog-provider:${index}`"
          class="uk-flex uk-flex-column uk-flex-center uk-flex-middle connect-dialog-logos-container-item"
        >
          <div class="connect-dialog-logos-container-item-logo">
            <img uk-img class="connect-dialog__brand-logo" :data-src="$toResourceURL(config.imageUrl)" />
            <span class="connect-dialog-logos-container-item-logo-text fw-text-button@m fw-text-caption">
              {{ config.title }}
            </span>
          </div>
          <button class="uk-button uk-button-small uk-button-secondary connect-dialog-logos-container-item-connect-btn" @click="config.handler">
            {{ $T('Connect') }}
          </button>
        </div>
      </div>

      <div v-if="isShowConnectedAccounts" class="connect-dialog__connected-accounts uk-position-relative uk-height-1-1 uk-margin-top">
        <div class="uk-margin-bottom">
          <span class="fw-text-heading03">
            {{ $T('Your Connection') }}
          </span>
        </div>
        <div
          class="connect-dialog__container__white uk-overflow-auto uk-position-relative uk-fw-modal-dialog-card-entity-body"
          style="min-height: 188px"
        >
          <fw-loading
            v-if="isLoadingThirdPartyAccounts"
            class="uk-position-absolute uk-position-z-index"
            style="background-color: transparent"
            text=""
          ></fw-loading>
          <div
            v-for="(account, index) in computedThirdPartyAccounts"
            :key="`connectedAccount#${index}`"
            class="connect-dialog__connected-connection uk-flex uk-flex-between uk-flex-middle"
          >
            <template v-for="(config, cloudProviderConfigIndex) in connectedCloudProviderConfigs">
              <div
                v-if="account.provider === config.id"
                :key="`connect-dialog-provider:${cloudProviderConfigIndex}`"
                class="uk-width-1-1 uk-flex uk-flex-middle uk-overflow-hidden"
              >
                <img uk-img class="connect-dialog__brand-logo-small" :data-src="$toResourceURL(config.imageUrl)" />
                <div class="uk-margin-left uk-flex uk-flex-column uk-overflow-hidden">
                  <div>
                    <span class="fw-text-button@m fw-text-caption">
                      {{ config.title }}
                    </span>
                    <span
                      v-if="config.isScoped"
                      title="Access, edit, create and delete the specific xmind files used in Xmind AI."
                      class="connect-dialog__connected-account-scoped uk-text-muted uk-border-rounded"
                    >
                      Limited
                    </span>
                  </div>
                  <span class="connect-dialog__connected-account fw-text-small fw-overflow-ellipsis uk-text-muted uk-overflow-hidden">
                    {{ account.thirdPartyAccountId }}
                  </span>
                </div>
              </div>
            </template>

            <button
              class="uk-button uk-button-default uk-button-small uk-flex-no-shrink"
              :disabled="isRevokingThirdPartyAccount || isLoadingThirdPartyAccounts"
              @click="handleRevokeThirdPartyAccount(account)"
            >
              {{ $T('Disconnect') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </modal-dialog>
</template>

<style scoped lang="less">
@import '../../styles/variables';

.connect-dialog {
  box-sizing: border-box;

  * {
    box-sizing: border-box;
  }

  .connect-dialog-logos-container {
    @media only screen and (max-width: @breakpoint-small) {
      flex-direction: column;
    }

    .connect-dialog-logos-container-item {
      @media only screen and (max-width: @breakpoint-small) {
        flex-direction: row;
        justify-content: space-between;
        margin-bottom: 16px;
      }
      &:last-of-type {
        margin-bottom: 0;
      }

      .connect-dialog-logos-container-item-logo {
        @media only screen and (min-width: @breakpoint-small) {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
      }
      .connect-dialog-logos-container-item-logo-text {
        @media only screen and (max-width: @breakpoint-small) {
          margin-left: 16px;
        }
      }

      .connect-dialog-logos-container-item-connect-btn {
        @media only screen and (min-width: @breakpoint-small) {
          margin-top: 16px;
        }
      }
    }
  }

  .connect-dialog__container__white {
    padding: 24px 32px;
    border-radius: 12px;
    @media (max-width: @breakpoint-medium) {
      padding: 16px;
    }
  }

  .connect-dialog__connected-connection:not(:first-child) {
    margin-top: 16px;
  }

  .connect-dialog__brand-logo {
    width: 58px;
    height: 58px;

    @media (max-width: @breakpoint-medium) {
      width: 32px;
      height: 32px;
    }
  }
  .connect-dialog____brand-logo-small {
    width: 32px;
    height: 32px;
  }

  .connect-dialog__connected-accounts {
    text-overflow: ellipsis;
  }

  .connect-dialog__connected-account-scoped {
    padding: 0 4px;
    box-shadow: 0 0 0 2px grey;
    margin-left: 4px;
    font-size: 20px;
    display: inline-block;
    transform-origin: left center;
    transform: scale(0.5);
    vertical-align: middle;
  }

  .connect-dialog__body {
    padding-bottom: 32px;
    @media (max-width: @breakpoint-medium) {
      padding-bottom: 24px;
    }
  }
}
</style>
