<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      :clipped="$vuetify.breakpoint.lgAndUp"
      app
    >
      <v-list dense>
        <template v-for="item in menuItems">
          <v-row v-if="item.heading" :key="item.heading" align="center">
            <v-col cols="6">
              <v-subheader v-if="item.heading">
                {{ item.heading }}
              </v-subheader>
            </v-col>
            <v-col cols="6" class="text-center">
              <a href="#!" class="body-2 black--text">EDIT</a>
            </v-col>
          </v-row>
          <v-list-group
            v-else-if="item.children"
            :key="item.text"
            v-model="item.model"
            :prepend-icon="item.model ? item.icon : item['icon-alt']"
            append-icon=""
          >
            <template v-slot:activator>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ item.text }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </template>
            <v-list-item
              v-for="(child, i) in item.children"
              :key="i"
              nuxt
              :to="child.link"
            >
              <v-list-item-action v-if="child.icon">
                <v-icon>{{ child.icon }}</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>
                  {{ child.text }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-group>
          <v-list-item v-else :key="item.text" nuxt :to="item.link">
            <v-list-item-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                {{ item.text }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>

      <template v-slot:append>
        <div class="pa-2">
          <v-btn @click="cancelPendingFetches">cancel pending downloads</v-btn>
        </div>
        <div class="pa-2">
          <v-btn block @click="refresh">Refresh</v-btn>
        </div>
      </template>
    </v-navigation-drawer>
    <v-app-bar :clipped-left="$vuetify.breakpoint.lgAndUp" app>
      <v-btn v-if="canGoBack" icon @click="$router.back()">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title style="width: 300px" class="ml-0 pl-4">
        <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
        <span class="hidden-sm-and-down">Youtube PWA</span>
      </v-toolbar-title>
      <v-spacer> </v-spacer>
      <v-switch
        label="Prefer Audio"
        hide-details
        :input-value="preferAudio"
        @change="onPreferAudio"
      ></v-switch>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-icon class="ml-2" v-on="on">mdi-information-outline</v-icon>
        </template>
        <span>
          When enabled highest quality, audio only files will be prefered
        </span>
      </v-tooltip>
    </v-app-bar>
    <v-content>
      <v-container>
        <nuxt />
      </v-container>
    </v-content>
    <v-footer :fixed="fixed">
      <span>
        made with ❤️ by
        <a
          class="white--text"
          target="_blank"
          href="https://twitter.com/blackpr"
          >blackpr</a
        >
      </span>
    </v-footer>
    <v-snackbar v-model="snackbar" :timeout="0">
      {{ snackBarText }}
      <v-btn color="pink" text @click="refreshApp">
        Refresh
      </v-btn>
    </v-snackbar>
  </v-app>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  data() {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      items: [{ icon: 'search', text: 'Search', link: '/' }],
      miniVariant: false,
      title: 'Youtube pwa client',
      snackbar: false,
      snackBarText: null
    }
  },

  computed: {
    ...mapState('offline', ['playlists', 'videos']),
    ...mapGetters('offline', ['playlistsMap']),
    ...mapState('ui', ['preferAudio']),
    menuItems() {
      if (this.playlists && this.playlists.length) {
        const playlistsMenu = this.playlists.map(item => {
          return {
            icon: 'mdi-playlist-play',
            text: item.title,
            link: `/offline/list/${item.id}`
          }
        })

        return [
          ...this.items,
          {
            icon: 'mdi-playlist-music',
            text: 'Offline Playlists',
            model: true,
            children: playlistsMenu
          }
        ]
      } else {
        return [...this.items]
      }
    },
    canGoBack() {
      return window.history.length > 1
    }
  },

  async mounted() {
    const workbox = await window.$workbox
    if (workbox) {
      workbox.addEventListener('installed', event => {
        if (event.isUpdate) {
          this.snackBarText = 'New version is available!. Click to reload'
          this.snackbar = true
        }
      })
    }
  },
  created() {
    this.$store.commit('ui/loadPreferAudioFromStorage')
  },

  methods: {
    refreshApp() {
      this.snackbar = false
      this.snackBarText = null
      this.refresh()
    },
    refresh() {
      location.reload(true)
    },
    async cancelPendingFetches() {
      return this.$cancelPendingBgFetches()
    },
    onPreferAudio(status) {
      this.$store.commit('ui/setPreferAudio', status)
    }
  }
}
</script>
