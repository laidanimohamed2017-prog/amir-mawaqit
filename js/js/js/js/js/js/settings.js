/* =========================================================
   أمير مواقيت V2
   settings.js
   إدارة إعدادات التطبيق
   ========================================================= */

(() => {
  "use strict";

  /* =========================================================
     أدوات التخزين
     ========================================================= */

  function getStorage() {
    return window.AmirStorage || null;
  }

  function getCity() {
    const storage = getStorage();

    if (
      storage &&
      typeof storage.getCity === "function"
    ) {
      return (
        storage.getCity() ||
        "ain_oussera"
      );
    }

    return (
      localStorage.getItem(
        "amirCity"
      ) ||
      "ain_oussera"
    );
  }

  function setCity(city) {
    const storage = getStorage();

    if (
      storage &&
      typeof storage.setCity === "function"
    ) {
      storage.setCity(city);
      return;
    }

    localStorage.setItem(
      "amirCity",
      city
    );
  }

  /* =========================================================
     المدن
     ========================================================= */

  const CITIES = {
    ain_oussera: "عين وسارة",
    algiers: "الجزائر العاصمة",
    oran: "وهران",
    constantine: "قسنطينة",
    annaba: "عنابة",
    blida: "البليدة",
    setif: "سطيف",
    tlemcen: "تلمسان"
  };

  /* =========================================================
     الوضع
     ========================================================= */

  function getTheme() {
    const storage = getStorage();

    if (
      storage &&
      typeof storage.getTheme === "function"
    ) {
      return (
        storage.getTheme() ||
        "dark"
      );
    }

    return (
      localStorage.getItem(
        "amirTheme"
      ) ||
      "dark"
    );
  }

  function setTheme(theme) {
    const validThemes = [
      "light",
      "dark",
      "auto"
    ];

    if (
      !validThemes.includes(
        theme
      )
    ) {
      theme = "dark";
    }

    const storage = getStorage();

    if (
      storage &&
      typeof storage.setTheme === "function"
    ) {
      storage.setTheme(theme);
    } else {
      localStorage.setItem(
        "amirTheme",
        theme
      );
    }

    applyTheme(theme);
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
    const actualTheme =
      theme === "auto"
        ? getSystemTheme()
        : theme;

    document.documentElement.dataset.theme =
      actualTheme;

    document.body.classList.toggle(
      "dark-mode",
      actualTheme === "dark"
    );

    document.body.classList.toggle(
      "light-mode",
      actualTheme === "light"
    );

    document
      .querySelectorAll(
        "[data-theme-choice]"
      )
      .forEach(button => {
        button.classList.toggle(
          "active",
          button.dataset.themeChoice ===
            theme
        );
      });

    const themeSelect =
      document.getElementById(
        "themeSelect"
      );

    if (themeSelect) {
      themeSelect.value =
        theme;
    }
  }

  /* =========================================================
     إعدادات الأذان
     ========================================================= */

  function getAdhanSettings() {
    const storage = getStorage();

    if (
      storage &&
      typeof storage.getAdhanSettings ===
        "function"
    ) {
      return (
        storage.getAdhanSettings() || {
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
        ) ||
        "at",

      sound:
        localStorage.getItem(
          "amirAdhanSound"
        ) ||
        "adhan1",

      volume: Number(
        localStorage.getItem(
          "amirAdhanVolume"
        ) ||
        0.8
      )
    };
  }

  function saveAdhanSettings(
    settings
  ) {
    const storage = getStorage();

    if (
      storage &&
      typeof storage.setAdhanSettings ===
        "function"
    ) {
      storage.setAdhanSettings(
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
     الإشعارات
     ========================================================= */

  function getNotifications() {
    const storage = getStorage();

    if (
      storage &&
      typeof storage.getNotifications ===
        "function"
    ) {
      return Boolean(
        storage.getNotifications()
      );
    }

    return (
      localStorage.getItem(
        "amirNotifications"
      ) === "true"
    );
  }

  async function enableNotifications() {
    if (
      window.AmirAdhan &&
      typeof window.AmirAdhan
        .requestNotificationPermission ===
        "function"
    ) {
      return window.AmirAdhan
        .requestNotificationPermission();
    }

    if (
      !("Notification" in window)
    ) {
      return false;
    }

    try {
      const permission =
        await Notification.requestPermission();

      const enabled =
        permission === "granted";

      const storage =
        getStorage();

      if (
        storage &&
        typeof storage.setNotifications ===
          "function"
      ) {
        storage.setNotifications(
          enabled
        );
      } else {
        localStorage.setItem(
          "amirNotifications",
          String(enabled)
        );
      }

      return enabled;
    } catch {
      return false;
    }
  }

  /* =========================================================
     تحديث عناصر الواجهة
     ========================================================= */

  function updateCityControls() {
    const city =
      getCity();

    const select =
      document.getElementById(
        "citySelect"
      );

    if (select) {
      select.value =
        city;
    }

    document
      .querySelectorAll(
        "[data-current-city]"
      )
      .forEach(
        element => {
          element.textContent =
            CITIES[city] ||
            "عين وسارة";
        }
      );
  }

  function updateAdhanControls() {
    const settings =
      getAdhanSettings();

    const enabled =
      document.getElementById(
        "adhanEnabled"
      );

    if (enabled) {
      enabled.checked =
        Boolean(
          settings.enabled
        );
    }

    const timing =
      document.getElementById(
        "adhanTiming"
      );

    if (timing) {
      timing.value =
        settings.timing ||
        "at";
    }

    const volume =
      document.getElementById(
        "adhanVolume"
      );

    if (volume) {
      volume.value =
        Math.round(
          Number(
            settings.volume
          ) * 100
        );
    }

    const volumeValue =
      document.getElementById(
        "adhanVolumeValue"
      );

    if (volumeValue) {
      volumeValue.textContent =
        `${Math.round(
          Number(
            settings.volume
          ) * 100
        )}%`;
    }

    const notificationToggle =
      document.getElementById(
        "notificationsEnabled"
      );

    if (notificationToggle) {
      notificationToggle.checked =
        getNotifications();
    }
  }

  /* =========================================================
     تغيير المدينة
     ========================================================= */

  async function handleCityChange(
    city
  ) {
    if (
      !CITIES[city]
    ) {
      return;
    }

    setCity(city);

    updateCityControls();

    if (
      window.AmirPrayer &&
      typeof window.AmirPrayer.changeCity ===
        "function"
    ) {
      await window.AmirPrayer
        .changeCity(city);
    }

    updateSettingsStatus(
      `تم تغيير المدينة إلى ${CITIES[city]}`
    );
  }

  /* =========================================================
     تغيير إعداد الأذان
     ========================================================= */

  function handleAdhanEnabled(
    enabled
  ) {
    const settings =
      getAdhanSettings();

    settings.enabled =
      Boolean(enabled);

    saveAdhanSettings(
      settings
    );

    if (
      window.AmirAdhan &&
      typeof window.AmirAdhan.setEnabled ===
        "function"
    ) {
      window.AmirAdhan.setEnabled(
        enabled
      );
    }

    updateSettingsStatus(
      enabled
        ? "تم تفعيل الأذان"
        : "تم إيقاف الأذان"
    );
  }

  function handleAdhanTiming(
    timing
  ) {
    const valid = [
      "off",
      "before",
      "at",
      "both"
    ];

    if (
      !valid.includes(
        timing
      )
    ) {
      timing = "at";
    }

    const settings =
      getAdhanSettings();

    settings.timing =
      timing;

    saveAdhanSettings(
      settings
    );

    if (
      window.AmirAdhan &&
      typeof window.AmirAdhan.setTiming ===
        "function"
    ) {
      window.AmirAdhan.setTiming(
        timing
      );
    }

    const names = {
      off: "بدون أذان",
      before: "قبل الصلاة بـ10 دقائق",
      at: "عند دخول وقت الصلاة",
      both: "قبل الصلاة وعند دخول الوقت"
    };

    updateSettingsStatus(
      names[timing]
    );
  }

  function handleAdhanVolume(
    value
  ) {
    const volume =
      Math.max(
        0,
        Math.min(
          100,
          Number(value)
        )
      );

    const normalized =
      volume / 100;

    const settings =
      getAdhanSettings();

    settings.volume =
      normalized;

    saveAdhanSettings(
      settings
    );

    if (
      window.AmirAdhan &&
      typeof window.AmirAdhan.setVolume ===
        "function"
    ) {
      window.AmirAdhan.setVolume(
        normalized
      );
    }

    const output =
      document.getElementById(
        "adhanVolumeValue"
      );

    if (output) {
      output.textContent =
        `${Math.round(
          volume
        )}%`;
    }
  }

  /* =========================================================
     حالة الإعدادات
     ========================================================= */

  function updateSettingsStatus(
    message
  ) {
    const elements =
      document.querySelectorAll(
        "[data-settings-status]"
      );

    elements.forEach(
      element => {
        element.textContent =
          message;
      }
    );

    const status =
      document.getElementById(
        "settingsStatus"
      );

    if (status) {
      status.textContent =
        message;
    }
  }

  /* =========================================================
     مسح البيانات
     ========================================================= */

  function clearAppData() {
    const confirmed =
      window.confirm(
        "هل أنت متأكد من حذف جميع إعدادات أمير مواقيت والعدادات المحفوظة؟"
      );

    if (!confirmed) {
      return;
    }

    const storage =
      getStorage();

    if (
      storage &&
      typeof storage.clear ===
        "function"
    ) {
      storage.clear();
    } else {
      const keys = [
        "amirCity",
        "amirTheme",
        "amirAdhanEnabled",
        "amirAdhanTiming",
        "amirAdhanSound",
        "amirNotifications",
        "amirAdhanVolume",
        "amirPrayerSettings",
        "amirMawaqitCache",
        "amirLastRead",
        "amirFavorites",
        "amirQiblaSettings",
        "amirInstallDismissed",
        "amirFirstRun"
      ];

      keys.forEach(
        key => {
          localStorage.removeItem(
            key
          );
        }
      );
    }

    window.location.reload();
  }

  /* =========================================================
     تصدير الإعدادات
     ========================================================= */

  function exportSettings() {
    const storage =
      getStorage();

    let data = {};

    if (
      storage &&
      typeof storage.exportAll ===
        "function"
    ) {
      data =
        storage.exportAll();
    } else {
      data = {
        city: getCity(),
        theme: getTheme(),
        adhan:
          getAdhanSettings(),
        notifications:
          getNotifications()
      };
    }

    const blob =
      new Blob(
        [
          JSON.stringify(
            data,
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

    link.href =
      url;

    link.download =
      "amir-mawaqit-settings.json";

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(
      url
    );

    updateSettingsStatus(
      "تم تصدير الإعدادات"
    );
  }

  /* =========================================================
     ربط عناصر HTML
     ========================================================= */

  function bindUI() {
    /* المدينة */

    const citySelect =
      document.getElementById(
        "citySelect"
      );

    if (citySelect) {
      citySelect.addEventListener(
        "change",
        event => {
          handleCityChange(
            event.target.value
          );
        }
      );
    }

    /* المظهر */

    const themeSelect =
      document.getElementById(
        "themeSelect"
      );

    if (themeSelect) {
      themeSelect.value =
        getTheme();

      themeSelect.addEventListener(
        "change",
        event => {
          setTheme(
            event.target.value
          );
        }
      );
    }

    document
      .querySelectorAll(
        "[data-theme-choice]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              setTheme(
                button.dataset
                  .themeChoice
              );
            }
          );
        }
      );

    /* الأذان */

    const adhanEnabled =
      document.getElementById(
        "adhanEnabled"
      );

    if (adhanEnabled) {
      adhanEnabled.addEventListener(
        "change",
        event => {
          handleAdhanEnabled(
            event.target.checked
          );
        }
      );
    }

    const adhanTiming =
      document.getElementById(
        "adhanTiming"
      );

    if (adhanTiming) {
      adhanTiming.addEventListener(
        "change",
        event => {
          handleAdhanTiming(
            event.target.value
          );
        }
      );
    }

    const adhanVolume =
      document.getElementById(
        "adhanVolume"
      );

    if (adhanVolume) {
      adhanVolume.addEventListener(
        "input",
        event => {
          handleAdhanVolume(
            event.target.value
          );
        }
      );
    }

    /* الإشعارات */

    const notifications =
      document.getElementById(
        "notificationsEnabled"
      );

    if (notifications) {
      notifications.addEventListener(
        "change",
        async event => {
          if (
            event.target.checked
          ) {
            const enabled =
              await enableNotifications();

            event.target.checked =
              enabled;
          } else {
            const storage =
              getStorage();

            if (
              storage &&
              typeof storage.setNotifications ===
                "function"
            ) {
              storage.setNotifications(
                false
              );
            } else {
              localStorage.setItem(
                "amirNotifications",
                "false"
              );
            }

            updateSettingsStatus(
              "تم إيقاف الإشعارات"
            );
          }
        }
      );
    }

    /* اختبار الأذان */

    const testAdhan =
      document.getElementById(
        "testAdhan"
      );

    if (testAdhan) {
      testAdhan.addEventListener(
        "click",
        async () => {
          if (
            window.AmirAdhan &&
            typeof window.AmirAdhan.test ===
              "function"
          ) {
            await window.AmirAdhan.test();
          }
        }
      );
    }

    /* إيقاف الأذان */

    const stopAdhan =
      document.getElementById(
        "stopAdhan"
      );

    if (stopAdhan) {
      stopAdhan.addEventListener(
        "click",
        () => {
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

    /* إعادة ضبط البيانات */

    const clearData =
      document.getElementById(
        "clearAppData"
      );

    if (clearData) {
      clearData.addEventListener(
        "click",
        clearAppData
      );
    }

    /* تصدير الإعدادات */

    const exportButton =
      document.getElementById(
        "exportSettings"
      );

    if (exportButton) {
      exportButton.addEventListener(
        "click",
        exportSettings
      );
    }

    /* زر الإشعارات */

    const enableNotificationButton =
      document.getElementById(
        "enableNotifications"
      );

    if (
      enableNotificationButton
    ) {
      enableNotificationButton.addEventListener(
        "click",
        async () => {
          const enabled =
            await enableNotifications();

          if (enabled) {
            updateSettingsStatus(
              "تم تفعيل الإشعارات بنجاح"
            );
          }
        }
      );
    }
  }

  /* =========================================================
     تحديث المظهر تلقائيًا عند تغيير
     إعداد النظام
     ========================================================= */

  function watchSystemTheme() {
    if (
      !window.matchMedia
    ) {
      return;
    }

    const media =
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

    const handler =
      () => {
        if (
          getTheme() ===
          "auto"
        ) {
          applyTheme(
            "auto"
          );
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

  /* =========================================================
     API عام
     ========================================================= */

  window.AmirSettings = {
    getCity,
    setCity,

    getTheme,
    setTheme,
    applyTheme,

    getAdhanSettings,
    saveAdhanSettings,

    getNotifications,
    enableNotifications,

    clearAppData,
    exportSettings,

    cities:
      CITIES
  };

  /* =========================================================
     التشغيل
     ========================================================= */

  document.addEventListener(
    "DOMContentLoaded",
    () => {
      applyTheme(
        getTheme()
      );

      updateCityControls();

      updateAdhanControls();

      bindUI();

      watchSystemTheme();
    }
  );

})();
