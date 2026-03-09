import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Loader2, Package, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Condition } from "../backend";
import {
  useDeleteListing,
  useMarkAsSold,
  useMyListings,
} from "../hooks/useQueries";
import { AddCardSheet } from "./AddCardSheet";
import { BuyersPopover } from "./BuyersPopover";
import { CONDITION_COLORS, CONDITION_LABELS } from "./SwipeCard";

export function MyListingsTab() {
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<bigint | null>(null);

  const { data: listings = [], isLoading } = useMyListings();
  const deleteListing = useDeleteListing();
  const markAsSold = useMarkAsSold();

  const handleDelete = async () => {
    if (deleteTarget === null) return;
    try {
      await deleteListing.mutateAsync(deleteTarget);
      toast.success("Listing deleted");
    } catch {
      toast.error("Failed to delete listing");
    }
    setDeleteTarget(null);
  };

  const handleMarkSold = async (id: bigint) => {
    try {
      await markAsSold.mutateAsync(id);
      toast.success("Marked as sold! 🎉");
    } catch {
      toast.error("Failed to mark as sold");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-4 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-foreground">My Listings</h2>
          <Button
            onClick={() => setAddSheetOpen(true)}
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold"
            data-ocid="listings.add_button"
          >
            <Plus className="w-4 h-4 mr-1" />
            List Card
          </Button>
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
        ) : listings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-secondary rounded-3xl flex items-center justify-center mx-auto mb-5">
              <Package className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl text-foreground mb-2">
              No Listings Yet
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              Start selling your Pokemon cards to other trainers!
            </p>
            <Button
              onClick={() => setAddSheetOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-1" />
              List Your First Card
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <AnimatePresence>
              {listings.map((listing, idx) => {
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
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.05 }}
                    className="relative rounded-2xl overflow-hidden bg-card border border-border"
                    data-ocid={`listings.item.${ocidSuffix}`}
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
                          <Badge className="bg-like text-foreground border-none font-bold text-sm px-3 py-1">
                            SOLD
                          </Badge>
                        </div>
                      )}
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(to bottom, transparent 50%, oklch(0.16 0.03 265 / 0.9) 100%)",
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="p-2.5 space-y-1.5">
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

                      {/* Buyers */}
                      <BuyersPopover listingId={listing.id} />

                      {/* Actions */}
                      <div className="flex gap-1.5 pt-1">
                        {!listing.isSold && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-7 text-xs rounded-lg border-like text-like hover:bg-like/10"
                            onClick={() => handleMarkSold(listing.id)}
                            disabled={markAsSold.isPending}
                            data-ocid={`listings.sold_button.${ocidSuffix}`}
                          >
                            {markAsSold.isPending ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            )}
                            Sold
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0 rounded-lg border-destructive text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteTarget(listing.id)}
                          data-ocid={`listings.delete_button.${ocidSuffix}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add Card Sheet */}
      <AddCardSheet
        open={addSheetOpen}
        onClose={() => setAddSheetOpen(false)}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent
          className="bg-card border-border"
          data-ocid="listings.delete.dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-foreground">
              Delete Listing?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently remove this card from the marketplace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-border text-foreground"
              data-ocid="listings.delete.cancel_button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              data-ocid="listings.delete.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
