import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#16a34a", "#2563eb", "#dc2626"];

function ChartBox({ title, sub, data, xKey, lines, yLabel, height }) {
  if (!data.length) return <p className="hint">Nhập số liệu để vẽ biểu đồ.</p>;
  return (
    <div className="chart-box">
      <h4>{title}</h4>
      {sub && <p className="hint">{sub}</p>}
      <ResponsiveContainer width="100%" height={height || 300}>
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: -8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} label={{ value: xKey, position: "insideBottomRight", fontSize: 11 }} />
          <YAxis tick={{ fontSize: 12 }} label={{ value: yLabel || "", angle: -90, position: "insideLeft", fontSize: 11 }} />
          <Tooltip />
          <Legend />
          {lines.map((l, i) => (
            <Line key={l.key} type="monotone" dataKey={l.key} name={l.name} stroke={COLORS[i % 3]} strokeWidth={2} dot connectNulls />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// 1.4: nồng độ (%) — °Bx, 3 line group 1/2/3.
export function Exp1Chart({ rows, height }) {
  const data = rows
    .map((r) => {
      const o = { conc: Number(r.conc) };
      ["g1", "g2", "g3"].forEach((k) => {
        const v = Number(String(r[k]).replace(",", "."));
        if (Number.isFinite(v) && r[k] !== "") o[k] = v;
      });
      return o;
    })
    .filter((o) => o.g1 !== undefined || o.g2 !== undefined || o.g3 !== undefined);
  return (
    <ChartBox
      title="1.4 — Tương quan nồng độ (%) và °Bx"
      sub="Trục X: nồng độ lý thuyết (%). 3 đường: Group 1 / 2 / 3."
      data={data}
      xKey="conc"
      yLabel="°Bx"
      height={height}
      lines={[
        { key: "g1", name: "Group 1" },
        { key: "g2", name: "Group 2" },
        { key: "g3", name: "Group 3" },
      ]}
    />
  );
}

// 4.4: thời gian — °Bx ; 4.6: thời gian — khối lượng.
export function Exp4Chart({ rows, mode, height }) {
  const isBx = mode === "bx";
  const keys = isBx ? ["g1bx", "g2bx", "g3bx"] : ["g1w", "g2w", "g3w"];
  const names = ["Group 1", "Group 2", "Group 3"];
  const data = rows
    .map((r) => {
      const o = { t: Number(String(r.t).replace(",", ".")) };
      if (!Number.isFinite(o.t)) return null;
      keys.forEach((k) => {
        const v = Number(String(r[k]).replace(",", "."));
        if (r[k] !== "" && Number.isFinite(v)) o[k] = v;
      });
      return o;
    })
    .filter(Boolean)
    .filter((o) => keys.some((k) => o[k] !== undefined))
    .sort((a, b) => a.t - b.t);
  return (
    <ChartBox
      title={isBx ? "4.4 — Tương quan thời gian và °Bx" : "4.6 — Tương quan thời gian và khối lượng"}
      sub="Trục X: thời gian (phút)."
      data={data}
      xKey="t"
      yLabel={isBx ? "°Bx" : "g"}
      height={height}
      lines={keys.map((k, i) => ({ key: k, name: names[i] }))}
    />
  );
}
