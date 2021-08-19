import Vue from 'vue'
import _get from 'lodash.get'
import setupIdb from '~/utils/offlineDB.js'

export default async ({ $axios, store }, inject) => {
  const state = Vue.observable({
    selectedVideoForDl: {},
    canDownload: false,
    playlist: [],
    videosWithUrls: [],
    loadingVideos: false
  })

  let offlinedb = null
  let videosResults = []
  let playlistVideoIds = []

  async function monitorBgFetch(bgFetch) {
    const updateItem = (id, update) => {
      if (!state.selectedVideoForDl) return
      state.selectedVideoForDl = Object.assign({}, state.selectedVideoForDl, {
        state: update.state
      })
    }
    const doUpdate = () => {
      const update = {}

      if (bgFetch.result === '') {
        update.state = 'fetching'
        update.progress = bgFetch.downloaded / bgFetch.downloadTotal
      } else if (bgFetch.result === 'success') {
        update.state = 'fetching'
        update.progress = 1
      } else if (bgFetch.failureReason === 'aborted') {
        // Failure
        update.state = 'not-stored'
      } else {
        // other failure
        update.state = 'failed'
      }

      updateItem(bgFetch.id, update)
    }

    doUpdate()

    bgFetch.addEventListener('progress', doUpdate)
    const channel = new BroadcastChannel(bgFetch.id)

    channel.onmessage = async event => {
      if (!event.data.stored) return
      // yay! we have the video
      bgFetch.removeEventListener('progress', doUpdate)
      channel.close()
      updateItem(bgFetch.id, { state: 'stored' })

      await offlinedb.put('videos', state.selectedVideoForDl)
      store.commit('offline/addVideo', state.selectedVideoForDl)
      startBgFetch()
    }
  }

  async function cancelPendingBgFetches() {
    const reg = await navigator.serviceWorker.ready

    const ids = await reg.backgroundFetch.getIds()
    for await (let id of ids) {
      const bgf = await reg.backgroundFetch.get(id)
      await bgf.abort()
    }
  }

  function getPlaylistVideoIds() {
    return _get(state.playlist, 'items', []).map(item => item.id)
  }

  function getCanDownload() {
    if (!state.playlist) return false
    if (!state.playlist.items) return false
    if (!state.playlist.items.length) return false
    return 'BackgroundFetchManager' in self
  }

  async function getVideosResults() {
    let preferAudio = _get(window, '$nuxt.$store.state.ui.preferAudio', false)
    let videosPromises = playlistVideoIds.map(id =>
      $axios.$get(
        `/getInfo/video/${id}${preferAudio ? '?preferAudio=true' : ''}`
      )
    )
    state.loadingVideos = true
    for (const vp of videosPromises) {
      try {
        const res = await vp
        videosResults.push(res)
      } catch (e) {
        console.log('skipping this one: ', e)
      }
    }
    state.loadingVideos = false
  }

  async function setupWorld(playlist) {
    state.playlist = playlist
    playlistVideoIds = getPlaylistVideoIds()
    state.canDownload = getCanDownload()
    await getVideosResults()
  }

  function getThumbnail(video) {
    const playlistItem = _get(state.playlist, 'items', []).find(
      pi => pi.id === _get(video, 'info.videoDetails.videoId')
    )
    return _get(playlistItem, 'bestThumbnail.url', '')
  }

  async function setupBgFetch(playlist) {
    await setupWorld(playlist)
    if (!state.canDownload) return

    if (videosResults && videosResults.length) {
      state.videosWithUrls = videosResults.map(vr => {
        const v = {
          id: _get(vr, 'info.videoDetails.videoId'),
          title: _get(vr, 'info.videoDetails.title'),
          views: _get(vr, 'info.videoDetails.viewCount'),
          authorImage: _get(
            vr,
            'info.videoDetails.author.thumbnails[0].url',
            ''
          ),
          authorName: _get(vr, 'info.videoDetails.author.name'),
          // timestamp: _get(vr, 'info.timestamp'),
          publishDate: _get(vr, 'info.videoDetails.publishDate'),
          description: _get(vr, 'info.videoDetails.description', ''),
          thumbnail: getThumbnail(vr),
          thumbnails: _get(vr, 'info.videoDetails.thumbnails', []),
          playlistId: state.playlist.id,
          url: `https://square-dawn-6a23.blackpr.workers.dev/${_get(
            vr,
            'filteredFormats.url'
          )}`,
          contentLength: _get(vr, 'filteredFormats.contentLength')
        }
        return v
      })

      offlinedb = await setupIdb()
      const playlistInfo = {
        id: state.playlist.id,
        title: state.playlist.title
      }
      console.log({ playlist })
      await offlinedb.put('playlists', playlistInfo)
      store.commit('offline/addPlaylist', playlistInfo)

      await startBgFetch()
    }
  }

  async function startBgFetch() {
    const reg = await navigator.serviceWorker.ready

    try {
      if (!state.videosWithUrls) return
      if (state.videosWithUrls.length === 0) return
      state.selectedVideoForDl = Object.assign({}, state.videosWithUrls.shift())

      const bgFetch = await reg.backgroundFetch.fetch(
        `off:::${state.selectedVideoForDl.id}`,
        [state.selectedVideoForDl.url],
        {
          title: state.selectedVideoForDl.title,
          downloadTotal: state.selectedVideoForDl.contentLength
        }
      )

      monitorBgFetch(bgFetch)
    } catch (e) {
      console.log('fetch failed ', e)
    }
  }

  async function deletePlaylist(playlist) {
    const db = await setupIdb()
    await db.delete('playlists', playlist.id)
    const videos = _get(playlist, 'items', [])
    if (!videos) return
    for await (let video of videos) {
      await db.delete('videos', video.id)
      await caches.delete(`off:::${video.id}`)
    }
    store.commit('offline/deletePlaylist', playlist.id)
  }

  async function deleteVideo(videoId) {
    const db = await setupIdb()
    await db.delete('videos', videoId)
    caches.delete(`off:::${videoId}`)
    store.commit('offline/deleteVideo', videoId)
  }

  inject('offlineState', state)
  inject('cancelPendingBgFetches', cancelPendingBgFetches)
  inject('setupBgFetch', setupBgFetch)
  inject('deletePlaylist', deletePlaylist)
  inject('deleteVideo', deleteVideo)
}
