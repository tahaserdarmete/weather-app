import {getFlagUrl, getWeatherData, getWeatherByCoords} from "./api.js";
import {
  uiElement,
  updateThemeIcon,
  renderCityList,
  renderError,
  clearError,
  setLoader,
  renderWeatherData,
  renderRecentChips,
  updateUnitToggle,
} from "./ui.js";

// ! Projede tutulan veriler
const STATE = {
  theme: localStorage.getItem("theme") || "dark",
  recent: JSON.parse(localStorage.getItem("recent") || "[]"),
  units: localStorage.getItem("units") || "metric",
};

// ! Proje yüklendiği anda yapılacaklar
// Body elementine eriş
const body = document.body;

// Body'e tema değerini attribute olarak ekle
body.setAttribute("data-theme", STATE.theme);

// Sayfa ilk yüklendiğinde doğru iconun ekrana gelmesini sağla
updateThemeIcon(STATE.theme);

// ! Fonksiyonlar
// mevcut değerleri localstorage a kayfet
const persist = () => {
  localStorage.setItem("theme", STATE.theme);
  localStorage.setItem("recent", JSON.stringify(STATE.recent));
  localStorage.setItem("units", STATE.units);
};

// Son aratılan şehirleri eklme yapan fonksiyon
const pushRecent = (city) => {
  // slice(0,6) ile sadece ilk 6 değeri yazdırdık.
  const updated = [
    city,
    ...STATE.recent.filter((c) => c.toLowerCase() !== city.toLowerCase()),
  ].slice(0, 6);
  STATE.recent = updated;

  // Son aratılan şehirleri ekrana bas
  renderRecentChips(STATE.recent, (city) => {
    uiElement.searchInput.value = city;
    handleSearch(city);
  });

  // Son güncellemeleri Lokalestorage'a kaydet
  persist();
};

// Form gönderilince çalışan fonksiyon
const handleSearch = async (city) => {
  const name = city.trim();

  // Şehir ismi girilmediyse ekrana hatayı bas
  if (!name) {
    renderError("Şehir ismi zorunludur");
    return;
  }

  // Önceden hata varsa temizle
  clearError();

  // Ekrana loader bas
  setLoader(true);

  try {
    const data = await getWeatherData(city, STATE.units);
    // API'dan gelen hava durumu verilerini al

    // Şehir bulunamazsa ekrana hayatı bas
    if (data.cod === "404") {
      return renderError("Şehir bulunamadı");
    }

    // Bayrak için url oluştur
    const flagUrl = getFlagUrl(data.sys.country);

    // Son aratılanları güncelle
    pushRecent(name);

    // Ekrana hava durumu verisini bas
    renderWeatherData(data, flagUrl, STATE.units);
  } catch (error) {
    renderError(error.message || "Şehir bulunamadı.");
  } finally {
    setLoader(false);
  }
};

// Kullanıcının konumuna göre ara
const handleGeoSearch = () => {
  window.navigator.geolocation.getCurrentPosition(
    async (position) => {
      const {latitude, longitude} = position.coords;

      // Ekrana loader bas
      setLoader(true);

      // API'a hava durumu için istek at
      const data = await getWeatherByCoords(latitude, longitude, STATE.units);

      // Ekrandan loader kaldır
      setLoader(false);

      // Bayrak Url
      const flagUrl = getFlagUrl(data.sys.country);

      // Hava Durumu verisi
      renderWeatherData(data, flagUrl, STATE.units);

      // Son aramaları güncelle
      pushRecent(data.name);
    },

    // Kullanıcı konum almaya izin vermezse
    () => {
      renderError("Konum bilgisi alınamamdı");
    }
  );
};

// ! Evets

// Sayfa içeriği yüklendiğinde
document.addEventListener("DOMContentLoaded", () => {
  // Kullanıcı konumuna göre arat
  handleGeoSearch();

  // Şehir listesini yükle
  renderCityList();

  // Aratılanları ekrana bas
  renderRecentChips(STATE.recent, (city) => {
    uiElement.searchInput.value = city;
    handleSearch(city);
  });

  // Son seçilen sıcaklık birimini bas
  updateUnitToggle(STATE.units);
});

// Form gönderildiğinde
uiElement.searchForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const city = uiElement.searchInput.value;

  handleSearch(city);
});

// tema butonuna tıklanma olayını izle
uiElement.themeBtn.addEventListener("click", () => {
  // erişilen tema değerinin tersini al
  STATE.theme = STATE.theme === "light" ? "dark" : "light";

  // tema değerini body'e attribute olarak ekle
  body.setAttribute("data-theme", STATE.theme);

  // son temayı localstroage a kaydet
  persist();

  // Iconu güncelle
  updateThemeIcon(STATE.theme);
});

// Konum butonuna tıklandığında
uiElement.locateBtn.addEventListener("click", handleGeoSearch);

// Birim alanına tıklanma
uiElement.unitToggle.querySelectorAll("button").forEach((btn) => {
  btn.addEventListener("click", async () => {
    // Hangi birim seçildiğini öğrendik
    const nextUnits = btn.value;

    // Aynı birim seçildiyse fonksiyonu durdur
    if (STATE.units === nextUnits) return;

    // seçili birimi güncelle
    STATE.units = nextUnits;

    // LocaleStorage'a son güncellemleri kaydet
    persist();

    // Arayüzü güncelle
    updateUnitToggle(nextUnits);

    // Son yapılan aramayı son seçilen birime göre tekrarla
    handleSearch(STATE.recent[0]);
  });
});
