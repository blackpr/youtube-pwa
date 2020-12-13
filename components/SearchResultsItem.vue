<template>
  <nuxt-link :to="routeLink">
    <v-card class="pa-2">
      <span class="d-md-flex">
        <v-img
          :src="item.thumbnail || item.avatar || (item.bestThumbnail && item.bestThumbnail.url) ||  (item.bestAvatar && item.bestAvatar.url) || (item.firstVideo && item.firstVideo.bestThumbnail && item.firstVideo.bestThumbnail.url)"
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
      if (this.item.type === 'channel') {
        return `/channel/${this.item.channelID}`
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
      return `${this.item.subscribers} subscribers - ${this.item.videos} videos`
    },
    videoSubtitle() {
      return `${this.item.author && this.item.author.name} - ${
        this.item.views
      } views - ${this.item.uploadedAt} - ${this.item.duration}`
    },
    playlistSubtitle() {
      return `playlist - ${(this.item.author && this.item.author.name) || this.item && this.item.owner && this.item.owner.name} - ${
        this.item.length
      }`
    }
  }
}
</script>

<style></style>
