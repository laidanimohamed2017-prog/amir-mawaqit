/* =========================================================
   أمير مواقيت V2
   azkar.js
   نظام الأذكار والعدادات
   ========================================================= */

(() => {
  "use strict";

  /* =========================================================
     بيانات الأذكار
     ========================================================= */

  const AZKAR_DATA = {
    morning: [
      {
        id: "morning-1",
        text: "أصبحنا وأصبح الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له.",
        count: 1,
        source: "رواه مسلم"
      },
      {
        id: "morning-2",
        text: "اللهم بك أصبحنا وبك أمسينا وبك نحيا وبك نموت وإليك النشور.",
        count: 1,
        source: "رواه الترمذي"
      },
      {
        id: "morning-3",
        text: "رضيت بالله ربًا، وبالإسلام دينًا، وبمحمد ﷺ نبيًا.",
        count: 3,
        source: "رواه أبو داود والترمذي"
      },
      {
        id: "morning-4",
        text: "سبحان الله وبحمده.",
        count: 100,
        source: "رواه مسلم"
      }
    ],

    evening: [
      {
        id: "evening-1",
        text: "أمسينا وأمسى الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له.",
        count: 1,
        source: "رواه مسلم"
      },
      {
        id: "evening-2",
        text: "اللهم بك أمسينا وبك أصبحنا وبك نحيا وبك نموت وإليك المصير.",
        count: 1,
        source: "رواه الترمذي"
      },
      {
        id: "evening-3",
        text: "رضيت بالله ربًا، وبالإسلام دينًا، وبمحمد ﷺ نبيًا.",
        count: 3,
        source: "رواه أبو داود والترمذي"
      },
      {
        id: "evening-4",
        text: "سبحان الله وبحمده.",
        count: 100,
        source: "رواه مسلم"
      }
    ],

    afterPrayer: [
      {
        id: "after-1",
        text: "أستغفر الله.",
        count: 3,
        source: "رواه مسلم"
      },
      {
        id: "after-2",
        text: "اللهم أنت السلام ومنك السلام، تباركت يا ذا الجلال والإكرام.",
        count: 1,
        source: "رواه مسلم"
      },
      {
        id: "after-3",
        text: "سبحان الله، والحمد لله، والله أكبر.",
        count: 33,
        source: "رواه مسلم"
      },
      {
        id: "after-4",
        text: "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير.",
        count: 1,
        source: "رواه مسلم"
      }
    ],

    sleep: [
      {
        id: "sleep-1",
        text: "باسمك اللهم أموت وأحيا.",
        count: 1,
        source: "رواه البخاري"
      },
      {
        id: "sleep-2",
        text: "اللهم قني عذابك يوم تبعث عبادك.",
        count: 3,
        source: "رواه أبو داود والترمذي"
      },
      {
        id: "sleep-3",
        text: "سبحان الله.",
        count: 33,
        source: "رواه البخاري ومسلم"
      },
      {
        id: "sleep-4",
        text: "الحمد لله.",
        count: 33,
        source: "رواه البخاري ومسلم"
      },
      {
        id: "sleep-5",
        text: "الله أكبر.",
        count: 34,
        source: "رواه البخاري ومسلم"
      }
    ],

    wake: [
      {
        id: "wake-1",
        text: "الحمد لله الذي أحيانا بعدما أماتنا وإليه النشور.",
        count: 1,
        source: "رواه البخاري"
      }
    ]
  };

  const CATEGORY_NAMES = {
    morning: "أذكار الصباح",
    evening: "أذكار المساء",
    afterPrayer: "أذكار بعد الصلاة",
    sleep: "أذكار النوم",
    wake: "أذكار الاستيقاظ"
  };

  let currentCategory = "morning";
  let currentIndex = 0;

  /* =========================================================
     التخزين
     ========================================================= */

  function storageGet(key, fallback = null) {
    try {
      if (
        window.AmirStorage &&
        typeof window.AmirStorage.get === "function"
      ) {
        return window.AmirStorage.get(
          key,
          fallback
        );
      }

      const value =
        localStorage.getItem(key);

      if (value === null) {
        return fallback;
      }

      try {
        return JSON.parse(value);
      } catch {
        return value;
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
        window.AmirStorage.set(
          key,
          value
        );

        return;
      }

      localStorage.setItem(
        key,
        JSON.stringify(value)
      );
    } catch (error) {
      console.warn(
        "Azkar storage error:",
        error
      );
    }
  }

  /* =========================================================
     مفاتيح العداد
     ========================================================= */

  function getCounterKey(
    zikr
  ) {
    return `amirZikr_${zikr.id}`;
  }

  function getCurrentCount(
    zikr
  ) {
    const value =
      storageGet(
        getCounterKey(zikr),
        0
      );

    const count =
      Number(value);

    if (
      Number.isNaN(count) ||
      count < 0
    ) {
      return 0;
    }

    return count;
  }

  function saveCurrentCount(
    zikr,
    count
  ) {
    storageSet(
      getCounterKey(zikr),
      Math.max(
        0,
        Number(count) || 0
      )
    );
  }

  /* =========================================================
     إكمال الذكر
     ========================================================= */

  function isCompleted(
    zikr
  ) {
    return (
      getCurrentCount(zikr) >=
      Number(zikr.count)
    );
  }

  /* =========================================================
     عرض قسم الأذكار
     ========================================================= */

  function renderCategory(
    category
  ) {
    if (
      !AZKAR_DATA[category]
    ) {
      category = "morning";
    }

    currentCategory =
      category;

    currentIndex = 0;

    const list =
      document.getElementById(
        "azkarList"
      );

    if (!list) {
      return;
    }

    const title =
      document.getElementById(
        "azkarCategoryTitle"
      );

    if (title) {
      title.textContent =
        CATEGORY_NAMES[
          category
        ] ||
        "الأذكار";
    }

    list.innerHTML = "";

    const items =
      AZKAR_DATA[category];

    items.forEach(
      (zikr, index) => {
        list.appendChild(
          createZikrCard(
            zikr,
            index
          )
        );
      }
    );

    updateCategoryButtons();

    updateProgress();
  }

  /* =========================================================
     إنشاء بطاقة ذكر
     ========================================================= */

  function createZikrCard(
    zikr,
    index
  ) {
    const card =
      document.createElement(
        "article"
      );

    card.className =
      "zikr-card";

    card.dataset.zikrId =
      zikr.id;

    const current =
      getCurrentCount(
        zikr
      );

    const completed =
      current >=
      zikr.count;

    if (completed) {
      card.classList.add(
        "completed"
      );
    }

    const remaining =
      Math.max(
        0,
        zikr.count - current
      );

    card.innerHTML = `
      <div class="zikr-card-top">
        <span class="zikr-number">
          ${index + 1}
        </span>

        <button
          type="button"
          class="zikr-favorite"
          data-favorite="${zikr.id}"
          aria-label="إضافة للمفضلة"
        >
          ☆
        </button>
      </div>

      <div class="zikr-text">
        ${escapeHtml(zikr.text)}
      </div>

      <div class="zikr-source">
        ${escapeHtml(zikr.source || "")}
      </div>

      <div class="zikr-card-bottom">

        <div class="zikr-progress-text">
          <span>
            ${current}
          </span>
          /
          <span>
            ${zikr.count}
          </span>
        </div>

        <button
          type="button"
          class="zikr-count-button"
          data-zikr-count="${zikr.id}"
          data-zikr-index="${index}"
        >
          ${
            completed
              ? "✓ تم"
              : `ذكر — ${remaining}`
          }
        </button>

      </div>

      <div class="zikr-progress">
        <span
          style="width:${Math.min(
            100,
            (current / zikr.count) * 100
          )}%"
        ></span>
      </div>
    `;

    return card;
  }

  /* =========================================================
     حماية النص
     ========================================================= */

  function escapeHtml(
    text
  ) {
    return String(text)
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );
  }

  /* =========================================================
     زيادة عداد الذكر
     ========================================================= */

  function incrementZikr(
    zikrId
  ) {
    const list =
      AZKAR_DATA[
        currentCategory
      ] || [];

    const zikr =
      list.find(
        item =>
          item.id === zikrId
      );

    if (!zikr) {
      return;
    }

    let current =
      getCurrentCount(
        zikr
      );

    if (
      current >=
      zikr.count
    ) {
      return;
    }

    current++;

    saveCurrentCount(
      zikr,
      current
    );

    const card =
      document.querySelector(
        `[data-zikr-id="${zikr.id}"]`
      );

    if (card) {
      updateZikrCard(
        card,
        zikr,
        current
      );
    }

    updateProgress();

    if (
      current >=
      zikr.count
    ) {
      showCompletionMessage(
        zikr
      );

      /*
        انتقال تلقائي للذكر التالي
        بعد لحظة بسيطة.
      */

      setTimeout(
        () => {
          const next =
            list.findIndex(
              item =>
                item.id ===
                zikr.id
            ) + 1;

          if (
            next >= 0 &&
            next < list.length
          ) {
            scrollToZikr(
              list[next].id
            );
          }
        },
        350
      );
    }
  }

  /* =========================================================
     تحديث بطاقة الذكر
     ========================================================= */

  function updateZikrCard(
    card,
    zikr,
    current
  ) {
    const completed =
      current >=
      zikr.count;

    if (completed) {
      card.classList.add(
        "completed"
      );
    } else {
      card.classList.remove(
        "completed"
      );
    }

    const progress =
      card.querySelector(
        ".zikr-progress span"
      );

    if (progress) {
      progress.style.width =
        `${Math.min(
          100,
          (current / zikr.count) *
            100
        )}%`;
    }

    const progressText =
      card.querySelector(
        ".zikr-progress-text"
      );

    if (progressText) {
      progressText.innerHTML = `
        <span>${current}</span>
        /
        <span>${zikr.count}</span>
      `;
    }

    const button =
      card.querySelector(
        ".zikr-count-button"
      );

    if (button) {
      const remaining =
        Math.max(
          0,
          zikr.count - current
        );

      button.textContent =
        completed
          ? "✓ تم"
          : `ذكر — ${remaining}`;
    }
  }

  /* =========================================================
     إظهار رسالة الإنجاز
     ========================================================= */

  function showCompletionMessage(
    zikr
  ) {
    const existing =
      document.querySelector(
        ".azkar-toast"
      );

    if (existing) {
      existing.remove();
    }

    const toast =
      document.createElement(
        "div"
      );

    toast.className =
      "azkar-toast";

    toast.textContent =
      "✓ أحسنت، أتممت هذا الذكر";

    document.body.appendChild(
      toast
    );

    setTimeout(
      () => {
        toast.classList.add(
          "hide"
        );

        setTimeout(
          () => {
            toast.remove();
          },
          300
        );
      },
      1800
    );
  }

  /* =========================================================
     التقدم في القسم
     ========================================================= */

  function updateProgress() {
    const items =
      AZKAR_DATA[
        currentCategory
      ] || [];

    if (!items.length) {
      return;
    }

    let completedItems = 0;
    let totalItems = items.length;

    items.forEach(
      zikr => {
        if (
          isCompleted(zikr)
        ) {
          completedItems++;
        }
      }
    );

    const percent =
      Math.round(
        (completedItems /
          totalItems) *
          100
      );

    const progress =
      document.getElementById(
        "azkarOverallProgress"
      );

    if (progress) {
      progress.style.width =
        `${percent}%`;
    }

    const percentText =
      document.getElementById(
        "azkarProgressPercent"
      );

    if (percentText) {
      percentText.textContent =
        `${percent}%`;
    }

    const countText =
      document.getElementById(
        "azkarProgressCount"
      );

    if (countText) {
      countText.textContent =
        `${completedItems} / ${totalItems}`;
    }
  }

  /* =========================================================
     أزرار الأقسام
     ========================================================= */

  function updateCategoryButtons() {
    const buttons =
      document.querySelectorAll(
        "[data-azkar-category]"
      );

    buttons.forEach(
      button => {
        const category =
          button.dataset
            .azkarCategory;

        button.classList.toggle(
          "active",
          category ===
            currentCategory
        );
      }
    );
  }

  function bindCategoryButtons() {
    const buttons =
      document.querySelectorAll(
        "[data-azkar-category]"
      );

    buttons.forEach(
      button => {
        button.addEventListener(
          "click",
          () => {
            renderCategory(
              button.dataset
                .azkarCategory
            );
          }
        );
      }
    );
  }

  /* =========================================================
     المفضلة
     ========================================================= */

  function getFavorites() {
    try {
      if (
        window.AmirStorage &&
        typeof window.AmirStorage.getFavorites ===
          "function"
      ) {
        return (
          window.AmirStorage.getFavorites() ||
          []
        );
      }

      const raw =
        localStorage.getItem(
          "amirFavorites"
        );

      if (!raw) {
        return [];
      }

      const parsed =
        JSON.parse(raw);

      return Array.isArray(
        parsed
      )
        ? parsed
        : [];
    } catch {
      return [];
    }
  }

  function saveFavorites(
    favorites
  ) {
    try {
      if (
        window.AmirStorage &&
        typeof window.AmirStorage.setFavorites ===
          "function"
      ) {
        window.AmirStorage.setFavorites(
          favorites
        );

        return;
      }

      localStorage.setItem(
        "amirFavorites",
        JSON.stringify(
          favorites
        )
      );
    } catch (error) {
      console.warn(
        "Could not save favorites:",
        error
      );
    }
  }

  function toggleFavorite(
    zikrId
  ) {
    const favorites =
      getFavorites();

    const index =
      favorites.indexOf(
        zikrId
      );

    if (index === -1) {
      favorites.push(
        zikrId
      );
    } else {
      favorites.splice(
        index,
        1
      );
    }

    saveFavorites(
      favorites
    );

    updateFavoriteButtons();
  }

  function updateFavoriteButtons() {
    const favorites =
      getFavorites();

    document
      .querySelectorAll(
        "[data-favorite]"
      )
      .forEach(
        button => {
          const id =
            button.dataset
              .favorite;

          const active =
            favorites.includes(
              id
            );

          button.textContent =
            active
              ? "★"
              : "☆";

          button.classList.toggle(
            "active",
            active
          );
        }
      );
  }

  /* =========================================================
     التفاعل مع البطاقات
     ========================================================= */

  function bindZikrEvents() {
    document.addEventListener(
      "click",
      event => {
        const countButton =
          event.target.closest(
            "[data-zikr-count]"
          );

        if (
          countButton
        ) {
          incrementZikr(
            countButton.dataset
              .zikrCount
          );

          return;
        }

        const favoriteButton =
          event.target.closest(
            "[data-favorite]"
          );

        if (
          favoriteButton
        ) {
          toggleFavorite(
            favoriteButton.dataset
              .favorite
          );
        }
      }
    );
  }

  /* =========================================================
     الانتقال إلى ذكر محدد
     ========================================================= */

  function scrollToZikr(
    zikrId
  ) {
    const card =
      document.querySelector(
        `[data-zikr-id="${zikrId}"]`
      );

    if (!card) {
      return;
    }

    card.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    card.classList.add(
      "highlight"
    );

    setTimeout(
      () => {
        card.classList.remove(
          "highlight"
        );
      },
      1000
    );
  }

  /* =========================================================
     تصفير القسم الحالي
     ========================================================= */

  function resetCurrentCategory() {
    const items =
      AZKAR_DATA[
        currentCategory
      ] || [];

    items.forEach(
      zikr => {
        saveCurrentCount(
          zikr,
          0
        );
      }
    );

    renderCategory(
      currentCategory
    );
  }

  /* =========================================================
     تصفير كل الأذكار
     ========================================================= */

  function resetAllAzkar() {
    Object.values(
      AZKAR_DATA
    )
      .flat()
      .forEach(
        zikr => {
          saveCurrentCount(
            zikr,
            0
          );
        }
      );

    renderCategory(
      currentCategory
    );
  }

  /* =========================================================
     البحث في الأذكار
     ========================================================= */

  function searchAzkar(
    query
  ) {
    const search =
      String(query || "")
        .trim()
        .toLowerCase();

    if (!search) {
      renderCategory(
        currentCategory
      );

      return;
    }

    const results = [];

    Object.entries(
      AZKAR_DATA
    ).forEach(
      ([category, items]) => {
        items.forEach(
          zikr => {
            if (
              zikr.text
                .toLowerCase()
                .includes(search)
            ) {
              results.push({
                ...zikr,
                category
              });
            }
          }
        );
      }
    );

    renderSearchResults(
      results
    );
  }

  function renderSearchResults(
    results
  ) {
    const list =
      document.getElementById(
        "azkarList"
      );

    if (!list) {
      return;
    }

    list.innerHTML = "";

    if (!results.length) {
      list.innerHTML = `
        <div class="azkar-empty">
          <div>🔎</div>
          <strong>لا توجد نتائج</strong>
          <span>جرّب كلمة بحث أخرى.</span>
        </div>
      `;

      return;
    }

    results.forEach(
      (zikr, index) => {
        list.appendChild(
          createZikrCard(
            zikr,
            index
          )
        );
      }
    );

    updateFavoriteButtons();
  }

  /* =========================================================
     تصدير بيانات الأذكار
     ========================================================= */

  function getAllAzkar() {
    return AZKAR_DATA;
  }

  /* =========================================================
     API عام
     ========================================================= */

  window.AmirAzkar = {
    data:
      AZKAR_DATA,

    categories:
      CATEGORY_NAMES,

    render:
      renderCategory,

    increment:
      incrementZikr,

    search:
      searchAzkar,

    resetCurrent:
      resetCurrentCategory,

    resetAll:
      resetAllAzkar,

    favorites:
      getFavorites,

    toggleFavorite
  };

  /* =========================================================
     التشغيل
     ========================================================= */

  document.addEventListener(
    "DOMContentLoaded",
    () => {
      bindCategoryButtons();

      bindZikrEvents();

      /*
        عرض أذكار الصباح كبداية.
      */

      setTimeout(
        () => {
          renderCategory(
            "morning"
          );

          updateFavoriteButtons();
        },
        250
      );
    }
  );

})();
