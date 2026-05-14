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

  if (session === undefined) return null;
  if (!session) return <Auth supabase={supabase} />;
  if (view === "admin") return <Admin supabase={supabase} session={session} onBack={() => setView("app")} />;
  return <App supabase={supabase} session={session} onAdmin={() => setView("admin")} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
