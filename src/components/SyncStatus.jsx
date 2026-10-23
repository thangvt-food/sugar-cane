import { useState } from "react";
import { useReport } from "../store/ReportContext";
import { formatSyncError, syncOperationLabel } from "../lib/cloudDebug";

const STATES = {
  saved: ["● Đã lưu", "ok"],
  saving: ["● Đang lưu…", "busy"],
  error: ["● Lỗi sync cloud", "err"],
  offline: ["● Ngoại tuyến (lưu máy)", "err"],
};

export function SaveBadge({ state, error, onClick }) {
  const [label, cls] = STATES[state] || STATES.saved;
  const title = error ? `${error.code}: ${error.message}` : undefined;
  if (error) {
    return (
      <button
        type="button"
        className={`save-badge ${cls} has-error`}
        onClick={onClick}
        title={title}
      >
        {label} · xem
      </button>
    );
  }
  return <span className={`save-badge ${cls}`} title={title}>{label}</span>;
}

function SyncDebugPanel({ info, onClose, onRetry }) {
  const [copied, setCopied] = useState(false);
  const text = formatSyncError(info);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("[cloud-sync] copy failed", err);
      window.prompt("Sao chép nội dung lỗi:", text);
    }
  };

  return (
    <div className="sync-debug" role="dialog" aria-label="Chi tiết lỗi đồng bộ cloud">
      <div className="sync-debug-head">
        <b>Lỗi đồng bộ cloud</b>
        <button type="button" className="btn ghost sm" onClick={onClose}>Đóng</button>
      </div>
      <dl className="sync-debug-grid">
        <dt>Thao tác</dt><dd>{syncOperationLabel(info.operation)}</dd>
        <dt>Mã lỗi</dt><dd><code>{info.code}</code></dd>
        <dt>Thông báo</dt><dd>{info.message}</dd>
        <dt>Gợi ý</dt><dd>{info.hint}</dd>
        <dt>Project</dt><dd>{info.projectId || "—"}</dd>
        <dt>UID</dt><dd>{info.uid || "—"}</dd>
        <dt>Email</dt><dd>{info.email || "—"}</dd>
        <dt>Mạng</dt><dd>{info.online ? "Online" : "Offline"}</dd>
        <dt>Thời điểm</dt><dd>{info.at ? new Date(info.at).toLocaleString("vi-VN") : "—"}</dd>
        {info.customData && <><dt>customData</dt><dd><code>{info.customData}</code></dd></>}
      </dl>
      <div className="sync-debug-actions">
        <button type="button" className="btn secondary sm" onClick={copy}>
          {copied ? "Đã sao chép" : "Sao chép"}
        </button>
        <button type="button" className="btn secondary sm" onClick={onRetry}>
          {info.operation === "load" ? "Tải lại trang" : "Thử lại lưu"}
        </button>
      </div>
      <p className="hint tiny">
        Chi tiết đầy đủ kèm stack trace đã được in ở DevTools Console với tiền tố [cloud-sync].
        Dữ liệu trên máy vẫn được giữ trong localStorage.
      </p>
    </div>
  );
}

export function SyncStatus() {
  const { saveState, syncError, retrySync } = useReport();
  const [open, setOpen] = useState(false);

  return (
    <div className="sync-status">
      <SaveBadge state={saveState} error={syncError} onClick={() => setOpen(true)} />
      {open && syncError && (
        <SyncDebugPanel info={syncError} onClose={() => setOpen(false)} onRetry={retrySync} />
      )}
    </div>
  );
}
