/* =========================================================
   AMIR MAWAQIT V2 - QURAN.JS
   القرآن الكريم
   ========================================================= */

(function () {
    "use strict";

    const API_URL = "https://api.alquran.cloud/v1";

    const STORAGE_KEYS = {
        LAST_READ: "amirQuranLastRead",
        FAVORITES: "amirQuranFavorites",
        FONT_SIZE: "amirQuranFontSize"
    };

    const DEFAULT_FONT_SIZE = 22;

    const state = {
        surahs: [],
        currentSurah: null,
        currentEdition: "quran-uthmani",
        fontSize: DEFAULT_FONT_SIZE,
        favorites: [],
        lastRead: null,
        loading: false
    };

    /* =====================================================
       STORAGE
       ===================================================== */

    function loadStorage() {
        try {
            const lastRead =
                localStorage.getItem(STORAGE_KEYS.LAST_READ);

            const favorites =
                localStorage.getItem(STORAGE_KEYS.FAVORITES);

            const fontSize =
                localStorage.getItem(STORAGE_KEYS.FONT_SIZE);

            state.lastRead = lastRead
                ? JSON.parse(lastRead)
                : null;

            state.favorites = favorites
                ? JSON.parse(favorites)
                : [];

            state.fontSize = fontSize
                ? Number(fontSize)
                : DEFAULT_FONT_SIZE;

            if (
                !Number.isFinite(state.fontSize) ||
                state.fontSize < 16 ||
                state.fontSize > 40
            ) {
                state.fontSize = DEFAULT_FONT_SIZE;
            }

        } catch (error) {
            console.error(
                "Quran storage error:",
                error
            );

            state.lastRead = null;
            state.favorites = [];
            state.fontSize = DEFAULT_FONT_SIZE;
        }
    }

    function saveLastRead(data) {
        state.lastRead = data;

        try {
            localStorage.setItem(
                STORAGE_KEYS.LAST_READ,
                JSON.stringify(data)
            );
        } catch (error) {
            console.error(error);
        }
    }

    function saveFavorites() {
        try {
            localStorage.setItem(
                STORAGE_KEYS.FAVORITES,
                JSON.stringify(state.favorites)
            );
        } catch (error) {
            console.error(error);
        }
    }

    function saveFontSize() {
        try {
            localStorage.setItem(
                STORAGE_KEYS.FONT_SIZE,
                String(state.fontSize)
            );
        } catch (error) {
            console.error(error);
        }
    }

    /* =====================================================
       HELPERS
       ===================================================== */

    function $(selector) {
        return document.querySelector(selector);
    }

    function createElement(tag, className, text) {
        const element =
            document.createElement(tag);

        if (className) {
            element.className = className;
        }

        if (text !== undefined) {
            element.textContent = text;
        }

        return element;
    }

    function escapeHTML(text) {
        const div =
            document.createElement("div");

        div.textContent = text;

        return div.innerHTML;
    }

    function isFavorite(surahNumber) {
        return state.favorites.includes(
            Number(surahNumber)
        );
    }

    /* =====================================================
       LOAD SURAHS
       ===================================================== */

    async function loadSurahs() {

        const list =
            $("#quranSurahList");

        if (!list) {
            return;
        }

        state.loading = true;

        list.innerHTML = `
            <div class="quran-loading">
                <div class="quran-spinner"></div>
                <span>جاري تحميل سور القرآن...</span>
            </div>
        `;

        try {

            const response =
                await fetch(
                    `${API_URL}/surah`
                );

            if (!response.ok) {
                throw new Error(
                    "فشل تحميل السور"
                );
            }

            const json =
                await response.json();

            if (
                !json ||
                json.code !== 200 ||
                !json.data
            ) {
                throw new Error(
                    "بيانات غير صالحة"
                );
            }

            state.surahs = json.data;

            renderSurahs();

        } catch (error) {

            console.error(
                "Quran API error:",
                error
            );

            list.innerHTML = `
                <div class="quran-empty">
                    <div class="quran-empty-icon">⚠️</div>
                    <strong>تعذر تحميل القرآن</strong>
                    <p>
                        تحقق من اتصال الإنترنت ثم حاول مرة أخرى.
                    </p>
                    <button
                        type="button"
                        class="primary-button"
                        id="quranRetry"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            `;

            const retry =
                $("#quranRetry");

            if (retry) {
                retry.addEventListener(
                    "click",
                    loadSurahs
                );
            }

        } finally {
            state.loading = false;
        }
    }

    /* =====================================================
       RENDER SURAHS
       ===================================================== */

    function renderSurahs(
        searchTerm = ""
    ) {

        const list =
            $("#quranSurahList");

        if (!list) {
            return;
        }

        const query =
            String(searchTerm)
                .trim()
                .toLowerCase();

        const filtered =
            state.surahs.filter(
                surah => {

                    if (!query) {
                        return true;
                    }

                    return (
                        String(surah.name)
                            .toLowerCase()
                            .includes(query)
                        ||
                        String(surah.englishName)
                            .toLowerCase()
                            .includes(query)
                        ||
                        String(surah.number)
                            .includes(query)
                    );
                }
            );

        if (!filtered.length) {

            list.innerHTML = `
                <div class="quran-empty">
                    <div class="quran-empty-icon">🔎</div>
                    <strong>لا توجد نتائج</strong>
                    <p>
                        لم يتم العثور على سورة بهذا البحث.
                    </p>
                </div>
            `;

            return;
        }

        list.innerHTML = "";

        filtered.forEach(
            surah => {

                const card =
                    createElement(
                        "button",
                        "quran-surah-card"
                    );

                card.type = "button";

                card.dataset.surah =
                    surah.number;

                const number =
                    createElement(
                        "div",
                        "quran-surah-number",
                        String(surah.number)
                    );

                const info =
                    createElement(
                        "div",
                        "quran-surah-info"
                    );

                const name =
                    createElement(
                        "strong",
                        "quran-surah-name",
                        surah.name
                    );

                const details =
                    createElement(
                        "span",
                        "quran-surah-details",
                        `${surah.englishName} • ${surah.numberOfAyahs} آية`
                    );

                info.appendChild(name);
                info.appendChild(details);

                const type =
                    createElement(
                        "span",
                        "quran-surah-type",
                        surah.revelationType === "Meccan"
                            ? "مكية"
                            : "مدنية"
                    );

                const favorite =
                    createElement(
                        "span",
                        "quran-surah-favorite",
                        isFavorite(surah.number)
                            ? "★"
                            : "☆"
                    );

                favorite.title =
                    isFavorite(surah.number)
                        ? "إزالة من المفضلة"
                        : "إضافة إلى المفضلة";

                favorite.dataset.favorite =
                    surah.number;

                card.appendChild(number);
                card.appendChild(info);
                card.appendChild(type);
                card.appendChild(favorite);

                card.addEventListener(
                    "click",
                    event => {

                        if (
                            event.target.closest(
                                "[data-favorite]"
                            )
                        ) {
                            toggleFavorite(
                                surah.number
                            );

                            renderSurahs(
                                $("#quranSearch")
                                    ?.value || ""
                            );

                            return;
                        }

                        openSurah(
                            surah.number
                        );
                    }
                );

                list.appendChild(card);
            }
        );
    }

    /* =====================================================
       OPEN SURAH
       ===================================================== */

    async function openSurah(
        surahNumber
    ) {

        const reader =
            $("#quranReader");

        if (!reader) {
            return;
        }

        state.currentSurah =
            Number(surahNumber);

        reader.hidden = false;

        const list =
            $("#quranSurahList");

        if (list) {
            list.hidden = true;
        }

        const search =
            $("#quranSearch");

        if (search) {
            search.closest(
                ".quran-toolbar"
            )?.setAttribute(
                "hidden",
                ""
            );
        }

        reader.innerHTML = `
            <div class="quran-loading">
                <div class="quran-spinner"></div>
                <span>جاري فتح السورة...</span>
            </div>
        `;

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        try {

            const response =
                await fetch(
                    `${API_URL}/surah/${surahNumber}/${state.currentEdition}`
                );

            if (!response.ok) {
                throw new Error(
                    "فشل تحميل السورة"
                );
            }

            const json =
                await response.json();

            if (
                !json ||
                json.code !== 200 ||
                !json.data
            ) {
                throw new Error(
                    "بيانات السورة غير صالحة"
                );
            }

            renderReader(
                json.data
            );

            saveLastRead({
                surahNumber:
                    json.data.number,

                surahName:
                    json.data.name,

                ayahNumber: 1
            });

        } catch (error) {

            console.error(
                "Surah error:",
                error
            );

            reader.innerHTML = `
                <div class="quran-empty">
                    <div class="quran-empty-icon">⚠️</div>
                    <strong>تعذر فتح السورة</strong>
                    <p>
                        تحقق من اتصال الإنترنت وحاول مرة أخرى.
                    </p>

                    <button
                        type="button"
                        class="primary-button"
                        id="quranReaderRetry"
                    >
                        إعادة المحاولة
                    </button>

                    <button
                        type="button"
                        class="secondary-button"
                        id="quranBackRetry"
                    >
                        العودة للسور
                    </button>
                </div>
            `;

            $("#quranReaderRetry")
                ?.addEventListener(
                    "click",
                    () => openSurah(surahNumber)
                );

            $("#quranBackRetry")
                ?.addEventListener(
                    "click",
                    closeReader
                );
        }
    }

    /* =====================================================
       RENDER READER
       ===================================================== */

    function renderReader(
        surah
    ) {

        const reader =
            $("#quranReader");

        if (!reader) {
            return;
        }

        reader.innerHTML = "";

        const header =
            createElement(
                "div",
                "quran-reader-header"
            );

        const back =
            createElement(
                "button",
                "quran-back-button",
                "← العودة للسور"
            );

        back.type = "button";

        back.addEventListener(
            "click",
            closeReader
        );

        const title =
            createElement(
                "div",
                "quran-reader-title"
            );

        const arabicName =
            createElement(
                "h2",
                "",
                surah.name
            );

        const meta =
            createElement(
                "span",
                "",
                `${surah.englishName} • ${surah.numberOfAyahs} آية • ${
                    surah.revelationType === "Meccan"
                        ? "مكية"
                        : "مدنية"
                }`
            );

        title.appendChild(arabicName);
        title.appendChild(meta);

        const favorite =
            createElement(
                "button",
                "quran-reader-favorite",
                isFavorite(surah.number)
                    ? "★"
                    : "☆"
            );

        favorite.type = "button";

        favorite.addEventListener(
            "click",
            () => {

                toggleFavorite(
                    surah.number
                );

                favorite.textContent =
                    isFavorite(surah.number)
                        ? "★"
                        : "☆";
            }
        );

        header.appendChild(back);
        header.appendChild(title);
        header.appendChild(favorite);

        reader.appendChild(header);

        const controls =
            createElement(
                "div",
                "quran-reader-controls"
            );

        const decrease =
            createElement(
                "button",
                "secondary-button",
                "A−"
            );

        decrease.type = "button";

        decrease.title =
            "تصغير الخط";

        decrease.addEventListener(
            "click",
            () => changeFontSize(-2)
        );

        const sizeLabel =
            createElement(
                "span",
                "quran-font-size-label",
                `${state.fontSize}px`
            );

        sizeLabel.id =
            "quranFontSizeLabel";

        const increase =
            createElement(
                "button",
                "secondary-button",
                "A+"
            );

        increase.type = "button";

        increase.title =
            "تكبير الخط";

        increase.addEventListener(
            "click",
            () => changeFontSize(2)
        );

        controls.appendChild(decrease);
        controls.appendChild(sizeLabel);
        controls.appendChild(increase);

        reader.appendChild(controls);

        const basmala =
            createElement(
                "div",
                "quran-basmala",
                "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
            );

        if (
            surah.number !== 1 &&
            surah.number !== 9
        ) {
            reader.appendChild(basmala);
        }

        const verses =
            createElement(
                "div",
                "quran-verses"
            );

        surah.ayahs.forEach(
            ayah => {

                const verse =
                    createElement(
                        "div",
                        "quran-ayah"
                    );

                verse.dataset.ayah =
                    ayah.numberInSurah;

                const text =
                    createElement(
                        "span",
                        "quran-ayah-text",
                        ayah.text
                    );

                const number =
                    createElement(
                        "span",
                        "quran-ayah-number",
                        String(
                            ayah.numberInSurah
                        )
                    );

                verse.appendChild(text);
                verse.appendChild(number);

                verse.addEventListener(
                    "click",
                    () => {

                        saveLastRead({
                            surahNumber:
                                surah.number,

                            surahName:
                                surah.name,

                            ayahNumber:
                                ayah.numberInSurah
                        });

                        highlightAyah(
                            ayah.numberInSurah
                        );
                    }
                );

                verses.appendChild(
                    verse
                );
            }
        );

        reader.appendChild(verses);

        applyFontSize();

        const lastAyah =
            state.lastRead &&
            Number(
                state.lastRead.surahNumber
            ) === Number(surah.number)
                ? state.lastRead.ayahNumber
                : null;

        if (lastAyah) {
            setTimeout(
                () => {

                    const element =
                        reader.querySelector(
                            `[data-ayah="${lastAyah}"]`
                        );

                    if (element) {

                        element.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });

                        element.classList.add(
                            "quran-last-read"
                        );
                    }

                },
                300
            );
        }
    }

    /* =====================================================
       CLOSE READER
       ===================================================== */

    function closeReader() {

        const reader =
            $("#quranReader");

        const list =
            $("#quranSurahList");

        const toolbar =
            document.querySelector(
                ".quran-toolbar"
            );

        if (reader) {
            reader.hidden = true;
            reader.innerHTML = "";
        }

        if (list) {
            list.hidden = false;
        }

        if (toolbar) {
            toolbar.removeAttribute(
                "hidden"
            );
        }

        state.currentSurah = null;

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        renderSurahs();
    }

    /* =====================================================
       FAVORITES
       ===================================================== */

    function toggleFavorite(
        surahNumber
    ) {

        const number =
            Number(surahNumber);

        const index =
            state.favorites.indexOf(number);

        if (index === -1) {
            state.favorites.push(number);
        } else {
            state.favorites.splice(
                index,
                1
            );
        }

        saveFavorites();

        updateFavoriteCount();
    }

    function updateFavoriteCount() {

        const counter =
            $("#quranFavoriteCount");

        if (counter) {
            counter.textContent =
                state.favorites.length;
        }
    }

    /* =====================================================
       FONT SIZE
       ===================================================== */

    function changeFontSize(
        amount
    ) {

        state.fontSize += amount;

        state.fontSize =
            Math.max(
                16,
                Math.min(
                    40,
                    state.fontSize
                )
            );

        saveFontSize();

        applyFontSize();
    }

    function applyFontSize() {

        const verses =
            document.querySelector(
                ".quran-verses"
            );

        if (verses) {
            verses.style.setProperty(
                "--quran-font-size",
                `${state.fontSize}px`
            );
        }

        const label =
            $("#quranFontSizeLabel");

        if (label) {
            label.textContent =
                `${state.fontSize}px`;
        }
    }

    /* =====================================================
       HIGHLIGHT AYAH
       ===================================================== */

    function highlightAyah(
        ayahNumber
    ) {

        document
            .querySelectorAll(
                ".quran-ayah"
            )
            .forEach(
                item => {
                    item.classList.remove(
                        "quran-selected"
                    );
                }
            );

        const element =
            document.querySelector(
                `.quran-ayah[data-ayah="${ayahNumber}"]`
            );

        if (element) {
            element.classList.add(
                "quran-selected"
            );
        }
    }

    /* =====================================================
       LAST READ
       ===================================================== */

    function openLastRead() {

        if (
            !state.lastRead ||
            !state.lastRead.surahNumber
        ) {
            alert(
                "لم تبدأ القراءة بعد."
            );

            return;
        }

        openSurah(
            state.lastRead.surahNumber
        );
    }

    /* =====================================================
       FAVORITES VIEW
       ===================================================== */

    function showFavorites() {

        const list =
            $("#quranSurahList");

        if (!list) {
            return;
        }

        const favorites =
            state.surahs.filter(
                surah =>
                    isFavorite(
                        surah.number
                    )
            );

        if (!favorites.length) {

            list.innerHTML = `
                <div class="quran-empty">
                    <div class="quran-empty-icon">☆</div>
                    <strong>لا توجد سور مفضلة</strong>
                    <p>
                        اضغط على النجمة لإضافة السور إلى المفضلة.
                    </p>
                </div>
            `;

            return;
        }

        list.innerHTML = "";

        favorites.forEach(
            surah => {

                const card =
                    createElement(
                        "button",
                        "quran-surah-card"
                    );

                card.type = "button";

                const number =
                    createElement(
                        "div",
                        "quran-surah-number",
                        String(surah.number)
                    );

                const info =
                    createElement(
                        "div",
                        "quran-surah-info"
                    );

                info.innerHTML = `
                    <strong class="quran-surah-name">
                        ${escapeHTML(surah.name)}
                    </strong>

                    <span class="quran-surah-details">
                        ${escapeHTML(surah.englishName)}
                        •
                        ${surah.numberOfAyahs} آية
                    </span>
                `;

                const favorite =
                    createElement(
                        "span",
                        "quran-surah-favorite",
                        "★"
                    );

                card.appendChild(number);
                card.appendChild(info);
                card.appendChild(favorite);

                card.addEventListener(
                    "click",
                    () =>
                        openSurah(
                            surah.number
                        )
                );

                list.appendChild(card);
            }
        );
    }

    /* =====================================================
       SEARCH
       ===================================================== */

    function setupSearch() {

        const search =
            $("#quranSearch");

        if (!search) {
            return;
        }

        search.addEventListener(
            "input",
            () => {

                if (
                    state.currentSurah
                ) {
                    return;
                }

                renderSurahs(
                    search.value
                );
            }
        );
    }

    /* =====================================================
       LAST READ CARD
       ===================================================== */

    function renderLastRead() {

        const container =
            $("#quranLastRead");

        if (!container) {
            return;
        }

        if (
            !state.lastRead ||
            !state.lastRead.surahName
        ) {
            container.innerHTML = `
                <div class="quran-last-read-empty">
                    لم تبدأ القراءة بعد
                </div>
            `;

            return;
        }

        container.innerHTML = `
            <div class="quran-last-read-info">
                <span>آخر قراءة</span>
                <strong>
                    ${escapeHTML(
                        state.lastRead.surahName
                    )}
                </strong>
                <small>
                    الآية ${state.lastRead.ayahNumber || 1}
                </small>
            </div>

            <button
                type="button"
                class="primary-button"
                id="quranContinueButton"
            >
                متابعة القراءة
            </button>
        `;

        $("#quranContinueButton")
            ?.addEventListener(
                "click",
                openLastRead
            );
    }

    /* =====================================================
       EVENTS
       ===================================================== */

    function setupEvents() {

        $("#quranLastReadButton")
            ?.addEventListener(
                "click",
                openLastRead
            );

        $("#quranFavoritesButton")
            ?.addEventListener(
                "click",
                showFavorites
            );

        $("#quranAllButton")
            ?.addEventListener(
                "click",
                () => {

                    const search =
                        $("#quranSearch");

                    if (search) {
                        search.value = "";
                    }

                    renderSurahs();
                }
            );

        setupSearch();
    }

    /* =====================================================
       INIT
       ===================================================== */

    async function init() {

        loadStorage();

        setupEvents();

        renderLastRead();

        updateFavoriteCount();

        await loadSurahs();
    }

    /* =====================================================
       PUBLIC API
       ===================================================== */

    window.AmirQuran = {

        init,

        loadSurahs,

        openSurah,

        closeReader,

        openLastRead,

        toggleFavorite,

        changeFontSize,

        getState: function () {
            return {
                ...state,
                favorites:
                    [...state.favorites]
            };
        }
    };

})();
