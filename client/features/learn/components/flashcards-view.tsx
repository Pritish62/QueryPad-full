"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Keyboard,
  Layers,
  LayoutGrid,
  Lightbulb,
  Repeat,
  RotateCcw,
  RotateCw,
  Shuffle,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Flashcard, FlashcardsContent } from "../lib/types";

type FlashcardsViewProps = {
  content: FlashcardsContent;
};

export function FlashcardsView({ content }: FlashcardsViewProps) {
  const initialCards = content.cards || [];
  const [cards, setCards] = useState<Flashcard[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewMode, setViewMode] = useState<"deck" | "grid">("deck");
  const [throwDirection, setThrowDirection] = useState<"next" | "prev" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Sync if initial content changes
  useEffect(() => {
    setCards(content.cards || []);
    setCurrentIndex(0);
    setIsFlipped(false);
    setThrowDirection(null);
  }, [content]);

  const totalCards = cards.length;
  const isDeckComplete = currentIndex >= totalCards;
  const currentCard = !isDeckComplete ? cards[currentIndex] : null;

  // Handle 3D Flip
  const handleFlip = useCallback(() => {
    if (isAnimating || isDeckComplete) return;
    setIsFlipped((prev) => !prev);
  }, [isAnimating, isDeckComplete]);

  // Handle Next with 3D Throw Animation
  const handleNext = useCallback(() => {
    if (isAnimating || isDeckComplete) return;
    setIsAnimating(true);
    setThrowDirection("next");

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      setThrowDirection(null);
      setIsAnimating(false);
    }, 380);
  }, [isAnimating, isDeckComplete]);

  // Handle Prev with Swoop In/Throw Animation
  const handlePrev = useCallback(() => {
    if (isAnimating || currentIndex <= 0) return;
    setIsAnimating(true);
    setThrowDirection("prev");

    setTimeout(() => {
      setCurrentIndex((prev) => Math.max(0, prev - 1));
      setIsFlipped(false);
      setThrowDirection(null);
      setIsAnimating(false);
    }, 320);
  }, [isAnimating, currentIndex]);

  // Restart Deck
  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setThrowDirection(null);
    setIsAnimating(false);
  };

  // Shuffle Deck
  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setThrowDirection(null);
  };

  // Keyboard navigation
  useEffect(() => {
    if (viewMode !== "deck") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture if user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        handleFlip();
      } else if (e.code === "ArrowRight" || e.code === "Enter") {
        e.preventDefault();
        handleNext();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key.toLowerCase() === "r") {
        handleRestart();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode, handleFlip, handleNext, handlePrev]);

  if (!cards || cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/40 p-12 text-center">
        <Sparkles className="size-8 text-muted-foreground/50" />
        <p className="mt-3 text-[14px] font-medium text-foreground">No flashcards found</p>
        <p className="mt-1 text-[12px] text-muted-foreground">
          This artifact does not contain any cards yet.
        </p>
      </div>
    );
  }

  const progressPercent = totalCards > 0
    ? Math.min(100, Math.round(((Math.min(currentIndex + 1, totalCards)) / totalCards) * 100))
    : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Deck Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card/80 p-3.5 backdrop-blur-md shadow-xs">
        {/* Progress & Card Counter */}
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Layers className="size-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-foreground">
                {isDeckComplete
                  ? "Deck Completed"
                  : `Card ${currentIndex + 1} of ${totalCards}`}
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10.5px] font-medium text-muted-foreground">
                {progressPercent}%
              </span>
            </div>
            {/* Progress Bar */}
            <div className="mt-1.5 h-1.5 w-32 sm:w-44 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShuffle}
            title="Shuffle Deck"
            className="h-8 gap-1.5 rounded-lg px-2.5 text-[11.5px] text-muted-foreground hover:text-foreground"
          >
            <Shuffle className="size-3.5" />
            <span className="hidden sm:inline">Shuffle</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRestart}
            title="Restart from beginning"
            className="h-8 gap-1.5 rounded-lg px-2.5 text-[11.5px] text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3.5" />
            <span className="hidden sm:inline">Restart</span>
          </Button>

          {/* Mode Switcher */}
          <div className="ml-1 flex items-center rounded-lg border border-border/70 bg-muted/40 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("deck")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11.5px] font-medium transition-all ${
                viewMode === "deck"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="size-3.5" />
              <span>Deck</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11.5px] font-medium transition-all ${
                viewMode === "grid"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="size-3.5" />
              <span>Grid ({totalCards})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main View Mode: 3D Deck or Grid */}
      {viewMode === "deck" ? (
        <div className="flex flex-col items-center gap-6 py-2">
          {/* 3D Card Stage Area */}
          <div
            className="relative flex h-[360px] sm:h-[400px] w-full max-w-[580px] items-center justify-center select-none"
            style={{ perspective: "1200px" }}
          >
            {isDeckComplete ? (
              /* Completed State Card */
              <div className="flex h-full w-full flex-col items-center justify-center rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-card via-card to-emerald-500/5 p-8 text-center shadow-xl">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 shadow-inner">
                  <Trophy className="size-8" />
                </div>
                <h3 className="mt-4 text-[20px] font-semibold text-foreground">
                  Deck Completed! 🎉
                </h3>
                <p className="mt-1 text-[13px] text-muted-foreground max-w-xs">
                  You've reviewed all {totalCards} flashcards in this study set. Great job!
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Button
                    onClick={handleRestart}
                    className="gap-2 rounded-xl text-[12.5px] shadow-sm"
                  >
                    <RotateCcw className="size-3.5" />
                    Review Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleShuffle}
                    className="gap-2 rounded-xl text-[12.5px]"
                  >
                    <Shuffle className="size-3.5" />
                    Shuffle & Practice
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Physical 3D Stack Layer 2 (Bottom-most ghost card) */}
                {currentIndex + 2 < totalCards && (
                  <div
                    className="absolute inset-0 rounded-3xl border border-border/40 bg-card/40 shadow-xs pointer-events-none transition-all duration-300"
                    style={{
                      transform: "translate3d(0, 18px, -40px) scale(0.91)",
                      opacity: 0.35,
                      zIndex: 1,
                    }}
                  />
                )}

                {/* Physical 3D Stack Layer 1 (Ghost card directly beneath active) */}
                {currentIndex + 1 < totalCards && (
                  <div
                    className="absolute inset-0 rounded-3xl border border-border/60 bg-card/70 shadow-md pointer-events-none transition-all duration-300"
                    style={{
                      transform: "translate3d(0, 10px, -20px) scale(0.955)",
                      opacity: 0.65,
                      zIndex: 2,
                    }}
                  />
                )}

                {/* Active 3D Throw & Flip Card Container */}
                <div
                  ref={cardRef}
                  onClick={handleFlip}
                  className="group absolute inset-0 cursor-pointer rounded-3xl focus:outline-none"
                  style={{
                    zIndex: 10,
                    transform:
                      throwDirection === "next"
                        ? "translate3d(130%, -24px, 0) rotate(22deg) scale(0.92)"
                        : throwDirection === "prev"
                        ? "translate3d(-130%, -24px, 0) rotate(-22deg) scale(0.92)"
                        : "translate3d(0, 0, 0) rotate(0deg) scale(1)",
                    opacity: throwDirection ? 0 : 1,
                    transition: throwDirection
                      ? "transform 0.38s cubic-bezier(0.2, 0.9, 0.3, 1.2), opacity 0.32s ease-out"
                      : "transform 0.28s cubic-bezier(0.34, 1.3, 0.64, 1), opacity 0.2s ease",
                  }}
                  title="Click to flip card"
                >
                  {/* 3D Flip Inner Wrapper */}
                  <div
                    className="relative h-full w-full rounded-3xl shadow-xl transition-transform duration-600 ease-out"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    }}
                  >
                    {/* Front Face (Question) */}
                    <div
                      className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-muted/20 p-6 sm:p-8 backdrop-blur-xl shadow-lg transition-all group-hover:border-primary/50 group-hover:shadow-primary/5"
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: "rotateY(0deg)",
                      }}
                    >
                      {/* Top Bar of Front Side */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20">
                            <HelpCircle className="size-4" />
                          </span>
                          <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
                            Question
                          </span>
                        </div>
                        <span className="rounded-full bg-muted/80 px-2.5 py-0.5 text-[10.5px] font-semibold text-muted-foreground">
                          #{String(currentIndex + 1).padStart(2, "0")}
                        </span>
                      </div>

                      {/* Question Content */}
                      <div className="my-auto py-4 overflow-y-auto max-h-[220px] scrollbar-thin">
                        <p className="text-[15px] sm:text-[17px] font-medium leading-relaxed text-foreground tracking-normal whitespace-pre-wrap select-text">
                          {currentCard?.front}
                        </p>
                      </div>

                      {/* Bottom Hint */}
                      <div className="flex items-center justify-between border-t border-border/40 pt-4 text-[11px] text-muted-foreground/75">
                        <div className="flex items-center gap-1.5 transition-colors group-hover:text-primary">
                          <Repeat className="size-3.5 transition-transform duration-300 group-hover:rotate-180" />
                          <span>Tap card to flip</span>
                        </div>
                        <span className="rounded-md bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground/60">
                          Space
                        </span>
                      </div>
                    </div>

                    {/* Back Face (Answer) */}
                    <div
                      className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-card via-card to-emerald-500/5 p-6 sm:p-8 backdrop-blur-xl shadow-lg transition-all group-hover:border-emerald-500/60 group-hover:shadow-emerald-500/5"
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                    >
                      {/* Top Bar of Back Side */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20">
                            <CheckCircle2 className="size-4" />
                          </span>
                          <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
                            Answer
                          </span>
                        </div>
                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400">
                          #{String(currentIndex + 1).padStart(2, "0")}
                        </span>
                      </div>

                      {/* Answer Content */}
                      <div className="my-auto py-4 overflow-y-auto max-h-[220px] scrollbar-thin">
                        <p className="text-[14.5px] sm:text-[16px] leading-relaxed text-foreground/90 whitespace-pre-wrap select-text">
                          {currentCard?.back}
                        </p>
                      </div>

                      {/* Bottom Hint */}
                      <div className="flex items-center justify-between border-t border-border/40 pt-4 text-[11px] text-muted-foreground/75">
                        <div className="flex items-center gap-1.5 transition-colors group-hover:text-emerald-500">
                          <Repeat className="size-3.5 transition-transform duration-300 group-hover:rotate-180" />
                          <span>Tap to flip back</span>
                        </div>
                        <span className="rounded-md bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground/60">
                          Space
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Bottom Deck Controls */}
          {!isDeckComplete && (
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-3">
                {/* Previous Button */}
                <Button
                  variant="outline"
                  size="default"
                  disabled={currentIndex <= 0 || isAnimating}
                  onClick={handlePrev}
                  className="h-10 gap-1.5 rounded-xl px-4 text-[12.5px] transition-all hover:bg-muted"
                >
                  <ChevronLeft className="size-4" />
                  <span>Previous</span>
                </Button>

                {/* Flip Card Action Button */}
                <Button
                  variant="secondary"
                  size="default"
                  disabled={isAnimating}
                  onClick={handleFlip}
                  className="h-10 gap-2 rounded-xl px-5 text-[12.5px] font-medium shadow-xs"
                >
                  <Repeat className="size-3.5" />
                  <span>{isFlipped ? "Show Question" : "Show Answer"}</span>
                </Button>

                {/* Next Button (Triggers Throw Animation) */}
                <Button
                  variant="default"
                  size="default"
                  disabled={isAnimating}
                  onClick={handleNext}
                  className="h-10 gap-1.5 rounded-xl px-4 text-[12.5px] font-semibold shadow-sm transition-all hover:translate-x-0.5"
                >
                  <span>{currentIndex + 1 === totalCards ? "Finish Deck" : "Next Card"}</span>
                  <ChevronRight className="size-4" />
                </Button>
              </div>

              {/* Keyboard Shortcuts Hint */}
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70">
                <Keyboard className="size-3" />
                <span>
                  Shortcuts: <kbd className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">Space</kbd> Flip &middot; <kbd className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">&larr;</kbd> Prev &middot; <kbd className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">&rarr;</kbd> Next
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Grid View Mode: Browse all flashcards with 3D Flip on each */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, idx) => (
            <GridFlashcardItem key={idx} card={card} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Individual 3D Card for Grid View */
function GridFlashcardItem({ card, index }: { card: Flashcard; index: number }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      onClick={() => setFlipped((prev) => !prev)}
      className="group relative h-56 cursor-pointer select-none rounded-2xl"
      style={{ perspective: "1000px" }}
      title="Click to flip"
    >
      <div
        className="relative h-full w-full rounded-2xl shadow-xs transition-transform duration-500 ease-out"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front Face */}
        <div
          className="absolute inset-0 flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-4 transition-all group-hover:border-primary/40 group-hover:shadow-sm"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(0deg)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-indigo-500">
              <HelpCircle className="size-3" />
              Question
            </span>
            <span className="text-[10px] font-medium text-muted-foreground/60">
              #{String(index + 1).padStart(2, "0")}
            </span>
          </div>

          <p className="my-auto overflow-y-auto max-h-28 text-[13px] font-medium leading-relaxed text-foreground/90 whitespace-pre-wrap select-text">
            {card.front}
          </p>

          <div className="flex items-center justify-between border-t border-border/40 pt-2 text-[10px] text-muted-foreground/60">
            <span>Tap to reveal answer</span>
            <Repeat className="size-3 transition-transform group-hover:rotate-180" />
          </div>
        </div>

        {/* Back Face */}
        <div
          className="absolute inset-0 flex flex-col justify-between rounded-2xl border border-emerald-500/40 bg-card p-4 transition-all group-hover:border-emerald-500/60 group-hover:shadow-sm"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-emerald-500">
              <CheckCircle2 className="size-3" />
              Answer
            </span>
            <span className="text-[10px] font-medium text-emerald-600/70">
              #{String(index + 1).padStart(2, "0")}
            </span>
          </div>

          <p className="my-auto overflow-y-auto max-h-28 text-[12.5px] leading-relaxed text-foreground/85 whitespace-pre-wrap select-text">
            {card.back}
          </p>

          <div className="flex items-center justify-between border-t border-border/40 pt-2 text-[10px] text-muted-foreground/60">
            <span>Tap to flip back</span>
            <Repeat className="size-3 transition-transform group-hover:rotate-180" />
          </div>
        </div>
      </div>
    </div>
  );
}
