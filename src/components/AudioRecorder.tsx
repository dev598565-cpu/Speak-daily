import React, { useState } from 'react';
import { 
  Mic, Square, Pause, Play, RotateCcw, Sparkles, 
  Volume2, Edit3, Check, AlertCircle 
} from 'lucide-react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { AudioVisualizer } from './AudioVisualizer';
import { Topic } from '../types';

interface AudioRecorderProps {
  topic: Topic;
  onSubmitForEvaluation: (transcript: string, durationSeconds: number, audioBlob: Blob | null) => Promise<void>;
  isEvaluating: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  topic,
  onSubmitForEvaluation,
  isEvaluating,
}) => {
  const {
    state,
    duration,
    audioBlob,
    audioUrl,
    transcript,
    setTranscript,
    isSpeechRecognitionSupported,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    analyserNode,
    error,
  } = useAudioRecorder();

  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [editableText, setEditableText] = useState('');

  // Format seconds into MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const handleStartEdit = () => {
    setEditableText(transcript);
    setIsEditingTranscript(true);
  };

  const handleSaveEdit = () => {
    setTranscript(editableText);
    setIsEditingTranscript(false);
  };

  const handleEvaluate = async () => {
    const textToEvaluate = transcript.trim() || editableText.trim();
    if (!textToEvaluate) return;
    await onSubmitForEvaluation(textToEvaluate, Math.max(duration, 5), audioBlob);
  };

  const hasContent = Boolean(transcript.trim() || editableText.trim());

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-6">
      {/* Title & Status */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Mic className="w-5 h-5 text-brand-600" />
            <span>Speaking Studio</span>
          </h3>
          <p className="text-xs text-slate-500">
            Speak naturally for 1 to 2 minutes on the daily topic.
          </p>
        </div>

        {/* Live Timer */}
        <div className="flex items-center gap-2">
          {state === 'recording' && (
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          )}
          <span
            className={`font-mono text-base font-bold px-3 py-1 rounded-lg border ${
              state === 'recording'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Permission or Device Error Alert */}
      {error && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <p className="font-semibold">{error}</p>
            <p className="mt-0.5 text-amber-700">
              You can also type your spoken response manually into the transcript box below to receive instant AI evaluation!
            </p>
          </div>
        </div>
      )}

      {/* Real-time Audio Waveform Visualizer */}
      <AudioVisualizer analyserNode={analyserNode} isRecording={state === 'recording'} />

      {/* Recording Control Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {state === 'idle' && (
          <button
            onClick={startRecording}
            className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-600/30 transition-all hover:scale-105 active:scale-95"
          >
            <Mic className="w-5 h-5" />
            <span>Start Speaking</span>
          </button>
        )}

        {state === 'recording' && (
          <>
            <button
              onClick={pauseRecording}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-all"
            >
              <Pause className="w-4 h-4" />
              <span>Pause</span>
            </button>
            <button
              onClick={stopRecording}
              className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>Finish Recording</span>
            </button>
          </>
        )}

        {state === 'paused' && (
          <>
            <button
              onClick={resumeRecording}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Resume</span>
            </button>
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-all"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>Finish</span>
            </button>
          </>
        )}

        {state === 'recorded' && (
          <button
            onClick={resetRecording}
            disabled={isEvaluating}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs border border-slate-200 transition-all disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Record Again</span>
          </button>
        )}
      </div>

      {/* Playback bar when recorded */}
      {audioUrl && (
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Volume2 className="w-4 h-4 text-brand-600" />
            <span>Listen to Your Recording:</span>
          </div>
          <audio src={audioUrl} controls className="w-full sm:w-72 h-8" />
        </div>
      )}

      {/* Speech-to-Text Transcript Area */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Speech Transcript
            </span>
            {isSpeechRecognitionSupported ? (
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Live Speech-to-Text Active
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Type or Edit Transcript
              </span>
            )}
          </div>

          {state !== 'recording' && !isEditingTranscript && (
            <button
              onClick={handleStartEdit}
              className="flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit / Add Text</span>
            </button>
          )}
        </div>

        {isEditingTranscript ? (
          <div className="space-y-2">
            <textarea
              rows={4}
              value={editableText}
              onChange={(e) => setEditableText(e.target.value)}
              placeholder="Type or edit your spoken practice text here..."
              className="w-full p-3 text-xs sm:text-sm rounded-xl border border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditingTranscript(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg"
              >
                <Check className="w-3 h-3" />
                <span>Save Transcript</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="min-h-[70px] p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed italic">
            {transcript ? (
              `"${transcript}"`
            ) : (
              <span className="text-slate-400 not-italic">
                {state === 'recording'
                  ? 'Listening to your speech... Start speaking aloud now!'
                  : 'Your spoken words will appear here in real-time as you speak. You can also click "Edit / Add Text" to type your response.'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Submission Button */}
      {(state === 'recorded' || hasContent) && state !== 'recording' && (
        <div className="pt-2">
          <button
            onClick={handleEvaluate}
            disabled={isEvaluating || !hasContent}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-700 hover:from-brand-700 hover:to-indigo-800 text-white font-bold text-sm shadow-md shadow-brand-600/30 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
          >
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            <span>
              {isEvaluating ? 'Analyzing Speech with AI...' : 'Analyze & Get Instant AI Feedback'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
