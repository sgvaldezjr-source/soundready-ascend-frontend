import { useState, useRef, useEffect, createContext, useContext } from "react";
import T from "./translations";
import LanguageSwitcher from "./LanguageSwitcher";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import UpgradeModal from "./UpgradeModal";

// ─── BACKEND PROXY ───────────────────────────────────────────────────────────
const PROXY = "https://web-production-e43ad.up.railway.app";

// ─── THEME ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#F8F9FC",
  surface: "#FFFFFF",
  surfaceAlt: "#EEF2F8",
  border: "#D0DCE8",
  accent: "#C8922A",
  accentSoft: "#C8922A12",
  accentGlow: "#C8922A33",
  green: "#1F8A5A",
  red: "#C0392B",
  blue: "#1B4F8A",
  blueLight: "#2E7FC8",
  purple: "#5B4FA8",
  teal: "#1A8A8F",
  text: "#1A2A3A",
  textMuted: "#5A7A9A",
  textDim: "#A0B4C8",
};
// ─── LANGUAGE CONTEXT ────────────────────────────────────────────────────────
export const LangContext = createContext("en");
export function useLang() {
  const lang = useContext(LangContext);
  return T[lang] || T.en;
}
// ─── CUSTOM PROMPT HOOK ───────────────────────────────────────────────────────
function useCustomPrompt(supabase, taskType, userId) {
  const [customPrompt, setCustomPrompt] = useState("");
  const [customCueCard, setCustomCueCard] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [saving, setSaving] = useState(false);

  useState(() => {
    if (!supabase || !userId || !taskType) return;
    supabase
      .from("custom_prompts")
      .select("prompt, cue_card")
      .eq("user_id", userId)
      .eq("task_type", taskType)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.prompt) { setCustomPrompt(data.prompt); setCustomCueCard(data.cue_card || ""); }
      });
  }, [taskType, userId]);

  async function savePrompt(prompt, cueCard) {
    if (!supabase || !userId) return;
    setSaving(true);
    await supabase.from("custom_prompts").upsert(
      { user_id: userId, task_type: taskType, prompt, cue_card: cueCard || null, updated_at: new Date().toISOString() },
      { onConflict: "user_id,task_type" }
    );
    setSaving(false);
  }

  return { customPrompt, setCustomPrompt, customCueCard, setCustomCueCard, useCustom, setUseCustom, saving, savePrompt };
}

// ─── SESSION SAVER ────────────────────────────────────────────────────────────
async function saveSession(supabase, userId, { taskType, topicLabel, prompt, response, imageBase64, feedback, overallBand }) {
  if (!supabase || !userId) return;
  try {
    let imageUrl = null;
    if (imageBase64) {
      const base64Data = imageBase64.split(",")[1];
      const byteArray = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      const mimeType = imageBase64.startsWith("data:image/png") ? "image/png" : "image/jpeg";
      const ext = mimeType === "image/png" ? "png" : "jpg";
      const blob = new Blob([byteArray], { type: mimeType });
      const fileName = `${userId}/${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from("task-images")
        .upload(fileName, blob, { contentType: mimeType, upsert: false });
      if (!error) {
        const { data: urlData } = supabase.storage.from("task-images").getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }
    }
    await supabase.from("sessions").insert({
      user_id: userId,
      task_type: taskType,
      topic_label: topicLabel,
      prompt,
      response,
      image_url: imageUrl,
      feedback,
      overall_band: overallBand,
    });
  } catch (err) {
    console.error("Session save failed:", err);
  }
}

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────
async function loadDashboardStats(supabase, userId) {
  if (!supabase || !userId) return { stats: [], recentSessions: [] };
  try {
    const { data: sessions, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;

    const allSessions = sessions || [];
    const totalSessions = allSessions.length;
    const avgBand = totalSessions > 0
      ? (allSessions.reduce((sum, s) => sum + (s.overall_band || 0), 0) / totalSessions).toFixed(1)
      : "—";

    const writingSessions = allSessions.filter(s => s.task_type?.includes("Task"));
    const speakingSessions = allSessions.filter(s => s.task_type?.includes("Part"));

    const writingAvg = writingSessions.length > 0
      ? (writingSessions.reduce((sum, s) => sum + (s.overall_band || 0), 0) / writingSessions.length).toFixed(1)
      : "—";

    const speakingAvg = speakingSessions.length > 0
      ? (speakingSessions.reduce((sum, s) => sum + (s.overall_band || 0), 0) / speakingSessions.length).toFixed(1)
      : "—";

    const stats = [
      { label: "Sessions", value: String(totalSessions), color: C.blue },
      { label: "Avg Band", value: String(avgBand), color: C.accent },
      { label: "Writing", value: String(writingAvg), color: C.green },
      { label: "Speaking", value: String(speakingAvg), color: C.purple },
    ];

    const recentSessions = allSessions.slice(0, 4).map(s => ({
      date: new Date(s.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      type: s.task_type?.includes("Task") ? "Writing" : "Speaking",
      task: s.task_type || "Unknown",
      topic: s.topic_label || "—",
      band: s.overall_band || "—",
    }));

    let streak = 0;
    if (allSessions.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sessionDays = new Set(
        allSessions.map(s => {
          const d = new Date(s.created_at);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        })
      );
      let cursor = new Date(today);
      while (sessionDays.has(cursor.getTime())) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      }
      if (streak === 0) {
        cursor = new Date(today);
        cursor.setDate(cursor.getDate() - 1);
        while (sessionDays.has(cursor.getTime())) {
          streak++;
          cursor.setDate(cursor.getDate() - 1);
        }
      }
    }

    const bestSession = allSessions.length > 0
      ? allSessions.reduce((best, s) => (!best || (s.overall_band || 0) > (best.overall_band || 0)) ? s : best, null)
      : null;

    const currentAvg = totalSessions > 0
      ? allSessions.reduce((sum, s) => sum + (s.overall_band || 0), 0) / totalSessions
      : null;
    const nextTarget = currentAvg !== null
      ? Math.ceil(currentAvg * 2) / 2 + (currentAvg === Math.ceil(currentAvg * 2) / 2 ? 0.5 : 0)
      : null;
    const targetProgress = currentAvg !== null && nextTarget !== null
      ? Math.min(((currentAvg - (nextTarget - 0.5)) / 0.5) * 100, 100)
      : 0;

    return { stats, recentSessions, streak, bestSession, currentAvg, nextTarget, targetProgress };
  } catch (err) {
    console.error("Failed to load dashboard stats:", err);
    return { stats: [], recentSessions: [], streak: 0, bestSession: null, currentAvg: null, nextTarget: null, targetProgress: 0 };
  }
}

// ─── SESSION LOADER ───────────────────────────────────────────────────────────
async function loadSessions(supabase, userId) {
  if (!supabase || !userId) return [];
  try {
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Failed to load sessions:", err);
    return [];
  }
}

const BAND_COLOR = b => b >= 7 ? C.green : b >= 5.5 ? C.accent : b >= 4 ? C.blue : C.red;
const CEFR = b => b >= 8.5 ? "C2" : b >= 7 ? "C1" : b >= 5.5 ? "B2" : b >= 4 ? "B1" : b >= 3 ? "A2" : "A1";

// ─── BAND DESCRIPTORS ─────────────────────────────────────────────────────────
const WRITING_DESCRIPTORS = {
  task: {
    label: "Task Response / Task Achievement",
    features: ["Task coverage", "Position clarity", "Idea development", "Relevance & accuracy"],
    bands: {
      8: "Covers all parts of the task thoroughly. Presents a clear, well-developed position sustained throughout.",
      7: "Addresses all parts of the task. Position is clear but may not be fully developed in every section.",
      6: "Addresses the main requirements but may not cover all parts equally.",
      5: "Only partially addresses the task. Ideas are underdeveloped or repetitive.",
    }
  },
  coherence: {
    label: "Coherence & Cohesion",
    features: ["Paragraph organisation", "Logical sequencing", "Cohesive devices", "Referencing & substitution"],
    bands: {
      8: "Ideas are sequenced logically and cohesion is handled skilfully.",
      7: "Information flows logically. Cohesive devices used effectively but sometimes mechanically.",
      6: "Overall organisation is evident. Cohesive devices used but sometimes inaccurately.",
      5: "Basic organisation present but ideas may not progress clearly.",
    }
  },
  lexis: {
    label: "Lexical Resource",
    features: ["Vocabulary range", "Topic-specific vocabulary", "Collocations & word choice", "Spelling & word form"],
    bands: {
      8: "Uses a wide, varied vocabulary with natural control.",
      7: "Good range of vocabulary with awareness of less common words.",
      6: "Adequate vocabulary for the task. Some attempts at less common vocabulary.",
      5: "Limited vocabulary range. Repetition of the same words and phrases.",
    }
  },
  grammar: {
    label: "Grammatical Range & Accuracy",
    features: ["Sentence complexity", "Range of structures", "Error frequency", "Punctuation"],
    bands: {
      8: "Wide range of sentence structures used flexibly and accurately.",
      7: "Variety of sentence structures with general accuracy.",
      6: "Mix of simple and complex sentences. Errors present but meaning clear.",
      5: "Limited range of structures. Errors in complex structures are frequent.",
    }
  }
};

const SPEAKING_DESCRIPTORS = {
  fluency: {
    label: "Fluency & Coherence",
    features: ["Speaking pace & flow", "Hesitation & self-correction", "Logical sequencing", "Discourse markers"],
    bands: {
      8: "Speaks fluently with only occasional hesitation.",
      7: "Speaks at length without noticeable effort.",
      6: "Able to keep talking but fluency sometimes lost.",
      5: "Maintains speech but relies on repetition and rephrasing.",
    }
  },
  lexis: {
    label: "Lexical Resource",
    features: ["Vocabulary range", "Topic-specific language", "Paraphrasing ability", "Idiomatic language"],
    bands: {
      8: "Uses a varied vocabulary with flexibility.",
      7: "Good range of vocabulary with some less common expressions.",
      6: "Adequate vocabulary for most topics.",
      5: "Limited vocabulary range. Relies on basic, familiar words.",
    }
  },
  grammar: {
    label: "Grammatical Range & Accuracy",
    features: ["Structure variety", "Complex sentence use", "Tense accuracy", "Error frequency & impact"],
    bands: {
      8: "Uses a wide range of structures with flexibility.",
      7: "Uses a variety of structures with reasonable accuracy.",
      6: "Uses basic structures accurately. Complex attempts have errors.",
      5: "Mostly simple sentence forms with frequent errors.",
    }
  },
  pronunciation: {
    label: "Pronunciation",
    features: ["Intelligibility", "Stress & rhythm", "Intonation", "Individual sounds"],
    bands: {
      8: "Easy to understand throughout.",
      7: "Generally clear and easy to follow.",
      6: "Understandable but requires some listener effort.",
      5: "Understanding is possible but takes effort.",
    }
  }
};

// ─── TOPIC BANKS ─────────────────────────────────────────────────────────────
const WRITING_TOPICS = {
  "Task 2 Academic": [
    { id: "t2-1", label: "Education", prompt: "Some people believe that universities should focus on providing academic knowledge only, while others think universities should prepare students for the real world of work.\n\nDiscuss both views and give your own opinion.\n\nWrite at least 250 words." },
    { id: "t2-2", label: "Technology", prompt: "The increasing use of technology in everyday life has made people more isolated from one another.\n\nTo what extent do you agree or disagree?\n\nWrite at least 250 words." },
    { id: "t2-3", label: "Environment", prompt: "Some people think individuals can do very little to help the environment and that it is mainly governments and large companies that should be responsible for reducing environmental damage.\n\nTo what extent do you agree or disagree?\n\nWrite at least 250 words." },
    { id: "t2-4", label: "Health", prompt: "In many countries, the average weight of people is increasing and their levels of health and fitness are decreasing.\n\nWhat are the causes of these problems and what measures could be taken to solve them?\n\nWrite at least 250 words." },
    { id: "t2-5", label: "Media", prompt: "Advertising encourages people to buy things they do not need and has a negative effect on society.\n\nTo what extent do you agree or disagree?\n\nWrite at least 250 words." },
  ],
  "Task 2 General": [
    { id: "t2g-1", label: "Work & Career", prompt: "Some people think it is better to work for yourself than to be employed by a company.\n\nTo what extent do you agree or disagree?\n\nWrite at least 250 words." },
    { id: "t2g-2", label: "Family & Society", prompt: "In many countries, people are having children later in life than in the past.\n\nWhat are the reasons for this? Is it a positive or negative development?\n\nWrite at least 250 words." },
    { id: "t2g-3", label: "Education", prompt: "Some parents choose to educate their children at home rather than sending them to school.\n\nDo the advantages of home education outweigh the disadvantages?\n\nWrite at least 250 words." },
    { id: "t2g-4", label: "Technology", prompt: "Many people today spend a lot of time using their mobile phones for social media, games and entertainment.\n\nDo you think the advantages of mobile phones outweigh the disadvantages?\n\nWrite at least 250 words." },
    { id: "t2g-5", label: "Health & Lifestyle", prompt: "Many people do not exercise enough in their daily lives.\n\nWhat are the causes of this problem and what can be done to encourage people to be more active?\n\nWrite at least 250 words." },
  ],
  "Task 1 Academic": [
    {
      id: "t1a-1", label: "Bar Chart", imageUrl: null, chartType: "bar",
      chartData: {
        title: "Daily internet use by age group (%)", xKey: "age", yUnit: "%", yMax: 100,
        series: [{ key: "2005", color: "#2E7FC8" }, { key: "2015", color: "#C8922A" }],
        data: [
          { age: "16–24", "2005": 75, "2015": 97 }, { age: "25–34", "2005": 67, "2015": 93 },
          { age: "35–44", "2005": 51, "2015": 88 }, { age: "45–54", "2005": 34, "2015": 73 },
          { age: "55–64", "2005": 18, "2015": 52 }, { age: "65+", "2005": 8, "2015": 28 },
        ],
      },
      prompt: "The bar chart shows the percentage of people in different age groups who used the internet daily in a particular country in 2005 and 2015.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
    },
    {
      id: "t1a-2", label: "Line Graph", imageUrl: null, chartType: "line",
      chartData: {
        title: "Tourist arrivals by country (millions)", xKey: "year", yUnit: "M", yMax: 10,
        series: [{ key: "Country A", color: "#2E9E6B" }, { key: "Country B", color: "#D94F4F" }, { key: "Country C", color: "#7B6FC8" }],
        data: [
          { year: "1995", "Country A": 2, "Country B": 2.5, "Country C": 1.5 },
          { year: "2000", "Country A": 3.5, "Country B": 3.5, "Country C": 1.4 },
          { year: "2005", "Country A": 5, "Country B": 4.5, "Country C": 1.6 },
          { year: "2010", "Country A": 6, "Country B": 5, "Country C": 1.5 },
          { year: "2015", "Country A": 7, "Country B": 4, "Country C": 1.5 },
          { year: "2020", "Country A": 8, "Country B": 3, "Country C": 1.5 },
        ],
      },
      prompt: "The graph shows the changes in the number of tourists visiting three different countries between 1995 and 2020.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
    },
    {
      id: "t1a-3", label: "Pie Charts", imageUrl: null, chartType: "pie",
      chartData: {
        title: "Household spending by category",
        series: [
          { year: "1980", data: [{ name: "Housing", value: 25, color: "#2E7FC8" }, { name: "Food", value: 35, color: "#2E9E6B" }, { name: "Transport", value: 15, color: "#C8922A" }, { name: "Leisure", value: 10, color: "#7B6FC8" }, { name: "Other", value: 15, color: "#2EADB4" }] },
          { year: "2020", data: [{ name: "Housing", value: 38, color: "#2E7FC8" }, { name: "Food", value: 22, color: "#2E9E6B" }, { name: "Transport", value: 20, color: "#C8922A" }, { name: "Leisure", value: 14, color: "#7B6FC8" }, { name: "Other", value: 6, color: "#2EADB4" }] },
        ],
      },
      prompt: "The pie charts show the proportion of household income spent on different categories in a country in 1980 and 2020.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
    },
    {
      id: "t1a-4", label: "Process", imageUrl: null, chartType: "process",
      chartData: {
        title: "How rainwater becomes drinking water",
        steps: [
          { icon: "🌧", label: "Rainfall" }, { icon: "🏞", label: "Reservoir\nCollection" },
          { icon: "🪨", label: "Sand & Gravel\nFiltration" }, { icon: "⚗️", label: "Chemical\nTreatment" },
          { icon: "🛢", label: "Storage\nTank" }, { icon: "🏠", label: "Distribution\nto Homes" },
        ],
      },
      prompt: "The diagram shows how rainwater is collected and processed to become drinking water.\n\nSummarise the information by selecting and reporting the main features.\n\nWrite at least 150 words.",
    },
  ],
  "Task 1 General": [
    { id: "t1g-1", label: "Complaint", prompt: "You recently stayed at a hotel and were very dissatisfied with your experience.\n\nWrite a letter to the hotel manager. In your letter:\n• describe the problems you experienced\n• explain how these problems affected your stay\n• say what you would like the manager to do\n\nWrite at least 150 words. Begin: 'Dear Manager,'" },
    { id: "t1g-2", label: "Application", prompt: "You have seen an advertisement for a part-time job at a community centre teaching English to adults.\n\nWrite a letter of application. In your letter:\n• explain why you are interested\n• describe your experience and qualifications\n• say when you are available\n\nWrite at least 150 words. Begin: 'Dear Sir or Madam,'" },
  ],
};

const SPEAKING_TOPICS = {
  1: [
    { id: "s1-1", label: "Work & Study", prompt: "Do you work or are you a student?\nWhat do you enjoy most about your job or studies?\nDo you think your current studies or work will be useful in the future? Why?" },
    { id: "s1-2", label: "Hometown", prompt: "Where are you from?\nWhat do you like most about your hometown?\nHas your hometown changed much in recent years? How?" },
    { id: "s1-3", label: "Free Time", prompt: "What do you enjoy doing in your free time?\nHow much free time do you usually have?\nDo you prefer spending free time alone or with others? Why?" },
  ],
  2: [
    { id: "s2-1", label: "Person You Admire", prompt: "Describe a person you admire.\n\nYou should say:\n— who this person is\n— how you know them\n— what qualities they have\n— and explain why you admire them.\n\nYou have one minute to prepare. Then speak for 1–2 minutes." },
    { id: "s2-2", label: "Memorable Place", prompt: "Describe a place that is special to you.\n\nYou should say:\n— where it is\n— when you first went there\n— what it looks like\n— and explain why it is special to you.\n\nYou have one minute to prepare. Then speak for 1–2 minutes." },
    { id: "s2-3", label: "Challenge Overcome", prompt: "Describe a difficult situation you faced and how you dealt with it.\n\nYou should say:\n— what the situation was\n— when it happened\n— how you handled it\n— and what you learned from the experience.\n\nYou have one minute to prepare. Then speak for 1–2 minutes." },
  ],
  3: [
    { id: "s3-1", label: "Education", prompt: "What qualities make a good teacher?\nDo you think formal education is more important than self-learning?\nHow should education systems change to prepare students for the future?" },
    { id: "s3-2", label: "Technology", prompt: "How has technology changed the way people communicate?\nDo you think social media brings people closer or further apart?\nWhat might communication look like in 20 years?" },
    { id: "s3-3", label: "Environment", prompt: "Who is most responsible for protecting the environment — individuals, governments, or businesses?\nWhy do many people still choose convenience over sustainability?\nWhat changes do you think future generations will make?" },
  ],
};

// ─── AI PROMPT BUILDERS ───────────────────────────────────────────────────────
function buildWritingPrompt(taskType, topicPrompt, response) {
  return `You are a senior IELTS examiner with 15 years of experience marking scripts at all band levels including 8 and 9. Your task is to score the essay below accurately and without leniency bias.

CRITICAL SCORING INSTRUCTIONS:
- Band 9: Virtually no errors. Fully addresses all parts. Sophisticated vocabulary, complex grammar, flawless cohesion. Rare — award only when genuinely merited.
- Band 8: Minor errors only. All parts addressed. Wide range of vocabulary and grammar used with flexibility. Cohesion is skilful. Award this when the essay clearly demonstrates upper-proficiency writing.
- Band 7: Good control with some inaccuracies. All parts addressed but development may be uneven. Good range of vocabulary with some less common use. Award when the essay is clearly above Band 6 in multiple criteria.
- Band 6: Adequate. Main requirements addressed but not all parts equally. Limited range with some errors. Noticeable but not disruptive.
- Band 5: Partial task coverage. Limited vocabulary and grammar range. Errors affect clarity.
- Do NOT default to Band 6 or 7. If the evidence supports Band 8 or 9, award it. Underscoring strong work is as inaccurate as overscoring weak work.
- Each criterion (task, coherence, lexis, grammar) must be scored independently based on its own evidence.
- overall_band is the mean of the four criterion bands, rounded to the nearest 0.5.

No apostrophes in output. Return ONLY this JSON with accurate values based on the essay — do not use these numbers as defaults:
{"overall_band":0,"cefr":"","task_band":0,"coherence_band":0,"lexis_band":0,"grammar_band":0,"task_matched":"one sentence describing which band descriptor this essay matches for task response","task_summary":"two sentences summarising task response performance","coherence_matched":"one sentence describing which band descriptor this essay matches for coherence","coherence_summary":"two sentences summarising coherence performance","lexis_matched":"one sentence describing which band descriptor this essay matches for lexis","lexis_summary":"two sentences summarising lexical resource performance","grammar_matched":"one sentence describing which band descriptor this essay matches for grammar","grammar_summary":"two sentences summarising grammatical performance","task_evidence_1":"direct quote from essay","task_obs_1":"specific observation about this quote","task_signal_1":"positive","task_evidence_2":"direct quote from essay","task_obs_2":"specific observation about this quote","task_signal_2":"negative","coherence_evidence_1":"direct quote from essay","coherence_obs_1":"specific observation","coherence_signal_1":"positive","coherence_evidence_2":"direct quote from essay","coherence_obs_2":"specific observation","coherence_signal_2":"negative","lexis_evidence_1":"direct quote from essay","lexis_obs_1":"specific observation","lexis_signal_1":"positive","lexis_evidence_2":"direct quote from essay","lexis_obs_2":"specific observation","lexis_signal_2":"negative","grammar_evidence_1":"direct quote from essay","grammar_obs_1":"specific observation","grammar_signal_1":"positive","grammar_evidence_2":"direct quote from essay","grammar_obs_2":"specific observation","grammar_signal_2":"negative","examiner_comment":"two sentences giving an honest overall assessment including band justification","next_band_targets":"two specific, actionable improvements needed to reach the next band — if already Band 8 target Band 9","model_rewrite":"one sentence from the essay rewritten to demonstrate the next band level"}

TASK: ${taskType}
PROMPT: ${topicPrompt}
ESSAY: ${response}`;
}

function buildSpeakingPrompt(part, topicPrompt, transcript) {
  return `You are a senior IELTS Speaking examiner with 15 years of experience marking candidates at all band levels including 8 and 9. Your task is to score the transcript below accurately and without leniency bias.

CRITICAL SCORING INSTRUCTIONS:
- Band 9: Speaks with complete fluency and precision. Extremely rare — award only when genuinely merited.
- Band 8: Speaks fluently with only occasional hesitation. Wide vocabulary range. Complex grammar used accurately most of the time. Award when the transcript clearly demonstrates upper-proficiency speaking.
- Band 7: Speaks at length without noticeable effort. Good vocabulary range. Generally clear. Award when clearly above Band 6 in most criteria.
- Band 6: Able to keep talking but some fluency loss. Adequate vocabulary. Understandable with some effort.
- Band 5: Relies on repetition. Limited vocabulary and grammar. Errors affect clarity at times.
- Do NOT default to Band 6 or 7. Each criterion must be scored independently. overall_band is the mean of four bands, rounded to nearest 0.5.

No apostrophes in output. Return ONLY this JSON:
{"overall_band":0,"cefr":"","fluency_band":0,"lexis_band":0,"grammar_band":0,"pronunciation_band":0,"fluency_matched":"one sentence","fluency_summary":"two sentences","lexis_matched":"one sentence","lexis_summary":"two sentences","grammar_matched":"one sentence","grammar_summary":"two sentences","pronunciation_matched":"one sentence","pronunciation_summary":"two sentences","fluency_evidence_1":"direct quote","fluency_obs_1":"observation","fluency_signal_1":"positive","fluency_evidence_2":"direct quote","fluency_obs_2":"observation","fluency_signal_2":"negative","lexis_evidence_1":"direct quote","lexis_obs_1":"observation","lexis_signal_1":"positive","lexis_evidence_2":"direct quote","lexis_obs_2":"observation","lexis_signal_2":"negative","grammar_evidence_1":"direct quote","grammar_obs_1":"observation","grammar_signal_1":"positive","grammar_evidence_2":"direct quote","grammar_obs_2":"observation","grammar_signal_2":"negative","pronunciation_evidence_1":"direct quote","pronunciation_obs_1":"observation","pronunciation_signal_1":"positive","pronunciation_evidence_2":"direct quote","pronunciation_obs_2":"observation","pronunciation_signal_2":"negative","examiner_comment":"two sentences","next_band_targets":"two specific improvements","model_rewrite":"one phrase rewritten"}

PART: ${part}
QUESTION: ${topicPrompt}
TRANSCRIPT: ${transcript}`;
}

// ─── PDF EXPORT ───────────────────────────────────────────────────────────────
function exportToPDF(feedback, meta) {
  const isWriting = !!feedback.criteria.task;
  const descriptors = isWriting ? WRITING_DESCRIPTORS : SPEAKING_DESCRIPTORS;
  const criteriaMap = isWriting
    ? [{ key: "task" }, { key: "coherence" }, { key: "lexis" }, { key: "grammar" }]
    : [{ key: "fluency" }, { key: "lexis" }, { key: "grammar" }, { key: "pronunciation" }];

  const bc = b => b >= 7 ? "#2E9E6B" : b >= 5.5 ? "#C8922A" : b >= 4 ? "#2E7FC8" : "#D94F4F";
  const sc = s => s === "positive" ? "#2E9E6B" : s === "negative" ? "#D94F4F" : "#C8922A";

  const criteriaHTML = criteriaMap.map(({ key }) => {
    const c = feedback.criteria[key];
    const d = descriptors[key];
    const evHTML = c.evidence.map(ev => `
      <div style="margin-bottom:10px;padding:10px 12px;background:#fafafa;border-radius:7px;border-left:3px solid ${sc(ev.band_signal)}">
        <div style="font-size:9px;color:#888;text-transform:uppercase;letter-spacing:1px;font-family:monospace;margin-bottom:3px">${ev.feature} · <span style="color:${sc(ev.band_signal)}">${ev.band_signal}</span></div>
        <div style="font-style:italic;color:#2d2d2d;font-size:13px;padding:6px 8px;background:#fff;border-radius:5px;margin-bottom:5px">"${ev.extract}"</div>
        <p style="font-size:12px;color:#555;margin:0;line-height:1.6">${ev.observation}</p>
      </div>`).join("");
    return `
      <div style="margin-bottom:18px;border:1px solid #e0e0e0;border-radius:10px;overflow:hidden;page-break-inside:avoid">
        <div style="background:#f5f5f5;padding:11px 14px;display:flex;align-items:center;gap:10px">
          <span style="background:${bc(c.band)}18;color:${bc(c.band)};border:1px solid ${bc(c.band)}55;border-radius:6px;padding:2px 9px;font-family:monospace;font-size:11px;font-weight:700">Band ${c.band}</span>
          <span style="font-weight:700;font-size:13px;color:#111">${d.label}</span>
        </div>
        <div style="padding:13px 14px">
          <p style="font-size:12.5px;color:#444;font-style:italic;margin:0 0 6px;line-height:1.6">${c.descriptor_matched}</p>
          <p style="font-size:13px;color:#222;line-height:1.65;margin:0 0 12px">${c.quick_summary}</p>
          <div style="font-size:9px;color:#999;text-transform:uppercase;letter-spacing:1px;font-family:monospace;margin-bottom:8px">Language Evidence</div>
          ${evHTML}
        </div>
      </div>`;
  }).join("");

  const scoreBoxes = criteriaMap.map(({ key }) => {
    const c = feedback.criteria[key];
    const d = descriptors[key];
    return `<div style="background:#fff;border:1px solid #e0e0e0;border-radius:8px;padding:8px 12px;text-align:center;min-width:70px">
      <div style="font-family:monospace;font-size:20px;font-weight:800;color:${bc(c.band)}">${c.band}</div>
      <div style="font-family:monospace;font-size:9px;color:#888;text-transform:uppercase;letter-spacing:0.8px">${d.label.split(" ")[0]}</div>
    </div>`;
  }).join("");

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>SoundReady Report</title>
  <style>* { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: Georgia, serif; color: #1a1a1a; padding: 40px; max-width: 760px; margin: 0 auto; font-size: 14px; }</style>
  </head><body>
  <div style="display:flex;align-items:flex-start;justify-content:space-between;border-bottom:2px solid #F0A500;padding-bottom:14px;margin-bottom:22px">
    <div><div style="font-family:monospace;font-size:24px;font-weight:800">Sound<span style="color:#F0A500">Ready</span></div>
    <div style="font-family:monospace;font-size:9px;color:#aaa;text-transform:uppercase;letter-spacing:2px;margin-top:2px">Evidence-Based Feedback Report</div></div>
    <div style="text-align:right"><div style="font-family:monospace;font-size:11px;color:#555">${meta.taskType} · ${meta.topicLabel}</div>
    <div style="font-family:monospace;font-size:11px;color:#999">${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</div></div>
  </div>
  <div style="background:#f8f8f8;border:1px solid #e8e8e8;border-radius:12px;padding:18px 20px;margin-bottom:20px">
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px">
      <div style="font-family:monospace;font-size:52px;font-weight:800;color:${bc(feedback.overall_band)};line-height:1">${feedback.overall_band}</div>
      <div><div style="font-size:15px;font-weight:700">IELTS Band Score</div>
      <div style="font-family:monospace;font-size:12px;color:#666">CEFR: ${feedback.cefr}</div></div>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">${scoreBoxes}</div>
  </div>
  <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:10px;padding:13px 15px;margin-bottom:18px">
    <div style="font-family:monospace;font-size:9px;color:#3B82F6;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Examiner Comment</div>
    <p style="font-size:13.5px;line-height:1.7;color:#1e3a5f">${feedback.examiner_comment}</p>
  </div>
  ${criteriaHTML}
  <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:10px;padding:13px 15px;margin-bottom:12px">
    <div style="font-family:monospace;font-size:9px;color:#D97706;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">To Reach the Next Band</div>
    <p style="font-size:13.5px;line-height:1.7;color:#78350F">${feedback.next_band_targets}</p>
  </div>
  <div style="background:#F5F3FF;border:1px solid #DDD6FE;border-radius:10px;padding:13px 15px;margin-bottom:28px">
    <div style="font-family:monospace;font-size:9px;color:#7C3AED;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Model Rewrite</div>
    <p style="font-size:13.5px;line-height:1.7;color:#4C1D95">${feedback.model_rewrite}</p>
  </div>
  <div style="border-top:1px solid #eee;padding-top:12px;display:flex;justify-content:space-between">
    <div style="font-family:monospace;font-size:9px;color:#ccc;text-transform:uppercase">SOUNDREADY ASCEND · Powered by Claude</div>
    <div style="font-family:monospace;font-size:9px;color:#ccc">${new Date().toLocaleString("en-GB")}</div>
  </div>
  </body></html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `SoundReady-Report-Band-${feedback.overall_band}.html`;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function UploadImageButton({ onBase64Change }) {
  const fileRef = useRef(null);
  function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { onBase64Change && onBase64Change(ev.target.result); };
    reader.readAsDataURL(file);
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: C.surface, border: `1.5px dashed ${C.border}`, borderRadius: 9, cursor: "pointer" }}
      onClick={() => fileRef.current?.click()}>
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.textDim }}>Paste your chart image here or</span>
      <button style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.blue, background: "transparent", border: `1px solid ${C.blue}44`, borderRadius: 6, padding: "3px 10px", cursor: "pointer" }}>⬆ Upload Image</button>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleUpload} />
    </div>
  );
}

function CustomPromptToggle({ useCustom, onToggle, customPrompt, onPromptChange, customCueCard, onCueCardChange, showCueCard, saving, onSave, taskType, onBase64Change, uploadedBase64 }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 0, background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: 3, width: "fit-content", marginBottom: useCustom ? 12 : 0 }}>
        {[false, true].map((val) => (
          <button key={String(val)} onClick={() => onToggle(val)} style={{
            padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
            background: useCustom === val ? C.surface : "transparent",
            color: useCustom === val ? C.accent : C.textMuted,
            fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: useCustom === val ? 700 : 400,
            boxShadow: useCustom === val ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            transition: "all 0.15s", whiteSpace: "nowrap",
          }}>
            {val ? "✏️ My Own Prompt" : "📚 Preset Topic"}
          </button>
        ))}
      </div>
      {useCustom && (
        <div style={{ background: C.surfaceAlt, border: `1px solid ${C.accent}44`, borderRadius: 12, padding: "14px 14px 12px" }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 7 }}>
            {showCueCard ? "Part 2 — Main Question" : "Your Custom Prompt"}
          </div>
          <textarea value={customPrompt} onChange={e => onPromptChange(e.target.value)}
            placeholder="Paste your prompt here…"
            style={{ width: "100%", minHeight: 110, background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "11px 13px", color: C.text, fontSize: 14, lineHeight: 1.72, fontFamily: "'Inter', sans-serif", resize: "vertical", outline: "none", boxSizing: "border-box" }}
            onFocus={e => e.target.style.borderColor = C.accent}
            onBlur={e => e.target.style.borderColor = C.border}
          />
          {showCueCard && (
            <>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.accent, textTransform: "uppercase", letterSpacing: 1, margin: "10px 0 7px" }}>Cue Card Bullet Points</div>
              <textarea value={customCueCard} onChange={e => onCueCardChange(e.target.value)}
                placeholder={"You should say:\n— where it was\n— when you went there"}
                style={{ width: "100%", minHeight: 100, background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "11px 13px", color: C.text, fontSize: 14, lineHeight: 1.72, fontFamily: "'Inter', sans-serif", resize: "vertical", outline: "none", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = C.accent}
                onBlur={e => e.target.style.borderColor = C.border}
              />
            </>
          )}
          {taskType === "writing_task1_academic" && onBase64Change && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 7 }}>Task Visual</div>
              {uploadedBase64 ? (
                <div style={{ position: "relative", marginBottom: 6 }}>
                  <img src={uploadedBase64} alt="Uploaded chart" style={{ width: "100%", borderRadius: 8, maxHeight: 220, objectFit: "contain", background: "#fff", border: `1px solid ${C.border}` }} />
                  <button onClick={() => onBase64Change(null)} style={{ position: "absolute", top: 6, right: 6, background: C.red, color: "#fff", border: "none", borderRadius: 6, padding: "3px 8px", fontFamily: "'Inter', sans-serif", fontSize: 12, cursor: "pointer" }}>✕ Remove</button>
                </div>
              ) : (
                <UploadImageButton onBase64Change={onBase64Change} />
              )}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: C.textDim }}>
              {customPrompt.trim() ? `${customPrompt.trim().split(/\s+/).length} words` : "Paste your prompt above"}
            </span>
            <button onClick={() => onSave(customPrompt, customCueCard)} disabled={!customPrompt.trim() || saving}
              style={{ padding: "6px 14px", borderRadius: 8, border: "none", cursor: customPrompt.trim() ? "pointer" : "not-allowed", background: customPrompt.trim() && !saving ? C.accent : C.border, color: customPrompt.trim() && !saving ? "#FFFFFF" : C.textDim, fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700, transition: "all 0.15s" }}>
              {saving ? "Saving…" : "Save Prompt ✓"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryCard({ session, onViewReport }) {
  const [expanded, setExpanded] = useState(false);
  const dateObj = new Date(session.created_at);
  const dateStr = dateObj.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const timeStr = dateObj.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const band = session.overall_band || "—";
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 10 }}>
      <button onClick={() => setExpanded(!expanded)} style={{ width: "100%", padding: "13px 14px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between" }}
        onMouseOver={e => e.currentTarget.style.background = C.surfaceAlt}
        onMouseOut={e => e.currentTarget.style.background = "transparent"}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
            <span style={{ background: BAND_COLOR(band) + "22", color: BAND_COLOR(band), border: `1px solid ${BAND_COLOR(band)}44`, borderRadius: 6, padding: "2px 9px", fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 700 }}>Band {band}</span>
            <span style={{ color: C.text, fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 600 }}>{session.task_type}</span>
            <span style={{ color: C.textMuted, fontFamily: "'Inter', sans-serif", fontSize: 13 }}>· {session.topic_label || "—"}</span>
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.textDim }}>{dateStr} at {timeStr}</div>
        </div>
        <span style={{ color: C.textMuted, fontSize: 16, marginLeft: 8 }}>{expanded ? "▲" : "▼"}</span>
      </button>
      {expanded && (
        <div style={{ padding: "13px 14px", background: C.bg, borderTop: `1px solid ${C.border}` }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Prompt</div>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.text, lineHeight: 1.6, whiteSpace: "pre-wrap", maxHeight: 150, overflowY: "auto" }}>{session.prompt || "—"}</div>
          </div>
          {session.image_url && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Chart / Image</div>
              <img src={session.image_url} alt="Task visual" style={{ width: "100%", borderRadius: 8, maxHeight: 220, objectFit: "contain", background: "#fff", border: `1px solid ${C.border}` }} />
            </div>
          )}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Your Response</div>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.text, lineHeight: 1.6, whiteSpace: "pre-wrap", maxHeight: 150, overflowY: "auto" }}>{session.response || "—"}</div>
          </div>
          {session.feedback && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Examiner Comment</div>
              <div style={{ background: C.blue + "0e", border: `1px solid ${C.blue}28`, borderRadius: 8, padding: "10px 12px", fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.text, lineHeight: 1.6 }}>{session.feedback.examiner_comment || "—"}</div>
            </div>
          )}
          <button onClick={() => onViewReport(session)} style={{ width: "100%", padding: "10px 0", border: "none", borderRadius: 8, background: C.accent, color: "#FFFFFF", fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>View Full Report</button>
        </div>
      )}
    </div>
  );
}

function Pill({ children, active, onClick, color }) {
  const col = color || C.accent;
  return (
    <button onClick={onClick} style={{ padding: "6px 13px", borderRadius: 999, border: `1.5px solid ${active ? col : C.border}`, background: active ? col + "18" : "transparent", color: active ? col : C.textMuted, fontFamily: "'Inter', sans-serif", fontSize: 16, cursor: "pointer", transition: "all 0.15s", fontWeight: active ? 700 : 400, whiteSpace: "nowrap" }}>{children}</button>
  );
}

function ScoreRing({ score, label, color }) {
  const size = 54; const r = size / 2 - 5; const circ = 2 * Math.PI * r; const fill = (score / 9) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 54 }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={3.5} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={3.5} strokeDasharray={`${fill} ${circ}`} strokeDashoffset={circ / 4} strokeLinecap="round" style={{ transition: "stroke-dasharray 1.2s ease" }} />
        <text x={size/2} y={size/2 + 5} textAnchor="middle" fill={color} fontSize={13} fontWeight={700} fontFamily="Inter">{score}</text>
      </svg>
      <span style={{ color: C.textMuted, fontSize: 11, fontFamily: "'Inter', sans-serif", textTransform: "uppercase", letterSpacing: 0.5, textAlign: "center", maxWidth: 60, lineHeight: 1.2 }}>{label}</span>
    </div>
  );
}

function BandSignalDot({ signal }) {
  const col = signal === "positive" ? C.green : signal === "negative" ? C.red : C.accent;
  return <span style={{ width: 7, height: 7, minWidth: 7, borderRadius: "50%", background: col, display: "inline-block", marginTop: 6 }} />;
}

function CriterionCard({ label, band, descriptorMatched, quickSummary, evidence, color, allEvidence, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen || false);
  const [showAll, setShowAll] = useState(false);
  const displayedEvidence = showAll ? allEvidence : evidence;
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 10 }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: C.surfaceAlt, border: "none", cursor: "pointer", textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 6, padding: "2px 9px", fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 700 }}>Band {band}</span>
          <span style={{ color: C.text, fontFamily: "'Inter', sans-serif", fontSize: 11 }}>{label}</span>
        </div>
        <span style={{ color: C.textDim, fontSize: 16, marginLeft: 8 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{ padding: "13px 14px", background: C.surface }}>
          <p style={{ color: C.textMuted, fontSize: 15, lineHeight: 1.65, fontStyle: "italic", margin: "0 0 5px" }}>{descriptorMatched}</p>
          <p style={{ color: C.text, fontSize: 15, lineHeight: 1.65, margin: "0 0 14px" }}>{quickSummary}</p>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Language Evidence</div>
          {displayedEvidence.map((ev, i) => (
            <div key={i} style={{ display: "flex", gap: 9, marginBottom: 11, paddingBottom: 11, borderBottom: i < displayedEvidence.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <BandSignalDot signal={ev.band_signal} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.textDim, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.8 }}>{ev.feature}</div>
                <div style={{ background: C.surfaceAlt, borderLeft: `3px solid ${ev.band_signal === "positive" ? C.green : ev.band_signal === "negative" ? C.red : C.accent}`, borderRadius: "0 7px 7px 0", padding: "7px 10px", marginBottom: 6 }}>
                  <span style={{ color: C.text, fontFamily: "'Inter', sans-serif", fontSize: 15, fontStyle: "italic" }}>"{ev.extract}"</span>
                </div>
                <p style={{ color: C.textMuted, fontSize: 15, lineHeight: 1.6, margin: 0 }}>{ev.observation}</p>
              </div>
            </div>
          ))}
          {allEvidence.length > 2 && (
            <button onClick={() => setShowAll(!showAll)} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, padding: "5px 12px", color: C.textMuted, fontFamily: "'Inter', sans-serif", fontSize: 15, cursor: "pointer", marginTop: 4, width: "100%" }}>
              {showAll ? "Show less ▲" : `Show all ${allEvidence.length} evidence items ▼`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function FeedbackReport({ feedback, criteriaMap, descriptors, ringColors, onExport, exporting }) {
  return (
    <div>
      <div style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 13, padding: "16px 15px", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", flexWrap: "wrap", gap: 24 }}>
          <div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Overall Band</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 40, fontWeight: 700, color: BAND_COLOR(feedback.overall_band), lineHeight: 1 }}>{feedback.overall_band}</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: C.textMuted, marginTop: 3 }}>CEFR {feedback.cefr} · {CEFR(feedback.overall_band)}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: window.innerWidth > 600 ? "repeat(4, auto)" : "repeat(2, 1fr)", gap: window.innerWidth > 600 ? 20 : 10 }}>
            {criteriaMap.map(({ key }, i) => (
              <ScoreRing key={key} score={feedback.criteria[key].band} label={descriptors[key].label} color={ringColors[i]} />
            ))}
          </div>
        </div>
      </div>
      <div style={{ background: C.blue + "0e", border: `1px solid ${C.blue}28`, borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.blue, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>Examiner Comment</div>
        <p style={{ color: C.text, fontSize: 16, lineHeight: 1.68, margin: 0 }}>{feedback.examiner_comment}</p>
      </div>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Criterion Breakdown</div>
      {criteriaMap.map(({ key }, i) => (
        <CriterionCard key={key} label={descriptors[key].label} band={feedback.criteria[key].band} descriptorMatched={feedback.criteria[key].descriptor_matched} quickSummary={feedback.criteria[key].quick_summary} evidence={feedback.criteria[key].evidence.slice(0, 2)} allEvidence={feedback.criteria[key].evidence} color={ringColors[i]} defaultOpen={i === 0} />
      ))}
      <div style={{ background: C.accent + "0e", border: `1px solid ${C.accent}28`, borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>— To Reach the Next Band</div>
        <p style={{ color: C.text, fontSize: 16, lineHeight: 1.68, margin: 0 }}>{feedback.next_band_targets}</p>
      </div>
      <div style={{ background: C.purple + "0e", border: `1px solid ${C.purple}28`, borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.purple, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>Model Rewrite</div>
        <p style={{ color: C.text, fontSize: 16, lineHeight: 1.68, margin: 0 }}>{feedback.model_rewrite}</p>
      </div>
      <button onClick={onExport} disabled={exporting} style={{ width: "100%", padding: "13px 0", background: exporting ? C.border : C.accent, color: exporting ? C.textDim : "#FFFFFF", border: "none", borderRadius: 11, fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 700, cursor: exporting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        {exporting ? "Preparing Report…" : "Download Report"}
      </button>
    </div>
  );
}

// ─── CHART COMPONENTS ─────────────────────────────────────────────────────────
function ChartBar({ data }) {
  const { title, xKey, series, data: rows, yMax, yUnit } = data;
  return (
    <div>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: C.textMuted, marginBottom: 10, textAlign: "center" }}>{title}</div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={rows} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
          <XAxis dataKey={xKey} tick={{ fill: C.textMuted, fontSize: 16, fontFamily: "'Inter', sans-serif" }} />
          <YAxis domain={[0, yMax]} tickFormatter={v => `${v}${yUnit}`} tick={{ fill: C.textMuted, fontSize: 16, fontFamily: "'Inter', sans-serif" }} />
          <Tooltip contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: "'Inter', sans-serif", fontSize: 11 }} formatter={(v) => [`${v}${yUnit}`]} />
          <Legend wrapperStyle={{ fontFamily: "'Inter', sans-serif", fontSize: 10 }} />
          {series.map(s => <Bar key={s.key} dataKey={s.key} fill={s.color} radius={[3, 3, 0, 0]} />)}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartLine({ data }) {
  const { title, xKey, series, data: rows, yMax, yUnit } = data;
  return (
    <div>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: C.textMuted, marginBottom: 10, textAlign: "center" }}>{title}</div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={rows} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
          <XAxis dataKey={xKey} tick={{ fill: C.textMuted, fontSize: 16, fontFamily: "'Inter', sans-serif" }} />
          <YAxis domain={[0, yMax]} tickFormatter={v => `${v}${yUnit}`} tick={{ fill: C.textMuted, fontSize: 16, fontFamily: "'Inter', sans-serif" }} />
          <Tooltip contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: "'Inter', sans-serif", fontSize: 11 }} formatter={(v) => [`${v}${yUnit}`]} />
          <Legend wrapperStyle={{ fontFamily: "'Inter', sans-serif", fontSize: 10 }} />
          {series.map(s => <Line key={s.key} type="monotone" dataKey={s.key} stroke={s.color} strokeWidth={2} dot={{ r: 3 }} />)}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartPie({ data }) {
  const { title, series } = data;
  const RADIAN = Math.PI / 180;
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return value >= 10 ? <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={9} fontFamily="DM Mono">{value}%</text> : null;
  };
  return (
    <div>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: C.textMuted, marginBottom: 6, textAlign: "center" }}>{title}</div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
        {series.map(s => (
          <div key={s.year} style={{ flex: 1, minWidth: 130 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: C.accent, textAlign: "center", marginBottom: 4 }}>{s.year}</div>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={s.data} cx="50%" cy="50%" outerRadius={60} dataKey="value" labelLine={false} label={renderLabel}>
                  {s.data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: "'Inter', sans-serif", fontSize: 11 }} formatter={v => [`${v}%`]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 6 }}>
        {series[0].data.map(d => (
          <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color, display: "inline-block" }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.textMuted }}>{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartProcess({ data }) {
  const { title, steps } = data;
  return (
    <div>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: C.textMuted, marginBottom: 12, textAlign: "center" }}>{title}</div>
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0, justifyContent: "center" }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: C.surfaceAlt, border: `2px solid ${C.accent}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.text, textAlign: "center", maxWidth: 60, whiteSpace: "pre-line", lineHeight: 1.4 }}>{s.label}</div>
            </div>
            {i < steps.length - 1 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "0 4px", marginBottom: 20 }}>
                <div style={{ width: 24, height: 2, background: C.accent }} />
                <div style={{ width: 0, height: 0, borderTop: "5px solid transparent", borderBottom: "5px solid transparent", borderLeft: `7px solid ${C.accent}`, marginTop: -3 }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Task1Visual({ topic, taskType, onBase64Change }) {
  const [uploadedImage, setUploadedImage] = useState(null);
  const fileRef = useRef(null);
  if (taskType !== "Task 1 Academic") return null;
  function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadedImage(url);
    const reader = new FileReader();
    reader.onload = ev => { onBase64Change && onBase64Change(ev.target.result); };
    reader.readAsDataURL(file);
  }
  function clearUpload() { setUploadedImage(null); onBase64Change && onBase64Change(null); }
  const showUploaded = !!uploadedImage;
  const showRealImage = !showUploaded && !!topic.imageUrl;
  const showChart = !showUploaded && !showRealImage;
  return (
    <div style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 14px 12px", marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.accent, textTransform: "uppercase", letterSpacing: 1 }}>
          {showUploaded ? "Your Uploaded Chart" : showRealImage ? "Task Visual" : `Generated ${topic.label}`}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {showUploaded && <button onClick={clearUpload} style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.red, background: "transparent", border: `1px solid ${C.red}44`, borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}>✕ Remove</button>}
        </div>
      </div>
      {showUploaded && <img src={uploadedImage} alt="Uploaded Task 1" style={{ width: "100%", borderRadius: 8, maxHeight: 280, objectFit: "contain", background: "#fff" }} />}
      {showRealImage && <img src={topic.imageUrl} alt={topic.label} style={{ width: "100%", borderRadius: 8, maxHeight: 280, objectFit: "contain", background: "#fff" }} />}
      {showChart && topic.chartType === "bar" && <ChartBar data={topic.chartData} />}
      {showChart && topic.chartType === "line" && <ChartLine data={topic.chartData} />}
      {showChart && topic.chartType === "pie" && <ChartPie data={topic.chartData} />}
      {showChart && topic.chartType === "process" && <ChartProcess data={topic.chartData} />}
    </div>
  );
}

function safeParseJSON(raw) {
  const start = raw.indexOf("{"); const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in response");
  let str = raw.slice(start, end + 1);
  str = str.replace(/[\u2018\u2019]/g, "\\'").replace(/[\u201C\u201D]/g, '\\"');
  try { return JSON.parse(str); } catch {}
  let result = ""; let inString = false; let escaped = false;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (escaped) { result += ch; escaped = false; continue; }
    if (ch === "\\") { escaped = true; result += ch; continue; }
    if (ch === '"') { inString = !inString; result += ch; continue; }
    if (inString && (ch === "\n" || ch === "\r" || ch === "\t")) { result += " "; continue; }
    result += ch;
  }
  return JSON.parse(result);
}

// ─── WRITING PRACTICE ─────────────────────────────────────────────────────────
function WritingPractice({ supabase, userId, onLimitReached }) {
  const [taskType, setTaskType] = useState("Task 2 Academic");
  const [topic, setTopic] = useState(WRITING_TOPICS["Task 2 Academic"][0]);
  const [essay, setEssay] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [view, setView] = useState("write");
  const [exporting, setExporting] = useState(false);
  const [uploadedBase64, setUploadedBase64] = useState(null);
  const [lastEssay, setLastEssay] = useState("");
  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;
  const minWords = taskType === "Task 1 Academic" || taskType === "Task 1 General" ? 150 : 250;

  const taskKey = taskType === "Task 2 Academic" ? "writing_task2_academic"
    : taskType === "Task 2 General" ? "writing_task2_general"
    : taskType === "Task 1 Academic" ? "writing_task1_academic"
    : "writing_task1_general";
  const cp = useCustomPrompt(supabase, taskKey, userId);
  const activePrompt = cp.useCustom && cp.customPrompt.trim() ? cp.customPrompt.trim() : topic.prompt;
  const criteriaMap = [{ key: "task" }, { key: "coherence" }, { key: "lexis" }, { key: "grammar" }];
  const ringColors = [C.blue, C.teal, C.green, C.accent];

  function handleTaskChange(t) {
    setTaskType(t); setTopic(WRITING_TOPICS[t][0]);
    setEssay(""); setFeedback(null); setView("write"); cp.setUseCustom(false);
  }

  async function analyze() {
    if (wordCount < 50) return;
    setLastEssay(essay); setLoading(true); setFeedback(null);
    try {
      const userContent = uploadedBase64
        ? [
            { type: "image", source: { type: "base64", media_type: uploadedBase64.startsWith("data:image/png") ? "image/png" : "image/jpeg", data: uploadedBase64.split(",")[1] } },
            { type: "text", text: buildWritingPrompt(taskType, activePrompt, essay) },
          ]
        : buildWritingPrompt(taskType, activePrompt, essay);

      const res = await fetch(`${PROXY}/analyse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId || "",
        },
        body: JSON.stringify({ messages: [{ role: "user", content: userContent }] })
      });
      const data = await res.json();
      if (res.status === 403 && data.error === "free_limit_reached") {
        onLimitReached("writing");
        setLoading(false);
        return;
      }
      if (data.error) throw new Error(`API error: ${data.error.type} — ${data.error.message}`);
      const raw = data.content.find(b => b.type === "text")?.text || "{}";
      const flat = safeParseJSON(raw);
      const nested = {
        overall_band: flat.overall_band, cefr: flat.cefr,
        examiner_comment: flat.examiner_comment, next_band_targets: flat.next_band_targets, model_rewrite: flat.model_rewrite,
        criteria: {
          task: { band: flat.task_band, descriptor_matched: flat.task_matched, quick_summary: flat.task_summary, evidence: [
            { feature: "Task coverage", extract: flat.task_evidence_1, observation: flat.task_obs_1, band_signal: flat.task_signal_1 },
            { feature: "Idea development", extract: flat.task_evidence_2, observation: flat.task_obs_2, band_signal: flat.task_signal_2 },
          ]},
          coherence: { band: flat.coherence_band, descriptor_matched: flat.coherence_matched, quick_summary: flat.coherence_summary, evidence: [
            { feature: "Paragraph organisation", extract: flat.coherence_evidence_1, observation: flat.coherence_obs_1, band_signal: flat.coherence_signal_1 },
            { feature: "Cohesive devices", extract: flat.coherence_evidence_2, observation: flat.coherence_obs_2, band_signal: flat.coherence_signal_2 },
          ]},
          lexis: { band: flat.lexis_band, descriptor_matched: flat.lexis_matched, quick_summary: flat.lexis_summary, evidence: [
            { feature: "Vocabulary range", extract: flat.lexis_evidence_1, observation: flat.lexis_obs_1, band_signal: flat.lexis_signal_1 },
            { feature: "Collocations", extract: flat.lexis_evidence_2, observation: flat.lexis_obs_2, band_signal: flat.lexis_signal_2 },
          ]},
          grammar: { band: flat.grammar_band, descriptor_matched: flat.grammar_matched, quick_summary: flat.grammar_summary, evidence: [
            { feature: "Sentence complexity", extract: flat.grammar_evidence_1, observation: flat.grammar_obs_1, band_signal: flat.grammar_signal_1 },
            { feature: "Range of structures", extract: flat.grammar_evidence_2, observation: flat.grammar_obs_2, band_signal: flat.grammar_signal_2 },
          ]},
        }
      };
      setFeedback(nested); setView("feedback");
      saveSession(supabase, userId, { taskType, topicLabel: cp.useCustom ? "Custom Prompt" : topic.label, prompt: activePrompt, response: essay, imageBase64: uploadedBase64, feedback: nested, overallBand: nested.overall_band });
    } catch (err) {
      setFeedback({ error: true, message: err?.message }); setView("write");
    }
    setLoading(false);
  }

  return (
    <div>
      {feedback && !feedback.error && (
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          <Pill active={view === "write"} onClick={() => setView("write")} color={C.accent}>My Response</Pill>
          <Pill active={view === "feedback"} onClick={() => setView("feedback")} color={C.purple}>Feedback Report</Pill>
        </div>
      )}
      {view === "write" && (
        <>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 7 }}>Task Type</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 13, flexWrap: "wrap" }}>
            {["Task 2 Academic", "Task 2 General", "Task 1 Academic", "Task 1 General"].map(t => (
              <Pill key={t} active={taskType === t} onClick={() => handleTaskChange(t)}>{t}</Pill>
            ))}
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 7 }}>Topic</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 13, flexWrap: "wrap" }}>
            {WRITING_TOPICS[taskType].map(t => (
              <Pill key={t.id} active={topic.id === t.id} onClick={() => { setTopic(t); setEssay(""); setFeedback(null); setView("write"); setUploadedBase64(null); }}>{t.label}</Pill>
            ))}
          </div>
          <CustomPromptToggle useCustom={cp.useCustom} onToggle={cp.setUseCustom} customPrompt={cp.customPrompt} onPromptChange={cp.setCustomPrompt} customCueCard={cp.customCueCard} onCueCardChange={cp.setCustomCueCard} showCueCard={false} saving={cp.saving} onSave={cp.savePrompt} taskType={taskKey} onBase64Change={setUploadedBase64} uploadedBase64={uploadedBase64} />
          {!cp.useCustom && <Task1Visual topic={topic} taskType={taskType} onBase64Change={setUploadedBase64} />}
          {!cp.useCustom && (
            <div style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 11, padding: "12px 14px", marginBottom: 12 }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 7 }}>Prompt</div>
              <p style={{ color: C.text, fontSize: 16, lineHeight: 1.75, margin: 0, whiteSpace: "pre-line" }}>{topic.prompt}</p>
            </div>
          )}
          <textarea value={essay} onChange={e => setEssay(e.target.value)} placeholder={`Write your ${taskType} response here…`}
            style={{ width: "100%", minHeight: 180, background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 11, padding: "13px 14px", color: C.text, fontSize: 16, lineHeight: 1.72, fontFamily: "'Inter', sans-serif", resize: "vertical", outline: "none", boxSizing: "border-box" }}
            onFocus={e => e.target.style.borderColor = C.accent}
            onBlur={e => e.target.style.borderColor = C.border}
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 9 }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: wordCount >= minWords ? C.green : C.textMuted }}>
              {wordCount} / {minWords} words {wordCount >= minWords ? "✓" : ""}
            </span>
            <button onClick={analyze} disabled={wordCount < 50 || loading} style={{ background: wordCount >= 50 && !loading ? C.accent : C.border, color: wordCount >= 50 && !loading ? "#FFFFFF" : C.textDim, border: "none", borderRadius: 10, padding: "10px 20px", fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 700, cursor: wordCount >= 50 && !loading ? "pointer" : "not-allowed" }}>
              {loading ? "Analysing…" : "Submit & Analyse →"}
            </button>
          </div>
          {loading && (
            <div style={{ textAlign: "center", padding: "28px 0", color: C.textMuted, fontFamily: "'Inter', sans-serif", fontSize: 12 }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>⏳</div>
              Extracting language samples and mapping to band descriptors…
            </div>
          )}
          {lastEssay && feedback && !feedback.error && (
            <div style={{ marginTop: 14, background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 11, padding: "12px 14px" }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Your Submitted Response</div>
              <p style={{ color: C.text, fontSize: 16, lineHeight: 1.75, margin: 0, whiteSpace: "pre-line" }}>{lastEssay}</p>
            </div>
          )}
          {feedback?.error && (
            <div style={{ marginTop: 12, padding: 12, background: C.red + "15", border: `1px solid ${C.red}33`, borderRadius: 9, color: C.red, fontFamily: "'Inter', sans-serif", fontSize: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Analysis failed</div>
              <div style={{ fontSize: 15, opacity: 0.85, wordBreak: "break-all" }}>{feedback.message || "Unknown error — check connection and try again."}</div>
            </div>
          )}
        </>
      )}
      {view === "feedback" && feedback && !feedback.error && (
        <FeedbackReport feedback={feedback} criteriaMap={criteriaMap} descriptors={WRITING_DESCRIPTORS} ringColors={ringColors}
          onExport={() => { setExporting(true); exportToPDF(feedback, { taskType, topicLabel: topic.label }); setTimeout(() => setExporting(false), 1500); }}
          exporting={exporting} />
      )}
    </div>
  );
}
