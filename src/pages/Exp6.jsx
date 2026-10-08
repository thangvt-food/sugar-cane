import { useReport } from "../store/ReportContext";
import { EXPERIMENTS } from "../lib/experimentsMeta";
import { BigText, DescBlock, SectionCard } from "../components/ui";

const meta = EXPERIMENTS[5];

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
    </div>
  );
}
