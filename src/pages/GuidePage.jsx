import { Link } from "react-router-dom";
import guideSource from "../../m_t_th_nghi_m_th_c_h_nh_c_ng_ngh_m_a_ng_6_b_i.md?raw";

const guide = JSON.parse(guideSource);

const procedures = [
  [
    "Pha các dung dịch đường chuẩn ở những nồng độ khác nhau hoặc chuẩn bị các mẫu đường đã biết nồng độ.",
    "Chọn khúc xạ kế có thang đo phù hợp với mẫu: loại 0–35 °Bx cho dung dịch loãng hoặc thang kép 0–50 / 50–90 °Bx cho mẫu đặc.",
    "Rửa lăng kính bằng nước cất, thấm khô bằng giấy mềm; nhỏ một giọt mẫu lên lăng kính và đậy nắp, tránh tạo bọt khí.",
    "Quan sát qua thị kính, đọc giá trị tại đường phân cách sáng – tối; không tự ý vặn trục làm lệch thang đo chuẩn.",
    "Ghi nồng độ chuẩn và °Bx đo được, lập đồ thị tương quan nồng độ (%) – °Bx và đánh giá sai số đo.",
  ],
  [
    "Chuẩn bị 3 mẫu mía, mỗi mẫu khoảng 1.000 g; ghi khối lượng thực tế. Rửa sạch bề mặt và lau khô, không chặt vụn.",
    "Ép từng mẫu lần 1; thu riêng nước mía ép 1 và bã mía 1, sau đó cân các phần.",
    "Cân lượng nước sạch bằng khối lượng bã mía 1 (tỷ lệ nước : bã = 1 : 1); rưới đều lên bã và để thẩm thấu 30 phút.",
    "Ép bã lần 2; thu riêng nước mía ép 2 và bã ép 2, rồi cân khối lượng.",
    "Với nước mía ép 1, ghi khối lượng, Brix, pH (tham khảo 5,5–5,8) và đánh giá màu sắc, mùi, vị, độ đục, độ đồng nhất.",
    "Với nước mía ép 2, ghi khối lượng, Brix và pH; tính tỷ lệ thu hồi và chuẩn hóa theo Brix tiêu chuẩn 15 °Bx.",
  ],
  [
    "Gộp nước mía từ các lần ép của Bài 2, cân tổng khối lượng dung dịch thô.",
    "Tính lượng nước vôi trong Ca(OH)₂ theo tỷ lệ nhóm: Nhóm 1 dùng 10%, Nhóm 2 dùng 15%, Nhóm 3 dùng 18% so với khối lượng nước mía.",
    "Bổ sung nước vôi, khuấy đều và để yên 45–60 phút để trung hòa axit, tạo kết tủa và lắng cặn.",
    "Cân vải lọc khô trước khi lọc; lọc hỗn hợp qua vải.",
    "Cân lại vải có bùn ẩm và cân dung dịch nước mía trong sau lọc.",
    "Đo Brix và pH trước/sau làm sạch; tính khối lượng bùn, tỷ lệ bùn và tỷ lệ thu hồi dịch trong.",
  ],
  [
    "Cân nồi sạch, rỗng trước khi gia nhiệt để có thể cân nhanh cả nồi trong quá trình cô đặc.",
    "Cho toàn bộ nước mía trong sau lọc vào nồi; ghi khối lượng và Brix ban đầu.",
    "Gia nhiệt đến khi dịch sôi bùng lên; lấy thời điểm này làm mốc 0 phút.",
    "Khuấy liên tục từ đáy nồi để tránh cháy khét; định kỳ cân nồi và lấy một giọt mẫu đo Brix. Rút ngắn khoảng thời gian lấy mẫu khi dịch bắt đầu sánh.",
    "Kết thúc khi dịch đạt 60–65 °Bx; ghi thời gian, khối lượng dịch cuối và tính lượng nước bay hơi, tỷ lệ bốc hơi.",
  ],
  [
    "Tiếp tục ngay sau khi cô đặc, khi dịch đường 60–65 °Bx còn nóng trên bếp; cân chính xác 10 g đường cát trắng làm mầm.",
    "Dùng rây rải mầm từ từ và đều lên dịch đường; không đổ dồn một chỗ để tránh vón cục.",
    "Giữ sôi lăn tăn, hạ nhỏ lửa và khuấy liên tục để đường kết tinh bám lên mầm, đồng thời tránh khét cục bộ.",
    "Khi dung dịch quánh đặc và cạn dung môi tự do, tắt bếp; nhanh chóng đổ ra khay hoặc khuôn phẳng.",
    "Để nguội cho kết tinh đông đặc; ghi thời gian kết tinh và cân sản phẩm đường thô để tính hiệu suất thu hồi.",
  ],
  [
    "Chuẩn bị nguyên liệu theo công thức kẹo dẻo: ngâm gelatin với nước trái cây hoặc sữa 15–30 phút cho nở.",
    "Đun đường với nước đến 110 °C rồi nhấc khỏi bếp; thêm gelatin đã nở và nước cốt chanh/tắc, khuấy nhẹ một chiều cho tan.",
    "Rót kẹo dẻo vào khuôn silicone; để đông ở nhiệt độ phòng 2–4 giờ, không làm lạnh đột ngột.",
    "Rang 50 g đậu phộng đến thơm, bóc vỏ lụa. Nấu đường, nước, muối và nước cốt chanh 15–20 phút đến khoảng 90 °Bx.",
    "Trộn nhanh đậu phộng rang vào siro, đổ lên khay có giấy chống dính, cán phẳng; để nguội khoảng 1 giờ rồi cắt.",
    "Cân thành phẩm mỗi loại và tính hiệu suất thu hồi so với tổng khối lượng nguyên liệu đầu vào.",
  ],
];

function FormulaTokens({ expression, isEquation }) {
  const tokens = expression.match(/\s+|(?:\p{L}[\p{L}\p{N}]*|%)(?:_[\p{L}\p{N}]+)*(?:_\([^)]*\))?|\d+(?:\.\d+)?%?|<=|>=|./gu) || [];
  return (
    <>
      {tokens.map((token, index) => {
        if (/^\s+$/.test(token)) return token;
        if (/^[A-Za-z%]/.test(token)) {
          const groupedSubscript = token.match(/^(.+)_\((.+)\)$/);
          const symbolAndSubscripts = groupedSubscript ? groupedSubscript[1] : token;
          const [symbol, ...subscripts] = symbolAndSubscripts.split("_");
          return (
            <span className="guide-equation-token" key={`${token}-${index}`}>
              {symbol}
              {subscripts.length > 0 && <sub>{subscripts.join("")}</sub>}
              {groupedSubscript && (
                <sub>
                  (
                  <FormulaTokens expression={groupedSubscript[2]} isEquation={isEquation} />
                  )
                </sub>
              )}
            </span>
          );
        }
        const operator = {
          "*": "×",
          "/": isEquation ? "÷" : "/",
          "<=": "≤",
          ">=": "≥",
        }[token] || token;
        return <span className="guide-equation-token" key={`${token}-${index}`}>{operator}</span>;
      })}
    </>
  );
}

function FormulaExpression({ expression }) {
  const isEquation = expression.includes("=");
  return (
    <div className="guide-equation" aria-label={expression}>
      <FormulaTokens expression={expression} isEquation={isEquation} />
    </div>
  );
}

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
          <h1>{guide.mon_thuc_hanh}</h1>
          <p>Các bước thực hiện, chỉ tiêu cần ghi và công thức tính cho từng bài thực hành.</p>
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
                <p>{lesson.mo_ta_tien_hanh}</p>
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
                  {lesson.cac_chi_tieu_do.map((parameter) => <li key={parameter}>{parameter}</li>)}
                </ul>
              </section>

              <section className="guide-section">
                <h3>Công thức tính</h3>
                <p className="guide-formula-note">Công thức được giữ ở dạng tổng quát; các ký hiệu chỉ số dưới giúp phân biệt từng đại lượng.</p>
                <div className="guide-formulas">
                  {lesson.cong_thuc_tinh_toan.map((formula) => (
                    <div className="guide-formula" key={formula.ten_cong_thuc}>
                      <div className="guide-formula-title">
                        <strong>{formula.ten_cong_thuc}</strong>
                      </div>
                      <FormulaExpression expression={formula.bieu_thuc} />
                      <p>{formula.y_nghia}</p>
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
