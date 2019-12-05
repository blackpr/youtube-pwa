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
      <v-row v-for="(video, index) in playlist.items" :key="video.id">
        <v-col>
          <PlaylistItem :index="index" :video="video" :playlist="playlist" />
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import _get from 'lodash.get'
import PlaylistItem from '~/components/PlaylistItem.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'OfflineListPage',
  components: {
    PlaylistItem
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
  }
}
</script>

<style scopped></style>
