import React, { useState } from 'react';
import { 
  Award, TrendingUp, CheckCircle, AlertTriangle, 
  Volume2, Sparkles, BookOpen, Clock, Zap, ArrowRight 
} from 'lucide-react';
import { AIFeedback } from '../types';

interface FeedbackDisplayProps {
  feedback: AIFeedback;
  onPracticeAgain: () => void;
}

export const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({
  feedback,
  onPracticeAgain,
}) => {
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);

  // Play Polished Native Version using Web Speech Synthesis
  const handlePlayTTS = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(feedback.polished_version);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;

    // Try finding a natural English voice
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))
    );
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => setIsPlayingTTS(true);
    utterance.onend = () => setIsPlayingTTS(false);
    utterance.onerror = () => setIsPlayingTTS(false);

    window.speechSynthesis.speak(utterance);
  };

  const getScoreBadge = (score: number) => {
    if (score >= 85) return { text: 'Advanced (C1-C2)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (score >= 70) return { text: 'Proficient (B2)', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    if (score >= 55) return { text: 'Intermediate (B1)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { text: 'Developing (A2)', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  const overallBadge = getScoreBadge(feedback.overall_score);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-8 animate-fade-in">
      {/* Top Header: Score Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Evaluation Completed
            </span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${overallBadge.color}`}>
              {overallBadge.text}
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            AI Speaking Performance
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
            {feedback.summary}
          </p>
        </div>

        {/* Big Overall Score Circle */}
        <div className="flex items-center gap-4 bg-gradient-to-br from-brand-50 to-indigo-50/50 p-4 rounded-2xl border border-brand-200/70 shadow-sm shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex flex-col items-center justify-center shadow-md shadow-brand-500/25">
            <span className="text-2xl font-black leading-none">{feedback.overall_score}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 mt-0.5">/ 100</span>
          </div>
          <div className="pr-2">
            <div className="text-xs font-bold text-slate-900">Overall Score</div>
            <div className="text-[11px] text-slate-500">Based on 4 Core Pillars</div>
          </div>
        </div>
      </div>

      {/* 4 Core Pillars Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">Fluency & Pace</span>
            <Zap className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-slate-900">{feedback.fluency_score}%</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{feedback.wpm} Words/Min</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">Grammar</span>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-slate-900">{feedback.grammar_score}%</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {feedback.grammar_corrections.length === 0 ? (
              <span className="text-emerald-600 font-medium">Flawless syntax</span>
            ) : (
              <span className="text-amber-600 font-medium">{feedback.grammar_corrections.length} item(s) to fix</span>
            )}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">Vocabulary</span>
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-slate-900">{feedback.vocabulary_score}%</div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span className="text-slate-600 font-medium">Lexical Variety</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">Pronunciation</span>
            <Award className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="text-xl font-bold text-slate-900">{feedback.pronunciation_score}%</div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span className="text-slate-600 font-medium">Estimated Clarity</span>
          </div>
        </div>
      </div>

      {/* Filler Words Metric */}
      <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">Filler Words Detected:</span>
          <span className={`px-2 py-0.5 rounded-full font-bold ${
            feedback.filler_words_count > 3 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
          }`}>
            {feedback.filler_words_count} {feedback.filler_words_count === 1 ? 'word' : 'words'}
          </span>
        </div>
        {feedback.filler_words_detected.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-500">Occurrences:</span>
            {feedback.filler_words_detected.map((filler, idx) => (
              <span key={idx} className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-rose-600 font-semibold text-[11px]">
                "{filler}"
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Grammar Corrections */}
      {feedback.grammar_corrections.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Grammar Corrections</span>
          </h4>
          <div className="space-y-2.5">
            {feedback.grammar_corrections.map((corr, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/70 text-xs space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="line-through text-rose-600 font-medium bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {corr.original}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {corr.correction}
                  </span>
                </div>
                <p className="text-slate-600">{corr.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200/60">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-2.5 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Key Strengths</span>
          </h4>
          <ul className="space-y-1.5">
            {feedback.strengths.map((str, idx) => (
              <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div className="p-4 rounded-xl bg-indigo-50/40 border border-indigo-200/60">
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-2.5 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span>Opportunities for Growth</span>
          </h4>
          <ul className="space-y-1.5">
            {feedback.improvements.map((imp, idx) => (
              <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span>{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Polished Native Version */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-900 via-indigo-950 to-slate-900 text-white shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-200">
              Polished Native Version (C1/C2)
            </span>
          </div>
          <button
            onClick={handlePlayTTS}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isPlayingTTS
                ? 'bg-amber-400 text-slate-900 animate-pulse'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
            }`}
            title="Listen to native model audio"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isPlayingTTS ? 'Playing Audio...' : 'Listen to Native Model'}</span>
          </button>
        </div>

        <p className="text-sm sm:text-base leading-relaxed text-slate-100 italic font-normal">
          "{feedback.polished_version}"
        </p>
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex justify-center">
        <button
          onClick={onPracticeAgain}
          className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-md hover:shadow-lg"
        >
          Practice Another Speaking Topic
        </button>
      </div>
    </div>
  );
};
