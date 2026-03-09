import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Loader2, Users } from "lucide-react";
import { useInterestedBuyers } from "../hooks/useQueries";

interface BuyersPopoverProps {
  listingId: bigint;
}

export function BuyersPopover({ listingId }: BuyersPopoverProps) {
  const { data: buyers = [], isLoading } = useInterestedBuyers(listingId);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground text-xs h-7 px-2 rounded-lg"
          data-ocid="listings.buyers.button"
        >
          <Users className="w-3.5 h-3.5 mr-1" />
          {isLoading ? "..." : `${buyers.length} interested`}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 bg-popover border-border p-3"
        data-ocid="listings.buyers.popover"
      >
        <h4 className="font-medium text-sm text-foreground mb-2">
          Interested Buyers
        </h4>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading...
          </div>
        ) : buyers.length === 0 ? (
          <p className="text-muted-foreground text-sm py-2">
            No interested buyers yet
          </p>
        ) : (
          <ul className="space-y-1">
            {buyers.map(([principal, username]) => (
              <li
                key={principal.toString()}
                className="text-sm text-foreground py-1 px-2 rounded-lg bg-secondary"
              >
                @{username}
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
