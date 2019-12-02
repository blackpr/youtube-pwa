<template>
  <v-text-field
    v-model="message"
    :append-outer-icon="message ? 'send' : ''"
    clear-icon="cancel"
    clearable
    label="Search for video or paste a youtube link"
    type="text"
    @click:append-outer="onSearch"
    @click:clear="clearMessage"
    @keypress.enter="onSearch"
  />
</template>

<script>
export default {
  name: 'SearchInput',
  data() {
    return {
      message: null,
      marker: true
    }
  },
  methods: {
    toggleMarker() {
      this.marker = !this.marker
    },
    onSearch() {
      if (this.message) {
        if (this.message.startsWith('https://')) {
          let url = new URL(this.message)
          let params = new URLSearchParams(url.search)
          let videoId = params.get('v')
          let index = params.get('index')
          let listId = params.get('list')
          if (videoId && listId) {
            this.$emit('search', {
              type: 'videoInList',
              payload: {
                url: this.message,
                videoId,
                listId,
                index
              }
            })
          } else if (videoId) {
            this.$emit('search', {
              type: 'video',
              payload: {
                url: this.message,
                videoId
              }
            })
          } else if (listId) {
            this.$emit('search', {
              type: 'list',
              payload: {
                url: this.message,
                listId
              }
            })
          } else if (url.pathname.startsWith('/channel/')) {
            let parts = this.message.split('/')
            let channelId = parts.pop() || parts.pop()
            if (channelId) {
              this.$emit('search', {
                type: 'channel',
                payload: {
                  url: this.message,
                  channelId
                }
              })
            }
          }
        } else {
          this.$emit('search', {
            type: 'text',
            payload: this.message
          })
        }
      }
    },
    clearMessage() {
      this.message = null
    }
  }
}
</script>

<style></style>
