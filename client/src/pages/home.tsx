import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import Dashboard from "@/components/Dashboard";
import AnalyticsCharts from "@/components/AnalyticsCharts";
import AdBanner from "@/components/AdBanner";
import PremiumUpgrade from "@/components/PremiumUpgrade";

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const isPremium = (user as any)?.subscriptionStatus === 'active';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <HeroSection />
      
      {/* Show ads for free users only */}
      {!isPremium && <AdBanner />}
      
      <Dashboard />
      <AnalyticsCharts />
      
      {/* Show upgrade section for free users */}
      {!isPremium && <PremiumUpgrade />}
    </div>
  );
}
