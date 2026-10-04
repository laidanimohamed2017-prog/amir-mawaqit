/* =========================================================
   أمير مواقيت V2
   Qibla Module
   القبلة والبوصلة
   ========================================================= */

(function () {
    "use strict";

    const KAABA_LAT = 21.4225;
    const KAABA_LON = 39.8262;

    let currentCity = null;
    let qiblaBearing = 0;
    let compassHeading = null;
    let isCompassActive = false;
    let orientationHandler = null;
    let orientationEventType = null;

    /* ---------------------------------------------------------
       Helpers
    --------------------------------------------------------- */

    function getElement(id) {
        return document.getElementById(id);
    }

    function showMessage(message, type = "info") {
        const toast = getElement("amirToast");

        if (!toast) {
            return;
        }

        toast.textContent = message;
        toast.className = "amir-toast show";

        if (type === "success") {
            toast.classList.add("success");
        } else if (type === "error") {
            toast.classList.add("error");
        }

        clearTimeout(showMessage.timer);

        showMessage.timer = setTimeout(() => {
            toast.classList.remove("show", "success", "error");
        }, 3000);
    }

    function normalizeDegrees(value) {
        value = Number(value) || 0;
        return ((value % 360) + 360) % 360;
    }

    function toRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    function toDegrees(radians) {
        return radians * 180 / Math.PI;
    }

    /* ---------------------------------------------------------
       Get city coordinates
    --------------------------------------------------------- */

    function getSelectedCity() {
        try {
            if (
                window.AmirStorage &&
                typeof window.AmirStorage.getCity === "function"
            ) {
                return window.AmirStorage.getCity();
            }
        } catch (error) {
            console.warn("AmirStorage city error:", error);
        }

        return localStorage.getItem("amirCity") || "ain_oussera";
    }

    function getCityCoordinates() {
        const cityKey = getSelectedCity();

        if (
            window.AmirPrayer &&
            typeof window.AmirPrayer.getCityCoordinates === "function"
        ) {
            const coordinates =
                window.AmirPrayer.getCityCoordinates(cityKey);

            if (coordinates) {
                return coordinates;
            }
        }

        const fallbackCities = {
            algiers: {
                lat: 36.7538,
                lon: 3.0588
            },

            oran: {
                lat: 35.6971,
                lon: -0.6308
            },

            constantine: {
                lat: 36.3650,
                lon: 6.6147
            },

            annaba: {
                lat: 36.9000,
                lon: 7.7667
            },

            blida: {
                lat: 36.4700,
                lon: 2.8300
            },

            setif: {
                lat: 36.1900,
                lon: 5.4100
            },

            tlemcen: {
                lat: 34.8828,
                lon: -1.3167
            },

            ain_oussera: {
                lat: 35.4513,
                lon: 2.9067
            }
        };

        return fallbackCities[cityKey] || fallbackCities.ain_oussera;
    }

    /* ---------------------------------------------------------
       Calculate Qibla bearing
    --------------------------------------------------------- */

    function calculateQibla(latitude, longitude) {
        const lat1 = toRadians(latitude);
        const lat2 = toRadians(KAABA_LAT);

        const deltaLon = toRadians(KAABA_LON - longitude);

        const y = Math.sin(deltaLon);

        const x =
            Math.cos(lat1) * Math.tan(lat2) -
            Math.sin(lat1) * Math.cos(deltaLon);

        let bearing = toDegrees(Math.atan2(y, x));

        bearing = normalizeDegrees(bearing);

        return bearing;
    }

    function calculateCurrentQibla() {
        const coordinates = getCityCoordinates();

        if (!coordinates) {
            return null;
        }

        const latitude =
            Number(
                coordinates.lat ??
                coordinates.latitude
            );

        const longitude =
            Number(
                coordinates.lon ??
                coordinates.lng ??
                coordinates.longitude
            );

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {
            return null;
        }

        qiblaBearing = calculateQibla(latitude, longitude);

        currentCity = {
            latitude,
            longitude
        };

        return qiblaBearing;
    }

    /* ---------------------------------------------------------
       Direction name
    --------------------------------------------------------- */

    function getDirectionName(degrees) {
        degrees = normalizeDegrees(degrees);

        if (degrees >= 337.5 || degrees < 22.5) {
            return "شمال";
        }

        if (degrees < 67.5) {
            return "شمال شرق";
        }

        if (degrees < 112.5) {
            return "شرق";
        }

        if (degrees < 157.5) {
            return "جنوب شرق";
        }

        if (degrees < 202.5) {
            return "جنوب";
        }

        if (degrees < 247.5) {
            return "جنوب غرب";
        }

        if (degrees < 292.5) {
            return "غرب";
        }

        return "شمال غرب";
    }

    /* ---------------------------------------------------------
       Update UI
    --------------------------------------------------------- */

    function updateQiblaUI() {
        const degreeElement = getElement("qiblaDegree");
        const directionElement = getElement("qiblaDirection");
        const statusElement = getElement("qiblaStatus");

        if (degreeElement) {
            degreeElement.textContent =
                Math.round(qiblaBearing) + "°";
        }

        if (directionElement) {
            directionElement.textContent =
                getDirectionName(qiblaBearing);
        }

        if (statusElement) {
            statusElement.textContent =
                "اتجاه القبلة من موقعك الحالي";
        }

        updateCompassUI();
    }

    /* ---------------------------------------------------------
       Compass UI
    --------------------------------------------------------- */

    function updateCompassUI() {
        const arrow = getElement("qiblaArrow");
        const compass = getElement("compass");
        const headingElement = getElement("compassHeading");

        if (headingElement) {
            if (compassHeading === null) {
                headingElement.textContent = "--°";
            } else {
                headingElement.textContent =
                    Math.round(compassHeading) + "°";
            }
        }

        if (!arrow) {
            return;
        }

        if (compassHeading === null) {
            arrow.style.transform =
                "translate(-50%, -50%) rotate(" +
                qiblaBearing +
                "deg)";

            return;
        }

        /*
         * السهم يشير فعلياً نحو القبلة بالنسبة لاتجاه
         * الهاتف الحالي.
         */
        const rotation =
            normalizeDegrees(qiblaBearing - compassHeading);

        arrow.style.transform =
            "translate(-50%, -50%) rotate(" +
            rotation +
            "deg)";

        if (compass) {
            compass.setAttribute(
                "data-heading",
                String(Math.round(compassHeading))
            );
        }
    }

    /* ---------------------------------------------------------
       Compass heading extraction
    --------------------------------------------------------- */

    function extractHeading(event) {
        /*
         * iPhone / iPad Safari
         */
        if (
            typeof event.webkitCompassHeading === "number" &&
            Number.isFinite(event.webkitCompassHeading)
        ) {
            return normalizeDegrees(
                event.webkitCompassHeading
            );
        }

        /*
         * Android / standard orientation
         */
        if (
            typeof event.alpha === "number" &&
            Number.isFinite(event.alpha)
        ) {
            let heading = 360 - event.alpha;

            /*
             * landscape correction
             */
            if (
                typeof window.orientation === "number" &&
                window.orientation !== 0
            ) {
                heading += window.orientation;
            }

            return normalizeDegrees(heading);
        }

        return null;
    }

    function handleOrientation(event) {
        const heading = extractHeading(event);

        if (heading === null) {
            return;
        }

        compassHeading = heading;

        updateCompassUI();

        const status = getElement("qiblaStatus");

        if (status) {
            const difference =
                Math.abs(
                    normalizeDegrees(
                        qiblaBearing - compassHeading
                    )
                );

            const shortestDifference =
                Math.min(
                    difference,
                    360 - difference
                );

            if (shortestDifference <= 5) {
                status.textContent =
                    "أنت تقريباً في اتجاه القبلة ✓";
            } else if (shortestDifference <= 15) {
                status.textContent =
                    "اقتربت من اتجاه القبلة";
            } else {
                status.textContent =
                    "حرّك الهاتف حتى يشير السهم إلى اتجاه القبلة";
            }
        }
    }

    /* ---------------------------------------------------------
       Start compass
    --------------------------------------------------------- */

    async function startCompass() {
        if (!("DeviceOrientationEvent" in window)) {
            showMessage(
                "هذا الجهاز لا يدعم البوصلة الإلكترونية",
                "error"
            );
            return false;
        }

        /*
         * iOS requires explicit permission.
         */
        if (
            typeof DeviceOrientationEvent.requestPermission ===
            "function"
        ) {
            try {
                const permission =
                    await DeviceOrientationEvent.requestPermission();

                if (permission !== "granted") {
                    showMessage(
                        "لم يتم السماح بالوصول إلى البوصلة",
                        "error"
                    );

                    return false;
                }
            } catch (error) {
                console.error(
                    "Compass permission error:",
                    error
                );

                showMessage(
                    "تعذر تشغيل البوصلة",
                    "error"
                );

                return false;
            }
        }

        stopCompass(false);

        orientationHandler = handleOrientation;

        /*
         * نستخدم absolute عندما يكون متاحاً.
         * لا نربط النوعين معاً حتى لا تتكرر الأحداث.
         */
        if ("ondeviceorientationabsolute" in window) {
            orientationEventType =
                "deviceorientationabsolute";
        } else {
            orientationEventType =
                "deviceorientation";
        }

        window.addEventListener(
            orientationEventType,
            orientationHandler,
            true
        );

        isCompassActive = true;

        const status = getElement("qiblaStatus");

        if (status) {
            status.textContent =
                "البوصلة تعمل — حرّك الهاتف ببطء لمعايرتها";
        }

        const enableButton =
            getElement("enableCompass");

        const startButton =
            getElement("startQibla");

        const stopButton =
            getElement("stopCompass");

        if (enableButton) {
            enableButton.classList.add("active");
        }

        if (startButton) {
            startButton.classList.add("active");
        }

        if (stopButton) {
            stopButton.disabled = false;
        }

        showMessage(
            "تم تشغيل البوصلة",
            "success"
        );

        return true;
    }

    /* ---------------------------------------------------------
       Stop compass
    --------------------------------------------------------- */

    function stopCompass(showToast = true) {
        if (
            orientationHandler &&
            orientationEventType
        ) {
            window.removeEventListener(
                orientationEventType,
                orientationHandler,
                true
            );
        }

        orientationHandler = null;
        orientationEventType = null;

        isCompassActive = false;
        compassHeading = null;

        updateCompassUI();

        const status = getElement("qiblaStatus");

        if (status) {
            status.textContent =
                "البوصلة متوقفة";
        }

        const enableButton =
            getElement("enableCompass");

        const startButton =
            getElement("startQibla");

        const stopButton =
            getElement("stopCompass");

        if (enableButton) {
            enableButton.classList.remove("active");
        }

        if (startButton) {
            startButton.classList.remove("active");
        }

        if (stopButton) {
            stopButton.disabled = true;
        }

        if (showToast) {
            showMessage(
                "تم إيقاف البوصلة"
            );
        }
    }

    /* ---------------------------------------------------------
       Refresh Qibla
    --------------------------------------------------------- */

    function refresh() {
        const bearing =
            calculateCurrentQibla();

        if (bearing === null) {
            showMessage(
                "تعذر تحديد اتجاه القبلة",
                "error"
            );

            return null;
        }

        updateQiblaUI();

        return bearing;
    }

    /* ---------------------------------------------------------
       Quick access
    --------------------------------------------------------- */

    function openQibla() {
        const qiblaSection =
            getElement("qiblaSection");

        if (qiblaSection) {
            document
                .querySelectorAll(".page-section")
                .forEach(section => {
                    section.classList.remove("active");
                });

            qiblaSection.classList.add("active");
        }

        document
            .querySelectorAll(
                "[data-section], [data-page]"
            )
            .forEach(button => {
                button.classList.remove("active");
            });

        const qiblaNav =
            document.querySelector(
                '[data-section="qibla"]'
            );

        if (qiblaNav) {
            qiblaNav.classList.add("active");
        }

        refresh();
    }

    /* ---------------------------------------------------------
       Bind buttons
    --------------------------------------------------------- */

    function bindEvents() {
        const startButton =
            getElement("startQibla");

        const enableButton =
            getElement("enableCompass");

        const stopButton =
            getElement("stopCompass");

        const refreshButton =
            getElement("refreshQibla");

        if (startButton) {
            startButton.addEventListener(
                "click",
                function () {
                    refresh();
                    startCompass();
                }
            );
        }

        if (enableButton) {
            enableButton.addEventListener(
                "click",
                function () {
                    startCompass();
                }
            );
        }

        if (stopButton) {
            stopButton.addEventListener(
                "click",
                function () {
                    stopCompass();
                }
            );

            stopButton.disabled = true;
        }

        if (refreshButton) {
            refreshButton.addEventListener(
                "click",
                function () {
                    refresh();
                    showMessage(
                        "تم تحديث اتجاه القبلة",
                        "success"
                    );
                }
            );
        }

        /*
         * زر القبلة السريع من الصفحة الرئيسية
         */
        document
            .querySelectorAll(
                '[data-go-section="qibla"]'
            )
            .forEach(button => {
                button.addEventListener(
                    "click",
                    function () {
                        openQibla();
                    }
                );
            });

        /*
         * عندما يفتح المستخدم قسم القبلة
         */
        document
            .querySelectorAll(
                '[data-section="qibla"]'
            )
            .forEach(button => {
                button.addEventListener(
                    "click",
                    function () {
                        setTimeout(
                            refresh,
                            100
                        );
                    }
                );
            });
    }

    /* ---------------------------------------------------------
       Public API
    --------------------------------------------------------- */

    window.AmirQibla = {
        calculate: calculateCurrentQibla,
        calculateBearing: calculateQibla,
        getBearing: function () {
            return qiblaBearing;
        },
        getHeading: function () {
            return compassHeading;
        },
        getDirectionName,
        startCompass,
        stopCompass,
        refresh,
        updateUI: updateQiblaUI,
        open: openQibla,
        isActive: function () {
            return isCompassActive;
        }
    };

    /* ---------------------------------------------------------
       Initialization
    --------------------------------------------------------- */

    document.addEventListener(
        "DOMContentLoaded",
        function () {
            calculateCurrentQibla();
            updateQiblaUI();
            bindEvents();

            /*
             * إذا تغيرت المدينة أثناء تشغيل التطبيق
             */
            window.addEventListener(
                "amirCityChanged",
                function () {
                    refresh();
                }
            );
        }
    );

})();
