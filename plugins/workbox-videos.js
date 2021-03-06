const matchCb = ({ event }) => {
  const url = new URL(event.request.url)
  return url.pathname.includes('googlevideo.com')
}
const handlerCb = async ({ event }) => {
  const cachedResponse = await caches.match(event.request)
  console.log({ cachedResponse })
  return cachedResponse || fetch(event.request)
}

// eslint-disable-next-line no-undef
workbox.routing.registerRoute(matchCb, handlerCb)
