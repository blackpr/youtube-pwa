const express = require('express')
const bodyParser = require('body-parser')
const youtubeRoutes = require('./youtube/youtubeRoutes')
const cors_proxy = require('cors-anywhere')

// if (process.env.NODE_ENV === 'development') require('dotenv').config()

// Load in specific routes
// const apiRoutes = require('./api')

// Configure our server
const app = express()

app.use(bodyParser.json())
// Define server routes
// app.use(apiRoutes)

let proxy = cors_proxy.createServer({
  //originWhitelist: ['http://localhost:3000'], //use for dev
  originWhitelist: [
    'http://youtube-pwa.now.sh',
    'https://youtube-pwa.blackpr.now.sh/'
  ], // Allow origins
  requireHeader: ['origin', 'x-requested-with'],
  removeHeaders: ['cookie']
})

/* Attach our cors proxy to the existing API on the /proxy endpoint. */
app.get('/proxy/:proxyUrl*', (req, res) => {
  req.url = req.url.replace('/proxy/', '/')
  // hack for zeit now
  if (!req.url.startsWith('/https://')) {
    console.log('if')
    req.url = req.url.replace('/https:/', '/https://')
  }
  proxy.emit('request', req, res)
})

app.use('/getInfo', youtubeRoutes)

export default [
  {
    path: '/api',
    handler: app
  }
]

// const express = require('express')
// const consola = require('consola')
// const { Nuxt, Builder } = require('nuxt')
// const youtubeRoutes = require('./youtube/youtubeRoutes')
// const app = express()

// // Import and Set Nuxt.js options
// const config = require('../nuxt.config.js')
// config.dev = process.env.NODE_ENV !== 'production'

// async function start() {
//   // Init Nuxt.js
//   const nuxt = new Nuxt(config)

//   const { host, port } = nuxt.options.server

//   // Build only in dev mode
//   if (config.dev) {
//     const builder = new Builder(nuxt)
//     await builder.build()
//   } else {
//     await nuxt.ready()
//   }

//   app.use('/getInfo', youtubeRoutes)

//   // Give nuxt middleware to express
//   app.use(nuxt.render)

//   // Listen the server
//   app.listen(port, host)
//   consola.ready({
//     message: `Server listening on http://${host}:${port}`,
//     badge: true
//   })
// }
// start()
