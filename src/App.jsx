import { useState, useRef, useEffect, createContext, useContext } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import LessonViewer from './components/LessonViewer/LessonViewer';
import SkillTree from './components/SkillTree/SkillTree';
import PdfLibrary from './components/PdfViewer/PdfLibrary';
import PdfViewer from './components/PdfViewer/PdfViewer';

function LessonSelector() {
  return null;
}

// ─── BACKEND PROXY ───────────────────────────────────────────────────────────
const PROXY = "https://web-production-e43ad.up.railway.app";

// ─── THEME — SoundReady English Light Mode ───────────────────────────────────
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
const TRANSLATIONS = {
  en: {
    myResponse: "My Response", feedbackReport: "Feedback Report", taskType: "Task Type",
    topic: "Topic", prompt: "Prompt",
    writeResponseHere: (tt) => `Write your ${tt} response here…`,
    analysing: "Analysing…", submitAnalyse: "Submit & Analyse →",
    extractingLanguage: "Extracting language samples and mapping to band descriptors…",
    yourSubmittedResponse: "Your Submitted Response",
    analysisFailed: "Analysis failed", unknownError: "Unknown error — check connection and try again.",
    partIntro: "Introduction & Interview", partLongTurn: "Long Turn", partDiscussion: "Discussion",
    partHint1: "Answer naturally as you would in a conversation. Aim for 2–3 sentences per question.",
    partHint2: "Use your 1 minute of preparation time. Speak for the full 1–2 minutes without stopping.",
    partHint3: "Give extended answers with reasons and examples. Show abstract thinking.",
    ieltsFeedback: "IELTS Feedback", pronunciation: "Pronunciation", part: "Part",
    scoringResponse: "Scoring your response…",
    runningAssessment: "Running IELTS assessment across all three parts holistically",
    recording: "Recording", recordingComplete: "Recording Complete", readyToRecord: "Ready to Record",
    stopRecording: "Stop Recording", startRecording: "Start Recording",
    reRecord: "↺ Re-record", transcribe: "Transcribe →",
    transcribing: "Transcribing your response…", whisperProcessing: "Whisper AI is processing your audio",
    recordingError: "Recording Error", tryAgain: "↺ Try Again",
    transcriptionComplete: "Transcription Complete",
    reviewTranscript: "Review and correct your transcript before saving",
    yourTranscript: "Your Transcript — edit if needed", orTypePaste: "or type / paste",
    pasteSpokenResponse: "Paste or type your spoken response here to analyse without recording…",
    overallBand: "Overall Band", examinerComment: "Examiner Comment",
    criterionBreakdown: "Criterion Breakdown", toReachNextBand: "— To Reach the Next Band",
    modelRewrite: "Model Rewrite", preparingReport: "Preparing Report…", downloadReport: "Download Report",
    languageEvidence: "Language Evidence",
    showLess: "Show less ▲", showAll: (n) => `Show all ${n} evidence items ▼`,
    loadingDashboard: "Loading your dashboard…", dayStreak: "Day Streak",
    startStreakToday: "Complete a session today to start your streak",
    personalBest: "Personal Best", writing_label: "Writing", speaking_label: "Speaking",
    noSessionsYet: "No sessions yet", nextTarget: "Next Target",
    almostThere: "Almost there — one strong session could push you over",
    goodMomentum: "Good momentum — keep practising consistently",
    keepGoing: "Every session moves you closer — keep going",
    nextTargetBand: "Next Target Band", completeToUnlock: "Complete a session to unlock",
    noSessionsFirst: "Complete your first Writing or Speaking session to see your stats",
    recentSessions: "Recent Sessions", bandProgress: "Band Progress",
    sampleData: "✦ Sample data — complete a session to track your real progress",
    both: "Both", noSessionsRange: "No sessions in this time range",
    loadingHistory: "Loading your session history…",
    noSessionsYetTitle: "No sessions yet",
    noSessionsYetSub: "Complete a Writing or Speaking session to build your history.",
    backToHistory: "← Back to History", sessionCount: (n) => `${n} Session${n !== 1 ? "s" : ""}`,
    chartImage: "Chart / Image", viewFullReport: "View Full Report",
    freePlan: "Free Plan", adminPanel: "Admin Panel",
    upgradePremium: "⭐ Upgrade to Premium", logOut: "Log Out",
    privacyPolicy: "Privacy Policy", termsOfService: "Terms of Service",
    disclaimer: "Disclaimer", contact: "Contact",
    copyright: "© 2026 SoundReady English — SoundReady-Ascend. All rights reserved. Reproduction without permission is prohibited.",
    myOwnPrompt: "✏️ My Own Prompt", presetTopic: "📚 Preset Topic",
    part2MainQuestion: "Part 2 — Main Question", yourCustomPrompt: "Your Custom Prompt",
    cueCardBullets: "Cue Card Bullet Points", taskVisual: "Task Visual",
    saving: "Saving…", savePrompt: "Save Prompt ✓",
    tabDashboard: "Dashboard", tabWriting: "Writing", tabSpeaking: "Speaking", tabHistory: "My History",
    partSaved: "Part saved",
    getMyResults: "Get My Results →",
    completeAllParts: "Please complete all three parts before getting your results",
    nextPart: "Next Part →",
    submittingAll: "Scoring all three parts together…",
  },
  es: {
    myResponse: "Mi Respuesta", feedbackReport: "Informe de Retroalimentación",
    taskType: "Tipo de Tarea", topic: "Tema", prompt: "Enunciado",
    writeResponseHere: (tt) => `Escribe tu respuesta de ${tt} aquí…`,
    analysing: "Analizando…", submitAnalyse: "Enviar y Analizar →",
    extractingLanguage: "Extrayendo muestras de idioma y mapeando a descriptores de banda…",
    yourSubmittedResponse: "Tu Respuesta Enviada",
    analysisFailed: "Análisis fallido", unknownError: "Error desconocido — verifica la conexión e intenta de nuevo.",
    partIntro: "Introducción y Entrevista", partLongTurn: "Turno Largo", partDiscussion: "Discusión",
    partHint1: "Responde de forma natural como en una conversación. Apunta a 2–3 oraciones por pregunta.",
    partHint2: "Usa tu minuto de preparación. Habla durante 1–2 minutos completos sin parar.",
    partHint3: "Da respuestas extensas con razones y ejemplos. Muestra pensamiento abstracto.",
    ieltsFeedback: "Retroalimentación IELTS", pronunciation: "Pronunciación", part: "Parte",
    scoringResponse: "Puntuando tu respuesta…",
    runningAssessment: "Evaluación IELTS holística de las tres partes",
    recording: "Grabando", recordingComplete: "Grabación Completa", readyToRecord: "Listo para Grabar",
    stopRecording: "Detener Grabación", startRecording: "Iniciar Grabación",
    reRecord: "↺ Re-grabar", transcribe: "Transcribir →",
    transcribing: "Transcribiendo tu respuesta…", whisperProcessing: "Whisper AI está procesando tu audio",
    recordingError: "Error de Grabación", tryAgain: "↺ Intentar de Nuevo",
    transcriptionComplete: "Transcripción Completa",
    reviewTranscript: "Revisa y corrige tu transcripción antes de guardar",
    yourTranscript: "Tu Transcripción — edita si es necesario", orTypePaste: "o escribe / pega",
    pasteSpokenResponse: "Pega o escribe tu respuesta hablada aquí para analizar sin grabar…",
    overallBand: "Banda General", examinerComment: "Comentario del Examinador",
    criterionBreakdown: "Desglose por Criterio", toReachNextBand: "— Para Alcanzar la Siguiente Banda",
    modelRewrite: "Reescritura Modelo", preparingReport: "Preparando Informe…", downloadReport: "Descargar Informe",
    languageEvidence: "Evidencia Lingüística",
    showLess: "Ver menos ▲", showAll: (n) => `Ver los ${n} elementos de evidencia ▼`,
    loadingDashboard: "Cargando tu panel…", dayStreak: "Racha Diaria",
    startStreakToday: "Completa una sesión hoy para iniciar tu racha",
    personalBest: "Mejor Marca Personal", writing_label: "Escritura", speaking_label: "Expresión Oral",
    noSessionsYet: "Sin sesiones aún", nextTarget: "Próximo Objetivo",
    almostThere: "Casi ahí — una sesión sólida podría hacerte avanzar",
    goodMomentum: "Buen impulso — sigue practicando con constancia",
    keepGoing: "Cada sesión te acerca — sigue adelante",
    nextTargetBand: "Próxima Banda Objetivo", completeToUnlock: "Completa una sesión para desbloquear",
    noSessionsFirst: "Completa tu primera sesión de Escritura o Expresión Oral para ver tus estadísticas",
    recentSessions: "Sesiones Recientes", bandProgress: "Progreso de Banda",
    sampleData: "✦ Datos de muestra — completa una sesión para rastrear tu progreso real",
    both: "Ambos", noSessionsRange: "Sin sesiones en este rango de tiempo",
    loadingHistory: "Cargando tu historial de sesiones…",
    noSessionsYetTitle: "Sin sesiones aún",
    noSessionsYetSub: "Completa una sesión de Escritura o Expresión Oral para construir tu historial.",
    backToHistory: "← Volver al Historial", sessionCount: (n) => `${n} Sesión${n !== 1 ? "es" : ""}`,
    chartImage: "Gráfico / Imagen", viewFullReport: "Ver Informe Completo",
    freePlan: "Plan Gratuito", adminPanel: "Panel de Administración",
    upgradePremium: "⭐ Mejorar a Premium", logOut: "Cerrar Sesión",
    privacyPolicy: "Política de Privacidad", termsOfService: "Términos de Servicio",
    disclaimer: "Aviso Legal", contact: "Contacto",
    copyright: "© 2026 SoundReady English — SoundReady-Ascend. Todos los derechos reservados.",
    myOwnPrompt: "✏️ Mi Propio Enunciado", presetTopic: "📚 Tema Preestablecido",
    part2MainQuestion: "Parte 2 — Pregunta Principal", yourCustomPrompt: "Tu Enunciado Personalizado",
    cueCardBullets: "Puntos de la Tarjeta de Apoyo", taskVisual: "Visual de Tarea",
    saving: "Guardando…", savePrompt: "Guardar Enunciado ✓",
    tabDashboard: "Panel", tabWriting: "Escritura", tabSpeaking: "Expresión Oral", tabHistory: "Mi Historial",
    partSaved: "Parte guardada",
    getMyResults: "Obtener Mis Resultados →",
    completeAllParts: "Por favor completa las tres partes antes de obtener tus resultados",
    nextPart: "Siguiente Parte →",
    submittingAll: "Puntuando las tres partes juntas…",
  },
  zh: {
    myResponse: "我的回答", feedbackReport: "反馈报告", taskType: "任务类型",
    topic: "题目", prompt: "题目提示",
    writeResponseHere: (tt) => `在此填写您的${tt}回答…`,
    analysing: "分析中…", submitAnalyse: "提交并分析 →",
    extractingLanguage: "正在提取语言样本并映射到评分标准…",
    yourSubmittedResponse: "您提交的回答",
    analysisFailed: "分析失败", unknownError: "未知错误 — 请检查网络连接后重试。",
    partIntro: "简介与访谈", partLongTurn: "长篇独白", partDiscussion: "讨论",
    partHint1: "像日常对话一样自然回答，每题目标2–3句话。",
    partHint2: "利用1分钟准备时间，连续流畅地讲满1–2分钟。",
    partHint3: "给出详细回答，提供理由和例子，展现抽象思维。",
    ieltsFeedback: "雅思反馈", pronunciation: "发音", part: "部分",
    scoringResponse: "正在评分…",
    runningAssessment: "对三个部分进行整体雅思评估",
    recording: "录音中", recordingComplete: "录音完成", readyToRecord: "准备录音",
    stopRecording: "停止录音", startRecording: "开始录音",
    reRecord: "↺ 重新录音", transcribe: "转录 →",
    transcribing: "正在转录您的回答…", whisperProcessing: "Whisper AI 正在处理您的音频",
    recordingError: "录音错误", tryAgain: "↺ 重试",
    transcriptionComplete: "转录完成",
    reviewTranscript: "保存前请检查并更正转录内容",
    yourTranscript: "您的转录 — 如需请编辑", orTypePaste: "或输入 / 粘贴",
    pasteSpokenResponse: "在此粘贴或输入您的口语回答以进行分析…",
    overallBand: "总体评分", examinerComment: "考官评语",
    criterionBreakdown: "各项评分", toReachNextBand: "— 达到下一个评分段",
    modelRewrite: "范文改写", preparingReport: "正在准备报告…", downloadReport: "下载报告",
    languageEvidence: "语言证据",
    showLess: "收起 ▲", showAll: (n) => `展开全部 ${n} 条证据 ▼`,
    loadingDashboard: "正在加载您的仪表盘…", dayStreak: "连续天数",
    startStreakToday: "今天完成一次练习以开始连续记录",
    personalBest: "个人最佳", writing_label: "写作", speaking_label: "口语",
    noSessionsYet: "暂无记录", nextTarget: "下一目标",
    almostThere: "即将达成 — 一次出色的练习就能突破",
    goodMomentum: "势头良好 — 保持持续练习",
    keepGoing: "每次练习都让您更近一步 — 继续加油",
    nextTargetBand: "下一目标评分段", completeToUnlock: "完成一次练习以解锁",
    noSessionsFirst: "完成第一次写作或口语练习以查看统计数据",
    recentSessions: "近期练习", bandProgress: "评分进度",
    sampleData: "✦ 示例数据 — 完成一次练习以追踪您的真实进度",
    both: "全部", noSessionsRange: "该时间段内暂无记录",
    loadingHistory: "正在加载您的练习记录…",
    noSessionsYetTitle: "暂无记录",
    noSessionsYetSub: "完成一次写作或口语练习以建立您的历史记录。",
    backToHistory: "← 返回历史", sessionCount: (n) => `共 ${n} 次练习`,
    chartImage: "图表 / 图片", viewFullReport: "查看完整报告",
    freePlan: "免费计划", adminPanel: "管理面板",
    upgradePremium: "⭐ 升级到高级版", logOut: "退出登录",
    privacyPolicy: "隐私政策", termsOfService: "服务条款",
    disclaimer: "免责声明", contact: "联系我们",
    copyright: "© 2026 SoundReady English — SoundReady-Ascend. 保留所有权利。",
    myOwnPrompt: "✏️ 自定义题目", presetTopic: "📚 预设题目",
    part2MainQuestion: "第2部分 — 主要问题", yourCustomPrompt: "您的自定义题目",
    cueCardBullets: "提示卡要点", taskVisual: "任务图表",
    saving: "保存中…", savePrompt: "保存题目 ✓",
    tabDashboard: "仪表盘", tabWriting: "写作", tabSpeaking: "口语", tabHistory: "我的记录",
    partSaved: "部分已保存",
    getMyResults: "获取我的结果 →",
    completeAllParts: "请在获取结果前完成所有三个部分",
    nextPart: "下一部分 →",
    submittingAll: "正在对三个部分一起评分…",
  },
};

const LangContext = createContext("en");

function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem("sr_lang") || "en"; } catch { return "en"; }
  });
  function switchLang(l) {
    setLang(l);
    try { localStorage.setItem("sr_lang", l); } catch {}
  }
  return <LangContext.Provider value={{ lang, switchLang }}>{children}</LangContext.Provider>;
}

function useLang() {
  const { lang } = useContext(LangContext);
  return TRANSLATIONS[lang] || TRANSLATIONS.en;
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
        const { data: urlData } = supabase.storage
          .from("task-images")
          .getPublicUrl(fileName);
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

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────
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
    const speakingSessions = allSessions.filter(s => s.task_type?.includes("Speaking"));

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

// ─── PARAPHRASED BAND DESCRIPTORS ────────────────────────────────────────────
const WRITING_DESCRIPTORS = {
  task: {
    label: "Task Response / Task Achievement",
    features: ["Task coverage", "Position clarity", "Idea development", "Relevance & accuracy"],
    bands: {
      9: "Covers every part of the task with sophistication and insight. The position is fully developed and sustained from start to finish. Ideas are precise, well-supported, and completely relevant — nothing is wasted.",
      8: "Covers all parts of the task thoroughly. Presents a clear, well-developed position sustained throughout. Ideas are fully extended with relevant, specific support. No irrelevant content.",
      7: "Addresses all parts of the task. Position is clear but may not be fully developed in every section. Main ideas are relevant and extended, though some points could be better supported.",
      6: "Addresses the main requirements but may not cover all parts equally. A position is attempted but may shift or lack consistency. Ideas are present but development is sometimes limited or general.",
      5: "Only partially addresses the task. A position may be unclear or inconsistently maintained. Ideas are underdeveloped, formulaic, or repetitive. Some irrelevant or inaccurate content may appear.",
      4: "Barely touches on the task. The response is too short, off-topic, or misunderstands what is being asked. Any position taken is hard to follow. Ideas are very limited and poorly supported.",
      3: "Only manages to address the task in a very basic way, if at all. The response is minimal, the format may be wrong, and the ideas are very difficult to follow.",
      2: "Attempts to respond but the writing is so limited that it is very hard to understand what the student is trying to say. Little or no connection to the task.",
      1: "No real attempt to address the task. Content is absent, copied, or completely unrelated.",
      0: "Nothing written, or the response is in a different language entirely.",
    }
  },
  coherence: {
    label: "Coherence & Cohesion",
    features: ["Paragraph organisation", "Logical sequencing", "Cohesive devices", "Referencing & substitution"],
    bands: {
      9: "Ideas flow effortlessly from one to the next. Cohesion is invisible — the writing guides the reader without any mechanical connectors. Paragraphing is perfect, with each paragraph building on the last.",
      8: "Ideas are sequenced logically and cohesion is handled skilfully — connectors blend into the writing without drawing attention. Paragraphing is well-managed with a clear topic focus in each paragraph.",
      7: "Information flows logically with clear progression. Cohesive devices are used effectively but with some mechanical or over-frequent use. Paragraphing is generally clear but occasionally inconsistent.",
      6: "Overall organisation is evident. Cohesive devices are used but sometimes inaccurately or repetitively. Paragraphs have a recognisable structure but may lack clear central ideas.",
      5: "Basic organisation is present but ideas may not progress clearly. Connectors are limited or overused. Paragraphing may be inappropriate or mechanical.",
      4: "Hard to follow the logic of the response. Ideas jump around without clear linking. Connectors are used wrongly or not at all. Paragraphing is missing or random.",
      3: "Very little organisation. The response is difficult to read as a whole. Ideas appear in no clear order and connectors are mostly absent or incorrect.",
      2: "Almost no organisation. The writing does not flow at all and the reader has to guess how ideas are connected.",
      1: "No evidence of organisation or linking of ideas.",
      0: "Nothing written.",
    }
  },
  lexis: {
    label: "Lexical Resource",
    features: ["Vocabulary range", "Topic-specific vocabulary", "Collocations & word choice", "Spelling & word form"],
    bands: {
      9: "Vocabulary is wide, precise, and natural. Word choice is sophisticated and always appropriate. Collocations feel native. Spelling and word form are virtually error-free.",
      8: "Uses a wide, varied vocabulary with natural control. Collocations are accurate and topic-specific terms are used appropriately. Rare minor errors in spelling or word form have no impact on communication.",
      7: "Good range of vocabulary with awareness of less common or topic-specific words. Some imprecision in collocation or word choice, but meaning is clear. Occasional spelling or word form errors.",
      6: "Adequate vocabulary for the task. Some attempts at less common vocabulary, though these may be inaccurate or inappropriate. Noticeable errors in spelling and word form, but overall meaning is clear.",
      5: "Limited vocabulary range. Repetition of the same words and phrases. Errors in word choice, spelling, and word form are frequent enough to occasionally strain the reader.",
      4: "Very basic vocabulary. The same simple words are used repeatedly. Errors in spelling and word form are frequent and make the writing hard to read in places.",
      3: "Only a handful of basic words used correctly. Severe limitations in vocabulary make most of the response hard to understand.",
      2: "Vocabulary is so limited that communication almost breaks down. Only isolated words or phrases may be recognisable.",
      1: "No real vocabulary to assess — only a word or two, possibly copied.",
      0: "Nothing written.",
    }
  },
  grammar: {
    label: "Grammatical Range & Accuracy",
    features: ["Sentence complexity", "Range of structures", "Error frequency", "Punctuation"],
    bands: {
      9: "A full range of grammatical structures used with complete flexibility and accuracy. Complex sentences feel effortless. Errors are essentially absent.",
      8: "Wide range of sentence structures used flexibly and accurately. Complex sentences are handled with confidence. Errors are rare and do not affect meaning — typically minor slips.",
      7: "Variety of sentence structures with general accuracy. Complex sentences are attempted and mostly correct, though some errors occur. Errors do not impede communication.",
      6: "Mix of simple and complex sentences. Complex structures are attempted but errors are present. Grammar errors are noticeable but overall meaning remains clear.",
      5: "Limited range of structures, relying mainly on simple sentences. Errors in complex structures are frequent. Some errors cause difficulty understanding specific parts.",
      4: "Very basic sentence structures only. Errors are frequent and often make the meaning unclear. Grammar control is weak even in simple sentences.",
      3: "Sentence structures are severely limited. Errors dominate the response and make it very difficult to understand.",
      2: "Almost no grammatical control. Only isolated words or short phrases may be correct.",
      1: "No grammar to assess — the response is too short or incoherent.",
      0: "Nothing written.",
    }
  }
};

const SPEAKING_DESCRIPTORS = {
  fluency: {
    label: "Fluency & Coherence",
    features: ["Speaking pace & flow", "Hesitation & self-correction", "Logical sequencing", "Discourse markers"],
    bands: {
      9: "Speaks with complete fluency and no effort. Any hesitation is purely to think about ideas, never to search for words. Ideas are perfectly sequenced and the listener never has to work hard to follow.",
      8: "Speaks fluently with only occasional hesitation. Any pausing is for content rather than to search for words. Ideas are clearly sequenced and discourse markers are used naturally.",
      7: "Speaks at length without noticeable effort. May occasionally repeat or self-correct, but this does not affect overall fluency. Uses a range of cohesive devices, though sometimes mechanically.",
      6: "Able to keep talking but fluency is sometimes lost due to hesitation, repetition, or self-correction. Discourse markers are used but not always accurately or naturally.",
      5: "Maintains speech but relies on repetition and rephrasing to keep going. Hesitation is frequent. Basic connectors dominate. Ideas may lose logical flow.",
      4: "Speech is very slow and broken. Long pauses are frequent. The student often cannot finish sentences or loses the thread completely. Very hard for the listener to follow.",
      3: "Can only produce very short bursts of speech with long pauses. Communication is severely disrupted by hesitation. Ideas are almost impossible to follow.",
      2: "Almost unable to produce connected speech. Only isolated words or short memorised phrases come out.",
      1: "No real spoken communication. Only a word or two, possibly memorised.",
      0: "No response at all.",
    }
  },
  lexis: {
    label: "Lexical Resource",
    features: ["Vocabulary range", "Topic-specific language", "Paraphrasing ability", "Idiomatic language"],
    bands: {
      9: "Vocabulary is wide, precise, and completely natural. Uses idiomatic and less common expressions with ease and accuracy. Paraphrasing is effortless. Errors are essentially absent.",
      8: "Uses a varied vocabulary with flexibility. Handles less common and idiomatic expressions with some ease. Paraphrasing is attempted naturally when needed. Rare minor errors.",
      7: "Good range of vocabulary with some use of less common expressions. Attempts paraphrase with reasonable success. Some imprecision in word choice, but meaning is clear.",
      6: "Adequate vocabulary for most topics. Meaning is generally clear but range is limited. Paraphrasing is attempted but may be awkward or inaccurate.",
      5: "Limited vocabulary range. Relies on basic, familiar words. Paraphrasing is rare or unsuccessful. Frequent errors in word choice may cause occasional strain.",
      4: "Very basic vocabulary only. The student repeats the same simple words and cannot paraphrase effectively. Errors in word choice make the meaning unclear in places.",
      3: "Only a very small set of basic words used correctly. Severe vocabulary limitations make communication very difficult.",
      2: "Vocabulary is so limited that only isolated words are recognisable. Meaning rarely comes through.",
      1: "No usable vocabulary. Only one or two words, possibly memorised.",
      0: "No response.",
    }
  },
  grammar: {
    label: "Grammatical Range & Accuracy",
    features: ["Structure variety", "Complex sentence use", "Tense accuracy", "Error frequency & impact"],
    bands: {
      9: "Uses the full range of grammatical structures naturally and accurately. Complex forms feel effortless. Errors are virtually absent.",
      8: "Uses a wide range of structures with flexibility. Complex sentences are used accurately and naturally. Errors are occasional and do not affect understanding.",
      7: "Uses a variety of structures with reasonable accuracy. Both simple and complex forms are used effectively despite some errors. Error-free sentences are frequent.",
      6: "Uses basic structures accurately. Some complex sentences are attempted but errors are present. Errors are noticeable but communication is generally maintained.",
      5: "Mostly simple sentence forms. Short utterances may be accurate but complex attempts contain frequent errors. Errors occasionally make meaning unclear.",
      4: "Only very simple structures attempted, and even these contain frequent errors. Grammar control is weak. Errors regularly disrupt meaning.",
      3: "Almost no grammatical control. Only a few basic forms used, often incorrectly. Very hard to understand.",
      2: "Grammar is essentially absent. Only isolated words or fixed phrases produced.",
      1: "No grammar to assess.",
      0: "No response.",
    }
  },
  pronunciation: {
    label: "Pronunciation",
    features: ["Intelligibility", "Stress & rhythm", "Intonation", "Individual sounds"],
    bands: {
      9: "Pronunciation is consistently clear and natural. Uses a full range of features — stress, rhythm, intonation — with precision. L1 accent may be present but never affects understanding.",
      8: "Easy to understand throughout. Uses a range of pronunciation features with control. Stress and intonation are generally appropriate. Occasional L1 influence does not affect clarity.",
      7: "Generally clear and easy to follow. Some features of pronunciation are controlled well. Minor lapses in stress or intonation occur but do not impede understanding.",
      6: "Understandable but requires some listener effort at times. Intonation and stress patterns are attempted. Individual sounds are occasionally mispronounced but meaning is usually clear.",
      5: "Understanding is possible but takes effort. Limited range of pronunciation features. Stress and rhythm are inconsistent. Some mispronounced sounds cause clarity issues.",
      4: "Frequently difficult to understand. Mispronunciation of sounds, wrong stress, and flat intonation all combine to make listening a challenge. The listener has to work hard throughout.",
      3: "Very hard to understand for most of the response. Severe pronunciation problems disrupt communication at every turn.",
      2: "Almost impossible to understand due to pronunciation. Only occasional words are clear.",
      1: "No intelligible speech to assess.",
      0: "No response.",
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
      id: "t1a-1", label: "Bar Chart",
      imageUrl: null,
      chartType: "bar",
      chartData: {
        title: "Daily internet use by age group (%)",
        xKey: "age", yUnit: "%", yMax: 100,
        series: [{ key: "2005", color: "#2E7FC8" }, { key: "2015", color: "#C8922A" }],
        data: [
          { age: "16–24", "2005": 75, "2015": 97 },
          { age: "25–34", "2005": 67, "2015": 93 },
          { age: "35–44", "2005": 51, "2015": 88 },
          { age: "45–54", "2005": 34, "2015": 73 },
          { age: "55–64", "2005": 18, "2015": 52 },
          { age: "65+",   "2005": 8,  "2015": 28 },
        ],
      },
      prompt: "The bar chart shows the percentage of people in different age groups who used the internet daily in a particular country in 2005 and 2015.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
    },
    {
      id: "t1a-2", label: "Line Graph",
      imageUrl: null,
      chartType: "line",
      chartData: {
        title: "Tourist arrivals by country (millions)",
        xKey: "year", yUnit: "M", yMax: 10,
        series: [
          { key: "Country A", color: "#2E9E6B" },
          { key: "Country B", color: "#D94F4F" },
          { key: "Country C", color: "#7B6FC8" },
        ],
        data: [
          { year: "1995", "Country A": 2,   "Country B": 2.5, "Country C": 1.5 },
          { year: "2000", "Country A": 3.5, "Country B": 3.5, "Country C": 1.4 },
          { year: "2005", "Country A": 5,   "Country B": 4.5, "Country C": 1.6 },
          { year: "2010", "Country A": 6,   "Country B": 5,   "Country C": 1.5 },
          { year: "2015", "Country A": 7,   "Country B": 4,   "Country C": 1.5 },
          { year: "2020", "Country A": 8,   "Country B": 3,   "Country C": 1.5 },
        ],
      },
      prompt: "The graph shows the changes in the number of tourists visiting three different countries between 1995 and 2020.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
    },
    {
      id: "t1a-3", label: "Pie Charts",
      imageUrl: null,
      chartType: "pie",
      chartData: {
        title: "Household spending by category",
        series: [
          {
            year: "1980",
            data: [
              { name: "Housing", value: 25, color: "#2E7FC8" },
              { name: "Food",    value: 35, color: "#2E9E6B" },
              { name: "Transport", value: 15, color: "#C8922A" },
              { name: "Leisure", value: 10, color: "#7B6FC8" },
              { name: "Other",   value: 15, color: "#2EADB4" },
            ],
          },
          {
            year: "2020",
            data: [
              { name: "Housing", value: 38, color: "#2E7FC8" },
              { name: "Food",    value: 22, color: "#2E9E6B" },
              { name: "Transport", value: 20, color: "#C8922A" },
              { name: "Leisure", value: 14, color: "#7B6FC8" },
              { name: "Other",   value: 6,  color: "#2EADB4" },
            ],
          },
        ],
      },
      prompt: "The pie charts show the proportion of household income spent on different categories in a country in 1980 and 2020.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
    },
    {
      id: "t1a-4", label: "Process",
      imageUrl: null,
      chartType: "process",
      chartData: {
        title: "How rainwater becomes drinking water",
        steps: [
          { icon: "🌧", label: "Rainfall" },
          { icon: "🏞", label: "Reservoir\nCollection" },
          { icon: "🪨", label: "Sand & Gravel\nFiltration" },
          { icon: "⚗️", label: "Chemical\nTreatment" },
          { icon: "🛢", label: "Storage\nTank" },
          { icon: "🏠", label: "Distribution\nto Homes" },
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
// FIXED: clean, single JSON template with WRITING fields (not speaking)
function buildWritingPrompt(taskType, topicPrompt, response) {
  return `You are a senior IELTS examiner with 15 years of experience marking scripts at all band levels including 8 and 9. Score the essay below accurately and without leniency bias.

CRITICAL SCORING INSTRUCTIONS:
- Band 9: Virtually no errors. Fully addresses all parts. Sophisticated vocabulary, complex grammar, flawless cohesion. Rare.
- Band 8: Minor errors only. All parts addressed. Wide range of vocabulary and grammar used with flexibility. Cohesion is skilful.
- Band 7: Good control with some inaccuracies. All parts addressed but development may be uneven. Good range of vocabulary with some less common use.
- Band 6: Adequate. Main requirements addressed but not all parts equally. Limited range with some errors.
- Band 5: Partial task coverage. Limited vocabulary and grammar range. Errors affect clarity.
- Do NOT default to Band 6 or 7. If the evidence supports Band 8 or 9, award it.
- CRITICAL: Do NOT use language copied or paraphrased from the task prompt as positive evidence. If a quote mirrors the prompt wording, ignore it.
- Do NOT suggest proofreading as a next step. Give a specific constructive tip instead.
- Each criterion (task, coherence, lexis, grammar) must be scored independently based on its own evidence.
- overall_band is the mean of the four criterion bands, rounded to the nearest 0.5.

FEEDBACK LANGUAGE RULES:
- Write as a warm, encouraging tutor speaking directly to the student.
- Use simple, everyday English. Avoid jargon like "lexical resource" or "cohesive devices".
- Always acknowledge what the student did well before explaining what to improve.
- Keep sentences short. Aim for a reading age of 14-16.
- For next_band_targets, write exactly two tips. Each tip must have a short bold-style title on its own line, followed by 2-3 sentences of warm plain advice.
- Write next_band_targets at B1-C1 level — clear for teenagers and parents.
- Each tip must reference something specific from the essay.
- Never use terms like "lexical precision", "circumlocution", "syntactic subordination".
- Always include one practical study habit the student can do outside the classroom.
- No apostrophes anywhere in the output.

Return ONLY this JSON with accurate values:
{"overall_band":0,"cefr":"","task_band":0,"coherence_band":0,"lexis_band":0,"grammar_band":0,"task_matched":"plain English explanation of which level the student is at for answering the question","task_summary":"one sentence on what they did well, one sentence on what to improve","coherence_matched":"plain English explanation of which level the student is at for organising ideas","coherence_summary":"one sentence on what they did well, one sentence on what to improve","lexis_matched":"plain English explanation of which level the student is at for vocabulary","lexis_summary":"one sentence on what they did well, one sentence on what to improve","grammar_matched":"plain English explanation of which level the student is at for grammar","grammar_summary":"one sentence on what they did well, one sentence on what to improve","task_evidence_1":"direct quote from essay","task_obs_1":"warm plain-English observation","task_signal_1":"positive","task_evidence_2":"direct quote from essay","task_obs_2":"warm plain-English observation","task_signal_2":"negative","coherence_evidence_1":"direct quote from essay","coherence_obs_1":"warm plain-English observation","coherence_signal_1":"positive","coherence_evidence_2":"direct quote from essay","coherence_obs_2":"warm plain-English observation","coherence_signal_2":"negative","lexis_evidence_1":"direct quote from essay","lexis_obs_1":"warm plain-English observation","lexis_signal_1":"positive","lexis_evidence_2":"direct quote from essay","lexis_obs_2":"warm plain-English observation","lexis_signal_2":"negative","grammar_evidence_1":"direct quote from essay","grammar_obs_1":"warm plain-English observation","grammar_signal_1":"positive","grammar_evidence_2":"direct quote from essay","grammar_obs_2":"warm plain-English observation","grammar_signal_2":"negative","examiner_comment":"two warm tutor-style sentences with band justification","next_band_targets":"two specific friendly tips with bold titles referencing real examples","model_rewrite":"one sentence from the essay rewritten at the next band level with a brief note on what changed"}

TASK: ${taskType}
PROMPT: ${topicPrompt}
ESSAY: ${response}`;
}

// FIXED: properly closed template literal, holistic scoring across all 3 parts
function buildHolisticSpeakingPrompt(part1Q, part1T, part2Q, part2T, part3Q, part3T) {
  return `You are a senior IELTS Speaking examiner with 15 years of experience. Score the candidate below using the official IELTS Speaking Band Descriptors.

IMPORTANT: You are scoring all three parts of the IELTS Speaking test together as one holistic assessment. Award one score per criterion based on the candidate's overall performance across all three parts, not per part.

CRITICAL SCORING INSTRUCTIONS:
- Band 9: Complete fluency and precision. Sophisticated, idiomatic vocabulary. Flexible, accurate grammar throughout. Rare.
- Band 8: Fluent with only occasional hesitation. Wide vocabulary, natural idiomatic use. Complex grammar mostly accurate. Easy to understand.
- Band 7: Speaks at length without noticeable effort. Good vocabulary range. Variety of structures with general accuracy. Generally clear.
- Band 6: Keeps talking but some fluency loss. Adequate vocabulary. Mix of structures with errors. Understandable with some effort.
- Band 5: Relies on repetition. Limited vocabulary and grammar. Frequent hesitation. Errors affect clarity.
- Do NOT default to Band 6 or 7. Award Band 8 or 9 when the evidence merits it.
- Score all four criteria holistically based on overall impression across all three parts.
- overall_band = mean of four criteria rounded to nearest 0.5.

CONTEXT — READ BEFORE SCORING:
- Part 1 is a short personal interview. Do NOT penalise lack of complex argument development.
- Part 2 is a long turn monologue. Expect natural self-correction and filler.
- Part 3 is a two-way discussion. Expect hesitation and repair as thinking out loud is normal.
- Spoken English is NOT written English. Do NOT penalise natural spoken features: "I mean", "you know", "and that sort of thing", repetition for emphasis, mid-sentence self-correction.
- Do NOT penalise natural disfluency markers like "um", "well", "let me think". Only penalise disfluency that genuinely disrupts communication.
- PRONUNCIATION NOTE: This assessment is based on written transcripts. Do NOT make confident claims about pronunciation, stress, or intonation. Flag in feedback that full pronunciation assessment requires audio.

FEEDBACK LANGUAGE RULES:
- Write as a warm encouraging tutor speaking to the student.
- Use simple everyday English. Avoid jargon.
- Acknowledge strengths first, then improvements.
- Reading age 14-16, short sentences.
- For next_band_targets, write exactly two tips. Each tip starts with a short bold-style title on its own line, then 2-3 sentences of plain advice.
- Write at B1-C1 level. Specific enough to guide improvement.
- Reference real examples from the transcripts.
- Never use terms like "lexical precision", "circumlocution", "syntactic subordination".
- Always include one practical study habit for outside the classroom.
- No apostrophes anywhere in output.

Return ONLY this JSON with accurate values:
{"overall_band":0,"cefr":"","fluency_band":0,"lexis_band":0,"grammar_band":0,"pronunciation_band":0,"fluency_matched":"plain English explanation of fluency level across all three parts","fluency_summary":"one sentence on what they did well with fluency, one sentence on what to improve","lexis_matched":"plain English explanation of vocabulary level across all three parts","lexis_summary":"one sentence on what they did well with word choice, one sentence on what to improve","grammar_matched":"plain English explanation of grammar level across all three parts","grammar_summary":"one sentence on what they did well grammatically, one sentence on what to improve","pronunciation_matched":"provisional plain English explanation noting full assessment requires audio","pronunciation_summary":"one sentence on what the transcripts suggest about pronunciation, one sentence noting full assessment requires audio","fluency_evidence_1":"direct quote from any part","fluency_obs_1":"warm plain-English observation","fluency_signal_1":"positive","fluency_evidence_2":"direct quote from any part","fluency_obs_2":"warm plain-English observation — do not penalise natural spoken fillers","fluency_signal_2":"negative","lexis_evidence_1":"direct quote from any part","lexis_obs_1":"warm plain-English observation","lexis_signal_1":"positive","lexis_evidence_2":"direct quote from any part","lexis_obs_2":"warm plain-English observation","lexis_signal_2":"negative","grammar_evidence_1":"direct quote from any part","grammar_obs_1":"warm plain-English observation","grammar_signal_1":"positive","grammar_evidence_2":"direct quote from any part","grammar_obs_2":"warm plain-English observation","grammar_signal_2":"negative","pronunciation_evidence_1":"any transcript evidence relevant to pronunciation","pronunciation_obs_1":"warm plain-English observation flagging transcript limitation","pronunciation_signal_1":"positive","pronunciation_evidence_2":"any transcript evidence relevant to pronunciation","pronunciation_obs_2":"warm plain-English observation","pronunciation_signal_2":"negative","examiner_comment":"two warm tutor-style sentences wrapping up overall performance","next_band_targets":"two specific friendly tips with bold titles referencing real examples","model_rewrite":"one sentence from any part rewritten at next band level with brief note on what changed"}

PART 1 — Personal Interview
Question: ${part1Q}
Transcript: ${part1T}

PART 2 — Long Turn
Question: ${part2Q}
Transcript: ${part2T}

PART 3 — Discussion
Question: ${part3Q}
Transcript: ${part3T}`;
}

// ─── PDF EXPORT (FIXED template literals) ────────────────────────────────────
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
    const evHTML = c.evidence.map(ev => `<div style="margin-bottom:10px;padding:10px 12px;background:#fafafa;border-radius:7px;border-left:3px solid ${sc(ev.band_signal)};"><div style="font-style:italic;color:#2d2d2d;font-size:13px;padding:6px 8px;background:#fff;border-radius:5px;margin-bottom:5px">"${ev.extract}"</div><p style="font-size:12px;color:#555;margin:0;line-height:1.6">${ev.observation}</p></div>`).join("");

    return `<div style="margin-bottom:18px;border:1px solid #e0e0e0;border-radius:10px;overflow:hidden;page-break-inside:avoid"><div style="background:#f5f5f5;padding:11px 14px;display:flex;align-items:center;gap:10px"><span style="background:${bc(c.band)}18;color:${bc(c.band)};border:1px solid ${bc(c.band)}55;border-radius:6px;padding:2px 9px;font-family:monospace;font-size:11px;font-weight:700">Band ${c.band}</span><span style="font-weight:700;font-size:13px;color:#111">${d.label}</span></div><div style="padding:13px 14px"><p style="font-size:12.5px;color:#444;font-style:italic;margin:0 0 6px;line-height:1.6">${c.descriptor_matched}</p><p style="font-size:13px;color:#222;line-height:1.65;margin:0 0 12px">${c.quick_summary}</p><div style="font-size:9px;color:#999;text-transform:uppercase;letter-spacing:1px;font-family:monospace;margin-bottom:8px">Language Evidence from Candidate Response</div>${evHTML}</div></div>`;
  }).join("");

  const scoreBoxes = criteriaMap.map(({ key }) => {
    const c = feedback.criteria[key];
    const d = descriptors[key];
    return `<div style="background:#fff;border:1px solid #e0e0e0;border-radius:8px;padding:8px 12px;text-align:center;min-width:70px"><div style="font-family:monospace;font-size:20px;font-weight:800;color:${bc(c.band)}">${c.band}</div><div style="font-family:monospace;font-size:9px;color:#888;text-transform:uppercase;letter-spacing:0.8px">${d.label.split(" ")[0]}</div></div>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>SoundReady Ascend Report — ${meta.taskType} — Band ${feedback.overall_band}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, serif; color: #1a1a1a; padding: 40px; max-width: 760px; margin: 0 auto; font-size: 14px; }
    @media print {
      body { padding: 24px; }
      @page { margin: 20mm; }
    }
  </style>
</head>
<body>
  <div style="display:flex;align-items:flex-start;justify-content:space-between;border-bottom:2px solid #F0A500;padding-bottom:14px;margin-bottom:22px">
    <div>
      <div style="font-family:monospace;font-size:24px;font-weight:800;letter-spacing:-0.5px">Sound<span style="color:#F0A500">Ready</span></div>
      <div style="font-family:monospace;font-size:9px;color:#aaa;text-transform:uppercase;letter-spacing:2px;margin-top:2px">Evidence-Based Feedback Report</div>
    </div>
    <div style="text-align:right">
      <div style="font-family:monospace;font-size:11px;color:#555;margin-bottom:2px">${meta.taskType} · ${meta.topicLabel}</div>
      <div style="font-family:monospace;font-size:11px;color:#999">${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</div>
    </div>
  </div>

  <div style="background:#f8f8f8;border:1px solid #e8e8e8;border-radius:12px;padding:18px 20px;margin-bottom:20px">
    <div style="font-family:monospace;font-size:9px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">Overall Result</div>
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px">
      <div style="font-family:monospace;font-size:52px;font-weight:800;color:${bc(feedback.overall_band)};line-height:1">${feedback.overall_band}</div>
      <div>
        <div style="font-size:15px;font-weight:700;margin-bottom:3px">IELTS Band Score</div>
        <div style="font-family:monospace;font-size:12px;color:#666">CEFR Level: ${feedback.cefr} · ${CEFR(feedback.overall_band)}</div>
      </div>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">${scoreBoxes}</div>
  </div>

  <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:10px;padding:13px 15px;margin-bottom:18px">
    <div style="font-family:monospace;font-size:9px;color:#3B82F6;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Examiner Comment</div>
    <p style="font-size:13.5px;line-height:1.7;color:#1e3a5f">${feedback.examiner_comment}</p>
  </div>

  <div style="font-family:monospace;font-size:9px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px">Detailed Criterion Breakdown — Extracted Language Evidence</div>
  ${criteriaHTML}

  <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:10px;padding:13px 15px;margin-bottom:12px;page-break-inside:avoid">
    <div style="font-family:monospace;font-size:9px;color:#D97706;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">To Reach the Next Band</div>
    <p style="font-size:13.5px;line-height:1.7;color:#78350F">${feedback.next_band_targets}</p>
  </div>

  <div style="background:#F5F3FF;border:1px solid #DDD6FE;border-radius:10px;padding:13px 15px;margin-bottom:28px;page-break-inside:avoid">
    <div style="font-family:monospace;font-size:9px;color:#7C3AED;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Model Rewrite</div>
    <p style="font-size:13.5px;line-height:1.7;color:#4C1D95">${feedback.model_rewrite}</p>
  </div>

  <div style="border-top:1px solid #eee;padding-top:12px;display:flex;justify-content:space-between;align-items:center">
    <div style="font-family:monospace;font-size:9px;color:#ccc;text-transform:uppercase;letter-spacing:1px">SOUNDREADY ASCEND · Powered by Claude</div>
    <div style="font-family:monospace;font-size:9px;color:#ccc">${new Date().toLocaleString("en-GB")}</div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `SoundReady-Report-Band-${feedback.overall_band}.html`;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
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
  const t = useLang();
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
            {val ? t.myOwnPrompt : t.presetTopic}
          </button>
        ))}
      </div>

      {useCustom && (
        <div style={{ background: C.surfaceAlt, border: `1px solid ${C.accent}44`, borderRadius: 12, padding: "14px 14px 12px" }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 7 }}>
            {showCueCard ? t.part2MainQuestion : t.yourCustomPrompt}
          </div>
          <textarea
            value={customPrompt}
            onChange={e => onPromptChange(e.target.value)}
            placeholder={showCueCard
              ? "Paste the main Part 2 question here…"
              : taskType?.includes("Task 1 Academic")
                ? "Paste the Task 1 Academic prompt here…"
                : taskType?.includes("Task 1 General")
                  ? "Paste the Task 1 General letter prompt here…"
                  : "Paste your Task 2 essay question here…"}
            style={{ width: "100%", minHeight: 110, background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "11px 13px", color: C.text, fontSize: 14, lineHeight: 1.72, fontFamily: "'Inter', sans-serif", resize: "vertical", outline: "none", boxSizing: "border-box" }}
            onFocus={e => e.target.style.borderColor = C.accent}
            onBlur={e => e.target.style.borderColor = C.border}
          />

          {showCueCard && (
            <>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.accent, textTransform: "uppercase", letterSpacing: 1, margin: "10px 0 7px" }}>{t.cueCardBullets}</div>
              <textarea
                value={customCueCard}
                onChange={e => onCueCardChange(e.target.value)}
                placeholder={"You should say:\n— where it was\n— when you went there\n— what you did\n— and explain why it was memorable."}
                style={{ width: "100%", minHeight: 100, background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "11px 13px", color: C.text, fontSize: 14, lineHeight: 1.72, fontFamily: "'Inter', sans-serif", resize: "vertical", outline: "none", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = C.accent}
                onBlur={e => e.target.style.borderColor = C.border}
              />
            </>
          )}

          {taskType === "writing_task1_academic" && onBase64Change && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 7 }}>{t.taskVisual}</div>
              {uploadedBase64 ? (
                <div style={{ position: "relative", marginBottom: 6 }}>
                  <img src={uploadedBase64} alt="Uploaded chart" style={{ width: "100%", borderRadius: 8, maxHeight: 220, objectFit: "contain", background: "#fff", border: `1px solid ${C.border}` }} />
                  <button onClick={() => onBase64Change(null)} style={{ position: "absolute", top: 6, right: 6, background: C.red, color: "#fff", border: "none", borderRadius: 6, padding: "3px 8px", fontFamily: "'Inter', sans-serif", fontSize: 12, cursor: "pointer" }}>
                    ✕ Remove
                  </button>
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
            <button
              onClick={() => onSave(customPrompt, customCueCard)}
              disabled={!customPrompt.trim() || saving}
              style={{
                padding: "6px 14px", borderRadius: 8, border: "none", cursor: customPrompt.trim() ? "pointer" : "not-allowed",
                background: customPrompt.trim() && !saving ? C.accent : C.border,
                color: customPrompt.trim() && !saving ? "#FFFFFF" : C.textDim,
                fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700, transition: "all 0.15s",
              }}>
              {saving ? t.saving : t.savePrompt}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryCard({ session, onViewReport }) {
  const t = useLang();
  const [expanded, setExpanded] = useState(false);
  const dateObj = new Date(session.created_at);
  const dateStr = dateObj.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const timeStr = dateObj.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const taskType = session.task_type || "Unknown";
  const topicLabel = session.topic_label || "—";
  const band = session.overall_band || "—";

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 10 }}>
      <button onClick={() => setExpanded(!expanded)} style={{
        width: "100%", padding: "13px 14px", background: "transparent", border: "none",
        cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center",
        justifyContent: "space-between", transition: "background 0.15s",
      }}
        onMouseOver={e => e.currentTarget.style.background = C.surfaceAlt}
        onMouseOut={e => e.currentTarget.style.background = "transparent"}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
            <span style={{ background: BAND_COLOR(band) + "22", color: BAND_COLOR(band), border: `1px solid ${BAND_COLOR(band)}44`, borderRadius: 6, padding: "2px 9px", fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 700, whiteSpace: "nowrap" }}>Band {band}</span>
            <span style={{ color: C.text, fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 600 }}>{taskType}</span>
            <span style={{ color: C.textMuted, fontFamily: "'Inter', sans-serif", fontSize: 13 }}>· {topicLabel}</span>
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.textDim }}>{dateStr} at {timeStr}</div>
        </div>
        <span style={{ color: C.textMuted, fontSize: 16, marginLeft: 8, flexShrink: 0 }}>{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div style={{ padding: "13px 14px", background: C.bg, borderTop: `1px solid ${C.border}` }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Prompt</div>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.text, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 150, overflowY: "auto" }}>
              {session.prompt || "—"}
            </div>
          </div>

          {session.image_url && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{t.chartImage}</div>
              <img src={session.image_url} alt="Task visual" style={{ width: "100%", borderRadius: 8, maxHeight: 220, objectFit: "contain", background: "#fff", border: `1px solid ${C.border}` }} />
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Your Response</div>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.text, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 150, overflowY: "auto" }}>
              {session.response || "—"}
            </div>
          </div>

          {session.feedback && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{t.examinerComment}</div>
              <div style={{ background: C.blue + "0e", border: `1px solid ${C.blue}28`, borderRadius: 8, padding: "10px 12px", fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.text, lineHeight: 1.6 }}>
                {session.feedback.examiner_comment || "—"}
              </div>
            </div>
          )}

          <button onClick={() => onViewReport(session)} style={{
            width: "100%", padding: "10px 0", border: "none", borderRadius: 8,
            background: C.accent, color: "#FFFFFF", fontFamily: "'Inter', sans-serif",
            fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>{t.viewFullReport}</button>
        </div>
      )}
    </div>
  );
}

function Pill({ children, active, onClick, color }) {
  const col = color || C.accent;
  return (
    <button onClick={onClick} style={{
      padding: "6px 13px", borderRadius: 999, border: `1.5px solid ${active ? col : C.border}`,
      background: active ? col + "18" : "transparent", color: active ? col : C.textMuted,
      fontFamily: "'Inter', sans-serif", fontSize: 16, cursor: "pointer",
      transition: "all 0.15s", fontWeight: active ? 700 : 400, whiteSpace: "nowrap",
    }}>{children}</button>
  );
}

function ScoreRing({ score, label, color }) {
  const size = 54;
  const r = size / 2 - 5;
  const circ = 2 * Math.PI * r;
  const fill = (score / 9) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 54 }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={3.5} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={3.5}
          strokeDasharray={`${fill} ${circ}`} strokeDashoffset={circ / 4} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1.2s ease" }} />
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
  const t = useLang();
  const [open, setOpen] = useState(defaultOpen || false);
  const [showAll, setShowAll] = useState(false);
  const displayedEvidence = showAll ? allEvidence : evidence;

  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 10 }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 14px", background: C.surfaceAlt, border: "none", cursor: "pointer", textAlign: "left",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 6, padding: "2px 9px", fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 700, whiteSpace: "nowrap" }}>Band {band}</span>
          <span style={{ color: C.text, fontFamily: "'Inter', sans-serif", fontSize: 11 }}>{label}</span>
        </div>
        <span style={{ color: C.textDim, fontSize: 16, marginLeft: 8 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{ padding: "13px 14px", background: C.surface }}>
          <p style={{ color: C.textMuted, fontSize: 15, lineHeight: 1.65, fontStyle: "italic", margin: "0 0 5px" }}>{descriptorMatched}</p>
          <p style={{ color: C.text, fontSize: 15, lineHeight: 1.65, margin: "0 0 14px" }}>{quickSummary}</p>

          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>{t.languageEvidence}</div>

          {displayedEvidence.map((ev, i) => (
            <div key={i} style={{ display: "flex", gap: 9, marginBottom: 11, paddingBottom: 11, borderBottom: i < displayedEvidence.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <BandSignalDot signal={ev.band_signal} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.textDim, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.8 }}>
                  {ev.feature}
                </div>
                <div style={{ background: C.surfaceAlt, borderLeft: `3px solid ${ev.band_signal === "positive" ? C.green : ev.band_signal === "negative" ? C.red : C.accent}`, borderRadius: "0 7px 7px 0", padding: "7px 10px", marginBottom: 6 }}>
                  <span style={{ color: C.text, fontFamily: "'Inter', sans-serif", fontSize: 15, fontStyle: "italic" }}>"{ev.extract}"</span>
                </div>
                <p style={{ color: C.textMuted, fontSize: 15, lineHeight: 1.6, margin: 0 }}>{ev.observation}</p>
              </div>
            </div>
          ))}

          {allEvidence.length > 2 && (
            <button onClick={() => setShowAll(!showAll)} style={{
              background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7,
              padding: "5px 12px", color: C.textMuted, fontFamily: "'Inter', sans-serif", fontSize: 15,
              cursor: "pointer", marginTop: 4, width: "100%",
            }}>
              {showAll ? t.showLess : t.showAll(allEvidence.length)}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function FeedbackReport({ feedback, criteriaMap, descriptors, ringColors, onExport, exporting }) {
  const t = useLang();
  return (
    <div>
      <div style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 13, padding: "16px 15px", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", flexWrap: "wrap", gap: 24 }}>
          <div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{t.overallBand}</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 40, fontWeight: 700, color: BAND_COLOR(feedback.overall_band), lineHeight: 1 }}>{feedback.overall_band}</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: C.textMuted, marginTop: 3 }}>CEFR {feedback.cefr} · {CEFR(feedback.overall_band)}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: window.innerWidth > 600 ? "repeat(4, auto)" : "repeat(2, 1fr)", gap: window.innerWidth > 600 ? 20 : 10, flex: "none" }}>
            {criteriaMap.map(({ key }, i) => (
              <ScoreRing key={key} score={feedback.criteria[key].band} label={descriptors[key].label} color={ringColors[i]} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: C.blue + "0e", border: `1px solid ${C.blue}28`, borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.blue, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>{t.examinerComment}</div>
        <p style={{ color: C.text, fontSize: 16, lineHeight: 1.68, margin: 0 }}>{feedback.examiner_comment}</p>
      </div>

      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>{t.criterionBreakdown}</div>
      {criteriaMap.map(({ key }, i) => (
        <CriterionCard
          key={key}
          label={descriptors[key].label}
          band={feedback.criteria[key].band}
          descriptorMatched={feedback.criteria[key].descriptor_matched}
          quickSummary={feedback.criteria[key].quick_summary}
          evidence={feedback.criteria[key].evidence.slice(0, 2)}
          allEvidence={feedback.criteria[key].evidence}
          color={ringColors[i]}
          defaultOpen={i === 0}
        />
      ))}

      <div style={{ background: C.accent + "0e", border: `1px solid ${C.accent}28`, borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>{t.toReachNextBand}</div>
        <p style={{ color: C.text, fontSize: 16, lineHeight: 1.68, margin: 0, whiteSpace: "pre-line" }}>{feedback.next_band_targets}</p>
      </div>

      <div style={{ background: C.purple + "0e", border: `1px solid ${C.purple}28`, borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.purple, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>{t.modelRewrite}</div>
        <p style={{ color: C.text, fontSize: 16, lineHeight: 1.68, margin: 0 }}>{feedback.model_rewrite}</p>
      </div>

      <button onClick={onExport} disabled={exporting} style={{
        width: "100%", padding: "13px 0",
        background: exporting ? C.border : C.accent,
        color: exporting ? C.textDim : "#FFFFFF",
        border: "none", borderRadius: 11, fontFamily: "'Inter', sans-serif", fontSize: 15,
        fontWeight: 700, cursor: exporting ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        transition: "all 0.2s",
      }}>
        {exporting ? t.preparingReport : t.downloadReport}
      </button>
    </div>
  );
}

// ─── TASK 1 CHART COMPONENTS ─────────────────────────────────────────────────
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

  function clearUpload() {
    setUploadedImage(null);
    onBase64Change && onBase64Change(null);
  }

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
          {showUploaded && (
            <button onClick={clearUpload} style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.red, background: "transparent", border: `1px solid ${C.red}44`, borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}>✕ Remove</button>
          )}
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

// ─── JSON REPAIR ─────────────────────────────────────────────────────────────
function safeParseJSON(raw) {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in response");
  let str = raw.slice(start, end + 1);
  str = str.replace(/[\u2018\u2019]/g, "\\'").replace(/[\u201C\u201D]/g, '\\"');
  try { return JSON.parse(str); } catch {}
  let result = "";
  let inString = false;
  let escaped = false;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (escaped) { result += ch; escaped = false; continue; }
    if (ch === "\\") { escaped = true; result += ch; continue; }
    if (ch === '"') { inString = !inString; result += ch; continue; }
    if (inString && ch === "\n") { result += " "; continue; }
    if (inString && ch === "\r") { result += " "; continue; }
    if (inString && ch === "\t") { result += " "; continue; }
    result += ch;
  }
  return JSON.parse(result);
}

// ─── WRITING PRACTICE ────────────────────────────────────────────────────────
function WritingPractice({ supabase, userId }) {
  const t = useLang();
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

  function handleTaskChange(newType) {
    setTaskType(newType); setTopic(WRITING_TOPICS[newType][0]);
    setEssay(""); setFeedback(null); setView("write");
    cp.setUseCustom(false);
  }

  async function analyze() {
    if (wordCount < 50) return;
    setLastEssay(essay);
    setLoading(true); setFeedback(null);
    let data;
    try {
      const userContent = uploadedBase64
        ? [
            { type: "image", source: { type: "base64", media_type: uploadedBase64.startsWith("data:image/png") ? "image/png" : "image/jpeg", data: uploadedBase64.split(",")[1] } },
            { type: "text", text: buildWritingPrompt(taskType, activePrompt, essay) },
          ]
        : buildWritingPrompt(taskType, activePrompt, essay);

      const res = await fetch(`${PROXY}/analyse`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": userId },
        body: JSON.stringify({ messages: [{ role: "user", content: userContent }] })
      });
      data = await res.json();
      if (data.error) throw new Error(`API error: ${data.error.type} — ${data.error.message}`);
      const raw = data.content.find(b => b.type === "text")?.text || "{}";
      const flat = safeParseJSON(raw);
      const str = (v) => (v == null ? "—" : typeof v === "object" ? JSON.stringify(v) : String(v));
      const nested = {
        overall_band: flat.overall_band,
        cefr: flat.cefr,
        examiner_comment: str(flat.examiner_comment),
        next_band_targets: str(flat.next_band_targets),
        model_rewrite: str(flat.model_rewrite),
        criteria: {
          task: { band: flat.task_band, descriptor_matched: str(flat.task_matched), quick_summary: str(flat.task_summary), evidence: [
            { feature: "Task coverage",    extract: str(flat.task_evidence_1), observation: str(flat.task_obs_1), band_signal: flat.task_signal_1 || "neutral" },
            { feature: "Idea development", extract: str(flat.task_evidence_2), observation: str(flat.task_obs_2), band_signal: flat.task_signal_2 || "neutral" },
          ]},
          coherence: { band: flat.coherence_band, descriptor_matched: str(flat.coherence_matched), quick_summary: str(flat.coherence_summary), evidence: [
            { feature: "Paragraph organisation", extract: str(flat.coherence_evidence_1), observation: str(flat.coherence_obs_1), band_signal: flat.coherence_signal_1 || "neutral" },
            { feature: "Cohesive devices",       extract: str(flat.coherence_evidence_2), observation: str(flat.coherence_obs_2), band_signal: flat.coherence_signal_2 || "neutral" },
          ]},
          lexis: { band: flat.lexis_band, descriptor_matched: str(flat.lexis_matched), quick_summary: str(flat.lexis_summary), evidence: [
            { feature: "Vocabulary range", extract: str(flat.lexis_evidence_1), observation: str(flat.lexis_obs_1), band_signal: flat.lexis_signal_1 || "neutral" },
            { feature: "Collocations",     extract: str(flat.lexis_evidence_2), observation: str(flat.lexis_obs_2), band_signal: flat.lexis_signal_2 || "neutral" },
          ]},
          grammar: { band: flat.grammar_band, descriptor_matched: str(flat.grammar_matched), quick_summary: str(flat.grammar_summary), evidence: [
            { feature: "Sentence complexity",  extract: str(flat.grammar_evidence_1), observation: str(flat.grammar_obs_1), band_signal: flat.grammar_signal_1 || "neutral" },
            { feature: "Range of structures",  extract: str(flat.grammar_evidence_2), observation: str(flat.grammar_obs_2), band_signal: flat.grammar_signal_2 || "neutral" },
          ]},
        }
      };
      setFeedback(nested);
      setView("feedback");

      saveSession(supabase, userId, {
        taskType,
        topicLabel: cp.useCustom ? "Custom Prompt" : topic.label,
        prompt: activePrompt,
        response: essay,
        imageBase64: uploadedBase64,
        feedback: nested,
        overallBand: nested.overall_band,
      });
    } catch (err) {
      setFeedback({ error: true, message: err?.message || String(err) });
      setView("write");
    }
    setLoading(false);
  }

  return (
    <div>
      {feedback && !feedback.error && (
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          <Pill active={view === "write"} onClick={() => setView("write")} color={C.accent}>{t.myResponse}</Pill>
          <Pill active={view === "feedback"} onClick={() => setView("feedback")} color={C.purple}>{t.feedbackReport}</Pill>
        </div>
      )}

      {view === "write" && (
        <>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 7 }}>{t.taskType}</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 13, flexWrap: "wrap" }}>
            {["Task 2 Academic", "Task 2 General", "Task 1 Academic", "Task 1 General"].map(tt => (
              <Pill key={tt} active={taskType === tt} onClick={() => handleTaskChange(tt)}>{tt}</Pill>
            ))}
          </div>

          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 7 }}>{t.topic}</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 13, flexWrap: "wrap" }}>
            {WRITING_TOPICS[taskType].map(tt => (
              <Pill key={tt.id} active={topic.id === tt.id} onClick={() => { setTopic(tt); setEssay(""); setFeedback(null); setView("write"); setUploadedBase64(null); }}>{tt.label}</Pill>
            ))}
          </div>

          <CustomPromptToggle
            useCustom={cp.useCustom}
            onToggle={cp.setUseCustom}
            customPrompt={cp.customPrompt}
            onPromptChange={cp.setCustomPrompt}
            customCueCard={cp.customCueCard}
            onCueCardChange={cp.setCustomCueCard}
            showCueCard={false}
            saving={cp.saving}
            onSave={cp.savePrompt}
            taskType={taskKey}
            onBase64Change={setUploadedBase64}
            uploadedBase64={uploadedBase64}
          />

          {!cp.useCustom && <Task1Visual topic={topic} taskType={taskType} onBase64Change={setUploadedBase64} />}

          {!cp.useCustom && (
            <div style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 11, padding: "12px 14px", marginBottom: 12 }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 7 }}>{t.prompt}</div>
              <p style={{ color: C.text, fontSize: 16, lineHeight: 1.75, margin: 0, whiteSpace: "pre-line" }}>{topic.prompt}</p>
            </div>
          )}

          <textarea value={essay} onChange={e => setEssay(e.target.value)}
            placeholder={t.writeResponseHere(taskType)}
            style={{ width: "100%", minHeight: taskType === "Task 2" ? 220 : 160, background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 11, padding: "13px 14px", color: C.text, fontSize: 16, lineHeight: 1.72, fontFamily: "'Inter', sans-serif", resize: "vertical", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
            onFocus={e => e.target.style.borderColor = C.accent}
            onBlur={e => e.target.style.borderColor = C.border}
          />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 9 }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: wordCount >= minWords ? C.green : C.textMuted }}>
              {wordCount} / {minWords} words {wordCount >= minWords ? "✓" : ""}
            </span>
            <button onClick={analyze} disabled={wordCount < 50 || loading} style={{
              background: wordCount >= 50 && !loading ? C.accent : C.border,
              color: wordCount >= 50 && !loading ? "#FFFFFF" : C.textDim,
              border: "none", borderRadius: 10, padding: "10px 20px",
              fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 700,
              cursor: wordCount >= 50 && !loading ? "pointer" : "not-allowed",
            }}>{loading ? t.analysing : t.submitAnalyse}</button>
          </div>

          {loading && (
            <div style={{ textAlign: "center", padding: "28px 0", color: C.textMuted, fontFamily: "'Inter', sans-serif", fontSize: 12 }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>⏳</div>
              {t.extractingLanguage}
            </div>
          )}

          {lastEssay && feedback && !feedback.error && (
            <div style={{ marginTop: 14, background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 11, padding: "12px 14px" }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{t.yourSubmittedResponse}</div>
              <p style={{ color: C.text, fontSize: 16, lineHeight: 1.75, margin: 0, fontFamily: "'Inter', sans-serif", whiteSpace: "pre-line" }}>{lastEssay}</p>
            </div>
          )}

          {feedback?.error && (
            <div style={{ marginTop: 12, padding: 12, background: C.red + "15", border: `1px solid ${C.red}33`, borderRadius: 9, color: C.red, fontFamily: "'Inter', sans-serif", fontSize: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{t.analysisFailed}</div>
              <div style={{ fontSize: 15, opacity: 0.85, wordBreak: "break-all" }}>{feedback.message || t.unknownError}</div>
            </div>
          )}
        </>
      )}

      {view === "feedback" && feedback && !feedback.error && (
        <FeedbackReport
          feedback={feedback}
          criteriaMap={criteriaMap}
          descriptors={WRITING_DESCRIPTORS}
          ringColors={ringColors}
          onExport={() => {
            setExporting(true);
            exportToPDF(feedback, { taskType, topicLabel: topic.label });
            setTimeout(() => setExporting(false), 1500);
          }}
          exporting={exporting}
        />
      )}
    </div>
  );
}

// ─── WAVEFORM ────────────────────────────────────────────────────────────────
function Waveform({ active, color }) {
  const bars = 28;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, height: 48 }}>
      {Array.from({ length: bars }).map((_, i) => (
        <div key={i} style={{
          width: 3, borderRadius: 99,
          background: color,
          opacity: active ? 0.85 : 0.2,
          height: active ? undefined : 6,
          minHeight: 4,
          animation: active ? `wave ${0.8 + (i % 5) * 0.15}s ease-in-out infinite alternate` : "none",
          animationDelay: `${(i * 0.06) % 0.8}s`,
        }} />
      ))}
    </div>
  );
}

// ─── AUDIO PLAYER ────────────────────────────────────────────────────────────
function AudioPlayer({ audioUrl, color }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  function togglePlay() {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px" }}>
      <audio ref={audioRef} src={audioUrl}
        onTimeUpdate={e => setProgress(e.target.currentTime)}
        onLoadedMetadata={e => setDuration(e.target.duration)}
        onEnded={() => { setPlaying(false); setProgress(0); }}
      />
      <button onClick={togglePlay} style={{
        width: 34, height: 34, borderRadius: "50%", border: "none",
        background: color, color: "#FFFFFF", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, flexShrink: 0,
      }}>{playing ? "⏸" : "▶"}</button>

      <div style={{ flex: 1 }}>
        <div style={{ position: "relative", height: 4, background: C.border, borderRadius: 99, cursor: "pointer", marginBottom: 5 }}
          onClick={e => {
            if (!audioRef.current || !duration) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            audioRef.current.currentTime = pct * duration;
          }}>
          <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${duration ? (progress / duration) * 100 : 0}%`, background: color, borderRadius: 99, transition: "width 0.1s linear" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: C.textMuted }}>{fmt(progress)}</span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: C.textMuted }}>{fmt(duration)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── VOICE RECORDER ──────────────────────────────────────────────────────────
function VoiceRecorder({ partColor, onTranscriptReady, userId }) {
  const t = useLang();
  const [recorderState, setRecorderState] = useState("idle");
  const [timer, setTimer] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const timerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioBlobRef = useRef(null);
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  async function transcribeAudio(blob) {
    if (!blob || blob.size < 100) {
      setErrorMsg("Recording is empty — please try again.");
      setRecorderState("error");
      return;
    }
    setRecorderState("transcribing");
    try {
      const ext = blob.type.includes("mp4") ? "m4a"
                : blob.type.includes("ogg") ? "ogg"
                : blob.type.includes("webm") ? "webm"
                : "webm";
      const formData = new FormData();
      formData.append("audio", new File([blob], `recording.${ext}`, { type: blob.type || "audio/webm" }));
      const res = await fetch(`${PROXY}/transcribe`, {
        method: "POST",
        headers: { "x-user-id": userId },
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${res.status}`);
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTranscript(data.transcript || "");
      setRecorderState("review");
    } catch (err) {
      setErrorMsg(err.message || "Transcription failed. Please try again.");
      setRecorderState("error");
    }
  }

  async function startRecording() {
    setErrorMsg("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 }
      });
      chunksRef.current = [];
      let mimeType = "";
      const formats = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
      for (const fmt of formats) {
        if (MediaRecorder.isTypeSupported(fmt)) { mimeType = fmt; break; }
      }
      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const type = mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        audioBlobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
        setRecorderState("recorded");
      };
      mediaRecorder.start(500);
      setTimer(0); setAudioUrl(null); setTranscript("");
      setRecorderState("recording");
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } catch (err) {
      if (err.name === "NotAllowedError") {
        setErrorMsg("Microphone access denied. Please allow microphone access in your browser settings.");
      } else if (err.name === "NotFoundError") {
        setErrorMsg("No microphone found. Please connect a microphone and try again.");
      } else {
        setErrorMsg(err.message || "Could not start recording.");
      }
      setRecorderState("error");
    }
  }

  function stopRecording() {
    clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }

  function reset() {
    clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    audioBlobRef.current = null;
    setRecorderState("idle");
    setTimer(0); setAudioUrl(null); setTranscript(""); setErrorMsg("");
  }

  const isRecording = recorderState === "recording";
  const isRecorded = recorderState === "recorded";
  const isTranscribing = recorderState === "transcribing";
  const isReview = recorderState === "review";
  const isError = recorderState === "error";

  return (
    <div>
      {(recorderState === "idle" || isRecording || isRecorded) && (
        <div style={{ background: C.surfaceAlt, border: `1.5px solid ${isRecording ? partColor + "66" : C.border}`, borderRadius: 14, padding: "20px 16px", marginBottom: 12, transition: "border-color 0.3s" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {isRecording && <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.red, display: "inline-block", animation: "pulse 1s infinite" }} />}
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: isRecording ? C.red : isRecorded ? C.green : C.textDim, textTransform: "uppercase", letterSpacing: 1 }}>
                {isRecording ? t.recording : isRecorded ? t.recordingComplete : t.readyToRecord}
              </span>
            </div>
            {isRecording && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 700, color: C.red }}>{fmt(timer)}</span>}
            {isRecorded && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: C.textMuted }}>{fmt(timer)} recorded</span>}
          </div>

          <div style={{ marginBottom: 18 }}>
            <Waveform active={isRecording} color={isRecording ? C.red : isRecorded ? C.green : C.textDim} />
          </div>

          {isRecorded && audioUrl && (
            <div style={{ marginBottom: 14 }}>
              <AudioPlayer audioUrl={audioUrl} color={partColor} />
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            {!isRecorded && (
              <button onClick={isRecording ? stopRecording : startRecording} style={{
                flex: 1, padding: "12px 0", border: "none", borderRadius: 10, cursor: "pointer",
                background: isRecording ? C.red : partColor,
                color: "#FFFFFF", fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                {isRecording
                  ? <><span style={{ width: 10, height: 10, borderRadius: 2, background: "#FFFFFF", display: "inline-block" }} /> {t.stopRecording}</>
                  : <><span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FFFFFF", display: "inline-block" }} /> {t.startRecording}</>
                }
              </button>
            )}

            {isRecorded && (
              <>
                <button onClick={reset} style={{
                  padding: "11px 16px", border: `1.5px solid ${C.border}`, borderRadius: 10,
                  background: "transparent", color: C.textMuted, fontFamily: "'Inter', sans-serif",
                  fontSize: 16, cursor: "pointer",
                }}>{t.reRecord}</button>
                <button onClick={() => transcribeAudio(audioBlobRef.current)} style={{
                  flex: 1, padding: "11px 0", border: "none", borderRadius: 10, cursor: "pointer",
                  background: partColor, color: "#FFFFFF", fontFamily: "'Inter', sans-serif",
                  fontSize: 15, fontWeight: 700,
                }}>{t.transcribe}</button>
              </>
            )}
          </div>
        </div>
      )}

      {isTranscribing && (
        <div style={{ background: C.surfaceAlt, border: `1.5px solid ${partColor}44`, borderRadius: 14, padding: "32px 16px", marginBottom: 12, textAlign: "center" }}>
          <div style={{ marginBottom: 16 }}><Waveform active={true} color={partColor} /></div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: partColor, marginBottom: 6 }}>{t.transcribing}</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: C.textDim }}>{t.whisperProcessing}</div>
        </div>
      )}

      {isError && (
        <div style={{ background: C.red + "0e", border: `1px solid ${C.red}33`, borderRadius: 12, padding: "16px", marginBottom: 12 }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: C.red, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{t.recordingError}</div>
          <p style={{ color: C.text, fontSize: 15, lineHeight: 1.6, margin: "0 0 12px" }}>{errorMsg}</p>
          <button onClick={reset} style={{
            background: "transparent", border: `1.5px solid ${C.border}`, borderRadius: 8,
            padding: "8px 16px", color: C.textMuted, fontFamily: "'Inter', sans-serif", fontSize: 15, cursor: "pointer",
          }}>{t.tryAgain}</button>
        </div>
      )}

      {isReview && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ background: C.green + "0e", border: `1px solid ${C.green}33`, borderRadius: 10, padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14 }}>✅</span>
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: C.green, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>{t.transcriptionComplete}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: C.textMuted }}>{t.reviewTranscript}</div>
            </div>
          </div>

          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 7 }}>{t.yourTranscript}</div>
          <textarea value={transcript} onChange={e => setTranscript(e.target.value)}
            style={{ width: "100%", minHeight: 150, background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 11, padding: "13px 14px", color: C.text, fontSize: 16, lineHeight: 1.72, fontFamily: "'Inter', sans-serif", resize: "vertical", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
            onFocus={e => e.target.style.borderColor = partColor}
            onBlur={e => e.target.style.borderColor = C.border}
          />
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: transcript.trim().split(/\s+/).filter(Boolean).length >= 20 ? C.green : C.textMuted, marginTop: 6 }}>
            {transcript.trim() ? transcript.trim().split(/\s+/).filter(Boolean).length : 0} words — minimum 20 to save {transcript.trim().split(/\s+/).filter(Boolean).length >= 20 ? "✓" : ""}
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 9 }}>
            <button onClick={reset} style={{
              padding: "10px 14px", border: `1.5px solid ${C.border}`, borderRadius: 10,
              background: "transparent", color: C.textMuted, fontFamily: "'Inter', sans-serif", fontSize: 16, cursor: "pointer",
            }}>{t.reRecord}</button>
            <button
              onClick={() => onTranscriptReady(transcript)}
              disabled={!transcript.trim() || transcript.trim().split(/\s+/).length < 20}
              style={{
                flex: 1, padding: "10px 0", border: "none", borderRadius: 10,
                background: transcript.trim() && transcript.trim().split(/\s+/).length >= 20 ? partColor : C.border,
                color: transcript.trim() && transcript.trim().split(/\s+/).length >= 20 ? "#FFFFFF" : C.textDim,
                fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 700,
                cursor: transcript.trim() ? "pointer" : "not-allowed",
              }}>Save Part →</button>
          </div>
        </div>
      )}

      {recorderState === "idle" && (
        <div style={{ marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ flex: 1, height: 1, background: C.border }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.textDim, textTransform: "uppercase", letterSpacing: 1 }}>{t.orTypePaste}</span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>
          <textarea value={transcript} onChange={e => setTranscript(e.target.value)}
            placeholder={t.pasteSpokenResponse}
            style={{ width: "100%", minHeight: 120, background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 11, padding: "12px 14px", color: C.text, fontSize: 16, lineHeight: 1.72, fontFamily: "'Inter', sans-serif", resize: "vertical", outline: "none", boxSizing: "border-box" }}
            onFocus={e => e.target.style.borderColor = partColor}
            onBlur={e => e.target.style.borderColor = C.border}
          />
          {transcript.trim() && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: transcript.trim().split(/\s+/).filter(Boolean).length >= 20 ? C.green : C.textMuted }}>
                {transcript.trim().split(/\s+/).filter(Boolean).length} words — min 20 {transcript.trim().split(/\s+/).filter(Boolean).length >= 20 ? "✓" : ""}
              </span>
              <button onClick={() => onTranscriptReady(transcript)}
                disabled={transcript.trim().split(/\s+/).filter(Boolean).length < 20}
                style={{
                  padding: "10px 20px", border: "none", borderRadius: 10,
                  background: transcript.trim().split(/\s+/).filter(Boolean).length >= 20 ? partColor : C.border,
                  color: transcript.trim().split(/\s+/).filter(Boolean).length >= 20 ? "#FFFFFF" : C.textDim,
                  fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 700,
                  cursor: transcript.trim().split(/\s+/).filter(Boolean).length >= 20 ? "pointer" : "not-allowed",
                }}>Save Part →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── PORTFOLIO / MY HISTORY ──────────────────────────────────────────────────
function Portfolio({ supabase, userId }) {
  const t = useLang();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    setLoading(true);
    loadSessions(supabase, userId).then(setSessions).finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "48px 20px", color: C.textMuted }}>
        <div style={{ fontSize: 20, marginBottom: 12 }}>⏳</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15 }}>{t.loadingHistory}</div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "48px 20px" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.text, marginBottom: 6 }}>{t.noSessionsYetTitle}</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.textMuted, marginBottom: 16 }}>{t.noSessionsYetSub}</div>
      </div>
    );
  }

  if (selectedSession && selectedSession.feedback) {
    const isWriting = !!selectedSession.feedback.criteria?.task;
    const descriptors = isWriting ? WRITING_DESCRIPTORS : SPEAKING_DESCRIPTORS;
    const criteriaMap = isWriting
      ? [{ key: "task" }, { key: "coherence" }, { key: "lexis" }, { key: "grammar" }]
      : [{ key: "fluency" }, { key: "lexis" }, { key: "grammar" }, { key: "pronunciation" }];
    const ringColors = isWriting ? [C.blue, C.teal, C.green, C.accent] : [C.blue, C.green, C.accent, C.purple];

    return (
      <div>
        <button onClick={() => setSelectedSession(null)} style={{
          padding: "8px 14px", background: "transparent", border: `1px solid ${C.border}`,
          borderRadius: 8, color: C.textMuted, fontFamily: "'Inter', sans-serif",
          fontSize: 13, cursor: "pointer", marginBottom: 14,
        }}>{t.backToHistory}</button>
        <FeedbackReport
          feedback={selectedSession.feedback}
          criteriaMap={criteriaMap}
          descriptors={descriptors}
          ringColors={ringColors}
          onExport={() => {
            exportToPDF(selectedSession.feedback, {
              taskType: selectedSession.task_type,
              topicLabel: selectedSession.topic_label,
            });
          }}
          exporting={false}
        />
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
        {t.sessionCount(sessions.length)}
      </div>
      {sessions.map(s => (
        <HistoryCard key={s.id} session={s} onViewReport={setSelectedSession} />
      ))}
    </div>
  );
}

// ─── SPEAKING PRACTICE (NEW HOLISTIC 3-PART FLOW) ────────────────────────────
function SpeakingPractice({ supabase, userId }) {
  const t = useLang();

  // Topics per part
  const [topics, setTopics] = useState({
    1: SPEAKING_TOPICS[1][0],
    2: SPEAKING_TOPICS[2][0],
    3: SPEAKING_TOPICS[3][0],
  });

  // Saved transcripts per part
  const [partTranscripts, setPartTranscripts] = useState({ 1: null, 2: null, 3: null });
  const [partQuestions, setPartQuestions] = useState({ 1: null, 2: null, 3: null });

  // Which part the student is currently on
  const [currentPart, setCurrentPart] = useState(1);

  // Supabase session row id
  const [sessionRowId, setSessionRowId] = useState(null);

  // Confirmation flash
  const [justSaved, setJustSaved] = useState(false);

  // Final scoring state
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [view, setView] = useState("speak");
  const [exporting, setExporting] = useState(false);

  const partColors = { 1: C.blue, 2: C.green, 3: C.purple };
  const partLabels = { 1: t.partIntro, 2: t.partLongTurn, 3: t.partDiscussion };
  const partHints = { 1: t.partHint1, 2: t.partHint2, 3: t.partHint3 };
  const criteriaMap = [{ key: "fluency" }, { key: "lexis" }, { key: "grammar" }, { key: "pronunciation" }];
  const ringColors = [C.blue, C.green, C.accent, C.purple];

  const allPartsSaved = partTranscripts[1] && partTranscripts[2] && partTranscripts[3];
  const activeTopic = topics[currentPart];
  const activePrompt = activeTopic.prompt;

  // Save transcript for current part to Supabase
  async function savePartTranscript(transcript) {
    const updatedTranscripts = { ...partTranscripts, [currentPart]: transcript };
    const updatedQuestions = { ...partQuestions, [currentPart]: activePrompt };
    setPartTranscripts(updatedTranscripts);
    setPartQuestions(updatedQuestions);

    if (supabase && userId) {
      try {
        if (!sessionRowId) {
          const insertData = {
            user_id: userId,
            status: "in_progress",
            [`part${currentPart}_question`]: activePrompt,
            [`part${currentPart}_transcript`]: transcript,
          };
          const { data, error } = await supabase
            .from("speaking_sessions")
            .insert(insertData)
            .select()
            .single();
          if (!error && data) setSessionRowId(data.id);
        } else {
          await supabase
            .from("speaking_sessions")
            .update({
              [`part${currentPart}_question`]: activePrompt,
              [`part${currentPart}_transcript`]: transcript,
            })
            .eq("id", sessionRowId);
        }
      } catch (err) {
        console.error("Failed to save part transcript:", err);
      }
    }

    // Show confirmation
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);

    // Auto-advance to next part if not yet at part 3
    if (currentPart < 3) {
      setTimeout(() => setCurrentPart(currentPart + 1), 1200);
    }
  }

  // Submit all 3 parts to holistic backend endpoint
  async function getHolisticResults() {
    if (!allPartsSaved) {
      alert(t.completeAllParts);
      return;
    }
    setLoading(true);
    setFeedback(null);
    setView("loading");

    try {
      const combinedPrompt = buildHolisticSpeakingPrompt(
        partQuestions[1], partTranscripts[1],
        partQuestions[2], partTranscripts[2],
        partQuestions[3], partTranscripts[3]
      );

      const res = await fetch(`${PROXY}/analyse-speaking-holistic`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": userId },
        body: JSON.stringify({
          ieltsMessages: [{ role: "user", content: combinedPrompt }],
        }),
      });
      const data = await res.json();
      const ieltsRaw = data.ielts?.content?.find(b => b.type === "text")?.text || "{}";
      const flat = safeParseJSON(ieltsRaw);
      const str = (v) => (v == null ? "—" : typeof v === "object" ? JSON.stringify(v) : String(v));
      const nested = {
        overall_band: flat.overall_band,
        cefr: flat.cefr,
        examiner_comment: str(flat.examiner_comment),
        next_band_targets: str(flat.next_band_targets),
        model_rewrite: str(flat.model_rewrite),
        criteria: {
          fluency: { band: flat.fluency_band, descriptor_matched: str(flat.fluency_matched), quick_summary: str(flat.fluency_summary), evidence: [
            { feature: "Speaking pace & flow", extract: str(flat.fluency_evidence_1), observation: str(flat.fluency_obs_1), band_signal: flat.fluency_signal_1 || "neutral" },
            { feature: "Discourse markers",    extract: str(flat.fluency_evidence_2), observation: str(flat.fluency_obs_2), band_signal: flat.fluency_signal_2 || "neutral" },
          ]},
          lexis: { band: flat.lexis_band, descriptor_matched: str(flat.lexis_matched), quick_summary: str(flat.lexis_summary), evidence: [
            { feature: "Vocabulary range",        extract: str(flat.lexis_evidence_1), observation: str(flat.lexis_obs_1), band_signal: flat.lexis_signal_1 || "neutral" },
            { feature: "Topic-specific language", extract: str(flat.lexis_evidence_2), observation: str(flat.lexis_obs_2), band_signal: flat.lexis_signal_2 || "neutral" },
          ]},
          grammar: { band: flat.grammar_band, descriptor_matched: str(flat.grammar_matched), quick_summary: str(flat.grammar_summary), evidence: [
            { feature: "Structure variety",    extract: str(flat.grammar_evidence_1), observation: str(flat.grammar_obs_1), band_signal: flat.grammar_signal_1 || "neutral" },
            { feature: "Complex sentence use", extract: str(flat.grammar_evidence_2), observation: str(flat.grammar_obs_2), band_signal: flat.grammar_signal_2 || "neutral" },
          ]},
          pronunciation: { band: flat.pronunciation_band, descriptor_matched: str(flat.pronunciation_matched), quick_summary: str(flat.pronunciation_summary), evidence: [
            { feature: "Intelligibility", extract: str(flat.pronunciation_evidence_1), observation: str(flat.pronunciation_obs_1), band_signal: flat.pronunciation_signal_1 || "neutral" },
            { feature: "Stress & rhythm",  extract: str(flat.pronunciation_evidence_2), observation: str(flat.pronunciation_obs_2), band_signal: flat.pronunciation_signal_2 || "neutral" },
          ]},
        }
      };
      setFeedback(nested);
      setView("feedback");

      // Mark session complete in Supabase
      if (supabase && userId && sessionRowId) {
        await supabase.from("speaking_sessions")
          .update({ status: "complete", feedback: nested })
          .eq("id", sessionRowId);
      }

      // Save to general sessions table for history
      const combinedResponse = `PART 1: ${partTranscripts[1]}\n\nPART 2: ${partTranscripts[2]}\n\nPART 3: ${partTranscripts[3]}`;
      const combinedPromptDisplay = `PART 1: ${partQuestions[1]}\n\nPART 2: ${partQuestions[2]}\n\nPART 3: ${partQuestions[3]}`;
      saveSession(supabase, userId, {
        taskType: "Speaking (Holistic)",
        topicLabel: `${topics[1].label} · ${topics[2].label} · ${topics[3].label}`,
        prompt: combinedPromptDisplay,
        response: combinedResponse,
        imageBase64: null,
        feedback: nested,
        overallBand: nested.overall_band,
      });
    } catch (err) {
      setFeedback({ error: true, message: err?.message || String(err) });
      setView("speak");
    }
    setLoading(false);
  }

  function startNewSession() {
    setPartTranscripts({ 1: null, 2: null, 3: null });
    setPartQuestions({ 1: null, 2: null, 3: null });
    setSessionRowId(null);
    setCurrentPart(1);
    setFeedback(null);
    setView("speak");
  }

  return (
    <div>
      {feedback && !feedback.error && (
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          <Pill active={view === "feedback"} onClick={() => setView("feedback")} color={C.purple}>{t.ieltsFeedback}</Pill>
          <button onClick={startNewSession} style={{
            padding: "6px 13px", borderRadius: 999, border: `1.5px solid ${C.border}`,
            background: "transparent", color: C.textMuted,
            fontFamily: "'Inter', sans-serif", fontSize: 14, cursor: "pointer",
          }}>Start New Session</button>
        </div>
      )}

      {view === "speak" && (
        <>
          {/* Progress indicator */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {[1, 2, 3].map(p => (
              <div key={p} style={{
                flex: 1,
                padding: "10px 8px",
                borderRadius: 10,
                border: `2px solid ${partTranscripts[p] ? C.green : currentPart === p ? partColors[p] : C.border}`,
                background: partTranscripts[p] ? C.green + "0e" : currentPart === p ? partColors[p] + "0e" : "transparent",
                textAlign: "center",
                cursor: partTranscripts[p] || currentPart === p ? "pointer" : "default",
                transition: "all 0.2s",
              }}
                onClick={() => { if (partTranscripts[p]) setCurrentPart(p); }}
              >
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700, color: partTranscripts[p] ? C.green : currentPart === p ? partColors[p] : C.textDim, marginBottom: 2 }}>
                  Part {p} {partTranscripts[p] && "✓"}
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.textMuted }}>
                  {partTranscripts[p] ? "Saved" : currentPart === p ? "Current" : "Pending"}
                </div>
              </div>
            ))}
          </div>

          {/* Just-saved confirmation */}
          {justSaved && (
            <div style={{ background: C.green + "15", border: `1px solid ${C.green}`, borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>✅</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: C.green, fontWeight: 600 }}>
                Part {currentPart < 3 ? currentPart : 3} {t.partSaved}
                {currentPart < 3 && ` — moving to Part ${currentPart + 1}`}
              </span>
            </div>
          )}

          {/* Get Results button — appears only when all parts saved */}
          {allPartsSaved && (
            <button onClick={getHolisticResults} style={{
              width: "100%", padding: "14px 0",
              background: C.accent, color: "#FFFFFF",
              border: "none", borderRadius: 11,
              fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 700,
              cursor: "pointer", marginBottom: 16,
              boxShadow: `0 4px 14px ${C.accent}44`,
            }}>{t.getMyResults}</button>
          )}

          {/* Current part section */}
          {!allPartsSaved && (
            <>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 7 }}>{t.topic}</div>
              <div style={{ display: "flex", gap: 6, marginBottom: 13, flexWrap: "wrap" }}>
                {SPEAKING_TOPICS[currentPart].map(tp => (
                  <Pill key={tp.id} active={activeTopic.id === tp.id}
                    onClick={() => setTopics({ ...topics, [currentPart]: tp })}
                    color={partColors[currentPart]}>{tp.label}</Pill>
                ))}
              </div>

              <div style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 11, padding: "12px 14px", marginBottom: 6 }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: partColors[currentPart], textTransform: "uppercase", letterSpacing: 1, marginBottom: 7 }}>
                  Part {currentPart} — {partLabels[currentPart]}
                </div>
                <p style={{ color: C.text, fontSize: 16, lineHeight: 1.75, margin: 0, whiteSpace: "pre-line" }}>{activeTopic.prompt}</p>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", marginBottom: 14 }}>
                <span style={{ fontSize: 16, marginTop: 1 }}>💡</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: C.textMuted, lineHeight: 1.6 }}>{partHints[currentPart]}</span>
              </div>

              <VoiceRecorder
                key={`recorder-${currentPart}`}
                partColor={partColors[currentPart]}
                onTranscriptReady={savePartTranscript}
                userId={userId}
              />
            </>
          )}

          {/* When all parts saved, show summary of what's stored */}
          {allPartsSaved && (
            <div style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 11, padding: "14px 16px" }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 10 }}>
                All three parts saved. Press the button above to get your holistic IELTS feedback.
              </div>
              {[1, 2, 3].map(p => (
                <div key={p} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: p < 3 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: partColors[p], textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                    Part {p} — {topics[p].label}
                  </div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.textMuted, lineHeight: 1.5 }}>
                    {(partTranscripts[p] || "").slice(0, 140)}{(partTranscripts[p] || "").length > 140 ? "…" : ""}
                  </div>
                </div>
              ))}
            </div>
          )}

          {feedback?.error && (
            <div style={{ marginTop: 12, padding: 12, background: C.red + "15", border: `1px solid ${C.red}33`, borderRadius: 9, color: C.red, fontFamily: "'Inter', sans-serif", fontSize: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{t.analysisFailed}</div>
              <div style={{ fontSize: 15, opacity: 0.85, wordBreak: "break-all" }}>{feedback.message || t.unknownError}</div>
            </div>
          )}
        </>
      )}

      {view === "loading" && (
        <div style={{ textAlign: "center", padding: "48px 20px" }}>
          <div style={{ marginBottom: 20 }}>
            <Waveform active={true} color={C.accent} />
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 600, color: C.accent, marginBottom: 6 }}>{t.submittingAll}</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.textMuted }}>{t.runningAssessment}</div>
        </div>
      )}

      {view === "feedback" && feedback && !feedback.error && (
        <FeedbackReport
          feedback={feedback}
          criteriaMap={criteriaMap}
          descriptors={SPEAKING_DESCRIPTORS}
          ringColors={ringColors}
          onExport={() => {
            setExporting(true);
            exportToPDF(feedback, { taskType: "Speaking (Holistic)", topicLabel: `${topics[1].label} · ${topics[2].label} · ${topics[3].label}` });
            setTimeout(() => setExporting(false), 1500);
          }}
          exporting={exporting}
        />
      )}
    </div>
  );
}

// ─── BAND PROGRESS CHART ─────────────────────────────────────────────────────
const SAMPLE_DATA = [
  { date: "Jan 1",  band: 5.0, type: "Writing" },
  { date: "Jan 8",  band: 5.5, type: "Speaking" },
  { date: "Jan 15", band: 5.5, type: "Writing" },
  { date: "Jan 22", band: 6.0, type: "Speaking" },
  { date: "Jan 29", band: 6.5, type: "Writing" },
  { date: "Feb 5",  band: 6.5, type: "Speaking" },
  { date: "Feb 12", band: 7.0, type: "Writing" },
];

function BandProgressChart({ supabase, userId }) {
  const t = useLang();
  const [allSessions, setAllSessions] = useState([]);
  const [filter, setFilter] = useState("Both");
  const [range, setRange] = useState("30");
  const [loading, setLoading] = useState(true);
  const isEmpty = allSessions.length === 0;

  useEffect(() => {
    if (!supabase || !userId) { setLoading(false); return; }
    supabase
      .from("sessions")
      .select("created_at, overall_band, task_type")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setAllSessions(data || []);
        setLoading(false);
      });
  }, [userId]);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - parseInt(range));

  const chartData = (isEmpty ? SAMPLE_DATA : allSessions
    .filter(s => new Date(s.created_at) >= cutoff)
    .map(s => ({
      date: new Date(s.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      band: s.overall_band,
      type: s.task_type?.includes("Task") ? "Writing" : "Speaking",
    }))
  ).filter(s => filter === "Both" || s.type === filter);

  const lineColor = filter === "Writing" ? C.blue : filter === "Speaking" ? C.purple : C.accent;

  if (loading) return null;

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 15px", marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: C.textDim, textTransform: "uppercase", letterSpacing: 1 }}>{t.bandProgress}</div>
          {isEmpty && (
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.accent, marginTop: 2 }}>{t.sampleData}</div>
          )}
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {[[t.both, "Both"], [t.writing_label, "Writing"], [t.speaking_label, "Speaking"]].map(([label, f]) => {
            const col = f === "Writing" ? C.blue : f === "Speaking" ? C.purple : C.accent;
            return (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "4px 11px", borderRadius: 999, border: `1.5px solid ${filter === f ? col : C.border}`,
                background: filter === f ? col + "18" : "transparent",
                color: filter === f ? col : C.textMuted,
                fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: filter === f ? 700 : 400,
                cursor: "pointer",
              }}>{label}</button>
            );
          })}
          <div style={{ width: 1, background: C.border, margin: "0 3px" }} />
          {[["7", "7d"], ["30", "30d"]].map(([val, label]) => (
            <button key={val} onClick={() => setRange(val)} style={{
              padding: "4px 11px", borderRadius: 999, border: `1.5px solid ${range === val ? C.teal : C.border}`,
              background: range === val ? C.teal + "18" : "transparent",
              color: range === val ? C.teal : C.textMuted,
              fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: range === val ? 700 : 400,
              cursor: "pointer",
            }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ opacity: isEmpty ? 0.45 : 1, filter: isEmpty ? "grayscale(30%)" : "none" }}>
        {chartData.length === 0 ? (
          <div style={{ textAlign: "center", padding: "28px 0", color: C.textDim, fontFamily: "'Inter', sans-serif", fontSize: 13 }}>{t.noSessionsRange}</div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: -28, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="date" tick={{ fill: C.textDim, fontSize: 10, fontFamily: "'Inter', sans-serif" }} tickLine={false} axisLine={false} />
              <YAxis domain={[3, 9]} ticks={[4, 5, 5.5, 6, 6.5, 7, 7.5, 8, 9]} tick={{ fill: C.textDim, fontSize: 10, fontFamily: "'Inter', sans-serif" }} tickLine={false} axisLine={false} width={40} />
              <Tooltip
                contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: "'Inter', sans-serif", fontSize: 11 }}
                formatter={(v, _, props) => [`Band ${v} · ${props.payload.type}`, ""]}
                labelFormatter={l => l}
              />
              <Line
                type="monotone"
                dataKey="band"
                stroke={lineColor}
                strokeWidth={2.5}
                dot={({ cx, cy, payload }) => (
                  <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={4}
                    fill={payload.type === "Writing" ? C.blue : C.purple}
                    stroke={C.surface} strokeWidth={2} />
                )}
                activeDot={{ r: 6, stroke: lineColor, strokeWidth: 2, fill: C.surface }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div style={{ display: "flex", gap: 14, marginTop: 10, justifyContent: "flex-end" }}>
        {[["Writing", C.blue], ["Speaking", C.purple]].map(([label, col]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: col, display: "inline-block" }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: C.textDim }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function Dashboard({ supabase, userId }) {
  const t = useLang();
  const [stats, setStats] = useState([]);
  const [history, setHistory] = useState([]);
  const [streak, setStreak] = useState(0);
  const [bestSession, setBestSession] = useState(null);
  const [currentAvg, setCurrentAvg] = useState(null);
  const [nextTarget, setNextTarget] = useState(null);
  const [targetProgress, setTargetProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    loadDashboardStats(supabase, userId).then(({ stats: s, recentSessions: h, streak: st, bestSession: bs, currentAvg: ca, nextTarget: nt, targetProgress: tp }) => {
      setStats(s);
      setHistory(h);
      setStreak(st);
      setBestSession(bs);
      setCurrentAvg(ca);
      setNextTarget(nt);
      setTargetProgress(tp);
    }).finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "48px 20px", color: C.textMuted }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15 }}>{t.loadingDashboard}</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 15px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 4 }}>🔥</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 34, fontWeight: 800, color: streak > 0 ? C.accent : C.textDim, lineHeight: 1 }}>{streak}</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>{t.dayStreak}</div>
          {streak === 0 && (
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.textDim, marginTop: 5, lineHeight: 1.4 }}>{t.startStreakToday}</div>
          )}
        </div>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 15px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 4 }}>🏆</div>
          {bestSession ? (
            <>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 34, fontWeight: 800, color: BAND_COLOR(bestSession.overall_band), lineHeight: 1 }}>{bestSession.overall_band}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>{t.personalBest}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.textDim, marginTop: 4, lineHeight: 1.4 }}>
                {bestSession.task_type?.includes("Task") ? t.writing_label : t.speaking_label} · {new Date(bestSession.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </div>
            </>
          ) : (
            <>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 34, fontWeight: 800, color: C.textDim, lineHeight: 1 }}>—</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>{t.personalBest}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.textDim, marginTop: 5, lineHeight: 1.4 }}>{t.noSessionsYet}</div>
            </>
          )}
        </div>
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 15px", marginBottom: 10 }}>
        {currentAvg !== null ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: C.textDim, textTransform: "uppercase", letterSpacing: 1 }}>{t.nextTarget}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: C.textMuted }}>
                <span style={{ fontWeight: 700, color: BAND_COLOR(currentAvg), fontSize: 14 }}>Band {parseFloat(currentAvg).toFixed(1)}</span>
                <span style={{ color: C.textDim }}> → </span>
                <span style={{ fontWeight: 700, color: BAND_COLOR(nextTarget), fontSize: 14 }}>Band {nextTarget}</span>
              </div>
            </div>
            <div style={{ height: 8, background: C.surfaceAlt, borderRadius: 99, overflow: "hidden", marginBottom: 6 }}>
              <div style={{
                height: "100%",
                width: `${targetProgress}%`,
                background: `linear-gradient(90deg, ${BAND_COLOR(currentAvg)}, ${BAND_COLOR(nextTarget)})`,
                borderRadius: 99,
                transition: "width 1.2s ease",
              }} />
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.textDim }}>
              {targetProgress >= 80 ? t.almostThere : targetProgress >= 40 ? t.goodMomentum : t.keepGoing}
            </div>
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{t.nextTargetBand}</div>
              <div style={{ height: 8, background: C.surfaceAlt, borderRadius: 99 }} />
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.textDim }}>{t.completeToUnlock}</div>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 10 }}>
        {stats.length > 0 ? stats.map(s => (
          <div key={s.label} style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 15px" }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 30, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
          </div>
        )) : (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "24px 0", color: C.textMuted }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, marginBottom: 8 }}>{t.noSessionsYet}</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: C.textDim }}>{t.noSessionsFirst}</div>
          </div>
        )}
      </div>

      <BandProgressChart supabase={supabase} userId={userId} />

      {history.length > 0 && (
        <>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>{t.recentSessions}</div>
          {history.map((h, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
              <div>
                <div style={{ color: C.text, fontSize: 14, marginBottom: 2 }}>{h.task}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: C.textMuted }}>{h.date} · {h.type}</div>
              </div>
              <span style={{ background: BAND_COLOR(h.band) + "22", color: BAND_COLOR(h.band), border: `1px solid ${BAND_COLOR(h.band)}44`, borderRadius: 6, padding: "2px 9px", fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700 }}>Band {h.band}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ─── LEGAL CONTENT ───────────────────────────────────────────────────────────
const LEGAL = {
  privacy: {
    title: "Privacy Policy",
    content: `Last updated: May 2026

SoundReady English operates SoundReady Ascend ("the App"), an AI-powered IELTS preparation platform. This Privacy Policy explains how we collect, use, and protect your information.

INFORMATION WE COLLECT
• Account information: your email address and password when you register
• Voice recordings: audio recorded during Speaking practice sessions, processed solely for transcription and analysis
• Written responses: essays and written answers submitted for assessment
• Usage data: session history and performance scores

HOW WE USE YOUR INFORMATION
• To provide AI-powered IELTS feedback and pronunciation assessment
• To track your progress and display your session history
• To communicate important updates about the App
• We do not sell your personal data to third parties

THIRD-PARTY SERVICES
• Supabase — secure user authentication and data storage
• OpenAI Whisper — voice transcription
• Anthropic Claude — AI feedback generation
• Netlify — frontend hosting

DATA RETENTION
Voice recordings are processed in real time and are not permanently stored. Written responses and scores are retained to provide your session history.

YOUR RIGHTS
Contact us at support@sound-ready.com to access, correct, or delete your personal data.

CONTACT
SoundReady English | support@sound-ready.com`
  },
  terms: {
    title: "Terms of Service",
    content: `Last updated: May 2026

By using SoundReady Ascend, you agree to these Terms of Service.

ELIGIBILITY
You must be at least 13 years old to use this App.

ACCEPTABLE USE
You agree to use SoundReady Ascend only for lawful purposes.

AI-GENERATED CONTENT
AI feedback is for educational purposes only and does not constitute a guarantee of exam performance.

INTELLECTUAL PROPERTY
All content within SoundReady Ascend is the property of SoundReady English.

CONTACT
SoundReady English | support@sound-ready.com`
  },
  disclaimer: {
    title: "Disclaimer",
    content: `Last updated: May 2026

EDUCATIONAL PURPOSE ONLY
SoundReady Ascend is an AI-powered educational tool designed to help students prepare for the IELTS examination.

NO GUARANTEE OF EXAM RESULTS
Band scores provided within the App are approximations and are not official IELTS scores.

IELTS TRADEMARK
IELTS is a registered trademark of the British Council, IDP: IELTS Australia, and Cambridge Assessment English. SoundReady Ascend is an independent preparation tool.

CONTACT
SoundReady English | support@sound-ready.com`
  }
};

function LegalModal({ type, onClose }) {
  const content = LEGAL[type];
  if (!content) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.surface, borderRadius: 16, width: "100%", maxWidth: 640, maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, color: C.text }}>{content.title}</h2>
          <button onClick={onClose} style={{ background: "transparent", border: "none", fontSize: 20, color: C.textMuted, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          <pre style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.text, lineHeight: 1.8, whiteSpace: "pre-wrap", margin: 0 }}>{content.content}</pre>
        </div>
      </div>
    </div>
  );
}

function Footer({ onLegal }) {
  const t = useLang();
  return (
    <div style={{ borderTop: `1px solid ${C.border}`, padding: "16px 24px", background: C.surface }}>
      <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
        {[["privacy", t.privacyPolicy], ["terms", t.termsOfService], ["disclaimer", t.disclaimer]].map(([type, label]) => (
          <button key={type} onClick={() => onLegal(type)} style={{ background: "transparent", border: "none", fontFamily: "'Inter', sans-serif", fontSize: 12, color: C.textMuted, cursor: "pointer", textDecoration: "underline", padding: 0 }}>{label}</button>
        ))}
        <a href="mailto:support@sound-ready.com" style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: C.textMuted, textDecoration: "underline" }}>{t.contact}</a>
      </div>
      <p style={{ textAlign: "center", fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.textDim, margin: 0 }}>
        {t.copyright}
      </p>
    </div>
  );
}

function AvatarMenu({ email, onLogout, onAdmin, onProfile }) {
  const t = useLang();
  const [open, setOpen] = useState(false);
  const initial = email ? email[0].toUpperCase() : "?";

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={{
        width: 36, height: 36, borderRadius: "50%",
        background: C.accent, border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "#FFFFFF",
        boxShadow: open ? `0 0 0 3px ${C.accent}33` : "none",
      }}>{initial}</button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />
          <div style={{
            position: "absolute", right: 0, top: 44, zIndex: 100,
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 12, padding: "6px 0", minWidth: 220,
            boxShadow: "0 8px 32px rgba(27,42,58,0.12)",
          }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 3 }}>{email}</div>
              <div style={{ display: "inline-block", background: C.green + "22", border: `1px solid ${C.green}44`, borderRadius: 999, padding: "2px 8px", fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.green }}>{t.freePlan}</div>
            </div>
            <div style={{ padding: "6px 0" }}>
              <button onClick={() => { setOpen(false); onProfile && onProfile(); }} style={{
                width: "100%", padding: "9px 16px", background: "transparent",
                border: "none", textAlign: "left", cursor: "pointer",
                fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.textMuted,
              }}>My Profile</button>
              {onAdmin && (
                <button onClick={() => { setOpen(false); onAdmin(); }} style={{
                  width: "100%", padding: "9px 16px", background: "transparent",
                  border: "none", textAlign: "left", cursor: "pointer",
                  fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.blue, fontWeight: 600,
                }}>{t.adminPanel}</button>
              )}
              <button onClick={() => setOpen(false)} style={{
                width: "100%", padding: "9px 16px", background: "transparent",
                border: "none", textAlign: "left", cursor: "pointer",
                fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.accent, fontWeight: 700,
              }}>{t.upgradePremium}</button>
              <div style={{ height: 1, background: C.border, margin: "6px 0" }} />
              <button onClick={() => { setOpen(false); onLogout(); }} style={{
                width: "100%", padding: "9px 16px", background: "transparent",
                border: "none", textAlign: "left", cursor: "pointer",
                fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.red,
              }}>{t.logOut}</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function NavTabs({ tab, setTab }) {
  const t = useLang();
  const tabs = [
    { id: "dashboard", label: t.tabDashboard },
    { id: "writing",   label: t.tabWriting   },
    { id: "speaking",  label: t.tabSpeaking  },
    { id: "history",   label: t.tabHistory   },
    { id: "lessons",   label: "Lessons" },
    { id: "resources", label: "Resources" },
  ];
  return (
    <div style={{ display: "flex" }}>
      {tabs.map(tb => (
        <button key={tb.id} onClick={() => setTab(tb.id)} style={{
          flex: 1, padding: "11px 0", background: "transparent", border: "none",
          borderBottom: `2px solid ${tab === tb.id ? C.accent : "transparent"}`,
          color: tab === tb.id ? C.accent : C.textMuted,
          fontFamily: "'Inter', sans-serif", fontSize: "clamp(11px, 2.8vw, 15px)",
          fontWeight: tab === tb.id ? 600 : 400, cursor: "pointer",
        }}>{tb.label}</button>
      ))}
    </div>
  );
}

function LangSwitcher() {
  const { lang, switchLang } = useContext(LangContext);
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {["en", "es", "zh"].map(l => (
        <button key={l} onClick={() => switchLang(l)} style={{
          padding: "2px 7px", borderRadius: 6,
          border: `1px solid ${lang === l ? C.accent : C.border}`,
          background: lang === l ? C.accent + "18" : "transparent",
          color: lang === l ? C.accent : C.textDim,
          fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: lang === l ? 700 : 400,
          cursor: "pointer", textTransform: "uppercase", letterSpacing: 0.5,
        }}>{l}</button>
      ))}
    </div>
  );
}

// ─── APP SHELL ───────────────────────────────────────────────────────────────
export default function App({ supabase, session, onAdmin, onProfile }) {
  const [tab, setTab] = useState("dashboard");
  const [legalModal, setLegalModal] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedPdf, setSelectedPdf] = useState(null);

  const lessons = [
    { id: "vocab_band5_001",     label: "Vocabulary — Band 5 — Part 1" },
    { id: "vocab_band5_002",     label: "Vocabulary — Band 5 — Part 2" },
    { id: "vocab_band6_001",     label: "Vocabulary — Band 6 — Part 1" },
    { id: "vocab_band6_002",     label: "Vocabulary — Band 6 — Part 2" },
    { id: "vocab_band7_001",     label: "Vocabulary — Band 7 — Part 1" },
    { id: "vocab_band7_002",     label: "Vocabulary — Band 7 — Part 2" },
    { id: "grammar_band5_001",   label: "Grammar — Band 5 — Part 1" },
    { id: "grammar_band5_002",   label: "Grammar — Band 5 — Part 2" },
    { id: "grammar_band6_001",   label: "Grammar — Band 6 — Part 1" },
    { id: "grammar_band6_002",   label: "Grammar — Band 6 — Part 2" },
    { id: "grammar_band7_001",   label: "Grammar — Band 7 — Part 1" },
    { id: "grammar_band7_002",   label: "Grammar — Band 7 — Part 2" },
    { id: "listening_band5_001", label: "Listening — Band 5 — Part 1" },
    { id: "listening_band5_002", label: "Listening — Band 5 — Part 2" },
    { id: "listening_band6_001", label: "Listening — Band 6 — Part 1" },
    { id: "listening_band6_002", label: "Listening — Band 6 — Part 2" },
    { id: "listening_band7_001", label: "Listening — Band 7 — Part 1" },
    { id: "listening_band7_002", label: "Listening — Band 7 — Part 2" },
    { id: "reading_band5_001",   label: "Reading — Band 5 — Part 1" },
    { id: "reading_band5_002",   label: "Reading — Band 5 — Part 2" },
    { id: "reading_band6_001",   label: "Reading — Band 6 — Part 1" },
    { id: "reading_band6_002",   label: "Reading — Band 6 — Part 2" },
    { id: "reading_band7_001",   label: "Reading — Band 7 — Part 1" },
    { id: "reading_band7_002",   label: "Reading — Band 7 — Part 2" },
    { id: "speaking_band5_001",  label: "Speaking — Band 5 — Part 1" },
    { id: "speaking_band5_002",  label: "Speaking — Band 5 — Part 2" },
    { id: "speaking_band6_001",  label: "Speaking — Band 6 — Part 1" },
    { id: "speaking_band6_002",  label: "Speaking — Band 6 — Part 2" },
    { id: "speaking_band7_001",  label: "Speaking — Band 7 — Part 1" },
    { id: "speaking_band7_002",  label: "Speaking — Band 7 — Part 2" },
  ];

  async function handleLogout() {
    if (supabase) await supabase.auth.signOut();
  }

  const userEmail = session?.user?.email || "";
  const isAdmin = userEmail === "sergio@sound-ready.com";

  return (
    <LangProvider>
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@700;800&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: radial-gradient(ellipse at 12% 50%, ${C.blue}55 0%, transparent 45%), radial-gradient(ellipse at 88% 30%, ${C.accent}45 0%, transparent 45%), ${C.bg}; color: ${C.text}; font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px; min-height: 100vh; }
          ::-webkit-scrollbar { width: 5px; }
          ::-webkit-scrollbar-track { background: ${C.bg}; }
          ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.25} }
          @keyframes wave { from{height:4px} to{height:40px} }
          input, textarea, select { color: ${C.text}; font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; }
          textarea::placeholder { color: ${C.textDim}; }
        `}</style>
        <div style={{ maxWidth: 720, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", width: "100%" }}>
          <div style={{ padding: "16px clamp(18px, 5vw, 120px) 0", borderBottom: `1px solid ${C.border}`, background: C.bg, position: "sticky", top: 0, zIndex: 10, boxShadow: "0 2px 12px rgba(27,42,58,0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 13 }}>
              <div style={{ width: 80, display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ background: C.green + "22", border: `1px solid ${C.green}44`, borderRadius: 999, padding: "3px 10px", fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.green, display: "inline-block" }}>Free</div>
                <LangSwitcher />
              </div>
              <div style={{ textAlign: "center" }}>
                <img src="/soundready-logo-transparent.png" alt="SoundReady" style={{ height: 56, objectFit: "contain" }} />
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.textDim, textTransform: "uppercase", letterSpacing: 3, marginTop: 2 }}>Ascend</div>
              </div>
              <div style={{ width: 80, display: "flex", justifyContent: "flex-end", position: "relative" }}>
                <AvatarMenu email={userEmail} onLogout={handleLogout} onAdmin={isAdmin ? onAdmin : null} onProfile={onProfile} />
              </div>
            </div>
            <NavTabs tab={tab} setTab={setTab} />
          </div>

          <div style={{ padding: "18px 20px", flex: 1 }}>
            {tab === "dashboard" && <Dashboard supabase={supabase} userId={session?.user?.id} />}
            {tab === "writing" && <WritingPractice supabase={supabase} userId={session?.user?.id} />}
            {tab === "speaking" && <SpeakingPractice supabase={supabase} userId={session?.user?.id} />}
            {tab === "history" && <Portfolio supabase={supabase} userId={session?.user?.id} />}
            {tab === "lessons" && (
              <SkillTree
                lessons={lessons}
                onSelectLesson={(id) => {
                  setSelectedLesson(id);
                  setTab("lesson-viewer");
                }}
              />
            )}
            {tab === "lesson-viewer" && selectedLesson && (
              <LessonViewer
                lessonId={selectedLesson}
                onComplete={(correctCount, totalQuestions) => {
                  const passed = correctCount / totalQuestions >= 0.8;
                  if (passed) {
                    const progress = JSON.parse(localStorage.getItem("sr_progress") || "{}");
                    progress[selectedLesson] = { completed: true, completedAt: Date.now() };
                    localStorage.setItem("sr_progress", JSON.stringify(progress));
                    const idx = lessons.findIndex(l => l.id === selectedLesson);
                    if (idx < lessons.length - 1) {
                      setSelectedLesson(lessons[idx + 1].id);
                    } else {
                      setTab("lessons");
                    }
                  } else {
                    setTab("lessons");
                  }
                }}
                onBack={(correctCount, totalQuestions) => {
                  if (correctCount && totalQuestions && correctCount / totalQuestions >= 0.8) {
                    const progress = JSON.parse(localStorage.getItem("sr_progress") || "{}");
                    progress[selectedLesson] = { completed: true, completedAt: Date.now() };
                    localStorage.setItem("sr_progress", JSON.stringify(progress));
                  }
                  setTab("lessons");
                }}
              />
            )}
            {tab === "resources" && (
              <PdfLibrary
                onSelectPdf={(id) => {
                  setSelectedPdf(id);
                  setTab("pdf-viewer");
                }}
              />
            )}
            {tab === "pdf-viewer" && selectedPdf && (
              <PdfViewer
                supabase={supabase}
                pdfId={selectedPdf}
                onBack={() => setTab("resources")}
              />
            )}
          </div>

          <Footer onLegal={setLegalModal} />
          {legalModal && <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />}
        </div>
      </>
    </LangProvider>
  );
}
