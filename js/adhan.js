/* =========================================================
   أمير مواقيت V2
   adhan.js
   الأذان والتنبيهات
   ========================================================= */

(function () {
  "use strict";

  const AUDIO_PATH = "./adhan1.mp3";

  let audio = null;
  let schedulerTimer = null;
  let lastTriggered = {};

  const PRAYER_NAMES = {
    Fajr: "الفجر",
    Dhuhr: "الظهر",
    Asr: "العصر",
    Maghrib: "المغرب",
    Isha: "العشاء"
  };

  /* =========================================================
     الصوت
     ========================================================= */

  function getAudio() {
    if (!audio) {
      audio = new Audio(AUDIO_PATH);
      audio.preload = "auto";
      audio.volume = 0.8;
    }

    return audio;
  }

  function setVolume(value) {
    const volume = Math.max(
      0,
      Math.min(1, Number(value) || 0)
    );

    getAudio().volume = volume;

    return volume;
  }

  async function play() {
    try {
      const player = getAudio();

      player.currentTime = 0;

      await player.play();

      return true;
    } catch (error) {
      console.warn("تعذر تشغيل الأذان:", error);

      showToast(
        "اضغط على زر تشغيل الأذان للسماح بالصوت",
        "warning"
      );

      return false;
    }
  }

  function stop() {
    try {
      const player = getAudio();

      player.pause();
      player.currentTime = 0;

      return true;
    } catch (error) {
      return false;
    }
  }

  async function test() {
    const settings = getSettings();

    if (!settings.sound) {
      showToast("صوت الأذان متوقف من الإعدادات", "warning");
      return false;
    }

    setVolume(settings.volume);

    return play();
  }

  /* =========================================================
     الإعدادات
     ========================================================= */

  function getSettings() {
    const defaults = {
      enabled: true,
      timing: "at",
      sound: true,
      volume: 0.8
    };

    try {
      if (
        window.AmirStorage &&
        typeof window.AmirStorage.getAdhanSettings === "function"
      ) {
        return Object.assign(
          {},
          defaults,
          window.AmirStorage.getAdhanSettings() || {}
        );
      }
    } catch (error) {
      console.warn(error);
    }

    return defaults;
  }

  function saveSettings(settings) {
    const current = getSettings();

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

    try {
      if (
        window.AmirStorage &&
        typeof window.AmirStorage.setAdhanSettings === "function"
      ) {
        window.AmirStorage.setAdhanSettings(updated);
      } else {
        localStorage.setItem(
          "amirAdhanEnabled",
          JSON.stringify(updated.enabled)
        );

        localStorage.setItem(
          "amirAdhanTiming",
          JSON.stringify(updated.timing)
        );

        localStorage.setItem(
          "amirAdhanSound",
          JSON.stringify(updated.sound)
        );

        localStorage.setItem(
          "amirAdhanVolume",
          JSON.stringify(updated.volume)
        );
      }
    } catch (error) {
      console.warn("تعذر حفظ إعدادات الأذان:", error);
    }

    setVolume(updated.volume);

    return updated;
  }

  /* =========================================================
     الإشعارات
     ========================================================= */

  async function requestNotificationPermission() {
    if (!("Notification" in window)) {
      showToast(
        "المتصفح لا يدعم الإشعارات",
        "warning"
      );

      return "unsupported";
    }

    try {
      const permission =
        await Notification.requestPermission();

      if (permission === "granted") {
        showToast(
          "تم تفعيل الإشعارات",
          "success"
        );
      }

      return permission;
    } catch (error) {
      console.warn(error);
      return "denied";
    }
  }

  function notify(title, body) {
    if (!("Notification" in window)) {
      return false;
    }

    if (Notification.permission !== "granted") {
      return false;
    }

    try {
      new Notification(title || "أمير مواقيت", {
        body:
          body ||
          "حان الآن موعد الصلاة",
        icon: "./icon-192.png",
        badge: "./icon-192.png",
        dir: "rtl",
        lang: "ar"
      });

      return true;
    } catch (error) {
      console.warn("Notification:", error);
      return false;
    }
  }

  /* =========================================================
     Toast
     ========================================================= */

  function showToast(message, type) {
    const toast =
      document.getElementById("amirToast");

    if (!toast) {
      return;
    }

    toast.textContent = message;

    toast.classList.remove(
      "show",
      "success",
      "warning",
      "error"
    );

    if (type) {
      toast.classList.add(type);
    }

    requestAnimationFrame(function () {
      toast.classList.add("show");
    });

    clearTimeout(toast._timer);

    toast._timer = setTimeout(function () {
      toast.classList.remove("show");
    }, 3500);
  }

  /* =========================================================
     استخراج مواقيت الأذان
     ========================================================= */

  function getSchedule() {
    if (
      !window.AmirPrayer ||
      typeof window.AmirPrayer.getTodaySchedule !==
        "function"
    ) {
      return [];
    }

    return window.AmirPrayer
      .getTodaySchedule()
      .filter(function (prayer) {
        return (
          prayer.key !== "Sunrise" &&
          prayer.minutes !== null
        );
      });
  }

  /* =========================================================
     إنشاء مفتاح فريد للتشغيل
     ========================================================= */

  function getTriggerKey(prayer, date) {
    return (
      date +
      "_" +
      prayer.key +
      "_" +
      prayer.time
    );
  }

  /* =========================================================
     تنفيذ الأذان
     ========================================================= */

  async function triggerPrayer(prayer, beforeMinutes) {
    const settings = getSettings();

    if (!settings.enabled) {
      return;
    }

    const now = new Date();

    const dateKey =
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0");

    const triggerKey =
      getTriggerKey(prayer, dateKey) +
      "_" +
      beforeMinutes;

    if (lastTriggered[triggerKey]) {
      return;
    }

    lastTriggered[triggerKey] = true;

    if (settings.sound) {
      setVolume(settings.volume);
      await play();
    }

    notify(
      "أمير مواقيت",
      beforeMinutes > 0
        ? "باقي " +
            beforeMinutes +
            " دقائق على صلاة " +
            PRAYER_NAMES[prayer.key]
        : "حان الآن موعد صلاة " +
            PRAYER_NAMES[prayer.key]
    );

    showToast(
      beforeMinutes > 0
        ? "باقي " +
            beforeMinutes +
            " دقائق على " +
            PRAYER_NAMES[prayer.key]
        : "حان الآن موعد " +
            PRAYER_NAMES[prayer.key],
      "success"
    );
  }

  /* =========================================================
     فحص المواعيد
     ========================================================= */

  function checkSchedule() {
    const settings = getSettings();

    if (!settings.enabled) {
      return;
    }

    const schedule = getSchedule();

    if (!schedule.length) {
      return;
    }

    const now = new Date();

    const currentMinutes =
      now.getHours() * 60 +
      now.getMinutes();

    const currentSeconds = now.getSeconds();

    schedule.forEach(function (prayer) {
      if (prayer.minutes === null) {
        return;
      }

      const difference =
        prayer.minutes - currentMinutes;

      if (
        settings.timing === "before" ||
        settings.timing === "both"
      ) {
        if (
          difference === 10 &&
          currentSeconds < 10
        ) {
          triggerPrayer(prayer, 10);
        }
      }

      if (
        settings.timing === "at" ||
        settings.timing === "both"
      ) {
        if (
          difference === 0 &&
          currentSeconds < 10
        ) {
          triggerPrayer(prayer, 0);
        }
      }
    });

    cleanOldTriggers();
  }

  function cleanOldTriggers() {
    const keys = Object.keys(lastTriggered);

    if (keys.length > 100) {
      lastTriggered = {};
    }
  }

  /* =========================================================
     جدولة الفحص
     ========================================================= */

  function reschedule() {
    clearScheduler();

    checkSchedule();

    schedulerTimer = setInterval(
      checkSchedule,
      10000
    );
  }

  function refresh() {
    reschedule();
  }

  function clearScheduler() {
    if (schedulerTimer) {
      clearInterval(schedulerTimer);
      schedulerTimer = null;
    }
  }

  /* =========================================================
     أحداث التطبيق
     ========================================================= */

  window.addEventListener(
    "amirPrayerUpdated",
    function () {
      reschedule();
    }
  );

  document.addEventListener(
    "visibilitychange",
    function () {
      if (!document.hidden) {
        checkSchedule();
      }
    }
  );

  /* =========================================================
     API
     ========================================================= */

  window.AmirAdhan = {
    play,
    stop,
    test,

    getSettings,
    saveSettings,
    setVolume,
    getAudio,

    requestNotificationPermission,
    notify,

    reschedule,
    refresh,
    clearScheduler
  };

  /* =========================================================
     التشغيل
     ========================================================= */

  function init() {
    const settings = getSettings();

    setVolume(settings.volume);
    reschedule();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      init
    );
  } else {
    init();
  }

})();
