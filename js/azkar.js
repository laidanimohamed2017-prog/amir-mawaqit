(function () {
  "use strict";

  /* =========================================================
     أمير مواقيت V2
     Azkar Module
     ========================================================= */

  const STORAGE_PROGRESS = "amirAzkarProgress";
  const STORAGE_FAVORITES = "amirAzkarFavorites";
  const STORAGE_TASBIH = "amirTasbihCount";

  const categories = {
    morning: {
      title: "أذكار الصباح",
      icon: "🌅",
      description: "أذكار الصباح اليومية"
    },
    evening: {
      title: "أذكار المساء",
      icon: "🌇",
      description: "أذكار المساء اليومية"
    },
    afterPrayer: {
      title: "أذكار بعد الصلاة",
      icon: "🕌",
      description: "أذكار تقال بعد الصلوات"
    },
    sleep: {
      title: "أذكار النوم",
      icon: "🌙",
      description: "أذكار قبل النوم"
    },
    wake: {
      title: "أذكار الاستيقاظ",
      icon: "☀️",
      description: "أذكار الاستيقاظ من النوم"
    }
  };

  const azkar = [
    /* ==================== الصباح ==================== */

    {
      id: "morning-1",
      category: "morning",
      text: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ، اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ، لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ، لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ...",
      source: "آية الكرسي - البقرة: 255",
      count: 1
    },

    {
      id: "morning-2",
      category: "morning",
      text: "قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ",
      source: "سورة الإخلاص",
      count: 3
    },

    {
      id: "morning-3",
      category: "morning",
      text: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِنْ شَرِّ مَا خَلَقَ ۝ وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ",
      source: "سورة الفلق",
      count: 3
    },

    {
      id: "morning-4",
      category: "morning",
      text: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ",
      source: "سورة الناس",
      count: 3
    },

    {
      id: "morning-5",
      category: "morning",
      text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.",
      source: "رواه مسلم",
      count: 1
    },

    {
      id: "morning-6",
      category: "morning",
      text: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ.",
      source: "رواه الترمذي",
      count: 1
    },

    {
      id: "morning-7",
      category: "morning",
      text: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا.",
      source: "رواه أبو داود والترمذي",
      count: 3
    },

    {
      id: "morning-8",
      category: "morning",
      text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ العَفْوَ وَالعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ.",
      source: "رواه أبو داود وابن ماجه",
      count: 1
    },

    {
      id: "morning-9",
      category: "morning",
      text: "اللَّهُمَّ عَالِمَ الغَيْبِ وَالشَّهَادَةِ، فَاطِرَ السَّمَاوَاتِ وَالأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ.",
      source: "رواه الترمذي وأبو داود",
      count: 1
    },

    {
      id: "morning-10",
      category: "morning",
      text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.",
      source: "رواه مسلم",
      count: 100
    },

    /* ==================== المساء ==================== */

    {
      id: "evening-1",
      category: "evening",
      text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.",
      source: "رواه مسلم",
      count: 1
    },

    {
      id: "evening-2",
      category: "evening",
      text: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ.",
      source: "رواه الترمذي",
      count: 1
    },

    {
      id: "evening-3",
      category: "evening",
      text: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا.",
      source: "رواه أبو داود والترمذي",
      count: 3
    },

    {
      id: "evening-4",
      category: "evening",
      text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.",
      source: "رواه مسلم",
      count: 3
    },

    {
      id: "evening-5",
      category: "evening",
      text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ العَفْوَ وَالعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ.",
      source: "رواه أبو داود وابن ماجه",
      count: 1
    },

    {
      id: "evening-6",
      category: "evening",
      text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.",
      source: "رواه مسلم",
      count: 100
    },

    {
      id: "evening-7",
      category: "evening",
      text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.",
      source: "سيد الاستغفار - رواه البخاري",
      count: 1
    },

    /* ==================== بعد الصلاة ==================== */

    {
      id: "after-1",
      category: "afterPrayer",
      text: "أَسْتَغْفِرُ اللَّهَ.",
      source: "رواه مسلم",
      count: 3
    },

    {
      id: "after-2",
      category: "afterPrayer",
      text: "اللَّهُمَّ أَنْتَ السَّلَامُ، وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالإِكْرَامِ.",
      source: "رواه مسلم",
      count: 1
    },

    {
      id: "after-3",
      category: "afterPrayer",
      text: "سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَاللَّهُ أَكْبَرُ.",
      source: "رواه مسلم",
      count: 33
    },

    {
      id: "after-4",
      category: "afterPrayer",
      text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.",
      source: "رواه مسلم",
      count: 1
    },

    {
      id: "after-5",
      category: "afterPrayer",
      text: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ.",
      source: "رواه أبو داود والنسائي",
      count: 1
    },

    /* ==================== النوم ==================== */

    {
      id: "sleep-1",
      category: "sleep",
      text: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا.",
      source: "رواه البخاري",
      count: 1
    },

    {
      id: "sleep-2",
      category: "sleep",
      text: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ.",
      source: "رواه أبو داود والترمذي",
      count: 3
    },

    {
      id: "sleep-3",
      category: "sleep",
      text: "سُبْحَانَ اللَّهِ.",
      source: "رواه البخاري",
      count: 33
    },

    {
      id: "sleep-4",
      category: "sleep",
      text: "الْحَمْدُ لِلَّهِ.",
      source: "رواه البخاري",
      count: 33
    },

    {
      id: "sleep-5",
      category: "sleep",
      text: "اللَّهُ أَكْبَرُ.",
      source: "رواه البخاري",
      count: 34
    },

    /* ==================== الاستيقاظ ==================== */

    {
      id: "wake-1",
      category: "wake",
      text: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ.",
      source: "رواه البخاري",
      count: 1
    },

    {
      id: "wake-2",
      category: "wake",
      text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.",
      source: "رواه البخاري",
      count: 1
    },

    {
      id: "wake-3",
      category: "wake",
      text: "الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي فِي جَسَدِي، وَرَدَّ عَلَيَّ رُوحِي، وَأَذِنَ لِي بِذِكْرِهِ.",
      source: "رواه الترمذي",
      count: 1
    }
  ];

  let currentCategory = "morning";
  let searchText = "";

  function readStorage(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      if (value === null) return fallback;
      return JSON.parse(value);
    } catch (error) {
      console.warn("AmirAzkar storage read:", error);
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn("AmirAzkar storage write:", error);
      return false;
    }
  }

  function getProgress() {
    return readStorage(STORAGE_PROGRESS, {});
  }

  function saveProgress(progress) {
    writeStorage(STORAGE_PROGRESS, progress);
  }

  function getFavorites() {
    return readStorage(STORAGE_FAVORITES, []);
  }

  function saveFavorites(favorites) {
    writeStorage(STORAGE_FAVORITES, favorites);
  }

  function getTasbihCount() {
    return Number(readStorage(STORAGE_TASBIH, 0)) || 0;
  }

  function saveTasbihCount(count) {
    writeStorage(STORAGE_TASBIH, Number(count) || 0);
  }

  function getItemProgress(id) {
    const progress = getProgress();
    return Number(progress[id]) || 0;
  }

  function setItemProgress(id, value) {
    const progress = getProgress();
    progress[id] = Math.max(0, Number(value) || 0);
    saveProgress(progress);
  }

  function isFavorite(id) {
    return getFavorites().includes(id);
  }

  function toggleFavorite(id) {
    let favorites = getFavorites();

    if (favorites.includes(id)) {
      favorites = favorites.filter(function (item) {
        return item !== id;
      });
    } else {
      favorites.push(id);
    }

    saveFavorites(favorites);
    render();

    showToast(
      favorites.includes(id)
        ? "تمت إضافة الذكر إلى المفضلة"
        : "تم حذف الذكر من المفضلة"
    );
  }

  function filteredAzkar() {
    let result = azkar.filter(function (item) {
      return item.category === currentCategory;
    });

    const query = searchText.trim().toLowerCase();

    if (query) {
      result = result.filter(function (item) {
        return (
          item.text.toLowerCase().includes(query) ||
          item.source.toLowerCase().includes(query)
        );
      });
    }

    return result;
  }

  function calculateCategoryProgress(items) {
    if (!items.length) {
      return {
        completed: 0,
        total: 0,
        percentage: 0
      };
    }

    let totalRequired = 0;
    let totalCompleted = 0;

    items.forEach(function (item) {
      const required = Number(item.count) || 1;
      const completed = Math.min(getItemProgress(item.id), required);

      totalRequired += required;
      totalCompleted += completed;
    });

    return {
      completed: totalCompleted,
      total: totalRequired,
      percentage: totalRequired
        ? Math.round((totalCompleted / totalRequired) * 100)
        : 0
    };
  }

  function createCard(item) {
    const required = Number(item.count) || 1;
    const completed = Math.min(getItemProgress(item.id), required);
    const favorite = isFavorite(item.id);

    const percentage = required
      ? Math.round((completed / required) * 100)
      : 0;

    const card = document.createElement("article");
    card.className = "azkar-card";
    card.dataset.azkarId = item.id;

    card.innerHTML = `
      <div class="azkar-card-top">
        <span class="azkar-number">${azkar.indexOf(item) + 1}</span>

        <button
          type="button"
          class="azkar-favorite ${favorite ? "active" : ""}"
          data-action="favorite"
          aria-label="${favorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}"
          title="${favorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}"
        >
          ${favorite ? "★" : "☆"}
        </button>
      </div>

      <div class="azkar-text">${escapeHtml(item.text)}</div>

      <div class="azkar-source">
        ${escapeHtml(item.source)}
      </div>

      <div class="azkar-progress-wrap">
        <div class="azkar-progress-info">
          <span>التكرار</span>
          <strong>${completed} / ${required}</strong>
        </div>

        <div class="azkar-progress">
          <span style="width:${percentage}%"></span>
        </div>
      </div>

      <div class="azkar-actions">
        <button
          type="button"
          class="azkar-count-button"
          data-action="count"
        >
          <span>تسبيح الذكر</span>
          <strong>${completed < required ? "ذكر" : "✓ مكتمل"}</strong>
        </button>

        <button
          type="button"
          class="azkar-reset-item"
          data-action="reset"
          title="إعادة العداد"
        >
          ↻
        </button>
      </div>
    `;

    const favoriteButton = card.querySelector('[data-action="favorite"]');
    const countButton = card.querySelector('[data-action="count"]');
    const resetButton = card.querySelector('[data-action="reset"]');

    favoriteButton.addEventListener("click", function () {
      toggleFavorite(item.id);
    });

    countButton.addEventListener("click", function () {
      increment(item);
    });

    resetButton.addEventListener("click", function () {
      resetItem(item.id);
    });

    return card;
  }

  function render() {
    const container = document.getElementById("azkarList");

    if (!container) return;

    const items = filteredAzkar();

    container.innerHTML = "";

    if (!items.length) {
      container.innerHTML = `
        <div class="azkar-empty">
          <div class="azkar-empty-icon">🔎</div>
          <h3>لا توجد أذكار</h3>
          <p>جرّب تغيير كلمة البحث أو اختيار قسم آخر.</p>
        </div>
      `;

      updateSummary([]);
      return;
    }

    const fragment = document.createDocumentFragment();

    items.forEach(function (item) {
      fragment.appendChild(createCard(item));
    });

    container.appendChild(fragment);

    updateSummary(items);
  }

  function updateSummary(items) {
    const summary = calculateCategoryProgress(items);

    const percentageElement =
      document.getElementById("azkarProgressPercentage");

    const completedElement =
      document.getElementById("azkarCompletedCount");

    const totalElement =
      document.getElementById("azkarTotalCount");

    const progressElement =
      document.getElementById("azkarOverallProgress");

    if (percentageElement) {
      percentageElement.textContent = summary.percentage + "%";
    }

    if (completedElement) {
      completedElement.textContent = summary.completed;
    }

    if (totalElement) {
      totalElement.textContent = summary.total;
    }

    if (progressElement) {
      progressElement.style.width = summary.percentage + "%";
    }
  }

  function increment(item) {
    const required = Number(item.count) || 1;
    const current = getItemProgress(item.id);

    if (current >= required) {
      showToast("تم إكمال هذا الذكر ✓");
      return;
    }

    setItemProgress(item.id, current + 1);

    render();

    if (current + 1 >= required) {
      showToast("أحسنت، تم إكمال الذكر ✓");
    }
  }

  function resetItem(id) {
    setItemProgress(id, 0);
    render();
    showToast("تمت إعادة عداد الذكر");
  }

  function resetCategory() {
    const progress = getProgress();

    azkar.forEach(function (item) {
      if (item.category === currentCategory) {
        progress[item.id] = 0;
      }
    });

    saveProgress(progress);
    render();

    showToast("تمت إعادة أذكار هذا القسم");
  }

  function resetAll() {
    if (!confirm("هل تريد إعادة جميع عدادات الأذكار؟")) {
      return;
    }

    saveProgress({});
    render();

    showToast("تمت إعادة جميع العدادات");
  }

  function setCategory(category) {
    if (!categories[category]) return;

    currentCategory = category;
    searchText = "";

    const search = document.getElementById("azkarSearch");

    if (search) {
      search.value = "";
    }

    document
      .querySelectorAll("[data-azkar-category]")
      .forEach(function (button) {
        button.classList.toggle(
          "active",
          button.dataset.azkarCategory === category
        );
      });

    render();
  }

  function setupCategories() {
    document
      .querySelectorAll("[data-azkar-category]")
      .forEach(function (button) {
        button.addEventListener("click", function () {
          setCategory(button.dataset.azkarCategory);
        });
      });
  }

  function setupSearch() {
    const search = document.getElementById("azkarSearch");

    if (!search) return;

    search.addEventListener("input", function () {
      searchText = search.value || "";
      render();
    });
  }

  function setupResetButtons() {
    const resetCategoryButton =
      document.getElementById("resetAzkarCategory");

    const resetAllButton =
      document.getElementById("resetAllAzkar");

    if (resetCategoryButton) {
      resetCategoryButton.addEventListener("click", resetCategory);
    }

    if (resetAllButton) {
      resetAllButton.addEventListener("click", resetAll);
    }
  }

  function setupTasbih() {
    const button = document.getElementById("tasbihButton");
    const countElement = document.getElementById("tasbihCount");
    const resetButton = document.getElementById("resetTasbih");

    function update() {
      if (countElement) {
        countElement.textContent = getTasbihCount();
      }
    }

    if (button) {
      button.addEventListener("click", function () {
        const current = getTasbihCount();
        saveTasbihCount(current + 1);
        update();

        if (navigator.vibrate) {
          navigator.vibrate(25);
        }
      });
    }

    if (resetButton) {
      resetButton.addEventListener("click", function () {
        saveTasbihCount(0);
        update();
      });
    }

    update();
  }

  function showToast(message) {
    if (window.AmirApp && typeof window.AmirApp.showToast === "function") {
      window.AmirApp.showToast(message);
      return;
    }

    const toast = document.getElementById("amirToast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(function () {
      toast.classList.remove("show");
    }, 2200);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getCategoryInfo(category) {
    return categories[category] || null;
  }

  function getAzkar(category) {
    if (!category) {
      return azkar.slice();
    }

    return azkar.filter(function (item) {
      return item.category === category;
    });
  }

  function getCurrentCategory() {
    return currentCategory;
  }

  function getStats() {
    const allProgress = getProgress();

    let total = 0;
    let completed = 0;

    azkar.forEach(function (item) {
      const required = Number(item.count) || 1;
      const current = Math.min(
        Number(allProgress[item.id]) || 0,
        required
      );

      total += required;
      completed += current;
    });

    return {
      total,
      completed,
      percentage: total
        ? Math.round((completed / total) * 100)
        : 0
    };
  }

  function init() {
    setupCategories();
    setupSearch();
    setupResetButtons();
    setupTasbih();

    const initialCategory =
      document.querySelector("[data-azkar-category].active");

    if (
      initialCategory &&
      categories[initialCategory.dataset.azkarCategory]
    ) {
      currentCategory = initialCategory.dataset.azkarCategory;
    }

    render();
  }

  window.AmirAzkar = {
    init,
    render,
    getAzkar,
    getCategoryInfo,
    getCurrentCategory,
    getStats,
    setCategory,
    resetItem,
    resetCategory,
    resetAll,
    increment,
    toggleFavorite,
    getFavorites,
    getProgress,
    getTasbihCount,
    saveTasbihCount
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
