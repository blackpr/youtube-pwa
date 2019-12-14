<template>
  <v-row align="center">
    <v-col class="video-col">
      <video
        ref="player"
        :class="preferAudio ? 'max-width' : 'full-width'"
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
  computed: {
    ...mapState('ui', ['preferAudio']),
    thumbnails() {
      let tumbs = _get(
        this.video,
        'info.player_response.videoDetails.thumbnail.thumbnails',
        []
      )
      return tumbs.map(thumb => ({
        src: thumb.url,
        sizes: `${thumb.width}x${thumb.height}`,
        type: 'image/jpg'
      }))
    }
  },
  watch: {
    video: {
      handler() {
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
        let mediaObject = {
          title: _get(this.video, 'info.title'),
          artist: _get(this.video, 'info.author.name'),
          artwork: this.thumbnails
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
.max-width {
  max-width: 100%;
}
.video-col {
  text-align: center;
}
</style>
