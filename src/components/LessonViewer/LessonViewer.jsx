import React, { useState, useEffect } from 'react';
import './LessonViewer.css';

/**
 * LessonViewer Component
 * Displays IELTS lessons with support for vocabulary, grammar, listening, reading, and speaking
 * Integrates with Supabase REST API to fetch lessons
 * Includes gamification features (hearts, XP, crowns)
 */
const LessonViewer = ({ lessonId }) => {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [hearts, setHearts] = useState(5);
  const [xpEarned, setXpEarned] = useState(0);
  const [crowns, setCrowns] = useState(0);
  const [recordingAudio, setRecordingAudio] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  // Fetch lesson from Supabase
  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
     const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/lessons/${lessonId}`);

      if (!response.ok) throw new Error('Failed to fetch lesson');
      const data = await response.json();
      
      setLesson(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: answer
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < lesson.lesson_data.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      checkAnswers();
    }
  };

  const checkAnswers = () => {
    let correct = 0;
    lesson.lesson_data.questions.forEach((q, index) => {
      if (answers[index] === q.correct_answer) {
        correct++;
      }
    });

    const percentage = (correct / lesson.lesson_data.questions.length) * 100;
    const passed = percentage >= lesson.pass_threshold_percent;

    setXpEarned(passed ? lesson.xp_reward : Math.floor(lesson.xp_reward * 0.5));
    if (passed) {
      setCrowns(1);
      setHearts(Math.min(5, hearts + 1));
    } else {
      setHearts(Math.max(0, hearts - 1));
    }
    setShowResults(true);
  };

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordingAudio(blob);
        setAnswers({
          ...answers,
          [currentQuestionIndex]: blob
        });
      };

      recorder.start();
      setMediaRecorder(recorder);
    } catch (err) {
      setError('Microphone access denied');
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  if (loading) return <div className="lesson-loader">Loading lesson...</div>;
  if (error) return <div className="lesson-error">Error: {error}</div>;
  if (!lesson) return <div className="lesson-error">No lesson found</div>;

  const currentQuestion = lesson.lesson_data.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / lesson.lesson_data.questions.length) * 100;

  return (
    <div className="lesson-viewer">
      {/* Header */}
      <header className="lesson-header">
        <div className="lesson-info">
          <span className={`badge badge-${lesson.lesson_type}`}>{lesson.lesson_type}</span>
          <h1 className="lesson-title">{lesson.title}</h1>
          <p className="lesson-band">IELTS Band {lesson.difficulty_band}</p>
        </div>
        
        <div className="lesson-stats">
          <div className="stat">
            <span className="stat-label">Hearts</span>
            <span className="stat-value hearts">{'❤️'.repeat(hearts)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">XP</span>
            <span className="stat-value xp">+{xpEarned}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Crowns</span>
            <span className="stat-value crowns">👑 {crowns}</span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="progress-text">{currentQuestionIndex + 1} of {lesson.lesson_data.questions.length}</p>
      </div>

      {/* Question Container */}
      {!showResults ? (
        <main className="lesson-content">
          <section className="question-section">
            <h2 className="question-text">{currentQuestion.question_text}</h2>

            {/* Vocabulary Question */}
            {lesson.lesson_type === 'vocabulary' && (
              <div className="question-body">
                <div className="vocabulary-options">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option.id}
                      className={`option-button ${
                        answers[currentQuestionIndex] === option.id ? 'selected' : ''
                      }`}
                      onClick={() => handleAnswer(option.id)}
                    >
                      <span className="option-id">{option.id}</span>
                      <span className="option-text">{option.text}</span>
                    </button>
                  ))}
                </div>
                {currentQuestion.vocabulary_focus && (
                  <div className="vocabulary-focus">
                    <h3>{currentQuestion.vocabulary_focus.word}</h3>
                    <p className="pronunciation">{currentQuestion.vocabulary_focus.pronunciation}</p>
                    <p className="definition">{currentQuestion.vocabulary_focus.definition}</p>
                    <p className="band-level">Band {currentQuestion.vocabulary_focus.band_level}</p>
                  </div>
                )}
              </div>
            )}

            {/* Grammar Question */}
            {lesson.lesson_type === 'grammar' && (
              <div className="question-body">
                <div className="grammar-options">
                  {currentQuestion.blank_options.map((option, index) => (
                    <button
                      key={index}
                      className={`option-button ${
                        answers[currentQuestionIndex] === option ? 'selected' : ''
                      }`}
                      onClick={() => handleAnswer(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <div className="pattern-info">
                  <p className="pattern">{currentQuestion.pattern}</p>
                  <p className="explanation">{currentQuestion.explanation}</p>
                </div>
              </div>
            )}

            {/* Listening Question */}
            {lesson.lesson_type === 'listening' && (
              <div className="question-body">
                {lesson.lesson_data.audio_clips && (
                  <audio controls className="audio-player">
                    <source src={lesson.lesson_data.audio_clips[0]?.audio_url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                )}
                <div className="listening-options">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option.id}
                      className={`option-button ${
                        answers[currentQuestionIndex] === option.id ? 'selected' : ''
                      }`}
                      onClick={() => handleAnswer(option.id)}
                    >
                      <span className="option-id">{option.id}</span>
                      <span className="option-text">{option.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reading Question */}
            {lesson.lesson_type === 'reading' && (
              <div className="question-body">
                <div className="passage-box">
                  <p className="passage-text">{lesson.lesson_data.passage?.text}</p>
                </div>
                <div className="reading-options">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option.id}
                      className={`option-button ${
                        answers[currentQuestionIndex] === option.id ? 'selected' : ''
                      }`}
                      onClick={() => handleAnswer(option.id)}
                    >
                      <span className="option-id">{option.id}</span>
                      <span className="option-text">{option.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Speaking Question */}
            {lesson.lesson_type === 'speaking' && (
              <div className="question-body speaking-section">
                <div className="speaking-prompt">
                  <p className="prompt-text">{currentQuestion.instructions}</p>
                  <p className="time-limit">Time: {currentQuestion.time_limit_sec} seconds</p>
                </div>
                
                <div className="recording-controls">
                  {!recordingAudio ? (
                    <button className="btn-record" onClick={startAudioRecording}>
                      🎤 Start Recording
                    </button>
                  ) : (
                    <>
                      <button className="btn-stop" onClick={stopAudioRecording}>
                        ⏹️ Stop Recording
                      </button>
                      <p className="recording-confirmed">✓ Recording saved</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Navigation */}
          <footer className="lesson-footer">
            <button
              className="btn-secondary"
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
            >
              ← Previous
            </button>
            <button
              className="btn-primary"
              onClick={handleNextQuestion}
              disabled={answers[currentQuestionIndex] === undefined}
            >
              {currentQuestionIndex === lesson.lesson_data.questions.length - 1
                ? 'Submit'
                : 'Next →'}
            </button>
          </footer>
        </main>
      ) : (
        /* Results Screen */
        <main className="lesson-results">
          <div className="results-card">
            <h2>Lesson Complete!</h2>
            <div className="results-summary">
              <div className="result-item">
                <span className="result-label">XP Earned</span>
                <span className="result-value">+{xpEarned}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Crowns</span>
                <span className="result-value">👑 {crowns}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Hearts Remaining</span>
                <span className="result-value">{'❤️'.repeat(hearts)}</span>
              </div>
            </div>
            <button className="btn-primary" onClick={() => window.location.reload()}>
              Try Another Lesson
            </button>
          </div>
        </main>
      )}
    </div>
  );
};

export default LessonViewer;
