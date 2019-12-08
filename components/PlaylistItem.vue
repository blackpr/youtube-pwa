<template>
  <nuxt-link
    class="no-decoration"
    :to="`/video?v=${video.id}&list=${playlist.id}&index=${index + 1}`"
  >
    <v-card :loading="isDownloading">
      <span class="d-md-flex">
        <v-img
          :src="video.thumbnail"
          height="125px"
          max-width="250px"
          contain
        />
        <span style="width: 100%">
          <v-card-title>
            <span class="default-decoration">{{ video.title }}</span>
            <v-spacer />

            <v-btn v-if="isDownloaded" icon>
              <v-icon @click.prevent.stop="deleteFile">mdi-delete</v-icon>
            </v-btn>
            <v-btn v-else icon>
              <v-icon @click.prevent.stop="downloadFile">mdi-download</v-icon>
            </v-btn>
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
import { mapGetters } from 'vuex'
import _get from 'lodash.get'

export default {
  name: 'PlaylistItem',
  props: {
    index: { type: Number, required: true },
    playlist: { type: Object, required: true },
    video: { type: Object, required: true },
    selectedVideoForDl: { type: Object, default: null }
  },

  computed: {
    ...mapGetters('offline', ['playlistsMap']),
    playlistVideos() {
      return _get(this.playlistsMap, `[${this.playlist.id}].items`, [])
    },
    isDownloaded() {
      return this.playlistVideos.findIndex(v => v.id === this.video.id) !== -1
    },
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
    },

    playlistWithOneVideo() {
      if (!this.playlist) return
      return {
        ...this.playlist,
        items: [this.video]
      }
    }
  },

  methods: {
    async deleteFile() {
      await this.$deleteVideo(this.video.id)
    },
    async downloadFile() {
      await this.$setupBgFetch(this.playlistWithOneVideo)
    }
  }
}
</script>

<style>
.no-decoration {
  text-decoration: none;
}
.default-decoration {
  text-decoration: underline;
  text-decoration-color: #ff4081 !important;
}
</style>
