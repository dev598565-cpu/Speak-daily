import React from 'react';
import { Calendar, Shuffle, Sparkles, BookOpen, HelpCircle } from 'lucide-react';
import { Topic } from '../types';

interface TopicCardProps {
  topic: Topic;
  onNextTopic: () => void;
  isRecording: boolean;
}

export const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  onNextTopic,
  isRecording,
}) => {
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Beginner':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Intermediate':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Advanced':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow p-6 relative overflow-hidden">
      {/* Decorative top gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-indigo-500 to-violet-500" />

      {/* Header Tags */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          {topic.is_daily && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-bold uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              Daily Topic
            </span>
          )}
          <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
            {topic.category}
          </span>
          <span
            className={`px-2.5 py-1 rounded-md border text-xs font-semibold ${getDifficultyColor(
              topic.difficulty
            )}`}
          >
            {topic.difficulty}
          </span>
        </div>

        <button
          onClick={onNextTopic}
          disabled={isRecording}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-brand-600 bg-slate-50 hover:bg-brand-50 px-3 py-1.5 rounded-lg border border-slate-200/80 hover:border-brand-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          title="Switch to another speaking prompt"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Shuffle Topic</span>
        </button>
      </div>

      {/* Main Title & Prompt */}
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug mb-2">
        {topic.title}
      </h2>
      <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
        {topic.prompt}
      </p>

      {/* Grid: Talking Points & Vocabulary Booster */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
        {/* Talking Points */}
        <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
            <HelpCircle className="w-4 h-4 text-brand-600" />
            <span>Talking Points to Cover</span>
          </div>
          <ul className="space-y-1.5">
            {topic.talking_points.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Vocabulary Booster */}
        <div className="bg-gradient-to-br from-brand-50/40 via-indigo-50/20 to-white rounded-xl p-4 border border-brand-100/70">
          <div className="flex items-center gap-1.5 text-xs font-bold text-brand-900 uppercase tracking-wider mb-2.5">
            <BookOpen className="w-4 h-4 text-brand-600" />
            <span>Try Using These Words</span>
          </div>
          <div className="space-y-2">
            {topic.vocabulary.map((vocab, idx) => (
              <div key={idx} className="text-xs">
                <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200/80 mr-2 shadow-2xs">
                  {vocab.word}
                </span>
                <span className="text-slate-500">{vocab.meaning}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
