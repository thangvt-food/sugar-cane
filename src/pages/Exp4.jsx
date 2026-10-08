import { useReport } from "../store/ReportContext";
import { EXPERIMENTS } from "../lib/experimentsMeta";
import { eqText, linReg } from "../lib/stats";
import { BigText, DescBlock, NumInput, RegLine, SectionCard } from "../components/ui";
import { Exp4Chart } from "../components/charts";

const meta = EXPERIMENTS[3];
const GROUPS = [
  { bx: "g1bx", w: "g1w", label: "Group 1" },
  { bx: "g2bx", w: "g2w", label: "Group 2" },
  { bx: "g3bx", w: "g3w", label: "Group 3" },
];

export default function Exp4({ mode }) {
  const { report, update } = useReport();
  const exp = report.exp4;
  const mobile = mode === "mobile";
  const setCell = (i, k, v) => update(["exp4", "rows", i, k], v);

  const ts = exp.rows.map((r) => r.t);
  const regBx = GROUPS.map((g) => linReg(ts, exp.rows.map((r) => r[g.bx])));
  const regW = GROUPS.map((g) => linReg(ts, exp.rows.map((r) => r[g.w])));

  const addRow = () => update(["exp4", "rows"], [...exp.rows, { t: "", g1bx: "", g1w: "", g2bx: "", g2w: "", g3bx: "", g3w: "" }]);
  const delRow = (i) => {
    if (exp.rows.length <= 1) return;
    update(["exp4", "rows"], exp.rows.filter((_, j) => j !== i));
  };

  return (
    <div className="exp">
      <h2>{meta.title}</h2>
      <DescBlock text={meta.intro} />

      <SectionCard
        title="4.1 — °Bx và khối lượng syrup trong quá trình cô đặc"
        hint="Nước mía sau làm trong ~15–17 °Bx, cô tới 60–65 °Bx. Thêm/bớt dòng thời gian tùy buổi làm."
      >
        <label className="inline-field">Khối lượng đầu (g, từ 3.1):
          <input className="num-input w120" inputMode="decimal" type="number" step="any"
            value={exp.initialGrams} onChange={(e) => update(["exp4", "initialGrams"], e.target.value)} />
        </label>
        {!mobile ? (
          <div className="table-wrap">
            <table className="dt">
              <thead>
                <tr>
                  <th rowSpan={2}>Time (min)</th>
                  {GROUPS.map((g) => <th key={g.label} colSpan={2}>{g.label}</th>)}
                  <th rowSpan={2}></th>
                </tr>
                <tr>
                  {GROUPS.map((g) => [<th key={g.bx}>°Bx</th>, <th key={g.w}>Weight (g)</th>])}
                </tr>
              </thead>
              <tbody>
                {exp.rows.map((r, i) => (
                  <tr key={i}>
                    <td><NumInput value={r.t} ariaLabel="time" onChange={(v) => setCell(i, "t", v)} /></td>
                    {GROUPS.map((g) => [
                      <td key={g.bx}><NumInput value={r[g.bx]} ariaLabel={`${g.label} Bx`} onChange={(v) => setCell(i, g.bx, v)} /></td>,
                      <td key={g.w}><NumInput value={r[g.w]} ariaLabel={`${g.label} weight`} onChange={(v) => setCell(i, g.w, v)} /></td>,
                    ])}
                    <td><button className="btn danger sm" onClick={() => delRow(i)}>×</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="m-cards">
            {exp.rows.map((r, i) => (
              <div className="m-card" key={i}>
                <div className="m-card-head">
                  <label className="m-row2">Phút thứ <NumInput value={r.t} ariaLabel="time" onChange={(v) => setCell(i, "t", v)} /></label>
                  <button className="btn danger sm" onClick={() => delRow(i)}>Xóa</button>
                </div>
                {GROUPS.map((g) => (
                  <div className="m-grid2" key={g.label}>
                    <b>{g.label}</b>
                    <label>°Bx<NumInput value={r[g.bx]} ariaLabel="bx" onChange={(v) => setCell(i, g.bx, v)} /></label>
                    <label>g<NumInput value={r[g.w]} ariaLabel="w" onChange={(v) => setCell(i, g.w, v)} /></label>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        <button className="btn secondary" onClick={addRow}>+ Thêm mốc thời gian</button>
        <div className="regs">
          {regBx.map((r, i) => <RegLine key={i} label={`${GROUPS[i].label}: time–°Bx`} eq={eqText(r, "t")} />)}
          {regW.map((r, i) => <RegLine key={i} label={`${GROUPS[i].label}: time–weight`} eq={eqText(r, "t")} />)}
        </div>
      </SectionCard>

      <SectionCard title="4.2 — Phương trình tương quan time – °Bx / weight">
        {[["eq1", "Repeat 1"], ["eq2", "Repeat 2"], ["eq3", "Repeat 3"]].map(([k, label]) => (
          <label className="stack" key={k}>{label}
            <BigText rows={2} value={exp[k]} onChange={(v) => update(["exp4", k], v)}
              placeholder={`VD: °Bx = …·t + … (R² = …); W = …·t + … (R² = …)`} />
          </label>
        ))}
      </SectionCard>

      <SectionCard title="4.3 — Nhận xét (thống kê suy luận)">
        <BigText rows={5} value={exp.comment43} onChange={(v) => update(["exp4", "comment43"], v)} />
      </SectionCard>

      <SectionCard title="4.4 — Đồ thị time – °Bx">
        <Exp4Chart rows={exp.rows} mode="bx" height={mobile ? 260 : 320} />
      </SectionCard>

      <SectionCard title="4.5 — Nhận xét đồ thị time – °Bx">
        <BigText rows={3} value={exp.comment45} onChange={(v) => update(["exp4", "comment45"], v)} />
      </SectionCard>

      <SectionCard title="4.6 — Đồ thị time – weight">
        <Exp4Chart rows={exp.rows} mode="weight" height={mobile ? 260 : 320} />
      </SectionCard>

      <SectionCard title="4.7 — Nhận xét đồ thị time – weight">
        <BigText rows={3} value={exp.comment47} onChange={(v) => update(["exp4", "comment47"], v)} />
      </SectionCard>
    </div>
  );
}
