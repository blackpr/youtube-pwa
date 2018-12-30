<template>
  <v-layout column>
    <v-flex xs12>
      <div class="text-xs-center">
        <logo/>
      </div>
      <v-card d-flex>
        <v-card-title class="headline">Welcome to the Vuetify + Nuxt.js template</v-card-title>
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
      if (data.type === 'text') {
      }
      if (data.type === 'url') {
      }
    }
  }
}
</script>
