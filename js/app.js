(function () {
  "use strict";

  /* =========================================================
     أمير مواقيت V2
     Main Application Controller
     ========================================================= */

  const APP_VERSION = "2.0.0";

  let deferredInstallPrompt = null;
  let initialized = false;
  let toastTimer = null;

  /* =========================================================
     Helpers
     ========================================================= */

  function $(selector) {
    return document.querySelector(selector);
  }

  function $$(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  function showToast(message, duration) {
    const toast = $("#amirToast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(function () {
      toast.classList.remove("show");
    }, duration || 2400);
  }

  function vibrate(pattern) {
    try {
      if (navigator.vibrate) {
        navigator.vibrate(pattern || 20);
      }
    } catch (error) {
      /* Vibration is optional */
    }
  }

  /* =========================================================
     Navigation
     ========================================================= */

  function normalizeSection(section) {
    if (!section) return "homeSection";

    const aliases = {
      home: "homeSection",
      homeSection: "homeSection",

      quran: "quranSection",
      quranSection: "quranSection",

      azkar: "azkarSection",
      azkarSection: "azkarSection",

      qibla: "qiblaSection",
      qiblaSection: "qiblaSection",

      settings: "settingsSection",
      settingsSection: "settingsSection"
    };

    return aliases[section] || section;
  }

  function showSection(section, updateHistory) {
    const targetId = normalizeSection(section);
    const target = document.getElementById(targetId);

    if (!target) {
      console.warn(
        "AmirApp: section not found:",
        targetId
      );
      return false;
    }

    $$(".page-section").forEach(function (page) {
      const active = page.id === targetId;

      page.classList.toggle("active", active);
      page.hidden = !active;
    });

    $$("[data-section]").forEach(function (item) {
      const value = normalizeSection(
        item.dataset.section
      );

      item.classList.toggle(
        "active",
        value === targetId
      );

      item.setAttribute(
        "aria-current",
        value === targetId
          ? "page"
          : "false"
      );
    });

    $$("[data-page]").forEach(function (item) {
      const value = normalizeSection(
        item.dataset.page
      );

      item.classList.toggle(
        "active",
        value === targetId
      );
    });

    document.body.dataset.activeSection = targetId;

    if (updateHistory !== false) {
      try {
        history.replaceState(
          { section: targetId },
          "",
          "#" + targetId.replace("Section", "")
        );
      } catch (error) {
        /* History API is optional */
      }
    }

    window.dispatchEvent(
      new CustomEvent("amirSectionChanged", {
        detail: {
          section: targetId
        }
      })
    );

    if (targetId === "qiblaSection") {
      if (
        window.AmirQibla &&
        typeof window.AmirQibla.refresh === "function"
      ) {
        window.AmirQibla.refresh();
      }
    }

    if (targetId === "azkarSection") {
      if (
        window.AmirAzkar &&
        typeof window.AmirAzkar.render === "function"
      ) {
        window.AmirAzkar.render();
      }
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    return true;
  }

  function setupNavigation() {
    $$("[data-section]").forEach(function (item) {
      item.addEventListener("click", function (event) {
        event.preventDefault();

        const section =
          item.dataset.section ||
          item.dataset.page;

        showSection(section, true);

        vibrate(15);
      });
    });

    $$("[data-go-section]").forEach(function (item) {
      item.addEventListener("click", function (event) {
        event.preventDefault();

        showSection(
          item.dataset.goSection,
          true
        );

        vibrate(15);
      });
    });

    $$("[data-page]").forEach(function (item) {
      if (
        item.hasAttribute("data-section") ||
        item.hasAttribute("data-go-section")
      ) {
        return;
      }

      item.addEventListener("click", function (event) {
        event.preventDefault();

        showSection(
          item.dataset.page,
          true
        );

        vibrate(15);
      });
    });

    window.addEventListener(
      "popstate",
      function () {
        const hash =
          location.hash.replace("#", "");

        showSection(
          hash || "homeSection",
          false
        );
      }
    );

    window.addEventListener(
      "hashchange",
      function () {
        const hash =
          location.hash.replace("#", "");

        showSection(
          hash || "homeSection",
          false
        );
      }
    );
  }

  function setupInitialSection() {
    const hash =
      location.hash.replace("#", "");

    if (hash) {
      if (
        showSection(hash, false)
      ) {
        return;
      }
    }

    showSection(
      "homeSection",
      false
    );
  }

  /* =========================================================
     Quick Actions
     ========================================================= */

  function setupQuickActions() {
    const locationButton =
      $("#locationButton");

    const adhanTestButton =
      $("#adhanTestButton");

    const qiblaQuickButton =
      $("#qiblaQuickButton");

    if (locationButton) {
      locationButton.addEventListener(
        "click",
        function () {
          showToast(
            "اختر مدينتك من الإعدادات للحصول على مواقيق دقيقة."
          );

          showSection(
            "settingsSection",
            true
          );
        }
      );
    }

    if (adhanTestButton) {
      adhanTestButton.addEventListener(
        "click",
        async function () {
          if (
            window.AmirAdhan &&
            typeof window.AmirAdhan.test === "function"
          ) {
            try {
              await window.AmirAdhan.test();
              showToast(
                "تم تشغيل الأذان التجريبي"
              );
            } catch (error) {
              console.warn(
                "AmirApp adhan test:",
                error
              );

              showToast(
                "تعذر تشغيل الأذان"
              );
            }
          }
        }
      );
    }

    if (qiblaQuickButton) {
      qiblaQuickButton.addEventListener(
        "click",
        function () {
          showSection(
            "qiblaSection",
            true
          );

          setTimeout(function () {
            if (
              window.AmirQibla &&
              typeof window.AmirQibla.open === "function"
            ) {
              window.AmirQibla.open();
            }
          }, 150);
        }
      );
    }
  }

  /* =========================================================
     Online / Offline
     ========================================================= */

  function updateOnlineStatus() {
    const offlineStatus =
      $("#offlineStatus");

    const online =
      navigator.onLine !== false;

    document.body.classList.toggle(
      "is-offline",
      !online
    );

    if (offlineStatus) {
      offlineStatus.hidden = online;

      offlineStatus.textContent =
        "أنت غير متصل بالإنترنت — سيتم استخدام البيانات المحفوظة.";
    }

    if (online) {
      showToast(
        "تم استعادة الاتصال بالإنترنت"
      );
    }
  }

  function setupNetworkStatus() {
    window.addEventListener(
      "online",
      function () {
        updateOnlineStatus();

        if (
          window.AmirPrayer &&
          typeof window.AmirPrayer.load === "function"
        ) {
          window.AmirPrayer.load().catch(
            function (error) {
              console.warn(
                "AmirApp online prayer refresh:",
                error
              );
            }
          );
        }
      }
    );

    window.addEventListener(
      "offline",
      function () {
        updateOnlineStatus();

        showToast(
          "أنت الآن تعمل دون اتصال"
        );
      }
    );

    updateOnlineStatus(false);
  }

  /* =========================================================
     Service Worker
     ========================================================= */

  async function registerServiceWorker() {
    if (
      !("serviceWorker" in navigator)
    ) {
      return null;
    }

    if (
      location.protocol !== "https:" &&
      location.hostname !== "localhost" &&
      location.hostname !== "127.0.0.1"
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

      registration.addEventListener(
        "updatefound",
        function () {
          const worker =
            registration.installing;

          if (!worker) return;

          worker.addEventListener(
            "statechange",
            function () {
              if (
                worker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                showToast(
                  "تحديث جديد متوفر. أعد فتح التطبيق."
                );
              }
            }
          );
        }
      );

      return registration;
    } catch (error) {
      console.warn(
        "AmirApp Service Worker:",
        error
      );

      return null;
    }
  }

  /* =========================================================
     PWA Installation
     ========================================================= */

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

  function setupInstallPrompt() {
    const banner =
      $("#installBanner");

    const button =
      $("#installButton");

    if (!banner || !button) {
      return;
    }

    window.addEventListener(
      "beforeinstallprompt",
      function (event) {
        event.preventDefault();

        deferredInstallPrompt =
          event;

        if (!isStandalone()) {
          banner.hidden = false;
        }
      }
    );

    button.addEventListener(
      "click",
      async function () {
        if (deferredInstallPrompt) {
          deferredInstallPrompt.prompt();

          try {
            const result =
              await deferredInstallPrompt.userChoice;

            if (
              result &&
              result.outcome === "accepted"
            ) {
              showToast(
                "تم بدء تثبيت أمير مواقيت"
              );
            }
          } catch (error) {
            console.warn(
              "Install prompt:",
              error
            );
          }

          deferredInstallPrompt = null;
          banner.hidden = true;
          return;
        }

        if (isIOS()) {
          showToast(
            "في Safari اضغط مشاركة ثم إضافة إلى الشاشة الرئيسية."
          );
          return;
        }

        showToast(
          "افتح قائمة المتصفح واختر تثبيت التطبيق."
        );
      }
    );

    window.addEventListener(
      "appinstalled",
      function () {
        banner.hidden = true;
        deferredInstallPrompt = null;

        showToast(
          "تم تثبيت أمير مواقيت بنجاح ✓"
        );
      }
    );

    if (isStandalone()) {
      banner.hidden = true;
    } else if (isIOS()) {
      setTimeout(function () {
        banner.hidden = false;
      }, 1200);
    }
  }

  /* =========================================================
     Theme
     ========================================================= */

  function initializeTheme() {
    if (
      window.AmirSettings &&
      typeof window.AmirSettings.applyTheme ===
        "function"
    ) {
      const theme =
        typeof AmirSettings.getTheme === "function"
          ? AmirSettings.getTheme()
          : "auto";

      AmirSettings.applyTheme(
        theme || "auto"
      );
    }
  }

  /* =========================================================
     Clock
     ========================================================= */

  function updateLiveClock() {
    const elements = $$(
      "[data-live-clock]"
    );

    if (!elements.length) {
      return;
    }

    const now = new Date();

    const hours =
      String(now.getHours()).padStart(2, "0");

    const minutes =
      String(now.getMinutes()).padStart(2, "0");

    const seconds =
      String(now.getSeconds()).padStart(2, "0");

    const time =
      hours + ":" + minutes + ":" + seconds;

    elements.forEach(function (element) {
      element.textContent = time;
    });
  }

  function setupLiveClock() {
    updateLiveClock();

    setInterval(
      updateLiveClock,
      1000
    );
  }

  /* =========================================================
     Buttons
     ========================================================= */

  function setupButtonFeedback() {
    document.addEventListener(
      "click",
      function (event) {
        const button =
          event.target.closest("button");

        if (!button) return;

        if (
          button.disabled ||
          button.classList.contains(
            "no-feedback"
          )
        ) {
          return;
        }

        button.classList.add(
          "button-pressed"
        );

        setTimeout(function () {
          button.classList.remove(
            "button-pressed"
          );
        }, 160);
      }
    );
  }

  /* =========================================================
     Visibility Refresh
     ========================================================= */

  function setupVisibilityRefresh() {
    document.addEventListener(
      "visibilitychange",
      function () {
        if (
          document.visibilityState !== "visible"
        ) {
          return;
        }

        if (
          window.AmirPrayer &&
          typeof window.AmirPrayer.updateCountdownUI ===
            "function"
        ) {
          window.AmirPrayer.updateCountdownUI();
        }

        if (
          window.AmirAdhan &&
          typeof window.AmirAdhan.refresh ===
            "function"
        ) {
          window.AmirAdhan.refresh();
        }

        if (
          window.AmirQibla &&
          typeof window.AmirQibla.refresh ===
            "function"
        ) {
          const activeSection =
            document.body.dataset.activeSection;

          if (
            activeSection === "qiblaSection"
          ) {
            window.AmirQibla.refresh();
          }
        }
      }
    );
  }

  /* =========================================================
     Keyboard Shortcuts
     ========================================================= */

  function setupKeyboardShortcuts() {
    document.addEventListener(
      "keydown",
      function (event) {
        if (
          event.target &&
          (
            event.target.tagName === "INPUT" ||
            event.target.tagName === "TEXTAREA" ||
            event.target.tagName === "SELECT"
          )
        ) {
          return;
        }

        if (event.key === "1") {
          showSection(
            "homeSection",
            true
          );
        }

        if (event.key === "2") {
          showSection(
            "quranSection",
            true
          );
        }

        if (event.key === "3") {
          showSection(
            "azkarSection",
            true
          );
        }

        if (event.key === "4") {
          showSection(
            "qiblaSection",
            true
          );
        }

        if (event.key === "5") {
          showSection(
            "settingsSection",
            true
          );
        }
      }
    );
  }

  /* =========================================================
     Version
     ========================================================= */

  function displayVersion() {
    $$("[data-app-version]").forEach(
      function (element) {
        element.textContent =
          "الإصدار " + APP_VERSION;
      }
    );

    const version =
      $("#appVersion");

    if (version) {
      version.textContent =
        "الإصدار " + APP_VERSION;
    }
  }

  /* =========================================================
     Global Events
     ========================================================= */

  function setupGlobalEvents() {
    window.addEventListener(
      "amirCityChanged",
      function () {
        if (
          window.AmirQibla &&
          typeof window.AmirQibla.refresh ===
            "function"
        ) {
          window.AmirQibla.refresh();
        }

        if (
          window.AmirAzkar &&
          typeof window.AmirAzkar.render ===
            "function"
        ) {
          window.AmirAzkar.render();
        }
      }
    );

    window.addEventListener(
      "amirPrayerUpdated",
      function () {
        if (
          window.AmirAdhan &&
          typeof window.AmirAdhan.refresh ===
            "function"
        ) {
          window.AmirAdhan.refresh();
        }
      }
    );
  }

  /* =========================================================
     Initialize Modules
     ========================================================= */

  function initializeModules() {
    if (
      window.AmirSettings &&
      typeof window.AmirSettings.init ===
        "function"
    ) {
      window.AmirSettings.init();
    }

    if (
      window.AmirPrayer &&
      typeof window.AmirPrayer.init ===
        "function"
    ) {
      window.AmirPrayer.init();
    }

    if (
      window.AmirAdhan &&
      typeof window.AmirAdhan.refresh ===
        "function"
    ) {
      window.AmirAdhan.refresh();
    }

    if (
      window.AmirAzkar &&
      typeof window.AmirAzkar.init ===
        "function"
    ) {
      window.AmirAzkar.init();
    }

    if (
      window.AmirQibla &&
      typeof window.AmirQibla.refresh ===
        "function"
    ) {
      window.AmirQibla.refresh();
    }
  }

  /* =========================================================
     Main Init
     ========================================================= */

  async function init() {
    if (initialized) {
      return;
    }

    initialized = true;

    document.documentElement.lang = "ar";
    document.documentElement.dir = "rtl";

    displayVersion();

    initializeTheme();

    setupNavigation();

    setupQuickActions();

    setupNetworkStatus();

    setupInstallPrompt();

    setupLiveClock();

    setupButtonFeedback();

    setupVisibilityRefresh();

    setupKeyboardShortcuts();

    setupGlobalEvents();

    setupInitialSection();

    initializeModules();

    registerServiceWorker();

    console.log(
      "أمير مواقيت V2 started - version " +
        APP_VERSION
    );
  }

  /* =========================================================
     Public API
     ========================================================= */

  window.AmirApp = {
    version: APP_VERSION,
    init,
    showSection,
    showToast,
    isIOS,
    isStandalone
  };

  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init
    );
  } else {
    init();
  }
})();
