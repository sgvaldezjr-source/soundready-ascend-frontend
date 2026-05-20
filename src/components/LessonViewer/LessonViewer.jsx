import React, { useState, useEffect } from 'react';
import './LessonViewer.css';

const LessonViewer = ({ lessonId, onComplete, onBack }) => {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [hearts, setHearts] = useState(5);
  const [correctCount, setCorrectCount] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [crowns, setCrowns] = useState(0);
  const [recordingAudio, setRecordingAudio] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://web-production-e43ad.up.railway.app/api/lessons/${lessonId}`);
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
    setAnswers({ ...answers, [currentQuestionIndex]: answer });
    setSelectedAnswer(answer);
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setSelectedAnswer(null);
    if (currentQuestionIndex < lesson.lesson_data.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      checkAnswers();
    }
  };

  const checkAnswers = () => {
    let correct = 0;
    lesson.lesson_data.questions.forEach((q, index) => {
      if (answers[index] === q.correct_answer) correct++;
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
        setAnswers({ ...answers, [currentQuestionIndex]: blob });
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
  const isCorrect = selectedAnswer === currentQuestion?.correct_answer;
  if (isCorrect) setCorrectCount(prev => prev + 1);

  const progress = ((currentQuestionIndex + 1) / lesson.lesson_data.questions.length) * 100;

  const FeedbackPopup = () => {
    const q = lesson?.lesson_data?.questions[currentQuestionIndex];
    const correct = selectedAnswer === q?.correct_answer;
    return (
      <div className="feedback-overlay">
        <div className={`feedback-popup ${correct ? 'correct' : 'incorrect'}`}>
          <div className="feedback-header">
            <span className="feedback-icon">{correct ? '✓' : '✗'}</span>
            <span className="feedback-title">{correct ? 'Correct!' : 'Not quite'}</span>
          </div>
          {lesson.lesson_type === 'vocabulary' && q?.vocabulary_focus && (
            <div className="feedback-vocab">
              <h3>{q.vocabulary_focus.word}</h3>
              <p className="pronunciation">{q.vocabulary_focus.pronunciation}</p>
              <p className="definition">{q.vocabulary_focus.definition}</p>
              <p className="band-level">Band {q.vocabulary_focus.band_level}</p>
            </div>
          )}
          {lesson.lesson_type === 'vocabulary' && q?.explanation && (
            <div className="feedback-explanation">
              <p>{q.explanation}</p>
            </div>
          )}
          {lesson.lesson_type === 'grammar' && q?.explanation && (
            <div className="feedback-explanation">
              <p><strong>Pattern:</strong> {q.pattern}</p>
              <p>{q.explanation}</p>
            </div>
          )}
          {(lesson.lesson_type === 'listening' || lesson.lesson_type === 'reading') && !correct && (
            <div className="feedback-explanation">
              <p><strong>Correct answer:</strong> {q?.correct_answer}</p>
            </div>
          )}
          <button className="btn-primary feedback-continue" onClick={handleNextQuestion}>
            Continue
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="lesson-viewer">
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

      <div className="progress-container">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="progress-text">{currentQuestionIndex + 1} of {lesson.lesson_data.questions.length}</p>
      </div>

      {showFeedback && <FeedbackPopup />}

      {!showResults ? (
        <main className="lesson-content">
          <section className="question-section">
            <h2 className="question-text">{currentQuestion.question_text}</h2>

            {lesson.lesson_type === 'vocabulary' && (
              <div className="question-body">
                <div className="vocabulary-options">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option.id}
                      className={`option-button ${answers[currentQuestionIndex] === option.id ? 'selected' : ''}`}
                      onClick={() => handleAnswer(option.id)}
                    >
                      <span className="option-id">{option.id}</span>
                      <span className="option-text">{option.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {lesson.lesson_type === 'grammar' && (
              <div className="question-body">
                <div className="grammar-options">
                  {currentQuestion.blank_options.map((option, index) => (
                    <button
                      key={index}
                      className={`option-button ${answers[currentQuestionIndex] === option ? 'selected' : ''}`}
                      onClick={() => handleAnswer(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {lesson.lesson_type === 'listening' && (
              <div className="question-body">
                {lesson.lesson_data.audio_clips && (
                  <audio controls className="audio-player">
                    <source src={lesson.lesson_data.audio_clips[0]?.audio_url} type="audio/mpeg" />
                  </audio>
                )}
                <div className="listening-options">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option.id}
                      className={`option-button ${answers[currentQuestionIndex] === option.id ? 'selected' : ''}`}
                      onClick={() => handleAnswer(option.id)}
                    >
                      <span className="option-id">{option.id}</span>
                      <span className="option-text">{option.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {lesson.lesson_type === 'reading' && (
              <div className="question-body">
                <div className="passage-box">
                  <p className="passage-text">{lesson.lesson_data.passage?.text}</p>
                </div>
                <div className="reading-options">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option.id}
                      className={`option-button ${answers[currentQuestionIndex] === option.id ? 'selected' : ''}`}
                      onClick={() => handleAnswer(option.id)}
                    >
                      <span className="option-id">{option.id}</span>
                      <span className="option-text">{option.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

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
              {currentQuestionIndex === lesson.lesson_data.questions.length - 1 ? 'Submit' : 'Next →'}
            </button>
          </footer>
        </main>
      ) : (
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
          <button
  className="btn-primary"
  onClick={() => onComplete(correctCount, lesson.lesson_data.questions.length)}
>

  Next Lesson
</button>
<button className="btn-secondary" onClick={onBack} style={{ marginTop: 8 }}>
  Back to Skill Tree
</button>

          </div>
        </main>
      )}
    </div>
  );
};

export default LessonViewer;



