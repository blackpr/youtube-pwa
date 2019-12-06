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
    </v-col>
    <v-col v-if="hasPlaylist" cols="12" md="9">
      <v-row v-for="video in playlist.items" :key="video.id">
        <v-col>
          <nuxt-link :to="getRoute(video)">
            <v-card>
              <span class="d-md-flex">
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
    }
  },

  async asyncData({ $axios, params }) {
    let playlistId = params.id
    try {
      let playlist = await $axios.$get(`/getInfo/channel/${playlistId}`)
      return { playlist }
    } catch (error) {
      console.log(error)
    }
  },

  methods: {
    // todo extract list component move this to computed
    getRoute(video) {
      let url = new URL(video.url)
      let params = new URLSearchParams(url.search)
      let playlistId = params.get('list')
      let index = params.get('index')
      return `/video?v=${video.id}&list=${playlistId}&index=${index}`
    }
  }
}
</script>

<style scopped></style>
