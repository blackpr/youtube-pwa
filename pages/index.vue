<template>
  <v-layout column>
    <v-flex xs12>
      <div class="text-xs-center">
        <logo/>
      </div>
      <v-card d-flex>
        <v-card-text>
          <search-input @search="onSearch"/>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import Logo from '~/components/Logo'
import SearchInput from '~/components/SearchInput'

export default {
  components: {
    Logo,
    SearchInput
  },
  methods: {
    onSearch(data) {
      console.error('todo')
      console.log(data)
      if (data.type === 'videoInList') {
        this.$router.push({
          path: `/video/${data.payload.videoId}`,
          query: {
            list: data.payload.listId,
            index: data.payload.index
          }
        })
      }
      if (data.type === 'video') {
        this.$router.push({
          path: `/video/${data.payload.videoId}`
        })
      }
      if (data.type === 'list') {
      }
      if (data.type === 'channel') {
      }
      if (data.type === 'text') {
      }
    }
  }
}
</script>
