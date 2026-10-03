"use client";

import { useEffect, useRef, useState } from "react";
import { Moon, Settings2, Sparkles, Sun } from "lucide-react";
import type { ConsoleTheme, Locale, Role } from "./types";

type ConsoleToolbarProps = {
  locale: Locale;
  theme: ConsoleTheme;
  role: Role;
  onLocaleChange: (locale: Locale) => void;
  onThemeChange: (theme: ConsoleTheme) => void;
  onRoleChange: (role: Role) => void;
  onLoadDemo: () => void;
};

const roles: Role[] = ["Test Engineer", "Safety Reviewer", "Admin"];

/** Single settings button that groups language, theme, role and demo data. */
export function ConsoleToolbar({ locale, theme, role, onLocaleChange, onThemeChange, onRoleChange, onLoadDemo }: ConsoleToolbarProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const vi = locale === "vi";

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="prefs" ref={rootRef}>
      <button
        type="button"
        className="icon-ghost"
        aria-label={vi ? "Cài đặt hiển thị và vai trò" : "Display and role settings"}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
      >
        <Settings2 size={18} />
      </button>
      {open ? (
        <div className="prefs-menu" role="dialog" aria-label={vi ? "Cài đặt" : "Settings"}>
          <div className="prefs-menu__group">
            <span className="prefs-menu__label">{vi ? "Vai trò" : "Role"}</span>
            <div className="seg seg--stack">
              {roles.map((item) => (
                <button key={item} type="button" aria-pressed={role === item} onClick={() => onRoleChange(item)}>{item}</button>
              ))}
            </div>
          </div>
          <div className="prefs-menu__group">
            <span className="prefs-menu__label">{vi ? "Ngôn ngữ" : "Language"}</span>
            <div className="seg">
              <button type="button" aria-pressed={locale === "vi"} onClick={() => onLocaleChange("vi")}>Tiếng Việt</button>
              <button type="button" aria-pressed={locale === "en"} onClick={() => onLocaleChange("en")}>English</button>
            </div>
          </div>
          <div className="prefs-menu__group">
            <span className="prefs-menu__label">{vi ? "Giao diện" : "Theme"}</span>
            <div className="seg">
              <button type="button" aria-pressed={theme === "dark"} onClick={() => onThemeChange("dark")}><Moon size={14} />{vi ? "Tối" : "Dark"}</button>
              <button type="button" aria-pressed={theme === "light"} onClick={() => onThemeChange("light")}><Sun size={14} />{vi ? "Sáng" : "Light"}</button>
            </div>
          </div>
          <button type="button" className="prefs-menu__action" onClick={() => { onLoadDemo(); setOpen(false); }}>
            <Sparkles size={15} /> {vi ? "Nạp dữ liệu mẫu" : "Load demo data"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
