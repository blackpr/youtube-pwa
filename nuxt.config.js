// const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')
// import colors from 'vuetify/lib/util/colors'
const pkg = require('./package')
import serverRoutes from './server'

module.exports = {
  mode: 'spa',

  /*
   ** Headers of the page
   */
  head: {
    title: pkg.name,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      {
        rel: 'stylesheet',
        href:
          'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons'
      }
    ]
  },

  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },

  /*
   ** Global CSS
   */
  css: ['~/assets/style/app.styl'],

  /*
   ** Plugins to load before mounting the App
   */
  // plugins: ['@/plugins/vuetify'],

  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://github.com/nuxt-community/axios-module#usage
    '@nuxtjs/axios',
    // Doc: https://github.com/nuxt-community/dotenv-module
    '@nuxtjs/dotenv',
    // Doc: https://pwa.nuxtjs.org/setup.html
    '@nuxtjs/pwa'
  ],

  plugins: [
    {
      src: '~/plugins/idb-sync.js',
      mode: 'client',
      ssr: false
    },
    {
      src: '~/plugins/bg-fetch.js',
      mode: 'client',
      ssr: false
    },
    {
      src: '~/plugins/sync-idb-store.js',
      mode: 'client',
      ssr: false
    },
    {
      src: '~/plugins/hook-sw.js',
      mode: 'client',
      ssr: false
    }
  ],

  pwa: {
    workbox: {
      // todo!!!!: disable this
      // https://pwa.nuxtjs.org/modules/workbox.html#dev
      dev: true,
      importScripts: ['idb-min.js', 'custom-sw.js'],
      cachingExtensions: '~/plugins/workbox-videos.js',
      runtimeCaching: [
        {
          urlPattern: 'https://i.ytimg.com.*',
          strategyOptions: {
            cacheName: 'youtube-images',
            cacheExpiration: {
              maxEntries: 500,
              maxAgeSeconds: 6 * 30 * 24 * 60 * 60
            }
          }
        }
      ]
    },
    icon: {
      iconSrc: '~/static/icon.png'
    },
    manifest: {
      name: 'Youtube-PWA'
    }
  },
  /*
   ** Axios module configuration
   */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
    baseURL: '/api/'
  },

  // 'http://localhost:3000/getInfo/video/ZNGhWgIINGM'
  serverMiddleware: [...serverRoutes],
  // serverMiddleware: [
  //   { path: '/api/hello', handler: '~/api/hello.js' },
  //   { path: '/api/getInfo/search', handler: '~/api/getInfo/search.js' },
  //   {
  //     path: '/api/getInfo/channel/:channelId',
  //     handler: '~/api/getInfo/channel/[channelId].js'
  //   },
  //   {
  //     path: '/api/getInfo/playlist/:[playlistId]',
  //     handler: '~/api/getInfo/playlist/[playlistId].js'
  //   },
  //   {
  //     path: '/api/getInfo/video/:videoId',
  //     handler: '~/api/getInfo/video/[videoId].js'
  //   }
  // ],

  /*
   ** Build configuration
   */
  buildModules: ['@nuxtjs/vuetify'],
  vuetify: {
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: '#FF4081'
        }
      }
    }
  },
  build: {
    // disable code splitting for better offline caching
    // https://github.com/nuxt/nuxt.js/pull/3060
    // https://nuxtjs.org/api/configuration-build/#optimization
    optimization: {
      splitChunks: {
        chunks: 'async'
      }
    },
    splitChunks: {
      pages: false,
      vendor: true,
      commons: true,
      runtime: false,
      layouts: false
    },
    // transpile: ['vuetify/lib'],
    // plugins: [new VuetifyLoaderPlugin()],
    // loaders: {
    //   stylus: {
    //     import: ['~assets/style/variables.styl']
    //   }
    // },
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  }
}
