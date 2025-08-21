const API_KEY = "04cc6f1fd0d19655f87a3d4d69f9a29d";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// Şehir ismine göre haava durumu verisi al
export const getWeatherData = async (city, units = "metric") => {
  // İstek atılacak url'i hazırla
  const url = `${BASE_URL}?q=${city}&appid=${API_KEY}&units=${units}&lang=tr`;

  // API' a istek at
  const res = await fetch(url);

  // Response'u js formatına çevir
  const data = await res.json();

  return data;
};

// Koordinatlara göre hava durumu verisi al
export const getWeatherByCoords = async (lat, lon, units = "metric") => {
  const url = `${BASE_URL}?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`;

  const res = await fetch(url);

  return res.json();
};

// Parametre olarak gelen ülke için bayrak url'i oluşturan fonksiyon
export const getFlagUrl = (countryCode) =>
  `https://flagcdn.com/108x81/${countryCode.toLowerCase()}.png`;
