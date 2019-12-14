<template>
  <v-row align="center">
    <v-col class="video-col">
      <video
        ref="player"
        :class="preferAudio ? '' : 'full-width'"
        class="video-player"
        controls
        autoplay
      />
    </v-col>
  </v-row>
</template>

<script>
import _get from 'lodash.get'
import { mapState } from 'vuex'

export default {
  name: 'OfflineVideoPlayer',
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
  computed: {
    ...mapState('ui', ['preferAudio']),
    index() {
      if (!this.video) return 0
      if (!this.video.id) return 0
      if (!this.playlist) return 0
      if (!this.playlist.items) return 0
      if (!this.playlist.items.length) return 0
      return this.playlist.items.findIndex(v => v.id === this.video.id) + 1
    },
    thumbnails() {
      let tumbs = _get(this.video, 'thumbnails', [])
      return tumbs.map(thumb => ({
        src: thumb.url,
        sizes: `${thumb.width}x${thumb.height}`,
        type: 'image/jpg'
      }))
    },
    artwork() {
      if (this.thumbnails && this.thumbnails.length) return this.thumbnails
      return [{ src: _get(this.video, 'thumbnail', '') }]
    }
  },
  watch: {
    video: {
      handler() {
        let src = this.video.url
        this.videoPlayer.src = src
        this.videoPlayer.play().catch(err => console.log(err))
      }
    }
  },
  mounted() {
    this.videoPlayer = this.$refs.player
    if (this.video && this.video.id) {
      let src = this.video.url
      this.videoPlayer.src = src
      // this.videoPlayer.play().catch(err => console.log(err))
      this.videoPlayer.addEventListener('ended', this.goToNextVideo)
      this.videoPlayer.addEventListener('play', this.onPlayButtonClick)
    }
  },
  methods: {
    onPlayButtonClick() {
      this.setupMedia()
      this.attachEventsToMedia()
    },
    goToNextVideo() {
      let index = +this.index + 1
      let listId = this.$route.query.list
      if (listId && index <= _get(this.playlist, 'items.length', -1)) {
        let id = this.playlist.items[index - 1].id
        this.$router.push({
          path: '/offline/video',
          query: {
            v: id,
            list: listId
          }
        })
      }
    },
    goToPreviousVideo() {
      let index = +this.index - 1
      let listId = this.$route.query.list
      if (listId && index >= 1) {
        let id = this.playlist.items[index - 1].id
        this.$router.push({
          path: '/offline/video',
          query: {
            v: id,
            list: listId
          }
        })
      }
    },
    setupMedia() {
      if ('mediaSession' in navigator) {
        let mediaObject = {
          title: _get(this.video, 'title'),
          artist: _get(this.video, 'authorName'),
          artwork: this.artwork
        }
        // eslint-disable-next-line no-undef
        navigator.mediaSession.metadata = new MediaMetadata(mediaObject)
      }
    },
    attachEventsToMedia() {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('nexttrack', this.goToNextVideo)
        navigator.mediaSession.setActionHandler(
          'previoustrack',
          this.goToPreviousVideo
        )
      }
    }
  }
}
</script>

<style scopped>
.full-width {
  width: 100%;
}
.video-col {
  text-align: center;
}
</style>
