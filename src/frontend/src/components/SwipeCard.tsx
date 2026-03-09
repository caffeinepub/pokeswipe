import { Badge } from "@/components/ui/badge";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useCallback, useRef } from "react";
import { Condition, type Listing } from "../backend";

interface SwipeCardProps {
  listing: Listing;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isTop: boolean;
  zIndex: number;
}

const CONDITION_LABELS: Record<Condition, string> = {
  [Condition.mint]: "Mint",
  [Condition.nearMint]: "Near Mint",
  [Condition.excellent]: "Excellent",
  [Condition.good]: "Good",
  [Condition.poor]: "Poor",
};

const CONDITION_COLORS: Record<Condition, string> = {
  [Condition.mint]: "bg-like/20 text-like border-like/30",
  [Condition.nearMint]: "bg-accent/20 text-accent border-accent/30",
  [Condition.excellent]: "bg-primary/20 text-primary border-primary/30",
  [Condition.good]: "bg-muted text-muted-foreground border-border",
  [Condition.poor]: "bg-pass/20 text-pass border-pass/30",
};

export function SwipeCard({
  listing,
  onSwipeLeft,
  onSwipeRight,
  isTop,
  zIndex,
}: SwipeCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, -20], [1, 0]);
  const constraintsRef = useRef(null);

  const handleDragEnd = useCallback(() => {
    const xVal = x.get();
    if (xVal > 100) {
      animate(x, 600, { duration: 0.3 });
      animate(y, -100, { duration: 0.3 });
      setTimeout(onSwipeRight, 300);
    } else if (xVal < -100) {
      animate(x, -600, { duration: 0.3 });
      animate(y, -100, { duration: 0.3 });
      setTimeout(onSwipeLeft, 300);
    } else {
      animate(x, 0, { type: "spring", stiffness: 300, damping: 25 });
      animate(y, 0, { type: "spring", stiffness: 300, damping: 25 });
    }
  }, [x, y, onSwipeLeft, onSwipeRight]);

  const priceDollars = (Number(listing.priceCents) / 100).toFixed(2);
  const imageUrl = listing.image.getDirectURL();

  return (
    <motion.div
      ref={constraintsRef}
      style={{ x, y, rotate, zIndex }}
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={1}
      onDragEnd={handleDragEnd}
      className="absolute inset-0 cursor-grab active:cursor-grabbing no-select"
      whileDrag={{ scale: 1.02 }}
      data-ocid={isTop ? "swipe.card.1" : undefined}
    >
      <div
        className="relative w-full h-full rounded-3xl overflow-hidden shadow-card"
        style={{
          background: "oklch(0.16 0.03 265)",
          border: "1px solid oklch(0.28 0.05 265)",
        }}
      >
        {/* Card image */}
        <div className="relative h-[65%] overflow-hidden">
          <img
            src={imageUrl}
            alt={listing.cardName}
            className="w-full h-full object-cover"
            draggable={false}
          />
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, transparent 50%, oklch(0.16 0.03 265) 100%)",
            }}
          />

          {/* Swipe indicators */}
          <motion.div
            className="absolute top-6 left-6 border-4 border-like rounded-xl px-4 py-2 rotate-[-15deg]"
            style={{ opacity: likeOpacity }}
          >
            <span className="font-display text-2xl text-like">WANT!</span>
          </motion.div>
          <motion.div
            className="absolute top-6 right-6 border-4 border-pass rounded-xl px-4 py-2 rotate-[15deg]"
            style={{ opacity: passOpacity }}
          >
            <span className="font-display text-2xl text-pass">PASS</span>
          </motion.div>

          {/* Seller info */}
          <div className="absolute top-4 right-4">
            <div className="bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-muted-foreground">
              @{listing.sellerUsername}
            </div>
          </div>
        </div>

        {/* Card info */}
        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="font-display text-xl text-foreground leading-tight">
                {listing.cardName}
              </h2>
              <p className="text-muted-foreground text-sm mt-0.5">
                {listing.cardSet}
              </p>
            </div>
            <div className="text-right">
              <div className="font-display text-2xl text-primary">
                ${priceDollars}
              </div>
            </div>
          </div>

          <Badge
            className={`text-xs font-medium border ${CONDITION_COLORS[listing.condition]}`}
            variant="outline"
          >
            {CONDITION_LABELS[listing.condition]}
          </Badge>
        </div>
      </div>
    </motion.div>
  );
}

export { CONDITION_LABELS, CONDITION_COLORS };
