<script lang="ts">
import { CloudStorageFile } from 'client/types/file'
import { defineComponent, ref } from 'vue'

export interface FilesListProps {
  paths: CloudStorageFile[]
  T: Function
}

export default defineComponent({
  name: 'AppFilesPaths',
  components: {},
  props: {
    paths: {
      type: Array as () => CloudStorageFile[],
      validator(value) {
        return Array.isArray(value)
      },
      default: () => [],
    },

    T: {
      type: Function,
      default: (text: string) => text,
    },
  },
  emits: ['open'],
  setup(props, ctx) {
    const internalSelectedFile = ref<CloudStorageFile | void>()

    // Simulate "All Files" in pathname
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

    const handleOpenFile = (file: CloudStorageFile) => ctx.emit('open', file)

    return {
      handleOpenFile,
      internalSelectedFile,
      virtualRootFile,
    }
  },
})
</script>

<template>
  <div class="files-paths uk-flex uk-flex-nowrap uk-flex-middle uk-padding uk-padding-remove-horizontal">
    <a @click="handleOpenFile(virtualRootFile)">
      {{ 'All Files' }}
    </a>
    <template v-for="(ancestor, index) in paths" :key="`file-pathname:${index}`">
      <span uk-icon="next"></span>
      <a :disabled="index === paths.length - 1" @click="handleOpenFile(ancestor)">
        {{ ancestor.name }}
      </a>
    </template>
  </div>
</template>

<style scoped lang="less">
.files-paths {
  > * {
    display: inline-block;
    font-size: 15px;
    line-height: 18px;
    text-decoration: none;
  }
  > a:not(:disabled) {
    color: #b2b2b2;
  }
  > .uk-icon {
    color: #b2b2b2;
    margin: 0 4px;
  }
  > a[disabled] {
    color: #000;
  }

  &-default {
    .uk-tab-indicator > li > a {
      font-size: 15px;
    }
  }
}
</style>
