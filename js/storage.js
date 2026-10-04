/* =========================================================
   أمير مواقيت V2
   Storage Manager
   حفظ واسترجاع إعدادات التطبيق
   ========================================================= */

"use strict";


/* =========================================================
   STORAGE KEYS
   ========================================================= */

const AMIR_STORAGE = {

    CITY: "amirCity",

    THEME: "amirTheme",

    ADHAN_ENABLED: "amirAdhanEnabled",

    ADHAN_TIMING: "amirAdhanTiming",

    ADHAN_SOUND: "amirAdhanSound",

    NOTIFICATIONS: "amirNotifications",

    ADHAN_VOLUME: "amirAdhanVolume",

    PRAYER_SETTINGS: "amirPrayerSettings",

    PRAYER_CACHE: "amirMawaqitCache",

    ZIKR_1: "zikr1",

    ZIKR_2: "zikr2",

    ZIKR_3: "zikr3",

    LAST_READ: "amirLastRead",

    FAVORITES: "amirFavorites",

    QIBLA: "amirQiblaSettings",

    INSTALL_DISMISSED: "amirInstallDismissed",

    FIRST_RUN: "amirFirstRun"

};


/* =========================================================
   SAFE SET
   ========================================================= */

function amirSet(key, value) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

        return true;

    } catch (error) {

        console.error(
            "Amir Storage Set Error:",
            error
        );

        return false;

    }

}


/* =========================================================
   SAFE GET
   ========================================================= */

function amirGet(key, defaultValue = null) {

    try {

        const value =
            localStorage.getItem(key);


        if (value === null) {

            return defaultValue;

        }


        try {

            return JSON.parse(value);

        } catch {

            return value;

        }

    } catch (error) {

        console.error(
            "Amir Storage Get Error:",
            error
        );

        return defaultValue;

    }

}


/* =========================================================
   REMOVE
   ========================================================= */

function amirRemove(key) {

    try {

        localStorage.removeItem(key);

        return true;

    } catch (error) {

        console.error(
            "Amir Storage Remove Error:",
            error
        );

        return false;

    }

}


/* =========================================================
   CITY
   ========================================================= */

function getSavedCity() {

    return amirGet(
        AMIR_STORAGE.CITY,
        "ain_oussera"
    );

}


function saveCity(cityId) {

    return amirSet(
        AMIR_STORAGE.CITY,
        cityId
    );

}


/* =========================================================
   THEME
   ========================================================= */

function getSavedTheme() {

    return amirGet(
        AMIR_STORAGE.THEME,
        "light"
    );

}


function saveTheme(theme) {

    return amirSet(
        AMIR_STORAGE.THEME,
        theme
    );

}


/* =========================================================
   ADHAN
   ========================================================= */

function getAdhanSettings() {

    return {

        enabled:
            amirGet(
                AMIR_STORAGE.ADHAN_ENABLED,
                true
            ),

        timing:
            amirGet(
                AMIR_STORAGE.ADHAN_TIMING,
                "at"
            ),

        sound:
            amirGet(
                AMIR_STORAGE.ADHAN_SOUND,
                "adhan1"
            ),

        volume:
            amirGet(
                AMIR_STORAGE.ADHAN_VOLUME,
                1
            )

    };

}


function saveAdhanSettings(settings) {

    if (!settings) {

        return false;

    }


    if (
        typeof settings.enabled !==
        "undefined"
    ) {

        amirSet(
            AMIR_STORAGE.ADHAN_ENABLED,
            Boolean(settings.enabled)
        );

    }


    if (
        typeof settings.timing !==
        "undefined"
    ) {

        amirSet(
            AMIR_STORAGE.ADHAN_TIMING,
            settings.timing
        );

    }


    if (
        typeof settings.sound !==
        "undefined"
    ) {

        amirSet(
            AMIR_STORAGE.ADHAN_SOUND,
            settings.sound
        );

    }


    if (
        typeof settings.volume !==
        "undefined"
    ) {

        let volume =
            Number(settings.volume);


        if (
            Number.isNaN(volume)
        ) {

            volume = 1;

        }


        volume =
            Math.max(
                0,
                Math.min(
                    1,
                    volume
                )
            );


        amirSet(
            AMIR_STORAGE.ADHAN_VOLUME,
            volume
        );

    }


    return true;

}


/* =========================================================
   NOTIFICATIONS
   ========================================================= */

function getNotificationsEnabled() {

    return amirGet(
        AMIR_STORAGE.NOTIFICATIONS,
        false
    );

}


function saveNotificationsEnabled(enabled) {

    return amirSet(
        AMIR_STORAGE.NOTIFICATIONS,
        Boolean(enabled)
    );

}


/* =========================================================
   PRAYER CACHE
   ========================================================= */

function savePrayerCache(data) {

    if (!data) {

        return false;

    }


    return amirSet(
        AMIR_STORAGE.PRAYER_CACHE,
        {
            savedAt:
                Date.now(),

            data:
                data
        }
    );

}


function getPrayerCache() {

    return amirGet(
        AMIR_STORAGE.PRAYER_CACHE,
        null
    );

}


/* =========================================================
   CACHE VALIDITY
   ========================================================= */

function getPrayerCacheData() {

    const cache =
        getPrayerCache();


    if (
        !cache ||
        !cache.data
    ) {

        return null;

    }


    return cache.data;

}


/* =========================================================
   ZIKR
   ========================================================= */

function getZikrCount(number) {

    const key =
        "zikr" + number;


    const value =
        amirGet(
            key,
            0
        );


    const count =
        Number(value);


    if (
        Number.isNaN(count)
    ) {

        return 0;

    }


    return Math.max(
        0,
        count
    );

}


function saveZikrCount(
    number,
    count
) {

    if (
        number !== 1 &&
        number !== 2 &&
        number !== 3
    ) {

        return false;

    }


    count =
        Number(count);


    if (
        Number.isNaN(count)
    ) {

        count = 0;

    }


    count =
        Math.max(
            0,
            Math.floor(count)
        );


    return amirSet(
        "zikr" + number,
        count
    );

}


function incrementZikr(number) {

    const current =
        getZikrCount(number);


    const next =
        current + 1;


    saveZikrCount(
        number,
        next
    );


    return next;

}


/* =========================================================
   QURAN
   ========================================================= */

function getLastRead() {

    return amirGet(
        AMIR_STORAGE.LAST_READ,
        null
    );

}


function saveLastRead(data) {

    return amirSet(
        AMIR_STORAGE.LAST_READ,
        data
    );

}


/* =========================================================
   FAVORITES
   ========================================================= */

function getFavorites() {

    return amirGet(
        AMIR_STORAGE.FAVORITES,
        []
    );

}


function saveFavorites(favorites) {

    if (
        !Array.isArray(favorites)
    ) {

        favorites = [];

    }


    return amirSet(
        AMIR_STORAGE.FAVORITES,
        favorites
    );

}


function addFavorite(id) {

    const favorites =
        getFavorites();


    if (
        !favorites.includes(id)
    ) {

        favorites.push(id);

    }


    saveFavorites(
        favorites
    );


    return favorites;

}


function removeFavorite(id) {

    let favorites =
        getFavorites();


    favorites =
        favorites.filter(
            item => item !== id
        );


    saveFavorites(
        favorites
    );


    return favorites;

}


function isFavorite(id) {

    return getFavorites()
        .includes(id);

}


/* =========================================================
   QIBLA SETTINGS
   ========================================================= */

function getQiblaSettings() {

    return amirGet(
        AMIR_STORAGE.QIBLA,
        {

            enabled: false,

            latitude: null,

            longitude: null,

            qiblaDirection: null

        }
    );

}


function saveQiblaSettings(settings) {

    return amirSet(
        AMIR_STORAGE.QIBLA,
        settings
    );

}


/* =========================================================
   FIRST RUN
   ========================================================= */

function isFirstRun() {

    return amirGet(
        AMIR_STORAGE.FIRST_RUN,
        true
    );

}


function completeFirstRun() {

    return amirSet(
        AMIR_STORAGE.FIRST_RUN,
        false
    );

}


/* =========================================================
   INSTALL MESSAGE
   ========================================================= */

function isInstallDismissed() {

    return amirGet(
        AMIR_STORAGE.INSTALL_DISMISSED,
        false
    );

}


function dismissInstallMessage() {

    return amirSet(
        AMIR_STORAGE.INSTALL_DISMISSED,
        true
    );

}


/* =========================================================
   EXPORT ALL SETTINGS
   ========================================================= */

function exportAmirSettings() {

    return {

        version:
            "2.0.0",

        exportedAt:
            new Date().toISOString(),

        city:
            getSavedCity(),

        theme:
            getSavedTheme(),

        adhan:
            getAdhanSettings(),

        notifications:
            getNotificationsEnabled(),

        zikr: {

            one:
                getZikrCount(1),

            two:
                getZikrCount(2),

            three:
                getZikrCount(3)

        },

        lastRead:
            getLastRead(),

        favorites:
            getFavorites(),

        qibla:
            getQiblaSettings()

    };

}


/* =========================================================
   IMPORT SETTINGS
   ========================================================= */

function importAmirSettings(data) {

    if (
        !data ||
        typeof data !== "object"
    ) {

        return false;

    }


    try {

        if (data.city) {

            saveCity(
                data.city
            );

        }


        if (data.theme) {

            saveTheme(
                data.theme
            );

        }


        if (data.adhan) {

            saveAdhanSettings(
                data.adhan
            );

        }


        if (
            typeof data.notifications !==
            "undefined"
        ) {

            saveNotificationsEnabled(
                data.notifications
            );

        }


        if (data.zikr) {

            if (
                typeof data.zikr.one !==
                "undefined"
            ) {

                saveZikrCount(
                    1,
                    data.zikr.one
                );

            }


            if (
                typeof data.zikr.two !==
                "undefined"
            ) {

                saveZikrCount(
                    2,
                    data.zikr.two
                );

            }


            if (
                typeof data.zikr.three !==
                "undefined"
            ) {

                saveZikrCount(
                    3,
                    data.zikr.three
                );

            }

        }


        if (data.lastRead) {

            saveLastRead(
                data.lastRead
            );

        }


        if (
            Array.isArray(
                data.favorites
            )
        ) {

            saveFavorites(
                data.favorites
            );

        }


        if (data.qibla) {

            saveQiblaSettings(
                data.qibla
            );

        }


        return true;

    } catch (error) {

        console.error(
            "Amir Import Error:",
            error
        );

        return false;

    }

}


/* =========================================================
   CLEAR APPLICATION DATA
   ========================================================= */

function clearAmirData() {

    const confirmed =
        window.confirm(
            "هل تريد حذف جميع إعدادات أمير مواقيت المحفوظة على هذا الجهاز؟"
        );


    if (!confirmed) {

        return false;

    }


    Object.values(
        AMIR_STORAGE
    ).forEach(key => {

        try {

            localStorage.removeItem(
                key
            );

        } catch {}

    });


    return true;

}


/* =========================================================
   STORAGE STATUS
   ========================================================= */

function getAmirStorageStatus() {

    let available = true;


    try {

        const testKey =
            "__amir_storage_test__";


        localStorage.setItem(
            testKey,
            "1"
        );


        localStorage.removeItem(
            testKey
        );

    } catch {

        available = false;

    }


    return {

        available,

        usedKeys:
            Object.keys(
                localStorage
            ).filter(
                key =>
                    key.startsWith("amir") ||
                    key.startsWith("zikr")
            ).length

    };

}


/* =========================================================
   GLOBAL API
   ========================================================= */

window.AmirStorage = {

    keys:
        AMIR_STORAGE,

    get:
        amirGet,

    set:
        amirSet,

    remove:
        amirRemove,

    getCity:
        getSavedCity,

    saveCity,

    getTheme:
        getSavedTheme,

    saveTheme,

    getAdhan:
        getAdhanSettings,

    saveAdhan:
        saveAdhanSettings,

    getNotifications:
        getNotificationsEnabled,

    saveNotifications:
        saveNotificationsEnabled,

    savePrayerCache,

    getPrayerCache,

    getPrayerCacheData,

    getZikr:
        getZikrCount,

    saveZikr:
        saveZikrCount,

    incrementZikr,

    getLastRead,

    saveLastRead,

    getFavorites,

    saveFavorites,

    addFavorite,

    removeFavorite,

    isFavorite,

    getQibla:
        getQiblaSettings,

    saveQibla:
        saveQiblaSettings,

    isFirstRun,

    completeFirstRun,

    isInstallDismissed,

    dismissInstallMessage,

    export:
        exportAmirSettings,

    import:
        importAmirSettings,

    clear:
        clearAmirData,

    status:
        getAmirStorageStatus

};


/* =========================================================
   STARTUP
   ========================================================= */

console.log(
    "💾 Amir Storage V2 loaded"
);
