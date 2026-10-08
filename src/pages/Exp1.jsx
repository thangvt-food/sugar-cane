import { useReport } from "../store/ReportContext";
import { EXPERIMENTS } from "../lib/experimentsMeta";
import { eqText, fmt, linReg } from "../lib/stats";
import { AutoTag, BigText, DescBlock, NumInput, RegLine, SectionCard } from "../components/ui";
import { Exp1Chart } from "../components/charts";

const meta = EXPERIMENTS[0];

export default function Exp1({ mode }) {
  const { report, update } = useReport();
  const exp = report.exp1;
  const mobile = mode === "mobile";
  const concs = exp.table.map((r) => r.conc);

  const regs = ["g1", "g2", "g3"].map((k, i) =>
    linReg(concs, exp.table.map((r) => r[k]))
  );

  const setCell = (idx, key, v) => update(["exp1", "table", idx, key], v);

  return (
    <div className="exp">
      <h2>{meta.title}</h2>
      <DescBlock text={meta.intro} />

      <SectionCard
        title="1.1 — Lượng đường / nước và nồng độ dung dịch (°Bx) (100 g dung dịch)"
        hint="Đường lý thuyết = nồng độ % (g/100 g); Nước = 100 − đường. Cột Group 1/2/3: nhập °Bx đo thực tế bằng khúc xạ kế."
      >
        {!mobile ? (
          <div className="table-wrap">
            <table className="dt">
              <thead>
                <tr>
                  <th>Nồng độ (%)</th>
                  <th>Đường (g) <AutoTag>auto</AutoTag></th>
                  <th>Nước (g) <AutoTag>auto</AutoTag></th>
                  <th>Group 1: °Bx đo</th>
                  <th>Group 2: °Bx đo</th>
                  <th>Group 3: °Bx đo</th>
                </tr>
              </thead>
              <tbody>
                {exp.table.map((r, i) => (
                  <tr key={r.conc}>
                    <td><b>{r.conc}</b></td>
                    <td className="auto">{fmt(r.conc, 1)}</td>
                    <td className="auto">{fmt(100 - r.conc, 1)}</td>
                    {(["g1", "g2", "g3"]).map((k) => (
                      <td key={k}>
                        <NumInput value={r[k]} ariaLabel={`${k} conc ${r.conc}`} onChange={(v) => setCell(i, k, v)} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="m-cards">
            {exp.table.map((r, i) => (
              <div className="m-card" key={r.conc}>
                <div className="m-card-head">
                  <b>{r.conc}%</b>
                  <span className="hint">đường {fmt(r.conc, 1)} g · nước {fmt(100 - r.conc, 1)} g</span>
                </div>
                <div className="m-grid3">
                  {[["g1", "Gr 1 °Bx"], ["g2", "Gr 2 °Bx"], ["g3", "Gr 3 °Bx"]].map(([k, label]) => (
                    <label key={k}>{label}
                      <NumInput value={r[k]} ariaLabel={label} onChange={(v) => setCell(i, k, v)} />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="regs">
          {regs.map((r, i) => (
            <RegLine key={i} label={`Group ${i + 1} (hồi quy tuyến tính)`} eq={eqText(r, "C%")} />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="1.2 — Phương trình tương quan nồng độ (%) và °Bx">
        <BigText rows={3} value={exp.equations} onChange={(v) => update(["exp1", "equations"], v)}
          placeholder="VD: Group 1: °Bx = 0.98·C + 0.12 (R² = 0.999) — chép/sửa theo kết quả hồi quy trên…" />
      </SectionCard>

      <SectionCard title="1.3 — Nhận xét (brief comment)">
        <BigText rows={4} value={exp.comment13} onChange={(v) => update(["exp1", "comment13"], v)} />
      </SectionCard>

      <SectionCard title="1.4 — Đồ thị tương quan nồng độ (%) và °Bx">
        <Exp1Chart rows={exp.table} height={mobile ? 280 : 340} />
      </SectionCard>

      <SectionCard title="1.5 — Nhận xét đồ thị">
        <BigText rows={5} value={exp.comment15} onChange={(v) => update(["exp1", "comment15"], v)} />
      </SectionCard>
    </div>
  );
}
