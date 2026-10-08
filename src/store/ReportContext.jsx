import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../auth/AuthContext";
import { EXP1_CONC } from "../lib/experimentsMeta";

const LS_KEY = "sugarcane-lab-report-v1";

export const defaultReport = () => ({
  meta: { group: "", students: "", updatedAt: "" },
  exp1: {
    table: EXP1_CONC.map((conc) => ({ conc, g1: "", g2: "", g3: "" })),
    equations: "",
    comment13: "",
    comment15: "",
  },
  exp2: {
    caneKg: "",
    rows: ["Juice (gr)", "Bagasse (gr)", "Juice (%)", "Juice (norm)", "°Bx", "pH", "Colour", "Flavour", "Taste", "Clarity", "State"].map((p) => ({ param: p, r1: "", r2: "", r3: "" })),
    comment22: "",
    compare23: "",
    j1rows: ["Juice (gr)", "Bagasse (gr)", "Juice (%)", "°Bx", "pH"].map((p) => ({ param: p, r1: "", r2: "", r3: "" })),
    compare25: "",
  },
  exp3: {
    juiceGrams: "2000",
    rows: ["Juice (gr)", "Mud (gr)", "Mud (%)", "°Bx", "pH"].map((p) => ({ param: p, control: "", g1: "", g2: "", g3: "" })),
    comment32: "",
  },
  exp4: {
    initialGrams: "",
    rows: [0, 15, 30, 45, 60, 90].map((t) => ({ t, g1bx: "", g1w: "", g2bx: "", g2w: "", g3bx: "", g3w: "" })),
    eq1: "",
    eq2: "",
    eq3: "",
    comment43: "",
    comment45: "",
    comment47: "",
  },
  exp5: { record51: "", comment52: "" },
  exp6: { name: "", desc: "", process: "", adv: "", disadv: "", factors: "" },
});

function setPath(obj, path, value) {
  const next = structuredClone(obj);
  let cur = next;
  for (let i = 0; i < path.length - 1; i++) {
    cur = cur[path[i]];
  }
  cur[path[path.length - 1]] = value;
  return next;
}

const ReportCtx = createContext(null);
export const useReport = () => useContext(ReportCtx);

export function ReportProvider({ children }) {
  const { user } = useAuth();
  const [report, setReport] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return { ...defaultReport(), ...JSON.parse(raw) };
    } catch { /* ignore */ }
    return defaultReport();
  });
  const [saveState, setSaveState] = useState("saved"); // saved | saving | error | offline
  const [loadedUid, setLoadedUid] = useState(null);
  const timer = useRef(null);

  // Tải báo cáo của user từ Firestore khi đăng nhập.
  useEffect(() => {
    if (!user) {
      setLoadedUid(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "reports", user.uid));
        if (!cancelled && snap.exists()) {
          setReport({ ...defaultReport(), ...snap.data().data });
        }
        if (!cancelled) setLoadedUid(user.uid);
      } catch {
        if (!cancelled) setSaveState("offline");
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  // Autosave: localStorage luôn, Firestore khi đã đăng nhập (debounce 800ms).
  useEffect(() => {
    setSaveState("saving");
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(report));
    } catch { /* ignore */ }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      if (!user) {
        setSaveState("saved");
        return;
      }
      try {
        await setDoc(
          doc(db, "reports", user.uid),
          { data: report, email: user.email, updatedAt: new Date().toISOString() },
          { merge: true }
        );
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    }, 800);
    return () => clearTimeout(timer.current);
  }, [report, user]);

  const update = useCallback((path, value) => {
    setReport((prev) => setPath(prev, path, value));
  }, []);

  const resetAll = useCallback(() => {
    if (window.confirm("Xóa toàn bộ số liệu đã nhập? (bản cloud vẫn còn tới lần autosave sau)")) {
      setReport(defaultReport());
    }
  }, []);

  const importJSON = useCallback((obj) => setReport({ ...defaultReport(), ...obj }), []);
  const exportJSON = useCallback(() => JSON.stringify(report, null, 2), [report]);

  // % hoàn thành: đếm ô đã điền trên tổng ô yêu cầu.
  const progress = useMemo(() => {
    const strings = [];
    const walk = (o) => {
      if (typeof o === "string") strings.push(o);
      else if (Array.isArray(o)) o.forEach(walk);
      else if (o && typeof o === "object") Object.values(o).forEach(walk);
    };
    walk(report);
    const total = strings.length || 1;
    const filled = strings.filter((s) => String(s).trim() !== "").length;
    return Math.round((filled / total) * 100);
  }, [report]);

  return (
    <ReportCtx.Provider value={{ report, update, saveState, progress, loadedUid, resetAll, importJSON, exportJSON }}>
      {children}
    </ReportCtx.Provider>
  );
}
