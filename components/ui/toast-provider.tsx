"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface ToastCtx {
  show: (message: string) => void;
}

const Ctx = createContext<ToastCtx>({ show: () => {} });

export function useToast() {
  return useContext(Ctx);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState("");
  const [visible, setVisible] = useState(false);

  const show = useCallback((message: string) => {
    setMsg(message);
    setVisible(true);
    setTimeout(() => setVisible(false), 2000);
  }, []);

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      {/* Toast element */}
      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[999] px-5 py-3 rounded-2xl bg-white/90 backdrop-blur-md text-black text-sm font-semibold shadow-lg transition-all duration-300 pointer-events-none ${
          visible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2"
        }`}
      >
        {msg}
      </div>
    </Ctx.Provider>
  );
}
