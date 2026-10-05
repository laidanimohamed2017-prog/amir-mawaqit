/* =========================================================
   أمير مواقيت V2
   storage.js
   إدارة التخزين المحلي للتطبيق
   ========================================================= */

(function () {
  "use strict";

  const KEYS = {
    CITY: "amirCity",
    THEME: "amirTheme",
    ADHAN_ENABLED: "amirAdhanEnabled",
    ADHAN_TIMING: "amirAdhanTiming",
    ADHAN_SOUND: "amirAdhanSound",
    ADHAN_VOLUME: "amirAdhanVolume",
    NOTIFICATIONS: "amirNotifications",
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

  /* ---------------------------------------------------------
     أدوات أساسية
     --------------------------------------------------------- */

  function get(key, defaultValue = null) {
    try {
      const value = localStorage.getItem(key);

      if (value === null) {
        return defaultValue;
      }

      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    } catch (error) {
      console.warn("AmirStorage.get:", error);
      return defaultValue;
    }
  }

  function set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn("AmirStorage.set:", error);
      return false;
    }
  }

  function remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn("AmirStorage.remove:", error);
      return false;
    }
  }

  function has(key) {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      return false;
    }
  }

  /* ---------------------------------------------------------
     المدينة
     --------------------------------------------------------- */

  function getCity() {
    return get(KEYS.CITY, "ain_oussera");
  }

  function setCity(city) {
    return set(KEYS.CITY, city);
  }

  /* ---------------------------------------------------------
     المظهر
     --------------------------------------------------------- */

  function getTheme() {
    return get(KEYS.THEME, "auto");
  }

  function setTheme(theme) {
    return set(KEYS.THEME, theme);
  }

  /* ---------------------------------------------------------
     إعدادات الأذان
     --------------------------------------------------------- */

  function getAdhanSettings() {
    return {
      enabled: get(KEYS.ADHAN_ENABLED, true),
      timing: get(KEYS.ADHAN_TIMING, "at"),
      sound: get(KEYS.ADHAN_SOUND, true),
      volume: Number(get(KEYS.ADHAN_VOLUME, 0.8))
    };
  }

  function setAdhanSettings(settings = {}) {
    const current = getAdhanSettings();

    const updated = {
      enabled:
        typeof settings.enabled === "boolean"
          ? settings.enabled
          : current.enabled,

      timing:
        typeof settings.timing === "string"
          ? settings.timing
          : current.timing,

      sound:
        typeof settings.sound === "boolean"
          ? settings.sound
          : current.sound,

      volume:
        typeof settings.volume === "number"
          ? Math.max(0, Math.min(1, settings.volume))
          : current.volume
    };

    set(KEYS.ADHAN_ENABLED, updated.enabled);
    set(KEYS.ADHAN_TIMING, updated.timing);
    set(KEYS.ADHAN_SOUND, updated.sound);
    set(KEYS.ADHAN_VOLUME, updated.volume);

    return updated;
  }

  /* ---------------------------------------------------------
     الإشعارات
     --------------------------------------------------------- */

  function getNotificationsEnabled() {
    return Boolean(get(KEYS.NOTIFICATIONS, false));
  }

  function setNotificationsEnabled(value) {
    return set(KEYS.NOTIFICATIONS, Boolean(value));
  }

  /* ---------------------------------------------------------
     إعدادات الصلاة
     --------------------------------------------------------- */

  function getPrayerSettings() {
    return get(KEYS.PRAYER_SETTINGS, {
      calculationMethod: "19",
      madhhab: "0",
      adjustments: {
        Fajr: 0,
        Sunrise: 0,
        Dhuhr: 0,
        Asr: 0,
        Maghrib: 0,
        Isha: 0
      }
    });
  }

  function setPrayerSettings(settings) {
    return set(KEYS.PRAYER_SETTINGS, settings);
  }

  /* ---------------------------------------------------------
     تخزين مواقيت الصلاة
     --------------------------------------------------------- */

  function getPrayerCache() {
    return get(KEYS.PRAYER_CACHE, null);
  }

  function setPrayerCache(data) {
    return set(KEYS.PRAYER_CACHE, data);
  }

  function clearPrayerCache() {
    return remove(KEYS.PRAYER_CACHE);
  }

  /* ---------------------------------------------------------
     الأذكار القديمة - توافق مع النسخ السابقة
     --------------------------------------------------------- */

  function getZikrCount(number) {
    const key = KEYS["ZIKR_" + number];

    if (!key) {
      return 0;
    }

    return Number(get(key, 0)) || 0;
  }

  function setZikrCount(number, count) {
    const key = KEYS["ZIKR_" + number];

    if (!key) {
      return false;
    }

    return set(key, Number(count) || 0);
  }

  /* ---------------------------------------------------------
     القرآن
     --------------------------------------------------------- */

  function getLastRead() {
    return get(KEYS.LAST_READ, null);
  }

  function setLastRead(data) {
    return set(KEYS.LAST_READ, data);
  }

  function getFavorites() {
    return get(KEYS.FAVORITES, []);
  }

  function setFavorites(favorites) {
    return set(KEYS.FAVORITES, Array.isArray(favorites) ? favorites : []);
  }

  /* ---------------------------------------------------------
     القبلة
     --------------------------------------------------------- */

  function getQiblaSettings() {
    return get(KEYS.QIBLA, {
      lastHeading: null,
      permissionGranted: false
    });
  }

  function setQiblaSettings(settings) {
    return set(KEYS.QIBLA, settings);
  }

  /* ---------------------------------------------------------
     التثبيت
     --------------------------------------------------------- */

  function isInstallDismissed() {
    return Boolean(get(KEYS.INSTALL_DISMISSED, false));
  }

  function setInstallDismissed(value) {
    return set(KEYS.INSTALL_DISMISSED, Boolean(value));
  }

  /* ---------------------------------------------------------
     التشغيل الأول
     --------------------------------------------------------- */

  function isFirstRun() {
    return Boolean(get(KEYS.FIRST_RUN, true));
  }

  function setFirstRun(value) {
    return set(KEYS.FIRST_RUN, Boolean(value));
  }

  /* ---------------------------------------------------------
     تصدير البيانات
     --------------------------------------------------------- */

  function exportData() {
    const data = {};

    Object.keys(KEYS).forEach(function (name) {
      const key = KEYS[name];

      if (has(key)) {
        data[key] = get(key);
      }
    });

    return data;
  }

  /* ---------------------------------------------------------
     استيراد البيانات
     --------------------------------------------------------- */

  function importData(data) {
    if (!data || typeof data !== "object") {
      return false;
    }

    try {
      Object.keys(data).forEach(function (key) {
        set(key, data[key]);
      });

      return true;
    } catch (error) {
      console.warn("AmirStorage.importData:", error);
      return false;
    }
  }

  /* ---------------------------------------------------------
     حذف جميع بيانات التطبيق
     --------------------------------------------------------- */

  function clearAll() {
    try {
      Object.keys(KEYS).forEach(function (name) {
        localStorage.removeItem(KEYS[name]);
      });

      return true;
    } catch (error) {
      console.warn("AmirStorage.clearAll:", error);
      return false;
    }
  }

  /* ---------------------------------------------------------
     API العامة
     --------------------------------------------------------- */

  window.AmirStorage = {
    KEYS,

    get,
    set,
    remove,
    has,

    getCity,
    setCity,

    getTheme,
    setTheme,

    getAdhanSettings,
    setAdhanSettings,

    getNotificationsEnabled,
    setNotificationsEnabled,

    getPrayerSettings,
    setPrayerSettings,

    getPrayerCache,
    setPrayerCache,
    clearPrayerCache,

    getZikrCount,
    setZikrCount,

    getLastRead,
    setLastRead,

    getFavorites,
    setFavorites,

    getQiblaSettings,
    setQiblaSettings,

    isInstallDismissed,
    setInstallDismissed,

    isFirstRun,
    setFirstRun,

    exportData,
    importData,
    clearAll
  };

})();
