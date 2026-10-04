/* =========================================================
   أمير مواقيت V2
   adhan.js
   نظام الأذان والتنبيهات
   ========================================================= */

(() => {
  "use strict";

  const ADHAN_AUDIO =
    "./audio/adhan1.mp3";

  const BEFORE_MINUTES = 10;

  let audio = null;
  let scheduleTimer = null;
  let scheduledEvents = [];
  let lastTriggered = {};

  /* =========================================================
     إنشاء مشغل الأذان
     ========================================================= */

  function createAudio() {
    if (!audio) {
      audio = new Audio(ADHAN_AUDIO);

      audio.preload = "auto";

      audio.addEventListener(
        "ended",
        () => {
          updateAdhanStatus(
            "انتهى الأذان"
          );
        }
      );

      audio.addEventListener(
        "error",
        () => {
          updateAdhanStatus(
            "تعذر تشغيل ملف الأذان"
          );
        }
      );
    }

    return audio;
  }

  /* =========================================================
     إعدادات الأذان
     ========================================================= */

  function getSettings() {
    if (
      window.AmirStorage &&
      typeof window.AmirStorage.getAdhanSettings ===
        "function"
    ) {
      return (
        window.AmirStorage.getAdhanSettings() || {
          enabled: true,
          timing: "at",
          sound: "adhan1",
          volume: 0.8
        }
      );
    }

    return {
      enabled:
        localStorage.getItem(
          "amirAdhanEnabled"
        ) !== "false",

      timing:
        localStorage.getItem(
          "amirAdhanTiming"
        ) || "at",

      sound:
        localStorage.getItem(
          "amirAdhanSound"
        ) || "adhan1",

      volume: Number(
        localStorage.getItem(
          "amirAdhanVolume"
        ) || 0.8
      )
    };
  }

  function saveSettings(
    settings
  ) {
    if (
      window.AmirStorage &&
      typeof window.AmirStorage.setAdhanSettings ===
        "function"
    ) {
      window.AmirStorage.setAdhanSettings(
        settings
      );
      return;
    }

    localStorage.setItem(
      "amirAdhanEnabled",
      String(settings.enabled)
    );

    localStorage.setItem(
      "amirAdhanTiming",
      settings.timing
    );

    localStorage.setItem(
      "amirAdhanSound",
      settings.sound
    );

    localStorage.setItem(
      "amirAdhanVolume",
      String(settings.volume)
    );
  }

  /* =========================================================
     التحكم في الصوت
     ========================================================= */

  async function playAdhan(reason = "at") {
    const settings =
      getSettings();

    if (!settings.enabled) {
      updateAdhanStatus(
        "الأذان متوقف"
      );
      return false;
    }

    const player =
      createAudio();

    try {
      player.pause();

      player.currentTime = 0;

      const volume =
        Number(settings.volume);

      player.volume =
        Math.max(
          0,
          Math.min(
            1,
            Number.isFinite(volume)
              ? volume
              : 0.8
          )
        );

      await player.play();

      updateAdhanStatus(
        reason === "before"
          ? "حان تنبيه الأذان بعد 10 دقائق"
          : "يُرفع الأذان الآن"
      );

      return true;
    } catch (error) {
      console.warn(
        "Adhan playback blocked:",
        error
      );

      updateAdhanStatus(
        "اضغط زر اختبار الأذان للسماح بتشغيل الصوت"
      );

      /*
        المتصفحات، وخاصة iPhone/iPad،
        قد تمنع تشغيل الصوت تلقائيًا
        دون تفاعل المستخدم.
      */

      return false;
    }
  }

  function stopAdhan() {
    if (!audio) {
      updateAdhanStatus(
        "لا يوجد أذان يعمل حاليًا"
      );
      return;
    }

    audio.pause();
    audio.currentTime = 0;

    updateAdhanStatus(
      "تم إيقاف الأذان"
    );
  }

  async function testAdhan() {
    const settings =
      getSettings();

    settings.enabled = true;

    saveSettings(settings);

    return playAdhan("test");
  }

  function setVolume(value) {
    const volume =
      Math.max(
        0,
        Math.min(
          1,
          Number(value)
        )
      );

    const settings =
      getSettings();

    settings.volume =
      Number.isFinite(volume)
        ? volume
        : 0.8;

    saveSettings(settings);

    if (audio) {
      audio.volume =
        settings.volume;
    }
  }

  /* =========================================================
     حساب وقت الصلاة
     ========================================================= */

  function prayerTimeToDate(
    time,
    baseDate
  ) {
    if (!time || time === "--:--") {
      return null;
    }

    const match =
      String(time).match(
        /^(\d{1,2}):(\d{2})/
      );

    if (!match) return null;

    const date =
      new Date(baseDate);

    date.setHours(
      Number(match[1]),
      Number(match[2]),
      0,
      0
    );

    return date;
  }

  /* =========================================================
     إشعارات النظام
     ========================================================= */

  function notificationsEnabled() {
    try {
      if (
        window.AmirStorage &&
        typeof window.AmirStorage.getNotifications ===
          "function"
      ) {
        return window.AmirStorage.getNotifications();
      }

      return (
        localStorage.getItem(
          "amirNotifications"
        ) === "true"
      );
    } catch {
      return false;
    }
  }

  async function requestNotificationPermission() {
    if (
      !("Notification" in window)
    ) {
      updateAdhanStatus(
        "هذا المتصفح لا يدعم الإشعارات"
      );
      return false;
    }

    if (
      Notification.permission ===
      "granted"
    ) {
      saveNotificationSetting(
        true
      );

      return true;
    }

    if (
      Notification.permission ===
      "denied"
    ) {
      updateAdhanStatus(
        "الإشعارات محظورة من إعدادات المتصفح"
      );

      return false;
    }

    try {
      const permission =
        await Notification.requestPermission();

      const granted =
        permission === "granted";

      saveNotificationSetting(
        granted
      );

      if (granted) {
        updateAdhanStatus(
          "تم تفعيل الإشعارات"
        );
      } else {
        updateAdhanStatus(
          "لم يتم تفعيل الإشعارات"
        );
      }

      return granted;
    } catch (error) {
      console.warn(
        "Notification permission error:",
        error
      );

      return false;
    }
  }

  function saveNotificationSetting(
    enabled
  ) {
    if (
      window.AmirStorage &&
      typeof window.AmirStorage.setNotifications ===
        "function"
    ) {
      window.AmirStorage.setNotifications(
        enabled
      );
      return;
    }

    localStorage.setItem(
      "amirNotifications",
      String(enabled)
    );
  }

  function showNotification(
    title,
    body
  ) {
    if (
      !notificationsEnabled()
    ) {
      return;
    }

    if (
      !("Notification" in window) ||
      Notification.permission !==
        "granted"
    ) {
      return;
    }

    try {
      new Notification(
        title,
        {
          body,
          icon:
            "./icons/icon-192.png",
          badge:
            "./icons/icon-192.png",
          dir: "rtl",
          lang: "ar"
        }
      );
    } catch (error) {
      console.warn(
        "Notification error:",
        error
      );
    }
  }

  /* =========================================================
     تنفيذ حدث الأذان
     ========================================================= */

  function triggerAdhan(
    prayer,
    type
  ) {
    const now =
      new Date();

    const key =
      `${now.toDateString()}_${prayer.key}_${type}`;

    /*
      منع تكرار نفس الحدث أكثر من مرة
    */
    if (
      lastTriggered[key]
    ) {
      return;
    }

    lastTriggered[key] =
      Date.now();

    if (
      type === "before"
    ) {
      showNotification(
        `أمير مواقيت — ${prayer.name}`,
        `تبقى 10 دقائق على أذان ${prayer.name}`
      );

      playAdhan("before");
    } else {
      showNotification(
        `أمير مواقيت — حان وقت ${prayer.name}`,
        `حان الآن وقت صلاة ${prayer.name}`
      );

      playAdhan("at");
    }
  }

  /* =========================================================
     جدولة الأذان
     ========================================================= */

  function clearSchedule() {
    scheduledEvents.forEach(
      event => {
        if (event.timer) {
          clearTimeout(
            event.timer
          );
        }
      }
    );

    scheduledEvents = [];
  }

  function scheduleEvent(
    date,
    prayer,
    type
  ) {
    const delay =
      date.getTime() -
      Date.now();

    /*
      لا نبرمج أحداثًا قديمة
    */
    if (delay <= 0) {
      return;
    }

    /*
      setTimeout له حدود في المتصفحات،
      لذلك نرفض الأحداث البعيدة جدًا.
    */
    if (
      delay >
      2147483647
    ) {
      return;
    }

    const timer =
      setTimeout(
        () => {
          triggerAdhan(
            prayer,
            type
          );

          /*
            بعد التنفيذ نعيد الجدولة
            حتى يستمر النظام طوال اليوم.
          */
          reschedule();
        },
        delay
      );

    scheduledEvents.push({
      date,
      prayer,
      type,
      timer
    });
  }

  function reschedule() {
    clearSchedule();

    const settings =
      getSettings();

    if (!settings.enabled) {
      updateAdhanStatus(
        "الأذان متوقف"
      );
      return;
    }

    const schedule =
      window.AmirPrayer &&
      typeof window.AmirPrayer.getTodaySchedule ===
        "function"
        ? window.AmirPrayer.getTodaySchedule()
        : null;

    if (
      !schedule ||
      !schedule.prayers
    ) {
      return;
    }

    const now =
      new Date();

    const timing =
      settings.timing || "at";

    const prayerDefinitions = [
      {
        key: "Fajr",
        name: "الفجر"
      },
      {
        key: "Dhuhr",
        name: "الظهر"
      },
      {
        key: "Asr",
        name: "العصر"
      },
      {
        key: "Maghrib",
        name: "المغرب"
      },
      {
        key: "Isha",
        name: "العشاء"
      }
    ];

    prayerDefinitions.forEach(
      prayer => {
        const prayerDate =
          prayerTimeToDate(
            schedule.prayers[
              prayer.key
            ],
            now
          );

        if (!prayerDate) {
          return;
        }

        if (
          timing === "before" ||
          timing === "both"
        ) {
          const beforeDate =
            new Date(
              prayerDate.getTime() -
                BEFORE_MINUTES *
                  60 *
                  1000
            );

          scheduleEvent(
            beforeDate,
            prayer,
            "before"
          );
        }

        if (
          timing === "at" ||
          timing === "both"
        ) {
          scheduleEvent(
            prayerDate,
            prayer,
            "at"
          );
        }
      }
    );

    /*
      إعادة المحاولة كل دقيقة،
      تحسبًا لتغير اليوم أو تعديل الإعدادات.
    */
    setTimeout(
      () => {
        reschedule();
      },
      60 * 1000
    );
  }

  /* =========================================================
     حالة الأذان في الواجهة
     ========================================================= */

  function updateAdhanStatus(
    message
  ) {
    const elements =
      document.querySelectorAll(
        "[data-adhan-status]"
      );

    elements.forEach(
      element => {
        element.textContent =
          message;
      }
    );

    const status =
      document.getElementById(
        "adhanStatus"
      );

    if (status) {
      status.textContent =
        message;
    }
  }

  /* =========================================================
     تشغيل / إيقاف الأذان
     ========================================================= */

  function setEnabled(
    enabled
  ) {
    const settings =
      getSettings();

    settings.enabled =
      Boolean(enabled);

    saveSettings(settings);

    if (!settings.enabled) {
      stopAdhan();
      clearSchedule();

      updateAdhanStatus(
        "الأذان متوقف"
      );
    } else {
      updateAdhanStatus(
        "تم تفعيل الأذان"
      );

      reschedule();
    }
  }

  function setTiming(
    timing
  ) {
    const valid = [
      "off",
      "before",
      "at",
      "both"
    ];

    if (
      !valid.includes(timing)
    ) {
      timing = "at";
    }

    const settings =
      getSettings();

    settings.timing =
      timing;

    saveSettings(settings);

    reschedule();
  }

  /* =========================================================
     الأحداث من الواجهة
     ========================================================= */

  function bindUI() {
    const testButton =
      document.getElementById(
        "testAdhan"
      );

    if (testButton) {
      testButton.addEventListener(
        "click",
        async () => {
          await testAdhan();
        }
      );
    }

    const stopButton =
      document.getElementById(
        "stopAdhan"
      );

    if (stopButton) {
      stopButton.addEventListener(
        "click",
        () => {
          stopAdhan();
        }
      );
    }

    const volume =
      document.getElementById(
        "adhanVolume"
      );

    if (volume) {
      const settings =
        getSettings();

      volume.value =
        Math.round(
          Number(settings.volume) *
            100
        );

      volume.addEventListener(
        "input",
        event => {
          setVolume(
            Number(
              event.target.value
            ) / 100
          );
        }
      );
    }

    const timing =
      document.getElementById(
        "adhanTiming"
      );

    if (timing) {
      timing.value =
        getSettings().timing ||
        "at";

      timing.addEventListener(
        "change",
        event => {
          setTiming(
            event.target.value
          );
        }
      );
    }

    const enabled =
      document.getElementById(
        "adhanEnabled"
      );

    if (enabled) {
      enabled.checked =
        Boolean(
          getSettings().enabled
        );

      enabled.addEventListener(
        "change",
        event => {
          setEnabled(
            event.target.checked
          );
        }
      );
    }

    const notificationButton =
      document.getElementById(
        "enableNotifications"
      );

    if (notificationButton) {
      notificationButton.addEventListener(
        "click",
        async () => {
          await requestNotificationPermission();
        }
      );
    }
  }

  /* =========================================================
     عند تغير مواقيت الصلاة
     ========================================================= */

  function watchPrayerModule() {
    /*
      ننتظر حتى تصبح مواقيت الصلاة
      متاحة ثم نبدأ الجدولة.
    */

    const interval =
      setInterval(
        () => {
          if (
            window.AmirPrayer &&
            typeof window.AmirPrayer.getTodaySchedule ===
              "function" &&
            window.AmirPrayer.getTodaySchedule()
          ) {
            clearInterval(
              interval
            );

            reschedule();
          }
        },
        1000
      );
  }

  /* =========================================================
     API عام
     ========================================================= */

  window.AmirAdhan = {
    play: playAdhan,

    stop: stopAdhan,

    test: testAdhan,

    setEnabled,

    setTiming,

    setVolume,

    getSettings,

    requestNotificationPermission,

    reschedule,

    clearSchedule
  };

  /* =========================================================
     التشغيل
     ========================================================= */

  document.addEventListener(
    "DOMContentLoaded",
    () => {
      bindUI();

      watchPrayerModule();

      /*
        تحديث الجدولة كل 5 دقائق
        للتأكد من استمرار النظام.
      */
      setInterval(
        () => {
          reschedule();
        },
        5 * 60 * 1000
      );
    }
  );

})();
