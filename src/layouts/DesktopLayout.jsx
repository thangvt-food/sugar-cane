// Giao diện PC: sidebar trái + nội dung rộng. Cây DOM hoàn toàn riêng với MobileLayout.
import { NavLink } from "react-router-dom";
import { useRef, useState } from "react";
import { EXPERIMENTS } from "../lib/experimentsMeta";
import { useReport } from "../store/ReportContext";
import { useAuth } from "../auth/AuthContext";
import { SyncStatus } from "../components/SyncStatus";
import { buildReportXlsx } from "../lib/reportXlsx";

export function useIO() {
  const { report, exportJSON, importJSON, resetAll } = useReport();
  const fileRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const download = () => {
    const blob = new Blob([exportJSON()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "so-thuc-hanh-duong-mia.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const downloadXLSX = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const blob = await buildReportXlsx(report);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "so-thuc-hanh-duong-mia.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error("[xlsx-export] failed", err);
      alert(`Không xuất được Excel: ${err?.message || err}`);
    } finally {
      setExporting(false);
    }
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
  return { download, downloadXLSX, exporting, onFile, fileRef, resetAll };
}

export default function DesktopLayout({ children, progress }) {
  const { report, update } = useReport();
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
          <SyncStatus />
          <div className="io-row">
            <button className="btn secondary sm" onClick={io.downloadXLSX} disabled={io.exporting} title="Excel 6 sheet, có định dạng">
              {io.exporting ? "Đang xuất…" : "Xuất Excel"}
            </button>
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
