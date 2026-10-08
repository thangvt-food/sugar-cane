// Tiện ích thống kê mô tả + hồi quy tuyến tính cho biểu đồ.
export const toNum = (v) => {
  if (v === null || v === undefined || v === "") return NaN;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
};

export const mean = (arr) => {
  const xs = arr.map(toNum).filter((n) => !Number.isNaN(n));
  if (!xs.length) return NaN;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
};

// Độ lệch chuẩn mẫu (n-1), giống Excel STDEV.
export const sd = (arr) => {
  const xs = arr.map(toNum).filter((n) => !Number.isNaN(n));
  if (xs.length < 2) return xs.length === 1 ? 0 : NaN;
  const m = mean(xs);
  const v = xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1);
  return Math.sqrt(v);
};

// Hồi quy tuyến tính y = a*x + b, kèm R².
export function linReg(xsRaw, ysRaw) {
  const pts = xsRaw
    .map((x, i) => [toNum(x), toNum(ysRaw[i])])
    .filter(([x, y]) => !Number.isNaN(x) && !Number.isNaN(y));
  const n = pts.length;
  if (n < 2) return null;
  const sx = pts.reduce((a, [x]) => a + x, 0);
  const sy = pts.reduce((a, [, y]) => a + y, 0);
  const mx = sx / n;
  const my = sy / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (const [x, y] of pts) {
    sxy += (x - mx) * (y - my);
    sxx += (x - mx) ** 2;
    syy += (y - my) ** 2;
  }
  if (sxx === 0) return null;
  const a = sxy / sxx;
  const b = my - a * mx;
  const r2 = syy === 0 ? 1 : (sxy * sxy) / (sxx * syy);
  return { a, b, r2, n };
}

export const fmt = (n, digits = 2) => {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return Number(n).toFixed(digits);
};

export const eqText = (r, xName = "x") =>
  r ? `y = ${r.a.toFixed(4)}·${xName} ${r.b >= 0 ? "+" : "−"} ${Math.abs(r.b).toFixed(4)}   (R² = ${r.r2.toFixed(4)}, n = ${r.n})` : "Chưa đủ số liệu để lập phương trình.";

export const rowMeanSd = (r1, r2, r3) => ({ m: mean([r1, r2, r3]), s: sd([r1, r2, r3]) });
