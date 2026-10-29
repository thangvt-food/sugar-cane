import { useReport } from "../store/ReportContext";
import { EXPERIMENTS } from "../lib/experimentsMeta";
import { eqText, fmt, linReg, toNum } from "../lib/stats";
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

  const setRows = (rows) => update(["exp1", "table"], rows);
  const setCell = (idx, key, v) => update(["exp1", "table", idx, key], v);

  // Nước chỉ tự đổi khi chưa bị sửa tay (vẫn đang = 100 − nồng độ cũ).
  const setConc = (idx, v) => {
    const row = exp.table[idx];
    const c = toNum(v);
    const w = toNum(row.water);
    const auto = row.water === "" || Number.isNaN(w) || w === 100 - toNum(row.conc);
    setCell(idx, "conc", v);
    if (auto && !Number.isNaN(c)) setCell(idx, "water", String(100 - c));
  };

  const addRow = () => setRows([...exp.table, { conc: "", water: "", g1: "", g2: "", g3: "" }]);
  const delRow = (i) => {
    if (exp.table.length <= 1) return;
    setRows(exp.table.filter((_, j) => j !== i));
  };

  const waterOf = (r) => r.water ?? (Number.isNaN(toNum(r.conc)) ? "" : String(100 - toNum(r.conc)));

  return (
    <div className="exp">
      <h2>{meta.title}</h2>
      <DescBlock text={meta.intro} />

      <SectionCard
        title="1.1 — Lượng đường / nước và nồng độ dung dịch (°Bx) (100 g dung dịch)"
        hint="Đường lý thuyết = nồng độ % (g/100 g). Nước mặc định = 100 − đường, sửa được theo lượng cân thực tế. Cột Group 1/2/3: nhập °Bx đo thực tế bằng khúc xạ kế. Nồng độ có thể sửa, thêm hoặc xóa tùy mẻ đường chuẩn của nhóm."
      >
        {!mobile ? (
          <>
            <div className="table-wrap">
              <table className="dt">
                <thead>
                  <tr>
                    <th>Nồng độ (%)</th>
                    <th>Đường (g) <AutoTag>auto</AutoTag></th>
                    <th>Nước (g)</th>
                    <th>Group 1: °Bx đo</th>
                    <th>Group 2: °Bx đo</th>
                    <th>Group 3: °Bx đo</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {exp.table.map((r, i) => (
                    <tr key={i}>
                      <td><NumInput value={r.conc} ariaLabel={`nồng độ dòng ${i + 1}`} onChange={(v) => setConc(i, v)} /></td>
                      <td className="auto">{fmt(toNum(r.conc), 1)}</td>
                      <td><NumInput value={waterOf(r)} ariaLabel={`nước dòng ${i + 1}`} onChange={(v) => setCell(i, "water", v)} /></td>
                      {(["g1", "g2", "g3"]).map((k) => (
                        <td key={k}>
                          <NumInput value={r[k]} ariaLabel={`${k} dòng ${i + 1}`} onChange={(v) => setCell(i, k, v)} />
                        </td>
                      ))}
                      <td><button className="btn danger sm" onClick={() => delRow(i)} aria-label={`xóa nồng độ dòng ${i + 1}`}>×</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="btn secondary" onClick={addRow}>+ Thêm nồng độ</button>
          </>
        ) : (
          <div className="m-cards">
            {exp.table.map((r, i) => (
              <div className="m-card" key={i}>
                <div className="m-card-head">
                  <label className="m-row2">Nồng độ (%)
                    <NumInput value={r.conc} ariaLabel={`nồng độ dòng ${i + 1}`} onChange={(v) => setConc(i, v)} />
                  </label>
                  <button className="btn danger sm" onClick={() => delRow(i)}>Xóa</button>
                </div>
                <div className="inline-field">
                  <span>Đường (g):</span>
                  <b>{fmt(toNum(r.conc), 1)}</b>
                </div>
                <div className="inline-field">
                  <span>Nước (g):</span>
                  <NumInput value={waterOf(r)} ariaLabel={`nước dòng ${i + 1}`} onChange={(v) => setCell(i, "water", v)} />
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
            <button className="btn secondary" onClick={addRow}>+ Thêm nồng độ</button>
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
