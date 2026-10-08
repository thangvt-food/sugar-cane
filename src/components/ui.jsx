// Component dùng chung cho cả 2 layout (input số, textarea, thẻ section, mô tả gốc).
export function NumInput({ value, onChange, placeholder = "—", ariaLabel, min, max }) {
  return (
    <input
      className="num-input"
      inputMode="decimal"
      type="number"
      step="any"
      value={value ?? ""}
      min={min}
      max={max}
      placeholder={placeholder}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function BigText({ value, onChange, rows = 4, placeholder = "Nhập nhận xét / mô tả…" }) {
  return (
    <textarea
      className="big-text"
      rows={rows}
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function SectionCard({ id, title, hint, children, accent }) {
  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h3>{title}</h3>
        {hint && <p className="hint">{hint}</p>}
      </div>
      <div className="card-body">{children}</div>
      {accent && <div className="card-accent">{accent}</div>}
    </section>
  );
}

export function DescBlock({ text }) {
  return <p className="desc-block">{text}</p>;
}

export function AutoTag({ children }) {
  return <span className="auto-tag" title="Tự tính, không cần nhập">{children}</span>;
}

export function RegLine({ label, eq }) {
  return (
    <div className="reg-line">
      <b>{label}:</b> <code>{eq}</code>
    </div>
  );
}
