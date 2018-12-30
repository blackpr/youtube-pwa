const express = require('express')
const consola = require('consola')
const ytdl = require('ytdl-core')
const ytsr = require('ytsr')
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

  app.get('/info/:videoId', async (req, res) => {
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
      res.status(500).json({ error: 'no search term' })
    }
  })

  app.get('/getInfoTest', async (req, res) => {
    let info = await ytdl.getInfo(
      'https://www.youtube.com/watch?v=3Sy8R82_fKw&list=PLiObRQ17fxxmpDrz1SxrpMPYnQMKyvK4'
    )
    let format = ytdl.chooseFormat(info.formats, {
      quality: 'highest',
      filter: 'audioandvideo'
    })
    res.send(format)
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
