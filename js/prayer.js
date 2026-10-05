/* =========================================================
   أمير مواقيت V2 - Prayer Engine
   js/prayer.js
   ========================================================= */

(function () {
  "use strict";

  const API_BASE = "https://api.aladhan.com/v1";

  const CITIES = {
    algiers: {
      name: "الجزائر",
      latitude: 36.7538,
      longitude: 3.0588
    },
    oran: {
      name: "وهران",
      latitude: 35.6971,
      longitude: -0.6308
    },
    constantine: {
      name: "قسنطينة",
      latitude: 36.3650,
      longitude: 6.6147
    },
    annaba: {
      name: "عنابة",
      latitude: 36.9000,
      longitude: 7.7667
    },
    blida: {
      name: "البليدة",
      latitude: 36.4700,
      longitude: 2.8300
    },
    setif: {
      name: "سطيف",
      latitude: 36.1900,
      longitude: 5.4100
    },
    tlemcen: {
      name: "تلمسان",
      latitude: 34.8828,
      longitude: -1.3167
    },
    ain_oussera: {
      name: "عين وسارة",
      latitude: 35.4513,
      longitude: 2.9067
    }
  };

  const PRAYERS = [
    {
      key: "Fajr",
      name: "الفجر",
      icon: "🌅"
    },
    {
      key: "Sunrise",
      name: "الشروق",
      icon: "☀️"
    },
    {
      key: "Dhuhr",
      name: "الظهر",
      icon: "🕛"
    },
    {
      key: "Asr",
      name: "العصر",
      icon: "🌤️"
    },
    {
      key: "Maghrib",
      name: "المغرب",
      icon: "🌇"
    },
    {
      key: "Isha",
      name: "العشاء",
      icon: "🌙"
    }
  ];

  let state = {
    cityKey: "ain_oussera",
    city: null,
    timings: null,
    meta: null,
    date: null,
    loading: false,
    error: null,
    timer: null
  };

  /* =========================================================
     أدوات عامة
     ========================================================= */

  function getElement(selector) {
    return document.querySelector(selector);
  }

  function getElements(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  function safeText(element, value) {
    if (!element) return;
    element.textContent = value == null ? "" : String(value);
  }

  function pad(number) {
    return String(number).padStart(2, "0");
  }

  function localDateKey(date) {
    const d = date instanceof Date ? date : new Date(date);

    return [
      d.getFullYear(),
      pad(d.getMonth() + 1),
      pad(d.getDate())
    ].join("-");
  }

  function formatApiDate(date) {
    const d = date instanceof Date ? date : new Date(date);

    return [
      pad(d.getDate()),
      pad(d.getMonth() + 1),
      d.getFullYear()
    ].join("-");
  }

  function cleanTime(value) {
    if (!value) return "";

    return String(value)
      .replace(/\s*\(.+\)\s*$/, "")
      .trim()
      .slice(0, 5);
  }

  function timeToMinutes(time) {
    const clean = cleanTime(time);
    const parts = clean.split(":");

    if (parts.length !== 2) return null;

    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);

    if (
      !Number.isFinite(hours) ||
      !Number.isFinite(minutes)
    ) {
      return null;
    }

    return hours * 60 + minutes;
  }

  function formatRemaining(totalSeconds) {
    if (totalSeconds < 0) totalSeconds = 0;

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }

    return `${pad(minutes)}:${pad(seconds)}`;
  }

  function getArabicDayName(date) {
    const days = [
      "الأحد",
      "الاثنين",
      "الثلاثاء",
      "الأربعاء",
      "الخميس",
      "الجمعة",
      "السبت"
    ];

    return days[date.getDay()];
  }

  function getArabicMonthName(month) {
    const months = [
      "يناير",
      "فبراير",
      "مارس",
      "أبريل",
      "ماي",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر"
    ];

    return months[month];
  }

  function formatGregorianDate(date) {
    return `${getArabicDayName(date)}، ${date.getDate()} ${getArabicMonthName(
      date.getMonth()
    )} ${date.getFullYear()}`;
  }

  function showToast(message, type) {
    if (window.AmirApp && typeof window.AmirApp.showToast === "function") {
      window.AmirApp.showToast(message, type || "info");
      return;
    }

    const toast = getElement("#amirToast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toast.__timer);

    toast.__timer = setTimeout(function () {
      toast.classList.remove("show");
    }, 3000);
  }

  /* =========================================================
     الإعدادات
     ========================================================= */

  function getPrayerSettings() {
    const defaults = {
      calculationMethod: "19",
      madhhab: "0"
    };

    try {
      if (
        window.AmirStorage &&
        typeof window.AmirStorage.getPrayerSettings === "function"
      ) {
        const saved = window.AmirStorage.getPrayerSettings();

        return {
          ...defaults,
          ...(saved || {})
        };
      }
    } catch (error) {
      console.warn("تعذر قراءة إعدادات الصلاة:", error);
    }

    try {
      const raw = localStorage.getItem("amirPrayerSettings");

      if (raw) {
        return {
          ...defaults,
          ...JSON.parse(raw)
        };
      }
    } catch (error) {
      console.warn("تعذر قراءة إعدادات الصلاة من التخزين:", error);
    }

    return defaults;
  }

  function getSelectedCityKey() {
    let cityKey = "ain_oussera";

    try {
      if (
        window.AmirStorage &&
        typeof window.AmirStorage.getCity === "function"
      ) {
        cityKey = window.AmirStorage.getCity() || cityKey;
      } else {
        cityKey =
          localStorage.getItem("amirCity") ||
          cityKey;
      }
    } catch (error) {
      cityKey = "ain_oussera";
    }

    if (!CITIES[cityKey]) {
      cityKey = "ain_oussera";
    }

    return cityKey;
  }

  function getCity(cityKey) {
    return CITIES[cityKey] || CITIES.ain_oussera;
  }

  /* =========================================================
     التخزين المؤقت
     ========================================================= */

  function cacheKey(cityKey, dateKey) {
    return `${cityKey}_${dateKey}`;
  }

  function getCachedPrayer(cityKey, dateKey) {
    try {
      if (
        window.AmirStorage &&
        typeof window.AmirStorage.getPrayerCache === "function"
      ) {
        const cache = window.AmirStorage.getPrayerCache();

        if (cache && cache[cacheKey(cityKey, dateKey)]) {
          return cache[cacheKey(cityKey, dateKey)];
        }
      }

      const raw = localStorage.getItem("amirMawaqitCache");

      if (!raw) return null;

      const cache = JSON.parse(raw);

      return cache && cache[cacheKey(cityKey, dateKey)]
        ? cache[cacheKey(cityKey, dateKey)]
        : null;
    } catch (error) {
      console.warn("تعذر قراءة التخزين المؤقت:", error);
      return null;
    }
  }

  function saveCachedPrayer(cityKey, dateKey, data) {
    try {
      if (
        window.AmirStorage &&
        typeof window.AmirStorage.setPrayerCache === "function"
      ) {
        const existing =
          typeof window.AmirStorage.getPrayerCache === "function"
            ? window.AmirStorage.getPrayerCache() || {}
            : {};

        existing[cacheKey(cityKey, dateKey)] = data;

        window.AmirStorage.setPrayerCache(existing);
        return;
      }

      const raw = localStorage.getItem("amirMawaqitCache");

      const cache = raw ? JSON.parse(raw) : {};

      cache[cacheKey(cityKey, dateKey)] = data;

      localStorage.setItem(
        "amirMawaqitCache",
        JSON.stringify(cache)
      );
    } catch (error) {
      console.warn("تعذر حفظ المواقيت:", error);
    }
  }

  /* =========================================================
     جلب المواقيت من API
     ========================================================= */

  async function fetchPrayerTimes(date, cityKey) {
    const city = getCity(cityKey);
    const settings = getPrayerSettings();

    const method = encodeURIComponent(
      settings.calculationMethod || "19"
    );

    const school = encodeURIComponent(
      settings.madhhab || "0"
    );

    const apiDate = formatApiDate(date);

    const url =
      `${API_BASE}/timings/${apiDate}` +
      `?latitude=${encodeURIComponent(city.latitude)}` +
      `&longitude=${encodeURIComponent(city.longitude)}` +
      `&method=${method}` +
      `&school=${school}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
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

    return {
      timings: json.data.timings,
      meta: json.data.meta || null,
      date: json.data.date || null,
      fetchedAt: Date.now(),
      cityKey,
      method: settings.calculationMethod || "19",
      school: settings.madhhab || "0"
    };
  }

  /* =========================================================
     تحميل المواقيت
     ========================================================= */

  async function load(options) {
    options = options || {};

    const forceRefresh = Boolean(options.force);
    const date = options.date
      ? new Date(options.date)
      : new Date();

    const cityKey =
      options.cityKey ||
      getSelectedCityKey();

    const dateKey = localDateKey(date);

    state.cityKey = cityKey;
    state.city = getCity(cityKey);
    state.date = date;

    updateCityUI();

    if (!forceRefresh) {
      const cached = getCachedPrayer(cityKey, dateKey);

      if (cached && cached.timings) {
        applyData(cached, date);
        updateStatus("تم تحميل المواقيت المحفوظة");

        // تحديث في الخلفية
        refreshFromNetwork(date, cityKey, dateKey);

        return cached;
      }
    }

    state.loading = true;
    state.error = null;

    updateStatus("جاري تحديث المواقيت…");

    try {
      const data = await fetchPrayerTimes(date, cityKey);

      saveCachedPrayer(cityKey, dateKey, data);

      applyData(data, date);

      updateStatus("تم تحديث المواقيت");

      return data;
    } catch (error) {
      console.error("Prayer API error:", error);

      const cached = getCachedPrayer(cityKey, dateKey);

      if (cached && cached.timings) {
        applyData(cached, date);
        updateStatus("وضع عدم الاتصال — آخر مواقيت محفوظة");

        return cached;
      }

      state.error = error;
      updateStatus("تعذر تحميل المواقيت");

      showToast(
        "تعذر تحميل مواقيت الصلاة. تحقق من الاتصال بالإنترنت.",
        "error"
      );

      return null;
    } finally {
      state.loading = false;
    }
  }

  async function refreshFromNetwork(date, cityKey, dateKey) {
    try {
      const data = await fetchPrayerTimes(date, cityKey);

      saveCachedPrayer(cityKey, dateKey, data);

      applyData(data, date);

      updateStatus("تم تحديث المواقيت");
    } catch (error) {
      console.warn("تحديث المواقيت في الخلفية فشل:", error);
    }
  }

  /* =========================================================
     تطبيق البيانات
     ========================================================= */

  function applyData(data, date) {
    if (!data || !data.timings) return;

    state.timings = normalizeTimings(data.timings);
    state.meta = data.meta || null;
    state.date = date || new Date();

    renderPrayerCards();
    updateDates(data);
    updateCityUI();
    updateNextPrayer();

    restartTimer();
  }

  function normalizeTimings(timings) {
    const normalized = {};

    Object.keys(timings || {}).forEach(function (key) {
      normalized[key] = cleanTime(timings[key]);
    });

    return normalized;
  }

  /* =========================================================
     واجهة المدينة والتاريخ
     ========================================================= */

  function updateCityUI() {
    const city = state.city || getCity(state.cityKey);

    safeText(
      getElement("#cityName"),
      city ? city.name : "عين وسارة"
    );

    getElements("[data-current-city]").forEach(function (element) {
      element.textContent = city ? city.name : "";
    });

    const select = getElement("#citySelect");

    if (select && city) {
      if (select.value !== state.cityKey) {
        select.value = state.cityKey;
      }
    }
  }

  function updateDates(data) {
    const date = state.date || new Date();

    safeText(
      getElement("#gregorianDate"),
      formatGregorianDate(date)
    );

    let hijri = "";

    try {
      if (
        data &&
        data.date &&
        data.date.hijri
      ) {
        const h = data.date.hijri;

        if (h.day && h.month && h.year) {
          hijri =
            `${h.day} ${h.month.ar || ""} ${h.year} هـ`;
        }
      }
    } catch (error) {
      console.warn("تعذر قراءة التاريخ الهجري:", error);
    }

    safeText(
      getElement("#hijriDate"),
      hijri || "التاريخ الهجري"
    );
  }

  function updateStatus(message) {
    safeText(
      getElement("#prayerUpdateStatus"),
      message
    );
  }

  /* =========================================================
     بطاقات الصلاة
     ========================================================= */

  function renderPrayerCards() {
    const container = getElement("#prayerGrid");

    if (!container || !state.timings) return;

    container.innerHTML = "";

    PRAYERS.forEach(function (prayer) {
      const time = state.timings[prayer.key];

      if (!time) return;

      const card = document.createElement("article");

      card.className = "prayer-card";

      card.dataset.prayer = prayer.key;

      card.innerHTML = `
        <div class="prayer-card-icon">${prayer.icon}</div>
        <div class="prayer-card-info">
          <div class="prayer-card-name">${prayer.name}</div>
          <div class="prayer-card-time">${time}</div>
        </div>
      `;

      container.appendChild(card);
    });

    markCurrentPrayer();
  }

  function markCurrentPrayer() {
    getElements(".prayer-card").forEach(function (card) {
      card.classList.remove(
        "active",
        "current",
        "next-prayer"
      );
    });

    const info = getNextPrayerInfo();

    if (!info) return;

    const currentCard = getElement(
      `.prayer-card[data-prayer="${info.currentKey}"]`
    );

    const nextCard = getElement(
      `.prayer-card[data-prayer="${info.nextKey}"]`
    );

    if (currentCard) {
      currentCard.classList.add("current");
    }

    if (nextCard) {
      nextCard.classList.add("next-prayer");
    }
  }

  /* =========================================================
     حساب الصلاة القادمة
     ========================================================= */

  function getPrayerEntries(date) {
    if (!state.timings) return [];

    const currentDate = date || new Date();

    return PRAYERS
      .filter(function (prayer) {
        return Boolean(state.timings[prayer.key]);
      })
      .map(function (prayer) {
        const minutes =
          timeToMinutes(state.timings[prayer.key]);

        if (minutes === null) return null;

        const prayerDate = new Date(currentDate);

        prayerDate.setHours(
          Math.floor(minutes / 60),
          minutes % 60,
          0,
          0
        );

        return {
          ...prayer,
          time: state.timings[prayer.key],
          minutes,
          date: prayerDate
        };
      })
      .filter(Boolean);
  }

  function getNextPrayerInfo(now) {
    if (!state.timings) return null;

    const currentTime = now || new Date();

    const entries = getPrayerEntries(currentTime);

    if (!entries.length) return null;

    let next = null;
    let current = null;

    for (let i = 0; i < entries.length; i++) {
      if (currentTime < entries[i].date) {
        next = entries[i];
        break;
      }

      current = entries[i];
    }

    let tomorrow = false;

    if (!next) {
      next = {
        ...entries[0],
        date: new Date(entries[0].date)
      };

      next.date.setDate(
        next.date.getDate() + 1
      );

      tomorrow = true;

      current = entries[entries.length - 1];
    }

    if (!current) {
      current = entries[entries.length - 1];
    }

    return {
      currentKey: current ? current.key : null,
      currentName: current ? current.name : "",
      currentTime: current ? current.time : "",
      nextKey: next.key,
      nextName: next.name,
      nextTime: next.time,
      nextDate: next.date,
      tomorrow
    };
  }

  function updateNextPrayer() {
    const info = getNextPrayerInfo();

    if (!info) {
      safeText(
        getElement("#nextPrayerName"),
        "—"
      );

      safeText(
        getElement("#countdown"),
        "--:--:--"
      );

      return;
    }

    safeText(
      getElement("#nextPrayerName"),
      info.tomorrow
        ? `${info.nextName} غدًا`
        : info.nextName
    );

    const now = new Date();

    const seconds = Math.max(
      0,
      Math.floor(
        (info.nextDate.getTime() - now.getTime()) / 1000
      )
    );

    safeText(
      getElement("#countdown"),
      formatRemaining(seconds)
    );

    updateProgress(info);
    markCurrentPrayer();
  }

  function updateProgress(info) {
    const progress = getElement("#prayerProgress");

    if (!progress || !info) return;

    const now = new Date();

    const entries = getPrayerEntries(now);

    if (!entries.length) {
      progress.style.width = "0%";
      return;
    }

    let previousDate = null;

    if (info.currentKey) {
      const current = entries.find(function (item) {
        return item.key === info.currentKey;
      });

      if (current) {
        previousDate = current.date;
      }
    }

    if (!previousDate) {
      previousDate = new Date(now);
      previousDate.setHours(0, 0, 0, 0);
    }

    const total =
      info.nextDate.getTime() -
      previousDate.getTime();

    const elapsed =
      now.getTime() -
      previousDate.getTime();

    let percent =
      total > 0
        ? (elapsed / total) * 100
        : 0;

    percent = Math.max(
      0,
      Math.min(100, percent)
    );

    progress.style.width = `${percent}%`;
  }

  /* =========================================================
     المؤقت
     ========================================================= */

  function restartTimer() {
    if (state.timer) {
      clearInterval(state.timer);
    }

    updateNextPrayer();

    state.timer = setInterval(function () {
      updateNextPrayer();
    }, 1000);
  }

  /* =========================================================
     تغيير المدينة
     ========================================================= */

  async function setCity(cityKey) {
    if (!CITIES[cityKey]) {
      cityKey = "ain_oussera";
    }

    state.cityKey = cityKey;
    state.city = CITIES[cityKey];

    try {
      if (
        window.AmirStorage &&
        typeof window.AmirStorage.setCity === "function"
      ) {
        window.AmirStorage.setCity(cityKey);
      } else {
        localStorage.setItem(
          "amirCity",
          cityKey
        );
      }
    } catch (error) {
      console.warn("تعذر حفظ المدينة:", error);
    }

    updateCityUI();

    document.dispatchEvent(
      new CustomEvent("amirCityChanged", {
        detail: {
          cityKey,
          city: CITIES[cityKey]
        }
      })
    );

    return load({
      force: true,
      cityKey
    });
  }

  /* =========================================================
     تغيير إعدادات الحساب
     ========================================================= */

  async function reloadAfterSettingsChange() {
    return load({
      force: true,
      cityKey: getSelectedCityKey()
    });
  }

  /* =========================================================
     بيانات عامة
     ========================================================= */

  function getTodaySchedule() {
    if (!state.timings) return [];

    return PRAYERS
      .filter(function (prayer) {
        return Boolean(state.timings[prayer.key]);
      })
      .map(function (prayer) {
        return {
          key: prayer.key,
          name: prayer.name,
          time: state.timings[prayer.key]
        };
      });
  }

  function getCurrentState() {
    return {
      cityKey: state.cityKey,
      city: state.city,
      timings: state.timings,
      meta: state.meta,
      date: state.date,
      loading: state.loading,
      error: state.error,
      nextPrayer: getNextPrayerInfo()
    };
  }

  function getCityList() {
    return Object.keys(CITIES).map(function (key) {
      return {
        key,
        ...CITIES[key]
      };
    });
  }

  /* =========================================================
     التوافق مع النسخ القديمة
     ========================================================= */

  window.loadPrayerTimes = function () {
    return load({
      force: true
    });
  };

  /* =========================================================
     API العامة
     ========================================================= */

  window.AmirPrayer = {
    CITIES,
    PRAYERS,

    load,
    setCity,
    reloadAfterSettingsChange,

    getTodaySchedule,
    getCurrentState,
    getNextPrayerInfo,
    getCityList,

    getSelectedCityKey,
    getPrayerSettings,

    timeToMinutes,
    formatRemaining
  };

  /* =========================================================
     أحداث التطبيق
     ========================================================= */

  document.addEventListener(
    "amirCityChanged",
    function (event) {
      const cityKey =
        event &&
        event.detail &&
        event.detail.cityKey;

      if (!cityKey || !CITIES[cityKey]) {
        return;
      }

      state.cityKey = cityKey;
      state.city = CITIES[cityKey];

      load({
        force: false,
        cityKey
      });
    }
  );

  document.addEventListener(
    "amirPrayerSettingsChanged",
    function () {
      reloadAfterSettingsChange();
    }
  );

  /* =========================================================
     بدء التطبيق
     ========================================================= */

  document.addEventListener(
    "DOMContentLoaded",
    function () {
      state.cityKey = getSelectedCityKey();
      state.city = getCity(state.cityKey);

      updateCityUI();

      load({
        force: false,
        cityKey: state.cityKey
      });
    }
  );

})();
