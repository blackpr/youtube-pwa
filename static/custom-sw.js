console.log('Custom service worker!')
// self.addEventListener('fetch', async event => {
//   const url = new URL(event.request.url)
//   console.log('customswurl', url)
//   console.log('customswpathname', url.pathname)
//   console.log('customswrequest', event.request)
// })

addEventListener('backgroundfetchsuccess', event => {
  const bgFetch = event.registration

  event.waitUntil(
    (async function() {
      const cache = await caches.open(bgFetch.id)
      const records = await bgFetch.matchAll()

      const promises = records.map(async record => {
        await cache.put(record.request, await record.responseReady)
      })

      await Promise.all(promises)

      new BroadcastChannel(bgFetch.id).postMessage({ stored: true })
    })()
  )
})

addEventListener('backgroundfetchfail', event => {
  console.log('Background fetch failed', event)
})

// eslint-disable-next-line
addEventListener('backgroundfetchclick', event => {
  // eslint-disable-next-line no-undef
  clients.openWindow('/')
})
