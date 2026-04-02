<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import AppBaseTopicLocatorPopover from './base-topic-locator.vue'
import { v1 as uuid } from 'uuid'
import { WorkbookManager } from 'client/library/workbook-next/workbook-manager'
import { getCurrentLanguage, Lang } from 'client/library/translation'
import { Language } from '@xmindltd/snowbird'

export default defineComponent({
  name: 'AppMarkerPopover',
  components: {
    AppBaseTopicLocatorPopover,
  },
  props: {
    isOpened: {
      type: Boolean,
      required: true,
    },
    workbookId: {
      type: String,
      default: '',
    },
    currentMarkerId: {
      type: String,
      default: '',
    },
  },
  emits: ['visibility-change'],
  setup(props: any, ctx: any) {
    const markerContainerId = 'id-' + uuid()
    const workbook = computed(() => props.workbookId && WorkbookManager.find(props.workbookId))
    const isMarkerPopoverVisible = computed(() => props.isOpened)
    const markers = computed(() => {
      if (props.currentMarkerId) {
        const markerModule = workbook.value.workbookEditor?.markerModule
        const { getMarkerInfoById, getMarkerGroupById } = markerModule
        const markerInfo = getMarkerInfoById(props.currentMarkerId)
        if (markerInfo && !markerInfo?.hidden) {
          const groupId = markerInfo.groupId
          const groupInfo = getMarkerGroupById(groupId, { lang: convertToSnowbirdLang(getCurrentLanguage()) })
          if (!groupInfo) return []
          return groupInfo.markerIds
            .map(markerId => {
              const { imageSrc, id, hidden } = getMarkerInfoById(markerId)
              if (hidden) return
              return {
                markerId: id,
                resource: imageSrc,
              }
            })
            .filter(marker => !!marker)
        }
      }
      return []
    })

    const container = ref<HTMLDivElement>()
    const containerHeight = ref<number>(42)
    const containerWidth = ref<number>(221)

    const refreshContainerSize = async () => {
      await new Promise(resolve => setTimeout(resolve))
      if (!container.value || !isMarkerPopoverVisible.value) {
        return
      }
      const markerContainer = container.value.querySelector('#' + markerContainerId)
      if (!markerContainer) return
      const bounds = markerContainer.getBoundingClientRect()
      containerHeight.value = bounds.height
      containerWidth.value = bounds.width
    }

    const handleVisibleChange = (newValue: boolean) => {
      if (newValue) {
        return
      }
      // action.ui.openMarkerPopover({ status: Boolean(newValue), markerId })
      ctx.emit('visibility-change', Boolean(newValue))
    }

    const handleChangeMarker = (markerId: string) => {
      if (!workbook.value) return
      workbook.value.workbookEditor.executeMutationAction({
        name: 'mutate:addMarker',
        inputValue: markerId,
      })
      handleVisibleChange(false)
    }
    const handleDeleteMarker = (markerId: string) => {
      if (!workbook.value) return
      workbook.value.mindMapActionExecutor?.executeMutationAction({
        name: 'mutate:removeMarker',
        inputValue: markerId,
      })
      handleVisibleChange(false)
    }

    const convertToSnowbirdLang = (lang: Lang) => {
      switch (lang) {
        case 'de':
          return Language.DE_DE
        case 'fr':
          return Language.FR_FR
        case 'ja-JP':
          return Language.JA_JP
        case 'zh-TW':
          return Language.ZH_TW
        case 'ru':
          return Language.RU_RU
        case 'vi':
          return Language.VN_VN
        case 'en-US':
        default:
          return Language.EN_US
      }
    }

    return {
      markers,
      container,
      containerWidth,
      containerHeight,
      // currentMarkerId,
      isMarkerPopoverVisible,
      handleVisibleChange,
      handleChangeMarker,
      handleDeleteMarker,
      refreshContainerSize,
      markerContainerId,
    }
  },
})
</script>

<template>
  <div ref="container">
    <app-base-topic-locator-popover
      :workbook-id="workbookId"
      :value="isMarkerPopoverVisible"
      :height="containerHeight"
      :width="containerWidth"
      @show="refreshContainerSize"
      @input="handleVisibleChange"
    >
      <div :id="markerContainerId" class="uk-flex uk-flex-row uk-flex-middle uk-padding-small">
        <button
          v-for="({ markerId, resource }, index) in markers"
          :key="`marker-popover-peer-${index}`"
          class="uk-padding-xsmall uk-button uk-button-tile fw-button-icon uk-button-icon uk-button-small"
          @mousedown.prevent="handleChangeMarker(markerId)"
        >
          <img
            draggable="false"
            uk-img
            class="uk-background-center-center uk-background-norepeat"
            style="height: 16px; width: 16px"
            :src="resource"
          />
        </button>

        <div class="uk-flex">
          <button
            class="uk-background-center-center uk-background-norepeat uk-button uk-button-tile uk-button-icon uk-icon uk-button-small uk-padding-xsmall"
            uk-icon="icon: trash"
            @click="handleDeleteMarker(currentMarkerId)"
          ></button>
        </div>
      </div>
    </app-base-topic-locator-popover>
  </div>
</template>
