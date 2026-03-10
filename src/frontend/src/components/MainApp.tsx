import { Button } from "@/components/ui/button";
import { Heart, Layers, LogOut, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useUserProfile } from "../hooks/useQueries";
import { InterestsTab } from "./InterestsTab";
import { MyListingsTab } from "./MyListingsTab";
import { SwipeTab } from "./SwipeTab";

type Tab = "swipe" | "listings" | "interests";

export function MainApp() {
  const [activeTab, setActiveTab] = useState<Tab>("swipe");
  const { clear } = useInternetIdentity();
  const { data: profile } = useUserProfile();

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: "swipe",
      label: "Discover",
      icon: <Layers className="w-5 h-5" />,
    },
    {
      id: "listings",
      label: "My Cards",
      icon: <ShoppingBag className="w-5 h-5" />,
    },
    {
      id: "interests",
      label: "Interests",
      icon: <Heart className="w-5 h-5" />,
    },
  ];

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          <img
            src="/assets/generated/pokeswipe-logo-transparent.dim_120x120.png"
            alt="PokeSwipe"
            className="w-8 h-8"
          />
          <span className="font-display text-lg text-primary">PokeSwipe</span>
        </div>

        <div className="flex items-center gap-2">
          {profile && (
            <span className="text-sm text-muted-foreground hidden sm:block">
              @{profile.username}
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground w-8 h-8"
            onClick={clear}
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {activeTab === "swipe" && <SwipeTab />}
        {activeTab === "listings" && <MyListingsTab />}
        {activeTab === "interests" && <InterestsTab />}
      </main>

      {/* Bottom tab bar */}
      <nav className="shrink-0 border-t border-border bg-background/95 backdrop-blur-sm">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors relative ${
                activeTab === tab.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-ocid={
                tab.id === "swipe"
                  ? "nav.swipe_tab"
                  : tab.id === "listings"
                    ? "nav.listings_tab"
                    : "nav.interests_tab"
              }
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                />
              )}
              {tab.icon}
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
        {/* Creator credit */}
        <p className="text-center text-[10px] text-muted-foreground/50 pb-1.5 tracking-wide">
          Made by{" "}
          <span className="text-muted-foreground/75 font-medium">
            Kartik Deshwal
          </span>
        </p>
      </nav>
    </div>
  );
}
