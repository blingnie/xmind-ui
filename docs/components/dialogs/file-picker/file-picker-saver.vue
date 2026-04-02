<script lang="ts">
import { CloudStorageFile } from 'client/types/file'
import { defineComponent, ref, computed, PropType } from 'vue'
// @ts-ignored
import { ModalDialogBottomButton } from '../../base-modal-dialog.vue'
// @ts-ignored
import BaseFilePicker, { FileModalProps } from './base-file-picker.vue'
import { usePromiseHook } from 'utils/vue-utils'

export type FilePickerSaverProps = Omit<FileModalProps, 'bottomButtons' | 'isDisableRecentFiles' | 'selectedFile' | 'recentFiles'>

export default defineComponent({
  name: 'AppFilePickerSaver',
  components: {
    BaseFilePicker,
  },
  props: {
    // isOpened: Boolean,
    // isLoading: Boolean,
    filenameTransformer: {
      type: Function,
      default: (name: string) => name,
    },
    onOpenRoot: {
      type: Function as PropType<() => Promise<{ paths: CloudStorageFile[]; files: CloudStorageFile[] }>>,
      required: true,
    },
    onOpenFolder: {
      type: Function as PropType<(file: CloudStorageFile) => Promise<{ paths: CloudStorageFile[]; files: CloudStorageFile[] }>>,
      required: true,
    },
  },
  setup(props) {
    const { resolve } = usePromiseHook()
    const isLoading = ref(true)
    const paths = ref<CloudStorageFile[]>([])
    const files = ref<CloudStorageFile[]>([])
    const virtualRootFile: CloudStorageFile = {
      id: '',
      type: 'folder',
      path: '',
      name: 'All Files',
      createdTime: '',
      updatedTime: '',
      thirdPartyAccountId: undefined,
      thirdPartyProvider: undefined,
      isTemporary: true,
    }
    const selectedFile = ref<CloudStorageFile>(virtualRootFile)

    props.onOpenRoot().then(result => {
      isLoading.value = false
      files.value = result.files
      paths.value = result.paths
    })

    const handleOpenFolder = async (file: CloudStorageFile) => {
      isLoading.value = true
      selectedFile.value = file
      const result = await props.onOpenFolder(file)
      paths.value = result.paths
      files.value = result.files.filter((file: CloudStorageFile) => file.type === 'folder')
      isLoading.value = false
    }
    const handleSelectFile = (file: CloudStorageFile) => (selectedFile.value = file)
    const handleClose = () => {
      resolve()
    }
    const bottomButtons = computed<ModalDialogBottomButton[]>(() => {
      return [
        {
          text: 'Choose',
          isDisabled: isLoading.value,
          onClick: () => {
            resolve(selectedFile.value)
          },
          classes: 'uk-button uk-button-primary uk-margin-small-left',
        },
      ]
    })

    return {
      files,
      paths,
      isLoading,
      bottomButtons,
      selectedFile,
      handleSelectFile,
      handleOpenFolder,
      handleClose,
    }
  },
})
</script>

<template>
  <base-file-picker
    :selected-file="selectedFile"
    :is-disable-recent-files="true"
    :bottom-buttons="bottomButtons"
    :is-opened="true"
    :is-recent-file-loading="false"
    :is-loading="isLoading"
    :filename-transformer="filenameTransformer"
    :files="files"
    :empty-content-tips="'No More Folders'"
    :paths="paths"
    @select="handleSelectFile"
    @open-folder="handleOpenFolder"
    @modal-dialog-close="handleClose"
  >
  </base-file-picker>
</template>
