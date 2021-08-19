const matchCb = ({ event }) => {
  const url = new URL(event.request.url)
  return url.pathname.includes('googlevideo.com')
}
const handlerCb = async ({ event }) => {
  // const cachedResponse = await caches.match(event.request)
  // not sure why but this seems to work.
  // caches.match cant find by the cached file by passing the whole request
  const cachedResponse = await caches.match(event.request.url)
  console.log({ cachedResponse })
  return cachedResponse || fetch(event.request)
}

// eslint-disable-next-line no-undef
workbox.routing.registerRoute(matchCb, handlerCb)
