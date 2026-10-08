// Firebase — Auth + Firestore (Analytics optional, guarded).
// API key của Firebase là public theo thiết kế; vẫn nên đưa vào .env khi deploy.
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY || "AIzaSyBpasZ72EgIovTCVHokMpTYiXWdQolB1qc",
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN || "ant05-efa02.firebaseapp.com",
  databaseURL:
    import.meta.env.VITE_FB_DB_URL || "https://ant05-efa02-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FB_PROJECT_ID || "ant05-efa02",
  storageBucket: import.meta.env.VITE_FB_BUCKET || "ant05-efa02.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FB_SENDER || "314608297930",
  appId: import.meta.env.VITE_FB_APP_ID || "1:314608297930:web:6bd7efdc38efa70bd0d133",
  measurementId: import.meta.env.VITE_FB_MEASUREMENT || "G-ZZF8BE2C3J",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Analytics chỉ chạy trên browser HTTPS, lỗi thì bỏ qua (không chặn app).
try {
  if (typeof window !== "undefined") {
    import("firebase/analytics").then(({ getAnalytics, isSupported }) => {
      isSupported()
        .then((ok) => ok && getAnalytics(app))
        .catch(() => {});
    });
  }
} catch {
  /* bỏ qua */
}

export default app;
