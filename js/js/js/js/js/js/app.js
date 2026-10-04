/* =========================================================
   أمير مواقيت V2
   app.js
   الملف الرئيسي لتشغيل وربط التطبيق
   ========================================================= */

(function () {
    "use strict";

    const APP_VERSION = "2.0.0";

    let deferredInstallPrompt = null;

    /* =========================================================
       أدوات عامة
       ========================================================= */

    function $(selector) {
        return document.querySelector(selector);
    }

    function $$(selector) {
        return document.querySelectorAll(selector);
    }

    function showToast(message) {
        let toast = $("#amirToast");

        if (!toast) {
            toast = document.createElement("div");
            toast.id = "amirToast";
            toast.className = "amir-toast";
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(toast._timer);

        toast._timer = setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    }

    /* =========================================================
       التنقل بين صفحات التطبيق
       ========================================================= */

    function setupNavigation() {
        const navButtons = $$("[data-section]");

        navButtons.forEach(button => {
            button.addEventListener("click", function () {
                const sectionName = this.dataset.section;

                if (!sectionName) return;

                openSection(sectionName);
            });
        });

        // أزرار العودة أو الروابط الداخلية
        $$("[data-go-section]").forEach(button => {
            button.addEventListener("click", function () {
                const sectionName = this.dataset.goSection;

                if (sectionName) {
                    openSection(sectionName);
                }
            });
        });
    }

    function openSection(sectionName) {
        const sections = $$(".app-section");

        let targetFound = false;

        sections.forEach(section => {
            const id = section.id;

            if (id === sectionName || id === `section-${sectionName}`) {
                section.classList.add("active");
                section.removeAttribute("hidden");
                targetFound = true;
            } else {
                section.classList.remove("active");
                section.setAttribute("hidden", "");
            }
        });

        // إذا كانت الصفحة تستخدم IDs مباشرة
        if (!targetFound) {
            const target = document.getElementById(sectionName);

            if (target) {
                sections.forEach(section => {
                    section.classList.remove("active");
                    section.setAttribute("hidden", "");
                });

                target.classList.add("active");
                target.removeAttribute("hidden");
            }
        }

        // تحديث القائمة السفلية
        $$("[data-section]").forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.section === sectionName
            );
        });

        // تحديث عنوان الصفحة
        updatePageTitle(sectionName);

        // تحديث بعض الأقسام عند فتحها
        if (sectionName === "qibla" && window.AmirQibla) {
            try {
                window.AmirQibla.refresh();
            } catch (error) {
                console.warn("Qibla refresh:", error);
            }
        }

        if (sectionName === "azkar" && window.AmirAzkar) {
            try {
                window.AmirAzkar.render();
            } catch (error) {
                console.warn("Azkar render:", error);
            }
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    function updatePageTitle(sectionName) {
        const titles = {
            home: "أمير مواقيت",
            quran: "القرآن الكريم",
            azkar: "الأذكار",
            qibla: "القبلة",
            settings: "الإعدادات"
        };

        const title = titles[sectionName] || "أمير مواقيت";

        document.title = title;
    }

    /* =========================================================
       الحالة: متصل / غير متصل
       ========================================================= */

    function setupNetworkStatus() {
        const offlineBox = $("#offlineStatus");

        function updateStatus() {
            const online = navigator.onLine;

            document.documentElement.classList.toggle(
                "offline-mode",
                !online
            );

            if (offlineBox) {
                offlineBox.classList.toggle("show", !online);

                offlineBox.textContent = online
                    ? ""
                    : "أنت غير متصل بالإنترنت — سيتم استخدام البيانات المحفوظة";
            }

            if (online) {
                console.log("🌐 Online");
            } else {
                console.log("📴 Offline");
            }
        }

        window.addEventListener("online", updateStatus);
        window.addEventListener("offline", updateStatus);

        updateStatus();
    }

    /* =========================================================
       Service Worker
       ========================================================= */

    async function registerServiceWorker() {
        if (!("serviceWorker" in navigator)) {
            console.log("Service Worker غير مدعوم");
            return;
        }

        try {
            const registration =
                await navigator.serviceWorker.register("./sw.js");

            console.log(
                "✅ Service Worker registered:",
                registration.scope
            );

            registration.addEventListener("updatefound", () => {
                const newWorker = registration.installing;

                if (!newWorker) return;

                newWorker.addEventListener("statechange", () => {
                    if (
                        newWorker.state === "installed" &&
                        navigator.serviceWorker.controller
                    ) {
                        showToast("تم تجهيز تحديث جديد لأمير مواقيت");
                    }
                });
            });

        } catch (error) {
            console.error(
                "❌ Service Worker registration failed:",
                error
            );
        }
    }

    /* =========================================================
       تثبيت التطبيق PWA
       ========================================================= */

    function setupInstallPrompt() {

        const installButton = $("#installApp");
        const installBanner = $("#installBanner");
        const closeInstall = $("#closeInstall");

        window.addEventListener(
            "beforeinstallprompt",
            event => {
                event.preventDefault();

                deferredInstallPrompt = event;

                if (installBanner) {
                    installBanner.classList.add("show");
                }

                if (installButton) {
                    installButton.style.display = "inline-flex";
                }

                console.log("📲 PWA install available");
            }
        );

        if (installButton) {
            installButton.addEventListener("click", async () => {

                if (!deferredInstallPrompt) {
                    showToast(
                        "إذا لم يظهر التثبيت، افتح قائمة المتصفح واختر إضافة إلى الشاشة الرئيسية"
                    );
                    return;
                }

                deferredInstallPrompt.prompt();

                const result =
                    await deferredInstallPrompt.userChoice;

                console.log(
                    "Install result:",
                    result.outcome
                );

                deferredInstallPrompt = null;

                if (installBanner) {
                    installBanner.classList.remove("show");
                }
            });
        }

        if (closeInstall) {
            closeInstall.addEventListener("click", () => {

                if (installBanner) {
                    installBanner.classList.remove("show");
                }

                try {
                    if (window.AmirStorage) {
                        window.AmirStorage.setInstallDismissed(true);
                    }
                } catch (error) {
                    console.warn(error);
                }
            });
        }

        window.addEventListener("appinstalled", () => {

            console.log("✅ Amir Mawaqit installed");

            deferredInstallPrompt = null;

            if (installBanner) {
                installBanner.classList.remove("show");
            }

            showToast("تم تثبيت أمير مواقيت بنجاح");
        });
    }

    /* =========================================================
       التوافق مع iPhone / iPad
       ========================================================= */

    function detectAppleDevice() {

        const userAgent = navigator.userAgent || "";

        const isIOS =
            /iPhone|iPad|iPod/i.test(userAgent) ||
            (
                navigator.platform === "MacIntel" &&
                navigator.maxTouchPoints > 1
            );

        if (isIOS) {
            document.documentElement.classList.add("ios-device");

            console.log("🍎 Apple device detected");

            // إظهار تلميح التثبيت فقط إذا لم يكن التطبيق مثبتًا
            const standalone =
                window.navigator.standalone === true ||
                window.matchMedia("(display-mode: standalone)").matches;

            if (!standalone) {
                const iosHint = $("#iosInstallHint");

                if (iosHint) {
                    iosHint.style.display = "block";
                }
            }
        }
    }

    /* =========================================================
       الوضع المظلم
       ========================================================= */

    function setupTheme() {

        function applyTheme() {

            let theme = "light";

            try {
                if (window.AmirStorage) {
                    theme =
                        window.AmirStorage.getTheme() || "light";
                }
            } catch (error) {
                console.warn(error);
            }

            if (theme === "auto") {
                const dark =
                    window.matchMedia(
                        "(prefers-color-scheme: dark)"
                    ).matches;

                document.documentElement.classList.toggle(
                    "dark-mode",
                    dark
                );

            } else {

                document.documentElement.classList.toggle(
                    "dark-mode",
                    theme === "dark"
                );
            }
        }

        applyTheme();

        window.addEventListener(
            "amirThemeChanged",
            applyTheme
        );

        const media =
            window.matchMedia(
                "(prefers-color-scheme: dark)"
            );

        if (media.addEventListener) {
            media.addEventListener("change", applyTheme);
        }
    }

    /* =========================================================
       ساعة وتاريخ التطبيق
       ========================================================= */

    function updateClock() {

        const clock = $("#liveClock");

        if (!clock) return;

        const now = new Date();

        const time = now.toLocaleTimeString(
            "ar-DZ",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );

        clock.textContent = time;
    }

    function startClock() {

        updateClock();

        setInterval(
            updateClock,
            1000
        );
    }

    /* =========================================================
       أزرار الصفحة الرئيسية
       ========================================================= */

    function setupQuickActions() {

        $$("[data-action]").forEach(button => {

            button.addEventListener("click", function () {

                const action =
                    this.dataset.action;

                switch (action) {

                    case "qibla":
                        openSection("qibla");
                        break;

                    case "azkar":
                        openSection("azkar");
                        break;

                    case "quran":
                        openSection("quran");
                        break;

                    case "settings":
                        openSection("settings");
                        break;

                    case "refreshPrayer":

                        if (window.AmirPrayer) {
                            window.AmirPrayer.load({
                                force: true
                            });
                        }

                        showToast(
                            "جاري تحديث مواقيت الصلاة..."
                        );

                        break;

                    default:
                        console.log(
                            "Unknown action:",
                            action
                        );
                }
            });
        });
    }

    /* =========================================================
       تحديث مواقيت الصلاة عند العودة للتطبيق
       ========================================================= */

    function setupVisibilityRefresh() {

        document.addEventListener(
            "visibilitychange",
            () => {

                if (!document.hidden) {

                    if (window.AmirPrayer) {
                        try {
                            window.AmirPrayer.startCountdown();
                        } catch (error) {
                            console.warn(error);
                        }
                    }

                    if (window.AmirAdhan) {
                        try {
                            window.AmirAdhan.reschedule();
                        } catch (error) {
                            console.warn(error);
                        }
                    }
                }
            }
        );
    }

    /* =========================================================
       منع أخطاء الضغط المتكرر
       ========================================================= */

    function setupButtonFeedback() {

        document.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest("button");

                if (!button) return;

                button.classList.add("pressed");

                setTimeout(() => {
                    button.classList.remove("pressed");
                }, 150);
            }
        );
    }

    /* =========================================================
       معلومات التطبيق
       ========================================================= */

    function exposeAppInfo() {

        window.AmirApp = {

            version: APP_VERSION,

            openSection,

            showToast,

            refresh: function () {

                if (window.AmirPrayer) {
                    window.AmirPrayer.load({
                        force: true
                    });
                }

                if (window.AmirAdhan) {
                    window.AmirAdhan.reschedule();
                }

                showToast(
                    "تم تحديث التطبيق"
                );
            }

        };

        console.log(
            `✨ أمير مواقيت V${APP_VERSION}`
        );
    }

    /* =========================================================
       التشغيل الرئيسي
       ========================================================= */

    async function initApp() {

        console.log(
            "🚀 Starting Amir Mawaqit V2..."
        );

        detectAppleDevice();

        setupNavigation();

        setupQuickActions();

        setupNetworkStatus();

        setupInstallPrompt();

        setupTheme();

        setupVisibilityRefresh();

        setupButtonFeedback();

        startClock();

        exposeAppInfo();

        await registerServiceWorker();

        // الصفحة الرئيسية
        openSection("home");

        console.log(
            "✅ أمير مواقيت V2 جاهز"
        );
    }

    /* =========================================================
       بدء التطبيق
       ========================================================= */

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            initApp
        );

    } else {

        initApp();

    }

})();
