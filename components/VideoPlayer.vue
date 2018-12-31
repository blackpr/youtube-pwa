<template>
  <v-layout align-center justify-start column>
    <v-flex xs12>
      <div>player placeholder</div>
      <video ref="player" controls/>
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
  mounted() {
    this.videoPlayer = this.$refs.player
    let src = _get(this.video, 'filteredFormats.url')
    if (src) {
      this.videoPlayer.src = src
      this.videoPlayer.play()
      this.videoPlayer.addEventListener('ended', this.goToNextVideo)
    }
  },
  methods: {
    goToNextVideo() {
      let index = +this.$route.query.index + 1
      let listId = this.$route.query.list
      if (index <= this.playlist.items.length) {
        let id = this.playlist.items[index - 1].id
        this.$router.push({
          path: `/video/${id}`,
          query: {
            list: listId,
            index
          }
        })
      }
    },
    goToPreviousVideo() {
      let index = +this.$route.query.index - 1
      let listId = this.$route.query.list
      if (index >= 1) {
        let id = this.playlist.items[index - 1].id
        this.$router.push({
          path: `/video/${id}`,
          query: {
            list: listId,
            index
          }
        })
      }
    }
  }
}
</script>

<style>
</style>
