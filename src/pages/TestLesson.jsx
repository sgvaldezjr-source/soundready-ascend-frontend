import LessonViewer from '../components/LessonViewer/LessonViewer';

export default function TestLesson() {
  return (
    <LessonViewer
      lessonId="vocab_band5_001"
      supabaseUrl={import.meta.env.REACT_APP_SUPABASE_URL}
      supabaseKey={import.meta.env.REACT_APP_SUPABASE_KEY}
    />
  );
}
