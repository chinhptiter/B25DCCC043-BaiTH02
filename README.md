# WeatherVN – Ứng dụng thời tiết ReactJS

Ứng dụng xem thời tiết hiện tại và dự báo 7 ngày cho 8 thành phố Việt Nam, sử dụng API miễn phí Open-Meteo (không cần API key).

## 1. Công nghệ
- ReactJS
- Vite
- JavaScript
- CSS responsive
- Open-Meteo Forecast API
- Lucide React (biểu tượng giao diện)

## 2. Cài đặt và chạy dự án

Cài Node.js phiên bản LTS trước: https://nodejs.org/

Mở Terminal tại thư mục dự án và chạy lần lượt:

```bash
npm install
npm run dev
```

Sau đó mở địa chỉ Local mà Vite hiển thị, thường là:

```text
http://localhost:5173
```

## 3. Build dự án

```bash
npm run build
```

Thư mục `dist` được tạo ra sau khi build. Không đưa `dist` và `node_modules` lên GitHub theo yêu cầu bài tập.

## 4. Các chức năng đã thực hiện

- YC1: Hiển thị danh sách 8 thành phố; thành phố đang chọn được làm nổi bật.
- YC2: Hiển thị thời tiết hiện tại gồm biểu tượng, mô tả, nhiệt độ, độ ẩm, tốc độ gió và thời điểm cập nhật.
- YC3: Dự báo 7 ngày gồm thứ, ngày, biểu tượng, nhiệt độ cao nhất và thấp nhất.
- YC4: Có trạng thái chưa chọn, đang tải, lỗi và nút thử lại.
- YC5: Chuyển đổi °C / °F ngay trên dữ liệu đã tải, không gọi lại API.
- YC6: Responsive: từ 768px bố cục hai cột; màn hình nhỏ hơn xếp dọc.
- Nâng cao: tìm thành phố không phân biệt chữ hoa/thường; đánh dấu thành phố yêu thích và lưu bằng localStorage.

## 5. Cấu trúc thư mục

```text
weather-vietnam-react/
├── index.html
├── package.json
├── README.md
└── src/
    ├── App.jsx
    ├── main.jsx
    └── style.css
```

## 6. API sử dụng

Endpoint: `https://api.open-meteo.com/v1/forecast`

Các trường:
- `current`: `temperature_2m`, `relative_humidity_2m`, `weather_code`, `wind_speed_10m`, `is_day`
- `daily`: `weather_code`, `temperature_2m_max`, `temperature_2m_min`
- `timezone`: `Asia/Ho_Chi_Minh`
- `forecast_days`: `7`

Tài liệu: https://open-meteo.com/en/docs
