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
      <v-btn @click="deletePlaylist">delete</v-btn>
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
