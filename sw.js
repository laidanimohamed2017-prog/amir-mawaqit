/* =========================================================
   أمير مواقيت V2
   Service Worker
   ========================================================= */

const CACHE_NAME = "amir-mawaqit-v5";

const APP_FILES = [
    "./",
    "./index.html",
    "./manifest.json",

    "./css/style.css",
    "./css/responsive.css",
    "./css/animations.css",

    "./js/app.js",
    "./js/prayer.js",
    "./js/adhan.js",
    "./js/qibla.js",
    "./js/azkar.js",
    "./js/settings.js",
    "./js/storage.js",

    "./adhan1.mp3",

    "./icon-192.png",
    "./icon-512.png"
];


/* =========================================================
   INSTALL
   ========================================================= */

self.addEventListener("install", event => {

    console.log(
        "📦 Amir Mawaqit V2 installing..."
    );

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(async cache => {

                for (const file of APP_FILES) {

                    try {

                        await cache.add(file);

                        console.log(
                            "✅ Cached:",
                            file
                        );

                    } catch (error) {

                        console.warn(
                            "⚠️ Could not cache:",
                            file
                        );
                    }
                }

            })
            .then(() => self.skipWaiting())
    );
});


/* =========================================================
   ACTIVATE
   ========================================================= */

self.addEventListener("activate", event => {

    console.log(
        "⚡ Amir Mawaqit V2 activated"
    );

    event.waitUntil(

        caches.keys()
            .then(cacheNames => {

                return Promise.all(

                    cacheNames.map(cacheName => {

                        if (
                            cacheName !== CACHE_NAME &&
                            cacheName.startsWith(
                                "amir-mawaqit-"
                            )
                        ) {

                            console.log(
                                "🗑️ Delete old cache:",
                                cacheName
                            );

                            return caches.delete(
                                cacheName
                            );
                        }

                        return null;
                    })

                );

            })
            .then(() => self.clients.claim())
    );
});


/* =========================================================
   FETCH
   ========================================================= */

self.addEventListener("fetch", event => {

    const request = event.request;

    if (request.method !== "GET") {
        return;
    }

    const url = new URL(request.url);


    /* =====================================================
       Aladhan API
       Network First
       ===================================================== */

    if (
        url.hostname === "api.aladhan.com"
    ) {

        event.respondWith(

            fetch(request)
                .then(response => {

                    if (
                        response &&
                        response.ok
                    ) {

                        const copy =
                            response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {

                                cache.put(
                                    request,
                                    copy
                                );

                            });
                    }

                    return response;

                })
                .catch(() => {

                    return caches.match(
                        request
                    );

                })

        );

        return;
    }


    /* =====================================================
       ملفات التطبيق
       Cache First
       ===================================================== */

    if (
        url.origin === self.location.origin
    ) {

        event.respondWith(

            caches.match(request)
                .then(cachedResponse => {

                    if (cachedResponse) {

                        /*
                         * تحديث الملف في الخلفية
                         */

                        fetch(request)
                            .then(networkResponse => {

                                if (
                                    networkResponse &&
                                    networkResponse.ok
                                ) {

                                    caches.open(
                                        CACHE_NAME
                                    )
                                        .then(cache => {

                                            cache.put(
                                                request,
                                                networkResponse.clone()
                                            );

                                        });
                                }

                            })
                            .catch(() => {});

                        return cachedResponse;
                    }


                    /* =================================================
                       الملف غير موجود في الكاش
                       ================================================= */

                    return fetch(request)
                        .then(response => {

                            if (
                                response &&
                                response.ok
                            ) {

                                const copy =
                                    response.clone();

                                caches.open(
                                    CACHE_NAME
                                )
                                    .then(cache => {

                                        cache.put(
                                            request,
                                            copy
                                        );

                                    });
                            }

                            return response;

                        })
                        .catch(() => {

                            /*
                             * إذا فتح المستخدم التطبيق
                             * بدون إنترنت.
                             */

                            if (
                                request.mode === "navigate"
                            ) {

                                return caches.match(
                                    "./index.html"
                                );
                            }

                            return new Response(
                                "غير متصل بالإنترنت",
                                {
                                    status: 503,
                                    headers: {
                                        "Content-Type":
                                            "text/plain; charset=utf-8"
                                    }
                                }
                            );

                        });

                })

        );

        return;
    }


    /* =====================================================
       الطلبات الخارجية
       ===================================================== */

    event.respondWith(

        fetch(request)
            .catch(() => caches.match(request))

    );

});


/* =========================================================
   الرسائل
   ========================================================= */

self.addEventListener(
    "message",
    event => {

        if (
            event.data &&
            event.data.type === "SKIP_WAITING"
        ) {

            self.skipWaiting();
        }

    }
);


console.log(
    "🚀 Amir Mawaqit V2 Service Worker loaded"
);
