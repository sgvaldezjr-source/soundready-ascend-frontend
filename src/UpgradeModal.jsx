import { useState } from "react";

const C = {
  accent: "#C8922A",
  blue: "#1B4F8A",
  green: "#1F8A5A",
  red: "#C0392B",
  text: "#1A2A3A",
  textMuted: "#5A7A9A",
  border: "#D0DCE8",
  surface: "#FFFFFF",
  bg: "#F8F9FC",
};

export default function UpgradeModal({ type, onClose, supabase, userEmail }) {
  const [email, setEmail] = useState(userEmail || "");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const label = type === "writing" ? "writing" : "speaking";

  async function handleWaitlist(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: dbError } = await supabase
      .from("waitlist")
      .upsert({ email }, { onConflict: "email" });
    setLoading(false);
    if (dbError) {
      setError("Something went wrong. Please try again.");
    } else {
      setSubmitted(true);
    }
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button style={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>

        <div style={{ fontSize: "2.4rem", marginBottom: "1rem" }}>🎯</div>

        {!submitted ? (
          <>
            <h2 style={styles.heading}>
              You've used your 2 free {label} sessions
            </h2>
            <p style={styles.sub}>
              SoundReady Ascend is growing fast. Join the waitlist to get early
              access to the full plan — unlimited {label} practice, detailed
              reports, and personalised feedback.
            </p>

            <form onSubmit={handleWaitlist} style={styles.form}>
              <input
                type="email"
                required
                placeholder="Your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={styles.input}
              />
              <button
                type="submit"
                disabled={loading}
                style={styles.submitBtn}
              >
                {loading ? "Joining…" : "Join the Waitlist →"}
              </button>
            </form>

            {error && <p style={styles.error}>{error}</p>}

            <p style={styles.note}>
              No spam. We'll only contact you when early access opens.
            </p>
          </>
        ) : (
          <>
            <h2 style={styles.heading}>You're on the list! 🎉</h2>
            <p style={styles.sub}>
              We'll email <strong>{email}</strong> as soon as early access is
              ready. Your progress is saved — keep practising!
            </p>
            <button style={styles.submitBtn} onClick={onClose}>
              Back to App
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "1rem",
  },
  modal: {
    background: "#fff",
    borderRadius: "18px",
    padding: "2.5rem 2rem 2rem",
    maxWidth: "460px",
    width: "100%",
    position: "relative",
    boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
    textAlign: "center",
  },
  closeBtn: {
    position: "absolute",
    top: "1rem",
    right: "1rem",
    background: "none",
    border: "none",
    fontSize: "1.1rem",
    cursor: "pointer",
    color: "#999",
    lineHeight: 1,
  },
  heading: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: C.text,
    marginBottom: "0.75rem",
    lineHeight: 1.35,
    fontFamily: "'Sora', sans-serif",
  },
  sub: {
    fontSize: "0.93rem",
    color: C.textMuted,
    lineHeight: 1.65,
    marginBottom: "1.5rem",
    fontFamily: "'Inter', sans-serif",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "0.7rem",
    marginBottom: "0.75rem",
  },
  input: {
    padding: "0.75rem 1rem",
    borderRadius: "9px",
    border: `1.5px solid ${C.border}`,
    fontSize: "0.95rem",
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    color: C.text,
    background: C.bg,
  },
  submitBtn: {
    padding: "0.8rem 1.5rem",
    background: C.accent,
    color: "#fff",
    border: "none",
    borderRadius: "9px",
    fontSize: "0.97rem",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    transition: "opacity 0.2s",
  },
  error: {
    color: C.red,
    fontSize: "0.85rem",
    marginTop: "0.4rem",
    fontFamily: "'Inter', sans-serif",
  },
  note: {
    fontSize: "0.78rem",
    color: "#aaa",
    marginTop: "0.75rem",
    fontFamily: "'Inter', sans-serif",
  },
};
