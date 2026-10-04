/* =========================================================
   أمير مواقيت V2
   Service Worker
   Offline + Cache + Updates
   ========================================================= */

const CACHE_NAME = "amir-mawaqit-v4";

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

    "./audio/adhan1.mp3",

    "./icons/icon-192.png",
    "./icons/icon-512.png"
];


/* =========================================================
   INSTALL
   ========================================================= */

self.addEventListener("install", event => {

    console.log(
        "📦 Amir Mawaqit V2 Service Worker installing..."
    );

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(async cache => {

                /*
                 * نحاول تحميل الملفات واحدًا واحدًا
                 * حتى لا يفشل تثبيت التطبيق بالكامل
                 * بسبب ملف واحد غير موجود.
                 */

                for (const file of APP_FILES) {

                    try {

                        await cache.add(file);

                        console.log(
                            "Cached:",
                            file
                        );

                    } catch (error) {

                        console.warn(
                            "Could not cache:",
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
        "⚡ Amir Mawaqit V2 Service Worker activated"
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
                                "🗑️ Removing old cache:",
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

    /*
     * نريد فقط GET
     */
    if (request.method !== "GET") {
        return;
    }

    const url = new URL(request.url);


    /* =====================================================
       API مواقيت الصلاة
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
       الملفات المحلية
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
                         * تحديث نسخة الكاش في الخلفية
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
                                                networkResponse
                                            );

                                        });
                                }

                            })
                            .catch(() => {});

                        return cachedResponse;
                    }


                    /* ==============================
                       إذا لم يوجد الملف في الكاش
                       نحاول من الإنترنت
                       ============================== */

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
                             * إذا كان المستخدم بدون إنترنت
                             * نحاول إرجاع الصفحة الرئيسية.
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
       الطلبات الخارجية الأخرى
       ===================================================== */

    event.respondWith(

        fetch(request)
            .catch(() => caches.match(request))

    );

});


/* =========================================================
   MESSAGE
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
