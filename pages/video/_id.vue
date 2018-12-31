<template>
  <v-layout column>
    <v-flex xs12>
      <video-player/>
    </v-flex>
    <!-- todo: extract to list component and style -->
    <!-- description -->
    <v-flex xs12>
      <div class="title">{{ title }}</div>
      <div class="subheading">{{ views }} views</div>
      <hr>
    </v-flex>
    <v-flex xs12>
      <div>
        <v-img :src="authorImage" height="60px" width="60px" contain/>
        <div>
          <div>
            <div class="headline">{{ authorName }}</div>
            <div>{{ date }}</div>
          </div>
        </div>
      </div>
    </v-flex>
    <v-flex xs12>
      <div class="description">{{ description }}</div>
    </v-flex>
    <!-- todo: extract to list component and style -->
    <!-- playlist -->
    <v-flex v-if="hasPlaylist" xs12>
      <v-layout align-center justify-center row fill-height wrap>
        <v-flex v-for="video in playlist.items" :key="video.id" xs12 sm6 lg4>
          <nuxt-link :to="`/video/${video.id}`">
            <v-card>
              <v-layout>
                <v-flex xs5>
                  <v-img :src="video.thumbnail" height="125px" contain/>
                </v-flex>
                <v-flex xs7>
                  <v-card-title primary-title>
                    <div>
                      <div class="headline">{{ video.title }}</div>
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
    <!-- todo: extract to list component and style -->
    <!-- related -->
    <v-flex xs12>
      <v-layout align-center justify-center row fill-height wrap>
        <v-flex v-for="video in related" :key="video.id" xs12 sm6 lg4>
          <nuxt-link :to="video.list ? `/list/${video.list}` : `/video/${video.id}`">
            <v-card>
              <v-layout>
                <v-flex xs5>
                  <v-img :src="video.iurlmq || video.playlist_iurlhq" height="125px" contain/>
                </v-flex>
                <v-flex xs7>
                  <v-card-title primary-title>
                    <div>
                      <div class="headline">{{ video.title || video.playlist_title }}</div>
                      <div>{{ video.author || 'playlist' }}</div>
                      <div>{{ video.short_view_count_text || video.playlist_length }}</div>
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
import VideoPlayer from '~/components/VideoPlayer'
import _get from 'lodash.get'

export default {
  name: 'VideoIdPage',
  components: {
    VideoPlayer
  },
  async asyncData({ $axios, params, query }) {
    let videoId = params.id
    let playlistId = query.list
    if (playlistId) {
      let videoPromise = $axios.$get(`/getInfo/video/${videoId}`)
      let playlistPromise = $axios.$get(`/getInfo/playlist/${playlistId}`)
      let [video, playlist] = await Promise.all([videoPromise, playlistPromise])
      return { video, playlist }
    } else {
      try {
        let video = await $axios.$get(`/getInfo/video/${videoId}`)
        return { video }
      } catch (error) {
        console.log(error)
      }
    }
  },
  computed: {
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
      return _get(this.video, 'info.description')
    },
    related() {
      let relatedVideos = _get(this.video, 'info.related_videos')
      if (relatedVideos && relatedVideos.length > 0) {
        return relatedVideos
      }
      return []
    }
  }
}
</script>

<style scopped >
.description {
  white-space: pre-wrap;
}
</style>
