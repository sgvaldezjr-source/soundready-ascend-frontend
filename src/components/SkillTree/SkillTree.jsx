import { useState } from "react";
import "./SkillTree.css";

function extractBand(id) {
  const match = id.match(/band(\d)/i);
  return match ? parseInt(match[1]) : 99;
}

function groupByBand(lessons) {
  const groups = {};
  lessons.forEach((lesson) => {
    const band = extractBand(lesson.id);
    if (!groups[band]) groups[band] = [];
    groups[band].push(lesson);
  });
  return groups;
}

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem("sr_progress") || "{}");
  } catch {
    return {};
  }
}

function saveProgress(progress) {
  localStorage.setItem("sr_progress", JSON.stringify(progress));
}

const BAND_META = {
  5: { label: "Band 5", color: "#4CAF50", emoji: "🌱" },
  6: { label: "Band 6", color: "#2196F3", emoji: "🔷" },
  7: { label: "Band 7", color: "#9C27B0", emoji: "⭐" },
};

const XP_PER_LESSON = 20;
const HEARTS_MAX = 5;

export default function SkillTree({ lessons, onSelectLesson }) {
  const [progress, setProgress] = useState(loadProgress);
  const [stats, setStats] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("sr_stats") || "null");
    return saved || { xp: 0, hearts: HEARTS_MAX, streak: 0 };
  });

  const groups = groupByBand(lessons);
  const sortedBands = Object.keys(groups)
    .map(Number)
    .sort((a, b) => a - b);

  function isBandUnlocked(band) {
    if (band === sortedBands[0]) return true;
    const prevBand = sortedBands[sortedBands.indexOf(band) - 1];
    const prevLessons = groups[prevBand] || [];
    return prevLessons.every((l) => progress[l.id]?.completed);
  }

  function isLessonUnlocked(lesson, band) {
    if (!isBandUnlocked(band)) return false;
    const bandLessons = groups[band];
    const idx = bandLessons.indexOf(lesson);
    if (idx === 0) return true;
    return progress[bandLessons[idx - 1].id]?.completed;
  }

  function handleLessonClick(lesson, band) {
    if (!isLessonUnlocked(lesson, band)) return;
    onSelectLesson(lesson.id);
  }

  function markComplete(lessonId) {
    const updated = {
      ...progress,
      [lessonId]: { completed: true, completedAt: Date.now() },
    };
    setProgress(updated);
    saveProgress(updated);
    const newStats = { ...stats, xp: stats.xp + XP_PER_LESSON };
    setStats(newStats);
    localStorage.setItem("sr_stats", JSON.stringify(newStats));
  }

  const completedCount = Object.values(progress).filter(
    (p) => p.completed
  ).length;

  return (
    <div className="skill-tree-wrapper">
      <div className="stats-bar">
        <div className="stat">
          <span className="stat-icon">❤️</span>
          <span className="stat-value">{stats.hearts}</span>
        </div>
        <div className="stat">
          <span className="stat-icon">⚡</span>
          <span className="stat-value">{stats.xp} XP</span>
        </div>
        <div className="stat">
          <span className="stat-icon">🏆</span>
          <span className="stat-value">{completedCount}/{lessons.length}</span>
        </div>
      </div>

      <div className="skill-tree">
        {sortedBands.map((band) => {
          const meta = BAND_META[band] || {
            label: `Band ${band}`,
            color: "#999",
            emoji: "📘",
          };
          const unlocked = isBandUnlocked(band);
          const bandLessons = groups[band];
          const bandComplete = bandLessons.every(
            (l) => progress[l.id]?.completed
          );

          return (
            <div key={band} className="band-section">
              <div
                className={`band-header ${unlocked ? "unlocked" : "locked"}`}
                style={{ borderColor: meta.color }}
              >
                <span className="band-emoji">{meta.emoji}</span>
                <span className="band-label">{meta.label}</span>
                {bandComplete && <span className="crown">👑</span>}
                {!unlocked && <span className="lock-icon">🔒</span>}
              </div>

              <div className="lesson-path">
                {bandLessons.map((lesson, idx) => {
                  const lessonUnlocked = isLessonUnlocked(lesson, band);
                  const completed = progress[lesson.id]?.completed;
                  const isLeft = idx % 2 === 0;

                  return (
                    <div
                      key={lesson.id}
                      className={`node-row ${isLeft ? "left" : "right"}`}
                    >
                      {idx > 0 && (
                        <div
                          className={`connector ${
                            progress[bandLessons[idx - 1].id]?.completed
                              ? "done"
                              : ""
                          }`}
                          style={{ borderColor: meta.color }}
                        />
                      )}
                      <button
                        className={`lesson-node ${
                          completed
                            ? "completed"
                            : lessonUnlocked
                            ? "unlocked"
                            : "locked"
                        }`}
                        style={{
                          backgroundColor: completed
                            ? meta.color
                            : lessonUnlocked
                            ? "#fff"
                            : "#e0e0e0",
                          borderColor: meta.color,
                        }}
                        onClick={() => handleLessonClick(lesson, band)}
                        title={lesson.label}
                      >
                        <span className="node-icon">
                          {completed ? "✅" : lessonUnlocked ? "📖" : "🔒"}
                        </span>
                        <span className="node-label">
                          {lesson.label.split("--").pop().trim()}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

