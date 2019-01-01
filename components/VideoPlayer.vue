<template>
  <v-layout align-center justify-start column>
    <v-flex xs12>
      <video ref="player" class="video-player" controls autoplay/>
    </v-flex>
  </v-layout>
</template>

<script>
import _get from 'lodash.get'

export default {
  name: 'VideoPlayer',
  props: {
    video: {
      type: Object,
      required: true
    },
    playlist: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      videoPlayer: null,
      skipTime: 10
    }
  },
  watch: {
    video: {
      handler() {
        console.log('watach video probp')
        let src = _get(this.video, 'filteredFormats.url')
        this.videoPlayer.src = src
        this.videoPlayer.play().catch(err => console.log(err))
      }
    }
  },
  mounted() {
    this.videoPlayer = this.$refs.player
    let src = _get(this.video, 'filteredFormats.url')
    if (src) {
      this.videoPlayer.src = src
      this.videoPlayer.play().catch(err => console.log(err))
      this.videoPlayer.addEventListener('ended', this.goToNextVideo)
      this.setupMedia()
    }
  },
  methods: {
    goToNextVideo() {
      console.log('goToNextVideo')
      let index = +this.$route.query.index + 1
      let listId = this.$route.query.list
      if (listId && index <= _get(this.playlist, 'items.length', -1)) {
        let id = this.playlist.items[index - 1].id
        this.$router.push({
          path: '/video',
          query: {
            v: id,
            list: listId,
            index
          }
        })
      }
    },
    goToPreviousVideo() {
      let index = +this.$route.query.index - 1
      let listId = this.$route.query.list
      if (listId && index >= 1) {
        let id = this.playlist.items[index - 1].id
        this.$router.push({
          path: '/video',
          query: {
            v: id,
            list: listId,
            index
          }
        })
      }
    },
    setupMedia() {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: _get(this.video, 'info.title'),
          artist: _get(this.video, 'info.author.name'),
          artwork: _get(this.video, 'info.thumbnail_url')
        })
      }
    }
  }
}
</script>

<style scopped>
.video-player {
  max-width: 100%;
}
</style>
