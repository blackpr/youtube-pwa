import setupIdb from '~/utils/offlineDB.js'

// eslint-disable-next-line no-unused-vars
export default async ({ app }, inject) => {
  // const offlinedb = await openDB('offline', 6, {
  //   upgrade(db) {
  //     // eslint-disable-next-line no-unused-vars
  //     const playlistStore = db.createObjectStore('playlists', {
  //       keyPath: 'id'
  //     })
  //     const videoStore = db.createObjectStore('videos', {
  //       keyPath: 'id'
  //     })
  //     videoStore.createIndex('playlistId', 'playlistId')
  //   }
  // })
  const offlinedb = await setupIdb()

  inject('offlinedb', offlinedb)
}
