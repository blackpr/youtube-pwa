import { openDB } from 'idb'

async function setupIdb() {
  const offlinedb = await openDB('offline', 7, {
    upgrade(db, oldVersion) {
      if (oldVersion < 6) {
        // eslint-disable-next-line no-unused-vars
        const playlistStore = db.createObjectStore('playlists', {
          keyPath: 'id'
        })
        const videoStore = db.createObjectStore('videos', {
          keyPath: 'id'
        })
        videoStore.createIndex('playlistId', 'playlistId')
      }
    }
  })

  return offlinedb
}

export default setupIdb
