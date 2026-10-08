import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { ReportProvider, useReport } from "./store/ReportContext";
import { useDevice } from "./hooks/useDevice";
import DesktopLayout from "./layouts/DesktopLayout";
import MobileLayout from "./layouts/MobileLayout";
import AuthPage from "./pages/AuthPage";
import Exp1 from "./pages/Exp1";
import Exp2 from "./pages/Exp2";
import Exp3 from "./pages/Exp3";
import Exp4 from "./pages/Exp4";
import Exp5 from "./pages/Exp5";
import Exp6 from "./pages/Exp6";

function Shell() {
  const { user, loading } = useAuth();
  const { progress } = useReport();
  const device = useDevice();

  if (loading) return <div className="loading">Đang tải…</div>;
  if (!user) return <AuthPage />;

  const Layout = device === "mobile" ? MobileLayout : DesktopLayout;
  return (
    <Layout progress={progress}>
      <Routes>
        <Route path="/" element={<Navigate to="/exp1" replace />} />
        <Route path="/exp1" element={<Exp1 mode={device} />} />
        <Route path="/exp2" element={<Exp2 mode={device} />} />
        <Route path="/exp3" element={<Exp3 mode={device} />} />
        <Route path="/exp4" element={<Exp4 mode={device} />} />
        <Route path="/exp5" element={<Exp5 mode={device} />} />
        <Route path="/exp6" element={<Exp6 mode={device} />} />
        <Route path="*" element={<Navigate to="/exp1" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ReportProvider>
        <HashRouter>
          <Shell />
        </HashRouter>
      </ReportProvider>
    </AuthProvider>
  );
}
