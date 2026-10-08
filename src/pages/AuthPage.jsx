import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

export default function AuthPage() {
  const { login, register, loginGoogle } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      if (mode === "login") await login(email, password);
      else await register(email, password);
    } catch (ex) {
      setErr(friendly(ex?.code));
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setErr("");
    try {
      await loginGoogle();
    } catch (ex) {
      setErr(friendly(ex?.code));
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="brand big"><span className="brand-icon">◈</span></div>
        <h1>Sổ Thực Hành</h1>
        <p className="hint">Sweeteners & Cane Sugar Technology — nhập số liệu, nhận xét, vẽ biểu đồ tự động. Đăng nhập để đồng bộ Firestore.</p>
        <div className="auth-tabs">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Đăng nhập</button>
          <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>Đăng ký</button>
        </div>
        <form onSubmit={submit} className="auth-form">
          <input className="text-input" type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="text-input" type="password" required minLength={6} placeholder="Mật khẩu (≥ 6 ký tự)" value={password} onChange={(e) => setPassword(e.target.value)} />
          {err && <p className="err">{err}</p>}
          <button className="btn primary" disabled={busy}>{busy ? "…" : mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}</button>
        </form>
        <button className="btn secondary" onClick={google}>Đăng nhập bằng Google</button>
        <p className="hint tiny">Chưa đăng nhập vẫn dùng được — số liệu lưu trên máy, đăng nhập sẽ đồng bộ cloud.</p>
      </div>
    </div>
  );
}

function friendly(code) {
  const m = {
    "auth/invalid-email": "Email không hợp lệ.",
    "auth/user-not-found": "Chưa có tài khoản này.",
    "auth/wrong-password": "Sai mật khẩu.",
    "auth/invalid-credential": "Sai email hoặc mật khẩu.",
    "auth/email-already-in-use": "Email đã được đăng ký.",
    "auth/weak-password": "Mật khẩu quá yếu (≥ 6 ký tự).",
    "auth/popup-closed-by-user": "Đã đóng cửa sổ Google.",
  };
  return m[code] || "Đăng nhập thất bại, thử lại.";
}
