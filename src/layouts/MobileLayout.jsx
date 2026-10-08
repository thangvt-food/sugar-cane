// Giao diện MOBILE: topbar gọn + chip chương + bottom tab. Cây DOM riêng với DesktopLayout.
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { EXPERIMENTS } from "../lib/experimentsMeta";
import { useReport } from "../store/ReportContext";
import { useAuth } from "../auth/AuthContext";
import { SaveBadge, useIO } from "./DesktopLayout";

export default function MobileLayout({ children, progress }) {
  const { report, update, saveState } = useReport();
  const { user, logout } = useAuth();
  const io = useIO();
  const [more, setMore] = useState(false);

  return (
    <div className="mob">
      <header className="mob-top">
        <div className="mob-brand"><span className="brand-icon">◈</span><b>Sổ đường mía</b></div>
        <SaveBadge state={saveState} />
        <button className="btn ghost sm" onClick={() => setMore((v) => !v)} aria-label="menu">☰</button>
      </header>

      {more && (
        <div className="mob-sheet">
          <label>Group:
            <input className="text-input" value={report.meta.group}
              onChange={(e) => update(["meta", "group"], e.target.value)} placeholder="VD: 2" />
          </label>
          <label>Students' name:
            <input className="text-input" value={report.meta.students}
              onChange={(e) => update(["meta", "students"], e.target.value)} placeholder="Họ tên thành viên…" />
          </label>
          <div className="progress"><i style={{ width: `${progress}%` }} /><span>{progress}%</span></div>
          <div className="io-row wrap">
            <button className="btn secondary sm" onClick={io.download}>Xuất JSON</button>
            <button className="btn secondary sm" onClick={() => io.fileRef.current?.click()}>Nhập</button>
            <button className="btn secondary sm" onClick={() => window.print()}>In PDF</button>
            <button className="btn danger sm" onClick={io.resetAll}>Xóa trắng</button>
          </div>
          <input ref={io.fileRef} type="file" accept="application/json" hidden onChange={io.onFile} />
          <div className="user-box row">
            <small>{user?.email}</small>
            <button className="btn ghost sm" onClick={logout}>Đăng xuất</button>
          </div>
        </div>
      )}

      <nav className="mob-chips">
        {EXPERIMENTS.map((e) => (
          <NavLink key={e.id} to={e.path} className={({ isActive }) => `chip${isActive ? " active" : ""}`}>
            {e.no}. {e.short}
          </NavLink>
        ))}
      </nav>

      <main className="mob-content">{children}</main>

      <nav className="mob-tabs">
        {EXPERIMENTS.map((e) => (
          <NavLink key={e.id} to={e.path} className={({ isActive }) => `mob-tab${isActive ? " active" : ""}`}>
            <span className="tab-no">{e.no}</span>
            <small>{e.short}</small>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
