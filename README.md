# Sổ Thực Hành — Sweeteners & Cane Sugar Technology

Web React nhập số liệu thực hành đường mía: bảng số liệu + nhận xét + **biểu đồ tự vẽ** (Recharts), lưu Firebase Auth + Firestore.

## Chạy

```bash
npm install
npm run dev      # mở http://localhost:5173
npm run build    # build production -> dist/
```

Dùng **HashRouter** nên mở trực tiếp file tĩnh / host bất kỳ đều được.

## Firebase (quan trọng)

1. Vào [Firebase console](https://console.firebase.google.com/) → project `ant05-efa02` → **Authentication → Sign-in method**: bật **Email/Password** và **Google**.
2. **Firestore Database → Rules**: dán nội dung `firestore.rules` rồi Publish (mỗi user chỉ đọc/ghi `/reports/{uid}` của mình).
3. Config mặc định đã nhúng trong `src/firebase.js`; khi deploy nên tạo `.env` theo `.env.example`.

## Tính năng

- Auth email + Google; chưa đăng nhập vẫn nhập được (lưu máy, đăng nhập sẽ đồng bộ cloud).
- **6 chương riêng** (`/exp1`…`/exp6`), chép đầy đủ mô tả gốc từ phiếu để làm bài không cần mở PDF.
- Exp 1: bảng 9 nồng độ (đường/nước tự tính), hồi quy tuyến tính + R² tự tính, chart nồng độ–°Bx.
- Exp 2: 2 bảng repeat (mean/SD tự tính), ô khối lượng mía, 2 mục so sánh với bảng 1.1.
- Exp 3: bảng Control/5%/10%/15% vôi, nhận xét dùng số liệu nhóm khác.
- Exp 4: bảng thời gian động (thêm/xóa dòng), hồi quy time–°Bx và time–weight, **2 biểu đồ**.
- Exp 5/6: ghi chép kết tinh, tên/mô tả/sơ đồ công đoạn/ưu-nhược/yếu tố chất lượng.
- **2 giao diện riêng**: `DesktopLayout` (sidebar) và `MobileLayout` (topbar + chip + bottom tab, bảng chuyển thành thẻ) — chọn theo màn hình + touch, không chỉ bẻ CSS.
- Autosave (Firestore debounce + localStorage), xuất/nhập JSON, nút **In PDF** (có CSS print).

## Cấu trúc

```
src/
  firebase.js                 config Firebase
  auth/AuthContext.jsx         login/register/google/logout
  store/ReportContext.jsx       state + autosave Firestore
  lib/stats.js                mean/SD/hồi quy
  lib/experimentsMeta.js      mô tả gốc 6 thí nghiệm
  components/ui.jsx charts.jsx
  layouts/DesktopLayout.jsx MobileLayout.jsx
  pages/Exp1..Exp6.jsx AuthPage.jsx
  hooks/useDevice.js
```
