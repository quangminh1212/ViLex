# 📜 VietDoc Pro

**Công cụ tạo văn bản pháp lý Việt Nam chuyên nghiệp — Tạo hợp đồng, hóa đơn, báo giá chỉ với vài click.**

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Tính năng

- 📄 **10 mẫu văn bản** theo chuẩn pháp luật Việt Nam
- 🖨️ **Xuất PDF** chất lượng cao, đúng khổ A4
- 👁️ **Xem trước trực tiếp** trước khi xuất
- 🌙 **Dark/Light mode** — giao diện hiện đại, responsive
- 📋 **Điều khoản bổ sung** — chọn/bỏ chọn linh hoạt theo nhu cầu
- ⚡ **Không cần đăng nhập**, không lưu dữ liệu — bảo mật tuyệt đối

## 📑 Các loại văn bản hỗ trợ

| # | Loại văn bản | Mô tả |
|---|---|---|
| 1 | 💰 **Báo Giá** | Tạo báo giá chuyên nghiệp với bảng sản phẩm, VAT tự động |
| 2 | 🧾 **Hóa Đơn** | Hóa đơn bán hàng/dịch vụ với mã số thuế |
| 3 | 🏠 **Hợp Đồng Thuê Nhà** | Theo Bộ luật Dân sự 2015, Luật Nhà ở 2014 |
| 4 | 🤝 **Hợp Đồng Dịch Vụ** | Theo Luật Thương mại 2005 |
| 5 | 📦 **Hợp Đồng Mua Bán** | Hợp đồng mua bán hàng hóa |
| 6 | 👔 **Hợp Đồng Lao Động** | Theo Bộ luật Lao động 2019 (Luật 45/2019/QH14) |
| 7 | 📝 **Giấy Ủy Quyền** | Theo Bộ luật Dân sự 2015 |
| 8 | 📋 **Biên Bản Thanh Lý HĐ** | Thanh lý hợp đồng khi hoàn thành |
| 9 | 🤲 **Biên Bản Giao Nhận** | Bàn giao tài sản, hàng hóa |
| 10 | 🧾 **Giấy Biên Nhận** | Xác nhận đã nhận tiền/tài sản |

## 🚀 Cài đặt & Chạy

### Yêu cầu
- [Node.js](https://nodejs.org/) >= 18

### Cài đặt

```bash
# Clone repo
git clone <repo-url>
cd vietdoc-pro

# Cài đặt dependencies
npm install
```

### Chạy development

```bash
npm run dev
```

Mở trình duyệt tại `http://localhost:5173`

### Build production

```bash
npm run build
npm run preview
```

## 🛠️ Công nghệ

| Công nghệ | Vai trò |
|---|---|
| **TypeScript** | Ngôn ngữ lập trình chính |
| **Vite** | Build tool & dev server |
| **jsPDF** | Xuất PDF |
| **html2canvas** | Chuyển đổi HTML → Canvas cho PDF |
| **Google Fonts** | Inter, JetBrains Mono |

## 📂 Cấu trúc dự án

```
vietdoc-pro/
├── index.html          # Entry point HTML
├── src/
│   ├── main.ts         # Logic chính: form, navigation, PDF export
│   ├── templates.ts    # 10 mẫu văn bản với render HTML
│   └── style.css       # Design system (light/dark theme)
├── package.json
├── tsconfig.json
└── .gitignore
```

## 📖 Hướng dẫn sử dụng

1. **Chọn loại văn bản** — Click vào card tương ứng trên trang chủ
2. **Điền thông tin** — Nhập các trường thông tin (tên, địa chỉ, giá trị, ...)
3. **Chọn điều khoản** — Tick/bỏ tick các điều khoản bổ sung (nếu có)
4. **Xem trước** — Nhấn "👁️ Xem Trước" để kiểm tra nội dung
5. **Xuất PDF** — Nhấn "📄 Xuất PDF" để tải về file PDF khổ A4

## ⚖️ Căn cứ pháp lý

Các mẫu văn bản được xây dựng dựa trên:

- **Bộ luật Dân sự 2015** (Luật số 91/2015/QH13)
- **Bộ luật Lao động 2019** (Luật số 45/2019/QH14)
- **Luật Thương mại 2005** (Luật số 36/2005/QH11)
- **Luật Nhà ở 2014** (Luật số 65/2014/QH13)

> ⚠️ **Lưu ý:** Các mẫu văn bản chỉ mang tính chất tham khảo. Vui lòng tham vấn luật sư cho các giao dịch quan trọng.

## 📄 License

MIT © 2026 VietDoc Pro
