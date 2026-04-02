<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import ModalDialog from '../base-modal-dialog.vue'
import { ThirdPartyAccountProvider } from 'client/types/account'
import { usePromiseHook } from 'utils/vue-utils'

interface CloudProviderConfig {
  id: ThirdPartyAccountProvider
  title: string
}

export default defineComponent({
  name: 'AppConnectAccessTypeDialog',
  components: {
    ModalDialog,
  },
  props: {
    provider: {
      type: String as PropType<ThirdPartyAccountProvider>,
      required: true,
    },
  },
  setup(props) {
    const { resolve } = usePromiseHook()

    const handleSelect = (isFullAccessMode: boolean) => {
      resolve(isFullAccessMode)
    }

    const handleClose = () => {
      resolve()
    }

    const cloudProviderConfigs: CloudProviderConfig[] = [
      {
        id: ThirdPartyAccountProvider.Dropbox,
        title: 'Dropbox',
      },
      {
        id: ThirdPartyAccountProvider.GoogleDrive,
        title: 'Google Drive',
      },
      {
        id: ThirdPartyAccountProvider.Onedrive,
        title: 'OneDrive',
      },
    ]

    const title = computed(() => `Connect with ${cloudProviderConfigs.find(({ id }) => id === props.provider)?.title}`)

    return {
      handleSelect,
      title,
      handleClose,
    }
  },
})
</script>

<template>
  <modal-dialog
    :title="title"
    :is-opened="true"
    :width="664"
    :close-button="true"
    class="connect-access-type-dialog"
    :dialog-class="'uk-fw-modal-dialog-card-entity'"
    @modal-dialog-close="handleClose"
  >
    <div class="uk-width-1-1 uk-height-1-1 fw-flex fw-flex-column fw-flex-row@m fw-padding-bottom">
      <div class="fw-flex fw-flex-row fw-flex-column@m uk-width-1-1 fw-border-radius-medium uk-padding uk-fw-modal-dialog-card-entity-body">
        <img uk-svg class="fw-flex-no-shrink uk-preserve" :data-src="$toResourceURL('/assets/static/images/full-access.svg')" />
        <div class="uk-margin-small-left uk-hidden@m uk-flex-no-shrink"></div>
        <div class="fw-flex fw-flex-column fw-flex-right">
          <h3 class="fw-text-heading03 uk-margin-remove-bottom">{{ $T('Full Permission') }}</h3>
          <p>{{ $T('Grant Xmind AI the full permission to open, edit, create and delete all of xmind files in your Cloud Drive.') }}</p>

          <button class="uk-button uk-button-primary choose-button" @click="handleSelect(true)">{{ $T('Choose') }}</button>
        </div>
      </div>

      <div
        class="fw-flex fw-flex-row fw-flex-column@m uk-width-1-1 fw-border-radius-medium uk-padding uk-margin-top uk-fw-modal-dialog-card-entity-body"
      >
        <img uk-svg class="fw-flex-no-shrink uk-preserve" :data-src="$toResourceURL('/assets/static/images/scoped-access.svg')" />
        <div class="uk-margin-small-left uk-hidden@m uk-flex-no-shrink"></div>
        <div class="fw-flex fw-flex-column fw-flex-right">
          <h3 class="fw-text-heading03 uk-margin-remove-bottom">{{ $T('Limited Permission') }}</h3>
          <p>
            {{ $T('Grant Xmind AI the limited permission to open, edit, create and delete the specific xmind files you use with Xmind AI.') }}
          </p>
          <button class="uk-button uk-button-primary choose-button" @click="handleSelect(false)">{{ $T('Choose') }}</button>
        </div>
      </div>
    </div>
  </modal-dialog>
</template>

<style scoped lang="less">
@import '../../styles/variables';

.choose-button {
  width: 92px;

  @media (min-width: @breakpoint-medium) {
    align-self: flex-end;
  }
}
</style>
