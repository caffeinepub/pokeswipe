import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ImageIcon, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Condition, ExternalBlob } from "../backend";
import { useCreateListing } from "../hooks/useQueries";

interface AddCardSheetProps {
  open: boolean;
  onClose: () => void;
}

export function AddCardSheet({ open, onClose }: AddCardSheetProps) {
  const [cardName, setCardName] = useState("");
  const [cardSet, setCardSet] = useState("");
  const [condition, setCondition] = useState<Condition | "">("");
  const [priceStr, setPriceStr] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createListing = useCreateListing();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName.trim()) return toast.error("Card name is required");
    if (!cardSet.trim()) return toast.error("Card set is required");
    if (!condition) return toast.error("Condition is required");
    if (
      !priceStr ||
      Number.isNaN(Number.parseFloat(priceStr)) ||
      Number.parseFloat(priceStr) <= 0
    )
      return toast.error("Please enter a valid price");
    if (!imageFile) return toast.error("Please upload a card image");

    try {
      const arrayBuffer = await imageFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let blob = ExternalBlob.fromBytes(uint8Array);
      blob = blob.withUploadProgress((pct) => setUploadProgress(pct));

      const priceCents = BigInt(Math.round(Number.parseFloat(priceStr) * 100));

      await createListing.mutateAsync({
        cardName: cardName.trim(),
        cardSet: cardSet.trim(),
        condition: condition as Condition,
        priceCents,
        image: blob,
      });

      toast.success("Card listed successfully! 🎴");
      setCardName("");
      setCardSet("");
      setCondition("");
      setPriceStr("");
      setImageFile(null);
      setImagePreview(null);
      setUploadProgress(0);
      onClose();
    } catch {
      toast.error("Failed to create listing. Please try again.");
      setUploadProgress(0);
    }
  };

  const isSubmitting = createListing.isPending;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl bg-card border-border max-h-[90vh] overflow-y-auto"
      >
        <SheetHeader className="mb-6">
          <SheetTitle className="font-display text-2xl text-foreground">
            List a Card
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Upload your Pokemon card details to start selling
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pb-8">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-foreground font-medium">Card Image</Label>
            {/* Wrapper keeps aspect ratio, button fills it */}
            <div
              className="relative w-full max-w-[200px] mx-auto"
              style={{ paddingBottom: "133.33%" }}
            >
              <button
                type="button"
                className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-dashed border-border bg-secondary cursor-pointer hover:border-primary transition-colors w-full"
                onClick={triggerFileInput}
                data-ocid="add_card.image_upload"
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <ImageIcon className="w-10 h-10" />
                    <span className="text-sm font-medium">Tap to upload</span>
                    <span className="text-xs">JPG, PNG, WEBP</span>
                  </div>
                )}
                {isSubmitting && uploadProgress > 0 && (
                  <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-2">
                    <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <span className="text-sm text-primary font-bold">
                      {uploadProgress}%
                    </span>
                  </div>
                )}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* Card Name */}
          <div className="space-y-2">
            <Label htmlFor="card-name" className="text-foreground font-medium">
              Card Name
            </Label>
            <Input
              id="card-name"
              placeholder="e.g. Charizard"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11 rounded-xl"
              data-ocid="add_card.name_input"
            />
          </div>

          {/* Card Set */}
          <div className="space-y-2">
            <Label htmlFor="card-set" className="text-foreground font-medium">
              Card Set
            </Label>
            <Input
              id="card-set"
              placeholder="e.g. Base Set, Jungle, Fossil"
              value={cardSet}
              onChange={(e) => setCardSet(e.target.value)}
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11 rounded-xl"
              data-ocid="add_card.set_input"
            />
          </div>

          {/* Condition */}
          <div className="space-y-2">
            <Label className="text-foreground font-medium">Condition</Label>
            <Select
              value={condition}
              onValueChange={(v) => setCondition(v as Condition)}
            >
              <SelectTrigger
                className="bg-secondary border-border text-foreground h-11 rounded-xl"
                data-ocid="add_card.condition_select"
              >
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value={Condition.mint}>Mint (PSA 10)</SelectItem>
                <SelectItem value={Condition.nearMint}>
                  Near Mint (PSA 9)
                </SelectItem>
                <SelectItem value={Condition.excellent}>
                  Excellent (PSA 7-8)
                </SelectItem>
                <SelectItem value={Condition.good}>Good (PSA 5-6)</SelectItem>
                <SelectItem value={Condition.poor}>Poor (PSA 1-4)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price" className="text-foreground font-medium">
              Price (USD)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                $
              </span>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={priceStr}
                onChange={(e) => setPriceStr(e.target.value)}
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11 rounded-xl pl-7"
                data-ocid="add_card.price_input"
              />
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-12 rounded-xl glow-primary"
            data-ocid="add_card.submit_button"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Listing Card...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                List Card for Sale
              </span>
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
