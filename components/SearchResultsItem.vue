<template>
  <nuxt-link :to="routeLink">
    <v-card class="pa-2">
      <span class="d-flex">
        <v-img
          :src="item.thumbnail || item.avatar"
          height="125px"
          max-width="250px"
          contain
        />
        <span>
          <v-card-title>
            {{ title }}
          </v-card-title>
          <v-card-subtitle>{{ subtitle }}</v-card-subtitle>
        </span>
      </span>
    </v-card>
  </nuxt-link>
</template>

<script>
export default {
  name: 'SearchResultsItem',
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  computed: {
    routeLink() {
      if (this.item.type === 'video') {
        return `/video?v=${this.item.id}`
      }
      return `/${this.item.type}/${this.item.id}`
    },
    title() {
      return this[`${this.item.type}Title`]
    },
    subtitle() {
      return this[`${this.item.type}Subtitle`]
    },
    channelTitle() {
      return this.item.name
    },
    videoTitle() {
      return this.item.title
    },
    playlistTitle() {
      return this.item.title
    },
    channelSubtitle() {
      return `${this.item.followers} followers - ${this.item.videos} videos`
    },
    videoSubtitle() {
      return `${this.item.author && this.item.author.name} - ${
        this.item.views
      } views - ${this.item.uploaded_at} - ${this.item.duration}`
    },
    playlistSubtitle() {
      return `playlist - ${this.item.author && this.item.author.name} - ${
        this.item.length
      }`
    }
  }
}
</script>

<style></style>
