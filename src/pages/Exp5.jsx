import { useReport } from "../store/ReportContext";
import { EXPERIMENTS } from "../lib/experimentsMeta";
import { fmt } from "../lib/stats";
import { EXP5_SEED, crystalPct } from "../lib/formulas";
import { AutoTag, BigText, DescBlock, SectionCard } from "../components/ui";

const meta = EXPERIMENTS[4];
const SEED_GRAMS = EXP5_SEED; // hướng dẫn: cân chính xác 10 g đường cát làm mầm

export default function Exp5() {
  const { report, update } = useReport();
  const exp = report.exp5;
  const seed = exp.seedGrams === "" || exp.seedGrams == null ? SEED_GRAMS : exp.seedGrams;
  const h = crystalPct(exp.productGrams, exp.syrupGrams, seed);
  return (
    <div className="exp">
      <h2>{meta.title}</h2>
      <DescBlock text={meta.intro} />
      <SectionCard
        title="5.1 — Dùng syrup ở 4.1 tiến hành kết tinh, ghi chép quá trình"
        hint="Ghi: khối lượng syrup đem nấu, nhiệt độ, thời gian, hiện tượng quá bão hòa / gieo mầm (tự phát hay cưỡng bức), thời gian xuất hiện tinh thể, thu hồi…"
      >
        <div className="cane-multi">
          <span className="inline-field">Số liệu cân (g):</span>
          <div className="m-grid3">
            <label>
              Dịch bão hoà
              <input
                className="num-input" inputMode="decimal" type="number" step="any"
                value={exp.syrupGrams ?? ""} onChange={(e) => update(["exp5", "syrupGrams"], e.target.value)}
                placeholder="VD: 1000"
              />
            </label>
            <label>
              Mầm đường
              <input
                className="num-input" inputMode="decimal" type="number" step="any"
                value={exp.seedGrams ?? ""} onChange={(e) => update(["exp5", "seedGrams"], e.target.value)}
                placeholder={`Để trống = ${SEED_GRAMS}`}
              />
            </label>
            <label>
              Đường thu được
              <input
                className="num-input" inputMode="decimal" type="number" step="any"
                value={exp.productGrams ?? ""} onChange={(e) => update(["exp5", "productGrams"], e.target.value)}
                placeholder="VD: 900"
              />
            </label>
          </div>
        </div>
        {Number.isNaN(h) ? (
          <p className="hint">
            Nhập khối lượng dịch bão hoà và đường thu được để app tính hiệu suất theo hướng dẫn:
            H kết tinh (%) = đường thu / (dịch bão hoà + mầm) × 100 — mầm mặc định {SEED_GRAMS} g.
          </p>
        ) : (
          <div className="auto-box">
            <div className="auto-box-head">
              <b>⚗️ Hiệu suất kết tinh <AutoTag>tự tính</AutoTag></b>
              <span className="hint tiny">H (%) = đường thu được / (dịch bão hoà + mầm) × 100, theo hướng dẫn bài 5.</span>
            </div>
            <p className="auto-text">
              {fmt(exp.productGrams, 1)} g đường / ({fmt(exp.syrupGrams, 1)} g dịch + {fmt(seed, 1)} g mầm) ={" "}
              <b>{fmt(h, 2)}%</b>
            </p>
          </div>
        )}
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
