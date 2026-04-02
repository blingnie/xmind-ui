<template>
  <div
    ref="mentionsMenuDiv"
    class="mentions-menu absolute w-[230px] rounded-lg border border-solid border-border-panel-light bg-fill-surface-light p-2 shadow-elevation-l4-light dark:border-border-panel-dark dark:bg-fill-surface-dark dark:shadow-elevation-l4-dark"
  >
    <div v-for="(item, index) in menuItems" :key="`mention-${index}`" class="mention-item" :class="{ selected: index === selectedIndex }">
      <fw-menu-button :class="'w-full'" @click="selectItem(index)">
        <div class="flex flex-row items-center gap-2">
          <img :src="item.imgUrl" :class="'h-6 w-6 rounded-full'" />
          <span
            class="overflow-ellipsis whitespace-nowrap font-NeverMind-UI text-desktop-body-medium text-text-primary-light dark:text-text-primary-dark"
          >
            {{ item.text }}
          </span>
        </div>
      </fw-menu-button>
    </div>
  </div>
</template>

<script lang="ts">
import { CollaborativeCommentAuthor } from '@xmindltd/document-kit-yjs'
import { generateAvatarDataURI } from 'client/library/cloud-kit/utils/avatar'

export default {
  props: {
    items: {
      type: Array<CollaborativeCommentAuthor>,
      required: true,
    },

    command: {
      type: Function,
      required: true,
    },
  },

  data() {
    return {
      selectedIndex: 0,
    }
  },

  computed: {
    menuItems() {
      return this.items.map(author => {
        return {
          text: author.name,
          imgUrl:
            author.avatarUrl ??
            generateAvatarDataURI({
              xmindId: author.xmindId,
              name: author.name,
              backgroundColor: author.color,
              foregroundColor: '#ffffff',
            }),
        }
      })
    },
  },

  watch: {
    items() {
      this.selectedIndex = 0
    },
    selectedIndex() {
      this.$nextTick().then(() => {
        const selectedItemEl = this.$refs.mentionsMenuDiv?.querySelector('li.selected')
        selectedItemEl?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
    },
  },

  methods: {
    onKeyDown({ event }) {
      if (event.key === 'ArrowUp') {
        this.upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        this.downHandler()
        return true
      }

      if (event.key === 'Enter') {
        this.enterHandler()
        return true
      }

      return false
    },

    upHandler() {
      this.selectedIndex = (this.selectedIndex + this.items.length - 1) % this.items.length
    },

    downHandler() {
      this.selectedIndex = (this.selectedIndex + 1) % this.items.length
    },

    enterHandler() {
      this.selectItem(this.selectedIndex)
    },

    selectItem(index) {
      const item = this.items[index]

      if (item) {
        this.command({ id: item })
      }
    },
  },
}
</script>
