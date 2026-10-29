import { eqText, linReg, mean, sd, toNum } from "./stats";
import {
  EXP3_AUTO_PARAMS,
  EXP3_DOSES,
  EXP5_SEED,
  EXP6_RAW,
  STANDARD_BRIX,
  caneKgForRepeat,
  candyPct,
  crystalPct,
  exp3EffectiveRows,
  extractionPct,
  netWeightRows,
  normalizedPct,
  osmosisPct,
} from "./formulas";

const DARK = "#1B5E20";
const GREEN = "#2E7D32";
const MINT = "#D8EFD8";
const PALE = "#F1F8E9";
const AMBER = "#FFF8E1";
const LINE = "#C5D8C5";
const NOTE = "#687568";
const MISSING = "#9AA69A";
const BODY = "#1F2A1F";
const STRIPE = "#F7FBF7";

const PARAM_VI = {
  "Juice (gr)": "Nước ép (g)",
  "Bagasse (gr)": "Bã mía (g)",
  "Juice (%)": "Hiệu suất ép (%) *",
  "Juice (norm)": `Tỉ lệ chuẩn hoá (%) (${STANDARD_BRIX} °Bx) *`,
  "°Bx": "Độ Brix (°Bx)",
  "Mud (gr)": "Cặn bùn (g)",
  "Mud (%)": "Tỉ lệ bùn (%) *",
  "Clear (gr)": "Nước mía trong sau lọc (g)",
  "Clear (%)": "Hiệu suất dịch trong (%) *",
  pH: "pH",
  Colour: "Màu sắc (0–10)",
  Flavour: "Mùi (0–10)",
  Taste: "Vị (0–10)",
  Clarity: "Độ trong (0–10)",
  State: "Trạng thái (0–10)",
  Turbidity: "Độ trong (0–10) **",
};

// Bảng 2.4 là lần ép lại sau ngâm bã → cùng key, khác tên chỉ tiêu.
const PARAM_VI_J1 = {
  "Juice (gr)": "Nước ép 2 (g)",
  "Bagasse (gr)": "Bã sau ép 2 (g)",
  "Juice (%)": "Hiệu suất ép 2 (%) *",
};

const GROUPS4 = [
  { bx: "g1bx", w: "g1w", label: "Nhóm 1" },
  { bx: "g2bx", w: "g2w", label: "Nhóm 2" },
  { bx: "g3bx", w: "g3w", label: "Nhóm 3" },
];

const viParam = (en, table) => (table === "j1" && PARAM_VI_J1[en]) || PARAM_VI[en] || en;
const dateText = () => new Date().toLocaleDateString("vi-VN");

const base = { wrap: true, alignVertical: "center", borderColor: LINE };
const headerStyle = {
  ...base,
  fontSize: 10,
  fontWeight: "bold",
  textColor: "#FFFFFF",
  backgroundColor: GREEN,
  align: "center",
  borderStyle: "thin",
  height: 36,
};
const thinBorder = { borderStyle: "thin" };
const noBorder = { borderStyle: undefined };

function cell(value, opts = {}) {
  return { ...base, value: value === undefined ? "" : value, ...opts };
}

function span(value, count, opts = {}) {
  return [cell(value, { ...opts, columnSpan: count }), ...Array(count - 1).fill(null)];
}

function fullRow(value, count, opts = {}) {
  return span(value, count, opts);
}

function blankRow(count, height = 7) {
  return fullRow("", count, { height, ...noBorder });
}

function numOrNull(value, digits = 2) {
  const n = toNum(value);
  if (Number.isNaN(n)) return null;
  const factor = 10 ** digits;
  return Math.round(n * factor) / factor;
}

function textLines(value) {
  return String(value || "").split(/\r?\n/).length;
}

function rowByParam(rows, param) {
  return (rows || []).find((row) => row.param === param);
}

// Giá trị ô tự tính — dùng chung công thức với trang nhập (src/lib/formulas.js).
function autoCellValue(table, rows, exp, param, key) {
  const juice = rowByParam(rows, "Juice (gr)")?.[key];
  if (table === "main") {
    const caneG = caneKgForRepeat(exp, key) * 1000;
    if (param === "Juice (%)") return extractionPct(juice, caneG);
    if (param === "Juice (norm)") return normalizedPct(juice, caneG, rowByParam(rows, "°Bx")?.[key]);
    return NaN;
  }
  if (param === "Juice (%)") return osmosisPct(juice, rowByParam(exp.rows || [], "Bagasse (gr)")?.[key]);
  return NaN;
}

function effectiveRows(table, rows, exp) {
  return (rows || []).map((row) => {
    const autoParams = table === "main" ? ["Juice (%)", "Juice (norm)"] : ["Juice (%)"];
    if (!autoParams.includes(row.param)) return row;
    const out = { ...row };
    ["r1", "r2", "r3"].forEach((key) => {
      const value = autoCellValue(table, rows, exp, row.param, key);
      out[key] = Number.isNaN(value) ? "" : String(Math.round(value * 10000) / 10000);
    });
    return out;
  });
}

function statOfRow(row) {
  const values = ["r1", "r2", "r3"].map((key) => toNum(row?.[key])).filter((value) => !Number.isNaN(value));
  const m = mean(values);
  const s = sd(values);
  const cv = !Number.isNaN(m) && !Number.isNaN(s) && m !== 0 ? (s / Math.abs(m)) * 100 : NaN;
  return { n: values.length, m, s, cv };
}

function dataCell(value, opts = {}) {
  const { align = "center", bg, format, bold, color, height = 20, fontStyle, fontSize = 10 } = opts;
  if (value === null || value === undefined || value === "") {
    return cell("—", {
      ...thinBorder,
      textColor: MISSING,
      align,
      backgroundColor: bg,
      height,
      fontSize,
    });
  }
  return cell(value, {
    ...thinBorder,
    textColor: color || BODY,
    align,
    backgroundColor: bg,
    height,
    fontSize,
    fontWeight: bold ? "bold" : undefined,
    fontStyle,
    format,
  });
}

function sectionRow(en, vi, count) {
  const text = `${en}\n${vi}`;
  const lines = Math.max(1, Math.ceil(text.length / Math.max(20, count * 18)));
  return fullRow(text, count, {
    ...thinBorder,
    fontStyle: undefined,
    fontWeight: "bold",
    fontSize: 11,
    textColor: DARK,
    backgroundColor: MINT,
    align: "left",
    leftBorderStyle: "thick",
    leftBorderColor: GREEN,
    height: Math.max(26, 14 * lines + 10),
  });
}

function noteRow(text, count, height = 18) {
  return fullRow(text, count, {
    ...noBorder,
    fontStyle: "italic",
    fontSize: 9,
    textColor: NOTE,
    align: "left",
    height,
  });
}

function commentRow(value, count, rows = 4, height) {
  const content = value || "";
  return fullRow(content, count, {
    ...thinBorder,
    fontSize: 10,
    align: "left",
    alignVertical: "top",
    height: height || Math.max(60, 18 * Math.max(rows, textLines(content))),
  });
}

function chartRow(count, text, height = 130) {
  return fullRow(text, count, {
    borderStyle: "dashed",
    borderColor: "#B8C8B8",
    backgroundColor: "#F8FBF8",
    fontStyle: "italic",
    fontSize: 10,
    textColor: "#8A968A",
    align: "center",
    height,
  });
}

function sourceRow(text, count) {
  return fullRow(text, count, {
    ...noBorder,
    fontStyle: "italic",
    fontSize: 8,
    textColor: NOTE,
    align: "left",
    height: 32,
  });
}

function titleRows(no, titleEn, titleVi, intro, meta, count) {
  const rows = [];
  rows.push(fullRow(titleEn.toUpperCase(), count, {
    fontSize: 16,
    fontWeight: "bold",
    textColor: "#FFFFFF",
    backgroundColor: DARK,
    align: "center",
    height: 32,
  }));
  rows.push(fullRow(`Thí nghiệm ${no} — ${titleVi}`, count, {
    fontSize: 11,
    fontStyle: "italic",
    textColor: GREEN,
    backgroundColor: PALE,
    align: "left",
    height: 20,
  }));
  rows.push([
    cell("Nhóm:", { ...thinBorder, columnSpan: 2, bold: true, textColor: GREEN, align: "left", height: 20 }),
    null,
    cell(meta.group || "", { ...thinBorder, columnSpan: 2, align: "left", height: 20 }),
    null,
    cell("Ngày xuất:", { ...thinBorder, bold: true, textColor: GREEN, align: "left", height: 20 }),
    ...span(dateText(), count - 5, { ...thinBorder, align: "left", height: 20 }),
  ]);
  rows.push([
    cell("Họ tên sinh viên:", { ...thinBorder, columnSpan: 2, bold: true, textColor: GREEN, align: "left", height: 20 }),
    null,
    ...span(meta.students || "", count - 2, { ...thinBorder, align: "left", height: 20 }),
  ]);
  const introLines = Math.max(1, Math.ceil(intro.length / Math.max(60, count * 20)));
  rows.push(fullRow(intro, count, {
    ...noBorder,
    fontStyle: "italic",
    fontSize: 10,
    textColor: "#445044",
    align: "left",
    alignVertical: "top",
    height: Math.max(30, 14 * introLines + 8),
  }));
  rows.push(blankRow(count, 7));
  return rows;
}

function sheet(name, no, titleEn, titleVi, intro, meta, widths, rows) {
  return {
    data: rows,
    sheet: name,
    columns: widths.map((width) => ({ width })),
    orientation: "landscape",
    showGridLines: false,
  };
}

function exercise1(meta, exp1) {
  const NC = 6;
  const rows = titleRows(1, "Experiment 1: Degrees Brix", "Độ Brix", "Degrees Brix (°Bx) is a measure of the dissolved solids in a liquid, and is commonly used to measure dissolved sugar content of an aqueous solution. One degree Brix is 1 gram of sucrose in 100 grams of solution and represents the strength of the solution as percentage by mass.", meta, NC);
  rows.push(sectionRow("1.1 Calculate the quantity of water / sugar and take the concentration of solution (°Bx) (100g solution)", "Tính lượng đường / nước và xác định nồng độ dung dịch (°Bx) (100 g dung dịch)", NC));
  rows.push(noteRow("Đường lý thuyết = nồng độ % (g/100 g). Nước mặc định = 100 − đường, có thể sửa theo lượng cân thực tế. Các cột Group 1/2/3 là °Bx đo thực tế bằng khúc xạ kế.", NC, 30));
  rows.push(["Concentration (%)\nNồng độ (%)", "Sugar (g)\nĐường (g)", "Water (g)\nNước (g)", "Group 1 (°Bx)\nNhóm 1", "Group 2 (°Bx)\nNhóm 2", "Group 3 (°Bx)\nNhóm 3"].map((value) => cell(value, headerStyle)));
  const table = exp1.table || [];
  const concs = table.map((row) => row.conc);
  table.forEach((row, index) => {
    const bg = index % 2 === 0 ? STRIPE : "#FFFFFF";
    rows.push([
      dataCell(numOrNull(row.conc, 0), { bg, bold: true, color: GREEN, format: "0" }),
      dataCell(numOrNull(row.conc, 1), { bg, format: "0.0" }),
      dataCell(numOrNull(row.water ?? String(100 - row.conc), 1), { bg, format: "0.0" }),
      dataCell(numOrNull(row.g1, 1), { bg, format: "0.0" }),
      dataCell(numOrNull(row.g2, 1), { bg, format: "0.0" }),
      dataCell(numOrNull(row.g3, 1), { bg, format: "0.0" }),
    ]);
  });
  rows.push(blankRow(NC));
  rows.push(sectionRow("1.2 Define the equations which express the correlation between concentration (%) and (°Bx)", "Xác định phương trình tương quan giữa nồng độ (%) và (°Bx)", NC));
  rows.push(noteRow("Phương trình hồi quy tuyến tính tự tính từ dữ liệu hiện có (dạng °Bx = a·C + b). Kiểm tra lại trước khi nộp.", NC));
  rows.push([
    cell("Group\nNhóm", headerStyle),
    ...span("Equation\nPhương trình", 3, headerStyle),
    cell("R²", headerStyle),
    cell("n", headerStyle),
  ]);
  ["g1", "g2", "g3"].forEach((key, index) => {
    const reg = linReg(concs, table.map((row) => row[key]));
    const bg = index % 2 === 0 ? STRIPE : "#FFFFFF";
    rows.push([
      dataCell(`Group ${index + 1}\nNhóm ${index + 1}`, { bg, bold: true, color: GREEN }),
      ...span(reg ? eqText(reg, "C") : "Chưa đủ số liệu để lập phương trình.", 3, { ...thinBorder, align: "left", height: 22 }),
      dataCell(reg ? numOrNull(reg.r2, 4) : null, { bg, format: "0.0000" }),
      dataCell(reg ? reg.n : null, { bg, format: "0" }),
    ]);
  });
  rows.push(blankRow(NC));
  rows.push(sectionRow("1.3 The brief comment", "Nhận xét ngắn", NC));
  rows.push(commentRow(exp1.comment13, NC, 5));
  rows.push(blankRow(NC));
  rows.push(sectionRow("1.4 Draw the graphs which express the correlation between concentration (%) and (°Bx)", "Vẽ đồ thị tương quan giữa nồng độ (%) và (°Bx)", NC));
  rows.push(chartRow(NC, "VẼ / DÁN BIỂU ĐỒ TẠI ĐÂY\n(Draw the graph here)\n\nTrục X: Concentration (%)  ·  Trục Y: °Bx"));
  rows.push(blankRow(NC));
  rows.push(sectionRow("1.5 The brief comment", "Nhận xét ngắn", NC));
  rows.push(commentRow(exp1.comment15, NC, 5));
  rows.push(sourceRow("Nguồn dữ liệu: báo cáo xuất từ app Sổ Thực Hành. Ký hiệu “—” = chưa có số liệu. Cột Đường/Nước và phương trình hồi quy được tính tự động từ dữ liệu hiện có.", NC));
  return sheet("Bài 1 - Độ Brix", 1, "Experiment 1: Degrees Brix", "Độ Brix", "", meta, [16, 13, 13, 21, 21, 21], rows);
}

function exercise2(meta, exp2) {
  const NC = 7;
  const rows = titleRows(2, "Experiment 2: Sugarcane juice extraction", "Ép và đánh giá nước mía", "Juice extraction by milling is the process of squeezing the juice from the cane under a set of mills using high pressure between heavy iron rollers. Those mills can have from 3 up to 6 rolls; every set of mills is called a tandem mill or mill train.", meta, NC);
  rows.push(sectionRow("2.1 Evaluation of the juice (0-10 marks in proportion to the sensory quality) extracted from … kgs of sugarcane", "Đánh giá nước mía (chấm cảm quan 0–10 theo chất lượng) ép từ … kg mía", NC));
  const caneMulti = Boolean(exp2.caneMulti);
  const caneKg = numOrNull(exp2.caneKg, 1);
  const caneW = exp2.caneW || ["", "", ""];
  const caneOf = (key) => {
    const index = { r1: 0, r2: 1, r3: 2 }[key] ?? 0;
    const weight = numOrNull(caneW[index], 1);
    if (caneMulti && weight !== null && weight > 0) return weight;
    if (!caneMulti) return caneKg;
    if (weight !== null && weight > 0) return weight;
    return caneKg;
  };
  rows.push([
    cell("Khối lượng mía đem ép (kg):", { ...thinBorder, columnSpan: 2, bold: true, textColor: GREEN, align: "left", height: 22 }),
    null,
    dataCell(caneKg, { format: "0.0", height: 22 }),
    ...span(
      !caneMulti
        ? "Nhập khối lượng chung cho 3 lần ép."
        : "3 mẫu có khối lượng riêng: " + ["r1", "r2", "r3"].map((key) => `${caneOf(key) ?? "—"} kg`).join(" / "),
      NC - 3,
      { ...thinBorder, fontStyle: "italic", fontSize: 9, textColor: NOTE, align: "left", height: 22 },
    ),
  ]);
  const params = [
    "Juice (gr)",
    "Bagasse (gr)",
    "Juice (%)",
    "Juice (norm)",
    "°Bx",
    "pH",
    "Colour",
    "Flavour",
    "Taste",
    "Clarity",
    "State",
  ];
  rows.push(["No\nSTT", "Parameters\nChỉ tiêu", "Repeat 1\nLần 1", "Repeat 2\nLần 2", "Repeat 3\nLần 3", "Mean\nTrung bình", "SD\nĐộ lệch chuẩn"].map((value) => cell(value, headerStyle)));
  const raw = exp2.rows || [];
  const eff = effectiveRows("main", raw, exp2);
  const autoParams = new Set(["Juice (%)", "Juice (norm)"]);
  params.forEach((param, index) => {
    const row = eff.find((item) => item.param === param) || { param };
    const stat = statOfRow(row);
    const auto = autoParams.has(param);
    const bg = auto ? AMBER : index % 2 === 0 ? STRIPE : "#FFFFFF";
    rows.push([
      dataCell(index + 1, { bg, format: "0" }),
      cell(`${param}\n${viParam(param, "main")}`, { ...thinBorder, backgroundColor: bg, align: "left", height: 22, fontSize: 9, fontWeight: auto ? "bold" : undefined }),
      dataCell(numOrNull(row.r1, 2), { bg, format: "0.00" }),
      dataCell(numOrNull(row.r2, 2), { bg, format: "0.00" }),
      dataCell(numOrNull(row.r3, 2), { bg, format: "0.00" }),
      dataCell(numOrNull(stat.m, 2), { bg, format: "0.00" }),
      dataCell(numOrNull(stat.s, 2), { bg, format: "0.00" }),
    ]);
  });
  rows.push(noteRow(`* Hiệu suất ép (%) = Nước ép / (khối lượng mía đúng lần đó × 1000) × 100. Tỉ lệ chuẩn hoá (%) = Hiệu suất ép × (°Bx đo / ${STANDARD_BRIX}) — hệ số hiệu chỉnh Brix của guide. Mean và SD lấy theo các lần lặp có số liệu.`, NC, 30));
  rows.push(blankRow(NC));
  rows.push(sectionRow("2.2 The brief comment (using descriptive statistics)", "Nhận xét ngắn (dùng thống kê mô tả)", NC));
  rows.push(commentRow(exp2.comment22, NC, 8));
  rows.push(blankRow(NC));
  rows.push(sectionRow("2.3 Compare the Brix of sugarcane juice with table 1.1", "So sánh °Bx nước mía với Bảng 1.1", NC));
  rows.push(commentRow(exp2.compare23, NC, 6));
  rows.push(blankRow(NC));
  rows.push(sectionRow("2.4 Evaluation of the juice 1 extracted from the bagasse (using water : bagasse = 1/1)", "Đánh giá nước mía ép lại từ bã (nước : bã = 1 : 1)", NC));
  const j1Params = ["Juice (gr)", "Bagasse (gr)", "Juice (%)", "°Bx", "pH"];
  rows.push(["No\nSTT", "Parameters\nChỉ tiêu", "Repeat 1\nLần 1", "Repeat 2\nLần 2", "Repeat 3\nLần 3", "Mean\nTrung bình", "SD\nĐộ lệch chuẩn"].map((value) => cell(value, headerStyle)));
  const effJ1 = effectiveRows("j1", exp2.j1rows || [], exp2);
  j1Params.forEach((param, index) => {
    const row = effJ1.find((item) => item.param === param) || { param };
    const stat = statOfRow(row);
    const auto = param === "Juice (%)";
    const bg = auto ? AMBER : index % 2 === 0 ? STRIPE : "#FFFFFF";
    rows.push([
      dataCell(index + 1, { bg, format: "0" }),
      cell(`${param}\n${viParam(param, "j1")}`, { ...thinBorder, backgroundColor: bg, align: "left", height: 30, fontSize: 9, fontWeight: auto ? "bold" : undefined }),
      dataCell(numOrNull(row.r1, 2), { bg, format: "0.00" }),
      dataCell(numOrNull(row.r2, 2), { bg, format: "0.00" }),
      dataCell(numOrNull(row.r3, 2), { bg, format: "0.00" }),
      dataCell(numOrNull(stat.m, 2), { bg, format: "0.00" }),
      dataCell(numOrNull(stat.s, 2), { bg, format: "0.00" }),
    ]);
  });
  rows.push(noteRow("* Hiệu suất ép 2 (%) = Nước ép 2 / (Bã 1 + nước ngâm) × 100 = Nước ép 2 / (2 × Bã 1); lượng nước ngâm theo tỉ lệ 1 : 1 với khối lượng bã ở bảng 2.1.", NC, 30));
  rows.push(blankRow(NC));
  rows.push(sectionRow("2.5 Compare the Brix of juice 1 with table 1.1", "So sánh °Bx của juice 1 với Bảng 1.1", NC));
  rows.push(commentRow(exp2.compare25, NC, 8));
  rows.push(sourceRow("Nguồn dữ liệu: báo cáo xuất từ app Sổ Thực Hành. Ký hiệu “—” = chưa có số liệu. Các dòng có nền vàng và dấu * tính tự động theo công thức trong hướng dẫn thực hành.", NC));
  return sheet("Bài 2 - Ép nước mía", 2, "Experiment 2: Sugarcane juice extraction", "Ép và đánh giá nước mía", "", meta, [6, 34, 14, 14, 14, 13, 12], rows);
}

function exercise3(meta, exp3) {
  const NC = 6;
  const rows = titleRows(3, "Experiment 3: Clarification of sugarcane juice for syrup production", "Làm trong nước mía để nấu syrup", "The clarification process required to reduce particles in sugarcane juice before heating to produce syrup, in this work, analyze the turbidity, pH, °Bx to determine the clarification effect due to the clarifying agents.", meta, NC);
  rows.push(sectionRow("3.1 Determine the clarification of sugarcane juice by using Ca(OH)2 20% (105oC/60 minutes) (0-10 marks in the turbidity) (2000g sugarcane juice from 2.1)", "Xác định hiệu quả làm trong nước mía bằng nước vôi trong Ca(OH)₂ theo liều 10/15/18% khối lượng nước mía (khuấy đều, để yên 45–60 phút), lọc qua vải, chấm độ trong 0–10", NC));
  rows.push([
    cell("Tổng khối lượng nước mía thô gộp từ bài 2:", { ...thinBorder, columnSpan: 2, bold: true, textColor: GREEN, align: "left", height: 22 }),
    null,
    dataCell(numOrNull(exp3.juiceGrams, 0), { format: "0", height: 22 }),
    ...span("g nước mía (cân thực tế khi gộp hết dịch ép lần 1 và lần 2).", NC - 3, { ...thinBorder, fontStyle: "italic", fontSize: 9, textColor: NOTE, align: "left", height: 22 }),
  ]);
  const params = ["Juice (gr)", "Mud (gr)", "Mud (%)", "Clear (gr)", "Clear (%)", "°Bx", "pH", "Turbidity"];
  const label3 = { ...PARAM_VI, "Juice (gr)": "Nước mía (g)" };
  const raw = exp3.rows || [];
  const columns = [
    ["control", `Control (${EXP3_DOSES.control}%)\nĐối chứng – vôi ${EXP3_DOSES.control}%`],
    ["g1", `Group 1 (${EXP3_DOSES.g1}%)\nNhóm 1 – vôi ${EXP3_DOSES.g1}%`],
    ["g2", `Group 2 (${EXP3_DOSES.g2}%)\nNhóm 2 – vôi ${EXP3_DOSES.g2}%`],
    ["g3", `Group 3 (${EXP3_DOSES.g3}%)\nNhóm 3 – vôi ${EXP3_DOSES.g3}%`],
  ];
  rows.push([cell("No\nSTT", headerStyle), cell("Parameters\nChỉ tiêu", headerStyle), ...columns.map(([, label]) => cell(label, headerStyle))]);
  const eff = exp3EffectiveRows(raw);
  const effRow = (param) => eff.find((row) => row.param === param);
  params.forEach((param, index) => {
    const auto = EXP3_AUTO_PARAMS.includes(param);
    const bg = auto ? AMBER : index % 2 === 0 ? STRIPE : "#FFFFFF";
    const values = columns.map(([key]) => (auto ? numOrNull(effRow(param)?.[key], 2) : numOrNull(rowByParam(raw, param)?.[key], 2)));
    const formats = { "Juice (gr)": "0.0", "Mud (gr)": "0.0", "Mud (%)": "0.00", "Clear (gr)": "0.0", "Clear (%)": "0.00", "°Bx": "0.0", pH: "0.00" };
    rows.push([
      dataCell(index + 1, { bg, format: "0" }),
      cell(`${param}\n${label3[param] || param}`, { ...thinBorder, backgroundColor: bg, align: "left", height: 32, fontSize: 9, fontWeight: auto || param === "Turbidity" ? "bold" : undefined }),
      ...values.map((value) => dataCell(value, { bg, format: formats[param] })),
    ]);
  });
  rows.push(noteRow("* Mud (%) = Cặn bùn / (Nước mía + lượng nước vôi của đúng cột) × 100, liều vôi 10/15/18% theo hướng dẫn. Clear (%) = Nước mía trong sau lọc / Nước mía thô × 100. ** Độ trong 0–10 (10 = trong nhất) được bổ sung theo mô tả 3.1; phiếu in gốc chỉ có 5 dòng nhưng yêu cầu chấm độ đục.", NC, 42));
  rows.push(blankRow(NC));
  rows.push(sectionRow("3.2 Using the data from other groups (for the repeat) and give the brief comment (using descriptive statistics)", "Dùng số liệu các nhóm khác làm lặp lại và nhận xét (dùng thống kê mô tả)", NC));
  rows.push(commentRow(exp3.comment32, NC, 10));
  rows.push(sourceRow("Nguồn dữ liệu: báo cáo xuất từ app Sổ Thực Hành. Ký hiệu “—” = chưa có số liệu. Dòng Tỉ lệ bùn (%) và Hiệu suất dịch trong (%) tính tự động theo công thức trong hướng dẫn thực hành.", NC));
  return sheet("Bài 3 - Làm trong", 3, "Experiment 3: Clarification of sugarcane juice for syrup production", "Làm trong nước mía để nấu syrup", "", meta, [6, 30, 22, 22, 22, 22], rows);
}

function exercise4(meta, exp4) {
  const NC = 7;
  const rows = titleRows(4, "Experiment 4: Concentration of the syrup", "Cô đặc syrup", "The concentration of the syrup (clear juice) that sugarcane juice obtains after the process of clarification operation is 15.0 ~ 17.0° of Bx, and water content is 83.0 ~ 85.0%. Boiling sugarcane juice, removes a large amount of moisture, is condensed into the syrup of 60.0 ~ 65.0 ° of Bx, then sends to and boil sugar.", meta, NC);
  rows.push(sectionRow("4.1 Degrees Brix and the weight of syrup during concentration (… g from 3.1)", "Độ Brix và khối lượng syrup trong quá trình cô đặc (… g từ 3.1)", NC));
  const table = netWeightRows(exp4.rows, GROUPS4.map((group) => group.w), exp4.potW);
  const coTui = (exp4.potW || []).some((w) => toNum(w) > 0);
  const dauRow = table.find((row) => toNum(row.t) === 0) || table[0];
  rows.push([
    cell("Khối lượng syrup ban đầu (g):", { ...thinBorder, columnSpan: 2, bold: true, textColor: GREEN, align: "left", height: 22 }),
    null,
    ...GROUPS4.map((group) => dataCell(numOrNull(dauRow?.[group.w], 1), { format: "0.0", height: 22 })),
    ...span("Theo thứ tự Nhóm 1 · Nhóm 2 · Nhóm 3, lấy ở dòng thời gian 0 (chưa cô đặc).", NC - 5, { ...thinBorder, fontStyle: "italic", fontSize: 9, textColor: NOTE, align: "left", height: 22 }),
  ]);
  rows.push([
    cell("Time (minute)\nThời gian (phút)", { ...headerStyle, rowSpan: 2 }),
    ...GROUPS4.flatMap((group) => span(`${group.label}\n${group.label === "Nhóm 1" ? "Group 1" : group.label === "Nhóm 2" ? "Group 2" : "Group 3"}`, 2, headerStyle)),
  ]);
  rows.push([null, ...GROUPS4.flatMap(() => [cell("°Bx", headerStyle), cell(coTui ? "Weight (g)\nKhối lượng dịch (đã trừ bì nồi)" : "Weight (g)\nKhối lượng (g)", headerStyle)])]);
  table.forEach((row, index) => {
    const bg = index % 2 === 0 ? STRIPE : "#FFFFFF";
    rows.push([
      dataCell(numOrNull(row.t, 0), { bg, bold: true, color: GREEN, format: "0" }),
      ...GROUPS4.flatMap((group) => [
        dataCell(numOrNull(row[group.bx], 1), { bg, format: "0.0" }),
        dataCell(numOrNull(row[group.w], 1), { bg, format: "0.0" }),
      ]),
    ]);
  });
  rows.push(noteRow(`Mục tiêu: nước mía sau làm trong ~15–17 °Bx → cô đặc tới syrup 60–65 °Bx. Có thể thêm/bớt mốc thời gian tùy buổi làm.${coTui ? " Khối lượng trong bảng là dịch thuần: m_dich_t = m_(nồi+dịch) − m_nồi (nồi rỗng nhập ở app); nước bay hơi W = m_0 − m_dich_t." : " Nước bay hơi W = m_0 − m_dich_t (khối lượng dòng đầu trừ dòng đang xét)."}`, NC, 24));
  rows.push(blankRow(NC));
  rows.push(sectionRow("4.2 Define the equations which express the correlation between time and °Bx / weight", "Xác định phương trình tương quan giữa thời gian và °Bx / khối lượng", NC));
  rows.push([
    cell("Nhóm", headerStyle),
    ...span("Phương trình °Bx", 4, headerStyle),
    cell("R²", headerStyle),
    cell("n", headerStyle),
  ]);
  const times = table.map((row) => row.t);
  GROUPS4.forEach((group, index) => {
    const reg = linReg(times, table.map((row) => row[group.bx]));
    const bg = index % 2 === 0 ? STRIPE : "#FFFFFF";
    rows.push([
      dataCell(group.label, { bg, bold: true, color: GREEN }),
      ...span(reg ? eqText(reg, "t") : "Chưa đủ số liệu để lập phương trình.", 4, { ...thinBorder, align: "left", height: 22 }),
      dataCell(reg ? numOrNull(reg.r2, 4) : null, { bg, format: "0.0000" }),
      dataCell(reg ? reg.n : null, { bg, format: "0" }),
    ]);
  });
  rows.push(blankRow(NC));
  rows.push([
    cell("Nhóm", headerStyle),
    ...span("Phương trình khối lượng", 4, headerStyle),
    cell("R²", headerStyle),
    cell("n", headerStyle),
  ]);
  GROUPS4.forEach((group, index) => {
    const reg = linReg(times, table.map((row) => row[group.w]));
    const bg = index % 2 === 0 ? STRIPE : "#FFFFFF";
    rows.push([
      dataCell(group.label, { bg, bold: true, color: GREEN }),
      ...span(reg ? eqText(reg, "t") : "Chưa đủ số liệu để lập phương trình.", 4, { ...thinBorder, align: "left", height: 22 }),
      dataCell(reg ? numOrNull(reg.r2, 4) : null, { bg, format: "0.0000" }),
      dataCell(reg ? reg.n : null, { bg, format: "0" }),
    ]);
  });
  rows.push(blankRow(NC));
  rows.push(sectionRow("4.3 The brief comment (using inferential statistics)", "Nhận xét ngắn (dùng thống kê suy luận)", NC));
  rows.push(commentRow(exp4.comment43, NC, 6));
  rows.push(blankRow(NC));
  rows.push(sectionRow("4.4 Draw the graphs which express the correlation between time and °Bx", "Vẽ đồ thị tương quan giữa thời gian và °Bx", NC));
  rows.push(chartRow(NC, "VẼ / DÁN BIỂU ĐỒ TẠI ĐÂY\n(Draw the graph here)\n\nTrục X: Time (minute)  ·  Trục Y: °Bx"));
  rows.push(blankRow(NC));
  rows.push(sectionRow("4.5 The brief comment", "Nhận xét ngắn", NC));
  rows.push(commentRow(exp4.comment45, NC, 4));
  rows.push(blankRow(NC));
  rows.push(sectionRow("4.6 Draw the graphs which express the correlation between time and weight", "Vẽ đồ thị tương quan giữa thời gian và khối lượng", NC));
  rows.push(chartRow(NC, "VẼ / DÁN BIỂU ĐỒ TẠI ĐÂY\n(Draw the graph here)\n\nTrục X: Time (minute)  ·  Trục Y: Weight (g)"));
  rows.push(blankRow(NC));
  rows.push(sectionRow("4.7 The brief comment", "Nhận xét ngắn", NC));
  rows.push(commentRow(exp4.comment47, NC, 4));
  rows.push(sourceRow("Nguồn dữ liệu: báo cáo xuất từ app Sổ Thực Hành. Ký hiệu “—” = chưa có số liệu. Các phương trình được tính tự động từ dữ liệu hiện có.", NC));
  return sheet("Bài 4 - Cô đặc syrup", 4, "Experiment 4: Concentration of the syrup", "Cô đặc syrup", "", meta, [14, 16, 16, 16, 16, 16, 16], rows);
}

function exercise5(meta, exp5) {
  const NC = 6;
  const rows = titleRows(5, "Experiment 5: Crystallization of sugar", "Kết tinh đường", "Crystallization is the (natural or artificial) process of formation of solid crystals precipitating from a solution. The formation of the crystalline phase from supersaturated solutions can occur by either a spontaneous or a forced nucleation mechanism.", meta, NC);
  rows.push(sectionRow("5.1 Using syrup of 4.1, carry out the crystallization process and record", "Dùng syrup ở 4.1 tiến hành kết tinh và ghi chép quá trình", NC));
  const seed = exp5.seedGrams === "" || exp5.seedGrams == null ? EXP5_SEED : exp5.seedGrams;
  rows.push([
    cell("Số liệu cân (g):", { ...thinBorder, columnSpan: 2, bold: true, textColor: GREEN, align: "left", height: 26 }),
    null,
    cell("Dịch bão hoà", headerStyle),
    cell(`Mầm (g)\nđể trống = ${EXP5_SEED}`, headerStyle),
    cell("Đường thu được", headerStyle),
    cell("H kết tinh (%) *", headerStyle),
  ]);
  rows.push([
    ...span("H (%) = đường thu được / (dịch bão hoà + mầm) × 100.", 2, { ...thinBorder, fontStyle: "italic", fontSize: 9, textColor: NOTE, align: "left", height: 24 }),
    null,
    dataCell(numOrNull(exp5.syrupGrams, 1), { format: "0.0" }),
    dataCell(numOrNull(seed, 1), { format: "0.0" }),
    dataCell(numOrNull(exp5.productGrams, 1), { format: "0.0" }),
    dataCell(numOrNull(crystalPct(exp5.productGrams, exp5.syrupGrams, seed), 2), { format: "0.00", bg: AMBER, bold: true }),
  ]);
  rows.push(noteRow("Ghi: khối lượng syrup đem nấu, nhiệt độ, thời gian, hiện tượng quá bão hòa / gieo mầm (tự phát hay cưỡng bức), thời gian xuất hiện tinh thể, thu hồi…", NC, 30));
  rows.push(commentRow(exp5.record51, NC, 10));
  rows.push(blankRow(NC));
  rows.push(sectionRow("5.2 The brief comment", "Nhận xét ngắn", NC));
  rows.push(commentRow(exp5.comment52, NC, 6));
  rows.push(sourceRow("Nguồn dữ liệu: báo cáo xuất từ app Sổ Thực Hành. Ký hiệu “—” = chưa có số liệu. Dòng nền vàng * tính tự động theo công thức trong hướng dẫn.", NC));
  return sheet("Bài 5 - Kết tinh", 5, "Experiment 5: Crystallization of sugar", "Kết tinh đường", "", meta, [18, 18, 18, 18, 18, 18], rows);
}

function exercise6(meta, exp6) {
  const NC = 6;
  const rows = titleRows(6, "Experiment 6: Processing the product from sugar", "Chế biến sản phẩm từ đường", "Objectives: Upon completion of the experiment, you will be able to: (1) Discuss the relationship between the influence of factors and the quality of product; (2) Compare the advantages and disadvantages of the use of the processing technology; (3) Evaluate the product.", meta, NC);
  rows.push(sectionRow("6.1 Name of the product", "Tên sản phẩm", NC));
  rows.push(fullRow(exp6.name || "", NC, { ...thinBorder, fontSize: 11, align: "left", height: 28 }));
  rows.push(blankRow(NC));
  rows.push(sectionRow("6.2 Describe the product", "Mô tả sản phẩm", NC));
  rows.push(commentRow(exp6.desc, NC, 4));
  rows.push(blankRow(NC));
  rows.push(sectionRow("6.3 Describe the process chart", "Mô tả sơ đồ quy trình (process chart)", NC));
  rows.push(noteRow("Mỗi dòng một công đoạn: Nguyên liệu → … → Thành phẩm. Ghi kèm thông số (nhiệt độ, thời gian, °Bx).", NC, 20));
  rows.push([
    cell("Step\nBước", headerStyle),
    ...span("Operation\nCông đoạn", 2, headerStyle),
    ...span("Parameters\nThông số", 2, headerStyle),
    cell("Notes\nGhi chú", headerStyle),
  ]);
  const processLines = String(exp6.process || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const processCount = Math.max(6, processLines.length);
  for (let index = 0; index < processCount; index++) {
    const line = processLines[index] || "";
    const lineHeight = Math.max(22, 14 * Math.ceil(Math.max(1, line.length) / 42) + 6);
    rows.push([
      dataCell(index + 1, { bold: true, color: GREEN, format: "0", height: lineHeight }),
      ...span(line, 2, { ...thinBorder, align: "left", height: lineHeight }),
      ...span("", 2, { ...thinBorder, height: lineHeight }),
      dataCell("", { height: lineHeight }),
    ]);
  }
  rows.push(blankRow(NC));
  rows.push(sectionRow("6.4 Compare the advantages and disadvantages of the use of the processing technology", "So sánh ưu / nhược điểm của công nghệ chế biến", NC));
  rows.push([...span("Ưu điểm (Advantages)", 3, headerStyle), ...span("Nhược điểm (Disadvantages)", 3, headerStyle)]);
  rows.push([
    ...span(exp6.adv || "", 3, {
      ...thinBorder,
      align: "left",
      alignVertical: "top",
      height: Math.max(60, 18 * Math.max(1, textLines(exp6.adv), textLines(exp6.disadv))),
    }),
    ...span(exp6.disadv || "", 3, {
      ...thinBorder,
      align: "left",
      alignVertical: "top",
      height: Math.max(60, 18 * Math.max(1, textLines(exp6.adv), textLines(exp6.disadv))),
    }),
  ]);
  rows.push(blankRow(NC));
  rows.push(sectionRow("6.5 Discuss the factors which act on the quality of product", "Các yếu tố ảnh hưởng chất lượng sản phẩm", NC));
  rows.push(commentRow(exp6.factors, NC, 6));
  rows.push(blankRow(NC));
  rows.push(sectionRow("6.6 Recovery of the candy products", "Hiệu suất thu hồi kẹo", NC));
  rows.push([
    cell("Sản phẩm", headerStyle),
    cell("Tổng nguyên liệu (g)", headerStyle),
    cell("Thành phẩm (g)", headerStyle),
    cell("H kẹo (%) *", headerStyle),
    ...span("Phối liệu chuẩn của hướng dẫn", 2, headerStyle),
  ]);
  [
    { key: "gummy", label: "Kẹo dẻo gelatin", raw: EXP6_RAW.gummy, recipe: "50 nước trái cây/sữa + 15 gelatin + 90 đường + 35 nước + 7 chanh" },
    { key: "nut", label: "Kẹo đậu phộng", raw: EXP6_RAW.nut, recipe: "50 đậu rang + 80 đường + 38 nước + 0,5 muối + 5 chanh" },
  ].forEach((p, index) => {
    const stored = exp6[`${p.key}Raw`];
    const rawUsed = stored === "" || stored == null ? p.raw : stored;
    const product = exp6[`${p.key}Product`];
    const bg = index % 2 === 0 ? STRIPE : "#FFFFFF";
    rows.push([
      dataCell(p.label, { bg, bold: true, color: GREEN, align: "left" }),
      dataCell(numOrNull(rawUsed, 1), { bg, format: "0.0" }),
      dataCell(numOrNull(product, 1), { bg, format: "0.0" }),
      dataCell(numOrNull(candyPct(product, rawUsed), 2), { bg, format: "0.00", bold: true }),
      ...span(p.recipe, 2, { ...thinBorder, align: "left", fontSize: 9, textColor: NOTE, backgroundColor: bg }),
    ]);
  });
  rows.push(noteRow("* H (%) = kẹo thành phẩm / tổng nguyên liệu đầu vào × 100. Để trống tổng nguyên liệu trong app = dùng khối lượng phối liệu chuẩn của hướng dẫn.", NC, 26));
  rows.push(sourceRow("Nguồn dữ liệu: báo cáo xuất từ app Sổ Thực Hành. Ký hiệu “—” = chưa có số liệu.", NC));
  return sheet("Bài 6 - Sản phẩm", 6, "Experiment 6: Processing the product from sugar", "Chế biến sản phẩm từ đường", "", meta, [16, 20, 20, 20, 20, 20], rows);
}

export async function buildReportXlsx(report) {
  const { default: writeXlsxFile } = await import("write-excel-file/universal");
  const meta = report?.meta || {};
  const sheets = [
    exercise1(meta, report?.exp1 || {}),
    exercise2(meta, report?.exp2 || {}),
    exercise3(meta, report?.exp3 || {}),
    exercise4(meta, report?.exp4 || {}),
    exercise5(meta, report?.exp5 || {}),
    exercise6(meta, report?.exp6 || {}),
  ];
  return writeXlsxFile(sheets, { fontFamily: "Calibri", fontSize: 10 }).toBlob();
}
