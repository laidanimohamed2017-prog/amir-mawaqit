/* =========================================================
   أمير مواقيت V2
   prayer.js
   نظام مواقيت الصلاة
   ========================================================= */

(() => {
  "use strict";

  const API_BASE = "https://api.aladhan.com/v1";
  const CALCULATION_METHOD = 19;
  const SCHOOL = 0;

  const PRAYERS = [
    {
      key: "Fajr",
      name: "الفجر",
      icon: "🌅"
    },
    {
      key: "Dhuhr",
      name: "الظهر",
      icon: "☀️"
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

  const DEFAULT_CITIES = {
    ain_oussera: {
      name: "عين وسارة",
      latitude: 35.4513,
      longitude: 2.9067
    },

    algiers: {
      name: "الجزائر العاصمة",
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
    }
  };

  let todaySchedule = null;
  let tomorrowSchedule = null;
  let countdownTimer = null;
  let midnightTimer = null;
  let lastRenderedCity = null;

  /* =========================================================
     أدوات عامة
     ========================================================= */

  function getCityKey() {
    try {
      if (
        window.AmirStorage &&
        typeof window.AmirStorage.getCity === "function"
      ) {
        return window.AmirStorage.getCity() || "ain_oussera";
      }
    } catch (error) {
      console.warn("AmirStorage city error:", error);
    }

    return localStorage.getItem("amirCity") || "ain_oussera";
  }

  function getCity() {
    const cityKey = getCityKey();

    return (
      DEFAULT_CITIES[cityKey] ||
      DEFAULT_CITIES.ain_oussera
    );
  }

  function formatDate(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

  function dateKey(date) {
    return date.toISOString().slice(0, 10);
  }

  function cleanTime(value) {
    if (!value) return "--:--";

    let time = String(value);

    /*
      بعض نتائج API قد تحتوي على:
      05:12 (+01)
      أو
      05:12 (CET)
    */

    time = time.replace(/\s*\(.+?\)/g, "").trim();

    const match = time.match(/(\d{1,2}):(\d{2})/);

    if (!match) return "--:--";

    return (
      String(Number(match[1])).padStart(2, "0") +
      ":" +
      match[2]
    );
  }

  function timeToMinutes(time) {
    if (!time || time === "--:--") return null;

    const parts = time.split(":");

    if (parts.length !== 2) return null;

    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);

    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes)
    ) {
      return null;
    }

    return hours * 60 + minutes;
  }

  function secondsFromMidnight(date = new Date()) {
    return (
      date.getHours() * 3600 +
      date.getMinutes() * 60 +
      date.getSeconds()
    );
  }

  function secondsForTime(time) {
    const minutes = timeToMinutes(time);

    if (minutes === null) return null;

    return minutes * 60;
  }

  function getArabicDate(date = new Date()) {
    try {
      return new Intl.DateTimeFormat("ar-DZ", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(date);
    } catch {
      return date.toLocaleDateString("ar-DZ");
    }
  }

  /* =========================================================
     جلب بيانات المواقيت
     ========================================================= */

  async function fetchPrayerData(date, city) {
    const dateString = formatDate(date);

    const url =
      `${API_BASE}/timings/${dateString}` +
      `?latitude=${encodeURIComponent(city.latitude)}` +
      `&longitude=${encodeURIComponent(city.longitude)}` +
      `&method=${CALCULATION_METHOD}` +
      `&school=${SCHOOL}`;

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(
        `Prayer API HTTP ${response.status}`
      );
    }

    const json = await response.json();

    if (
      !json ||
      json.code !== 200 ||
      !json.data ||
      !json.data.timings
    ) {
      throw new Error("Invalid prayer API response");
    }

    return normalizeSchedule(
      json.data,
      date,
      city
    );
  }

  function normalizeSchedule(data, date, city) {
    const timings = data.timings || {};

    const result = {
      date: dateKey(date),
      displayDate: getArabicDate(date),
      city: city.name,
      latitude: city.latitude,
      longitude: city.longitude,

      hijri: data.date?.hijri || null,

      prayers: {}
    };

    PRAYERS.forEach(prayer => {
      result.prayers[prayer.key] =
        cleanTime(timings[prayer.key]);
    });

    return result;
  }

  /* =========================================================
     التخزين المؤقت
     ========================================================= */

  function saveScheduleToCache(schedule) {
    if (!schedule) return;

    try {
      if (
        window.AmirStorage &&
        typeof window.AmirStorage.savePrayerCache === "function"
      ) {
        window.AmirStorage.savePrayerCache(
          schedule
        );
        return;
      }

      localStorage.setItem(
        "amirMawaqitCache",
        JSON.stringify(schedule)
      );
    } catch (error) {
      console.warn(
        "Could not save prayer cache:",
        error
      );
    }
  }

  function getCachedSchedule() {
    try {
      if (
        window.AmirStorage &&
        typeof window.AmirStorage.getPrayerCache === "function"
      ) {
        return window.AmirStorage.getPrayerCache();
      }

      const raw =
        localStorage.getItem("amirMawaqitCache");

      if (!raw) return null;

      return JSON.parse(raw);
    } catch (error) {
      console.warn(
        "Could not read prayer cache:",
        error
      );

      return null;
    }
  }

  /* =========================================================
     تحميل مواقيت اليوم
     ========================================================= */

  async function loadPrayerTimes(options = {}) {
    const force =
      options.force === true;

    const today = new Date();
    const city = getCity();

    updateCityUI(city);
    updateDateUI(today);

    try {
      setUpdateStatus("جاري تحديث المواقيت…");

      const schedule =
        await fetchPrayerData(
          today,
          city
        );

      todaySchedule = schedule;

      saveScheduleToCache(schedule);

      renderPrayerCards(schedule);
      updateHijriDate(schedule);
      updateCityUI(city);

      setUpdateStatus(
        `آخر تحديث: ${new Date().toLocaleTimeString(
          "ar-DZ",
          {
            hour: "2-digit",
            minute: "2-digit"
          }
        )}`
      );

      /*
        نحضر مواقيت الغد في الخلفية حتى يكون
        الانتقال من العشاء إلى فجر الغد دقيقًا.
      */
      loadTomorrowPrayerTimes(city);

      startCountdown();

      lastRenderedCity =
        getCityKey();

      return schedule;
    } catch (error) {
      console.error(
        "Prayer times error:",
        error
      );

      const cached =
        getCachedSchedule();

      if (
        cached &&
        cached.prayers
      ) {
        todaySchedule = cached;

        renderPrayerCards(cached);
        updateHijriDate(cached);

        setUpdateStatus(
          "وضع عدم الاتصال — آخر مواقيت محفوظة"
        );

        startCountdown();

        return cached;
      }

      setUpdateStatus(
        "تعذر تحميل المواقيت. تحقق من الاتصال بالإنترنت."
      );

      showPrayerError();

      return null;
    } finally {
      if (force) {
        startCountdown();
      }
    }
  }

  async function loadTomorrowPrayerTimes(city) {
    try {
      const tomorrow =
        new Date();

      tomorrow.setDate(
        tomorrow.getDate() + 1
      );

      tomorrowSchedule =
        await fetchPrayerData(
          tomorrow,
          city
        );
    } catch (error) {
      console.warn(
        "Tomorrow prayer times unavailable:",
        error
      );

      tomorrowSchedule = null;
    }
  }

  /* =========================================================
     عرض المواقيت
     ========================================================= */

  function renderPrayerCards(schedule) {
    const grid =
      document.getElementById(
        "prayerGrid"
      );

    if (!grid || !schedule) return;

    grid.innerHTML = "";

    PRAYERS.forEach(prayer => {
      const time =
        schedule.prayers[
          prayer.key
        ] || "--:--";

      const card =
        document.createElement("div");

      card.className =
        "prayer-card";

      card.dataset.prayer =
        prayer.key;

      card.innerHTML = `
        <div class="prayer-icon">
          ${prayer.icon}
        </div>

        <div class="prayer-info">
          <div class="prayer-name">
            ${prayer.name}
          </div>

          <div class="prayer-key">
            ${prayer.key}
          </div>
        </div>

        <div class="prayer-time">
          ${time}
        </div>
      `;

      grid.appendChild(card);
    });

    updateActivePrayer();
  }

  function showPrayerError() {
    const grid =
      document.getElementById(
        "prayerGrid"
      );

    if (!grid) return;

    grid.innerHTML = `
      <div class="prayer-error">
        <div class="prayer-error-icon">⚠️</div>
        <strong>تعذر تحميل المواقيت</strong>
        <span>تحقق من اتصال الإنترنت ثم حاول مرة أخرى.</span>
        <button
          type="button"
          onclick="window.loadPrayerTimes({force:true})"
        >
          إعادة المحاولة
        </button>
      </div>
    `;
  }

  /* =========================================================
     معرفة الصلاة القادمة
     ========================================================= */

  function getPrayerSeconds(
    schedule,
    prayerKey
  ) {
    if (!schedule) return null;

    return secondsForTime(
      schedule.prayers[
        prayerKey
      ]
    );
  }

  function getCurrentPrayerState() {
    if (!todaySchedule) {
      return {
        current: null,
        next: null,
        currentSeconds: null,
        nextSeconds: null,
        afterIsha: false
      };
    }

    const now =
      secondsFromMidnight();

    const prayerSeconds =
      PRAYERS.map(prayer => ({
        ...prayer,
        seconds:
          getPrayerSeconds(
            todaySchedule,
            prayer.key
          )
      })).filter(
        item =>
          item.seconds !== null
      );

    /*
      قبل الفجر:
      الصلاة القادمة = الفجر
    */

    if (
      prayerSeconds.length &&
      now <
        prayerSeconds[0].seconds
    ) {
      return {
        current: null,
        next: prayerSeconds[0],
        currentSeconds: null,
        nextSeconds:
          prayerSeconds[0].seconds,
        afterIsha: false
      };
    }

    for (
      let i = 0;
      i < prayerSeconds.length - 1;
      i++
    ) {
      const current =
        prayerSeconds[i];

      const next =
        prayerSeconds[i + 1];

      if (
        now >= current.seconds &&
        now < next.seconds
      ) {
        return {
          current,
          next,
          currentSeconds:
            current.seconds,
          nextSeconds:
            next.seconds,
          afterIsha: false
        };
      }
    }

    /*
      بعد العشاء:
      الصلاة القادمة = فجر الغد
    */

    const last =
      prayerSeconds[
        prayerSeconds.length - 1
      ];

    if (
      last &&
      now >= last.seconds
    ) {
      const tomorrowFajr =
        tomorrowSchedule?.prayers?.Fajr;

      if (tomorrowFajr) {
        const fajrSeconds =
          secondsForTime(
            tomorrowFajr
          );

        return {
          current: last,
          next: {
            key: "Fajr",
            name: "الفجر",
            icon: "🌅"
          },
          currentSeconds:
            last.seconds,
          nextSeconds:
            fajrSeconds + 86400,
          afterIsha: true
        };
      }

      /*
        إذا لم تصل بيانات الغد،
        نحسب تقديرًا مؤقتًا اعتمادًا
        على فجر اليوم.
      */
      const todayFajr =
        prayerSeconds[0];

      return {
        current: last,
        next: {
          key: "Fajr",
          name: "الفجر",
          icon: "🌅"
        },
        currentSeconds:
          last.seconds,
        nextSeconds:
          todayFajr.seconds +
          86400,
        afterIsha: true
      };
    }

    return {
      current: null,
      next: null,
      currentSeconds: null,
      nextSeconds: null,
      afterIsha: false
    };
  }

  /* =========================================================
     العد التنازلي
     ========================================================= */

  function startCountdown() {
    if (countdownTimer) {
      clearInterval(
        countdownTimer
      );
    }

    updateCountdown();

    countdownTimer =
      setInterval(
        updateCountdown,
        1000
      );
  }

  function updateCountdown() {
    if (!todaySchedule) return;

    const state =
      getCurrentPrayerState();

    if (!state.next) return;

    let now =
      secondsFromMidnight();

    let nextSeconds =
      state.nextSeconds;

    /*
      بعد منتصف الليل مع فجر الغد
      now يجب أن يتحول إلى اليوم التالي.
    */
    if (state.afterIsha) {
      now += 86400;
    }

    let remaining =
      nextSeconds - now;

    if (remaining < 0) {
      remaining = 0;
    }

    const hours =
      Math.floor(
        remaining / 3600
      );

    const minutes =
      Math.floor(
        (remaining % 3600) / 60
      );

    const seconds =
      Math.floor(
        remaining % 60
      );

    const countdownText =
      [
        String(hours).padStart(
          2,
          "0"
        ),
        String(minutes).padStart(
          2,
          "0"
        ),
        String(seconds).padStart(
          2,
          "0"
        )
      ].join(":");

    const countdown =
      document.getElementById(
        "countdown"
      );

    if (countdown) {
      countdown.textContent =
        countdownText;
    }

    const nextName =
      document.getElementById(
        "nextPrayerName"
      );

    if (nextName) {
      nextName.textContent =
        `الصلاة القادمة: ${state.next.name}`;
    }

    updateProgress(
      state,
      now
    );

    updateActivePrayer();

    /*
      عندما يصل الوقت إلى الصلاة،
      نعيد الحساب فورًا.
    */
    if (remaining <= 0) {
      setTimeout(
        updateCountdown,
        1500
      );
    }
  }

  /* =========================================================
     شريط التقدم
     ========================================================= */

  function updateProgress(
    state,
    now
  ) {
    const bar =
      document.getElementById(
        "prayerProgress"
      );

    if (!bar) return;

    if (
      state.currentSeconds === null ||
      state.nextSeconds === null
    ) {
      bar.style.width = "0%";
      return;
    }

    let start =
      state.currentSeconds;

    let end =
      state.nextSeconds;

    if (
      state.afterIsha &&
      end > 86400
    ) {
      /*
        بعد العشاء:
        بداية الفترة = عشاء اليوم
        نهاية الفترة = فجر الغد
      */
    }

    const total =
      end - start;

    if (total <= 0) {
      bar.style.width = "0%";
      return;
    }

    const elapsed =
      now - start;

    let percent =
      (elapsed / total) * 100;

    percent =
      Math.max(
        0,
        Math.min(
          100,
          percent
        )
      );

    bar.style.width =
      `${percent}%`;
  }

  /* =========================================================
     تمييز الصلاة الحالية
     ========================================================= */

  function updateActivePrayer() {
    const cards =
      document.querySelectorAll(
        ".prayer-card"
      );

    if (!cards.length) return;

    const state =
      getCurrentPrayerState();

    cards.forEach(card => {
      card.classList.remove(
        "active"
      );
      card.classList.remove(
        "next"
      );

      const key =
        card.dataset.prayer;

      if (
        state.current &&
        state.current.key === key
      ) {
        card.classList.add(
          "active"
        );
      }

      if (
        state.next &&
        state.next.key === key
      ) {
        card.classList.add(
          "next"
        );
      }
    });
  }

  /* =========================================================
     التاريخ الهجري
     ========================================================= */

  function updateHijriDate(schedule) {
    const element =
      document.getElementById(
        "hijriDate"
      );

    if (!element) return;

    if (
      schedule &&
      schedule.hijri
    ) {
      const hijri =
        schedule.hijri;

      const day =
        hijri.day || "";

      const month =
        hijri.month?.ar ||
        hijri.month?.en ||
        "";

      const year =
        hijri.year || "";

      element.textContent =
        `${day} ${month} ${year} هـ`;

      return;
    }

    element.textContent =
      "التاريخ الهجري";
  }

  /* =========================================================
     التاريخ الميلادي
     ========================================================= */

  function updateDateUI(date) {
    const element =
      document.getElementById(
        "gregorianDate"
      );

    if (!element) return;

    element.textContent =
      getArabicDate(date);
  }

  /* =========================================================
     المدينة
     ========================================================= */

  function updateCityUI(city) {
    if (!city) return;

    const cityElements =
      document.querySelectorAll(
        "[data-current-city]"
      );

    cityElements.forEach(
      element => {
        element.textContent =
          city.name;
      }
    );

    const cityName =
      document.getElementById(
        "cityName"
      );

    if (cityName) {
      cityName.textContent =
        city.name;
    }

    const select =
      document.getElementById(
        "citySelect"
      );

    if (
      select &&
      DEFAULT_CITIES[
        getCityKey()
      ]
    ) {
      select.value =
        getCityKey();
    }
  }

  /* =========================================================
     حالة التحديث
     ========================================================= */

  function setUpdateStatus(
    message
  ) {
    const element =
      document.getElementById(
        "prayerUpdateStatus"
      );

    if (element) {
      element.textContent =
        message;
    }
  }

  /* =========================================================
     تغيير المدينة
     ========================================================= */

  async function changeCity(
    cityKey
  ) {
    if (
      !DEFAULT_CITIES[
        cityKey
      ]
    ) {
      console.warn(
        "Unknown city:",
        cityKey
      );
      return;
    }

    try {
      if (
        window.AmirStorage &&
        typeof window.AmirStorage.setCity ===
          "function"
      ) {
        window.AmirStorage.setCity(
          cityKey
        );
      } else {
        localStorage.setItem(
          "amirCity",
          cityKey
        );
      }
    } catch (error) {
      console.warn(
        "Could not save city:",
        error
      );
    }

    todaySchedule = null;
    tomorrowSchedule = null;

    updateCityUI(
      DEFAULT_CITIES[
        cityKey
      ]
    );

    await loadPrayerTimes({
      force: true
    });

    /*
      إذا كان نظام الأذان موجودًا،
      نطلب منه إعادة جدولة الأذان.
    */
    if (
      window.AmirAdhan &&
      typeof window.AmirAdhan.reschedule ===
        "function"
    ) {
      window.AmirAdhan.reschedule();
    }
  }

  /* =========================================================
     إعادة التحميل عند تغير اليوم
     ========================================================= */

  function scheduleMidnightRefresh() {
    if (midnightTimer) {
      clearTimeout(
        midnightTimer
      );
    }

    const now =
      new Date();

    const nextDay =
      new Date(now);

    nextDay.setHours(
      24,
      0,
      5,
      0
    );

    const delay =
      nextDay.getTime() -
      now.getTime();

    midnightTimer =
      setTimeout(
        async () => {
          todaySchedule = null;
          tomorrowSchedule = null;

          await loadPrayerTimes({
            force: true
          });

          scheduleMidnightRefresh();
        },
        Math.max(
          delay,
          1000
        )
      );
  }

  /* =========================================================
     مراقبة تغير المدينة
     ========================================================= */

  function checkCityChange() {
    const currentCity =
      getCityKey();

    if (
      lastRenderedCity &&
      currentCity !==
        lastRenderedCity
    ) {
      loadPrayerTimes({
        force: true
      });
    }
  }

  /* =========================================================
     API عام
     ========================================================= */

  window.AmirPrayer = {
    PRAYERS,
    CITIES: DEFAULT_CITIES,

    load: loadPrayerTimes,

    changeCity,

    getTodaySchedule: () =>
      todaySchedule,

    getTomorrowSchedule: () =>
      tomorrowSchedule,

    getCurrentPrayerState,

    getCity,

    getCityKey,

    refresh: () =>
      loadPrayerTimes({
        force: true
      })
  };

  /*
    توافق مع index.html الحالي
  */
  window.loadPrayerTimes =
    loadPrayerTimes;

  /* =========================================================
     التشغيل
     ========================================================= */

  document.addEventListener(
    "DOMContentLoaded",
    () => {
      updateCityUI(
        getCity()
      );

      updateDateUI(
        new Date()
      );

      scheduleMidnightRefresh();

      /*
        نعطي الصفحة لحظة حتى تكتمل
        ملفات CSS وواجهة HTML.
      */
      setTimeout(
        () => {
          loadPrayerTimes();
        },
        250
      );

      setInterval(
        checkCityChange,
        3000
      );
    }
  );

})();
