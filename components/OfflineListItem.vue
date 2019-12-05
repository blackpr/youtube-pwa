<template>
  <nuxt-link :to="`/offline/video?v=${video.id}&list=${playlist.id}`">
    <v-card :loading="isDownloading">
      <span class="d-flex">
        <v-img
          :src="video.thumbnail"
          height="125px"
          max-width="250px"
          contain
        />
        <span>
          <v-card-title primary-title>
            {{ video.title }}
          </v-card-title>
          <v-card-subtitle>
            <div>{{ video.author && video.author.name }}</div>
            <div>{{ video.duration }}</div>
          </v-card-subtitle>
        </span>
      </span>
    </v-card>
  </nuxt-link>
</template>

<script>
export default {
  name: 'OfflineListItem',
  props: {
    playlist: { type: Object, required: true },
    video: { type: Object, required: true }
  },

  computed: {
    downloadState() {
      if (!this.video) return false
      if (!this.selectedVideoForDl) return false
      if (this.selectedVideoForDl.id !== this.video.id) return false
      if (!this.selectedVideoForDl.state) return false
      return this.selectedVideoForDl && this.selectedVideoForDl.state
    },

    isDownloading() {
      if (!this.downloadState) return false
      return ['fetching'].includes(this.selectedVideoForDl.state)
    }
  }
}
</script>

<style></style>
