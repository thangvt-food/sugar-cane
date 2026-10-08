import { useEffect, useState } from "react";

// Phân biệt mobile / desktop: kết hợp chiều rộng + touch + UA.
// Dùng để RENDER 2 cây giao diện riêng, không chỉ bẻ CSS.
export function useDevice() {
  const detect = () => {
    const narrow = window.matchMedia("(max-width: 900px)").matches;
    const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const uaMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    return narrow || (touch && uaMobile) ? "mobile" : "desktop";
  };
  const [device, setDevice] = useState(() => (typeof window === "undefined" ? "desktop" : detect()));
  useEffect(() => {
    const onChange = () => setDevice(detect());
    window.addEventListener("resize", onChange);
    window.addEventListener("orientationchange", onChange);
    return () => {
      window.removeEventListener("resize", onChange);
      window.removeEventListener("orientationchange", onChange);
    };
  }, []);
  return device;
}
