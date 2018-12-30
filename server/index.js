const express = require('express')
const consola = require('consola')
const ytdl = require('ytdl-core')
const ytsr = require('ytsr')
const ytpl = require('ytpl')
const { Nuxt, Builder } = require('nuxt')
const app = express()
const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000

app.set('port', port)

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
config.dev = !(process.env.NODE_ENV === 'production')

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  }

  app.get('/search', async (req, res) => {
    let searchTerm = req.query.search_query
    let nextpageRef = null
    let sp = req.query.sp
    if (sp) {
      nextpageRef = `/results?sp=${sp}&search_query=${searchTerm}`
    }
    if (searchTerm) {
      try {
        let searchResults = await ytsr(searchTerm, { nextpageRef, limit: 40 })
        res.json(searchResults)
      } catch (error) {
        res.status(500).json({ error: 'ytsr err', error })
      }
    } else {
      res.status(500).json({ error: 'no search term' })
    }
  })

  app.get('/video/:videoId', async (req, res) => {
    let videoId = req.params.videoId
    if (videoId) {
      let isValidId = ytdl.validateID(videoId)
      if (isValidId) {
        try {
          let info = await ytdl.getInfo(videoId)
          let filteredFormats = ytdl.chooseFormat(info.formats, {
            quality: 'highest',
            filter: 'audioandvideo'
          })
          res.json(filteredFormats)
        } catch (error) {
          res.status(500).json({ error: 'ytdl err' })
        }
      } else {
        res.status(500).json({ error: 'invalid video id' })
      }
    } else {
      res.status(500).json({ error: 'no video id' })
    }
  })

  app.get('/playlist/:playlistId', async (req, res) => {
    let playlistId = req.params.playlistId
    if (playlistId) {
      try {
        let playlistResults = await ytpl(playlistId)
        res.json(playlistResults)
      } catch (error) {
        res.status(500).json({ error: 'ytpl error' })
      }
    } else {
      res.status(500).json({ error: 'no playlist id' })
    }
  })

  app.get('/channel/:channelId', async (req, res) => {
    let channelId = req.params.channelId
    if (channelId) {
      let channelUrl = `https://www.youtube.com/channel/${channelId}`
      try {
        let playlistResults = await ytpl(channelUrl)
        res.json(playlistResults)
      } catch (error) {
        res.status(500).json({ error: 'ytpl error' })
      }
    } else {
      res.status(500).json({ error: 'no channel id' })
    }
  })

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}
start()
