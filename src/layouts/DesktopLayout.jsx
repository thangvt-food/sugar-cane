// Giao diện PC: sidebar trái + nội dung rộng. Cây DOM hoàn toàn riêng với MobileLayout.
import { NavLink } from "react-router-dom";
import { useRef } from "react";
import { EXPERIMENTS } from "../lib/experimentsMeta";
import { useReport } from "../store/ReportContext";
import { useAuth } from "../auth/AuthContext";

export function SaveBadge({ state }) {
  const map = {
    saved: ["● Đã lưu", "ok"],
    saving: ["● Đang lưu…", "busy"],
    error: ["● Lỗi lưu cloud (vẫn giữ local)", "err"],
    offline: ["● Ngoại tuyến (lưu máy)", "err"],
  };
  const [label, cls] = map[state] || map.saved;
  return <span className={`save-badge ${cls}`}>{label}</span>;
}

export function useIO() {
  const { exportJSON, importJSON, resetAll } = useReport();
  const fileRef = useRef(null);
  const download = () => {
    const blob = new Blob([exportJSON()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "so-thuc-hanh-duong-mia.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      try {
        importJSON(JSON.parse(rd.result));
        alert("Đã nhập số liệu từ file.");
      } catch {
        alert("File không hợp lệ.");
      }
    };
    rd.readAsText(f);
    e.target.value = "";
  };
  return { download, onFile, fileRef, resetAll };
}

export default function DesktopLayout({ children, progress }) {
  const { report, update, saveState } = useReport();
  const { user, logout } = useAuth();
  const io = useIO();

  return (
    <div className="desk">
      <aside className="desk-side">
        <div className="brand">
          <span className="brand-icon">◈</span>
          <div>
            <b>Sổ thực hành</b>
            <small>Công nghệ đường mía</small>
          </div>
        </div>
        <nav className="side-nav">
          {EXPERIMENTS.map((e) => (
            <NavLink key={e.id} to={e.path} className={({ isActive }) => `side-link${isActive ? " active" : ""}`}>
              <span className="side-no">{e.no}</span>
              <span>{e.short}</span>
            </NavLink>
          ))}
        </nav>
        <div className="side-foot">
          <div className="progress"><i style={{ width: `${progress}%` }} /><span>{progress}% hoàn thành</span></div>
          <SaveBadge state={saveState} />
          <div className="io-row">
            <button className="btn secondary sm" onClick={io.download}>Xuất JSON</button>
            <button className="btn secondary sm" onClick={() => io.fileRef.current?.click()}>Nhập</button>
            <button className="btn secondary sm" onClick={() => window.print()}>In PDF</button>
          </div>
          <input ref={io.fileRef} type="file" accept="application/json" hidden onChange={io.onFile} />
          <button className="btn danger sm" onClick={io.resetAll}>Xóa trắng</button>
          <div className="user-box">
            <small>{user?.email}</small>
            <button className="btn ghost sm" onClick={logout}>Đăng xuất</button>
          </div>
        </div>
      </aside>
      <div className="desk-main">
        <header className="desk-top">
          <div className="meta-grid">
            <label>Group:
              <input className="text-input" value={report.meta.group}
                onChange={(e) => update(["meta", "group"], e.target.value)} placeholder="VD: 2" />
            </label>
            <label>Students' name:
              <input className="text-input" value={report.meta.students}
                onChange={(e) => update(["meta", "students"], e.target.value)} placeholder="Họ tên các thành viên, cách nhau bởi dấu phẩy" />
            </label>
          </div>
        </header>
        <main className="desk-content">{children}</main>
      </div>
    </div>
  );
}
