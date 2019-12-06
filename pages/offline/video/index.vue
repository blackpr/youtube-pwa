<template>
  <v-container column>
    <OfflineVideoPlayer v-if="video" :video="video" :playlist="playlist" />

    <!-- todo: extract to list component and style -->
    <!-- description -->
    <v-row>
      <v-col>
        <div class="title">
          {{ title }}
        </div>
        <div class="subtitle-1">{{ views }} views</div>
        <hr />
      </v-col>
    </v-row>
    <v-row>
      <v-col class="d-flex">
        <v-img :src="authorImage" height="60px" width="60px" max-width="60px" />
        <div class="ml-2">
          <div class="headline">
            {{ authorName }}
          </div>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <div class="description">
          {{ descriptionComputed }}
          <div v-if="hasMore">
            <v-btn @click.prevent="showMore = !showMore">
              {{ showMoreLessText }}
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>
    <!-- todo: extract to list component and style -->
    <!-- playlist -->
    <v-row v-if="hasPlaylist" align="stretch">
      <v-col v-for="vid in playlist.items" :key="vid.id" cols="12" md="4">
        <nuxt-link :to="`/offline/video?v=${vid.id}&list=${playlistId}`">
          <v-card class="mx-auto" height="100%">
            <v-img :src="vid.thumbnail" height="125px"> </v-img>
            <v-card-title>
              {{ vid.title }}
            </v-card-title>
            <v-card-subtitle pb-0>
              <div>{{ vid.author && vid.author.name }}</div>
              <div>{{ vid.duration }}</div>
            </v-card-subtitle>
          </v-card>
        </nuxt-link>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import OfflineVideoPlayer from '~/components/OfflineVideoPlayer'
import _get from 'lodash.get'
import { mapGetters } from 'vuex'

export default {
  name: 'OfflineVideoIdPage',
  components: {
    OfflineVideoPlayer
  },
  data() {
    return {
      showMore: null,
      videoId: null,
      playlistId: null
    }
  },
  computed: {
    ...mapGetters('offline', ['playlistsMap']),
    playlist() {
      if (this.playlistId) {
        return _get(this.playlistsMap, this.playlistId)
      }
      return { id: '', items: [] }
    },
    video() {
      return _get(this.playlist, 'items', []).find(
        video => video.id === this.videoId
      )
    },
    title() {
      return _get(this.video, 'title')
    },
    views() {
      return _get(this.video, 'views')
    },
    authorImage() {
      return _get(this.video, 'authorImage')
    },
    authorName() {
      return _get(this.video, 'authorName')
    },
    hasPlaylist() {
      return (
        this.playlist && this.playlist.items && this.playlist.items.length > 0
      )
    },
    description() {
      return _get(this.video, 'description')
    },
    descriptionShort() {
      if (!this.description) return ''
      let maxLength = 300
      let trimmedString = this.description.substr(0, maxLength)
      trimmedString = trimmedString.substr(
        0,
        Math.min(trimmedString.length, trimmedString.lastIndexOf(' '))
      )
      return trimmedString
    },
    hasMore() {
      return _get(this.description, 'length', 0) >= 300
    },
    descriptionComputed() {
      if (this.showMore) return this.description
      return this.descriptionShort
    },
    showMoreLessText() {
      if (this.showMore) return 'SHOW LESS'
      return 'SHOW MORE'
    }
  },
  watch: {
    $route: {
      handler: 'fetchVideoFromQuery',
      immediate: true
    }
  },
  methods: {
    async fetchVideoFromQuery() {
      this.videoId = this.$route.query.v
      this.playlistId = this.$route.query.list
    }
  }
}
</script>

<style scopped>
.description {
  white-space: pre-wrap;
}
</style>
