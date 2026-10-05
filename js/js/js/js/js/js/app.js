/* =========================================================
   أمير مواقيت V2
   Main Application
   التطبيق الرئيسي وربط جميع الوحدات
   ========================================================= */

(function () {
    "use strict";

    const APP_VERSION = "2.0.0";

    let deferredInstallPrompt = null;

    /* ---------------------------------------------------------
       Helpers
    --------------------------------------------------------- */

    function $(id) {
        return document.getElementById(id);
    }

    function showMessage(
        message,
        type = "info"
    ) {
        const toast =
            $("amirToast");

        if (!toast) {
            return;
        }

        toast.textContent =
            message;

        toast.className =
            "amir-toast show";

        if (type === "success") {
            toast.classList.add(
                "success"
            );
        }

        if (type === "error") {
            toast.classList.add(
                "error"
            );
        }

        clearTimeout(
            showMessage.timer
        );

        showMessage.timer =
            setTimeout(() => {
                toast.classList.remove(
                    "show",
                    "success",
                    "error"
                );
            }, 3000);
    }

    /* ---------------------------------------------------------
       Navigation
    --------------------------------------------------------- */

    function getSections() {
        return document.querySelectorAll(
            ".page-section"
        );
    }

    function getNavButtons() {
        return document.querySelectorAll(
            "[data-section]"
        );
    }

    function openSection(
        sectionName
    ) {
        if (!sectionName) {
            sectionName = "home";
        }

        let target =
            document.getElementById(
                sectionName + "Section"
            );

        /*
         * دعم إضافي إذا كان الاسم نفسه هو ID.
         */
        if (!target) {
            target =
                document.getElementById(
                    sectionName
                );
        }

        if (!target) {
            console.warn(
                "Section not found:",
                sectionName
            );

            return false;
        }

        /*
         * إخفاء جميع الأقسام.
         */
        getSections().forEach(
            section => {
                section.classList.remove(
                    "active"
                );
            }
        );

        /*
         * إظهار القسم المطلوب.
         */
        target.classList.add(
            "active"
        );

        /*
         * تحديث شريط التنقل.
         */
        getNavButtons().forEach(
            button => {
                const name =
                    button.getAttribute(
                        "data-section"
                    );

                button.classList.toggle(
                    "active",
                    name ===
                        sectionName
                );
            }
        );

        /*
         * التمرير إلى الأعلى.
         */
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        /*
         * إجراءات خاصة بالأقسام.
         */
        if (
            sectionName === "qibla" &&
            window.AmirQibla
        ) {
            setTimeout(() => {
                if (
                    typeof window
                        .AmirQibla
                        .refresh ===
                    "function"
                ) {
                    window.AmirQibla.refresh();
                }
            }, 100);
        }

        if (
            sectionName === "azkar" &&
            window.AmirAzkar
        ) {
            setTimeout(() => {
                if (
                    typeof window
                        .AmirAzkar
                        .render ===
                    "function"
                ) {
                    window.AmirAzkar.render();
                }
            }, 100);
        }

        return true;
    }

    function bindNavigation() {

        /*
         * أزرار شريط التنقل السفلي.
         */
        document
            .querySelectorAll(
                "[data-section]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    function (event) {
                        event.preventDefault();

                        const section =
                            this.getAttribute(
                                "data-section"
                            );

                        openSection(
                            section
                        );
                    }
                );
            });

        /*
         * البطاقات والأزرار التي تحتوي
         * data-go-section.
         */
        document
            .querySelectorAll(
                "[data-go-section]"
            )
            .forEach(element => {

                element.addEventListener(
                    "click",
                    function (event) {
                        event.preventDefault();

                        const section =
                            this.getAttribute(
                                "data-go-section"
                            );

                        openSection(
                            section
                        );
                    }
                );
            });

        /*
         * دعم data-page القديم.
         */
        document
            .querySelectorAll(
                "[data-page]"
            )
            .forEach(element => {

                /*
                 * إذا كان العنصر لديه
                 * data-section أو data-go-section
                 * فلا نضيف مستمعًا ثانيًا.
                 */
                if (
                    element.hasAttribute(
                        "data-section"
                    ) ||
                    element.hasAttribute(
                        "data-go-section"
                    )
                ) {
                    return;
                }

                element.addEventListener(
                    "click",
                    function (event) {
                        const page =
                            this.getAttribute(
                                "data-page"
                            );

                        if (!page) {
                            return;
                        }

                        event.preventDefault();

                        openSection(
                            page
                        );
                    }
                );
            });
    }

    /* ---------------------------------------------------------
       Online / Offline
    --------------------------------------------------------- */

    function updateOnlineStatus() {
        const online =
            navigator.onLine;

        const status =
            $("offlineStatus");

        if (status) {
            status.textContent =
                online
                    ? "متصل بالإنترنت"
                    : "أنت تعمل بدون إنترنت";

            status.classList.toggle(
                "offline",
                !online
            );

            status.classList.toggle(
                "online",
                online
            );
        }

        document.body.classList.toggle(
            "is-offline",
            !online
        );

        if (!online) {
            showMessage(
                "أنت الآن تعمل بدون إنترنت"
            );
        }
    }

    function bindOnlineStatus() {
        window.addEventListener(
            "online",
            function () {
                updateOnlineStatus();

                showMessage(
                    "تم الاتصال بالإنترنت",
                    "success"
                );

                /*
                 * تحديث مواقيت الصلاة بعد
                 * عودة الاتصال.
                 */
                if (
                    window.AmirPrayer &&
                    typeof window.AmirPrayer.load ===
                        "function"
                ) {
                    window.AmirPrayer.load();
                }
            }
        );

        window.addEventListener(
            "offline",
            function () {
                updateOnlineStatus();
            }
        );

        updateOnlineStatus();
    }

    /* ---------------------------------------------------------
       Service Worker
    --------------------------------------------------------- */

    async function registerServiceWorker() {

        if (
            !("serviceWorker" in navigator)
        ) {
            return null;
        }

        try {
            const registration =
                await navigator.serviceWorker.register(
                    "./sw.js",
                    {
                        scope: "./"
                    }
                );

            console.log(
                "Amir Mawaqit Service Worker registered:",
                registration.scope
            );

            /*
             * تحديث Service Worker.
             */
            registration.addEventListener(
                "updatefound",
                function () {
                    const worker =
                        registration.installing;

                    if (!worker) {
                        return;
                    }

                    worker.addEventListener(
                        "statechange",
                        function () {
                            if (
                                worker.state ===
                                "installed"
                            ) {
                                if (
                                    navigator
                                        .serviceWorker
                                        .controller
                                ) {
                                    showMessage(
                                        "تم تجهيز تحديث جديد للتطبيق"
                                    );
                                }
                            }
                        }
                    );
                }
            );

            return registration;

        } catch (error) {
            console.error(
                "Service Worker registration failed:",
                error
            );

            return null;
        }
    }

    /* ---------------------------------------------------------
       PWA Install
    --------------------------------------------------------- */

    function isIOS() {
        return /iphone|ipad|ipod/i.test(
            navigator.userAgent
        );
    }

    function isStandalone() {
        return (
            window.matchMedia &&
            window.matchMedia(
                "(display-mode: standalone)"
            ).matches
        ) ||
            window.navigator.standalone === true;
    }

    function hideInstallBanner() {
        const banner =
            $("installBanner");

        if (banner) {
            banner.classList.remove(
                "show"
            );
        }
    }

    function showInstallBanner() {
        const banner =
            $("installBanner");

        if (!banner) {
            return;
        }

        if (isStandalone()) {
            hideInstallBanner();
            return;
        }

        banner.classList.add(
            "show"
        );
    }

    function setupInstallPrompt() {

        window.addEventListener(
            "beforeinstallprompt",
            function (event) {
                event.preventDefault();

                deferredInstallPrompt =
                    event;

                showInstallBanner();
            }
        );

        const installButton =
            $("installButton");

        if (installButton) {
            installButton.addEventListener(
                "click",
                async function () {

                    /*
                     * Android / Chrome / Edge
                     */
                    if (
                        deferredInstallPrompt
                    ) {
                        deferredInstallPrompt
                            .prompt();

                        const result =
                            await deferredInstallPrompt
                                .userChoice;

                        console.log(
                            "Install result:",
                            result.outcome
                        );

                        deferredInstallPrompt =
                            null;

                        hideInstallBanner();

                        return;
                    }

                    /*
                     * iPhone / iPad
                     */
                    if (isIOS()) {
                        showIOSInstallInstructions();
                        return;
                    }

                    showMessage(
                        "افتح قائمة المتصفح ثم اختر إضافة إلى الشاشة الرئيسية"
                    );
                }
            );
        }

        window.addEventListener(
            "appinstalled",
            function () {
                deferredInstallPrompt =
                    null;

                hideInstallBanner();

                showMessage(
                    "تم تثبيت أمير مواقيت بنجاح ✓",
                    "success"
                );
            }
        );

        /*
         * إذا كان المستخدم على iPhone
         * وليس التطبيق مثبتًا.
         */
        if (
            isIOS() &&
            !isStandalone()
        ) {
            setTimeout(
                showInstallBanner,
                1500
            );
        }
    }

    function showIOSInstallInstructions() {
        const message =
            "على iPhone أو iPad: اضغط زر المشاركة في Safari ثم اختر «إضافة إلى الشاشة الرئيسية».";

        showMessage(
            message
        );
    }

    /* ---------------------------------------------------------
       Theme
    --------------------------------------------------------- */

    function applyInitialTheme() {
        if (
            window.AmirSettings &&
            typeof window.AmirSettings.getTheme ===
                "function" &&
            typeof window.AmirSettings.applyTheme ===
                "function"
        ) {
            const theme =
                window.AmirSettings.getTheme();

            window.AmirSettings.applyTheme(
                theme
            );

            return;
        }

        const saved =
            localStorage.getItem(
                "amirTheme"
            ) || "auto";

        let theme =
            saved;

        if (theme === "auto") {
            theme =
                window.matchMedia &&
                window.matchMedia(
                    "(prefers-color-scheme: dark)"
                ).matches
                    ? "dark"
                    : "light";
        }

        document.documentElement.setAttribute(
            "data-theme",
            theme
        );
    }

    /* ---------------------------------------------------------
       Live clock
    --------------------------------------------------------- */

    function updateClock() {
        const element =
            $("liveClock");

        if (!element) {
            return;
        }

        const now =
            new Date();

        const hours =
            String(
                now.getHours()
            ).padStart(2, "0");

        const minutes =
            String(
                now.getMinutes()
            ).padStart(2, "0");

        const seconds =
            String(
                now.getSeconds()
            ).padStart(2, "0");

        element.textContent =
            `${hours}:${minutes}:${seconds}`;
    }

    function startClock() {
        updateClock();

        setInterval(
            updateClock,
            1000
        );
    }

    /* ---------------------------------------------------------
       Quick actions
    --------------------------------------------------------- */

    function bindQuickActions() {

        const locationButton =
            $("locationButton");

        if (locationButton) {
            locationButton.addEventListener(
                "click",
                function () {

                    if (
                        !navigator.geolocation
                    ) {
                        showMessage(
                            "الموقع الجغرافي غير مدعوم",
                            "error"
                        );

                        return;
                    }

                    showMessage(
                        "جارٍ محاولة تحديد موقعك..."
                    );

                    navigator.geolocation.getCurrentPosition(
                        function (position) {

                            const latitude =
                                position.coords.latitude;

                            const longitude =
                                position.coords.longitude;

                            /*
                             * لا نغير المدينة تلقائيًا
                             * في هذه المرحلة، بل نعرض
                             * الإحداثيات للمستخدم.
                             */
                            showMessage(
                                "تم تحديد موقعك بنجاح ✓",
                                "success"
                            );

                            console.log(
                                "User location:",
                                latitude,
                                longitude
                            );
                        },
                        function (error) {
                            console.warn(
                                "Geolocation error:",
                                error
                            );

                            showMessage(
                                "تعذر تحديد موقعك. تأكد من السماح بالموقع.",
                                "error"
                            );
                        },
                        {
                            enableHighAccuracy:
                                true,
                            timeout: 10000,
                            maximumAge:
                                300000
                        }
                    );
                }
            );
        }

        const qiblaButton =
            $("qiblaQuickButton");

        if (qiblaButton) {
            qiblaButton.addEventListener(
                "click",
                function () {
                    openSection(
                        "qibla"
                    );
                }
            );
        }

        const adhanButton =
            $("adhanTestButton");

        if (adhanButton) {
            adhanButton.addEventListener(
                "click",
                function () {
                    if (
                        window.AmirAdhan &&
                        typeof window.AmirAdhan.test ===
                            "function"
                    ) {
                        window.AmirAdhan.test();
                    }
                }
            );
        }
    }

    /* ---------------------------------------------------------
       App buttons feedback
    --------------------------------------------------------- */

    function bindButtonFeedback() {
        document
            .querySelectorAll(
                "button"
            )
            .forEach(button => {

                button.addEventListener(
                    "pointerdown",
                    function () {
                        this.classList.add(
                            "pressed"
                        );
                    }
                );

                button.addEventListener(
                    "pointerup",
                    function () {
                        this.classList.remove(
                            "pressed"
                        );
                    }
                );

                button.addEventListener(
                    "pointercancel",
                    function () {
                        this.classList.remove(
                            "pressed"
                        );
                    }
                );

                button.addEventListener(
                    "pointerleave",
                    function () {
                        this.classList.remove(
                            "pressed"
                        );
                    }
                );
            });
    }

    /* ---------------------------------------------------------
       App version
    --------------------------------------------------------- */

    function showVersion() {
        document
            .querySelectorAll(
                "[data-app-version]"
            )
            .forEach(element => {
                element.textContent =
                    APP_VERSION;
            });
    }

    /* ---------------------------------------------------------
       Visibility refresh
    --------------------------------------------------------- */

    function bindVisibilityRefresh() {
        document.addEventListener(
            "visibilitychange",
            function () {

                if (
                    document.visibilityState !==
                    "visible"
                ) {
                    return;
                }

                /*
                 * تحديث المواقيت عند العودة
                 * إلى التطبيق.
                 */
                if (
                    window.AmirPrayer &&
                    typeof window.AmirPrayer.load ===
                        "function"
                ) {
                    window.AmirPrayer.load();
                }

                /*
                 * إعادة جدولة الأذان.
                 */
                if (
                    window.AmirAdhan &&
                    typeof window.AmirAdhan.refresh ===
                        "function"
                ) {
                    window.AmirAdhan.refresh();
                }

                /*
                 * إعادة تحديث الثيم.
                 */
                if (
                    window.AmirSettings &&
                    typeof window.AmirSettings.getTheme ===
                        "function" &&
                    typeof window.AmirSettings.applyTheme ===
                        "function"
                ) {
                    window.AmirSettings.applyTheme(
                        window.AmirSettings.getTheme()
                    );
                }
            }
        );
    }

    /* ---------------------------------------------------------
       Keyboard shortcuts
    --------------------------------------------------------- */

    function bindKeyboardShortcuts() {

        document.addEventListener(
            "keydown",
            function (event) {

                /*
                 * لا نستخدم الاختصارات أثناء الكتابة.
                 */
                const tag =
                    document.activeElement &&
                    document.activeElement.tagName;

                if (
                    tag === "INPUT" ||
                    tag === "TEXTAREA" ||
                    tag === "SELECT"
                ) {
                    return;
                }

                /*
                 * H = الرئيسية
                 */
                if (
                    event.key.toLowerCase() ===
                    "h"
                ) {
                    openSection(
                        "home"
                    );
                }

                /*
                 * Q = القرآن
                 */
                if (
                    event.key.toLowerCase() ===
                    "q"
                ) {
                    openSection(
                        "quran"
                    );
                }

                /*
                 * A = الأذكار
                 */
                if (
                    event.key.toLowerCase() ===
                    "a"
                ) {
                    openSection(
                        "azkar"
                    );
                }

                /*
                 * K = القبلة
                 */
                if (
                    event.key.toLowerCase() ===
                    "k"
                ) {
                    openSection(
                        "qibla"
                    );
                }

                /*
                 * S = الإعدادات
                 */
                if (
                    event.key.toLowerCase() ===
                    "s"
                ) {
                    openSection(
                        "settings"
                    );
                }
            }
        );
    }

    /* ---------------------------------------------------------
       Initialize application
    --------------------------------------------------------- */

    async function init() {

        console.log(
            "Amir Mawaqit V2 starting..."
        );

        /*
         * المظهر أولاً حتى لا يظهر التطبيق
         * بثوانٍ بلون مختلف.
         */
        applyInitialTheme();

        /*
         * التنقل.
         */
        bindNavigation();

        /*
         * حالة الإنترنت.
         */
        bindOnlineStatus();

        /*
         * الأزرار السريعة.
         */
        bindQuickActions();

        /*
         * تأثيرات الأزرار.
         */
        bindButtonFeedback();

        /*
         * الساعة.
         */
        startClock();

        /*
         * تحديث عند العودة.
         */
        bindVisibilityRefresh();

        /*
         * اختصارات لوحة المفاتيح.
         */
        bindKeyboardShortcuts();

        /*
         * الإصدار.
         */
        showVersion();

        /*
         * PWA.
         */
        setupInstallPrompt();

        /*
         * Service Worker.
         */
        await registerServiceWorker();

        /*
         * نبدأ دائمًا من الصفحة الرئيسية.
         */
        openSection(
            "home"
        );

        console.log(
            "Amir Mawaqit V2 ready."
        );
    }

    /* ---------------------------------------------------------
       Public API
    --------------------------------------------------------- */

    window.AmirApp = {
        version:
            APP_VERSION,

        openSection,

        showMessage,

        updateOnlineStatus,

        showInstallBanner,

        hideInstallBanner,

        isIOS,

        isStandalone,

        registerServiceWorker
    };

    /* ---------------------------------------------------------
       Start
    --------------------------------------------------------- */

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            init
        );
    } else {
        init();
    }

})();
