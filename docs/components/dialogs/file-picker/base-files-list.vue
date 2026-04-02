<script lang="ts">
import { CloudStorageFile } from 'client/types/file'
import { defineComponent, ref, watch } from 'vue'

export interface FilesListProps {
  files: CloudStorageFile[]
  selectedFile: CloudStorageFile | undefined
  filenameTransformer: (name: string) => string
  modifiedTimeTransformer: (time: string) => string
}

export default defineComponent({
  name: 'AppFilesList',
  components: {},
  props: {
    selectedFile: {
      type: Object as () => CloudStorageFile | undefined,
      default: undefined,
    },
    files: {
      type: Array as () => CloudStorageFile[],
      validator(value) {
        return Array.isArray(value)
      },
      default: () => [],
    },
    filenameTransformer: {
      type: Function,
      default: (name: string) => name,
    },
    modifiedTimeTransformer: {
      type: Function,
      default: (time: string) => time,
    },
  },
  emits: ['select', 'open'],
  setup(props, ctx) {
    const internalSelectedFile = ref<CloudStorageFile | undefined>()

    watch(
      () => props.selectedFile,
      newValue => {
        internalSelectedFile.value = newValue
      },
      { immediate: true },
    )

    const handleSelectFile = (file: CloudStorageFile) => ctx.emit('select', file)
    const handleOpenFile = (file: CloudStorageFile) => ctx.emit('open', file)

    return {
      handleSelectFile,
      handleOpenFile,
      internalSelectedFile,
    }
  },
})
</script>

<template>
  <div>
    <div v-for="(file, index) in files" :key="`file-list-item:${index}`">
      <div
        class="uk-padding-small file-list-item"
        :class="{ active: internalSelectedFile && internalSelectedFile.id === file.id }"
        @click="handleSelectFile(file)"
        @dblclick="handleOpenFile(file)"
      >
        <img v-if="file.type === 'folder'" uk-img class="uk-flex-no-shrink" :src="$toResourceURL('/assets/static/images/file-icons/folder.svg')" />
        <picture v-else-if="file.type === 'file'" class="uk-flex-no-shrink">
          <source :src="$toResourceURL('/assets/static/images/file-icons/xmind.webp')" type="image/webp" />
          <img style="height: 32px; width: 32px" :src="$toResourceURL('/assets/static/images/file-icons/xmind.png')" />
        </picture>

        <span class="file-list-item-name uk-margin-small-left">
          {{ filenameTransformer(file.name) }}
        </span>
        <span class="file-list-item-time uk-margin-small-left">
          {{ modifiedTimeTransformer(file.updatedTime) }}
        </span>
      </div>
      <hr class="uk-separator" />
    </div>
  </div>
</template>

<style scoped lang="less">
.file-list-item {
  display: flex;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
  align-items: center;
  cursor: pointer;
  transition: 0.2s ease;
  line-height: 38px;

  &:hover {
    background-color: #fafafa;
  }
  &.active {
    background-color: #fafafa;
  }
  &-icon {
    display: inline-block;
    flex-shrink: 0;
  }
  &-name {
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    white-space: nowrap;
    font-weight: 600;
  }
  &-time {
    display: inline-block;
    white-space: nowrap;
    flex-shrink: 0;
  }
}
</style>
