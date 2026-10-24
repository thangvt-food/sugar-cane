// Giao diện MOBILE: topbar gọn + chip chương + bottom tab. Cây DOM riêng với DesktopLayout.
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { EXPERIMENTS } from "../lib/experimentsMeta";
import { useReport } from "../store/ReportContext";
import { useAuth } from "../auth/AuthContext";
import { useIO } from "./DesktopLayout";
import { SyncStatus } from "../components/SyncStatus";

export default function MobileLayout({ children, progress }) {
  const { report, update } = useReport();
  const { user, logout } = useAuth();
  const io = useIO();
  const [more, setMore] = useState(false);

  useEffect(() => {
    if (!more) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMore(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [more]);

  return (
    <div className="mob">
      <div className="mob-header">
        <header className="mob-top">
          <div className="mob-brand"><span className="brand-icon">◈</span><b>Sổ đường mía</b></div>
          <SyncStatus />
          <button
            type="button"
            className="btn ghost sm"
            onClick={() => setMore((v) => !v)}
            aria-label={more ? "Đóng menu" : "Mở menu"}
            aria-expanded={more}
            aria-haspopup="dialog"
          >
            <span aria-hidden="true">{more ? "×" : "☰"}</span>
          </button>
        </header>

        {more && (
          <div className="mob-menu-layer">
            <button
              type="button"
              className="mob-menu-backdrop"
              aria-label="Đóng menu"
              onClick={() => setMore(false)}
            />
            <section id="mobile-menu" className="mob-sheet" role="dialog" aria-modal="true" aria-labelledby="mobile-menu-title">
              <div className="mob-menu-handle" aria-hidden="true" />
              <div className="mob-menu-head">
                <h2 id="mobile-menu-title">Tùy chọn</h2>
                <button type="button" className="btn ghost sm" onClick={() => setMore(false)} aria-label="Đóng menu">×</button>
              </div>
              <div className="mob-menu-section">
                <h3>Thông tin nhóm</h3>
                <label>Group:
                  <input className="text-input" value={report.meta.group}
                    onChange={(e) => update(["meta", "group"], e.target.value)} placeholder="VD: 2" />
                </label>
                <label>Students' name:
                  <input className="text-input" value={report.meta.students}
                    onChange={(e) => update(["meta", "students"], e.target.value)} placeholder="Họ tên thành viên…" />
                </label>
                <div className="progress"><i style={{ width: `${progress}%` }} /><span>{progress}% hoàn thành</span></div>
              </div>
              <div className="mob-menu-section">
                <h3>Dữ liệu</h3>
                <div className="io-row wrap">
                  <button className="btn secondary sm" onClick={() => { setMore(false); io.downloadXLSX(); }} disabled={io.exporting} title="Excel 6 sheet, có định dạng">
                    {io.exporting ? "Đang xuất…" : "Xuất Excel"}
                  </button>
                  <button className="btn secondary sm" onClick={() => { setMore(false); io.download(); }}>Xuất JSON</button>
                  <button className="btn secondary sm" onClick={() => { setMore(false); io.fileRef.current?.click(); }}>Nhập JSON</button>
                  <button className="btn secondary sm" onClick={() => { setMore(false); window.print(); }}>In PDF</button>
                  <button className="btn danger sm" onClick={() => { setMore(false); io.resetAll(); }}>Xóa trắng</button>
                </div>
                <input ref={io.fileRef} type="file" accept="application/json" hidden onChange={io.onFile} />
              </div>
              <div className="mob-menu-section mob-menu-account">
                <h3>Tài khoản</h3>
                <div className="user-box row">
                  <small>{user?.email}</small>
                  <button className="btn ghost sm" onClick={() => { setMore(false); logout(); }}>Đăng xuất</button>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

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
