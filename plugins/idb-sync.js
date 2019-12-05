import { openDB } from 'idb'

// eslint-disable-next-line no-unused-vars
export default async ({ app }, inject) => {
  const offlinedb = await openDB('offline', 6, {
    upgrade(db) {
      // eslint-disable-next-line no-unused-vars
      const playlistStore = db.createObjectStore('playlists', {
        keyPath: 'id'
      })
      console.log({ playlistStore })
      const videoStore = db.createObjectStore('videos', {
        keyPath: 'id'
      })
      console.log({ videoStore })
      videoStore.createIndex('playlistId', 'playlistId')
    }
  })

  inject('offlinedb', offlinedb)
}
