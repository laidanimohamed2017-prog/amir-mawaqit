/* =========================================================
   أمير مواقيت V2
   Settings Module
   الإعدادات العامة
   ========================================================= */

(function () {
    "use strict";

    const CITY_NAMES = {
        algiers: "الجزائر العاصمة",
        oran: "وهران",
        constantine: "قسنطينة",
        annaba: "عنابة",
        blida: "البليدة",
        setif: "سطيف",
        tlemcen: "تلمسان",
        ain_oussera: "عين وسارة"
    };

    const DEFAULTS = {
        city: "ain_oussera",
        theme: "auto",
        calculationMethod: "19",
        madhhab: "0",
        adhanEnabled: true,
        adhanTiming: "at",
        adhanSound: true,
        adhanVolume: 80,
        notificationsEnabled: false
    };

    /* ---------------------------------------------------------
       Helpers
    --------------------------------------------------------- */

    function $(id) {
        return document.getElementById(id);
    }

    function showMessage(message, type = "info") {
        const toast = $("amirToast");

        if (!toast) {
            return;
        }

        toast.textContent = message;
        toast.className = "amir-toast show";

        if (type === "success") {
            toast.classList.add("success");
        }

        if (type === "error") {
            toast.classList.add("error");
        }

        clearTimeout(showMessage.timer);

        showMessage.timer = setTimeout(() => {
            toast.classList.remove(
                "show",
                "success",
                "error"
            );
        }, 3000);
    }

    function storageGet(key, fallback = null) {
        try {
            if (
                window.AmirStorage &&
                typeof window.AmirStorage.get === "function"
            ) {
                const value =
                    window.AmirStorage.get(key);

                return value === null ||
                    value === undefined
                    ? fallback
                    : value;
            }
        } catch (error) {
            console.warn(
                "Storage get error:",
                error
            );
        }

        try {
            const value =
                localStorage.getItem(key);

            if (value === null) {
                return fallback;
            }

            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        } catch {
            return fallback;
        }
    }

    function storageSet(key, value) {
        try {
            if (
                window.AmirStorage &&
                typeof window.AmirStorage.set === "function"
            ) {
                window.AmirStorage.set(
                    key,
                    value
                );

                return;
            }
        } catch (error) {
            console.warn(
                "Storage set error:",
                error
            );
        }

        try {
            localStorage.setItem(
                key,
                JSON.stringify(value)
            );
        } catch (error) {
            console.warn(
                "LocalStorage write error:",
                error
            );
        }
    }

    /* ---------------------------------------------------------
       City
    --------------------------------------------------------- */

    function getCity() {
        try {
            if (
                window.AmirStorage &&
                typeof window.AmirStorage.getCity ===
                    "function"
            ) {
                return (
                    window.AmirStorage.getCity() ||
                    DEFAULTS.city
                );
            }
        } catch {
            // fallback
        }

        return (
            storageGet(
                "amirCity",
                DEFAULTS.city
            ) || DEFAULTS.city
        );
    }

    function setCity(city) {
        if (!city) {
            return;
        }

        try {
            if (
                window.AmirStorage &&
                typeof window.AmirStorage.setCity ===
                    "function"
            ) {
                window.AmirStorage.setCity(
                    city
                );
            } else {
                storageSet(
                    "amirCity",
                    city
                );
            }
        } catch {
            storageSet(
                "amirCity",
                city
            );
        }

        const select =
            $("citySelect");

        if (
            select &&
            select.value !== city
        ) {
            select.value = city;
        }

        /*
         * إعلام بقية التطبيق بتغير المدينة.
         */
        window.dispatchEvent(
            new CustomEvent(
                "amirCityChanged",
                {
                    detail: {
                        city
                    }
                }
            )
        );

        showMessage(
            "تم تغيير المدينة إلى " +
                (CITY_NAMES[city] ||
                    city),
            "success"
        );
    }

    function populateCities() {
        const select =
            $("citySelect");

        if (!select) {
            return;
        }

        /*
         * لا نضيف المدن إذا كانت موجودة بالفعل.
         */
        if (
            select.options.length === 0
        ) {
            Object.keys(
                CITY_NAMES
            ).forEach(city => {
                const option =
                    document.createElement(
                        "option"
                    );

                option.value = city;
                option.textContent =
                    CITY_NAMES[city];

                select.appendChild(
                    option
                );
            });
        }

        const current =
            getCity();

        select.value = current;

        if (
            select.value !== current
        ) {
            select.selectedIndex = 0;
        }
    }

    /* ---------------------------------------------------------
       Theme
    --------------------------------------------------------- */

    function getTheme() {
        return (
            storageGet(
                "amirTheme",
                DEFAULTS.theme
            ) || DEFAULTS.theme
        );
    }

    function saveTheme(theme) {
        storageSet(
            "amirTheme",
            theme
        );
    }

    function getSystemTheme() {
        if (
            window.matchMedia &&
            window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches
        ) {
            return "dark";
        }

        return "light";
    }

    function applyTheme(theme) {
        if (!theme) {
            theme = DEFAULTS.theme;
        }

        let actualTheme = theme;

        if (theme === "auto") {
            actualTheme =
                getSystemTheme();
        }

        document.documentElement.setAttribute(
            "data-theme",
            actualTheme
        );

        document.body.classList.toggle(
            "dark-mode",
            actualTheme === "dark"
        );

        document.body.classList.toggle(
            "light-mode",
            actualTheme === "light"
        );

        const darkMode =
            $("darkMode");

        if (darkMode) {
            darkMode.checked =
                actualTheme === "dark";
        }

        const themeSelect =
            $("themeSelect");

        if (
            themeSelect &&
            themeSelect.value !== theme
        ) {
            themeSelect.value =
                theme;
        }

        document
            .querySelectorAll(
                "[data-theme-choice]"
            )
            .forEach(button => {
                button.classList.toggle(
                    "active",
                    button.getAttribute(
                        "data-theme-choice"
                    ) === theme
                );
            });
    }

    function setTheme(theme) {
        if (
            ![
                "light",
                "dark",
                "auto"
            ].includes(theme)
        ) {
            theme = "auto";
        }

        saveTheme(theme);
        applyTheme(theme);

        showMessage(
            "تم حفظ المظهر",
            "success"
        );
    }

    function bindSystemTheme() {
        if (!window.matchMedia) {
            return;
        }

        const media =
            window.matchMedia(
                "(prefers-color-scheme: dark)"
            );

        const handler = () => {
            if (
                getTheme() === "auto"
            ) {
                applyTheme("auto");
            }
        };

        if (
            typeof media.addEventListener ===
            "function"
        ) {
            media.addEventListener(
                "change",
                handler
            );
        } else if (
            typeof media.addListener ===
            "function"
        ) {
            media.addListener(
                handler
            );
        }
    }

    /* ---------------------------------------------------------
       Prayer settings
    --------------------------------------------------------- */

    function getPrayerSettings() {
        let settings =
            storageGet(
                "amirPrayerSettings",
                {}
            );

        if (
            !settings ||
            typeof settings !== "object"
        ) {
            settings = {};
        }

        return {
            calculationMethod:
                String(
                    settings.calculationMethod ??
                        DEFAULTS.calculationMethod
                ),

            madhhab:
                String(
                    settings.madhhab ??
                        DEFAULTS.madhhab
                ),

            adjustments:
                settings.adjustments ||
                {}
        };
    }

    function savePrayerSettings(
        settings
    ) {
        const current =
            getPrayerSettings();

        const merged = {
            ...current,
            ...settings
        };

        storageSet(
            "amirPrayerSettings",
            merged
        );

        window.dispatchEvent(
            new CustomEvent(
                "amirPrayerSettingsChanged",
                {
                    detail: merged
                }
            )
        );
    }

    /* ---------------------------------------------------------
       Adhan settings
    --------------------------------------------------------- */

    function getAdhanSettings() {
        try {
            if (
                window.AmirStorage &&
                typeof window.AmirStorage.getAdhanSettings ===
                    "function"
            ) {
                const value =
                    window.AmirStorage.getAdhanSettings();

                if (value) {
                    return {
                        enabled:
                            value.enabled ??
                            DEFAULTS.adhanEnabled,

                        timing:
                            value.timing ??
                            DEFAULTS.adhanTiming,

                        sound:
                            value.sound ??
                            DEFAULTS.adhanSound,

                        volume:
                            Number(
                                value.volume ??
                                    DEFAULTS.adhanVolume
                            )
                    };
                }
            }
        } catch {
            // fallback
        }

        return {
            enabled:
                Boolean(
                    storageGet(
                        "amirAdhanEnabled",
                        DEFAULTS.adhanEnabled
                    )
                ),

            timing:
                storageGet(
                    "amirAdhanTiming",
                    DEFAULTS.adhanTiming
                ),

            sound:
                Boolean(
                    storageGet(
                        "amirAdhanSound",
                        DEFAULTS.adhanSound
                    )
                ),

            volume:
                Number(
                    storageGet(
                        "amirAdhanVolume",
                        DEFAULTS.adhanVolume
                    )
                )
        };
    }

    function saveAdhanSettings(
        settings
    ) {
        const current =
            getAdhanSettings();

        const merged = {
            ...current,
            ...settings
        };

        try {
            if (
                window.AmirStorage &&
                typeof window.AmirStorage.setAdhanSettings ===
                    "function"
            ) {
                window.AmirStorage.setAdhanSettings(
                    merged
                );
            } else {
                storageSet(
                    "amirAdhanEnabled",
                    merged.enabled
                );

                storageSet(
                    "amirAdhanTiming",
                    merged.timing
                );

                storageSet(
                    "amirAdhanSound",
                    merged.sound
                );

                storageSet(
                    "amirAdhanVolume",
                    merged.volume
                );
            }
        } catch {
            storageSet(
                "amirAdhanEnabled",
                merged.enabled
            );

            storageSet(
                "amirAdhanTiming",
                merged.timing
            );

            storageSet(
                "amirAdhanSound",
                merged.sound
            );

            storageSet(
                "amirAdhanVolume",
                merged.volume
            );
        }

        if (
            window.AmirAdhan &&
            typeof window.AmirAdhan.reschedule ===
                "function"
        ) {
            window.AmirAdhan.reschedule();
        }

        window.dispatchEvent(
            new CustomEvent(
                "amirAdhanSettingsChanged",
                {
                    detail: merged
                }
            )
        );
    }

    /* ---------------------------------------------------------
       Notifications
    --------------------------------------------------------- */

    function getNotificationsEnabled() {
        return Boolean(
            storageGet(
                "amirNotifications",
                DEFAULTS.notificationsEnabled
            )
        );
    }

    async function enableNotifications() {
        if (
            !("Notification" in window)
        ) {
            showMessage(
                "الإشعارات غير مدعومة في هذا المتصفح",
                "error"
            );

            return false;
        }

        try {
            let permission =
                Notification.permission;

            if (
                permission !== "granted"
            ) {
                permission =
                    await Notification.requestPermission();
            }

            if (
                permission !== "granted"
            ) {
                storageSet(
                    "amirNotifications",
                    false
                );

                updateNotificationUI(
                    false
                );

                showMessage(
                    "لم يتم السماح بالإشعارات",
                    "error"
                );

                return false;
            }

            storageSet(
                "amirNotifications",
                true
            );

            updateNotificationUI(
                true
            );

            showMessage(
                "تم تفعيل الإشعارات",
                "success"
            );

            return true;

        } catch (error) {
            console.error(
                "Notification error:",
                error
            );

            showMessage(
                "تعذر تفعيل الإشعارات",
                "error"
            );

            return false;
        }
    }

    function updateNotificationUI(
        enabled
    ) {
        const checkbox =
            $("notificationsEnabled");

        if (checkbox) {
            checkbox.checked =
                Boolean(enabled);
        }

        const button =
            $("enableNotifications");

        if (button) {
            button.textContent =
                enabled
                    ? "الإشعارات مفعلة ✓"
                    : "تفعيل الإشعارات";
        }
    }

    /* ---------------------------------------------------------
       Load settings into UI
    --------------------------------------------------------- */

    function loadUI() {
        populateCities();

        const city =
            getCity();

        if ($("citySelect")) {
            $("citySelect").value =
                city;
        }

        const prayer =
            getPrayerSettings();

        if ($("calculationMethod")) {
            $("calculationMethod").value =
                prayer.calculationMethod;
        }

        if ($("madhhab")) {
            $("madhhab").value =
                prayer.madhhab;
        }

        const adhan =
            getAdhanSettings();

        if ($("adhanEnabled")) {
            $("adhanEnabled").checked =
                Boolean(
                    adhan.enabled
                );
        }

        if ($("adhanTiming")) {
            $("adhanTiming").value =
                adhan.timing;
        }

        if ($("adhanSound")) {
            $("adhanSound").checked =
                Boolean(
                    adhan.sound
                );
        }

        if ($("adhanVolume")) {
            const volume =
                Math.max(
                    0,
                    Math.min(
                        100,
                        Number(
                            adhan.volume
                        ) || 80
                    )
                );

            $("adhanVolume").value =
                volume;

            updateVolumeLabel(
                volume
            );
        }

        const notifications =
            getNotificationsEnabled();

        updateNotificationUI(
            notifications
        );

        const theme =
            getTheme();

        applyTheme(theme);
    }

    /* ---------------------------------------------------------
       Volume
    --------------------------------------------------------- */

    function updateVolumeLabel(
        value
    ) {
        const labels =
            document.querySelectorAll(
                "[data-volume-value]"
            );

        labels.forEach(label => {
            label.textContent =
                Number(value) + "%";
        });
    }

    /* ---------------------------------------------------------
       Event binding
    --------------------------------------------------------- */

    function bindEvents() {

        /* المدينة */
        const citySelect =
            $("citySelect");

        if (citySelect) {
            citySelect.addEventListener(
                "change",
                function () {
                    setCity(
                        this.value
                    );

                    /*
                     * تحديث مواقيت الصلاة فوراً.
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
        }

        /* طريقة الحساب */
        const calculationMethod =
            $("calculationMethod");

        if (calculationMethod) {
            calculationMethod.addEventListener(
                "change",
                function () {
                    savePrayerSettings({
                        calculationMethod:
                            this.value
                    });

                    if (
                        window.AmirPrayer &&
                        typeof window.AmirPrayer.load ===
                            "function"
                    ) {
                        window.AmirPrayer.load();
                    }

                    showMessage(
                        "تم تحديث طريقة الحساب",
                        "success"
                    );
                }
            );
        }

        /* المذهب */
        const madhhab =
            $("madhhab");

        if (madhhab) {
            madhhab.addEventListener(
                "change",
                function () {
                    savePrayerSettings({
                        madhhab:
                            this.value
                    });

                    if (
                        window.AmirPrayer &&
                        typeof window.AmirPrayer.load ===
                            "function"
                    ) {
                        window.AmirPrayer.load();
                    }

                    showMessage(
                        "تم تحديث المذهب",
                        "success"
                    );
                }
            );
        }

        /* المظهر */
        const themeSelect =
            $("themeSelect");

        if (themeSelect) {
            themeSelect.addEventListener(
                "change",
                function () {
                    setTheme(
                        this.value
                    );
                }
            );
        }

        document
            .querySelectorAll(
                "[data-theme-choice]"
            )
            .forEach(button => {
                button.addEventListener(
                    "click",
                    function () {
                        setTheme(
                            this.getAttribute(
                                "data-theme-choice"
                            )
                        );
                    }
                );
            });

        /* الوضع الداكن */
        const darkMode =
            $("darkMode");

        if (darkMode) {
            darkMode.addEventListener(
                "change",
                function () {
                    setTheme(
                        this.checked
                            ? "dark"
                            : "light"
                    );
                }
            );
        }

        /* تشغيل الأذان */
        const adhanEnabled =
            $("adhanEnabled");

        if (adhanEnabled) {
            adhanEnabled.addEventListener(
                "change",
                function () {
                    saveAdhanSettings({
                        enabled:
                            this.checked
                    });

                    showMessage(
                        this.checked
                            ? "تم تشغيل الأذان"
                            : "تم إيقاف الأذان",
                        "success"
                    );
                }
            );
        }

        /* توقيت الأذان */
        const adhanTiming =
            $("adhanTiming");

        if (adhanTiming) {
            adhanTiming.addEventListener(
                "change",
                function () {
                    saveAdhanSettings({
                        timing:
                            this.value
                    });
                }
            );
        }

        /* صوت الأذان */
        const adhanSound =
            $("adhanSound");

        if (adhanSound) {
            adhanSound.addEventListener(
                "change",
                function () {
                    saveAdhanSettings({
                        sound:
                            this.checked
                    });
                }
            );
        }

        /* مستوى الصوت */
        const adhanVolume =
            $("adhanVolume");

        if (adhanVolume) {
            adhanVolume.addEventListener(
                "input",
                function () {
                    const volume =
                        Number(
                            this.value
                        );

                    updateVolumeLabel(
                        volume
                    );

                    if (
                        window.AmirAdhan &&
                        typeof window.AmirAdhan.setVolume ===
                            "function"
                    ) {
                        window.AmirAdhan.setVolume(
                            volume
                        );
                    }
                }
            );

            adhanVolume.addEventListener(
                "change",
                function () {
                    const volume =
                        Number(
                            this.value
                        );

                    saveAdhanSettings({
                        volume
                    });
                }
            );
        }

        /* اختبار الأذان */
        const testAdhan =
            $("testAdhan");

        if (testAdhan) {
            testAdhan.addEventListener(
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

        /* زر الأذان الرئيسي */
        const adhanTestButton =
            $("adhanTestButton");

        if (adhanTestButton) {
            adhanTestButton.addEventListener(
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

        /* إيقاف الأذان */
        const stopAdhan =
            $("stopAdhan");

        if (stopAdhan) {
            stopAdhan.addEventListener(
                "click",
                function () {
                    if (
                        window.AmirAdhan &&
                        typeof window.AmirAdhan.stop ===
                            "function"
                    ) {
                        window.AmirAdhan.stop();
                    }
                }
            );
        }

        /* الإشعارات */
        const notificationsEnabled =
            $("notificationsEnabled");

        if (notificationsEnabled) {
            notificationsEnabled.addEventListener(
                "change",
                async function () {
                    if (
                        this.checked
                    ) {
                        await enableNotifications();
                    } else {
                        storageSet(
                            "amirNotifications",
                            false
                        );

                        updateNotificationUI(
                            false
                        );

                        showMessage(
                            "تم إيقاف الإشعارات"
                        );
                    }
                }
            );
        }

        /* زر تفعيل الإشعارات */
        const enableNotificationsButton =
            $("enableNotifications");

        if (
            enableNotificationsButton
        ) {
            enableNotificationsButton.addEventListener(
                "click",
                async function () {
                    await enableNotifications();
                }
            );
        }

        /* تصدير الإعدادات */
        const exportSettings =
            $("exportSettings");

        if (exportSettings) {
            exportSettings.addEventListener(
                "click",
                function () {
                    exportAllSettings();
                }
            );
        }

        /* مسح بيانات التطبيق */
        const clearAppData =
            $("clearAppData");

        if (clearAppData) {
            clearAppData.addEventListener(
                "click",
                function () {
                    clearAllData();
                }
            );
        }

        /* تحديث تلقائي عند عودة التطبيق */
        document.addEventListener(
            "visibilitychange",
            function () {
                if (
                    document.visibilityState ===
                    "visible"
                ) {
                    loadUI();
                }
            }
        );
    }

    /* ---------------------------------------------------------
       Export
    --------------------------------------------------------- */

    function exportAllSettings() {
        let data = {};

        try {
            if (
                window.AmirStorage &&
                typeof window.AmirStorage.exportAll ===
                    "function"
            ) {
                data =
                    window.AmirStorage.exportAll();
            } else {
                data = {
                    city: getCity(),
                    theme: getTheme(),
                    prayer:
                        getPrayerSettings(),
                    adhan:
                        getAdhanSettings(),
                    notifications:
                        getNotificationsEnabled(),
                    azkarProgress:
                        storageGet(
                            "amirAzkarProgress",
                            {}
                        ),
                    azkarFavorites:
                        storageGet(
                            "amirAzkarFavorites",
                            []
                        ),
                    tasbih:
                        storageGet(
                            "amirTasbihCount",
                            0
                        )
                };
            }
        } catch (error) {
            console.error(
                "Export error:",
                error
            );

            showMessage(
                "تعذر تصدير الإعدادات",
                "error"
            );

            return;
        }

        const payload = {
            app: "Amir Mawaqit",
            version: "2.0.0",
            exportedAt:
                new Date().toISOString(),
            data
        };

        const blob =
            new Blob(
                [
                    JSON.stringify(
                        payload,
                        null,
                        2
                    )
                ],
                {
                    type:
                        "application/json"
                }
            );

        const url =
            URL.createObjectURL(
                blob
            );

        const link =
            document.createElement(
                "a"
            );

        link.href = url;

        link.download =
            "amir-mawaqit-settings.json";

        document.body.appendChild(
            link
        );

        link.click();

        link.remove();

        setTimeout(() => {
            URL.revokeObjectURL(
                url
            );
        }, 1000);

        showMessage(
            "تم تصدير الإعدادات",
            "success"
        );
    }

    /* ---------------------------------------------------------
       Clear data
    --------------------------------------------------------- */

    function clearAllData() {
        const confirmed =
            window.confirm(
                "هل أنت متأكد من حذف إعدادات وتقدم أمير مواقيت؟\n\nسيتم حذف المدينة والمظهر وإعدادات الأذان وتقدم الأذكار والمفضلة."
            );

        if (!confirmed) {
            return;
        }

        try {
            if (
                window.AmirStorage &&
                typeof window.AmirStorage.clearAll ===
                    "function"
            ) {
                window.AmirStorage.clearAll();
            } else if (
                window.AmirStorage &&
                typeof window.AmirStorage.clear ===
                    "function"
            ) {
                window.AmirStorage.clear();
            }
        } catch (error) {
            console.warn(
                "Storage clear error:",
                error
            );
        }

        /*
         * حذف مفاتيح V2 التي نستخدمها مباشرة.
         */
        const keys = [
            "amirCity",
            "amirTheme",
            "amirAdhanEnabled",
            "amirAdhanTiming",
            "amirAdhanSound",
            "amirAdhanVolume",
            "amirNotifications",
            "amirPrayerSettings",
            "amirMawaqitCache",
            "amirAzkarProgress",
            "amirAzkarFavorites",
            "amirTasbihCount",
            "amirLastRead",
            "amirFavorites",
            "amirQiblaSettings"
        ];

        keys.forEach(key => {
            try {
                localStorage.removeItem(
                    key
                );
            } catch {
                // ignore
            }
        });

        showMessage(
            "تم حذف بيانات التطبيق",
            "success"
        );

        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }

    /* ---------------------------------------------------------
       Public API
    --------------------------------------------------------- */

    window.AmirSettings = {

        defaults: DEFAULTS,

        cityNames: CITY_NAMES,

        getCity,

        setCity,

        getTheme,

        setTheme,

        applyTheme,

        getPrayerSettings,

        savePrayerSettings,

        getAdhanSettings,

        saveAdhanSettings,

        getNotificationsEnabled,

        enableNotifications,

        loadUI,

        exportAllSettings,

        clearAllData
    };

    /* ---------------------------------------------------------
       Initialization
    --------------------------------------------------------- */

    document.addEventListener(
        "DOMContentLoaded",
        function () {
            loadUI();
            bindEvents();
            bindSystemTheme();

            /*
             * مزامنة مستوى صوت الأذان.
             */
            const adhan =
                getAdhanSettings();

            if (
                window.AmirAdhan &&
                typeof window.AmirAdhan.setVolume ===
                    "function"
            ) {
                window.AmirAdhan.setVolume(
                    adhan.volume
                );
            }
        }
    );

})();
