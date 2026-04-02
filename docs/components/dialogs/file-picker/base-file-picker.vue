<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue'
import { debounce, prettyDate } from 'utils/misc'
import ModalDialog, { ModalDialogBottomButton } from '../../base-modal-dialog.vue'
import { CloudStorageFile } from 'client/types/file'
import { v1 as uuidv1 } from 'uuid'
import BaseFilesList from './base-files-list.vue'
import BaseFilesPaths from './base-files-paths.vue'

type SortBy = 'time' | 'size' | 'name'
export interface FileModalProps {
  isOpened: boolean

  // Current browser file list
  files: CloudStorageFile[]

  // User recently files
  isDisableRecentFiles: boolean
  isRecentFileLoading: boolean
  recentFiles: CloudStorageFile[]

  // Current Folder path array
  paths: CloudStorageFile[]

  isLoading: boolean

  filenameTransformer: (text: string) => string

  // T: (text: string) => string;

  selectedFile: CloudStorageFile

  bottomButtons: ModalDialogBottomButton[]

  emptyContentTips?: string
}

export default defineComponent({
  name: 'BaseFilePicker',
  components: {
    ModalDialog,
    BaseFilesList,
    BaseFilesPaths,
  },
  props: {
    isOpened: Boolean,
    isLoading: Boolean,
    hasRecentFiles: Boolean,
    isRecentFileLoading: Boolean,
    isDisableRecentFiles: Boolean,
    selectedFile: {
      type: Object as () => CloudStorageFile | undefined,
      default: undefined,
    },
    filenameTransformer: {
      type: Function,
      default: (name: string) => name,
    },
    files: {
      type: Array as () => CloudStorageFile[],
      validator(value) {
        return Array.isArray(value)
      },
      default: () => [],
    },
    recentFiles: {
      type: Array as () => CloudStorageFile[],
      validator(value) {
        return Array.isArray(value)
      },
      default: () => [],
    },
    paths: {
      type: Array as () => CloudStorageFile[],
      validator(value) {
        return Array.isArray(value)
      },
      default: () => [],
    },

    bottomButtons: {
      type: Array as () => ModalDialogBottomButton[],
      validator(value) {
        return Array.isArray(value)
      },
      default: () => [],
    },
    emptyContentTips: {
      type: String,
      default: '',
    },
  },
  emits: ['select', 'open-folder', 'mode-change', 'modal-dialog-close', 'open-recent-file', 'open-file'],
  setup(props, ctx) {
    const internalSelectedFile = ref<CloudStorageFile>()
    const isSearchMode = ref<boolean>(false)
    const searchKeywords = ref<string>('')
    const isRecentFiles = ref<boolean>(false)
    const sortBy = ref<SortBy>(null)
    const isSortByAscOrder = ref<boolean>(false)
    const searchInputElement = ref<HTMLInputElement>(null)

    const isShowPathnameMode = computed(() => props.paths.length > 0)
    const currentFiles = computed<CloudStorageFile[]>(() => {
      // Recent File only will be sorted by their time order
      if (isRecentFiles.value) {
        const computedFiles = props.recentFiles.filter(file => file.name.includes(searchKeywords.value || ''))
        return sortFiles(computedFiles, sortBy.value || 'time', isSortByAscOrder.value)
      }

      const files = props.files
      if (isSearchMode.value && searchKeywords.value) {
        // 2. Filter keyword for current files
        const computedFiles = files.filter(file => file.name.toLowerCase().includes(searchKeywords.value.toLowerCase()))
        // 3. Sort current files list
        return sortFiles(computedFiles, sortBy.value || 'name', isSortByAscOrder.value)
      } else {
        // 2. Not in search mode
        // 3. Sort current files list
        return sortFiles(files, sortBy.value || 'name', isSortByAscOrder.value)
      }
    })

    //
    // Utilities
    //
    const toPrettyLastModifiedTime = (date: string) => prettyDate(date)
    const sortFiles = (files: CloudStorageFile[], by: SortBy, isAsc = false) => {
      const normalizeTimestamp = (str: string) => new Date(str).getTime()
      const flipReflection = isAsc ? 1 : -1
      return (JSON.parse(JSON.stringify(files)) as CloudStorageFile[]).sort((fileA, fileB) => {
        if (by === 'time') {
          return (normalizeTimestamp(fileA.updatedTime || '') > normalizeTimestamp(fileB.updatedTime || '') ? 1 : -1) * flipReflection
        }
        if (by === 'size') {
          return ((fileA.size || 0) > (fileB.size || 0) ? 1 : -1) * flipReflection
        }
        // Sort by name.

        return (fileA.name[0].toLowerCase() < fileB.name[0].toLowerCase() ? 1 : -1) * flipReflection
      })
    }
    const handleSwitchSortMode = (by: SortBy, isAsc = false) => {
      sortBy.value = by || sortBy.value
      isSortByAscOrder.value = isAsc
    }
    const handleSwitchBrowserMode = async (mode: 'recent' | 'search' | 'default') => {
      if (props.isDisableRecentFiles && mode === 'recent') {
        return
      }

      ctx.emit('mode-change', mode)

      if (mode === 'recent') {
        isRecentFiles.value = true
      } else if (mode === 'search') {
        isSearchMode.value = true
        await new Promise(resolve => setTimeout(resolve))
        if (searchInputElement.value) {
          searchInputElement.value.focus()
        }
      } else {
        isRecentFiles.value = false
        isSearchMode.value = false
        handleUpdateSearchKeyword('')
      }
    }
    const handleSelectFile = (file: CloudStorageFile) => {
      internalSelectedFile.value = file
      ctx.emit('select', file)
    }
    const handleOpenSelectedFile = (file?: CloudStorageFile) => {
      if (!file) return
      const currentFile = file || internalSelectedFile.value
      if (!currentFile) return
      if (currentFile.type === 'file') {
        ctx.emit(isRecentFiles.value ? 'open-recent-file' : 'open-file', currentFile)
      }
      if (currentFile.type === 'folder') {
        ctx.emit('open-folder', currentFile)
      }
    }
    const handleUpdateSearchKeywordWithDebounce = debounce((newKeyword: string) => (searchKeywords.value = newKeyword), 250)
    const handleUpdateSearchKeyword = (newKeyword: string) => {
      searchKeywords.value = newKeyword
    }

    watch(
      () => props.selectedFile,
      newValue => {
        internalSelectedFile.value = newValue
      },
      { immediate: true },
    )

    return {
      handleSelectFile,
      handleOpenSelectedFile,
      handleUpdateSearchKeywordWithDebounce,
      handleUpdateSearchKeyword,
      toPrettyLastModifiedTime,
      handleSwitchBrowserMode,
      handleSwitchSortMode,

      currentFiles,
      isRecentFiles,
      isShowPathnameMode,
      isSearchMode,
      searchKeywords,
      searchInputElement,
      internalSelectedFile,
      sortBy,
      isSortByAscOrder,
      sortButtonId: `sort-button-${uuidv1()}`,
    }
  },
})
</script>

<template>
  <div>
    <modal-dialog :width="500" :height="580" :is-opened="true" :buttons="bottomButtons" @modal-dialog-close="$emit('modal-dialog-close')">
      <div class="file-picker">
        <!-- Search / Directory Path / Recent files or All Files -->
        <div class="file-picker__header uk-background-default uk-flex-no-shrink">
          <div v-show="isSearchMode" class="file-picker__header-search uk-flex uk-flex-between uk-padding">
            <div class="uk-position-relative uk-width-1-1 file-picker__search-input">
              <span uk-svg class="uk-text-muted" :data-src="$toResourceURL('/assets/static/images/uncategory/zoomer.svg')"></span>
              <input
                ref="searchInputElement"
                class="uk-input"
                autofocus
                :placeholder="'Search your files.'"
                @input="handleUpdateSearchKeywordWithDebounce(($event.target as HTMLInputElement).value)"
                @keydown.enter="handleUpdateSearchKeyword(($event.target as HTMLInputElement).value)"
              />
            </div>
            <button
              data-focus="not-allow"
              class="uk-button uk-button-text uk-button-icon uk-border-none uk-icon uk-margin-small-left"
              @click="handleSwitchBrowserMode('default')"
            >
              <img uk-svg :data-src="$toResourceURL('/assets/static/images/uncategory/close.svg')" />
            </button>
          </div>

          <div v-show="!isSearchMode" class="uk-flex uk-flex-between uk-padding uk-padding-remove-vertical">
            <base-files-paths v-show="isShowPathnameMode" :paths="paths" @open="handleOpenSelectedFile"> </base-files-paths>
            <ul v-show="!isShowPathnameMode" uk-tab class="uk-tab uk-tab-indicator">
              <li v-if="!isDisableRecentFiles" :aria-expanded="isRecentFiles ? 'true' : 'false'" :class="{ 'uk-active': isRecentFiles }">
                <a @click="handleSwitchBrowserMode('recent')">
                  {{ 'Recent' }}
                </a>
              </li>
              <li :aria-expanded="!isRecentFiles ? 'true' : 'false'" :class="{ 'uk-active': !isRecentFiles }">
                <a @click="handleSwitchBrowserMode('default')">
                  {{ 'All Files' }}
                </a>
              </li>
            </ul>
            <div class="uk-flex uk-flex-middle">
              <button
                :id="sortButtonId"
                data-focus="not-allow"
                class="uk-button uk-button-text uk-button-icon uk-border-none uk-icon uk-margin-small-left"
              >
                <img uk-svg :data-src="$toResourceURL('/assets/static/images/home/filter.svg')" />
              </button>
              <button
                data-focus="not-allow"
                class="uk-button uk-button-text uk-button-icon uk-border-none uk-icon uk-margin-small-left"
                @click="handleSwitchBrowserMode('search')"
              >
                <img uk-svg :data-src="$toResourceURL('/assets/static/images/uncategory/zoomer.svg')" />
              </button>
            </div>
          </div>
          <hr class="uk-separator" />
        </div>
        <div class="file-picker__body uk-background-default uk-height-1-1 uk-padding uk-child-separator uk-position-relative uk-overflow-auto">
          <fw-loading v-if="isLoading || isRecentFileLoading" class="uk-position-absolute"></fw-loading>
          <base-files-list
            v-else-if="currentFiles.length"
            :selected-file="internalSelectedFile"
            :filename-transformer="filenameTransformer"
            :modified-time-transformer="toPrettyLastModifiedTime"
            :files="currentFiles"
            @select="handleSelectFile"
            @open="handleOpenSelectedFile"
          >
          </base-files-list>
          <div v-else class="uk-flex uk-flex-middle uk-flex-center uk-width-1-1 uk-height-1-1">
            {{ emptyContentTips || 'No Files' }}
          </div>
        </div>
      </div>
    </modal-dialog>

    <!-- Place outer of the modal component to avoid popover overlay cover issue -->
    <div
      uk-pop-tips="alignSize: false; mode: click; zIndex:1020;pos: bottom-right"
      class="uk-box-shadow-floating"
      data-sel-close="[uk-menu] > li > button"
      :data-target="'#' + sortButtonId"
      :data-toggle="'#' + sortButtonId"
    >
      <ul uk-menu>
        <li>
          <button :class="{ 'uk-checked': sortBy === 'time' && isSortByAscOrder }" @click="handleSwitchSortMode('time', true)">
            {{ 'Modified date (Oldest)' }}
          </button>
        </li>
        <li>
          <button :class="{ 'uk-checked': sortBy === 'time' && !isSortByAscOrder }" @click="handleSwitchSortMode('time', false)">
            {{ 'Modified date (Newest)' }}
          </button>
        </li>
        <li>
          <button :class="{ 'uk-checked': sortBy === 'size' && isSortByAscOrder }" @click="handleSwitchSortMode('size', true)">
            {{ 'Size (Smallest)' }}
          </button>
        </li>
        <li>
          <button :class="{ 'uk-checked': sortBy === 'size' && !isSortByAscOrder }" @click="handleSwitchSortMode('size', false)">
            {{ 'Size (Biggest)' }}
          </button>
        </li>
        <li>
          <button :class="{ 'uk-checked': (sortBy === 'name' || !sortBy) && isSortByAscOrder }" @click="handleSwitchSortMode('name', true)">
            {{ 'Name (Z-A)' }}
          </button>
        </li>
        <li>
          <button :class="{ 'uk-checked': (sortBy === 'name' || !sortBy) && !isSortByAscOrder }" @click="handleSwitchSortMode('name', false)">
            {{ 'Name (A-Z)' }}
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="less">
@import '../../../styles/variables';
[uk-pop-tips] > [uk-menu] > li > button {
  padding-left: @menu-checked-padding-left-patch;
}

.file-picker {
  margin-left: -44px;
  margin-right: -44px;
  margin-top: -15px;

  @media only screen and (max-width: @breakpoint-medium) {
    margin-left: -24px;
    margin-right: -24px;
  }

  display: flex;
  flex-direction: column;
  height: 100%;

  &__body {
    max-width: 100%;
    width: 100%;
    overflow: auto;
  }

  &__search-input {
    > [uk-svg] {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      left: 0;
      margin-left: 20px;
      color: #b2b2b2;
    }

    > input {
      width: 100%;
      height: auto;
      border-radius: 18px;
      border-color: #b2b2b2;
      outline: none;
      padding: 8px 18px 8px 48px;
      box-shadow: none;

      &:focus {
        outline: none;
        border: 1px solid #b2b2b2;
      }
    }
  }
}
</style>
