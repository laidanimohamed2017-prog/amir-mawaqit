(function () {
  "use strict";

  /* =========================================================
     أمير مواقيت V2
     Settings Module
     ========================================================= */

  const CITY_NAMES = {
    algiers: "الجزائر",
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
    calculationMethod: "19",
    madhhab: "0",
    theme: "auto",
    adhanEnabled: true,
    adhanTiming: "at",
    adhanSound: true,
    adhanVolume: 0.8,
    notifications: false
  };

  let initialized = false;

  function storageAvailable() {
    return Boolean(window.AmirStorage);
  }

  function getCity() {
    if (storageAvailable() && typeof AmirStorage.getCity === "function") {
      return AmirStorage.getCity() || DEFAULTS.city;
    }

    return localStorage.getItem("amirCity") || DEFAULTS.city;
  }

  function setCity(city) {
    if (!city) return false;

    if (storageAvailable() && typeof AmirStorage.setCity === "function") {
      return AmirStorage.setCity(city);
    }

    localStorage.setItem("amirCity", city);
    return true;
  }

  function getTheme() {
    if (storageAvailable() && typeof AmirStorage.getTheme === "function") {
      return AmirStorage.getTheme() || DEFAULTS.theme;
    }

    return localStorage.getItem("amirTheme") || DEFAULTS.theme;
  }

  function setTheme(theme) {
    const validThemes = ["light", "dark", "auto"];

    if (!validThemes.includes(theme)) {
      theme = DEFAULTS.theme;
    }

    if (storageAvailable() && typeof AmirStorage.setTheme === "function") {
      AmirStorage.setTheme(theme);
    } else {
      localStorage.setItem("amirTheme", theme);
    }

    applyTheme(theme);
    return theme;
  }

  function getPrayerSettings() {
    if (
      storageAvailable() &&
      typeof AmirStorage.getPrayerSettings === "function"
    ) {
      return AmirStorage.getPrayerSettings();
    }

    return {
      calculationMethod: DEFAULTS.calculationMethod,
      madhhab: DEFAULTS.madhhab,
      adjustments: {
        Fajr: 0,
        Sunrise: 0,
        Dhuhr: 0,
        Asr: 0,
        Maghrib: 0,
        Isha: 0
      }
    };
  }

  function savePrayerSettings(settings) {
    if (
      storageAvailable() &&
      typeof AmirStorage.setPrayerSettings === "function"
    ) {
      AmirStorage.setPrayerSettings(settings);
    } else {
      localStorage.setItem(
        "amirPrayerSettings",
        JSON.stringify(settings)
      );
    }

    return settings;
  }

  function getAdhanSettings() {
    if (
      storageAvailable() &&
      typeof AmirStorage.getAdhanSettings === "function"
    ) {
      return AmirStorage.getAdhanSettings();
    }

    return {
      enabled: DEFAULTS.adhanEnabled,
      timing: DEFAULTS.adhanTiming,
      sound: DEFAULTS.adhanSound,
      volume: DEFAULTS.adhanVolume
    };
  }

  function saveAdhanSettings(settings) {
    if (
      storageAvailable() &&
      typeof AmirStorage.setAdhanSettings === "function"
    ) {
      return AmirStorage.setAdhanSettings(settings);
    }

    localStorage.setItem(
      "amirAdhanEnabled",
      JSON.stringify(Boolean(settings.enabled))
    );

    localStorage.setItem(
      "amirAdhanTiming",
      JSON.stringify(settings.timing || DEFAULTS.adhanTiming)
    );

    localStorage.setItem(
      "amirAdhanSound",
      JSON.stringify(Boolean(settings.sound))
    );

    localStorage.setItem(
      "amirAdhanVolume",
      JSON.stringify(
        Math.max(0, Math.min(1, Number(settings.volume) || 0))
      )
    );

    return settings;
  }

  function getNotificationsEnabled() {
    if (
      storageAvailable() &&
      typeof AmirStorage.getNotificationsEnabled === "function"
    ) {
      return AmirStorage.getNotificationsEnabled();
    }

    return Boolean(
      JSON.parse(
        localStorage.getItem("amirNotifications") || "false"
      )
    );
  }

  function setNotificationsEnabled(value) {
    if (
      storageAvailable() &&
      typeof AmirStorage.setNotificationsEnabled === "function"
    ) {
      return AmirStorage.setNotificationsEnabled(Boolean(value));
    }

    localStorage.setItem(
      "amirNotifications",
      JSON.stringify(Boolean(value))
    );

    return true;
  }

  function applyTheme(theme) {
    let actualTheme = theme;

    if (theme === "auto") {
      actualTheme = window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    document.documentElement.dataset.theme = actualTheme;
    document.body.classList.toggle(
      "dark-mode",
      actualTheme === "dark"
    );

    const darkMode = document.getElementById("darkMode");

    if (darkMode) {
      darkMode.checked = actualTheme === "dark";
    }
  }

  function populateCities() {
    const select = document.getElementById("citySelect");

    if (!select) return;

    const currentCity = getCity();

    select.innerHTML = "";

    Object.keys(CITY_NAMES).forEach(function (key) {
      const option = document.createElement("option");

      option.value = key;
      option.textContent = CITY_NAMES[key];

      if (key === currentCity) {
        option.selected = true;
      }

      select.appendChild(option);
    });
  }

  function loadPrayerSettingsUI() {
    const settings = getPrayerSettings();

    const method = document.getElementById("calculationMethod");
    const madhhab = document.getElementById("madhhab");

    if (method) {
      method.value =
        settings.calculationMethod ||
        DEFAULTS.calculationMethod;
    }

    if (madhhab) {
      madhhab.value =
        settings.madhhab ||
        DEFAULTS.madhhab;
    }
  }

  function loadThemeUI() {
    const theme = getTheme();

    const themeSelect = document.getElementById("themeSelect");
    const darkMode = document.getElementById("darkMode");

    if (themeSelect) {
      themeSelect.value = theme;
    }

    if (darkMode) {
      let dark = false;

      if (theme === "dark") {
        dark = true;
      } else if (theme === "auto") {
        dark = window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches;
      }

      darkMode.checked = Boolean(dark);
    }

    applyTheme(theme);
  }

  function loadAdhanUI() {
    const settings = getAdhanSettings();

    const enabled = document.getElementById("adhanEnabled");
    const timing = document.getElementById("adhanTiming");
    const sound = document.getElementById("adhanSound");
    const volume = document.getElementById("adhanVolume");

    if (enabled) {
      enabled.checked = Boolean(settings.enabled);
    }

    if (timing) {
      timing.value = settings.timing || DEFAULTS.adhanTiming;
    }

    if (sound) {
      sound.checked = Boolean(settings.sound);
    }

    if (volume) {
      const value = Math.round(
        Number(settings.volume) * 100
      );

      volume.value = String(value);

      updateVolumeLabel(value);
    }
  }

  function loadNotificationUI() {
    const enabled = document.getElementById(
      "notificationsEnabled"
    );

    if (enabled) {
      enabled.checked = getNotificationsEnabled();
    }
  }

  function updateVolumeLabel(value) {
    const labels = [
      document.getElementById("adhanVolumeValue"),
      document.getElementById("volumeValue")
    ];

    labels.forEach(function (label) {
      if (label) {
        label.textContent = Math.round(Number(value)) + "%";
      }
    });
  }

  async function handleCityChange(city) {
    if (!city) return;

    setCity(city);

    window.dispatchEvent(
      new CustomEvent("amirCityChanged", {
        detail: {
          city: city
        }
      })
    );

    if (
      window.AmirPrayer &&
      typeof window.AmirPrayer.setCity === "function"
    ) {
      try {
        await window.AmirPrayer.setCity(city);
      } catch (error) {
        console.warn("AmirSettings city change:", error);
      }
    }

    showToast(
      "تم تغيير المدينة إلى " +
      (CITY_NAMES[city] || city)
    );
  }

  function handlePrayerSettingsChange() {
    const method = document.getElementById(
      "calculationMethod"
    );

    const madhhab = document.getElementById("madhhab");

    const current = getPrayerSettings();

    const settings = {
      calculationMethod:
        method && method.value
          ? method.value
          : current.calculationMethod,

      madhhab:
        madhhab && madhhab.value
          ? madhhab.value
          : current.madhhab,

      adjustments: current.adjustments || {
        Fajr: 0,
        Sunrise: 0,
        Dhuhr: 0,
        Asr: 0,
        Maghrib: 0,
        Isha: 0
      }
    };

    savePrayerSettings(settings);

    if (
      window.AmirPrayer &&
      typeof window.AmirPrayer.load === "function"
    ) {
      window.AmirPrayer.load().catch(function (error) {
        console.warn("AmirSettings prayer reload:", error);
      });
    }

    showToast("تم حفظ إعدادات مواقيت الصلاة");
  }

  function handleThemeChange(theme) {
    setTheme(theme);

    showToast("تم تغيير مظهر التطبيق");
  }

  function handleDarkModeChange(enabled) {
    setTheme(enabled ? "dark" : "light");

    const themeSelect = document.getElementById(
      "themeSelect"
    );

    if (themeSelect) {
      themeSelect.value = enabled ? "dark" : "light";
    }
  }

  function handleAdhanChange() {
    const current = getAdhanSettings();

    const enabled = document.getElementById("adhanEnabled");
    const timing = document.getElementById("adhanTiming");
    const sound = document.getElementById("adhanSound");
    const volume = document.getElementById("adhanVolume");

    const settings = {
      enabled: enabled
        ? enabled.checked
        : current.enabled,

      timing: timing
        ? timing.value
        : current.timing,

      sound: sound
        ? sound.checked
        : current.sound,

      volume: volume
        ? Number(volume.value) / 100
        : current.volume
    };

    saveAdhanSettings(settings);

    if (
      window.AmirAdhan &&
      typeof window.AmirAdhan.refresh === "function"
    ) {
      window.AmirAdhan.refresh();
    }

    return settings;
  }

  async function testAdhan() {
    handleAdhanChange();

    if (
      window.AmirAdhan &&
      typeof window.AmirAdhan.test === "function"
    ) {
      try {
        await window.AmirAdhan.test();
        showToast("تم تشغيل الأذان التجريبي");
      } catch (error) {
        console.warn("AmirSettings test adhan:", error);
        showToast(
          "تعذر تشغيل الأذان. اضغط على زر الاختبار مرة أخرى."
        );
      }
    }
  }

  function stopAdhan() {
    if (
      window.AmirAdhan &&
      typeof window.AmirAdhan.stop === "function"
    ) {
      window.AmirAdhan.stop();
      showToast("تم إيقاف الأذان");
    }
  }

  async function enableNotifications() {
    if (
      !("Notification" in window)
    ) {
      showToast("الإشعارات غير مدعومة في هذا المتصفح");
      return;
    }

    if (
      window.AmirAdhan &&
      typeof window.AmirAdhan.requestNotificationPermission ===
        "function"
    ) {
      try {
        const permission =
          await window.AmirAdhan.requestNotificationPermission();

        if (permission === "granted") {
          setNotificationsEnabled(true);

          const checkbox = document.getElementById(
            "notificationsEnabled"
          );

          if (checkbox) {
            checkbox.checked = true;
          }

          showToast("تم تفعيل الإشعارات");
        } else {
          setNotificationsEnabled(false);

          const checkbox = document.getElementById(
            "notificationsEnabled"
          );

          if (checkbox) {
            checkbox.checked = false;
          }

          showToast("لم يتم السماح بالإشعارات");
        }
      } catch (error) {
        console.warn(
          "AmirSettings notification permission:",
          error
        );
      }

      return;
    }

    try {
      const permission =
        await Notification.requestPermission();

      const enabled = permission === "granted";

      setNotificationsEnabled(enabled);

      const checkbox = document.getElementById(
        "notificationsEnabled"
      );

      if (checkbox) {
        checkbox.checked = enabled;
      }

      showToast(
        enabled
          ? "تم تفعيل الإشعارات"
          : "لم يتم السماح بالإشعارات"
      );
    } catch (error) {
      console.warn(
        "AmirSettings notification:",
        error
      );
    }
  }

  function exportSettings() {
    let data = {};

    if (
      window.AmirStorage &&
      typeof AmirStorage.exportData === "function"
    ) {
      data = AmirStorage.exportData();
    } else {
      data = {
        city: getCity(),
        theme: getTheme(),
        prayerSettings: getPrayerSettings(),
        adhanSettings: getAdhanSettings(),
        notifications: getNotificationsEnabled()
      };
    }

    data.amirMawaqitExportVersion = "2.0";
    data.exportedAt = new Date().toISOString();

    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      {
        type: "application/json"
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download =
      "amir-mawaqit-settings-" +
      new Date().toISOString().slice(0, 10) +
      ".json";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);

    showToast("تم تصدير إعدادات أمير مواقيت");
  }

  function clearAppData() {
    const confirmed = confirm(
      "سيتم حذف إعدادات أمير مواقيت والعدادات والمفضلة المحفوظة على هذا الجهاز.\n\nهل تريد المتابعة؟"
    );

    if (!confirmed) return;

    if (
      window.AmirStorage &&
      typeof AmirStorage.clearAll === "function"
    ) {
      AmirStorage.clearAll();
    } else {
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
        "amirQiblaSettings",
        "amirInstallDismissed",
        "amirFirstRun"
      ];

      keys.forEach(function (key) {
        localStorage.removeItem(key);
      });
    }

    showToast("تم حذف البيانات المحفوظة");

    setTimeout(function () {
      location.reload();
    }, 700);
  }

  function setupEvents() {
    const citySelect =
      document.getElementById("citySelect");

    const method =
      document.getElementById("calculationMethod");

    const madhhab =
      document.getElementById("madhhab");

    const themeSelect =
      document.getElementById("themeSelect");

    const darkMode =
      document.getElementById("darkMode");

    const adhanEnabled =
      document.getElementById("adhanEnabled");

    const adhanTiming =
      document.getElementById("adhanTiming");

    const adhanSound =
      document.getElementById("adhanSound");

    const adhanVolume =
      document.getElementById("adhanVolume");

    const testButton =
      document.getElementById("testAdhan");

    const stopButton =
      document.getElementById("stopAdhan");

    const notificationsEnabled =
      document.getElementById("notificationsEnabled");

    const enableNotificationsButton =
      document.getElementById("enableNotifications");

    const exportButton =
      document.getElementById("exportSettings");

    const clearButton =
      document.getElementById("clearAppData");

    if (citySelect) {
      citySelect.addEventListener("change", function () {
        handleCityChange(citySelect.value);
      });
    }

    if (method) {
      method.addEventListener(
        "change",
        handlePrayerSettingsChange
      );
    }

    if (madhhab) {
      madhhab.addEventListener(
        "change",
        handlePrayerSettingsChange
      );
    }

    if (themeSelect) {
      themeSelect.addEventListener(
        "change",
        function () {
          handleThemeChange(themeSelect.value);
        }
      );
    }

    if (darkMode) {
      darkMode.addEventListener(
        "change",
        function () {
          handleDarkModeChange(darkMode.checked);
        }
      );
    }

    if (adhanEnabled) {
      adhanEnabled.addEventListener(
        "change",
        handleAdhanChange
      );
    }

    if (adhanTiming) {
      adhanTiming.addEventListener(
        "change",
        handleAdhanChange
      );
    }

    if (adhanSound) {
      adhanSound.addEventListener(
        "change",
        handleAdhanChange
      );
    }

    if (adhanVolume) {
      adhanVolume.addEventListener(
        "input",
        function () {
          updateVolumeLabel(adhanVolume.value);
          handleAdhanChange();
        }
      );
    }

    if (testButton) {
      testButton.addEventListener(
        "click",
        testAdhan
      );
    }

    if (stopButton) {
      stopButton.addEventListener(
        "click",
        stopAdhan
      );
    }

    if (notificationsEnabled) {
      notificationsEnabled.addEventListener(
        "change",
        function () {
          if (notificationsEnabled.checked) {
            enableNotifications();
          } else {
            setNotificationsEnabled(false);
            showToast("تم إيقاف الإشعارات");
          }
        }
      );
    }

    if (enableNotificationsButton) {
      enableNotificationsButton.addEventListener(
        "click",
        enableNotifications
      );
    }

    if (exportButton) {
      exportButton.addEventListener(
        "click",
        exportSettings
      );
    }

    if (clearButton) {
      clearButton.addEventListener(
        "click",
        clearAppData
      );
    }

    if (
      window.matchMedia
    ) {
      const mediaQuery =
        window.matchMedia(
          "(prefers-color-scheme: dark)"
        );

      const handleSystemThemeChange = function () {
        if (getTheme() === "auto") {
          applyTheme("auto");
        }
      };

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener(
          "change",
          handleSystemThemeChange
        );
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(
          handleSystemThemeChange
        );
      }
    }
  }

  function showToast(message) {
    if (
      window.AmirApp &&
      typeof window.AmirApp.showToast === "function"
    ) {
      window.AmirApp.showToast(message);
      return;
    }

    const toast =
      document.getElementById("amirToast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(function () {
      toast.classList.remove("show");
    }, 2200);
  }

  function loadUI() {
    populateCities();
    loadPrayerSettingsUI();
    loadThemeUI();
    loadAdhanUI();
    loadNotificationUI();
  }

  function init() {
    if (initialized) return;

    initialized = true;

    loadUI();
    setupEvents();
  }

  window.AmirSettings = {
    init,
    getCity,
    setCity,
    getTheme,
    setTheme,
    getPrayerSettings,
    savePrayerSettings,
    getAdhanSettings,
    saveAdhanSettings,
    getNotificationsEnabled,
    setNotificationsEnabled,
    applyTheme,
    loadUI,
    exportSettings,
    clearAppData
  };

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      init
    );
  } else {
    init();
  }
})();
