"use client";

import { useState } from "react";
import {
  Award,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  ListOrdered,
  PlayCircle,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QuizContent, QuizQuestion } from "../lib/types";

type QuizViewProps = {
  content: QuizContent;
};

type UserAnswers = Record<number, number>; // questionIndex -> selectedOptionIndex

export function QuizView({ content }: QuizViewProps) {
  const questions: QuizQuestion[] = content.questions || [];
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"step" | "list">("step");
  const [isFinished, setIsFinished] = useState(false);

  const totalQuestions = questions.length;

  if (totalQuestions === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/40 p-12 text-center">
        <Sparkles className="size-8 text-muted-foreground/50" />
        <p className="mt-3 text-[14px] font-medium text-foreground">No quiz questions found</p>
        <p className="mt-1 text-[12px] text-muted-foreground">
          This artifact does not contain any questions yet.
        </p>
      </div>
    );
  }

  // Answer handler
  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    // If already answered, don't allow changing to preserve quiz integrity
    if (userAnswers[questionIdx] !== undefined) return;

    setUserAnswers((prev) => ({
      ...prev,
      [questionIdx]: optionIdx,
    }));
  };

  // Reset/Retake Quiz
  const handleReset = () => {
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setIsFinished(false);
  };

  // Stats calculation
  const answeredCount = Object.keys(userAnswers).length;
  let correctCount = 0;
  Object.entries(userAnswers).forEach(([qIdx, chosenIdx]) => {
    const q = questions[Number(qIdx)];
    if (q && q.correctIndex === chosenIdx) {
      correctCount += 1;
    }
  });
  const incorrectCount = answeredCount - correctCount;
  const scorePercent =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const currentQuestion = questions[currentQuestionIndex];
  const isCurrentAnswered = userAnswers[currentQuestionIndex] !== undefined;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Quiz Header / Scoreboard */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card/80 p-4 backdrop-blur-md shadow-xs">
        {/* Left: Progress info */}
        <div className="flex items-center gap-3">
          <div className="flex size-9.5 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Award className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13.5px] font-semibold text-foreground">
                Quiz Progress
              </span>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                {answeredCount} of {totalQuestions} answered
              </span>
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-1.5 w-36 sm:w-48 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-300"
                style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center/Right: Live Score and Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {answeredCount > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-1.5 text-[12px]">
              <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-3.5" />
                {correctCount}
              </span>
              <span className="text-muted-foreground/40">&middot;</span>
              <span className="flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                <XCircle className="size-3.5" />
                {incorrectCount}
              </span>
              <span className="ml-1 rounded-md bg-background px-1.5 py-0.5 text-[10.5px] font-bold text-foreground shadow-2xs">
                {scorePercent}%
              </span>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8.5 gap-1.5 rounded-lg px-2.5 text-[11.5px] text-muted-foreground hover:text-foreground"
            title="Reset Quiz"
          >
            <RotateCcw className="size-3.5" />
            <span className="hidden sm:inline">Retake</span>
          </Button>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-border/70 bg-muted/40 p-0.5">
            <button
              type="button"
              onClick={() => {
                setViewMode("step");
                setIsFinished(false);
              }}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11.5px] font-medium transition-all ${
                viewMode === "step" && !isFinished
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <PlayCircle className="size-3.5" />
              <span>Step-by-step</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode("list");
                setIsFinished(false);
              }}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11.5px] font-medium transition-all ${
                viewMode === "list"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ListOrdered className="size-3.5" />
              <span>All Questions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Quiz Area: Step Mode or List Mode */}
      {viewMode === "step" && !isFinished ? (
        /* STEP-BY-STEP INTERACTIVE MODE */
        <div className="mx-auto flex w-full max-w-[700px] flex-col gap-5">
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm transition-all">
            {/* Question Counter & Meta */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold tracking-wider uppercase text-primary">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>

              {isCurrentAnswered && (
                <span
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    userAnswers[currentQuestionIndex] === currentQuestion.correctIndex
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {userAnswers[currentQuestionIndex] === currentQuestion.correctIndex ? (
                    <>
                      <CheckCircle2 className="size-3.5" />
                      Correct
                    </>
                  ) : (
                    <>
                      <XCircle className="size-3.5" />
                      Incorrect
                    </>
                  )}
                </span>
              )}
            </div>

            {/* Question Prompt */}
            <h3 className="mt-5 text-[16px] sm:text-[18px] font-semibold leading-relaxed text-foreground">
              {currentQuestion.question}
            </h3>

            {/* Options List */}
            <div className="mt-6 space-y-3">
              {currentQuestion.options.map((option, optionIdx) => {
                const isSelected = userAnswers[currentQuestionIndex] === optionIdx;
                const isCorrect = optionIdx === currentQuestion.correctIndex;
                const showResults = isCurrentAnswered;

                // Dynamic styling based on answer state
                let optionStyle =
                  "border-border/70 bg-card hover:border-primary/50 hover:bg-muted/40 text-foreground cursor-pointer";
                let badgeStyle = "bg-muted text-muted-foreground border-border/80";

                if (showResults) {
                  if (isSelected && isCorrect) {
                    // Chosen and Correct -> Green
                    optionStyle =
                      "border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 font-medium shadow-2xs";
                    badgeStyle = "bg-emerald-500 text-white border-transparent";
                  } else if (isSelected && !isCorrect) {
                    // Chosen and Wrong -> Red
                    optionStyle =
                      "border-rose-500 bg-rose-500/10 text-rose-800 dark:text-rose-200 font-medium shadow-2xs";
                    badgeStyle = "bg-rose-500 text-white border-transparent";
                  } else if (isCorrect) {
                    // Not chosen, but is the correct answer -> Green reveal
                    optionStyle =
                      "border-emerald-500/60 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300 font-medium";
                    badgeStyle =
                      "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30";
                  } else {
                    // Other unchosen options
                    optionStyle = "border-border/40 opacity-40 text-muted-foreground cursor-not-allowed";
                    badgeStyle = "bg-muted/50 text-muted-foreground/60 border-transparent";
                  }
                }

                return (
                  <button
                    key={optionIdx}
                    type="button"
                    disabled={isCurrentAnswered}
                    onClick={() => handleSelectOption(currentQuestionIndex, optionIdx)}
                    className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all duration-200 ${optionStyle}`}
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Option letter pill (A, B, C, D) */}
                      <span
                        className={`flex size-7 shrink-0 items-center justify-center rounded-xl border text-[11px] font-bold transition-colors ${badgeStyle}`}
                      >
                        {String.fromCharCode(65 + optionIdx)}
                      </span>
                      <span className="text-[13.5px] leading-snug">{option}</span>
                    </div>

                    {/* Result icon indicator */}
                    {showResults && (
                      <div className="shrink-0 pl-2">
                        {isSelected && isCorrect && (
                          <CheckCircle2 className="size-5 text-emerald-500" />
                        )}
                        {isSelected && !isCorrect && (
                          <XCircle className="size-5 text-rose-500" />
                        )}
                        {!isSelected && isCorrect && (
                          <Check className="size-4.5 text-emerald-500" />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation Section below question */}
            {isCurrentAnswered && (
              <div
                className={`mt-6 rounded-2xl border p-4.5 sm:p-5 transition-all animate-in fade-in zoom-in-95 duration-200 ${
                  userAnswers[currentQuestionIndex] === currentQuestion.correctIndex
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-rose-500/30 bg-rose-500/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  {userAnswers[currentQuestionIndex] === currentQuestion.correctIndex ? (
                    <CheckCircle2 className="size-4 text-emerald-500" />
                  ) : (
                    <XCircle className="size-4 text-rose-500" />
                  )}
                  <span
                    className={`text-[12px] font-bold uppercase tracking-wider ${
                      userAnswers[currentQuestionIndex] === currentQuestion.correctIndex
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {userAnswers[currentQuestionIndex] === currentQuestion.correctIndex
                      ? "Correct!"
                      : "Incorrect"}
                  </span>
                </div>

                {currentQuestion.explanation ? (
                  <p className="mt-2 text-[13px] leading-relaxed text-foreground/85">
                    {currentQuestion.explanation}
                  </p>
                ) : (
                  <p className="mt-2 text-[12.5px] text-muted-foreground">
                    The correct answer is{" "}
                    <span className="font-semibold text-foreground">
                      {currentQuestion.options[currentQuestion.correctIndex]}
                    </span>
                    .
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between px-1">
            <Button
              variant="outline"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              className="gap-1.5 rounded-xl text-[12.5px]"
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>

            {currentQuestionIndex + 1 < totalQuestions ? (
              <Button
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                className="gap-1.5 rounded-xl text-[12.5px] font-medium"
              >
                Next Question
                <ChevronRight className="size-4" />
              </Button>
            ) : (
              <Button
                onClick={() => setIsFinished(true)}
                className="gap-1.5 rounded-xl bg-primary text-[12.5px] font-semibold text-primary-foreground shadow-sm"
              >
                Finish Quiz
                <Trophy className="size-4" />
              </Button>
            )}
          </div>
        </div>
      ) : isFinished ? (
        /* QUIZ COMPLETION SUMMARY CARD */
        <div className="mx-auto flex w-full max-w-[600px] flex-col items-center justify-center rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-primary/5 p-8 text-center shadow-lg">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
            <Trophy className="size-8" />
          </div>

          <h3 className="mt-4 text-[22px] font-bold text-foreground">Quiz Completed! 🎉</h3>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Here is your final quiz performance score:
          </p>

          <div className="mt-6 flex items-center justify-center gap-6 rounded-2xl border border-border/70 bg-card/90 px-8 py-5 shadow-xs">
            <div>
              <p className="text-[28px] font-extrabold text-foreground">{scorePercent}%</p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Score
              </p>
            </div>
            <div className="h-10 w-px bg-border/80" />
            <div>
              <p className="text-[28px] font-extrabold text-emerald-600 dark:text-emerald-400">
                {correctCount}
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Correct
              </p>
            </div>
            <div className="h-10 w-px bg-border/80" />
            <div>
              <p className="text-[28px] font-extrabold text-rose-600 dark:text-rose-400">
                {incorrectCount}
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Incorrect
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={handleReset}
              className="gap-2 rounded-xl text-[12.5px] font-medium shadow-xs"
            >
              <RotateCcw className="size-3.5" />
              Retake Quiz
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setViewMode("list");
                setIsFinished(false);
              }}
              className="gap-2 rounded-xl text-[12.5px]"
            >
              <ListOrdered className="size-3.5" />
              Review All Questions
            </Button>
          </div>
        </div>
      ) : (
        /* ALL QUESTIONS LIST VIEW (Fully Interactive) */
        <div className="space-y-6">
          {questions.map((question, qIdx) => {
            const isAnswered = userAnswers[qIdx] !== undefined;
            const chosenOption = userAnswers[qIdx];

            return (
              <div
                key={qIdx}
                className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm transition-all"
              >
                {/* Question Header */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-primary">
                    <HelpCircle className="size-3.5" />
                    Question {qIdx + 1}
                  </span>

                  {isAnswered && (
                    <span
                      className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        chosenOption === question.correctIndex
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {chosenOption === question.correctIndex ? (
                        <>
                          <CheckCircle2 className="size-3.5" />
                          Correct
                        </>
                      ) : (
                        <>
                          <XCircle className="size-3.5" />
                          Incorrect
                        </>
                      )}
                    </span>
                  )}
                </div>

                <p className="mt-3 text-[14.5px] font-semibold leading-relaxed text-foreground">
                  {question.question}
                </p>

                {/* Options List */}
                <div className="mt-4 space-y-2.5">
                  {question.options.map((option, optIdx) => {
                    const isSelected = chosenOption === optIdx;
                    const isCorrect = optIdx === question.correctIndex;

                    let optStyle =
                      "border-border/70 bg-card hover:border-primary/50 hover:bg-muted/40 text-foreground cursor-pointer";
                    let badgeStyle = "bg-muted text-muted-foreground border-border/80";

                    if (isAnswered) {
                      if (isSelected && isCorrect) {
                        optStyle =
                          "border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 font-medium";
                        badgeStyle = "bg-emerald-500 text-white border-transparent";
                      } else if (isSelected && !isCorrect) {
                        optStyle =
                          "border-rose-500 bg-rose-500/10 text-rose-800 dark:text-rose-200 font-medium";
                        badgeStyle = "bg-rose-500 text-white border-transparent";
                      } else if (isCorrect) {
                        optStyle =
                          "border-emerald-500/60 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300 font-medium";
                        badgeStyle =
                          "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30";
                      } else {
                        optStyle = "border-border/40 opacity-40 text-muted-foreground cursor-not-allowed";
                        badgeStyle = "bg-muted/50 text-muted-foreground/60 border-transparent";
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        disabled={isAnswered}
                        onClick={() => handleSelectOption(qIdx, optIdx)}
                        className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-left transition-all duration-150 ${optStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex size-6 shrink-0 items-center justify-center rounded-lg border text-[10.5px] font-bold ${badgeStyle}`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="text-[13px] leading-snug">{option}</span>
                        </div>

                        {isAnswered && (
                          <div className="shrink-0 pl-2">
                            {isSelected && isCorrect && (
                              <CheckCircle2 className="size-4 text-emerald-500" />
                            )}
                            {isSelected && !isCorrect && (
                              <XCircle className="size-4 text-rose-500" />
                            )}
                            {!isSelected && isCorrect && (
                              <Check className="size-3.5 text-emerald-500" />
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {isAnswered && (
                  <div
                    className={`mt-4 rounded-xl border p-3.5 text-[12.5px] leading-relaxed transition-all ${
                      chosenOption === question.correctIndex
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-rose-500/30 bg-rose-500/5"
                    }`}
                  >
                    <p className="font-semibold text-foreground/90">
                      {chosenOption === question.correctIndex
                        ? "✓ Well done!"
                        : "✗ Explanation:"}
                    </p>
                    <p className="mt-1 text-foreground/80">
                      {question.explanation ||
                        `The correct answer is ${question.options[question.correctIndex]}.`}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
