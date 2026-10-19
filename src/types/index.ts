export interface VocabularyItem {
  word: string;
  meaning: string;
}

export interface Topic {
  id: string;
  title: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  prompt: string;
  talking_points: string[];
  vocabulary: VocabularyItem[];
  is_daily?: boolean;
}

export interface GrammarCorrection {
  original: string;
  correction: string;
  explanation: string;
}

export interface AIFeedback {
  overall_score: number;
  fluency_score: number;
  grammar_score: number;
  vocabulary_score: number;
  pronunciation_score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  grammar_corrections: GrammarCorrection[];
  vocabulary_suggestions: Array<{
    word_used: string;
    better_alternative: string;
    context: string;
  }>;
  polished_version: string;
  wpm: number;
  filler_words_count: number;
  filler_words_detected: string[];
}

export interface PracticeSession {
  id: string;
  user_id: string;
  topic_id?: string;
  topic_title: string;
  transcript: string;
  audio_url?: string;
  duration_seconds: number;
  overall_score: number;
  fluency_score: number;
  grammar_score: number;
  vocabulary_score: number;
  pronunciation_score: number;
  wpm: number;
  filler_words_count: number;
  feedback: AIFeedback;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  streak_count: number;
  total_minutes_spoken: number;
  last_practice_date?: string;
}
