import { useState, useRef } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

// ─── BACKEND PROXY ───────────────────────────────────────────────────────────
const PROXY = "https://web-production-e43ad.up.railway.app";

// ─── THEME — SoundReady English Light Mode ───────────────────────────────────
const C = {
  bg: "#F8F9FC",           // off-white background
  surface: "#FFFFFF",      // card surface
  surfaceAlt: "#EEF2F8",   // elevated surface / input background
  border: "#D0DCE8",       // subtle border
  accent: "#C8922A",       // brand gold (Ready)
  accentSoft: "#C8922A12", // gold tint
  accentGlow: "#C8922A33", // gold glow
  green: "#1F8A5A",        // success green
  red: "#C0392B",          // error red
  blue: "#1B4F8A",         // brand navy (Sound)
  blueLight: "#2E7FC8",    // mid blue
  purple: "#5B4FA8",       // accent purple
  teal: "#1A8A8F",         // teal accent
  text: "#1A2A3A",         // primary text — deep navy
  textMuted: "#5A7A9A",    // muted text
  textDim: "#A0B4C8",      // dim text
};

const BAND_COLOR = b => b >= 7 ? C.green : b >= 5.5 ? C.accent : b >= 4 ? C.blue : C.red;
const CEFR = b => b >= 8.5 ? "C2" : b >= 7 ? "C1" : b >= 5.5 ? "B2" : b >= 4 ? "B1" : b >= 3 ? "A2" : "A1";

// ─── PARAPHRASED BAND DESCRIPTORS (Sergio's coaching voice) ──────────────────
const WRITING_DESCRIPTORS = {
  task: {
    label: "Task Response / Task Achievement",
    features: ["Task coverage", "Position clarity", "Idea development", "Relevance & accuracy"],
    bands: {
      8: "Covers all parts of the task thoroughly. Presents a clear, well-developed position sustained throughout. Ideas are fully extended with relevant, specific support. No irrelevant content.",
      7: "Addresses all parts of the task. Position is clear but may not be fully developed in every section. Main ideas are relevant and extended, though some points could be better supported.",
      6: "Addresses the main requirements but may not cover all parts equally. A position is attempted but may shift or lack consistency. Ideas are present but development is sometimes limited or general.",
      5: "Only partially addresses the task. A position may be unclear or inconsistently maintained. Ideas are underdeveloped, formulaic, or repetitive. Some irrelevant or inaccurate content may appear.",
    }
  },
  coherence: {
    label: "Coherence & Cohesion",
    features: ["Paragraph organisation", "Logical sequencing", "Cohesive devices", "Referencing & substitution"],
    bands: {
      8: "Ideas are sequenced logically and cohesion is handled skilfully — connectors blend into the writing without drawing attention. Paragraphing is well-managed with a clear topic focus in each paragraph.",
      7: "Information flows logically with clear progression. Cohesive devices are used effectively but with some mechanical or over-frequent use. Paragraphing is generally clear but occasionally inconsistent.",
      6: "Overall organisation is evident. Cohesive devices are used but sometimes inaccurately or repetitively. Paragraphs have a recognisable structure but may lack clear central ideas.",
      5: "Basic organisation is present but ideas may not progress clearly. Connectors are limited or overused. Paragraphing may be inappropriate or mechanical.",
    }
  },
  lexis: {
    label: "Lexical Resource",
    features: ["Vocabulary range", "Topic-specific vocabulary", "Collocations & word choice", "Spelling & word form"],
    bands: {
      8: "Uses a wide, varied vocabulary with natural control. Collocations are accurate and topic-specific terms are used appropriately. Rare minor errors in spelling or word form have no impact on communication.",
      7: "Good range of vocabulary with awareness of less common or topic-specific words. Some imprecision in collocation or word choice, but meaning is clear. Occasional spelling or word form errors.",
      6: "Adequate vocabulary for the task. Some attempts at less common vocabulary, though these may be inaccurate or inappropriate. Noticeable errors in spelling and word form, but overall meaning is clear.",
      5: "Limited vocabulary range. Repetition of the same words and phrases. Errors in word choice, spelling, and word form are frequent enough to occasionally strain the reader.",
    }
  },
  grammar: {
    label: "Grammatical Range & Accuracy",
    features: ["Sentence complexity", "Range of structures", "Error frequency", "Punctuation"],
    bands: {
      8: "Wide range of sentence structures used flexibly and accurately. Complex sentences are handled with confidence. Errors are rare and do not affect meaning — typically minor slips.",
      7: "Variety of sentence structures with general accuracy. Complex sentences are attempted and mostly correct, though some errors occur. Errors do not impede communication.",
      6: "Mix of simple and complex sentences. Complex structures are attempted but errors are present. Grammar errors are noticeable but overall meaning remains clear.",
      5: "Limited range of structures, relying mainly on simple sentences. Errors in complex structures are frequent. Some errors cause difficulty understanding specific parts.",
    }
  }
};

const SPEAKING_DESCRIPTORS = {
  fluency: {
    label: "Fluency & Coherence",
    features: ["Speaking pace & flow", "Hesitation & self-correction", "Logical sequencing", "Discourse markers"],
    bands: {
      8: "Speaks fluently with only occasional hesitation. Any pausing is for content rather than to search for words. Ideas are clearly sequenced and discourse markers are used naturally.",
      7: "Speaks at length without noticeable effort. May occasionally repeat or self-correct, but this does not affect overall fluency. Uses a range of cohesive devices, though sometimes mechanically.",
      6: "Able to keep talking but fluency is sometimes lost due to hesitation, repetition, or self-correction. Discourse markers are used but not always accurately or naturally.",
      5: "Maintains speech but relies on repetition and rephrasing to keep going. Hesitation is frequent. Basic connectors dominate. Ideas may lose logical flow.",
    }
  },
  lexis: {
    label: "Lexical Resource",
    features: ["Vocabulary range", "Topic-specific language", "Paraphrasing ability", "Idiomatic language"],
    bands: {
      8: "Uses a varied vocabulary with flexibility. Handles less common and idiomatic expressions with some ease. Paraphrasing is attempted naturally when needed. Rare minor errors.",
      7: "Good range of vocabulary with some use of less common expressions. Attempts paraphrase with reasonable success. Some imprecision in word choice, but meaning is clear.",
      6: "Adequate vocabulary for most topics. Meaning is generally clear but range is limited. Paraphrasing is attempted but may be awkward or inaccurate.",
      5: "Limited vocabulary range. Relies on basic, familiar words. Paraphrasing is rare or unsuccessful. Frequent errors in word choice may cause occasional strain.",
    }
  },
  grammar: {
    label: "Grammatical Range & Accuracy",
    features: ["Structure variety", "Complex sentence use", "Tense accuracy", "Error frequency & impact"],
    bands: {
      8: "Uses a wide range of structures with flexibility. Complex sentences are used accurately and naturally. Errors are occasional and do not affect understanding.",
      7: "Uses a variety of structures with reasonable accuracy. Both simple and complex forms are used effectively despite some errors. Error-free sentences are frequent.",
      6: "Uses basic structures accurately. Some complex sentences are attempted but errors are present. Errors are noticeable but communication is generally maintained.",
      5: "Mostly simple sentence forms. Short utterances may be accurate but complex attempts contain frequent errors. Errors occasionally make meaning unclear.",
    }
  },
  pronunciation: {
    label: "Pronunciation",
    features: ["Intelligibility", "Stress & rhythm", "Intonation", "Individual sounds"],
    bands: {
      8: "Easy to understand throughout. Uses a range of pronunciation features with control. Stress and intonation are generally appropriate. Occasional L1 influence does not affect clarity.",
      7: "Generally clear and easy to follow. Some features of pronunciation are controlled well. Minor lapses in stress or intonation occur but do not impede understanding.",
      6: "Understandable but requires some listener effort at times. Intonation and stress patterns are attempted. Individual sounds are occasionally mispronounced but meaning is usually clear.",
      5: "Understanding is possible but takes effort. Limited range of pronunciation features. Stress and rhythm are inconsistent. Some mispronounced sounds cause clarity issues.",
    }
  }
};

// ─── TOPIC BANKS ─────────────────────────────────────────────────────────────
const WRITING_TOPICS = {
  "Task 2": [
    { id: "t2-1", label: "Education", prompt: "Some people believe that universities should focus on providing academic knowledge only, while others think universities should prepare students for the real world of work.\n\nDiscuss both views and give your own opinion.\n\nWrite at least 250 words." },
    { id: "t2-2", label: "Technology", prompt: "The increasing use of technology in everyday life has made people more isolated from one another.\n\nTo what extent do you agree or disagree?\n\nWrite at least 250 words." },
    { id: "t2-3", label: "Environment", prompt: "Some people think individuals can do very little to help the environment and that it is mainly governments and large companies that should be responsible for reducing environmental damage.\n\nTo what extent do you agree or disagree?\n\nWrite at least 250 words." },
    { id: "t2-4", label: "Health", prompt: "In many countries, the average weight of people is increasing and their levels of health and fitness are decreasing.\n\nWhat are the causes of these problems and what measures could be taken to solve them?\n\nWrite at least 250 words." },
    { id: "t2-5", label: "Media", prompt: "Advertising encourages people to buy things they do not need and has a negative effect on society.\n\nTo what extent do you agree or disagree?\n\nWrite at least 250 words." },
  ],
  "Task 1 Academic": [
    {
      id: "t1a-1", label: "Bar Chart",
      imageUrl: null, // ← swap in a real image URL here to override the generated chart
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
function buildWritingPrompt(taskType, topicPrompt, response) {
  return `You are an IELTS examiner. Score this ${taskType} essay. Be concise. No apostrophes. Return ONLY this JSON with real values:
{"overall_band":7.0,"cefr":"B2","task_band":7,"coherence_band":7,"lexis_band":6,"grammar_band":7,"task_matched":"one sentence","task_summary":"two sentences","coherence_matched":"one sentence","coherence_summary":"two sentences","lexis_matched":"one sentence","lexis_summary":"two sentences","grammar_matched":"one sentence","grammar_summary":"two sentences","task_evidence_1":"quote","task_obs_1":"observation","task_signal_1":"positive","task_evidence_2":"quote","task_obs_2":"observation","task_signal_2":"negative","coherence_evidence_1":"quote","coherence_obs_1":"observation","coherence_signal_1":"positive","coherence_evidence_2":"quote","coherence_obs_2":"observation","coherence_signal_2":"negative","lexis_evidence_1":"quote","lexis_obs_1":"observation","lexis_signal_1":"positive","lexis_evidence_2":"quote","lexis_obs_2":"observation","lexis_signal_2":"negative","grammar_evidence_1":"quote","grammar_obs_1":"observation","grammar_signal_1":"positive","grammar_evidence_2":"quote","grammar_obs_2":"observation","grammar_signal_2":"negative","examiner_comment":"two sentences","next_band_targets":"two improvements","model_rewrite":"one rewrite sentence"}

TASK: ${taskType}
PROMPT: ${topicPrompt}
ESSAY: ${response}`;
}

function buildSpeakingPrompt(part, topicPrompt, transcript) {
  return `You are an IELTS Speaking examiner. Score this Part ${part} transcript. Be concise. No apostrophes. Return ONLY this JSON with real values:
{"overall_band":6.5,"cefr":"B2","fluency_band":6,"lexis_band":7,"grammar_band":6,"pronunciation_band":7,"fluency_matched":"one sentence","fluency_summary":"two sentences","lexis_matched":"one sentence","lexis_summary":"two sentences","grammar_matched":"one sentence","grammar_summary":"two sentences","pronunciation_matched":"one sentence","pronunciation_summary":"two sentences","fluency_evidence_1":"quote","fluency_obs_1":"observation","fluency_signal_1":"positive","fluency_evidence_2":"quote","fluency_obs_2":"observation","fluency_signal_2":"negative","lexis_evidence_1":"quote","lexis_obs_1":"observation","lexis_signal_1":"positive","lexis_evidence_2":"quote","lexis_obs_2":"observation","lexis_signal_2":"negative","grammar_evidence_1":"quote","grammar_obs_1":"observation","grammar_signal_1":"positive","grammar_evidence_2":"quote","grammar_obs_2":"observation","grammar_signal_2":"negative","pronunciation_evidence_1":"quote","pronunciation_obs_1":"observation","pronunciation_signal_1":"positive","pronunciation_evidence_2":"quote","pronunciation_obs_2":"observation","pronunciation_signal_2":"negative","examiner_comment":"two sentences","next_band_targets":"two improvements","model_rewrite":"one rewrite sentence"}

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
          <div style="font-size:9px;color:#999;text-transform:uppercase;letter-spacing:1px;font-family:monospace;margin-bottom:8px">Language Evidence from Candidate Response</div>
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

  // Direct download — opens in browser or saves to downloads on mobile
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
function Pill({ children, active, onClick, color }) {
  const col = color || C.accent;
  return (
    <button onClick={onClick} style={{
      padding: "6px 13px", borderRadius: 999, border: `1.5px solid ${active ? col : C.border}`,
      background: active ? col + "18" : "transparent", color: active ? col : C.textMuted,
      fontFamily: "'DM Mono', monospace", fontSize: 12, cursor: "pointer",
      transition: "all 0.15s", fontWeight: active ? 700 : 400, whiteSpace: "nowrap",
    }}>{children}</button>
  );
}

function ScoreRing({ score, label, color }) {
  const r = 27, circ = 2 * Math.PI * r, fill = (score / 9) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
      <svg width={66} height={66}>
        <circle cx={33} cy={33} r={r} fill="none" stroke={C.border} strokeWidth={4} />
        <circle cx={33} cy={33} r={r} fill="none" stroke={color} strokeWidth={4}
          strokeDasharray={`${fill} ${circ}`} strokeDashoffset={circ / 4} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1.2s ease" }} />
        <text x={33} y={38} textAnchor="middle" fill={color} fontSize={15} fontWeight={700} fontFamily="DM Mono">{score}</text>
      </svg>
      <span style={{ color: C.textMuted, fontSize: 10, fontFamily: "DM Mono", textTransform: "uppercase", letterSpacing: 0.8, textAlign: "center", maxWidth: 66 }}>{label}</span>
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
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 14px", background: C.surfaceAlt, border: "none", cursor: "pointer", textAlign: "left",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 6, padding: "2px 9px", fontFamily: "DM Mono", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>Band {band}</span>
          <span style={{ color: C.text, fontFamily: "DM Mono", fontSize: 11 }}>{label}</span>
        </div>
        <span style={{ color: C.textDim, fontSize: 12, marginLeft: 8 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{ padding: "13px 14px", background: C.surface }}>
          <p style={{ color: C.textMuted, fontSize: 12.5, lineHeight: 1.65, fontStyle: "italic", margin: "0 0 5px" }}>{descriptorMatched}</p>
          <p style={{ color: C.text, fontSize: 13, lineHeight: 1.65, margin: "0 0 14px" }}>{quickSummary}</p>

          <div style={{ fontFamily: "DM Mono", fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
            Language Evidence from Candidate Response
          </div>

          {displayedEvidence.map((ev, i) => (
            <div key={i} style={{ display: "flex", gap: 9, marginBottom: 11, paddingBottom: 11, borderBottom: i < displayedEvidence.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <BandSignalDot signal={ev.band_signal} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "DM Mono", fontSize: 9, color: C.textDim, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.8 }}>
                  {ev.feature}
                </div>
                <div style={{ background: C.surfaceAlt, borderLeft: `3px solid ${ev.band_signal === "positive" ? C.green : ev.band_signal === "negative" ? C.red : C.accent}`, borderRadius: "0 7px 7px 0", padding: "7px 10px", marginBottom: 6 }}>
                  <span style={{ color: C.text, fontFamily: "'Lora', serif", fontSize: 13, fontStyle: "italic" }}>"{ev.extract}"</span>
                </div>
                <p style={{ color: C.textMuted, fontSize: 12.5, lineHeight: 1.6, margin: 0 }}>{ev.observation}</p>
              </div>
            </div>
          ))}

          {allEvidence.length > 2 && (
            <button onClick={() => setShowAll(!showAll)} style={{
              background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7,
              padding: "5px 12px", color: C.textMuted, fontFamily: "DM Mono", fontSize: 11,
              cursor: "pointer", marginTop: 4, width: "100%",
            }}>
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
      {/* Score header */}
      <div style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 13, padding: "16px 15px", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontFamily: "DM Mono", fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Overall Band</div>
            <div style={{ fontFamily: "DM Mono", fontSize: 40, fontWeight: 700, color: BAND_COLOR(feedback.overall_band), lineHeight: 1 }}>{feedback.overall_band}</div>
            <div style={{ fontFamily: "DM Mono", fontSize: 10, color: C.textMuted, marginTop: 3 }}>CEFR {feedback.cefr} · {CEFR(feedback.overall_band)}</div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {criteriaMap.map(({ key }, i) => (
              <ScoreRing key={key} score={feedback.criteria[key].band} label={descriptors[key].label.split(" ")[0]} color={ringColors[i]} />
            ))}
          </div>
        </div>
      </div>

      {/* Examiner comment */}
      <div style={{ background: C.blue + "0e", border: `1px solid ${C.blue}28`, borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}>
        <div style={{ fontFamily: "DM Mono", fontSize: 9, color: C.blue, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>📋 Examiner Comment</div>
        <p style={{ color: C.text, fontSize: 13.5, lineHeight: 1.68, margin: 0 }}>{feedback.examiner_comment}</p>
      </div>

      {/* Criterion breakdown */}
      <div style={{ fontFamily: "DM Mono", fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Criterion Breakdown</div>
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

      {/* Next band */}
      <div style={{ background: C.accent + "0e", border: `1px solid ${C.accent}28`, borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
        <div style={{ fontFamily: "DM Mono", fontSize: 9, color: C.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>🎯 To Reach the Next Band</div>
        <p style={{ color: C.text, fontSize: 13.5, lineHeight: 1.68, margin: 0 }}>{feedback.next_band_targets}</p>
      </div>

      {/* Model rewrite */}
      <div style={{ background: C.purple + "0e", border: `1px solid ${C.purple}28`, borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
        <div style={{ fontFamily: "DM Mono", fontSize: 9, color: C.purple, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>✨ Model Rewrite</div>
        <p style={{ color: C.text, fontSize: 13.5, lineHeight: 1.68, margin: 0 }}>{feedback.model_rewrite}</p>
      </div>

      {/* Export */}
      <button onClick={onExport} disabled={exporting} style={{
        width: "100%", padding: "13px 0",
        background: exporting ? C.border : C.accent,
        color: exporting ? C.textDim : "#FFFFFF",
        border: "none", borderRadius: 11, fontFamily: "DM Mono", fontSize: 13,
        fontWeight: 700, cursor: exporting ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        transition: "all 0.2s",
      }}>
        {exporting ? "⏳ Preparing Report…" : "⬇ Download Report"}
      </button>
    </div>
  );
}

// ─── WRITING PRACTICE ────────────────────────────────────────────────────────
// ─── TASK 1 CHART COMPONENTS ─────────────────────────────────────────────────

function ChartBar({ data }) {
  const { title, xKey, series, data: rows, yMax, yUnit } = data;
  return (
    <div>
      <div style={{ fontFamily: "DM Mono", fontSize: 10, color: C.textMuted, marginBottom: 10, textAlign: "center" }}>{title}</div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={rows} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
          <XAxis dataKey={xKey} tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "DM Mono" }} />
          <YAxis domain={[0, yMax]} tickFormatter={v => `${v}${yUnit}`} tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "DM Mono" }} />
          <Tooltip contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: "DM Mono", fontSize: 11 }} formatter={(v) => [`${v}${yUnit}`]} />
          <Legend wrapperStyle={{ fontFamily: "DM Mono", fontSize: 10 }} />
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
      <div style={{ fontFamily: "DM Mono", fontSize: 10, color: C.textMuted, marginBottom: 10, textAlign: "center" }}>{title}</div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={rows} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
          <XAxis dataKey={xKey} tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "DM Mono" }} />
          <YAxis domain={[0, yMax]} tickFormatter={v => `${v}${yUnit}`} tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "DM Mono" }} />
          <Tooltip contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: "DM Mono", fontSize: 11 }} formatter={(v) => [`${v}${yUnit}`]} />
          <Legend wrapperStyle={{ fontFamily: "DM Mono", fontSize: 10 }} />
          {series.map(s => <Line key={s.key} type="monotone" dataKey={s.key} stroke={s.color} strokeWidth={2} dot={{ r: 3 }} />)}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartPie({ data }) {
  const { title, series } = data;
  const RADIAN = Math.PI / 180;
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name }) => {
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return value >= 10 ? <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={9} fontFamily="DM Mono">{value}%</text> : null;
  };
  return (
    <div>
      <div style={{ fontFamily: "DM Mono", fontSize: 10, color: C.textMuted, marginBottom: 6, textAlign: "center" }}>{title}</div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
        {series.map(s => (
          <div key={s.year} style={{ flex: 1, minWidth: 130 }}>
            <div style={{ fontFamily: "DM Mono", fontSize: 10, color: C.accent, textAlign: "center", marginBottom: 4 }}>{s.year}</div>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={s.data} cx="50%" cy="50%" outerRadius={60} dataKey="value" labelLine={false} label={renderLabel}>
                  {s.data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: "DM Mono", fontSize: 11 }} formatter={v => [`${v}%`]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 6 }}>
        {series[0].data.map(d => (
          <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color, display: "inline-block" }} />
            <span style={{ fontFamily: "DM Mono", fontSize: 9, color: C.textMuted }}>{d.name}</span>
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
      <div style={{ fontFamily: "DM Mono", fontSize: 10, color: C.textMuted, marginBottom: 12, textAlign: "center" }}>{title}</div>
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0, justifyContent: "center" }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: C.surfaceAlt, border: `2px solid ${C.accent}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{s.icon}</div>
              <div style={{ fontFamily: "DM Mono", fontSize: 9, color: C.text, textAlign: "center", maxWidth: 60, whiteSpace: "pre-line", lineHeight: 1.4 }}>{s.label}</div>
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

// ─── TASK 1 VISUAL — chart OR real image OR student upload ───────────────────
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

  // Priority: student upload > real image URL > generated chart
  const showUploaded = !!uploadedImage;
  const showRealImage = !showUploaded && !!topic.imageUrl;
  const showChart = !showUploaded && !showRealImage;

  return (
    <div style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 14px 12px", marginBottom: 12 }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontFamily: "DM Mono", fontSize: 9, color: C.accent, textTransform: "uppercase", letterSpacing: 1 }}>
          {showUploaded ? "Your Uploaded Chart" : showRealImage ? "Task Visual" : `Generated ${topic.label}`}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {showUploaded && (
            <button onClick={clearUpload} style={{ fontFamily: "DM Mono", fontSize: 9, color: C.red, background: "transparent", border: `1px solid ${C.red}44`, borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}>✕ Remove</button>
          )}
          {!showUploaded && (
            <>
              <span style={{ fontFamily: "DM Mono", fontSize: 9, color: C.textDim }}>Upload real image</span>
              <button onClick={() => fileRef.current?.click()} style={{ fontFamily: "DM Mono", fontSize: 9, color: C.blue, background: "transparent", border: `1px solid ${C.blue}44`, borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}>⬆ Upload</button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleUpload} />
            </>
          )}
        </div>
      </div>

      {/* Visual */}
      {showUploaded && (
        <img src={uploadedImage} alt="Uploaded Task 1" style={{ width: "100%", borderRadius: 8, maxHeight: 280, objectFit: "contain", background: "#fff" }} />
      )}
      {showRealImage && (
        <img src={topic.imageUrl} alt={topic.label} style={{ width: "100%", borderRadius: 8, maxHeight: 280, objectFit: "contain", background: "#fff" }} />
      )}
      {showChart && topic.chartType === "bar" && <ChartBar data={topic.chartData} />}
      {showChart && topic.chartType === "line" && <ChartLine data={topic.chartData} />}
      {showChart && topic.chartType === "pie" && <ChartPie data={topic.chartData} />}
      {showChart && topic.chartType === "process" && <ChartProcess data={topic.chartData} />}

      {/* Slot hint for real images */}
      {showChart && (
        <div style={{ marginTop: 10, padding: "6px 10px", background: C.surface, borderRadius: 7, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11 }}>💡</span>
          <span style={{ fontFamily: "DM Mono", fontSize: 9, color: C.textDim, lineHeight: 1.5 }}>
            Replace with a real past-paper image by setting <code style={{ color: C.accent }}>imageUrl</code> in the topic bank, or upload one above.
          </span>
        </div>
      )}
    </div>
  );
}

// ─── JSON REPAIR ─────────────────────────────────────────────────────────────
// Handles unescaped apostrophes and special chars in AI-generated JSON
function safeParseJSON(raw) {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in response");
  let str = raw.slice(start, end + 1);
  // Replace smart quotes
  str = str.replace(/[\u2018\u2019]/g, "\\'").replace(/[\u201C\u201D]/g, '\\"');
  // Try direct parse first
  try { return JSON.parse(str); } catch {}
  // Fix unescaped apostrophes inside JSON string values
  // Strategy: parse character by character tracking whether we're inside a string
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

function WritingPractice() {
  const [taskType, setTaskType] = useState("Task 2");
  const [topic, setTopic] = useState(WRITING_TOPICS["Task 2"][0]);
  const [essay, setEssay] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [view, setView] = useState("write");
  const [exporting, setExporting] = useState(false);
  const [uploadedBase64, setUploadedBase64] = useState(null);
  const [lastEssay, setLastEssay] = useState("");
  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;
  const minWords = taskType === "Task 2" ? 250 : 150;

  const criteriaMap = [{ key: "task" }, { key: "coherence" }, { key: "lexis" }, { key: "grammar" }];
  const ringColors = [C.blue, C.teal, C.green, C.accent];

  function handleTaskChange(t) {
    setTaskType(t); setTopic(WRITING_TOPICS[t][0]);
    setEssay(""); setFeedback(null); setView("write");
  }

  async function analyze() {
    if (wordCount < 50) return;
    setLastEssay(essay);
    setLoading(true); setFeedback(null);
    try {
      // Build message content — include image if student uploaded one
      const textContent = { type: "text", content: buildWritingPrompt(taskType, topic.prompt, essay) };
      const userContent = uploadedBase64
        ? [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: uploadedBase64.split(",")[1] } },
            { type: "text", text: buildWritingPrompt(taskType, topic.prompt, essay) },
          ]
        : buildWritingPrompt(taskType, topic.prompt, essay);

      const res = await fetch(`${PROXY}/analyse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: userContent }]
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(`API error: ${data.error.type} — ${data.error.message}`);
      const raw = data.content.find(b => b.type === "text")?.text || "{}";
      // Log raw for debugging
      const preview = raw.slice(6900, 7050);
      console.log("RAW AROUND ERROR:", preview);
      const flat = safeParseJSON(raw);
      // Convert flat structure to nested structure UI expects
      const nested = {
        overall_band: flat.overall_band,
        cefr: flat.cefr,
        examiner_comment: flat.examiner_comment,
        next_band_targets: flat.next_band_targets,
        model_rewrite: flat.model_rewrite,
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
      setFeedback(nested);
      setView("feedback");
    } catch (err) { 
      const pos = err.message.match(/position (\d+)/)?.[1];
      const snippet = pos ? `…${(data?.content?.[0]?.text || "").slice(Math.max(0, parseInt(pos)-30), parseInt(pos)+30)}…` : "";
      setFeedback({ error: true, message: `${err?.message}${snippet ? " | Near: " + snippet : ""}` }); 
      setView("write"); 
    }
    setLoading(false);
  }

  return (
    <div>
      {/* View toggle after feedback */}
      {feedback && !feedback.error && (
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          <Pill active={view === "write"} onClick={() => setView("write")} color={C.accent}>✍️ My Response</Pill>
          <Pill active={view === "feedback"} onClick={() => setView("feedback")} color={C.purple}>📊 Feedback Report</Pill>
        </div>
      )}

      {view === "write" && (
        <>
          <div style={{ fontFamily: "DM Mono", fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 7 }}>Task Type</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 13, flexWrap: "wrap" }}>
            {["Task 2", "Task 1 Academic", "Task 1 General"].map(t => (
              <Pill key={t} active={taskType === t} onClick={() => handleTaskChange(t)}>{t}</Pill>
            ))}
          </div>

          <div style={{ fontFamily: "DM Mono", fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 7 }}>Topic</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 13, flexWrap: "wrap" }}>
            {WRITING_TOPICS[taskType].map(t => (
              <Pill key={t.id} active={topic.id === t.id} onClick={() => { setTopic(t); setEssay(""); setFeedback(null); setView("write"); setUploadedBase64(null); }}>{t.label}</Pill>
            ))}
          </div>

          {/* Task 1 Academic chart / image visual */}
          <Task1Visual topic={topic} taskType={taskType} onBase64Change={setUploadedBase64} />

          <div style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 11, padding: "12px 14px", marginBottom: 12 }}>
            <div style={{ fontFamily: "DM Mono", fontSize: 9, color: C.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 7 }}>Prompt</div>
            <p style={{ color: C.text, fontSize: 13.5, lineHeight: 1.75, margin: 0, whiteSpace: "pre-line" }}>{topic.prompt}</p>
          </div>

          <textarea value={essay} onChange={e => setEssay(e.target.value)}
            placeholder={`Write your ${taskType} response here…`}
            style={{ width: "100%", minHeight: taskType === "Task 2" ? 220 : 160, background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 11, padding: "13px 14px", color: C.text, fontSize: 14, lineHeight: 1.72, fontFamily: "'Lora', Georgia, serif", resize: "vertical", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
            onFocus={e => e.target.style.borderColor = C.accent}
            onBlur={e => e.target.style.borderColor = C.border}
          />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 9 }}>
            <span style={{ fontFamily: "DM Mono", fontSize: 11, color: wordCount >= minWords ? C.green : C.textMuted }}>
              {wordCount} / {minWords} words {wordCount >= minWords ? "✓" : ""}
            </span>
            <button onClick={analyze} disabled={wordCount < 50 || loading} style={{
              background: wordCount >= 50 && !loading ? C.accent : C.border,
              color: wordCount >= 50 && !loading ? "#FFFFFF" : C.textDim,
              border: "none", borderRadius: 10, padding: "10px 20px",
              fontFamily: "DM Mono", fontSize: 12, fontWeight: 700,
              cursor: wordCount >= 50 && !loading ? "pointer" : "not-allowed",
            }}>{loading ? "Analysing…" : "Submit & Analyse →"}</button>
          </div>

          {loading && (
            <div style={{ textAlign: "center", padding: "28px 0", color: C.textMuted, fontFamily: "DM Mono", fontSize: 12 }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>📝</div>
              Extracting language samples and mapping to band descriptors…
            </div>
          )}

          {/* Show submitted essay for comparison when feedback exists */}
          {lastEssay && feedback && !feedback.error && (
            <div style={{ marginTop: 14, background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 11, padding: "12px 14px" }}>
              <div style={{ fontFamily: "DM Mono", fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Your Submitted Response</div>
              <p style={{ color: C.text, fontSize: 13.5, lineHeight: 1.75, margin: 0, fontFamily: "'Lora', serif", whiteSpace: "pre-line" }}>{lastEssay}</p>
            </div>
          )}

          {feedback?.error && (
            <div style={{ marginTop: 12, padding: 12, background: C.red + "15", border: `1px solid ${C.red}33`, borderRadius: 9, color: C.red, fontFamily: "DM Mono", fontSize: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Analysis failed</div>
              <div style={{ fontSize: 11, opacity: 0.85, wordBreak: "break-all" }}>{feedback.message || "Unknown error — check connection and try again."}</div>
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

// ─── SPEAKING PRACTICE ───────────────────────────────────────────────────────
// ─── WAVEFORM VISUALISER ─────────────────────────────────────────────────────
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
        fontSize: 14, flexShrink: 0,
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
          <span style={{ fontFamily: "DM Mono", fontSize: 10, color: C.textMuted }}>{fmt(progress)}</span>
          <span style={{ fontFamily: "DM Mono", fontSize: 10, color: C.textMuted }}>{fmt(duration)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── RECORDER STATES ─────────────────────────────────────────────────────────
// idle → recording → recorded → transcribing → review → (submit to Claude)

function VoiceRecorder({ partColor, onTranscriptReady }) {
  // recorderState: "idle" | "recording" | "recorded" | "transcribing" | "review" | "error"
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

  // ── Real Whisper transcription via Railway proxy ───────────────────────────
  async function transcribeAudio(blob) {
    setRecorderState("transcribing");
    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");
      const res = await fetch(`${PROXY}/transcribe`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(`Transcription failed: ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTranscript(data.transcript || "");
      setRecorderState("review");
    } catch (err) {
      setErrorMsg(err.message || "Transcription failed. Please try again.");
      setRecorderState("error");
    }
  }

  // ── Start recording ────────────────────────────────────────────────────────
  async function startRecording() {
    setErrorMsg("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      // Use webm/opus if supported, fallback to default
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "";
      const options = mimeType ? { mimeType } : {};
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || "audio/webm" });
        audioBlobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        // Stop all tracks to release microphone
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorder.start(250); // collect data every 250ms
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

  // ── Stop recording ─────────────────────────────────────────────────────────
  function stopRecording() {
    clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setRecorderState("recorded");
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
      {/* ── IDLE / RECORDING / RECORDED ── */}
      {(recorderState === "idle" || isRecording || isRecorded) && (
        <div style={{ background: C.surfaceAlt, border: `1.5px solid ${isRecording ? partColor + "66" : C.border}`, borderRadius: 14, padding: "20px 16px", marginBottom: 12, transition: "border-color 0.3s" }}>

          {/* Status label */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {isRecording && (
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.red, display: "inline-block", animation: "pulse 1s infinite" }} />
              )}
              <span style={{ fontFamily: "DM Mono", fontSize: 10, color: isRecording ? C.red : isRecorded ? C.green : C.textDim, textTransform: "uppercase", letterSpacing: 1 }}>
                {isRecording ? "Recording" : isRecorded ? "Recording Complete" : "Ready to Record"}
              </span>
            </div>
            {isRecording && (
              <span style={{ fontFamily: "DM Mono", fontSize: 18, fontWeight: 700, color: C.red }}>{fmt(timer)}</span>
            )}
            {isRecorded && (
              <span style={{ fontFamily: "DM Mono", fontSize: 12, color: C.textMuted }}>{fmt(timer)} recorded</span>
            )}
          </div>

          {/* Waveform */}
          <div style={{ marginBottom: 18 }}>
            <Waveform active={isRecording} color={isRecording ? C.red : isRecorded ? C.green : C.textDim} />
          </div>

          {/* Playback (placeholder until real audio available) */}
          {isRecorded && audioUrl && (
            <div style={{ marginBottom: 14 }}>
              <AudioPlayer audioUrl={audioUrl} color={partColor} />
            </div>
          )}

          {isRecorded && !audioUrl && (
            <div style={{ background: C.surface, border: `1px dashed ${C.border}`, borderRadius: 9, padding: "10px 14px", marginBottom: 14, textAlign: "center" }}>
              <span style={{ fontFamily: "DM Mono", fontSize: 11, color: C.textDim }}>Audio playback available once backend is connected</span>
            </div>
          )}

          {/* Controls */}
          <div style={{ display: "flex", gap: 8 }}>
            {!isRecorded && (
              <button onClick={isRecording ? stopRecording : startRecording} style={{
                flex: 1, padding: "12px 0", border: "none", borderRadius: 10, cursor: "pointer",
                background: isRecording ? C.red : partColor,
                color: "#FFFFFF", fontFamily: "DM Mono", fontSize: 13, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "background 0.2s",
              }}>
                {isRecording
                  ? <><span style={{ width: 10, height: 10, borderRadius: 2, background: "#FFFFFF", display: "inline-block" }} /> Stop Recording</>
                  : <><span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FFFFFF", display: "inline-block" }} /> Start Recording</>
                }
              </button>
            )}

            {isRecorded && (
              <>
                <button onClick={reset} style={{
                  padding: "11px 16px", border: `1.5px solid ${C.border}`, borderRadius: 10,
                  background: "transparent", color: C.textMuted, fontFamily: "DM Mono",
                  fontSize: 12, cursor: "pointer",
                }}>↺ Re-record</button>
                <button onClick={() => transcribeAudio(audioBlobRef.current)} style={{
                  flex: 1, padding: "11px 0", border: "none", borderRadius: 10, cursor: "pointer",
                  background: partColor, color: "#FFFFFF", fontFamily: "DM Mono",
                  fontSize: 13, fontWeight: 700,
                }}>Transcribe →</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── TRANSCRIBING ── */}
      {isTranscribing && (
        <div style={{ background: C.surfaceAlt, border: `1.5px solid ${partColor}44`, borderRadius: 14, padding: "32px 16px", marginBottom: 12, textAlign: "center" }}>
          <div style={{ marginBottom: 16 }}>
            <Waveform active={true} color={partColor} />
          </div>
          <div style={{ fontFamily: "DM Mono", fontSize: 12, color: partColor, marginBottom: 6 }}>Transcribing your response…</div>
          <div style={{ fontFamily: "DM Mono", fontSize: 10, color: C.textDim }}>Whisper AI is processing your audio</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 14 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: partColor, opacity: 0.7, animation: `pulse 1s infinite`, animationDelay: `${i * 0.3}s` }} />
            ))}
          </div>
        </div>
      )}

      {/* ── ERROR STATE ── */}
      {isError && (
        <div style={{ background: C.red + "0e", border: `1px solid ${C.red}33`, borderRadius: 12, padding: "16px", marginBottom: 12 }}>
          <div style={{ fontFamily: "DM Mono", fontSize: 10, color: C.red, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>⚠ Recording Error</div>
          <p style={{ color: C.text, fontSize: 13, lineHeight: 1.6, margin: "0 0 12px" }}>{errorMsg}</p>
          <button onClick={reset} style={{
            background: "transparent", border: `1.5px solid ${C.border}`, borderRadius: 8,
            padding: "8px 16px", color: C.textMuted, fontFamily: "DM Mono", fontSize: 11, cursor: "pointer",
          }}>↺ Try Again</button>
        </div>
      )}

      {/* ── REVIEW TRANSCRIPT ── */}
      {isReview && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ background: C.green + "0e", border: `1px solid ${C.green}33`, borderRadius: 10, padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14 }}>✅</span>
            <div>
              <div style={{ fontFamily: "DM Mono", fontSize: 10, color: C.green, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>Transcription Complete</div>
              <div style={{ fontFamily: "DM Mono", fontSize: 10, color: C.textMuted }}>Review and correct your transcript before analysis</div>
            </div>
          </div>

          <div style={{ fontFamily: "DM Mono", fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 7 }}>
            Your Transcript — edit if needed
          </div>
          <textarea value={transcript} onChange={e => setTranscript(e.target.value)}
            placeholder="Your transcribed speech will appear here. You can edit it to correct any errors before submitting for analysis…"
            style={{ width: "100%", minHeight: 150, background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 11, padding: "13px 14px", color: C.text, fontSize: 14, lineHeight: 1.72, fontFamily: "'Lora', Georgia, serif", resize: "vertical", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
            onFocus={e => e.target.style.borderColor = partColor}
            onBlur={e => e.target.style.borderColor = C.border}
          />
          <div style={{ fontFamily: "DM Mono", fontSize: 10, color: transcript.trim().split(/\s+/).filter(Boolean).length >= 20 ? C.green : C.textMuted, marginTop: 6 }}>
            {transcript.trim() ? transcript.trim().split(/\s+/).filter(Boolean).length : 0} words — minimum 20 to analyse {transcript.trim().split(/\s+/).filter(Boolean).length >= 20 ? "✓" : ""}
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 9 }}>
            <button onClick={reset} style={{
              padding: "10px 14px", border: `1.5px solid ${C.border}`, borderRadius: 10,
              background: "transparent", color: C.textMuted, fontFamily: "DM Mono", fontSize: 12, cursor: "pointer",
            }}>↺ Re-record</button>
            <button
              onClick={() => onTranscriptReady(transcript)}
              disabled={!transcript.trim() || transcript.trim().split(/\s+/).length < 20}
              style={{
                flex: 1, padding: "10px 0", border: "none", borderRadius: 10,
                background: transcript.trim() && transcript.trim().split(/\s+/).length >= 20 ? partColor : C.border,
                color: transcript.trim() && transcript.trim().split(/\s+/).length >= 20 ? "#FFFFFF" : C.textDim,
                fontFamily: "DM Mono", fontSize: 13, fontWeight: 700,
                cursor: transcript.trim() ? "pointer" : "not-allowed",
              }}>Submit & Analyse →</button>
          </div>
        </div>
      )}

      {/* ── MANUAL INPUT FALLBACK ── */}
      {recorderState === "idle" && (
        <div style={{ marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ flex: 1, height: 1, background: C.border }} />
            <span style={{ fontFamily: "DM Mono", fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: 1 }}>or type / paste</span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>
          <textarea value={transcript} onChange={e => setTranscript(e.target.value)}
            placeholder="Paste or type your spoken response here to analyse without recording…"
            style={{ width: "100%", minHeight: 120, background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 11, padding: "12px 14px", color: C.text, fontSize: 14, lineHeight: 1.72, fontFamily: "'Lora', Georgia, serif", resize: "vertical", outline: "none", boxSizing: "border-box" }}
            onFocus={e => e.target.style.borderColor = partColor}
            onBlur={e => e.target.style.borderColor = C.border}
          />
          {transcript.trim() && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
              <span style={{ fontFamily: "DM Mono", fontSize: 10, color: transcript.trim().split(/\s+/).filter(Boolean).length >= 20 ? C.green : C.textMuted }}>
                {transcript.trim().split(/\s+/).filter(Boolean).length} words — min 20 {transcript.trim().split(/\s+/).filter(Boolean).length >= 20 ? "✓" : ""}
              </span>
              <button onClick={() => onTranscriptReady(transcript)}
                disabled={transcript.trim().split(/\s+/).filter(Boolean).length < 20}
                style={{
                  padding: "10px 20px", border: "none", borderRadius: 10,
                  background: transcript.trim().split(/\s+/).filter(Boolean).length >= 20 ? partColor : C.border,
                  color: transcript.trim().split(/\s+/).filter(Boolean).length >= 20 ? "#FFFFFF" : C.textDim,
                  fontFamily: "DM Mono", fontSize: 12, fontWeight: 700,
                  cursor: transcript.trim().split(/\s+/).filter(Boolean).length >= 20 ? "pointer" : "not-allowed",
                }}>Submit & Analyse →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── SPEAKING PRACTICE ───────────────────────────────────────────────────────
function SpeakingPractice() {
  const [part, setPart] = useState(1);
  const [topic, setTopic] = useState(SPEAKING_TOPICS[1][0]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [view, setView] = useState("speak");
  const [exporting, setExporting] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");

  const partColors = { 1: C.blue, 2: C.green, 3: C.purple };
  const partLabels = { 1: "Introduction & Interview", 2: "Long Turn", 3: "Discussion" };
  const partHints = {
    1: "Answer naturally as you would in a conversation. Aim for 2–3 sentences per question.",
    2: "Use your 1 minute of preparation time. Speak for the full 1–2 minutes without stopping.",
    3: "Give extended answers with reasons and examples. Show abstract thinking.",
  };
  const criteriaMap = [{ key: "fluency" }, { key: "lexis" }, { key: "grammar" }, { key: "pronunciation" }];
  const ringColors = [C.blue, C.green, C.accent, C.purple];

  function handlePartChange(p) {
    setPart(p); setTopic(SPEAKING_TOPICS[p][0]);
    setFeedback(null); setView("speak");
  }

  async function analyze(transcript) {
    setLastTranscript(transcript);
    setLoading(true); setFeedback(null); setView("loading");
    try {
      const res = await fetch(`${PROXY}/analyse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: buildSpeakingPrompt(part, topic.prompt, transcript) }]
        })
      });
      const data = await res.json();
      const raw = data.content.find(b => b.type === "text")?.text || "{}";
      const flat = safeParseJSON(raw);
      const nested = {
        overall_band: flat.overall_band,
        cefr: flat.cefr,
        examiner_comment: flat.examiner_comment,
        next_band_targets: flat.next_band_targets,
        model_rewrite: flat.model_rewrite,
        criteria: {
          fluency: { band: flat.fluency_band, descriptor_matched: flat.fluency_matched, quick_summary: flat.fluency_summary, evidence: [
            { feature: "Speaking pace & flow", extract: flat.fluency_evidence_1, observation: flat.fluency_obs_1, band_signal: flat.fluency_signal_1 },
            { feature: "Discourse markers", extract: flat.fluency_evidence_2, observation: flat.fluency_obs_2, band_signal: flat.fluency_signal_2 },
          ]},
          lexis: { band: flat.lexis_band, descriptor_matched: flat.lexis_matched, quick_summary: flat.lexis_summary, evidence: [
            { feature: "Vocabulary range", extract: flat.lexis_evidence_1, observation: flat.lexis_obs_1, band_signal: flat.lexis_signal_1 },
            { feature: "Topic-specific language", extract: flat.lexis_evidence_2, observation: flat.lexis_obs_2, band_signal: flat.lexis_signal_2 },
          ]},
          grammar: { band: flat.grammar_band, descriptor_matched: flat.grammar_matched, quick_summary: flat.grammar_summary, evidence: [
            { feature: "Structure variety", extract: flat.grammar_evidence_1, observation: flat.grammar_obs_1, band_signal: flat.grammar_signal_1 },
            { feature: "Complex sentence use", extract: flat.grammar_evidence_2, observation: flat.grammar_obs_2, band_signal: flat.grammar_signal_2 },
          ]},
          pronunciation: { band: flat.pronunciation_band, descriptor_matched: flat.pronunciation_matched, quick_summary: flat.pronunciation_summary, evidence: [
            { feature: "Intelligibility", extract: flat.pronunciation_evidence_1, observation: flat.pronunciation_obs_1, band_signal: flat.pronunciation_signal_1 },
            { feature: "Stress & rhythm", extract: flat.pronunciation_evidence_2, observation: flat.pronunciation_obs_2, band_signal: flat.pronunciation_signal_2 },
          ]},
        }
      };
      setFeedback(nested);
      setView("feedback");
    } catch (err) { setFeedback({ error: true, message: err?.message || String(err) }); setView("speak"); }
    setLoading(false);
  }

  return (
    <div>
      {/* View tabs — only show after feedback */}
      {feedback && !feedback.error && (
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          <Pill active={view === "speak"} onClick={() => setView("speak")} color={partColors[part]}>🎙️ My Response</Pill>
          <Pill active={view === "feedback"} onClick={() => setView("feedback")} color={C.purple}>📊 Feedback Report</Pill>
        </div>
      )}

      {(view === "speak") && (
        <>
          {/* Part selector */}
          <div style={{ fontFamily: "DM Mono", fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 7 }}>Part</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 13 }}>
            {[1, 2, 3].map(p => (
              <Pill key={p} active={part === p} onClick={() => handlePartChange(p)} color={partColors[p]}>Part {p}</Pill>
            ))}
          </div>

          {/* Topic selector */}
          <div style={{ fontFamily: "DM Mono", fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 7 }}>Topic</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 13, flexWrap: "wrap" }}>
            {SPEAKING_TOPICS[part].map(t => (
              <Pill key={t.id} active={topic.id === t.id} onClick={() => { setTopic(t); setFeedback(null); }} color={partColors[part]}>{t.label}</Pill>
            ))}
          </div>

          {/* Prompt card */}
          <div style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 11, padding: "12px 14px", marginBottom: 6 }}>
            <div style={{ fontFamily: "DM Mono", fontSize: 9, color: partColors[part], textTransform: "uppercase", letterSpacing: 1, marginBottom: 7 }}>
              Part {part} — {partLabels[part]}
            </div>
            <p style={{ color: C.text, fontSize: 13.5, lineHeight: 1.75, margin: 0, whiteSpace: "pre-line" }}>{topic.prompt}</p>
          </div>

          {/* Examiner tip */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", marginBottom: 14 }}>
            <span style={{ fontSize: 12, marginTop: 1 }}>💡</span>
            <span style={{ fontFamily: "DM Mono", fontSize: 10, color: C.textMuted, lineHeight: 1.6 }}>{partHints[part]}</span>
          </div>

          {/* Voice Recorder */}
          <VoiceRecorder partColor={partColors[part]} onTranscriptReady={analyze} />

          {/* Show last transcript for comparison when feedback exists */}
          {lastTranscript && feedback && !feedback.error && (
            <div style={{ marginTop: 14, background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 11, padding: "12px 14px" }}>
              <div style={{ fontFamily: "DM Mono", fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Your Submitted Response</div>
              <p style={{ color: C.text, fontSize: 13.5, lineHeight: 1.75, margin: 0, fontFamily: "'Lora', serif" }}>{lastTranscript}</p>
            </div>
          )}

          {feedback?.error && (
            <div style={{ marginTop: 12, padding: 12, background: C.red + "15", border: `1px solid ${C.red}33`, borderRadius: 9, color: C.red, fontFamily: "DM Mono", fontSize: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Analysis failed</div>
              <div style={{ fontSize: 11, opacity: 0.85, wordBreak: "break-all" }}>{feedback.message || "Unknown error — check connection and try again."}</div>
            </div>
          )}
        </>
      )}

      {/* Loading state */}
      {view === "loading" && (
        <div style={{ textAlign: "center", padding: "48px 20px" }}>
          <div style={{ marginBottom: 20 }}>
            <Waveform active={true} color={partColors[part]} />
          </div>
          <div style={{ fontFamily: "DM Mono", fontSize: 12, color: partColors[part], marginBottom: 6 }}>
            Extracting language samples…
          </div>
          <div style={{ fontFamily: "DM Mono", fontSize: 10, color: C.textDim }}>
            Mapping to band descriptors
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 16 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: partColors[part], opacity: 0.7, animation: "pulse 1s infinite", animationDelay: `${i * 0.3}s` }} />
            ))}
          </div>
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
            exportToPDF(feedback, { taskType: `Speaking Part ${part}`, topicLabel: topic.label });
            setTimeout(() => setExporting(false), 1500);
          }}
          exporting={exporting}
        />
      )}
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function Dashboard() {
  const stats = [
    { label: "Sessions", value: "14", icon: "📚", color: C.blue },
    { label: "Avg Band", value: "6.5", icon: "🎯", color: C.accent },
    { label: "Writing", value: "6.0", icon: "✍️", color: C.green },
    { label: "Speaking", value: "7.0", icon: "🎙️", color: C.purple },
  ];
  const history = [
    { date: "May 7", type: "Writing", task: "Task 2 — Education", band: 6.5 },
    { date: "May 5", type: "Speaking", task: "Part 2 — Memorable Place", band: 7.0 },
    { date: "May 3", type: "Writing", task: "Task 1 Academic — Bar Chart", band: 6.0 },
    { date: "Apr 30", type: "Speaking", task: "Part 3 — Technology", band: 6.5 },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 20 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 15px" }}>
            <div style={{ fontSize: 20, marginBottom: 5 }}>{s.icon}</div>
            <div style={{ fontFamily: "DM Mono", fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontFamily: "DM Mono", fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ fontFamily: "DM Mono", fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Recent Sessions</div>
      {history.map((h, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
          <div>
            <div style={{ color: C.text, fontSize: 13.5, marginBottom: 2 }}>{h.task}</div>
            <div style={{ fontFamily: "DM Mono", fontSize: 9, color: C.textMuted }}>{h.date} · {h.type}</div>
          </div>
          <span style={{ background: BAND_COLOR(h.band) + "22", color: BAND_COLOR(h.band), border: `1px solid ${BAND_COLOR(h.band)}44`, borderRadius: 6, padding: "2px 9px", fontFamily: "DM Mono", fontSize: 11, fontWeight: 700 }}>Band {h.band}</span>
        </div>
      ))}

      <div style={{ marginTop: 16, background: C.accentSoft, border: `1px solid ${C.accent}33`, borderRadius: 12, padding: "13px 14px" }}>
        <div style={{ fontFamily: "DM Mono", fontSize: 9, color: C.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>⚡ Upgrade to Premium</div>
        <p style={{ color: C.textMuted, fontSize: 13, margin: "0 0 10px", lineHeight: 1.6 }}>Unlock unlimited sessions, Sentence Rewriter, full PDF report history, vocabulary insights, and personalised study plans.</p>
        <button style={{ background: C.accent, color: "#FFFFFF", border: "none", borderRadius: 8, padding: "8px 15px", fontFamily: "DM Mono", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Upgrade — $9.99/mo →</button>
      </div>
    </div>
  );
}

// ─── APP SHELL ───────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "writing", label: "Writing", icon: "✍️" },
    { id: "speaking", label: "Speaking", icon: "🎙️" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Lora:ital,wght@0,400;0,600;1,400&family=Sora:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.bg}; color: ${C.text}; font-family: 'Lora', serif; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.25} }
        @keyframes wave { from{height:4px} to{height:40px} }
        input, textarea, select { color: ${C.text}; }
        textarea::placeholder { color: ${C.textDim}; }
      `}</style>
      <div style={{ maxWidth: "100%", margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px clamp(18px, 5vw, 120px) 0", borderBottom: `1px solid ${C.border}`, background: C.bg, position: "sticky", top: 0, zIndex: 10, boxShadow: "0 2px 12px rgba(27,42,58,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 13 }}>
            <div>
              <div style={{ fontFamily: "Sora", fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: -0.5 }}>Sound<span style={{ color: C.accent }}>Ready</span></div>
              <div style={{ fontFamily: "DM Mono", fontSize: 8, color: C.textDim, textTransform: "uppercase", letterSpacing: 3 }}>English · Ascend</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ background: C.green + "22", border: `1px solid ${C.green}44`, borderRadius: 999, padding: "3px 10px", fontFamily: "DM Mono", fontSize: 9, color: C.green }}>Free Plan</div>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontSize: 12, fontWeight: 700, color: "#FFFFFF" }}>S</div>
            </div>
          </div>
          <div style={{ display: "flex" }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex: 1, padding: "9px 0", background: "transparent", border: "none",
                borderBottom: `2px solid ${tab === t.id ? C.accent : "transparent"}`,
                color: tab === t.id ? C.accent : C.textMuted,
                fontFamily: "DM Mono", fontSize: 11, cursor: "pointer", transition: "all 0.15s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              }}><span>{t.icon}</span>{t.label}</button>
            ))}
          </div>
        </div>

        <div style={{ padding: "18px clamp(18px, 5vw, 120px)", flex: 1 }}>
          {tab === "dashboard" && <Dashboard />}
          {tab === "writing" && <WritingPractice />}
          {tab === "speaking" && <SpeakingPractice />}
        </div>

        <div style={{ padding: "10px 18px", borderTop: `1px solid ${C.border}`, textAlign: "center", fontFamily: "DM Mono", fontSize: 8, color: C.textDim, letterSpacing: 1 }}>
          SOUNDREADY ASCEND · EVIDENCE-BASED FEEDBACK · FREE & PREMIUM
        </div>
      </div>
    </>
  );
}
