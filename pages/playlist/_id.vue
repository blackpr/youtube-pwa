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
          offlineState.loadingVideos ||
            offlineState.selectedVideoForDl.state === 'fetching'
        "
        @click="startFetchingVideos"
      >
        download
      </v-btn>
      <!-- <v-btn @click="cancelPendingBgFetches">cancel</v-btn> -->
    </v-col>
    <v-col v-if="hasPlaylist" cols="12" md="9">
      <v-row v-for="(video, index) in playlist.items" :key="video.id">
        <v-col>
          <PlaylistItem
            :index="index"
            :video="video"
            :playlist="playlist"
            :selected-video-for-dl="offlineState.selectedVideoForDl"
          />
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import _get from 'lodash.get'
import PlaylistItem from '~/components/PlaylistItem.vue'
// import { setupBgFetch, state } from '~/utils/bgFetch'
const bgfetch = () => import('~/utils/bgFetch')
let bgf = {}

export default {
  name: 'PlaylistPage',
  components: {
    PlaylistItem
  },

  data: () => ({
    loadingVideos: false,
    videosWithUrls: [],
    selectedVideoForDl: {},
    offlineState: {
      selectedVideoForDl: {},
      canDownload: false,
      playlist: [],
      videosWithUrls: [],
      loadingVideos: false
    }
  }),

  computed: {
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
      return this.offlineState.canDownload
    }
    // playlistVideoIds() {
    //   return _get(this.playlist, 'items', []).map(item => item.id)
    // }
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
      bgf = await bgfetch()
      this.offlineState = bgf.state
      await bgf.setupBgFetch(this.playlist)
    }
    // async monitorBgFetch(bgFetch) {
    //   const updateItem = (id, update) => {
    //     console.log({ id, update, playlist: this.playlist })
    //     if (!this.selectedVideoForDl) return
    //     this.selectedVideoForDl = Object.assign({}, this.selectedVideoForDl, {
    //       state: update.state
    //     })
    //   }
    //   const doUpdate = () => {
    //     const update = {}

    //     if (bgFetch.result === '') {
    //       update.state = 'fetching'
    //       update.progress = bgFetch.downloaded / bgFetch.downloadTotal
    //     } else if (bgFetch.result === 'success') {
    //       update.state = 'fetching'
    //       update.progress = 1
    //     } else if (bgFetch.failureReason === 'aborted') {
    //       // Failure
    //       update.state = 'not-stored'
    //     } else {
    //       // other failure
    //       update.state = 'failed'
    //     }

    //     updateItem(bgFetch.id, update)
    //   }

    //   doUpdate()

    //   bgFetch.addEventListener('progress', doUpdate)
    //   const channel = new BroadcastChannel(bgFetch.id)

    //   channel.onmessage = async event => {
    //     if (!event.data.stored) return
    //     // yay! we have the video
    //     bgFetch.removeEventListener('progress', doUpdate)
    //     channel.close()
    //     updateItem(bgFetch.id, { state: 'stored' })

    //     await this.$offlinedb.put('videos', this.selectedVideoForDl)
    //     this.startBgFetch()
    //   }
    // },
    // async cancelPendingBgFetches() {
    //   bgf.cancelPendingBgFetches()
    // },
    // async getPlaylistVideoUrls() {
    //   if (!this.canDownload) return

    //   let videosPromises = this.playlistVideoIds.map(id =>
    //     this.$axios.$get(`/getInfo/video/${id}`)
    //   )
    //   this.loadingVideos = true
    //   let videosResults = await Promise.all(videosPromises)
    //   this.loadingVideos = false
    //   if (videosResults && videosResults.length) {
    //     this.videosWithUrls = videosResults.map(vr => ({
    //       id: _get(vr, 'info.video_id'),
    //       title: _get(vr, 'info.title'),
    //       views: _get(vr, 'info.player_response.videoDetails.viewCount'),
    //       authorImage: _get(vr, 'info.author.avatar'),
    //       authorName: _get(vr, 'info.author.user'),
    //       timestamp: _get(vr, 'info.timestamp'),
    //       description: _get(vr, 'info.description', ''),
    //       playlistId: this.playlist.id,
    //       // url: _get(vr, 'filteredFormats.url'),
    //       contentLength: _get(vr, 'filteredFormats.contentLength')
    //     }))

    //     await this.$offlinedb.put('playlists', {
    //       id: this.playlist.id,
    //       title: this.playlist.title
    //     })

    //     await this.startBgFetch()
    //   }
    //   console.log(videosResults)
    // },
    // async startBgFetch() {
    //   const reg = await navigator.serviceWorker.ready

    //   try {
    //     if (!this.videosWithUrls) return
    //     if (this.videosWithUrls.length === 0) return
    //     this.selectedVideoForDl = Object.assign({}, this.videosWithUrls.shift())

    //     const bgFetch = await reg.backgroundFetch.fetch(
    //       `off:::${this.playlist.id}:::${this.selectedVideoForDl.id}`,
    //       [`/api/getInfo/proxy/${this.selectedVideoForDl.id}`],
    //       {
    //         title: this.selectedVideoForDl.title,
    //         downloadTotal: this.selectedVideoForDl.contentLength
    //       }
    //     )

    //     this.monitorBgFetch(bgFetch)
    //   } catch (e) {
    //     console.log('fetch failed ', e)
    //   }
    // }
  }
}
</script>

<style scopped></style>
