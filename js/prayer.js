/* =========================================================
   أمير مواقيت V2
   prayer.js
   مواقيت الصلاة - Aladhan API
   ========================================================= */

(function () {
  "use strict";

  const API_BASE = "https://api.aladhan.com/v1";

  const CITIES = {
    algiers: {
      name: "الجزائر العاصمة",
      lat: 36.7538,
      lng: 3.0588
    },
    oran: {
      name: "وهران",
      lat: 35.6971,
      lng: -0.6308
    },
    constantine: {
      name: "قسنطينة",
      lat: 36.3650,
      lng: 6.6147
    },
    annaba: {
      name: "عنابة",
      lat: 36.9000,
      lng: 7.7667
    },
    blida: {
      name: "البليدة",
      lat: 36.4700,
      lng: 2.8300
    },
    setif: {
      name: "سطيف",
      lat: 36.1900,
      lng: 5.4100
    },
    tlemcen: {
      name: "تلمسان",
      lat: 34.8828,
      lng: -1.3167
    },
    ain_oussera: {
      name: "عين وسارة",
      lat: 35.4513,
      lng: 2.9067
    }
  };

  const PRAYER_KEYS = [
    "Fajr",
    "Sunrise",
    "Dhuhr",
    "Asr",
    "Maghrib",
    "Isha"
  ];

  const PRAYER_NAMES = {
    Fajr: "الفجر",
    Sunrise: "الشروق",
    Dhuhr: "الظهر",
    Asr: "العصر",
    Maghrib: "المغرب",
    Isha: "العشاء"
  };

  const PRAYER_ICONS = {
    Fajr: "🌅",
    Sunrise: "☀️",
    Dhuhr: "🌞",
    Asr: "🌤️",
    Maghrib: "🌇",
    Isha: "🌙"
  };

  let state = {
    cityKey: getSavedCity(),
    city: null,
    timings: null,
    date: null,
    hijri: null,
    meta: null,
    loading: false,
    error: null,
    lastUpdated: null
  };

  let countdownTimer = null;

  /* =========================================================
     التخزين
     ========================================================= */

  function getSavedCity() {
    try {
      if (
        window.AmirStorage &&
        typeof window.AmirStorage.getCity === "function"
      ) {
        return window.AmirStorage.getCity() || "ain_oussera";
      }

      return localStorage.getItem("amirCity") || "ain_oussera";
    } catch (error) {
      return "ain_oussera";
    }
  }

  function saveCity(cityKey) {
    try {
      if (
        window.AmirStorage &&
        typeof window.AmirStorage.setCity === "function"
      ) {
        window.AmirStorage.setCity(cityKey);
      } else {
        localStorage.setItem("amirCity", cityKey);
      }
    } catch (error) {
      console.warn("تعذر حفظ المدينة:", error);
    }
  }

  function getPrayerSettings() {
    const defaults = {
      calculationMethod: "19",
      madhhab: "0",
      adjustments: {}
    };

    try {
      if (
        window.AmirStorage &&
        typeof window.AmirStorage.getPrayerSettings === "function"
      ) {
        return Object.assign(
          {},
          defaults,
          window.AmirStorage.getPrayerSettings() || {}
        );
      }
    } catch (error) {
      console.warn("تعذر قراءة إعدادات الصلاة:", error);
    }

    return defaults;
  }

  /* =========================================================
     أدوات التاريخ
     ========================================================= */

  function pad(number) {
    return String(number).padStart(2, "0");
  }

  function getTodayDate() {
    const now = new Date();

    return (
      now.getFullYear() +
      "-" +
      pad(now.getMonth() + 1) +
      "-" +
      pad(now.getDate())
    );
  }

  function formatArabicDate(dateObject) {
    if (!dateObject) {
      return "";
    }

    try {
      const date = new Date(dateObject);

      return new Intl.DateTimeFormat("ar-DZ", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(date);
    } catch (error) {
      return dateObject.toLocaleDateString();
    }
  }

  /* =========================================================
     تحويل وقت الصلاة إلى دقائق
     ========================================================= */

  function timeToMinutes(time) {
    if (!time || typeof time !== "string") {
      return null;
    }

    const clean = time.split(" ")[0].trim();
    const parts = clean.split(":");

    if (parts.length < 2) {
      return null;
    }

    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return null;
    }

    return hours * 60 + minutes;
  }

  function cleanTime(time) {
    if (!time) {
      return "--:--";
    }

    return String(time).split(" ")[0].trim();
  }

  function minutesToTime(minutes) {
    let total = Number(minutes);

    if (!Number.isFinite(total)) {
      return "--:--";
    }

    total = ((total % 1440) + 1440) % 1440;

    const hours = Math.floor(total / 60);
    const mins = Math.floor(total % 60);

    return pad(hours) + ":" + pad(mins);
  }

  /* =========================================================
     جلب البيانات من API
     ========================================================= */

  async function fetchPrayerData(dateString, cityKey) {
    const city = CITIES[cityKey];

    if (!city) {
      throw new Error("المدينة غير موجودة");
    }

    const settings = getPrayerSettings();

    const method = encodeURIComponent(
      settings.calculationMethod || "19"
    );

    const school = encodeURIComponent(
      settings.madhhab || "0"
    );

    const url =
      API_BASE +
      "/timings/" +
      encodeURIComponent(dateString) +
      "?latitude=" +
      encodeURIComponent(city.lat) +
      "&longitude=" +
      encodeURIComponent(city.lng) +
      "&method=" +
      method +
      "&school=" +
      school;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json"
      },
      cache: "no-cache"
    });

    if (!response.ok) {
      throw new Error("تعذر الاتصال بخدمة مواقيت الصلاة");
    }

    const json = await response.json();

    if (
      !json ||
      json.code !== 200 ||
      !json.data ||
      !json.data.timings
    ) {
      throw new Error("بيانات المواقيت غير صالحة");
    }

    return json.data;
  }

  /* =========================================================
     تطبيق التعديلات اليدوية
     ========================================================= */

  function applyAdjustments(timings) {
    const settings = getPrayerSettings();
    const adjustments = settings.adjustments || {};

    const result = Object.assign({}, timings);

    PRAYER_KEYS.forEach(function (key) {
      if (!result[key]) {
        return;
      }

      const adjustment = Number(adjustments[key] || 0);

      if (!adjustment) {
        result[key] = cleanTime(result[key]);
        return;
      }

      const originalMinutes = timeToMinutes(result[key]);

      if (originalMinutes === null) {
        result[key] = cleanTime(result[key]);
        return;
      }

      result[key] = minutesToTime(
        originalMinutes + adjustment
      );
    });

    return result;
  }

  /* =========================================================
     التخزين المؤقت
     ========================================================= */

  function saveCache(data) {
    try {
      if (
        window.AmirStorage &&
        typeof window.AmirStorage.setPrayerCache === "function"
      ) {
        window.AmirStorage.setPrayerCache(data);
      } else {
        localStorage.setItem(
          "amirMawaqitCache",
          JSON.stringify(data)
        );
      }
    } catch (error) {
      console.warn("تعذر حفظ المواقيت:", error);
    }
  }

  function getCache() {
    try {
      if (
        window.AmirStorage &&
        typeof window.AmirStorage.getPrayerCache === "function"
      ) {
        return window.AmirStorage.getPrayerCache();
      }

      const raw = localStorage.getItem("amirMawaqitCache");

      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  /* =========================================================
     بناء الحالة
     ========================================================= */

  function buildState(data, cityKey) {
    const city = CITIES[cityKey];

    const timings = applyAdjustments(data.timings);

    state.cityKey = cityKey;
    state.city = city;
    state.timings = timings;
    state.date = data.date || null;
    state.hijri = data.date && data.date.hijri
      ? data.date.hijri
      : null;
    state.meta = data.meta || null;
    state.lastUpdated = Date.now();
    state.error = null;

    return state;
  }

  /* =========================================================
     تحميل المواقيت
     ========================================================= */

  async function load(options = {}) {
    const cityKey = options.cityKey || getSavedCity();
    const dateString = options.date || getTodayDate();

    if (!CITIES[cityKey]) {
      state.error = "المدينة غير موجودة";
      return state;
    }

    if (state.loading) {
      return state;
    }

    state.loading = true;
    state.error = null;

    updateStatus("جاري تحديث المواقيت...", "loading");

    try {
      const data = await fetchPrayerData(
        dateString,
        cityKey
      );

      buildState(data, cityKey);

      saveCache({
        cityKey: cityKey,
        date: dateString,
        timings: state.timings,
        hijri: state.hijri,
        meta: state.meta,
        savedAt: Date.now()
      });

      saveCity(cityKey);

      render();

      updateStatus("تم تحديث المواقيت", "success");

      dispatchChange();

      return state;
    } catch (error) {
      console.error("AmirPrayer:", error);

      state.error =
        error && error.message
          ? error.message
          : "تعذر تحميل مواقيت الصلاة";

      const cached = getCache();

      if (
        cached &&
        cached.cityKey === cityKey &&
        cached.timings
      ) {
        state.cityKey = cityKey;
        state.city = CITIES[cityKey];
        state.timings = cached.timings;
        state.hijri = cached.hijri || null;
        state.meta = cached.meta || null;
        state.date = {
          readable: getTodayDate()
        };

        render();

        updateStatus(
          "تم استخدام آخر مواقيت محفوظة",
          "offline"
        );

        dispatchChange();

        return state;
      }

      updateStatus(
        "تعذر تحميل المواقيت",
        "error"
      );

      return state;
    } finally {
      state.loading = false;
    }
  }

  /* =========================================================
     تغيير المدينة
     ========================================================= */

  async function setCity(cityKey) {
    if (!CITIES[cityKey]) {
      return false;
    }

    saveCity(cityKey);

    state.cityKey = cityKey;
    state.city = CITIES[cityKey];

    await load({
      cityKey: cityKey
    });

    return true;
  }

  /* =========================================================
     تحديد الصلاة القادمة
     ========================================================= */

  function getTodaySchedule() {
    if (!state.timings) {
      return [];
    }

    return PRAYER_KEYS
      .filter(function (key) {
        return state.timings[key];
      })
      .map(function (key) {
        return {
          key: key,
          name: PRAYER_NAMES[key] || key,
          icon: PRAYER_ICONS[key] || "🕌",
          time: cleanTime(state.timings[key]),
          minutes: timeToMinutes(state.timings[key])
        };
      });
  }

  function getNextPrayer() {
    const schedule = getTodaySchedule();

    if (!schedule.length) {
      return null;
    }

    const now = new Date();

    const currentMinutes =
      now.getHours() * 60 + now.getMinutes();

    const currentSeconds =
      currentMinutes * 60 + now.getSeconds();

    for (let i = 0; i < schedule.length; i++) {
      const prayer = schedule[i];

      if (prayer.minutes === null) {
        continue;
      }

      const prayerSeconds = prayer.minutes * 60;

      if (prayerSeconds > currentSeconds) {
        return Object.assign({}, prayer, {
          secondsRemaining:
            prayerSeconds - currentSeconds
        });
      }
    }

    const first = schedule[0];

    if (first && first.minutes !== null) {
      return Object.assign({}, first, {
        secondsRemaining:
          86400 -
          currentSeconds +
          first.minutes * 60
      });
    }

    return null;
  }

  function getCurrentPrayer() {
    const schedule = getTodaySchedule();

    if (!schedule.length) {
      return null;
    }

    const now = new Date();

    const currentSeconds =
      (now.getHours() * 60 + now.getMinutes()) * 60 +
      now.getSeconds();

    let current = null;

    schedule.forEach(function (prayer) {
      if (prayer.minutes === null) {
        return;
      }

      const prayerSeconds = prayer.minutes * 60;

      if (prayerSeconds <= currentSeconds) {
        current = prayer;
      }
    });

    return current;
  }

  /* =========================================================
     العد التنازلي
     ========================================================= */

  function formatCountdown(seconds) {
    if (!Number.isFinite(seconds)) {
      return "--:--:--";
    }

    let remaining = Math.max(0, Math.floor(seconds));

    const hours = Math.floor(remaining / 3600);

    remaining %= 3600;

    const minutes = Math.floor(remaining / 60);
    const secs = remaining % 60;

    return (
      pad(hours) +
      ":" +
      pad(minutes) +
      ":" +
      pad(secs)
    );
  }

  function startCountdown() {
    stopCountdown();

    countdownTimer = setInterval(function () {
      updateCountdownUI();
    }, 1000);

    updateCountdownUI();
  }

  function stopCountdown() {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }

  function updateCountdownUI() {
    const countdownElement =
      document.getElementById("countdown");

    const nextPrayerElement =
      document.getElementById("nextPrayerName");

    if (!countdownElement && !nextPrayerElement) {
      return;
    }

    const next = getNextPrayer();

    if (!next) {
      if (countdownElement) {
        countdownElement.textContent = "--:--:--";
      }

      if (nextPrayerElement) {
        nextPrayerElement.textContent = "—";
      }

      return;
    }

    if (nextPrayerElement) {
      nextPrayerElement.textContent =
        "الصلاة القادمة: " + next.name;
    }

    if (countdownElement) {
      countdownElement.textContent =
        formatCountdown(next.secondsRemaining);
    }

    updatePrayerProgress();
  }

  /* =========================================================
     نسبة التقدم
     ========================================================= */

  function updatePrayerProgress() {
    const progress =
      document.getElementById("prayerProgress");

    if (!progress) {
      return;
    }

    const next = getNextPrayer();

    if (!next) {
      progress.style.width = "0%";
      return;
    }

    const schedule = getTodaySchedule();

    const index = schedule.findIndex(function (item) {
      return item.key === next.key;
    });

    if (index < 0) {
      progress.style.width = "0%";
      return;
    }

    const previous =
      index > 0
        ? schedule[index - 1]
        : {
            minutes: schedule[schedule.length - 1].minutes - 1440
          };

    const now = new Date();

    let nowMinutes =
      now.getHours() +
      now.getMinutes() / 60 +
      now.getSeconds() / 3600;

    let startMinutes =
      previous.minutes / 60;

    let endMinutes =
      next.minutes / 60;

    if (index === 0 && endMinutes < nowMinutes) {
      endMinutes += 24;
    }

    if (startMinutes < 0) {
      startMinutes += 24;
    }

    if (index === 0 && nowMinutes < endMinutes - 24) {
      nowMinutes += 24;
    }

    const total = endMinutes - startMinutes;
    const elapsed = nowMinutes - startMinutes;

    let percentage = 0;

    if (total > 0) {
      percentage = (elapsed / total) * 100;
    }

    percentage = Math.max(
      0,
      Math.min(100, percentage)
    );

    progress.style.width = percentage + "%";
  }

  /* =========================================================
     عرض مواقيت الصلاة
     ========================================================= */

  function renderPrayerGrid() {
    const grid =
      document.getElementById("prayerGrid");

    if (!grid || !state.timings) {
      return;
    }

    const next = getNextPrayer();

    grid.innerHTML = "";

    PRAYER_KEYS.forEach(function (key) {
      if (!state.timings[key]) {
        return;
      }

      const time = cleanTime(state.timings[key]);

      const card = document.createElement("div");

      card.className = "prayer-card";

      if (next && next.key === key) {
        card.classList.add("current-prayer");
      }

      card.innerHTML = `
        <div class="prayer-icon">
          ${PRAYER_ICONS[key] || "🕌"}
        </div>

        <div class="prayer-info">
          <div class="prayer-name">
            ${PRAYER_NAMES[key] || key}
          </div>

          <div class="prayer-time">
            ${time}
          </div>
        </div>
      `;

      grid.appendChild(card);
    });
  }

  /* =========================================================
     عرض التاريخ
     ========================================================= */

  function renderDates() {
    const gregorian =
      document.getElementById("gregorianDate");

    const hijri =
      document.getElementById("hijriDate");

    if (gregorian) {
      gregorian.textContent =
        formatArabicDate(new Date());
    }

    if (hijri) {
      if (state.hijri) {
        const day = state.hijri.day || "";
        const month =
          state.hijri.month &&
          state.hijri.month.ar
            ? state.hijri.month.ar
            : state.hijri.month &&
              state.hijri.month.en
              ? state.hijri.month.en
              : "";

        const year = state.hijri.year || "";

        hijri.textContent =
          day + " " + month + " " + year + " هـ";
      } else {
        hijri.textContent = "";
      }
    }
  }

  /* =========================================================
     عرض اسم المدينة
     ========================================================= */

  function renderCity() {
    const cityName =
      document.getElementById("cityName");

    if (!cityName) {
      return;
    }

    cityName.textContent =
      state.city && state.city.name
        ? state.city.name
        : "عين وسارة";
  }

  /* =========================================================
     الحالة
     ========================================================= */

  function updateStatus(message, type) {
    const element =
      document.getElementById("prayerUpdateStatus");

    if (!element) {
      return;
    }

    element.textContent = message;

    element.classList.remove(
      "success",
      "error",
      "loading",
      "offline"
    );

    if (type) {
      element.classList.add(type);
    }
  }

  /* =========================================================
     العرض الكامل
     ========================================================= */

  function render() {
    renderCity();
    renderDates();
    renderPrayerGrid();
    updateCountdownUI();
  }

  /* =========================================================
     حدث تغيير المواقيت
     ========================================================= */

  function dispatchChange() {
    try {
      window.dispatchEvent(
        new CustomEvent("amirPrayerUpdated", {
          detail: getState()
        })
      );
    } catch (error) {
      console.warn("amirPrayerUpdated:", error);
    }
  }

  /* =========================================================
     البيانات العامة
     ========================================================= */

  function getState() {
    return {
      cityKey: state.cityKey,
      city: state.city,
      timings: state.timings,
      date: state.date,
      hijri: state.hijri,
      meta: state.meta,
      loading: state.loading,
      error: state.error,
      lastUpdated: state.lastUpdated
    };
  }

  function getCityList() {
    return Object.keys(CITIES).map(function (key) {
      return {
        key: key,
        name: CITIES[key].name,
        lat: CITIES[key].lat,
        lng: CITIES[key].lng
      };
    });
  }

  function getCityCoordinates(cityKey) {
    const city = CITIES[cityKey];

    if (!city) {
      return null;
    }

    return {
      lat: city.lat,
      lng: city.lng,
      name: city.name
    };
  }

  /* =========================================================
     بدء التشغيل
     ========================================================= */

  function init() {
    state.cityKey = getSavedCity();
    state.city = CITIES[state.cityKey] || CITIES.ain_oussera;

    render();
    startCountdown();

    load({
      cityKey: state.cityKey
    });
  }

  /* =========================================================
     أحداث عامة
     ========================================================= */

  window.addEventListener(
    "amirCityChanged",
    function (event) {
      const cityKey =
        event &&
        event.detail &&
        event.detail.cityKey
          ? event.detail.cityKey
          : getSavedCity();

      if (CITIES[cityKey]) {
        load({
          cityKey: cityKey
        });
      }
    }
  );

  document.addEventListener(
    "visibilitychange",
    function () {
      if (!document.hidden) {
        updateCountdownUI();
      }
    }
  );

  /* =========================================================
     API
     ========================================================= */

  window.AmirPrayer = {
    CITIES,
    PRAYER_KEYS,
    PRAYER_NAMES,

    init,
    load,
    setCity,

    getState,
    getCityList,
    getCityCoordinates,

    getTodaySchedule,
    getNextPrayer,
    getCurrentPrayer,

    timeToMinutes,
    minutesToTime,
    cleanTime,

    render,
    startCountdown,
    stopCountdown,
    updateCountdownUI
  };

  /* =========================================================
     تشغيل تلقائي
     ========================================================= */

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      init
    );
  } else {
    init();
  }

})();
