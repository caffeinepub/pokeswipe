import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function LandingPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen hero-gradient flex flex-col overflow-hidden">
      {/* Decorative orbs */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, oklch(0.85 0.22 90 / 0.5) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-20 right-0 w-[300px] h-[300px] rounded-full opacity-10"
        style={{
          background:
            "radial-gradient(circle, oklch(0.65 0.2 190 / 0.6) 0%, transparent 70%)",
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-8">
        <div className="flex items-center gap-2">
          <img
            src="/assets/generated/pokeswipe-logo-transparent.dim_120x120.png"
            alt="PokeSwipe"
            className="w-10 h-10"
          />
          <span className="font-display text-xl text-primary">PokeSwipe</span>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-md"
        >
          {/* Logo animation */}
          <motion.div
            className="mx-auto mb-8 relative w-48 h-64"
            animate={{ y: [0, -10, 0] }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 4,
              ease: "easeInOut",
            }}
          >
            <img
              src="/assets/generated/landing-hero-card.dim_600x800.png"
              alt="Pokemon Card"
              className="w-full h-full object-cover rounded-2xl shadow-card"
              style={{
                boxShadow:
                  "0 20px 60px rgba(0,0,0,0.6), 0 0 40px oklch(0.85 0.22 90 / 0.3)",
              }}
            />
            {/* Floating badge */}
            <motion.div
              className="absolute -top-3 -right-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full"
              animate={{ rotate: [-5, 5, -5] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
            >
              ✨ NEW
            </motion.div>
          </motion.div>

          <motion.h1
            className="font-display text-4xl md:text-5xl text-foreground mb-4 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Trade Cards
            <br />
            <span className="text-primary">Like Never Before</span>
          </motion.h1>

          <motion.p
            className="text-muted-foreground text-lg mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
          >
            Swipe right to collect your dream cards. Sell your collection to
            fellow trainers worldwide.
          </motion.p>

          {/* Feature pills */}
          <motion.div
            className="flex flex-wrap justify-center gap-3 mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <div className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-full text-sm text-muted-foreground">
              <Heart className="w-3.5 h-3.5 text-like" />
              Swipe to Buy
            </div>
            <div className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-full text-sm text-muted-foreground">
              <ShoppingBag className="w-3.5 h-3.5 text-primary" />
              List to Sell
            </div>
            <div className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-full text-sm text-muted-foreground">
              <Zap className="w-3.5 h-3.5 text-accent" />
              Instant Match
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Button
              onClick={login}
              disabled={isLoggingIn}
              size="lg"
              className="w-full max-w-xs bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg py-6 rounded-2xl glow-primary transition-all duration-200 hover:scale-105"
              data-ocid="login.primary_button"
            >
              {isLoggingIn ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Connecting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Start Trading
                </span>
              )}
            </Button>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-muted-foreground text-sm space-y-1">
        <p>
          Created by{" "}
          <span className="text-foreground font-semibold tracking-wide">
            Kartik Deshwal
          </span>
        </p>
        <p>
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
