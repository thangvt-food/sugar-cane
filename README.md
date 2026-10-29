# Sổ Thực Hành — Sweeteners & Cane Sugar Technology

Web React nhập số liệu thực hành đường mía: bảng số liệu + nhận xét + **biểu đồ tự vẽ** (Recharts), lưu Firebase Auth + Firestore.

## Chạy

```bash
npm install
npm run dev      # mở http://localhost:5173
npm run build    # build production -> dist/
```

Dùng **HashRouter** và đường dẫn asset tương đối nên chạy được ở cả GitHub Pages (`https://thangvt-food.github.io/sugar-cane/`) lẫn domain riêng (`https://sugar.yangio.id.vn/`). File `public/CNAME` giữ cấu hình custom domain khi deploy.
Trang hướng dẫn thực hành 6 bài có thể xem không cần đăng nhập tại `/#/guide`.

## Firebase (quan trọng)

1. Vào [Firebase console](https://console.firebase.google.com/) → project `ant05-efa02` → **Authentication → Sign-in method**: bật **Email/Password** và **Google**.
2. **Firestore Database → Rules**: deploy bằng `firebase deploy --only firestore:rules` (mỗi user chỉ đọc/ghi `/reports/{uid}` của mình).
3. Config mặc định đã nhúng trong `src/firebase.js`; khi deploy nên tạo `.env` theo `.env.example`.

## Tính năng

- Auth email + Google; chưa đăng nhập vẫn nhập được (lưu máy, đăng nhập sẽ đồng bộ cloud).
- **6 chương riêng** (`/exp1`…`/exp6`), chép đầy đủ mô tả gốc từ phiếu để làm bài không cần mở PDF.
- **Hướng dẫn thực hành công khai** (`/guide`): trình tự thao tác, thông số và công thức của 6 bài; không yêu cầu đăng nhập.
- Exp 1: bảng nồng độ động (sửa / thêm / xóa dòng, mặc định 9 nồng độ; đường tự tính; nước mặc định 100 − đường và tự cập nhật khi chưa sửa tay, nhập lại được theo lượng cân thực tế), hồi quy tuyến tính + R² tự tính, chart nồng độ–°Bx.
- Exp 2: 2 bảng repeat (mean/SD tự tính), ô khối lượng mía, 2 mục so sánh với bảng 1.1. Hai dòng tự tính theo hướng dẫn: Hiệu suất ép = nước ép / mía × 100, Tỉ lệ chuẩn hoá = Hiệu suất ép × (°Bx đo / 15); bảng 2.4 tính Hiệu suất ép 2 = nước ép 2 / (2 × bã 1).
- Exp 3: bảng Control/10%/15%/18% vôi (liều theo hướng dẫn), tự tính Tỉ lệ bùn = bùn / (nước mía + vôi) và Hiệu suất dịch trong = dịch sau lọc / nước mía thô, nhận xét dùng số liệu nhóm khác.
- Exp 4: bảng thời gian động (thêm/xóa dòng), nhập khối lượng nồi rỗng từng nhóm để trừ bì (m dịch = m nồi+dịch − m nồi), hồi quy time–°Bx và time–weight, **2 biểu đồ**.
- Exp 5/6: ghi chép kết tinh + hiệu suất kết tinh = đường thu / (dịch bão hoà + mầm) × 100; tên/mô tả/sơ đồ công đoạn/ưu-nhược/yếu tố chất lượng + hiệu suất kẹo = thành phẩm / tổng nguyên liệu × 100.
- **2 giao diện riêng**: `DesktopLayout` (sidebar) và `MobileLayout` (topbar + chip + bottom tab, bảng chuyển thành thẻ) — chọn theo màn hình + touch, không chỉ bẻ CSS.
- Autosave (Firestore debounce + localStorage), xuất **Excel `.xlsx` 6 sheet** (định dạng bảng biểu, ô tự tính, phương trình hồi quy), xuất/nhập JSON, nút **In PDF** (có CSS print).
- **Công thức dùng chung**: `src/lib/formulas.js` là nguồn duy nhất cho mọi ô tự tính (trang nhập và sheet Excel cùng gọi), nên số trên màn hình và file `.xlsx` không thể lệch nhau; quy ước thiếu dữ kiện → hiện “—” kèm lý do, không hiển thị lại số tay theo công thức cũ.
- Debug lỗi sync cloud: log `[cloud-sync]` + panel chi tiết mã lỗi/UID/Project/trạng thái mạng.

## Cấu trúc

```
src/
  firebase.js                 config Firebase
  auth/AuthContext.jsx         login/register/google/logout
  store/ReportContext.jsx       state + autosave Firestore
  lib/stats.js                mean/SD/hồi quy
  lib/formulas.js             công thức guide (trang + Excel dùng chung)
  lib/reportXlsx.js           xuất Excel 6 sheet toàn bộ báo cáo
  lib/cloudDebug.js           map lỗi sync + log chi tiết
  lib/experimentsMeta.js      mô tả gốc 6 thí nghiệm
  components/ui.jsx charts.jsx SyncStatus.jsx
  layouts/DesktopLayout.jsx MobileLayout.jsx
  pages/Exp1..Exp6.jsx AuthPage.jsx
  pages/GuidePage.jsx          hướng dẫn thực hành công khai
  hooks/useDevice.js
```
