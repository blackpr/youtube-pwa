<template>
  <v-row>
    <!-- todo: extract to list component and style -->
    <!-- playlist -->
    <v-col v-if="hasPlaylist" cols="12" md="3">
      <v-container>
        <div class="title">
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn icon nuxt :to="`/playlist/${playlist.id}`" v-on="on">
                <v-icon>mdi-link</v-icon>
              </v-btn>
            </template>
            <span>open online playlist</span>
          </v-tooltip>
          {{ listTitle }}
        </div>
        <div class="subheading">
          {{ listSum }} videos - {{ playlist.views }} views
        </div>
        <div class="subheading">
          {{ playlist.last_updated }}
        </div>
      </v-container>
      <v-container>
        <v-btn rounded nuxt :to="firstItemUrl" :disabled="!hasPlaylistItems">
          <v-icon>mdi-play-circle-outline</v-icon>
        </v-btn>
        <v-btn
          rounded
          nuxt
          :to="randomItemUrl"
          :disabled="!hasPlaylistItems"
          class="ml-2"
        >
          <v-icon>mdi-shuffle-variant</v-icon>
        </v-btn>
      </v-container>
      <v-container>
        <v-btn @click="deletePlaylist">delete</v-btn>
      </v-container>
    </v-col>
    <v-col v-if="hasPlaylistItems" cols="12" md="9">
      <v-row v-for="video in playlist.items" :key="video.id">
        <v-col>
          <OfflineListItem :video="video" :playlist="playlist" />
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import _get from 'lodash.get'
import OfflineListItem from '~/components/OfflineListItem.vue'
import { mapGetters } from 'vuex'
import random from 'lodash/random'

export default {
  name: 'OfflineListPage',
  components: {
    OfflineListItem
  },

  computed: {
    ...mapGetters('offline', ['playlistsMap']),
    playlist() {
      const paramId = this.$route.params.id
      if (paramId) {
        return _get(this.playlistsMap, paramId)
      }
      return { id: '', items: [] }
    },
    hasPlaylist() {
      return !!(this.playlist && this.playlist.id)
    },
    hasPlaylistItems() {
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
    firstItemUrl() {
      if (!this.hasPlaylistItems) return null
      const itemId = this.playlist.items[0].id
      return `/offline/video?v=${itemId}&list=${this.playlist.id}`
    },
    randomItemUrl() {
      if (!this.hasPlaylistItems) return null
      const itemsLength = this.playlist.items.length
      const randomIndex = random(itemsLength - 1)
      const itemId = _get(this.playlist, `items[${randomIndex}].id`)
      return `/offline/video?v=${itemId}&list=${this.playlist.id}&shuffle=true`
    }
  },
  methods: {
    async deletePlaylist() {
      await this.$deletePlaylist(this.playlist)
      this.$router.replace('/')
    }
  }
}
</script>

<style scopped></style>
