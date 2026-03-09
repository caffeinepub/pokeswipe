import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Layers, RefreshCw, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useBrowseFeed, useSwipeRight } from "../hooks/useQueries";
import { SwipeCard } from "./SwipeCard";

export function SwipeTab() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedPage, setFeedPage] = useState(0);

  const { data: cards = [], isLoading, refetch } = useBrowseFeed(feedPage * 10);
  const swipeRight = useSwipeRight();

  const currentCard = cards[currentIndex];
  const nextCard = cards[currentIndex + 1];
  const hasCards = currentIndex < cards.length;

  const advanceCard = useCallback(() => {
    if (currentIndex >= cards.length - 2 && cards.length === 10) {
      setFeedPage((p) => p + 1);
      setCurrentIndex(0);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, cards.length]);

  const handleSwipeLeft = useCallback(() => {
    advanceCard();
  }, [advanceCard]);

  const handleSwipeRight = useCallback(async () => {
    if (!currentCard) return;
    try {
      await swipeRight.mutateAsync(currentCard.id);
      toast.success("Added to your interests! ❤️", {
        duration: 1500,
        position: "top-center",
      });
    } catch {
      toast.error("Failed to save interest");
    }
    advanceCard();
  }, [currentCard, advanceCard, swipeRight]);

  const handleRefresh = () => {
    setCurrentIndex(0);
    setFeedPage(0);
    refetch();
  };

  if (isLoading) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center p-6 swipe-gradient"
        data-ocid="swipe.loading_state"
      >
        <div className="w-full max-w-sm">
          <Skeleton className="w-full aspect-[2/3] rounded-3xl bg-secondary" />
        </div>
      </div>
    );
  }

  if (!hasCards || cards.length === 0) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center p-6 swipe-gradient"
        data-ocid="swipe.empty_state"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-xs"
        >
          <div className="w-24 h-24 bg-secondary rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Layers className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="font-display text-2xl text-foreground mb-3">
            No More Cards!
          </h3>
          <p className="text-muted-foreground mb-8">
            You've seen all available cards. Check back soon for new listings!
          </p>
          <Button
            onClick={handleRefresh}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Feed
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col swipe-gradient overflow-hidden">
      {/* Card stack area */}
      <div className="flex-1 relative p-4 pb-0">
        <div className="relative w-full h-full max-w-sm mx-auto">
          {/* Background card (next) */}
          {nextCard && (
            <div
              className="absolute inset-0 rounded-3xl"
              style={{
                transform: "scale(0.95) translateY(12px)",
                zIndex: 1,
                opacity: 0.6,
                background: "oklch(0.16 0.03 265)",
                border: "1px solid oklch(0.28 0.05 265)",
              }}
            />
          )}

          {/* Current card */}
          <AnimatePresence mode="wait">
            {currentCard && (
              <SwipeCard
                key={currentCard.id.toString()}
                listing={currentCard}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                isTop={true}
                zIndex={10}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-8 p-6 pb-4">
        {/* Pass button */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={handleSwipeLeft}
          disabled={!hasCards || swipeRight.isPending}
          className="w-16 h-16 rounded-full bg-secondary border-2 border-pass flex items-center justify-center shadow-card transition-all disabled:opacity-50"
          style={{
            boxShadow: "0 0 20px oklch(0.58 0.24 27 / 0.3)",
          }}
          data-ocid="swipe.pass_button"
        >
          <X className="w-8 h-8 text-pass" />
        </motion.button>

        {/* Card counter */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            {currentIndex + 1} / {cards.length}
          </p>
        </div>

        {/* Like button */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={handleSwipeRight}
          disabled={!hasCards || swipeRight.isPending}
          className="w-16 h-16 rounded-full bg-secondary border-2 border-like flex items-center justify-center shadow-card transition-all disabled:opacity-50"
          style={{
            boxShadow: "0 0 20px oklch(0.72 0.22 145 / 0.3)",
          }}
          data-ocid="swipe.like_button"
        >
          {swipeRight.isPending ? (
            <span className="w-5 h-5 border-2 border-like/30 border-t-like rounded-full animate-spin" />
          ) : (
            <Heart className="w-7 h-7 text-like" />
          )}
        </motion.button>
      </div>
    </div>
  );
}
