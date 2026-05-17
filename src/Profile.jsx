import { useState, useEffect } from "react";

const C = {
  bg: "#F8F9FC", surface: "#FFFFFF", surfaceAlt: "#EEF2F8", border: "#D0DCE8",
  accent: "#C8922A", accentSoft: "#C8922A12", green: "#1F8A5A", red: "#C0392B",
  blue: "#1B4F8A", purple: "#5B4FA8",
  text: "#1A2A3A", textMuted: "#5A7A9A", textDim: "#A0B4C8",
};

const BAND_SCORES = [5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0];

export default function Profile({ supabase, session, onBack }) {
  const user = session?.user;
  const [profile, setProfile] = useState({
    display_name: "", native_language: "", target_band: "", exam_date: "", study_goal: "",
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setProfile({
          display_name:    data.display_name    || "",
          native_language: data.native_language || "",
          target_band:     data.target_band     || "",
          exam_date:       data.exam_date       || "",
          study_goal:      data.study_goal      || "",
        });
        setLoading(false);
      });
  }, [user]);

  async function handleSave() {
    setSaving(true); setMessage(null);
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, ...profile, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) {
      setMessage({ type: "error", text: "Failed to save. Please try again." });
    } else {
      setMessage({ type: "success", text: "Profile saved." });
      setEditing(false);
    }
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg }}>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.textMuted }}>Loading profile…</div>
    </div>
  );

  const initial = (profile.display_name || user?.email || "U")[0].toUpperCase();

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: "24px 16px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>

        {/* Back */}
        <button onClick={onBack} style={{
          background: "transparent", border: "none", color: C.textMuted,
          fontSize: 14, cursor: "pointer", marginBottom: 20, padding: 0,
        }}>← Back</button>

        <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: "28px 24px" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24, paddingBottom: 20, borderBottom: `1px solid ${C.border}` }}>
            <div style={{
              width: 60, height: 60, borderRadius: "50%", flexShrink: 0,
              background: `linear-gradient(135deg, ${C.blue}, ${C.purple})`,
              color: "#fff", fontSize: 24, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{initial}</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 3 }}>
                {profile.display_name || "Your Profile"}
              </div>
              <div style={{ fontSize: 13, color: C.textMuted }}>{user?.email}</div>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div style={{
              padding: "10px 14px", borderRadius: 9, marginBottom: 18, fontSize: 14, fontWeight: 500,
              background: message.type === "success" ? C.green + "18" : C.red + "18",
              color: message.type === "success" ? C.green : C.red,
              border: `1px solid ${message.type === "success" ? C.green + "44" : C.red + "44"}`,
            }}>{message.text}</div>
          )}

          {/* Fields */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 28px", marginBottom: 24 }}>
            <Field label="Display Name" value={profile.display_name} editing={editing}
              onChange={v => setProfile(p => ({ ...p, display_name: v }))} placeholder="e.g. Sergio" />
            <Field label="Native Language" value={profile.native_language} editing={editing}
              onChange={v => setProfile(p => ({ ...p, native_language: v }))} placeholder="e.g. Spanish" />
            <Field label="Target Band Score" value={profile.target_band} editing={editing}
              onChange={v => setProfile(p => ({ ...p, target_band: v }))}
              type="select" options={BAND_SCORES} placeholder="Select band" />
            <Field label="Exam Date" value={profile.exam_date} editing={editing}
              onChange={v => setProfile(p => ({ ...p, exam_date: v }))} type="date" />
            <Field label="Study Goal" value={profile.study_goal} editing={editing}
              onChange={v => setProfile(p => ({ ...p, study_goal: v }))}
              type="select" options={["Academic", "General Training"]} placeholder="Select goal" />
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <span style={labelStyle}>Email</span>
              <span style={{ fontSize: 14, color: C.textMuted }}>{user?.email}</span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            {!editing ? (
              <button onClick={() => setEditing(true)} style={btnPrimary}>Edit Profile</button>
            ) : (
              <>
                <button onClick={handleSave} disabled={saving} style={btnPrimary}>
                  {saving ? "Saving…" : "Save Changes"}
                </button>
                <button onClick={() => { setEditing(false); setMessage(null); }} style={btnSecondary}>
                  Cancel
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

function Field({ label, value, editing, onChange, type = "text", options, placeholder }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span style={labelStyle}>{label}</span>
      {!editing ? (
        <span style={{ fontSize: 14, color: value ? C.text : C.textDim, fontWeight: value ? 500 : 400 }}>
          {value || "Not set"}
        </span>
      ) : type === "select" ? (
        <select style={inputStyle} value={value} onChange={e => onChange(e.target.value)}>
          <option value="">{placeholder}</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input style={inputStyle} type={type} value={value}
          onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </div>
  );
}

const labelStyle = {
  fontSize: 11, fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.06em", color: C.textMuted,
};

const inputStyle = {
  padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${C.border}`,
  fontSize: 14, color: C.text, outline: "none", width: "100%",
  boxSizing: "border-box", background: C.surfaceAlt, fontFamily: "'Inter', sans-serif",
};

const btnPrimary = {
  padding: "9px 20px", borderRadius: 9,
  background: `linear-gradient(135deg, ${C.blue}, ${C.purple})`,
  color: "#fff", fontWeight: 600, fontSize: 14,
  border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif",
};

const btnSecondary = {
  padding: "9px 20px", borderRadius: 9, background: C.surfaceAlt,
  color: C.textMuted, fontWeight: 600, fontSize: 14,
  border: `1px solid ${C.border}`, cursor: "pointer", fontFamily: "'Inter', sans-serif",
};
