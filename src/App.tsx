import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { DEFAULT_TOPICS } from './lib/defaultTopics';
import { evaluateSpeech } from './lib/aiFeedback';
import { Topic, PracticeSession, AIFeedback, UserProfile } from './types';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { TopicCard } from './components/TopicCard';
import { AudioRecorder } from './components/AudioRecorder';
import { FeedbackDisplay } from './components/FeedbackDisplay';
import { PracticeHistory } from './components/PracticeHistory';
import { Sparkles, Trophy, CheckCircle, Database } from 'lucide-react';

export const App: React.FC = () => {
  // App state
  const [topics, setTopics] = useState<Topic[]>(DEFAULT_TOPICS);
  const [currentTopicIndex, setCurrentTopicIndex] = useState<number>(0);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isDemoUser, setIsDemoUser] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Practice & Evaluation state
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [currentFeedback, setCurrentFeedback] = useState<AIFeedback | null>(null);
  const [sessions, setSessions] = useState<PracticeSession[]>([]);

  const currentTopic = topics[currentTopicIndex] || DEFAULT_TOPICS[0];

  // 1. Initialize Supabase Auth & Topics
  useEffect(() => {
    // Load local sessions from storage if present
    const cachedSessions = localStorage.getItem('speakdaily_sessions');
    if (cachedSessions) {
      try {
        setSessions(JSON.parse(cachedSessions));
      } catch (e) {
        console.warn('Could not parse local sessions');
      }
    }

    if (!isSupabaseConfigured) {
      // Default to guest demo for effortless recruiter exploration
      return;
    }

    // Fetch topics from Supabase
    const fetchTopics = async () => {
      try {
        const { data, error } = await supabase
          .from('topics')
          .select('*')
          .order('is_daily', { ascending: false });

        if (!error && data && data.length > 0) {
          setTopics(data);
        }
      } catch (err) {
        console.warn('Failed to load topics from Supabase, using defaults:', err);
      }
    };

    fetchTopics();

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user);
      } else if (!isDemoUser) {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch or construct user profile
  const loadUserProfile = async (authUser: any) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (data) {
        setUser(data);
      } else {
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
          streak_count: 1,
          total_minutes_spoken: 0,
        });
      }

      // Load user sessions from Supabase
      loadUserSessions(authUser.id);
    } catch (e) {
      console.warn('Failed to load profile:', e);
    }
  };

  const loadUserSessions = async (userId: string) => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('practice_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSessions(data);
      }
    } catch (e) {
      console.warn('Failed to load user sessions:', e);
    }
  };

  // Switch to next topic
  const handleNextTopic = () => {
    setCurrentTopicIndex((prev) => (prev + 1) % topics.length);
    setCurrentFeedback(null);
  };

  // Evaluate speech
  const handleEvaluate = async (
    transcript: string,
    durationSeconds: number,
    audioBlob: Blob | null
  ) => {
    setIsEvaluating(true);
    try {
      const feedback = await evaluateSpeech(transcript, durationSeconds, currentTopic);
      setCurrentFeedback(feedback);

      // Trigger Confetti Celebration if high score!
      if (feedback.overall_score >= 70) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
        });
      }

      // Create new session object
      const newSession: PracticeSession = {
        id: 'sess_' + Date.now(),
        user_id: user?.id || 'guest_user',
        topic_id: currentTopic.id,
        topic_title: currentTopic.title,
        transcript,
        audio_url: audioBlob ? URL.createObjectURL(audioBlob) : undefined,
        duration_seconds: durationSeconds,
        overall_score: feedback.overall_score,
        fluency_score: feedback.fluency_score,
        grammar_score: feedback.grammar_score,
        vocabulary_score: feedback.vocabulary_score,
        pronunciation_score: feedback.pronunciation_score,
        wpm: feedback.wpm,
        filler_words_count: feedback.filler_words_count,
        feedback,
        created_at: new Date().toISOString(),
      };

      const updatedSessions = [newSession, ...sessions];
      setSessions(updatedSessions);
      localStorage.setItem('speakdaily_sessions', JSON.stringify(updatedSessions));

      // If user is authenticated with Supabase, save remotely
      if (isSupabaseConfigured && user && !isDemoUser) {
        await supabase.from('practice_sessions').insert({
          user_id: user.id,
          topic_id: currentTopic.id.startsWith('topic-') ? null : currentTopic.id,
          topic_title: currentTopic.title,
          transcript,
          duration_seconds: durationSeconds,
          overall_score: feedback.overall_score,
          fluency_score: feedback.fluency_score,
          grammar_score: feedback.grammar_score,
          vocabulary_score: feedback.vocabulary_score,
          pronunciation_score: feedback.pronunciation_score,
          wpm: feedback.wpm,
          filler_words_count: feedback.filler_words_count,
          feedback,
        });

        // Update streak & spoken minutes in profiles table
        await supabase
          .from('profiles')
          .update({
            streak_count: (user.streak_count || 0) + 1,
            total_minutes_spoken: Number(
              ((user.total_minutes_spoken || 0) + durationSeconds / 60).toFixed(2)
            ),
            last_practice_date: new Date().toISOString().split('T')[0],
          })
          .eq('id', user.id);
      }
    } catch (err) {
      console.error('Speech evaluation failed:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleAuthSuccess = (authUser: UserProfile, isDemo: boolean) => {
    setUser(authUser);
    setIsDemoUser(isDemo);
  };

  const handleSignOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setIsDemoUser(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Navigation Bar */}
      <Navbar
        user={user}
        isDemo={isDemoUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
        onToggleHistory={() => setShowHistory((prev) => !prev)}
        showHistory={showHistory}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Supabase Integration Banner (Helpful for Recruiter / Developer) */}
        {!isSupabaseConfigured && !isDemoUser && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-brand-600 text-white shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-800">
                  Ready for Supabase Connection
                </p>
                <p className="text-slate-600">
                  Database schema is prepared in <code className="bg-white px-1.5 py-0.5 rounded border border-brand-200 font-mono text-brand-700">db/schema.sql</code>. Connect your credentials in <code className="bg-white px-1.5 py-0.5 rounded border border-brand-200 font-mono text-brand-700">.env</code> or test with Instant Demo.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-brand-600 text-white font-semibold text-xs whitespace-nowrap hover:bg-brand-700 transition-colors shadow-xs"
            >
              Sign In / Demo
            </button>
          </div>
        )}

        {/* View Toggle: Practice Studio vs Past History */}
        {showHistory ? (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Your Practice History</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 underline"
              >
                Back to Speaking Practice
              </button>
            </div>
            <PracticeHistory sessions={sessions} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Daily Speaking Prompt Card */}
            <TopicCard
              topic={currentTopic}
              onNextTopic={handleNextTopic}
              isRecording={false}
            />

            {/* Speaking Studio (Microphone, Recording, Realtime STT) */}
            <AudioRecorder
              topic={currentTopic}
              onSubmitForEvaluation={handleEvaluate}
              isEvaluating={isEvaluating}
            />

            {/* Instant AI Feedback Card */}
            {currentFeedback && (
              <FeedbackDisplay
                feedback={currentFeedback}
                onPracticeAgain={() => {
                  setCurrentFeedback(null);
                  handleNextTopic();
                }}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 font-medium">
            <span>SpeakDaily &copy; 2026</span>
            <span>&bull;</span>
            <span>AI English Speaking Practice Platform</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <span>Powered by Supabase &amp; Web Speech API</span>
          </div>
        </div>
      </footer>

      {/* Supabase Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};
