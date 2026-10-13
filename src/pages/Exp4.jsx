import { useMemo } from "react";
import { useReport } from "../store/ReportContext";
import { EXPERIMENTS } from "../lib/experimentsMeta";
import { eqText, fmt, linReg, mean, sd, toNum } from "../lib/stats";
import { BigText, DescBlock, NumInput, RegLine, SectionCard } from "../components/ui";
import { Exp4Chart } from "../components/charts";

const meta = EXPERIMENTS[3];
const GROUPS = [
  { bx: "g1bx", w: "g1w", label: "Nhóm 1" },
  { bx: "g2bx", w: "g2w", label: "Nhóm 2" },
  { bx: "g3bx", w: "g3w", label: "Nhóm 3" },
];

// ---------------------------------------------------------------------------
// Điểm (t, giá trị) hợp lệ, sắp theo thời gian
// ---------------------------------------------------------------------------
function pts(rows, key) {
  return (rows || [])
    .map((r) => ({ t: toNum(r.t), v: toNum(r[key]) }))
    .filter((p) => !Number.isNaN(p.t) && !Number.isNaN(p.v))
    .sort((a, b) => a.t - b.t);
}

// Dòng có đủ t + °Bx + khối lượng (để kiểm tra bảo toàn chất khô)
function paired(rows, g) {
  return (rows || [])
    .map((r) => ({ t: toNum(r.t), bx: toNum(r[g.bx]), w: toNum(r[g.w]) }))
    .filter((p) => !Number.isNaN(p.t) && !Number.isNaN(p.bx) && !Number.isNaN(p.w) && p.w > 0)
    .sort((a, b) => a.t - b.t);
}

function groupInfo(rows, g) {
  const pbx = pts(rows, g.bx);
  const pw = pts(rows, g.w);
  const pr = paired(rows, g);
  const ts = (rows || []).map((r) => r.t);
  const regBx = linReg(ts, (rows || []).map((r) => r[g.bx]));
  const regW = linReg(ts, (rows || []).map((r) => r[g.w]));
  const info = { g, pbx, pw, pr, regBx, regW, nBx: pbx.length, nW: pw.length };
  if (pbx.length >= 1) {
    info.bx0 = pbx[0].v;
    info.bxE = pbx[pbx.length - 1].v;
    info.tBx0 = pbx[0].t;
    info.tBxE = pbx[pbx.length - 1].t;
    info.dBx = info.bxE - info.bx0;
  }
  if (pw.length >= 1) {
    info.w0 = pw[0].v;
    info.wE = pw[pw.length - 1].v;
    info.tW0 = pw[0].t;
    info.tWE = pw[pw.length - 1].t;
    info.dW = info.wE - info.w0;
    info.pctLoss = info.w0 > 0 ? ((info.w0 - info.wE) / info.w0) * 100 : NaN;
  }
  // Kiểm tra bảo toàn chất khô: Bx_cuối kỳ vọng ≈ Bx_đầu × W_đầu / W_cuối
  if (pr.length >= 2) {
    const a = pr[0];
    const b = pr[pr.length - 1];
    info.bxExp = (a.bx * a.w) / b.w;
    info.bxChenh = b.bx - info.bxExp;
    info.bxChenhPct = info.bxExp !== 0 ? (info.bxChenh / Math.abs(info.bxExp)) * 100 : NaN;
  }
  return info;
}

function danhGiaR2(r2) {
  if (r2 === null || r2 === undefined || Number.isNaN(r2)) return "chưa đủ số liệu";
  if (r2 >= 0.95) return "tuyến tính rất tốt (R² ≥ 0,95)";
  if (r2 >= 0.9) return "tuyến tính tốt (R² 0,90–0,95)";
  if (r2 >= 0.8) return "tuyến tính trung bình (R² 0,80–0,90)";
  return "kém tuyến tính (R² < 0,80)";
}

// ---------------------------------------------------------------------------
// 4.3 — Nhận xét thống kê suy luận (hồi quy + so sánh 3 nhóm + bảo toàn chất khô)
// ---------------------------------------------------------------------------
function sinhNhanXet43(exp) {
  const infos = GROUPS.map((g) => groupInfo(exp.rows, g));
  const coLieu = infos.some((i) => i.nBx >= 2 || i.nW >= 2);
  if (!coLieu)
    return "Chưa đủ số liệu bảng 4.1 (mỗi nhóm cần ít nhất 2 mốc thời gian có °Bx và khối lượng) nên chưa thể nhận xét suy luận. Hãy nhập thêm các mốc thời gian — phương trình hồi quy và R² ở trên sẽ tự tính.";

  const out = [];

  // 1. Phương trình + R² từng nhóm
  infos.forEach((info) => {
    const bits = [];
    if (info.regBx) bits.push(`°Bx = ${fmt(info.regBx.a, 4)}·t ${info.regBx.b >= 0 ? "+" : "−"} ${fmt(Math.abs(info.regBx.b), 4)} (R² = ${fmt(info.regBx.r2, 4)}, n = ${info.regBx.n})`);
    if (info.regW) bits.push(`W = ${fmt(info.regW.a, 4)}·t ${info.regW.b >= 0 ? "+" : "−"} ${fmt(Math.abs(info.regW.b), 4)} (R² = ${fmt(info.regW.r2, 4)}, n = ${info.regW.n})`);
    if (bits.length) {
      let c = `${info.g.label}: ${bits.join("; ")}. `;
      if (info.regBx) c += `Độ dốc °Bx ${fmt(info.regBx.a, 4)} °Bx/phút nghĩa là mỗi phút °Bx tăng thêm khoảng ${fmt(Math.abs(info.regBx.a), 3)} đơn vị — ${danhGiaR2(info.regBx.r2)}. `;
      if (info.regW) c += `Tốc độ bay hơi ${fmt(Math.abs(info.regW.a), 2)} g/phút — ${danhGiaR2(info.regW.r2)}.`;
      out.push("• " + c);
    }
  });

  // 2. So sánh độ dốc giữa 3 nhóm (độ lặp lại)
  const slopes = infos.filter((i) => i.regBx).map((i) => i.regBx.a);
  if (slopes.length >= 2) {
    const m = mean(slopes);
    const s = sd(slopes);
    const cv = m !== 0 ? (s / Math.abs(m)) * 100 : NaN;
    let c = `Độ dốc °Bx 3 nhóm: ${slopes.map((v) => fmt(v, 4)).join(", ")} (TB ${fmt(m, 4)} ± ${fmt(s, 4)}, CV = ${fmt(cv, 1)}%). `;
    if (!Number.isNaN(cv)) {
      if (cv < 10) c += "Độ dốc đồng đều (CV < 10%) — 3 nhóm lặp lại tốt, tốc độ cô đặc nhất quán.";
      else if (cv < 25) c += "Độ dốc chênh vừa phải (CV 10–25%) — có thể do lửa/gió, diện tích bay hơi hoặc khối lượng đầu khác nhau.";
      else c += "Độ dốc chênh lớn (CV > 25%) — kiểm tra lại điều kiện đun (công suất bếp, khuấy, bọt trào) giữa các mẻ.";
    }
    out.push("• " + c);
  }

  // 3. Kiểm tra bảo toàn chất khô
  const kt = infos.filter((i) => i.pr.length >= 2);
  if (kt.length) {
    let c = kt
      .map((i) => `${i.g.label}: Bx cuối đo ${fmt(i.pr[i.pr.length - 1].bx)} vs kỳ vọng bảo toàn chất khô ${fmt(i.bxExp)} (chênh ${i.bxChenh >= 0 ? "+" : ""}${fmt(i.bxChenh)} ≈ ${fmt(i.bxChenhPct, 1)}%)`)
      .join("; ");
    const maxChenh = Math.max(...kt.map((i) => Math.abs(i.bxChenhPct)));
    c += ". ";
    if (maxChenh <= 5) c += "Chênh ≤ 5% — chất khô gần như bảo toàn, hao đường/caramel không đáng kể, số liệu cân–đo nhất quán.";
    else if (maxChenh <= 12) c += "Chênh 5–12% — có tổn thất nhẹ (đường bám thành nồi, bọt trào, sai số khúc xạ kế khi mẫu nóng) nhưng chấp nhận được.";
    else c += "Chênh > 12% — bất thường: kiểm tra lại cân (trừ bì), đo °Bx ở 20 °C (mẫu nóng đọc sai), hoặc mẻ bị trào/caramel hóa mạnh.";
    out.push("• " + c);
  }

  out.push("• Ý nghĩa suy luận: R² càng gần 1 thì mô hình tuyến tính càng giải thích tốt quá trình; dùng phương trình trên có thể dự đoán thời gian cần để đạt °Bx mục tiêu (ví dụ t ≈ (60 − b)/a) thay vì đo dò từng phút.");
  return out.join("\n");
}

// ---------------------------------------------------------------------------
// 4.5 — Nhận xét đồ thị time – °Bx
// ---------------------------------------------------------------------------
function sinhNhanXet45(exp) {
  const infos = GROUPS.map((g) => groupInfo(exp.rows, g)).filter((i) => i.nBx >= 1);
  if (!infos.length) return "Chưa có số liệu °Bx theo thời gian nên chưa thể nhận xét đồ thị. Hãy nhập °Bx các mốc thời gian ở bảng 4.1.";

  const out = [];
  infos.forEach((i) => {
    let c = `${i.g.label}: °Bx từ ${fmt(i.bx0)} (phút ${fmt(i.tBx0, 0)}) lên ${fmt(i.bxE)} (phút ${fmt(i.tBxE, 0)}), tăng ${fmt(i.dBx)} đơn vị. `;
    if (i.regBx) c += `Đường hồi quy dốc ${fmt(i.regBx.a, 4)} °Bx/phút, ${danhGiaR2(i.regBx.r2)}. `;
    if (i.bxE < 60) c += `Chưa đạt syrup mục tiêu 60–65 °Bx — cần cô tiếp (ước tính thêm khoảng ${i.regBx && i.regBx.a > 0 ? fmt((60 - i.bxE) / i.regBx.a, 0) : "—"} phút nữa mới tới 60 °Bx).`;
    else if (i.bxE <= 65) c += "Đã vào khoảng syrup mục tiêu 60–65 °Bx — dừng đúng lúc, tránh đun thêm gây sẫm màu.";
    else c += "Vượt 65 °Bx — hơi quá, dễ caramen hóa và khó kết tinh ở bài 5; lần sau dừng sớm hơn.";
    out.push("• " + c);
  });
  out.push("• Dạng đồ thị: °Bx tăng dần theo thời gian do nước bay hơi làm chất khô đặc lại; đoạn đầu thường tăng chậm (gia nhiệt), đoạn giữa tăng đều, cuối tăng nhanh — nếu R² thấp là do cong ở hai đầu, có thể tách hồi quy theo giai đoạn.");
  return out.join("\n");
}

// ---------------------------------------------------------------------------
// 4.7 — Nhận xét đồ thị time – weight
// ---------------------------------------------------------------------------
function sinhNhanXet47(exp) {
  const infos = GROUPS.map((g) => groupInfo(exp.rows, g)).filter((i) => i.nW >= 1);
  if (!infos.length) return "Chưa có số liệu khối lượng theo thời gian nên chưa thể nhận xét đồ thị. Hãy nhập khối lượng các mốc thời gian ở bảng 4.1.";

  const out = [];
  infos.forEach((i) => {
    let c = `${i.g.label}: khối lượng từ ${fmt(i.w0, 1)} g (phút ${fmt(i.tW0, 0)}) xuống ${fmt(i.wE, 1)} g (phút ${fmt(i.tWE, 0)}), hao hụt ${fmt(i.w0 - i.wE, 1)} g tương ứng mất ${fmt(i.pctLoss, 1)}% (chủ yếu là nước bay hơi). `;
    if (i.regW) c += `Tốc độ giảm ${fmt(Math.abs(i.regW.a), 2)} g/phút, ${danhGiaR2(i.regW.r2)}.`;
    out.push("• " + c);
  });
  out.push("• Dạng đồ thị: khối lượng giảm dần theo thời gian, đối xứng với đồ thị °Bx tăng — khối lượng giảm càng nhanh thì °Bx tăng càng nhanh; tổng hao hụt 80–85% khối lượng đầu là bình thường khi đi từ ~16 °Bx lên ~60 °Bx.");
  return out.join("\n");
}

// ---------------------------------------------------------------------------
function HopNhanXetTuDong({ text, onApply, applied }) {
  if (!text) return null;
  return (
    <div className="auto-box">
      <div className="auto-box-head">
        <b>🤖 Nhận xét tự động từ số liệu</b>
        <span className="hint tiny">Xem trước — bấm nút để chép xuống ô báo cáo (vẫn sửa tay được).</span>
      </div>
      <pre className="auto-text">{text}</pre>
      <div className="io-row wrap">
        <button className="btn secondary sm" onClick={onApply}>✨ Dùng nhận xét tự động</button>
        <button className="btn ghost sm" onClick={() => navigator.clipboard?.writeText(text)}>Sao chép</button>
        {applied && <span className="hint tiny">✓ Đã chép xuống ô báo cáo — bạn có thể chỉnh lại câu chữ.</span>}
      </div>
    </div>
  );
}

export default function Exp4({ mode }) {
  const { report, update } = useReport();
  const exp = report.exp4;
  const mobile = mode === "mobile";
  const setCell = (i, k, v) => update(["exp4", "rows", i, k], v);

  const ts = exp.rows.map((r) => r.t);
  const regBx = GROUPS.map((g) => linReg(ts, exp.rows.map((r) => r[g.bx])));
  const regW = GROUPS.map((g) => linReg(ts, exp.rows.map((r) => r[g.w])));

  const auto43 = useMemo(() => sinhNhanXet43(exp), [exp]);
  const auto45 = useMemo(() => sinhNhanXet45(exp), [exp]);
  const auto47 = useMemo(() => sinhNhanXet47(exp), [exp]);

  const addRow = () => update(["exp4", "rows"], [...exp.rows, { t: "", g1bx: "", g1w: "", g2bx: "", g2w: "", g3bx: "", g3w: "" }]);
  const delRow = (i) => {
    if (exp.rows.length <= 1) return;
    update(["exp4", "rows"], exp.rows.filter((_, j) => j !== i));
  };

  return (
    <div className="exp">
      <h2>{meta.title}</h2>
      <DescBlock text={meta.intro} />

      <SectionCard
        title="4.1 — °Bx và khối lượng syrup trong quá trình cô đặc"
        hint="Nước mía sau làm trong ~15–17 °Bx, cô tới 60–65 °Bx. Khối lượng đầu chính là dòng phút 0 (chưa cô đặc) — nhập trực tiếp vào cột Khối lượng ở dòng đầu, không cần ô riêng. Thêm/bớt dòng thời gian tùy buổi làm."
      >
        {!mobile ? (
          <div className="table-wrap">
            <table className="dt">
              <thead>
                <tr>
                  <th rowSpan={2}>Thời gian (phút)</th>
                  {GROUPS.map((g) => <th key={g.label} colSpan={2}>{g.label}</th>)}
                  <th rowSpan={2}></th>
                </tr>
                <tr>
                  {GROUPS.map((g) => [<th key={g.bx}>°Bx</th>, <th key={g.w}>Khối lượng (g)</th>])}
                </tr>
              </thead>
              <tbody>
                {exp.rows.map((r, i) => (
                  <tr key={i}>
                    <td><NumInput value={r.t} ariaLabel="thời gian" onChange={(v) => setCell(i, "t", v)} /></td>
                    {GROUPS.map((g) => [
                      <td key={g.bx}><NumInput value={r[g.bx]} ariaLabel={`${g.label} Bx`} onChange={(v) => setCell(i, g.bx, v)} /></td>,
                      <td key={g.w}><NumInput value={r[g.w]} ariaLabel={`${g.label} khối lượng`} onChange={(v) => setCell(i, g.w, v)} /></td>,
                    ])}
                    <td><button className="btn danger sm" onClick={() => delRow(i)}>×</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="m-cards">
            {exp.rows.map((r, i) => (
              <div className="m-card" key={i}>
                <div className="m-card-head">
                  <label className="m-row2">Phút thứ <NumInput value={r.t} ariaLabel="thời gian" onChange={(v) => setCell(i, "t", v)} /></label>
                  <button className="btn danger sm" onClick={() => delRow(i)}>Xóa</button>
                </div>
                {GROUPS.map((g) => (
                  <div className="m-grid2" key={g.label}>
                    <b>{g.label}</b>
                    <label>°Bx<NumInput value={r[g.bx]} ariaLabel="bx" onChange={(v) => setCell(i, g.bx, v)} /></label>
                    <label>g<NumInput value={r[g.w]} ariaLabel="khối lượng" onChange={(v) => setCell(i, g.w, v)} /></label>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        <button className="btn secondary" onClick={addRow}>+ Thêm mốc thời gian</button>
        <div className="regs">
          {regBx.map((r, i) => <RegLine key={i} label={`${GROUPS[i].label}: thời gian–°Bx`} eq={eqText(r, "t")} />)}
          {regW.map((r, i) => <RegLine key={i} label={`${GROUPS[i].label}: thời gian–khối lượng`} eq={eqText(r, "t")} />)}
        </div>
      </SectionCard>

      <SectionCard title="4.2 — Phương trình tương quan thời gian – °Bx / khối lượng">
        {[["eq1", "Lần 1"], ["eq2", "Lần 2"], ["eq3", "Lần 3"]].map(([k, label]) => (
          <label className="stack" key={k}>{label}
            <BigText rows={2} value={exp[k]} onChange={(v) => update(["exp4", k], v)}
              placeholder={`VD: °Bx = …·t + … (R² = …); W = …·t + … (R² = …)`} />
          </label>
        ))}
      </SectionCard>

      <SectionCard
        title="4.3 — Nhận xét (thống kê suy luận)"
        hint="App đọc sẵn phương trình hồi quy, R², độ dốc 3 nhóm và kiểm tra bảo toàn chất khô (Bx cuối kỳ vọng ≈ Bx đầu × W đầu / W cuối)."
      >
        <HopNhanXetTuDong
          text={auto43}
          applied={exp.comment43 === auto43 && auto43.length > 0}
          onApply={() => update(["exp4", "comment43"], auto43)}
        />
        <BigText rows={6} value={exp.comment43} onChange={(v) => update(["exp4", "comment43"], v)}
          placeholder="Nhận xét tự động ở trên gợi ý sẵn: độ dốc, R², so sánh 3 nhóm, kiểm tra bảo toàn chất khô…" />
      </SectionCard>

      <SectionCard title="4.4 — Đồ thị thời gian – °Bx">
        <Exp4Chart rows={exp.rows} mode="bx" height={mobile ? 260 : 320} />
      </SectionCard>

      <SectionCard
        title="4.5 — Nhận xét đồ thị thời gian – °Bx"
        hint="App mô tả sẵn xu hướng, tốc độ tăng °Bx/phút và đối chiếu mục tiêu syrup 60–65 °Bx."
      >
        <HopNhanXetTuDong
          text={auto45}
          applied={exp.comment45 === auto45 && auto45.length > 0}
          onApply={() => update(["exp4", "comment45"], auto45)}
        />
        <BigText rows={4} value={exp.comment45} onChange={(v) => update(["exp4", "comment45"], v)}
          placeholder="VD: °Bx tăng dần theo thời gian, đạt/không đạt 60–65 °Bx, cần cô thêm bao lâu…" />
      </SectionCard>

      <SectionCard title="4.6 — Đồ thị thời gian – weight">
        <Exp4Chart rows={exp.rows} mode="weight" height={mobile ? 260 : 320} />
      </SectionCard>

      <SectionCard
        title="4.7 — Nhận xét đồ thị thời gian – khối lượng"
        hint="App mô tả sẵn mức hao hụt, tốc độ bay hơi g/phút và mối liên hệ với đồ thị °Bx."
      >
        <HopNhanXetTuDong
          text={auto47}
          applied={exp.comment47 === auto47 && auto47.length > 0}
          onApply={() => update(["exp4", "comment47"], auto47)}
        />
        <BigText rows={4} value={exp.comment47} onChange={(v) => update(["exp4", "comment47"], v)}
          placeholder="VD: Khối lượng giảm dần, hao hụt …%, tốc độ bay hơi … g/phút, khớp với đà tăng °Bx…" />
      </SectionCard>
    </div>
  );
}
