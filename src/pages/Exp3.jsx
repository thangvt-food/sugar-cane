import { useReport } from "../store/ReportContext";
import { EXPERIMENTS, EXP3_COLS } from "../lib/experimentsMeta";
import { BigText, DescBlock, NumInput, SectionCard } from "../components/ui";

const meta = EXPERIMENTS[2];

export default function Exp3({ mode }) {
  const { report, update } = useReport();
  const exp = report.exp3;
  const mobile = mode === "mobile";
  const setCell = (i, k, v) => update(["exp3", "rows", i, k], v);

  return (
    <div className="exp">
      <h2>{meta.title}</h2>
      <DescBlock text={meta.intro} />

      <SectionCard
        title="3.1 — Làm trong bằng Ca(OH)₂ 20% (105°C / 60 phút), chấm độ đục 0–10"
        hint="Mẫu 2000 g nước mía từ 2.1. Mud (%) = Mud (gr) / Juice (gr) × 100 — có thể để app gợi ý, ô vẫn nhập tay được."
      >
        <label className="inline-field">Lượng nước mía làm thí nghiệm (g):
          <input className="num-input w120" inputMode="decimal" type="number" step="any"
            value={exp.juiceGrams} onChange={(e) => update(["exp3", "juiceGrams"], e.target.value)} />
        </label>
        {!mobile ? (
          <div className="table-wrap">
            <table className="dt">
              <thead>
                <tr>
                  <th>No</th><th>Parameters</th>
                  {EXP3_COLS.map((c) => <th key={c.key}>{c.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {exp.rows.map((r, i) => (
                  <tr key={r.param}>
                    <td>{i + 1}</td>
                    <td className="param">{r.param}</td>
                    {EXP3_COLS.map((c) => (
                      <td key={c.key}>
                        <NumInput value={r[c.key]} ariaLabel={`${r.param} ${c.label}`} onChange={(v) => setCell(i, c.key, v)} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="m-cards">
            {EXP3_COLS.map((c) => (
              <div className="m-card" key={c.key}>
                <div className="m-card-head"><b>{c.label}</b></div>
                {exp.rows.map((r, i) => (
                  <label className="m-row2" key={r.param}>{r.param}
                    <NumInput value={r[c.key]} ariaLabel={r.param} onChange={(v) => setCell(i, c.key, v)} />
                  </label>
                ))}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="3.2 — Nhận xét dùng số liệu các nhóm khác (lặp lại) + thống kê mô tả">
        <BigText rows={7} value={exp.comment32}
          onChange={(v) => update(["exp3", "comment32"], v)}
          placeholder="VD: Liều vôi 5/10/15% cho Mud … ± …%, pH … ± …, °Bx … ± …; mức 10% trong nhất (điểm đục cao nhất), liều cao làm pH tăng và tổn thất đường…" />
      </SectionCard>
    </div>
  );
}
