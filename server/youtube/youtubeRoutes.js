const router = require('express').Router()
const ytdl = require('ytdl-core')
const ytsr = require('ytsr')
const ytpl = require('ytpl')
const fetch = require('node-fetch')

router.get('/search', async (req, res) => {
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
    } catch (err) {
      res.status(500).json({ error: 'ytsr err', err })
    }
  } else {
    res.status(500).json({ error: 'no search term' })
  }
})

router.get('/proxy/:videoId', async (req, res) => {
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
        fetch(filteredFormats.url).then(t => {
          res.set('Content-Type', 'video/mp4')
          res.set('Content-length', filteredFormats.contentLength)
          res.set('Accept-Ranges', 'bytes')
          t.body.pipe(res)
        })
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

router.get('/video/:videoId', async (req, res) => {
  let videoId = req.params.videoId
  let preferAudio = req.query.preferAudio
  if (videoId) {
    let isValidId = ytdl.validateID(videoId)
    if (isValidId) {
      try {
        let info = await ytdl.getInfo(videoId)
        console.log(info.formats)
        let filterOptions
        if (preferAudio) {
          filterOptions = {
            quality: 'highest'
            // quality: 'highestaudio',
            // filter: format => format.codecs === 'aac'
            // filter: 'audioonly'
          }
        } else {
          filterOptions = {
            quality: 'highest',
            filter: 'audioandvideo'
          }
        }
        let filteredFormats = ytdl.chooseFormat(info.formats, filterOptions)
        res.json({ filteredFormats, info })
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

router.get('/playlist/:playlistId', async (req, res) => {
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

router.get('/channel/:channelId', async (req, res) => {
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

module.exports = router
