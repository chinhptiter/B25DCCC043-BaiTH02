
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Cloud,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  MapPin,
  RefreshCw,
  Search,
  Sun,
  Wind,
  CalendarDays,
  Thermometer,
  CloudLightning,
  Moon
} from "lucide-react";
import "./style.css";

// ================================
// 1. KHAI BÁO KIỂU DỮ LIỆU
// ================================

interface City {
  id: string;
  name: string;
  lat: number;
  lon: number;
  region: string;
}

interface CurrentWeather {
  time: string;
  temperature_2m: number;
  relative_humidity_2m: number;
  weather_code: number;
  wind_speed_10m: number;
  is_day: number;
}

interface DailyWeather {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
}

interface WeatherData {
  current: CurrentWeather;
  daily: DailyWeather;
}

type Status = "idle" | "loading" | "success" | "error";
type TemperatureUnit = "C" | "F";

// ================================
// 2. DANH SÁCH THÀNH PHỐ
// ================================

const CITIES: City[] = [
  {
    id: "hanoi",
    name: "Hà Nội",
    lat: 21.0285,
    lon: 105.8542,
    region: "Miền Bắc"
  },
  {
    id: "haiphong",
    name: "Hải Phòng",
    lat: 20.8449,
    lon: 106.6881,
    region: "Miền Bắc"
  },
  {
    id: "hue",
    name: "Huế",
    lat: 16.4637,
    lon: 107.5909,
    region: "Miền Trung"
  },
  {
    id: "danang",
    name: "Đà Nẵng",
    lat: 16.0544,
    lon: 108.2022,
    region: "Miền Trung"
  },
  {
    id: "nhatrang",
    name: "Nha Trang",
    lat: 12.2388,
    lon: 109.1967,
    region: "Miền Trung"
  },
  {
    id: "dalat",
    name: "Đà Lạt",
    lat: 11.9404,
    lon: 108.4583,
    region: "Tây Nguyên"
  },
  {
    id: "hcm",
    name: "TP. Hồ Chí Minh",
    lat: 10.8231,
    lon: 106.6297,
    region: "Miền Nam"
  },
  {
    id: "cantho",
    name: "Cần Thơ",
    lat: 10.0452,
    lon: 105.7469,
    region: "Miền Nam"
  }
];

// ================================
// 3. THÔNG TIN THỜI TIẾT
// ================================

function weatherInfo(code: number, isDay: number = 1) {
  if (code === 0) {
    return {
      label: "Trời quang",
      icon: isDay ? Sun : Moon,
      emoji: isDay ? "☀️" : "🌙"
    };
  }

  if ([1, 2].includes(code)) {
    return {
      label: "Ít mây",
      icon: CloudSun,
      emoji: "🌤️"
    };
  }

  if (code === 3) {
    return {
      label: "Nhiều mây",
      icon: Cloud,
      emoji: "☁️"
    };
  }

  if ([45, 48].includes(code)) {
    return {
      label: "Sương mù",
      icon: Cloud,
      emoji: "🌫️"
    };
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return {
      label: "Mưa phùn",
      icon: CloudRain,
      emoji: "🌦️"
    };
  }

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return {
      label: "Có mưa",
      icon: CloudRain,
      emoji: "🌧️"
    };
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return {
      label: "Có tuyết",
      icon: CloudSnow,
      emoji: "❄️"
    };
  }

  if ([95, 96, 99].includes(code)) {
    return {
      label: "Dông",
      icon: CloudLightning,
      emoji: "⛈️"
    };
  }

  return {
    label: "Không xác định",
    icon: Cloud,
    emoji: "🌡️"
  };
}

// ================================
// 4. ĐỊNH DẠNG NGÀY
// ================================

function formatDate(dateString: string) {
  const date = new Date(`${dateString}T12:00:00`);

  return {
    weekday: new Intl.DateTimeFormat("vi-VN", {
      weekday: "long"
    }).format(date),

    date: new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit"
    }).format(date)
  };
}

// ================================
// 5. CHUYỂN ĐỔI NHIỆT ĐỘ
// ================================

function convertTemp(
  value: number,
  unit: TemperatureUnit
): number {
  if (unit === "F") {
    return Math.round((value * 9) / 5 + 32);
  }

  return Math.round(value);
}

// ================================
// 6. KIỂM TRA DỮ LIỆU API
// ================================

function isWeatherData(data: unknown): data is WeatherData {
  if (!data || typeof data !== "object") {
    return false;
  }

  const value = data as Partial<WeatherData>;
  const current = value.current;
  const daily = value.daily;

  return Boolean(
    current &&
    daily &&
    typeof current.time === "string" &&
    typeof current.temperature_2m === "number" &&
    typeof current.relative_humidity_2m === "number" &&
    typeof current.weather_code === "number" &&
    typeof current.wind_speed_10m === "number" &&
    typeof current.is_day === "number" &&
    Array.isArray(daily.time) &&
    Array.isArray(daily.weather_code) &&
    Array.isArray(daily.temperature_2m_max) &&
    Array.isArray(daily.temperature_2m_min) &&
    daily.time.length === 7 &&
    daily.weather_code.length === 7 &&
    daily.temperature_2m_max.length === 7 &&
    daily.temperature_2m_min.length === 7 &&
    daily.time.every(item => typeof item === "string") &&
    daily.weather_code.every(item => typeof item === "number") &&
    daily.temperature_2m_max.every(item => typeof item === "number") &&
    daily.temperature_2m_min.every(item => typeof item === "number")
  );
}

// ================================
// 7. COMPONENT APP
// ================================

function App() {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  const [weather, setWeather] = useState<WeatherData | null>(null);

  const [status, setStatus] = useState<Status>("idle");

  const [error, setError] = useState<string>("");

  const [unit, setUnit] = useState<TemperatureUnit>("C");

  const [search, setSearch] = useState<string>("");

  const requestRef = useRef<AbortController | null>(null);

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("weather-favorites");

      if (!saved) return [];

      const parsed: unknown = JSON.parse(saved);

      if (
        Array.isArray(parsed) &&
        parsed.every(item => typeof item === "string")
      ) {
        return parsed;
      }

      return [];
    } catch {
      return [];
    }
  });

  // Lưu danh sách yêu thích
  useEffect(() => {
    try {
      localStorage.setItem(
        "weather-favorites",
        JSON.stringify(favorites)
      );
    } catch {
      // Trình duyệt có thể chặn lưu trữ
    }
  }, [favorites]);

  // Hủy yêu cầu khi component bị tháo
  useEffect(() => {
    return () => {
      requestRef.current?.abort();
    };
  }, []);

  // ================================
  // 8. GỌI API OPEN-METEO
  // ================================

  async function loadWeather(city: City): Promise<void> {
    requestRef.current?.abort();

    const controller = new AbortController();
    requestRef.current = controller;

    setSelectedCity(city);
    setStatus("loading");
    setError("");
    setWeather(null);

    const params = new URLSearchParams({
      latitude: String(city.lat),
      longitude: String(city.lon),
      current:
        "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day",
      daily:
        "weather_code,temperature_2m_max,temperature_2m_min",
      timezone: "Asia/Ho_Chi_Minh",
      forecast_days: "7"
    });

    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
        { signal: controller.signal }
      );

      if (!response.ok) {
        throw new Error(
          `Máy chủ phản hồi lỗi (${response.status}).`
        );
      }

      const data: unknown = await response.json();

      if (!isWeatherData(data)) {
        throw new Error(
          "Dữ liệu thời tiết không đầy đủ hoặc không hợp lệ."
        );
      }

      if (controller.signal.aborted) return;

      setWeather(data);
      setStatus("success");

    } catch (err: unknown) {
      if (controller.signal.aborted) return;

      const message =
        err instanceof Error
          ? err.message
          : "Không thể tải dữ liệu thời tiết.";

      setError(message);
      setStatus("error");
    }
  }

  // ================================
  // 9. TÌM KIẾM THÀNH PHỐ
  // ================================

  const filteredCities = useMemo<City[]>(() => {
    const normalized = search
      .trim()
      .toLocaleLowerCase("vi");

    if (!normalized) {
      return CITIES;
    }

    return CITIES.filter(city =>
      city.name.toLocaleLowerCase("vi").includes(normalized)
    );
  }, [search]);

  // ================================
  // 10. THÀNH PHỐ YÊU THÍCH
  // ================================

  function toggleFavorite(cityId: string): void {
    setFavorites(current =>
      current.includes(cityId)
        ? current.filter(id => id !== cityId)
        : [...current, cityId]
    );
  }

  function resetHome(): void {
    requestRef.current?.abort();
    setSelectedCity(null);
    setWeather(null);
    setStatus("idle");
    setError("");
  }

  const current = weather?.current;

  const currentInfo = current
    ? weatherInfo(current.weather_code, current.is_day)
    : null;

  // ================================
  // 11. GIAO DIỆN ỨNG DỤNG
  // ================================

  return (
    <main className="app-shell">

      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      {/* HEADER */}
      <header className="topbar">

        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            resetHome();
          }}
        >
          <span className="brand-icon">
            <CloudSun size={23} />
          </span>

          <span>
            Weather<span className="brand-accent">VN</span>
          </span>
        </a>

        <div className="topbar-right">

          <span className="live-dot" />

          <span>Dữ liệu trực tiếp từ Open-Meteo</span>

          <span
            className="unit-switch"
            aria-label="Chọn đơn vị nhiệt độ"
          >
            <button
              type="button"
              className={unit === "C" ? "active" : ""}
              onClick={() => setUnit("C")}
            >
              °C
            </button>

            <button
              type="button"
              className={unit === "F" ? "active" : ""}
              onClick={() => setUnit("F")}
            >
              °F
            </button>
          </span>

        </div>
      </header>

      {/* GIỚI THIỆU */}
      <section className="hero">

        <div className="eyebrow">
          <span />
          THỜI TIẾT VIỆT NAM
        </div>

        <h1>
          Dự báo thời tiết
          <br />
          <span>trên khắp Việt Nam.</span>
        </h1>

        <p>
          Theo dõi tình hình thời tiết hiện tại và
          dự báo 7 ngày tại 8 thành phố.
        </p>

      </section>

      <section className="content-grid">

        {/* DANH SÁCH THÀNH PHỐ */}
        <aside className="city-panel panel">

          <div className="panel-heading">

            <div>
              <span className="section-kicker">
                ĐỊA ĐIỂM
              </span>
              <h2>Thành phố</h2>
            </div>

            <span className="city-count">
              08 địa điểm
            </span>

          </div>

          <label className="search-box">

            <Search size={17} />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm thành phố..."
              aria-label="Tìm thành phố"
            />

          </label>

          <div className="city-list">

            {filteredCities.map((city: City) => (
              <button
                type="button"
                key={city.id}
                className={`city-item ${
                  selectedCity?.id === city.id
                    ? "selected"
                    : ""
                }`}
                onClick={() => loadWeather(city)}
              >

                <span className="city-pin">
                  <MapPin size={16} />
                </span>

                <span className="city-copy">
                  <strong>{city.name}</strong>
                  <small>{city.region}</small>
                </span>

                <span className="city-trailing">

                  {favorites.includes(city.id) && (
                    <span className="favorite-mark">
                      ★
                    </span>
                  )}

                  <span className="city-arrow">
                    ›
                  </span>

                </span>

              </button>
            ))}

            {filteredCities.length === 0 && (
              <p className="empty-search">
                Không tìm thấy thành phố.
              </p>
            )}

          </div>

          <div className="favorite-note">
            ★ Nhấn vào thành phố để xem thời tiết.
            Thành phố có dấu ★ là yêu thích.
          </div>

        </aside>

        {/* THÔNG TIN THỜI TIẾT */}
        <section className="weather-column">

          {/* TRẠNG THÁI BAN ĐẦU */}
          {status === "idle" && (

            <div className="welcome-card panel">

              <div className="welcome-art">
                <Sun size={62} strokeWidth={1.2} />
                <Cloud size={58} strokeWidth={1.2} />
              </div>

              <span className="section-kicker">
                BẮT ĐẦU KHÁM PHÁ
              </span>

              <h2>Chọn một thành phố</h2>

              <p>
                Chọn địa điểm ở danh sách bên trái
                để xem thời tiết hiện tại và dự báo 7 ngày.
              </p>

              <div className="quick-cities">

                {CITIES.slice(0, 4).map(city => (
                  <button
                    type="button"
                    key={city.id}
                    onClick={() => loadWeather(city)}
                  >
                    {city.name}
                  </button>
                ))}

              </div>

            </div>
          )}

          {/* ĐANG TẢI */}
          {status === "loading" && (

            <div className="state-card panel">

              <div className="loader" />

              <h2>Đang cập nhật thời tiết...</h2>

              <p>
                Đang kết nối dữ liệu cho {selectedCity?.name}.
              </p>

            </div>
          )}

          {/* THÔNG BÁO LỖI */}
          {status === "error" && (

            <div className="state-card panel error-state">

              <div className="error-icon">
                !
              </div>

              <h2>Không thể tải dữ liệu</h2>

              <p>{error}</p>

              <button
                type="button"
                className="retry-button"
                onClick={() => {
                  if (selectedCity) {
                    loadWeather(selectedCity);
                  }
                }}
              >
                <RefreshCw size={16} />
                Thử lại
              </button>

            </div>
          )}

          {/* KẾT QUẢ THỜI TIẾT */}
          {status === "success" &&
            weather &&
            selectedCity &&
            current &&
            currentInfo && (

            <>

              {/* THỜI TIẾT HIỆN TẠI */}
              <div className="current-card">

                <div className="current-topline">

                  <div>

                    <span className="section-kicker light">
                      THỜI TIẾT HIỆN TẠI
                    </span>

                    <h2>{selectedCity.name}</h2>

                    <span className="location-label">
                      <MapPin size={14} />
                      {selectedCity.region}, Việt Nam
                    </span>

                  </div>

                  <button
                    type="button"
                    className={`favorite-button ${
                      favorites.includes(selectedCity.id)
                        ? "is-favorite"
                        : ""
                    }`}
                    onClick={() =>
                      toggleFavorite(selectedCity.id)
                    }
                    aria-label="Đánh dấu yêu thích"
                  >
                    {favorites.includes(selectedCity.id)
                      ? "★ Đã yêu thích"
                      : "☆ Yêu thích"}
                  </button>

                </div>

                <div className="current-main">

                  <div className="temperature-wrap">

                    <div className="weather-emoji">
                      {currentInfo.emoji}
                    </div>

                    <div className="temperature">
                      {convertTemp(
                        current.temperature_2m,
                        unit
                      )}
                      <span>°{unit}</span>
                    </div>

                    <div className="condition">
                      {currentInfo.label}
                    </div>

                  </div>

                  <div className="weather-stats">

                    <div className="stat-card">

                      <Droplets size={19} />

                      <span>Độ ẩm</span>

                      <strong>
                        {current.relative_humidity_2m}%
                      </strong>

                    </div>

                    <div className="stat-card">

                      <Wind size={19} />

                      <span>Tốc độ gió</span>

                      <strong>
                        {Math.round(
                          current.wind_speed_10m
                        )} km/h
                      </strong>

                    </div>

                    <div className="stat-card">

                      <Thermometer size={19} />

                      <span>Trạng thái thời tiết</span>

                      <strong>
                        {currentInfo.label}
                      </strong>

                    </div>

                  </div>

                </div>

                <div className="updated-time">

                  <span className="live-dot" />

                  Cập nhật lúc:{" "}
                  {current.time.replace("T", " ")}
                  {" "} (giờ Việt Nam)

                </div>

              </div>

              {/* DỰ BÁO 7 NGÀY */}
              <div className="forecast-panel panel">

                <div className="panel-heading forecast-heading">

                  <div>

                    <span className="section-kicker">
                      DỰ BÁO
                    </span>

                    <h2>7 ngày tới</h2>

                  </div>

                  <span className="forecast-caption">
                    <CalendarDays size={15} />
                    Thời tiết từng ngày
                  </span>

                </div>

                <div className="forecast-list">

                  {weather.daily.time.map(
                    (date: string, index: number) => {

                      const day = formatDate(date);

                      const info = weatherInfo(
                        weather.daily.weather_code[index]
                      );

                      return (

                        <div
                          className="forecast-row"
                          key={date}
                        >

                          <div className="forecast-date">

                            <strong>
                              {index === 0
                                ? "Hôm nay"
                                : day.weekday}
                            </strong>

                            <small>{day.date}</small>

                          </div>

                          <span
                            className="forecast-icon"
                            title={info.label}
                          >
                            {info.emoji}
                          </span>

                          <span className="forecast-condition">
                            {info.label}
                          </span>

                          <div className="temp-range">

                            <strong>
                              {convertTemp(
                                weather.daily.temperature_2m_max[index],
                                unit
                              )}°
                            </strong>

                            <div className="temp-track">
                              <span />
                            </div>

                            <span>
                              {convertTemp(
                                weather.daily.temperature_2m_min[index],
                                unit
                              )}°
                            </span>

                          </div>

                        </div>

                      );
                    }
                  )}

                </div>

                <p className="forecast-footnote">
                  Nhiệt độ cao nhất / thấp nhất trong ngày
                  · Đơn vị °{unit}
                </p>

              </div>

            </>
          )}

        </section>

      </section>

      {/* FOOTER */}
      <footer className="footer">

        <span>© 2026 WeatherVN</span>

        <span>
          Dữ liệu thời tiết:{" "}
          <a
            href="https://open-meteo.com/"
            target="_blank"
            rel="noreferrer"
          >
            Open-Meteo API
          </a>
        </span>

        <span>
          Thiết kế cho học tập ReactJS
        </span>

      </footer>

    </main>
  );
}

export default App;
