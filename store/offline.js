export const state = () => ({
  playlists: [],
  videos: []
})

export const mutations = {
  addPlaylist(state, payload) {
    state.playlists.push(payload)
  },

  addVideo(state, payload) {
    state.videos.push(payload)
  },

  deletePlaylist(state, playlistId) {
    state.playlists = state.playlists.filter(
      playlist => playlist.id !== playlistId
    )
    state.videos = state.videos.filter(video => video.playlistId !== playlistId)
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
