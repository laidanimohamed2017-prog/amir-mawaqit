/* =========================================================
   أمير مواقيت V2
   Azkar Module
   الأذكار + التسبيح + المفضلة + الحفظ
   ========================================================= */

(function () {
    "use strict";

    /* ---------------------------------------------------------
       بيانات الأذكار
    --------------------------------------------------------- */

    const AZKAR_DATA = {

        morning: {
            title: "أذكار الصباح",
            icon: "☀️",
            items: [
                {
                    id: "morning-1",
                    text: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ ۝ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ...",
                    count: 1,
                    source: "آية الكرسي"
                },
                {
                    id: "morning-2",
                    text: "قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ",
                    count: 3,
                    source: "سورة الإخلاص"
                },
                {
                    id: "morning-3",
                    text: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِنْ شَرِّ مَا خَلَقَ ۝ وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ",
                    count: 3,
                    source: "سورة الفلق"
                },
                {
                    id: "morning-4",
                    text: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ",
                    count: 3,
                    source: "سورة الناس"
                },
                {
                    id: "morning-5",
                    text: "أصبحنا وأصبح الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير.",
                    count: 1,
                    source: "ذكر الصباح"
                },
                {
                    id: "morning-6",
                    text: "اللهم بك أصبحنا وبك أمسينا وبك نحيا وبك نموت وإليك النشور.",
                    count: 1,
                    source: "ذكر الصباح"
                },
                {
                    id: "morning-7",
                    text: "رضيت بالله ربًا، وبالإسلام دينًا، وبمحمد ﷺ نبيًا.",
                    count: 3,
                    source: "ذكر الصباح"
                },
                {
                    id: "morning-8",
                    text: "اللهم إني أصبحت أشهدك وأشهد حملة عرشك وملائكتك وجميع خلقك أنك أنت الله لا إله إلا أنت وحدك لا شريك لك وأن محمدًا عبدك ورسولك.",
                    count: 4,
                    source: "ذكر الصباح"
                },
                {
                    id: "morning-9",
                    text: "حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم.",
                    count: 7,
                    source: "ذكر الصباح"
                },
                {
                    id: "morning-10",
                    text: "اللهم إني أسألك العفو والعافية في الدنيا والآخرة.",
                    count: 1,
                    source: "دعاء"
                }
            ]
        },

        evening: {
            title: "أذكار المساء",
            icon: "🌙",
            items: [
                {
                    id: "evening-1",
                    text: "أمسينا وأمسى الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير.",
                    count: 1,
                    source: "ذكر المساء"
                },
                {
                    id: "evening-2",
                    text: "اللهم بك أمسينا وبك أصبحنا وبك نحيا وبك نموت وإليك المصير.",
                    count: 1,
                    source: "ذكر المساء"
                },
                {
                    id: "evening-3",
                    text: "رضيت بالله ربًا، وبالإسلام دينًا، وبمحمد ﷺ نبيًا.",
                    count: 3,
                    source: "ذكر المساء"
                },
                {
                    id: "evening-4",
                    text: "قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ",
                    count: 3,
                    source: "سورة الإخلاص"
                },
                {
                    id: "evening-5",
                    text: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِنْ شَرِّ مَا خَلَقَ ۝ وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ",
                    count: 3,
                    source: "سورة الفلق"
                },
                {
                    id: "evening-6",
                    text: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ",
                    count: 3,
                    source: "سورة الناس"
                },
                {
                    id: "evening-7",
                    text: "حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم.",
                    count: 7,
                    source: "ذكر المساء"
                },
                {
                    id: "evening-8",
                    text: "اللهم إني أسألك العفو والعافية في الدنيا والآخرة.",
                    count: 1,
                    source: "دعاء"
                }
            ]
        },

        afterPrayer: {
            title: "أذكار بعد الصلاة",
            icon: "🕌",
            items: [
                {
                    id: "afterPrayer-1",
                    text: "أستغفر الله.",
                    count: 3,
                    source: "بعد الصلاة"
                },
                {
                    id: "afterPrayer-2",
                    text: "اللهم أنت السلام ومنك السلام، تباركت يا ذا الجلال والإكرام.",
                    count: 1,
                    source: "بعد الصلاة"
                },
                {
                    id: "afterPrayer-3",
                    text: "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير.",
                    count: 1,
                    source: "بعد الصلاة"
                },
                {
                    id: "afterPrayer-4",
                    text: "سبحان الله.",
                    count: 33,
                    source: "بعد الصلاة"
                },
                {
                    id: "afterPrayer-5",
                    text: "الحمد لله.",
                    count: 33,
                    source: "بعد الصلاة"
                },
                {
                    id: "afterPrayer-6",
                    text: "الله أكبر.",
                    count: 33,
                    source: "بعد الصلاة"
                },
                {
                    id: "afterPrayer-7",
                    text: "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير.",
                    count: 1,
                    source: "بعد الصلاة"
                }
            ]
        },

        sleep: {
            title: "أذكار النوم",
            icon: "🌌",
            items: [
                {
                    id: "sleep-1",
                    text: "باسمك اللهم أموت وأحيا.",
                    count: 1,
                    source: "ذكر النوم"
                },
                {
                    id: "sleep-2",
                    text: "اللهم قني عذابك يوم تبعث عبادك.",
                    count: 3,
                    source: "ذكر النوم"
                },
                {
                    id: "sleep-3",
                    text: "سبحان الله.",
                    count: 33,
                    source: "قبل النوم"
                },
                {
                    id: "sleep-4",
                    text: "الحمد لله.",
                    count: 33,
                    source: "قبل النوم"
                },
                {
                    id: "sleep-5",
                    text: "الله أكبر.",
                    count: 34,
                    source: "قبل النوم"
                }
            ]
        },

        wake: {
            title: "أذكار الاستيقاظ",
            icon: "🌅",
            items: [
                {
                    id: "wake-1",
                    text: "الحمد لله الذي أحيانا بعدما أماتنا وإليه النشور.",
                    count: 1,
                    source: "ذكر الاستيقاظ"
                },
                {
                    id: "wake-2",
                    text: "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير.",
                    count: 1,
                    source: "ذكر الاستيقاظ"
                },
                {
                    id: "wake-3",
                    text: "سبحان الله والحمد لله والله أكبر ولا حول ولا قوة إلا بالله.",
                    count: 1,
                    source: "ذكر الاستيقاظ"
                }
            ]
        }
    };

    /* ---------------------------------------------------------
       الحالة
    --------------------------------------------------------- */

    let currentCategory = "morning";
    let searchText = "";
    let zikrState = {};
    let favorites = [];

    /* ---------------------------------------------------------
       Storage helpers
    --------------------------------------------------------- */

    function storageGet(key, fallback = null) {
        try {
            if (
                window.AmirStorage &&
                typeof window.AmirStorage.get === "function"
            ) {
                const value = window.AmirStorage.get(key);

                return value === null ||
                    value === undefined
                    ? fallback
                    : value;
            }
        } catch (error) {
            console.warn("Storage read error:", error);
        }

        try {
            const raw = localStorage.getItem(key);

            if (raw === null) {
                return fallback;
            }

            try {
                return JSON.parse(raw);
            } catch {
                return raw;
            }
        } catch {
            return fallback;
        }
    }

    function storageSet(key, value) {
        try {
            if (
                window.AmirStorage &&
                typeof window.AmirStorage.set === "function"
            ) {
                window.AmirStorage.set(key, value);
                return;
            }
        } catch (error) {
            console.warn("Storage write error:", error);
        }

        try {
            localStorage.setItem(
                key,
                JSON.stringify(value)
            );
        } catch (error) {
            console.warn(
                "LocalStorage unavailable:",
                error
            );
        }
    }

    /* ---------------------------------------------------------
       Load saved progress
    --------------------------------------------------------- */

    function loadState() {
        const saved =
            storageGet(
                "amirAzkarProgress",
                {}
            );

        if (
            saved &&
            typeof saved === "object"
        ) {
            zikrState = saved;
        } else {
            zikrState = {};
        }

        let savedFavorites =
            storageGet(
                "amirAzkarFavorites",
                []
            );

        if (!Array.isArray(savedFavorites)) {
            savedFavorites = [];
        }

        favorites = savedFavorites;
    }

    function saveState() {
        storageSet(
            "amirAzkarProgress",
            zikrState
        );
    }

    function saveFavorites() {
        storageSet(
            "amirAzkarFavorites",
            favorites
        );

        /*
         * مزامنة مع نظام التخزين الرئيسي
         */
        try {
            if (
                window.AmirStorage &&
                typeof window.AmirStorage.setFavorites ===
                    "function"
            ) {
                window.AmirStorage.setFavorites(
                    favorites
                );
            }
        } catch (error) {
            console.warn(
                "Favorite sync error:",
                error
            );
        }
    }

    /* ---------------------------------------------------------
       Progress
    --------------------------------------------------------- */

    function getProgress(id) {
        return Number(
            zikrState[id] || 0
        );
    }

    function setProgress(id, value) {
        zikrState[id] = Math.max(
            0,
            Number(value) || 0
        );

        saveState();
    }

    function increment(id, maximum) {
        const current =
            getProgress(id);

        if (current >= maximum) {
            return current;
        }

        const next =
            Math.min(
                current + 1,
                maximum
            );

        setProgress(id, next);

        return next;
    }

    function resetZikr(id) {
        setProgress(id, 0);
    }

    function resetCategory(category) {
        const data =
            AZKAR_DATA[category];

        if (!data) {
            return;
        }

        data.items.forEach(item => {
            resetZikr(item.id);
        });

        render();
    }

    function resetAll() {
        zikrState = {};
        saveState();

        render();

        showMessage(
            "تم تصفير تقدم الأذكار"
        );
    }

    /* ---------------------------------------------------------
       Favorites
    --------------------------------------------------------- */

    function isFavorite(id) {
        return favorites.includes(id);
    }

    function toggleFavorite(id) {
        if (isFavorite(id)) {
            favorites =
                favorites.filter(
                    item => item !== id
                );
        } else {
            favorites.push(id);
        }

        saveFavorites();

        render();
    }

    /* ---------------------------------------------------------
       Get current data
    --------------------------------------------------------- */

    function getCurrentItems() {
        const category =
            AZKAR_DATA[currentCategory];

        if (!category) {
            return [];
        }

        let items =
            category.items.slice();

        if (searchText.trim()) {
            const query =
                searchText
                    .trim()
                    .toLowerCase();

            items = items.filter(item => {
                return (
                    item.text
                        .toLowerCase()
                        .includes(query) ||
                    item.source
                        .toLowerCase()
                        .includes(query)
                );
            });
        }

        return items;
    }

    /* ---------------------------------------------------------
       Category progress
    --------------------------------------------------------- */

    function getCategoryProgress(category) {
        const data =
            AZKAR_DATA[category];

        if (!data || !data.items.length) {
            return {
                completed: 0,
                total: 0,
                percent: 0
            };
        }

        let total = 0;
        let completed = 0;

        data.items.forEach(item => {
            total += item.count;

            completed += Math.min(
                getProgress(item.id),
                item.count
            );
        });

        const percent =
            total > 0
                ? Math.round(
                      (completed / total) *
                          100
                  )
                : 0;

        return {
            completed,
            total,
            percent
        };
    }

    /* ---------------------------------------------------------
       HTML escape
    --------------------------------------------------------- */

    function escapeHTML(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /* ---------------------------------------------------------
       Render
    --------------------------------------------------------- */

    function render() {
        const container =
            document.getElementById(
                "azkarList"
            );

        if (!container) {
            return;
        }

        const category =
            AZKAR_DATA[currentCategory];

        if (!category) {
            container.innerHTML = "";
            return;
        }

        const items =
            getCurrentItems();

        updateCategoryButtons();
        updateHeaderProgress();

        if (!items.length) {
            container.innerHTML = `
                <div class="azkar-empty">
                    <div class="azkar-empty-icon">🔎</div>
                    <h3>لا توجد نتائج</h3>
                    <p>جرّب كلمة بحث مختلفة.</p>
                </div>
            `;

            return;
        }

        container.innerHTML =
            items
                .map(
                    item =>
                        createZikrCard(
                            item
                        )
                )
                .join("");

        bindItemEvents();
    }

    /* ---------------------------------------------------------
       Zikr Card
    --------------------------------------------------------- */

    function createZikrCard(item) {
        const current =
            Math.min(
                getProgress(item.id),
                item.count
            );

        const completed =
            current >= item.count;

        const favorite =
            isFavorite(item.id);

        const percent =
            item.count > 0
                ? Math.round(
                      (current /
                          item.count) *
                          100
                  )
                : 0;

        return `
            <article
                class="azkar-card ${
                    completed
                        ? "completed"
                        : ""
                }"
                data-zikr-id="${escapeHTML(
                    item.id
                )}"
            >

                <div class="azkar-card-top">

                    <span class="azkar-source">
                        ${escapeHTML(
                            item.source
                        )}
                    </span>

                    <button
                        type="button"
                        class="azkar-favorite ${
                            favorite
                                ? "active"
                                : ""
                        }"
                        data-action="favorite"
                        data-id="${escapeHTML(
                            item.id
                        )}"
                        aria-label="إضافة إلى المفضلة"
                        title="المفضلة"
                    >
                        ${
                            favorite
                                ? "♥"
                                : "♡"
                        }
                    </button>

                </div>

                <div class="azkar-text">
                    ${escapeHTML(
                        item.text
                    )}
                </div>

                <div class="azkar-card-bottom">

                    <div class="azkar-progress-wrap">

                        <div class="azkar-progress-info">
                            <span>
                                ${current} / ${
            item.count
        }
                            </span>

                            <span>
                                ${percent}%
                            </span>
                        </div>

                        <div class="azkar-progress">
                            <span
                                style="width:${percent}%"
                            ></span>
                        </div>

                    </div>

                    <button
                        type="button"
                        class="azkar-count-button ${
                            completed
                                ? "done"
                                : ""
                        }"
                        data-action="count"
                        data-id="${escapeHTML(
                            item.id
                        )}"
                    >
                        ${
                            completed
                                ? "✓ تم"
                                : "اذكر"
                        }
                    </button>

                </div>

                ${
                    completed
                        ? `
                            <button
                                type="button"
                                class="azkar-reset-item"
                                data-action="reset"
                                data-id="${escapeHTML(
                                    item.id
                                )}"
                            >
                                إعادة
                            </button>
                        `
                        : ""
                }

            </article>
        `;
    }

    /* ---------------------------------------------------------
       Category buttons
    --------------------------------------------------------- */

    function updateCategoryButtons() {
        document
            .querySelectorAll(
                "[data-azkar-category]"
            )
            .forEach(button => {
                const category =
                    button.getAttribute(
                        "data-azkar-category"
                    );

                button.classList.toggle(
                    "active",
                    category ===
                        currentCategory
                );

                const progress =
                    getCategoryProgress(
                        category
                    );

                button.setAttribute(
                    "data-progress",
                    progress.percent
                );
            });
    }

    /* ---------------------------------------------------------
       Header progress
    --------------------------------------------------------- */

    function updateHeaderProgress() {
        const progress =
            getCategoryProgress(
                currentCategory
            );

        const existing =
            document.getElementById(
                "azkarCategoryProgress"
            );

        if (existing) {
            existing.innerHTML = `
                <div class="azkar-summary-title">
                    ${escapeHTML(
                        AZKAR_DATA[
                            currentCategory
                        ].icon
                    )}
                    ${
                        AZKAR_DATA[
                            currentCategory
                        ].title
                    }
                </div>

                <div class="azkar-summary-progress">
                    <div class="azkar-summary-bar">
                        <span
                            style="width:${
                                progress.percent
                            }%"
                        ></span>
                    </div>

                    <span>
                        ${
                            progress.completed
                        } / ${
                            progress.total
                        }
                    </span>
                </div>
            `;
        }
    }

    /* ---------------------------------------------------------
       Bind item events
    --------------------------------------------------------- */

    function bindItemEvents() {
        document
            .querySelectorAll(
                "#azkarList [data-action]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    function (event) {
                        event.preventDefault();

                        const action =
                            this.getAttribute(
                                "data-action"
                            );

                        const id =
                            this.getAttribute(
                                "data-id"
                            );

                        if (!id) {
                            return;
                        }

                        handleAction(
                            action,
                            id
                        );
                    }
                );
            });
    }

    function handleAction(
        action,
        id
    ) {
        const item =
            findItem(id);

        if (!item) {
            return;
        }

        if (action === "count") {
            const value =
                increment(
                    item.id,
                    item.count
                );

            if (
                value >= item.count
            ) {
                showMessage(
                    "أحسنت، تم إكمال الذكر ✓",
                    "success"
                );
            }

            render();

            return;
        }

        if (action === "reset") {
            resetZikr(id);
            render();
            return;
        }

        if (action === "favorite") {
            toggleFavorite(id);
        }
    }

    /* ---------------------------------------------------------
       Find item
    --------------------------------------------------------- */

    function findItem(id) {
        for (
            const categoryKey in AZKAR_DATA
        ) {
            const category =
                AZKAR_DATA[categoryKey];

            const item =
                category.items.find(
                    zikr =>
                        zikr.id === id
                );

            if (item) {
                return item;
            }
        }

        return null;
    }

    /* ---------------------------------------------------------
       Category switching
    --------------------------------------------------------- */

    function setCategory(category) {
        if (!AZKAR_DATA[category]) {
            return;
        }

        currentCategory =
            category;

        searchText = "";

        const search =
            document.getElementById(
                "azkarSearch"
            );

        if (search) {
            search.value = "";
        }

        render();
    }

    /* ---------------------------------------------------------
       Search
    --------------------------------------------------------- */

    function handleSearch(value) {
        searchText =
            String(value || "");

        render();
    }

    /* ---------------------------------------------------------
       Favorites view
    --------------------------------------------------------- */

    function getFavorites() {
        return favorites
            .map(id =>
                findItem(id)
            )
            .filter(Boolean);
    }

    function showFavorites() {
        const items =
            getFavorites();

        const container =
            document.getElementById(
                "azkarList"
            );

        if (!container) {
            return;
        }

        if (!items.length) {
            container.innerHTML = `
                <div class="azkar-empty">
                    <div class="azkar-empty-icon">
                        ♡
                    </div>
                    <h3>لا توجد أذكار مفضلة</h3>
                    <p>
                        اضغط على رمز القلب لحفظ الذكر هنا.
                    </p>
                </div>
            `;

            return;
        }

        container.innerHTML =
            items
                .map(
                    item =>
                        createZikrCard(
                            item
                        )
                )
                .join("");

        bindItemEvents();
    }

    /* ---------------------------------------------------------
       Tasbih
    --------------------------------------------------------- */

    function getTasbihCount() {
        return Number(
            storageGet(
                "amirTasbihCount",
                0
            )
        ) || 0;
    }

    function saveTasbihCount(value) {
        storageSet(
            "amirTasbihCount",
            value
        );
    }

    function incrementTasbih() {
        const value =
            getTasbihCount() + 1;

        saveTasbihCount(value);

        updateTasbihUI(value);

        return value;
    }

    function resetTasbih() {
        saveTasbihCount(0);

        updateTasbihUI(0);

        showMessage(
            "تم تصفير المسبحة"
        );
    }

    function updateTasbihUI(value) {
        const elements =
            document.querySelectorAll(
                "[data-tasbih-count]"
            );

        elements.forEach(element => {
            element.textContent =
                value;
        });
    }

    /* ---------------------------------------------------------
       Existing compatibility counters
    --------------------------------------------------------- */

    function syncOldCounters() {
        /*
         * نحافظ على التوافق مع النسخة القديمة
         * التي تستخدم zikr1 / zikr2 / zikr3.
         */
        try {
            if (
                window.AmirStorage &&
                typeof window.AmirStorage.getZikrCount ===
                    "function"
            ) {
                return;
            }
        } catch {
            return;
        }
    }

    /* ---------------------------------------------------------
       Messages
    --------------------------------------------------------- */

    function showMessage(
        message,
        type = "info"
    ) {
        const toast =
            document.getElementById(
                "amirToast"
            );

        if (!toast) {
            return;
        }

        toast.textContent =
            message;

        toast.className =
            "amir-toast show";

        if (type === "success") {
            toast.classList.add(
                "success"
            );
        }

        if (type === "error") {
            toast.classList.add(
                "error"
            );
        }

        clearTimeout(
            showMessage.timer
        );

        showMessage.timer =
            setTimeout(
                () => {
                    toast.classList.remove(
                        "show",
                        "success",
                        "error"
                    );
                },
                3000
            );
    }

    /* ---------------------------------------------------------
       Event binding
    --------------------------------------------------------- */

    function bindEvents() {

        /*
         * Categories
         */
        document
            .querySelectorAll(
                "[data-azkar-category]"
            )
            .forEach(button => {
                button.addEventListener(
                    "click",
                    function () {
                        setCategory(
                            this.getAttribute(
                                "data-azkar-category"
                            )
                        );
                    }
                );
            });

        /*
         * Search
         */
        const search =
            document.getElementById(
                "azkarSearch"
            );

        if (search) {
            search.addEventListener(
                "input",
                function () {
                    handleSearch(
                        this.value
                    );
                }
            );
        }

        /*
         * Reset current category
         */
        const resetCurrent =
            document.getElementById(
                "resetCurrentAzkar"
            );

        if (resetCurrent) {
            resetCurrent.addEventListener(
                "click",
                function () {
                    resetCategory(
                        currentCategory
                    );

                    showMessage(
                        "تم إعادة ضبط القسم"
                    );
                }
            );
        }

        /*
         * Reset all
         */
        const resetAllButton =
            document.getElementById(
                "resetAllAzkar"
            );

        if (resetAllButton) {
            resetAllButton.addEventListener(
                "click",
                function () {
                    resetAll();
                }
            );
        }

        /*
         * Favorites
         */
        const favoritesButton =
            document.getElementById(
                "showAzkarFavorites"
            );

        if (favoritesButton) {
            favoritesButton.addEventListener(
                "click",
                function () {
                    showFavorites();
                }
            );
        }

        /*
         * Tasbih buttons
         */
        document
            .querySelectorAll(
                "[data-tasbih-action]"
            )
            .forEach(button => {
                button.addEventListener(
                    "click",
                    function () {
                        const action =
                            this.getAttribute(
                                "data-tasbih-action"
                            );

                        if (
                            action ===
                            "increment"
                        ) {
                            incrementTasbih();
                        }

                        if (
                            action ===
                            "reset"
                        ) {
                            resetTasbih();
                        }
                    }
                );
            });
    }

    /* ---------------------------------------------------------
       Public API
    --------------------------------------------------------- */

    window.AmirAzkar = {

        data: AZKAR_DATA,

        getCurrentCategory:
            function () {
                return currentCategory;
            },

        setCategory,

        render,

        search:
            handleSearch,

        getProgress,

        setProgress,

        increment,

        resetZikr,

        resetCategory,

        resetAll,

        isFavorite,

        toggleFavorite,

        getFavorites,

        showFavorites,

        getCategoryProgress,

        getTasbihCount,

        incrementTasbih,

        resetTasbih,

        getAllProgress:
            function () {
                return {
                    ...zikrState
                };
            }
    };

    /* ---------------------------------------------------------
       Initialization
    --------------------------------------------------------- */

    document.addEventListener(
        "DOMContentLoaded",
        function () {
            loadState();
            syncOldCounters();

            render();
            updateTasbihUI(
                getTasbihCount()
            );

            bindEvents();
        }
    );

})();
