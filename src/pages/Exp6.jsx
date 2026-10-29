import { useReport } from "../store/ReportContext";
import { EXPERIMENTS } from "../lib/experimentsMeta";
import { fmt } from "../lib/stats";
import { EXP6_RAW, candyPct } from "../lib/formulas";
import { AutoTag, BigText, DescBlock, SectionCard } from "../components/ui";

const meta = EXPERIMENTS[5];

const PRODUCTS = [
  { key: "gummy", label: "Kẹo dẻo gelatin", raw: EXP6_RAW.gummy, recipe: "50 nước trái cây/sữa + 15 gelatin + 90 đường + 35 nước + 7 chanh" },
  { key: "nut", label: "Kẹo đậu phộng", raw: EXP6_RAW.nut, recipe: "50 đậu rang + 80 đường + 38 nước + 0,5 muối + 5 chanh" },
];

export default function Exp6() {
  const { report, update } = useReport();
  const exp = report.exp6;
  return (
    <div className="exp">
      <h2>{meta.title}</h2>
      <DescBlock text={meta.intro} />
      <SectionCard title="6.1 — Tên sản phẩm">
        <input className="text-input" value={exp.name}
          onChange={(e) => update(["exp6", "name"], e.target.value)}
          placeholder="VD: Kẹo lạc đường mía / Đường thốt nốt…" />
      </SectionCard>
      <SectionCard title="6.2 — Mô tả sản phẩm">
        <BigText rows={4} value={exp.desc} onChange={(v) => update(["exp6", "desc"], v)}
          placeholder="Màu sắc, mùi, vị, cấu trúc, bao bì, chỉ tiêu cảm quan…" />
      </SectionCard>
      <SectionCard
        title="6.3 — Sơ đồ quy trình (process chart)"
        hint="Mỗi dòng một công đoạn: Nguyên liệu → … → Thành phẩm. Ghi kèm thông số (nhiệt độ, thời gian, °Bx)."
      >
        <BigText rows={8} value={exp.process} onChange={(v) => update(["exp6", "process"], v)}
          placeholder={"VD:\n1. Chuẩn bị nguyên liệu: …\n2. Phối trộn: …\n3. Nấu / cô đặc …°C … phút\n4. Tạo hình…\n5. Bao gói…"} />
      </SectionCard>
      <SectionCard title="6.4 — Ưu / nhược điểm của công nghệ chế biến">
        <div className="two-col">
          <label className="stack">Ưu điểm
            <BigText rows={5} value={exp.adv} onChange={(v) => update(["exp6", "adv"], v)} />
          </label>
          <label className="stack">Nhược điểm
            <BigText rows={5} value={exp.disadv} onChange={(v) => update(["exp6", "disadv"], v)} />
          </label>
        </div>
      </SectionCard>
      <SectionCard title="6.5 — Các yếu tố ảnh hưởng chất lượng sản phẩm">
        <BigText rows={6} value={exp.factors} onChange={(v) => update(["exp6", "factors"], v)}
          placeholder="Nguyên liệu, °Bx, pH, nhiệt độ, thời gian, vệ sinh, bao bì, bảo quản…" />
      </SectionCard>
      <SectionCard
        title="6.6 — Hiệu suất thu hồi kẹo"
        hint="Tổng nguyên liệu lấy theo công thức phối liệu của hướng dẫn (để trống = dùng số chuẩn); chỉ cần cân thành phẩm là tính được H(%)."
      >
        {PRODUCTS.map((p) => {
          const raw = exp[`${p.key}Raw`];
          const rawUsed = raw === "" || raw == null ? p.raw : raw;
          const h = candyPct(exp[`${p.key}Product`], rawUsed);
          return (
            <div className="cane-multi" key={p.key}>
              <span className="inline-field">{p.label}</span>
              <div className="m-grid2">
                <label>
                  Tổng nguyên liệu (g)
                  <input
                    className="num-input" inputMode="decimal" type="number" step="any"
                    value={raw ?? ""} onChange={(e) => update(["exp6", `${p.key}Raw`], e.target.value)}
                    placeholder={`Để trống = ${p.raw}`}
                  />
                </label>
                <label>
                  Kẹo thành phẩm (g)
                  <input
                    className="num-input" inputMode="decimal" type="number" step="any"
                    value={exp[`${p.key}Product`] ?? ""} onChange={(e) => update(["exp6", `${p.key}Product`], e.target.value)}
                    placeholder="VD: 180"
                  />
                </label>
              </div>
              <p className="hint tiny">Phối liệu chuẩn: {p.recipe} = {p.raw} g.</p>
              {Number.isNaN(h) ? (
                <p className="hint">Cân thành phẩm để tính H keo (%) = kẹo thành phẩm / tổng nguyên liệu × 100.</p>
              ) : (
                <div className="auto-box">
                  <div className="auto-box-head">
                    <b>🍬 Hiệu suất thu hồi <AutoTag>tự tính</AutoTag></b>
                    <span className="hint tiny">H (%) = kẹo thành phẩm / tổng nguyên liệu đầu vào × 100 — hao hụt do bốc hơi nước và dính dụng cụ.</span>
                  </div>
                  <p className="auto-text">{fmt(exp[`${p.key}Product`], 1)} g / {fmt(rawUsed, 1)} g = <b>{fmt(h, 2)}%</b></p>
                </div>
              )}
            </div>
          );
        })}
      </SectionCard>
    </div>
  );
}
