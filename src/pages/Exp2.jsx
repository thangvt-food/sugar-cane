import { useReport } from "../store/ReportContext";
import { EXPERIMENTS } from "../lib/experimentsMeta";
import { fmt, rowMeanSd } from "../lib/stats";
import { AutoTag, BigText, DescBlock, NumInput, SectionCard } from "../components/ui";

const meta = EXPERIMENTS[1];

function RepeatTable({ rows, onCell, mobile, meanSd = true }) {
  if (!mobile) {
    return (
      <div className="table-wrap">
        <table className="dt">
          <thead>
            <tr>
              <th>No</th><th>Parameters</th><th>Repeat 1</th><th>Repeat 2</th><th>Repeat 3</th>
              {meanSd && <><th>Mean <AutoTag>auto</AutoTag></th><th>SD <AutoTag>auto</AutoTag></th></>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const { m, s } = rowMeanSd(r.r1, r.r2, r.r3);
              return (
                <tr key={r.param}>
                  <td>{i + 1}</td>
                  <td className="param">{r.param}</td>
                  {(["r1", "r2", "r3"]).map((k) => (
                    <td key={k}><NumInput value={r[k]} ariaLabel={`${r.param} ${k}`} onChange={(v) => onCell(i, k, v)} /></td>
                  ))}
                  {meanSd && <><td className="auto">{fmt(m)}</td><td className="auto">{fmt(s)}</td></>}
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
      {rows.map((r, i) => {
        const { m, s } = rowMeanSd(r.r1, r.r2, r.r3);
        return (
          <div className="m-card" key={r.param}>
            <div className="m-card-head"><b>{i + 1}. {r.param}</b>
              {meanSd && <span className="hint">mean {fmt(m)} · SD {fmt(s)}</span>}
            </div>
            <div className="m-grid3">
              {[["r1", "Lần 1"], ["r2", "Lần 2"], ["r3", "Lần 3"]].map(([k, label]) => (
                <label key={k}>{label}
                  <NumInput value={r[k]} ariaLabel={label} onChange={(v) => onCell(i, k, v)} />
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Exp2({ mode }) {
  const { report, update } = useReport();
  const exp = report.exp2;
  const mobile = mode === "mobile";

  return (
    <div className="exp">
      <h2>{meta.title}</h2>
      <DescBlock text={meta.intro} />

      <SectionCard
        title="2.1 — Đánh giá nước mía (0–10 điểm cảm quan theo chất lượng)"
        hint="Nhập khối lượng mía đem ép. Juice (%) và Juice (norm) có thể nhập tay hoặc xem mean/SD tự tính. Các chỉ tiêu cảm quan Colour/Flavour/Taste/Clarity/State chấm 0–10."
      >
        <label className="inline-field">Khối lượng mía đem ép (kg):
          <input className="num-input w120" inputMode="decimal" type="number" step="any"
            value={exp.caneKg} onChange={(e) => update(["exp2", "caneKg"], e.target.value)} placeholder="VD: 5" />
        </label>
        <RepeatTable rows={exp.rows} mobile={mobile}
          onCell={(i, k, v) => update(["exp2", "rows", i, k], v)} />
      </SectionCard>

      <SectionCard title="2.2 — Nhận xét (thống kê mô tả: mean ± SD)">
        <BigText rows={5} value={exp.comment22}
          onChange={(v) => update(["exp2", "comment22"], v)}
          placeholder="VD: Hiệu suất ép trung bình …% (SD…), °Bx … ± …, pH … ± …; điểm cảm quan cao nhất là… Biến động lớn nhất ở…" />
      </SectionCard>

      <SectionCard title="2.3 — So sánh °Bx nước mía với bảng 1.1">
        <BigText rows={4} value={exp.compare23}
          onChange={(v) => update(["exp2", "compare23"], v)}
          placeholder="VD: °Bx nước mía (≈ …) tương đương dung dịch đường …% ở bảng 1.1, suy ra hàm lượng chất khô hòa tan xấp xỉ…%" />
      </SectionCard>

      <SectionCard
        title="2.4 — Đánh giá nước mía 1 ép từ bã (water : bagasse = 1/1)"
        hint="Ngâm bã với nước tỉ lệ 1:1 rồi ép lại, ghi như bảng 2.1."
      >
        <RepeatTable rows={exp.j1rows} mobile={mobile}
          onCell={(i, k, v) => update(["exp2", "j1rows", i, k], v)} />
      </SectionCard>

      <SectionCard title="2.5 — So sánh °Bx của juice 1 với bảng 1.1">
        <BigText rows={6} value={exp.compare25}
          onChange={(v) => update(["exp2", "compare25"], v)}
          placeholder="So sánh °Bx juice 1 với juice nguyên và bảng 1.1; giải thích vì sao °Bx giảm (pha loãng, đường còn lại trong bã)…" />
      </SectionCard>
    </div>
  );
}
