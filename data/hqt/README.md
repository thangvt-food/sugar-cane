# Artifacts quiz HQT – lớp "CN đường mía"

Thư mục này chứa artifact trung gian của quy trình import quiz từ file Google Form
(`data/*.md`) lên HQT Quiz. Repo này là **public**, nên nội dung có thể lộ đáp án hoặc
dữ liệu cá nhân của sinh viên được đưa vào `.gitignore` và **không commit**:

| Không commit | Lý do |
|---|---|
| `*.md` (DSL), `questions.json`, `answerkey.json`, `items.json`, `parse-*.json`, `pull-*.json`, `roundtrip.md` | Chứa đáp án đúng của 150 câu |
| `*.cjs` (build/verify/extract/fidelity/overlap) | Nhúng đáp án hoặc logic chấm điểm |
| `data/*.md` ở thư mục cha, `lesson-*.txt`, `evidence-*.png`, `manifest.json` chi tiết | Email sinh viên, trích slide, tên lớp + join code |
| `lesson/`, `report/`, `data/*.docx|pdf|zip` | ~98 MB binary, bài nộp ghi tên sinh viên |

Source of truth của đề là **server HQT**, không phải các file này. Muốn lấy lại toàn bộ
câu hỏi + đáp án: `hqt question pull --quiz-id <id> --format json` (xem bảng id dưới).

## Đã publish

Lớp `CN đường mía` (tìm id + join code bằng `hqt class list`, không ghi ở đây vì repo public).
Mọi đề: `visibility: public`, `is_published: true`, points 1/câu.

| Nguồn | Quiz | Số câu |
|---|---|---|
| `23-10.md` | `cbbdc793-1f70-430c-82db-409be2bb9bf7` – Isomalt | 13 |
| | `5973efd7-fe6b-4e50-8d6d-36372bdd23ee` – Erythritol | 13 |
| | `60c82e32-1337-4f8f-a666-20ce7a6155f4` – Maltitol | 12 |
| | `68f54098-06ad-4ff0-ae8b-0720d98858ae` – Lactitol | 9 |
| | `6d5ff7bf-5938-4c46-badb-0b5dbb3f3db8` – Tổng hợp 4 nhóm polyol | 3 |
| `25-9.md` | `163691e3-6045-4877-9b7b-32ff2f8c8cbe` – Aspartame | 10 |
| | `eba7484b-e1e3-4601-b0bc-5a39e4230e57` – Acesulfame K | 9 |
| | `213dc4ff-106c-4872-8338-ccc451c24289` – Saccharin | 9 |
| | `21055080-20ca-4daa-9e01-f1432d4aa149` – Cyclamate | 15 |
| | `90435a25-3593-4504-8b3d-ef0e8430e019` – Phân tích HPLC & phối trộn | 7 |
| `11-9.md` | `50f7421b-371c-4556-a40b-ec6f3d42b400` – KIỂM TRA 1 (nhập môn) | 20 |
| `9-10.md` | `1344ee1f-1a14-404a-a003-430de443eaf4` – Sucralose & protein ngọt | 20 |
| | `ccd124f6-f608-4793-a8dc-40611274fdb6` – Glycoside tự nhiên & chất ngọt khác | 10 |

**13 quiz / 150 câu.** Cả 13 đều được publish ở mode không giới hạn:
`--duration unlimited --max-attempts unlimited`. Cờ này phải verify qua
`quiz config --show` → `data.limits.unlimitedTime` / `unlimitedAttempts`
(không suy từ `time_limit NULL`, vì value đó cũng xuất hiện khi tắt mode unlimited).

## Đáp án lấy từ đâu

Cả 4 file nguồn là export Google Form **không đánh dấu đáp án đúng**. Đáp án được suy từ
slide trong `lesson/Các chất tạo ngọt 0–4.pdf` (bảng số liệu, sắc ký đồ, biểu đồ độ hòa tan),
chỉ khi slide thiếu mới dùng tài liệu tham khảo ngoài. Repo không có answer key của giảng viên.

Bản key đã chốt nằm trong chính đề trên HQT (`hqt question pull --quiz-id <id>`), **không**
được ghi lại ở đây vì repo public. Sáu câu dưới đây từng phải phân vân giữa các phương án,
nếu giảng viên dạy khác thì cần sửa trực tiếp trên đề:

- `23-10` #3 – nguồn nguyên liệu công nghiệp của isomalt; slide và tài liệu ngoài nói khác nhau.
- `25-9` #17 – phân biệt sản phẩm thủy phân với sản phẩm vòng hóa nội phân tử của aspartame.
- `25-9` #30, #31, #38 – thứ tự thời gian lưu của 4 chất trên cột C18; phải đọc sắc ký đồ
  trong slide vì trí nhớ phổ biến cho kết quả khác.
- `11-9` #16 – export dính liền làm hai lựa chọn tưởng khác nhau nhưng trùng nghĩa, dễ thành
  2 đáp án cùng đúng nếu tách máy móc.
- `9-10` #11 – slide tự mâu thuẫn giữa mục thaumatin và mục brazzein về số cầu disulfid.
- `9-10` #25 – hai khái niệm dễ lẫn: đồng phân ngọt nhất và đồng phân có trong tự nhiên.

Ghi chú: `hqt` CLI chưa có cờ `--description`, nên dòng "Tìm trên internet và trả lời" của đề
9/10 không vào được field mô tả đề; nó chỉ sống trong DSL header và explanation từng câu.


## Tái tạo pipeline

1. Đọc `data/<ngày>.md`, tách stem + 4 lựa chọn. Mỗi nguồn một kiểu: `23-10.md` có marker
   `* 1 điểm` và lựa chọn dính liền; `25-9.md` có nhãn `A./B./C./D.` nhưng thiếu vài nhãn
   (stem "rong bảng..." thiếu chữ T, thiếu `A.`, thiếu `*`); `11-9.md` không nhãn, phải tách
   theo ngữ nghĩa; `9-10.md` đã xuống dòng chuẩn (5 dòng/câu). Loại footer Google Form
   ("Trang 2 trong tổng số 2", "Báo cáo Google Biểu mẫu", email, "Chuyển đổi tài khoản"...).
2. Viết DSL `[GROUP: <tên>]`, đáp án đánh dấu bằng `*` trước chữ cái.
3. `hqt quiz upsert <dsl> --class-id <id> --title <tên> --duration unlimited --max-attempts unlimited --visibility public`
   → `quiz config --publish` → `quiz config --total-points <N>` → `quiz tag --add`.
   Hai lỗi cần né: upsert đặt **tên đề theo tên file** chứ không theo `[GROUP:]` (bắt buộc
   truyền `--title`), và **không cộng** points của từng câu vào `total_points`.
4. Verify: `config --show` (limits, total_points, published) + pull ngược về rồi so từng ký tự
   với file nguồn, kiểm tra không trùng câu giữa các đề. Push lại phải idempotent
   (0 insert, 0 delete, `question_id` giữ nguyên).
