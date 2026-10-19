import React, { useState } from 'react';
import { 
  History, Calendar, ChevronDown, ChevronUp, Award, 
  Clock, Zap, CheckCircle2, Volume2 
} from 'lucide-react';
import { PracticeSession } from '../types';

interface PracticeHistoryProps {
  sessions: PracticeSession[];
  onSelectTopic?: (topicId: string) => void;
}

export const PracticeHistory: React.FC<PracticeHistoryProps> = ({
  sessions,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
          <History className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">
          No Practice Sessions Recorded Yet
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Complete your first speaking exercise on today's topic to start tracking your fluency score, streak, and history.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-brand-600" />
          <h3 className="text-base font-bold text-slate-900">
            Speaking Practice Log
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-600">
            {sessions.length} Completed
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {sessions.map((sess) => {
          const isExpanded = expandedId === sess.id;
          return (
            <div
              key={sess.id}
              className="border border-slate-200/80 rounded-xl overflow-hidden transition-all hover:border-slate-300 bg-slate-50/50"
            >
              <div
                onClick={() => toggleExpand(sess.id)}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none bg-white hover:bg-slate-50/80 transition-colors"
              >
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-900">
                    {sess.topic_title || 'Spoken Practice Topic'}
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(sess.created_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {sess.duration_seconds}s
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-slate-400" />
                      {sess.wpm} WPM
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">Score:</span>
                    <span className="text-sm font-black px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 border border-brand-200">
                      {sess.overall_score}%
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs space-y-4">
                  {/* Scores Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center">
                      <div className="text-slate-400 text-[10px] font-semibold">Fluency</div>
                      <div className="text-sm font-bold text-slate-800">{sess.fluency_score}%</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center">
                      <div className="text-slate-400 text-[10px] font-semibold">Grammar</div>
                      <div className="text-sm font-bold text-slate-800">{sess.grammar_score}%</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center">
                      <div className="text-slate-400 text-[10px] font-semibold">Vocabulary</div>
                      <div className="text-sm font-bold text-slate-800">{sess.vocabulary_score}%</div>
                    </div>
                  </div>

                  {/* Transcript */}
                  <div>
                    <span className="font-bold text-slate-700 block mb-1">Transcript:</span>
                    <p className="p-3 bg-white rounded-lg border border-slate-200 italic text-slate-700 leading-relaxed">
                      "{sess.transcript}"
                    </p>
                  </div>

                  {/* Polished Model */}
                  {sess.feedback?.polished_version && (
                    <div>
                      <span className="font-bold text-brand-800 block mb-1">
                        AI Polished Model:
                      </span>
                      <p className="p-3 bg-brand-50/60 rounded-lg border border-brand-100 italic text-brand-900 leading-relaxed">
                        "{sess.feedback.polished_version}"
                      </p>
                    </div>
                  )}

                  {/* Audio Playback if available */}
                  {sess.audio_url && (
                    <div className="flex items-center gap-2 pt-1">
                      <Volume2 className="w-4 h-4 text-slate-500" />
                      <audio src={sess.audio_url} controls className="h-8 w-full max-w-sm" />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
