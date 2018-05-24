var cacheName = 'my-site-cache-v1';
var cacheFiles = [
    '/',
    '/index.html',
    '/assets/js/jquery-3.1.1.min.js',
    '/assets/js/script.js',
    '/assets/images/correct.png',
    '/assets/images/wrong.png',
    '/assets/css/bootstrap.min.css',
    '/assets/css/reset.css',
    '/assets/css/screen.css',
    '/assets/fonts/glyphicons-halflings-regular.woff2',
    '/manifest.json'
];
self.addEventListener('install',function (e) {
    console.log("[ServiceWorker] Installed");
    e.waitUntil(
        caches.open(cacheName)
            .then(function (cache) {
                console.log('opened cache');
                return cache.addAll(cacheFiles);
            })
    )
});
self.addEventListener('activate',function (e) {
    console.log("[ServiceWorker] Activated");
    e.waitUntil(caches.keys().then(function (cacheNames) {
        return Promise.all(cacheNames.map(function (thisCacheName) {
            if(thisCacheName !== cacheName){
                console.log("[ServiceWorker] Removing Cached Files from "+thisCacheName);
                return caches.delete(thisCacheName);
            }
        }))
    }))
});
self.addEventListener('fetch',function (e) {
    //console.log("[ServiceWorker] Fetching", e.request.url);
    e.respondWith(
        caches.match(e.request)
            .then(function(response) {
                    // Cache hit - return response
                    if (response) {
                        console.log("[SercieWorker] Found in cache");
                        return response;
                    }
                    var requestClone = e.request.clone();
                    fetch(requestClone).then(function (response) {
                        if(!response){
                            console.log("[ServiceWorker] No response from fetch");
                            return response;
                        }
                        var responseClone = response.clone();
                        caches.open(cacheName)
                            .then(function (cache) {
                                cache.put(e.request, responseClone);
                                return response;
                            })

                    });
                })
            .catch(function (err) {
                console.log("[ServiceWorker] Error Fetching & Caching" + err)
            })
    );
});