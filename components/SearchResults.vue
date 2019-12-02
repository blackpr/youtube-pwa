<template>
  <v-container>
    <v-row v-for="video in filteredVideos" :key="video.id">
      <v-col>
        <search-results-item :item="video" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import SearchResultsItem from '~/components/SearchResultsItem'
import _uniqby from 'lodash.uniqby'
export default {
  name: 'SearchResults',
  components: {
    SearchResultsItem
  },
  props: {
    videos: {
      type: Array,
      default() {
        return []
      }
    }
  },
  computed: {
    filteredVideos() {
      let noMixVideos = this.videosWithIds.filter(video =>
        ['channel', 'video', 'playlist'].includes(video.type)
      )
      return _uniqby(noMixVideos, 'id')
      // return noMixVideos
    },
    videosWithIds() {
      // todo: extract this
      return this.videos.map(video => {
        let id = null
        if (video.type === 'channel') {
          id = video.channel_id
        } else if (video.type === 'video') {
          let url = new URL(video.link)
          let params = new URLSearchParams(url.search)
          id = params.get('v')
        } else if (video.type === 'playlist') {
          let url = new URL(video.link)
          let params = new URLSearchParams(url.search)
          id = params.get('list')
        }
        return { ...video, id }
      })
    }
  }
}
</script>

<style></style>
