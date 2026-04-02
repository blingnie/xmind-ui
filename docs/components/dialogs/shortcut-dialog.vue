<script setup lang="ts">
import { ref } from 'vue'
import NewModalDialog from '../new-base-modal-dialog.vue'
import { usePromiseHook } from 'utils/vue-utils'
import { ShortcutManager } from 'client/library/shortcut-manager'

export interface ShortcutDialogConfiguration {
  title: string
  commands: {
    name: string
    shortcut: string
    isVisible?: boolean
  }[]
}

const props = defineProps<{
  onGetShortcutConfigurations: (() => Promise<ShortcutDialogConfiguration[]>) | null
}>()

const { resolve } = usePromiseHook()

const configurations = ref<ShortcutDialogConfiguration[]>()

const reloadShortcuts = async () => {
  configurations.value = await props.onGetShortcutConfigurations()
}

const handleClose = () => {
  resolve()
}

reloadShortcuts()
</script>

<template>
  <new-modal-dialog
    :title="$T('Shortcut')"
    :is-opened="true"
    :close-button="true"
    :width="544"
    :max-height="601"
    :dialog-footer-class="'hidden'"
    @modal-dialog-close="handleClose"
  >
    <div class="shortcut-dialog__body">
      <template v-for="(item, parentIndex) in configurations" :key="`shortcut-group-${parentIndex}`">
        <div class="shortcut-dialog__group">
          <span class="fw-text-caption" style="font-weight: 500; color: #949699">
            {{ item.title }}
          </span>
          <hr />
          <template v-for="(command, childIndex) in item.commands" :key="`shortcut-item-${parentIndex}-${childIndex}`">
            <div v-if="ShortcutManager.normalizeShortcutText(command.shortcut)" class="uk-flex uk-flex-middle uk-flex-between uk-margin-top">
              <span class="fw-text-caption">
                {{ command.name }}
              </span>
              <span class="fw-text-caption-bold">
                {{ ShortcutManager.normalizeShortcutText(command.shortcut) }}
              </span>
            </div>
          </template>
        </div>
      </template>
    </div>
  </new-modal-dialog>
</template>

<style lang="less" scoped>
.shortcut-dialog__body {
  padding-bottom: 24px;
}

.shortcut-dialog__group:not(:first-child) {
  margin-top: 24px;
}
</style>
