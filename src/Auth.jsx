import { useState } from "react";

const C = {
  bg: "#F8F9FC",
  surface: "#FFFFFF",
  border: "#D0DCE8",
  accent: "#C8922A",
  blue: "#1B4F8A",
  text: "#1A2A3A",
  textMuted: "#5A7A9A",
  red: "#C0392B",
  green: "#1F8A5A",
};

export default function Auth({ supabase }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess("Account created! You can now log in.");
        setMode("login");
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img src="/soundready-logo-transparent.png" alt="SoundReady" style={{ height: 70, objectFit: "contain", marginBottom: 8 }} />
          <div style={{ fontSize: 12, color: C.textMuted, textTransform: "uppercase", letterSpacing: 3 }}>Ascend</div>
        </div>

        {/* Card */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "32px 28px", boxShadow: "0 4px 24px rgba(27,42,58,0.08)" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 6, textAlign: "center" }}>
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p style={{ fontSize: 14, color: C.textMuted, textAlign: "center", marginBottom: 24 }}>
            {mode === "login" ? "Log in to continue your IELTS preparation" : "Start your IELTS preparation journey"}
          </p>

          {error && (
            <div style={{ background: C.red + "12", border: `1px solid ${C.red}33`, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: C.red }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ background: C.green + "12", border: `1px solid ${C.green}33`, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: C.green }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="your@email.com"
                style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${C.border}`, borderRadius: 9, fontSize: 15, color: C.text, background: C.bg, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                onFocus={e => e.target.style.borderColor = C.accent}
                onBlur={e => e.target.style.borderColor = C.border}
              />
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${C.border}`, borderRadius: 9, fontSize: 15, color: C.text, background: C.bg, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                onFocus={e => e.target.style.borderColor = C.accent}
                onBlur={e => e.target.style.borderColor = C.border}
              />
            </div>

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "13px 0", background: loading ? C.border : C.accent,
              color: "#FFFFFF", border: "none", borderRadius: 10,
              fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit", transition: "background 0.2s",
            }}>
              {loading ? "Please wait…" : mode === "login" ? "Log In" : "Create Account"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 18 }}>
            <span style={{ fontSize: 13, color: C.textMuted }}>
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setSuccess(""); }}
              style={{ fontSize: 13, fontWeight: 600, color: C.accent, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              {mode === "login" ? "Sign up" : "Log in"}
            </button>
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: C.textMuted }}>
          SoundReady Ascend · AI-Powered IELTS Preparation
        </p>
      </div>
    </div>
  );
}
