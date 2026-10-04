/* =========================================================
   أمير مواقيت V2
   qibla.js
   نظام اتجاه القبلة والبوصلة
   ========================================================= */

(() => {
  "use strict";

  /* ---------------------------------------------------------
     إحداثيات الكعبة المشرفة
     --------------------------------------------------------- */

  const KAABA_LATITUDE = 21.4225;
  const KAABA_LONGITUDE = 39.8262;

  let compassActive = false;
  let orientationHandler = null;
  let lastHeading = null;

  /* ---------------------------------------------------------
     تحويل الدرجات إلى راديان
     --------------------------------------------------------- */

  function toRadians(degrees) {
    return degrees * Math.PI / 180;
  }

  /* ---------------------------------------------------------
     تحويل الراديان إلى درجات
     --------------------------------------------------------- */

  function toDegrees(radians) {
    return radians * 180 / Math.PI;
  }

  /* ---------------------------------------------------------
     حساب اتجاه القبلة من إحداثيات المستخدم
     إلى مكة المكرمة
     --------------------------------------------------------- */

  function calculateQiblaBearing(
    latitude,
    longitude
  ) {
    const lat1 =
      toRadians(latitude);

    const lat2 =
      toRadians(KAABA_LATITUDE);

    const deltaLongitude =
      toRadians(
        KAABA_LONGITUDE -
        longitude
      );

    const y =
      Math.sin(deltaLongitude);

    const x =
      Math.cos(lat1) *
        Math.tan(lat2) -
      Math.sin(lat1) *
        Math.cos(deltaLongitude);

    let bearing =
      toDegrees(
        Math.atan2(y, x)
      );

    bearing =
      (bearing + 360) % 360;

    return bearing;
  }

  /* ---------------------------------------------------------
     جلب موقع المدينة الحالي
     --------------------------------------------------------- */

  function getCurrentCity() {
    if (
      window.AmirPrayer &&
      typeof window.AmirPrayer.getCity ===
        "function"
    ) {
      return window.AmirPrayer.getCity();
    }

    return {
      name: "عين وسارة",
      latitude: 35.4513,
      longitude: 2.9067
    };
  }

  /* ---------------------------------------------------------
     عرض درجة القبلة
     --------------------------------------------------------- */

  function renderBearing(
    bearing
  ) {
    const rounded =
      Math.round(bearing);

    const degreeElements =
      document.querySelectorAll(
        "[data-qibla-degree]"
      );

    degreeElements.forEach(
      element => {
        element.textContent =
          `${rounded}°`;
      }
    );

    const degree =
      document.getElementById(
        "qiblaDegree"
      );

    if (degree) {
      degree.textContent =
        `${rounded}°`;
    }

    const status =
      document.getElementById(
        "qiblaStatus"
      );

    if (status) {
      status.textContent =
        `اتجاه القبلة ${rounded}° من الشمال`;
    }
  }

  /* ---------------------------------------------------------
     تحريك سهم القبلة
     --------------------------------------------------------- */

  function rotateQiblaArrow(
    angle
  ) {
    const arrows =
      document.querySelectorAll(
        ".qibla-arrow"
      );

    arrows.forEach(
      arrow => {
        arrow.style.transform =
          `translate(-50%, -50%) rotate(${angle}deg)`;
      }
    );

    const mainArrow =
      document.getElementById(
        "qiblaArrow"
      );

    if (mainArrow) {
      mainArrow.style.transform =
        `translate(-50%, -50%) rotate(${angle}deg)`;
    }
  }

  /* ---------------------------------------------------------
     اتجاه القبلة بدون بوصلة
     --------------------------------------------------------- */

  function showStaticQibla() {
    const city =
      getCurrentCity();

    const bearing =
      calculateQiblaBearing(
        city.latitude,
        city.longitude
      );

    renderBearing(
      bearing
    );

    rotateQiblaArrow(
      bearing
    );

    updateStatus(
      "الاتجاه المحسوب حسب موقع المدينة"
    );

    saveQiblaSettings({
      latitude:
        city.latitude,

      longitude:
        city.longitude,

      bearing
    });

    return bearing;
  }

  /* ---------------------------------------------------------
     حالة البوصلة
     --------------------------------------------------------- */

  function updateStatus(
    message
  ) {
    const statusElements =
      document.querySelectorAll(
        "[data-qibla-status]"
      );

    statusElements.forEach(
      element => {
        element.textContent =
          message;
      }
    );

    const status =
      document.getElementById(
        "qiblaStatus"
      );

    if (status) {
      status.textContent =
        message;
    }
  }

  /* ---------------------------------------------------------
     حساب اتجاه الهاتف بالنسبة للشمال
     --------------------------------------------------------- */

  function getCompassHeading(
    event
  ) {
    /*
      iOS Safari يوفر:
      webkitCompassHeading
    */

    if (
      typeof event.webkitCompassHeading ===
        "number" &&
      !Number.isNaN(
        event.webkitCompassHeading
      )
    ) {
      return event.webkitCompassHeading;
    }

    /*
      Android / بعض المتصفحات:
      alpha يمثل دوران الجهاز.
    */

    if (
      typeof event.alpha ===
        "number"
    ) {
      return (
        360 -
        event.alpha
      );
    }

    return null;
  }

  /* ---------------------------------------------------------
     تحديث البوصلة
     --------------------------------------------------------- */

  function handleOrientation(
    event
  ) {
    const heading =
      getCompassHeading(
        event
      );

    if (
      heading === null
    ) {
      return;
    }

    lastHeading =
      heading;

    const city =
      getCurrentCity();

    const qiblaBearing =
      calculateQiblaBearing(
        city.latitude,
        city.longitude
      );

    /*
      الزاوية التي يجب أن يشير إليها
      السهم على الشاشة.
    */

    let relativeAngle =
      qiblaBearing -
      heading;

    relativeAngle =
      (
        relativeAngle +
        360
      ) % 360;

    renderBearing(
      qiblaBearing
    );

    rotateQiblaArrow(
      relativeAngle
    );

    updateCompassText(
      heading,
      qiblaBearing,
      relativeAngle
    );
  }

  /* ---------------------------------------------------------
     معلومات البوصلة
     --------------------------------------------------------- */

  function updateCompassText(
    heading,
    qiblaBearing,
    relativeAngle
  ) {
    const headingElement =
      document.getElementById(
        "compassHeading"
      );

    if (headingElement) {
      headingElement.textContent =
        `${Math.round(
          heading
        )}°`;
    }

    const directionElement =
      document.getElementById(
        "qiblaDirection"
      );

    if (directionElement) {
      directionElement.textContent =
        `${Math.round(
          relativeAngle
        )}°`;
    }

    const status =
      document.getElementById(
        "qiblaStatus"
      );

    if (status) {
      status.textContent =
        `القبلة ${Math.round(
          qiblaBearing
        )}° — اتجاه الهاتف ${Math.round(
          heading
        )}°`;
    }
  }

  /* ---------------------------------------------------------
     طلب إذن البوصلة في iPhone / iPad
     --------------------------------------------------------- */

  async function requestOrientationPermission() {
    /*
      iOS 13+ يحتاج إلى إذن صريح
      عند استخدام DeviceOrientationEvent.
    */

    if (
      typeof DeviceOrientationEvent !==
        "undefined" &&
      typeof DeviceOrientationEvent.requestPermission ===
        "function"
    ) {
      try {
        const permission =
          await DeviceOrientationEvent.requestPermission();

        if (
          permission ===
          "granted"
        ) {
          startCompassListener();

          return true;
        }

        updateStatus(
          "تم رفض إذن البوصلة. فعّل الوصول إلى مستشعر الحركة."
        );

        return false;
      } catch (error) {
        console.warn(
          "Orientation permission error:",
          error
        );

        updateStatus(
          "تعذر الحصول على إذن البوصلة"
        );

        return false;
      }
    }

    /*
      Android والمتصفحات التي لا تحتاج
      إلى requestPermission.
    */

    startCompassListener();

    return true;
  }

  /* ---------------------------------------------------------
     تشغيل البوصلة
     --------------------------------------------------------- */

  function startCompassListener() {
    if (
      compassActive
    ) {
      return true;
    }

    if (
      typeof DeviceOrientationEvent ===
      "undefined"
    ) {
      updateStatus(
        "هذا الجهاز لا يدعم مستشعر الاتجاه"
      );

      showStaticQibla();

      return false;
    }

    orientationHandler =
      handleOrientation;

    /*
      true = التقاط orientation بشكل أفضل
    */

    window.addEventListener(
      "deviceorientationabsolute",
      orientationHandler,
      true
    );

    /*
      fallback للمتصفحات التي
      لا توفر absolute.
    */

    window.addEventListener(
      "deviceorientation",
      orientationHandler,
      true
    );

    compassActive =
      true;

    updateStatus(
      "البوصلة تعمل — حرّك الهاتف ببطء"
    );

    return true;
  }

  /* ---------------------------------------------------------
     إيقاف البوصلة
     --------------------------------------------------------- */

  function stopCompass() {
    if (
      !orientationHandler
    ) {
      return;
    }

    window.removeEventListener(
      "deviceorientationabsolute",
      orientationHandler,
      true
    );

    window.removeEventListener(
      "deviceorientation",
      orientationHandler,
      true
    );

    orientationHandler =
      null;

    compassActive =
      false;

    updateStatus(
      "تم إيقاف البوصلة"
    );
  }

  /* ---------------------------------------------------------
     تخزين إعدادات القبلة
     --------------------------------------------------------- */

  function saveQiblaSettings(
    settings
  ) {
    try {
      if (
        window.AmirStorage &&
        typeof window.AmirStorage.setQiblaSettings ===
          "function"
      ) {
        window.AmirStorage.setQiblaSettings(
          settings
        );

        return;
      }

      localStorage.setItem(
        "amirQiblaSettings",
        JSON.stringify(
          settings
        )
      );
    } catch (error) {
      console.warn(
        "Could not save qibla settings:",
        error
      );
    }
  }

  function getSavedQiblaSettings() {
    try {
      if (
        window.AmirStorage &&
        typeof window.AmirStorage.getQiblaSettings ===
          "function"
      ) {
        return (
          window.AmirStorage.getQiblaSettings() ||
          null
        );
      }

      const raw =
        localStorage.getItem(
          "amirQiblaSettings"
        );

      if (!raw) {
        return null;
      }

      return JSON.parse(
        raw
      );
    } catch {
      return null;
    }
  }

  /* ---------------------------------------------------------
     إعادة حساب القبلة
     --------------------------------------------------------- */

  function refreshQibla() {
    const city =
      getCurrentCity();

    const bearing =
      calculateQiblaBearing(
        city.latitude,
        city.longitude
      );

    renderBearing(
      bearing
    );

    if (!compassActive) {
      rotateQiblaArrow(
        bearing
      );
    }

    return bearing;
  }

  /* ---------------------------------------------------------
     ربط أزرار الواجهة
     --------------------------------------------------------- */

  function bindUI() {
    const button =
      document.getElementById(
        "startQibla"
      );

    if (button) {
      button.addEventListener(
        "click",
        async () => {
          await requestOrientationPermission();
        }
      );
    }

    const startButton =
      document.getElementById(
        "enableCompass"
      );

    if (startButton) {
      startButton.addEventListener(
        "click",
        async () => {
          await requestOrientationPermission();
        }
      );
    }

    const stopButton =
      document.getElementById(
        "stopCompass"
      );

    if (stopButton) {
      stopButton.addEventListener(
        "click",
        () => {
          stopCompass();
        }
      );
    }

    const refreshButton =
      document.getElementById(
        "refreshQibla"
      );

    if (refreshButton) {
      refreshButton.addEventListener(
        "click",
        () => {
          refreshQibla();
        }
      );
    }
  }

  /* ---------------------------------------------------------
     API عام
     --------------------------------------------------------- */

  window.AmirQibla = {
    calculate:
      calculateQiblaBearing,

    getCity:
      getCurrentCity,

    refresh:
      refreshQibla,

    start:
      requestOrientationPermission,

    stop:
      stopCompass,

    isActive:
      () => compassActive,

    getLastHeading:
      () => lastHeading,

    getSavedSettings:
      getSavedQiblaSettings
  };

  /* ---------------------------------------------------------
     التشغيل
     --------------------------------------------------------- */

  document.addEventListener(
    "DOMContentLoaded",
    () => {
      bindUI();

      /*
        نعرض اتجاه القبلة المحسوب
        مباشرة حتى قبل تشغيل البوصلة.
      */

      setTimeout(
        () => {
          refreshQibla();
        },
        300
      );
    }
  );

})();
