'use client';

import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Award, RotateCcw, ChevronRight } from 'lucide-react';
import { QUIZ_QUESTIONS } from '../data/rivalriesData';


export default function QuizCard() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const currentQ = QUIZ_QUESTIONS[currentIdx];

  const handleSelect = (idx) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    if (idx === currentQ.correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setScore(0);
    setQuizCompleted(false);
  };

  return (
    <section className="mb-14">
      <div className="flex items-center space-x-2.5 mb-6">
        <div className="w-2.5 h-7 bg-csk-yellow rounded-full flex-shrink-0"></div>
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold uppercase font-heading tracking-tight text-slate-900 dark:text-white flex items-center">
            CSK Fan IQ Quiz &bull; Trivia Challenge
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Test how well you know the history, records, and thrilling moments of Chennai Super Kings
          </p>
        </div>
      </div>

      <div className="sports-card rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-csk-borderNavy max-w-3xl mx-auto">
        {!quizCompleted ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-csk-yellow px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                Question {currentIdx + 1} of {QUIZ_QUESTIONS.length}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Score: {score}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-display mb-5">
              {currentQ.question}
            </h3>

            <div className="space-y-2.5 mb-6">
              {currentQ.options.map((opt, i) => {
                const isChosen = selectedOption === i;
                const isCorrect = i === currentQ.correctIndex;
                let btnStyle = 'border-slate-200 dark:border-white/10 hover:border-csk-yellow bg-slate-50 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200';

                if (selectedOption !== null) {
                  if (isCorrect) {
                    btnStyle = 'border-green-500 bg-green-500/15 text-green-700 dark:text-green-300 font-bold';
                  } else if (isChosen) {
                    btnStyle = 'border-red-500 bg-red-500/15 text-red-700 dark:text-red-300 font-bold';
                  } else {
                    btnStyle = 'opacity-50 border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/40 text-slate-400';
                  }
                }

                return (
                  <button
                    key={i}
                    disabled={selectedOption !== null}
                    onClick={() => handleSelect(i)}
                    className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between text-xs sm:text-sm ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {selectedOption !== null && isCorrect && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {selectedOption !== null && isChosen && !isCorrect && <XCircle className="w-4 h-4 text-red-500" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation box after choice */}
            {selectedOption !== null && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-slate-700 dark:text-slate-200 mb-5">
                <span className="font-bold text-amber-700 dark:text-csk-yellow block mb-0.5">Insight:</span>
                {currentQ.explanation}
              </div>
            )}

            {selectedOption !== null && (
              <div className="flex justify-end">
                <button
                  onClick={handleNext}
                  className="px-5 py-2 rounded-xl bg-csk-yellow hover:bg-amber-400 text-csk-darkNavy font-black text-xs uppercase tracking-wider transition shadow-csk-glow flex items-center"
                >
                  {currentIdx < QUIZ_QUESTIONS.length - 1 ? 'Next Question' : 'View Final Score'} <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-csk-yellow to-amber-500 flex items-center justify-center text-csk-darkNavy shadow-csk-glow">
              <Award className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-slate-900 dark:text-white font-display mb-1">
              {score === QUIZ_QUESTIONS.length ? 'True Whistle Podu Superfan!' : 'Good Effort, Yellow Army!'}
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
              You scored <strong className="text-amber-600 dark:text-csk-yellow text-lg">{score}</strong> out of {QUIZ_QUESTIONS.length} on the CSK Fan IQ test.
            </p>

            <button
              onClick={handleRestart}
              className="px-6 py-2.5 rounded-xl bg-csk-yellow hover:bg-amber-400 text-csk-darkNavy font-black text-xs uppercase tracking-wider transition shadow-csk-glow inline-flex items-center"
            >
              <RotateCcw className="w-4 h-4 mr-1.5" /> Retake Trivia Quiz
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
