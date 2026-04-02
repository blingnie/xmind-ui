<script lang="ts" setup>
import { ref } from 'vue'
import { usePromiseHook } from 'utils/vue-utils'
import { useAppStore } from 'app/services/pinia'
import ModalDialog from '../new-base-modal-dialog.vue'
import Login from 'app/fragments/router-views/login/login.vue'
import LoginCn from 'app/fragments/router-views/login-cn/login.vue'
import { REGION, showCompleteInformationSessionStorageKey } from 'client/constants'
import { localStore } from 'utils/browserStorage'

const props = withDefaults(
  defineProps<{
    isClosable: boolean
    afterLogin?: () => Promise<boolean> | boolean
    isSolidBackground?: boolean
  }>(),
  {
    isClosable: true,
    afterLogin: undefined,
    isSolidBackground: false,
  },
)

const { resolve } = usePromiseHook()
const isLoading = ref(false)
const switchLoadingStatus = (loading: boolean) => {
  isLoading.value = loading
}
const handleClose = () => {
  if (isLoading.value || !props.isClosable) return

  useAppStore().setLoginSignupDialogOpened(false)
  resolve(false)
}

const afterSuccess = async () => {
  isLoading.value = true
  if (props.afterLogin) {
    const result = await props.afterLogin()
    if (!result) handleClose()
  }
  isLoading.value = false
  useAppStore().setLoginSignupDialogOpened(false)
  resolve(true)
}

const onNewUser = async () => {
  localStore.set(showCompleteInformationSessionStorageKey, 'true')
  await afterSuccess()
}
</script>

<template>
  <modal-dialog
    :is-opened="true"
    :close-button="false"
    :width="514"
    :use-overlay-scrollbar="true"
    :dialog-header-styles="{ padding: '0' }"
    :dialog-footer-styles="{ padding: '0' }"
    :overlay-classes="isSolidBackground ? '!bg-light-grey-2 dark:!bg-dark-grey-10' : ''"
    class="login-dialog"
    @modal-dialog-close="handleClose"
  >
    <login-cn
      v-if="REGION === 'cn'"
      :is-loading="isLoading"
      @switch-loading="switchLoadingStatus"
      @login-success="afterSuccess"
      @new-user="onNewUser"
    />
    <login v-else :is-loading="isLoading" @switch-loading="switchLoadingStatus" @login-success="afterSuccess" @new-user="onNewUser" />
  </modal-dialog>
</template>

<style scoped lang="less">
@import '../../styles/new-ui/new-variables.less';

.login-dialog {
  :deep(.modal-dialog__body) {
    min-height: 100%;
    height: auto !important;
    padding: 40px !important;
    @media only screen and (max-width: @breakpoint-small) {
      padding: 32px !important;
    }
  }

  :deep(.login-title),
  :deep(.signup-title),
  :deep(.profile-title) {
    @media only screen and (max-width: @breakpoint-small) {
      font-size: 24px;
    }
  }
}
</style>
