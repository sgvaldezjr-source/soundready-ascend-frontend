import { useState, useEffect } from "react";

const C = {
  bg: "#F8F9FC",
  surface: "#FFFFFF",
  surfaceAlt: "#EEF2F8",
  border: "#D0DCE8",
  accent: "#C8922A",
  blue: "#1B4F8A",
  green: "#1F8A5A",
  red: "#C0392B",
  text: "#1A2A3A",
  textMuted: "#5A7A9A",
  textDim: "#A0B4C8",
};

const ADMIN_EMAIL = "sergio@soundready.com"; // Change to your email

const TOPIC_TYPES = [
  { value: "writing-task2-academic", label: "Writing Task 2 Academic" },
  { value: "writing-task2-general", label: "Writing Task 2 General" },
  { value: "writing-task1-academic", label: "Writing Task 1 Academic" },
  { value: "writing-task1-general", label: "Writing Task 1 General" },
  { value: "speaking-part1", label: "Speaking Part 1" },
  { value: "speaking-part2", label: "Speaking Part 2" },
  { value: "speaking-part3", label: "Speaking Part 3" },
];

export default function Admin({ supabase, session, onBack }) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editTopic, setEditTopic] = useState(null);
  const [form, setForm] = useState({ type: "writing-task2-academic", label: "", prompt: "", chart_type: "", active: true });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  useEffect(() => { loadTopics(); }, [filter]);

  async function loadTopics() {
    setLoading(true);
    let query = supabase.from("topics").select("*").order("type").order("created_at");
    if (filter !== "all") query = query.eq("type", filter);
    const { data, error } = await query;
    if (!error) setTopics(data || []);
    setLoading(false);
  }

  async function saveTopic() {
    setSaving(true); setMessage("");
    const payload = {
      type: form.type,
      label: form.label,
      prompt: form.prompt,
      chart_type: form.chart_type || null,
      active: form.active,
    };
    let error;
    if (editTopic) {
      ({ error } = await supabase.from("topics").update(payload).eq("id", editTopic.id));
    } else {
      ({ error } = await supabase.from("topics").insert(payload));
    }
    if (error) { setMessage("Error: " + error.message); }
    else { setMessage(editTopic ? "Topic updated." : "Topic added."); setShowForm(false); setEditTopic(null); setForm({ type: "writing-task2-academic", label: "", prompt: "", chart_type: "", active: true }); loadTopics(); }
    setSaving(false);
  }

  async function toggleActive(topic) {
    await supabase.from("topics").update({ active: !topic.active }).eq("id", topic.id);
    loadTopics();
  }

  async function deleteTopic(id) {
    if (!confirm("Delete this topic permanently?")) return;
    await supabase.from("topics").delete().eq("id", id);
    loadTopics();
  }

  function startEdit(topic) {
    setForm({ type: topic.type, label: topic.label, prompt: topic.prompt, chart_type: topic.chart_type || "", active: topic.active });
    setEditTopic(topic);
    setShowForm(true);
  }

  if (!isAdmin) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ textAlign: "center", color: C.textMuted }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
        <p>Admin access only.</p>
        <button onClick={onBack} style={{ marginTop: 16, padding: "8px 20px", background: C.accent, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: 14 }}>Back to App</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>SoundReady Admin</div>
          <div style={{ fontSize: 12, color: C.textMuted }}>Topic Manager</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { setShowForm(true); setEditTopic(null); setForm({ type: "writing-task2-academic", label: "", prompt: "", chart_type: "", active: true }); }} style={{ padding: "8px 16px", background: C.accent, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>+ Add Topic</button>
          <button onClick={onBack} style={{ padding: "8px 16px", background: "transparent", color: C.textMuted, border: `1px solid ${C.border}`, borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Back to App</button>
        </div>
      </div>

      <div style={{ padding: "20px 24px", maxWidth: 900, margin: "0 auto" }}>
        {message && <div style={{ background: C.green + "15", border: `1px solid ${C.green}33`, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: C.green }}>{message}</div>}

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
          <button onClick={() => setFilter("all")} style={{ padding: "6px 14px", borderRadius: 999, border: `1.5px solid ${filter === "all" ? C.accent : C.border}`, background: filter === "all" ? C.accent + "18" : "transparent", color: filter === "all" ? C.accent : C.textMuted, fontSize: 12, cursor: "pointer", fontWeight: filter === "all" ? 600 : 400 }}>All ({topics.length})</button>
          {TOPIC_TYPES.map(t => (
            <button key={t.value} onClick={() => setFilter(t.value)} style={{ padding: "6px 14px", borderRadius: 999, border: `1.5px solid ${filter === t.value ? C.blue : C.border}`, background: filter === t.value ? C.blue + "18" : "transparent", color: filter === t.value ? C.blue : C.textMuted, fontSize: 12, cursor: "pointer", fontWeight: filter === t.value ? 600 : 400 }}>{t.label.replace("Writing ", "").replace("Speaking ", "Sp ")}</button>
          ))}
        </div>

        {/* Topic list */}
        {loading ? <div style={{ textAlign: "center", padding: 40, color: C.textMuted }}>Loading topics…</div> : (
          <div>
            {topics.map(topic => (
              <div key={topic.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 10, opacity: topic.active ? 1 : 0.5 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                      <span style={{ background: C.blue + "18", color: C.blue, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{TOPIC_TYPES.find(t => t.value === topic.type)?.label || topic.type}</span>
                      {!topic.active && <span style={{ background: C.red + "18", color: C.red, borderRadius: 6, padding: "2px 8px", fontSize: 11 }}>Inactive</span>}
                      {topic.chart_type && <span style={{ background: C.accent + "18", color: C.accent, borderRadius: 6, padding: "2px 8px", fontSize: 11 }}>{topic.chart_type}</span>}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 4 }}>{topic.label}</div>
                    <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.5, maxHeight: 40, overflow: "hidden" }}>{topic.prompt}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => startEdit(topic)} style={{ padding: "6px 12px", background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 12, color: C.text, cursor: "pointer" }}>Edit</button>
                    <button onClick={() => toggleActive(topic)} style={{ padding: "6px 12px", background: topic.active ? C.red + "12" : C.green + "12", border: `1px solid ${topic.active ? C.red : C.green}33`, borderRadius: 7, fontSize: 12, color: topic.active ? C.red : C.green, cursor: "pointer" }}>{topic.active ? "Deactivate" : "Activate"}</button>
                    <button onClick={() => deleteTopic(topic.id)} style={{ padding: "6px 12px", background: C.red + "12", border: `1px solid ${C.red}33`, borderRadius: 7, fontSize: 12, color: C.red, cursor: "pointer" }}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
            {topics.length === 0 && <div style={{ textAlign: "center", padding: 40, color: C.textMuted }}>No topics found.</div>}
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.surface, borderRadius: 16, padding: "24px", width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 18 }}>{editTopic ? "Edit Topic" : "Add New Topic"}</h3>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 5 }}>Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 14, color: C.text, background: C.bg, fontFamily: "'Inter', sans-serif" }}>
                {TOPIC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 5 }}>Label</label>
              <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="e.g. Education, Technology..." style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 14, color: C.text, background: C.bg, fontFamily: "'Inter', sans-serif", boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 5 }}>Prompt</label>
              <textarea value={form.prompt} onChange={e => setForm(f => ({ ...f, prompt: e.target.value }))} rows={6} placeholder="Enter the full task prompt..." style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 14, color: C.text, background: C.bg, fontFamily: "'Inter', sans-serif", boxSizing: "border-box", resize: "vertical" }} />
            </div>

            {form.type === "writing-task1-academic" && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 5 }}>Chart Type (optional)</label>
                <select value={form.chart_type} onChange={e => setForm(f => ({ ...f, chart_type: e.target.value }))} style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 14, color: C.text, background: C.bg, fontFamily: "'Inter', sans-serif" }}>
                  <option value="">None</option>
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Graph</option>
                  <option value="pie">Pie Chart</option>
                  <option value="process">Process Diagram</option>
                </select>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <input type="checkbox" id="active" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
              <label htmlFor="active" style={{ fontSize: 13, color: C.text, cursor: "pointer" }}>Active (visible to students)</label>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setShowForm(false); setEditTopic(null); }} style={{ flex: 1, padding: "11px 0", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 9, fontSize: 14, color: C.textMuted, cursor: "pointer" }}>Cancel</button>
              <button onClick={saveTopic} disabled={saving || !form.label || !form.prompt} style={{ flex: 2, padding: "11px 0", background: saving || !form.label || !form.prompt ? C.border : C.accent, color: "#fff", border: "none", borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: saving || !form.label || !form.prompt ? "not-allowed" : "pointer" }}>
                {saving ? "Saving…" : editTopic ? "Update Topic" : "Add Topic"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
