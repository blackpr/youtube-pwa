import Vue from 'vue'
import _get from 'lodash.get'
import setupIdb from '~/utils/offlineDB.js'

export default async ({ $axios, store }, inject) => {
  // use lazy import in order to work with window and axios
  // const axios = window.$nuxt.$axios

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
      console.log({ id, update, playlist: state.playlist })
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
    let videosPromises = playlistVideoIds.map(id =>
      $axios.$get(`/getInfo/video/${id}`)
    )
    state.loadingVideos = true
    videosResults = await Promise.all(videosPromises)
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
      pi => pi.id === _get(video, 'info.video_id')
    )
    return _get(playlistItem, 'thumbnail', '')
  }

  async function setupBgFetch(playlist) {
    await setupWorld(playlist)
    if (!state.canDownload) return

    if (videosResults && videosResults.length) {
      state.videosWithUrls = videosResults.map(vr => ({
        id: _get(vr, 'info.video_id'),
        title: _get(vr, 'info.title'),
        views: _get(vr, 'info.player_response.videoDetails.viewCount'),
        authorImage: _get(vr, 'info.author.avatar'),
        authorName: _get(vr, 'info.author.user'),
        timestamp: _get(vr, 'info.timestamp'),
        description: _get(vr, 'info.description', ''),
        thumbnail: getThumbnail(vr),
        playlistId: state.playlist.id,
        // url: _get(vr, 'filteredFormats.url'),
        contentLength: _get(vr, 'filteredFormats.contentLength')
      }))

      offlinedb = await setupIdb()
      const playlistInfo = {
        id: state.playlist.id,
        title: state.playlist.title
      }
      await offlinedb.put('playlists', playlistInfo)
      store.commit('offline/addPlaylist', playlistInfo)

      await startBgFetch()
    }
    console.log(videosResults)
  }

  async function startBgFetch() {
    const reg = await navigator.serviceWorker.ready

    try {
      if (!state.videosWithUrls) return
      if (state.videosWithUrls.length === 0) return
      state.selectedVideoForDl = Object.assign({}, state.videosWithUrls.shift())

      const bgFetch = await reg.backgroundFetch.fetch(
        `off:::${state.selectedVideoForDl.id}`,
        [`/api/getInfo/proxy/${state.selectedVideoForDl.id}`],
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

  inject('offlineState', state)
  inject('cancelPendingBgFetches', cancelPendingBgFetches)
  inject('setupBgFetch', setupBgFetch)
}
