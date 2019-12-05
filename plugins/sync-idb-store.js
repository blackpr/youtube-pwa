import setupIdb from '~/utils/offlineDB.js'

export default async ({ store }) => {
  const offlinedb = await setupIdb()

  const playlists = await offlinedb.getAll('playlists')
  if (playlists) {
    playlists.forEach(playlist => store.commit('offline/addPlaylist', playlist))
  }

  const videos = await offlinedb.getAll('videos')
  if (videos) {
    videos.forEach(video => store.commit('offline/addVideo', video))
  }
}
