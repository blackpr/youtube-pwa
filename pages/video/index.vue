<template>
  <v-container column>
    <video-player v-if="video" :video="video" :playlist="playlist" />

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
          <div>{{ date }}</div>
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
        <nuxt-link :to="`/video?v=${vid.id}`">
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
    <!-- todo: extract to list component and style -->
    <!-- related -->
    <v-row align="stretch">
      <v-col v-for="vid in related" :key="vid.id" cols="12" md="4">
        <nuxt-link
          :to="vid.list ? `/playlist/${vid.list}` : `/video?v=${vid.id}`"
        >
          <v-card class="mx-auto" height="100%">
            <v-img
              :src="vid.video_thumbnail || vid.iurlmq || vid.playlist_iurlhq"
              height="125px"
            />
            <v-card-title>
              {{ vid.title || vid.playlist_title }}
            </v-card-title>
            <v-card-subtitle pb-0>
              <div>{{ vid.author || 'playlist' }}</div>
              <div>
                {{ vid.short_view_count_text || vid.playlist_length }}
              </div>
            </v-card-subtitle>
          </v-card>
        </nuxt-link>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import VideoPlayer from '~/components/VideoPlayer'
import _get from 'lodash.get'
import { mapState } from 'vuex'

export default {
  name: 'VideoIdPage',
  components: {
    VideoPlayer
  },
  data() {
    return {
      video: null,
      playlist: null,
      showMore: null
    }
  },
  computed: {
    ...mapState('ui', ['preferAudio']),
    title() {
      return _get(this.video, 'info.title')
    },
    views() {
      return _get(this.video, 'info.player_response.videoDetails.viewCount')
    },
    authorImage() {
      return _get(this.video, 'info.author.avatar')
    },
    authorName() {
      return _get(this.video, 'info.author.user')
    },
    hasPlaylist() {
      return (
        this.playlist && this.playlist.items && this.playlist.items.length > 0
      )
    },
    date() {
      let timestamp = _get(this.video, 'info.timestamp')
      if (timestamp) {
        let date = new Date(timestamp * 1000)
        return date.toLocaleDateString('en-US')
      }
      return null
    },
    description() {
      return _get(this.video, 'info.description', '')
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
      return this.description.length >= 300
    },
    descriptionComputed() {
      if (this.showMore) return this.description
      return this.descriptionShort
    },
    showMoreLessText() {
      if (this.showMore) return 'SHOW LESS'
      return 'SHOW MORE'
    },
    related() {
      let relatedVideos = _get(this.video, 'info.related_videos')
      if (relatedVideos && relatedVideos.length > 0) {
        return relatedVideos
      }
      return []
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
      let videoId = this.$route.query.v
      let playlistId = this.$route.query.list
      if (playlistId) {
        let videoPromise = this.$axios.$get(
          `/getInfo/video/${videoId}${
            this.preferAudio ? '?preferAudio=true' : ''
          }`
        )
        let playlistPromise = this.$axios.$get(
          `/getInfo/playlist/${playlistId}`
        )
        let [video, playlist] = await Promise.all([
          videoPromise,
          playlistPromise
        ])
        // return { video, playlist }
        this.video = video
        this.playlist = playlist
      } else {
        try {
          let video = await this.$axios.$get(
            `/getInfo/video/${videoId}${
              this.preferAudio ? '?preferAudio=true' : ''
            }`
          )
          // return { video }
          this.video = video
        } catch (error) {
          console.log(error)
        }
      }
    }
  }
}
</script>

<style scopped>
.description {
  white-space: pre-wrap;
}
</style>
