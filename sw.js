/* =========================================================
   أمير مواقيت V2
   Service Worker
   ========================================================= */

const CACHE_NAME = "amir-mawaqit-v6";

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

    console.log("📦 أمير مواقيت V2: تثبيت Service Worker");

    event.waitUntil(

        caches.open(CACHE_NAME)

            .then(async cache => {

                for (const file of APP_FILES) {

                    try {

                        await cache.add(file);

                        console.log(
                            "✅ تم حفظ:",
                            file
                        );

                    } catch (error) {

                        console.warn(
                            "⚠️ تعذر حفظ:",
                            file
                        );
                    }
                }

            })

            .then(() => {

                return self.skipWaiting();

            })

    );

});


/* =========================================================
   ACTIVATE
   ========================================================= */

self.addEventListener("activate", event => {

    console.log(
        "⚡ أمير مواقيت V2: Service Worker مفعل"
    );

    event.waitUntil(

        caches.keys()

            .then(cacheNames => {

                return Promise.all(

                    cacheNames.map(cacheName => {

                        if (
                            cacheName.startsWith("amir-mawaqit-") &&
                            cacheName !== CACHE_NAME
                        ) {

                            console.log(
                                "🗑️ حذف الكاش القديم:",
                                cacheName
                            );

                            return caches.delete(cacheName);
                        }

                        return null;

                    })

                );

            })

            .then(() => {

                return self.clients.claim();

            })

    );

});


/* =========================================================
   FETCH
   ========================================================= */

self.addEventListener("fetch", event => {

    const request = event.request;

    /* فقط GET */
    if (request.method !== "GET") {
        return;
    }

    const url = new URL(request.url);


    /* =====================================================
       ALADHAN API
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

                            })
                            .catch(() => {});

                    }

                    return response;

                })

                .catch(() => {

                    return caches.match(request);

                })

        );

        return;
    }


    /* =====================================================
       ملفات التطبيق المحلية
       Cache First + تحديث في الخلفية
       ===================================================== */

    if (
        url.origin === self.location.origin
    ) {

        event.respondWith(

            caches.match(request)

                .then(cachedResponse => {

                    /* -----------------------------------------
                       الملف موجود في الكاش
                       ----------------------------------------- */

                    if (cachedResponse) {

                        /* تحديث النسخة في الخلفية */

                        fetch(request)

                            .then(networkResponse => {

                                if (
                                    networkResponse &&
                                    networkResponse.ok
                                ) {

                                    caches.open(CACHE_NAME)

                                        .then(cache => {

                                            cache.put(
                                                request,
                                                networkResponse.clone()
                                            );

                                        })
                                        .catch(() => {});

                                }

                            })

                            .catch(() => {});


                        return cachedResponse;
                    }


                    /* -----------------------------------------
                       الملف غير موجود في الكاش
                       ----------------------------------------- */

                    return fetch(request)

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

                                    })
                                    .catch(() => {});

                            }

                            return response;

                        })

                        .catch(() => {

                            /* ---------------------------------
                               Offline navigation
                               --------------------------------- */

                            if (
                                request.mode === "navigate"
                            ) {

                                return caches.match(
                                    "./index.html"
                                );

                            }


                            /* ---------------------------------
                               Offline resource
                               --------------------------------- */

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
       الطلبات الخارجية الأخرى
       ===================================================== */

    event.respondWith(

        fetch(request)

            .catch(() => {

                return caches.match(request);

            })

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
    "🚀 أمير مواقيت V2 Service Worker جاهز"
);
