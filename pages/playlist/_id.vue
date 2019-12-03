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
      <v-btn @click="getPlaylistVideoUrls">download</v-btn>
    </v-col>
    <v-col v-if="hasPlaylist" cols="12" md="9">
      <v-row v-for="(video, index) in playlist.items" :key="video.id">
        <v-col>
          <nuxt-link
            :to="`/video?v=${video.id}&list=${playlist.id}&index=${index + 1}`"
          >
            <v-card>
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
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import _get from 'lodash.get'

export default {
  name: 'PlaylistPage',

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
      if (!this.playlist) return false
      if (!this.playlist.items) return false
      if (!this.playlist.items.length) return false
      return 'BackgroundFetchManager' in self
    },
    playlistVideoIds() {
      return _get(this.playlist, 'items', []).map(item => item.id)
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
    async monitorBgFetch(bgFetch) {
      const updateItem = (id, state) => {
        console.log({ id, state, playlist: this.playlist })
      }
      const doUpdate = () => {
        const update = {}

        if (bgFetch.result === '') {
          update.state = 'fetching'
          update.progress = bgFetch.downloaded / bgFetch.downloadTotal
        } else if (bgFetch.result === 'success') {
          update.state = 'fetching'
          update.progress = 1
        } else if (bgFetch.failureReason === 'aborted') {
          // Failure
          update.state = 'not-stored'
        } else {
          // other failure
          update.state = 'failed'
        }

        updateItem(bgFetch.id, update)
      }

      doUpdate()

      bgFetch.addEventListener('progress', doUpdate)
      const channel = new BroadcastChannel(bgFetch.id)

      channel.onmessage = event => {
        if (!event.data.stored) return
        bgFetch.removeEventListener('progress', doUpdate)
        channel.close()
        updateItem(bgFetch.id, { state: 'stored' })
      }
    },
    async getPlaylistVideoUrls() {
      if (!this.canDownload) return

      let videosPromises = this.playlistVideoIds.map(id =>
        this.$axios.$get(`/getInfo/video/${id}`)
      )
      let videosResults = await Promise.all(videosPromises)
      if (videosResults && videosResults.length) {
        let videoUrls = videosResults.map(vr => ({
          id: _get(vr, 'info.video_id'),
          title: _get(vr, 'info.title'),
          url: _get(vr, 'filteredFormats.url'),
          contentLength: _get(vr, 'filteredFormats.contentLength')
        }))

        console.log(videoUrls)
        const reg = await navigator.serviceWorker.ready

        const ids = await reg.backgroundFetch.getIds()
        console.log(ids)
        // ids.forEach(async id => {
        for await (let id of ids) {
          const bgf = await reg.backgroundFetch.get(id)
          console.log(bgf)
          await bgf.abort()
        }

        // const selectedVideo = videoUrls[4]
        // const bgFetch = await reg.backgroundFetch.fetch(
        //   `${this.playlist.id}-${selectedVideo.id}`,
        //   [`/api/getInfo/proxy/${selectedVideo.id}`],
        //   {
        //     title: selectedVideo.title,
        //     downloadTotal: selectedVideo.contentLength
        //   }
        // )

        // this.monitorBgFetch(bgFetch)
      }
      console.log(videosResults)
    }
  }
}
</script>

<style scopped></style>
