export const state = () => ({
  playlists: [],
  videos: []
})

export const mutations = {
  addPlaylist(state, payload) {
    const found = state.playlists.findIndex(
      playlist => playlist.id === payload.id
    )
    if (found === -1) {
      state.playlists.push(payload)
    }
  },

  addVideo(state, payload) {
    const found = state.videos.findIndex(video => video.id === payload.id)
    if (found === -1) {
      state.videos.push(payload)
    }
  },

  deletePlaylist(state, playlistId) {
    state.playlists = state.playlists.filter(
      playlist => playlist.id !== playlistId
    )
    state.videos = state.videos.filter(video => video.playlistId !== playlistId)
  },

  deleteVideo(state, videoId) {
    state.videos = state.videos.filter(v => v.id !== videoId)
  }
}

export const getters = {
  playlistsMap(state) {
    if (!state.playlists) return {}
    if (!state.playlists.length) return {}

    return state.playlists.reduce((acc, curr) => {
      acc[curr.id] = {
        ...curr,
        items: state.videos.filter(v => v.playlistId === curr.id)
      }
      return acc
    }, {})
  }
}
