import { Link } from "react-router-dom";
import guideSource from "../../m_t_th_nghi_m_th_c_h_nh_c_ng_ngh_m_a_ng_6_b_i.md?raw";

const guide = JSON.parse(guideSource);

const procedures = [
  [
    "Chuẩn bị và phân loại mẫu mía; làm sạch bụi bẩn, rễ và lá khô.",
    "Đo kích thước, cân khối lượng mẫu; lấy mẫu dịch ở phần ngọn, thân và gốc để đánh giá độ chín.",
    "Ép lấy nước mía, lọc qua vải mịn để loại bỏ vụn bã cơ học.",
    "Đo độ Brix của nước mía bằng khúc xạ kế; làm trong mẫu theo quy trình phòng thí nghiệm để đo độ Pol bằng phân cực kế.",
    "Tính độ tinh khiết biểu kiến, hệ số chín và CCS; dùng kết quả để nhận xét khả năng thu hồi đường.",
  ],
  [
    "Chặt hoặc xé mía thành đoạn nhỏ để phá vỡ mô và giải phóng dịch bào.",
    "Đưa mía qua hệ thống trục ép; nếu thực hiện ép thẩm thấu, phun đều nước ấm 50–60 °C lên bã giữa các lần ép theo hướng dẫn của giảng viên.",
    "Thu gom toàn bộ nước mía hỗn hợp và bã mía sau ép vào các dụng cụ riêng.",
    "Cân khối lượng mía, nước mía, bã và lượng nước thẩm thấu bổ sung; lấy mẫu đo Pol của mía, nước mía và bã.",
    "Tính tỷ lệ trích ly nước mía và hiệu suất ép theo lượng đường thu hồi cũng như lượng đường còn mất theo bã.",
  ],
  [
    "Đo và ghi nhận pH, Brix, Pol của nước mía hỗn hợp trước làm sạch.",
    "Gia nhiệt sơ bộ nước mía đến 55–60 °C.",
    "Châm từ từ sữa vôi Ca(OH)₂ 10–12 °Bé, theo dõi đến pH 7,0–7,2.",
    "Gia nhiệt nhanh hỗn hợp đến 100–105 °C để hỗ trợ kết tủa tạp chất.",
    "Chuyển hỗn hợp sang ống lắng có chất trợ lắng; gạn lấy nước chè trong và lọc phần bùn.",
    "Đo các chỉ tiêu của nước chè trong, cân lượng thu được; tính hiệu quả làm sạch, loại bỏ chất không đường và thu hồi saccharose.",
  ],
  [
    "Cân lượng nước chè trong nạp vào nồi; đo và ghi Brix ban đầu.",
    "Cô đặc bằng nồi chân không hoặc nồi có cánh khuấy; duy trì gia nhiệt đều và kiểm soát áp suất, hạn chế caramel hóa.",
    "Lấy mẫu định kỳ theo các mốc thời gian; ghi Brix, pH và nhiệt độ sôi của dung dịch.",
    "Dừng gia nhiệt khi mật chè đạt 60–65 °Brix; cân khối lượng mật chè thu được.",
    "Tính lượng nước bốc hơi lý thuyết, tỷ số cô đặc và hiệu suất bảo toàn chất khô hòa tan.",
  ],
  [
    "Nạp mật chè sau cô đặc vào nồi nấu; gia nhiệt trong điều kiện chân không để đưa dung dịch vào vùng quá bão hòa.",
    "Quan sát hiện tượng kết sợi của giọt mật chè để theo dõi trạng thái dung dịch.",
    "Bổ sung mầm tinh thể đường theo hướng dẫn, bảo đảm lượng và kích thước mầm phù hợp.",
    "Sau khi gây mầm, cấp thêm siro từng đợt với tốc độ ổn định; điều chỉnh chân không và nhiệt độ để tinh thể lớn lên, hạn chế tạo mầm dại.",
    "Ghi các chỉ tiêu mật chè và đường non; tính hệ số quá bão hòa, tỷ lệ tinh thể hóa và hiệu suất kết tinh theo số liệu thực đo.",
  ],
  [
    "Để đường non nguội và bồi tinh để tinh thể tiếp tục hình thành.",
    "Nạp đường non vào máy ly tâm có lồng lưới; quay để tách mật cái khỏi tinh thể đường.",
    "Rửa nhẹ lớp đường bằng tia nước nóng hoặc hơi nước sạch để loại bỏ màng mật bám ngoài tinh thể.",
    "Thu đường và sấy đến độ ẩm theo tài liệu (W ≤ 0,05%); cân khối lượng đường thành phẩm.",
    "Đo Pol, độ ẩm và độ màu ICUMSA; ghi độ tinh khiết mật chè ban đầu và mật rỉ.",
    "Tính hiệu suất ly tâm, hiệu suất S–J–M và hiệu suất thu hồi toàn bộ quy trình.",
  ],
];

export default function GuidePage() {
  const goToLesson = (lessonNo) => {
    document.getElementById(`guide-lesson-${lessonNo}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="guide-page">
      <header className="guide-topbar">
        <Link className="guide-brand" to="/" aria-label="Về trang sổ thực hành">
          <span className="brand-icon">◈</span>
          <span>Sổ thực hành</span>
        </Link>
        <Link className="btn secondary sm" to="/">Mở sổ thực hành</Link>
      </header>

      <main className="guide-main">
        <section className="guide-hero">
          <span className="guide-eyebrow">HƯỚNG DẪN THỰC HÀNH · 6 BÀI</span>
          <h1>{guide.mon_hoc}</h1>
          <p>{guide.noi_dung_video}. Các bước dưới đây được trình bày theo thứ tự thao tác trong từng bài.</p>
          <nav className="guide-lesson-nav" aria-label="Chọn bài thực hành">
            {guide.danh_sach_bai_thi_nghiem.map((lesson) => (
              <button key={lesson.bai_so} type="button" onClick={() => goToLesson(lesson.bai_so)}>
                Bài {lesson.bai_so}
              </button>
            ))}
          </nav>
        </section>

        <div className="guide-lessons">
          {guide.danh_sach_bai_thi_nghiem.map((lesson, index) => (
            <article className="guide-lesson" id={`guide-lesson-${lesson.bai_so}`} key={lesson.bai_so}>
              <header className="guide-lesson-head">
                <span className="guide-lesson-number">BÀI {lesson.bai_so}</span>
                <h2>{lesson.ten_bai}</h2>
                <p>{lesson.mo_ta_thi_nghiem}</p>
              </header>

              <section className="guide-section">
                <h3>Trình tự thực hiện</h3>
                <ol className="guide-steps">
                  {procedures[index].map((step, stepIndex) => (
                    <li key={step}>
                      <span className="guide-step-number">{stepIndex + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                {lesson.bai_so === 1 && (
                  <p className="guide-safety">
                    Lưu ý: chì acetate độc. Chỉ làm trong phòng thí nghiệm, theo quy trình và hướng dẫn của giảng viên; thu gom chất thải đúng quy định.
                  </p>
                )}
              </section>

              <section className="guide-section">
                <h3>Thông số cần ghi</h3>
                <ul className="guide-parameters">
                  {lesson.thong_so_thuc_nghiem.map((parameter) => <li key={parameter}>{parameter}</li>)}
                </ul>
              </section>

              <section className="guide-section">
                <h3>Công thức tính</h3>
                <div className="guide-formulas">
                  {lesson.cong_thuc_tinh_toan.map((formula) => (
                    <div className="guide-formula" key={formula.ky_hieu}>
                      <div>
                        <strong>{formula.ten_chi_tieu}</strong>
                        <span>{formula.ky_hieu}</span>
                      </div>
                      <code>{formula.cong_thuc}</code>
                      <p>{formula.giai_thich}</p>
                    </div>
                  ))}
                </div>
              </section>
            </article>
          ))}
        </div>

        <footer className="guide-footer">
          <p>Thực hiện theo quy trình an toàn và chỉ dẫn của giảng viên phụ trách.</p>
          <Link className="btn primary" to="/">Mở sổ thực hành</Link>
        </footer>
      </main>
    </div>
  );
}
