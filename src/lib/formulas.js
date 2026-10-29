// Công thức tính theo hướng dẫn thực hành (m_t_th_nghi_m_..._6_bai.md).
// Trang nhập số liệu và bảng Excel cùng dùng một nguồn để không lệch số.
// Quy ước: thiếu dữ kiện → NaN để UI hiện "—" kèm lý do.
import { toNum } from "./stats";

export const STANDARD_BRIX = 15; // Brix_tieuchuan quy ước của phòng thí nghiệm
export const EXP3_DOSES = { control: 0, g1: 10, g2: 15, g3: 18 }; // % nước vôi so với nước mía
export const EXP6_RAW = { gummy: 197, nut: 173.5 }; // tổng nguyên liệu theo công thức phối liệu
export const EXP5_SEED = 10; // khối lượng mầm đường theo hướng dẫn (g)

const ratio = (a, b) => (b > 0 ? (a / b) * 100 : NaN);

// Khối lượng mía (kg) của từng lần lặp. Báo cáo cũ chỉ có caneKg chung nên
// ô riêng để trống thì rơi về khối lượng chung.
export function caneKgForRepeat(exp2, key) {
  const index = { r1: 0, r2: 1, r3: 2 }[key] ?? 0;
  const weight = toNum(exp2?.caneW?.[index]);
  if (exp2?.caneMulti && !Number.isNaN(weight) && weight > 0) return weight;
  if (!exp2?.caneMulti) return toNum(exp2?.caneKg);
  if (!Number.isNaN(weight) && weight > 0) return weight;
  return toNum(exp2?.caneKg);
}

// H_thuhoi_1 (%) = m_nm1 / m_mia × 100
export function extractionPct(juiceG, caneG) {
  const j = toNum(juiceG);
  const c = toNum(caneG);
  if (Number.isNaN(j) || Number.isNaN(c)) return NaN;
  return ratio(j, c);
}

// Tỷ lệ nước mía chuẩn hóa (%) = H_thuhoi_1 × K_hieuchinh, K = Brix_thucte / 15
export function normalizedPct(juiceG, caneG, brix) {
  const h = extractionPct(juiceG, caneG);
  const bx = toNum(brix);
  if (Number.isNaN(h) || Number.isNaN(bx)) return NaN;
  return h * (bx / STANDARD_BRIX);
}

// H_thuhoi_2 (%) = m_nm2 / (m_ba1 + m_nuoc_bo_sung) × 100, với nước bổ sung = bã 1 (1 : 1)
export function osmosisPct(juice2G, bagasse1G) {
  const j = toNum(juice2G);
  const b = toNum(bagasse1G);
  if (Number.isNaN(j) || Number.isNaN(b)) return NaN;
  return ratio(j, b + b);
}

// m_voi = m_nm_tong × (%_voi / 100)
export function limeGrams(juiceG, dosePct) {
  const j = toNum(juiceG);
  if (Number.isNaN(j)) return NaN;
  return j * ((toNum(dosePct) || 0) / 100);
}

// H_bun (%) = m_bun / (m_nm_tong + m_voi) × 100
export function mudPct(mudG, juiceG, dosePct) {
  const m = toNum(mudG);
  const j = toNum(juiceG);
  if (Number.isNaN(m) || Number.isNaN(j)) return NaN;
  return ratio(m, j + limeGrams(j, dosePct));
}

// H_dich_trong (%) = m_dich_sau_loc / m_nm_tong × 100
export function clearPct(clearG, juiceG) {
  const c = toNum(clearG);
  const j = toNum(juiceG);
  if (Number.isNaN(c) || Number.isNaN(j)) return NaN;
  return ratio(c, j);
}

// H_kettinh (%) = m_duong_thu / (m_dich_baohoa + m_duong_mam) × 100
export function crystalPct(productG, syrupG, seedG) {
  const p = toNum(productG);
  const s = toNum(syrupG);
  if (Number.isNaN(p) || Number.isNaN(s)) return NaN;
  return ratio(p, s + (toNum(seedG) || 0));
}

// H_keo (%) = m_keo_thanh_pham / tổng nguyên liệu đầu vào × 100
export function candyPct(productG, rawG) {
  const p = toNum(productG);
  const r = toNum(rawG);
  if (Number.isNaN(p) || Number.isNaN(r)) return NaN;
  return ratio(p, r);
}

// m_dich_t = m_(noi+dich_t) − m_noi; chưa nhập khối lượng nồi thì giữ nguyên số cân
export function netWeight(grossG, potG) {
  const g = toNum(grossG);
  const p = toNum(potG);
  if (Number.isNaN(g)) return NaN;
  if (Number.isNaN(p) || p <= 0) return g;
  return g - p;
}

// Bảng Bài 4: mỗi cột khối lượng có khối lượng nồi rỗng tương ứng (potWeights
// theo đúng thứ tự weightKeys). Trả về hàng đã quy về khối lượng dịch thuần.
export function netWeightRows(rows, weightKeys, potWeights) {
  return (rows || []).map((row) => {
    const out = { ...row };
    weightKeys.forEach((key, i) => {
      const value = netWeight(row[key], potWeights?.[i]);
      out[key] = Number.isNaN(value) ? row[key] ?? "" : String(Math.round(value * 100) / 100);
    });
    return out;
  });
}

// --- Bài 3: ô tự tính trong bảng 4 cột (trang nhập và bảng Excel dùng chung) ---
export const EXP3_COLUMN_KEYS = ["control", "g1", "g2", "g3"];
export const EXP3_AUTO_PARAMS = ["Mud (%)", "Clear (%)"];

const rowOf = (rows, param) => (rows || []).find((r) => r.param === param);

export function exp3AutoValue(rows, col, param) {
  const juice = rowOf(rows, "Juice (gr)")?.[col];
  if (param === "Mud (%)") return mudPct(rowOf(rows, "Mud (gr)")?.[col], juice, EXP3_DOSES[col]);
  if (param === "Clear (%)") return clearPct(rowOf(rows, "Clear (gr)")?.[col], juice);
  return NaN;
}

// Hàng hiệu dụng: dòng auto chỉ mang số tính được (không giữ số tay quy ước cũ).
export function exp3EffectiveRows(rows) {
  return (rows || []).map((row) => {
    if (!EXP3_AUTO_PARAMS.includes(row.param)) return row;
    const out = { ...row };
    EXP3_COLUMN_KEYS.forEach((key) => {
      const value = exp3AutoValue(rows, key, row.param);
      out[key] = Number.isNaN(value) ? "" : String(Math.round(value * 10000) / 10000);
    });
    return out;
  });
}
