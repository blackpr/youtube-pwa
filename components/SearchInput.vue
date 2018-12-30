<template>
  <v-text-field
    v-model="message"
    :append-outer-icon="message ? 'send' : ''"
    box
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
          this.$emit('search', {
            type: 'url',
            payload: this.message
          })
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

<style>
</style>
