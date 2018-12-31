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
    }
  },
  methods: {
    onPlayButtonClick() {
      console.log('onPlayButtonClick')
    }
  }
}
</script>

<style>
</style>
