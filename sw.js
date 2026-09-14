// sw.js — Service Worker de Keynonia (versión web / app.html)
// Solo se encarga de recibir notificaciones push y abrir/enfocar la app al hacer clic.
// No cachea nada (aditivo, no cambia el comportamiento de carga normal de la app).

self.addEventListener('install', function (event) {
  self.skipWaiting()
})

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', function (event) {
  var datos = {}
  try {
    datos = event.data ? event.data.json() : {}
  } catch (e) {
    datos = { title: 'Keynonia', body: event.data ? event.data.text() : '' }
  }

  var titulo = datos.title || 'Keynonia'
  var opciones = {
    body: datos.body || '',
    icon: datos.icon || 'https://keynonia.com/icons/icon-192.png',
    badge: datos.badge || 'https://keynonia.com/icons/icon-192.png',
    data: { url: datos.url || 'https://keynonia.com/app.html' },
    tag: datos.tag || 'keynonia-notif',
    renotify: !!datos.tag
  }

  event.waitUntil(self.registration.showNotification(titulo, opciones))
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  var url = (event.notification.data && event.notification.data.url) || 'https://keynonia.com/app.html'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (listaClientes) {
      for (var i = 0; i < listaClientes.length; i++) {
        var cliente = listaClientes[i]
        if (cliente.url.indexOf('keynonia.com') !== -1 && 'focus' in cliente) {
          return cliente.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url)
      }
    })
  )
})
