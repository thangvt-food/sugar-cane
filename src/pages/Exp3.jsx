import { useMemo } from "react";
import { useReport } from "../store/ReportContext";
import { fmt, toNum } from "../lib/stats";
import { EXP3_AUTO_PARAMS, EXP3_DOSES, exp3AutoValue, exp3EffectiveRows, limeGrams } from "../lib/formulas";
import { AutoTag, BigText, DescBlock, NumInput, SectionCard } from "../components/ui";

// ---------------------------------------------------------------------------
// Việt hóa (giữ key tiếng Anh trong store để không mất số liệu cũ).
// Số liều vôi, công thức bùn % và dòng dịch sau lọc theo hướng dẫn thực hành;
// công thức tính nằm ở src/lib/formulas.js (trang này và bảng Excel dùng chung).
// Phiếu ghi "(0–10 marks in the turbidity)" nhưng bảng in thiếu hàng này,
// app bổ sung hàng "Turbidity" để có cơ sở chấm và so sánh.
// Quy ước: 10 = trong nhất (tốt nhất), 0 = đục nhất.
// ---------------------------------------------------------------------------
const PARAM_VI = {
  "Juice (gr)": "Nước mía (g)",
  "Mud (gr)": "Cặn bùn (g)",
  "Mud (%)": "Tỉ lệ bùn (%)",
  "Clear (gr)": "Nước mía trong sau lọc (g)",
  "Clear (%)": "Hiệu suất dịch trong (%)",
  "°Bx": "Độ Brix (°Bx)",
  "pH": "pH",
  "Turbidity": "Độ trong (0–10)",
};

const PARAMS3 = ["Juice (gr)", "Mud (gr)", "Mud (%)", "Clear (gr)", "Clear (%)", "°Bx", "pH", "Turbidity"];
const AUTO3 = EXP3_AUTO_PARAMS;
const AUTO_HINT = {
  "Mud (%)": "Bùn / (Nước mía + nước vôi) × 100",
  "Clear (%)": "Nước mía trong sau lọc / Nước mía × 100",
};

const COLS = [
  {
    key: "control",
    label: `Đối chứng (${EXP3_DOSES.control}% vôi)`,
    short: "ĐC",
    dose: `${EXP3_DOSES.control}%`,
  },
  ...["g1", "g2", "g3"].map((key, i) => ({
    key,
    label: `Nhóm ${i + 1} (vôi ${EXP3_DOSES[key]}%)`,
    short: `${EXP3_DOSES[key]}%`,
    dose: `${EXP3_DOSES[key]}%`,
  })),
];

const TITLE_VI = "Thí nghiệm 3: Làm trong nước mía để nấu syrup";
const INTRO_VI =
  "Làm trong là khâu loại tạp chất lơ lửng khỏi nước mía trước khi cô đặc thành syrup. " +
  "Gộp toàn bộ nước mía từ bài 2, cân tổng khối lượng rồi bổ sung nước vôi trong Ca(OH)₂ theo liều 10/15/18% (so với khối lượng nước mía) " +
  "cho 3 nhóm, khuấy đều và để yên 45–60 phút cho trung hòa acid, kết tủa và lắng tạp chất. " +
  "Lọc qua vải lọc rồi so sánh lượng bùn, dịch trong thu được, °Bx, pH và độ trong để chọn liều vôi phù hợp.";

const viParam = (en) => PARAM_VI[en] || en;
const viCol = (key) => COLS.find((c) => c.key === key)?.label || key;

// Gộp hàng lưu cũ với danh mục chuẩn (báo cáo cũ chưa có hàng Độ trong hay
// dịch sau lọc vẫn mở được; hàng mới hiện ô trống để nhập thêm).
function mergedRows(stored) {
  const s = stored || [];
  return PARAMS3.map((p) => {
    const f = s.find((r) => r.param === p);
    if (f) return { param: p, control: f.control ?? "", g1: f.g1 ?? "", g2: f.g2 ?? "", g3: f.g3 ?? "" };
    return { param: p, control: "", g1: "", g2: "", g3: "" };
  });
}

function rowByParam(rows, param) {
  return rows.find((x) => x.param === param);
}

// Lý do còn thiếu, hiển thị ngay trong ô tự tính (tính ở src/lib/formulas.js:
// Bùn % = bùn / (nước mía + vôi), Dịch trong % = dịch sau lọc / nước mía thô).
function autoReason(rows, col, param) {
  if (Number.isNaN(toNum(rowByParam(rows, "Juice (gr)")?.[col]))) return "cần cân Nước mía (g)";
  if (param === "Mud (%)" && Number.isNaN(toNum(rowByParam(rows, "Mud (gr)")?.[col]))) return "cần cân Cặn bùn (g)";
  if (param === "Clear (%)" && Number.isNaN(toNum(rowByParam(rows, "Clear (gr)")?.[col])))
    return "cần cân Nước mía trong sau lọc (g)";
  return "";
}

function colData(rows, col) {
  return {
    col,
    juice: toNum(rowByParam(rows, "Juice (gr)")?.[col]),
    mud: toNum(rowByParam(rows, "Mud (gr)")?.[col]),
    mudPct: toNum(rowByParam(rows, "Mud (%)")?.[col]),
    clearG: toNum(rowByParam(rows, "Clear (gr)")?.[col]),
    clearPct: toNum(rowByParam(rows, "Clear (%)")?.[col]),
    bx: toNum(rowByParam(rows, "°Bx")?.[col]),
    ph: toNum(rowByParam(rows, "pH")?.[col]),
    turb: toNum(rowByParam(rows, "Turbidity")?.[col]),
  };
}

// ---------------------------------------------------------------------------
// Nhận xét tự động 3.2: so sánh 4 nghiệm thức theo liều vôi
// ---------------------------------------------------------------------------
function sinhNhanXet32(exp) {
  const rows = exp3EffectiveRows(mergedRows(exp.rows));
  const ds = COLS.map(({ key }) => colData(rows, key));
  const coLieu = ds.some((d) =>
    [d.juice, d.mud, d.mudPct, d.clearG, d.clearPct, d.bx, d.ph, d.turb].some((n) => !Number.isNaN(n))
  );
  if (!coLieu)
    return "Chưa nhập số liệu bảng 3.1 nên chưa thể nhận xét tự động. Hãy cân Nước mía/Cặn bùn/Nước mía trong sau lọc từng cột, đo °Bx/pH và chấm Độ trong (0–10, 10 = trong nhất) — Tỉ lệ bùn (%) và Hiệu suất dịch trong (%) app đã tự tính.";

  const out = [];
  const ctrl = ds[0];
  const lieu = ds.slice(1);

  // 1. Nền mẫu khác nhau → nhấn mạnh so bằng tỉ lệ + lượng vôi thực thêm
  const juices = ds.map((d) => d.juice).filter((n) => !Number.isNaN(n));
  if (juices.length >= 2) {
    const khac = Math.max(...juices) - Math.min(...juices) > 1;
    let c = `Tổng khối lượng nước mía mỗi cột: ${ds.map((d) => `${viCol(d.col)} ${Number.isNaN(d.juice) ? "—" : `${fmt(d.juice, 1)} g`}`).join("; ")}. `;
    c += `Lượng nước vôi đã thêm (liều % × nước mía đúng cột đó): ${ds.map((d) => `${viCol(d.col)} ${Number.isNaN(d.juice) ? "—" : `${fmt(limeGrams(d.juice, EXP3_DOSES[d.col]), 1)} g`}`).join("; ")}. `;
    c += khac
      ? "Các cột không cùng khối lượng mẫu nên mọi so sánh dưới đây dùng tỉ lệ % và chỉ số đo (Bùn %, Dịch trong %, °Bx, pH, điểm độ trong), không so gam tuyệt đối."
      : "Các cột cùng khối lượng mẫu nên so sánh trực tiếp được.";
    out.push("• " + c);
  }

  // 2. Tỉ lệ bùn
  const coBun = ds.filter((d) => !Number.isNaN(d.mudPct));
  if (coBun.length) {
    const sap = [...coBun].sort((a, b) => b.mudPct - a.mudPct);
    let c = `Tỉ lệ bùn (tự tính = Bùn / (Nước mía + nước vôi) × 100): ${ds.map((d) => `${viCol(d.col)} ${Number.isNaN(d.mudPct) ? "—" : `${fmt(d.mudPct)}%`}`).join("; ")}. `;
    c += `Cao nhất ở ${viCol(sap[0].col)} (${fmt(sap[0].mudPct)}%), thấp nhất ở ${viCol(sap[sap.length - 1].col)} (${fmt(sap[sap.length - 1].mudPct)}%). `;
    c += "Bùn nhiều nghĩa là vôi đã kết tủa được nhiều tạp chất (phosphat, protein, chất keo, sáp) — nhưng phải đọc cùng điểm độ trong: bùn nhiều mà nước vẫn đục là kết bông kém, lắng chưa hết.";
    out.push("• " + c);
  } else {
    out.push("• Tỉ lệ bùn: chưa tính được (thiếu cân Nước mía hoặc Cặn bùn) — nhập 2 số này, app sẽ tự tính.");
  }

  // 3. Hiệu suất dịch trong sau lọc
  const coDich = ds.filter((d) => !Number.isNaN(d.clearPct));
  if (coDich.length) {
    const sap = [...coDich].sort((a, b) => b.clearPct - a.clearPct);
    let c = `Hiệu suất dịch trong sau lọc (tự tính = Nước mía trong sau lọc / Nước mía thô × 100): ${ds.map((d) => `${viCol(d.col)} ${Number.isNaN(d.clearPct) ? "—" : `${fmt(d.clearPct)}%`}`).join("; ")}. `;
    c += `Cao nhất ở ${viCol(sap[0].col)} (${fmt(sap[0].clearPct)}%). `;
    c += sap[0].clearPct >= 100
      ? "Thu trên 100% là vô lý (dịch sau lọc không thể nhiều hơn nước mía thô, vì bùn đã bị giữ lại) — kiểm tra lại cách cân dịch."
      : "Phần hao hụt là bùn bị giữ lại cùng dịch dính vải lọc; hao càng ít và độ trong càng cao thì quy trình lọc càng tốt.";
    out.push("• " + c);
  } else {
    out.push("• Hiệu suất dịch trong: chưa tính được — cân Nước mía trong sau lọc (g) từng cột (m_bun = vải dính bùn − vải khô, dịch trong là phần chảy qua vải).");
  }

  // 4. Độ trong → liều tốt nhất
  const coDuc = ds.filter((d) => !Number.isNaN(d.turb));
  let totNhat = null;
  if (coDuc.length) {
    const sap = [...coDuc].sort((a, b) => b.turb - a.turb);
    totNhat = sap[0];
    let c = `Độ trong chấm tay (0–10, 10 = trong nhất): ${ds.map((d) => `${viCol(d.col)} ${Number.isNaN(d.turb) ? "—" : fmt(d.turb, 1)}`).join("; ")}. `;
    c += `Trong nhất là ${viCol(totNhat.col)} (${fmt(totNhat.turb, 1)} điểm). `;
    if (sap.length > 1 && sap[0].turb === sap[1].turb)
      c += `Có đồng hạng (${viCol(sap[1].col)} cùng ${fmt(sap[1].turb, 1)} điểm) — khi đó ưu tiên liều vôi thấp hơn để tiết kiệm hóa chất và hạn chế kiềm dư. `;
    else if (totNhat.col === "control") c += "Đối chứng trong nhất là bất thường — kiểm tra lại liều vôi, thời gian lắng 45–60 phút và cách chấm.";
    out.push("• " + c);
  } else {
    out.push("• Độ trong: chưa chấm điểm (thang 0–10, 10 = trong nhất) — đây là tiêu chí chính để chọn liều vôi.");
  }

  // 5. pH theo liều
  const coPH = ds.filter((d) => !Number.isNaN(d.ph));
  if (coPH.length) {
    let c = `pH: ${ds.map((d) => `${viCol(d.col)} ${Number.isNaN(d.ph) ? "—" : fmt(d.ph)}`).join("; ")}. `;
    const phLieu = lieu.map((d) => d.ph).filter((n) => !Number.isNaN(n));
    if (!Number.isNaN(ctrl.ph) && phLieu.length) {
      c += phLieu.every((n) => n >= ctrl.ph - 0.05) ? "pH tăng dần theo liều vôi — đúng bản chất (vôi kiềm trung hòa acid hữu cơ). " : "pH không tăng đều theo liều — kiểm tra lại đong liều vôi và hiệu chuẩn máy đo. ";
    }
    const cao = ds.find((d) => !Number.isNaN(d.ph) && d.ph > 8);
    if (cao) c += `${viCol(cao.col)} pH ${fmt(cao.ph)} là kiềm mạnh (pH > 8): dễ tổn thất đường nghịch đảo, sẫm màu khi cô đặc và tốn acid trung hòa sau này — nên tránh liều này. `;
    out.push("• " + c);
  }

  // 6. °Bx (tổn thất đường)
  const coBx = ds.filter((d) => !Number.isNaN(d.bx));
  if (coBx.length) {
    let c = `Độ Brix: ${ds.map((d) => `${viCol(d.col)} ${Number.isNaN(d.bx) ? "—" : `${fmt(d.bx)} °Bx`}`).join("; ")}. `;
    if (!Number.isNaN(ctrl.bx)) {
      const mat = lieu.filter((d) => !Number.isNaN(d.bx)).map((d) => ({ ...d, giam: ((ctrl.bx - d.bx) / Math.abs(ctrl.bx)) * 100 }));
      if (mat.length) {
        c += `So với đối chứng, °Bx ${mat.map((d) => `${viCol(d.col)} ${d.giam >= 0 ? "giảm" : "tăng"} ${fmt(Math.abs(d.giam), 1)}%`).join("; ")}. `;
        const lon = mat.find((d) => d.giam > 10);
        if (lon) c += `${viCol(lon.col)} mất hơn 10% °Bx — dấu hiệu đường bị giữ trong bùn hoặc pha loãng do nước vôi, cần tính lại cân bằng đường. `;
        else c += "Mức chênh °Bx nhỏ cho thấy vôi chủ yếu loại tạp chất lơ lửng, ít làm mất đường hòa tan. ";
      }
    }
    out.push("• " + c);
  }

  // 7. Kết luận liều
  if (totNhat && totNhat.col !== "control") {
    const d = colData(rows, totNhat.col);
    let c = `Kết luận sơ bộ: liều ${COLS.find((x) => x.key === totNhat.col)?.dose} cho nước trong nhất. `;
    if (!Number.isNaN(d.ph) && d.ph > 8) c += "Tuy nhiên pH kiềm mạnh nên cần cân nhắc giảm liều hoặc trung hòa trước khi cô đặc. ";
    if (!Number.isNaN(ctrl.bx) && !Number.isNaN(d.bx) && ((ctrl.bx - d.bx) / Math.abs(ctrl.bx)) * 100 > 10)
      c += "Tuy nhiên tổn thất °Bx lớn nên cần kiểm tra lại trước khi chốt. ";
    c += "Muốn chặt chẽ hơn, lấy số liệu các nhóm khác làm lặp lại rồi tính trung bình ± SD cho từng liều (phiếu mục 3.2 yêu cầu thống kê mô tả trên số liệu lặp).";
    out.push("• " + c);
  } else if (!totNhat) {
    out.push("• Chưa đủ cơ sở chốt liều vôi (thiếu điểm độ trong) — hãy chấm đủ 4 cột rồi đọc lại nhận xét này.");
  }

  return out.join("\n");
}

// ---------------------------------------------------------------------------
function OTuTinh({ value, reason }) {
  if (!Number.isNaN(value)) return <span className="auto-cell">{fmt(value)}<AutoTag>tự tính</AutoTag></span>;
  return (
    <span className="auto-cell empty">
      —<span className="hint tiny">{reason ? ` (${reason})` : ""}</span>
    </span>
  );
}

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

// Dải so sánh nhanh 4 nghiệm thức (bàn: bảng; mobile: thẻ dọc)
function SoSanhNhanh({ rows, mobile }) {
  const eff = exp3EffectiveRows(rows);
  const ds = COLS.map(({ key }) => colData(eff, key));
  const best = ds.filter((d) => !Number.isNaN(d.turb)).sort((a, b) => b.turb - a.turb)[0];
  const hang = [
    { label: "Nước mía (g)", get: (d) => (Number.isNaN(d.juice) ? "—" : fmt(d.juice, 1)) },
    { label: "Cặn bùn (g)", get: (d) => (Number.isNaN(d.mud) ? "—" : fmt(d.mud, 1)) },
    { label: "Tỉ lệ bùn (%)", get: (d) => (Number.isNaN(d.mudPct) ? "—" : `${fmt(d.mudPct)}%`), auto: true },
    { label: "Nước mía trong sau lọc (g)", get: (d) => (Number.isNaN(d.clearG) ? "—" : fmt(d.clearG, 1)) },
    { label: "Hiệu suất dịch trong (%)", get: (d) => (Number.isNaN(d.clearPct) ? "—" : `${fmt(d.clearPct)}%`), auto: true },
    { label: "Độ Brix (°Bx)", get: (d) => (Number.isNaN(d.bx) ? "—" : fmt(d.bx)) },
    { label: "pH", get: (d) => (Number.isNaN(d.ph) ? "—" : fmt(d.ph)) },
    { label: "Độ trong (0–10)", get: (d) => (Number.isNaN(d.turb) ? "—" : fmt(d.turb, 1)) },
  ];
  if (mobile) {
    return (
      <div className="m-sum">
        {ds.map((d) => (
          <div className="m-sum-row" key={d.col}>
            <b>{viCol(d.col)}</b>
            {best && d.col === best.col && <span className="best-badge"> trong nhất</span>} ·{" "}
            <span className="v">
              Bùn {Number.isNaN(d.mudPct) ? "—" : `${fmt(d.mudPct)}%`} · Dịch thu{" "}
              {Number.isNaN(d.clearPct) ? "—" : `${fmt(d.clearPct)}%`} · pH {Number.isNaN(d.ph) ? "—" : fmt(d.ph)} · °Bx{" "}
              {Number.isNaN(d.bx) ? "—" : fmt(d.bx)} · Đục {Number.isNaN(d.turb) ? "—" : fmt(d.turb, 1)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="table-wrap">
      <table className="dt">
        <thead>
          <tr>
            <th>Chỉ tiêu</th>
            {COLS.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hang.map((h) => (
            <tr key={h.label}>
              <td className="param">
                {h.label} {h.auto && <AutoTag>tự tính</AutoTag>}
              </td>
              {ds.map((d) => (
                <td key={d.col} className={h.label.startsWith("Độ trong") && best && d.col === best.col ? "best-cell" : "auto"}>
                  {h.get(d)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Exp3({ mode }) {
  const { report, update } = useReport();
  const exp = report.exp3;
  const mobile = mode === "mobile";
  const rows = useMemo(() => mergedRows(exp.rows), [exp.rows]);
  const auto32 = useMemo(() => sinhNhanXet32(exp), [exp]);

  // Lượng nước vôi cần thêm cho từng cột = liều % × nước mía của đúng cột đó
  // (w/w). Vì các nhóm có khối lượng nước mía khác nhau nên mỗi cột đong riêng
  // — không dùng chung một số.
  const nuocVoi = useMemo(
    () => COLS.map(({ key }) => limeGrams(rowByParam(rows, "Juice (gr)")?.[key], EXP3_DOSES[key])),
    [rows]
  );
  const coNuocVoi = nuocVoi.some((n) => !Number.isNaN(n) && n > 0);

  // Ghi theo tên chỉ tiêu để tương thích báo cáo cũ (thiếu hàng thì thêm mới)
  const setCellByParam = (param, col, v) => {
    const idx = (exp.rows || []).findIndex((r) => r.param === param);
    if (idx >= 0) update(["exp3", "rows", idx, col], v);
    else update(["exp3", "rows"], [...(exp.rows || []), { param, control: "", g1: "", g2: "", g3: "", [col]: v }]);
  };

  return (
    <div className="exp">
      <h2>{TITLE_VI}</h2>
      <DescBlock text={INTRO_VI} />

      <SectionCard
        title="3.1 — Làm trong bằng nước vôi trong Ca(OH)₂ (khuấy đều, để yên 45–60 phút), lọc qua vải, chấm độ trong 0–10"
        hint="Mỗi cột là một liều vôi, lượng nước mía không bắt buộc bằng nhau — cứ cân thực tế từng cột, app tự tính Tỉ lệ bùn (%) và Hiệu suất dịch trong (%). Cân vải lọc khô trước khi lọc, vải dính bùn sau khi lọc để tách khối lượng bùn. Chấm Độ trong 0–10 (10 = trong nhất)."
      >
        <label className="inline-field">
          Tổng khối lượng nước mía thô gộp từ bài 2 (g):
          <input
            className="num-input w120" inputMode="decimal" type="number" step="any"
            value={exp.juiceGrams} onChange={(e) => update(["exp3", "juiceGrams"], e.target.value)}
            placeholder="VD: 2000"
          />
        </label>
        {coNuocVoi ? (
          <div className="auto-box">
            <div className="auto-box-head">
              <b>🧪 Lượng nước vôi cần thêm (liều % × nước mía đúng cột đó)</b>
              <span className="hint tiny">Các nhóm có khối lượng nước mía khác nhau nên mỗi cột đong riêng — tính theo khối lượng (w/w) theo hướng dẫn: Nhóm 1 {EXP3_DOSES.g1}%, Nhóm 2 {EXP3_DOSES.g2}%, Nhóm 3 {EXP3_DOSES.g3}%.</span>
            </div>
            <div className="m-grid4">
              {COLS.map((c, i) => (
                <div key={c.key} className="m-auto">
                  <span className="hint tiny">{c.short}</span>
                  <b>{c.key === "control" ? "0 g" : Number.isNaN(nuocVoi[i]) ? "—" : `${fmt(nuocVoi[i], 1)} g`}</b>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="hint">Nhập cân Nước mía (g) từng cột, app sẽ tính sẵn lượng nước vôi cần thêm theo liều 10/15/18%.</p>
        )}
        {!mobile ? (
          <div className="table-wrap">
            <table className="dt">
              <thead>
                <tr>
                  <th>STT</th><th>Chỉ tiêu</th>
                  {COLS.map((c) => <th key={c.key}>{c.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const auto = AUTO3.includes(r.param);
                  return (
                    <tr key={r.param} className={auto ? "row-auto" : ""}>
                      <td>{PARAMS3.indexOf(r.param) + 1}</td>
                      <td className="param">
                        {viParam(r.param)}
                        {auto && <span className="hint tiny" style={{ display: "block", fontWeight: 400 }}>{AUTO_HINT[r.param]}</span>}
                        {r.param === "Turbidity" && <span className="hint tiny" style={{ display: "block", fontWeight: 400 }}>10 = trong nhất</span>}
                      </td>
                      {COLS.map((c) => (
                        <td key={c.key} className={auto ? "auto" : ""}>
                          {auto ? (
                            <OTuTinh value={exp3AutoValue(rows, c.key, r.param)} reason={autoReason(rows, c.key, r.param)} />
                          ) : (
                            <NumInput value={r[c.key]} ariaLabel={`${viParam(r.param)} ${c.label}`} onChange={(v) => setCellByParam(r.param, c.key, v)} />
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="m-cards">
            {rows.map((r) => {
              const auto = AUTO3.includes(r.param);
              return (
                <div className="m-card" key={r.param}>
                  <div className="m-card-head">
                    <b>{viParam(r.param)} {auto && <AutoTag>tự tính</AutoTag>}</b>
                    {r.param === "Turbidity" && <span className="hint">10 = trong nhất</span>}
                    {auto && <span className="hint">{AUTO_HINT[r.param]}</span>}
                  </div>
                  <div className="m-grid4">
                    {COLS.map((c) => (
                      <div key={c.key} className={auto ? "m-auto" : ""}>
                        <span className="hint tiny">{c.short}</span>
                        {auto ? (
                          <OTuTinh value={exp3AutoValue(rows, c.key, r.param)} reason={autoReason(rows, c.key, r.param)} />
                        ) : (
                          <NumInput value={r[c.key]} ariaLabel={`${viParam(r.param)} ${c.label}`} onChange={(v) => setCellByParam(r.param, c.key, v)} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <h4 style={{ margin: "12px 0 4px" }}>So sánh nhanh 4 nghiệm thức</h4>
        {mobile ? (
          <details className="hint-details">
            <summary aria-label="Xem so sánh nhanh">📊 Xem so sánh</summary>
            <SoSanhNhanh rows={rows} mobile />
          </details>
        ) : (
          <SoSanhNhanh rows={rows} />
        )}
      </SectionCard>

      <SectionCard
        title="3.2 — Nhận xét (dùng số liệu các nhóm khác làm lặp lại + thống kê mô tả)"
        hint="App so sánh sẵn 4 liều vôi theo Bùn %, Dịch trong %, pH, °Bx và Độ trong. Muốn chặt chẽ, xin số liệu các nhóm khác làm lặp lại rồi tính trung bình ± SD cho từng liều."
      >
        <HopNhanXetTuDong
          text={auto32}
          applied={exp.comment32 === auto32 && auto32.length > 0}
          onApply={() => update(["exp3", "comment32"], auto32)}
        />
        <BigText rows={8} value={exp.comment32}
          onChange={(v) => update(["exp3", "comment32"], v)}
          placeholder="VD: Liều 15% trong nhất (… điểm), Bùn …%, dịch trong thu hồi …%, pH … (tăng theo liều), °Bx hao …% so với đối chứng… + trung bình ± SD khi đã gộp số liệu các nhóm khác…" />
      </SectionCard>
    </div>
  );
}
