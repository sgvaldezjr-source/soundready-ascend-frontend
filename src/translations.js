// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const T = {
  en: {
    // Nav
    dashboard: "Dashboard",
    writing: "Writing",
    speaking: "Speaking",
    history: "My History",

    // Header
    free: "Free",
    ascend: "Ascend",

    // Avatar menu
    freePlan: "Free Plan",
    adminPanel: "Admin Panel",
    upgradePremium: "⭐ Upgrade to Premium",
    logOut: "Log Out",

    // Task types
    task2Academic: "Task 2 Academic",
    task2General: "Task 2 General",
    task1Academic: "Task 1 Academic",
    task1General: "Task 1 General",

    // Section labels
    taskType: "Task Type",
    topic: "Topic",
    part: "Part",
    prompt: "Prompt",
    yourResponse: "Your Response",
    yourSubmittedResponse: "Your Submitted Response",
    yourTranscript: "Your Transcript — edit if needed",

    // Prompt toggle
    presetTopic: "📚 Preset Topic",
    myOwnPrompt: "✏️ My Own Prompt",
    yourCustomPrompt: "Your Custom Prompt",
    part2MainQuestion: "Part 2 — Main Question",
    cueCardBullets: "Cue Card Bullet Points",
    taskVisual: "Task Visual",
    pastePromptHere: "Paste your prompt here…",
    savePrompt: "Save Prompt ✓",
    saving: "Saving…",
    words: "words",

    // Writing
    writeResponseHere: (taskType) => `Write your ${taskType} response here…`,
    submitAnalyse: "Submit & Analyse →",
    analysing: "Analysing…",
    extractingLanguage: "Extracting language samples and mapping to band descriptors…",
    analysisFailed: "Analysis failed",
    unknownError: "Unknown error — check connection and try again.",
    minWords: (n) => `/ ${n} words`,

    // Speaking parts
    partLabel: (n) => `Part ${n}`,
    partIntro: "Introduction & Interview",
    partLongTurn: "Long Turn",
    partDiscussion: "Discussion",
    partHint1: "Answer naturally as you would in a conversation. Aim for 2–3 sentences per question.",
    partHint2: "Use your 1 minute of preparation time. Speak for the full 1–2 minutes without stopping.",
    partHint3: "Give extended answers with reasons and examples. Show abstract thinking.",

    // Recorder
    readyToRecord: "Ready to Record",
    recording: "Recording",
    recordingComplete: "Recording Complete",
    startRecording: "Start Recording",
    stopRecording: "Stop Recording",
    reRecord: "↺ Re-record",
    transcribe: "Transcribe →",
    transcribing: "Transcribing your response…",
    whisperProcessing: "Whisper AI is processing your audio",
    transcriptionComplete: "Transcription Complete",
    reviewTranscript: "Review and correct your transcript before analysis",
    pasteSpokenResponse: "Paste or type your spoken response here…",
    orTypePaste: "or type / paste",
    minimum20: "minimum 20",
    recordingError: "Recording Error",
    tryAgain: "↺ Try Again",
    micDenied: "Microphone access denied.",
    noMic: "No microphone found.",
    emptyRecording: "Recording is empty — please try again.",
    transcriptionFailed: "Transcription failed.",

    // Feedback tabs
    myResponse: "My Response",
    feedbackReport: "Feedback Report",
    ieltsFeedback: "IELTS Feedback",
    pronunciation: "Pronunciation",

    // Feedback report
    overallBand: "Overall Band",
    criterionBreakdown: "Criterion Breakdown",
    examinerComment: "Examiner Comment",
    toReachNextBand: "— To Reach the Next Band",
    modelRewrite: "Model Rewrite",
    languageEvidence: "Language Evidence",
    downloadReport: "Download Report",
    preparingReport: "Preparing Report…",
    showAll: (n) => `Show all ${n} evidence items ▼`,
    showLess: "Show less ▲",
    scoringResponse: "Scoring your response…",
    runningAssessment: "Running IELTS assessment and pronunciation analysis in parallel",

    // Pronunciation
    pronunciationScore: "Pronunciation Score",
    assessment: "Assessment",
    strength: "Strength",
    wordsToPractise: "Words to Practise",
    fluencyRhythm: "Fluency & Rhythm",
    intonation: "Intonation",
    practicePlan: "Practice Plan",
    tip: "Tip",

    // Dashboard
    dayStreak: "Day Streak",
    personalBest: "Personal Best",
    noSessionsYet: "No sessions yet",
    startStreakToday: "Complete a session today to start your streak",
    nextTarget: "Next Target",
    nextTargetBand: "Next Target Band",
    completeToUnlock: "Complete a session to unlock",
    almostThere: "Almost there — one strong session could push you over",
    goodMomentum: "Good momentum — keep practising consistently",
    keepGoing: "Every session moves you closer — keep going",
    sessions: "Sessions",
    avgBand: "Avg Band",
    bandProgress: "Band Progress",
    sampleData: "✦ Sample data — complete a session to track your real progress",
    noSessionsRange: "No sessions in this time range",
    recentSessions: "Recent Sessions",
    noSessionsFirst: "Complete your first Writing or Speaking session to see your stats",

    // Portfolio
    sessionCount: (n) => `${n} Session${n !== 1 ? "s" : ""}`,
    loadingHistory: "Loading your session history…",
    noSessionsYetTitle: "No sessions yet",
    noSessionsYetSub: "Complete a Writing or Speaking session to build your history.",
    backToHistory: "← Back to History",
    loadingDashboard: "Loading your dashboard…",

    // History card
    viewFullReport: "View Full Report",
    chartImage: "Chart / Image",

    // Task 1 visual
    yourUploadedChart: "Your Uploaded Chart",
    taskVisualLabel: "Task Visual",
    generated: "Generated",
    remove: "✕ Remove",
    uploadImage: "⬆ Upload Image",
    pasteChartOrUpload: "Paste your chart image here or",

    // Footer
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    disclaimer: "Disclaimer",
    contact: "Contact",
    copyright: "© 2026 SoundReady English — SoundReady-Ascend. All rights reserved.",

    // Misc
    both: "Both",
    at: "at",
    unknown: "Unknown",
    writing_label: "Writing",
    speaking_label: "Speaking",
  },

  es: {
    // Nav
    dashboard: "Inicio",
    writing: "Escritura",
    speaking: "Expresión Oral",
    history: "Mi Historial",

    // Header
    free: "Gratis",
    ascend: "Ascend",

    // Avatar menu
    freePlan: "Plan Gratuito",
    adminPanel: "Panel de Admin",
    upgradePremium: "⭐ Mejorar a Premium",
    logOut: "Cerrar Sesión",

    // Task types
    task2Academic: "Tarea 2 Académica",
    task2General: "Tarea 2 General",
    task1Academic: "Tarea 1 Académica",
    task1General: "Tarea 1 General",

    // Section labels
    taskType: "Tipo de Tarea",
    topic: "Tema",
    part: "Parte",
    prompt: "Pregunta",
    yourResponse: "Tu Respuesta",
    yourSubmittedResponse: "Tu Respuesta Enviada",
    yourTranscript: "Tu Transcripción — edita si es necesario",

    // Prompt toggle
    presetTopic: "📚 Tema Predefinido",
    myOwnPrompt: "✏️ Mi Propio Tema",
    yourCustomPrompt: "Tu Tema Personalizado",
    part2MainQuestion: "Parte 2 — Pregunta Principal",
    cueCardBullets: "Puntos de la Tarjeta",
    taskVisual: "Imagen de la Tarea",
    pastePromptHere: "Pega tu pregunta aquí…",
    savePrompt: "Guardar Pregunta ✓",
    saving: "Guardando…",
    words: "palabras",

    // Writing
    writeResponseHere: (taskType) => `Escribe tu respuesta de ${taskType} aquí…`,
    submitAnalyse: "Enviar y Analizar →",
    analysing: "Analizando…",
    extractingLanguage: "Extrayendo muestras de lenguaje y mapeando descriptores de banda…",
    analysisFailed: "Análisis fallido",
    unknownError: "Error desconocido — verifica la conexión e inténtalo de nuevo.",
    minWords: (n) => `/ ${n} palabras`,

    // Speaking parts
    partLabel: (n) => `Parte ${n}`,
    partIntro: "Introducción y Entrevista",
    partLongTurn: "Turno Largo",
    partDiscussion: "Debate",
    partHint1: "Responde con naturalidad como lo harías en una conversación. Intenta 2–3 oraciones por pregunta.",
    partHint2: "Usa tu minuto de preparación. Habla durante 1–2 minutos completos sin parar.",
    partHint3: "Da respuestas extendidas con razones y ejemplos. Demuestra pensamiento abstracto.",

    // Recorder
    readyToRecord: "Listo para Grabar",
    recording: "Grabando",
    recordingComplete: "Grabación Completada",
    startRecording: "Iniciar Grabación",
    stopRecording: "Detener Grabación",
    reRecord: "↺ Volver a Grabar",
    transcribe: "Transcribir →",
    transcribing: "Transcribiendo tu respuesta…",
    whisperProcessing: "Whisper AI está procesando tu audio",
    transcriptionComplete: "Transcripción Completada",
    reviewTranscript: "Revisa y corrige tu transcripción antes del análisis",
    pasteSpokenResponse: "Pega o escribe tu respuesta hablada aquí…",
    orTypePaste: "o escribe / pega",
    minimum20: "mínimo 20",
    recordingError: "Error de Grabación",
    tryAgain: "↺ Intentar de Nuevo",
    micDenied: "Acceso al micrófono denegado.",
    noMic: "No se encontró micrófono.",
    emptyRecording: "La grabación está vacía — inténtalo de nuevo.",
    transcriptionFailed: "La transcripción falló.",

    // Feedback tabs
    myResponse: "Mi Respuesta",
    feedbackReport: "Informe de Retroalimentación",
    ieltsFeedback: "Retroalimentación IELTS",
    pronunciation: "Pronunciación",

    // Feedback report
    overallBand: "Banda General",
    criterionBreakdown: "Desglose por Criterio",
    examinerComment: "Comentario del Examinador",
    toReachNextBand: "— Para Alcanzar la Siguiente Banda",
    modelRewrite: "Reescritura Modelo",
    languageEvidence: "Evidencia Lingüística",
    downloadReport: "Descargar Informe",
    preparingReport: "Preparando Informe…",
    showAll: (n) => `Mostrar los ${n} elementos de evidencia ▼`,
    showLess: "Mostrar menos ▲",
    scoringResponse: "Puntuando tu respuesta…",
    runningAssessment: "Ejecutando evaluación IELTS y análisis de pronunciación en paralelo",

    // Pronunciation
    pronunciationScore: "Puntuación de Pronunciación",
    assessment: "Evaluación",
    strength: "Fortaleza",
    wordsToPractise: "Palabras para Practicar",
    fluencyRhythm: "Fluidez y Ritmo",
    intonation: "Entonación",
    practicePlan: "Plan de Práctica",
    tip: "Consejo",

    // Dashboard
    dayStreak: "Racha de Días",
    personalBest: "Mejor Marca Personal",
    noSessionsYet: "Sin sesiones aún",
    startStreakToday: "Completa una sesión hoy para iniciar tu racha",
    nextTarget: "Siguiente Objetivo",
    nextTargetBand: "Siguiente Banda Objetivo",
    completeToUnlock: "Completa una sesión para desbloquear",
    almostThere: "Casi lo logras — una sesión fuerte podría llevarte allí",
    goodMomentum: "Buen impulso — sigue practicando constantemente",
    keepGoing: "Cada sesión te acerca más — ¡sigue adelante!",
    sessions: "Sesiones",
    avgBand: "Banda Prom.",
    bandProgress: "Progreso de Banda",
    sampleData: "✦ Datos de muestra — completa una sesión para ver tu progreso real",
    noSessionsRange: "Sin sesiones en este período",
    recentSessions: "Sesiones Recientes",
    noSessionsFirst: "Completa tu primera sesión de Escritura o Expresión Oral para ver tus estadísticas",

    // Portfolio
    sessionCount: (n) => `${n} Sesión${n !== 1 ? "es" : ""}`,
    loadingHistory: "Cargando tu historial de sesiones…",
    noSessionsYetTitle: "Sin sesiones aún",
    noSessionsYetSub: "Completa una sesión de Escritura o Expresión Oral para construir tu historial.",
    backToHistory: "← Volver al Historial",
    loadingDashboard: "Cargando tu panel…",

    // History card
    viewFullReport: "Ver Informe Completo",
    chartImage: "Gráfico / Imagen",

    // Task 1 visual
    yourUploadedChart: "Tu Gráfico Subido",
    taskVisualLabel: "Visual de la Tarea",
    generated: "Generado",
    remove: "✕ Eliminar",
    uploadImage: "⬆ Subir Imagen",
    pasteChartOrUpload: "Pega tu imagen aquí o",

    // Footer
    privacyPolicy: "Política de Privacidad",
    termsOfService: "Términos de Servicio",
    disclaimer: "Aviso Legal",
    contact: "Contacto",
    copyright: "© 2026 SoundReady English — SoundReady-Ascend. Todos los derechos reservados.",

    // Misc
    both: "Ambos",
    at: "a las",
    unknown: "Desconocido",
    writing_label: "Escritura",
    speaking_label: "Expresión Oral",
  },

  zh: {
    // Nav
    dashboard: "主页",
    writing: "写作",
    speaking: "口语",
    history: "我的历史",

    // Header
    free: "免费",
    ascend: "Ascend",

    // Avatar menu
    freePlan: "免费计划",
    adminPanel: "管理员面板",
    upgradePremium: "⭐ 升级至高级版",
    logOut: "退出登录",

    // Task types
    task2Academic: "学术类写作任务二",
    task2General: "培训类写作任务二",
    task1Academic: "学术类写作任务一",
    task1General: "培训类写作任务一",

    // Section labels
    taskType: "任务类型",
    topic: "话题",
    part: "部分",
    prompt: "题目",
    yourResponse: "你的回答",
    yourSubmittedResponse: "你提交的回答",
    yourTranscript: "你的转录文本 — 如需请编辑",

    // Prompt toggle
    presetTopic: "📚 预设题目",
    myOwnPrompt: "✏️ 自定义题目",
    yourCustomPrompt: "你的自定义题目",
    part2MainQuestion: "第二部分 — 主要问题",
    cueCardBullets: "提示卡要点",
    taskVisual: "任务图表",
    pastePromptHere: "在此粘贴题目…",
    savePrompt: "保存题目 ✓",
    saving: "保存中…",
    words: "字",

    // Writing
    writeResponseHere: (taskType) => `在此写下你的${taskType}回答…`,
    submitAnalyse: "提交并分析 →",
    analysing: "分析中…",
    extractingLanguage: "正在提取语言样本并对应评分描述符…",
    analysisFailed: "分析失败",
    unknownError: "未知错误 — 请检查网络连接后重试。",
    minWords: (n) => `/ ${n} 字`,

    // Speaking parts
    partLabel: (n) => `第${n}部分`,
    partIntro: "介绍与访谈",
    partLongTurn: "长篇独白",
    partDiscussion: "双向讨论",
    partHint1: "像日常对话一样自然地回答。每个问题尽量回答2–3句话。",
    partHint2: "利用1分钟准备时间。连续流畅地说满1–2分钟。",
    partHint3: "给出详细回答，包含理由和例子。展示抽象思维能力。",

    // Recorder
    readyToRecord: "准备录音",
    recording: "录音中",
    recordingComplete: "录音完成",
    startRecording: "开始录音",
    stopRecording: "停止录音",
    reRecord: "↺ 重新录音",
    transcribe: "转录 →",
    transcribing: "正在转录你的回答…",
    whisperProcessing: "Whisper AI 正在处理你的音频",
    transcriptionComplete: "转录完成",
    reviewTranscript: "在分析前请检查并修改你的转录文本",
    pasteSpokenResponse: "在此粘贴或输入你的口语回答…",
    orTypePaste: "或输入 / 粘贴",
    minimum20: "最少20字",
    recordingError: "录音错误",
    tryAgain: "↺ 重试",
    micDenied: "麦克风访问被拒绝。",
    noMic: "未找到麦克风。",
    emptyRecording: "录音为空 — 请重试。",
    transcriptionFailed: "转录失败。",

    // Feedback tabs
    myResponse: "我的回答",
    feedbackReport: "反馈报告",
    ieltsFeedback: "雅思反馈",
    pronunciation: "发音",

    // Feedback report
    overallBand: "综合分数",
    criterionBreakdown: "分项评分",
    examinerComment: "考官评语",
    toReachNextBand: "— 达到下一分数段的建议",
    modelRewrite: "范文改写",
    languageEvidence: "语言证据",
    downloadReport: "下载报告",
    preparingReport: "正在准备报告…",
    showAll: (n) => `显示全部 ${n} 条证据 ▼`,
    showLess: "收起 ▲",
    scoringResponse: "正在评分…",
    runningAssessment: "正在同步运行雅思评估和发音分析",

    // Pronunciation
    pronunciationScore: "发音得分",
    assessment: "评估",
    strength: "优势",
    wordsToPractise: "需练习的单词",
    fluencyRhythm: "流利度与节奏",
    intonation: "语调",
    practicePlan: "练习计划",
    tip: "建议",

    // Dashboard
    dayStreak: "连续练习天数",
    personalBest: "个人最佳",
    noSessionsYet: "暂无练习记录",
    startStreakToday: "今天完成一次练习，开始你的连续记录",
    nextTarget: "下一目标",
    nextTargetBand: "下一目标分数段",
    completeToUnlock: "完成一次练习以解锁",
    almostThere: "即将达成 — 再来一次强力练习就能突破",
    goodMomentum: "保持良好势头 — 坚持定期练习",
    keepGoing: "每次练习都让你更进一步 — 加油！",
    sessions: "练习次数",
    avgBand: "平均分数",
    bandProgress: "分数进展",
    sampleData: "✦ 示例数据 — 完成练习后将显示你的真实进展",
    noSessionsRange: "此时间段内暂无练习记录",
    recentSessions: "最近练习",
    noSessionsFirst: "完成你的第一次写作或口语练习，即可查看统计数据",

    // Portfolio
    sessionCount: (n) => `共 ${n} 次练习`,
    loadingHistory: "正在加载你的练习历史…",
    noSessionsYetTitle: "暂无练习记录",
    noSessionsYetSub: "完成写作或口语练习，建立你的练习历史。",
    backToHistory: "← 返回历史记录",
    loadingDashboard: "正在加载主页…",

    // History card
    viewFullReport: "查看完整报告",
    chartImage: "图表 / 图片",

    // Task 1 visual
    yourUploadedChart: "你上传的图表",
    taskVisualLabel: "任务图表",
    generated: "生成的",
    remove: "✕ 删除",
    uploadImage: "⬆ 上传图片",
    pasteChartOrUpload: "在此粘贴图表或",

    // Footer
    privacyPolicy: "隐私政策",
    termsOfService: "服务条款",
    disclaimer: "免责声明",
    contact: "联系我们",
    copyright: "© 2026 SoundReady English — SoundReady-Ascend. 保留所有权利。",

    // Misc
    both: "全部",
    at: "于",
    unknown: "未知",
    writing_label: "写作",
    speaking_label: "口语",
  },
};

export default T;
