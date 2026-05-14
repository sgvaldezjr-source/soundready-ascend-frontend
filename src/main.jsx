import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Auth from "./Auth";
import Admin from "./Admin";
import { createClient } from "@supabase/supabase-js";

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseUrl = rawUrl.split("/rest")[0].split("/auth")[0].replace(/\/$/, "");
const supabase = createClient(supabaseUrl, import.meta.env.VITE_SUPABASE_ANON_KEY);

function Root() {
  const [session, setSession] = React.useState(undefined);
  const [view, setView] = React.useState("app");

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

 if (session === undefined) return (
  <div style={{ minHeight: "100vh", background: "#F8F9FC", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
    <img src="/soundready-logo-transparent.png" alt="SoundReady" style={{ height: 80, marginBottom: 16, animation: "pulse 1.5s ease-in-out infinite" }} />
    <div style={{ fontSize: 13, color: "#5A7A9A", letterSpacing: 3, textTransform: "uppercase" }}>Loading…</div>
    <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
  </div>
);
  if (!session) return <Auth supabase={supabase} />;
  if (view === "admin") return <Admin supabase={supabase} session={session} onBack={() => setView("app")} />;
  return <App supabase={supabase} session={session} onAdmin={() => setView("admin")} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
