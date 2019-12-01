<template>
  <v-layout
    :row="$vuetify.breakpoint.mdAndUp"
    :column="$vuetify.breakpoint.smAndDown"
    align-start
    justify-start
  >
    <!-- todo: extract to list component and style -->
    <!-- playlist -->
    <v-flex v-if="hasPlaylist" sm12 md3>
      <div class="title">
        {{ listTitle }}
      </div>
      <div class="subheading">
        {{ listSum }} videos - {{ playlist.views }} views
      </div>
      <div class="subheading">
        {{ playlist.last_updated }}
      </div>
    </v-flex>
    <v-flex v-if="hasPlaylist" sm12 md9>
      <v-layout column>
        <v-flex
          v-for="(video, index) in playlist.items"
          :key="video.id"
          xs12
          grow
        >
          <nuxt-link
            :to="`/video?v=${video.id}&list=${playlist.id}&index=${index + 1}`"
          >
            <v-card>
              <v-layout>
                <v-flex xs5>
                  <v-img :src="video.thumbnail" height="125px" contain />
                </v-flex>
                <v-flex xs7>
                  <v-card-title primary-title>
                    <div>
                      <div class="headline">
                        {{ video.title }}
                      </div>
                      <div>{{ video.author && video.author.name }}</div>
                      <div>{{ video.duration }}</div>
                    </div>
                  </v-card-title>
                </v-flex>
              </v-layout>
            </v-card>
          </nuxt-link>
        </v-flex>
      </v-layout>
    </v-flex>
  </v-layout>
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
      let playlist = await $axios.$get(`/getInfo/playlist/${playlistId}`)
      return { playlist }
    } catch (error) {
      console.log(error)
    }
  }
}
</script>

<style scopped></style>
