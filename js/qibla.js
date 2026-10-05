/* =========================================================
   أمير مواقيت V2
   qibla.js
   تحديد اتجاه القبلة والبوصلة
   ========================================================= */

(function () {
  "use strict";

  const KAABA_LAT = 21.422487;
  const KAABA_LNG = 39.826206;

  let compassListener = null;
  let compassEventName = null;
  let isRunning = false;
  let lastHeading = null;

  /* =========================================================
     المدن
     ========================================================= */

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

  /* =========================================================
     الأدوات الرياضية
     ========================================================= */

  function toRadians(value) {
    return value * Math.PI / 180;
  }

  function toDegrees(value) {
    return value * 180 / Math.PI;
  }

  function normalizeDegrees(value) {
    let result = Number(value) % 360;

    if (result < 0) {
      result += 360;
    }

    return result;
  }

  /* =========================================================
     حساب اتجاه القبلة
     ========================================================= */

  function calculateQiblaBearing(latitude, longitude) {
    const lat1 = toRadians(latitude);
    const lat2 = toRadians(KAABA_LAT);

    const deltaLongitude =
      toRadians(KAABA_LNG - longitude);

    const y =
      Math.sin(deltaLongitude) * Math.cos(lat2);

    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) *
        Math.cos(lat2) *
        Math.cos(deltaLongitude);

    const bearing =
      toDegrees(Math.atan2(y, x));

    return normalizeDegrees(bearing);
  }

  /* =========================================================
     اتجاه القبلة نصيًا
     ========================================================= */

  function getDirectionName(degrees) {
    const value = normalizeDegrees(degrees);

    if (value >= 337.5 || value < 22.5) {
      return "شمال";
    }

    if (value < 67.5) {
      return "شمال شرقي";
    }

    if (value < 112.5) {
      return "شرق";
    }

    if (value < 157.5) {
      return "جنوب شرقي";
    }

    if (value < 202.5) {
      return "جنوب";
    }

    if (value < 247.5) {
      return "جنوب غربي";
    }

    if (value < 292.5) {
      return "غرب";
    }

    return "شمال غربي";
  }

  /* =========================================================
     المدينة الحالية
     ========================================================= */

  function getCurrentCityKey() {
    try {
      if (
        window.AmirStorage &&
        typeof window.AmirStorage.getCity === "function"
      ) {
        return (
          window.AmirStorage.getCity() ||
          "ain_oussera"
        );
      }

      return (
        localStorage.getItem("amirCity") ||
        "ain_oussera"
      );
    } catch (error) {
      return "ain_oussera";
    }
  }

  function getCurrentCoordinates() {
    const cityKey = getCurrentCityKey();
    const city = CITIES[cityKey];

    if (!city) {
      return CITIES.ain_oussera;
    }

    return city;
  }

  /* =========================================================
     حساب القبلة للمدينة
     ========================================================= */

  function getQiblaBearing() {
    const city = getCurrentCoordinates();

    return calculateQiblaBearing(
      city.lat,
      city.lng
    );
  }

  /* =========================================================
     عرض البيانات
     ========================================================= */

  function updateQiblaDegree(value) {
    const element =
      document.getElementById("qiblaDegree");

    if (!element) {
      return;
    }

    element.textContent =
      Math.round(normalizeDegrees(value)) + "°";
  }

  function updateQiblaDirection(value) {
    const element =
      document.getElementById("qiblaDirection");

    if (!element) {
      return;
    }

    element.textContent =
      getDirectionName(value);
  }

  function updateHeading(value) {
    const element =
      document.getElementById("compassHeading");

    if (!element) {
      return;
    }

    element.textContent =
      Math.round(normalizeDegrees(value)) + "°";
  }

  function updateStatus(message, type) {
    const element =
      document.getElementById("qiblaStatus");

    if (!element) {
      return;
    }

    element.textContent = message;

    element.classList.remove(
      "success",
      "error",
      "warning",
      "active"
    );

    if (type) {
      element.classList.add(type);
    }
  }

  /* =========================================================
     تدوير سهم القبلة
     ========================================================= */

  function updateArrow(heading) {
    const arrow =
      document.getElementById("qiblaArrow");

    if (!arrow) {
      return;
    }

    const qibla = getQiblaBearing();

    const rotation =
      normalizeDegrees(qibla - heading);

    arrow.style.transform =
      "translate(-50%, -50%) rotate(" +
      rotation +
      "deg)";
  }

  /* =========================================================
     عرض القبلة بدون بوصلة
     ========================================================= */

  function renderStaticQibla() {
    const bearing = getQiblaBearing();

    updateQiblaDegree(bearing);
    updateQiblaDirection(bearing);

    const arrow =
      document.getElementById("qiblaArrow");

    if (arrow) {
      arrow.style.transform =
        "translate(-50%, -50%) rotate(" +
        bearing +
        "deg)";
    }

    updateStatus(
      "اتجاه القبلة محسوب حسب موقع المدينة",
      "success"
    );
  }

  /* =========================================================
     معالجة اتجاه الجهاز
     ========================================================= */

  function handleOrientation(event) {
    let heading = null;

    /*
      iPhone / iPad
    */
    if (
      typeof event.webkitCompassHeading ===
        "number" &&
      event.webkitCompassHeading >= 0
    ) {
      heading =
        event.webkitCompassHeading;
    }

    /*
      الأجهزة التي تستخدم absolute
    */
    if (
      heading === null &&
      typeof event.alpha === "number"
    ) {
      heading = 360 - event.alpha;
    }

    if (
      typeof heading !== "number" ||
      !Number.isFinite(heading)
    ) {
      return;
    }

    heading = normalizeDegrees(heading);

    lastHeading = heading;

    updateHeading(heading);
    updateArrow(heading);

    updateStatus(
      "البوصلة تعمل — وجّه الهاتف نحو السهم",
      "active"
    );
  }

  /* =========================================================
     طلب صلاحية البوصلة في iOS
     ========================================================= */

  async function requestPermission() {
    try {
      if (
        typeof DeviceOrientationEvent !==
          "undefined" &&
        typeof DeviceOrientationEvent.requestPermission ===
          "function"
      ) {
        const permission =
          await DeviceOrientationEvent.requestPermission();

        return permission === "granted";
      }

      return true;
    } catch (error) {
      console.warn(
        "Compass permission:",
        error
      );

      return false;
    }
  }

  /* =========================================================
     تحديد نوع الحدث
     ========================================================= */

  function chooseEventName() {
    if (
      "ondeviceorientationabsolute" in window
    ) {
      return "deviceorientationabsolute";
    }

    return "deviceorientation";
  }

  /* =========================================================
     تشغيل البوصلة
     ========================================================= */

  async function start() {
    if (isRunning) {
      return true;
    }

    const permitted =
      await requestPermission();

    if (!permitted) {
      updateStatus(
        "لم يتم السماح باستخدام البوصلة",
        "error"
      );

      return false;
    }

    compassEventName =
      chooseEventName();

    compassListener =
      handleOrientation;

    window.addEventListener(
      compassEventName,
      compassListener,
      true
    );

    isRunning = true;

    updateStatus(
      "جاري تشغيل البوصلة...",
      "active"
    );

    renderStaticQibla();

    return true;
  }

  /* =========================================================
     إيقاف البوصلة
     ========================================================= */

  function stop() {
    if (
      compassListener &&
      compassEventName
    ) {
      window.removeEventListener(
        compassEventName,
        compassListener,
        true
      );
    }

    compassListener = null;
    compassEventName = null;
    isRunning = false;

    renderStaticQibla();

    updateStatus(
      "تم إيقاف البوصلة",
      "warning"
    );
  }

  /* =========================================================
     تحديث القبلة
     ========================================================= */

  function refresh() {
    renderStaticQibla();

    if (isRunning) {
      updateStatus(
        "البوصلة تعمل — وجّه الهاتف نحو السهم",
        "active"
      );
    }

    return getQiblaBearing();
  }

  /* =========================================================
     فتح قسم القبلة
     ========================================================= */

  function open() {
    const button =
      document.querySelector(
        '[data-section="qibla"]'
      );

    if (button) {
      button.click();
      return;
    }

    const section =
      document.getElementById(
        "qiblaSection"
      );

    if (section) {
      document
        .querySelectorAll(".page-section")
        .forEach(function (item) {
          item.classList.remove("active");
        });

      section.classList.add("active");
    }
  }

  /* =========================================================
     تغيير المدينة
     ========================================================= */

  window.addEventListener(
    "amirCityChanged",
    function () {
      refresh();
    }
  );

  window.addEventListener(
    "amirPrayerUpdated",
    function () {
      refresh();
    }
  );

  document.addEventListener(
    "visibilitychange",
    function () {
      if (!document.hidden) {
        refresh();
      }
    }
  );

  /* =========================================================
     أزرار الواجهة
     ========================================================= */

  function bindButtons() {
    const startButton =
      document.getElementById(
        "startQibla"
      );

    const enableButton =
      document.getElementById(
        "enableCompass"
      );

    const stopButton =
      document.getElementById(
        "stopCompass"
      );

    const refreshButton =
      document.getElementById(
        "refreshQibla"
      );

    if (startButton) {
      startButton.addEventListener(
        "click",
        start
      );
    }

    if (enableButton) {
      enableButton.addEventListener(
        "click",
        start
      );
    }

    if (stopButton) {
      stopButton.addEventListener(
        "click",
        stop
      );
    }

    if (refreshButton) {
      refreshButton.addEventListener(
        "click",
        refresh
      );
    }
  }

  /* =========================================================
     API
     ========================================================= */

  window.AmirQibla = {
    CITIES,

    calculateQiblaBearing,
    getQiblaBearing,
    getDirectionName,
    getCurrentCoordinates,

    start,
    stop,
    refresh,
    open,

    isRunning: function () {
      return isRunning;
    },

    getLastHeading: function () {
      return lastHeading;
    }
  };

  /* =========================================================
     التشغيل
     ========================================================= */

  function init() {
    bindButtons();
    renderStaticQibla();
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
