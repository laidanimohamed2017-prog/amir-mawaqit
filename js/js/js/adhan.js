"use strict";

/*
=========================================================
  أمير مواقيت V2
  Adhan Engine
=========================================================
*/

(function () {

    const AUDIO_PATH = "./adhan1.mp3";

    let audio = null;
    let scheduler = null;
    let scheduledKeys = new Set();

    const DEFAULT_SETTINGS = {
        enabled: true,
        timing: "at",
        sound: "adhan1",
        volume: 1
    };


    /* =====================================================
       AUDIO
       ===================================================== */

    function getAudio() {

        if (audio) {
            return audio;
        }

        audio = document.getElementById("adhanAudio");

        if (!audio) {

            audio = document.createElement("audio");

            audio.id = "adhanAudio";
            audio.preload = "auto";

            document.body.appendChild(audio);
        }


        /*
        إذا كان المصدر الموجود في HTML خاطئًا،
        نفرض المسار الصحيح من جذر المشروع.
        */

        let source =
            audio.querySelector("source");


        if (!source) {

            source =
                document.createElement("source");

            source.type = "audio/mpeg";

            audio.appendChild(source);
        }


        source.src = AUDIO_PATH;

        audio.src = AUDIO_PATH;

        audio.preload = "auto";


        return audio;
    }


    /* =====================================================
       SETTINGS
       ===================================================== */

    function getSettings() {

        if (
            window.AmirStorage &&
            typeof window.AmirStorage.getAdhanSettings === "function"
        ) {

            const saved =
                window.AmirStorage.getAdhanSettings();

            return {
                ...DEFAULT_SETTINGS,
                ...(saved || {})
            };
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

            volume:
                parseFloat(
                    localStorage.getItem(
                        "amirAdhanVolume"
                    ) || "1"
                )
        };
    }


    function saveSettings(settings) {

        if (
            window.AmirStorage &&
            typeof window.AmirStorage.setAdhanSettings === "function"
        ) {

            window.AmirStorage.setAdhanSettings(
                settings
            );

            return;
        }


        localStorage.setItem(
            "amirAdhanEnabled",
            settings.enabled
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
            settings.volume
        );
    }


    /* =====================================================
       PLAY
       ===================================================== */

    async function play() {

        const settings =
            getSettings();


        const player =
            getAudio();


        try {

            player.pause();

            player.currentTime = 0;

            player.volume =
                Math.max(
                    0,
                    Math.min(
                        1,
                        Number(
                            settings.volume
                        ) || 1
                    )
                );


            /*
            إعادة تحميل المصدر إذا لزم
            */

            if (
                !player.src ||
                !player.src.endsWith("adhan1.mp3")
            ) {

                player.src =
                    AUDIO_PATH;

                player.load();
            }


            await player.play();


            console.log(
                "🔊 أمير مواقيت: بدأ تشغيل الأذان"
            );


            return true;

        } catch (error) {

            console.warn(
                "تعذر تشغيل الأذان:",
                error
            );


            showMessage(
                "اضغط زر اختبار الأذان مرة واحدة للسماح بتشغيل الصوت."
            );


            return false;
        }
    }


    /* =====================================================
       STOP
       ===================================================== */

    function stop() {

        const player =
            getAudio();


        try {

            player.pause();

            player.currentTime = 0;

        } catch (error) {

            console.warn(
                "خطأ في إيقاف الأذان:",
                error
            );
        }


        console.log(
            "⏹ أمير مواقيت: تم إيقاف الأذان"
        );
    }


    /* =====================================================
       TEST
       ===================================================== */

    async function test() {

        const player =
            getAudio();


        player.volume =
            Number(
                getSettings().volume
            ) || 1;


        return await play();
    }


    /* =====================================================
       VOLUME
       ===================================================== */

    function setVolume(value) {

        let volume =
            parseFloat(value);


        if (Number.isNaN(volume)) {
            volume = 1;
        }


        volume =
            Math.max(
                0,
                Math.min(
                    1,
                    volume
                )
            );


        const settings =
            getSettings();


        settings.volume =
            volume;


        saveSettings(settings);


        const player =
            getAudio();


        player.volume =
            volume;
    }


    /* =====================================================
       NOTIFICATIONS
       ===================================================== */

    async function requestNotificationPermission() {

        if (
            !("Notification" in window)
        ) {

            showMessage(
                "المتصفح لا يدعم الإشعارات."
            );

            return "unsupported";
        }


        try {

            const permission =
                await Notification.requestPermission();


            if (
                permission === "granted"
            ) {

                showMessage(
                    "تم تفعيل الإشعارات 🔔"
                );

            } else if (
                permission === "denied"
            ) {

                showMessage(
                    "تم رفض الإشعارات من المتصفح."
                );

            } else {

                showMessage(
                    "لم يتم اختيار السماح بالإشعارات."
                );
            }


            return permission;

        } catch (error) {

            console.warn(
                "Notification permission error:",
                error
            );


            return "error";
        }
    }


    function notify(title, body) {

        if (
            !("Notification" in window)
        ) {
            return false;
        }


        if (
            Notification.permission !==
            "granted"
        ) {
            return false;
        }


        try {

            new Notification(
                title,
                {
                    body: body || "",
                    icon: "./icon-192.png",
                    badge: "./icon-192.png",
                    dir: "rtl",
                    lang: "ar"
                }
            );


            return true;

        } catch (error) {

            console.warn(
                "Notification error:",
                error
            );


            return false;
        }
    }


    /* =====================================================
       PRAYER NAME
       ===================================================== */

    const prayerNames = {
        Fajr: "الفجر",
        Sunrise: "الشروق",
        Dhuhr: "الظهر",
        Asr: "العصر",
        Maghrib: "المغرب",
        Isha: "العشاء"
    };


    function getPrayerArabicName(name) {

        return (
            prayerNames[name] ||
            name ||
            "الصلاة"
        );
    }


    /* =====================================================
       SCHEDULER
       ===================================================== */

    function clearScheduler() {

        if (scheduler) {

            clearInterval(
                scheduler
            );

            scheduler = null;
        }


        scheduledKeys.clear();
    }


    function schedulePrayer(
        prayerName,
        prayerTime,
        type
    ) {

        if (!prayerTime) {
            return;
        }


        const now =
            Date.now();


        const prayerDate =
            new Date();


        const parts =
            String(prayerTime)
                .split(":");


        if (
            parts.length < 2
        ) {
            return;
        }


        prayerDate.setHours(
            parseInt(parts[0], 10),
            parseInt(parts[1], 10),
            0,
            0
        );


        let target =
            prayerDate.getTime();


        /*
        before = قبل الصلاة بـ10 دقائق
        at     = عند الصلاة
        */

        if (
            type === "before"
        ) {

            target -=
                10 * 60 * 1000;
        }


        if (
            target <= now
        ) {
            return;
        }


        const key =
            prayerName +
            "_" +
            type +
            "_" +
            prayerDate
                .toISOString()
                .slice(0, 10);


        if (
            scheduledKeys.has(key)
        ) {
            return;
        }


        scheduledKeys.add(key);


        const delay =
            target - now;


        setTimeout(
            () => {

                const settings =
                    getSettings();


                if (
                    !settings.enabled
                ) {
                    return;
                }


                const arabicName =
                    getPrayerArabicName(
                        prayerName
                    );


                if (
                    type === "before"
                ) {

                    notify(
                        "أمير مواقيت 🕌",
                        `بقي 10 دقائق على صلاة ${arabicName}`
                    );

                } else {

                    notify(
                        "أمير مواقيت 🕌",
                        `حان الآن وقت صلاة ${arabicName}`
                    );


                    /*
                    تشغيل الأذان عند دخول الوقت
                    */

                    play();
                }

            },
            delay
        );
    }


    function reschedule() {

        clearScheduler();


        const settings =
            getSettings();


        if (
            !settings.enabled ||
            settings.timing === "off"
        ) {

            return;
        }


        if (
            !window.AmirPrayer ||
            typeof window.AmirPrayer.getTodaySchedule !== "function"
        ) {

            console.warn(
                "AmirPrayer غير جاهز بعد."
            );

            return;
        }


        const schedule =
            window.AmirPrayer.getTodaySchedule();


        if (!schedule) {
            return;
        }


        const prayers = [
            "Fajr",
            "Dhuhr",
            "Asr",
            "Maghrib",
            "Isha"
        ];


        prayers.forEach(
            prayerName => {

                const prayerTime =
                    schedule[prayerName];


                if (!prayerTime) {
                    return;
                }


                if (
                    settings.timing === "before" ||
                    settings.timing === "both"
                ) {

                    schedulePrayer(
                        prayerName,
                        prayerTime,
                        "before"
                    );
                }


                if (
                    settings.timing === "at" ||
                    settings.timing === "both"
                ) {

                    schedulePrayer(
                        prayerName,
                        prayerTime,
                        "at"
                    );
                }

            }
        );


        console.log(
            "🔔 تم تحديث جدول تنبيهات الأذان"
        );
    }


    /* =====================================================
       REFRESH
       ===================================================== */

    function refresh() {

        reschedule();
    }


    /* =====================================================
       MESSAGE
       ===================================================== */

    function showMessage(message) {

        const toast =
            document.getElementById(
                "amirToast"
            );


        if (toast) {

            toast.textContent =
                message;

            toast.classList.add(
                "show"
            );


            clearTimeout(
                toast._timer
            );


            toast._timer =
                setTimeout(
                    () => {

                        toast.classList.remove(
                            "show"
                        );

                    },
                    3500
                );


            return;
        }


        /*
        احتياط إذا لم يكن Toast موجودًا
        */

        console.log(
            message
        );
    }


    /* =====================================================
       INITIALIZE AUDIO
       ===================================================== */

    function initializeAudio() {

        const player =
            getAudio();


        const settings =
            getSettings();


        player.volume =
            Math.max(
                0,
                Math.min(
                    1,
                    Number(
                        settings.volume
                    ) || 1
                )
            );


        /*
        تحميل الصوت مسبقًا
        */

        try {

            player.load();

        } catch {}
    }


    /* =====================================================
       PUBLIC API
       ===================================================== */

    window.AmirAdhan = {

        play,
        stop,
        test,

        getSettings,
        saveSettings,

        setVolume,

        requestNotificationPermission,
        notify,

        reschedule,
        refresh,

        clearScheduler,

        getAudio

    };


    /* =====================================================
       INITIALIZATION
       ===================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            initializeAudio();

            /*
            لا نضيف هنا مستمعات الأزرار.
            settings.js هو المسؤول عنها،
            لتجنب تشغيل الأذان مرتين.
            */

            console.log(
                "🔊 Amir Adhan V2 loaded"
            );

        }
    );


})();
