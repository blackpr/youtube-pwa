<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card>
          <v-card-text>
            <search-input @search="onSearch" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <search-results v-if="hasSearch" :videos="videos" />
    </v-row>
  </v-container>
</template>

<script>
import SearchInput from '~/components/SearchInput'
import SearchResults from '~/components/SearchResults'

export default {
  name: 'IndexPage',
  components: {
    SearchInput,
    SearchResults
  },
  data() {
    return {
      loading: false,
      results: null,
      videos: []
    }
  },
  computed: {
    hasSearch() {
      return this.$route.query.search_query
    }
  },
  watch: {
    $route: {
      handler: 'searchForVideos',
      immediate: true
    }
  },
  methods: {
    onSearch(data) {
      if (data.type === 'videoInList') {
        this.$router.push({
          path: `/video`,
          query: {
            v: data.payload.videoId,
            list: data.payload.listId,
            index: data.payload.index
          }
        })
      }
      if (data.type === 'video') {
        this.$router.push({
          path: `/video?v=${data.payload.videoId}`
        })
      }
      if (data.type === 'list') {
        this.$router.push({
          path: `/playlist/${data.payload.listId}`
        })
      }
      if (data.type === 'channel') {
        this.$router.push({
          path: `/channel/${data.payload.channelId}`
        })
      }
      if (data.type === 'text') {
        this.updateSearchQuery(data.payload)
      }
    },
    updateSearchQuery(data) {
      let search_query = data
      this.$router.push({
        query: {
          search_query
        }
      })
    },
    async searchForVideos() {
      let searchquery = this.$route.query.search_query
      if (!searchquery) return
      this.loading = true
      try {
        let results = await this.$axios.$get(
          `/getInfo/search?search_query=${searchquery}`
        )
        this.loading = false
        this.results = results
        this.videos = results.items
      } catch (error) {
        this.loading = false
        console.log(error)
      }
    }
  }
}
</script>
