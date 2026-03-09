import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useRegisterUser } from "../hooks/useQueries";

export function UsernameSetup() {
  const [username, setUsername] = useState("");
  const registerUser = useRegisterUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) {
      toast.error("Please enter a username");
      return;
    }
    if (trimmed.length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }
    try {
      await registerUser.mutateAsync(trimmed);
      toast.success(`Welcome, ${trimmed}! You're ready to trade! 🎉`);
    } catch {
      toast.error("Failed to set username. Please try again.");
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex flex-col items-center justify-center px-6">
      {/* Decorative orb */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-15"
        style={{
          background:
            "radial-gradient(circle, oklch(0.85 0.22 90 / 0.5) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <motion.div
            className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-6 glow-primary"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <User className="w-10 h-10 text-primary-foreground" />
          </motion.div>
          <h1 className="font-display text-3xl text-foreground mb-2">
            Choose Your Name
          </h1>
          <p className="text-muted-foreground">
            Pick a trainer name that other collectors will see
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-foreground font-medium">
              Trainer Name
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="e.g. AshKetchum99"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={30}
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl text-base"
              data-ocid="username.input"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              3–30 characters. Will be shown on your listings.
            </p>
          </div>

          <Button
            type="submit"
            disabled={registerUser.isPending || !username.trim()}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base h-12 rounded-xl glow-primary transition-all"
            data-ocid="username.submit_button"
          >
            {registerUser.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Setting up...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Enter the Arena
              </span>
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
