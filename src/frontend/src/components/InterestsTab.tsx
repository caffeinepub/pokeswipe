import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart } from "lucide-react";
import { motion } from "motion/react";
import { useAllListings, useMyInterests } from "../hooks/useQueries";
import { CONDITION_COLORS, CONDITION_LABELS } from "./SwipeCard";

export function InterestsTab() {
  const { data: interestIds = [], isLoading: interestsLoading } =
    useMyInterests();
  const { data: allListings = [], isLoading: listingsLoading } =
    useAllListings();

  const isLoading = interestsLoading || listingsLoading;

  const interestedListings = allListings.filter((l) =>
    interestIds.some((id) => id === l.id),
  );

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-like" />
          <h2 className="font-display text-xl text-foreground">My Interests</h2>
          {!isLoading && (
            <span className="ml-auto text-sm text-muted-foreground">
              {interestedListings.length} cards
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                className="aspect-[2/3] rounded-2xl bg-secondary"
              />
            ))}
          </div>
        ) : interestedListings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
            data-ocid="interests.empty_state"
          >
            <div className="w-20 h-20 bg-secondary rounded-3xl flex items-center justify-center mx-auto mb-5">
              <Heart className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl text-foreground mb-2">
              No Interests Yet
            </h3>
            <p className="text-muted-foreground text-sm">
              Swipe right on cards you want to see them here!
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {interestedListings.map((listing, idx) => {
              const priceDollars = (Number(listing.priceCents) / 100).toFixed(
                2,
              );
              const imageUrl = listing.image.getDirectURL();
              const ocidSuffix = idx + 1;

              return (
                <motion.div
                  key={listing.id.toString()}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-2xl overflow-hidden bg-card border border-border"
                  data-ocid={`interests.item.${ocidSuffix}`}
                >
                  {/* Image */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={listing.cardName}
                      className="w-full h-full object-cover"
                    />
                    {listing.isSold && (
                      <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                        <Badge className="bg-muted text-muted-foreground border-none font-bold text-sm px-3">
                          SOLD
                        </Badge>
                      </div>
                    )}
                    {/* Heart icon overlay */}
                    <div className="absolute top-2 right-2 w-6 h-6 bg-like rounded-full flex items-center justify-center">
                      <Heart className="w-3.5 h-3.5 text-background fill-background" />
                    </div>
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to bottom, transparent 50%, oklch(0.16 0.03 265 / 0.9) 100%)",
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="p-2.5 space-y-1">
                    <p className="font-display text-sm text-foreground leading-tight truncate">
                      {listing.cardName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {listing.cardSet}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary text-sm">
                        ${priceDollars}
                      </span>
                      <Badge
                        className={`text-xs border ${CONDITION_COLORS[listing.condition]} py-0 px-1.5`}
                        variant="outline"
                      >
                        {CONDITION_LABELS[listing.condition]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      @{listing.sellerUsername}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
