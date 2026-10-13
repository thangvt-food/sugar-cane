import { useMemo } from "react";
import { useReport } from "../store/ReportContext";
import { fmt, toNum } from "../lib/stats";
import { AutoTag, BigText, DescBlock, NumInput, SectionCard } from "../components/ui";

// ---------------------------------------------------------------------------
// Việt hóa (giữ key tiếng Anh trong store để không mất số liệu cũ).
// Phiếu ghi "(0–10 marks in the turbidity)" nhưng bảng in thiếu hàng này,
// app bổ sung hàng "Turbidity" để có cơ sở chấm và so sánh.
// Quy ước: 10 = trong nhất (tốt nhất), 0 = đục nhất.
// ---------------------------------------------------------------------------
const PARAM_VI = {
  "Juice (gr)": "Nước mía (g)",
  "Mud (gr)": "Cặn bùn (g)",
  "Mud (%)": "Tỉ lệ bùn (%)",
  "°Bx": "Độ Brix (°Bx)",
  "pH": "pH",
  "Turbidity": "Độ trong (0–10)",
};

const PARAMS3 = ["Juice (gr)", "Mud (gr)", "Mud (%)", "°Bx", "pH", "Turbidity"];
const AUTO3 = ["Mud (%)"];

const COLS = [
  { key: "control", label: "Đối chứng (0% vôi)", short: "ĐC", dose: "0%" },
  { key: "g1", label: "Nhóm 1 (vôi 5%)", short: "5%", dose: "5%" },
  { key: "g2", label: "Nhóm 2 (vôi 10%)", short: "10%", dose: "10%" },
  { key: "g3", label: "Nhóm 3 (vôi 15%)", short: "15%", dose: "15%" },
];

const TITLE_VI = "Thí nghiệm 3: Làm trong nước mía để nấu syrup";
const INTRO_VI =
  "Làm trong là khâu loại tạp chất lơ lửng khỏi nước mía trước khi cô đặc thành syrup. " +
  "Thí nghiệm dùng nước vôi Ca(OH)₂ 20% ở các liều 0/5/10/15% (so với nước mía), gia nhiệt 105 °C trong 60 phút, " +
  "rồi so sánh lượng bùn, °Bx, pH và độ trong để chọn liều vôi phù hợp.";

const viParam = (en) => PARAM_VI[en] || en;
const viCol = (key) => COLS.find((c) => c.key === key)?.label || key;

// Gộp hàng lưu cũ với danh mục chuẩn (báo cáo cũ chưa có hàng Độ trong
// vẫn mở được; hàng mới hiện ô trống để nhập thêm).
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

// Bùn (%) = Bùn (g) / Nước mía (g) của đúng cột đó × 100 → TỰ TÍNH.
// Vì 3 nhóm dùng lượng nước mía khác nhau nên bắt buộc so bằng tỉ lệ %,
// không so gam tuyệt đối.
function autoMudPct(rows, col) {
  const mud = toNum(rowByParam(rows, "Mud (gr)")?.[col]);
  const juice = toNum(rowByParam(rows, "Juice (gr)")?.[col]);
  if (Number.isNaN(mud) || Number.isNaN(juice) || juice <= 0) return NaN;
  return (mud / juice) * 100;
}

function autoReason(rows, col) {
  if (Number.isNaN(toNum(rowByParam(rows, "Juice (gr)")?.[col]))) return "cần cân Nước mía (g)";
  if (Number.isNaN(toNum(rowByParam(rows, "Mud (gr)")?.[col]))) return "cần cân Cặn bùn (g)";
  return "";
}

// Hàng hiệu dụng: ô tự tính được thì dùng số auto, thiếu thì giữ số tay cũ.
function effectiveRows3(rows) {
  return (rows || []).map((r) => {
    if (!AUTO3.includes(r.param)) return r;
    const out = { ...r };
    COLS.forEach(({ key }) => {
      const a = autoMudPct(rows, key);
      out[key] = !Number.isNaN(a) ? String(Math.round(a * 10000) / 10000) : r[key] ?? "";
    });
    return out;
  });
}

function colData(rows, col) {
  return {
    col,
    juice: toNum(rowByParam(rows, "Juice (gr)")?.[col]),
    mud: toNum(rowByParam(rows, "Mud (gr)")?.[col]),
    mudPct: toNum(rowByParam(rows, "Mud (%)")?.[col]),
    bx: toNum(rowByParam(rows, "°Bx")?.[col]),
    ph: toNum(rowByParam(rows, "pH")?.[col]),
    turb: toNum(rowByParam(rows, "Turbidity")?.[col]),
  };
}

// ---------------------------------------------------------------------------
// Nhận xét tự động 3.2: so sánh 4 nghiệm thức theo liều vôi
// ---------------------------------------------------------------------------
function sinhNhanXet32(exp) {
  const rows = effectiveRows3(mergedRows(exp.rows));
  const ds = COLS.map(({ key }) => colData(rows, key));
  const coLieu = ds.some((d) => [d.juice, d.mud, d.mudPct, d.bx, d.ph, d.turb].some((n) => !Number.isNaN(n)));
  if (!coLieu)
    return "Chưa nhập số liệu bảng 3.1 nên chưa thể nhận xét tự động. Hãy cân Nước mía/Cặn bùn từng cột, đo °Bx/pH và chấm Độ trong (0–10, 10 = trong nhất) — Tỉ lệ bùn (%) app đã tự tính.";

  const out = [];
  const ctrl = ds[0];
  const lieu = ds.slice(1);

  // 1. Nền mẫu khác nhau → nhấn mạnh so bằng tỉ lệ + lượng vôi thực thêm
  const juices = ds.map((d) => d.juice).filter((n) => !Number.isNaN(n));
  if (juices.length >= 2) {
    const khac = Math.max(...juices) - Math.min(...juices) > 1;
    const LIEU_TXT = { control: 0, g1: 0.05, g2: 0.1, g3: 0.15 };
    let c = `Lượng nước mía mỗi cột: ${ds.map((d) => `${viCol(d.col)} ${Number.isNaN(d.juice) ? "—" : `${fmt(d.juice, 1)} g`}`).join("; ")}. `;
    c += `Lượng nước vôi 20% đã thêm (liều × đúng cột đó): ${ds.map((d) => `${viCol(d.col)} ${Number.isNaN(d.juice) ? "—" : `${fmt(d.juice * LIEU_TXT[d.col], 1)} g`}`).join("; ")}. `;
    c += khac
      ? "Các cột không cùng khối lượng mẫu nên mọi so sánh dưới đây dùng tỉ lệ % và chỉ số đo (Bùn %, °Bx, pH, điểm độ trong), không so gam tuyệt đối."
      : "Các cột cùng khối lượng mẫu nên so sánh trực tiếp được.";
    out.push("• " + c);
  }

  // 2. Tỉ lệ bùn
  const coBun = ds.filter((d) => !Number.isNaN(d.mudPct));
  if (coBun.length) {
    const sap = [...coBun].sort((a, b) => b.mudPct - a.mudPct);
    let c = `Tỉ lệ bùn (tự tính = Bùn / Nước mía × 100): ${ds.map((d) => `${viCol(d.col)} ${Number.isNaN(d.mudPct) ? "—" : `${fmt(d.mudPct)}%`}`).join("; ")}. `;
    c += `Cao nhất ở ${viCol(sap[0].col)} (${fmt(sap[0].mudPct)}%), thấp nhất ở ${viCol(sap[sap.length - 1].col)} (${fmt(sap[sap.length - 1].mudPct)}%). `;
    c += "Bùn nhiều nghĩa là vôi đã kết tủa được nhiều tạp chất (phosphat, protein, chất keo, sáp) — nhưng phải đọc cùng điểm độ trong: bùn nhiều mà nước vẫn đục là kết bông kém, lắng chưa hết.";
    out.push("• " + c);
  } else {
    out.push("• Tỉ lệ bùn: chưa tính được (thiếu cân Nước mía hoặc Cặn bùn) — nhập 2 số này, app sẽ tự tính.");
  }

  // 3. Độ trong → liều tốt nhất
  const coDuc = ds.filter((d) => !Number.isNaN(d.turb));
  let totNhat = null;
  if (coDuc.length) {
    const sap = [...coDuc].sort((a, b) => b.turb - a.turb);
    totNhat = sap[0];
    let c = `Độ trong chấm tay (0–10, 10 = trong nhất): ${ds.map((d) => `${viCol(d.col)} ${Number.isNaN(d.turb) ? "—" : fmt(d.turb, 1)}`).join("; ")}. `;
    c += `Trong nhất là ${viCol(totNhat.col)} (${fmt(totNhat.turb, 1)} điểm). `;
    if (sap.length > 1 && sap[0].turb === sap[1].turb)
      c += `Có đồng hạng (${viCol(sap[1].col)} cùng ${fmt(sap[1].turb, 1)} điểm) — khi đó ưu tiên liều vôi thấp hơn để tiết kiệm hóa chất và hạn chế kiềm dư. `;
    else if (totNhat.col === "control") c += "Đối chứng trong nhất là bất thường — kiểm tra lại liều vôi, nhiệt độ/thời gian gia nhiệt và cách chấm.";
    out.push("• " + c);
  } else {
    out.push("• Độ trong: chưa chấm điểm (thang 0–10, 10 = trong nhất) — đây là tiêu chí chính để chọn liều vôi.");
  }

  // 4. pH theo liều
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

  // 5. °Bx (tổn thất đường)
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

  // 6. Kết luận liều
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
  const eff = effectiveRows3(rows);
  const ds = COLS.map(({ key }) => colData(eff, key));
  const best = ds.filter((d) => !Number.isNaN(d.turb)).sort((a, b) => b.turb - a.turb)[0];
  const hang = [
    { label: "Nước mía (g)", get: (d) => (Number.isNaN(d.juice) ? "—" : fmt(d.juice, 1)) },
    { label: "Cặn bùn (g)", get: (d) => (Number.isNaN(d.mud) ? "—" : fmt(d.mud, 1)) },
    { label: "Tỉ lệ bùn (%)", get: (d) => (Number.isNaN(d.mudPct) ? "—" : `${fmt(d.mudPct)}%`), auto: true },
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
              Bùn {Number.isNaN(d.mudPct) ? "—" : `${fmt(d.mudPct)}%`} · pH {Number.isNaN(d.ph) ? "—" : fmt(d.ph)} · °Bx{" "}
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

  // Lượng nước vôi 20% cần thêm cho từng cột = liều % × Nước mía của đúng
  // cột đó (w/w). Vì các nhóm cân nước mía khác nhau nên mỗi cột đong riêng
  // — không dùng chung một số.
  const LIEU = { control: 0, g1: 0.05, g2: 0.1, g3: 0.15 };
  const nuocVoi = useMemo(
    () =>
      COLS.map(({ key }) => {
        const j = toNum(rowByParam(rows, "Juice (gr)")?.[key]);
        if (Number.isNaN(j) || j <= 0) return NaN;
        return j * (LIEU[key] ?? 0);
      }),
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
        title="3.1 — Làm trong bằng nước vôi Ca(OH)₂ 20% (105 °C / 60 phút), chấm độ trong 0–10"
        hint="Mỗi cột là một liều vôi, lượng nước mía không bắt buộc bằng nhau — cứ cân thực tế từng cột, app tự tính Tỉ lệ bùn (%) nên không cần nhập tay. Chấm Độ trong 0–10 (10 = trong nhất)."
      >
        <label className="inline-field">
          Lượng mẫu chuẩn theo phiếu (g):
          <input
            className="num-input w120" inputMode="decimal" type="number" step="any"
            value={exp.juiceGrams} onChange={(e) => update(["exp3", "juiceGrams"], e.target.value)}
            placeholder="VD: 2000"
          />
        </label>
        {coNuocVoi ? (
          <div className="auto-box">
            <div className="auto-box-head">
              <b>🧪 Lượng nước vôi 20% cần thêm (liều % × nước mía đúng cột đó)</b>
              <span className="hint tiny">Các nhóm cân nước mía khác nhau nên mỗi cột đong riêng — tính theo khối lượng (w/w); nếu GV quy định theo thể tích thì đổi tương ứng.</span>
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
          <p className="hint">Nhập cân Nước mía (g) từng cột, app sẽ tính sẵn lượng nước vôi 20% cần thêm theo liều 5/10/15%.</p>
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
                        {auto && <span className="hint tiny" style={{ display: "block", fontWeight: 400 }}>Bùn / Nước mía × 100</span>}
                        {r.param === "Turbidity" && <span className="hint tiny" style={{ display: "block", fontWeight: 400 }}>10 = trong nhất</span>}
                      </td>
                      {COLS.map((c) => (
                        <td key={c.key} className={auto ? "auto" : ""}>
                          {auto ? (
                            <OTuTinh value={autoMudPct(rows, c.key)} reason={autoReason(rows, c.key)} />
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
                    {auto && <span className="hint">Bùn / Nước mía × 100</span>}
                  </div>
                  <div className="m-grid4">
                    {COLS.map((c) => (
                      <div key={c.key} className={auto ? "m-auto" : ""}>
                        <span className="hint tiny">{c.short}</span>
                        {auto ? (
                          <OTuTinh value={autoMudPct(rows, c.key)} reason={autoReason(rows, c.key)} />
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
        hint="App so sánh sẵn 4 liều vôi theo Bùn %, pH, °Bx và Độ trong. Muốn chặt chẽ, xin số liệu các nhóm khác làm lặp lại rồi tính trung bình ± SD cho từng liều."
      >
        <HopNhanXetTuDong
          text={auto32}
          applied={exp.comment32 === auto32 && auto32.length > 0}
          onApply={() => update(["exp3", "comment32"], auto32)}
        />
        <BigText rows={8} value={exp.comment32}
          onChange={(v) => update(["exp3", "comment32"], v)}
          placeholder="VD: Liều 10% trong nhất (… điểm), Bùn …%, pH … (tăng theo liều), °Bx hao …% so với đối chứng… + trung bình ± SD khi đã gộp số liệu các nhóm khác…" />
      </SectionCard>
    </div>
  );
}
