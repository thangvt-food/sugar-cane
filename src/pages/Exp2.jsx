import { useMemo } from "react";
import { useReport } from "../store/ReportContext";
import { fmt, mean, sd, toNum, rowMeanSd } from "../lib/stats";
import { AutoTag, BigText, DescBlock, NumInput, SectionCard } from "../components/ui";

// ---------------------------------------------------------------------------
// Việt hóa tên chỉ tiêu (giữ nguyên key tiếng Anh trong store để không mất
// số liệu cũ, chỉ đổi nhãn hiển thị).
// ---------------------------------------------------------------------------
const PARAM_VI = {
  "Juice (gr)": "Nước ép (g)",
  "Bagasse (gr)": "Bã mía (g)",
  "Juice (%)": "Hiệu suất ép (%)",
  "Juice (norm)": "Hiệu suất chuẩn hoá (%)",
  "°Bx": "Độ Brix (°Bx)",
  "pH": "pH",
  "Colour": "Màu sắc (0–10)",
  "Flavour": "Mùi (0–10)",
  "Taste": "Vị (0–10)",
  "Clarity": "Độ trong (0–10)",
  "State": "Trạng thái chung (0–10)",
};

const viParam = (en) => PARAM_VI[en] || en;

const TITLE_VI = "Thí nghiệm 2: Ép và đánh giá nước mía";
const INTRO_VI =
  "Ép mía bằng lô ép là quá trình tách nước mía ra khỏi bã dưới áp lực lớn giữa các trục lô gang. " +
  "Một cụm ép có thể gồm 3–6 trục; mỗi cụm gọi là một mill, nhiều cụm nối tiếp gọi là tandem mill (dây chuyền ép). " +
  "Ở thí nghiệm này, mỗi chỉ tiêu đo lặp lại 3 lần, dùng thống kê mô tả (trung bình ± độ lệch chuẩn, CV%) để nhận xét.";

// ---------------------------------------------------------------------------
// Ô TỰ TÍNH — phiếu gốc không ghi công thức nên app chốt quy ước sau
// (ghi rõ dưới mỗi bảng; nếu GV định nghĩa khác thì báo để đổi):
//   Bảng 2.1:
//     • Juice (%)  = Nước ép lần i (g) / Khối lượng mía lần i (g) × 100
//                    → hiệu suất ép trên đầu vào. Mặc định 1 khối lượng chung
//                      cả 3 lần; tick "3 mẫu khác khối lượng" để nhập riêng
//                      từng lần (app tính đúng từng cặp).
//     • Juice (norm) = Nước ép / (Nước ép + Bã) × 100
//                    → hiệu suất chuẩn hoá theo tổng thực thu (loại hao hụt),
//                      so với Juice (%) sẽ thấy % hao hụt.
//   Bảng 2.4 (ép lại bã, nước : bã = 1:1):
//     • Juice (%)  = Juice1 / (Juice1 + Bã sau ép lại) × 100
//   Còn lại (Nước ép/Bã cân trực tiếp, °Bx/pH đo máy, 5 điểm cảm quan chấm
//   tay, Mean/SD) giữ nguyên: cân/đo/chấm thủ công, Mean/SD máy tự tính.
// ---------------------------------------------------------------------------
const AUTO_MAIN = ["Juice (%)", "Juice (norm)"];
const AUTO_J1 = ["Juice (%)"];
const isAutoParam = (table, param) =>
  table === "main" ? AUTO_MAIN.includes(param) : AUTO_J1.includes(param);

function rowByParam(rows, param) {
  return rows.find((x) => x.param === param);
}

// Chỉ số cột lặp
const K2I = { r1: 0, r2: 1, r3: 2 };

// Khối lượng mía (kg) của từng lần lặp. Tương thích báo cáo cũ chỉ có
// caneKg chung: nếu chưa bật chế độ riêng hoặc ô riêng còn trống thì
// rơi về caneKg chung.
function caneKgForRepeat(exp, k) {
  const i = K2I[k] ?? 0;
  const w = exp?.caneW?.[i];
  const wNum = toNum(w);
  if (exp?.caneMulti && !Number.isNaN(wNum) && wNum > 0) return wNum;
  if (!exp?.caneMulti) return toNum(exp?.caneKg);
  // caneMulti bật nhưng ô riêng trống → fallback caneKg chung (nếu có)
  if (!Number.isNaN(wNum) && wNum > 0) return wNum;
  return toNum(exp?.caneKg);
}

function caneListOf(exp) {
  return ["r1", "r2", "r3"].map((k) => caneKgForRepeat(exp, k));
}

// Giá trị tự tính cho 1 ô (NaN = chưa đủ dữ kiện)
function autoCellValue(table, rows, exp, param, k) {
  if (table === "main") {
    const juice = toNum(rowByParam(rows, "Juice (gr)")?.[k]);
    const bagasse = toNum(rowByParam(rows, "Bagasse (gr)")?.[k]);
    if (param === "Juice (%)") {
      // Mỗi lần lặp tính theo đúng khối lượng mía của lần đó
      const caneG = caneKgForRepeat(exp, k) * 1000;
      if (Number.isNaN(juice) || Number.isNaN(caneG) || caneG <= 0) return NaN;
      return (juice / caneG) * 100;
    }
    if (param === "Juice (norm)") {
      if (Number.isNaN(juice) || Number.isNaN(bagasse)) return NaN;
      const tong = juice + bagasse;
      if (tong <= 0) return NaN;
      return (juice / tong) * 100;
    }
    return NaN;
  }
  // table === "j1"
  if (param === "Juice (%)") {
    const j = toNum(rowByParam(rows, "Juice (gr)")?.[k]);
    const b = toNum(rowByParam(rows, "Bagasse (gr)")?.[k]);
    if (Number.isNaN(j) || Number.isNaN(b)) return NaN;
    const tong = j + b;
    if (tong <= 0) return NaN;
    return (j / tong) * 100;
  }
  return NaN;
}

function autoMissingReason(table, rows, exp, param, k) {
  if (table === "main") {
    if (param === "Juice (%)") {
      const caneG = caneKgForRepeat(exp, k) * 1000;
      if (Number.isNaN(caneG) || caneG <= 0)
        return exp?.caneMulti ? `cần nhập khối lượng mía lần ${K2I[k] + 1}` : "cần nhập khối lượng mía";
      if (Number.isNaN(toNum(rowByParam(rows, "Juice (gr)")?.[k]))) return "cần cân Nước ép (g)";
      return "";
    }
    if (param === "Juice (norm)") {
      if (Number.isNaN(toNum(rowByParam(rows, "Juice (gr)")?.[k]))) return "cần cân Nước ép (g)";
      if (Number.isNaN(toNum(rowByParam(rows, "Bagasse (gr)")?.[k]))) return "cần cân Bã (g)";
      return "";
    }
  }
  if (param === "Juice (%)") {
    if (Number.isNaN(toNum(rowByParam(rows, "Juice (gr)")?.[k]))) return "cần cân Juice 1 (g)";
    if (Number.isNaN(toNum(rowByParam(rows, "Bagasse (gr)")?.[k]))) return "cần cân Bã (g)";
    return "";
  }
  return "";
}

// Hàng hiệu dụng: ô tự tính được thì dùng số auto (ưu tiên), thiếu thì
// rơi về số tay cũ (giữ tương thích báo cáo đã nhập trước đây).
function effectiveRows(table, rows, exp) {
  return (rows || []).map((r) => {
    if (!isAutoParam(table, r.param)) return r;
    const out = { ...r };
    (["r1", "r2", "r3"]).forEach((k) => {
      const a = autoCellValue(table, rows, exp, r.param, k);
      out[k] = !Number.isNaN(a) ? String(Math.round(a * 10000) / 10000) : r[k] ?? "";
    });
    return out;
  });
}

// ---------------------------------------------------------------------------
// Helpers thống kê (chạy trên hàng hiệu dụng)
// ---------------------------------------------------------------------------
function valsOf(rows, param) {
  const r = rows.find((x) => x.param === param);
  if (!r) return [];
  return [r.r1, r.r2, r.r3].map(toNum).filter((n) => !Number.isNaN(n));
}

function statOf(rows, param) {
  const vals = valsOf(rows, param);
  const m = mean(vals);
  const s = sd(vals);
  const cv = !Number.isNaN(m) && !Number.isNaN(s) && m !== 0 ? (s / Math.abs(m)) * 100 : NaN;
  return { vals, n: vals.length, m, s, cv };
}

const msText = (st, digits = 2) =>
  Number.isNaN(st.m) ? "chưa có số liệu" : `${fmt(st.m, digits)} ± ${fmt(st.s, digits)} (n = ${st.n})`;

// Thang đánh giá độ lặp lại theo CV% (cố hữu như app thống kê)
function danhGiaCV(cv) {
  if (Number.isNaN(cv)) return "chưa đánh giá được (thiếu số liệu)";
  if (cv < 5) return "rất ổn định, độ lặp lại tốt (CV < 5%)";
  if (cv < 10) return "ổn định, chấp nhận được (CV 5–10%)";
  if (cv < 20) return "biến động trung bình, cần xem lại thao tác (CV 10–20%)";
  return "biến động lớn, độ lặp lại kém (CV > 20%)";
}

function xepLoaiCamQuan(m) {
  if (Number.isNaN(m)) return "chưa chấm";
  if (m >= 8) return "tốt";
  if (m >= 6) return "khá";
  if (m >= 4) return "trung bình";
  return "kém";
}

// Nội suy nồng độ đường tương đương từ Bảng 1.1 (Exp1)
function uocLuongNongDoTuBx(bxJuice, exp1Table) {
  const pts = (exp1Table || [])
    .map((r) => {
      const bxs = [r.g1, r.g2, r.g3].map(toNum).filter((n) => !Number.isNaN(n));
      if (!bxs.length) return null;
      return { conc: toNum(r.conc), bx: bxs.reduce((a, b) => a + b, 0) / bxs.length };
    })
    .filter((p) => p && !Number.isNaN(p.conc) && !Number.isNaN(p.bx))
    .sort((a, b) => a.bx - b.bx);

  if (pts.length < 2) return null;
  const x = bxJuice;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    if (x >= a.bx && x <= b.bx) {
      if (b.bx === a.bx) return { conc: (a.conc + b.conc) / 2, noiSuy: true, pts };
      const t = (x - a.bx) / (b.bx - a.bx);
      return { conc: a.conc + t * (b.conc - a.conc), noiSuy: true, pts };
    }
  }
  const edge = x < pts[0].bx ? [pts[0], pts[1]] : [pts[pts.length - 2], pts[pts.length - 1]];
  const [a, b] = edge;
  if (b.bx === a.bx) return { conc: b.conc, noiSuy: false, pts };
  const t = (x - a.bx) / (b.bx - a.bx);
  return { conc: a.conc + t * (b.conc - a.conc), noiSuy: false, pts };
}

// ---------------------------------------------------------------------------
// Sinh nhận xét tự động 2.2 (dùng hàng hiệu dụng)
// ---------------------------------------------------------------------------
function sinhNhanXet22(exp) {
  const rows = effectiveRows("main", exp.rows || [], exp);
  const stJuiceG = statOf(rows, "Juice (gr)");
  const stBagasse = statOf(rows, "Bagasse (gr)");
  const stPct = statOf(rows, "Juice (%)");
  const stNorm = statOf(rows, "Juice (norm)");
  const stBx = statOf(rows, "°Bx");
  const stPH = statOf(rows, "pH");
  const camQuanKeys = ["Colour", "Flavour", "Taste", "Clarity", "State"];
  const stCamQuan = camQuanKeys.map((k) => ({ key: k, ...statOf(rows, k) }));

  const coSoLieu = [stJuiceG, stBagasse, stPct, stBx, stPH, ...stCamQuan].some((s) => s.n > 0);
  if (!coSoLieu)
    return "Chưa nhập đủ số liệu bảng 2.1 nên chưa thể nhận xét tự động. Hãy cân Nước ép/Bã, nhập °Bx, pH và chấm cảm quan — Hiệu suất (%) app đã tự tính, không cần nhập tay.";

  const out = [];
  const multi = !!exp.caneMulti;
  const caneList = caneListOf(exp); // kg từng lần
  const caneValid = caneList.filter((n) => !Number.isNaN(n) && n > 0);
  const sameCane = !multi && !Number.isNaN(toNum(exp?.caneKg)) && toNum(exp.caneKg) > 0;
  const caneGsingle = sameCane ? toNum(exp.caneKg) * 1000 : NaN;

  if (!Number.isNaN(stPct.m)) {
    let c = `Hiệu suất ép (tự tính = Nước ép / mía của đúng lần đó × 100) trung bình đạt ${fmt(stPct.m)} ± ${fmt(stPct.s)}% (n = ${stPct.n}, CV = ${fmt(stPct.cv, 1)}%). `;
    if (multi && caneValid.length >= 2) {
      c += `3 mẫu có khối lượng đầu vào khác nhau (${caneList.map((n) => (Number.isNaN(n) ? "—" : fmt(n))).join(" / ")} kg) nên mỗi hiệu suất đã tính riêng theo mẫu tương ứng — vẫn so sánh trung bình/SD/CV với nhau được, không bị lệch do mẫu nặng nhẹ khác nhau. `;
    } else if (sameCane) {
      c += `Cả 3 lần ép cùng ${fmt(toNum(exp.caneKg))} kg mía nên hiệu suất so sánh trực tiếp được. `;
    }
    c += `Độ lặp lại: ${danhGiaCV(stPct.cv)}. `;
    if (stPct.m >= 70) c += "Mức này cao, cho thấy ép kiệt, bã khô.";
    else if (stPct.m >= 60) c += "Mức này đạt yêu cầu với ép thủ công/quy mô phòng thí nghiệm (thường 60–70%).";
    else if (stPct.m >= 50) c += "Mức này hơi thấp, có thể do mía khô/xơ, chỉnh khe lô chưa tối ưu hoặc ép chưa kiệt.";
    else c += "Mức này thấp bất thường, cần kiểm tra lại cân, lượng mía đầu vào và thao tác ép.";
    out.push("• " + c);
  } else {
    out.push("• Hiệu suất ép (%): chưa tính được (thiếu khối lượng mía hoặc Nước ép) — hãy nhập 2 số này, app sẽ tự tính.");
  }

  if (!Number.isNaN(stNorm.m)) {
    out.push(
      `• Hiệu suất chuẩn hoá (tự tính = Nước ép / (Nước ép + Bã) × 100) trung bình ${fmt(stNorm.m)} ± ${fmt(stNorm.s)}% (CV = ${fmt(stNorm.cv, 1)}%, ${danhGiaCV(stNorm.cv)}). ` +
        `So chênh với Hiệu suất ép sẽ thấy % hao hụt trong quá trình ép/thu hồi.`
    );
  }

  if (!Number.isNaN(stJuiceG.m) || !Number.isNaN(stBagasse.m)) {
    let c = `Khối lượng nước ép ${msText(stJuiceG, 1)} g; bã ${msText(stBagasse, 1)} g (2 số cân trực tiếp). `;
    // Cân bằng khối lượng theo từng lần lặp (đúng cả khi 3 mẫu khác khối lượng)
    const haoList = ["r1", "r2", "r3"]
      .map((k) => {
        const j = toNum(rowByParam(exp.rows || [], "Juice (gr)")?.[k]);
        const b = toNum(rowByParam(exp.rows || [], "Bagasse (gr)")?.[k]);
        const cg = caneKgForRepeat(exp, k) * 1000;
        if (Number.isNaN(j) || Number.isNaN(b) || Number.isNaN(cg) || cg <= 0) return NaN;
        return ((cg - (j + b)) / cg) * 100;
      })
      .filter((n) => !Number.isNaN(n));
    if (haoList.length) {
      const haoM = mean(haoList);
      const haoS = sd(haoList);
      if (multi) {
        c += `Hao hụt từng lần (mía − (nước + bã)) / mía × 100 lần lượt ${haoList.map((n) => `${fmt(n, 1)}%`).join(", ")}; trung bình ${fmt(haoM, 1)} ± ${fmt(haoS, 1)}% (nước bắn tóe, bay hơi, dính thiết bị). `;
      } else if (!Number.isNaN(caneGsingle) && !Number.isNaN(stJuiceG.m) && !Number.isNaN(stBagasse.m)) {
        const tong = stJuiceG.m + stBagasse.m;
        c += `So với ${fmt(toNum(exp.caneKg))} kg mía đầu vào (${fmt(caneGsingle, 0)} g), tổng thu (nước + bã) ≈ ${fmt(tong, 1)} g, hao hụt ≈ ${fmt(haoM, 1)}% (nước bắn tóe, bay hơi, dính thiết bị). `;
      } else {
        c += `Hao hụt trung bình ≈ ${fmt(haoM, 1)} ± ${fmt(haoS, 1)}%. `;
      }
      if (!Number.isNaN(haoM)) {
        if (haoM < 0) c += "Hao hụt âm (tổng thu lớn hơn đầu vào) là vô lý — kiểm tra lại cân/trừ bì.";
        else if (haoM <= 5) c += "Hao hụt ≤ 5% là hợp lý.";
        else if (haoM <= 10) c += "Hao hụt 5–10% chấp nhận được ở quy mô thủ công.";
        else c += "Hao hụt > 10% là cao, cần rà soát khâu thu hồi và cân.";
      }
      if (multi) c += "Lưu ý: vì mỗi lần cân mía riêng nên đối chiếu hao hụt theo từng lần, không gộp chung một khối lượng.";
    } else {
      c += "Nên nhập khối lượng mía đem ép (kg) — nếu 3 mẫu khác nhau thì bật chế độ riêng từng lần — để đối chiếu cân bằng vật chất (nước + bã ≈ đầu vào) và để app tự tính Hiệu suất ép.";
    }
    out.push("• " + c);
  }

  if (!Number.isNaN(stBx.m)) {
    let c = `Độ Brix (đo máy) trung bình ${fmt(stBx.m)} ± ${fmt(stBx.s)} °Bx (CV = ${fmt(stBx.cv, 1)}%, ${danhGiaCV(stBx.cv)}). `;
    if (stBx.m >= 15 && stBx.m <= 24) c += "Nằm trong khoảng điển hình của nước mía tươi (khoảng 15–22 °Bx), chứng tỏ mía đủ chín, giàu chất khô hòa tan.";
    else if (stBx.m < 15) c += "Thấp hơn khoảng điển hình (15–22 °Bx), có thể do mía non, mía lưu lâu mất đường, hoặc bị pha loãng/nước rửa.";
    else c += "Cao hơn khoảng điển hình, có thể do mía rất già/khô hoặc sai số khúc xạ kế (cần hiệu chuẩn, đo ở 20 °C).";
    out.push("• " + c);
  }
  if (!Number.isNaN(stPH.m)) {
    let c = `pH (đo máy) trung bình ${fmt(stPH.m)} ± ${fmt(stPH.s)} (CV = ${fmt(stPH.cv, 1)}%, ${danhGiaCV(stPH.cv)}). `;
    if (stPH.m >= 5.0 && stPH.m <= 5.8) c += "Nằm trong khoảng tự nhiên của nước mía (khoảng 5,0–5,6), thuận lợi cho khâu làm trong bằng vôi ở thí nghiệm 3.";
    else if (stPH.m < 5.0) c += "Hơi chua (pH < 5,0), có thể do mía lên men nhẹ/vi sinh hoặc nhiều acid hữu cơ.";
    else c += "Hơi cao (pH > 5,8), cần kiểm tra lại máy đo/chuẩn dung dịch đệm.";
    out.push("• " + c);
  }

  const coCamQuan = stCamQuan.filter((s) => !Number.isNaN(s.m));
  if (coCamQuan.length) {
    const sap = [...coCamQuan].sort((a, b) => b.m - a.m);
    const tb = mean(coCamQuan.map((s) => s.m));
    let c = `Điểm cảm quan chấm tay (0–10): ${coCamQuan.map((s) => `${viParam(s.key)} ${fmt(s.m)} ± ${fmt(s.s)}`).join("; ")}. Điểm trung bình 5 chỉ tiêu ≈ ${fmt(tb)}. `;
    c += `Cao nhất là ${viParam(sap[0].key)} (${fmt(sap[0].m)} điểm, ${xepLoaiCamQuan(sap[0].m)}), thấp nhất là ${viParam(sap[sap.length - 1].key)} (${fmt(sap[sap.length - 1].m)} điểm, ${xepLoaiCamQuan(sap[sap.length - 1].m)}). `;
    if (tb >= 8) c += "Nhìn chung nước mía đạt chất lượng cảm quan tốt.";
    else if (tb >= 6) c += "Nhìn chung đạt mức khá, chấp nhận được để làm nguyên liệu cho syrup/đường.";
    else if (tb >= 4) c += "Nhìn chung chỉ ở mức trung bình, cần cải thiện (mía tươi hơn, vệ sinh ép, lọc thô).";
    else c += "Nhìn chung chất lượng cảm quan kém, cần xem lại nguyên liệu và vệ sinh thiết bị.";
    out.push("• " + c);
  } else {
    out.push("• Điểm cảm quan (Màu/Mùi/Vị/Độ trong/Trạng thái): chưa có số liệu (chấm tay 0–10).");
  }

  const allSt = [
    { label: "Nước ép (g)", st: stJuiceG },
    { label: "Bã mía (g)", st: stBagasse },
    { label: "Hiệu suất ép (%)", st: stPct },
    { label: "Độ Brix", st: stBx },
    { label: "pH", st: stPH },
    ...stCamQuan.map((s) => ({ label: viParam(s.key), st: s })),
  ].filter((x) => x.st.n >= 2 && !Number.isNaN(x.st.cv));
  if (allSt.length) {
    const maxCV = [...allSt].sort((a, b) => b.st.cv - a.st.cv)[0];
    const minCV = [...allSt].sort((a, b) => a.st.cv - b.st.cv)[0];
    out.push(
      `• Biến động lớn nhất ở chỉ tiêu ${maxCV.label} (CV = ${fmt(maxCV.st.cv, 1)}%), ổn định nhất ở ${minCV.label} (CV = ${fmt(minCV.st.cv, 1)}%). ` +
        (maxCV.st.cv > 10
          ? "Chỉ tiêu biến động mạnh cần lặp lại cẩn thận hơn (đồng nhất mẫu, cùng người chấm cảm quan, hiệu chuẩn thiết bị)."
          : "Nhìn chung các lần lặp khá đồng đều, số liệu đáng tin cậy.")
    );
  }

  return out.join("\n");
}

// ---------------------------------------------------------------------------
// Sinh nhận xét 2.3
// ---------------------------------------------------------------------------
function sinhNhanXet23(exp, exp1) {
  const rows = effectiveRows("main", exp.rows || [], exp);
  const stBx = statOf(rows, "°Bx");
  if (Number.isNaN(stBx.m)) return "Chưa có số liệu °Bx nước mía ở bảng 2.1 (đo máy) nên chưa thể so sánh với Bảng 1.1.";
  const kq = uocLuongNongDoTuBx(stBx.m, exp1?.table);
  let c = `Độ Brix nước mía trung bình ${fmt(stBx.m)} ± ${fmt(stBx.s)} °Bx (n = ${stBx.n}). `;
  if (kq) {
    c += `Nội suy từ Bảng 1.1 (đường chuẩn sucrose), giá trị này tương đương dung dịch đường khoảng ${fmt(kq.conc, 1)}% (w/w)`;
    c += kq.noiSuy ? " (nội suy trong khoảng đo). " : " (ngoại suy ngoài khoảng đo Bảng 1.1 nên chỉ mang tính ước lượng). ";
    c += `Suy ra hàm lượng chất khô hòa tan xấp xỉ ${fmt(kq.conc, 1)} g/100 g nước mía. `;
  } else {
    c += `Chưa có đủ đường chuẩn ở Bảng 1.1 để nội suy; theo gần đúng 1 °Bx ≈ 1 g sucrose/100 g dung dịch thì chất khô hòa tan xấp xỉ ${fmt(stBx.m, 1)} g/100 g. `;
  }
  c +=
    "Lưu ý: °Bx phản ánh mọi chất hòa tan (sucrose, glucose, fructose, acid, khoáng, chất màu), không riêng sucrose, nên °Bx chỉ gần đúng hàm lượng đường thực. " +
    `Độ lặp lại của °Bx: ${danhGiaCV(stBx.cv)} (CV = ${fmt(stBx.cv, 1)}%).`;
  return c;
}

// ---------------------------------------------------------------------------
// Sinh nhận xét 2.5
// ---------------------------------------------------------------------------
function sinhNhanXet25(exp, exp1) {
  const rowsGoc = effectiveRows("main", exp.rows || [], exp);
  const rowsJ1 = effectiveRows("j1", exp.j1rows || [], exp);
  const stGoc = statOf(rowsGoc, "°Bx");
  const stPHGoc = statOf(rowsGoc, "pH");
  const stJ1Pct = statOf(rowsJ1, "Juice (%)");
  const stJ1Bx = statOf(rowsJ1, "°Bx");
  const stJ1PH = statOf(rowsJ1, "pH");
  const stJ1G = statOf(rowsJ1, "Juice (gr)");

  if (Number.isNaN(stJ1Bx.m) && Number.isNaN(stJ1Pct.m) && Number.isNaN(stJ1G.m))
    return "Chưa nhập số liệu bảng 2.4 (cân Juice 1 + Bã sau ép lại, đo °Bx/pH) nên chưa thể nhận xét. Lưu ý Hiệu suất juice 1 app đã tự tính.";

  const out = [];
  if (!Number.isNaN(stJ1Bx.m)) {
    let c = `°Bx của juice 1 (ép lại bã sau ngâm nước 1 : 1, đo máy) trung bình ${fmt(stJ1Bx.m)} ± ${fmt(stJ1Bx.s)} °Bx (n = ${stJ1Bx.n}, CV = ${fmt(stJ1Bx.cv, 1)}%, ${danhGiaCV(stJ1Bx.cv)}). `;
    if (!Number.isNaN(stGoc.m) && stGoc.m !== 0) {
      const giam = stGoc.m - stJ1Bx.m;
      const giamPct = (giam / Math.abs(stGoc.m)) * 100;
      c += `So với nước mía nguyên (${fmt(stGoc.m)} ± ${fmt(stGoc.s)} °Bx), °Bx giảm ${fmt(giam)} đơn vị, tương ứng giảm ${fmt(giamPct, 1)}%. `;
      if (giamPct >= 50) c += "Mức giảm mạnh là dễ hiểu vì đã pha loãng 1 : 1 và chỉ thu được phần đường còn sót trong bã.";
      else if (giamPct >= 25) c += "Mức giảm trung bình, phù hợp với hiệu ứng pha loãng và thu hồi một phần đường tồn dư trong bã.";
      else if (giamPct > 0) c += "Mức giảm nhẹ bất thường với tỉ lệ pha loãng 1 : 1 — có thể bã giữ nhiều đường (ép lần đầu chưa kiệt) hoặc đong nước ngâm chưa đúng tỉ lệ.";
      else c += "°Bx không giảm là vô lý (juice 1 phải loãng hơn juice nguyên) — kiểm tra lại nhãn mẫu và số liệu.";
    }
    const kq = uocLuongNongDoTuBx(stJ1Bx.m, exp1?.table);
    if (kq) c += ` Đối chiếu Bảng 1.1, juice 1 tương đương dung dịch đường khoảng ${fmt(kq.conc, 1)}% (≈ ${fmt(kq.conc, 1)} g chất khô/100 g).`;
    else c += ` Theo gần đúng 1 °Bx ≈ 1 g đường/100 g, chất khô của juice 1 ≈ ${fmt(stJ1Bx.m, 1)} g/100 g.`;
    out.push("• " + c);
  }

  if (!Number.isNaN(stJ1PH.m)) {
    let c = `pH juice 1 trung bình ${fmt(stJ1PH.m)} ± ${fmt(stJ1PH.s)}`;
    if (!Number.isNaN(stPHGoc.m)) {
      const d = stJ1PH.m - stPHGoc.m;
      c += ` (juice nguyên ${fmt(stPHGoc.m)} ± ${fmt(stPHGoc.s)}; chênh lệch ${d >= 0 ? "+" : ""}${fmt(d)}). `;
      if (Math.abs(d) <= 0.3) c += "pH hầu như không đổi — nước ngâm pha loãng đường là chính, ít làm thay đổi hệ đệm acid.";
      else if (d > 0.3) c += "pH tăng nhẹ do pha loãng acid hữu cơ bằng nước trung tính.";
      else c += "pH giảm nhẹ — có thể do lên men trong thời gian ngâm bã hoặc sai số đo.";
    } else c += ".";
    out.push("• " + c);
  }

  if (!Number.isNaN(stJ1Pct.m))
    out.push(`• Hiệu suất thu juice 1 (tự tính = Juice1 / (Juice1 + Bã) × 100) đạt ${fmt(stJ1Pct.m)} ± ${fmt(stJ1Pct.s)}% — lượng dịch thu thêm nhờ ngâm + ép lại, giúp tận thu đường còn kẹt trong bã.`);

  out.push(
    "• Vì sao °Bx giảm: (1) pha loãng trực tiếp theo tỉ lệ nước : bã = 1 : 1; " +
      "(2) lần ép đầu đã lấy phần lớn đường dễ ép, phần còn lại khó trích ly hoàn toàn sau một lần ngâm; " +
      "(3) nước ngâm chủ yếu hòa tan đường bề mặt + một phần khuếch tán từ xơ nên nồng độ luôn thấp hơn juice nguyên."
  );
  return out.join("\n");
}

// ---------------------------------------------------------------------------
// Component con
// ---------------------------------------------------------------------------
function BangTomTat({ effRows, mobile }) {
  const stats = effRows.map((r) => ({ param: r.param, ...rowMeanSd(r.r1, r.r2, r.r3) }));
  const cvOf = ({ m, s }) => (!Number.isNaN(m) && !Number.isNaN(s) && m !== 0 ? (s / Math.abs(m)) * 100 : NaN);
  // Mobile: danh sách gọn thay cho bảng ngang (khỏi kéo scroll)
  if (mobile) {
    return (
      <div className="m-sum">
        {stats.map((s) => {
          const cv = cvOf(s);
          const coLieu = !Number.isNaN(s.m);
          return (
            <div className="m-sum-row" key={s.param}>
              <b>{viParam(s.param)}</b> ·{" "}
              <span className="v">{coLieu ? `${fmt(s.m)} ± ${fmt(s.s)}` : "—"}</span>
              {coLieu && !Number.isNaN(cv) && <span className="v"> · CV {fmt(cv, 1)}%</span>}
              <span className="c">{coLieu ? danhGiaCV(cv) : "chưa có số liệu"}</span>
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <div className="table-wrap">
      <table className="dt">
        <thead>
          <tr>
            <th>Chỉ tiêu</th>
            <th>Trung bình ± SD</th>
            <th>CV%</th>
            <th>Đánh giá nhanh</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((s) => {
            const cv = cvOf(s);
            const coLieu = !Number.isNaN(s.m);
            return (
              <tr key={s.param}>
                <td className="param">{viParam(s.param)}</td>
                <td className="auto">{coLieu ? `${fmt(s.m)} ± ${fmt(s.s)}` : "—"}</td>
                <td className="auto">{coLieu && !Number.isNaN(cv) ? `${fmt(cv, 1)}%` : "—"}</td>
                <td className="auto">{coLieu ? danhGiaCV(cv) : "chưa có số liệu"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
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
        <button className="btn secondary sm" onClick={onApply}>
          ✨ Dùng nhận xét tự động
        </button>
        <button className="btn ghost sm" onClick={() => navigator.clipboard?.writeText(text)}>
          Sao chép
        </button>
        {applied && <span className="hint tiny">✓ Đã chép xuống ô báo cáo — bạn có thể chỉnh lại câu chữ.</span>}
      </div>
    </div>
  );
}

function OTuTinh({ value, reason, label }) {
  if (!Number.isNaN(value)) {
    return (
      <span className="auto-cell" title={`${label} — không cần nhập tay`}>
        {fmt(value)}
        <AutoTag>tự tính</AutoTag>
      </span>
    );
  }
  return (
    <span className="auto-cell empty" title={reason || "Thiếu số liệu gốc"}>
      —
      <span className="hint tiny">{reason ? ` (${reason})` : ""}</span>
    </span>
  );
}

// Bảng nhập lặp: dòng tự tính → hiện số auto, không cho nhập tay.
function RepeatTable({ rawRows, exp, table, onCell, mobile }) {
  const effRows = useMemo(() => effectiveRows(table, rawRows, exp), [table, rawRows, exp]);
  const autoOf = (param, k) => autoCellValue(table, rawRows, exp, param, k);

  if (!mobile) {
    return (
      <div className="table-wrap">
        <table className="dt">
          <thead>
            <tr>
              <th>STT</th>
              <th>Chỉ tiêu</th>
              <th>Lần 1</th>
              <th>Lần 2</th>
              <th>Lần 3</th>
              <th>
                Trung bình <AutoTag>tự tính</AutoTag>
              </th>
              <th>
                SD <AutoTag>tự tính</AutoTag>
              </th>
            </tr>
          </thead>
          <tbody>
            {rawRows.map((r, i) => {
              const eff = effRows[i];
              const { m, s } = rowMeanSd(eff.r1, eff.r2, eff.r3);
              const auto = isAutoParam(table, r.param);
              return (
                <tr key={r.param} className={auto ? "row-auto" : ""}>
                  <td>{i + 1}</td>
                  <td className="param">
                    {viParam(r.param)}
                    {auto && (
                      <span className="hint tiny" style={{ display: "block", fontWeight: 400 }}>
                        {r.param === "Juice (%)" && table === "main" && "Nước ép / mía × 100"}
                        {r.param === "Juice (norm)" && "Nước ép / (Nước ép + Bã) × 100"}
                        {r.param === "Juice (%)" && table === "j1" && "Juice1 / (Juice1 + Bã) × 100"}
                      </span>
                    )}
                  </td>
                  {(["r1", "r2", "r3"]).map((k) =>
                    auto ? (
                      <td key={k} className="auto">
                        <OTuTinh
                          value={autoOf(r.param, k)}
                          reason={autoMissingReason(table, rawRows, exp, r.param, k)}
                          label={viParam(r.param)}
                        />
                      </td>
                    ) : (
                      <td key={k}>
                        <NumInput value={r[k]} ariaLabel={`${viParam(r.param)} lần ${k}`} onChange={(v) => onCell(i, k, v)} />
                      </td>
                    )
                  )}
                  <td className="auto">{fmt(m)}</td>
                  <td className="auto">{fmt(s)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="m-cards">
      {rawRows.map((r, i) => {
        const eff = effRows[i];
        const { m, s } = rowMeanSd(eff.r1, eff.r2, eff.r3);
        const auto = isAutoParam(table, r.param);
        return (
          <div className="m-card" key={r.param}>
            <div className="m-card-head">
              <b>
                {i + 1}. {viParam(r.param)} {auto && <AutoTag>tự tính</AutoTag>}
              </b>
              <span className="hint">
                TB {fmt(m)} · SD {fmt(s)}
              </span>
            </div>
            {auto ? (
              <div className="m-grid3">
                {(["r1", "r2", "r3"]).map((k, j) => (
                  <div key={k} className="m-auto">
                    <span className="hint tiny">Lần {j + 1}</span>
                    <OTuTinh
                      value={autoOf(r.param, k)}
                      reason={autoMissingReason(table, rawRows, exp, r.param, k)}
                      label={viParam(r.param)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="m-grid3">
                {[
                  ["r1", "Lần 1"],
                  ["r2", "Lần 2"],
                  ["r3", "Lần 3"],
                ].map(([k, label]) => (
                  <label key={k}>
                    {label}
                    <NumInput value={r[k]} ariaLabel={label} onChange={(v) => onCell(i, k, v)} />
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Exp2({ mode }) {
  const { report, update } = useReport();
  const exp = report.exp2;
  const exp1 = report.exp1;
  const mobile = mode === "mobile";

  const effMain = useMemo(() => effectiveRows("main", exp.rows, exp), [exp.rows, exp]);
  const effJ1 = useMemo(() => effectiveRows("j1", exp.j1rows, exp), [exp.j1rows, exp]);
  const auto22 = useMemo(() => sinhNhanXet22(exp), [exp]);
  const auto23 = useMemo(() => sinhNhanXet23(exp, exp1), [exp, exp1]);
  const auto25 = useMemo(() => sinhNhanXet25(exp, exp1), [exp, exp1]);

  const caneW = exp.caneW ?? ["", "", ""];
  const setCaneW = (i, v) => {
    const next = [caneW[0] ?? "", caneW[1] ?? "", caneW[2] ?? ""];
    next[i] = v;
    update(["exp2", "caneW"], next);
  };
  // Lượng nước ngâm 1:1 cho ép lại = bã từng lần ở 2.1 (giả định bã lần i
  // của 2.1 đem ngâm thành mẫu lần i của 2.4). Quan trọng khi 3 mẫu khác
  // khối lượng vì mỗi lần cần lượng nước khác nhau.
  const nuocNgam = useMemo(
    () => ["r1", "r2", "r3"].map((k) => toNum(rowByParam(exp.rows || [], "Bagasse (gr)")?.[k])),
    [exp.rows]
  );
  const coNuocNgam = nuocNgam.some((n) => !Number.isNaN(n) && n > 0);
  const toggleMulti = (on) => {
    update(["exp2", "caneMulti"], on);
    // Bật chế độ riêng mà 3 ô còn trống thì copy khối lượng chung sang cho nhanh
    if (on && caneW.every((x) => String(x ?? "").trim() === "") && String(exp.caneKg ?? "").trim() !== "") {
      update(["exp2", "caneW"], [exp.caneKg, exp.caneKg, exp.caneKg]);
    }
  };

  return (
    <div className="exp">
      <h2>{TITLE_VI}</h2>
      <DescBlock text={INTRO_VI} />

      <SectionCard
        title="2.1 — Đánh giá nước mía (chấm cảm quan 0–10 theo chất lượng)"
        hint="Chỉ nhập: khối lượng mía (kg), cân Nước ép/Bã (g), đo °Bx/pH, chấm 5 điểm cảm quan. Hai dòng Hiệu suất (%) app tự tính nên không có ô nhập — đủ dữ kiện gốc là hiện số ngay."
      >
        {!exp.caneMulti ? (
          <label className="inline-field">
            Khối lượng mía đem ép (kg, chung cả 3 lần):
            <input
              className="num-input w120"
              inputMode="decimal"
              type="number"
              step="any"
              value={exp.caneKg ?? ""}
              onChange={(e) => update(["exp2", "caneKg"], e.target.value)}
              placeholder="VD: 5"
            />
          </label>
        ) : (
          <div className="cane-multi">
            <span className="inline-field">Khối lượng mía riêng từng lần ép (kg):</span>
            <div className="m-grid3">
              {[0, 1, 2].map((i) => (
                <label key={i}>
                  Lần {i + 1}
                  <input
                    className="num-input"
                    inputMode="decimal"
                    type="number"
                    step="any"
                    value={caneW[i] ?? ""}
                    onChange={(e) => setCaneW(i, e.target.value)}
                    placeholder="VD: 5"
                  />
                </label>
              ))}
            </div>
          </div>
        )}
        <label className="check-row">
          <input type="checkbox" checked={!!exp.caneMulti} onChange={(e) => toggleMulti(e.target.checked)} />
          3 mẫu ép khác khối lượng nhau (nhập riêng từng lần)
        </label>
        <RepeatTable rawRows={exp.rows} exp={exp} table="main" mobile={mobile} onCell={(i, k, v) => update(["exp2", "rows", i, k], v)} />
        <p className="hint">
          Công thức tự tính: Hiệu suất ép (%) = Nước ép (g) / (mía của đúng lần đó (kg) × 1000) × 100 · Hiệu suất chuẩn hoá (%) =
          Nước ép / (Nước ép + Bã) × 100 (quy ước của app vì phiếu không định nghĩa — chuẩn hoá theo tổng thực thu để thấy hao hụt).
        </p>
        <h4 style={{ margin: "12px 0 4px" }}>Tóm tắt thống kê nhanh (trung bình ± SD, CV%)</h4>
        {mobile ? (
          <details className="hint-details">
            <summary aria-label="Xem tóm tắt thống kê">📊 Xem tóm tắt</summary>
            <p className="hint">CV = SD / TB × 100%. CV &lt; 5% rất ổn định · 5–10% ổn định · 10–20% biến động TB · &gt; 20% biến động lớn.</p>
            <BangTomTat effRows={effMain} mobile />
          </details>
        ) : (
          <>
            <p className="hint" style={{ margin: 0 }}>
              CV = SD / trung bình × 100%. CV &lt; 5% rất ổn định · 5–10% ổn định · 10–20% biến động trung bình · &gt; 20% biến động lớn.
            </p>
            <BangTomTat effRows={effMain} />
          </>
        )}
      </SectionCard>

      <SectionCard title="2.2 — Nhận xét (thống kê mô tả: trung bình ± SD)">
        <HopNhanXetTuDong
          text={auto22}
          applied={exp.comment22 === auto22 && auto22.length > 0}
          onApply={() => update(["exp2", "comment22"], auto22)}
        />
        <BigText
          rows={8}
          value={exp.comment22}
          onChange={(v) => update(["exp2", "comment22"], v)}
          placeholder="Nhận xét tự động ở trên sẽ gợi ý sẵn. Nội dung nên có: hiệu suất ép trung bình ± SD, °Bx, pH, điểm cảm quan cao/thấp nhất, chỉ tiêu biến động lớn nhất…"
        />
      </SectionCard>

      <SectionCard
        title="2.3 — So sánh °Bx nước mía với Bảng 1.1"
        hint="App tự nội suy đường chuẩn sucrose ở Thí nghiệm 1 để ước lượng nồng độ đường tương đương. Nếu Exp 1 chưa nhập, app dùng gần đúng 1 °Bx ≈ 1 g đường/100 g."
      >
        <HopNhanXetTuDong
          text={auto23}
          applied={exp.compare23 === auto23 && auto23.length > 0}
          onApply={() => update(["exp2", "compare23"], auto23)}
        />
        <BigText
          rows={5}
          value={exp.compare23}
          onChange={(v) => update(["exp2", "compare23"], v)}
          placeholder="VD: °Bx nước mía (≈ …) tương đương dung dịch đường …% ở Bảng 1.1, suy ra hàm lượng chất khô hòa tan xấp xỉ … g/100 g…"
        />
      </SectionCard>

      <SectionCard
        title="2.4 — Đánh giá nước mía ép lại từ bã (nước : bã = 1 : 1)"
        hint="Chỉ cân Juice 1/Bã và đo °Bx/pH. Dòng Hiệu suất juice 1 (%) app tự tính = Juice1 / (Juice1 + Bã) × 100 — công thức này không dùng khối lượng mía nên đúng sẵn cho từng lần, kể cả khi 3 mẫu khác khối lượng."
      >
        {coNuocNgam ? (
          <div className="auto-box">
            <div className="auto-box-head">
              <b>💧 Lượng nước ngâm gợi ý (tỉ lệ 1 : 1 theo bã từng lần ở 2.1)</b>
              <span className="hint tiny">Giả định bã lần i của 2.1 đem ngâm thành mẫu lần i của 2.4 — quan trọng khi 3 mẫu khác khối lượng.</span>
            </div>
            <div className="m-grid3">
              {nuocNgam.map((n, i) => (
                <div key={i} className="m-auto">
                  <span className="hint tiny">Lần {i + 1}</span>
                  <b>{Number.isNaN(n) ? "—" : `${fmt(n, 1)} g nước`}</b>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="hint">Nhập cân Bã (g) ở bảng 2.1, app sẽ gợi ý lượng nước ngâm 1 : 1 cho từng lần ép lại.</p>
        )}
        <RepeatTable rawRows={exp.j1rows} exp={exp} table="j1" mobile={mobile} onCell={(i, k, v) => update(["exp2", "j1rows", i, k], v)} />
        <h4 style={{ margin: "12px 0 4px" }}>Tóm tắt juice 1 (ép lại)</h4>
        {mobile ? (
          <details className="hint-details">
            <summary aria-label="Xem tóm tắt juice 1">📊 Xem tóm tắt</summary>
            <BangTomTat effRows={effJ1} mobile />
          </details>
        ) : (
          <BangTomTat effRows={effJ1} />
        )}
      </SectionCard>

      <SectionCard
        title="2.5 — So sánh °Bx của juice 1 với Bảng 1.1 và nước mía nguyên"
        hint="App tự tính % °Bx giảm, đối chiếu Bảng 1.1 và giải thích hiệu ứng pha loãng + đường tồn dư trong bã."
      >
        <HopNhanXetTuDong
          text={auto25}
          applied={exp.compare25 === auto25 && auto25.length > 0}
          onApply={() => update(["exp2", "compare25"], auto25)}
        />
        <BigText
          rows={8}
          value={exp.compare25}
          onChange={(v) => update(["exp2", "compare25"], v)}
          placeholder="So sánh °Bx juice 1 với juice nguyên và Bảng 1.1; giải thích vì sao °Bx giảm (pha loãng 1:1, đường còn lại trong bã, khuếch tán khi ngâm)…"
        />
      </SectionCard>
    </div>
  );
}
