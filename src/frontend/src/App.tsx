import { Toaster } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";
import { LandingPage } from "./components/LandingPage";
import { MainApp } from "./components/MainApp";
import { UsernameSetup } from "./components/UsernameSetup";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useIsRegistered } from "./hooks/useQueries";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const isLoggedIn = !!identity;

  const { data: isRegistered, isLoading: registrationLoading } =
    useIsRegistered();

  // While auth is initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/assets/generated/pokeswipe-logo-transparent.dim_120x120.png"
            alt="PokeSwipe"
            className="w-16 h-16 animate-pulse"
          />
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  // Not logged in
  if (!isLoggedIn) {
    return (
      <>
        <LandingPage />
        <Toaster />
      </>
    );
  }

  // Checking registration
  if (registrationLoading) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/assets/generated/pokeswipe-logo-transparent.dim_120x120.png"
            alt="PokeSwipe"
            className="w-16 h-16 animate-pulse"
          />
          <p className="text-muted-foreground text-sm">
            Loading trainer data...
          </p>
        </div>
      </div>
    );
  }

  // Logged in but not registered
  if (!isRegistered) {
    return (
      <>
        <UsernameSetup />
        <Toaster />
      </>
    );
  }

  // Fully authenticated and registered
  return (
    <>
      <MainApp />
      <Toaster richColors position="top-center" />
    </>
  );
}
