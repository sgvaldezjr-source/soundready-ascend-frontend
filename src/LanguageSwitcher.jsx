import { useState } from "react";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
];

const C_BORDER = "#D0DCE8";
const C_SURFACE = "#FFFFFF";
const C_SURFACEALT = "#EEF2F8";
const C_TEXT = "#1A2A3A";
const C_TEXTMUTED = "#5A7A9A";

export default function LanguageSwitcher({ lang, setLang }) {
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  function select(code) {
    setLang(code);
    localStorage.setItem("soundready_lang", code);
    setOpen(false);
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "4px 10px",
          border: `1.5px solid ${C_BORDER}`,
          borderRadius: 999,
          background: C_SURFACE,
          cursor: "pointer",
          fontFamily: "'Inter', sans-serif",
          fontSize: 13,
          color: C_TEXTMUTED,
        }}
      >
        <span>{current.flag}</span>
        <span>{current.label}</span>
        <span style={{ fontSize: 10 }}>▾</span>
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 99 }}
          />
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 38,
              zIndex: 100,
              background: C_SURFACE,
              border: `1px solid ${C_BORDER}`,
              borderRadius: 12,
              padding: "4px 0",
              minWidth: 140,
              boxShadow: "0 8px 24px rgba(27,42,58,0.12)",
            }}
          >
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => select(l.code)}
                style={{
                  width: "100%",
                  padding: "9px 14px",
                  background: lang === l.code ? C_SURFACEALT : "transparent",
                  border: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  color: C_TEXT,
                  fontWeight: lang === l.code ? 700 : 400,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = C_SURFACEALT)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background =
                    lang === l.code ? C_SURFACEALT : "transparent")
                }
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
