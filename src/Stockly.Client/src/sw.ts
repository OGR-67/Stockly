/// <reference lib="webworker" />

import { clientsClaim } from 'workbox-core'
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

declare let self: ServiceWorkerGlobalScope

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

void self.skipWaiting()
clientsClaim()

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url)
    if (event.request.method === 'POST' && url.pathname === '/share-target') {
        event.respondWith(handleShareTarget(event.request))
    }
})

// Au moment où le SW reçoit le POST de partage, aucun client (onglet) n'est encore ouvert/focus
// sur la bonne page, donc on ne peut pas faire de postMessage direct vers un client existant —
// le Cache API sert de relais jusqu'à ce que la page scan-receipt aille lire le fichier.
async function handleShareTarget(request: Request): Promise<Response> {
    try {
        const formData = await request.formData()
        const file = formData.get('file')
        if (!(file instanceof File)) {
            return Response.redirect('/store/scan-receipt', 303)
        }
        const cache = await caches.open('shared-files')
        await cache.put('/shared-file', new Response(file, { headers: { 'Content-Type': file.type } }))
        return Response.redirect('/store/scan-receipt?shared=1', 303)
    } catch {
        return Response.redirect('/store/scan-receipt', 303)
    }
}
