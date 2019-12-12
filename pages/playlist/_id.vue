<template>
  <v-row>
    <!-- todo: extract to list component and style -->
    <!-- playlist -->
    <v-col v-if="hasPlaylist" cols="12" md="3">
      <div class="title">
        {{ listTitle }}
      </div>
      <div class="subheading">
        {{ listSum }} videos - {{ playlist.views }} views
      </div>
      <div class="subheading">
        {{ playlist.last_updated }}
      </div>
      <v-btn
        :loading="
          $offlineState.loadingVideos ||
            $offlineState.selectedVideoForDl.state === 'fetching'
        "
        :disabled="hasBeenDownloaded"
        @click="startFetchingVideos"
      >
        {{ hasBeenDownloaded ? 'downloaded' : 'download' }}
      </v-btn>
      <v-btn @click="cancelPendingFetches">cancel pending downloads</v-btn>
      <!-- <v-btn @click="cancelPendingBgFetches">cancel</v-btn> -->
    </v-col>
    <v-col v-if="hasPlaylist" cols="12" md="9">
      <v-row v-for="(video, index) in playlist.items" :key="video.id">
        <v-col>
          <PlaylistItem
            :index="index"
            :video="video"
            :playlist="playlist"
            :selected-video-for-dl="$offlineState.selectedVideoForDl"
          />
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import _get from 'lodash.get'
import PlaylistItem from '~/components/PlaylistItem.vue'
import { mapGetters } from 'vuex'
// import { setupBgFetch, state } from '~/utils/bgFetch'
// const bgfetch = () => import('~/utils/bgFetch')
// let bgf = {}

export default {
  name: 'PlaylistPage',
  components: {
    PlaylistItem
  },

  data: () => ({
    loadingVideos: false,
    videosWithUrls: [],
    selectedVideoForDl: {}
  }),

  computed: {
    ...mapGetters('offline', ['playlistsMap']),
    hasBeenDownloaded() {
      if (this.playlistsMap[this.playlist.id]) return true
      return false
    },
    offlineState() {
      return this.$offlineState
    },
    hasPlaylist() {
      return (
        this.playlist && this.playlist.items && this.playlist.items.length > 0
      )
    },
    listTitle() {
      return _get(this.playlist, 'title')
    },
    listSum() {
      if (this.hasPlaylist) {
        return this.playlist.items.length
      }
      return null
    },
    canDownload() {
      return this.$offlineState.canDownload
    }
  },

  async asyncData({ $axios, params }) {
    let playlistId = params.id
    try {
      let playlist = await $axios.$get(`/getInfo/playlist/${playlistId}`)
      return { playlist }
    } catch (error) {
      console.log(error)
    }
  },

  methods: {
    async startFetchingVideos() {
      // bgf = await bgfetch()
      // this.offlineState = bgf.state
      await this.$setupBgFetch(this.playlist)
    },
    async cancelPendingFetches() {
      return this.$cancelPendingBgFetches()
    }
  }
}
</script>

<style scopped></style>
