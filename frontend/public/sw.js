self.addEventListener('push', function (event) {
  if (!event.data) return
  try {
    const data = event.data.json()
    const title = data.title || 'LOCUS'
    const options = { body: data.body || '', icon: '/logo-locus.png' }
    event.waitUntil(self.registration.showNotification(title, options))
  } catch {
    event.waitUntil(self.registration.showNotification('LOCUS', { body: event.data.text() }))
  }
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  event.waitUntil(clients.openWindow('/'))
})
