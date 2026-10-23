const HINTS = {
  "permission-denied": "Firestore Rules đang chặn user này. Kiểm tra đã Publish rules cho /reports/{uid} và uid trên document khớp user đang đăng nhập.",
  unauthenticated: "Chưa có phiên đăng nhập hoặc token đã hết hạn. Đăng xuất rồi đăng nhập lại.",
  unavailable: "Không kết nối được Firestore (mất mạng, bị chặn, hoặc dịch vụ tạm lỗi). Dữ liệu vẫn nằm trong localStorage; thử lại khi có mạng.",
  "failed-precondition": "Firestore chưa được bật hoặc chưa tạo database cho project. Mở Firebase Console → Firestore Database → Create database.",
  "not-found": "Sai projectId hoặc database không tồn tại. Kiểm tra firebaseConfig trong src/firebase.js và các biến VITE_FB_*.",
  "resource-exhausted": "Hết quota đọc/ghi Firestore (gói miễn phí). Kiểm tra Usage trong Firebase Console.",
  "invalid-argument": "Dữ liệu gửi lên Firestore không hợp lệ hoặc quá lớn. Kiểm tra report/JSON vừa nhập.",
  "deadline-exceeded": "Firestore phản hồi quá lâu. Thử lại sau.",
  cancelled: "Yêu cầu đồng bộ bị hủy giữa chừng. Thử lại.",
  "already-exists": "Document đã tồn tại ở trạng thái không cho ghi đè. Kiểm tra rules.",
  aborted: "Giao dịch bị hủy do tranh chấp. Thử lại.",
  "out-of-range": "Dữ liệu vượt giới hạn Firestore. Kiểm tra kích thước report.",
  unimplemented: "Tính năng Firestore này chưa được hỗ trợ. Kiểm tra cấu hình/project.",
  internal: "Lỗi nội bộ Firestore. Thử lại; nếu lặp lại kiểm tra Firebase Status.",
  "data-loss": "Dữ liệu bị mất/hỏng. Kiểm tra lại bản JSON và thử nhập lại.",
};

const OPERATION_LABELS = {
  load: "Tải báo cáo từ cloud",
  save: "Lưu báo cáo lên cloud",
};

export function syncOperationLabel(operation) {
  return OPERATION_LABELS[operation] || operation || "Đồng bộ cloud";
}

function serializeCustomData(value) {
  if (!value) return undefined;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function syncErrorInfo(operation, err, context = {}) {
  const rawCode = String(err?.code || "unknown");
  const code = rawCode.replace(/^firestore\//, "");
  return {
    operation,
    code: rawCode,
    name: err?.name || "Error",
    message: err?.message || String(err || "Không rõ lỗi"),
    hint: HINTS[code] || "Xem message/stack trong DevTools Console để biết chi tiết.",
    customData: serializeCustomData(err?.customData),
    ...context,
    at: new Date().toISOString(),
  };
}

export function logSyncError(operation, err, context = {}) {
  const info = syncErrorInfo(operation, err, context);
  console.group(`[cloud-sync] ${syncOperationLabel(operation)} thất bại — ${info.code}`);
  console.error("message:", info.message);
  console.error("hint:", info.hint);
  console.info("context:", context);
  console.info("original error:", err);
  if (info.customData) console.info("customData:", info.customData);
  console.groupEnd();
  return info;
}

export function formatSyncError(info) {
  if (!info) return "";
  return [
    `Lỗi đồng bộ cloud: ${syncOperationLabel(info.operation)}`,
    `Mã lỗi: ${info.code}`,
    `Thông báo: ${info.message}`,
    `Gợi ý: ${info.hint}`,
    `Project: ${info.projectId || "—"}`,
    `UID: ${info.uid || "—"}`,
    `Email: ${info.email || "—"}`,
    `Mạng: ${info.online ? "online" : "offline"}`,
    `Thời điểm: ${info.at}`,
    info.customData ? `customData: ${info.customData}` : "",
  ].filter(Boolean).join("\n");
}
