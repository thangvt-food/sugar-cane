import { useReport } from "../store/ReportContext";
import { EXPERIMENTS } from "../lib/experimentsMeta";
import { BigText, DescBlock, SectionCard } from "../components/ui";

const meta = EXPERIMENTS[4];

export default function Exp5() {
  const { report, update } = useReport();
  const exp = report.exp5;
  return (
    <div className="exp">
      <h2>{meta.title}</h2>
      <DescBlock text={meta.intro} />
      <SectionCard
        title="5.1 — Dùng syrup ở 4.1 tiến hành kết tinh, ghi chép quá trình"
        hint="Ghi: khối lượng syrup đem nấu, nhiệt độ, thời gian, hiện tượng quá bão hòa / gieo mầm (tự phát hay cưỡng bức), thời gian xuất hiện tinh thể, thu hồi…"
      >
        <BigText rows={10} value={exp.record51}
          onChange={(v) => update(["exp5", "record51"], v)}
          placeholder="VD: Syrup 62 °Bx … g → đun …°C trong … phút → để nguội / gieo mầm bằng… → sau … giờ xuất hiện tinh thể… Thu được … g đường non…" />
      </SectionCard>
      <SectionCard title="5.2 — Nhận xét">
        <BigText rows={6} value={exp.comment52} onChange={(v) => update(["exp5", "comment52"], v)} />
      </SectionCard>
    </div>
  );
}
